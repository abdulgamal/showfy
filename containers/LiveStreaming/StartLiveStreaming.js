import React, { useReducer, useEffect, useRef } from "react";
import RTCClient from "./rtc-client";
import { useSelector } from "react-redux";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";
import ShortNumber from "short-number";
import SocialShare from "../SocialShare/Index";
import Chat from "./Chat";
import Link from "../../components/Link";
import ToastMessage from "../ToastMessage/Index";
import ToastContainer from "../ToastMessage/Container";
import Router from "next/router";
import config from "../../config";

const Index = (props) => {
  let reduxState = useSelector((state) => {
    return state;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      allow_chat: props.allow_chat ? props.allow_chat : 1,
      like: props.like_count ? props.like_count : 0,
      dislike: props.dislike_count ? props.dislike_count : 0,
      randNumber: Math.floor(Math.random() * (99999999 - 9999) + 9999),
      user_id: props.pageData.loggedInUserDetails
        ? props.pageData.loggedInUserDetails.user_id
        : 0,
      title: props.title,
      image: props.image,
      allowedTime: props.allowedTime ? props.allowedTime : 0,
      currentTime: props.currentTime ? props.currentTime : 0,
      channel: props.channel,
      role: props.role,
      custom_url: props.custom_url,
      video: props.video,
      video_id: props.video_id,
      streamleave: false,
      viewer: props.viewer ? props.viewer : 0,
      comments: [],
      videoMuted: false,
      audioMuted: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state;
  useEffect(() => {
    if (props.channel && props.channel != state.channel) {
      setState({
        currentTime: props.currentTime,
        channel: props.channel,
        role: props.role,
        custom_url: props.custom_url,
        video: props.video,
        video_id: props.video_id,
        viewer: props.viewer,
        comments: props.comments,
      });
    }
  }, [props]);
  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      // do componentDidMount logic
      mounted.current = true;
    } else {
      if (props.channel != stateRef.current.channel) {
        if (stateRef.current.timerID) clearInterval(stateRef.current.timerID);
        if (stateRef.current.timerHostUpdate)
          clearInterval(stateRef.current.timerHostUpdate);
        if (props.role != "host") {
          $(".video-view").remove();
        }
        stateRef.current.rtcClient.leave();
        createAuthToken();
        updateViewer("delete", stateRef.current.custom_url);
      }
    }
  });

  const onUnload = () => {
    props.socket.emit("leaveRoom", {
      room:
        stateRef.current.role == "host"
          ? "ptv_" + stateRef.current.randNumber
          : stateRef.current.video.channel_name,
      custom_url: stateRef.current.custom_url,
    });
    //props.socket.disconnect();
    if (stateRef.current.role == "host") {
      finish();
    } else {
      updateViewer("delete", stateRef.current.custom_url);
    }
  };
  const createAuthToken = () => {
    let formData = new FormData();

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url =
      "/live-streaming/access_token?channelName=" +
      (stateRef.current.role == "host"
        ? "ptv_" + stateRef.current.randNumber
        : stateRef.current.video.channel_name) +
      "&role=" +
      (stateRef.current.role == "host" ? "publisher" : "subcriber");

    axios
      .post(url, formData, config)
      .then((response) => {
        setState({ token: response.data.token });
        setTimeout(() => {
          createVideoStreaming();
        }, 200);
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };

  useEffect(() => {
    Router.events.on("routeChangeStart", (url) => {
      onUnload();
    });
    window.addEventListener("beforeunload", onUnload);
    props.socket.on("liveStreamingViewerDelete", (data) => {
      let id = data.custom_url;
      if (stateRef.current.custom_url == id) {
        let viewer = parseInt(stateRef.current.viewer, 10) - 1;
        setState({ viewer: viewer < 0 ? 0 : viewer });
      }
    });
    props.socket.on("liveStreamingViewerAdded", (data) => {
      let id = data.custom_url;
      if (stateRef.current.custom_url == id) {
        let viewer = parseInt(stateRef.current.viewer, 10) + 1;
        setState({ viewer: viewer < 0 ? 0 : viewer });
      }
    });

    props.socket.on("likeDislike", (data) => {
      let itemId = data.itemId;
      let itemType = data.itemType;
      let ownerId = data.ownerId;
      let removeLike = data.removeLike;
      let removeDislike = data.removeDislike;
      let insertLike = data.insertLike;
      let insertDislike = data.insertDislike;
      if (itemType == "videos" && stateRef.current.video_id == itemId) {
        const item = { ...stateRef.current };

        if (removeLike) {
          item["like"] = parseInt(item["like"]) - 1;
        }
        if (removeDislike) {
          item["dislike"] = parseInt(item["dislike"]) - 1;
        }
        if (insertLike) {
          item["like"] = parseInt(item["like"]) + 1;
        }
        if (insertDislike) {
          item["dislike"] = parseInt(item["dislike"]) + 1;
        }
        setState({ ...item });
      }
    });
    if (props.getHeight) props.getHeight();
    createAuthToken();
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      if (stateRef.current.timerID) clearInterval(stateRef.current.timerID);
      if (stateRef.current.timerHostUpdate)
        clearInterval(stateRef.current.timerHostUpdate);
      if (stateRef.current.role == "host") {
        finish();
      }
    };
  }, []);

  const createVideoStreaming = async () => {
    let client = new RTCClient();
    setState({ rtcClient: client });
    if (!stateRef.current.channel) {
      setState({ hostleave: true });
      return;
    }
    await client.getdevices().then((result) => {
      setState({
        cameraList: result.cameraList,
        microphoneList: result.microphoneList,
      });
    });
    client
      .init({
        role: stateRef.current.role,
        appID: props.pageData.agora_app_id,
        codec: "vp8",
      })
      .then((_) => {
        let data = {};
        data.role = stateRef.current.role;
        data.token = stateRef.current.token;
        data.channel =
          stateRef.current.role == "host"
            ? "ptv_" + stateRef.current.randNumber
            : stateRef.current.video.channel_name;
        client.join(data).then((data) => {
          if (data) {
            if (stateRef.current.role == "host") {
              startRecording();
              const timerHostUpdate = setInterval(
                () => updateHostLiveTime(),
                30000
              );
              const timerID = setInterval(() => timer(), 1000);
              let dataPublish = {};
              dataPublish["microphoneId"] =
                stateRef.current.microphoneList &&
                stateRef.current.microphoneList[0]
                  ? stateRef.current.microphoneList[0].value
                  : "";
              dataPublish["cameraId"] =
                stateRef.current.cameraList && stateRef.current.cameraList[0]
                  ? stateRef.current.cameraList[0].value
                  : "";
              client.publish(dataPublish);
              setState({
                cameraId: dataPublish["cameraId"],
                timerHostUpdate: timerHostUpdate,
                timerID: timerID,
              });
              if (
                parseInt(
                  props.pageData.levelPermissions["livestreaming.duration"],
                  10
                ) != 0
              ) {
                props.openToast({
                  message: props.t(
                    "You can go live for {{duration}} minutes.",
                    {
                      duration: parseInt(
                        props.pageData.levelPermissions[
                          "livestreaming.duration"
                        ]
                      ),
                    }
                  ),
                  type: "success",
                });
              }
            } else {
              client.getClient().on("peer-leave", (evt) => {
                var id = evt.uid;
                if (id != client.uid()) {
                  setState({ hostleave: true });
                }
              });
              updateViewer("add");
            }
            const timerID = setInterval(() => timer(), 1000);
            setState({ timerID: timerID });
          } else {
            setState({ hostleave: true });
          }
        });
      });
  };

  const updateViewer = (data, customURL) => {
    let formData = new FormData();
    formData.append(
      "custom_url",
      customURL ? customURL : stateRef.current.custom_url
    );
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/live-streaming/" + data + "-viewer";

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
        }
      })
      .catch((err) => {});
  };

  const startRecording = () => {
    if (stateRef.current.role == "host") {
      let formData = new FormData();
      formData.append("channel", "ptv_" + stateRef.current.randNumber);
      formData.append("uid", stateRef.current.rtcClient.uid());
      formData.append("custom_url", stateRef.current.custom_url);
      formData.append("token", stateRef.current.token);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let url = "/live-streaming/record/start";

      axios
        .post(url, formData, config)
        .then((response) => {
          if (response.data.error) {
          } else {
          }
        })
        .catch((err) => {});
    }
  };
  const stopRecroding = () => {
    if (stateRef.current.role == "host") {
      let formData = new FormData();
      formData.append("channel", "ptv_" + stateRef.current.randNumber);
      formData.append("uid", stateRef.current.rtcClient.uid());
      formData.append("custom_url", stateRef.current.custom_url);
      formData.append("token", stateRef.current.token);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let url = "/live-streaming/record/stop";

      axios
        .post(url, formData, config)
        .then((response) => {
          if (response.data.error) {
          } else {
          }
        })
        .catch((err) => {});
    }
  };
  const finish = () => {
    stateRef.current.rtcClient.leave();
    stopRecroding();
    if (stateRef.current.timerID) clearInterval(stateRef.current.timerID);
    if (stateRef.current.timerHostUpdate)
      clearInterval(stateRef.current.timerHostUpdate);
    setState({ streamleave: true, confirm: false });
  };
  const changeTimeStamp = () => {
    let currentTime = stateRef.current.currentTime;
    var seconds = parseInt(currentTime, 10); // don't forget the second param
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var time = hours + ":" + minutes + ":" + seconds;
    return time;
  };
  const timer = () => {
    if (stateRef.current.streamleave) return;
    let allowedTime = 0;
    if (stateRef.current.role == "host") {
      if (
        props.pageData.levelPermissions &&
        parseInt(
          props.pageData.levelPermissions["livestreaming.duration"],
          10
        ) != 0
      ) {
        allowedTime = parseInt(
          props.pageData.levelPermissions["livestreaming.duration"],
          10
        );
      }
    }

    if (
      allowedTime == 0 ||
      allowedTime * 60 >= stateRef.current.currentTime - 1
    ) {
      let currentTime = parseInt(stateRef.current.currentTime, 10);
      setState({ currentTime: currentTime + 1 });
    } else {
      if (stateRef.current.timerID) clearInterval(stateRef.current.timerID);
      if (stateRef.current.timerHostUpdate)
        clearInterval(stateRef.current.timerHostUpdate);
      finish();
    }
  };
  const updateHostLiveTime = () => {
    if (stateRef.current.role == "host") {
      //update host time
      let data = {};
      data.custom_url = stateRef.current.custom_url;
      props.socket.emit("updateLiveHostTime", data);
    }
  };
  const confirmfinish = () => {
    setState({ confirm: true });
  };
  const CameraAudio = (value, e) => {
    if (value == "video") {
      !state.videoMuted
        ? state.rtcClient.getLocalStream().muteVideo()
        : state.rtcClient.getLocalStream().unmuteVideo();
      setState({ videoMuted: !state.videoMuted });
    } else {
      !state.audioMuted
        ? state.rtcClient.getLocalStream().muteAudio()
        : state.rtcClient.getLocalStream().unmuteAudio();
      setState({ audioMuted: !state.audioMuted });
    }
  };
  const changeCamera = () => {
    let value = state.cameraId;
    state.cameraList.forEach((item) => {
      if (state.cameraId != item.value) {
        value = item.value;
      }
    });
    setState({ cameraId: value, localUpdate: true });
    state.rtcClient.getLocalStream().getVideoTrack().stop();
    state.rtcClient.getLocalStream().switchDevice("video", value);
  };
  const hideShowChat = (type) => {
    if (type == "remove") {
      //remove class
      setState({ hide: false });
    } else {
      //add class
      setState({ hide: true });
    }
  };
  if (state.role != "host") {
    return (
      <div
        className="video_player_cnt player-wrapper"
        style={{ width: "100%", position: "relative" }}
      >
        {
          <React.Fragment>
            {!state.hostleave ? (
              <React.Fragment>
                <div className="lsVideoTop">
                  <div className="liveTimeWrap">
                    <span className="liveText">{Translate(props, "LIVE")}</span>
                    <span className="liveTime">{changeTimeStamp()}</span>
                  </div>
                  <div className="participentNo">
                    <i className="fa fa-users" aria-hidden="true"></i>{" "}
                    {`${ShortNumber(state.viewer ? state.viewer : 0)}`}
                  </div>
                </div>
                {state.video.watermark ? (
                  <div className="watermarkLogo">
                    <a href={config.app_server} {...props.watermarkLogoParams}>
                      <img src={props.imageSuffix + state.video.watermark} />
                    </a>
                  </div>
                ) : null}
                <div
                  className="videoWrapCnt"
                  id="video"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    id="local_stream"
                    className="video-placeholder remote_audience"
                  ></div>
                  <div
                    id="local_video_info"
                    style={{ display: "none" }}
                    className="video-profile hide"
                  ></div>
                  {/* {
                                        !props.needSubscription && props.width <= 992 && props.videoElem && props.videoElem.approve == 1 && props.videoElem.enable_chat == 1 && ( (props.videoElem.is_livestreaming == 1 && (props.videoElem.channel_name || props.videoElem.mediaserver_stream_id)) || props.videoElem.scheduled   ) ? 
                                                <div className={`mobile-chat${state.hide ? " hide-chat" : ""}`}>
                                                    <div className="ls_sidbar top_video_chat">
                                                        <Chat {...props} hideShowChat={hideShowChat} showHideChat={true} channel={props.videoElem.channel_name} streamId={props.videoElem.mediaserver_stream_id} custom_url={props.videoElem.custom_url} comments={props.videoElem.chatcomments ? props.videoElem.chatcomments : []} />
                                                    </div>    
                                                </div>
                                             : null
                                        } */}
                </div>
              </React.Fragment>
            ) : (
              <div className="purchase_video_content video_processing_cnt livestreaming_end">
                <h5>{props.t("Thanks For Watching!")}</h5>
                <p>{props.t("Live Video has been Ended")}</p>
              </div>
            )}
          </React.Fragment>
        }
      </div>
    );
  }

  return (
    <React.Fragment>
      {reduxState.share.status ? (
        <SocialShare
          {...props}
          buttonHeightWidth="30"
          url={`/watch/${state.custom_url}`}
          title={state.title}
          imageSuffix={props.pageData.imageSuffix}
          media={state.image}
          countItems="all"
          checkcode={true}
        />
      ) : null}
      {
        <React.Fragment>
          <ToastContainer {...props} />
          <ToastMessage {...props} />
        </React.Fragment>
      }
      <div className="videoSection2">
        <div className={`videoWrap${state.allow_chat != 1 ? " nochat" : ""}`}>
          {state.confirm ? (
            <div className="popup_wrapper_cnt livestreaming_end">
              <div className="popup_cnt">
                <div className="comments">
                  <div className="VideoDetails-commentWrap">
                    <div className="popup_wrapper_cnt_header">
                      <h2>
                        {Translate(
                          props,
                          "Are you sure you want to end your stream?"
                        )}
                      </h2>
                      <a
                        className="_close"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setState({ confirm: false });
                        }}
                      >
                        <i></i>
                      </a>
                      <div className="footer">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setState({ confirm: false });
                          }}
                        >
                          {Translate(props, "NOT YET")}
                        </a>
                        <button onClick={finish}>
                          {Translate(props, "END")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="lsVideoTop">
            <div className="liveTimeWrap">
              <span className="liveText">{Translate(props, "LIVE")}</span>
              <span className="liveTime">{changeTimeStamp()}</span>
            </div>
            <div className="participentNo">
              <i className="fa fa-users" aria-hidden="true"></i>{" "}
              {`${ShortNumber(state.viewer ? state.viewer : 0)}`}
            </div>
            {props.pageData.appSettings["video_like"] ? (
              <div className="likebtn">
                <i className="fa fa-thumbs-up" aria-hidden="true"></i>{" "}
                {`${ShortNumber(state.like ? state.like : 0)}`}
              </div>
            ) : null}
            {props.pageData.appSettings["video_dislike"] ? (
              <div className="likebtn">
                <i className="fa fa-thumbs-down" aria-hidden="true"></i>{" "}
                {`${ShortNumber(state.dislike ? state.dislike : 0)}`}
              </div>
            ) : null}
          </div>
          {!state.streamleave ? (
            <div className="videoWrapCnt" id="video">
              <div
                id="local_stream"
                className={`video-placeholder${
                  state.role == "host" ? "" : " remote_audience"
                }`}
              ></div>
              <div
                id="local_video_info"
                style={{ display: "none" }}
                className="video-profile hide"
              ></div>
            </div>
          ) : (
            <div className="videoWrapCnt live_host_end" id="video">
              <div className="centeredForm">
                <div className="finishedStream">
                  <div className="head">
                    {Translate(props, "Stream Finished")}
                  </div>
                  <div className="thumbStream">
                    <img
                      src={
                        props.pageData.imageSuffix +
                        props.pageData.loggedInUserDetails.avtar
                      }
                    />

                    <div className="overlay">
                      <div className="nameThumb">
                        <span className="big">{state.title}</span>
                        <span className="namesmall">
                          {props.pageData.loggedInUserDetails.displayname}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="foot">
                    <Link href="/">
                      <a className="editbtn">
                        {Translate(props, "Go back to site")}
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!state.streamleave ? (
            <div className="ls_footer">
              <div className="ls_footerOption">
                {state.cameraList && state.cameraList.length > 1 ? (
                  <div className="icon shareLinks">
                    <span
                      className="material-icons"
                      data-icon="flip_camera_android"
                      onClick={changeCamera}
                    ></span>
                    {/* <select value={state.cameraId} onChange={changeCamera.bind(this)}>
                                            <option>{props.t("Select Camera Option")}</option>
                                            {
                                                state.cameraList.map(item => {
                                                    return (
                                                        <option value={item.value} key={item.value}>{item.label}</option>
                                                    )
                                                })
                                            }
                                        </select> */}
                  </div>
                ) : null}
                <div
                  className="icon valumeBtn"
                  onClick={(e) => CameraAudio("video", e)}
                >
                  {state.videoMuted ? (
                    <span
                      className="material-icons"
                      data-icon="videocam_off"
                    ></span>
                  ) : (
                    <span
                      className="material-icons"
                      data-icon="videocam"
                    ></span>
                  )}
                </div>
                <div
                  className="icon valumeBtn"
                  onClick={(e) => CameraAudio("audio", e)}
                >
                  {state.audioMuted ? (
                    <i className="fas fa-microphone-slash"></i>
                  ) : (
                    <i className="fas fa-microphone"></i>
                  )}
                </div>
                <div className="icon shareLinks">
                  {props.pageData.appSettings["videos_share"] == 1 ? (
                    <ul
                      className="social_share_livestreaming"
                      style={{ padding: "0px" }}
                    >
                      <SocialShare
                        {...props}
                        buttonHeightWidth="30"
                        url={`/watch/${state.custom_url}`}
                        title={state.title}
                        imageSuffix={props.pageData.imageSuffix}
                        media={state.image}
                      />
                    </ul>
                  ) : null}
                </div>
                <div className="icon endBtn" onClick={confirmfinish}>
                  <button>{Translate(props, "End Stream")}</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {state.allow_chat == 1 ? (
          <div className="ls_sidbar">
            <Chat
              {...props}
              finish={state.streamleave}
              deleteAll={true}
              channel={
                state.role == "host"
                  ? "ptv_" + state.randNumber
                  : state.video.channel_name
              }
              custom_url={state.custom_url}
            />
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
};

export default Index;
