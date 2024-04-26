import React, { useReducer, useEffect, useRef } from "react";
import Item from "../User/Item";
import Translate from "../../components/Translate/Index";
import dynamic from "next/dynamic";
const Carousel = dynamic(() => import("../Slider/Index"), {
  ssr: false,
  loading: () => (
    <div>
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

const CarouselMember = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      members: props.members,
      key: 1,
      type: "member",
    }
  );
  const stateRef = useRef();
  stateRef.current = state.members;
  useEffect(() => {
    if (props.members != state.members) {
      setState({ members: props.members });
    }
  }, [props.members]);
  
  useEffect(() => {
    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "members") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.follow_count = changedItem.follow_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = null;
          }
          items[itemIndex] = changedItem;
          setState({  members: items });
        }
      }
    });
    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "members") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.follow_count = changedItem.follow_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = 1;
          }
          items[itemIndex] = changedItem;
          setState({  members: items });
        }
      }
    });
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == state.type + "s") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  members: items });
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == state.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const members = [...stateRef.current];
          const changedItem = { ...members[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          members[itemIndex] = changedItem;
          setState({  members: members });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == state.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const members = [...stateRef.current];
          const changedItem = { ...members[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          members[itemIndex] = changedItem;
          setState({  members: members });
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
      if (itemType == state.type + "s") {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const members = [...stateRef.current];
          const changedItem = { ...members[itemIndex] };
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
          members[itemIndex] = changedItem;
          setState({  members: members });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    const members = [...stateRef.current];
    const itemIndex = members.findIndex((p) => p["user_id"] == item_id);
    return itemIndex;
  };

  if (!state.members || !state.members.length) {
    return null;
  }

  const content = state.members.map((result) => {
    return (
      <div key={result.user_id}>
        <Item {...props} {...result} member={result} />
      </div>
    );
  });

  return (
    <div className="VideoRoWrap">
      <div className="row">
        <div className="col-md-12">
          <div className="titleWrap">
            <span className="title">
              <React.Fragment>
                {props.headerTitle ? props.headerTitle : null}
                {Translate(
                  props,
                  props.titleHeading ? props.titleHeading : `Popular Members`
                )}
              </React.Fragment>
            </span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          {
            <Carousel
              {...props}
              items={content}
              carouselType="user"
              itemAt1024={
                props.pageData.appSettings["audio_advgrid"] == 1 ? 5 : 4
              }
              itemAt1200={
                props.pageData.appSettings["audio_advgrid"] == 1 ? 4 : 4
              }
              itemAt900={
                props.pageData.appSettings["audio_advgrid"] == 1 ? 4 : 3
              }
              itemAt600={
                props.pageData.appSettings["audio_advgrid"] == 1 ? 2 : 2
              }
              itemAt480={
                props.pageData.appSettings["audio_advgrid"] == 1 ? 2 : 1
              }
            >
              {content}
            </Carousel>
          }
        </div>
      </div>
    </div>
  );
};

export default CarouselMember;
