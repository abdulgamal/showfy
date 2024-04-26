import React, { useReducer, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import LoadMore from "../../LoadMore/Index";
import EndContent from "../../LoadMore/EndContent";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "../../../axios-orders";
import Timeago from "../../Common/Timeago";
const Stories = dynamic(() => {
  return import("./Stories");
});

const Archive = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      type: "archive",
    }
  );
  useEffect(() => {
    loadMoreContent();
  }, []);
  const loadMoreContent = () => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/get-archive-stories";

    if (state.archiveStories) {
      formData.append(
        "min_story_id",
        state.archiveStories[state.archiveStories.length - 1].story_id
      );
    }

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
          setState({
            
            archiveStories: state.archiveStories
              ? [...state.archiveStories, ...response.data.stories]
              : response.data.stories,
            archiveStoriesPagging: response.data.pagging,
          });
        }
      })
      .catch((err) => {});
  };
  const removeStory = (id) => {
    const items = [...state.archiveStories];
    let itemIndex = items.findIndex((p) => p["story_id"] == id);
    let stateItem = { localUpdate: true };
    if (itemIndex > -1) {
      items.splice(itemIndex, 1);
      stateItem.openStory = false;
      stateItem["archiveStories"] = items;
      setState(stateItem);
    }
  };
  const getOwnerIndex = (owner_id) => {
    if (state.archiveStories) {
      const items = [...state.archiveStories];
      const itemIndex = items.findIndex((p) => p.story_id == owner_id);
      return itemIndex;
    }
    return -1;
  };
  const getStoryIndex = (stories, story_id) => {
    if (state.archiveStories) {
      const items = [...stories];
      const itemIndex = items.findIndex((p) => p.story_id == story_id);
      return itemIndex;
    }
    return -1;
  };
  const getStoryViewer = (item, story_id) => {
    setState({ loadingViewer: true, localUpdate: true });
    let itemIndex = getOwnerIndex(story_id);
    let stories = null;
    const items = [...state.archiveStories];
    if (itemIndex > -1) {
      let storyIndex = getStoryIndex(items[itemIndex].stories, story_id);
      if (storyIndex > -1) {
        stories = items[itemIndex].stories[storyIndex];
      }
    }
    let owner_id = false;
    if (
      props.pageData.loggedInUserDetails &&
      item.owner_id != props.pageData.loggedInUserDetails.user_id
    ) {
      owner_id = props.pageData.loggedInUserDetails.user_id;
    } else if (!props.pageData.loggedInUserDetails) {
      owner_id = -1;
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    if (owner_id) {
      //update viewers
      formData.append("owner_id", owner_id);
    }
    formData.append("story_id", story_id);
    if (
      props.pageData.loggedInUserDetails &&
      item.owner_id == props.pageData.loggedInUserDetails.user_id
    ) {
      if (stories) {
        formData.append("getViewer", 1);
        if (stories.viewers && stories.viewers[stories.viewers.length - 1]) {
          formData.append(
            "last",
            stories.viewers[stories.viewers.length - 1].user_id
          );
        }
      }
    }

    let url = "/stories/get-update-viewer";
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          //silent
        } else {
          if (response.data.viewers) {
            if (stories.viewers) {
              stories.viewers = [...stories.viewers, ...response.data.viewers];
            } else {
              stories.viewers = [];
              stories.viewers = response.data.viewers;
            }
            setState({
              
              archiveStories: items,
              loadingViewer: false,
            });
          } else if (stories) {
            if (!stories.viewers) {
              stories.viewers = [];
            }
            stories.viewersPagging = true;
            setState({
              
              archiveStories: items,
              loadingViewer: false,
            });
          }
        }
      })
      .catch((err) => {
        //silent
      });
  };
  const muteUser = (id) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/mute/" + id;
    formData.append("owner_id", id);

    const items = [...state.mutedUsers];
    const itemIndex = items.findIndex((p) => p.resource_id == id);
    if (itemIndex < 0) {
      return;
    }

    items[itemIndex].is_mute = items[itemIndex].is_mute ? null : true;
    setState({  mutedUsers: items });

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
        }
      })
      .catch((err) => {});
  };
  const mutedUsers = () => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/get-muted-users";

    if (state.mutedUsers) {
      formData.append(
        "min_user_id",
        state.mutedUsers[state.mutedUsers.length - 1].mute_id
      );
    }

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
          setState({
            
            mutedUsers: state.mutedUsers
              ? [...state.mutedUsers, ...response.data.users]
              : response.data.users,
            mutedUsersPagging: response.data.pagging,
          });
        }
      })
      .catch((err) => {});
  };

  let openStory = null;
  if (state.openStory) {
    openStory = (
      <Stories
        {...props}
        getStoryViewer={getStoryViewer}
        closePopup={(e) => {
          setState({  openStory: false });
          $("body").removeClass("archiveStories");
        }}
        fromArchive={true}
        loadingViewer={false}
        fetchingData={false}
        removeStory={removeStory}
        items={[state.archiveStories[state.openStory - 1]]}
        pagging={false}
        openStory={0}
      />
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
  return (
    <React.Fragment>
      <div className="story-details archive-stories">
        <div className="popupHeader">
          <div className="HeaderCloseLogo">
            <a
              className="closeBtn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                props.closePopup(e);
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

        <div className="story-sidebar">
          <div className="storyList">
            <div className="storyListBox sidebar-scroll">
              <a
                className={`d-flex align-items-center addStoryBtn${
                  state.type == "archive" ? ` active` : ``
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setState({  type: "archive" });
                }}
              >
                <div className="btncrle">
                  <span className="material-icons">archive</span>
                </div>
                <div className="flex-grow-1 addStoryBtnText">
                  <h5 className="m-0">{props.t("Story Archive")}</h5>
                </div>
              </a>
              <a
                className={`d-flex align-items-center addStoryBtn mt-3${
                  state.type != "archive" ? ` active` : ``
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!state.mutedUsers) {
                    mutedUsers();
                  }
                  setState({  type: "mute" });
                }}
              >
                <div className="btncrle">
                  <span className="material-icons">volume_mute</span>
                </div>
                <div className="flex-grow-1 addStoryBtnText">
                  <h5 className="m-0">{props.t("Stories Muted")}</h5>
                </div>
              </a>
            </div>
          </div>
        </div>
        {state.type == "archive" ? (
          <div className="story-content position-relative">
            <div className="storyDetails-contentWrap">
              <div
                className={`storyGrid-contentBox storyListBox${
                  !state.archiveStories ? ` stories-loader` : ``
                }`}
                id="stories-archive-scrollableDiv"
              >
                {!state.archiveStories ? (
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
                ) : state.archiveStories.length == 0 ? (
                  <div className="no-content text-center">
                    {props.t("No archive stories found.")}
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={state.archiveStories.length}
                    next={loadMoreContent}
                    hasMore={state.archiveStoriesPagging}
                    loader={
                      <LoadMore
                        {...props}
                        loading={true}
                        itemCount={state.archiveStories.length}
                      />
                    }
                    endMessage={
                      <EndContent
                        {...props}
                        text={""}
                        itemCount={state.archiveStories.length}
                      />
                    }
                    scrollableTarget="stories-archive-scrollableDiv"
                  >
                    <div className="storyGrid">
                      {state.archiveStories.map((story, index) => {
                        let item = story["stories"][0];
                        let image =
                          props.pageData.imageSuffix +
                          (item.type == 3 ? item.background_image : item.image);

                        return (
                          <div key={index} className="storyGrid-coloumn">
                            <a
                              className="storyArchiveThumb"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                $("body").addClass("archiveStories");
                                setState({
                                  
                                  openStory: index + 1,
                                });
                              }}
                            >
                              <div className="storyArchiveThumb-img">
                                <img src={image} alt="userimg" />
                              </div>
                              <div className="story-date">
                                <Timeago {...props}>
                                  {item.creation_date}
                                </Timeago>
                              </div>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </InfiniteScroll>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="story-content position-relative">
            <div className="storyDetails-contentWrap">
              <div
                className={`storyMuted-contentBox storyListBox${
                  !state.mutedUsers ? ` stories-loader` : ``
                }`}
                id="muted-users"
              >
                <div className="storyMuted-list">
                  {!state.mutedUsers ? (
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
                  ) : state.mutedUsers.length == 0 ? (
                    <div className="no-content text-center">
                      {props.t("No user muted yet.")}
                    </div>
                  ) : (
                    <InfiniteScroll
                      dataLength={state.mutedUsers.length}
                      next={mutedUsers}
                      hasMore={state.mutedUsersPagging}
                      loader={
                        <LoadMore
                          {...props}
                          loading={true}
                          itemCount={state.mutedUsers.length}
                        />
                      }
                      endMessage={
                        <EndContent
                          {...props}
                          text={""}
                          itemCount={state.mutedUsers.length}
                        />
                      }
                      scrollableTarget="muted-users"
                    >
                      {state.mutedUsers.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className="frndRow d-flex align-items-center justify-content-between w-100"
                          >
                            <div className="frndImgName d-flex align-items-center">
                              <div className="img">
                                <img
                                  className="avatar-40 rounded-circle"
                                  src={props.pageData.imageSuffix + item.avtar}
                                  alt="user"
                                />
                              </div>
                              <h6>{item.displayname}</h6>
                            </div>
                            <div
                              className="likeBtn active btn btn-secondary"
                              onClick={(e) => {
                                muteUser(item.resource_id);
                              }}
                            >
                              {!item.is_mute
                                ? props.t("Unmute")
                                : props.t("Mute")}
                            </div>
                          </div>
                        );
                      })}
                    </InfiniteScroll>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {openStory}
    </React.Fragment>
  );
};

export default Archive;
