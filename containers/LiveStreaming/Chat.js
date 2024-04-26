import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";

const Chat = (props) => {
  const messagesEnd = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      custom_url: props.custom_url,
      channel: props.channel,
      streamId: props.streamId,
      comments: props.comments ? props.comments : [],
      comment: "",
      showTab: "chat",
      finish: props.finish,
      banusers:
        props.pageData.video && props.pageData.video.banusers
          ? props.pageData.video.banusers
          : [],
      banEnable: props.pageData.banEnable ? props.pageData.banEnable : 0,
      tipsData: [],
      tipsTip: {},
      hide: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.comments;
  const stateBanRef = useRef();
  stateBanRef.current = state.banusers;

  useEffect(() => {
    if (
      props.channel != state.channel ||
      props.custom_url != state.custom_url ||
      props.streamId != state.streamId
    ) {
      props.socket.emit("leaveRoom", {
        room: state.channel,
        custom_url: state.custom_url,
        streamId: state.streamId,
      });
      props.socket.emit("roomJoin", {
        room: props.channel,
        streamId: props.streamId,
        custom_url: props.custom_url,
      });
      scrollToBottom();
    }
    if (
      props.channel != state.channel ||
      props.custom_url != state.custom_url ||
      props.streamId != state.streamId
    ) {
      return {
        streamId: props.streamId,
        custom_url: props.custom_url,
        channel: props.channel,
        comments: props.comments,
        showTab: "chat",
        finish: props.finish,
        tipsData: [],
        hide: false,
        banusers:
          props.pageData.video && props.pageData.video.banusers
            ? props.pageData.video.banusers
            : [],
        banEnable: props.pageData.banEnable ? props.pageData.banEnable : 0,
        tipsTip: {},
      };
    }
  }, [props]);
  useEffect(() => {
    scrollToBottom();
    //roomJoin
    props.socket.emit("roomJoin", {
      streamId: state.streamId,
      room: state.channel,
      custom_url: state.custom_url,
    });
    props.socket.on("userMessage", (socketdata) => {
      if (socketdata.ban) {
        let owner_id = 0;
        if (props.pageData.loggedInUserDetails) {
          owner_id = props.pageData.loggedInUserDetails.user_id;
        }
        if (socketdata.user_id == owner_id)
          props.openToast({message:props.t("You are banned."), type:"error"});
        return;
      }
      let comments = [...stateRef.current];
      comments.push(socketdata);

      let params = socketdata.params ? JSON.parse(socketdata.params) : {};
      let tipsData = [...state.tipsData];
      let tips = state.tipsTip;
      if (params.tip) {
        tipsData.push(socketdata);
        tips[socketdata.chat_id] = 0;
      }
      setState(
        {
          
          comments: comments,
          tipsData: tipsData,
          tipsTip: tips,
        },
      );
      setTimeout(() => {
        scrollToBottom();
        if (props.getHeight) {
          props.getHeight();
        }
      },200)
    });
    props.socket.on("deleteMessage", (socketdata) => {
      let chat_id = socketdata.chat_id;
      const itemIndex = getCommentIndex(chat_id);
      if (itemIndex > -1) {
        const comments = [...stateRef.current];
        comments.splice(itemIndex, 1);
        setState({  comments: comments });
      }
    });
    props.socket.on("banUserMessage", (socketdata) => {
      let owner_id = socketdata.user_id;
      let banusers = [...stateBanRef.current];
      banusers.push(socketdata);
      setState({
        
        banusers: banusers,
        comments: [...stateRef.current],
      });
    });
    props.socket.on("unbanUserMessage", (socketdata) => {
      let owner_id = socketdata.user_id;
      const itemIndex = getUserIndex(owner_id);
      if (itemIndex > -1) {
        const banusers = [...stateBanRef.current];
        banusers.splice(itemIndex, 1);
        setState({
          
          banusers: banusers,
          comments: [...stateRef.current],
        });
      }
    });
    setInterval(() => checkTipData(), 1000);
  }, []);

  const scrollToBottom = () => {
    if(messagesEnd.current)
      messagesEnd.current.scrollTop = messagesEnd.current.scrollHeight;
  };

  const checkTipData = () => {
    if (Object.keys(state.tipsData).length == 0) {
      return;
    }
    let tipsData = [...state.tipsData];
    let tipsTip = { ...state.tipsTip };
    state.tipsData.forEach((item) => {
      if (tipsTip[item.chat_id] && tipsTip[item.chat_id] == 10) {
        delete tipsTip[item.chat_id];
        const data = [...state.tipsData];
        const itemIndex = data.findIndex((p) => p["chat_id"] == item.chat_id);
        if (itemIndex > -1) {
          tipsData.splice(itemIndex, 1);
        }
      } else {
        tipsTip[item.chat_id] = tipsTip[item.chat_id] + 1;
      }
    });
    setState(
      {  tipsTip: tipsTip, tipsData: tipsData }
    );
    setTimeout(() => {
      if (props.getHeight) {
        props.getHeight();
      }
    },200)
  };
  const getUserIndex = (item_id) => {
    if (state.banusers) {
      const banusers = [...stateBanRef.current];
      const itemIndex = banusers.findIndex((p) => p["user_id"] == item_id);
      return itemIndex;
    }
    return -1;
  };
  const submitComment = () => {
    if (state.comment) {
      postComment();
    }
  };
  const enterHit = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      postComment();
      return false;
    } else {
      return true;
    }
  };
  const postComment = () => {
    if (state.comment && props.pageData.loggedInUserDetails) {
      let bannedUser = getUserIndex(props.pageData.loggedInUserDetails.user_id);
      if (bannedUser > -1) {
        props.openToast({message:props.t("You are banned."), type:"error"});
        return;
      }
      let data = {};
      data.room = state.channel;
      data.streamId = state.streamId;
      data.message = state.comment;
      data.id = state.custom_url;
      data.custom_url = state.custom_url;
      data.displayname = props.pageData.loggedInUserDetails.displayname;
      data.user_id = props.pageData.loggedInUserDetails.user_id;
      data.image = props.pageData.loggedInUserDetails.avtar;
      setState({  comment: "" });
      props.socket.emit("userMessage", data);
    }
  };
  const deleteMessage = (e, chat_id) => {
    e.preventDefault();
    let data = {};
    data.room = state.channel;
    data.streamId = state.streamId;
    data.chat_id = chat_id;
    data.custom_url = state.custom_url;
    props.socket.emit("deleteMessage", data);
  };
  const banMessage = (e, chat_id, user) => {
    e.preventDefault();
    let data = {};
    data.room = state.channel;
    data.streamId = state.streamId;
    data.chat_id = chat_id;
    if (user) {
      const itemIndex = getCommentUserIndex(chat_id);
      if (itemIndex > -1) {
        const comments = [...state.banusers];
        data.user_id = comments[itemIndex].user_id;
        data.displayname = comments[itemIndex].displayname;
        data.username = comments[itemIndex].username;
        data.image = comments[itemIndex].image;
      }
    } else {
      const itemIndex = getCommentIndex(chat_id);
      if (itemIndex > -1) {
        const comments = [...stateRef.current];
        data.user_id = comments[itemIndex].user_id;
        data.displayname = comments[itemIndex].displayname;
        data.username = comments[itemIndex].username;
        data.image = comments[itemIndex].image;
      }
    }
    data.custom_url = state.custom_url;
    props.socket.emit("banUserMessage", data);
  };
  const getCommentUserIndex = (item_id) => {
    if (stateRef.current) {
      const comments = [...state.banusers];
      const itemIndex = comments.findIndex((p) => p["user_id"] == item_id);
      return itemIndex;
    }
    return -1;
  };
  const getCommentIndex = (item_id) => {
    if (stateRef.current) {
      const comments = [...stateRef.current];
      const itemIndex = comments.findIndex((p) => p["chat_id"] == item_id);
      return itemIndex;
    }
    return -1;
  };
  const changeTab = (e) => {
    e.preventDefault();
    setState({ showTab: "participants" });
  };
  const changeBan = (e) => {
    e.preventDefault();
    setState({ showTab: "banusers" });
  };
  const getParticipantData = (e) => {
    let participants = [];
    state.comments.forEach((comment) => {
      if (!participants[comment.user_id])
        participants[comment.user_id] = comment;
    });
    return participants;
  };
  const hideChat = () => {
    if (state.hide) {
      props.hideShowChat("remove");
    } else {
      props.hideShowChat("add");
    }
    setState({  hide: !state.hide });
  };

  let mainPhoto = props.pageData.loggedInUserDetails
    ? props.pageData.loggedInUserDetails.avtar
    : null;

  if (mainPhoto) {
    const splitVal = mainPhoto.split("/");
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
    } else {
      mainPhoto = props.pageData.imageSuffix + mainPhoto;
    }
  }
  return (
    <React.Fragment>
      <div className="ls_sdTitle">
        {state.showTab == "chat" ? (
          <React.Fragment>
            <div className="title">{Translate(props, "Live Chat")}</div>
            <div className="dropdown TitleRightDropdown">
              <a className="lsdot" href="#" data-bs-toggle="dropdown">
                <i className="fas fa-ellipsis-v"></i>
              </a>
              <ul className="dropdown-menu dropdown-menu-right edit-options">
                <li>
                  <a href="#" onClick={changeTab}>
                    {Translate(props, "Participants")}
                  </a>
                </li>
                {props.deleteAll || state.banEnable == 1 ? (
                  <li>
                    <a href="#" onClick={changeBan}>
                      {Translate(props, "Ban Users")}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </React.Fragment>
        ) : state.showTab == "banusers" ? (
          <div className="chat_participants_cnt">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setState({ showTab: "chat" });
              }}
            >
              <span className="material-icons" data-icon="arrow_back"></span>
            </a>
            <span>{Translate(props, "Ban Users")}</span>
          </div>
        ) : (
          <div className="chat_participants_cnt">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setState({ showTab: "chat" });
              }}
            >
              <span className="material-icons" data-icon="arrow_back"></span>
            </a>
            <span>{Translate(props, "Participants")}</span>
          </div>
        )}
      </div>
      {state.tipsData.length > 0 ? (
        <div className="ls_sdTitle">
          <div className="tip_cnt">
            {state.tipsData.map((comment) => {
              let commentImage = comment.image;
              if (comment.image) {
                const splitVal = commentImage.split("/");
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                } else {
                  commentImage = props.pageData.imageSuffix + comment.image;
                }
              }
              let params = comment.params ? JSON.parse(comment.params) : {};
              return (
                <div className="tip" key={comment.chat_id}>
                  <div className="content animation">
                    <img className="userImg" src={commentImage} />
                    <span>{params.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="chatList custScrollBar" ref={messagesEnd}>
        {state.showTab == "chat" ? (
          <div>
            {state.comments.map((comment) => {
              let commentImage = comment.image;
              if (comment.image) {
                const splitVal = commentImage.split("/");
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                } else {
                  commentImage = props.pageData.imageSuffix + comment.image;
                }
              }
              let params = comment.params ? JSON.parse(comment.params) : {};
              return (
                <div
                  className={`chatListRow${params.tip ? " tip" : ""}`}
                  key={comment.chat_id}
                >
                  <img className="userImg" src={commentImage} />
                  <div className="chatMessege">
                    <a
                      href={props.pageData.siteURL + "/" + comment.username}
                      target="_blank"
                      className="name"
                    >
                      {comment.displayname}
                    </a>
                    <span>{comment.message}</span>
                  </div>
                  {props.deleteAll || state.banEnable == 1 ? (
                    getUserIndex(comment.user_id, state.banusers) < 0 ? (
                      <a
                        className="banbtn"
                        href="#"
                        title={props.t("Ban User")}
                        onClick={(e) => banMessage(e, comment.chat_id)}
                      >
                        <i className="fas fa-ban"></i>
                      </a>
                    ) : (
                      <a
                        className="unbanbtn banbtn"
                        href="#"
                        title={props.t("Unban User")}
                        onClick={(e) => banMessage(e, comment.chat_id)}
                      >
                        <i className="fas fa-ban"></i>
                      </a>
                    )
                  ) : null}
                  {props.deleteAll ||
                  (props.pageData.loggedInUserDetails &&
                    (props.pageData.loggedInUserDetails.user_id ==
                      comment.user_id ||
                      props.pageData.loggedInUserDetails.level_id == 1)) ? (
                    <a
                      className="deletebtn"
                      href="#"
                      onClick={(e) => deleteMessage(e, comment.chat_id)}
                    >
                      <i className="fas fa-times"></i>
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : state.showTab == "banusers" ? (
          state.banusers.map((comment) => {
            let commentImage = comment.image;
            if (comment.image) {
              const splitVal = commentImage.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
              } else {
                commentImage = props.pageData.imageSuffix + comment.image;
              }
            }
            return (
              <div className="chatListRow" key={comment.user_id}>
                <img className="userImg" src={commentImage} />
                <div className="chatMessege">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="name"
                  >
                    {comment.displayname}
                  </a>
                </div>
                <a
                  className="unbanbtn banbtn"
                  href="#"
                  title={props.t("Unban User")}
                  onClick={(e) => banMessage(e, comment.user_id, 1)}
                >
                  <i className="fas fa-ban"></i>
                </a>
              </div>
            );
          })
        ) : (
          getParticipantData().map((comment) => {
            let commentImage = comment.image;
            if (comment.image) {
              const splitVal = commentImage.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
              } else {
                commentImage = props.pageData.imageSuffix + comment.image;
              }
            }
            return (
              <div className="chatListRow" key={comment.chat_id}>
                <img className="userImg" src={commentImage} />
                <div className="chatMessege">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="name"
                  >
                    {comment.displayname}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="Chattexttyping">
        {mainPhoto && state.showTab == "chat" && !state.finish ? (
          <React.Fragment>
            <div className="userName">
              <img className="userImg" src={mainPhoto} />
              <span className="name">
                {props.pageData.loggedInUserDetails.displayname}
              </span>
            </div>
            <div className="chatInput clearfix">
              <input
                className="chatbox"
                type="text"
                onKeyDown={(e) => enterHit(e)}
                placeholder={props.t("Say Something...")}
                value={state.comment}
                onChange={(e) =>
                  setState({  comment: e.target.value })
                }
              />
              <button className="chatsend float-right" onClick={submitComment}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </React.Fragment>
        ) : null}
      </div>
      {props.showHideChat ? (
        <div className="hide-chat" onClick={hideChat}>
          <span className="material-icons-outlined">
            {state.hide
              ? "keyboard_double_arrow_up"
              : "keyboard_double_arrow_down"}
          </span>
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default Chat;
