import React, { useReducer, useEffect, useRef } from "react";
import Carousel from "react-slick";
import Translate from "../../components/Translate/Index";
import Link from "../../components/Link";
import CensorWord from "../CensoredWords/Index";
import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import Timeago from "../Common/Timeago";
import WatchLater from "../WatchLater/Index";
import Image from "../Image/Index";

import ShortNumber from "short-number";

const VideoSlider = (props) => {
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
    props.socket.on("videoDeleted", (socketdata) => {
      let id = socketdata.video_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const videos = [...stateRef.current];
        videos.splice(itemIndex, 1);
        setState({  videos: videos });
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
        const changedItem = items[itemIndex];
        changedItem.rating = rating;
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
          const changedItem = items[itemIndex];
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
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
          const changedItem = items[itemIndex];
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
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
          setState({  videos: items });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const items = [...stateRef.current];
      const itemIndex = items.findIndex((p) => p.video_id == item_id);
      return itemIndex;
    } else {
      return -1;
    }
  };

  if (!state.videos || !state.videos.length) {
    return null;
  }

  const Right = (props) => (
    <button className="control-arrow control-next" onClick={props.onClick}>
      <span className="material-icons" data-icon="keyboard_arrow_right"></span>
    </button>
  );
  const Left = (props) => (
    <button className="control-arrow control-prev" onClick={props.onClick}>
      <span className="material-icons" data-icon="keyboard_arrow_left"></span>
    </button>
  );
  var settings = {
    dots: true,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: "carousel-slider",
    initialSlide: 0,
    nextArrow: <Right />,
    prevArrow: <Left />,
    centerMode: true,
    centerPadding: props.pageData.themeType == 2 ? "4%" : 0,
  };
  return (
    <div
      className={`SlideAdsWrap${
        props.pageData.appSettings["video_adv_slider"] == 1 ? " nobtn" : ""
      }`}
    >
      <div id="snglFullWdth" className="snglFullWdth">
        <Carousel {...settings}>
          {state.videos.map((item) => {
            let isS3 = true;
            let background = "";
            let avtar = "";
            if (item.image) {
              const splitVal = item.image.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isS3 = false;
              }
            }
            background = (isS3 ? props.pageData.imageSuffix : "") + item.image;
            let isS3Avtar = true;
            if (item.avtar) {
              const splitVal = item.avtar.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isS3Avtar = false;
              }
            }
            avtar = (isS3Avtar ? props.pageData.imageSuffix : "") + item.avtar;
            return props.pageData.appSettings["video_adv_slider"] != 1 ? (
              <div className="item" key={item.video_id}>
                <div className="ptvBannerWrap">
                  <div className="ptvBanner_blur_img">
                    <div style={{ background: `url(${background})` }}></div>
                  </div>
                  <div className="container">
                    <div className="row">
                      <div className="ptvBanner_Content">
                        {props.pageData.appSettings["videos_featuredlabel"] ==
                          1 &&
                        props.pageData.appSettings["video_featured"] == 1 &&
                        item.is_featured == 1 ? (
                          <h4 title={Translate(props, "Featured Videos")}>
                            <span className="lbl-Featured">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-award"
                              >
                                <circle cx="12" cy="8" r="7"></circle>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                              </svg>
                            </span>
                          </h4>
                        ) : null}
                        <div className="ptvBanner_VideoInfo">
                          <Link
                            href="/watch"
                            customParam={`id=${item.custom_url}`}
                            as={`/watch/${item.custom_url}`}
                          >
                            <a>
                              <div className="BnnrThumb">
                                <img src={background} />
                              </div>
                            </a>
                          </Link>
                          <div className="video-title">
                            <div className="video_title_combo">
                              <div className="video-big-title">
                                <Link
                                  href="/watch"
                                  customParam={`id=${item.custom_url}`}
                                  as={`/watch/${item.custom_url}`}
                                >
                                  <a>
                                    {
                                      <CensorWord
                                        {...props}
                                        text={item.title}
                                      />
                                    }
                                  </a>
                                </Link>
                              </div>

                              <div className="pvtBannerLike">
                                <ul className="LikeDislikeList">
                                  {props.pageData.appSettings["videos_like"] ==
                                  1 ? (
                                    <li>
                                      <Like
                                        icon={true}
                                        {...props}
                                        like_count={item.like_count}
                                        item={item}
                                        type="video"
                                        id={item.video_id}
                                      />
                                      {"  "}
                                    </li>
                                  ) : null}
                                  {props.pageData.appSettings[
                                    "videos_dislike"
                                  ] == 1 ? (
                                    <li>
                                      <Dislike
                                        icon={true}
                                        {...props}
                                        dislike_count={item.dislike_count}
                                        item={item}
                                        type="video"
                                        id={item.video_id}
                                      />
                                      {"  "}
                                    </li>
                                  ) : null}
                                  {props.pageData.appSettings[
                                    "videos_favourite"
                                  ] == 1 ? (
                                    <li>
                                      <Favourite
                                        icon={true}
                                        {...props}
                                        favourite_count={item.favourite_count}
                                        item={item}
                                        type="video"
                                        id={item.video_id}
                                      />
                                      {"  "}
                                    </li>
                                  ) : null}
                                  {props.pageData.appSettings["videos_views"] ==
                                  1 ? (
                                    <li>
                                      <span title="Views">
                                        <span className="material-icons">
                                          visibility
                                        </span>{" "}
                                        {" " +
                                          `${ShortNumber(
                                            item.view_count
                                              ? item.view_count
                                              : 0
                                          )}`}
                                      </span>
                                    </li>
                                  ) : null}
                                  {props.pageData.appSettings[
                                    "videos_watchlater"
                                  ] == 1 && false ? (
                                    <li>
                                      <WatchLater
                                        className="watchLater"
                                        icon={true}
                                        {...props}
                                        item={item}
                                        id={item.video_id}
                                      />
                                    </li>
                                  ) : null}
                                </ul>
                              </div>
                              <div
                                className="VideoDtaeTime"
                                style={{ display: "none" }}
                              >
                                {item.duration ? (
                                  <p className="duration">{item.duration}</p>
                                ) : null}

                                {props.pageData.appSettings[
                                  "videos_datetime"
                                ] == 1 ? (
                                  <p className="date">
                                    <Timeago {...props}>
                                      {item.creation_date}
                                    </Timeago>
                                  </p>
                                ) : null}
                              </div>
                              {props.pageData.appSettings["videos_username"] ==
                              1 ? (
                                <div className="pvtBanner_userInfo">
                                  <div className="pvtBanner_userInfo_img">
                                    <Link
                                      className="username"
                                      href="/member"
                                      customParam={`id=${item.username}`}
                                      as={`/${item.username}`}
                                    >
                                      <a>
                                        <img src={avtar} alt={item.username} />
                                      </a>
                                    </Link>
                                  </div>
                                  <div className="publisher-name">
                                    <Link
                                      className="username"
                                      href="/member"
                                      customParam={`id=${item.username}`}
                                      as={`/${item.username}`}
                                    >
                                      <a className="UserName">
                                        <span className="username">
                                          {item.displayname}
                                          {props.pageData.appSettings[
                                            "member_verification"
                                          ] == 1 && item.verified == 1 ? (
                                            <span className="verifiedUser">
                                              <span
                                                className="material-icons"
                                                data-icon="check"
                                              ></span>
                                            </span>
                                          ) : null}
                                        </span>
                                      </a>
                                    </Link>
                                  </div>
                                  <div className="clear"></div>
                                </div>
                              ) : null}
                            </div>
                            <div className="clear"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="banner-wrap justify-content-between align-items-center"
                key={item.video_id}
              >
                <div className="left-wrap">
                  <h4 className="my-3 ellipsize2Line">
                    <Link
                      href="/watch"
                      customParam={`id=${item.custom_url}`}
                      as={`/watch/${item.custom_url}`}
                    >
                      <a>{<CensorWord {...props} text={item.title} />}</a>
                    </Link>
                  </h4>
                  <div className="BnrUserInfo mb-3">
                    {props.pageData.appSettings["videos_username"] == 1 ? (
                      <React.Fragment>
                        <div className="BnrUserInfo_img">
                          <Link
                            className="username"
                            href="/member"
                            customParam={`id=${item.username}`}
                            as={`/${item.username}`}
                          >
                            <a>
                              <Image
                                height="50"
                                width="50"
                                title={item.username}
                                image={avtar}
                                imageSuffix={props.pageData.imageSuffix}
                                siteURL={props.pageData.siteURL}
                              />
                            </a>
                          </Link>
                        </div>
                        <div className="publisher-name">
                          <Link
                            className="username"
                            href="/member"
                            customParam={`id=${item.username}`}
                            as={`/${item.username}`}
                          >
                            <a className="UserName">
                              <span className="username">
                                {item.displayname}
                                {props.pageData.appSettings[
                                  "member_verification"
                                ] == 1 && item.verified == 1 ? (
                                  <span className="verifiedUser">
                                    <span
                                      className="material-icons"
                                      data-icon="check"
                                    ></span>
                                  </span>
                                ) : null}
                              </span>
                            </a>
                          </Link>
                        </div>
                        <div className="clear"></div>
                      </React.Fragment>
                    ) : null}
                    <div className="clear"></div>
                  </div>

                  <div className="smInfo d-flex align-items-center flex-wrap mb-5">
                    <div className="pvtBannerLike">
                      <ul className="LikeDislikeList">
                        {props.pageData.appSettings["videos_like"] == 1 ? (
                          <li>
                            <Like
                              icon={true}
                              {...props}
                              like_count={item.like_count}
                              item={item}
                              type="video"
                              id={item.video_id}
                            />
                            {"  "}
                          </li>
                        ) : null}
                        {props.pageData.appSettings["videos_dislike"] == 1 ? (
                          <li>
                            <Dislike
                              icon={true}
                              {...props}
                              dislike_count={item.dislike_count}
                              item={item}
                              type="video"
                              id={item.video_id}
                            />
                            {"  "}
                          </li>
                        ) : null}
                        {props.pageData.appSettings["videos_favourite"] == 1 ? (
                          <li>
                            <Favourite
                              icon={true}
                              {...props}
                              favourite_count={item.favourite_count}
                              item={item}
                              type="video"
                              id={item.video_id}
                            />
                            {"  "}
                          </li>
                        ) : null}
                        {props.pageData.appSettings["videos_views"] == 1 ? (
                          <li>
                            <span title="Views">
                              <span className="material-icons">visibility</span>{" "}
                              {" " +
                                `${ShortNumber(
                                  item.view_count ? item.view_count : 0
                                )}`}
                            </span>
                          </li>
                        ) : null}
                        {props.pageData.appSettings["videos_watchlater"] == 1 &&
                        false ? (
                          <li>
                            <WatchLater
                              className="watchLater"
                              icon={true}
                              {...props}
                              item={item}
                              id={item.video_id}
                            />
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Link
                      href="/watch"
                      customParam={`id=${item.custom_url}`}
                      as={`/watch/${item.custom_url}`}
                    >
                      <a className="btn btn-lg playBtn">
                        <span className="d-flex align-items-center justify-content-center">
                          <span className="material-icons-outlined">
                            play_arrow
                          </span>{" "}
                          {props.t("Play Now")}
                        </span>
                      </a>
                    </Link>
                  </div>
                </div>
                <div
                  className="right-wrap"
                  style={{ backgroundImage: `url(${background})` }}
                ></div>
              </div>
            );
          })}
        </Carousel>
      </div>
    </div>
  );
};

export default VideoSlider;
