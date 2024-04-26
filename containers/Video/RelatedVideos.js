import React,{useReducer,useEffect,useRef} from 'react'
import WatchLater from "../WatchLater/Index";
import Link from "../../components/Link/index";
import Image from "../Image/Index";
import ShortNumber from "short-number";
import Translate from "../../components/Translate/Index";
import CensorWord from "../CensoredWords/Index";
import UserTitle from "../User/Title";
import Timeago from "../Common/Timeago";

const Videos = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      videos: props.videos,
      playlist: props.playlist,
      autoPlay:
        typeof window != "undefined" && localStorage.getItem("autoplay")
          ? localStorage.getItem("autoplay") == "false"
            ? "false"
            : "true"
          : "false",
    }
  );
  const stateRef = useRef();
  stateRef.current = state.videos;
  useEffect(() => {
    if (props.videos != state.videos || props.playlist != state.playlist) {
      setState({ videos: props.videos, playlist: props.playlist });
    }
  }, [props]);

  useEffect(() => {
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "videos") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({ localUpdate: true, videos: items });
      }
    });
    props.socket.on("videoDeleted", (socketdata) => {
      let id = socketdata.video_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        items.splice(itemIndex, 1);
        setState({ localUpdate: true, videos: items });
      }
    });
    props.socket.on("removeScheduledVideo", (socketdata) => {
      let id = socketdata.id;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.scheduled_video_id = null;
        }
        items[itemIndex] = changedItem;
        setState({ localUpdate: true, videos: items });
      }
    });
    props.socket.on("scheduledVideo", (socketdata) => {
      let id = socketdata.id;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.scheduled_video_id = 1;
        }
        items[itemIndex] = changedItem;
        setState({ localUpdate: true, videos: items });
      }
    });
    props.socket.on("unwatchlater", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.watchlater_id = null;
        }
        items[itemIndex] = changedItem;
        setState({ localUpdate: true, videos: items });
      }
    });
    props.socket.on("watchlater", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.watchlater_id = 1;
        }
        items[itemIndex] = changedItem;
        setState({ localUpdate: true, videos: items });
      }
    });

    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "videos") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData &&
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          items[itemIndex] = changedItem;
          setState({ localUpdate: true, videos: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "videos") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData &&
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          items[itemIndex] = changedItem;
          setState({ localUpdate: true, videos: items });
        }
      }
    });

    props.socket.on("likeDislike", (socketdata) => {
      let itemId = socketdata.itemId;
      let itemType = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      let removeLike = socketdata.removeLike;
      let removeDislike = socketdata.removeDislike;
      let insertLike = socketdata.insertLike;
      let insertDislike = socketdata.insertDislike;
      if (itemType == "videos") {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          let loggedInUserDetails = {};
          if (props.pageData && props.pageData.loggedInUserDetails) {
            loggedInUserDetails = props.pageData.loggedInUserDetails;
          }
          if (removeLike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = null;
            changedItem["like_count"] = parseInt(changedItem["like_count"]) - 1;
          }
          if (removeDislike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = null;
            changedItem["dislike_count"] =
              parseInt(changedItem["dislike_count"]) - 1;
          }
          if (insertLike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = "like";
            changedItem["like_count"] = parseInt(changedItem["like_count"]) + 1;
          }
          if (insertDislike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = "dislike";
            changedItem["dislike_count"] =
              parseInt(changedItem["dislike_count"]) + 1;
          }
          items[itemIndex] = changedItem;
          setState({ localUpdate: true, videos: items });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    const videos = [...stateRef.current];
    const itemIndex = videos.findIndex((p) => p["video_id"] == item_id);
    return itemIndex;
  };

  const autoPlay = () => {
    localStorage.setItem(
      "autoplay",
      state.autoPlay == "false" ? "true" : "false"
    );
    setState({
      localUpdate: true,
      autoPlay: state.autoPlay == "false" ? "true" : "false",
    });
  };
  const playlistOpen = (video_id, e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      props.openPlaylist({videoId:video_id,status:true})
    }
  };
  if (!state.videos) {
    return null;
  }
  return (
    <React.Fragment>
      {!state.playlist &&
      props.pageData.appSettings["video_autoplay"] == 1 &&
      props.pageData.appSettings["enable_iframely"] == 0 ? (
        <div className="autoPlayWrap">
          <div className="nextVideo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"
              ></path>
            </svg>
            {Translate(props, "Up next")}
          </div>
          <div className="autpplayBtnwrap">
            <div className="form-check form-switch autoplayBtn">
              <input
                type="checkbox"
                className="form-check-input"
                onChange={autoPlay}
                checked={state.autoPlay != "false"}
                id="Autoplay"
              />
              <label className="form-check-label" htmlFor="Autoplay">
                {Translate(props, "Autoplay")}
              </label>
            </div>
          </div>
        </div>
      ) : null}
      {state.videos.map((video) => {
        let videoImage = video.image;

        if (
          props.pageData.livestreamingtype == 0 &&
          video.mediaserver_stream_id &&
          !video.orgImage &&
          video.is_livestreaming == 1 &&
          parseInt(
            props.pageData.appSettings["antserver_media_hlssupported"]
          ) == 1
        ) {
          if (props.pageData.liveStreamingCDNServerURL) {
            videoImage = `${props.pageData.liveStreamingCDNServerURL}/${props.pageData.streamingAppName}/previews/${video.mediaserver_stream_id}.png`;
          } else {
            videoImage = `${props.pageData.liveStreamingServerURL}:5443/${props.pageData.streamingAppName}/previews/${video.mediaserver_stream_id}.png`;
          }
        } else if (
          video.mediaserver_stream_id &&
          video.image &&
          (video.image.indexOf(`LiveApp/previews`) > -1 ||
            video.image.indexOf(`WebRTCAppEE/previews`) > -1)
        ) {
          if (props.pageData.liveStreamingCDNURL) {
            videoImage = `${props.pageData.liveStreamingCDNURL}${video.image
              .replace(`/LiveApp`, "")
              .replace(`/WebRTCAppEE`, "")}`;
          } else
            videoImage = `${props.pageData.liveStreamingServerURL}:5443${video.image}`;
        }
        return (
          <div key={video.video_id} className="sidevideoWrapOutr">
            <div
              key={video.video_id}
              className="ptv_videoList_wrap sidevideoWrap"
            >
              <div className="videoList_thumb">
                <Link
                  href="/watch"
                  customParam={`id=${video.custom_url}`}
                  as={`/watch/${video.custom_url}`}
                >
                  <a>
                    <Image
                      title={CensorWord("fn", props, video.title)}
                      image={videoImage}
                      imageSuffix={props.pageData.imageSuffix}
                      siteURL={props.pageData.siteURL}
                    />
                  </a>
                </Link>
                {video.duration ? (
                  <span className="videoTime">{video.duration}</span>
                ) : null}
                <div className="playBtn">
                  <Link
                    href="/watch"
                    customParam={`id=${video.custom_url}`}
                    as={`/watch/${video.custom_url}`}
                  >
                    <a>
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
                      item={video}
                      id={video.video_id}
                    />
                  ) : null}
                  {props.pageData.appSettings["videos_playlist"] == 1 &&
                  props.pageData.appSettings["enable_playlist"] == 1 &&
                  (!props.pageData.levelPermissions ||
                    props.pageData.levelPermissions["playlist.create"] == 1) ? (
                    <a
                      className="playlist"
                      title={Translate(props, "Save to playlist")}
                      onClick={(e) => playlistOpen(video.video_id, e)}
                      href="#"
                    >
                      <span
                        className="material-icons"
                        data-icon="playlist_add"
                      ></span>
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="videoList_content">
                <div className={`videoTitle`}>
                  <Link
                    href="/watch"
                    customParam={`id=${video.custom_url}`}
                    as={`/watch/${video.custom_url}`}
                  >
                    <a>
                      <h4>{<CensorWord {...props} text={video.title} />}</h4>
                    </a>
                  </Link>
                </div>
                <div className="videoInfo">
                  <span className="username">
                    {props.pageData.appSettings["videos_username"] == 1 ? (
                      <UserTitle className="" {...props} data={video} />
                    ) : null}
                  </span>

                  <span className="videoViewDate">
                    {props.pageData.appSettings["videos_views"] == 1 ? (
                      <span>
                        {`${ShortNumber(
                          video.view_count ? video.view_count : 0
                        )}`}{" "}
                        {props.t("view_count", {
                          count: video.view_count ? video.view_count : 0,
                        })}
                      </span>
                    ) : null}

                    {props.pageData.appSettings["videos_views"] == "1" &&
                    props.pageData.appSettings["videos_datetime"] == "1" ? (
                      <span className="seprater">|</span>
                    ) : null}
                    {props.pageData.appSettings["videos_datetime"] == 1 ? (
                      <span>
                        <Timeago {...props}>{video.creation_date}</Timeago>
                      </span>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </React.Fragment>
  );
};

export default Videos;
