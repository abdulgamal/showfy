import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import VideoItem from "../Video/Item";
import Translate from "../../components/Translate/Index";

const Videos = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: 2,
      videos: props.videos,
      pagging: props.pagging,
      canEdit: props.canEdit,
      canDelete: props.canDelete,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.videos;
  useEffect(() => {
    if (props.videos != state.videos) {
      setState({
        videos: props.videos,
        pagging: props.pagging,
        page: 2,
        canEdit: props.canEdit,
        canDelete: props.canDelete,
      });
    }
  }, []);
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
        if (props.updateParentItems)
          props.updateParentItems("videos", props.subTypeVideos, items);
        setState({  videos: items });
      }
    });
    props.socket.on("videoDeleted", (socketdata) => {
      let id = socketdata.video_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        items.splice(itemIndex, 1);
        if (props.updateParentItems)
          props.updateParentItems("videos", props.subTypeVideos, items);
        setState({  videos: items });
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
        if (props.updateParentItems)
          props.updateParentItems("videos", props.subTypeVideos, items);
        setState({  videos: items });
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
        if (props.updateParentItems)
          props.updateParentItems("videos", props.subTypeVideos, items);
        setState({  videos: items });
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
        if (props.updateParentItems)
          props.updateParentItems("videos", props.subTypeVideos, items);
        setState({  videos: items });
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
        if (props.updateParentItems)
          props.updateParentItems("videos", props.subTypeVideos, items);
        setState({  videos: items });
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
          if (props.updateParentItems)
            props.updateParentItems("videos", props.subTypeVideos, items);
          setState({  videos: items });
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
          if (props.updateParentItems)
            props.updateParentItems("videos", props.subTypeVideos, items);
          setState({  videos: items });
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
          if (props.updateParentItems)
            props.updateParentItems("videos", props.subTypeVideos, items);
          setState({  videos: items });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const videos = [...stateRef.current];
      const itemIndex = videos.findIndex((p) => p["video_id"] == item_id);
      return itemIndex;
    }
    return -1;
  };

  const refreshContent = () => {
    setState({  page: 1, videos: [] });
    loadMoreContent();
  };

  const loadMoreContent = () => {
    setState({  loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "";
    if (props.contentType) {
      let queryUser = "";
      if (props.userContent) {
        queryUser = "?user=" + props.userContent;
      }
      url = `/dashboard/videos/${props.contentType}${queryUser}`;
    } else if (props.user_id) {
      formData.append("owner_id", props.user_id);
      if (props.paidVideos) {
        formData.append("paidVideos", 1);
      }
      if (props.liveVideos) {
        formData.append("liveVideos", 1);
      }
      url = `/members/videos`;
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.videos) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            videos: [...state.videos, ...response.data.videos],
            loading: false,
          });
        } else {
          setState({  loading: false });
        }
      })
      .catch((err) => {
        setState({  loading: false });
      });
  };
  let data = (
    <div className="gridContainer gridVideo">
      {state.videos.map((video) => {
        return (
          <div
            key={video.video_id}
            className={props.from_user_profile ? `gridColumn` : `gridColumn`}
          >
            <VideoItem
              contentType={props.contentType}
              channel_id={props.channel_id}
              canDelete={state.canDelete}
              canEdit={state.canEdit}
              {...props}
              video={video}
              {...video}
            />
          </div>
        );
      })}
    </div>
  );
  return (
    <InfiniteScroll
      dataLength={state.videos.length}
      next={loadMoreContent}
      hasMore={state.pagging}
      loader={
        <LoadMore
          {...props}
          loading={true}
          page={state.page}
          itemCount={state.videos.length}
        />
      }
      endMessage={
        <EndContent
          {...props}
          text={
            props.contentType == "my"
              ? Translate(props, "No video created yet.")
              : props.contentType
              ? Translate(props, "No video found with your matching criteria.")
              : props.from_user_profile
              ? Translate(
                  props,
                  "No monthly subscription video created by this user yet."
                )
              : Translate(props, "No video created by this user yet.")
          }
          itemCount={state.videos.length}
        />
      }
      pullDownToRefresh={false}
      pullDownToRefreshContent={<Release release={false} {...props} />}
      releaseToRefreshContent={<Release release={true} {...props} />}
      refreshFunction={refreshContent}
    >
      {props.classNameP ? <div className={props.classNameP}>{data}</div> : data}
    </InfiniteScroll>
  );
};

export default Videos;
