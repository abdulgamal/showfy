import React, { useReducer, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import Item from "../Video/Item";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import dynamic from "next/dynamic";
const Carousel = dynamic(() => import("../Slider/Index"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="heading shimmer"></div>
      <div className="grid">
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
      </div>
    </div>
  ),
});
const TopVideos = (props) => {
  const {t} = useTranslation()
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      videos: props.videos,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.videos;
  useEffect(() => {
    if (props.videos != state.videos) {
      setState({ videos: props.videos });
    }
  }, [props.videos]);

  useEffect(() => {
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
        setState({  videos: items });
      }
    });
    props.socket.on("videoDeleted", (socketdata) => {
      let id = socketdata.video_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        items.splice(itemIndex, 1);
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
        setState({  videos: items });
      }
    });
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

  const content = state.videos.map((video) => {
    return props.pageData.appSettings["video_carousel_home"] == 1 ? (
      <Item
        key={video.video_id}
        openPlaylist={props.openPlaylist}
        {...props}
        {...video}
        video={video}
      />
    ) : (
      // <div key={video.video_id} className="gridColumn">
        <Item
          key={video.video_id}
          openPlaylist={props.openPlaylist}
          {...props}
          {...video}
          video={video}
        />
      // </div>
    );
  });
  return (
    <div className="VideoRoWrap">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="titleWrap">
              {props.pageData.themeType == 2 && props.seemore ? (
                <Link
                  href={`/videos?${
                    props.subType ? props.subType : props.type ? "type" : "sort"
                  }=${props.type ? props.type : props.sort}`}
                >
                  <a className="link">
                    <span className="title">
                      <React.Fragment>
                        {props.headerTitle ? props.headerTitle : null}
                        {Translate(props, props.title)}
                      </React.Fragment>
                    </span>
                  </a>
                </Link>
              ) : (
                <span className="title">
                  <React.Fragment>
                    {props.headerTitle ? props.headerTitle : null}
                    {Translate(props, props.title)}
                  </React.Fragment>
                </span>
              )}
              {props.seemore && state.videos.length > 3 ? (
                <Link
                  href={`/videos?${
                    props.subType ? props.subType : props.type ? "type" : "sort"
                  }=${props.type ? props.type : props.sort}`}
                >
                  <a className="seemore_link">{Translate(props, "See more")}</a>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        {/* {props.pageData.appSettings["video_carousel_home"] == 1 ? ( */}
          <Carousel
            {...props}
            carouselType="video"
            items={content}
            itemAt1024={4}
            itemAt1200={4}
            itemAt900={3}
            itemAt600={2}
            itemAt480={1}
          >
            {content}
          </Carousel>
        {/* ) : (
          <div className="gridContainer gridVideo">{content}</div>
        )} */}
      </div>
    </div>
  );
};
export default TopVideos;
