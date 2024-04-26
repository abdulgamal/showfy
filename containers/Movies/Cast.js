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
      casts: props.pageData.casts,
      pagging: props.pageData.pagging,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.casts;
  useEffect(() => {
    if (props.casts != state.casts) {
      setState({
        page: 2,
        casts: props.pageData.casts,
        pagging: props.pageData.pagging,
      })
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const casts = [...stateRef.current];
      const itemIndex = casts.findIndex(
        (p) => p["cast_crew_member_id"] == item_id
      );
      return itemIndex;
    } else {
      return -1;
    }
  };
  useEffect(() => {
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
          setState({  casts: items });
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
          setState({  casts: items });
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
          setState({  casts: items });
        }
      }
    });
  }, []);

  const refreshContent = () => {
    setState({  page: 1, casts: [] });
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
    let url = "/movies/cast-and-crew";

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.casts) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            casts: [...state.casts, ...response.data.casts],
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
      dataLength={state.casts.length}
      next={loadMoreContent}
      hasMore={state.pagging}
      loader={
        <LoadMore
          {...props}
          page={state.page}
          loading={true}
          itemCount={state.casts.length}
        />
      }
      endMessage={
        <EndContent
          {...props}
          text={Translate(props, "No cast and crew user created yet.")}
          itemCount={state.casts.length}
        />
      }
      pullDownToRefresh={false}
      pullDownToRefreshContent={<Release release={false} {...props} />}
      releaseToRefreshContent={<Release release={true} {...props} />}
      refreshFunction={refreshContent}
    >
      <div className="container">
        <div className="gridContainer gridCast">
          {state.casts.map((cast) => {
            return (
              <div key={cast.cast_crew_member_id} className="gridColumn">
                <Item {...props} cast={cast} {...cast} removeDes={true} />
              </div>
            );
          })}
        </div>
      </div>
    </InfiniteScroll>
  );
};

export default Cast;
