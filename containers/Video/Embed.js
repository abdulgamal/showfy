import React, { useReducer, useEffect, useRef } from "react";
import Form from "../../components/DynamicForm/Index";
import Validator from "../../validators";
import axios from "../../axios-orders";
import dynamic from "next/dynamic";

const Player = dynamic(() => import("./Player"), {
  ssr: false,
});
const OutsidePlayer = dynamic(() => import("./OutsidePlayer"), {
  ssr: false,
});
const StartLiveStreaming = dynamic(
  () => import("../LiveStreaming/StartLiveStreaming"),
  {
    ssr: false,
  }
);
const MediaStreaming = dynamic(
  () => import("../LiveStreaming/MediaLiveStreaming"),
  {
    ssr: false,
  }
);
import Router from "next/router";
import Translate from "../../components/Translate/Index";
const MediaElementPlayer = dynamic(() => import("./MediaElementPlayer"), {
  ssr: false,
});
import Date from "../Date";
import Currency from "../Upgrade/Currency";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      styles: {
        visibility: "hidden",
        overflow: "hidden",
      },
      fullWidth: false,
      playlist: props.pageData.playlist,
      playlistVideos: props.pageData.playlistVideos,
      submitting: false,
      relatedVideos: props.pageData.relatedVideos,
      showMore: false,
      showMoreText: "See more",
      collapse: true,
      width: props.isMobile ? props.isMobile : 993,
      height: "-550px",
      adult: props.pageData.adultVideo,
      video: props.pageData.video,
      userAdVideo: props.pageData.userAdVideo,
      adminAdVideo: props.pageData.adminAdVideo,
      password: props.pageData.password,
      logout: false,
    }
  );
  useEffect(() => {
    if (
      props.pageData.video != state.video ||
      (state.video && props.pageData.video.status != state.video.status) ||
      props.pageData.password != state.password ||
      props.pageData.adultVideo != state.adult
    ) {
      setState({
        video: props.pageData.video,
        relatedVideos: props.pageData.relatedVideos,
        userAdVideo: props.pageData.userAdVideo,
        adminAdVideo: props.pageData.adminAdVideo,
        playlist: props.pageData.playlist,
        playlistVideos: props.pageData.playlistVideos,
        password: props.pageData.password,
        adult: props.pageData.adultVideo,
        logout: false,
      });
    }
  }, [props]);

  useEffect(() => {
    getHeight();
  },[state.width])

  const updateWindowDimensions = () => {
    setState({  width: window.innerWidth });
  };
  const getHeight = () => {
    if ($(".videoPlayer").length && $(".videoPlayerHeight").length) {
      let heightContainer =
        $(".videoPlayerHeight").outerWidth(true) -
        $(".lsVideoTop").height() -
        30;
      let height = heightContainer / 1.77176216 + "px";
      $(".player-wrapper, .video-js").css("height", height);
      $("video, iframe").css("height", height);
    }
  };
  useEffect(() => {
    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    getHeight();
    return () =>
      window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const checkPassword = (model) => {
    if (state.submitting) {
      return;
    }
    const formData = new FormData();
    for (var key in model) {
      formData.append(key, model[key]);
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/videos/password/" + props.pageData.id;
    setState({  submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({
            
            error: response.data.error,
            submitting: false,
          });
        } else {
          setState({  submitting: false, error: null });
          Router.push(`/embed/${props.pageData.id}`);
        }
      })
      .catch((err) => {
        setState({  submitting: false, error: err });
      });
  };
  const mouseOut = () => {
    $(".watermarkLogo").hide();
  };
  const mouseEnter = () => {
    if (state.video && state.video.status == 1) {
      $(".watermarkLogo").show();
    }
  };
  const goLive = () => {
    let url = `${props.pageData.siteURL}/live-streaming/${state.video.custom_url}`;
    window.open(url, "_blank").focus();
  };
  const purchaseClicked = () => {
    let url = `${props.pageData.siteURL}/watch/${state.video.custom_url}`;
    window.open(url, "_blank").focus();
  };

  let validatorUploadImport = [];
  let fieldUploadImport = [];
  validatorUploadImport.push({
    key: "password",
    validations: [
      {
        validator: Validator.required,
        message: "Password is required field",
      },
    ],
  });
  fieldUploadImport.push({ key: "password", label: "", type: "password" });

  let videoImage = state.video ? props.pageData.imageSuffix+state.video.image : "";

  if (state.video) {
    if (
      props.pageData.livestreamingtype == 0 &&
      state.video.mediaserver_stream_id &&
      !state.video.orgImage &&
      state.video.is_livestreaming == 1 &&
      parseInt(
        props.pageData.appSettings["antserver_media_hlssupported"]
      ) == 1
    ) {
      if (props.pageData.liveStreamingCDNServerURL) {
        videoImage = `${props.pageData.liveStreamingCDNServerURL}/${props.pageData.streamingAppName}/previews/${state.video.mediaserver_stream_id}.png`;
      } else
        videoImage = `${props.pageData.liveStreamingServerURL}:5443/${props.pageData.streamingAppName}/previews/${state.video.mediaserver_stream_id}.png`;
    } else if (
      state.video.mediaserver_stream_id &&
      state.video.image &&
      (state.video.image.indexOf(`WebRTCAppEE/previews`) > -1 ||
        state.video.image.indexOf(`LiveApp/previews`) > -1)
    ) {
      if (props.pageData.liveStreamingCDNURL) {
        videoImage = `${
          props.pageData.liveStreamingCDNURL
        }${state.video.image
          .replace(`/LiveApp`, "")
          .replace(`/WebRTCAppEE`, "")}`;
      } else
        videoImage = `${props.pageData.liveStreamingServerURL}:5443${state.video.image}`;
    }
  }
  let userBalance = {};
  userBalance["package"] = {
    price: parseInt(state.video ? state.video.price : 0),
  };
  return state.password ? (
    <Form
      className="form password-mandatory"
      generalError={state.error}
      title={"Enter Password"}
      validators={validatorUploadImport}
      model={fieldUploadImport}
      {...props}
      submitText={state.submitting ? "Submit..." : "Submit"}
      onSubmit={(model) => {
        checkPassword(model);
      }}
    />
  ) : state.adult ? (
    <div className="adult-wrapper">
      {Translate(
        props,
        "This video contains adult content.To view this video, Turn on adult content setting from site footer."
      )}
    </div>
  ) : (
    <React.Fragment>
      {state.video && state.video.approve != 1 ? (
        <div className="generalErrors  approval-pending">
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {Translate(
              props,
              "This video still waiting for admin approval."
            )}
          </div>
        </div>
      ) : null}
      <div className="videoPlayerHeight embed-videos">
        <div
          className="videoPlayer"
          onMouseEnter={mouseEnter}
          onMouseLeave={mouseOut}
        >
          <React.Fragment>
            {state.video &&
            (state.video.type == 10 || state.video.type == 11) &&
            parseFloat(state.video.price) > 0 &&
            !state.video.videoPurchased ? (
              <div key="purchasevideo_purchase">
                <div
                  data-vjs-player
                  className="video_player_cnt player-wrapper"
                  style={{ width: "100%", position: "relative" }}
                >
                  <div
                    className="purchase_video_content video_purchase"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <div className="purchase_video_content_background"></div>
                    <h5>
                      {Translate(
                        props,
                        "This livestreaming is paid, you have to purchase the livestreaming to watch it."
                      )}
                      <br />
                      <br />
                      <button
                        className="btn btn-main"
                        onClick={purchaseClicked}
                      >
                        {Translate(props, "Purchase ") +
                          " " +
                          Currency({ ...props, ...userBalance })}{" "}
                      </button>
                    </h5>
                  </div>
                </div>
              </div>
            ) : state.video.is_livestreaming &&
              state.video.type == 11 ? (
              <MediaStreaming
                watermarkLogoParams={{ target: "_blank" }}
                {...props}
                viewer={state.video.total_viewer}
                height={state.width > 992 ? "500px" : "500px"}
                custom_url={state.video.custom_url}
                streamingId={state.video.mediaserver_stream_id}
                currentTime={props.pageData.currentTime}
                role="audience"
                imageSuffix={props.pageData.imageSuffix}
                video={props.pageData.video}
                {...props.pageData.video}
              />
            ) : state.video.is_livestreaming &&
              state.video.type == 10 ? (
              <StartLiveStreaming
                watermarkLogoParams={{ target: "_blank" }}
                {...props}
                viewer={state.video.total_viewer}
                height={state.width > 992 ? "500px" : "500px"}
                custom_url={state.video.custom_url}
                channel={state.video.channel_name}
                currentTime={props.pageData.currentTime}
                role="audience"
                imageSuffix={props.pageData.imageSuffix}
                video={props.pageData.video}
                {...props.pageData.video}
              />
            ) : props.pageData.appSettings["player_type"] == "element" &&
              ((state.video.type == 3 &&
                state.video.video_location) ||
                (state.video.type == 1 && state.video.code)) &&
              !state.video.scheduled &&
              state.video.approve == 1 ? (
              <MediaElementPlayer
                watermarkLogoParams={{ target: "_blank" }}
                {...props}
                purchaseClicked={purchaseClicked}
                getHeight={getHeight}
                // ended={videoEnd}
                height={state.width > 992 ? "500px" : "500px"}
                userAdVideo={state.userAdVideo}
                adminAdVideo={state.adminAdVideo}
                playlistVideos={state.playlistVideos}
                currentPlaying={state.currentPlaying}
                imageSuffix={props.pageData.imageSuffix}
                video={props.pageData.video}
                {...props.pageData.video}
              />
            ) : ((state.video.type == 3 &&
                state.video.video_location) ||
                (state.video.type == 11 && state.video.code)) &&
              !state.video.scheduled &&
              state.video.approve == 1 ? (
              <Player
                purchaseClicked={purchaseClicked}
                watermarkLogoParams={{ target: "_blank" }}
                {...props}
                getHeight={getHeight}
                // ended={videoEnd}
                height={state.width > 992 ? "500px" : "500px"}
                userAdVideo={state.userAdVideo}
                adminAdVideo={state.adminAdVideo}
                playlistVideos={state.playlistVideos}
                currentPlaying={state.currentPlaying}
                imageSuffix={props.pageData.imageSuffix}
                video={props.pageData.video}
                {...props.pageData.video}
              />
            ) : (!state.video.scheduled ||
                state.video.approve == 1) &&
              state.video.type != 11 ? (
              <OutsidePlayer
                watermarkLogoParams={{ target: "_blank" }}
                {...props}
                liveStreamingURL={props.pageData.liveStreamingURL}
                // ended={videoEnd}
                height={state.width > 992 ? "500px" : "500px"}
                playlistVideos={state.playlistVideos}
                currentPlaying={state.currentPlaying}
                imageSuffix={props.pageData.imageSuffix}
                video={props.pageData.video}
                {...props.pageData.video}
              />
            ) : (
              <div className="scheduled-cnt player-wrapper">
                <img className={"scheduled-video-image"} src={videoImage} />
                {state.video.approve == 1 ? (
                  <div className="stats">
                    <span className="icon">
                      <svg
                        fill="#fff"
                        height="100%"
                        viewBox="0 0 24 24"
                        width="100%"
                      >
                        <path d="M16.94 6.91l-1.41 1.45c.9.94 1.46 2.22 1.46 3.64s-.56 2.71-1.46 3.64l1.41 1.45c1.27-1.31 2.05-3.11 2.05-5.09s-.78-3.79-2.05-5.09zM19.77 4l-1.41 1.45C19.98 7.13 21 9.44 21 12.01c0 2.57-1.01 4.88-2.64 6.54l1.4 1.45c2.01-2.04 3.24-4.87 3.24-7.99 0-3.13-1.23-5.96-3.23-8.01zM7.06 6.91c-1.27 1.3-2.05 3.1-2.05 5.09s.78 3.79 2.05 5.09l1.41-1.45c-.9-.94-1.46-2.22-1.46-3.64s.56-2.71 1.46-3.64L7.06 6.91zM5.64 5.45L4.24 4C2.23 6.04 1 8.87 1 11.99c0 3.13 1.23 5.96 3.23 8.01l1.41-1.45C4.02 16.87 3 14.56 3 11.99s1.01-4.88 2.64-6.54z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </span>
                    <span className="date">
                      <div className="text">
                        {state.video.scheduled
                          ? props.t("Live in ")
                          : null}
                        {state.video.scheduled ? (
                          !state.scheduledEndTime ? (
                            scheduledTimer.join(" ")
                          ) : (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: state.scheduledEndTime,
                              }}
                            ></span>
                          )
                        ) : (
                          <span>{props.t("Start in few seconds")}</span>
                        )}
                      </div>
                      {state.video.scheduled ? (
                        <div className="subitle">
                          {
                            <span
                              dangerouslySetInnerHTML={{
                                __html: Date(
                                  props,
                                  state.video.creation_date,
                                  props.initialLanguage,
                                  "MMMM Do YYYY, hh:mm A",
                                  props.pageData.loggedInUserDetails
                                    ? props.pageData.loggedInUserDetails
                                        .timezone
                                    : props.pageData.defaultTimezone
                                ),
                              }}
                            ></span>
                          }
                        </div>
                      ) : null}
                    </span>
                    {state.video.approve == 1 ||
                    state.video.scheduled ? (
                      <span className="sche-btn">
                        {state.video.canEdit ? (
                          <button onClick={goLive}>
                            <div className="text">
                              {props.t("Go Live Now")}
                            </div>
                          </button>
                        ) : (
                          <button onClick={setReminder}>
                            <div className="icon-bell">
                              {state.video.scheduled_video_id ? (
                                <svg
                                  fill="#fff"
                                  height="24px"
                                  viewBox="0 0 24 24"
                                  width="24px"
                                >
                                  <path d="M7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.02 1.45 3.39 3.77 3.54 6.42zM18 11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2v-5zm-6 11c.14 0 .27-.01.4-.04.65-.14 1.18-.58 1.44-1.18.1-.24.15-.5.15-.78h-4c.01 1.1.9 2 2.01 2z"></path>
                                </svg>
                              ) : (
                                <svg
                                  fill="#fff"
                                  height="24px"
                                  viewBox="0 0 24 24"
                                  width="24px"
                                >
                                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"></path>
                                </svg>
                              )}
                            </div>
                            <div className="text">
                              {state.video.scheduled_video_id
                                ? props.t("Reminder on")
                                : props.t("Set reminder")}
                            </div>
                          </button>
                        )}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </React.Fragment>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Index;
