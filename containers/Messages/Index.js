import { withRouter } from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import axios from "../../axios-orders";
import { AppContext } from "../../contexts/AppContext";
import Timeago from "../Common/Timeago";
import Loader from "../LoadMore/Index";
import Chat from "./Chat";


const Messages = (props) => {
  const { messageCount,setMessageCount } = React.useContext(AppContext);

  const scrollDiv = useRef(null);
  const timmer = useRef();

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      appViewWidth:props.appViewWidth,
      showEmoji: false,
      textValue: "",
      messages: props.pageData.messages,
      pagging: props.pageData.pagging,
      page: 2,
      id: props.pageData.id,
      orgMessageID: props.pageData.orgMessageID,
      openMessage: props.pageData.openMessage,
      chatMessages: props.pageData.chatMessages,
    }
  );
  useEffect(() => {
    const updateWindowDimensions = () => {
      setState({ appViewWidth: window.innerWidth });
    };
    window.addEventListener("resize", updateWindowDimensions);
    updateWindowDimensions()
    return () =>   window.removeEventListener("resize", updateWindowDimensions);
  },[])
  const stateRef = useRef();
  stateRef.current = state;

  useEffect(() => {
    props.socket.on("chatDelete", (socketdata) => {
      let id = socketdata.message_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const messages = [...stateRef.current.messages];
        messages.splice(itemIndex, 1);
        let messageID = stateRef.current.id;
        if (stateRef.current.id == id) {
          if (messages.length > 0) {
            messageID = messages[0].message_id;
          }
        }
        setState({  messages: messages, id: messageID });
      }
    });
    props.socket.on("chatRead", (socketdata) => {
      let id = socketdata.id;
      let message_id = socketdata.message_id;
      const itemIndex = getItemIndex(message_id);
      if (itemIndex > -1) {
        const messages = [...stateRef.current.messages];
        if (parseInt(messages[itemIndex].last_user_id) != parseInt(id)) {
          setMessageCount(messageCount - 1);
          messages[itemIndex].is_read = 1;
          messages[itemIndex].seen = 1;
          setState({  messages: messages });
        }
      }
    });
    props.socket.on("chatMessageCreate", (socketdata) => {
      let id = socketdata.chat.message_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
      } else {
        const messages = [socketdata.chat, ...stateRef.current.messages];
        setState({  messages: messages });
      }
    });
  }, []);
  useEffect(() => {
    loadMoreData();
  },[state.searchTextValue])
  const getItemIndex = (item_id) => {
    const messages = [...stateRef.current.messages];
    const itemIndex = messages.findIndex((p) => p["message_id"] == item_id);
    return itemIndex;
  };

  const loadMoreData = () => {
    if (state.loading) {
      return;
    }
    setState({  loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = `/messages`;

    if (state.searchTextValue) {
      formData.append("search", state.searchTextValue);
    }

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.messages) {
          let pagging = response.data.pagging;
          setState({
            page: state.page + 1,
            pagging: pagging,
            messages: state.page == 1 ? response.data.messages : [...state.messages, ...response.data.messages],
            loading: false,
          });
        } else {
          setState({  loading: false });
        }
      })
      .catch(() => {
        setState({  loading: false });
      });
  };

  const onMainScroll = () => {
    if (scrollDiv.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollDiv.current;
      if (scrollTop + clientHeight > scrollHeight - 150) {
        if (state.pagging) {
          loadMoreData();
        }
      }
    }
  };
  const pushTab = (id) => {
    if (state.id == id) {
      if (state.appViewWidth < 992) {
        if(state.orgMessageID == state.id)
         return
      }else
        return;
    }
    let itemIndex = getItemIndex(id);
    setState({
      id: id,
      orgMessageID:id,
      openMessage: state.messages[itemIndex],
    });
    // Router.push( `/messages/${id}`,{ shallow: true })
  };
  const changeTextValue = (e) => {
    setState({ searchTextValue: e.target.value,page:1,messages:[] });
  };
  const newChat = (newMessages, id, chatId) => {
    let messages = [...state.messages];
    let itemIndex = getItemIndex(id);
    if (itemIndex > -1) {
      if (newMessages == "delete") {
        let index = getItemChatIndex(chatId);
        if (index > -1) {
          let chats = messages[itemIndex].chats;
          chats.splice(index, 1);
          messages[itemIndex] = { ...messages[itemIndex], ...chatId };
          messages[itemIndex]["chats"] = chats;
          setState({  messages: messages });
        }
      } else if (newMessages == "create") {
        let chats = messages[itemIndex].chats ? messages[itemIndex].chats : [];
        messages[itemIndex] = { ...messages[itemIndex], ...chatId };
        chats.push(chatId);
        messages[itemIndex]["chats"] = chats;
        setState({  messages: messages });
      } else {
        let lastMessage = newMessages[newMessages.length - 1];
        messages[itemIndex] = { ...messages[itemIndex], ...lastMessage };
        messages[itemIndex]["chats"] = newMessages;
        setState({  messages: messages });
      }
    }
  };
  const getItemChatIndex = (item_id) => {
    if (state.messages[item_id] && state.messages[item_id].chats) {
      const messages = [...state.messages[item_id].chats];
      const itemIndex = messages.findIndex(
        (p) => p["messages_text_id"] == item_id
      );
      return itemIndex;
    } else {
      return -1;
    }
  };

  let styleMessages = {};
  let displayChats = {};
  if (state.appViewWidth < 992) {
    displayChats = { display: "none" };
    if (state.id && state.orgMessageID) {
      displayChats = { display: "block" };
      styleMessages = { display: "none" };
    }
  } 
  
  return (
    <div className="chat-wrapper d-lg-flex">
      <div
        className="chat-leftsidebar me-lg-1 ms-lg-0"
        style={{ ...styleMessages }}
      >
        <div className="tab-content">
          <div
            className="tab-pane fade active show"
            id="pills-chat"
            role="tabpanel"
            aria-labelledby="pills-chat-tab"
          >
            <div>
              <div className="px-4 pt-4">
                <h4 className="mb-4">{props.t("Chats")}</h4>
                <div className="search-box chat-search-box">
                  <div className="input-group mb-3 rounded-3">
                    <span
                      className="input-group-text bg-secondary border-secondary text-light pe-1 ps-3"
                      id="basic-addon1"
                    >
                      <i className="fas fa-search search-icon font-size-18"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-secondary text-light border-secondary"
                      aria-describedby="basic-addon1"
                      value={state.searchTextValue ? state.searchTextValue : ""}
                      onChange={changeTextValue}
                    />
                  </div>
                </div>
              </div>

              <div className="px-2">
                <h5 className="mb-3 px-3 font-size-16">{props.t("Recent")}</h5>
                <div
                  className="chat-message-list sidebar-scroll"
                  ref={scrollDiv}
                  onScroll={onMainScroll}
                >
                  <ul className="list-unstyled chat-list chat-user-list">
                    {state.messages.length > 0 ? (
                      state.messages.map((message) => {
                        let type = "m";
                        if (
                          message.resource_id !=
                          props.pageData.loggedInUserDetails.user_id
                        ) {
                          type = "r";
                        }
                        return (
                          <li
                            className={`${
                              parseInt(message.is_read) == 0 &&
                              message.last_user_id !=
                                props.pageData.loggedInUserDetails.user_id
                                ? "unread"
                                : ""
                            }${
                              state.id == message.message_id && (state.appViewWidth > 992 || (state.appViewWidth < 992 && state.orgMessageID == state.id)) ? " active" : ""
                            }`}
                            key={message.message_id}
                          >
                            <a
                              href={`/messages/${message.message_id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                pushTab(message.message_id);
                              }}
                            >
                              <div className="d-flex">
                                <div className="chat-user-img online align-self-center me-3 ms-0">
                                  <img
                                    src={
                                      props.pageData.imageSuffix +
                                      message[type + "avtar"]
                                    }
                                    className="rounded-circle avatar-xs"
                                    alt={message[type + "displayname"]}
                                  />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <h5 className="text-truncate font-size-15 mb-1">
                                    <span className="ChatUserName d-inline-flex align-items-center">
                                      {message[type + "displayname"]}
                                      {parseInt(message[type + "verified"]) ==
                                      1 ? (
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
                                    </span>
                                  </h5>
                                  <p className="chat-user-message text-truncate mb-0">
                                    {message.last_user_id ==
                                      props.pageData.loggedInUserDetails
                                        .user_id && message.message.trim() != ""
                                      ? props.t("You: ")
                                      : null}
                                    {message.message}
                                  </p>
                                </div>
                                <div className="font-size-11">
                                  <Timeago {...props}>
                                    {message.last_message_date}
                                  </Timeago>
                                  {message.last_user_id ==
                                    props.pageData.loggedInUserDetails
                                      .user_id &&
                                  parseInt(message.seen) == 1 ? (
                                    <div className="seen-img">
                                      <img
                                        src={
                                          props.pageData.imageSuffix +
                                          message[type + "avtar"]
                                        }
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </a>
                          </li>
                        );
                      })
                    ) : !state.loading ? (
                      <div className="no-content">
                        {props.t("No users found.")}
                      </div>
                    ) : null}
                    {state.loading ? <Loader loading={true} /> : null}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="user-chat w-100 overflow-hidden"
        style={{ ...displayChats }}
      >
        <div className="d-lg-flex">
          {state.appViewWidth < 992 ? (
            <a
              href="#"
              className="back-messages"
              onClick={(e) => {
                e.preventDefault();
                setState({ id: null, localUpdate: true });
              }}
            >
              <i className="fa fa-arrow-left" aria-hidden="true"></i>
              {props.t("Back to messages")}
            </a>
          ) : null}
          {state.id ? (
            <Chat
              {...props}
              newChat={newChat}
              id={state.id}
              message={state.openMessage}
              chats={state.chatMessages ? state.chatMessages : []}
            />
          ) : (
            <div className="no-content">
              {props.t("No messages were found.")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withRouter(Messages);
