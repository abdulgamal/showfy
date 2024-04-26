import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import Item from "./CastItem";
import Translate from "../../components/Translate/Index";

const Cast = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      cast: props.cast,
      movie: props.movie,
      pagging: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.cast;
  useEffect(() => {
    if (props.movie && props.movie != state.movie) {
      setState({
        movie: props.movie,
        page: 2,
        cast: props.cast,
        pagging: false,
      });
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    if (state.cast) {
      const artists = [...stateRef.current];
      const itemIndex = artists.findIndex(
        (p) => p["cast_crew_member_id"] == item_id
      );
      return itemIndex;
    } else {
      return -1;
    }
  };
  useEffect(() => {
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "cast_crew_members") {
        const items = [...stateRef.current];
        const changedItem = items[itemIndex];
        changedItem.rating = rating;
        setState({  cast: items });
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "cast_crew_members") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = items[itemIndex];
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData &&
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          setState({  cast: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "cast_crew_members") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = items[itemIndex];
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData &&
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          setState({  cast: items });
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
      if (itemType == "cast_crew_members") {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = items[itemIndex];
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
          setState({  cast: items });
        }
      }
    });
  }, []);

  const refreshContent = () => {
    setState({  page: 1, cast: [] });
    loadMoreContent();
  };

  // eslint-disable-next-line no-dupe-class-members
  const loadMoreContent = () => {
    setState({  loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/videos/artists";
    if (props.channel_id) {
      formData.append("channel_id", props.channel_id);
      url = `/channels/artists`;
    } else {
      formData.append("video_id", props.video_id);
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.artists) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            artists: [...state.artists, ...response.data.artists],
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

  return (
    <InfiniteScroll
      dataLength={state.cast.length}
      next={loadMoreContent}
      hasMore={state.pagging}
      loader={
        <LoadMore
          {...props}
          page={state.page}
          loading={true}
          itemCount={state.cast.length}
        />
      }
      endMessage={
        <EndContent
          {...props}
          text={Translate(props, "No cast found for this item.")}
          itemCount={state.cast.length}
        />
      }
      pullDownToRefresh={false}
      pullDownToRefreshContent={<Release release={false} {...props} />}
      releaseToRefreshContent={<Release release={true} {...props} />}
      refreshFunction={refreshContent}
    >
      <div className="gridContainer gridCast">
        {state.cast.map((cast) => {
          return (
            <div key={cast.cast_crew_id} className="gridColumn">
              <Item {...props} cast={cast} {...cast} />
            </div>
          );
        })}
      </div>
    </InfiniteScroll>
  );
};

export default Cast;
