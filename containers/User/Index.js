import dynamic from "next/dynamic";
import Router, { withRouter } from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import Linkify from "react-linkify";
import ReactStars from "react-rating-stars-component";
import Translate from "../../components/Translate/Index";
import Timeago from "../Common/Timeago";
import Cover from "../Cover/User";
import Rating from "../Rating/Index";
import ProfileTabe from "./ProfileTabs";

const Comment = dynamic(() => import("../Comments/Index"), {
  ssr: false,
});
const Videos = dynamic(() => import("../Video/Videos"), {
  ssr: false,
});
const Movies = dynamic(() => import("../Movies/Browse"), {
  ssr: false,
});
const Channel = dynamic(() => import("../Channel/Channels"), {
  ssr: false,
});
const Blog = dynamic(() => import("../Blog/Blogs"), {
  ssr: false,
});
const Playlists = dynamic(() => import("../Playlist/Playlists"), {
  ssr: false,
});
const Audio = dynamic(() => import("../Audio/Browse"), {
  ssr: false,
});
const Reels = dynamic(() => import("../Reels/Carousel/Browse"), {
  ssr: false,
});
const Patreon = dynamic(() => import("./Patreon"), {
  ssr: false,
});
const Plans = dynamic(() => import("./Plans"), {
  ssr: false,
});
const Subscribers = dynamic(() => import("./Subscribers"), {
  ssr: false,
});

