import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";

import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import Item from "../Playlist/Item";
import Translate from "../../components/Translate/Index";

const Playlists = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: 2,
      playlists: props.playlists,
      pagging: props.pagging,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.playlists;
  useEffect(() => {
    if (state.playlists != props.playlists) {
      setState({ playlists: props.playlists, pagging: props.pagging, page: 2 });
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const playlists = [...stateRef.current];
      const itemIndex = playlists.findIndex((p) => p["playlist_id"] == item_id);
      return itemIndex;
    }
    return -1;
  };
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
        setState({  playlists: items });
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
        setState({  playlists: items });
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
        setState({  playlists: items });
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
            props.pageData &&
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
            props.pageData &&
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

    if (props.channel_id) {
      props.socket.on("channelPlaylistDeleted", (socketdata) => {
        let channel_id = socketdata.channel_id;
        let message = socketdata.message;
        let playlist_id = socketdata.playlist_id;
        if (channel_id == props.channel_id) {
          const itemIndex = getItemIndex(playlist_id);
          if (itemIndex > -1) {
            const playlists = [...stateRef.current];
            playlists.splice(itemIndex, 1);
            setState({  playlists: playlists });
            props.openToast({message:Translate(props, message), type:"success"});
          }
        }
      });
    }
  }, []);

  const refreshContent = () => {
    setState({  page: 1, playlists: [] });
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
      url = `/dashboard/playlists/${props.contentType}${queryUser}`;
    } else if (props.channel_id) {
      formData.append("channel_id", props.channel_id);
      url = `/channels/playlists`;
    } else if (props.user_id) {
      formData.append("owner_id", props.user_id);
      url = `/members/playlists`;
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.playlists) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            playlists: [...state.playlists, ...response.data.playlists],
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
      dataLength={state.playlists.length}
      next={loadMoreContent}
      hasMore={state.pagging}
      loader={
        <LoadMore
          {...props}
          page={state.page}
          loading={true}
          itemCount={state.playlists.length}
        />
      }
      endMessage={
        <EndContent
          {...props}
          text={
            props.contentType == "my"
              ? Translate(props, "No playlist created yet.")
              : props.contentType
              ? Translate(
                  props,
                  "No playlist found with your matching criteria."
                )
              : props.channel_id
              ? Translate(props, "No playlist created in this channel yet.")
              : Translate(props, "No playlist created by this user yet.")
          }
          itemCount={state.playlists.length}
        />
      }
      pullDownToRefresh={false}
      pullDownToRefreshContent={<Release release={false} {...props} />}
      releaseToRefreshContent={<Release release={true} {...props} />}
      refreshFunction={refreshContent}
    >
      <div className="gridContainer gridPlaylist">
        {state.playlists.map((playlist) => {
          return (
            <div key={playlist.playlist_id} className="gridColumn">
              <Item
                canDelete={props.canDelete}
                {...props}
                {...playlist}
                playlist={playlist}
              />
            </div>
          );
        })}
      </div>
    </InfiniteScroll>
  );
};

export default Playlists;
