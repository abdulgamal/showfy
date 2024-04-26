import React, { useReducer, useEffect, useRef } from "react";
import Image from "../Image/Index";
import UserTitle from "../User/Title";
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index";
import ShortNumber from "short-number";
import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import WatchLater from "../WatchLater/Index";
import Timeago from "../Common/Timeago";
import axios from "../../axios-orders";
import dynamic from "next/dynamic";
import swal from "sweetalert";
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency";

const Analytics = dynamic(() => import("../Dashboard/StatsAnalytics"), {
  ssr: false,
});
import CensorWord from "../CensoredWords/Index";

const Player = dynamic(() => import("./Player"), {
  ssr: false,
});
const MediaElementPlayer = dynamic(() => import("./MediaElementPlayer"), {
  ssr: false,
});
const OutsidePlayer = dynamic(() => import("./OutsidePlayer"), {
  ssr: false,
});

const Item = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      video: props.video,
      hover: false,
    }
  );
  useEffect(() => {
    if (state.video != props.video || state.hover != props.hover) {
      setState({ video: props.video });
    }
  }, [props]);

  const playlistOpen = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      props.openPlaylist({videoId:state.video.video_id,status:true})
    }
  };
  const deleteVideo = (e) => {
    e.preventDefault();
    let message = !props.contentType
      ? Translate(
          props,
          "Once deleted, you will have to again add the video."
        )
      : Translate(
          props,
          "Once deleted, you will not be able to recover this!"
        );
    swal({
      title: Translate(props, "Are you sure?"),
      text: message,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();

        let url = "/channels/delete-video";
        formData.append("video_id", state.video.video_id);
        if (!props.contentType) {
          formData.append("channel_id", props.channel_id);
        } else {
          url = "/videos/delete";
        }
        axios
          .post(url, formData)
          .then((response) => {})
          .catch((err) => {
            swal(
              "Error",
              Translate(
                props,
                "Something went wrong, please try again later"
              ),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  const analytics = (e) => {
    e.preventDefault();
    setState({  analytics: true });
  };
  const closePopup = (e) => {
    setState({  analytics: false });
  };
  const hoverOn = () => {
    if (
      !props.canDelete &&
      !props.canEdit &&
      state.width > 992 &&
      props.pageData.appSettings["video_preview"] == 1 &&
      state.video.is_livestreaming != "1"
    ) {
      if (
        !state.video.password &&
        (!state.video.adult ||
          (state.video.adult && props.pageData.adultAllowed))
      )
        setState({  hover: true });
    }
  };
  const setReminder = (e) => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
      return;
    }
    e.preventDefault();
    const formData = new FormData();
    let url = "/videos/reminder";
    formData.append("video_id", state.video.video_id);
    axios
      .post(url, formData)
      .then((response) => {})
      .catch((err) => {});
    //delete
  };
  const hoverOff = () => {
    setState({  hover: false });
  };
  let playlist_id = null;
  let stringId = "";
  let customParams = "";
  if (props.playlist_id) {
    playlist_id = props.playlist_id;
    stringId = "?list=" + playlist_id;
    customParams = "&list=" + playlist_id;
  }

  let analyticsData = null;
  if (state.analytics) {
    analyticsData = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt" style={{ maxWidth: "60%" }}>
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Analytics")}</h2>
                <a onClick={closePopup} className="_close">
                  <i></i>
                </a>
              </div>
              <Analytics
                {...props}
                id={state.video.video_id}
                type="videos"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  let videoImage = state.video.image;

  if (
    props.pageData.livestreamingtype == 0 &&
    state.video.mediaserver_stream_id &&
    !state.video.orgImage &&
    state.video.is_livestreaming == 1 &&
    parseInt(props.pageData.appSettings["antserver_media_hlssupported"]) ==
      1
  ) {
    if (props.pageData.liveStreamingCDNServerURL) {
      videoImage = `${props.pageData.liveStreamingCDNServerURL}/${props.pageData.streamingAppName}/previews/${state.video.mediaserver_stream_id}.png`;
    } else
      videoImage = `${props.pageData.liveStreamingServerURL}:5443/${props.pageData.streamingAppName}/previews/${state.video.mediaserver_stream_id}.png`;
  } else if (
    state.video.mediaserver_stream_id &&
    state.video.image &&
    (state.video.image.indexOf(`LiveApp/previews`) > -1 ||
      state.video.image.indexOf(`WebRTCAppEE/previews`) > -1)
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

  return (
    <React.Fragment>
      {analyticsData}
      {props.pageData.appSettings.video_advanced_grid != 1 ? (
        <div className="ptv_videoList_wrap">
          <div
            className="videoList_thumb"
            onMouseEnter={() => hoverOn()}
            onMouseLeave={() => hoverOff()}
          >
            <Link
              href="/watch"
              onClick={props.closePopUp}
              customParam={`id=${state.video.custom_url}${customParams}`}
              as={`/watch/${state.video.custom_url}${stringId}`}
            >
              <a>
                {state.hover &&
                !state.video.purchasePackage &&
                props.pageData.appSettings["player_type"] == "element" &&
                (state.video.type == 3 || state.video.type == 1) ? (
                  <MediaElementPlayer
                    showControls={false}
                    updateTime={false}
                    muted={true}
                    {...props}
                    height="188px"
                    imageSuffix={props.pageData.imageSuffix}
                    video={state.video}
                    {...state.video}
                  />
                ) : state.hover &&
                  !state.video.purchasePackage &&
                  state.video.type == 3 ? (
                  <Player
                    showControls={false}
                    updateTime={false}
                    muted={true}
                    {...props}
                    height="188px"
                    imageSuffix={props.pageData.imageSuffix}
                    video={state.video}
                    {...state.video}
                  />
                ) : state.hover && !state.video.purchasePackage ? (
                  <OutsidePlayer
                    muted={true}
                    updateTime={false}
                    showControls={false}
                    {...props}
                    height="188px"
                    imageSuffix={props.pageData.imageSuffix}
                    video={state.video}
                    {...state.video}
                  />
                ) : (
                  <Image
                    title={CensorWord("fn", props, state.video.title)}
                    image={videoImage}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                )}
              </a>
            </Link>
            {state.video.duration ? (
              <span className="videoTime">{state.video.duration}</span>
            ) : null}
            {state.video.is_livestreaming &&
            (state.video.channel_name ||
              state.video.mediaserver_stream_id) &&
            !state.video.scheduled ? (
              <span className="live_now_cnt">
                {Translate(props, "LIVE NOW")}
              </span>
            ) : null}
            {
              state.video && state.video.price > 0 ?
              <span className="live_now_cnt" style={{
                top:"86px"
              }}>
                {Currency({
                          ...props,
                          ...{
                            package:{
                              price: parseFloat(state.video ? state.video.price : 0)
                            }
                          },
                        })
                }
              </span>
              : null
            }
            {
              state.video && state.video.view_privacy.indexOf("package_") > -1 ?
              <span className="live_now_cnt" style={{top:"114px"}}>
                {Translate(props, "Subscription Plan")}
              </span>
              : null
            }
            <div className="playBtn">
              <Link
                href="/watch"
                customParam={`id=${state.video.custom_url}${customParams}`}
                as={`/watch/${state.video.custom_url}${stringId}`}
              >
                <a onClick={props.closePopUp}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    width="36px"
                    height="36px"
                    className="playicon"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </a>
              </Link>
            </div>
            <div className="btnBoxHover">
              {props.pageData.appSettings["videos_watchlater"] == 1 ? (
                <WatchLater
                  className="watchlater"
                  icon={true}
                  {...props}
                  item={state.video}
                  id={state.video.video_id}
                />
              ) : null}
              {props.pageData.appSettings["videos_playlist"] == 1 &&
              props.pageData.appSettings["enable_playlist"] == 1 &&
              (!props.pageData.levelPermissions ||
                props.pageData.levelPermissions["playlist.create"] == 1) &&
              !playlist_id ? (
                <a
                  className="playlist"
                  title={Translate(props, "Save to playlist")}
                  onClick={playlistOpen}
                  href="#"
                >
                  <span
                    className="material-icons"
                    data-icon="playlist_add"
                  ></span>
                </a>
              ) : null}
            </div>
            <div className="labelBtn">
              {props.pageData.appSettings["videos_featuredlabel"] == 1 &&
              props.pageData.appSettings["video_featured"] == 1 &&
              state.video.is_featured == 1 ? (
                <span
                  className="lbl-Featured"
                  title={Translate(props, "Featured Video")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-award"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </span>
              ) : null}
              {props.pageData.appSettings["videos_sponsoredLabel"] == 1 &&
              props.pageData.appSettings["video_sponsored"] == 1 &&
              state.video.is_sponsored == 1 ? (
                <span
                  className="lbl-Sponsored"
                  title={Translate(props, "Sponsored Video")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-award"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </span>
              ) : null}
              {props.pageData.appSettings["videos_hotLabel"] == 1 &&
              props.pageData.appSettings["video_hot"] == 1 &&
              state.video.is_hot == 1 ? (
                <span
                  className="lbl-Hot"
                  title={Translate(props, "Hot Video")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-award"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </span>
              ) : null}
            </div>
          </div>
          <div className="videoList_content">
            <div
              className={`videoTitle${
                props.canDelete ||
                props.canEdit ||
                props.pageData.appSettings["videos_share"] == 1
                  ? " edit-video-btn"
                  : ""
              }`}
            >
              <Link
                href="/watch"
                customParam={`id=${state.video.custom_url}${customParams}`}
                as={`/watch/${state.video.custom_url}${stringId}`}
              >
                <a onClick={props.closePopUp}>
                  <h4>
                    <CensorWord {...props} text={state.video.title} />
                  </h4>
                </a>
              </Link>

              {props.canDelete ||
              props.canEdit ||
              props.pageData.appSettings["videos_share"] == 1 ? (
                <div className="dropdown TitleRightDropdown">
                  <a href="#" data-bs-toggle="dropdown">
                    <span
                      className="material-icons"
                      data-icon="more_vert"
                    ></span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right edit-options">
                    {props.canEdit ? (
                      state.video.scheduled ||
                      (state.video.approve == 0 &&
                        state.video.type == 11) ? (
                        <li>
                          <Link
                            href="/create-livestreaming"
                            customParam={`id=${state.video.custom_url}`}
                            as={`/live-streaming/${state.video.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        </li>
                      ) : (
                        <li>
                          <Link
                            href="/create-video"
                            customParam={`id=${state.video.custom_url}`}
                            as={`/create-video/${state.video.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        </li>
                      )
                    ) : null}
                    {props.canDelete ? (
                      <li>
                        <a
                          className="addPlaylist addDelete"
                          title={Translate(props, "Delete")}
                          href="#"
                          onClick={deleteVideo}
                        >
                          <span
                            className="material-icons"
                            data-icon="delete"
                          ></span>
                          {Translate(props, "Delete")}
                        </a>
                      </li>
                    ) : null}
                    {props.deletePlaytistVideo ? (
                      <li>
                        <a
                          className="addPlaylist addDelete"
                          title={Translate(props, "Delete")}
                          href="#"
                          onClick={(e) =>
                            props.deletePlaytistVideo(
                              e,
                              state.video.video_id
                            )
                          }
                        >
                          <span
                            className="material-icons"
                            data-icon="delete"
                          ></span>
                          {Translate(props, "Delete")}
                        </a>
                      </li>
                    ) : null}
                    {props.canEdit ? (
                      <li>
                        <a
                          href="#"
                          className="addPlaylist addEdit"
                          onClick={analytics}
                          title={Translate(props, "Analytics")}
                        >
                          <span
                            className="material-icons"
                            data-icon="show_chart"
                          ></span>
                          {Translate(props, "Analytics")}
                        </a>
                      </li>
                    ) : null}
                    {props.pageData.appSettings["videos_share"] == 1 ? (
                      <SocialShare
                        {...props}
                        buttonHeightWidth="30"
                        tags={state.video.tags}
                        url={`/watch/${state.video.custom_url}`}
                        title={CensorWord(
                          "fn",
                          props,
                          state.video.title
                        )}
                        imageSuffix={props.pageData.imageSuffix}
                        media={state.video.image}
                      />
                    ) : null}
                    {props.pageData.appSettings["videos_playlist"] == 1 &&
                    props.pageData.appSettings["enable_playlist"] == 1 &&
                    (!props.pageData.levelPermissions ||
                      props.pageData.levelPermissions["playlist.create"] ==
                        1) &&
                    !playlist_id ? (
                      <li>
                        <a
                          className="playlist"
                          title={Translate(props, "Save to playlist")}
                          onClick={playlistOpen}
                          href="#"
                        >
                          <span
                            className="material-icons"
                            data-icon="playlist_add"
                          ></span>
                          {Translate(props, "Save to playlist")}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="videoInfo">
              <span className="username">
                {props.pageData.appSettings["videos_username"] == 1 ? (
                  <UserTitle
                    className=""
                    onClick={props.closePopUp}
                    {...props}
                    data={state.video}
                  />
                ) : null}
              </span>

              <span className="videoViewDate">
                {props.pageData.appSettings["videos_views"] == 1 ? (
                  <span>
                    {`${ShortNumber(
                      state.video.view_count
                        ? state.video.view_count
                        : 0
                    )}`}{" "}
                    {props.t("view_count", {
                      count: state.video.view_count
                        ? state.video.view_count
                        : 0,
                    })}
                  </span>
                ) : null}

                {props.pageData.appSettings["videos_views"] == "1" &&
                props.pageData.appSettings["videos_datetime"] == "1" ? (
                  <span className="seprater">|</span>
                ) : null}
                {props.pageData.appSettings["videos_datetime"] == 1 ? (
                  <span>
                    <Timeago {...props}>
                      {state.video.creation_date}
                    </Timeago>
                  </span>
                ) : null}
              </span>
            </div>
            {state.video.is_livestreaming == 1 &&
            state.video.channel_name ? (
              <div className="videoInfo">
                <span className="videoViewDate">
                  <span>
                    {`${ShortNumber(
                      state.video.total_viewer
                        ? state.video.total_viewer
                        : 0
                    )}`}{" "}
                    {props.t("viewer_watching_count", {
                      count: state.video.total_viewer
                        ? state.video.total_viewer
                        : 0,
                    })}
                  </span>
                </span>
              </div>
            ) : null}
            <div className="LikeDislikeWrap">
              <ul className="LikeDislikeList">
                {props.pageData.appSettings["videos_like"] == 1 ? (
                  <li>
                    <Like
                      icon={true}
                      {...props}
                      like_count={state.video.like_count}
                      item={state.video}
                      type="video"
                      id={state.video.video_id}
                    />
                    {"  "}
                  </li>
                ) : null}
                {props.pageData.appSettings["videos_dislike"] == 1 ? (
                  <li>
                    <Dislike
                      icon={true}
                      {...props}
                      dislike_count={state.video.dislike_count}
                      item={state.video}
                      type="video"
                      id={state.video.video_id}
                    />
                    {"  "}
                  </li>
                ) : null}
                {props.pageData.appSettings["videos_favourite"] == 1 ? (
                  <li>
                    <Favourite
                      icon={true}
                      {...props}
                      favourite_count={state.video.favourite_count}
                      item={state.video}
                      type="video"
                      id={state.video.video_id}
                    />
                    {"  "}
                  </li>
                ) : null}
              </ul>
            </div>
            {state.video.scheduled &&
            (!props.pageData.loggedInUserDetails ||
              state.video.owner_id !=
                props.pageData.loggedInUserDetails.user_id) ? (
              <div className="scheduled-reminder">
                <a
                  onClick={setReminder}
                  className="set-reminder"
                  href="#"
                  title={props.t(
                    "Receive a reminder when this event is scheduled to start."
                  )}
                >
                  {state.video.scheduled_video_id
                    ? props.t("REMINDER ON")
                    : props.t("SET REMINDER")}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="ThumbBox-wrap video-container">
          <Link
            href="/watch"
            onClick={props.closePopUp}
            customParam={`id=${state.video.custom_url}${customParams}`}
            as={`/watch/${state.video.custom_url}${stringId}`}
          >
            <a className="ThumbBox-link" onClick={props.closePopUp}>
              <div className="ThumbBox-coverImg">
                <span>
                  <Image
                    className={state.video.type == 1 ? "yt" : ""}
                    title={CensorWord("fn", props, state.video.title)}
                    image={videoImage}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                </span>
              </div>
            </a>
          </Link>
          {state.video.duration ? (
            <div className="VdoDuration show-gradient">
              {state.video.duration}
            </div>
          ) : null}
          {state.video.is_livestreaming &&
          (state.video.channel_name ||
            state.video.mediaserver_stream_id) &&
          !state.video.scheduled ? (
            <span className="videoTime live_now_cnt">
              {Translate(props, "LIVE NOW")}
            </span>
          ) : null}
          {
            state.video && state.video.price > 0 ?
            <span className="live_now_cnt" style={{
              top:"86px"
            }}>
              {Currency({
                        ...props,
                        ...{
                          package:{
                            price: parseFloat(state.video ? state.video.price : 0)
                          }
                        },
                      })
              }
            </span>
            : null
          }
          {
            state.video && state.video.view_privacy.indexOf("package_") > -1 ?
            <span className="live_now_cnt" style={{top:"114px"}}>
              {Translate(props, "Subscription Plan")}
            </span>
            : null
          }
          <div className="labelBtn">
            {props.pageData.appSettings["videos_featuredlabel"] == 1 &&
            props.pageData.appSettings["video_featured"] == 1 &&
            state.video.is_featured == 1 ? (
              <span
                className="lbl-Featured"
                title={Translate(props, "Featured Video")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-award"
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            ) : null}
            {props.pageData.appSettings["videos_sponsoredLabel"] == 1 &&
            props.pageData.appSettings["video_sponsored"] == 1 &&
            state.video.is_sponsored == 1 ? (
              <span
                className="lbl-Sponsored"
                title={Translate(props, "Sponsored Video")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-award"
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            ) : null}
            {props.pageData.appSettings["videos_hotLabel"] == 1 &&
            props.pageData.appSettings["video_hot"] == 1 &&
            state.video.is_hot == 1 ? (
              <span
                className="lbl-Hot"
                title={Translate(props, "Hot Video")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-award"
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            ) : null}
          </div>
          <div className="btnPlayListSave">
            {props.pageData.appSettings["videos_watchlater"] == 1 ? (
              <WatchLater
                className="btnPlayListSave-btn"
                icon={true}
                {...props}
                item={state.video}
                id={state.video.video_id}
              />
            ) : null}
            {props.pageData.appSettings["videos_playlist"] == 1 &&
            props.pageData.appSettings["enable_playlist"] == 1 &&
            (!props.pageData.levelPermissions ||
              props.pageData.levelPermissions["playlist.create"] == 1) &&
            !playlist_id ? (
              <a
                className="btnPlayListSave-btn"
                title={Translate(props, "Save to playlist")}
                onClick={playlistOpen}
                href="#"
              >
                <span
                  className="material-icons"
                  data-icon="playlist_add"
                ></span>
              </a>
            ) : null}
          </div>
          <div className="ThumbBox-Title hide-on-expand">
            <div className="PlayIcon">
              <span className="material-icons-outlined">play_arrow</span>
            </div>
            <div className="title ellipsize2Line">
              <h4 className="m-0">
                <CensorWord {...props} text={state.video.title} />
              </h4>
            </div>
          </div>
          <div className="ItemDetails">
            <div className="d-flex justify-content-between VdoTitle ">
              <Link
                href="/watch"
                customParam={`id=${state.video.custom_url}${customParams}`}
                as={`/watch/${state.video.custom_url}${stringId}`}
              >
                <a
                  className="ThumbBox-Title-expand d-flex align-items-center"
                  onClick={props.closePopUp}
                >
                  <div className="PlayIcon">
                    <span className="material-icons-outlined">play_arrow</span>
                  </div>
                  <div className="title ellipsize2Line">
                    <h4 className="m-0">
                      <CensorWord
                        {...props}
                        text={state.video.title}
                      />
                    </h4>
                  </div>
                </a>
              </Link>
              {props.canDelete ||
              props.canEdit ||
              props.pageData.appSettings["videos_share"] == 1 ? (
                <div className="moreOptions">
                  <a
                    href="#"
                    className="icon-Dvert"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="material-icons">more_vert</span>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start moreOptionsShow">
                    {props.canEdit ? (
                      state.video.scheduled ||
                      props.deletePlaytistVideo ||
                      (state.video.approve == 0 &&
                        state.video.type == 11) ? (
                        <li>
                          <Link
                            href="/create-livestreaming"
                            customParam={`id=${state.video.custom_url}`}
                            as={`/live-streaming/${state.video.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        </li>
                      ) : (
                        <li>
                          <Link
                            href="/create-video"
                            customParam={`id=${state.video.custom_url}`}
                            as={`/create-video/${state.video.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        </li>
                      )
                    ) : null}
                    {props.deletePlaytistVideo ? (
                      <li>
                        <a
                          className="addPlaylist addDelete"
                          title={Translate(props, "Delete")}
                          href="#"
                          onClick={(e) =>
                            props.deletePlaytistVideo(
                              e,
                              state.video.video_id
                            )
                          }
                        >
                          <span
                            className="material-icons"
                            data-icon="delete"
                          ></span>
                          {Translate(props, "Delete")}
                        </a>
                      </li>
                    ) : null}
                    {props.canDelete ? (
                      <li>
                        <a
                          className="addPlaylist addDelete"
                          title={Translate(props, "Delete")}
                          href="#"
                          onClick={deleteVideo}
                        >
                          <span
                            className="material-icons"
                            data-icon="delete"
                          ></span>
                          {Translate(props, "Delete")}
                        </a>
                      </li>
                    ) : null}
                    {props.canEdit ? (
                      <li>
                        <a
                          href="#"
                          className="addPlaylist addEdit"
                          onClick={analytics}
                          title={Translate(props, "Analytics")}
                        >
                          <span
                            className="material-icons"
                            data-icon="show_chart"
                          ></span>
                          {Translate(props, "Analytics")}
                        </a>
                      </li>
                    ) : null}
                    {props.pageData.appSettings["videos_share"] == 1 ? (
                      <SocialShare
                        {...props}
                        buttonHeightWidth="30"
                        tags={state.video.tags}
                        url={`/watch/${state.video.custom_url}`}
                        title={CensorWord(
                          "fn",
                          props,
                          state.video.title
                        )}
                        imageSuffix={props.pageData.imageSuffix}
                        media={state.video.image}
                      />
                    ) : null}
                    {props.pageData.appSettings["videos_playlist"] == 1 &&
                    props.pageData.appSettings["enable_playlist"] == 1 &&
                    (!props.pageData.levelPermissions ||
                      props.pageData.levelPermissions["playlist.create"] ==
                        1) &&
                    !playlist_id ? (
                      <li>
                        <a
                          className="playlist"
                          title={Translate(props, "Save to playlist")}
                          onClick={playlistOpen}
                          href="#"
                        >
                          <span
                            className="material-icons"
                            data-icon="playlist_add"
                          ></span>
                          {Translate(props, "Save to playlist")}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="Vdoinfo d-flex flex-column">
              {/* {
                                        props.pageData.appSettings["videos_username"] == 1  ? 
                                            <UserTitle className="UserName d-inline-flex align-items-center"  onClick={props.closePopUp} {...props} data={state.video} />
                                        : null
                                        } */}
              <span className="videoViewDate">
                {props.pageData.appSettings["videos_views"] == 1 ? (
                  <span>
                    {`${ShortNumber(
                      state.video.view_count
                        ? state.video.view_count
                        : 0
                    )}`}{" "}
                    {props.t("view_count", {
                      count: state.video.view_count
                        ? state.video.view_count
                        : 0,
                    })}
                  </span>
                ) : null}
                {props.pageData.appSettings["videos_views"] == "1" &&
                props.pageData.appSettings["videos_datetime"] == "1" ? (
                  <span className="seprater">|</span>
                ) : null}
                {props.pageData.appSettings["videos_datetime"] == 1 ? (
                  <span>
                    <Timeago {...props}>
                      {state.video.creation_date}
                    </Timeago>
                  </span>
                ) : null}
                {state.video.is_livestreaming == 1 &&
                state.video.channel_name ? (
                  <div className="videoInfo">
                    <span className="videoViewDate">
                      <span>
                        {`${ShortNumber(
                          state.video.total_viewer
                            ? state.video.total_viewer
                            : 0
                        )}`}{" "}
                        {props.t("viewer_watching_count", {
                          count: state.video.total_viewer
                            ? state.video.total_viewer
                            : 0,
                        })}
                      </span>
                    </span>
                  </div>
                ) : null}
              </span>
            </div>
            <div className="likeDislike-Wrap mt-2">
              <ul className="likeDislike-List">
                {props.pageData.appSettings["videos_like"] == 1 ? (
                  <li>
                    <Like
                      icon={true}
                      {...props}
                      like_count={state.video.like_count}
                      item={state.video}
                      type="video"
                      id={state.video.video_id}
                    />
                    {"  "}
                  </li>
                ) : null}
                {props.pageData.appSettings["videos_dislike"] == 1 ? (
                  <li>
                    <Dislike
                      icon={true}
                      {...props}
                      dislike_count={state.video.dislike_count}
                      item={state.video}
                      type="video"
                      id={state.video.video_id}
                    />
                    {"  "}
                  </li>
                ) : null}
                {props.pageData.appSettings["videos_favourite"] == 1 ? (
                  <li>
                    <Favourite
                      icon={true}
                      {...props}
                      favourite_count={state.video.favourite_count}
                      item={state.video}
                      type="video"
                      id={state.video.video_id}
                    />
                    {"  "}
                  </li>
                ) : null}
              </ul>
            </div>
            {state.video.scheduled &&
            (!props.pageData.loggedInUserDetails ||
              state.video.owner_id !=
                props.pageData.loggedInUserDetails.user_id) ? (
              <div className="cn-subscribe">
                <a
                  onClick={setReminder}
                  className="set-reminder"
                  href="#"
                  title={props.t(
                    "Receive a reminder when this event is scheduled to start."
                  )}
                >
                  {state.video.scheduled_video_id
                    ? props.t("REMINDER ON")
                    : props.t("SET REMINDER")}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Item;
