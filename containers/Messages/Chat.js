import dynamic from "next/dynamic";
import React, { useEffect, useReducer, useRef } from "react";
import swal from "sweetalert";
import axios from "../../axios-orders";
import Link from "../../components/Link/index";
import Timeago from "../Common/Timeago";
import Loader from "../LoadMore/Index";
const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});
const OpenAI = dynamic(() => import("../../containers/OpenAI"), {
    ssr: false,
  });

const Chat = (props) => {
  const textareaInput = useRef(null);
  const inputFile = useRef(null);
  const scrollDiv = useRef(null);
  const emojiContainer = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      showEmoji: false,
      textValue: "",
      chats: [],
      pagging: false,
      page: 1,
      id: props.pageData.id,
      loading: true,
      message: props.message,
      selectedFile: null,
      submitting: false,
      minimize: props.minimize,
      chatIndex: props.chatIndex,
    }
  );
  const stateRef = useRef();
  stateRef.current = state;

  useEffect(() => {
    loadNewChat();
  }, [state.id]);

  useEffect(() => {
    if (props.id != state.id) {
      setState({
        showEmoji: false,
        textValue: "",
        chats: [],
        pagging: false,
        page: 1,
        id: props.id,
        loading: true,
        message: props.message,
        selectedFile: null,
        submitting: false,
        minimize: props.minimize,
        chatIndex: props.chatIndex,
      });
    } else if (props.minimize != state.minimize) {
      setState({
        minimize: props.minimize,
      });
    } else if (props.chatIndex != state.chatIndex) {
      setState({
        chatIndex: props.chatIndex,
      });
    }
  }, [props]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    props.socket.on("chatMessageDelete", (data) => {
      let id = data.id;
      if (parseInt(data.message_id) == parseInt(stateRef.current.id)) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const chats = [...stateRef.current.chats];
          chats.splice(itemIndex, 1);
          if (props.newChat) {
            props.newChat(chats, stateRef.current.id);
          }
          setState({ chats: chats });
        }
      } else {
        if (props.newChat) {
          props.newChat("delete", stateRef.current.id, id);
        }
      }
    });
    props.socket.on("chatMessageCreate", (data) => {
      let chat = data.chat;

      if (parseInt(chat.message_id) == parseInt(stateRef.current.id)) {
        props.socket.emit("readChat", {
          id: props.pageData.loggedInUserDetails.user_id,
          message_id: stateRef.current.id,
        });
        if (
          parseInt(chat.chat_user_id) !=
          parseInt(props.pageData.loggedInUserDetails.user_id)
        ) {
          chat.is_read = 1;
          chat.seen = 1;
        }
        let chats = [...stateRef.current.chats];
        chats.push(chat);
        setState({ chats: chats });
        setTimeout(() => {
          setTimeout(() => {
            if (scrollDiv.current)
              scrollDiv.current.scrollTop = scrollDiv.current.scrollHeight;
          }, 500);
        }, 200);
        if (props.newChat) {
          props.newChat(chats, chat.message_id);
        }
      } else {
        if (props.newChat) {
          props.newChat("create", chat.message_id, chat);
        }
      }
    });
    return () =>
      document.removeEventListener("click", handleClickOutside, false);
  }, []);

  const handleClickOutside = (e) => {
    if (emojiContainer && !emojiContainer.current.contains(e.target)) {
      // the click happened in the component
      // code to handle the submit button
      // submit();
      setState({ showEmoji: false });
    }
  };

  const getItemIndex = (item_id) => {
    const chats = [...stateRef.current.chats];
    const itemIndex = chats.findIndex((p) => p["messages_text_id"] == item_id);
    return itemIndex;
  };
  const loadNewChat = () => {
    loadMoreData("new");
  };
  const onEmojiClick = (data) => {
    const { selectionStart, selectionEnd } = textareaInput.current;
    let value = state.textValue ? state.textValue : "";
    // replace selected text with clicked emoji
    const newVal =
      value.slice(0, selectionStart) + data.emoji + value.slice(selectionEnd);
    setState({ textValue: newVal });
    setTimeout(() => {
      textareaInput.current.focus();
      textareaInput.current.selectionEnd =
        textareaInput.current.selectionStart = selectionEnd + 2;
    }, 200);
  };

  const loadMoreData = (type) => {
    if (state.loading && !type) {
      return;
    }
    if (type == "new") {
      props.socket.emit("readChat", {
        id: props.pageData.loggedInUserDetails.user_id,
        message_id: state.id,
      });
    }
    if (!type) setState({ loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    if (state.chats.length > 0) {
      formData.append("min_id", state.chats[0].messages_text_id);
    }
    let url = `/messages/${state.id}`;

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.chats) {
          let firstLoad = [...state.chats];
          let pagging = response.data.pagging;
          let chats = [...response.data.chats, ...state.chats];
          if (props.newChat) {
            props.newChat(chats, state.id);
          }
          setState({
            page: state.page + 1,
            pagging: pagging,
            chats: chats,
            loading: false,
          });
          setTimeout(() => {
            let _ = this;
            if (firstLoad.length == 0)
              setTimeout(() => {
                if (scrollDiv.current)
                  scrollDiv.current.scrollTop = scrollDiv.current.scrollHeight;
              }, 500);
          }, 200);
        } else {
          setState({ loading: false });
        }
      })
      .catch(() => {
        setState({ loading: false });
      });
  };
  const onMainScroll = () => {
    if (scrollDiv.current) {
      const { scrollTop } = scrollDiv.current;
      if (scrollTop < 100) {
        if (state.pagging) {
          loadMoreData();
        }
      }
    }
  };
  const openImage = (url, e) => {
    e.preventDefault();
    if (typeof lightboxJquery == "undefined") {
      return;
    }
    let isS3 = true;
    if (url) {
      const splitVal = url.split("/");
      if (splitVal[0] == "http:" || splitVal[0] == "https:") {
        isS3 = false;
      }
    }
    let items = [];
    items.push({
      src: (isS3 ? props.pageData.imageSuffix : "") + url,
      title: "",
      description: "",
      type: "image",
    });
    lightboxJquery.magnificPopup.open(
      {
        items: items,
        gallery: {
          enabled: true,
        },
      },
      0
    );
  };
  const deleteMessage = (id) => {
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    formData.append("id", id);

    let url = `/message/delete`;

    axios.post(url, formData, config).then((response) => {
      if (response) {
      }
    });
  };
  const selectedFile = (e) => {

    if(typeof e == "string") {
        setState({ selectedFile: e, selectedFileType: "image" });
        return;
    }

    var url = e.target.value;
    var file = e.target.files[0];
    var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    inputFile.current.value = "";
    let type = "";
    if (
      file &&
      (ext == "png" ||
        ext == "jpeg" ||
        ext == "jpg" ||
        ext == "webp" ||
        ext == "PNG" ||
        ext == "JPEG" ||
        ext == "JPG")
    ) {
      type = "image";
    } 
    // else if (file && ext == "mp4") {
    //   type = "video";
    // } 
    else {
      return;
    }
    setState({ selectedFile: file, selectedFileType: type });
  };
  const enterHit = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      submitForm();
      return false;
    } else {
      return true;
    }
  };
  const submitForm = () => {
    if (state.selectedFile || state.textValue) {
      setState({ submitting: true });
      let formData = new FormData();
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      formData.append("message", state.textValue);
      formData.append("message_id", state.id);
      if (state.selectedFileType == "image") {
        formData.append("upload", state.selectedFile);
      }else if (state.selectedFileType == "video"){
        formData.append("video_upload", state.selectedFile);
      }
      let url = `/message/create`;
      axios.post(url, formData, config).then((response) => {
        if (response) {
          setState({ textValue: "", showEmoji: false, selectedFile: null,selectedFileType:null });
        }
      });
    }
  };
  const clearChat = () => {
    let message = props.t(
      "Are you sure that you want to delete the conversation?"
    );
    swal({
      title: props.t("Are you sure?"),
      text: message,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        let url = "/messages/delete";
        formData.append("message_id", state.id);
        axios
          .post(url, formData)
          .then((response) => {})
          .catch((err) => {
            swal(
              "Error",
              props.t("Something went wrong, please try again later"),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  let type = "m";
  if (
    state.message &&
    state.message.resource_id != props.pageData.loggedInUserDetails.user_id
  ) {
    type = "r";
  }

  let style = {};
  if (props.fromSmallChat && state.chatIndex > 0) {
    style = { right: parseInt(state.chatIndex) * 360 + "px" };
  }

  var createObjectURL =
    (URL || webkitURL || {}).createObjectURL || function () {};

  let allowAICreate = false;
  let customTags = {};
  if (
    parseInt(props.pageData.appSettings["openai_image_system"], 10) == 1 &&
    props.pageData.levelPermissions &&
    parseInt(props.pageData.levelPermissions["openai.imagecreate"], 10) == 1 &&
    parseInt(props.pageData.appSettings.allowOpenAi, 10) == 1
  ) {
    customTags = {
      "data-bs-toggle": "dropdown",
      "aria-expanded": "false",
    };
    allowAICreate = true;
  }

  let price = parseFloat(props.pageData.appSettings.openai_image_price) || 0;

  let aiPopup = null;
  if (state.openAiPopup) {
    aiPopup = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt"  style={{maxWidth:"700px"}}>
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{props.t("Create Content Using AI")}</h2>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setState({ openAiPopup: null });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <OpenAI
                {...props}
                data={state.openAiPopup}
                setValue={(_key, value) => {
                    selectedFile(value);
                  setState({ openAiPopup: null });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ ...style }}
      className={`${
        props.fromSmallChat
          ? "w-100 overflow-hidden chatBoxWrap"
          : "w-100 overflow-hidden position-relative"
      }${state.minimize == 1 ? " minimize" : ""}`}
    >
        {aiPopup}
      <div className="p-3 p-lg-4 border-bottom user-chat-topbar">
        <div className="row align-items-center">
          <div className="col-sm-12 col-12">
            <div className="d-flex align-items-center flex-wrap">
              <div className="me-3 ms-0 ml5">
                <Link
                  customParam={`id=${state.message[`${type}username`]}`}
                  href={`/${state.message[`${type}username`]}`}
                  as={`/${state.message[`${type}username`]}`}
                >
                  <a>
                    <img
                      src={
                        props.pageData.imageSuffix +
                        state.message[`${type}avtar`]
                      }
                      className="rounded-circle avatar-xs"
                      alt={state.message[`${type}displayname`]}
                    />
                  </a>
                </Link>
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <h5 className="font-size-16 mb-0 text-truncate">
                  <span className="ChatUserName d-inline-flex align-items-center">
                    <Link
                      href={`/${state.message[`${type}username`]}`}
                      customParam={`id=${state.message[`${type}username`]}`}
                      as={`/${state.message[`${type}username`]}`}
                    >
                      <a className="text-reset user-profile-show">
                        {state.message[`${type}displayname`]}
                        {parseInt(state.message[`${type}verified`]) == 1 ? (
                          <span
                            className="verifiedUser"
                            title={props.t("verified")}
                          >
                            <span
                              className="material-icons"
                              data-icon="check"
                            ></span>
                          </span>
                        ) : null}
                      </a>
                    </Link>
                  </span>
                </h5>
              </div>
              <div className="pull-right chatTopIconActn">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    clearChat();
                  }}
                >
                  <i className="fas fa-trash"></i>
                </a>
                {props.fromSmallChat ? (
                  <React.Fragment>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        props.minimizeChat(state.id);
                      }}
                    >
                      {state.minimize ? (
                        <i className="fas fa-expand"></i>
                      ) : (
                        <i className="fas fa-compress"></i>
                      )}
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        props.closeChat(state.id);
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </a>
                  </React.Fragment>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="chat-conversation p-3 p-lg-4 sidebar-scroll"
        ref={scrollDiv}
        onScroll={onMainScroll}
      >
        <div>
          <ul className="list-unstyled mb-0">
            {state.loading ? <Loader loading={true} /> : null}
            {state.chats.length > 0 ? (
              state.chats.map((chat) => {
                return (
                  <li
                    key={chat.messages_text_id}
                    className={`${
                      parseInt(chat.chat_user_id) ==
                      props.pageData.loggedInUserDetails.user_id
                        ? "right"
                        : ""
                    }`}
                  >
                    <div className="conversation-list">
                      <div className="chat-avatar">
                        <img
                          src={props.pageData.imageSuffix + chat.avtar}
                          alt={chat.displayname}
                        />
                      </div>
                      <div className="user-chat-content">
                        <div className="ctext-wrap">
                          <div className="ctext-wrap-content">
                            {chat.image || chat.video ? (
                              <ul className="list-inline message-img  mb-0">
                                {chat.image ? (
                                  <li className="list-inline-item message-img-list me-2 ms-0">
                                    <div>
                                      <a
                                        className="popup-img d-inline-block m-1"
                                        href="#"
                                        onClick={(e) => {
                                          openImage(
                                            props.pageData.imageSuffix +
                                              chat.image,
                                            e
                                          );
                                        }}
                                      >
                                        <img
                                          src={
                                            props.pageData.imageSuffix +
                                            chat.image
                                          }
                                          className="rounded border"
                                        />
                                      </a>
                                    </div>
                                  </li>
                                ) : null}
                                {chat.video ? (
                                  <li className="list-inline-item message-img-list">
                                    <div>
                                      <a
                                        className="popup-img d-inline-block m-1"
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                      >
                                        <video
                                          width="400"
                                          controls
                                          className="rounded border"
                                        >
                                          <source
                                            src={props.pageData.imageSuffix + chat.video}
                                            type="video/mp4"
                                          />
                                          {props.t(
                                            "Your browser does not support HTML video."
                                          )}
                                        </video>
                                      </a>
                                    </div>
                                  </li>
                                ) : null}
                              </ul>
                            ) : null}
                            <p className="mb-0">{chat.message}</p>
                            <p className="chat-time mb-0">
                              <span className="align-middle">
                                <Timeago {...props}>
                                  {chat.creation_date}
                                </Timeago>
                              </span>
                            </p>
                          </div>
                          {chat.chat_user_id ==
                          props.pageData.loggedInUserDetails.user_id ? (
                            <div className="dropdown align-self-start dropup">
                              <a
                                className="dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </a>
                              <div className="dropdown-menu">
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteMessage(chat.messages_text_id);
                                  }}
                                >
                                  {props.t("Remove Message")}{" "}
                                  <i className="ri-delete-bin-line float-end text-muted"></i>
                                </a>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="conversation-name ChatUserName">
                          {chat.displayname}
                          {parseInt(chat[`verified`]) == 1 ? (
                            <span
                              className="verifiedUser"
                              title={props.t("verified")}
                            >
                              <span
                                className="material-icons"
                                data-icon="check"
                              ></span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : !state.loading ? (
              <div className="no-content">
                {props.t("No messages were found, say Hello!")}
              </div>
            ) : null}
          </ul>
        </div>
      </div>
      {!state.message.block ? (
        <div className="chat-input-section p-3 p-lg-4 border-top mb-0">
          <div className="row g-0">
            <div className="col">
              <input
                type="text"
                ref={textareaInput}
                className="form-control chat-input-field form-control-lg bg-light border-light"
                value={state.textValue ? state.textValue : ""}
                onKeyDown={(e) => enterHit(e)}
                onChange={(e) => {
                  setState({ textValue: e.target.value });
                }}
                placeholder={props.t("Enter Message...")}
              />
            </div>
            <div className="col-auto">
              {state.selectedFile && state.selectedFileType == "image" ? (
                <div className="preview chatPreviewImg">
                  <div className="previewUploadImg">
                    <div>
                      <img
                        src={
                          state.selectedFile
                            ? typeof state.selectedFile == "string"
                              ? state.selectedFile
                              : createObjectURL(state.selectedFile)
                            : null
                        }
                        alt={props.t("Image Preview")}
                      />
                      <span
                        className="close closePreviewImage"
                        onClick={(e) => {
                          setState({ selectedFile: null });
                        }}
                      >
                        x
                      </span>
                    </div>
                  </div>
                </div>
              ) : state.selectedFile && state.selectedFileType == "video" ? (
                <div className="preview chatPreviewImg">
                  <div className="previewUploadImg">
                    <div>
                      <video width="400" controls className="rounded border">
                        <source
                          src={createObjectURL(state.selectedFile)}
                          type="video/mp4"
                        />
                        {props.t("Your browser does not support HTML video.")}
                      </video>
                      <span
                        className="close closePreviewImage"
                        onClick={(e) => {
                          setState({ selectedFile: null });
                        }}
                      >
                        x
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="chat-input-links ms-md-2 me-md-0">
                <ul className="list-inline mb-0">
                  <li
                    className="list-inline-item emojiBtn"
                    ref={emojiContainer}
                  >
                    {state.showEmoji ? (
                      <div className="emoji-picker-react">
                        <Picker
                          onEmojiClick={onEmojiClick}
                          autoFocusSearch={false}
                          skinTone={"1f3ff"}
                          // emojiStyle={EmojiStyle.NATIVE}
                          // native
                          // groupNames={{
                          //     smileys_people: props.t("people"),
                          //     animals_nature: props.t('animals & nature'),
                          //     food_drink: props.t('food & drink'),
                          //     travel_places: props.t('travel & places'),
                          //     activities: props.t('activities'),
                          //     objects: props.t('objects'),
                          //     symbols: props.t('symbols'),
                          //     flags: props.t('flags'),
                          //     recently_used: props.t('Recently Used'),
                          //     }}
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      title={props.t("Emojis")}
                      className="btn btn-link text-decoration-none font-size-16 btn-lg"
                      onClick={(e) => {
                        setState({ showEmoji: !state.showEmoji });
                      }}
                    >
                      <i className="fas fa-surprise"></i>
                    </button>
                  </li>
                  <li
                    className="TitleRightDropdown list-inline-item attachBtn dropup"
                   
                    {...customTags}
                    title={props.t("Attached image")}
                  >
                    {!allowAICreate ? (
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={selectedFile}
                          name="file"
                          accept="image/*,video/mp4"
                          ref={inputFile}
                        />
                      ) : null}
                    <button
                      type="button"
                      {...customTags}
                      onClick={(e) => {
                        if(!allowAICreate)
                        inputFile.current.click();
                      }}
                      className="btn btn-link text-decoration-none font-size-16 btn-lg "
                    >
                      <i className="fas fa-paperclip"></i>
                      
                    </button>
                    {allowAICreate && (
                      <ul className="dropdown-menu edit-options">
                        <li>
                          <input
                            className="fileNone"
                            accept="image/*,video/mp4"
                            onChange={selectedFile}
                            ref={inputFile}
                            type="file"
                          />
                          <a
                            className="a-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              inputFile.current.click();
                            }}
                            style={{ lineHeight: "20px" }}
                          >
                            {props.t("Upload New")}
                          </a>
                          
                        </li>
                        <li>
                          <a
                            className="a-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setState({
                                openAiPopup: {
                                  price: price,
                                  type: "file",
                                  key: "image",
                                },
                              });
                            }}
                            style={{ lineHeight: "20px" }}
                          >
                            {props.t("Generate Using AI")}
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="list-inline-item sendBtn">
                    <button
                      type="button"
                      onClick={(e) => {
                        submitForm();
                      }}
                      title={props.t("Send message")}
                      className="btn font-size-16 btn-lg chat-send"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <style jsx>
        {`
          .header-info-wrap .coverphotoUser .editCoverImg a.a-link {
            text-align: left;
          }
          .TitleRightDropdown .edit-options.show {
            min-width: 200px;
          }
          .TitleRightDropdown .edit-options.show li a {
            align-items: flex-start;
          }
          .edit-options li{
            padding:0px;
            margin:0px;
          }
        `}
      </style>
    </div>
  );
};

export default Chat;
