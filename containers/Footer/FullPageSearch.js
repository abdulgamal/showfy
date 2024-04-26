import axiosCancel from "axios-cancel";
import Router from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import axios from "../../axios-orders";
import Translate from "../../components/Translate/Index";
import Audio from "../Audio/Item";
import Blog from "../Blog/Item";
import Channel from "../Channel/Item";
import EndContent from "../LoadMore/EndContent";
import LoadMore from "../LoadMore/Index";
import Movie from "../Movies/Item";
import Playlist from "../Playlist/Item";
import Member from "../User/Item";
import Video from "../Video/Item";
axiosCancel(axios, {
  debug: false, // default
});

const fullPageSearch = (props) => {
  let reduxStateSongId = useSelector((state) => {
    return state.audio.song_id;
  });
  let reduxStatePauseSongId = useSelector((state) => {
    return state.audio.pausesong_id;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      type: "video",
      items: null,
      pagging: false,
      page: 1,
      textValue: "",
      previousValue: "",
    }
  );
  const timmer = useRef();
  const stateRef = useRef();
  stateRef.current = state;
  useEffect(() => {
    //get latest videos
    $(document).ready(function (e) {
      $("#searchbox-text").focus();
    });
    getVideos();

    //register sockets
    props.socket.on("videoDeleted", (data) => {
      if (stateRef.current.type == "video") {
        let id = data.video_id;
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const videos = [
            ...(stateRef.current.items
              ? stateRef.current.items
              : stateRef.current.videoItems),
          ];
          videos.splice(itemIndex, 1);
          let changedData = {};
          changedData["localUpdate"] = true;
          changedData[stateRef.current.items ? "items" : "videoItems"] = videos;
          setState(changedData);
        }
      }
    });
    props.socket.on("ratedItem", (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let Statustype = data.type;
      let rating = data.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == stateRef.current.type + "s") {
        const items = [
          ...(stateRef.current.items
            ? stateRef.current.items
            : stateRef.current.videoItems),
        ];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        let changedData = {};
        changedData["localUpdate"] = true;
        changedData[stateRef.current.items ? "items" : "videoItems"] = items;
        setState(changedData);
      }
    });
    props.socket.on("removeScheduledVideo", (data) => {
      let id = data.id;
      let ownerId = data.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && stateRef.current.type == "video") {
        const items = [...stateRef.current.videos];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.scheduled_video_id = null;
        }
        items[itemIndex] = changedItem;
        let changedData = {};
        changedData["localUpdate"] = true;
        changedData[stateRef.current.items ? "items" : "videoItems"] = items;
        setState(changedData);
      }
    });
    props.socket.on("scheduledVideo", (data) => {
      let id = data.id;
      let ownerId = data.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && stateRef.current.type == "video") {
        const items = [...stateRef.current.videos];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.scheduled_video_id = 1;
        }
        items[itemIndex] = changedItem;
        let changedData = {};
        changedData["localUpdate"] = true;
        changedData[stateRef.current.items ? "items" : "videoItems"] = items;
        setState(changedData);
      }
    });
    props.socket.on("unwatchlater", (data) => {
      let id = data.itemId;
      let ownerId = data.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && stateRef.current.type == "video") {
        const items = [
          ...(stateRef.current.items
            ? stateRef.current.items
            : stateRef.current.videoItems),
        ];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.watchlater_id = null;
        }
        items[itemIndex] = changedItem;
        let changedData = {};
        changedData["localUpdate"] = true;
        changedData[stateRef.current.items ? "items" : "videoItems"] = items;
        setState(changedData);
      }
    });
    props.socket.on("watchlater", (data) => {
      let id = data.itemId;
      let ownerId = data.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && stateRef.current.type == "video") {
        const items = [
          ...(stateRef.current.items
            ? stateRef.current.items
            : stateRef.current.videoItems),
        ];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.watchlater_id = 1;
        }
        items[itemIndex] = changedItem;
        let changedData = {};
        changedData["localUpdate"] = true;
        changedData[stateRef.current.items ? "items" : "videoItems"] = items;
        setState(changedData);
      }
    });

    props.socket.on("unwatchlaterMovies", (data) => {
      let id = data.itemId;
      let ownerId = data.ownerId;
      const itemIndex = getItemIndex(id);
      if (
        itemIndex > -1 &&
        (stateRef.current.type == "movie" || stateRef.current.type == "series")
      ) {
        const items = [...stateRef.current.items];
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
    props.socket.on("watchlaterMovies", (data) => {
      let id = data.itemId;
      let ownerId = data.ownerId;
      const itemIndex = getItemIndex(id);
      if (
        itemIndex > -1 &&
        (stateRef.current.type == "movie" || stateRef.current.type == "series")
      ) {
        const items = [...stateRef.current.items];
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

    props.socket.on("unfavouriteItem", (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (
        type == stateRef.current.type + "s" ||
        (type == "audio" && stateRef.current.type == "audio")
      ) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const videos = [
            ...(stateRef.current.items
              ? stateRef.current.items
              : stateRef.current.videoItems),
          ];
          const changedItem = { ...videos[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          videos[itemIndex] = changedItem;
          let changedData = {};
          changedData["localUpdate"] = true;
          changedData[stateRef.current.items ? "items" : "videoItems"] = videos;
          setState(changedData);
        }
      }
    });
    props.socket.on("favouriteItem", (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (
        type == stateRef.current.type + "s" ||
        (type == "audio" && stateRef.current.type == "audio")
      ) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const videos = [
            ...(stateRef.current.items
              ? stateRef.current.items
              : stateRef.current.videoItems),
          ];
          const changedItem = { ...videos[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          videos[itemIndex] = changedItem;
          let changedData = {};
          changedData["localUpdate"] = true;
          changedData[stateRef.current.items ? "items" : "videoItems"] = videos;
          setState(changedData);
        }
      }
    });

    props.socket.on("likeDislike", (data) => {
      let itemId = data.itemId;
      let itemType = data.itemType;
      let ownerId = data.ownerId;
      let removeLike = data.removeLike;
      let removeDislike = data.removeDislike;
      let insertLike = data.insertLike;
      let insertDislike = data.insertDislike;
      if (
        itemType == stateRef.current.type + "s" ||
        (itemType == "audio" && stateRef.current.type == "audio")
      ) {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const videos = [
            ...(stateRef.current.items
              ? stateRef.current.items
              : stateRef.current.videoItems),
          ];
          const changedItem = { ...videos[itemIndex] };
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
          videos[itemIndex] = changedItem;
          let changedData = {};
          changedData["localUpdate"] = true;
          changedData[stateRef.current.items ? "items" : "videoItems"] = videos;
          setState(changedData);
        }
      }
    });
    props.socket.on("unfollowUser", (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (type == stateRef.current.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const channels = [...stateRef.current.items];
          const changedItem = { ...channels[itemIndex] };
          changedItem.follow_count = changedItem.follow_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = null;
          }
          channels[itemIndex] = changedItem;
          setState({ items: channels });
        }
      }
    });
    props.socket.on("followUser", (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (type == stateRef.current.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const channels = [...stateRef.current.items];
          const changedItem = { ...channels[itemIndex] };
          changedItem.follow_count = changedItem.follow_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = 1;
          }
          channels[itemIndex] = changedItem;
          setState({ items: channels });
        }
      }
    });
  }, []);

  const playSong = (song_id, audio) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = [...state.items];
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    setState({
      song_id: song_id,
      playsong_id: 0,
      localUpdate: true,
    });
    props.updateAudioData({
      audios: audios,
      song_id: song_id,
      pausesong_id: 0,
    });
  };
  useEffect(() => {
    getData();
  }, [state.textValue]);

  useEffect(() => {
    getData();
  }, [state.type]);
  const pauseSong = (song_id, audio) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = [...state.items];
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    setState({
      song_id: song_id,
      playsong_id: song_id,
      localUpdate: true,
    });
    props.updateAudioData({
      audios: audios,
      song_id: song_id,
      pausesong_id: song_id,
    });
  };
  const playPauseSong = (song_id, audio, e) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = [...state.items];
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    if (
      reduxStateSongId == 0 ||
      song_id == reduxStatePauseSongId ||
      song_id != reduxStateSongId
    ) {
      props.updateAudioData({
        audios: audios,
        song_id: song_id,
        pausesong_id: 0,
      });
    } else {
      props.updateAudioData({
        audios: audios,
        song_id: song_id,
        pausesong_id: song_id,
      });
    }
  };

  const loadMoreContent = () => {
    getData(true);
  };
  const changeTextValue = (e) => {
    setState({ textValue: e.target.value, page: 1 });
    // if (timmer.current) {
    //   window.clearTimeout(timmer.current);
    // }
    // timmer.current = setTimeout(() => {
    //   setState({ page: 0 });
    // }, 500);
  };
  const getData = (fromLoading) => {
    if (!state.textValue) {
      setState({ page: 1, items: null, pagging: false });
      return;
    }
    const requestId = "autosuggest-global-search";
    axios.cancel(requestId);
    let url = "/search/" + state.type + "?h=" + state.textValue + "&sort=view";

    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      requestId: requestId,
    };
    formData.append("page", state.page);
    formData.append("limit", 21);
    let type = state.type;
    axios
      .post(url, formData, config)
      .then((response) => {
        if (type == "series") {
          type = "serie";
        }
        if (response.data[type + "s"]) {
          if (fromLoading) {
            setState({
              loader: false,
              pagging: response.data.pagging,
              page: state.page + 1,
              items: [...state.items, ...response.data[type + "s"]],
            });
          } else {
            setState({
              loader: false,
              pagging: response.data.pagging,
              page: 2,
              items: [...response.data[type + "s"]],
            });
          }
        }
      })
      .catch(() => {
        //silence
      });
  };
  const typeChange = (e) => {
    setState({
      items: [],
      type: e.target.value,
      page: 1,
      loader: state.textValue ? true : false,
    });
  };
  const closeSearch = () => {
    props.setSearchClicked(false);
  };
  const getItemIndex = (item_id) => {
    const items = [
      ...(stateRef.current.items
        ? stateRef.current.items
        : stateRef.current.videoItems),
    ];
    const itemIndex = items.findIndex(
      (p) =>
        p[
          (stateRef.current.type != "member"
            ? stateRef.current.type == "movie" ||
              stateRef.current.type == "series"
              ? "movie"
              : stateRef.current.type
            : "user") + "_id"
        ] == item_id
    );
    return itemIndex;
  };

  const getVideos = () => {
    let url = "/videos-browse";
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    formData.append("pageType", "top");
    formData.append("limit", 21);
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.videos) {
          setState({ videoItems: [...response.data.videos] });
        }
      })
      .catch(() => {
        //silence
      });
  };
  const closePopUp = () => {
    props.setSearchClicked(false);
  };
  const searchButtonClick = () => {
    if (!state.textValue) {
      return;
    }
    closePopUp();
    let queryString = "h=" + state.textValue + "&sort=view";
    Router.push(`/search/${state.type}?${queryString}`);
  };

  let items = null;
  let type = "";
  if (state.type == "video" && state.items && state.items.length) {
    type = "gridVideo";
    items = state.items.map((item) => {
      return (
        <div key={item.video_id} className={"gridColumn"}>
          <Video
            {...props}
            openPlaylist={props.openPlaylist}
            key={item.video_id}
            closePopUp={closePopUp}
            {...item}
            video={item}
          />
        </div>
      );
    });
  } else if (state.type == "channel" && state.items && state.items.length) {
    type = "gridChannel";
    items = state.items.map((item) => {
      return (
        <div key={item.channel_id} className={"gridColumn"}>
          <Channel
            {...props}
            key={item.channel_id}
            closePopUp={closePopUp}
            {...item}
            channel={item}
          />
        </div>
      );
    });
  } else if (state.type == "playlist" && state.items && state.items.length) {
    type = "gridPlaylist";
    items = state.items.map((item) => {
      return (
        <div key={item.playlist_id} className={"gridColumn"}>
          <Playlist
            {...props}
            key={item.playlist_id}
            closePopUp={closePopUp}
            {...item}
            playlist={item}
          />
        </div>
      );
    });
  } else if (state.type == "blog" && state.items && state.items.length) {
    type = "gridBlog";
    items = state.items.map((item) => {
      return (
        <div key={item.blog_id} className={"gridColumn"}>
          <Blog
            {...props}
            key={item.blog_id}
            closePopUp={closePopUp}
            {...item}
            result={item}
          />
        </div>
      );
    });
  } else if (state.type == "member" && state.items && state.items.length) {
    type = "gridMember";
    items = state.items.map((item) => {
      return (
        <div key={item.user_id} className={"gridColumn"}>
          <Member
            {...props}
            key={item.user_id}
            closePopUp={closePopUp}
            {...item}
            member={item}
          />
        </div>
      );
    });
  } else if (state.type == "audio" && state.items && state.items.length) {
    type = "gridAudio";
    items = state.items.map((item) => {
      return (
        <div key={item.audio_id} className={"gridColumn"}>
          <Audio
            {...props}
            key={item.audio_id}
            playSong={playSong}
            pauseSong={pauseSong}
            closePopUp={closePopUp}
            {...item}
            audio={item}
          />
        </div>
      );
    });
  } else if (
    (state.type == "movie" || state.type == "series") &&
    state.items &&
    state.items.length
  ) {
    type = "gridMovie";
    items = state.items.map((item) => {
      return (
        <div key={item.movie_id} className={"gridColumn"}>
          <Movie
            {...props}
            key={item.movie_id}
            closePopUp={closePopUp}
            {...item}
            movie={item}
          />
        </div>
      );
    });
  } else if (
    state.type == "video" &&
    state.videoItems &&
    state.videoItems.length &&
    !state.textValue
  ) {
    type = "gridVideo";
    items = state.videoItems.map((item) => {
      return (
        <div key={item.video_id} className={"gridColumn"}>
          <Video
            {...props}
            key={item.video_id}
            closePopUp={closePopUp}
            {...item}
            video={item}
          />
        </div>
      );
    });
  }

  let objItems = state.items ? state.items : state.videoItems;
  return (
    <div id="searchBox" className="SearchBox-wrap" style={{ width: "100%" }}>
      <div className="searchBox-content">
        <div className="head-searchbox">
          <div onClick={closeSearch} className="close-btn">
            {props.t("Close")}
          </div>
          <div className="search-input">
            <input
              type="text"
              name="searchbox"
              value={state.textValue}
              onChange={changeTextValue}
              id="searchbox-text"
              placeholder={props.t("Search")}
            />
            <select
              name="type"
              value={state.type}
              onChange={(e) => typeChange(e)}
            >
              <option value="video">{Translate(props, "Videos")}</option>
              <option value="member">{Translate(props, "Members")}</option>
              {props.pageData.appSettings["enable_channel"] == 1 ? (
                <option value="channel">{Translate(props, "Channels")}</option>
              ) : null}
              {props.pageData.appSettings["enable_movie"] == 1 ? (
                <React.Fragment>
                  <option value="movie">{Translate(props, "Movies")}</option>
                  <option value="series">{Translate(props, "Series")}</option>
                </React.Fragment>
              ) : null}
              {props.pageData.appSettings["enable_blog"] == 1 ? (
                <option value="blog">{Translate(props, "Blogs")}</option>
              ) : null}
              {props.pageData.appSettings["enable_audio"] == 1 ? (
                <option value="audio">{Translate(props, "Audios")}</option>
              ) : null}
              {props.pageData.appSettings["enable_playlist"] == 1 ? (
                <option value="playlist">
                  {Translate(props, "Playlists")}
                </option>
              ) : null}
            </select>
            <button onClick={searchButtonClick}>
              <span className="material-icons">search</span>
            </button>
          </div>
        </div>

        <div className="search-content-show">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                {state.loader ? (
                  <LoadMore {...props} loading={true} />
                ) : !items && !state.textValue ? (
                  <React.Fragment></React.Fragment>
                ) : objItems ? (
                  <InfiniteScroll
                    scrollableTarget="searchBox"
                    dataLength={objItems.length}
                    next={loadMoreContent}
                    hasMore={state.pagging}
                    loader={
                      <LoadMore
                        {...props}
                        page={state.page}
                        loading={true}
                        itemCount={objItems.length}
                      />
                    }
                    endMessage={
                      <EndContent
                        {...props}
                        text={
                          !objItems.length
                            ? Translate(
                                props,
                                "No " +
                                  state.type +
                                  " found with your matching criteria."
                              )
                            : ""
                        }
                        itemCount={objItems.length}
                      />
                    }
                  >
                    <div className="container-fluid">
                      {!state.items &&
                      state.type == "video" &&
                      !state.textValue ? (
                        <h3 className="search-heading-title">
                          {props.t("Popular Videos")}
                        </h3>
                      ) : null}
                      <div
                        className={`gridContainer ${type}`}
                      >
                        {items}
                      </div>
                    </div>
                  </InfiniteScroll>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default fullPageSearch;
