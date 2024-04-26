import React, { useReducer, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Player from "../Video/Player";
import OutsidePlayer from "../Video/OutsidePlayer";
import Link from "../../components/Link/index";
import CensorWord from "../CensoredWords/Index";
import WatchLater from "../WatchLater/Index";
import Image from "../Image/Index";

const MiniPlayer = (props) => {
  let miniPlayerRedux = useSelector((state) => {
    return state.miniplayer;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      relatedVideos: miniPlayerRedux.relatedVideos ?? [],
      playlistVideos: miniPlayerRedux.playlistVideos ?? [],
      currentVideoTime: miniPlayerRedux.currentVideoTime,
      video: miniPlayerRedux.currentVideo,
      arrow: "up",
      message: miniPlayerRedux.deleteMessage,
      title: miniPlayerRedux.deleteTitle,
      liveStreamingURL: miniPlayerRedux.liveStreamingURL,
      width: props.isMobile ? props.isMobile : 993,
      minimizePlayer: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.playlistVideos;
  useEffect(() => {
    if (
      miniPlayerRedux.relatedVideos != state.relatedVideos ||
      miniPlayerRedux.playlistVideos != state.playlistVideos ||
      miniPlayerRedux.currentVideoTime != state.currentVideoTime ||
      miniPlayerRedux.currentVideo != state.currentVideo
    ) {
      setState({
        message: miniPlayerRedux.deleteMessage,
        title: miniPlayerRedux.deleteTitle,
        currentVideoTime: miniPlayerRedux.currentVideoTime,
        relatedVideos: miniPlayerRedux.relatedVideos ?? [],
        playlistVideos: miniPlayerRedux.playlistVideos ?? [],
        video: miniPlayerRedux.currentVideo,
        liveStreamingURL: miniPlayerRedux.liveStreamingURL,
      });
    }
  }, [miniPlayerRedux]);
  useEffect(() => {
    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    props.socket.on("unwatchlater", (socketdata) => {
      if (stateRef.current.length) {
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
          setState({  playlistVideos: items });
        }
      }
    });
    props.socket.on("watchlater", (socketdata) => {
      if (stateRef.current.length) {
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
          setState({  playlistVideos: items });
        }
      }
    });
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);
  const updateWindowDimensions = () => {
    setState({  width: window.innerWidth });
  };

  const closePlayer = () => {
    props.updatePlayerData({relatedVideos:[],playlistVideos:[],currentVideo:null,deleteMessage:"",deleteTitle:"",liveStreamingURL:props.pageData.liveStreamingURL})

    return;
    // swal({
    //     title: state.title,
    //     text: state.message,
    //     icon: "warning",
    //     buttons: true,
    //     dangerMode: true,
    // })
    // .then((willDelete) => {
    //     if (willDelete) {
    //         props.updatePlayerData([],[],null,"","")
    //     } else {

    //     }
    // });
  };
  const getItemIndex = (item_id) => {
    const videos = [...stateRef.current];
    const itemIndex = videos.findIndex((p) => p["video_id"] == item_id);
    return itemIndex;
  };
  const getRelatedVideosIndex = (item_id) => {
    const videos = [...state.relatedVideos];
    const itemIndex = videos.findIndex((p) => p["video_id"] == item_id);
    return itemIndex;
  };
  const ended = () => {
    let video_id = state.video.video_id;
    let itemIndex = 0;
    if (state.playlistVideos.length) {
      itemIndex = getItemIndex(video_id);
      if (itemIndex > -1) {
        const items = [...state.playlistVideos];
        if (itemIndex + 2 <= state.playlistVideos.length) {
          itemIndex = itemIndex + 1;
        } else {
          itemIndex = 0;
        }
        setState({
          
          video: { ...items[itemIndex], currentVideoTime: null },
        });
      }
    } else if (state.relatedVideos.length) {
      itemIndex = getRelatedVideosIndex(video_id);
      //first video played
      if (itemIndex == -1) {
        itemIndex = 0;
      }
      if (itemIndex > -1) {
        const items = [...state.relatedVideos];
        if (itemIndex + 2 <= state.relatedVideos.length) {
          itemIndex = itemIndex + 1;
        } else {
          itemIndex = 0;
        }
        setState({
          
          video: { ...items[itemIndex] },
          currentVideoTime: null,
        });
      }
    }
  };
  const videoChange = (video_id, e) => {
    e.preventDefault();
    if (video_id != state.video.video_id) {
      let itemIndex = getItemIndex(video_id);
      if (itemIndex > -1) {
        const items = [...state.playlistVideos];
        setState({
          
          video: { ...items[itemIndex] },
          currentVideoTime: null,
        });
      }
    }
  };
  const openPlaylist = (e) => {
    e.preventDefault();
    setState({  arrow: state.arrow == "up" ? "down" : "up" });
  };
  const minimizePlayer = (e) => {
    e.preventDefault();
    setState({  minimizePlayer: true });
  };
  const maximizePlayer = (e) => {
    e.preventDefault();
    setState({  minimizePlayer: false });
  };
  if (
    !state.relatedVideos.length &&
    !state.playlistVideos.length &&
    !state.video
  ) {
    return null;
  }
  return (
    <React.Fragment>
      {state.minimizePlayer ? (
        <a
          id="play-video"
          className="video-play-button"
          onClick={maximizePlayer}
          href="#"
        >
          <span></span>
        </a>
      ) : null}
      <div
        className={`minimizeBox${props.pageData && props.pageData.loggedInUserDetails ? " logged-in-user" : ""}`}
        style={{ display: state.minimizePlayer ? "none" : "block" }}
      >
        <span
          className="close-mini-player"
          title="Close Player"
          onClick={closePlayer}
        >
          <span className="material-icons" data-icon="clear"></span>
        </span>
        <span
          className="minimizePlayer"
          title="Minimize Player"
          onClick={minimizePlayer}
        >
          <span className="material-icons" data-icon="remove"></span>
        </span>
        <div className="content">
          {state.video.type == 3 ? (
            <Player
              updateTime={false}
              miniplayer={true}
              {...props}
              currentVideoTime={state.currentVideoTime}
              ended={ended}
              height={state.width > 992 ? "154px" : "90px"}
              imageSuffix={props.pageData.imageSuffix}
              video={state.video}
              {...state.video}
            />
          ) : (
            <OutsidePlayer
              liveStreamingURL={state.liveStreamingURL}
              updateTime={false}
              miniplayer={true}
              {...props}
              currentVideoTime={state.currentVideoTime}
              ended={ended}
              height={state.width > 992 ? "154px" : "90px"}
              imageSuffix={props.pageData.imageSuffix}
              video={state.video}
              {...state.video}
            />
          )}
          <div className="footer">
            <div className="PlayPause">
              <Link
                href="/watch"
                customParam={`id=${state.video.custom_url}`}
                as={`/watch/${state.video.custom_url}`}
              >
                <a>{<CensorWord {...props} text={state.video.title} />}</a>
              </Link>
            </div>
            {state.playlistVideos.length && state.width > 992 ? (
              <div className="maxClose">
                <a href="#" onClick={openPlaylist}>
                  <i className={`fas fa-angle-${state.arrow}`}></i>
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {state.playlistVideos.length &&
        state.arrow == "down" &&
        state.width > 992 ? (
          <div
            className="PlaylistSidebar miniplayer"
            style={{ border: "none", marginBottom: "0px" }}
          >
            <div className="playlist_videos_list">
              <div className="playlist_videos">
                {state.playlistVideos.map((video, index) => {
                  return (
                    <div
                      className="sidevideoWrap playlistscroll clearfix"
                      key={index}
                    >
                      <div className="videoImg">
                        <a
                          href={`/watch/${video.custom_url}`}
                          onClick={(e) => videoChange(video.video_id, e)}
                        >
                          <Image
                            title={video.title}
                            image={video.image}
                            imageSuffix={props.pageData.imageSuffix}
                            siteURL={props.pageData.siteURL}
                          />
                        </a>
                        <span className="time">
                          {video.duration ? video.duration : null}
                        </span>
                        <span className="watchPlayBtn">
                          <WatchLater
                            className="watchLater"
                            icon={true}
                            {...props}
                            {...video}
                            item={video}
                            id={video.video_id}
                          />
                          <a
                            href={`/watch/${video.custom_url}`}
                            onClick={(e) => videoChange(video.video_id, e)}
                          >
                            {state.video.video_id != video.video_id ? (
                              <span
                                className="material-icons"
                                data-icon="play_arrow"
                              ></span>
                            ) : (
                              <span
                                className="material-icons"
                                data-icon="pause"
                              ></span>
                            )}
                          </a>
                        </span>
                      </div>
                      <div className="sideVideoContent">
                        <a
                          className="videoTitle"
                          onClick={(e) => videoChange(video.video_id, e)}
                          href={`/watch/${video.custom_url}`}
                        >
                          {<CensorWord {...props} text={video.title} />}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
};

export default MiniPlayer;
