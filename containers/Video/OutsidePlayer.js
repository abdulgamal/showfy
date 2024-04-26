import React, { useReducer, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import ReactPlayer from "react-player";
import config from "../../config";

const OutsidePlayer = (props) => {
  let currentPlayTimeRedux = useSelector((state) => {
    return state.miniplayer.currentVideoTime;
  });
  const player = useRef(null);
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      playing: false,
      video: props.video,
      currentVideoTime: currentPlayTimeRedux,
      showOverlay: false,
    }
  );
  useEffect(() => {
    if (props.video.custom_url != state.video.custom_url) {
      setState({
        video: props.video
      });
    }
  }, [props]);
  useEffect(() => {
    setState({currentVideoTime:currentPlayTimeRedux})
  },[currentPlayTimeRedux])
  useEffect(() => {
    window.iframely && iframely.load();
    if (state.currentVideoTime && player.current) {
      player.current.seekTo(
        state.currentVideoTime ? state.currentVideoTime : 0
      );
    }
  }, [state.video]);

  const handleEnded = () => {
    if (props.ended) {
      props.ended(props.playType);
    }
  };
  const onProgress = (stats) => {
    if (typeof props.updateTime == "undefined") {
      props.upatePlayerTime(stats.playedSeconds);
    }
  };
  const changePlayPause = () => {
    setState({  playing: !state.playing });
  };
  const handleOnReady = () => {
    if (props.getHeight) {
      props.getHeight();
    }
    setTimeout(() => setState({  playing: true }), 1);
  };

  const getIframelyHtml = () => {
    if (props.type != 20) {
      return;
    }
    return { __html: state.video.code };
  };
  const getURL = (text) => {
    var src = text.split("src=");
    if (src && src.length > 1) {
      let s = src[1].split(/[ >]/)[0];
      return s;
    } else {
      return text;
    }
  };
  const updatePlayCount = () => {
    props.updatePlayCount(state.video.movie_video_id);
  };
  if (typeof window == "undefined") return null;
  let url = "";

  if (state.video.movie_video_id) {
    updatePlayCount();
    let code = state.video.code;
    let urlEmbed = getURL(code);
    if (code.toLowerCase().indexOf("<iframe") > -1) {
      return (
        <div
          className="player-wrapper embed_video"
          dangerouslySetInnerHTML={{ __html: code }}
        ></div>
      );
    } else {
      if (urlEmbed.indexOf("youtube") > -1) {
        let lastSlash = urlEmbed.lastIndexOf("/");
        let id = urlEmbed.substring(lastSlash + 1);
        url = `https://www.youtube.com/watch?v=${id}`;
      } else if (urlEmbed.indexOf("dailymotion") > -1) {
        let lastSlash = urlEmbed.lastIndexOf("/");
        let id = urlEmbed.substring(lastSlash + 1);
        url = `https://www.dailymotion.com/video/${id}`;
      } else if (urlEmbed.indexOf("vimeo") > -1) {
        let lastSlash = urlEmbed.lastIndexOf("/");
        let id = urlEmbed.substring(lastSlash + 1);
        url = `https://vimeo.com/${id}`;
      } else if (code.indexOf(".mp4") || code.indexOf(".m3u8") > -1) {
        url = code;
      } else {
        return (
          <div
            className="player-wrapper embed_video"
            dangerouslySetInnerHTML={{ __html: code }}
          ></div>
        );
      }
    }
  } else {
    if (state.video.type == 1) {
      url = `https://www.youtube.com/watch?v=${state.video.code}`;
    } else if (state.video.type == 2) {
      url = `https://vimeo.com/${state.video.code}`;
    } else if (state.video.type == 4) {
      url = `https://www.dailymotion.com/video/${state.video.code}`;
    } else if (state.video.type == 5) {
      url = `https://www.twitch.tv/videos/${state.video.code}`;
    } else if (state.video.type == 6) {
      const videoData = state.video.code.split(",");
      url = `https://clips.twitch.tv/embed?clip=${videoData[1]}`;
      let code = (
        <iframe
          src={url}
          height={props.height ? props.height : "600px"}
          width="100%"
          frameBorder="none"
          allowFullScreen={true}
        ></iframe>
      );
      return <div className="player-wrapper">{code}</div>;
    } else if (state.video.type == 8) {
      url = `https://www.twitch.tv/${state.video.code}`;
    } else if (state.video.type == 7) {
      //fb video
      url = state.video.code;
    } else if (state.video.type == 9) {
      url = state.video.code;
    } else if (state.video.type == 10) {
      url = props.liveStreamingURL + "/" + state.video.code;
    } else if (state.video.type == 22) {
      let code = state.video.code;
      return (
        <div
          className="player-wrapper embed_video"
          dangerouslySetInnerHTML={{ __html: code }}
        ></div>
      );
    } else {
      return (
        <div
          className="player-wrapper"
          dangerouslySetInnerHTML={getIframelyHtml()}
        />
      );
    }
  }
  return (
    <div
      className="player-wrapper"
      style={{ width: "100%", height: props.height ? props.height : "600px" }}
    >
      {state.video.watermark ? (
        <div className="watermarkLogo">
          <a href={config.app_server} {...props.watermarkLogoParams}>
            <img src={props.imageSuffix + state.video.watermark} />
          </a>
        </div>
      ) : null}
      <div className="player-overlay" onClick={changePlayPause}></div>
      <ReactPlayer
        url={url}
        ref={player}
        width="100%"
        playsinline={true}
        muted={typeof props.muted != "undefined" ? props.muted : false}
        height={"100%"}
        onProgress={onProgress}
        playing={state.playing}
        pip={false}
        controls={
          typeof props.showControls != "undefined" ? props.showControls : true
        }
        onReady={handleOnReady}
        onEnded={handleEnded}
      />
    </div>
  );
};

export default OutsidePlayer;
