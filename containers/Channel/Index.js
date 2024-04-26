import dynamic from "next/dynamic";
import Router, { withRouter } from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import ShortNumber from "short-number";
import swal from "sweetalert";
import axios from "../../axios-orders";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import Validator from "../../validators";
import CensorWord from "../CensoredWords/Index";
import Timeago from "../Common/Timeago";
import Cover from "../Cover/Index";
import Rating from "../Rating/Index";
import AddPost from "./AddPost";
import Videos from "./Videos";
const AddVideos = dynamic(() => import("../../containers/Video/Popup"), {
  ssr: false,
});
const Form = dynamic(() => import("../../components/DynamicForm/Index"), {
  ssr: false,
});
const Comment = dynamic(() => import("../Comments/Index"), {
  ssr: false,
});
const Playlists = dynamic(() => import("../Playlist/Playlists"), {
  ssr: false,
});
const Artists = dynamic(() => import("../Artist/Artists"), {
  ssr: false,
});
const Community = dynamic(() => import("./Communities"), {
  ssr: false,
});
const Members = dynamic(() => import("../User/Browse"), {
  ssr: false,
});
const CarouselChannels = dynamic(() => import("./CarouselChannel"), {
  ssr: false,
});

const Plans = dynamic(() => import("../User/Plans"), {
  ssr: false,
});

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      submitting: false,
      channel: props.pageData.channel,
      openPopup: false,
      openPlaylistPopup: false,
      relatedChannels: props.pageData.relatedChannels,
      password: props.pageData.password,
      adult: props.pageData.adultChannel,
      needSubscription: props.pageData.needSubscription,
      plans: props.pageData.plans,
      tabType: props.pageData.tabType ? props.pageData.tabType : "videos",
    }
  );
  const stateRef = useRef();
  stateRef.current = state.channel;
  useEffect(() => {
    if (props.pageData.channel != state.channel) {
      setState({
        channel: props.pageData.channel,
        relatedChannels: props.pageData.relatedChannels,
        password: props.pageData.password,
        adult: props.pageData.adultChannel,
        openPopup: false,
        openPlaylistPopup: false,
        needSubscription: props.pageData.needSubscription,
        plans: props.pageData.plans,
        tabType: props.pageData.tabType ? props.pageData.tabType : "videos",
      });
    }
  }, [props.pageData]);

  const checkPassword = (model) => {
    if (state.submitting) {
      return;
    }
    const formData = new FormData();
    for (var key in model) {
      formData.append(key, model[key]);
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/channels/password/" + props.pageData.id;

    setState({ submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({
            error: response.data.error,
            submitting: false,
          });
        } else {
          setState({ submitting: false, error: null });
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };
  const deleteChannel = (e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Once deleted, you will not be able to recover this channel!"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("id", state.channel.custom_url);
        const url = "/channels/delete";
        axios
          .post(url, formData)
          .then((response) => {
            if (response.data.error) {
              swal(
                "Error",
                Translate(
                  props,
                  "Something went wrong, please try again later"
                ),
                "error"
              );
            } else {
              props.openToast({
                message: Translate(props, response.data.message),
                type: "success",
              });
              Router.push(`/dashboard/channels`);
            }
          })
          .catch((err) => {
            swal(
              "Error",
              Translate(props, "Something went wrong, please try again later"),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };

  useEffect(() => {
    if ($(".nav-tabs > li > a.active").length == 0) {
      if (state.needSubscription) {
        pushTab("plans");
      } else {
        pushTab("videos");
      }
    }

    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      if (
        stateRef.current &&
        id == stateRef.current.channel_id &&
        type == "channels"
      ) {
        const data = { ...stateRef.current };
        data.rating = rating;
        setState({ channel: data });
      }
    });

    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.channel_id &&
        type == "channels"
      ) {
        const data = { ...stateRef.current };
        data.follow_count = data.follow_count - 1;
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          data.follower_id = null;
        }
        setState({ channel: data });
      }
    });

    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.channel_id &&
        type == "channels"
      ) {
        const data = { ...stateRef.current };
        data.follow_count = data.follow_count + 1;
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          data.follower_id = 1;
        }
        setState({ channel: data });
      }
    });

    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.channel_id &&
        type == "channels"
      ) {
        if (stateRef.current.channel_id == id) {
          const data = { ...stateRef.current };
          data.favourite_count = data.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            data.favourite_id = null;
          }
          setState({ channel: data });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        stateRef.current &&
        id == stateRef.current.channel_id &&
        type == "channels"
      ) {
        if (stateRef.current.channel_id == id) {
          const data = { ...stateRef.current };
          data.favourite_count = data.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            data.favourite_id = 1;
          }
          setState({ channel: data });
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
      if (
        stateRef.current &&
        itemType == "channels" &&
        stateRef.current.channel_id == itemId
      ) {
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
        setState({ channel: item });
      }
    });
    if (!state.needSubscription) {
      props.socket.on("videoAdded", (socketdata) => {
        if (
          stateRef.current &&
          socketdata.channel_id == stateRef.current.channel_id
        ) {
          props.openToast({
            message: Translate(props, socketdata.message),
            type: "success",
          });
          setTimeout(() => {
            Router.push(`/channel/${stateRef.current.custom_url}`);
          }, 1000);
        }
      });
      props.socket.on("playlistAdded", (socketdata) => {
        if (
          stateRef.current &&
          socketdata.channel_id == stateRef.current.channel_id
        ) {
          props.openToast({ message: socketdata.message, type: "success" });
          setTimeout(() => {
            Router.push(`/channel/${stateRef.current.custom_url}`);
          }, 1000);
        }
      });
    }
    props.socket.on("channelCoverReposition", (socketdata) => {
      let id = socketdata.channel_id;
      if (stateRef.current && id == stateRef.current.channel_id) {
        const item = { ...stateRef.current };
        item.cover_crop = socketdata.image;
        item.showCoverReposition = false;
        setState({ channel: item, loadingCover: false });
        props.openToast({
          message: Translate(props, socketdata.message),
          type: "success",
        });
      }
    });
    props.socket.on("channelMainPhotoUpdated", (socketdata) => {
      let id = socketdata.channel_id;
      if (stateRef.current && id == stateRef.current.channel_id) {
        const item = { ...stateRef.current };
        item.image = socketdata.image;
        item.showCoverReposition = false;
        setState({ channel: item });
        props.openToast({
          message: Translate(props, socketdata.message),
          type: "success",
        });
      }
    });
    props.socket.on("channelCoverUpdated", (socketdata) => {
      let id = socketdata.channel_id;
      if (stateRef.current && id == stateRef.current.channel_id) {
        const item = { ...stateRef.current };
        item.cover = socketdata.image;
        item.channelcover = true;
        item.cover_crop = socketdata.cover_crop;
        if (
          socketdata.image &&
          socketdata.image.indexOf(".gif") == -1 &&
          socketdata.image.indexOf(".GIF") == -1
        ) {
          item.showCoverReposition = true;
        }
        setState({ channel: item, loadingCover: false });
        props.openToast({
          message: Translate(props, socketdata.message),
          type: "success",
        });
      }
    });
  }, []);
  const openPopup = () => {
    setState({ openPopup: true });
  };
  const openImportPopup = () => {
    setState({ openImportPopup: true });
  };
  const closePopup = () => {
    setState({ openPopup: false });
  };
  const adPost = (e) => {
    e.preventDefault();
    setState({ addpost: true });
  };
  const closePOst = (postData) => {
    setState({ addpost: false });
  };
  const chooseVideos = (selectedVideos) => {
    if (selectedVideos) {
      setState({ openPopup: false });
      let formData = new FormData();
      formData.append("channel_id", state.channel.channel_id);
      formData.append("selectedVideos", selectedVideos);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      let url = "/channels/add-videos";
      axios
        .post(url, formData, config)
        .then((response) => {
          if (response.data.videos) {
            //Router.push()
          }
        })
        .catch((err) => {
          setState({ loading: false });
        });
    }
    setState({ openPopup: false });
  };

  const openPlaylistPopup = () => {
    setState({ openPlaylistPopup: true });
  };
  const closePlaylistPopup = () => {
    setState({ openPlaylistPopup: false });
  };
  const choosePlaylist = (selectedPlaylists) => {
    if (selectedPlaylists) {
      let formData = new FormData();
      setState({ openPlaylistPopup: false });
      formData.append("channel_id", state.channel.channel_id);
      formData.append("selectedPlaylists", selectedPlaylists);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      let url = "/channels/add-playlists";
      axios
        .post(url, formData, config)
        .then((response) => {})
        .catch((err) => {
          setState({ loading: false });
        });
    }
    setState({ openPopup: false });
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
        setState({ tabType: type });
      }
    }
  }, [props.router.query]);
  const pushTab = (type, e) => {
    if (e) e.preventDefault();
    if (state.tabType == type || !state.channel) {
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
  const formChannelSubmit = (e) => {
    e.preventDefault();
    if (state.channelFormSubmit || !state.channelID) {
      return;
    }
    setState({ channelFormSubmit: true });
    let formData = new FormData();
    formData.append("channel_id", state.channel.channel_id);
    formData.append("channel_import_id", state.channelID);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    let url = "/channels/import-yt-channel-videos";
    axios
      .post(url, formData, config)
      .then((response) => {
        if (!response.data.error) {
          props.openToast({
            message: Translate(props, response.data.message),
            type: "success",
          });
          setState({
            openImportPopup: false,
            channelFormSubmit: false,
            channelID: "",
          });
        } else {
          setState({
            channelFormSubmit: false,
            channelerror: response.data.error,
          });
        }
      })
      .catch((err) => {
        setState({ channelFormSubmit: false });
      });
  };
  let validatorUploadImport = [];
  let fieldUploadImport = [];
  validatorUploadImport.push({
    key: "password",
    validations: [
      {
        validator: Validator.required,
        message: "Password is required field",
      },
    ],
  });
  fieldUploadImport.push({
    key: "password",
    label: "",
    type: "password",
    isRequired: true,
  });

  // if(state.adult){
  //   return (
  //     <div>
  //       <div className="container">
  //         <div className="row">
  //           <div className="col-md-12">
  //               <div className="adult-wrapper">
  //                   {Translate(props,'This channel contains adult content.To view this channel, Turn on adult content setting from site footer.')}
  //               </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }
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
  return state.password ? (
    <Form
      {...props}
      className="form password-mandatory"
      generalError={state.error}
      title={"Enter Password"}
      validators={validatorUploadImport}
      model={fieldUploadImport}
      submitText={state.submitting ? "Submit..." : "Submit"}
      onSubmit={(model) => {
        checkPassword(model);
      }}
    />
  ) : (
    <React.Fragment>
      {state.channel && state.addpost ? (
        <AddPost
          {...props}
          closePOst={closePOst}
          channel_id={state.channel.channel_id}
        />
      ) : null}
      {state.channel && state.channel.approve != 1 ? (
        <div className="col-md-12  approval-pending">
          <div className="generalErrors">
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {Translate(
                props,
                "This channel still waiting for admin approval."
              )}
            </div>
          </div>
        </div>
      ) : null}
      {state.openPopup ? (
        <AddVideos
          {...props}
          channel_id={state.channel.channel_id}
          chooseVideos={chooseVideos}
          closePopup={closePopup}
          title={Translate(props, "Add videos to channel")}
        />
      ) : null}
      {state.openImportPopup ? (
        <div className="popup_wrapper_cnt">
          <div className="popup_cnt">
            <div className="comments">
              <div className="VideoDetails-commentWrap">
                <div className="popup_wrapper_cnt_header">
                  <h2>{props.t("Enter YouTube Channel ID")}</h2>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setState({
                        openImportPopup: false,
                        channelerror: null,
                        channelFormSubmit: false,
                      });
                    }}
                    className="_close"
                  >
                    <i></i>
                  </a>
                </div>
                <div className="user_wallet row">
                  <form onSubmit={formChannelSubmit}>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        value={state.channelID ? state.channelID : ""}
                        onChange={(e) => {
                          setState({
                            channelID: e.target.value,
                          });
                        }}
                      />
                      {state.channelerror ? (
                        <p className="error">{state.channelerror}</p>
                      ) : null}
                    </div>
                    <div className="form-group">
                      <label htmlFor="name" className="control-label"></label>
                      <button type="submit">
                        {state.channelFormSubmit
                          ? props.t("Submit...")
                          : props.t("Submit")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {state.openPlaylistPopup ? (
        <AddVideos
          {...props}
          playlist={true}
          channel_id={state.channel.channel_id}
          chooseVideos={choosePlaylist}
          closePopup={closePlaylistPopup}
          title={Translate(props, "Add playlists to channel")}
        />
      ) : null}
      {!state.adult ? (
        <Cover
          {...props}
          {...state.channel}
          item={state.channel}
          type="channel"
          id={state.channel.channel_id}
          deleteChannel={deleteChannel}
          url={`/channel/${state.channel.custom_url}`}
        />
      ) : null}
      <div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              {state.adult ? (
                <div className="adult-wrapper">
                  {Translate(
                    props,
                    "This channel contains adult content.To view this channel, Turn on adult content setting from site footer."
                  )}
                </div>
              ) : (
                <React.Fragment>
                  <div className="details-tab">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                      {state.needSubscription ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "plans" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("plans");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=plans`}
                            role="tab"
                            aria-controls="plans"
                            aria-selected="false"
                          >
                            {Translate(props, "Choose Plan")}
                          </a>
                        </li>
                      ) : null}
                      {!state.needSubscription ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "videos" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("videos");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=videos`}
                            role="tab"
                            aria-controls="videos"
                            aria-selected="false"
                          >
                            {Translate(props, "Videos")}
                          </a>
                        </li>
                      ) : null}
                      {state.channel && state.channel.playlists ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "playlists" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("playlists");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=playlists`}
                            role="tab"
                            aria-controls="playlists"
                            aria-selected="true"
                          >
                            {Translate(props, "Playlists")}
                          </a>
                        </li>
                      ) : null}
                      {state.channel && state.channel.supporters ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "supporters" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("supporters");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=supporters`}
                            role="tab"
                            aria-controls="supporters"
                            aria-selected="true"
                          >
                            {Translate(props, "Supporters")}
                          </a>
                        </li>
                      ) : null}
                      {!state.needSubscription ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "community" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("community");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=community`}
                            role="tab"
                            aria-controls="community"
                            aria-selected="true"
                          >
                            {Translate(props, "Community")}
                          </a>
                        </li>
                      ) : null}
                      {state.channel &&
                      state.channel.artists &&
                      state.channel.artists.results &&
                      state.channel.artists.results.length ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "artists" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("artists");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=artists`}
                            role="tab"
                            aria-controls="artists"
                            aria-selected="true"
                          >
                            {Translate(props, "Artists")}
                          </a>
                        </li>
                      ) : null}
                      {state.channel &&
                      props.pageData.appSettings[`${"channel_comment"}`] == 1 &&
                      state.channel.approve == 1 ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "comments" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("comments");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=comments`}
                            role="tab"
                            aria-controls="comments"
                            aria-selected="true"
                          >{`${Translate(props, "Comments")}`}</a>
                        </li>
                      ) : null}
                      {state.channel ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "about" ? " active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              pushTab("about");
                            }}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=about`}
                            role="tab"
                            aria-controls="about"
                            aria-selected="true"
                          >
                            {Translate(props, "About")}
                          </a>
                        </li>
                      ) : null}
                    </ul>
                    <div className="tab-content" id="myTabContent">
                      {state.needSubscription ? (
                        <div
                          className={`tab-pane fade${
                            state.tabType == "plans" ? " active show" : ""
                          }`}
                          id="plans"
                          role="tabpanel"
                        >
                          <div className="details-tab-box">
                            <p className="plan-upgrade-subscribe">
                              {state.needSubscription.type == "upgrade"
                                ? props.t(
                                    "To watch more content, kindly upgrade your Subcription Plan."
                                  )
                                : props.t(
                                    "To watch more content, kindly Subscribe."
                                  )}
                            </p>
                            <Plans
                              {...props}
                              userSubscription={
                                state.needSubscription.loggedin_package_id
                                  ? true
                                  : false
                              }
                              userSubscriptionID={
                                state.needSubscription.loggedin_package_id
                              }
                              itemObj={state.channel}
                              member={state.channel.owner}
                              user_id={state.channel.owner_id}
                              plans={state.plans}
                            />
                          </div>
                        </div>
                      ) : null}
                      {!state.needSubscription ? (
                        <div
                          className={`tab-pane fade${
                            state.tabType == "videos" ? " active show" : ""
                          }`}
                          id="videos"
                          role="tabpanel"
                        >
                          <div className="details-tab-box">
                            {state.channel.canEdit ? (
                              <React.Fragment>
                                <button onClick={openPopup}>
                                  {Translate(props, "Add Videos")}
                                </button>
                                <button onClick={openImportPopup}>
                                  {Translate(props, "Import Videos")}
                                </button>
                              </React.Fragment>
                            ) : null}
                            <Videos
                              canDelete={state.channel.canDelete}
                              {...props}
                              videos={state.channel.videos.results}
                              pagging={state.channel.videos.pagging}
                              channel_id={state.channel.channel_id}
                            />
                          </div>
                        </div>
                      ) : null}
                      {!state.needSubscription ? (
                        <div
                          className={`tab-pane fade${
                            state.tabType == "community" ? " active show" : ""
                          }`}
                          id="community"
                          role="tabpanel"
                        >
                          <div className="details-tab-box">
                            {state.channel.canEdit ? (
                              <button onClick={adPost}>
                                {Translate(props, "Add Post")}
                              </button>
                            ) : null}
                            <Community
                              canDelete={state.channel.canDelete}
                              canEdit={state.channel.canEdit}
                              channel={state.channel}
                              {...props}
                              posts={state.channel.posts.results}
                              pagging={state.channel.posts.pagging}
                              channel_id={state.channel.channel_id}
                            />
                          </div>
                        </div>
                      ) : null}

                      {state.channel.playlists ? (
                        <div
                          className={`tab-pane fade${
                            state.tabType == "playlists" ? " active show" : ""
                          }`}
                          id="playlists"
                          role="tabpanel"
                        >
                          <div className="details-tab-box">
                            {state.channel.canEdit ? (
                              <button onClick={openPlaylistPopup}>
                                {Translate(props, "Add Playlists")}
                              </button>
                            ) : null}
                            <Playlists
                              canDelete={state.channel.canDelete}
                              {...props}
                              playlists={state.channel.playlists.results}
                              pagging={state.channel.playlists.pagging}
                              channel_id={state.channel.channel_id}
                            />
                          </div>
                        </div>
                      ) : null}
                      {state.channel.supporters ? (
                        <div
                          className={`tab-pane fade${
                            state.tabType == "supporters" ? " active show" : ""
                          }`}
                          id="supporters"
                          role="tabpanel"
                        >
                          <div className="details-tab-box">
                            <Members
                              {...props}
                              globalSearch={true}
                              channel_members={state.channel.supporters.results}
                              channel_pagging={state.channel.supporters.pagging}
                              channel_id={state.channel.channel_id}
                            />
                          </div>
                        </div>
                      ) : null}
                      {state.channel.artists &&
                      state.channel.artists.results &&
                      state.channel.artists.results.length ? (
                        <div
                          className={`tab-pane fade${
                            state.tabType == "artists" ? " active show" : ""
                          }`}
                          id="artists"
                          role="tabpanel"
                        >
                          <div className="details-tab-box">
                            <Artists
                              canDelete={state.channel.canDelete}
                              {...props}
                              artists={state.channel.artists.results}
                              pagging={state.channel.artists.pagging}
                              channel_id={state.channel.channel_id}
                            />
                          </div>
                        </div>
                      ) : null}

                      {props.pageData.appSettings[`${"channel_comment"}`] ==
                        1 && state.channel.approve == 1 ? (
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
                              owner_id={state.channel.owner_id}
                              hideTitle={true}
                              appSettings={props.pageData.appSettings}
                              commentType="channel"
                              type="channels"
                              comment_item_id={state.channel.channel_id}
                            />
                          </div>
                        </div>
                      ) : null}
                      <div
                        className={`tab-pane fade${
                          state.tabType == "about" ? " active show" : ""
                        }`}
                        id="about"
                        role="tabpanel"
                      >
                        <div className="details-tab-box">
                          {props.pageData.appSettings[`${"channel_rating"}`] ==
                            1 && state.channel.approve == 1 ? (
                            <div className="tabInTitle">
                              <h6>{Translate(props, "Rating")}</h6>
                              <div className="rating">
                                <React.Fragment>
                                  <div className="animated-rater">
                                    <Rating
                                      {...props}
                                      rating={state.channel.rating}
                                      type="channel"
                                      id={state.channel.channel_id}
                                    />
                                  </div>
                                </React.Fragment>
                              </div>
                            </div>
                          ) : null}
                          <div className="tabInTitle">
                            <h6>
                              {props.t("view_count", {
                                count: state.channel.view_count
                                  ? state.channel.view_count
                                  : 0,
                              })}
                            </h6>
                            <div className="owner_name">
                              <React.Fragment>
                                {`${ShortNumber(
                                  state.channel.view_count
                                    ? state.channel.view_count
                                    : 0
                                )}`}{" "}
                                {props.t("view_count", {
                                  count: state.channel.view_count
                                    ? state.channel.view_count
                                    : 0,
                                })}
                              </React.Fragment>
                            </div>
                          </div>
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Created")}</h6>
                            <div className="owner_name">
                              <Timeago {...props}>
                                {state.channel.creation_date}
                              </Timeago>
                            </div>
                          </div>
                          {state.channel.category ? (
                            <React.Fragment>
                              <div className="tabInTitle categories_cnt">
                                <h6>{Translate(props, "Category")}</h6>
                                <div className="boxInLink">
                                  {
                                    <Link
                                      href={`/category`}
                                      customParam={
                                        `type=channel&id=` +
                                        state.channel.category.slug
                                      }
                                      as={
                                        `/channel/category/` +
                                        state.channel.category.slug
                                      }
                                    >
                                      <a>
                                        {
                                          <CensorWord
                                            {...props}
                                            text={state.channel.category.title}
                                          />
                                        }
                                      </a>
                                    </Link>
                                  }
                                </div>
                                {state.channel.subcategory ? (
                                  <React.Fragment>
                                    {/* <span> >> </span> */}
                                    <div className="boxInLink">
                                      <Link
                                        href={`/category`}
                                        customParam={
                                          `type=channel&id=` +
                                          state.channel.subcategory.slug
                                        }
                                        as={
                                          `/channel/category/` +
                                          state.channel.subcategory.slug
                                        }
                                      >
                                        <a>
                                          {
                                            <CensorWord
                                              {...props}
                                              text={
                                                state.channel.subcategory.title
                                              }
                                            />
                                          }
                                        </a>
                                      </Link>
                                    </div>
                                    {state.channel.subsubcategory ? (
                                      <React.Fragment>
                                        {/* <span> >> </span> */}
                                        <div className="boxInLink">
                                          <Link
                                            href={`/category`}
                                            customParam={
                                              `type=channel&id=` +
                                              state.channel.subsubcategory.slug
                                            }
                                            as={
                                              `/channel/category/` +
                                              state.channel.subsubcategory.slug
                                            }
                                          >
                                            <a>
                                              {
                                                <CensorWord
                                                  {...props}
                                                  text={
                                                    state.channel.subsubcategory
                                                      .title
                                                  }
                                                />
                                              }
                                            </a>
                                          </Link>
                                        </div>
                                      </React.Fragment>
                                    ) : null}
                                  </React.Fragment>
                                ) : null}
                              </div>
                            </React.Fragment>
                          ) : null}

                          {state.channel.tags && state.channel.tags != "" ? (
                            <div className="blogtagListWrap">
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Tags")}</h6>
                                <ul className="TabTagList clearfix">
                                  {state.channel.tags.split(",").map((tag) => {
                                    return (
                                      <li key={tag}>
                                        <Link
                                          href="/channels"
                                          customParam={`tag=${tag}`}
                                          as={`/channels?tag=${tag}`}
                                        >
                                          <a>
                                            {
                                              <CensorWord
                                                {...props}
                                                text={tag}
                                              />
                                            }
                                          </a>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          ) : null}
                          {state.channel.description ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Description")}</h6>
                                <div className="channel_description">
                                  <CensorWord
                                    {...props}
                                    text={state.channel.description}
                                  />
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
        {state.relatedChannels && state.relatedChannels.length ? (
          <React.Fragment>
            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                  <hr className="horline" />
                </div>
              </div>
            </div>
            <CarouselChannels
              {...props}
              {...props}
              type="blog"
              carouselType="channel"
              channels={state.relatedChannels}
            />
          </React.Fragment>
        ) : null}
      </div>
    </React.Fragment>
  );
};

export default withRouter(Index);
