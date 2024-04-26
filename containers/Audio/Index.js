import Router, { withRouter } from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openToast } from "../../store/reducers/toast";

import swal from "sweetalert";
import axios from "../../axios-orders";
import Form from "../../components/DynamicForm/Index";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import Validator from "../../validators";
import CensorWord from "../CensoredWords/Index";
import Comment from "../Comments/Index";
import Timeago from "../Common/Timeago";
import Dislike from "../Dislike/Index";
import Favourite from "../Favourite/Index";
import Gateways from "../Gateways/Index";
import Image from "../Image/Index";
import Like from "../Like/Index";
import SocialShare from "../SocialShare/Index";
import Currency from "../Upgrade/Currency";
import MemberFollow from "../User/Follow";
import Plans from "../User/Plans";
import Canvas from "./Canvas";

const Index = (props) => {
  const dispatch = useDispatch();
  const plansSubscription = useRef(null);
  let reduxStateAudio = useSelector((state) => {
    return state.audio.audios;
  });
  let reduxStateSongId = useSelector((state) => {
    return state.audio.song_id;
  });
  let reduxStatePauseSongId = useSelector((state) => {
    return state.audio.pausesong_id;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: 2,
      audio: props.pageData.audio,
      pagging: props.pageData.pagging ? props.pageData.pagging : null,
      relatedAudios: props.pageData.relatedAudios
        ? props.pageData.relatedAudios
        : [],
      password: props.pageData.password,
      styles: {
        visibility: "hidden",
        overflow: "hidden",
      },
      fullWidth: false,
      height: "-550px",
      width: props.isMobile ? props.isMobile : 993,
      needSubscription: props.pageData.needSubscription,
      plans: props.pageData.plans,
      tabType: props.pageData.tabType ? props.pageData.tabType : "about",
    }
  );

  useEffect(() => {
    if (
      props.pageData.audio != state.audio ||
      props.pageData.password != state.password
    ) {
      setState({
        page: 2,
        audio: props.pageData.audio,
        pagging: props.pageData.pagging ? props.pageData.pagging : null,
        relatedAudios: props.pageData.relatedAudios
          ? props.pageData.relatedAudios
          : [],
        password: props.pageData.password,
        needSubscription: props.pageData.needSubscription,
        plans: props.pageData.plans,
        tabType: props.pageData.tabType ? props.pageData.tabType : "about",
      });
    }
  }, [props.pageData]);

  useEffect(() => {
    const deleteFn = (data) => {
      let id = data.audio_id;
      const itemIndex = getItemIndex(id);
      if (state.relatedAudios && itemIndex > -1) {
        const items = [...state.relatedAudios];
        items.splice(itemIndex, 1);
        setState({ relatedAudios: items });
      }
    };
    props.socket.on("audioDeleted", deleteFn);

    const unfavFn = (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (state.audio && id == state.audio.audio_id && type == "audio") {
        if (state.audio.audio_id == id) {
          const dataObj = { ...state.audio };
          dataObj.favourite_count = parseInt(dataObj.favourite_count) - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            dataObj.favourite_id = null;
          }
          setState({ audio: dataObj });
        }
      }
    };
    props.socket.on("unfavouriteItem", unfavFn);
    const favFn = (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (state.audio && id == state.audio.audio_id && type == "audio") {
        if (state.audio.audio_id == id) {
          const dataObj = { ...state.audio };
          console.log(state.audio);
          dataObj.favourite_count = parseInt(dataObj.favourite_count) + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            dataObj.favourite_id = 1;
          }
          console.log(dataObj);
          setState({ audio: dataObj });
        }
      }
    };
    props.socket.on("favouriteItem", favFn);
    const likedislike = (data) => {
      let itemId = data.itemId;
      let itemType = data.itemType;
      let ownerId = data.ownerId;
      let removeLike = data.removeLike;
      let removeDislike = data.removeDislike;
      let insertLike = data.insertLike;
      let insertDislike = data.insertDislike;
      if (
        state.audio &&
        itemType == "audio" &&
        state.audio.audio_id == itemId
      ) {
        const item = { ...state.audio };
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
        setState({ audio: item });
      }
    };
    props.socket.on("likeDislike", likedislike);
    const unfollowFn = (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (state.audio && id == state.audio.owner.user_id && type == "members") {
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          const dataObj = { ...state.audio };
          const owner = dataObj.owner;
          owner.follower_id = null;
          setState({ audio: dataObj });
        }
      }
    };
    props.socket.on("unfollowUser", unfollowFn);
    const followFn = (data) => {
      let id = data.itemId;
      let type = data.itemType;
      let ownerId = data.ownerId;
      if (state.audio && id == state.audio.owner.user_id && type == "members") {
        if (
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          const dataObj = { ...state.audio };
          const owner = dataObj.owner;
          owner.follower_id = 1;
          setState({ audio: dataObj });
        }
      }
    };
    props.socket.on("followUser", followFn);

    return () => {
      props.socket.off("followUser", followFn);
      props.socket.off("audioDeleted", deleteFn);
      props.socket.off("unfavouriteItem", unfavFn);
      props.socket.off("favouriteItem", favFn);
      props.socket.off("likeDislike", likedislike);
      props.socket.off("unfollowUser", unfollowFn);
    };
  }, [state.audio]);

  useEffect(() => {
    // $(document).ready(function () {
    if (state.audio) {
      if ($("#VideoDetailsDescp").height() > 110) {
        setState({
          showMore: true,
          styles: {
            visibility: "visible",
            overflow: "hidden",
            height: "100px",
          },
          collapse: true,
        });
      } else {
        setState({
          showMore: false,
          styles: { visibility: "visible", height: "auto" },
        });
      }
    }

    if (state.audio && state.audio.audioPaymentStatus) {
      if (state.audio.audioPaymentStatus == "success") {
        swal(
          "Success",
          Translate(props, "Audio purchased successfully.", "success")
        );
      } else if (state.audio.audioPaymentStatus == "fail") {
        swal(
          "Error",
          Translate(
            props,
            "Something went wrong, please try again later",
            "error"
          )
        );
      } else if (state.audio.audioPaymentStatus == "cancel") {
        swal(
          "Error",
          Translate(props, "You have cancelled the payment.", "error")
        );
      }
    }
  }, []);

  const getItemIndex = (item_id) => {
    if (!state.items) {
      return -1;
    }
    const items = [...state.relatedAudios];
    const itemIndex = items.findIndex((p) => p["audio_id"] == item_id);
    return itemIndex;
  };

  const showMore = (e) => {
    e.preventDefault();
    let showMoreText = "";
    let styles = {};
    if (state.collapse) {
      showMoreText = Translate(props, "Show less");
      styles = { visibility: "visible", overflow: "visible" };
    } else {
      showMoreText = Translate(props, "Show more");
      styles = { visibility: "visible", overflow: "hidden", height: "100px" };
    }
    setState({
      styles: styles,
      showMoreText: showMoreText,
      collapse: !state.collapse,
    });
  };
  const deleteAudio = (e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Once deleted, you will not be able to recover this audio!"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("id", state.audio.custom_url);
        const url = "/audio/delete";
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
              Router.push(`/dashboard/audio`);
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
  const linkify = (inputText) => {
    inputText = inputText.replace(/&lt;br\/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br \/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br&gt;/g, " <br/>");
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(
      replacePattern1,
      '<a href="$1" target="_blank" rel="nofollow">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 =
      /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1" rel="nofollow">$1</a>'
    );

    return replacedText;
  };
  const playSong = (song_id, audio, e) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = reduxStateAudio;
    let relatedAudios = state.relatedAudios;
    if (relatedAudios && relatedAudios.length) {
      let audio = state.relatedAudios;
      audios = [...audios, ...audio];
    }
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    if (audios && audios.length) {
      let audio = { ...state.audio };
      audio.passwords = 1;
      audios.push(audio);
    } else {
      let audio = { ...state.audio };
      audio.passwords = 1;
      audios = [audio];
    }
    //add related videos

    setState({
      song_id: song_id,
      playsong_id: 0,
    });
    props.updateAudioData({
      audios: audios,
      song_id: song_id,
      pausesong_id: 0,
    });
  };
  const pauseSong = (song_id, audio, e) => {
    if (!audio.audio_file) {
      Router.push(`/audio/${audio.custom_url}`);
      return;
    }
    let audios = reduxStateAudio;
    //add related videos
    let relatedAudios = state.relatedAudios;
    if (relatedAudios && relatedAudios.length) {
      let audio = state.relatedAudios;
      audios = [...audios, ...audio];
    }
    if (audios && audios.length) {
      let audio = { ...state.audio };
      audio.passwords = 1;
      audios.push(audio);
    } else {
      let audio = { ...state.audio };
      audio.passwords = 1;
      audios.push(audio);
    }
    audios.forEach((audio, itemIndex) => {
      if (!audio.audio_file) {
        audios.splice(itemIndex, 1);
      }
    });
    setState({
      song_id: song_id,
      playsong_id: song_id,
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
    let audios = reduxStateAudio;
    //add related videos
    let relatedAudios = state.relatedAudios;
    if (relatedAudios && relatedAudios.length) {
      let audio = state.relatedAudios;
      audios = [...audios, ...audio];
    }
    if (audios && audios.length) {
      let audio = { ...state.audio };
      audio.passwords = 1;
      audios.push(audio);
    } else {
      let audio = { ...state.audio };
      audio.passwords = 1;
      audios.push(audio);
    }
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
  const openReport = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      props.openReport({
        status: true,
        id: state.audio.custom_url,
        type: "audio",
      });
    }
  };
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
    let url = "/audio/password/" + props.pageData.id;
    setState({ submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({ error: response.data.error, submitting: false });
        } else {
          setState({ submitting: false, error: null });
          Router.push(`/audio/${props.pageData.id}`);
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };
  const formatDuration = (duration) => {
    if (isNaN(duration)) {
      return "00:00";
    }
    duration = Math.floor(duration);
    let d = Number(duration);
    var h = Math.floor(d / 3600).toString();
    var m = Math.floor((d % 3600) / 60).toString();
    var s = Math.floor((d % 3600) % 60).toString();

    var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00";
    var mDisplay = m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00";
    var sDisplay = s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00";
    return (
      (hDisplay != "00" ? hDisplay + mDisplay : mDisplay.replace(":", "")) +
      sDisplay
    );
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
    if (state.tabType == type || !state.audio) {
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
  const scrollToSubscriptionPlans = () => {
    if (state.tabType != "plans") {
      setState({ tabType: "plans" });
      setTimeout(() => {
        plansSubscription.current.scrollIntoView();
      }, 200);
      return;
    }
    plansSubscription.current.scrollIntoView();
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
  fieldUploadImport.push({ key: "password", label: "", type: "password" });

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

  let userBalance = {};
  userBalance["package"] = {
    price: parseFloat(state.audio ? state.audio.price : 0),
  };

  const purchaseClicked = () => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      setState({
        gateways: true,
        gatewaysURL: `/audio/purchase/${state.audio.audio_id}`,
      });
    }
  };

  let gatewaysHTML = "";

  if (state.gateways) {
    gatewaysHTML = (
      <Gateways
        {...props}
        success={() => {
          dispatch(
            openToast({
              message: Translate(props, "Payment done successfully."),
              type: "success",
            })
          );
          setTimeout(() => {
            let id = state.audio.custom_url;
            Router.push(`/audio/${id}`);
          }, 1000);
        }}
        successBank={() => {
          dispatch(
            openToast({
              message: Translate(
                props,
                "Your bank request has been successfully sent, you will get notified once it's approved"
              ),
              type: "success",
            })
          );
          setState({ gateways: null });
        }}
        bank_price={state.audio.price}
        bank_type="audio_purchase"
        bank_resource_type="audio"
        bank_resource_id={state.audio.custom_url}
        tokenURL={`audio/successulPayment/${state.audio.audio_id}`}
        closePopup={() => setState({ gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  return state.password ? (
    <Form
      className="form password-mandatory"
      generalError={state.error}
      title={"Enter Password"}
      validators={validatorUploadImport}
      model={fieldUploadImport}
      {...props}
      submitText={state.submitting ? "Submit..." : "Submit"}
      onSubmit={(model) => {
        checkPassword(model);
      }}
    />
  ) : (
    <React.Fragment>
      {state.audio && state.audio.approve != 1 ? (
        <div className="col-md-12 approval-pending">
          <div className="generalErrors">
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {Translate(props, "This audio still waiting for admin approval.")}
            </div>
          </div>
        </div>
      ) : null}
      {state.audio.approve == 1 ? (
        <div className="details-video-wrap audioDetails-wrap">
          {gatewaysHTML}
          <div className="container">
            <div className="row">
              <div className="col-xl-9 col-lg-8">
                <div className="audioBnr">
                  <div className="infoPlay">
                    <div className="infoPlay-innr">
                      <div className="miniplay">
                        {state.audio &&
                          (parseFloat(state.audio.price) == 0 ||
                            state.audio.audioPurchased) && (
                            <div className="imgAudio">
                              <Image
                                image={state.audio.image}
                                title={state.audio.title}
                                imageSuffix={props.pageData.imageSuffix}
                                siteURL={props.pageData.siteURL}
                              />
                            </div>
                          )}
                        {!state.needSubscription ? (
                          <React.Fragment>
                            {state.audio &&
                            parseFloat(state.audio.price) > 0 &&
                            !state.audio.audioPurchased ? (
                              <div className="imgAudio">
                                <div
                                  className="video_player_cnt player-wrapper"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    position: "relative",
                                  }}
                                >
                                  <div
                                    className="purchase_video_content video_purchase"
                                    style={{ width: "100%", height: "100%" }}
                                  >
                                    <div className="purchase_video_content_background"></div>
                                    <h5>
                                      {Translate(
                                        props,
                                        "This audio is paid, you have to purchase the audio to listen it."
                                      )}
                                      <br />
                                      <br />
                                      <button
                                        className="btn btn-main"
                                        onClick={purchaseClicked}
                                      >
                                        {Translate(props, "Purchase ") +
                                          " " +
                                          Currency({
                                            ...props,
                                            ...userBalance,
                                          })}{" "}
                                      </button>
                                    </h5>
                                  </div>
                                </div>
                              </div>
                            ) : reduxStateSongId != state.audio.audio_id ||
                              reduxStatePauseSongId == state.audio.audio_id ? (
                              <div
                                className="playbtn"
                                onClick={(e) =>
                                  playSong(state.audio.audio_id, state.audio, e)
                                }
                              >
                                <i className="fas fa-play"></i>
                              </div>
                            ) : (
                              <div
                                className="playbtn"
                                onClick={pauseSong.bind(
                                  this,
                                  state.audio.audio_id,
                                  state.audio
                                )}
                              >
                                <i className="fas fa-pause"></i>
                              </div>
                            )}
                          </React.Fragment>
                        ) : (
                          <div className="subscription-update-plan-cnt">
                            <div className="subscription-update-plan-title">
                              {state.needSubscription.type == "upgrade"
                                ? props.t(
                                    "To watch more content, kindly upgrade your Subcription Plan."
                                  )
                                : props.t(
                                    "To watch more content, kindly Subscribe."
                                  )}
                              {
                                <button onClick={scrollToSubscriptionPlans}>
                                  {props.t("Subscription Plans")}
                                </button>
                              }
                              {userBalance.package.price > 0 ? (
                                <React.Fragment>
                                  {props.t("or")}
                                  {
                                    <button onClick={purchaseClicked}>
                                      {props
                                        .t(
                                          "Pay {{price}} to listen this audio.",
                                          {
                                            price: Currency({
                                              ...props,
                                              ...userBalance,
                                            }),
                                          }
                                        )
                                        .replace("<!-- -->", "")}
                                    </button>
                                  }
                                </React.Fragment>
                              ) : null}
                            </div>
                          </div>
                        )}
                        {state.audio.peaks ? (
                          <div
                            className="trackCanvas"
                            onClick={playPauseSong.bind(
                              this,
                              state.audio.audio_id,
                              state.audio
                            )}
                          >
                            <Canvas
                              {...props}
                              classV={"details"}
                              peaks={state.audio.peaks}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-9 col-lg-8">
                <div className="videoDetailsWrap-content">
                  <a
                    className="videoName"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    {<CensorWord {...props} text={state.audio.title} />}
                  </a>

                  <div className="videoDetailsLikeWatch">
                    <div className="watchBox">
                      <span title={Translate(props, "Play Count")}>
                        {state.audio.play_count + " "}{" "}
                        {props.t("play_count", {
                          count: state.audio.play_count
                            ? state.audio.play_count
                            : 0,
                        })}{" "}
                      </span>
                    </div>

                    <div className="vLDetailLikeShare">
                      <div className="LikeDislikeWrap">
                        <ul className="LikeDislikeList">
                          {state.audio.approve == 1 ? (
                            <React.Fragment>
                              <li>
                                <Like
                                  icon={true}
                                  {...props}
                                  like_count={state.audio.like_count}
                                  item={state.audio}
                                  type="audio"
                                  id={state.audio.audio_id}
                                />
                                {"  "}
                              </li>
                              <li>
                                <Dislike
                                  icon={true}
                                  {...props}
                                  dislike_count={state.audio.dislike_count}
                                  item={state.audio}
                                  type="audio"
                                  id={state.audio.audio_id}
                                />
                                {"  "}
                              </li>
                              <li>
                                <Favourite
                                  icon={true}
                                  {...props}
                                  favourite_count={state.audio.favourite_count}
                                  item={state.audio}
                                  type="audio"
                                  id={state.audio.audio_id}
                                />
                                {"  "}
                              </li>

                              <SocialShare
                                {...props}
                                hideTitle={true}
                                buttonHeightWidth="30"
                                url={`/audio/${state.audio.custom_url}`}
                                title={state.audio.title}
                                imageSuffix={props.pageData.imageSuffix}
                                media={state.audio.image}
                              />
                            </React.Fragment>
                          ) : null}
                          <li>
                            <div className="dropdown TitleRightDropdown">
                              <a href="#" data-bs-toggle="dropdown">
                                <span
                                  className="material-icons"
                                  data-icon="more_vert"
                                ></span>
                              </a>
                              <ul className="dropdown-menu dropdown-menu-right edit-options">
                                {state.audio.canEdit ? (
                                  <li>
                                    <Link
                                      href="/create-audio"
                                      customParam={`id=${state.audio.custom_url}`}
                                      as={`/create-audio/${state.audio.custom_url}`}
                                    >
                                      <a
                                        href={`/create-audio/${state.audio.custom_url}`}
                                      >
                                        <span
                                          className="material-icons"
                                          data-icon="edit"
                                        ></span>
                                        {Translate(props, "Edit")}
                                      </a>
                                    </Link>
                                  </li>
                                ) : null}
                                {state.audio.canDelete ? (
                                  <li>
                                    <a onClick={deleteAudio} href="#">
                                      <span
                                        className="material-icons"
                                        data-icon="delete"
                                      ></span>
                                      {Translate(props, "Delete")}
                                    </a>
                                  </li>
                                ) : null}
                                {state.audio.approve == 1 &&
                                !state.audio.canEdit ? (
                                  <li>
                                    <a href="#" onClick={openReport}>
                                      <span
                                        className="material-icons"
                                        data-icon="flag"
                                      ></span>
                                      {Translate(props, "Report")}
                                    </a>
                                  </li>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="videoDetailsUserInfo">
                    <div className="userInfoSubs">
                      <div className="UserInfo">
                        <div className="img">
                          <Link
                            href="/member"
                            customParam={`id=${state.audio.owner.username}`}
                            as={`/${state.audio.owner.username}`}
                          >
                            <a href={`/${state.audio.owner.username}`}>
                              <Image
                                height="50"
                                width="50"
                                title={state.audio.owner.displayname}
                                image={state.audio.owner.avtar}
                                imageSuffix={props.pageData.imageSuffix}
                                siteURL={props.pageData.siteURL}
                              />
                            </a>
                          </Link>
                        </div>
                        <div className="content">
                          <Link
                            href="/member"
                            customParam={`id=${state.audio.owner.username}`}
                            as={`/${state.audio.owner.username}`}
                          >
                            <a
                              className="UserName"
                              href={`/${state.audio.owner.username}`}
                            >
                              <React.Fragment>
                                {state.audio.owner.displayname}
                                {props.pageData.appSettings[
                                  "member_verification"
                                ] == 1 && state.audio.owner.verified ? (
                                  <span
                                    className="verifiedUser"
                                    title="verified"
                                  >
                                    <span
                                      className="material-icons"
                                      data-icon="check"
                                    ></span>
                                  </span>
                                ) : null}
                              </React.Fragment>
                            </a>
                          </Link>
                          <span>
                            <Timeago {...props}>
                              {state.audio.creation_date}
                            </Timeago>
                          </span>
                        </div>
                      </div>
                      <div className="userSubs">
                        <MemberFollow
                          {...props}
                          type="members"
                          user={state.audio.owner}
                          user_id={state.audio.owner.follower_id}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="details-tab">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                      {state.needSubscription ? (
                        <li className="nav-item" ref={plansSubscription}>
                          <a
                            className={`nav-link${
                              state.tabType == "plans" ? " active" : ""
                            }`}
                            onClick={() => pushTab("plans")}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=plans`}
                            role="tab"
                            aria-controls="discription"
                            aria-selected="false"
                          >
                            {Translate(props, "Choose Plan")}
                          </a>
                        </li>
                      ) : null}

                      <li className="nav-item">
                        <a
                          className={`nav-link${
                            state.tabType == "about" ? " active" : ""
                          }`}
                          onClick={() => pushTab("about")}
                          data-bs-toggle="tab"
                          href={`${fURL}?tab=about`}
                          role="tab"
                          aria-controls="about"
                          aria-selected="true"
                        >
                          {Translate(props, "About")}
                        </a>
                      </li>

                      {props.pageData.appSettings[`${"audio_comment"}`] == 1 &&
                      state.audio.approve == 1 ? (
                        <li className="nav-item">
                          <a
                            className={`nav-link${
                              state.tabType == "comments" ? " active" : ""
                            }`}
                            onClick={() => pushTab("comments")}
                            data-bs-toggle="tab"
                            href={`${fURL}?tab=comments`}
                            role="tab"
                            aria-controls="comments"
                            aria-selected="true"
                          >{`${Translate(props, "Comments")}`}</a>
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
                              itemObj={state.audio}
                              member={state.audio.owner}
                              user_id={state.audio.owner_id}
                              plans={state.plans}
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
                          {state.audio.release_date ? (
                            <div className="animated-rater">
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Release Date:")}</h6>
                                <div className="channel_description">
                                  <Timeago {...props}>
                                    {state.audio.creation_date}
                                  </Timeago>
                                </div>
                              </div>
                            </div>
                          ) : null}
                          {state.audio.description ? (
                            <React.Fragment>
                              <div className="tabInTitle">
                                <h6>{Translate(props, "Description")}</h6>
                              </div>
                              <div
                                className="channel_description"
                                id="VideoDetailsDescp"
                                style={{
                                  ...state.styles,
                                  whiteSpace: "pre-line",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: linkify(state.audio.description),
                                }}
                              >
                                {/* <Linkify componentDecorator={componentDecorator}>{state.video.description}</Linkify> */}
                              </div>
                              {state.showMore ? (
                                <div className="VideoDetailsDescpBtn text-center">
                                  <a
                                    href="#"
                                    onClick={showMore}
                                    className="morelink"
                                  >
                                    {Translate(props, state.showMoreText)}
                                  </a>
                                </div>
                              ) : null}
                            </React.Fragment>
                          ) : null}
                        </div>
                      </div>
                      {props.pageData.appSettings[`${"audio_comment"}`] == 1 &&
                      state.audio.approve == 1 ? (
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
                              owner_id={state.audio.owner_id}
                              hideTitle={true}
                              appSettings={props.pageData.appSettings}
                              commentType="audio"
                              type="audio"
                              comment_item_id={state.audio.audio_id}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="col-xl-3 col-lg-4 videoSidebar"
                style={{ marginTop: !state.fullWidth ? state.height : "0px" }}
              >
                {state.relatedAudios.map((audio) => {
                  let audioImage = audio.image;

                  return (
                    <div key={audio.audio_id} className="sidevideoWrapOutr">
                      <div
                        key={audio.audio_id}
                        className="ptv_videoList_wrap sidevideoWrap"
                      >
                        <div className="videoList_thumb">
                          <Link
                            href="/audio"
                            customParam={`id=${audio.custom_url}`}
                            as={`/audio/${audio.custom_url}`}
                          >
                            <a>
                              <Image
                                title={CensorWord("fn", props, audio.title)}
                                image={audioImage}
                                imageSuffix={props.pageData.imageSuffix}
                                siteURL={props.pageData.siteURL}
                              />
                            </a>
                          </Link>
                          {audio.duration ? (
                            <span className="videoTime">
                              {formatDuration(audio.duration)}
                            </span>
                          ) : null}
                          {reduxStateSongId != audio.audio_id ||
                          reduxStatePauseSongId == audio.audio_id ? (
                            <div
                              className="playbtn"
                              onClick={(e) =>
                                playSong(audio.audio_id, audio, e)
                              }
                            >
                              <i className="fas fa-play"></i>
                            </div>
                          ) : (
                            <div
                              className="playbtn"
                              onClick={pauseSong.bind(
                                this,
                                audio.audio_id,
                                audio
                              )}
                            >
                              <i className="fas fa-pause"></i>
                            </div>
                          )}
                        </div>
                        <div className="videoList_content">
                          <div className={`videoTitle`}>
                            <Link
                              href="/audio"
                              customParam={`id=${audio.custom_url}`}
                              as={`/audio/${audio.custom_url}`}
                            >
                              <a>
                                <h4>
                                  {<CensorWord {...props} text={audio.title} />}
                                </h4>
                              </a>
                            </Link>
                          </div>
                          <div className="videoInfo">
                            <span className="videoViewDate">
                              <span title={Translate(props, "Play Count")}>
                                {audio.play_count + " "}{" "}
                                {props.t("play_count", {
                                  count: audio.play_count
                                    ? audio.play_count
                                    : 0,
                                })}{" "}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default withRouter(Index);
