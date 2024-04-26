import React, { useReducer, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import Translate from "../../components/Translate/Index";
import dynamic from "next/dynamic";
import Router from "next/router";
import AudioItem from "../Audio/Item";
import Link from "../../components/Link/index";

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
const Audio = (props) => {
  let reduxStateSongId = useSelector((state) => {
    return state.audio.song_id;
  });
  let reduxStatePauseSongId = useSelector((state) => {
    return state.audio.pausesong_id;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      audios: props.audio,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.audios;
  useEffect(() => {
    if (props.audio != state.audios) {
      setState({ audios: props.audio });
    }
  }, [props.audio]);

  useEffect(() => {
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (stateRef.current && itemIndex > -1 && type == "audio") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  audios: items });
      }
    });
    props.socket.on("audioDeleted", (socketdata) => {
      let id = socketdata.audio_id;
      const itemIndex = getItemIndex(id);
      if (stateRef.current && itemIndex > -1) {
        const items = [...stateRef.current];
        items.splice(itemIndex, 1);
        setState({  audios: items });
      }
    });

    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (stateRef.current && type == "audio") {
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
          setState({  audios: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (stateRef.current && type == "audio") {
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
          setState({  audios: items });
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
      if (stateRef.current && itemType == "audio") {
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
          setState({  audios: items });
        }
      }
    });
  }, []);

  const getItemIndex = (item_id) => {
    if (!stateRef.current) {
      return -1;
    }
    const items = [...stateRef.current];
    const itemIndex = items.findIndex((p) => p["audio_id"] == item_id);
    return itemIndex;
  };
  const playSong = (song_id, audio, e) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = [...state.audios];
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    setState(
      {
        song_id: song_id,
        playsong_id: 0,
        
      }
    );
    props.updateAudioData({audios:audios, song_id:song_id,pausesong_id:0})
  };
  const pauseSong = (song_id, audio, e) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = [...state.audios];
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    setState(
      {
        song_id: song_id,
        playsong_id: song_id,
        
      }
    );
    props.updateAudioData({audios:audios, song_id:song_id,pausesong_id:song_id});
  };
  const playPauseSong = (song_id, audio, e) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = [...state.audios];
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
      
      props.updateAudioData({audios:audios, song_id:song_id,pausesong_id:0})
    } else {
      props.updateAudioData({audios:audios, song_id:song_id,pausesong_id:song_id})
    }
  };

  if (!state.audios || !state.audios.length) {
    return null;
  }

  const content = state.audios.map((item) => {
    return (
      <AudioItem
        fromslider={true}
        {...props}
        key={item.audio_id}
        playSong={playSong}
        pauseSong={pauseSong}
        // closePopUp={closePopUp}
        {...item}
        audio={item}
      />
    );
  });

  return (
    <div className="VideoRoWrap">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titleWrap">
              {props.pageData.themeType == 2 && props.seemore ? (
                <Link
                  href={`/audio?${"type"}=${
                    props.type ? props.type : props.sort
                  }`}
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
                    {Translate(
                      props,
                      props.titleHeading
                        ? props.titleHeading
                        : `Recent Audio`
                    )}
                  </React.Fragment>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {
              <Carousel
                {...props}
                carouselType="audio"
                defaultItemCount={
                  props.pageData.appSettings["audio_advgrid"] == 1 ? 5 : 5
                }
                itemAt1024={
                  props.pageData.appSettings["audio_advgrid"] == 1 ? 4 : 4
                }
                itemAt900={
                  props.pageData.appSettings["audio_advgrid"] == 1 ? 3 : 3
                }
                itemAt1200={3}
                itemAt1500={
                  props.pageData.appSettings["audio_advgrid"] == 1 ? 5 : 5
                }
                itemAt600={
                  props.pageData.appSettings["audio_advgrid"] == 1 ? 2 : 2
                }
                itemAt480={1}
              >
                {content}
              </Carousel>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audio;
