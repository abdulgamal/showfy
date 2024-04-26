import React, { useReducer, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Currency from "../Upgrade/Currency";
import Translate from "../../components/Translate/Index.js";
import config from "../../config";

if (typeof window != "undefined") {
    window.videojs = videojs;
    require("./VideoJSSwitcher");
    require("../../public/static/scripts/videojs-skip-ads/dist/videojs-skip-ads.js");
}

const Player = (props) => {
  let currentPlayTimeRedux = useSelector((state) => {
    return state.miniplayer.currentVideoTime;
  });
  const player = useRef(null);
  const videoNode = useRef(null);
  
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
    }
  );
  useEffect(() => {
    if (
      props.video.custom_url != state.video.custom_url
    ) {
      if (typeof props.getHeight == "function") props.getHeight();
      setState({
        video: props.video,
        purchased: false,
      });
    }
  }, [props]);
  useEffect(() => {
    setState({currentVideoTime:currentPlayTimeRedux})
  },[currentPlayTimeRedux])

  useEffect(() => {
    // setup();
    if (player.current) {
      player.current.dispose();
    }
    // Create new player.current
    initiatePlayer();
  }, [state.video]);

  useEffect(() => {
    
    return () => {
      if (player.current) {
        player.current.dispose();
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
    if (props.updatePlayCount)
      props.updatePlayCount(state.video.movie_video_id);
  };
  const AdsElement = (player, vastAdUrl) => {
    // Set up UI stuff.
    var options = { debug: false, adTagUrl: vastAdUrl,id:`video-player-${state.video.video_id}` };
    player.ima(options);
  };
  const initiatePlayer = () => {
    if (
      state.video.status != 1 ||
      (state.video.type != "upload" &&
        state.video.type != 3 &&
        state.video.type != 11)
    )
      return;
    let resolutionsVideo = [];
    let videoJsOptions = {};
    let resolution = "";

    if ((state.video.type == 3 || state.video.type == "upload") && state.video.video_location) {
      let splitName = state.video.video_location.split("/");
      let fullName = splitName[splitName.length - 1];
      let videoName = fullName.split("_")[0];
      let suffix = props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.imageSuffix;
      let path = "/upload/videos/video/";
      if (state.video.movie_video_id) {
        updatePlayCount();
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
        if (state.video["240p"] == 1) {
          resolutionsVideo.push({
            src: suffix + path + videoName + "_240p.mp4",
            type: "video/mp4",
            label: "240p",
            res: 240,
          });
          if (!resolution) resolution = "240";
        }
        if (state.video.video_location) {
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
          label: "360p",
          res: 360,
        });
        if (!resolution) resolution = "360";
      }
      videoJsOptions = {
        autoplay: true,
        muted: typeof props.muted != "undefined" ? props.muted : false,
        controls:
          typeof props.showControls != "undefined" ? props.showControls : true,
        preload: "auto",
        plugins: {
          videoJsResolutionSwitcher: {
            default: resolution, // Default resolution [{Number}, 'low', 'high'],
            dynamicLabel: true,
          },
        },
        sources: resolutionsVideo,
      };
    } else {
      let videos = state.video.code.split(",");
      let videoPath =
        props.pageData.liveStreamingServerURL +
        `:5443/${props.pageData.streamingAppName}/streams/`;
      if (props.pageData.liveStreamingCDNURL) {
        videoPath = props.pageData.liveStreamingCDNURL + "/streams/";
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
        videoJsOptions = {
          autoplay: true,
          muted: typeof props.muted != "undefined" ? props.muted : false,
          controls:
            typeof props.showControls != "undefined"
              ? props.showControls
              : true,
          preload: "auto",
          plugins: {
            videoJsResolutionSwitcher: {
              default: resolution, // Default resolution [{Number}, 'low', 'high'],
              dynamicLabel: true,
            },
          },
          sources: resolutionsVideo,
        };
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
        videoJsOptions = {
          autoplay: true,
          muted: typeof props.muted != "undefined" ? props.muted : false,
          controls:
            typeof props.showControls != "undefined"
              ? props.showControls
              : true,
          preload: "auto",
          sources: resolutionsVideo,
        };
      }
    }

    // instantiate Video.js
    player.current = videojs(
      videoNode.current,
      videoJsOptions,
      function onPlayerReady() {
        player.current.play();
        // var player = this;
        // const registerPlugin = videojs.registerPlugin || videojs.plugin;
        // registerPlugin("ads", ads);
        if (props.getHeight) props.getHeight();
        if (state.video.type == 3 || resolution) {
          player.current.updateSrc(resolutionsVideo);
        }
        if (state.currentVideoTime) {
          player.current.currentTime(state.currentVideoTime);
        }
        player.current.skipAds({
          delayInSeconds:
            state.adminAdVideo && state.adminAdVideo.skip > 0
              ? state.adminAdVideo.skip
              : 0,
        });
        // request ads whenever there's new video content
        player.current.on("contentchanged", function () {
          // in a real plugin, you might fetch new ad inventory here
          player.current.trigger("adsready");
        });
        if (typeof props.updateTime == "undefined") {
          player.current.on("timeupdate", function () {
            if(player.current.preLoadAdsPlaying){
              return;
            }
            if(props.upatePlayerTime)
              props.upatePlayerTime(player.current.currentTime());
          });
        }
        player.current.on("ended", function () {
          if(!player.current.preLoadAdsPlaying)
            handleEnded();
        });
        if (
          state.userAdVideo ||
          (state.adminAdVideo && state.adminAdVideo.type == 1)
        ) {
          
          player.current.ads();
          player.current.on("readyforpreroll", function () {
            if (!player.current.loadPreLoadAds) {
              player.current.loadPreLoadAds = true;
              player.current.ads.startLinearAdMode();
              let adVideoLink = "";
              if (state.adminAdVideo) {
                adVideoLink = (props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.imageSuffix ) + state.adminAdVideo.link;
              } else {
                adVideoLink = (props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.imageSuffix) + state.userAdVideo.media;
              }
              if (adVideoLink) {
                player.current.preLoadAdsPlaying = true;
                // play your linear ad content
                player.current.src(adVideoLink);
                // send event when ad is playing to remove loading spinner
                player.current.one("adplaying", function () {
                  if (
                    state.adminAdVideo &&
                    state.adminAdVideo.type == 1 &&
                    state.adminAdVideo.click_link
                  ) {
                    let url =
                      window.location.protocol +
                      "//" +
                      window.location.host +
                      "/ad-clicked/admin/" +
                      state.adminAdVideo.ad_id +
                      "?url=" +
                      encodeURI(state.adminAdVideo.click_link);
                    $("[data-vjs-player=true]")
                      .find("video.vjs-tech")
                      .attr("onClick", 'window.open("' + url + '");');
                  } else if (state.userAdVideo && state.userAdVideo.url) {
                    let url =
                      window.location.protocol +
                      "//" +
                      window.location.host +
                      "/ad-clicked/user/" +
                      state.userAdVideo.ad_id +
                      "/" +
                      state.video.video_id +
                      "?url=" +
                      encodeURI(state.userAdVideo.url);
                    $("[data-vjs-player=true]")
                      .find("video.vjs-tech")
                      .attr("onClick", 'window.open("' + url + '");');
                  }
                  if (state.userAdVideo) {
                    let url =
                      window.location.protocol +
                      "//" +
                      window.location.host +
                      "/ad-clicked/user/" +
                      state.userAdVideo.ad_id +
                      "/" +
                      state.video.video_id +
                      "?url=" +
                      encodeURI(state.userAdVideo.url);
                    $('<div class="userad_cnt"></div>').insertBefore(
                      $("[data-vjs-player=true]").find(".videojs-ads-info")
                    );
                    if (state.userAdVideo.url)
                      $(".userad_cnt").attr(
                        "onClick",
                        'window.open("' + url + '");'
                      );
                    if (state.userAdVideo && state.userAdVideo.title) {
                      $(".userad_cnt").append(
                        "<div class='userad_title'>" +
                          state.userAdVideo.title +
                          "</div>"
                      );
                    }
                    if (state.userAdVideo && state.userAdVideo.description) {
                      $(".userad_cnt").append(
                        "<div class='userad_description'>" +
                          state.userAdVideo.description +
                          "</div>"
                      );
                    }
                  }
                  player.current.trigger("ads-ad-started");
                });
                // resume content when all your linear ads have finished
                player.current.one("adended", function () {
                  if (
                    state.adminAdVideo &&
                    state.adminAdVideo.type == 1 &&
                    state.adminAdVideo.click_link
                  ) {
                    $("[data-vjs-player=true]")
                      .find("video.vjs-tech")
                      .removeAttr("onClick", "");
                  }
                  player.current.preLoadAdsPlaying = false;
                  player.current.ads.endLinearAdMode();
                });
              }
            }
          });
          // in a real plugin, you might fetch ad inventory here
          player.current.trigger("adsready");
        }
      }
    );
    if (state.adminAdVideo && state.adminAdVideo.type == 2) {
      let tag = state.adminAdVideo.link;
      AdsElement(player.current, tag);
    }
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

  let key = `${state.video.custom_url || ""}-${state.updateCount}`;
  return (
    <div key={key} style={{ height: "100%" }}>
      <div
        data-vjs-player
        className="video_player_cnt player-wrapper"
        style={{ width: "100%", position: "relative" }}
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
            <video
              id={`video-player-${state.video.video_id}`}
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              disablePictureInPicture
              playsInline
              style={{
                width: "100%",
                height: props.height ? props.height : "100%",
                position: "relative",
              }}
              ref={videoNode}
              className="video-js"
            />
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

export default Player;
