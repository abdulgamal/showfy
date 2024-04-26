import React, { useReducer, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Item from "../Channel/Item";
import Translate from "../../components/Translate/Index";
import Link from "../../components/Link";
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

const CarouselChannel = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      channels: props.channels,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.channels;
  useEffect(() => {
    if (props.channels != state.channels) {
      setState({ channels: props.channels });
    }
  }, [props.channels]);

  useEffect(() => {
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "channels") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  channels: items });
      }
    });
    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "channels") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (id == changedItem.channel_id) {
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = null;
          }
          changedItem.follow_count =
            (changedItem.follow_count ? changedItem.follow_count : 0) - 1;
          items[itemIndex] = changedItem;
          setState({  channels: items });
        }
      }
    });
    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "channels") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (id == changedItem.channel_id) {
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = 1;
          }
          changedItem.follow_count =
            (changedItem.follow_count ? changedItem.follow_count : 0) + 1;
          items[itemIndex] = changedItem;
          setState({  channels: items });
        }
      }
    });
    props.socket.on("channelDeleted", (socketdata) => {
      let id = socketdata.channel_id;
      if (type == "channels") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const channels = [...stateRef.current];
          channels.splice(itemIndex, 1);
          setState({  channels: channels });
        }
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "channels") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count =
            parseInt(changedItem.favourite_count) - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          items[itemIndex] = changedItem;
          setState({  channels: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "channels") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          items[itemIndex] = changedItem;
          setState({  channels: items });
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
      if (itemType == "channels") {
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
          setState({  channels: items });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const items = [...stateRef.current];
      const itemIndex = items.findIndex((p) => p.channel_id == item_id);
      return itemIndex;
    }
    return -1;
  };

  if (!state.channels || !state.channels.length) {
    return null;
  }

  const content = state.channels.map((result) => {
    return (
      <div key={result.channel_id} className="gridColumn">
        <Item {...props} {...result} channel={result} />
      </div>
    );
  })

  return (
    <div className="VideoRoWrap">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="titleWrap">
              <span className="title">
                <React.Fragment>
                  {props.headerTitle ? props.headerTitle : null}
                  {Translate(
                    props,
                    props.title ? props.title : `Related Channels`
                  )}
                </React.Fragment>
              </span>
              {props.seemore && state.channels.length > 3 ? (
                <Link
                  href={`/channels?${props.type ? "type" : "sort"}=${
                    props.type ? props.type : props.sort
                  }`}
                >
                  <a className="seemore_link">{Translate(props, "See more")}</a>
                </Link>
              ) : null}
            </div>
          </div>
        </div>


        <Carousel
            {...props}
            carouselType="channel"
            items={content}
            itemAt1024={4}
            itemAt1200={4}
            itemAt900={3}
            itemAt600={2}
            itemAt480={1}
          >
            {content}
          </Carousel>

        {/* <div className="gridContainer gridChannel">
          {state.channels.map((result) => {
            return (
              <div key={result.channel_id} className="gridColumn">
                <Item {...props} {...result} channel={result} />
              </div>
            );
          })}
        </div> */}
      </div>
    </div>
  );
};

export default CarouselChannel;
