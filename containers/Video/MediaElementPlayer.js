import React, { useReducer, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import Currency from "../Upgrade/Currency";
import Translate from "../../components/Translate/Index.js";
import config from "../../config";

const MediaElementPlayer = (props) => {
  let currentPlayTimeRedux = useSelector((state) => {
    return state.miniplayer.currentVideoTime;
  });
  const player = useRef(null);
  const currentPlayTime = useRef(null);
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      purchased: false,
      video: props.video,
      userAdVideo: props.userAdVideo,
      adminAdVideo: props.adminAdVideo,
      updateCount: 0,
      paused: false,
      currentVideoTime: currentPlayTimeRedux,
      isAdEnabled: props.userAdVideo || props.adminAdVideo ? true : false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state
  useEffect(() => {
    if (
      props.video.custom_url != state.video.custom_url
    ) {
      if (typeof props.getHeight == "function") props.getHeight();
      setState({
        video: props.video,
        userAdVideo: props.userAdVideo,
        adminAdVideo: props.adminAdVideo,
        purchased: false,
        isAdEnabled: props.userAdVideo || props.adminAdVideo ? true : false,
        updateCount: state.updateCount + 1
      });
    }
  }, [props]);

  useEffect(() => {
    setState({currentVideoTime:currentPlayTimeRedux})
  },[currentPlayTimeRedux])

  const setup = () => {
    if (player.current) {
      player.current.media.remove();
      player.current.remove();
      player.current = null;
    }
    if (currentPlayTime.current) {
      clearInterval(currentPlayTime.current);
    }
    currentPlayTime.current = setInterval(function () {
      if (
        typeof props.updateTime == "undefined" &&
        player.current &&
        !stateRef.isAdEnabled &&
        props.upatePlayerTime
      ) {
        try{
            props.upatePlayerTime(player.current.getCurrentTime());
        }catch(e){}
      }
    }, 1000);
  };
  useEffect(() => {
    if (player.current) {
        if (currentPlayTime.current) {
            clearInterval(currentPlayTime.current);
        }
        // player.current.remove();
        player.current.media.remove();
        player.current = null;
    }
    setup();
    initiatePlayer();
    updatePlayCount();
  },[state.video])
  useEffect(() => {
    updatePlayCount();
    return () => {
      if (player.current) {
        if (currentPlayTime.current) {
          clearInterval(currentPlayTime.current);
        }
        // player.current.remove();
        player.current.media.remove();
        player.current = null;
      }
    };
    
  }, []);

  const handleEnded = () => {
    if (
      state.video.sell_videos &&
      state.video.price > 0 &&
      !state.video.videoPurchased
    ) {
      setState({  purchased: true });
    } else if (props.ended) {
      props.ended(props.playType);
    }
  };
  const updatePlayCount = () => {
    if(props.updatePlayCount)
    props.updatePlayCount(state.video.movie_video_id);
  };
  const initiatePlayer = () => {
    if (state.video.status != 1) return;

    // instantiate Video.js

    const { MediaElementPlayer } = global;
    if (!MediaElementPlayer) {
      return;
    }

    let url = "";
    let adVideoLink = "";
    if (state.adminAdVideo) {
      adVideoLink =
        (state.adminAdVideo.link.indexOf("http://") == -1 &&
        state.adminAdVideo.link.indexOf("https://") == -1
          ? props.imageSuffix
          : "") + state.adminAdVideo.link;
    } else if (state.userAdVideo) {
      adVideoLink = (props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.imageSuffix) + state.userAdVideo.media;
    }
    if (
      state.adminAdVideo &&
      state.adminAdVideo.type == 1 &&
      state.adminAdVideo.click_link
    ) {
      url =
        window.location.protocol +
        "//" +
        window.location.host +
        "/ad-clicked/admin/" +
        state.adminAdVideo.ad_id +
        "?url=" +
        encodeURI(state.adminAdVideo.click_link);
    } else if (state.userAdVideo && state.userAdVideo.url) {
      url =
        window.location.protocol +
        "//" +
        window.location.host +
        "/ad-clicked/user/" +
        state.userAdVideo.ad_id +
        "/" +
        state.video.video_id +
        "?url=" +
        encodeURI(state.userAdVideo.url);
    }

    let vPaidAds = "";
    if (state.adminAdVideo && state.adminAdVideo.type != 1) {
      vPaidAds = state.adminAdVideo.link;
    }
    let plugins = [
      "playpause",
      "current",
      "progress",
      "duration",
      "speed",
      "skipback",
      "jumpforward",
      "tracks",
      "markers",
      "volume",
      "chromecast",
      "vast",
      "contextmenu",
    ];

    if (state.video.type == 3 || state.video.type == "upload") {
      plugins.push("quality");

      if (state.isAdEnabled) plugins.push("ads");
    }
    plugins.push("fullscreen");

    const options = {
      // Read the Notes below for more explanation about how to set up the path for shims
      pluginPath: "https://cdnjs.com/libraries/mediaelement-plugins/",
      shimScriptAccess: "always",
      iconSprite: "/static/images/mejs-controls.svg",
      videoWidth: "100%",
      videoHeight: "100%",
      setDimensions: false,
      autoplay: true,
      features: plugins,
      vastAdTagUrl: vPaidAds,
      vastAdsType: state.adminAdVideo ? state.adminAdVideo.type : "",
      jumpForwardInterval: 10,
      adsPrerollMediaUrl: [adVideoLink],
      adsPrerollAdUrl: [url],
      adsPrerollAdEnableSkip: state.adminAdVideo
        ? state.adminAdVideo.skip > 0
          ? true
          : false
        : false,
      adsPrerollAdSkipSeconds:
        state.adminAdVideo && state.adminAdVideo.skip > 0
          ? parseInt(state.adminAdVideo.skip)
          : 5,
      success: function (media) {
        media.addEventListener("timeupdate", function (e) {
          if (
            typeof props.updateTime == "undefined" &&
            player.current &&
            !stateRef.current.isAdEnabled &&
            props.upatePlayerTime
          ) {
            props.upatePlayerTime(player.current.getCurrentTime());
          }
        });
        media.addEventListener("ended", function (e) {
          if (player.current 
            && !stateRef.current.isAdEnabled
            ) handleEnded();
          else {
            setState({  isAdEnabled: false });
          }
        });
        media.addEventListener("playing", function (e) {
          if (player.current) {
            if (props.getHeight) props.getHeight();
          }
          $(".mejs__mediaelement").find(".userad_cnt").remove();
        });
        media.addEventListener("loadedmetadata", function (e) {
          if (player.current) {
            player.current.setMuted(true);
            player.current.play();
            player.current.setMuted(false);
          }
          if (props.getHeight) props.getHeight();
          if (stateRef.current.currentVideoTime 
            && !stateRef.current.isAdEnabled
            ) {
            player.current.setCurrentTime(stateRef.current.currentVideoTime);
          }
          if (stateRef.current.userAdVideo && stateRef.current.isAdEnabled) {
            let url =
              window.location.protocol +
              "//" +
              window.location.host +
              "/ad-clicked/user/" +
              stateRef.current.userAdVideo.ad_id +
              "/" +
              stateRef.current.video.video_id +
              "?url=" +
              encodeURI(stateRef.current.userAdVideo.url);
            $(".mejs__mediaelement").append(
              '<div class="userad_cnt" style="height:100px;bottom:20px"></div>'
            );
            if (stateRef.current.userAdVideo.url)
              $(".userad_cnt").attr("onClick", 'window.open("' + url + '");');
            if (stateRef.current.userAdVideo && stateRef.current.userAdVideo.title) {
              $(".userad_cnt").append(
                "<div class='userad_title'>" +
                stateRef.current.userAdVideo.title +
                  "</div>"
              );
            }
            if (stateRef.current.userAdVideo && stateRef.current.userAdVideo.description) {
              $(".userad_cnt").append(
                "<div class='userad_description'>" +
                stateRef.current.userAdVideo.description +
                  "</div>"
              );
            }
          }
        });
      },
      error: (media, node) => {
        // console.log("loading error",media)
      },
    };
    player.current = new MediaElementPlayer(
      `${state.video.custom_url || ""}-${state.updateCount}`,
      options
    );
  };

 

  let htmlPrice = null;
  let userBalance = {};
  userBalance["package"] = { price: parseInt(state.video.price) };
  if (state.purchased && !props.miniplayer) {
    htmlPrice = (
      <div
        className="purchase_video_content video_purchase"
        style={{ width: "100%", height: props.height ? props.height : "100%" }}
      >
        <div className="purchase_video_content_background"></div>
        <h5>
          {Translate(
            props,
            "More to watch! to continue watching this video, you have to purchase it."
          )}
          <br />
          <br />
          <button className="btn btn-main" onClick={props.purchaseClicked}>
            {Translate(props, "Purchase ") +
              " " +
              Currency({ ...props, ...userBalance })}{" "}
          </button>
        </h5>
      </div>
    );
  }

  let resolutionsVideo = [];
  let resolution = null;
  if (state.video) {
    if ((state.video.type == 3 || state.video.type == "upload") && state.video.video_location) {
      let splitName = state.video.video_location.split("/");
      let fullName = splitName[splitName.length - 1];
      let videoName = fullName.split("_")[0];
      let suffix = props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.imageSuffix;
      let path = "/upload/videos/video/";
      if (state.video.movie_video_id) {
        
        path = "/upload/movies/video/";
      }
      if (
        state.video.price <= 0 ||
        state.video.videoPurchased ||
        !state.video.sell_videos
      ) {
        if (state.video["4096p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_4096p.mp4",
            type: "video/mp4",
            label: "4K",
            res: 4096,
          });
          resolution = "4096";
        }
        if (state.video["2048p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_2048p.mp4",
            type: "video/mp4",
            label: "2K",
            res: 2048,
          });
          resolution = "2048";
        }
        if (state.video["1080p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_1080p.mp4",
            type: "video/mp4",
            label: "1080p",
            res: 1080,
          });
          resolution = "1080";
        }
        if (state.video["720p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_720p.mp4",
            type: "video/mp4",
            label: "720p",
            res: 720,
          });
          resolution = "720";
        }
        if (state.video["480p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_480p.mp4",
            type: "video/mp4",
            label: "480p",
            res: 480,
          });
          if (!resolution) resolution = "480";
        }
        if (state.video["360p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_360p.mp4",
            type: "video/mp4",
            label: "360p",
            res: 360,
          });
          if (!resolution) resolution = "360";
        }
        let isValid = true;
        if (state.video["240p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_240p.mp4",
            type: "video/mp4",
            label: "240p",
            res: 240,
          });
          isValid = false;
          if (!resolution) resolution = "240";
        }
        if (state.video.video_location && isValid) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_240p.mp4",
            type: "video/mp4",
            label: "360p",
            res: 360,
          });
          if (!resolution) resolution = "360";
        }
      } else {
        resolutionsVideo.push({
          src: suffix + path + videoName + "_sample.mp4",
          type: "video/mp4",
        });
      }
    } else if (state.video.code && state.video.code.split(",").length > 1) {
      let videos = state.video.code.split(",");
      let videoPath =
        props.pageData.liveStreamingServerURL +
        `:5443/${props.pageData.streamingAppName}/streams/`;
      if (props.pageData.liveStreamingCDNURL) {
        videoPath = props.pageData.liveStreamingCDNURL + `/streams/`;
      }
      if (videos.length > 1) {
        if (state.video["4096p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("_4096p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "4K",
              res: 4096,
            });
            if (!resolution) resolution = "4096";
          }
        }
        if (state.video["2048p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("_2048p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "2K",
              res: 2048,
            });
            if (!resolution) resolution = "2048";
          }
        }
        if (state.video["1080p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("1080p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "1080p",
              res: 1080,
            });
            if (!resolution) resolution = "1080";
          }
        }
        if (state.video["720p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("720p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "720p",
              res: 720,
            });
            if (!resolution) resolution = "720";
          }
        }
        if (state.video["480p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("480p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "480p",
              res: 480,
            });
            if (!resolution) resolution = "480";
          }
        }
        if (state.video["360p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("360p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "360p",
              res: 360,
            });
            if (!resolution) resolution = "360";
          }
        }
        if (state.video["240p"] == 1) {
          let url = videos.filter(function (item) {
            return item.indexOf("240p") > -1;
          });
          if (url) {
            resolutionsVideo.push({
              src: videoPath + url[0],
              type: "video/mp4",
              label: "240p",
              res: 240,
            });
            if (!resolution) resolution = "240";
          }
        }
      } else {
        resolutionsVideo.push({
          src: props.pageData.liveStreamingCDNURL
            ? props.pageData.liveStreamingCDNURL +
              "/streams/" +
              state.video.code
            : props.pageData.liveStreamingServerURL +
              `:5443/${props.pageData.streamingAppName}/streams/` +
              state.video.code,
          type: "video/mp4",
          label: "480p",
          res: 480,
        });
      }
    }
  }

  let key = `${state.video.custom_url || ""}-${state.updateCount}`;
  let mediaHtml = null;
  if (state.video.status == 1 && resolutionsVideo.length > 0) {
    let sourceTags = [];
    for (let i = 0, total = resolutionsVideo.length; i < total; i++) {
      const source = resolutionsVideo[i];
      sourceTags.push(
        `<source src="${source.src}" type="${source.type}" data-quality="${source.label}">`
      );
    }
    const mediaBody = `${sourceTags.join("\n")}`;
    mediaHtml = `<video id="${key}" style="width:100%;height:100%" ${
      state.video ? ` poster=${props.imageSuffix + state.video.image}` : ""
    }
                            ${
                              typeof props.showControls != "undefined"
                                ? props.showControls
                                  ? " controls"
                                  : ""
                                : " controls"
                            }   preload="auto">
                            ${mediaBody}
                        </video>`;
  } else if (state.video.status == 1) {
    let url = "";
    let type = "";
    if (state.video.type == 1) {
      url = `https://www.youtube.com/watch?v=${state.video.code}`;
      type = "video/youtube";
    } else if (state.video.type == 2) {
      url = `https://vimeo.com/${state.video.code}`;
      type = "video/vimeo";
    } else if (state.video.type == 4) {
      url = `https://www.dailymotion.com/video/${state.video.code}`;
      type = "video/dailymotion";
    } else if (state.video.type == 5) {
      url = `https://www.twitch.tv/videos/${state.video.code}`;
      type = "video/twitch";
    } else if (state.video.type == 9) {
      url = state.video.code;
      if (state.video.code.indexOf(".m3u8") > -1) {
        type = "application/x-mpegURL";
      } else {
        type = "video/mp4";
      }
    } else if (state.video.type == 10) {
      url = props.liveStreamingURL + "/" + state.video.code;
      type = "video/mp4";
    }

    const mediaBody = `<source src="${url}" type="${type}" data-quality="360p">`;
    let image = state.video ? state.video.image : "";
    if (
      state.video &&
      state.video.image.indexOf("http://") == -1 &&
      state.video.image.indexOf("https://") == -1
    ) {
      image = props.imageSuffix + state.video.image;
    }

    mediaHtml = `<video id="${key}" style="width:100%;height:100%" ${
      state.video ? ` poster=${image}` : ""
    }
                            ${
                              typeof props.showControls != "undefined"
                                ? props.showControls
                                  ? " controls"
                                  : ""
                                : " controls"
                            } playsinline webkit-playsinline   preload="auto">
                            ${mediaBody}
                        </video>`;
  }
  return (
    <div key={key} style={{width: '100%', height: '100%'}}>
      <div
        className={`video_player_cnt player-wrapper${state.isAdEnabled ? " video-ads-enable" : ""}`}
        style={{
          width: "100%",
          height: props.height ? props.height : "600px",
          position: "relative",
        }}
      >
        {state.video.status == 1 ? (
          <React.Fragment>
            {state.video.sell_videos &&
            state.video.price > 0 &&
            !state.video.videoPurchased &&
            !props.miniplayer ? (
              <button
                className="video_purchase_btn"
                onClick={props.purchaseClicked}
              >
                {Translate(props, "Purchase ") +
                  " " +
                  Currency({ ...props, ...userBalance })}{" "}
              </button>
            ) : null}
            {state.video.watermark && !props.pageData.fromAPP ? (
              <div className="watermarkLogo">
                <a href={config.app_server} {...props.watermarkLogoParams}>
                  <img src={props.imageSuffix + state.video.watermark} />
                </a>
              </div>
            ) : null}
            {htmlPrice ? htmlPrice : null}
            <div
              style={{
                width: "100%",
                height: "100%",
                display: state.purchased ? "none" : "block",
              }}
              className="no-svg"
              dangerouslySetInnerHTML={{ __html: mediaHtml }}
            ></div>
          </React.Fragment>
        ) : (
          <div
            className="purchase_video_content video_processing_cnt"
            style={{
              width: "100%",
              height: props.height ? props.height : "100%",
            }}
          >
            {state.video.status == 2 ? (
              <h5>{props.t("Video is processing, please wait...")}</h5>
            ) : (
              <h5>
                {props.t("Video failed processing, please upload new video.")}
              </h5>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaElementPlayer;
