import React, { useReducer, useEffect, useRef } from "react";
import swal from "sweetalert";
import ShortNumber from "short-number";
import dynamic from "next/dynamic";
import axios from "../../../axios-orders";
import Timeago from "../../Common/Timeago";
import Link from "../../../components/Link/index";
import Router, { useRouter } from "next/router";
import FixedMenu from "../../Menu/Fixed";
import Subscribe from "../../User/Follow";
import Like from "../../Like/Index";
import Dislike from "../../Dislike/Index";
import SocialShare from "../../SocialShare/Index";

const Comment = dynamic(() => import("../../../containers/Comments/Index"), {
  ssr: false,
});
const Reels = (props) => {
  const router = useRouter();
  const videoElement = useRef(null);
  const dropdownMenu = useRef(null);
  const playPauseMedia = useRef();
  playPauseMedia.current = true;

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      items: props.pageData.reels,
      pagging: props.pageData.pagging,
      openReel: 0,
      timer: 0,
      muted: true,
      playPause: true,
      showMenu: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.items;

  useEffect(() => {
    if (props.pageData.reels && props.pageData.reels != state.reels) {
      let items = props.pageData.reels;
      let nextP = { ...props };
      setState({
        viewmore:null,
        items: items,
        pagging: nextP.pageData.pagging,
        timer: 0,
      });
    }
  }, [props]);

  useEffect(() => {
    //check first item in selected story
    $("body").addClass("stories-open");

    setTimeout(() => {
      if (videoElement.current) {
        videoElement.current.currentTime = 0;
        let promise = videoElement.current.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                setState({ muted: true, playPause: true });
                // if(videoElement.current)
                //     videoElement.current.muted = false;
              } else {
                setState({ muted: false, playPause: true });
                if (videoElement.current) videoElement.current.muted = false;
              }
            })
            .catch((error) => {
              if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                setState({ muted: true, playPause: true });
                // if(videoElement.current)
                //     videoElement.current.muted = false;
              } else {
                setState({ muted: true, playPause: true });
              }
            });
        }
        videoElement.current.load();
        videoElement.current.addEventListener("timeupdate", updateTimerMedia);
      }
    }, 1000);

    props.socket.on("reelsCreated", (socketdata) => {
      let id = socketdata.id;
      if (
        stateRef.current[state.openReel] &&
        stateRef.current[state.openReel].reel_id == id
      ) {
        Router.push(`/reel/${id}`);
      }
    });

    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      let changed = false;
      if (type == "members") {
        let items = [...stateRef.current];
        for (let i = 0; i < items.length; i++) {
          if (id == items[i].owner_id) {
            if (
              props.pageData.loggedInUserDetails &&
              props.pageData.loggedInUserDetails.user_id == ownerId
            ) {
              changed = true;
              items[i].follower_id = null;
            }
          }
        }
        if (changed) setState({ items: items });
      }
    });
    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      let changed = false;
      if (type == "members") {
        let items = [...stateRef.current];
        for (let i = 0; i < items.length; i++) {
          if (id == items[i].owner_id) {
            if (
              props.pageData.loggedInUserDetails &&
              props.pageData.loggedInUserDetails.user_id == ownerId
            ) {
              changed = true;
              items[i].follower_id = 1;
            }
          }
        }
        if (changed) setState({ items: items });
      }
    });

    props.socket.on("reelDeleted", (socketdata) => {
      let id = socketdata.reel_id;
      let itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        let items = [...stateRef.current];
        items.splice(itemIndex, 1);

        //open reel
        let openReel = state.openReel;
        if (state.openReel > items.length) {
          openReel = 0;
        }
        if (items.length == 0) {
          // close and redirect to home
          Router.push("/", "/");
        }
        setState({ items: items, openReel: openReel });
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
      if (itemType == "reels") {
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
          setState({ items: items });
        }
      }
    });

    return () => {
      $("body").removeClass("stories-open");
      if (state.timerId) clearInterval(state.timerId);
      removeVideoRefs();
    };
  }, []);

  const getItemIndex = (item_id) => {
    const items = [...stateRef.current];
    const itemIndex = items.findIndex((p) => p["reel_id"] == item_id);
    return itemIndex;
  };

  const loadMoreContent = () => {
    if (state.fetchingData) {
      return;
    }
    setState({ fetchingData: true });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let ids = [];
    //get current reels
    state.items.forEach((reel) => {
      ids.push(reel.reel_id);
    });
    formData.append("ids", ids);
    if (props.pageData.member_user_id)
      formData.append("user_id", props.pageData.member_user_id);
    let url = "/reels/get-reels";
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          //silent
        } else {
          if (response.data.reels) {
            setState({
              fetchingData: false,
              items: [...state.items, ...response.data.reels],
              pagging: response.data.pagging,
            });
          }
        }
      })
      .catch((err) => {
        //silent
      });
  };
  const playMediaElement = (isFirst) => {
    if (!state.items[state.openReel]) {
      return;
    }
    clearInterval(state.timerId);
    if (videoElement.current) {
      videoElement.current.currentTime = 0;
      videoElement.current.play();
      videoElement.current.load();
      videoElement.current.addEventListener("timeupdate", updateTimerMedia);
    }
  };

  const updateTimerMedia = () => {
    let progress = 0;
    if (videoElement.current) {
      progress =
        (videoElement.current.currentTime / videoElement.current.duration) *
        100;
    }
    setState({
      timer: progress,
    });
  };

  const showNextButton = () => {
    var isValid = false;
    let stories = state.items;
    if (state.openReel < stories.length - 1) {
      isValid = true;
    }
    return isValid;
  };
  const getNextReel = () => {
    let stories = state.items;
    removeVideoRefs();

    if (
      state.items.length > 4 &&
      state.openReel < state.items.length - 4 &&
      state.pagging
    )
      loadMoreContent();

    if (state.openReel < stories.length - 1) {
      if (state.timerId) clearInterval(state.timerId);
      videoElement.current.currentTime = 0;
      setState({ openReel: state.openReel + 1, timer: 0, playPause: true });
      setTimeout(() => {
        playMediaElement();
      }, 200);
    }
  };
  const showPrevButton = () => {
    var isValid = false;
    if (state.openReel != 0) {
      isValid = true;
    } else {
      if (state.openReel != 0) {
        isValid = true;
      } else {
        isValid = false;
      }
    }
    return isValid;
  };
  const getPreviousStory = () => {
    removeVideoRefs();
    if (state.openReel != 0) {
      if (state.timerId) clearInterval(state.timerId);
      videoElement.current.currentTime = 0;
      setState({ openReel: state.openReel - 1, timer: 0, playPause: true });
      setTimeout(() => playMediaElement(), 200);
    }
  };
  const removeVideoRefs = () => {
    if (videoElement.current) {
      videoElement.current.pause();
      videoElement.current.removeEventListener("timeupdate", updateTimerMedia);
      videoElement.current.removeEventListener("ended", getNextReel);
    }
  };

  const mutedMedia = (type) => {
    if (type) videoElement.current.muted = true;
    else videoElement.current.muted = false;
  };
  const pausePlayMedia = (type) => {
    if (type) videoElement.current.play();
    else videoElement.current.pause();
  };
  const closeMenu = (e) => {
    if (
      e.target &&
      dropdownMenu.current &&
      !dropdownMenu.current.contains(e.target)
    ) {
      setState({ showMenu: false, playPause: playPauseMedia.current });
      setTimeout(() => {
        document.removeEventListener("click", closeMenu, false);
        if (playPauseMedia.current) pausePlayMedia(true);
      }, 200);
    }
  };

  const showMenu = (e) => {
    e.preventDefault();
    if (!state.showMenu) {
      let states = { ...state };
      playPauseMedia.current = states.playPause;
      setState({ showMenu: true, playPause: false });
      setTimeout(() => {
        setTimeout(() => {
          document.addEventListener("click", closeMenu, false);
        }, 1000);
        pausePlayMedia(false);
      }, 200);
    }
  };

  const editReel = (id) => {
    Router.push("create-reel/" + id);
  };

  const deleteReel = (id) => {
    swal({
      title: props.t("Delete Reel?"),
      text: props.t("Are you sure want to delete this reel?"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        setState({ timer: 0 });
        setTimeout(() => {
          removeVideoRefs();
          if (state.timerId) clearInterval(state.timerId);
          if (videoElement.current) videoElement.current.currentTime = 0;

          if (playPauseMedia.current) {
            setTimeout(() => {
              playMediaElement();
            }, 100);
          }
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          let formData = new FormData();
          let url = "/reels/delete/" + id;
          axios
            .post(url, formData, config)
            .then((response) => {
              if (response.data.error) {
                alert(response.data.error);
              } else {
              }
            })
            .catch((err) => {});
        }, 200);
      }
    });
  };

  if (!state.items[state.openReel]) {
    return null;
  }

  let image = null;
  image = state.items[state.openReel].image;

  let logo = "";
  if (props.pageData.themeMode == "dark") {
    logo =
      props.pageData["imageSuffix"] +
      props.pageData.appSettings["darktheme_logo"];
  } else {
    logo =
      props.pageData["imageSuffix"] +
      props.pageData.appSettings["lightheme_logo"];
  }

  let comment = null;
  if (state.openComment) {
    comment = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{props.t("Comments")}</h2>
                <a
                  onClick={(e) => {
                    setState({ openComment: false });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <div className="reel_comment">
                <div className="row">
                  <Comment
                    {...props}
                    owner_id={state.items[state.openReel].owner_id}
                    hideTitle={true}
                    appSettings={props.pageData.appSettings}
                    commentType="reel"
                    type="reels"
                    comment_item_id={state.items[state.openReel].reel_id}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  let descriptionText = state.items[state.openReel].description;
  let showMore = false;
  if (descriptionText && descriptionText.length > 45) {
    showMore = true;
    descriptionText = descriptionText.substring(0, 45) + "...";
  }
  let descriptionData = null;
  if (state.viewmore) {
    descriptionData = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="popup_wrapper_cnt_header">
              <h2>{props.t("Description")}</h2>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setState({ viewmore: null });
                }}
                className="_close"
              >
                <i></i>
              </a>
            </div>
            <p className="plan-description">
              {state.items[state.openReel].description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {descriptionData}
      {comment}
      <div className={`story-details stories-view reel-view`}>
        <div className="popupHeader reel-header">
          <div className="HeaderCloseLogo">
            <a
              className="closeBtn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.back();
                // if (props.pageData.member_user_id)
                //   Router.push(`/${props.pageData.member_username}`);
                // else Router.push(`/`, `/`);
              }}
            >
              <span className="material-icons">close</span>
            </a>
            <div className="HeaderCloseLogo-logo">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                  // if (props.pageData.member_user_id)
                  //   Router.push(`/${props.pageData.member_username}`);
                  // else Router.push(`/`, `/`);
                }}
              >
                {!props.pageData.appSettings.logo_type || props.pageData.appSettings.logo_type == "0" ? (
                  <img src={logo} className="img-fluid" />
                ) : (
                  <span className="logo-text">
                    {props.pageData.appSettings.logo_text}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>

        <div className="story-content position-relative">
          {props.layout != "mobile" ? (
            props.pageData.appSettings["fixed_header"] == 1 ? (
              <FixedMenu {...props} />
            ) : null
          ) : null}
          <div className="storyDetails-Bg">
            <div className="storyDetails-BgImg">
              <div
                className="bgImg"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </div>
          <div className="storyDetails-contentWrap">
            <div className="storyDetails-contentBox">
              <div className="storyDetails-cntent">
                <div className="storyTopOverlay">
                  <div className="storyDetails-userName">
                    <Link
                      href="/member"
                      customParam={`id=${
                        state.items[state.openReel].user_username
                      }`}
                      as={`/${state.items[state.openReel].user_username}`}
                    >
                      <a className="nameTitme" onClick={(e) => {}}>
                        <div className="img">
                          <img
                            className="avatar-40 rounded-circle"
                            src={
                              props.pageData.imageSuffix +
                              state.items[state.openReel].avtar
                            }
                            alt=""
                          />
                        </div>
                        <div className="nameTime">
                          <span className="name">
                            {state.items[state.openReel].user_displayname}
                          </span>
                          {props.pageData.appSettings["users_follow"] == 1 &&
                          props.pageData.loggedInUserDetails &&
                          props.pageData.loggedInUserDetails.user_id !=
                            state.items[state.openReel].owner_id ? (
                            <React.Fragment>
                              <span>
                                <span>&nbsp;</span>
                                <span>·</span>
                                <span>&nbsp;</span>
                              </span>
                              <Subscribe
                                {...props}
                                nolink={true}
                                className="follwbtn"
                                type="members"
                                user={{
                                  follower_id:
                                    state.items[state.openReel].follower_id,
                                  user_id: state.items[state.openReel].owner_id,
                                }}
                                user_id={state.items[state.openReel].owner_id}
                              />
                            </React.Fragment>
                          ) : null}
                          <div className="time">
                            <Timeago {...props}>
                              {state.items[state.openReel].creation_date}
                            </Timeago>
                          </div>
                        </div>
                      </a>
                    </Link>
                    {state.items[state.openReel].video_location ? (
                      <div className="optionStoryslid">
                        <div className="icon">
                          {!state.playPause ? (
                            <span
                              className="material-icons hidden"
                              onClick={() => {
                                setState({ playPause: true });
                                setTimeout(() => {
                                  pausePlayMedia(true);
                                }, 200);
                              }}
                            >
                              play_arrow
                            </span>
                          ) : (
                            <span
                              className="material-icons"
                              onClick={() => {
                                setState({ playPause: false });
                                setTimeout(() => {
                                  pausePlayMedia(false);
                                }, 200);
                              }}
                            >
                              pause
                            </span>
                          )}
                        </div>

                        <div className="icon">
                          {!state.muted ? (
                            <span
                              className="material-icons"
                              onClick={() => {
                                setState({ muted: true });
                                setTimeout(() => {
                                  mutedMedia(true);
                                }, 200);
                              }}
                            >
                              volume_up
                            </span>
                          ) : (
                            <span
                              className="material-icons hidden"
                              onClick={() => {
                                setState({ muted: false });
                                setTimeout(() => {
                                  mutedMedia(false);
                                }, 200);
                              }}
                            >
                              volume_off
                            </span>
                          )}
                        </div>

                        {props.pageData.loggedInUserDetails &&
                        (state.items[state.openReel].canEdit ||
                          state.items[state.openReel].canDelete) ? (
                          <div className="icon">
                            <a
                              href="#"
                              className="icon-Dvert"
                              onClick={showMenu}
                            >
                              <span
                                className="material-icons"
                                id="stories-drop-down"
                              >
                                more_vert
                              </span>
                            </a>
                            <ul
                              className={`dropdown-menu dropdown-menu-right moreOptionsShow${
                                state.showMenu ? " show" : ""
                              }`}
                              ref={dropdownMenu}
                            >
                              {state.items[state.openReel].canEdit ? (
                                <li>
                                  <a
                                    className="edit-stories"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      editReel(
                                        state.items[state.openReel].reel_id
                                      );
                                    }}
                                  >
                                    <span
                                      className="material-icons"
                                      data-icon="edit"
                                    ></span>
                                    {props.t("Edit")}
                                  </a>
                                </li>
                              ) : null}
                              {state.items[state.openReel].canDelete ? (
                                <li>
                                  <a
                                    className="delete-stories"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      deleteReel(
                                        state.items[state.openReel].reel_id
                                      );
                                    }}
                                  >
                                    <span
                                      className="material-icons"
                                      data-icon="delete"
                                    ></span>
                                    {props.t("Delete")}
                                  </a>
                                </li>
                              ) : null}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                {state.items[state.openReel].video_location ? (
                  <React.Fragment>
                    <div className="imageBox">
                      {
                        <video
                          autoPlay={true}
                          controls={false}
                          muted
                          onEnded={playMediaElement}
                          ref={videoElement}
                          playsInline={true}
                        >
                          {
                            <source
                              src={
                                (props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.pageData.imageSuffix) +
                                state.items[state.openReel].video_location
                              }
                              type="video/mp4"
                            />
                          }
                        </video>
                      }
                    </div>
                    {state.items[state.openReel].title ||
                    state.items[state.openReel].description ? (
                      <div className="storyText-Content">
                        <div className="storyText-innr">
                          {state.items[state.openReel].title ? (
                            <div
                              className="textShow fontset"
                              style={{ color: "#ffffff" }}
                            >
                              {state.items[state.openReel].title}
                            </div>
                          ) : null}
                          {state.items[state.openReel].description ? (
                            <div
                              className="description"
                              style={{ color: "#ffffff", maxHeight: "20px" }}
                            >
                              {descriptionText}
                              {showMore ? (
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setState({viewmore:true});
                                  }}
                                >
                                  {props.t("Show more")}
                                </a>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    <div className="reels-user-content">
                      <ul>
                        {props.pageData.appSettings[`${"reel_like"}`] == 1 ? (
                          <li>
                            <Like
                              {...props}
                              icon={true}
                              like_count={
                                state.items[state.openReel].like_count
                              }
                              item={state.items[state.openReel]}
                              type={"reel"}
                              id={state.items[state.openReel].reel_id}
                            />
                          </li>
                        ) : null}
                        {props.pageData.appSettings[`${"reel_dislike"}`] ==
                        1 ? (
                          <li>
                            <Dislike
                              {...props}
                              icon={true}
                              dislike_count={
                                state.items[state.openReel].dislike_count
                              }
                              item={state.items[state.openReel]}
                              type={"reel"}
                              id={state.items[state.openReel].reel_id}
                            />
                          </li>
                        ) : null}
                        {props.pageData.appSettings[`${"reel_comment"}`] ==
                        1 ? (
                          <li>
                            <span
                              onClick={(e) => {
                                setState({ openComment: true });
                              }}
                              className="icon"
                              title={props.t("Comments")}
                            >
                              <span
                                className="material-icons-outlined md-18"
                                data-icon="comment"
                              ></span>
                              {" " +
                                `${ShortNumber(
                                  state.items[state.openReel].comment_count
                                    ? state.items[state.openReel].comment_count
                                    : 0
                                )}`}
                            </span>
                          </li>
                        ) : null}
                        <li>
                          <span
                            onClick={(e) => {}}
                            className="icon"
                            title={props.t("Views")}
                          >
                            <span
                              className="material-icons-outlined md-18"
                              data-icon="visibility"
                            ></span>
                            {" " +
                              `${ShortNumber(
                                state.items[state.openReel].view_count
                                  ? state.items[state.openReel].view_count
                                  : 0
                              )}`}
                          </span>
                        </li>
                        {
                          <SocialShare
                            {...props}
                            hideTitle={true}
                            className="reel_share"
                            buttonHeightWidth="30"
                            tags=""
                            url={`/reel/${state.items[state.openReel].reel_id}`}
                            title={state.items[state.openReel].title}
                            imageSuffix={props.pageData.imageSuffix}
                            media={state.items[state.openReel].image}
                          />
                        }
                      </ul>
                    </div>
                  </React.Fragment>
                ) : (
                  <div className="reel-processing">
                    <div className="storyText-innr">
                      <div
                        className="textShow fontset description"
                        style={{ color: "#ffffff" }}
                      >
                        {state.items[state.openReel].status == 2 ? (
                          <h5>
                            {props.t("Reel is processing, please wait...")}
                          </h5>
                        ) : (
                          <h5>
                            {props.t(
                              "Reel failed processing, please upload new reel."
                            )}
                          </h5>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {state.items[state.openReel].video_location ? (
                <div className="btn-slide">
                  {showNextButton() ? (
                    <div
                      className="btn-mcircle-40 next"
                      onClick={(e) => {
                        getNextReel();
                      }}
                    >
                      <span className="material-icons">arrow_forward_ios</span>
                    </div>
                  ) : null}
                  {showPrevButton() ? (
                    <div
                      className="btn-mcircle-40 prev"
                      onClick={(e) => {
                        getPreviousStory();
                      }}
                    >
                      <span className="material-icons">arrow_back_ios</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Reels;
