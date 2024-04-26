import dynamic from "next/dynamic";
import Router, { withRouter } from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Linkify from "react-linkify";
import swal from "sweetalert";
import axios from "../../axios-orders";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import CensorWord from "../CensoredWords/Index";
import Comment from "../Comments/Index";
import EndContent from "../LoadMore/EndContent";
import LoadMore from "../LoadMore/Index";
import Release from "../LoadMore/Release";
import VideoItem from "../Video/Item";
import TopView from "./TopView";

import Timeago from "../Common/Timeago";
import Rating from "../Rating/Index";
import Plans from "../User/Plans";
const CarouselPlaylists = dynamic(() => import("./CarouselPlaylist"), {
  ssr: false,
});

const Playlist = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: 2,
      playlist: props.pageData.playlist,
      items:
        props.pageData.playlist && props.pageData.playlist.videos
          ? props.pageData.playlist.videos.results
          : null,
      pagging:
        props.pageData.playlist && props.pageData.playlist.videos
          ? props.pageData.playlist.videos.pagging
          : null,
      adult: props.pageData.adultPlaylist,
      relatedPlaylists: props.pageData.relatedPlaylists,
      needSubscription: props.pageData.needSubscription,
      plans: props.pageData.plans,
      tabType: props.pageData.tabType ? props.pageData.tabType : "videos",
    }
  );
  const stateRef = useRef();
  stateRef.current = state.items;
  useEffect(() => {
    if (props.pageData.playlist != state.playlist) {
      setState({
        page: 2,
        playlist: props.pageData.playlist,
        items:
          props.pageData.playlist && props.pageData.playlist.videos
            ? props.pageData.playlist.videos.results
            : null,
        pagging:
          props.pageData.playlist && props.pageData.playlist.videos
            ? props.pageData.playlist.videos.pagging
            : null,
        adult: props.pageData.adultPlaylis,
        relatedPlaylists: props.pageData.relatedPlaylists,
        needSubscription: props.pageData.needSubscription,
        plans: props.pageData.plans,
        tabType: props.pageData.tabType ? props.pageData.tabType : "videos",
      });
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    if (!stateRef.current) {
      return -1;
    }
    const items = [...stateRef.current];
    const itemIndex = items.findIndex((p) => p["video_id"] == item_id);
    return itemIndex;
  };
  useEffect(() => {
    if (state.needSubscription) {
      return;
    }
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (state.playlist && itemIndex > -1 && type == "playlists") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({ items: items });
      }
    });
    props.socket.on("videoPlaylistDeleted", (socketdata) => {
      let id = socketdata.video_id;
      let playlist_id = socketdata.playlist_id;
      if (playlist_id == state.playlist.playlist_id) {
        const itemIndex = getItemIndex(id);
        if (state.playlist && itemIndex > -1) {
          const items = [...stateRef.current];
          items.splice(itemIndex, 1);
          setState({ items: items });
        }
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
        setState({ items: items });
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
        setState({ items: items });
      }
    });
    props.socket.on("unwatchlater", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (state.playlist && itemIndex > -1) {
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
        setState({ items: items });
      }
    });
    props.socket.on("watchlater", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (state.playlist && itemIndex > -1) {
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
        setState({ items: items });
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (state.playlist && type == "videos") {
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
          setState({ items: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (state.playlist && type == "videos") {
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
          setState({ items: items });
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
      if (state.playlist && itemType == "videos") {
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
  }, []);

  const refreshContent = () => {
    setState({ page: 1, items: [] });
    loadMoreContent();
  };

  const loadMoreContent = () => {
    setState({ loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/playlist-view";
    formData.append("id", state.playlist.playlist_id);
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.items) {
          let pagging = response.data.pagging;
          setState({
            page: state.page + 1,
            pagging: pagging,
            items: [...state.items, ...response.data.items],
            loading: false,
          });
        } else {
          setState({ loading: false });
        }
      })
      .catch((err) => {
        setState({ loading: false });
      });
  };
  const deletePlaylist = (e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Once deleted, you will not be able to recover this playlist!"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("id", state.playlist.custom_url);
        const url = "/playlists/delete";
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
              Router.push(`/dashboard/playlists`);
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
    if (state.tabType == type || !state.playlist) {
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
  const deleteVideo = (e, video_id) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(props, "Are you sure want to delete this!"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("video_id", video_id);
        formData.append("id", state.playlist.custom_url);
        const url = "/playlists/video-delete";
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
  let deleteItem = null;

  if (state.playlist.canDelete) {
    deleteItem = deleteVideo;
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

  return (
    <React.Fragment>
      {state.playlist && state.playlist.approve != 1 ? (
        <div className="col-md-12  approval-pending">
          <div className="generalErrors">
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {Translate(
                props,
                "This playlist still waiting for admin approval."
              )}
            </div>
          </div>
        </div>
      ) : null}
      {!state.adult ? (
        <TopView
          {...props}
          deletePlaylist={deletePlaylist}
          playlist={state.playlist}
        />
      ) : null}
      <div className="userDetailsWraps">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              {state.adult ? (
                <div className="adult-wrapper">
                  {Translate(
                    props,
                    "This playlist contains adult content.To view this playlist, Turn on adult content setting from site footer."
                  )}
                </div>
              ) : (
                <div className="details-tab">
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    {state.needSubscription ? (
                      <li className="nav-item">
                        <a
                          className={`nav-link${
                            state.tabType == "plans" ? " active" : ""
                          }`}
                          onClick={() => pushTab("plans")}
                          data-bs-toggle="tab"
                          href={`${fURL}?tab=plans`}
                          role="tab"
                          aria-controls="plans"
                          aria-selected="false"
                        >
                          {Translate(props, "Choose Plan")}
                        </a>
                      </li>
                    ) : null}
                    {!state.needSubscription ? (
                      <li className="nav-item">
                        <a
                          className={`nav-link${
                            state.tabType == "videos" ? " active" : ""
                          }`}
                          onClick={() => pushTab("videos")}
                          data-bs-toggle="tab"
                          href={`${fURL}?tab=videos`}
                          role="tab"
                          aria-controls="videos"
                          aria-selected="true"
                        >
                          {Translate(props, "Videos")}
                        </a>
                      </li>
                    ) : null}
                    {props.pageData.appSettings[`${"playlist_comment"}`] == 1 &&
                    state.playlist.approve == 1 ? (
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
                            itemObj={state.playlist}
                            member={state.playlist.owner}
                            user_id={state.playlist.owner_id}
                            plans={state.plans}
                          />
                        </div>
                      </div>
                    ) : null}
                    {!state.needSubscription ? (
                      <div
                        className={`tab-pane fade${
                          state.tabType == "videos" ? " active show" : ""
                        }`}
                        id="videos"
                        role="tabpanel"
                      >
                        <div className="details-tab-box">
                          <InfiniteScroll
                            dataLength={state.items.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={
                              <LoadMore
                                {...props}
                                page={state.page}
                                loading={true}
                                itemCount={state.items.length}
                              />
                            }
                            endMessage={
                              <EndContent
                                {...props}
                                text={Translate(
                                  props,
                                  "No video created in this playlist yet."
                                )}
                                itemCount={state.items.length}
                              />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={
                              <Release release={false} {...props} />
                            }
                            releaseToRefreshContent={
                              <Release release={true} {...props} />
                            }
                            refreshFunction={refreshContent}
                          >
                            <div className="gridContainer gridVideo">
                              {state.items.map((video) => {
                                return (
                                  <div
                                    key={video.video_id}
                                    className="gridColumn"
                                  >
                                    <VideoItem
                                      deletePlaytistVideo={deleteItem}
                                      playlist_id={state.playlist.custom_url}
                                      {...props}
                                      video={video}
                                      {...video}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </InfiniteScroll>
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
                        {props.pageData.appSettings[`${"playlist_rating"}`] ==
                          1 && state.playlist.approve == 1 ? (
                          <React.Fragment>
                            <div className="tabInTitle">
                              <h6>{Translate(props, "Rating")}</h6>
                              <div className="rating">
                                <div className="animated-rater rating">
                                  <Rating
                                    {...props}
                                    rating={state.playlist.rating}
                                    type="playlist"
                                    id={state.playlist.playlist_id}
                                  />
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        ) : null}
                        <React.Fragment>
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Owner")}</h6>
                            <div className="owner_name">
                              <Link
                                href="/member"
                                customParam={`id=${state.playlist.owner.username}`}
                                as={`/${state.playlist.owner.username}`}
                              >
                                <a className="name">
                                  <React.Fragment>
                                    {state.playlist.owner.displayname}
                                    {props.pageData.appSettings[
                                      "member_verification"
                                    ] == 1 && state.playlist.owner.verified ? (
                                      <span
                                        className="verifiedUser"
                                        title={Translate(props, "verified")}
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
                            </div>
                          </div>
                        </React.Fragment>
                        <React.Fragment>
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Created On")}</h6>
                            <div className="creation_date">
                              <Timeago {...props}>
                                {state.playlist.creation_date}
                              </Timeago>
                            </div>
                          </div>
                        </React.Fragment>
                        {state.playlist.description ? (
                          <React.Fragment>
                            <div className="tabInTitle">
                              <h6>{Translate(props, "Description")}</h6>
                              <div className="channel_description">
                                <Linkify properties={{ target: "_blank" }}>
                                  {CensorWord(
                                    "fn",
                                    props,
                                    state.playlist.description
                                  )}
                                </Linkify>
                              </div>
                            </div>
                          </React.Fragment>
                        ) : null}
                      </div>
                    </div>
                    {props.pageData.appSettings[`${"playlist_comment"}`] == 1 &&
                    state.playlist.approve == 1 ? (
                      <div
                        className={`tab-pane fade${
                          state.tabType == "comments" ? " active show" : ""
                        }`}
                        id="comments"
                        role="tabpanel"
                      >
                        <div className="details-tab-box">
                          <Comment
                            {...props}
                            owner_id={state.playlist.owner_id}
                            hideTitle={true}
                            appSettings={props.pageData.appSettings}
                            commentType="playlist"
                            type="playlists"
                            comment_item_id={state.playlist.playlist_id}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {state.relatedPlaylists && state.relatedPlaylists.length ? (
        <React.Fragment>
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <CarouselPlaylists
            {...props}
            {...props}
            carouselType="playlist"
            playlists={state.relatedPlaylists}
          />
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default withRouter(Playlist);