const Followers = dynamic(() => import("./Followers"), {
  ssr: false,
});

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      homeData: props.pageData.homeData,
      videos: props.pageData.videos,
      channels: props.pageData.channels,
      playlists: props.pageData.playlists,
      blogs: props.pageData.blogs,
      member: props.pageData.member,
      audios: props.pageData.audio,
      reels: props.pageData.reels,
      planCreate: props.pageData.planCreate == 1,
      plans: props.pageData.plans ? props.pageData.plans.results : null,
      userSubscription: props.pageData.userSubscription
        ? props.pageData.userSubscription
        : false,
      userSubscriptionID: props.pageData.userSubscriptionID
        ? props.pageData.userSubscriptionID
        : null,
      tabType: props.pageData.tabType
        ? props.pageData.tabType
        : props.pageData.showHomeButtom && props.pageData.showHomeButtom == 1
        ? "home"
        : props.pageData.plans
        ? "plans"
        : "videos",
      showHomeButtom: props.pageData.showHomeButtom
        ? props.pageData.showHomeButtom
        : 0,
      paidVideos: props.pageData.paidVideos ? props.pageData.paidVideos : null,
      liveVideos: props.pageData.liveVideos ? props.pageData.liveVideos : null,
      movies: props.pageData.movies_data ? props.pageData.movies_data : null,
      series: props.pageData.series ? props.pageData.series : null,
      followers: props.pageData.followers ? props.pageData.followers : null,
      following: props.pageData.following ? props.pageData.following : null,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.member;
  useEffect(() => {
    if (
      props.pageData.member.user_id != state.member.user_id ||
      props.pageData.userSubscriptionID != state.userSubscriptionID
    ) {
      setState({
        homeData: props.pageData.homeData,
        userSubscription: props.pageData.userSubscription
          ? props.pageData.userSubscription
          : false,
        userSubscriptionID: props.pageData.userSubscriptionID
          ? props.pageData.userSubscriptionID
          : 0,
        plans: props.pageData.plans ? props.pageData.plans.results : null,
        planCreate: props.pageData.planCreate == 1,
        audios: props.pageData.audio,
        member: props.pageData.member,
        videos: props.pageData.videos,
        reels: props.pageData.reels,
        channels: props.pageData.channels,
        playlists: props.pageData.playlists,
        blogs: props.pageData.blogs,
        tabType: props.pageData.tabType
          ? props.pageData.tabType
          : props.pageData.showHomeButtom && props.pageData.showHomeButtom == 1
          ? "home"
          : props.pageData.plans
          ? "plans"
          : "videos",
        showHomeButtom: props.pageData.showHomeButtom
          ? props.pageData.showHomeButtom
          : 0,
        paidVideos: props.pageData.paidVideos
          ? props.pageData.paidVideos
          : null,
        liveVideos: props.pageData.liveVideos
          ? props.pageData.liveVideos
          : null,
        movies: props.pageData.movies_data ? props.pageData.movies_data : null,
        series: props.pageData.series ? props.pageData.series : null,
        followers: props.pageData.followers ? props.pageData.followers : null,
        following: props.pageData.following ? props.pageData.following : null,
      });
    }
  }, [props]);

  useEffect(() => {
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      if (id == stateRef.current.user_id && type == "members") {
        const data = { ...stateRef.current };
        data.rating = rating;
        setState({ member: data });
      }
    });
    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (id == stateRef.current.user_id && type == "members") {
        const data = { ...stateRef.current };
        data.follow_count = data.follow_count - 1;
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          data.follower_id = null;
        }
        setState({ member: data });
      }
    });
    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (id == stateRef.current.user_id && type == "members") {
        const data = { ...stateRef.current };
        data.follow_count = data.follow_count + 1;
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          data.follower_id = 1;
        }
        setState({ member: data });
      }
    });

    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (id == stateRef.current.user_id && type == "members") {
        if (stateRef.current.user_id == id) {
          const data = { ...stateRef.current };
          data.favourite_count = data.favourite_count - 1;
          if (props.pageData.loggedInUserDetails.user_id == ownerId) {
            data.favourite_id = null;
          }
          setState({ member: data });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (id == stateRef.current.user_id && type == "members") {
        if (stateRef.current.user_id == id) {
          const data = { ...stateRef.current };
          data.favourite_count = data.favourite_count + 1;
          if (props.pageData.loggedInUserDetails.user_id == ownerId) {
            data.favourite_id = 1;
          }
          setState({ member: data });
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
      if (itemType == "members" && stateRef.current.user_id == itemId) {
        const item = { ...stateRef.current };
        let loggedInUserDetails = {};
        if (props.pageData && props.pageData.loggedInUserDetails) {
          loggedInUserDetails = props.pageData.loggedInUserDetails;
        }
        if (removeLike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = null;
          item["like_count"] = parseInt(item["like_count"]) - 1;
        }
        if (removeDislike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = null;
          item["dislike_count"] = parseInt(item["dislike_count"]) - 1;
        }
        if (insertLike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = "like";
          item["like_count"] = parseInt(item["like_count"]) + 1;
        }
        if (insertDislike) {
          if (loggedInUserDetails.user_id == ownerId)
            item["like_dislike"] = "dislike";
          item["dislike_count"] = parseInt(item["dislike_count"]) + 1;
        }
        setState({ member: item });
      }
    });
    props.socket.on("userCoverReposition", (socketdata) => {
      let id = socketdata.user_id;
      if (id == stateRef.current.user_id) {
        const item = { ...stateRef.current };
        item.cover_crop = socketdata.image;
        item.showCoverReposition = false;
        setState({ member: item, loadingCover: false });
        props.openToast({
          message: Translate(props, socketdata.message),
          type: "success",
        });
      }
    });
    props.socket.on("userMainPhotoUpdated", (socketdata) => {
      let id = socketdata.user_id;
      if (id == stateRef.current.user_id) {
        const item = { ...stateRef.current };
        item.avtar = socketdata.image;
        const userData = { ...props.pageData };
        if (
          userData.loggedInUserDetails &&
          userData.loggedInUserDetails.user_id == id
        ) {
          userData.loggedInUserDetails.avtar = socketdata.image;
          setState({ member: item, loadingCover: false });
          props.openToast({
            message: Translate(props, socketdata.message),
            type: "success",
          });
        } else {
          setState({ member: item, loadingCover: false });
          props.openToast({
            message: Translate(props, socketdata.message),
            type: "success",
          });
        }
      }
    });
    props.socket.on("userCoverUpdated", (socketdata) => {
      let id = socketdata.user_id;
      if (id == stateRef.current.user_id) {
        const item = { ...stateRef.current };
        item.cover = socketdata.image;
        item.usercover = true;
        item.cover_crop = socketdata.cover_crop;
        if (
          socketdata.image &&
          socketdata.image.indexOf(".gif") == -1 &&
          socketdata.image.indexOf(".GIF") == -1
        ) {
          item.showCoverReposition = true;
        }
        setState({ member: item, loadingCover: false });
        props.openToast({
          message: Translate(props, socketdata.message),
          type: "success",
        });
      }
    });
  }, []);
  const planChange = (plans) => {
    setState({ plans: plans });
  };
  const deletePlan = (message, plans) => {
    props.openToast({ message: message, type: "success" });
    setState({ plans: plans });
  };
  useEffect(() => {
    if (
      props.router.query &&
      props.router.query.tab != state.tabType &&
      props.router.query.tab
    ) {
      setState({ tabType: props.router.query.tab });
    } else if (props.router.query && !props.router.query.tab) {
      if ($(".nav-tabs").children().length > 0) {
        let type = $(".nav-tabs")
          .children()
          .first()
          .find("a")
          .attr("aria-controls");
        if (!props.pageData.member.block) setState({ tabType: type });
      }
    }
  }, [props.router.query]);
  const pushTab = (type, e) => {
    if (e) e.preventDefault();
    if (state.tabType == type || !state.member) {
      return;
    }
    let fUrl = props.router.asPath.split("?");
    let url = fUrl[0];
    let otherQueryParams = null;
    if (typeof URLSearchParams !== "undefined") {
      otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
      otherQueryParams.delete("tab");
    }
    let fURL =
      url +
      "?" +
      (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");
    Router.push(`${fURL}tab=${type}`, `${fURL}tab=${type}`, { shallow: true });
  };

  const blockUser = () => {
    // block user
    Router.push(`/${state.member.username}?block=true`);
  };

  let fUrl = props.router.asPath.split("?");
  let url = fUrl[0];
  let otherQueryParams = null;
  if (typeof URLSearchParams !== "undefined") {
    otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
    otherQueryParams.delete("tab");
  }
  let fURL =
    url +
    "?" +
    (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");

  return (
    <React.Fragment>
      <Cover
        {...props}
        pushTab={pushTab}
        blockUser={blockUser}
        showHomeButtom={state.showHomeButtom}
        plans={state.plans}
        member={state.member}
        type="member"
        id={state.member.user_id}
      />
      {state.member.block && state.member.showBlock ? (
        <div className="details-video-wrap">
          <div className="container">
            <div className="row">
              <div className={`col-xl-12 col-lg-12`}>
                <div className="adult-wrapper block-wrapper">
                  {Translate(props, "Unblock user to see full profile.")}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="userDetailsWraps">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="details-tab">
                {(state.showHomeButtom != 1 || state.tabType != "home") &&
                !state.member.block ? (
                  <ProfileTabe
                    {...props}
                    fURL={fURL}
                    stateHome={state}
                    pushTab={pushTab}
                    member={state.member}
                    state={state}
                  />
                ) : state.showHomeButtom != 1 && state.member.block ? (
                  <ul
                    className={`nav nav-tabs${
                      props.newDesign ? " sidebar-scroll-new" : ""
                    }`}
                    id="myTab"
                    role="tablist"
                  >
                    <li className="nav-item">
                      <a
                        className={`nav-link active`}
                        data-bs-toggle="tab"
                        href={`${fURL}?tab=about`}
                        role="tab"
                        aria-controls="about"
                        aria-selected="true"
                      >
                        {Translate(props, "About")}
                      </a>
                    </li>
                  </ul>
                ) : null}

                {
                  <div className="tab-content" id="myTabContent">
                    {state.showHomeButtom == 1 && !state.member.block ? (
                      <div
                        className={`tab-pane fade${
                          state.tabType == "home" ? " active show" : ""
                        }`}
                        id="home"
                        role="tabpanel"
                      >
                        <div className="home-container">
                          <Patreon
                            {...props}
                            stateHome={state}
                            pushTab={pushTab}
                            showHomeButtom={state.showHomeButtom}
                            homeData={state.homeData}
                            userSubscription={state.userSubscription}
                            userSubscriptionID={state.userSubscriptionID}
                            member={state.member}
                            deletePlan={deletePlan}
                            onChangePlan={planChange}
                            user_id={state.member.user_id}
                            plans={state.plans}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`tab-pane fade${
                          state.tabType == "about" ? " active show" : ""
                        }`}
                        id="about"
                        role="tabpanel"
                      >
                        <div className="details-tab-box">
                          {props.pageData.appSettings[`${"member_rating"}`] ==
                          1 ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Rating")}</h6>
                                <div className="rating">
                                  <React.Fragment>
                                    <div className="animated-rater">
                                      {!props.settings ? (
                                        <Rating
                                          {...props}
                                          {...state.member}
                                          rating={state.member.rating}
                                          type="member"
                                          id={state.member.user_id}
                                        />
                                      ) : (
                                        <ReactStars
                                          size={24}
                                          value={state.member.rating}
                                          count={5}
                                          edit={false}
                                        />
                                      )}
                                    </div>
                                  </React.Fragment>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          <React.Fragment>
                            <div className="tabInTitle">
                              <h6>{Translate(props, "First Name")}</h6>
                              <div className="owner_name">
                                <React.Fragment>
                                  {state.member.first_name}
                                </React.Fragment>
                              </div>
                            </div>
                          </React.Fragment>
                          {state.member.last_name ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Last Name")}</h6>
                                <div className="owner_name">
                                  <React.Fragment>
                                    {state.member.last_name}
                                  </React.Fragment>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Member Since")}</h6>
                            <div className="member_since">
                              <Timeago {...props}>
                                {state.member.creation_date}
                              </Timeago>
                            </div>
                          </div>
                          <React.Fragment>
                            <div className="tabInTitle">
                              <h6>{Translate(props, "Gender")}</h6>
                              <div className="owner_gender">
                                <React.Fragment>
                                  {state.member.gender == "male"
                                    ? props.t("Male")
                                    : props.t("Female")}
                                </React.Fragment>
                              </div>
                            </div>
                          </React.Fragment>
                          {state.member.age > 0 ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Age")}</h6>
                                <div className="owner_gender">
                                  <React.Fragment>
                                    {state.member.age}
                                  </React.Fragment>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          {state.member.about ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "About")}</h6>
                                <div className="channel_description">
                                  <Linkify properties={{ target: "_blank" }}>
                                    {state.member.about}
                                  </Linkify>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          {state.member.phone_number ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Phone Number")}</h6>
                                <div className="owner_phone">
                                  {state.member.phone_number}
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          {state.member.facebook ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Facebook")}</h6>
                                <div className="owner_external_link">
                                  <a
                                    href={state.member.facebook}
                                    target="_blank"
                                  >
                                    {state.member.facebook}
                                  </a>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}

                          {state.member.instagram ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Instagram")}</h6>
                                <div className="owner_external_link">
                                  <a
                                    href={state.member.instagram}
                                    target="_blank"
                                  >
                                    {state.member.instagram}
                                  </a>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          {state.member.pinterest ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Pinterest")}</h6>
                                <div className="owner_external_link">
                                  <a
                                    href={state.member.pinterest}
                                    target="_blank"
                                  >
                                    {state.member.pinterest}
                                  </a>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                          {state.member.twitter ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Twitter")}</h6>
                                <div className="owner_external_link">
                                  <a
                                    href={state.member.twitter}
                                    target="_blank"
                                  >
                                    {state.member.twitter}
                                  </a>
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {!state.member.block ? (
                      <React.Fragment>
                        {state.planCreate ? (
                          <React.Fragment>
                            <div
                              className={`tab-pane fade${
                                state.tabType == "plans" ? " active show" : ""
                              }`}
                              id="plans"
                              role="tabpanel"
                            >
                              <div className="details-tab-box">
                                <Plans
                                  {...props}
                                  userSubscription={state.userSubscription}
                                  userSubscriptionID={state.userSubscriptionID}
                                  member={state.member}
                                  deletePlan={deletePlan}
                                  onChangePlan={planChange}
                                  user_id={state.member.user_id}
                                  plans={state.plans}
                                />
                              </div>
                            </div>
                            {state.member.subscribers ? (
                              <div
                                className={`tab-pane fade${
                                  state.tabType == "subscribers"
                                    ? " active show"
                                    : ""
                                }`}
                                id="subscribers"
                                role="tabpanel"
                              >
                                <div className="details-tab-box">
                                  <Subscribers
                                    {...props}
                                    plans={state.plans}
                                    user_id={state.member.user_id}
                                    members={state.member.subscribers.results}
                                    pagging={state.member.subscribers.pagging}
                                  />
                                </div>
                              </div>
                            ) : null}
                          </React.Fragment>
                        ) : null}
                        {state.videos ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "videos" ? " active show" : ""
                            }`}
                            id="videos"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Videos
                                {...props}
                                user_id={state.member.user_id}
                                videos={state.videos.results}
                                pagging={state.videos.pagging}
                              />
                            </div>
                          </div>
                        ) : null}

                        {state.followers ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "followers" ? " active show" : ""
                            }`}
                            id="followers"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Followers
                                {...props}
                                user_id={state.member.user_id}
                                items={state.followers.results}
                                type="followers"
                                pagging={state.followers.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.following ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "following" ? " active show" : ""
                            }`}
                            id="following"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Followers
                                {...props}
                                user_id={state.member.user_id}
                                items={state.following.results}
                                type="following"
                                pagging={state.following.pagging}
                              />
                            </div>
                          </div>
                        ) : null}

                        {state.liveVideos &&
                        state.liveVideos.results &&
                        state.liveVideos.results.length > 0 ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "live" ? " active show" : ""
                            }`}
                            id="live"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Videos
                                {...props}
                                liveVideos={true}
                                user_id={state.member.user_id}
                                videos={state.liveVideos.results}
                                pagging={state.liveVideos.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.reels ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "reels" ? " active show" : ""
                            }`}
                            id="reels"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Reels
                                {...props}
                                profileURL={props.router.asPath}
                                user_id={state.member.user_id}
                                username={state.member.username}
                                reels={state.reels.results}
                                pagging={state.reels.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.movies &&
                        state.movies.results &&
                        state.movies.results.length > 0 ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "movies" ? " active show" : ""
                            }`}
                            id="movies"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Movies
                                {...props}
                                no_user_area={true}
                                contentType="movies"
                                user_id={state.member.user_id}
                                movies={state.movies.results}
                                pagging={state.movies.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.series &&
                        state.series.results &&
                        state.series.results.length > 0 ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "series" ? " active show" : ""
                            }`}
                            id="series"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Movies
                                {...props}
                                typeData={"series"}
                                contentType="series"
                                no_user_area={true}
                                user_id={state.member.user_id}
                                movies={state.series.results}
                                pagging={state.series.pagging}
                              />
                            </div>
                          </div>
                        ) : null}

                        {state.paidVideos &&
                        state.paidVideos.results &&
                        state.paidVideos.results.length > 0 ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "paid" ? " active show" : ""
                            }`}
                            id="paid"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Videos
                                {...props}
                                paidVideos={true}
                                user_id={state.member.user_id}
                                videos={state.paidVideos.results}
                                pagging={state.paidVideos.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.channels ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "channels" ? " active show" : ""
                            }`}
                            id="channels"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Channel
                                {...props}
                                user_id={state.member.user_id}
                                channels={state.channels.results}
                                pagging={state.channels.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.blogs ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "blogs" ? " active show" : ""
                            }`}
                            id="blogs"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Blog
                                {...props}
                                user_id={state.member.user_id}
                                blogs={state.blogs.results}
                                pagging={state.blogs.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {state.playlists ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "playlists" ? " active show" : ""
                            }`}
                            id="playlists"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Playlists
                                {...props}
                                user_id={state.member.user_id}
                                playlists={state.playlists.results}
                                pagging={state.playlists.pagging}
                              />
                            </div>
                          </div>
                        ) : null}

                        {state.audios ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "audio" ? " active show" : ""
                            }`}
                            id="audios"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Audio
                                {...props}
                                search={true}
                                fromUserProfile={true}
                                userowner_id={state.member.user_id}
                                audios={state.audios.results}
                                pagging={state.audios.pagging}
                              />
                            </div>
                          </div>
                        ) : null}
                        {props.pageData.appSettings[`${"member_comment"}`] ==
                        1 ? (
                          <div
                            className={`tab-pane fade${
                              state.tabType == "comments" ? " active show" : ""
                            }`}
                            id="comments"
                            role="tabpanel"
                          >
                            <div className="details-tab-box">
                              <Comment
                                {...props}
                                owner_id={state.member.user_id}
                                hideTitle={true}
                                appSettings={props.pageData.appSettings}
                                commentType="member"
                                type="members"
                                comment_item_id={state.member.user_id}
                              />
                            </div>
                          </div>
                        ) : null}
                      </React.Fragment>
                    ) : null}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Index);
