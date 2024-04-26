import React, { useReducer, useEffect, useRef } from "react";
import Router, { withRouter } from "next/router";
import dynamic from "next/dynamic";
import swal from "sweetalert";
import { useSelector, useDispatch } from "react-redux";
import { setMenuOpen } from "../../store/reducers/search";
import { openToast } from "../../store/reducers/toast";
import Validator from "../../validators";
import axios from "../../axios-orders";
import AdsIndex from "../Ads/Index";
import Image from "../Image/Index";
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index";
import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import WatchLater from "../WatchLater/Index";
import Timeago from "../Common/Timeago";
import Rating from "../Rating/Index";
import Currency from "../Upgrade/Currency";
import MemberFollow from "../User/Follow";
import Translate from "../../components/Translate/Index";
import CensorWord from "../CensoredWords/Index";
import config from "../../config";

import Gateways from "../Gateways/Index";

const Form = dynamic(() => import("../../components/DynamicForm/Index"), {
  ssr: false,
});
const Player = dynamic(() => import("./Player"), {
  ssr: false,
});
const MediaElementPlayer = dynamic(() => import("./MediaElementPlayer"), {
  ssr: false,
});
const OutsidePlayer = dynamic(() => import("./OutsidePlayer"), {
  ssr: false,
});
const Artists = dynamic(() => import("../Artist/Artists"), {
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
const Comment = dynamic(() => import("../../containers/Comments/Index"), {
  ssr: false,
});
const Chat = dynamic(() => import("../LiveStreaming/Chat"), {
  ssr: false,
});
const RelatedVideos = dynamic(() => import("./RelatedVideos"), {
  ssr: false,
});
const Donation = dynamic(() => import("../Donation/Index"), {
  ssr: false,
});
const Gifts = dynamic(() => import("../Gifts"), {
  ssr: false,
});
const Members = dynamic(() => import("../User/Browse"), {
  ssr: false,
});
const GiftsMembers = dynamic(() => import("../Gifts/Members"), {
  ssr: false,
});
const Plans = dynamic(() => import("../User/Plans"), {
  ssr: false,
});

const Index = (props) => {
  const plansSubscription = useRef(null);
  const scheduledTimer = useRef(null);
  const dispatch = useDispatch();

  let reduxStateAudios = useSelector((state) => {
    return state.audio.audios;
  });
  let reduxStateSongId = useSelector((state) => {
    return state.audio.song_id;
  });
  let menuOpen = useSelector((state) => {
    return state.search.menuOpen;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      styles: {
        visibility: "hidden",
        overflow: "hidden",
      },
      giftData: null,
      playedVideos: "",
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
      needSubscription: props.pageData.needSubscription,
      plans: props.pageData.plans,
      tabType: props.pageData.tabType ? props.pageData.tabType : "about",
      timerValue: 1,
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
        gateways: false,
        giftData: null,
        playedVideos: props.pageData.playedVideos
          ? props.pageData.playedVideos
          : "",
        video: props.pageData.video,
        relatedVideos: props.pageData.relatedVideos,
        userAdVideo: props.pageData.userAdVideo,
        adminAdVideo: props.pageData.adminAdVideo,
        playlist: props.pageData.playlist,
        playlistVideos: props.pageData.playlistVideos,
        password: props.pageData.password,
        adult: props.pageData.adultVideo,
        logout: false,
        needSubscription: props.pageData.needSubscription,
        plans: props.pageData.plans,
        tabType: props.pageData.tabType ? props.pageData.tabType : "about",
      });
    }
  }, [props]);

  const stateRef = useRef();
  const giftDataRef = useRef();
  stateRef.current = state.video;
  giftDataRef.current = state.giftData;

  useEffect(() => {
    getHeight();
  }, [state.width, state.fullWidth]);

  useEffect(() => {
    if (!state.video || !state.video.gifts) {
      return;
    }
    const timer = setInterval(() => {
      if (giftDataRef.current) {
        let existingData = [...giftDataRef.current];
        let enableTip = 0;
        let removeIndex = [];
        giftDataRef.current.map((item, index) => {
          if (item.started == 1 && Date.now() > item.timer + 5000) {
            // remove item from array
            removeIndex.push(index);
          } else if (enableTip < 3 && item.started == 0) {
            existingData[index].timer = Date.now();
            existingData[index].started = 1;
            enableTip = enableTip + 1;
          } else {
            enableTip = enableTip + 1;
          }
        });
        removeIndex.forEach((item) => {
          existingData.splice(item, 1);
        });
        setState({ giftData: existingData });
      }
    }, 2000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    scheduledTime();
    getHeight();
  }, [state.video]);

  const updateWindowDimensions = () => {
    setState({ width: window.innerWidth });
  };
  const scheduledTime = () => {
    if (scheduledTimer.current) {
      clearInterval(scheduledTimer.current);
    }
    if (state.video && state.video.scheduled) {
      scheduledTimer.current = setInterval(function () {
        var countDownDate = new Date(
          state.video.scheduled.replace(/ /g, "T")
        ).getTime();

        // Get today's date and time
        var now = new Date().getTime() + state.timerValue;

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(scheduledTimer.current);
          setState({ scheduledEndTime: props.t("Start in few seconds") });
        } else {
          setState({
            scheduledEndTimeDay: days,
            scheduledEndTimeHours: hours,
            scheduledEndTimeMinutes: minutes,
            scheduledEndTimeSeconds: seconds,
            timerValue: state.timerValue + 1000,
          });
        }
      }, 1000);
    }
  };
  const getHeight = () => {
    if ($(".videoPlayer").length && $(".videoPlayerHeight").length) {
      let height =
        $(".videoPlayerHeight").outerWidth(true) / 1.77176216 - 20 + "px";
      $(".player-wrapper, .video-js, .mejs__container").css("height", height);
      $(".mejs__container").css("width", "100%");
      $("#background_theater").css(
        "height",
        $(".videoPlayerHeight").outerWidth(true) / 1.77176216 + 46 + "px"
      );
      if (state.fullWidth) {
        $(".videoPlayerHeight").css(
          "height",
          $(".videoPlayerHeight").outerWidth(true) / 1.77176216 + 46 + "px"
        );
      } else {
        $(".videoPlayerHeight").css("height", "auto");
      }
      if (state.fullWidth) {
        $(".header-wrap").addClass("theater-mode");
      } else {
        $(".header-wrap").removeClass("theater-mode");
      }
      $("video, iframe").css("height", "100%").css("width", "100%");
    }
    if ($(".videoPlayerHeight").length) {
      let height = $(".videoPlayerHeight").outerHeight(true);
      if (state.video && state.video.status == 2) {
        //height = 420;
      }
      if (height > 20) setState({ height: `-${height}px` });
    }
  };

  useEffect(() => {
    getHeight();
    scheduledTime();
    if (reduxStateSongId)
      props.updateAudioData({
        audios: reduxStateAudios,
        song_id: reduxStateSongId,
        pausesong_id: reduxStateSongId,
      });
    if (
      props.pageData.appSettings["fixed_header"] == 1 &&
      props.hideSmallMenu &&
      !menuOpen
    ) {
      dispatch(setMenuOpen(true));
    }

    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);

    props.updatePlayerData({
      relatedVideos: [],
      playlistVideos: [],
      currentVideo: null,
      deleteMessage: "",
      deleteTitle: "",
      liveStreamingURL: props.pageData.liveStreamingURL,
    });

    if (stateRef.current && stateRef.current.videoPaymentStatus) {
      if (stateRef.current.videoPaymentStatus == "success") {
        swal(
          "Success",
          Translate(props, "Video purchased successfully.", "success")
        );
      } else if (stateRef.current.videoPaymentStatus == "fail") {
        swal(
          "Error",
          Translate(
            props,
            "Something went wrong, please try again later",
            "error"
          )
        );
      } else if (stateRef.current.videoPaymentStatus == "cancel") {
        swal(
          "Error",
          Translate(props, "You have cancelled the payment.", "error")
        );
      }
    }

    props.socket.on("liveStreamStatus", (socketdata) => {
      let id = socketdata.id;
      if (stateRef.current && stateRef.current.owner.idw == id) {
        if (socketdata.action == "liveStreamStarted") {
          Router.push(`/watch/${stateRef.current.custom_url}`);
        }
      }
    });

    props.socket.on("videoCreated", (socketdata) => {
      let id = socketdata.id;
      if (stateRef.current && stateRef.current.custom_url == id) {
        Router.push(`/watch/${id}`);
      }
    });

    props.socket.on("giftSend", (socketdata) => {
      let video_id = socketdata.video_id;
      let gift_id = socketdata.gift_id;
      let user_id = socketdata.user_id;
      let ownerInfo = socketdata.ownerInfo;

      if (stateRef.current && stateRef.current.video_id == video_id) {
        let existingData = giftDataRef.current ? [...giftDataRef.current] : [];
        let index = existingData.findIndex(
          (item) => item.user_id == user_id && item.gift_id == gift_id
        );
        let newsocketdata = { ...socketdata };
        newsocketdata.timer = Date.now();
        if (index > -1) {
          existingData[index] = newsocketdata;
        } else {
          newsocketdata.started = 0;
          existingData.push(newsocketdata);
        }
        setState({ giftData: existingData });
      }
    });

    props.socket.on("removeScheduledVideo", (socketdata) => {
      let id = socketdata.id;
      let ownerId = socketdata.ownerId;
      if (stateRef.current && stateRef.current.video_id == id) {
        const video = { ...stateRef.current };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          video.scheduled_video_id = null;
          setState({ video: video });
        }
      }
    });
    props.socket.on("scheduledVideo", (socketdata) => {
      let id = socketdata.id;
      let ownerId = socketdata.ownerId;
      if (stateRef.current && stateRef.current.video_id == id) {
        const video = { ...stateRef.current };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          video.scheduled_video_id = 1;
          setState({ video: video });
        }
      }
    });

    props.socket.on("unwatchlater", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      if (stateRef.current && stateRef.current.video_id == id) {
        const video = { ...stateRef.current };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          video.watchlater_id = null;
          setState({ video: video });
        }
      }
    });
    props.socket.on("watchlater", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      if (stateRef.current && stateRef.current.video_id == id) {
        const video = { ...stateRef.current };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          video.watchlater_id = 1;
          setState({ video: video });
        }
      }
    });

    props.socket.on("unfollowUser", (socketData) => {
      let id = socketData.itemId;
      let type = socketData.itemType;
      let ownerId = socketData.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.owner.user_id &&
        type == "members"
      ) {
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          const data = { ...stateRef.current };
          const owner = data.owner;
          owner.follower_id = null;
          setState({ video: data });
        }
      }
    });
    props.socket.on("followUser", (socketData) => {
      let id = socketData.itemId;
      let type = socketData.itemType;
      let ownerId = socketData.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.owner.user_id &&
        type == "members"
      ) {
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          const data = { ...stateRef.current };
          const owner = data.owner;
          owner.follower_id = 1;
          setState({ video: data });
        }
      }
    });
    props.socket.on("ratedItem", (socketData) => {
      let id = socketData.itemId;
      let type = socketData.itemType;
      let Statustype = socketData.type;
      let rating = socketData.rating;
      if (
        stateRef.current &&
        id == stateRef.current.video_id &&
        type == "videos"
      ) {
        const data = { ...stateRef.current };
        data.rating = rating;
        setState({ video: data });
      }
    });
    props.socket.on("unfavouriteItem", (socketData) => {
      let id = socketData.itemId;
      let type = socketData.itemType;
      let ownerId = socketData.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.video_id &&
        type == "videos"
      ) {
        if (stateRef.current.video_id == id) {
          const data = { ...stateRef.current };
          data.favourite_count = data.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            data.favourite_id = null;
          }
          setState({ video: data });
        }
      }
    });
    props.socket.on("favouriteItem", (socketData) => {
      let id = socketData.itemId;
      let type = socketData.itemType;
      let ownerId = socketData.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.video_id &&
        type == "videos"
      ) {
        if (stateRef.current.video_id == id) {
          const data = { ...stateRef.current };
          data.favourite_count = data.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            data.favourite_id = 1;
          }
          setState({ video: data });
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
      if (
        stateRef.current &&
        itemType == "videos" &&
        stateRef.current.video_id == itemId
      ) {
        const item = { ...stateRef.current };
        let loggedInUserDetails = {};
        if (props.pageData && props.pageData.loggedInUserDetails) {
          loggedInUserDetails = props.pageData.loggedInUserDetails;
        }
        if (removeLike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = null;
          item["like_count"] = parseInt(item["like_count"]) - 1;
        }
        if (removeDislike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = null;
          item["dislike_count"] = parseInt(item["dislike_count"]) - 1;
        }
        if (insertLike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = "like";
          item["like_count"] = parseInt(item["like_count"]) + 1;
        }
        if (insertDislike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = "dislike";
          item["dislike_count"] = parseInt(item["dislike_count"]) + 1;
        }
        setState({ video: item });
      }
    });
    if (stateRef.current) {
      if ($("#VideoDetailsDescp").height() > 110) {
        setState({
          showMore: true,
          styles: {
            visibility: "visible",
            overflow: "hidden",
            height: "100px",
          },
          collapse: true,
        });
      } else {
        setState({
          showMore: false,
          styles: { visibility: "visible", height: "auto" },
        });
      }
    }

    return () => {
      if (scheduledTimer.current) {
        clearInterval(scheduledTimer.current);
      }
      window.removeEventListener("resize", updateWindowDimensions);
      if (
        stateRef.current &&
        (stateRef.current.type == 11 || stateRef.current.type == 10)
      ) {
        return;
      }
      let deleteMessage = Translate(
        props,
        "Are you sure you want to close the player?"
      );
      let deleteTitle = Translate(props, "Queue will be cleared");
      if (
        !state.needSubscription &&
        props.pageData.appSettings["video_miniplayer"] == 1 &&
        props.pageData.appSettings["enable_iframely"] == 0 &&
        stateRef.current &&
        stateRef.current.approve == 1 &&
        stateRef.current.status == 1 &&
        state.width > 992 &&
        !state.logout
      ) {
        if (state.playlistVideos) {
          let videos = [...state.playlistVideos];
          videos.forEach((video, itemIndex) => {
            if (video.is_active_package != 1) {
              videos.splice(itemIndex, 1);
            } else {
              // videos[itemIndex].playerElem =
              //   props.pageData.appSettings["player_type"];
            }
          });
          let video = stateRef.current;
          // video.playerElem = props.pageData.appSettings["player_type"];
          props.updatePlayerData({
            relatedVideos: [],
            playlistVideos: videos,
            currentVideo: video,
            deleteMessage: deleteMessage,
            deleteTitle: deleteTitle,
            liveStreamingURL: props.pageData.liveStreamingURL,
          });
        } else if (state.relatedVideos) {
          let videos = [...state.relatedVideos];
          videos.forEach((video, itemIndex) => {
            if (video.is_active_package != 1) {
              videos.splice(itemIndex, 1);
            } else {
              // videos[itemIndex].playerElem =
              //   props.pageData.appSettings["player_type"];
            }
          });
          let video = stateRef.current;
          // video.playerElem = props.pageData.appSettings["player_type"];

          props.updatePlayerData({
            relatedVideos: videos,
            playlistVideos: [],
            currentVideo: video,
            deleteMessage: deleteMessage,
            deleteTitle: deleteTitle,
            liveStreamingURL: props.pageData.liveStreamingURL,
          });
        } else {
          let video = stateRef.current;
          // video.playerElem = props.pageData.appSettings["player_type"];
          props.updatePlayerData({
            relatedVideos: [],
            playlistVideos: [],
            currentVideo: video,
            deleteMessage: deleteMessage,
            deleteTitle: deleteTitle,
            liveStreamingURL: props.pageData.liveStreamingURL,
          });
        }
      } else if (reduxStateSongId)
        props.updateAudioData({
          audios: reduxStateAudios,
          song_id: reduxStateSongId,
          pausesong_id: 0,
        });
    };
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
    setState({ submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({ error: response.data.error, submitting: false });
        } else {
          setState({ submitting: false, error: null });
          Router.push(`/watch/${props.pageData.id}`);
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };
  const playlistOpen = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      props.openPlaylist({ videoId: state.video.video_id, status: true });
    }
  };
  const showMore = (e) => {
    e.preventDefault();
    let showMoreText = "";
    let styles = {};
    if (state.collapse) {
      showMoreText = Translate(props, "Show less");
      styles = { visibility: "visible", overflow: "visible" };
    } else {
      showMoreText = Translate(props, "Show more");
      styles = { visibility: "visible", overflow: "hidden", height: "100px" };
    }
    setState({
      styles: styles,
      showMoreText: showMoreText,
      collapse: !state.collapse,
    });
  };
  const embedPlayer = (e) => {
    e.preventDefault();
  };
  const miniPlayer = (e) => {
    e.preventDefault();
    Router.back();
    //props.openPlayer(state.video.video_id, state.relatedVideos)
  };
  const openReport = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      props.openReport({
        status: true,
        id: state.video.custom_url,
        type: "videos",
      });
    }
  };
  const downloadBtn = (e) => {
    e.preventDefault();
  };
  const deleteVideo = (e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Once deleted, you will not be able to recover this video!"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("video_id", state.video.video_id);
        const url = "/videos/delete";
        axios
          .post(url, formData)
          .then((response) => {
            if (response.data.error) {
              swal(
                "Error",
                Translate(
                  props,
                  "Something went wrong, please try again later"
                ),
                "error"
              );
            } else {
              dispatch(
                openToast({
                  message: Translate(props, response.data.message),
                  type: "success",
                })
              );
              setState({ logout: true });
              Router.push(`/dashboard/videos`);
            }
          })
          .catch((err) => {
            swal(
              "Error",
              Translate(props, "Something went wrong, please try again later"),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  const fullWidth = (e) => {
    e.preventDefault();
    setState({ fullWidth: !state.fullWidth });
  };
  const donationFunction = () => {
    window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${
      state.video.paypal_email
    }&lc=US&item_name=${
      `Donation+to+` + encodeURI(state.video.displayname)
    }&no_note=0&cn=&currency_code=${
      props.pageData.appSettings["payment_default_currency"]
    }&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHosted'`;
  };
  const getItemIndex = (item_id) => {
    const videos = [...state.playlistVideos];
    const itemIndex = videos.findIndex((p) => p["video_id"] == item_id);
    return itemIndex;
  };
  const getRelatedVideosIndex = (item_id) => {
    const videos = [...state.relatedVideos];
    const itemIndex = videos.findIndex((p) => p["video_id"] == item_id);
    return itemIndex;
  };
  const goLive = () => {
    Router.push(`/live-streaming/${state.video.custom_url}`);
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
  const videoEnd = () => {
    let video_id = state.video.video_id;
    let itemIndex = 0;
    if (state.playlistVideos && state.playlistVideos.length) {
      itemIndex = getItemIndex(video_id);
      if (itemIndex > -1) {
        const items = [...state.playlistVideos];
        if (itemIndex + 2 <= state.playlistVideos.length) {
          itemIndex = itemIndex + 1;
        } else {
          itemIndex = 0;
        }
        Router.push(
          `/watch/${items[itemIndex]["custom_url"]}?list=${state.playlist.custom_url}`
        );
      }
    } else if (state.relatedVideos.length) {
      const isAutoplay = localStorage.getItem("autoplay");
      if (
        isAutoplay &&
        isAutoplay != "false" &&
        props.pageData.appSettings["video_autoplay"] == 1 &&
        props.pageData.appSettings["enable_iframely"] == 0
      ) {
        itemIndex = getRelatedVideosIndex(video_id);
        //first video played
        if (state.relatedVideos && state.relatedVideos.length) {
          let playedVideos = "";
          let playedString = state.playedVideos;
          if (playedString) {
            let played = playedString.split(",");
            played.push(state.video.video_id);
            playedVideos = played.join(",");
          } else {
            playedVideos = `${state.video.video_id}`;
          }
          const items = [...state.relatedVideos];
          Router.push(`/watch/${items[0]["custom_url"]}`);
        }
      }
    }
  };
  const mouseOut = () => {
    $(".expand").hide();
    $(".watermarkLogo").hide();
  };
  const mouseEnter = () => {
    if (state.video && state.video.status == 1) {
      $(".watermarkLogo").show();
      $(".expand").show();
    }
  };
  const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank" rel="nofollow">
      {text}
    </a>
  );
  const linkify = (inputText) => {
    inputText = inputText.replace(/&lt;br\/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br \/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br&gt;/g, " <br/>");
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(
      replacePattern1,
      '<a href="$1" target="_blank" rel="nofollow">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 =
      /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1" rel="nofollow">$1</a>'
    );

    return replacedText;
  };
  const purchaseClicked = () => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      setState({
        gateways: true,
        gatewaysURL: `/videos/purchase/${state.video.video_id}`,
      });
      //redirect to payment page
      //window.location.href = `/videos/purchase/${state.video.video_id}`
    }
  };
  useEffect(() => {
    if (
      props.router.query &&
      props.router.query.tab != state.tabType &&
      props.router.query.tab
    ) {
      setState({ tabType: props.router.query.tab });
    } else if (props.router.query && !props.router.query.tab) {
      if ($(".nav-tabs").children().length > 0) {
        let type = $(".nav-tabs")
          .children()
          .first()
          .find("a")
          .attr("aria-controls");
        setState({ tabType: type });
      }
    }
  }, [props.router.query]);
  const pushTab = (type, e) => {
    if (e) e.preventDefault();
    if (state.tabType == type || !state.video) {
      return;
    }
    let fUrl = props.router.asPath.split("?");
    let url = fUrl[0];
    let otherQueryParams = null;
    if (typeof URLSearchParams !== "undefined") {
      otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
      otherQueryParams.delete("tab");
    }
    let fURL =
      url +
      "?" +
      (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");
    Router.push(`${fURL}tab=${type}`, `${fURL}tab=${type}`, { shallow: true });
  };
  const updatePlayerPlayTime = (time) => {
    props.upatePlayerTime(time);
  };
  const scrollToSubscriptionPlans = () => {
    if (state.tabType != "plans") {
      setState({ tabType: "plans" });
      setTimeout(() => {
        plansSubscription.current.scrollIntoView();
      }, 200);
      return;
    }
    plansSubscription.current.scrollIntoView();
  };

  let currentPlaying = 0;
  if (state.playlistVideos) {
    currentPlaying = state.playlistVideos.findIndex(
      (p) => p["video_id"] == state.video.video_id
    );
    currentPlaying = currentPlaying + 1;
  }
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

  let userBalance = {};
  userBalance["package"] = {
    price: parseFloat(state.video ? state.video.price : 0),
  };
  let fUrl = props.router.asPath.split("?");
  let url = fUrl[0];
  let otherQueryParams = null;
  if (typeof URLSearchParams !== "undefined") {
    otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
    otherQueryParams.delete("tab");
  }
  let fURL =
    url +
    "?" +
    (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");
  let gatewaysHTML = "";

  if (state.gateways) {
    gatewaysHTML = (
      <Gateways
        {...props}
        success={() => {
          dispatch(
            openToast({
              message: Translate(props, "Payment done successfully."),
              type: "success",
            })
          );
          setTimeout(() => {
            let id = state.video.custom_url;
            Router.push(`/watch/${id}`);
          }, 1000);
        }}
        successBank={() => {
          dispatch(
            openToast({
              message: Translate(
                props,
                "Your bank request has been successfully sent, you will get notified once it's approved"
              ),
              type: "success",
            })
          );
          setState({ gateways: null });
        }}
        bank_price={state.video.price}
        bank_type="video_purchase"
        bank_resource_type="video"
        bank_resource_id={state.video.custom_url}
        tokenURL={`videos/successulPayment/${state.video.video_id}`}
        closePopup={() => setState({ gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  let videoImage = state.video ? props.pageData.imageSuffix+state.video.image : "";

  if (state.video) {
    if (
      props.pageData.livestreamingtype == 0 &&
      state.video.mediaserver_stream_id &&
      !state.video.orgImage &&
      state.video.is_livestreaming == 1 &&
      parseInt(props.pageData.appSettings["antserver_media_hlssupported"]) == 1
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
        videoImage = `${props.pageData.liveStreamingCDNURL}${state.video.image
          .replace(`/LiveApp`, "")
          .replace(`/WebRTCAppEE`, "")}`;
      } else
        videoImage = `${props.pageData.liveStreamingServerURL}:5443${state.video.image}`;
    }
  }

  //scheduled timer
  let scheduledTimerData = [];
  let days = state.scheduledEndTimeDay;
  let hours = state.scheduledEndTimeHours;
  let minutes = state.scheduledEndTimeMinutes;
  let seconds = state.scheduledEndTimeSeconds;

  if (days > 0) {
    scheduledTimerData.push(days + " ");
    scheduledTimerData.push(props.t("day_count", { count: days }));
  }
  if (hours > 0) {
    scheduledTimerData.push(hours + " ");
    scheduledTimerData.push(props.t("hour_count", { count: hours }));
  }
  if (minutes > 0) {
    scheduledTimerData.push(minutes + " ");
    scheduledTimerData.push(props.t("minute_count", { count: minutes }));
  }
  if (seconds > 0 && days == 0 && hours == 0 && minutes == 0) {
    scheduledTimerData.push(seconds + " ");
    scheduledTimerData.push(props.t("second_count", { count: seconds }));
  }
  return (
    <React.Fragment>
      {state.password ? (
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
      ) : (
        <React.Fragment>
          {gatewaysHTML}
          <div className="details-video-wrap">
            <div className="container">
              <div className="row">
                {state.adult ? (
                  <div className={`col-xl-9 col-lg-8`}>
                    <div className="adult-wrapper">
                      {Translate(
                        props,
                        "This video contains adult content.To view this video, Turn on adult content setting from site footer."
                      )}
                    </div>
                  </div>
                ) : (
                  <React.Fragment>
                    {state.video && state.video.approve != 1 ? (
                      <div className="col-xl-9 col-lg-8  approval-pending">
                        <div className="generalErrors">
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
                      </div>
                    ) : null}
                    <div
                      id="background_theater"
                      style={{ display: state.fullWidth ? "block" : "none" }}
                    ></div>
                    <div
                      className={`${
                        state.fullWidth ? "col-lg-12" : "col-xl-9 col-lg-8"
                      } videoPlayerHeight`}
                    >
                      {state.giftData && state.giftData.length > 0 && (
                        <div className="giftMessg-col mt-5 mx-3">
                          <div className="d-flex flex-column gap-3 giftMessgs">
                            {state.giftData.map((result) => {
                              return result.started == 1 ? (
                                <div
                                  key={result.gift_id + "-" + result.user_id}
                                  className="align-items-center d-flex gap-3 giftMessg-row"
                                >
                                  <div className="align-items-center d-flex gap-1">
                                    <div className="circleImg-40 flex-shrink-0">
                                      <img
                                        src={
                                          props.pageData.imageSuffix +
                                          result.ownerInfo.image
                                        }
                                        alt=""
                                      />
                                    </div>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex gap-1 font-size-18 user-title">
                                        {result.ownerInfo.displayname}
                                      </div>
                                      <span className="font-size-16 gift-title">
                                        {result.ownerInfo.title}
                                      </span>
                                    </div>
                                    <div className="giftSentImg">
                                      <img
                                        src={
                                          props.pageData.imageSuffix +
                                          result.ownerInfo.giftImage
                                        }
                                        alt=""
                                      />
                                    </div>
                                  </div>
                                  <div className="align-items-baseline d-flex gap-2">
                                    <div>X</div>
                                    <span className="coinTotal">
                                      {result.ownerInfo.count}
                                    </span>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      {state.giftData && state.giftData.length > 0 && (
                        <div className="align-items-center d-flex justify-content-center w-100 h-100 position-absolute">
                          {state.giftData.map((result) => {
                            return result.started == 1 ? (
                              <img
                                src={
                                  props.pageData.imageSuffix +
                                  result.ownerInfo.giftImage
                                }
                                style={{ width: "50px", height: "50px",zIndex:8 }}
                                alt=""
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                      {!state.needSubscription ? (
                        <div onMouseEnter={mouseEnter} onMouseLeave={mouseOut}>
                          <div className="videoPlayer">
                            <React.Fragment>
                              {state.video &&
                              (state.video.type == 10 ||
                                state.video.type == 11) &&
                              parseFloat(state.video.price) > 0 &&
                              !state.video.videoPurchased ? (
                                <div key="purchasevideo_purchase">
                                  <div
                                    data-vjs-player
                                    className="video_player_cnt player-wrapper"
                                    style={{
                                      width: "100%",
                                      position: "relative",
                                    }}
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
                                            Currency({
                                              ...props,
                                              ...userBalance,
                                            })}{" "}
                                        </button>
                                      </h5>
                                    </div>
                                  </div>
                                </div>
                              ) : state.video.is_livestreaming == 1 &&
                                state.video.type == 11 ? (
                                <MediaStreaming
                                  {...props}
                                  getHeight={getHeight}
                                  resizeWindow={updateWindowDimensions}
                                  banners={props.pageData.banners}
                                  brands={props.pageData.brands}
                                  needSubscription={state.needSubscription}
                                  width={state.width}
                                  videoElem={state.video}
                                  viewer={state.video.total_viewer}
                                  height={
                                    props.pageData.fromAPP
                                      ? "200px"
                                      : state.width > 992
                                      ? "550px"
                                      : "220px"
                                  }
                                  custom_url={state.video.custom_url}
                                  streamingId={
                                    state.video.mediaserver_stream_id
                                  }
                                  currentTime={props.pageData.currentTime}
                                  role="audience"
                                  imageSuffix={props.pageData.imageSuffix}
                                  video={state.video}
                                />
                              ) : state.video.is_livestreaming == 1 &&
                                state.video.type == 10 ? (
                                <StartLiveStreaming
                                  {...props}
                                  getHeight={getHeight}
                                  needSubscription={state.needSubscription}
                                  width={state.width}
                                  videoElem={state.video}
                                  viewer={state.video.total_viewer}
                                  height={
                                    props.pageData.fromAPP
                                      ? "200px"
                                      : state.width > 992
                                      ? "550px"
                                      : "220px"
                                  }
                                  custom_url={state.video.custom_url}
                                  channel={state.video.channel_name}
                                  currentTime={props.pageData.currentTime}
                                  role="audience"
                                  imageSuffix={props.pageData.imageSuffix}
                                  video={state.video}
                                />
                              ) : props.pageData.appSettings["player_type"] ==
                                  "element" &&
                                ((state.video.type == 3 &&
                                  state.video.video_location) ||
                                  (state.video.type == 1 &&
                                    state.video.code)) &&
                                !state.video.scheduled &&
                                state.video.approve == 1 ? (
                                <MediaElementPlayer
                                  {...props}
                                  upatePlayerTime={updatePlayerPlayTime}
                                  purchaseClicked={purchaseClicked}
                                  getHeight={getHeight}
                                  ended={videoEnd}
                                  height={
                                    props.pageData.fromAPP
                                      ? "200px"
                                      : state.width > 992
                                      ? "550px"
                                      : "220px"
                                  }
                                  userAdVideo={state.userAdVideo}
                                  adminAdVideo={state.adminAdVideo}
                                  playlistVideos={state.playlistVideos}
                                  currentPlaying={state.currentPlaying}
                                  imageSuffix={props.pageData.imageSuffix}
                                  video={state.video}
                                />
                              ) : ((state.video.type == 3 &&
                                  state.video.video_location) ||
                                  (state.video.type == 11 &&
                                    state.video.code)) &&
                                !state.video.scheduled &&
                                state.video.approve == 1 ? (
                                <Player
                                  {...props}
                                  purchaseClicked={purchaseClicked}
                                  upatePlayerTime={updatePlayerPlayTime}
                                  getHeight={getHeight}
                                  ended={videoEnd}
                                  height={
                                    props.pageData.fromAPP
                                      ? "200px"
                                      : state.width > 992
                                      ? "550px"
                                      : "220px"
                                  }
                                  userAdVideo={state.userAdVideo}
                                  adminAdVideo={state.adminAdVideo}
                                  playlistVideos={state.playlistVideos}
                                  currentPlaying={state.currentPlaying}
                                  imageSuffix={props.pageData.imageSuffix}
                                  video={state.video}
                                />
                              ) : (!state.video.scheduled ||
                                  state.video.approve == 1) &&
                                state.video.type != 11 ? (
                                <OutsidePlayer
                                  {...props}
                                  liveStreamingURL={
                                    props.pageData.liveStreamingURL
                                  }
                                  upatePlayerTime={updatePlayerPlayTime}
                                  getHeight={getHeight}
                                  ended={videoEnd}
                                  height={
                                    props.pageData.fromAPP
                                      ? "200px"
                                      : state.width > 992
                                      ? "550px"
                                      : "220px"
                                  }
                                  playlistVideos={state.playlistVideos}
                                  currentPlaying={state.currentPlaying}
                                  imageSuffix={props.pageData.imageSuffix}
                                  video={state.video}
                                />
                              ) : (
                                <div className="scheduled-cnt player-wrapper">
                                  <img
                                    className={"scheduled-video-image"}
                                    src={videoImage}
                                  />
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
                                          <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                          ></circle>
                                        </svg>
                                      </span>
                                      <span className="date">
                                        <div className="text">
                                          {state.video.scheduled
                                            ? props.t("Live in ")
                                            : null}
                                          {state.video.scheduled ? (
                                            !state.scheduledEndTime ? (
                                              scheduledTimerData.join(" ")
                                            ) : (
                                              <span
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    state.scheduledEndTime,
                                                }}
                                              ></span>
                                            )
                                          ) : (
                                            <span>
                                              {props.t("Start in few seconds")}
                                            </span>
                                          )}
                                        </div>
                                        {state.video.scheduled ? (
                                          <div className="subitle">
                                            {
                                              <span
                                                dangerouslySetInnerHTML={{
                                                  __html: Date(
                                                    props,
                                                    state.video.scheduled,
                                                    props.initialLanguage,
                                                    "MMMM Do YYYY, hh:mm A",
                                                    props.pageData
                                                      .loggedInUserDetails
                                                      ? props.pageData
                                                          .loggedInUserDetails
                                                          .timezone
                                                      : props.pageData
                                                          .defaultTimezone
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
                                                {state.video
                                                  .scheduled_video_id ? (
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
                          {state.width > 992 ? (
                            <div className="expand" onClick={fullWidth}>
                              <span className="home-theater">
                                <i
                                  className="material-icons"
                                  data-icon="open_in_full"
                                ></i>
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="videoPlayer player-wrapper">
                          <div className="subscription-update-plan-cnt">
                            <div className="subscription-update-plan-title">
                              {state.needSubscription.type == "upgrade"
                                ? props.t(
                                    "To watch more content, kindly upgrade your Subcription Plan."
                                  )
                                : props.t(
                                    "To watch more content, kindly Subscribe."
                                  )}
                              {
                                <button
                                  className="mb-2"
                                  onClick={scrollToSubscriptionPlans}
                                >
                                  {props.t("Subscription Plans")}
                                </button>
                              }
                              {userBalance.package.price > 0 ? (
                                <React.Fragment>
                                  {props.t("or")}
                                  {
                                    <button onClick={purchaseClicked}>
                                      {props
                                        .t(
                                          "Pay {{price}} to watch this video.",
                                          {
                                            price: Currency({
                                              ...props,
                                              ...userBalance,
                                            }),
                                          }
                                        )
                                        .replace("<!-- -->", "")}
                                    </button>
                                  }
                                </React.Fragment>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                      {!state.needSubscription && state.video.approve == 1 ? (
                        <div
                          className="bntfullWidht video-options"
                          style={{ display: "none" }}
                        >
                          {/* <a href="#" onClick={miniPlayer}>
                                                        <i className="fas fa-compress"></i> {Translate(props,'Mini Player')}
                                                    </a> */}
                          <a href="#" onClick={embedPlayer}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"
                              ></path>
                            </svg>{" "}
                            {Translate(props, "Embed")}
                          </a>
                        </div>
                      ) : null}
                    </div>

                    {!state.needSubscription &&
                    state.width <= 992 &&
                    state.video &&
                    state.video.approve == 1 &&
                    state.video.enable_chat == 1 &&
                    ((state.video.is_livestreaming == 1 &&
                      (state.video.channel_name ||
                        state.video.mediaserver_stream_id)) ||
                      state.video.scheduled) ? (
                      <div className="col-lg-8 col-xl-9">
                        <div className="ls_sidbar top_video_chat">
                          <Chat
                            {...props}
                            channel={state.video.channel_name}
                            streamId={state.video.mediaserver_stream_id}
                            custom_url={state.video.custom_url}
                            comments={
                              state.video.chatcomments
                                ? state.video.chatcomments
                                : []
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="col-lg-8 col-xl-9">
                      <div className="videoDetailsWrap-content">
                        <a
                          className="videoName"
                          href="#"
                          onClick={(e) => e.preventDefault()}
                        >
                          {<CensorWord {...props} text={state.video.title} />}
                        </a>

                        <div className="videoDetailsLikeWatch">
                          <div className="watchBox">
                            <span title={Translate(props, "Views")}>
                              {state.video.view_count + " "}{" "}
                              {props.t("view_count", {
                                count: state.video.view_count
                                  ? state.video.view_count
                                  : 0,
                              })}{" "}
                            </span>
                          </div>

                          <div className="vLDetailLikeShare">
                            <div className="LikeDislikeWrap">
                              <ul className="LikeDislikeList">
                                {state.video.approve == 1 ? (
                                  <React.Fragment>
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
                                    <li>
                                      <Dislike
                                        icon={true}
                                        {...props}
                                        dislike_count={
                                          state.video.dislike_count
                                        }
                                        item={state.video}
                                        type="video"
                                        id={state.video.video_id}
                                      />
                                      {"  "}
                                    </li>
                                    <li>
                                      <Favourite
                                        icon={true}
                                        {...props}
                                        favourite_count={
                                          state.video.favourite_count
                                        }
                                        item={state.video}
                                        type="video"
                                        id={state.video.video_id}
                                      />
                                      {"  "}
                                    </li>
                                  </React.Fragment>
                                ) : null}
                                {state.video.approve == 1 ? (
                                  props.pageData.appSettings[
                                    "enable_playlist"
                                  ] == 1 &&
                                  (!props.pageData.loggedInUserDetails ||
                                    props.pageData.levelPermissions[
                                      "playlist.create"
                                    ] == 1) ? (
                                    <li>
                                      <a
                                        className="addPlaylist"
                                        title={Translate(
                                          props,
                                          "Save to playlist"
                                        )}
                                        onClick={playlistOpen}
                                        href="#"
                                      >
                                        <span
                                          className="material-icons"
                                          data-icon="playlist_add"
                                        ></span>
                                      </a>
                                    </li>
                                  ) : null
                                ) : null}
                                {state.video.approve == 1 &&
                                props.pageData.appSettings[
                                  "video_embed_code"
                                ] == 1 ? (
                                  <li>
                                    <a
                                      className="embedvideo"
                                      title={Translate(props, "Embed")}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setState({
                                          embed: state.embed ? false : true,
                                        });
                                      }}
                                      href="#"
                                    >
                                      <span
                                        className="material-icons"
                                        data-icon="code"
                                      ></span>
                                    </a>
                                  </li>
                                ) : null}
                                {state.video.approve == 1 ? (
                                  <SocialShare
                                    {...props}
                                    hideTitle={true}
                                    className="video_share"
                                    buttonHeightWidth="30"
                                    tags={state.video.tags}
                                    url={`/watch/${state.video.custom_url}`}
                                    title={state.video.title}
                                    imageSuffix={props.pageData.imageSuffix}
                                    media={state.video.image}
                                  />
                                ) : null}
                                <li>
                                  <div className="dropdown TitleRightDropdown">
                                    <a href="#" data-bs-toggle="dropdown">
                                      <span
                                        className="material-icons"
                                        data-icon="more_vert"
                                      ></span>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-right edit-options">
                                      {state.video.canEdit ? (
                                        state.video.scheduled ||
                                        (state.video.approve == 0 &&
                                          state.video.type == 11) ? (
                                          <li>
                                            <Link
                                              href="/create-livestreaming"
                                              customParam={`id=${state.video.custom_url}`}
                                              as={`/live-streaming/${state.video.custom_url}`}
                                            >
                                              <a>
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
                                                href={`/create-video/${state.video.custom_url}`}
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
                                      {state.video.canDelete ? (
                                        <li>
                                          <a onClick={deleteVideo} href="#">
                                            <span
                                              className="material-icons"
                                              data-icon="delete"
                                            ></span>
                                            {Translate(props, "Delete")}
                                          </a>
                                        </li>
                                      ) : null}
                                      {props.pageData &&
                                      props.pageData.levelPermissions &&
                                      props.pageData.levelPermissions[
                                        "video.download"
                                      ] == 1 &&
                                      state.video.downloadFiles ? (
                                        <li>
                                          <a
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setState({
                                                download: state.download
                                                  ? false
                                                  : true,
                                              });
                                            }}
                                            href="#"
                                          >
                                            <span
                                              className="material-icons"
                                              data-icon="download"
                                            ></span>
                                            {Translate(props, "Download Video")}
                                          </a>
                                        </li>
                                      ) : null}

                                      {state.video.approve == 1 &&
                                      !state.video.canEdit ? (
                                        <li>
                                          <a href="#" onClick={openReport}>
                                            <span
                                              className="material-icons"
                                              data-icon="flag"
                                            ></span>
                                            {Translate(props, "Report")}
                                          </a>
                                        </li>
                                      ) : null}
                                    </ul>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        {state.video &&
                        state.video.downloadFiles &&
                        state.download ? (
                          <div className="videoDownload">
                            {state.video.downloadFiles.map((item) => {
                              let url =
                                item.url.indexOf("http://") == -1 &&
                                item.url.indexOf("https://") == -1
                                  ? props.pageData.imageSuffix + item.url
                                  : item.url;
                              return (
                                <a
                                  key={item.key}
                                  href={url}
                                  download
                                  target="_blank"
                                >
                                  {item.key}
                                </a>
                              );
                            })}
                          </div>
                        ) : null}
                        {state.embed ? (
                          <div className="videoEmbed">
                            <textarea
                              name="embed"
                              className="form-control"
                              onChange={() => {}}
                              value={`<iframe src="${config.app_server}/embed/${state.video.custom_url}" frameborder="0" width="700" height="400" allowfullscreen><iframe>`}
                            ></textarea>
                          </div>
                        ) : null}

                        {props.pageData.appSettings["video_tip"] == 1 &&
                        state.video &&
                        state.video.tips ? (
                          <Donation
                            {...props}
                            item={state.video}
                            custom_url={state.video.custom_url}
                            item_id={state.video.video_id}
                            item_type="video"
                          />
                        ) : null}

                        {props.pageData.appSettings["enable_gifts"] == 1 &&
                        state.video &&
                        state.video.gifts ? (
                          <Gifts
                            {...props}
                            item={state.video}
                            custom_url={state.video.custom_url}
                            item_id={state.video.video_id}
                            item_type="video"
                          />
                        ) : null}

                        <div className="videoDetailsUserInfo">
                          <div className="userInfoSubs">
                            <div className="UserInfo">
                              <div className="img">
                                <Link
                                  href="/member"
                                  customParam={`id=${state.video.owner.username}`}
                                  as={`/${state.video.owner.username}`}
                                >
                                  <a href={`/${state.video.owner.username}`}>
                                    <Image
                                      height="50"
                                      width="50"
                                      title={state.video.owner.displayname}
                                      image={state.video.owner.avtar}
                                      imageSuffix={props.pageData.imageSuffix}
                                      siteURL={props.pageData.siteURL}
                                    />
                                  </a>
                                </Link>
                              </div>
                              <div className="content">
                                <Link
                                  href="/member"
                                  customParam={`id=${state.video.owner.username}`}
                                  as={`/${state.video.owner.username}`}
                                >
                                  <a
                                    className="UserName"
                                    href={`/${state.video.owner.username}`}
                                  >
                                    <React.Fragment>
                                      {state.video.owner.displayname}
                                      {props.pageData.appSettings[
                                        "member_verification"
                                      ] == 1 && state.video.owner.verified ? (
                                        <span
                                          className="verifiedUser"
                                          title="verified"
                                        >
                                          <span
                                            className="material-icons"
                                            data-icon="check"
                                          ></span>
                                        </span>
                                      ) : null}
                                    </React.Fragment>
                                  </a>
                                </Link>
                                <span>
                                  <Timeago {...props}>
                                    {state.video.creation_date}
                                  </Timeago>
                                </span>
                              </div>
                            </div>
                            <div className="userSubs">
                              <MemberFollow
                                {...props}
                                type="members"
                                user={state.video.owner}
                                user_id={state.video.owner.follower_id}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="details-tab">
                          <ul
                            className="nav nav-tabs"
                            id="myTab"
                            role="tablist"
                          >
                            {state.needSubscription ? (
                              <li className="nav-item">
                                <a
                                  className={`nav-link${
                                    state.tabType == "plans" ? " active" : ""
                                  }`}
                                  onClick={() => pushTab("plans")}
                                  data-bs-toggle="tab"
                                  href={`${fURL}?tab=plans`}
                                  ref={plansSubscription}
                                  role="tab"
                                  aria-controls="plans"
                                  aria-selected="false"
                                >
                                  {Translate(props, "Choose Plan")}
                                </a>
                              </li>
                            ) : null}
                            <li className="nav-item">
                              <a
                                className={`nav-link${
                                  state.tabType == "about" ? " active" : ""
                                }`}
                                onClick={() => pushTab("about")}
                                data-bs-toggle="tab"
                                href={`${fURL}?tab=about`}
                                role="tab"
                                aria-controls="about"
                                aria-selected="true"
                              >
                                {Translate(props, "About")}
                              </a>
                            </li>
                            {state.video &&
                            state.video.donors &&
                            state.video.donors.results.length ? (
                              <li className="nav-item">
                                <a
                                  className={`nav-link${
                                    state.tabType == "donors" ? " active" : ""
                                  }`}
                                  onClick={() => pushTab("donors")}
                                  data-bs-toggle="tab"
                                  href={`${fURL}?tab=donors`}
                                  role="tab"
                                  aria-controls="donors"
                                  aria-selected="true"
                                >
                                  {Translate(props, "Donors")}
                                </a>
                              </li>
                            ) : null}
                            {state.video &&
                            state.video.giftSenders &&
                            state.video.giftSenders.results.length ? (
                              <li className="nav-item">
                                <a
                                  className={`nav-link${
                                    state.tabType == "gift-senders"
                                      ? " active"
                                      : ""
                                  }`}
                                  onClick={() => pushTab("gift-senders")}
                                  data-bs-toggle="tab"
                                  href={`${fURL}?tab=gift-senders`}
                                  role="tab"
                                  aria-controls="gift-senders"
                                  aria-selected="true"
                                >
                                  {Translate(props, "Gift Senders")}
                                </a>
                              </li>
                            ) : null}
                            {state.video &&
                            state.video.artists &&
                            state.video.artists.results.length ? (
                              <li className="nav-item">
                                <a
                                  className={`nav-link${
                                    state.tabType == "artists" ? " active" : ""
                                  }`}
                                  onClick={() => pushTab("artists")}
                                  data-bs-toggle="tab"
                                  href={`${fURL}?tab=artists`}
                                  role="tab"
                                  aria-controls="artists"
                                  aria-selected="true"
                                >
                                  {Translate(props, "Artists")}
                                </a>
                              </li>
                            ) : null}
                            {props.pageData.appSettings[`${"video_comment"}`] ==
                              1 &&
                            state.video &&
                            state.video.approve == 1 ? (
                              <li className="nav-item">
                                <a
                                  className={`nav-link${
                                    state.tabType == "comments" ? " active" : ""
                                  }`}
                                  onClick={() => pushTab("comments")}
                                  data-bs-toggle="tab"
                                  href={`${fURL}?tab=comments`}
                                  role="tab"
                                  aria-controls="comments"
                                  aria-selected="true"
                                >{`${Translate(props, "Comments")}`}</a>
                              </li>
                            ) : null}
                          </ul>
                          <div className="tab-content" id="myTabContent">
                            {state.needSubscription ? (
                              <div
                                className={`tab-pane fade${
                                  state.tabType == "plans" ? " active show" : ""
                                }`}
                                id="plans"
                                role="tabpanel"
                              >
                                <div className="details-tab-box">
                                  <p className="plan-upgrade-subscribe">
                                    {state.needSubscription.type == "upgrade"
                                      ? props.t(
                                          "To watch more content, kindly upgrade your Subcription Plan."
                                        )
                                      : props.t(
                                          "To watch more content, kindly Subscribe."
                                        )}
                                  </p>
                                  <Plans
                                    {...props}
                                    userSubscription={
                                      state.needSubscription.loggedin_package_id
                                        ? true
                                        : false
                                    }
                                    userSubscriptionID={
                                      state.needSubscription.loggedin_package_id
                                    }
                                    itemObj={state.video}
                                    member={state.video.owner}
                                    user_id={state.video.owner_id}
                                    plans={state.plans}
                                  />
                                </div>
                              </div>
                            ) : null}
                            <div
                              className={`tab-pane fade${
                                state.tabType == "about" ? " active show" : ""
                              }`}
                              id="about"
                              role="tabpanel"
                            >
                              <div className="details-tab-box">
                                {props.pageData.appSettings[
                                  `${"video_rating"}`
                                ] == 1 && state.video.approve == 1 ? (
                                  <div className="animated-rater">
                                    <div className="tabInTitle">
                                      <h6>{Translate(props, "Rating")}</h6>
                                      <div className="channel_description flexItemSpaceRight15">
                                        <Rating
                                          {...props}
                                          rating={state.video.rating}
                                          type="video"
                                          id={state.video.video_id}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                                {props.pageData.appSettings["video_donation"] &&
                                state.video &&
                                state.video.approve == 1 &&
                                state.video.donation &&
                                state.video.paypal_email &&
                                (!props.pageData.loggedInUserDetails ||
                                  (props.pageData.loggedInUserDetails &&
                                    props.pageData.loggedInUserDetails
                                      .user_id != state.video.owner_id)) ? (
                                  <div className="animated-rater">
                                    <div className="tabInTitle">
                                      <h6>{Translate(props, "Donate")}</h6>
                                    </div>
                                    <div className="channel_description">
                                      <button onClick={donationFunction}>
                                        {Translate(props, "Donate")}
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                                {state.video.description ? (
                                  <React.Fragment>
                                    <div className="tabInTitle">
                                      <h6>{Translate(props, "Description")}</h6>
                                    </div>
                                    <div
                                      className="channel_description"
                                      id="VideoDetailsDescp"
                                      style={{
                                        ...state.styles,
                                        whiteSpace: "pre-line",
                                      }}
                                      dangerouslySetInnerHTML={{
                                        __html: linkify(
                                          state.video.description
                                        ),
                                      }}
                                    >
                                      {/* <Linkify componentDecorator={componentDecorator}>{state.video.description}</Linkify> */}
                                    </div>
                                    {state.showMore ? (
                                      <div className="VideoDetailsDescpBtn text-center">
                                        <a
                                          href="#"
                                          onClick={showMore}
                                          className="morelink"
                                        >
                                          {Translate(props, state.showMoreText)}
                                        </a>
                                      </div>
                                    ) : null}
                                  </React.Fragment>
                                ) : null}

                                {state.video.category ? (
                                  <React.Fragment>
                                    <div className="tabInTitle categories_cnt">
                                      <h6>{Translate(props, "Category")}</h6>
                                      <div className="boxInLink">
                                        {
                                          <Link
                                            href={`/category`}
                                            customParam={
                                              `type=video&id=` +
                                              state.video.category.slug
                                            }
                                            as={
                                              `/video/category/` +
                                              state.video.category.slug
                                            }
                                          >
                                            <a>
                                              {
                                                <CensorWord
                                                  {...props}
                                                  text={
                                                    state.video.category.title
                                                  }
                                                />
                                              }
                                            </a>
                                          </Link>
                                        }
                                      </div>
                                      {state.video.subcategory ? (
                                        <React.Fragment>
                                          {/* <span> >> </span> */}
                                          <div className="boxInLink">
                                            <Link
                                              href={`/category`}
                                              customParam={
                                                `type=video&id=` +
                                                state.video.subcategory.slug
                                              }
                                              as={
                                                `/video/category/` +
                                                state.video.subcategory.slug
                                              }
                                            >
                                              <a>
                                                {
                                                  <CensorWord
                                                    {...props}
                                                    text={
                                                      state.video.subcategory
                                                        .title
                                                    }
                                                  />
                                                }
                                              </a>
                                            </Link>
                                          </div>
                                          {state.video.subsubcategory ? (
                                            <React.Fragment>
                                              {/* <span> >> </span> */}
                                              <div className="boxInLink">
                                                <Link
                                                  href={`/category`}
                                                  customParam={
                                                    `type=video&id=` +
                                                    state.video.subsubcategory
                                                      .slug
                                                  }
                                                  as={
                                                    `/video/category/` +
                                                    state.video.subsubcategory
                                                      .slug
                                                  }
                                                >
                                                  <a>
                                                    {
                                                      <CensorWord
                                                        {...props}
                                                        text={
                                                          state.video
                                                            .subsubcategory
                                                            .title
                                                        }
                                                      />
                                                    }
                                                  </a>
                                                </Link>
                                              </div>
                                            </React.Fragment>
                                          ) : null}
                                        </React.Fragment>
                                      ) : null}
                                    </div>
                                  </React.Fragment>
                                ) : null}

                                {state.video.tags && state.video.tags != "" ? (
                                  <div className="blogtagListWrap">
                                    <div className="tabInTitle">
                                      <h6>{Translate(props, "Tags")}</h6>
                                      <ul className="TabTagList clearfix">
                                        {state.video.tags
                                          .split(",")
                                          .map((tag, index) => {
                                            if (!state.showAll && index < 6) {
                                              return (
                                                <li key={tag}>
                                                  <Link
                                                    href="/videos"
                                                    customParam={`tag=${tag}`}
                                                    as={`/videos?tag=${tag}`}
                                                  >
                                                    <a>
                                                      {
                                                        <CensorWord
                                                          {...props}
                                                          text={tag}
                                                        />
                                                      }
                                                    </a>
                                                  </Link>
                                                </li>
                                              );
                                            } else if (
                                              !state.showAll &&
                                              index == 6
                                            ) {
                                              return (
                                                <li key="9023">
                                                  <a
                                                    href="#"
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      setState({
                                                        showAll: true,
                                                      });
                                                    }}
                                                  >
                                                    <span
                                                      className="material-icons"
                                                      data-icon="expand_more"
                                                    ></span>
                                                  </a>
                                                </li>
                                              );
                                            } else if (state.showAll) {
                                              return (
                                                <li key={tag}>
                                                  <Link
                                                    href="/videos"
                                                    customParam={`tag=${tag}`}
                                                    as={`/videos?tag=${tag}`}
                                                  >
                                                    <a>
                                                      {
                                                        <CensorWord
                                                          {...props}
                                                          text={tag}
                                                        />
                                                      }
                                                    </a>
                                                  </Link>
                                                </li>
                                              );
                                            }
                                          })}
                                      </ul>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            {state.video.donors &&
                            state.video.donors.results.length ? (
                              <div
                                className={`tab-pane fade${
                                  state.tabType == "donors"
                                    ? " active show"
                                    : ""
                                }`}
                                id="donors"
                                role="tabpanel"
                              >
                                <div className="details-tab-box">
                                  <Members
                                    {...props}
                                    globalSearch={true}
                                    channel_members={state.video.donors.results}
                                    channel_pagging={state.video.donors.pagging}
                                    video_id={state.video.video_id}
                                  />
                                </div>
                              </div>
                            ) : null}
                            {state.video.giftSenders &&
                            state.video.giftSenders.results.length ? (
                              <div
                                className={`tab-pane fade${
                                  state.tabType == "gift-senders"
                                    ? " active show"
                                    : ""
                                }`}
                                id="gift-senders"
                                role="tabpanel"
                              >
                                <div className="details-tab-box">
                                  <GiftsMembers
                                    {...props}
                                    members={state.video.giftSenders.results}
                                    pagging={state.video.giftSenders.pagging}
                                    video_id={state.video.video_id}
                                  />
                                </div>
                              </div>
                            ) : null}
                            {props.pageData.appSettings[`${"video_comment"}`] ==
                              1 && state.video.approve == 1 ? (
                              <div
                                className={`tab-pane fade${
                                  state.tabType == "comments"
                                    ? " active show"
                                    : ""
                                }`}
                                id="comments"
                                role="tabpanel"
                              >
                                <div className="details-tab-box">
                                  <Comment
                                    {...props}
                                    owner_id={state.video.owner_id}
                                    hideTitle={true}
                                    appSettings={props.pageData.appSettings}
                                    commentType="video"
                                    type="videos"
                                    comment_item_id={state.video.video_id}
                                  />
                                </div>
                              </div>
                            ) : null}
                            {state.video.artists &&
                            state.video.artists.results.length ? (
                              <div
                                className={`tab-pane fade${
                                  state.tabType == "artists"
                                    ? " active show"
                                    : ""
                                }`}
                                id="artists"
                                role="tabpanel"
                              >
                                <div className="details-tab-box">
                                  <Artists
                                    showData={4}
                                    className="artist_img"
                                    fromVideo={true}
                                    canDelete={state.video.canDelete}
                                    {...props}
                                    artists={state.video.artists.results}
                                    pagging={state.video.artists.pagging}
                                    video_id={state.video.video_id}
                                  />
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                )}
                <div
                  className="col-xl-3 col-lg-4 videoSidebar"
                  style={{
                    marginTop:
                      !state.fullWidth && !state.adult ? state.height : "0px",
                  }}
                >
                  {state.playlistVideos ? (
                    <div className="PlaylistSidebar">
                      <div className="playlist_name">
                        <p>
                          {
                            <CensorWord
                              {...props}
                              text={state.playlist.title}
                            />
                          }
                        </p>
                        <p>
                          <Link
                            href="/member"
                            customParam={`id=${state.playlist.owner.username}`}
                            as={`/${state.playlist.owner.username}`}
                          >
                            <a>{state.playlist.owner.displayname}</a>
                          </Link>
                          {" - " +
                            currentPlaying +
                            " / " +
                            state.playlistVideos.length}
                        </p>
                      </div>
                      <div className="playlist_videos_list">
                        <div className="playlist_videos">
                          {state.playlistVideos.map((video, index) => {
                            return (
                              <div
                                className={`playlistscroll playlistGroup${
                                  currentPlaying == index + 1 ? " active" : ""
                                }`}
                                key={index}
                              >
                                <div>{index + 1}</div>
                                <div className="sidevideoWrap">
                                  <div className="videoImg">
                                    <Link
                                      href="/watch"
                                      customParam={`id=${video.custom_url}&list=${state.playlist.custom_url}`}
                                      as={`/watch/${video.custom_url}?list=${state.playlist.custom_url}`}
                                    >
                                      <a>
                                        <Image
                                          title={video.title}
                                          image={video.image}
                                          imageSuffix={
                                            props.pageData.imageSuffix
                                          }
                                          siteURL={props.pageData.siteURL}
                                        />
                                      </a>
                                    </Link>
                                    <span className="time">
                                      {video.duration ? video.duration : null}
                                    </span>
                                    <span
                                      className="watchPlayBtn"
                                      style={{ display: "none" }}
                                    >
                                      <WatchLater
                                        className="watchLater"
                                        icon={true}
                                        {...props}
                                        item={video}
                                        id={video.video_id}
                                      />
                                      <Link
                                        href="/watch"
                                        customParam={`id=${video.custom_url}&list=${state.playlist.custom_url}`}
                                        as={`/watch/${video.custom_url}?list=${state.playlist.custom_url}`}
                                      >
                                        <a>
                                          <span
                                            className="material-icons"
                                            data-icon="play_arrow"
                                          ></span>
                                        </a>
                                      </Link>
                                    </span>
                                  </div>
                                  <div className="sideVideoContent">
                                    <Link
                                      href="/watch"
                                      customParam={`id=${video.custom_url}&list=${state.playlist.custom_url}`}
                                      as={`/watch/${video.custom_url}?list=${state.playlist.custom_url}`}
                                    >
                                      <a className="videoTitle">
                                        {
                                          <CensorWord
                                            {...props}
                                            text={video.title}
                                          />
                                        }
                                      </a>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {!state.needSubscription &&
                  state.width > 992 &&
                  state.video &&
                  state.video.approve == 1 &&
                  state.video.enable_chat == 1 &&
                  ((state.video.is_livestreaming == 1 &&
                    (state.video.channel_name ||
                      state.video.mediaserver_stream_id)) ||
                    state.video.scheduled) ? (
                    <div
                      className="ls_sidbar"
                      style={{
                        height:
                          !state.fullWidth && !state.adult
                            ? state.height.replace("-", "")
                            : "0px",
                      }}
                    >
                      <Chat
                        {...props}
                        getHeight={getHeight}
                        channel={state.video.channel_name}
                        streamId={state.video.mediaserver_stream_id}
                        custom_url={state.video.custom_url}
                        comments={
                          state.video.chatcomments
                            ? state.video.chatcomments
                            : []
                        }
                      />
                    </div>
                  ) : null}

                  {props.pageData.appSettings["sidebar_video"] ? (
                    <AdsIndex
                      paddingTop="20px"
                      className="sidebar_video"
                      ads={props.pageData.appSettings["sidebar_video"]}
                    />
                  ) : null}
                  {state.relatedVideos && state.relatedVideos.length > 0 ? (
                    <RelatedVideos
                      {...props}
                      playlist={state.playlistVideos}
                      videos={state.relatedVideos}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default withRouter(Index);
