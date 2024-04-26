import React, { useReducer, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import swal from "sweetalert";
import axios from "../../../axios-orders";
import Timeago from "../../Common/Timeago";
import Link from "../../../components/Link/index";
import LoadMore from "../../LoadMore/Index";
import EndContent from "../../LoadMore/EndContent";
import Release from "../../LoadMore/Release";
import InfiniteScroll from "react-infinite-scroll-component";
import Subscribe from "../../User/Follow";
import Like from "../../Like/Index";
import Dislike from "../../Dislike/Index";
import SocialShare from "../../SocialShare/Index";
import ShortNumber from "short-number";
const Comment = dynamic(() => import("../../../containers/Comments/Index"), {
  ssr: false,
});
const StoryArchive = dynamic(() => {
  return import("./Archive");
});

const Stories = (props) => {
  const audioElement = useRef(null);
  const videoElement = useRef(null);
  const dropdownMenu = useRef(null);
  const timerId = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      playPauseMedia:true,
      items: props.items,
      fetchingData: props.fetchingData,
      pagging: props.pagging,
      openStory: props.openStory,
      privacy: props.pageData.storyPrivacy
        ? props.pageData.storyPrivacy
        : "public",
      defaultPrivacy: props.pageData.storyPrivacy
        ? props.pageData.storyPrivacy
        : "public",
      selectedStory: props.pageData.selectedStory
        ? props.pageData.selectedStory
        : props.selectedStory ?? 0,
      timer: 0,
      muted: false,
      playPause: true,
      showMenu: false,
      loadingViewer: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state
  useEffect(() => {
    if (props.items && props.items != state.items) {
      let items = props.items;
      let nextP = { ...props };

      let selectedStory = nextP.selectedStory || nextP.selectedStory == 0;
      let selectedOpenStory =
        nextP.selectedOpenStory || nextP.selectedOpenStory == 0;
      setState({
        items: items,
        loadingViewer: nextP.loadingViewer,
        pagging: nextP.pagging,
        fetchingData: nextP.fetchingData,
        selectedStory: selectedStory
          ? nextP.selectedStory
          : state.selectedStory,
        openStory: selectedOpenStory
          ? nextP.selectedOpenStory
          : state.openStory,
        timer: selectedStory == state.selectedStory ? state.timer : 0,
      });
    } else if (props.loadingViewer != state.loadingViewer) {
      setState({
        loadingViewer: props.loadingViewer,
      });
    } else if (
      (props.selectedOpenStory == 0 || props.selectedOpenStory) &&
      props.selectedOpenStory != state.selectedStory
    ) {
      setState({
        selectedStory: props.selectedOpenStory,
      });
    }
  }, [props]);

  useEffect(() => {
    $("body").addClass("stories-open");
    if (props.pageData.loggedInUserDetails) getPrivacy();
    props.closePopupFirst(true);
    //check first item in selected story
    if (state.items[state.openStory].stories[state.selectedStory].status == 1)
      setTimeout(() => {
        playMediaElement();
        if (videoElement.current) videoElement.current.muted = false;
        if (audioElement.current) audioElement.current.muted = false;
      }, 1000);
    updateStoryViewer();

    return () => {
      if (timerId.current) clearInterval(timerId.current);
      removeVideoRefs();
      removeAudioRefs();
    };
  }, []);
  useEffect(() => {
    if (state.playPause) {
      pausePlayMedia(true);
    } else {
      pausePlayMedia(false);
    }
  }, [state.playPause]);
  useEffect(() => {
    if (state.muted) {
      mutedMedia(true);
    } else {
      mutedMedia(false);
    }
  }, [state.muted]);
  const refreshContent = () => {
    loadMoreContent();
  };
  const updateStoryViewer = () => {
    if (props.getStoryViewer && state.items[state.openStory] && state.items[state.openStory].stories &&  state.items[state.openStory].stories[state.selectedStory])
      props.getStoryViewer(
        state.items[state.openStory],
        state.items[state.openStory].stories[state.selectedStory].story_id
      );
  };
  const loadMoreContent = () => {
    if (state.fetchingData) {
      return;
    }
    if (props.fetchStoriesData) props.fetchStoriesData();
  };
  const playMediaElement = () => {
    if (
      !state.items[state.openStory] ||
      !state.items[state.openStory].stories[state.selectedStory]
    ) {
      return;
    }
    if (
      parseInt(
        state.items[state.openStory].stories[state.selectedStory].type
      ) == 1
    ) {
      clearInterval(timerId.current);
      if (videoElement.current) {
        videoElement.current.currentTime = 0;
        videoElement.current.play();
        videoElement.current.load();
        videoElement.current.addEventListener("timeupdate", updateTimerMedia);
      }
    } else if (
      parseInt(
        state.items[state.openStory].stories[state.selectedStory].type
      ) == 2
    ) {
      clearInterval(timerId.current);
      if (audioElement.current) {
        audioElement.current.currentTime = 0;
        audioElement.current.play();
        audioElement.current.load();
        audioElement.current.addEventListener("timeupdate", updateTimerMedia);
      }
    }
  };
  useEffect(() => {
    if (timerId.current) clearInterval(timerId.current);
    playMediaElement();
    updateStoryViewer();
  }, [state.selectedStory, state.openStory]);
  const updateStoryTimer = () => {
    timerId.current = setInterval(() => {
      if (!stateRef.current.playPause) return;
      let stories_delay =
        parseInt(props.pageData.appSettings["stories_delay"]) > 0
          ? parseInt(props.pageData.appSettings["stories_delay"]) * 10
          : 50;
      let checkMediaType = parseInt(
        stateRef.current.items[stateRef.current.openStory].stories[stateRef.current.selectedStory].type
      );
      let progress = 0;
      if (checkMediaType == 0 || checkMediaType == 3) {
        progress = stateRef.current.timer + 1;
      }

      if (stories_delay == stateRef.current.timer) {
        clearInterval(timerId.current);
        let stories = stateRef.current.items[stateRef.current.openStory];
        if (stateRef.current.selectedStory < stories.stories.length - 1) {
          setState({
            selectedStory: stateRef.current.selectedStory + 1,
            timer: 0,
            playPause: true,
          });
        } else {
          if (stateRef.current.openStory < stateRef.current.items.length - 1) {
            setState({
              openStory: stateRef.current.openStory + 1,
              selectedStory: 0,
              timer: 0,
              playPause: true,
            });
          } else {
            props.closePopup("");
          }
        }
      } else {
        setState({
          timer: progress,
        });
      }
    }, 100);
  };
  const updateTimerMedia = () => {
    let progress = 0;
    if (
      parseInt(
        state.items[state.openStory].stories[state.selectedStory].type
      ) == 1
    ) {
      if (videoElement.current) {
        progress =
          (videoElement.current.currentTime / videoElement.current.duration) *
          100;
        if (videoElement.current.currentTime == videoElement.current.duration) {
          removeVideoRefs();
          clearInterval(timerId.current);
          return;
        }
      }
    } else {
      if (audioElement.current) {
        progress =
          (audioElement.current.currentTime / audioElement.current.duration) *
          100;
        if (audioElement.current.currentTime == audioElement.current.duration) {
          removeAudioRefs();
          clearInterval(timerId.current);
          return;
        }
      }
    }
    setState({
      timer: progress,
    });
  };

  const showNextButton = () => {
    var isValid = false;
    let stories = state.items[state.openStory];
    if (state.selectedStory < stories.stories.length - 1) {
      isValid = true;
    } else {
      if (state.openStory < state.items.length - 1) {
        isValid = true;
      }
    }
    return isValid;
  };
  const getNextStory = () => {
    let stories = state.items[state.openStory];
    removeVideoRefs();
    removeAudioRefs();
    if (state.selectedStory < stories.stories.length - 1) {
      if (timerId.current) clearInterval(timerId.current);
      if (videoElement.current) videoElement.current.currentTime = 0;
      if (audioElement.current) audioElement.current.currentTime = 0;
      setState({
        selectedStory: state.selectedStory + 1,
        timer: 0,
        playPause: true,
      });
    } else {
      if (state.openStory < state.items.length - 1) {
        if (timerId.current) clearInterval(timerId.current);
        if (videoElement.current) videoElement.current.currentTime = 0;
        if (audioElement.current) audioElement.current.currentTime = 0;
        setState({
          openStory: state.openStory + 1,
          selectedStory: 0,
          timer: 0,
          playPause: true,
        });
      } else {
        props.closePopup("");
      }
    }
  };
  const showPrevButton = () => {
    var isValid = false;
    if (state.selectedStory != 0) {
      isValid = true;
    } else {
      if (state.openStory != 0) {
        isValid = true;
      } else {
        isValid = false;
      }
    }
    return isValid;
  };
  const getPreviousStory = () => {
    removeVideoRefs();
    removeAudioRefs();
    if (state.selectedStory != 0) {
      if (timerId.current) clearInterval(timerId.current);
      if (videoElement.current) videoElement.current.currentTime = 0;
      if (audioElement.current) audioElement.current.currentTime = 0;
      setState({
        selectedStory: state.selectedStory - 1,
        timer: 0,
        playPause: true,
      });
    } else {
      if (state.openStory != 0) {
        if (timerId.current) clearInterval(timerId.current);
        if (videoElement.current) videoElement.current.currentTime = 0;
        if (audioElement.current) audioElement.current.currentTime = 0;
        setState({
          openStory: state.openStory - 1,
          selectedStory: 0,
          timer: 0,
          playPause: true,
        });
      } else {
        props.closePopup("");
      }
    }
  };
  const removeVideoRefs = () => {
    if (videoElement.current) {
      videoElement.current.pause();
      videoElement.current.removeEventListener("timeupdate", updateTimerMedia);
      videoElement.current.removeEventListener("ended", getNextStory);
    }
  };
  const removeAudioRefs = () => {
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current.removeEventListener("timeupdate", updateTimerMedia);
      audioElement.current.removeEventListener("ended", getNextStory);
    }
  };
  const getPrivacy = () => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/get-privacy";

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
          setState({
            defaultPrivacy: response.data.privacy,
            privacy: response.data.privacy,
          });
        }
      })
      .catch((err) => {});
  };
  const submitPrivacy = (e) => {
    e.preventDefault();
    if (state.playPauseMedia) pausePlayMedia(true);
    setState({
      isSubmit: false,
      settingMenu: false,
      defaultPrivacy: state.privacy,
      playPause: state.playPauseMedia,
    });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/privacy";
    formData.append("privacy", state.privacy);
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
        }
      })
      .catch((err) => {});
  };
  const openSettings = (e) => {
    setState({ settingMenu: true, privacy: state.defaultPrivacy });
  };
  const mutedMedia = (type) => {
    if(!state.items[state.openStory] || !state.items[state.openStory].stories || !state.items[state.openStory].stories[state.selectedStory])
      return;
    let checkMediaType = parseInt(
      state.items[state.openStory].stories[state.selectedStory].type
    );
    if (checkMediaType == 1) {
      if (type && videoElement.current) videoElement.current.muted = true;
      else if (videoElement.current) videoElement.current.muted = false;
    } else if (checkMediaType == 2) {
      if (type && audioElement.current) audioElement.current.muted = true;
      else if (audioElement.current) audioElement.current.muted = false;
    }
  };
  const pausePlayMedia = (type) => {
    if(!state.items[state.openStory] || !state.items[state.openStory].stories || !state.items[state.openStory].stories[state.selectedStory])
      return;
    let checkMediaType = parseInt(
      state.items[state.openStory].stories[state.selectedStory].type
    );
    if (checkMediaType == 1) {
      if (type && videoElement.current) videoElement.current.play();
      else if (videoElement.current) videoElement.current.pause();
    } else if (checkMediaType == 2) {
      if (type && audioElement.current) audioElement.current.play();
      else if (audioElement.current) audioElement.current.pause();
    }
  };
  useEffect(() => {
    if (!state.showMenu) {
      document.removeEventListener("click", closeMenu, false);
      if (state.playPauseMedia) pausePlayMedia(true);
    } else {
      document.addEventListener("click", closeMenu, false);
      pausePlayMedia(false);
    }
  }, [state.showMenu]);
  const closeMenu = (event) => {
    if (event.target && !event.target.classList.contains("notClose") && dropdownMenu.current && !dropdownMenu.current.contains(event.target)) {
      setState({ showMenu: false});
    }
  };

  const showMenu = (e) => {
    e.preventDefault();
    if (!state.showMenu) {
      state.playPauseMedia = state.playPause;
      setState({ showMenu: true, playPause: false });
    }
  };
  const muteStory = (id, owner_id) => {
    swal({
      title: props.t("Mute Story?"),
      text: props.t("You'll stop seeing their story."),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        setState({ timer: 0 });
        removeVideoRefs();
        removeAudioRefs();
        if(timerId)
            clearInterval(timerId)
        if(videoElement.current)
            videoElement.current.currentTime = 0
        if(audioElement.current)
            audioElement.current.currentTime = 0
        if(props.muteStory)
            props.muteStory(owner_id);
        if(!state.playPause){
            setTimeout(() =>{
                playMediaElement();
                updateStoryViewer();
            },100);
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/mute/'+id;
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                alert(response.data.error)
            }else{
                
            }
        }).catch(err => {
            
        });
      }
    });
  };
  
  const deleteStory = (id, owner_id) => {
    swal({
      title: props.t("Delete Story?"),
      text: props.t("Delete this story from your story?"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        setState({ timer: 0 });
        removeVideoRefs();
        removeAudioRefs();
        if(timerId)
            clearInterval(timerId)
        if(videoElement.current)
            videoElement.current.currentTime = 0
        if(audioElement.current)
            audioElement.current.currentTime = 0
        if(props.removeStory)
        props.removeStory(id,owner_id);
        if(state.playPauseMedia){
            setTimeout(() =>{
                playMediaElement();
                updateStoryViewer();
            },100);
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        let url = '/stories/delete/'+id;
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                alert(response.data.error)
            }else{
                
            }
        }).catch(err => {
            
        });
      }
    });
  };

  if (
    !state.items[state.openStory] ||
    state.items[state.openStory].stories.length == 0 ||
    !state.items[state.openStory].stories[state.selectedStory] ||
    state.items[state.openStory].stories[state.selectedStory].length == 0
  ) {
    if (typeof window !== "undefined") {
      $("body").removeClass("stories-open");
    }
    return null;
  }
  let stories_delay =
    parseInt(props.pageData.appSettings["stories_delay"]) > 0
      ? parseInt(props.pageData.appSettings["stories_delay"]) * 10
      : 50;
  let checkMediaType = parseInt(
    state.items[state.openStory].stories[state.selectedStory].type
  );
  let timer = 0;
  if (checkMediaType == 0 || checkMediaType == 3) {
    timer = (state.timer / stories_delay) * 100;
  } else if (checkMediaType == 1 && videoElement.current) {
    timer =
      (videoElement.current.currentTime / videoElement.current.duration) * 100;
  } else if (checkMediaType == 2 && audioElement.current) {
    timer =
      (audioElement.current.currentTime / audioElement.current.duration) * 100;
  }

  let settings = null;
  if (state.settingMenu) {
    settings = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{props.t("Story Privacy")}</h2>
                <a
                  onClick={(e) => {
                    if (state.playPauseMedia) pausePlayMedia(true);
                    setState({ settingMenu: false, playPause: state.playPauseMedia });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <div className="stories_privacy">
                <form
                  className="formFields px-3"
                  method="post"
                  onSubmit={submitPrivacy}
                >
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "public"}
                      onChange={(e) => {
                        setState({ privacy: e.target.value });
                      }}
                      id="public_pr"
                      name="privacy"
                      value="public"
                    />
                    <label className="form-check-label" htmlFor="public_pr">
                      {props.t("Public")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "onlyme"}
                      onChange={(e) => {
                        setState({ privacy: e.target.value });
                      }}
                      id="onlyme_pr"
                      name="privacy"
                      value="onlyme"
                    />
                    <label className="form-check-label" htmlFor="onlyme_pr">
                      {props.t("Only Me")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "follow"}
                      onChange={(e) => {
                        setState({ privacy: e.target.value });
                      }}
                      id="foll_pr"
                      name="privacy"
                      value="follow"
                    />
                    <label className="form-check-label" htmlFor="foll_pr">
                      {props.t("People I Follow")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "followers"}
                      onChange={(e) => {
                        setState({ privacy: e.target.value });
                      }}
                      id="mefoll_pr"
                      name="privacy"
                      value="followers"
                    />
                    <label className="form-check-label" htmlFor="mefoll_pr">
                      {props.t("People Follow Me")}
                    </label>
                  </div>
                  <div className="input-group mt-3">
                    <button type="submit">{props.t("Save")}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let image = null;
  if (state.items[state.openStory].stories[state.selectedStory].type == 3) {
    image =
      state.items[state.openStory].stories[state.selectedStory]
        .background_image;
  } else {
    image = state.items[state.openStory].stories[state.selectedStory].image;
  }

  let archiveStories = null;
  if (state.archiveStories) {
    archiveStories = (
      <StoryArchive
        {...props}
        closePopup={(e) => {
          e.preventDefault();
          if (state.playPauseMedia) pausePlayMedia(true);
          setState({ archiveStories: false, playPause: state.playPauseMedia });
        }}
      ></StoryArchive>
    );
  }
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
                    if (state.playPauseMedia) pausePlayMedia(true);
                    setState({ openComment: false, playPause: state.playPauseMedia });
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
                    owner_id={
                      state.items[state.openStory].stories[state.selectedStory]
                        .owner_id
                    }
                    hideTitle={true}
                    appSettings={props.pageData.appSettings}
                    commentType="story"
                    type="stories"
                    comment_item_id={
                      state.items[state.openStory].stories[state.selectedStory]
                        .story_id
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {comment}
      {settings}
      <div className={`story-details stories-view`}>
        <div className="popupHeader">
          <div className="HeaderCloseLogo">
            <a
              className="closeBtn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                props.closePopup(props.fromDirect ? "" : "notClose");
              }}
            > 
              <span className="material-icons">close</span>
            </a>
            <div className="HeaderCloseLogo-logo">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  props.closePopup(e);
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
        {/* <a href="#" onClick={(e) => {
                        e.preventDefault();
                        if(timerId.current)
                            clearInterval(timerId.current)
                        props.closePopup();
                    }}>CLOSE</a> */}
        {!props.fromArchive ? (
          <div className="story-sidebar">
            {props.pageData.loggedInUserDetails ? (
              <React.Fragment>
                <div className="d-flex align-items-center justify-content-between my-3">
                  <h2 className="heading-sdbar"> {props.t("Your Story")} </h2>
                  <div>
                    <a
                      className="px-2"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setState(
                          { archiveStories: true, playPause: false,playPauseMedia:state.playPause }
                        );
                      }}
                    >
                      {" "}
                      {props.t("Archive")}
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setState(
                          {
                            playPauseMedia:state.playPause,
                            settingMenu: true,
                            privacy: state.defaultPrivacy,
                            playPause: false,
                          }
                        );
                      }}
                    >
                      {" "}
                      {props.t("Settings")}
                    </a>
                  </div>
                </div>
              </React.Fragment>
            ) : null}
            <div className="storyList">
              <div
                className="storyListBox sidebar-scroll"
                id="stories-scrollableDiv"
              >
                {/* <h3 className="sdTitleStory">{props.t("Your story")}</h3> */}
                {props.pageData.loggedInUserDetails &&
                props.pageData.levelPermissions["stories.create"] == 1 ? (
                  <a
                    className="d-flex align-items-center addStoryBtn"
                    href="#"
                    onClick={(e) => {
                      props.createStory(e);
                      setState({ playPause: false,playPauseMedia:state.playPause });
                    }}
                  >
                    <div className="btncrle">
                      <span className="material-icons">add</span>
                    </div>
                    <div className="flex-grow-1 addStoryBtnText">
                      <h5 className="m-0">{props.t("Create a story")}</h5>
                    </div>
                  </a>
                ) : null}

                <h3 className="sdTitleStory mt-3">{props.t("Stories")}</h3>
                <div className="story-users-list">
                  {
                    <InfiniteScroll
                      dataLength={state.items.length}
                      next={loadMoreContent}
                      hasMore={state.pagging}
                      loader={
                        <LoadMore
                          {...props}
                          loading={true}
                          itemCount={state.items.length}
                        />
                      }
                      endMessage={
                        <EndContent
                          {...props}
                          text={""}
                          itemCount={state.items.length}
                        />
                      }
                      scrollableTarget="stories-scrollableDiv"
                      pullDownToRefresh={false}
                      pullDownToRefreshContent={
                        <Release release={false} {...props} />
                      }
                      releaseToRefreshContent={
                        <Release release={true} {...props} />
                      }
                      refreshFunction={refreshContent}
                    >
                      {state.items.map((item, index) => {
                        return (
                          <a
                            key={index}
                            className={`${
                              state.openStory == index ? "active" : ""
                            }`}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (index == state.openStory) {
                                return;
                              }
                              clearInterval(timerId.current);
                              removeVideoRefs();
                              removeAudioRefs();
                              if (videoElement.current)
                                videoElement.current.currentTime = 0;
                              if (audioElement.current)
                                audioElement.current.currentTime = 0;
                              setState({
                                selectedOpenStory: null,
                                selectedStory: null,
                                openStory: index,
                                timer: 0,
                                selectedStory: 0,
                                playPause: true,
                              });
                            }}
                          >
                            <div className="story-media">
                              <img
                                src={props.pageData.imageSuffix + item.avtar}
                                alt=""
                              />
                            </div>
                            <div className="story-text">
                              <div className="story-username">
                                {item.displayname}
                              </div>
                              <p>
                                <span className="story-time">
                                  <Timeago {...props}>
                                    {
                                      item.stories[item.stories.length - 1]
                                        .creation_date
                                    }
                                  </Timeago>
                                </span>
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </InfiniteScroll>
                  }
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="story-content position-relative">
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
                  <div className="storyDetails-slidIndictr">
                    {state.items[state.openStory].stories.map((item, index) => {
                      let width = "0%";
                      if (state.selectedStory == index) {
                        width = `${timer}%`;
                      }
                      if (state.selectedStory > index) {
                        width = `100%`;
                      }
                      return (
                        <div className="slidIndictr-nmbr" key={index}>
                          <div
                            className="slidIndictr-nmbr-see"
                            style={{
                              width: width,
                              transitionDuration: "0.1s",
                            }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="storyDetails-userName">
                    <Link
                      href="/member"
                      customParam={`id=${
                        state.items[state.openStory].username
                      }`}
                      as={`/${state.items[state.openStory].username}`}
                    >
                      <a
                        className="nameTitme"
                        onClick={(e) => {
                          if (
                            e.target &&
                            e.target.className == "follow-member"
                          ) {
                            return;
                          }
                          props.closePopup("");
                          $("body").removeClass("stories-open");
                        }}
                      >
                        <div className="img">
                          <img
                            className="avatar-40 rounded-circle"
                            src={
                              props.pageData.imageSuffix +
                              state.items[state.openStory].avtar
                            }
                            alt=""
                          />
                        </div>
                        <div className="nameTime">
                          <span className="name">
                            {state.items[state.openStory].displayname}
                          </span>
                          {props.pageData.appSettings["users_follow"] == 1 &&
                          props.pageData.loggedInUserDetails &&
                          props.pageData.loggedInUserDetails.user_id !=
                            state.items[state.openStory].owner_id ? (
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
                                    state.items[state.openStory].follower_id,
                                  user_id:
                                    state.items[state.openStory].owner_id,
                                }}
                                user_id={state.items[state.openStory].owner_id}
                              />
                            </React.Fragment>
                          ) : null}
                          {/* <span className="time"><Timeago {...props}>{state.items[state.openStory].stories[state.selectedStory].creation_date}</Timeago></span> */}
                          <div className="time">
                            <Timeago {...props}>
                              {
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].creation_date
                              }
                            </Timeago>
                          </div>
                        </div>
                      </a>
                    </Link>
                    <div className="optionStoryslid">
                      {state.items[state.openStory].stories[state.selectedStory]
                        .status == 1 ? (
                        <div className="icon">
                          {!state.playPause ? (
                            <span
                              className="material-icons hidden"
                              onClick={() => {
                                setState({ playPause: true,playPauseMedia:state.playPause });
                              }}
                            >
                              play_arrow
                            </span>
                          ) : (
                            <span
                              className="material-icons"
                              onClick={() => {
                                setState({ playPause: false,playPauseMedia:state.playPause });
                              }}
                            >
                              pause
                            </span>
                          )}
                        </div>
                      ) : null}
                      {state.items[state.openStory].stories[state.selectedStory]
                        .status == 1 &&
                      (state.items[state.openStory].stories[state.selectedStory]
                        .type == 2 ||
                        state.items[state.openStory].stories[
                          state.selectedStory
                        ].type == 1) ? (
                        <React.Fragment>
                          <div className="icon">
                            {!state.muted ? (
                              <span
                                className="material-icons"
                                onClick={() => {
                                  setState({ muted: true,playPauseMedia:state.playPause });
                                }}
                              >
                                volume_up
                              </span>
                            ) : (
                              <span
                                className="material-icons hidden"
                                onClick={() => {
                                  setState({ muted: false,playPauseMedia:state.playPause });
                                }}
                              >
                                volume_off
                              </span>
                            )}
                          </div>
                        </React.Fragment>
                      ) : null}
                      {props.pageData.loggedInUserDetails ? (
                        <div className="icon">
                          <a href="#" className="icon-Dvert notClose" onClick={showMenu}>
                            <span
                              className="material-icons notClose"
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
                            {props.pageData.loggedInUserDetails &&
                            (props.pageData.levelPermissions[
                              "stories.delete"
                            ] == 2 ||
                              (props.pageData.levelPermissions[
                                "stories.delete"
                              ] == 1 &&
                                props.pageData.loggedInUserDetails.user_id ==
                                  state.items[state.openStory].owner_id)) ? (
                              <li>
                                <a
                                  className="delete-stories"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteStory(
                                      state.items[state.openStory].stories[
                                        state.selectedStory
                                      ].story_id,
                                      state.items[state.openStory].stories[
                                        state.selectedStory
                                      ].owner_id
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

                            {props.pageData.loggedInUserDetails &&
                            props.pageData.loggedInUserDetails.user_id !=
                              state.items[state.openStory].owner_id ? (
                              <li>
                                <a
                                  className="mute-stories"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    muteStory(
                                      state.items[state.openStory].stories[
                                        state.selectedStory
                                      ].story_id,
                                      state.items[state.openStory].stories[
                                        state.selectedStory
                                      ].owner_id
                                    );
                                  }}
                                >
                                  <span
                                    className="material-icons"
                                    data-icon="volume_off"
                                  ></span>
                                  {props.t("Mute {{user}}", {
                                    user: state.items[state.openStory]
                                      .displayname,
                                  })}
                                </a>
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                {state.items[state.openStory].stories[state.selectedStory]
                  .status == 1 ? (
                  <React.Fragment>
                    <div className="imageBox">
                      {state.items[state.openStory].stories[state.selectedStory]
                        .type == 2 ? (
                        <React.Fragment>
                          <img
                            style={{
                              display: `block`,
                            }}
                            className="img-fluid"
                            src={
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].type != 3
                                ? props.pageData.imageSuffix +
                                  state.items[state.openStory].stories[
                                    state.selectedStory
                                  ].image
                                : props.pageData.imageSuffix +
                                  state.items[state.openStory].stories[
                                    state.selectedStory
                                  ].background_image
                            }
                          />
                        </React.Fragment>
                      ) : state.items[state.openStory].stories[
                          state.selectedStory
                        ].type != 1 ? (
                        <img
                          style={{
                            display: `${
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].type == 1
                                ? "none"
                                : ""
                            }`,
                          }}
                          className="img-fluid"
                          src={
                            state.items[state.openStory].stories[
                              state.selectedStory
                            ].type != 3
                              ? props.pageData.imageSuffix +
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].image
                              : props.pageData.imageSuffix +
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].background_image +
                                "?id=" +
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].story_id
                          }
                          onLoad={updateStoryTimer}
                        />
                      ) : null}
                      {
                        <React.Fragment>
                          <video
                            autoPlay={true}
                            muted
                            ref={videoElement}
                            onEnded={getNextStory}
                            playsInline={true}
                            style={{
                              display: `${
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].type == 1
                                  ? "block"
                                  : "none"
                              }`,
                            }}
                          >
                            {state.items[state.openStory].stories[
                              state.selectedStory
                            ].type == 1 ? (
                              <source
                                src={
                                  (props.pageData.videoCDNSuffix ? props.pageData.videoCDNSuffix : props.pageData.imageSuffix) +
                                  state.items[state.openStory].stories[
                                    state.selectedStory
                                  ].file
                                }
                                type="video/mp4"
                              />
                            ) : null}
                          </video>
                        </React.Fragment>
                      }
                      {
                        <React.Fragment>
                          <audio
                            autoPlay={true}
                            muted
                            ref={audioElement}
                            onEnded={getNextStory}
                            style={{
                              display: `none`,
                            }}
                          >
                            {state.items[state.openStory].stories[
                              state.selectedStory
                            ].type == 2 ? (
                              <source
                                src={
                                  props.pageData.imageSuffix +
                                  state.items[state.openStory].stories[
                                    state.selectedStory
                                  ].file
                                }
                                type="audio/mp3"
                              />
                            ) : null}
                          </audio>
                        </React.Fragment>
                      }
                    </div>
                    <div className="stories-user-content">
                      <ul>
                        {props.pageData.appSettings[`${"story_like"}`] == 1 ? (
                          <li>
                            <Like
                              {...props}
                              icon={true}
                              like_count={
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].like_count
                              }
                              item={
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ]
                              }
                              type={"story"}
                              id={
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].story_id
                              }
                            />
                          </li>
                        ) : null}
                        {props.pageData.appSettings[`${"story_dislike"}`] ==
                        1 ? (
                          <li>
                            <Dislike
                              {...props}
                              icon={true}
                              dislike_count={
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].dislike_count
                              }
                              item={
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ]
                              }
                              type={"story"}
                              id={
                                state.items[state.openStory].stories[
                                  state.selectedStory
                                ].story_id
                              }
                            />
                          </li>
                        ) : null}
                        {props.pageData.appSettings[`${"story_comment"}`] ==
                        1 ? (
                          <li>
                            <span
                              onClick={(e) => {
                                setState({
                                  openComment: true,
                                  playPauseMedia:state.playPause,
                                  playPause: false,
                                });
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
                                  state.items[state.openStory].stories[
                                    state.selectedStory
                                  ].comment_count
                                    ? state.items[state.openStory].stories[
                                        state.selectedStory
                                      ].comment_count
                                    : 0
                                )}`}
                            </span>
                          </li>
                        ) : null}
                        {state.items[state.openStory].stories[
                          state.selectedStory
                        ].image ? (
                          <SocialShare
                            {...props}
                            hideTitle={true}
                            className="story_share"
                            buttonHeightWidth="30"
                            tags=""
                            url={`/reel/${
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].story_id
                            }`}
                            title={
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].title
                            }
                            imageSuffix={props.pageData.imageSuffix}
                            media={
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].image
                            }
                          />
                        ) : null}
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
                        {state.items[state.openStory].stories[
                          state.selectedStory
                        ].status == 2 ? (
                          <h5>
                            {props.t("Story is processing, please wait...")}
                          </h5>
                        ) : (
                          <h5>
                            {props.t(
                              "Story failed processing, please upload new story."
                            )}
                          </h5>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {state.items[state.openStory].stories[state.selectedStory]
                  .status == 1 &&
                state.items[state.openStory].stories[state.selectedStory]
                  .type == 3 ? (
                  <div className="storyText-Content">
                    <div className="storyText-innr">
                      <div
                        className="textShow fontset"
                        style={{
                          color:
                            state.items[state.openStory].stories[
                              state.selectedStory
                            ].text_color,
                        }}
                      >
                        {
                          state.items[state.openStory].stories[
                            state.selectedStory
                          ].description
                        }
                      </div>
                    </div>
                  </div>
                ) : null}
                {state.items[state.openStory].stories[state.selectedStory]
                  .status == 1 &&
                state.items[state.openStory].stories[state.selectedStory]
                  .seemore ? (
                  <div className="storyBtmOverlay">
                    <div className="storyLike-wrap">
                      <a
                        className="storyMoreBtn"
                        target="_blank"
                        href={
                          state.items[state.openStory].stories[
                            state.selectedStory
                          ].seemore
                        }
                      >
                        {props.t("See More")}
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="btn-slide">
                {showNextButton() ? (
                  <div
                    className="btn-mcircle-40 next"
                    onClick={(e) => {
                      getNextStory();
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
              {/* <div className="storyComentLike-wrap">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div className="storyComment-wrap">
                                            <div className="inputtxt flex-grow-1">
                                                <input type="text" placeholder="Reply..." />
                                            </div>
                                            <div className="actnBtn">
                                                <div className="iconemgSnd hidden">
                                                    <span className="material-icons">
                                                        insert_emoticon
                                                    </span>
                                                </div>
                                                <div className="iconemgSnd hidden">
                                                    <span className="material-icons">
                                                        send
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
            </div>
          </div>
        </div>

        {state.items[state.openStory].stories[state.selectedStory].status ==
          1 &&
        props.pageData.loggedInUserDetails &&
        state.items[state.openStory].owner_id ==
          props.pageData.loggedInUserDetails.user_id ? (
          <div className="Story-rightSide">
            <div className="viewStory-ourInnr">
              <div className="fullpag-rightbar-header"></div>
              <div className="title">{props.t("Story details")}</div>
              {!state.items[state.openStory].stories[state.selectedStory]
                .viewers ? (
                <div className={`loader`}>
                  <div className="duo duo1">
                    <div className="dot dot-a"></div>
                    <div className="dot dot-b"></div>
                  </div>
                  <div className="duo duo2">
                    <div className="dot dot-a"></div>
                    <div className="dot dot-b"></div>
                  </div>
                </div>
              ) : state.items[state.openStory].stories[state.selectedStory]
                  .viewers.length == 0 ? (
                <React.Fragment>
                  <div className="title d-flex align-items-center">
                    <span className="material-icons">visibility_off</span>{" "}
                    {props.t("No viewers yet")}
                  </div>
                  <p className="ml-3 mr-3">
                    {props.t(
                      "As people view your story, you'll see details here."
                    )}
                  </p>
                </React.Fragment>
              ) : (
                <div
                  className="storySeePeople-wrap sidebar-scroll"
                  id="stories-users-scrollableDiv"
                >
                  <div className="storySeePeople-innr">
                    <div className="story-users-list">
                      <InfiniteScroll
                        dataLength={
                          state.items[state.openStory].stories[
                            state.selectedStory
                          ].viewers.length
                        }
                        next={updateStoryViewer}
                        hasMore={
                          !state.items[state.openStory].stories[
                            state.selectedStory
                          ].viewersPagging
                        }
                        loader={
                          <LoadMore
                            {...props}
                            loading={state.loadingViewer}
                            itemCount={
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].viewers.length
                            }
                          />
                        }
                        endMessage={
                          <EndContent
                            {...props}
                            text={""}
                            itemCount={
                              state.items[state.openStory].stories[
                                state.selectedStory
                              ].viewers.length
                            }
                          />
                        }
                        scrollableTarget="stories-users-scrollableDiv"
                        pullDownToRefresh={false}
                      >
                        {state.items[state.openStory].stories[
                          state.selectedStory
                        ].viewers.map((item, index) => {
                          return (
                            <Link
                              key={index}
                              href="/member"
                              customParam={`id=${item.user_username}`}
                              as={`/${item.user_username}`}
                            >
                              <a
                                key={index}
                                className="nameTitme"
                                onClick={(e) => {
                                  $("body").removeClass("stories-open");
                                  props.closePopup("");
                                }}
                              >
                                <div className="story-media">
                                  <img
                                    src={
                                      props.pageData.imageSuffix + item.avtar
                                    }
                                    alt=""
                                  />
                                </div>
                                <div className="story-text">
                                  <div className="story-username">
                                    {item.user_displayname}
                                  </div>
                                  <p>
                                    <span className="story-time">
                                      <Timeago {...props}>
                                        {item.creation_date}
                                      </Timeago>
                                    </span>
                                  </p>
                                </div>
                              </a>
                            </Link>
                          );
                        })}
                      </InfiniteScroll>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {archiveStories}
    </React.Fragment>
  );
};

export default Stories;
