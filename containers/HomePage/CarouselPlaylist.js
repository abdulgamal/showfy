import React, { useReducer, useEffect, useRef } from "react";
import Item from "../Playlist/Item";
import Link from "../../components/Link";
import Translate from "../../components/Translate/Index";

const CarouselPlaylist = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      playlists: props.playlists,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.playlists;
  useEffect(() => {
    if (props.playlists != state.playlists) {
      setState({ playlists: props.playlists });
    }
  }, [props.playlists]);

  useEffect(() => {
    props.socket.on("playlistDeleted", (socketdata) => {
      let id = socketdata.playlist_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const playlists = [...stateRef.current];
        playlists.splice(itemIndex, 1);
        setState({  playlists: playlists });
      }
    });
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "playlists") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  playlists: items });
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "playlists") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          items[itemIndex] = changedItem;
          setState({  playlists: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "playlists") {
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
          setState({  playlists: items });
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
      if (itemType == "playlists") {
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
          setState({  playlists: items });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const items = [...stateRef.current];
      const itemIndex = items.findIndex((p) => p.playlist_id == item_id);
      return itemIndex;
    }
    return -1;
  };

  if (!state.playlists || !state.playlists.length) {
    return null;
  }

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
                    props.title ? props.title : `Related Playlists`
                  )}
                </React.Fragment>
              </span>
              {props.seemore && state.playlists.length > 3 ? (
                <Link
                  href={`/playlists?${props.type ? "type" : "sort"}=${
                    props.type ? props.type : props.sort
                  }`}
                >
                  <a className="seemore_link">{Translate(props, "See more")}</a>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="gridContainer gridPlaylist">
          {
            // <props.OwlCarousel {...options} className="btn-slide" >
            state.playlists.map((result) => {
              return (
                <div key={result.playlist_id} className="gridColumn">
                  <Item {...props} {...result} playlist={result} />
                </div>
              );
            })
            // </props.OwlCarousel>
          }
        </div>
      </div>
    </div>
  );
};

export default CarouselPlaylist;
