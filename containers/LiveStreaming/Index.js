import React, { useReducer, useEffect } from "react";
import Router from "next/router";
import RTCClient from "./rtc-client";
import Form from "../../components/DynamicForm/Index";
import dynamic from "next/dynamic";
import Validator from "../../validators";
import axios from "../../axios-orders";
const StartLiveStreaming = dynamic(() => import("./StartLiveStreaming"), {
  ssr: false,
});
const MediaLiveStreaming = dynamic(() => import("./MediaLiveStreaming"), {
  ssr: false,
});
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency";
import moment from "moment-timezone";

const Index = (props) => {
  const randomNumber = () => {
    let maximum = 15000;
    let minimum = 12987;
    let date = new Date();
    let time = date.getTime();
    let number = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    return "" + number + time;
  };
  
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      rtcClient: "",
      streamKey: props.pageData.streamingId
        ? props.pageData.streamingId
        : randomNumber(),
      streamToken: props.pageData.tokenStream
        ? props.pageData.tokenStream
        : null,
      streamType: "camera",
      streamingStart: false,
      streamKeyCreated: props.pageData.tokenStream ? true : false,
      openAddTip: false,
      scheduled: props.pageData.editItem
        ? props.pageData.editItem.scheduled
        : null,
      plans: props.pageData.plans ? props.pageData.plans : [],
      editItem: props.pageData.editItem,
      approved: props.pageData.editItem ? props.pageData.editItem.approve : 1,
      tips:
        props.pageData.editItem && props.pageData.editItem.tips
          ? [...props.pageData.editItem.tips]
          : [{ amount: 0 }],
      previousTips:
        props.pageData.editItem && props.pageData.editItem.tips
          ? [...props.pageData.editItem.tips]
          : [{ amount: 0 }],
      videoTags:
        props.pageData.editItem && props.pageData.editItem.tags
          ? props.pageData.editItem.tags.split(",")
          : null,
      category_id: props.pageData.editItem
        ? props.pageData.editItem.category_id
        : null,
      subcategory_id: props.pageData.editItem
        ? props.pageData.editItem.subcategory_id
        : null,
      subsubcategory_id: props.pageData.editItem
        ? props.pageData.editItem.subsubcategory_id
        : null,
      privacy: props.pageData.editItem
        ? props.pageData.editItem.view_privacy
        : "everyone",
    }
  );
  
  const onUnloadComponent = () => {
    if (state.live) {
      return;
    }
    if (state.editItem && (state.approved == 0 || state.editItem.scheduled)) {
      return;
    }
    if (
      props.pageData.livestreamingtype &&
      props.pageData.livestreamingtype == 0
    ) {
      let formData = new FormData();
      formData.append("streamID", state.streamKey);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let url = "/live-streaming/media-stream/finish";
      formData.append("remove", 1);
      axios
        .post(url, formData, config)
        .then((response) => {
          if (response.data.error) {
          } else {
          }
        })
        .catch((err) => {});
    }
  };
  useEffect(() => {
    window.addEventListener("beforeunload", onUnloadComponent);

    props.socket.on("liveStreamStatus", (socketdata) => {
      let id = socketdata.id;
      if (state.streamKey == id) {
        if (socketdata.action == "liveStreamStarted") {
          setState({  streamingStart: true });
        } else if (socketdata.action == "liveStreamEnded") {
          setState({  streamingStart: false });
        }
      }
    });

    props.socket.on("liveStreamApproved", (socketdata) => {
      let id = socketdata.videoID;
      if (state.editItem && state.editItem.video_id == id) {
        setState({  approved: 1 });
        props.openToast(
          {
            message:Translate(
              props,
              "Live Streaming approved by admin, click on Go Live button."
            ),
            type:"success"
          }
        );
      }
    });

    let client = new RTCClient();
    setState({
      rtcClient: client,
      streamType: "camera",
      streamingStart: false,
    });
    setTimeout(() => {
      checkRTMPStreamingEnable();
    }, 200);
    client
      .createStream({ appID: props.pageData.agora_app_id, codec: "vp8" })
      .then((data) => {
        if (data.error) {
          let streamType = "camera";
          if (props.pageData.livestreamingtype == 0) streamType = "rtmp";
          setState({ errorMessage: data.error, streamType: streamType });
        }
      });
    $(document).on("click", ".add_tips", function () {
      if (props.pageData && !props.pageData.loggedInUserDetails) {
        document.getElementById("loginFormPopup").click();
      } else {
        setState({  openAddTip: true });
      }
    });

    return () => {
      window.removeEventListener("beforeunload", onUnloadComponent);
      Router.events.off("routeChangeStart", UpdateLiveStreamingStatus);
    };
  }, []);

  const UpdateLiveStreamingStatus = () => {
    if (!state.editItem || !state.editItem.scheduled) onUnloadComponent();
  };

  const onCategoryChange = (category_id) => {
    setState({
      
      category_id: category_id,
      subsubcategory_id: 0,
      subcategory_id: 0,
    });
  };
  const onSubCategoryChange = (category_id) => {
    setState({
      
      subcategory_id: category_id,
      subsubcategory_id: 0,
    });
  };
  const onSubSubCategoryChange = (category_id) => {
    setState({  subsubcategory_id: category_id });
  };
  const onChangePrivacy = (value) => {
    setState({  privacy: value });
  };
  const scheduledFunction = (value) => {
    setState({  scheduled: value });
  };
  const onStreamTypeChange = (value) => {
    let updateState = {  streamType: value };
    if (value == "rtmp") {
    } else {
      updateState["streamingStart"] = false;
    }
    setState(updateState);
  };
  const submitStreamKey = () => {
    if (state.submittingKey || state.streamToken) {
      return;
    }
    if (
      props.pageData.livestreamingtype &&
      props.pageData.livestreamingtype == 0
    ) {
      let formData = new FormData();

      formData.append("streamingId", state.streamKey);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let url = "/live-streaming/create-key";

      setState({  submittingKey: true });
      axios
        .post(url, formData, config)
        .then((response) => {
          if (!response.data.error) {
            setState({ vCreated: true, streamToken: response.data.token });
            // checkRTMPStreamingEnable();
          } else {
            // console.log("Error create stream.");
          }
        })
        .catch((err) => {
          // console.log("Error create stream.");
        });
    }
  };
  const checkRTMPStreamingEnable = () => {
    if (
      !state.streamKeyCreated &&
      (props.pageData.appSettings["antserver_media_token"] == "undefined" ||
        props.pageData.appSettings["antserver_media_token"] == 1)
    ) {
      submitStreamKey();
    }
  };
  const goLive = () => {
    setState({
      submitting: false,
      live: true,
      custom_url: state.editItem.custom_url,
      video_id: state.editItem.video_id,
      image: state.editItem.image,
      title: state.editItem.title,
      allow_chat: state.editItem.enable_chat,
    });
    let formData = new FormData();
    formData.append("id", state.editItem.video_id);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/live-streaming/go-live";

    setState({  submittingKey: true });
    axios
      .post(url, formData, config)
      .then((response) => {})
      .catch((err) => {});
  };
  const onSubmit = (model) => {
    if (state.submitting) {
      return;
    }
    let selectedCurrency = props.pageData.selectedCurrency
    let changeRate = selectedCurrency.currency_value
    if (
      props.pageData.appSettings["livestreaming_commission_type"] == 1 &&
      props.pageData.appSettings["livestreaming_commission_value"] > 0
    ) {
      if (model["price"] && parseFloat(model["price"]) > 0) {
        if (
          model["price"] <=
          (parseFloat(props.pageData.appSettings["livestreaming_commission_value"])*changeRate).toFixed(2)
        ) {
          let perprice = {};
          perprice["package"] = {
            price: props.pageData.appSettings["livestreaming_commission_value"],
          };
          setState({
            
            error: [
              {
                message: props.t(
                  "Price enter must be greater than {{price}}.",
                  { price: Currency({ ...props, ...perprice }) }
                ),
              },
            ],
          });
          return;
        }
      } else {
        model["price"] = 0;
      }
    }

    let formData = new FormData();
    for (var key in model) {
      if (model[key] != null && typeof model[key] != "undefined")
        formData.append(key, model[key]);
    }
    if (state.tips) {
      formData.append("tips", JSON.stringify(state.tips));
    }
    if (state.removeElements) {
      formData.append("removeTips", JSON.stringify(state.removeElements));
    }
    if (state.streamType) {
      formData.append("streamingId", state.streamKey);
    }
    if (model["image"]) {
      let image = typeof model["image"] == "string" ? model["image"] : false;
      if (image) {
        formData.append("videoImage", image);
      }
    }
    if (state.editItem) {
      formData.append("id", state.editItem.video_id);
      formData.append("fromEdit", true);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/live-streaming/create";

    setState({  submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({
            
            error: response.data.error,
            submitting: false,
          });
        } else {
          if (
            props.pageData.levelPermissions["livestreaming.scheduled"] == 1 &&
            props.pageData.livestreamingtype == 0 &&
            (model["scheduled"] || response.data.approved == 0)
          ) {
            //set custom url
            if (response.data.approved == 0) {
              props.openToast(
                {
                  message:Translate(
                    props,
                    "Live Streaming need admin Approval, you will get notification once approved by admin."
                  ),
                  type:"success"
                }
              );
            }
            Router.push(`/live-streaming/${response.data.custom_url}`, {
              shallow: true,
            });
            setState({
              
              editItem: response.data.editItem,
              submitting: false,
              approved: response.data.approved,
            });
            return;
          }
          setState({
            submitting: false,
            live: true,
            videoElem: response.data.editItem,
            custom_url: response.data.custom_url,
            video_id: response.data.id,
            image: response.data.image,
            title: response.data.title,
            allow_chat: model["enable_chat"],
            scheduled: model["scheduled"],
          });
        }
      })
      .catch((err) => {
        setState({  submitting: false, error: err });
      });
  };
  const onClickCopy = (value) => {
    var textField = document.createElement("textarea");
    textField.innerText = value;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  };
  const closeTipPopup = () => {
    setState(
      {
        openAddTip: false,
        
        tips: state.previousTips,
        removeElements: [],
      }
    );
  };

  const setAmount = (id, e) => {
    let tips = [...state.tips];
    if (!tips[id]) {
      let item = {};
      item.amount = e.target.value;
      tips.push(item);
    } else {
      tips[id]["amount"] = e.target.value;
    }
    setState({  tips: tips });
  };
  const addMoreRow = (e) => {
    let row = {};
    row["amount"] = 0;
    let tips = [...state.tips];
    tips.push(row);
    setState({  tips: tips });
  };
  const removeTip = (id, e) => {
    e.preventDefault();
    let tips = [...state.tips];
    let removeElements = !state.removeElements ? [] : state.removeElements;
    if (tips[id].tip_id) {
      removeElements.push(tips[id].tip_id);
    }
    tips.splice(id, 1);
    setState({
      
      tips: tips,
      removeElements: removeElements,
    });
  };
  const saveTips = (e) => {
    let valid = true;
    let tips = [...state.tips];
    let perprice = {};
    perprice["package"] = {
      price: props.pageData.appSettings["livestreaming_commission_value"],
    };
    let selectedCurrency = props.pageData.selectedCurrency
    let changeRate = selectedCurrency.currency_value
    tips.forEach((item, index) => {
      if (parseFloat(item.amount) > 0) {
        if (
          parseFloat(
            props.pageData.appSettings["livestreaming_commission_value"]
          )*changeRate > 0 &&
          parseInt(
            props.pageData.appSettings["livestreaming_commission_type"]
          ) == 1 &&
          parseFloat(item.amount) <=
            parseFloat(
              props.pageData.appSettings["livestreaming_commission_value"]
            )*changeRate
        ) {
          valid = false;
          item.error = props.t("Price enter must be greater than {{price}}.", {
            price: Currency({ ...props, ...perprice }),
          });
        } else {
          item.error = null;
        }
      } else {
        item.error = props.t("Enter amount must be greater than {{price}}.", {
          price:
            parseFloat(
              props.pageData.appSettings["livestreaming_commission_value"]
            )*changeRate > 0 &&
            parseInt(
              props.pageData.appSettings["livestreaming_commission_type"]
            ) == 1
              ? Currency({ ...props, ...perprice })
              : 0,
        });
        valid = false;
      }
    });
    let update = {  tips: tips };
    if (valid) {
      update["openAddTip"] = false;
      update["previousTips"] = [...tips];
    }
    setState(update);
  };
  let streamingData = null;
  if (state.live) {
    props.pageData.livestreamingtype == 1
      ? (streamingData = (
          <StartLiveStreaming
            {...props}
            allow_chat={state.allow_chat}
            title={state.title}
            image={state.image}
            video_id={state.video_id}
            custom_url={state.custom_url}
            channel={"channel_" + props.pageData.loggedInUserDetails.user_id}
            role="host"
            currentTime="0"
            allowedTime={parseInt(
              props.pageData.levelPermissions["livestreaming.duration"],
              10
            )}
          />
        ))
      : (streamingData = (
          <MediaLiveStreaming
            videoElem={state.videoElem ? state.videoElem : state.scheduled}
            scheduled={state.scheduled}
            streamToken={state.streamToken}
            streamType={state.streamType}
            streamingId={state.streamKey}
            {...props}
            allow_chat={state.allow_chat}
            title={state.title}
            image={state.image}
            video_id={state.video_id}
            custom_url={state.custom_url}
            role="host"
            currentTime="0"
            allowedTime={parseInt(
              props.pageData.levelPermissions["livestreaming.duration"],
              10
            )}
          />
        ));
  }

  if (streamingData) {
    return streamingData;
  }

  let tips = null;
  if (state.openAddTip) {
    let perprice = {};
    perprice["package"] = {
      price: props.pageData.appSettings["livestreaming_commission_value"],
    };
    tips = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap tip_cnt">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Create Tips")}</h2>
                <a onClick={closeTipPopup} className="_close">
                  <i></i>
                </a>
              </div>
              <div className="user_wallet">
                <div className="row">
                  <form>
                    {parseFloat(
                      props.pageData.appSettings[
                        "livestreaming_commission_value"
                      ]
                    ) > 0 &&
                    parseInt(
                      props.pageData.appSettings[
                        "livestreaming_commission_type"
                      ]
                    ) == 1 ? (
                      <p className="tip_amount_min">
                        {props.t(
                          "Price enter must be greater than {{price}}.",
                          { price: Currency({ ...props, ...perprice }) }
                        )}
                      </p>
                    ) : null}
                    {state.tips.length > 0
                      ? state.tips.map((item, i) => {
                          return (
                            <div className="form-group" key={i}>
                              <div className="tip_input">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={item.amount}
                                  disabled={item.tip_id ? true : false}
                                  placeholder={Translate(
                                    props,
                                    "Enter Tip Amount"
                                  )}
                                  onChange={(e) => setAmount(i, e)}
                                />

                                <a
                                  href="#"
                                  onClick={(e) => removeTip(i, e)}
                                  className="remove"
                                >
                                  {props.t("remove")}
                                </a>
                              </div>
                              {item.error ? (
                                <p className="error">{item.error}</p>
                              ) : null}
                            </div>
                          );
                        })
                      : null}
                    <div className="form-group">
                      <label htmlFor="name" className="control-label"></label>
                      <button type="button" onClick={saveTips}>
                        {Translate(props, "Save")}
                      </button>
                      <button
                        type="button"
                        className="add_more_tip"
                        onClick={addMoreRow}
                      >
                        {Translate(props, "Add More")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.errorMessage && props.pageData.livestreamingtype == 1) {
    return (
      <div className="videoSection1">
        <div className="ls_overlay">
          <div className="videoWrap" id="video">
            <div
              id="local_stream"
              className="video-placeholder local_stream"
            ></div>
            <div
              id="local_video_info"
              style={{ display: "none" }}
              className="video-profile hide"
            ></div>
          </div>
          <div className="centeredForm">
            <div className="lsForm">
              <div className="user-area clear">
                <div className="container form">
                  {Translate(
                    props,
                    "To go live, allow access to Camera and Microphone."
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let validator = [
    {
      key: "title",
      validations: [
        {
          validator: Validator.required,
          message: "Title is required field",
        },
      ],
    },
  ];
  let formFields = [];
  if (state.approved == 0) {
    formFields.push({
      key: "approve_desc_1",
      type: "content",
      content:
        '<span class="error">' +
        props.t(
          "Live Streaming need admin Approval, you will get notification once approved by admin."
        ) +
        "</span>",
    });
  }
  if (props.pageData.livestreamingtype == 0) {
    let optionsType = [];
    let value = "rtmp";
    if (!state.errorMessage) {
      optionsType.push({
        value: "camera",
        key: "camera_1",
        label: "Use Camera",
      });
      value = "camera";
    }

    optionsType.push({
      value: "rtmp",
      key: "camera_0",
      label: "Use Stream Key",
    });
    formFields.push({
      key: "streamType",
      label: "Choose how you want to start setting up your live video.",
      type: "select",
      value: value,
      options: optionsType,
      onChangeFunction: onStreamTypeChange,
    });

    if (state.streamType == "rtmp") {
      let token = "";
      if (
        props.pageData.appSettings["antserver_media_token"] == "undefined" ||
        props.pageData.appSettings["antserver_media_token"] == 1
      ) {
        token = "?token=" + state.streamToken;
      }
      formFields.push(
        {
          copyText: true,
          onClickCopy: onClickCopy,
          key: "stream_url",
          label: "Server URL",
          props: {
            onKeyDown: (e) => {
              e.preventDefault();
            },
          },
          value:
            "rtmp://" +
            props.pageData.liveStreamingServerURL
              .replace("https://", "")
              .replace("http://", "") +
            `/${props.pageData.streamingAppName}`,
        },
        {
          copyText: true,
          onClickCopy: onClickCopy,
          key: "stream_key",
          label: "Stream Key",
          props: {
            onKeyDown: (e) => {
              e.preventDefault();
            },
          },
          value: state.streamKey + token,
        },
        {
          key: "text_description",
          type: "text_description",
          postDescription:
            '<span class="form-single-description">' +
            props.t(
              "Copy and paste Server URL and Stream Key settings into your streaming software."
            ) +
            "</span>",
        }
      );
    }
  }

  formFields.push(
    {
      key: "title",
      label: "Title",
      value: state.editItem ? state.editItem.title : "",
      isRequired: true,
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      value: state.editItem ? state.editItem.description : "",
    }
  );

  //set tip options
  if (parseInt(props.pageData.appSettings["video_tip"]) == 1) {
    formFields.push({
      key: "addTips",
      type: "content",
      content:
        "<button class='add_tips' type='button'>" +
        Translate(props, "Add Tips") +
        "</button>",
    });
  }

  let imageUrl = null;
  if (state.editItem && state.editItem.image) {
    if (
      state.editItem.image.indexOf("http://") == 0 ||
      state.editItem.image.indexOf("https://") == 0
    ) {
      imageUrl = state.editItem.image;
    } else {
      if (
        props.pageData.livestreamingtype == 0 &&
        state.editItem.mediaserver_stream_id &&
        state.editItem.image &&
        state.editItem.image.indexOf(
          `${props.pageData.streamingAppName}/previews`
        ) > 0
      ) {
        if (props.pageData.liveStreamingCDNURL) {
          imageUrl =
            props.pageData.liveStreamingCDNURL +
            state.editItem.image
              .replace(`/LiveApp`, "")
              .replace(`/WebRTCAppEE`, "");
        } else
          imageUrl =
            props.pageData.liveStreamingServerURL +
            ":5443" +
            state.editItem.image;
      } else {
        imageUrl = props.pageData.imageSuffix + state.editItem.image;
      }
    }
  }
  formFields.push({
    key: "image",
    label: "Upload Image",
    type: "file",
    value: state.editItem ? imageUrl : "",
  });

  validator.push({
    key: "price",
    validations: [
      {
        validator: Validator.price,
        message: "Please provide valid price",
      },
    ],
  });
  formFields.push({
    key: "price",
    label: "Price (Leave empty for free livestreaming)",
    value: state.editItem ? state.editItem.price : null,
    isRequired: true,
  });
  if (
    props.pageData.appSettings["livestreaming_commission_type"] == 1 &&
    props.pageData.appSettings["livestreaming_commission_value"] > 0
  ) {
    let perprice = {};
    perprice["package"] = {
      price: props.pageData.appSettings["livestreaming_commission_value"],
    };
    formFields.push({
      key: "price_desc_1",
      type: "content",
      content:
        "<span>" +
        props.t("Price enter must be greater than {{price}}.", {
          price: Currency({ ...props, ...perprice }),
        }) +
        "</span>",
    });
  }

  if (
    state.devices &&
    (!props.pageData.livestreamingtype || props.pageData.livestreamingtype == 1)
  ) {
    let devices = [];
    state.devices.audios.forEach(function (audio) {
      devices.push({
        key: audio.name + audio.name,
        label: audio.name,
        value: audio.value,
      });
    });
    formFields.push({
      key: "audio_id",
      label: "Device Audio Setting",
      type: "select",
      value: "",
      options: devices,
      isRequired: true,
    });
    let videos = [];
    state.devices.videos.forEach(function (video) {
      videos.push({
        key: video.name + video.name,
        label: video.name,
        value: video.value,
      });
    });
    formFields.push({
      key: "audio_id",
      label: "Device Video Setting",
      type: "select",
      value: "",
      options: videos,
      isRequired: true,
    });
  }

  if (props.pageData.videoCategories) {
    let categories = [];
    categories.push({ key: 0, value: 0, label: "Please Select Category" });
    props.pageData.videoCategories.forEach((res) => {
      categories.push({
        key: res.category_id,
        label: res.title,
        value: res.category_id,
      });
    });
    formFields.push({
      key: "category_id",
      label: "Category",
      type: "select",
      value: state.editItem ? state.editItem.category_id : null,
      onChangeFunction: onCategoryChange,
      options: categories,
    });

    //get sub category
    if (state.category_id) {
      let subcategories = [];

      props.pageData.videoCategories.forEach((res) => {
        if (res.category_id == state.category_id) {
          if (res.subcategories) {
            subcategories.push({
              key: 0,
              value: 0,
              label: "Please Select Sub Category",
            });
            res.subcategories.forEach((rescat) => {
              subcategories.push({
                key: rescat.category_id,
                label: rescat.title,
                value: rescat.category_id,
              });
            });
          }
        }
      });

      if (subcategories.length > 0) {
        formFields.push({
          key: "subcategory_id",
          label: "Sub Category",
          value: state.editItem ? state.editItem.subcategory_id : null,
          type: "select",
          onChangeFunction: onSubCategoryChange,
          options: subcategories,
        });

        if (state.subcategory_id) {
          let subsubcategories = [];

          props.pageData.videoCategories.forEach((res) => {
            if (res.category_id == state.category_id) {
              if (res.subcategories) {
                res.subcategories.forEach((rescat) => {
                  if (rescat.category_id == state.subcategory_id) {
                    if (rescat.subsubcategories) {
                      subsubcategories.push({
                        key: 0,
                        value: 0,
                        label: "Please Select Sub Sub Category",
                      });
                      rescat.subsubcategories.forEach((ressubcat) => {
                        subsubcategories.push({
                          key: ressubcat.category_id,
                          label: ressubcat.title,
                          value: ressubcat.category_id,
                        });
                      });
                    }
                  }
                });
              }
            }
          });

          if (subsubcategories.length > 0) {
            formFields.push({
              key: "subsubcategory_id",
              label: "Sub Sub Category",
              type: "select",
              value: state.editItem ? state.editItem.subsubcategory_id : null,
              onChangeFunction: onSubSubCategoryChange,
              options: subsubcategories,
            });
          }
        }
      }
    }
  }
  formFields.push({
    key: "tags",
    label: "Tags",
    type: "tags",
  });

  formFields.push({
    key: "enable_chat",
    label: "",
    type: "checkbox",
    subtype: "single",
    value: state.editItem ? [state.editItem.enable_chat ? "1" : "0"] : ["1"],
    options: [
      {
        value: "1",
        label: "Allow chat",
        key: "allow_chat_1",
      },
    ],
  });

  if (props.pageData.appSettings.video_adult == "1") {
    formFields.push({
      key: "adult",
      label: "",
      subtype: "single",
      type: "checkbox",
      value: state.editItem ? [state.editItem.adult ? "1" : "0"] : ["0"],
      options: [
        {
          value: "1",
          label: "Mark as Adult",
          key: "adult_1",
        },
      ],
    });
  }

  formFields.push({
    key: "search",
    label: "",
    type: "checkbox",
    subtype: "single",
    value: state.editItem ? [state.editItem.search ? "1" : "0"] : ["1"],
    options: [
      {
        value: "1",
        label: "Show this live streaming in search results",
        key: "search_1",
      },
    ],
  });

  if (props.pageData.appSettings["enable_comment_approve"] == 1) {
    let comments = [];
    comments.push({
      value: "1",
      key: "comment_1",
      label: "Display automatically",
    });
    comments.push({
      value: "0",
      key: "comment_0",
      label: "Don't display until approved",
    });
    formFields.push({
      key: "comments",
      label: "Comments Setting",
      type: "select",
      value: state.editItem
        ? state.editItem.autoapprove_comments.toString()
        : "1",
      options: comments,
    });
  }
  let privacyOptions = [
    {
      value: "everyone",
      label: "Anyone",
      key: "everyone",
    },
    {
      value: "onlyme",
      label: "Only me",
      key: "onlyme",
    },
    {
      value: "password",
      label: "Only people with password",
      key: "password",
    },
    {
      value: "link",
      label: "Only to people who have link",
      key: "link",
    },
  ];
  if (props.pageData.appSettings["whitelist_domain"] == 1) {
    privacyOptions.push({
      value: "whitelist_domain",
      label: "Whitelist Domain",
      key: "whitelist_domain",
    });
  }
  if (props.pageData.appSettings.user_follow == "1") {
    privacyOptions.push({
      value: "follow",
      label: "Only people I follow",
      key: "follow",
    });
  }
  if (state.plans.length > 0) {
    state.plans.forEach((item) => {
      let perprice = {};
      perprice["package"] = { price: item.price };
      privacyOptions.push({
        value: "package_" + item.member_plan_id,
        label: props.t("Limited to {{plan_title}} ({{plan_price}}) and above", {
          plan_title: item.title,
          plan_price: Currency({ ...props, ...perprice }),
        }),
        key: "package_" + item.member_plan_id,
      });
    });
  }
  if (
    props.pageData.levelPermissions["livestreaming.scheduled"] == 1 &&
    props.pageData.livestreamingtype == 0
  ) {
    let value =
      state.editItem &&
      state.editItem.scheduled &&
      state.editItem.scheduled != ""
        ? new Date(state.editItem.scheduled.toString())
        : "";
    let minDateValue = new Date();

    let dateS = moment(value);
    let currentTime = dateS.isValid()
      ? dateS.tz(props.pageData.defaultTimezone)
      : null;
    let minDate = moment(minDateValue)
      .tz(props.pageData.defaultTimezone)
      .toDate();
    if (currentTime) {
      currentTime = currentTime.toDate();
    }
    formFields.push({
      key: "scheduled",
      label: "Schedule Stream",
      type: "datetime",
      minDate: minDate,
      value: currentTime,
      onChangeFunction: scheduledFunction,
    });
    formFields.push({
      key: "scheduled_desc_1",
      type: "content",
      content:
        "<span>" +
        props.t("Leave blank if you want to Go Live now.") +
        "</span>",
    });
  }
  formFields.push({
    key: "privacy",
    label: "Privacy",
    type: "select",
    value: state.editItem ? state.editItem.view_privacy : "everyone",
    onChangeFunction: onChangePrivacy,
    options: privacyOptions,
  });
  if (state.privacy == "password") {
    formFields.push({
      key: "password",
      label: "Password",
      type: "password",
      value: state.editItem ? state.editItem.password : "",
      isRequired: true,
    });
    validator.push({
      key: "password",
      validations: [
        {
          validator: Validator.required,
          message: "Password is required field",
        },
      ],
    });
  }
  let defaultValues = {};
  formFields.forEach((elem) => {
    if (elem.value) defaultValues[elem.key] = elem.value;
  });

  if (state.category_id) {
    defaultValues["category_id"] = state.category_id;
  }
  if (state.subcategory_id) {
    defaultValues["subcategory_id"] = state.subcategory_id;
  }
  if (state.privacy) {
    defaultValues["privacy"] = state.privacy;
  }
  if (state.videoTags) {
    defaultValues["tags"] = state.videoTags;
  }
  if (state.subsubcategory_id) {
    defaultValues["subsubcategory_id"] = state.subsubcategory_id;
  }
  let token = "";
  if (
    props.pageData.appSettings["antserver_media_token"] == "undefined" ||
    props.pageData.appSettings["antserver_media_token"] == 1
  ) {
    token = "?token=" + state.streamToken;
  }
  if (state.streamType) {
    defaultValues["streamType"] = state.streamType;
    defaultValues["stream_key"] = state.streamKey + token;
    defaultValues["stream_url"] =
      "rtmp://" +
      (props.pageData.liveStreamingServerURL
        ? props.pageData.liveStreamingServerURL
            .replace("https://", "")
            .replace("http://", "")
        : "") +
      `/${props.pageData.streamingAppName}`;
  }

  if (state.streamType == "rtmp" && !state.streamingStart) {
    formFields.push({
      key: "text_description_rtmp",
      type: "text_description",
      postDescription:
        '<span class="form-single-description">' +
        props.t(
          "Submit button will be enabled once you start streaming from your streaming software."
        ) +
        "</span>",
    });
  }
  let updatedValues = {}
  if(state.streamToken){
    // if (state.streamType == "rtmp") {
      if (
        props.pageData.appSettings["antserver_media_token"] == "undefined" ||
        props.pageData.appSettings["antserver_media_token"] == 1
      ) {
        updatedValues.stream_key = state.streamKey + "?token=" + state.streamToken;
      }
    // }
  }

  return (
    <React.Fragment>
      {tips}
      <div className="videoSection1">
        <div className="ls_overlay">
          <div className="videoWrap" id="video">
            <div
              id="local_stream"
              className="video-placeholder local_stream"
            ></div>
            <div
              id="local_video_info"
              style={{ display: "none" }}
              className="video-profile hide"
            ></div>
          </div>
          <div className="centeredForm">
            <div className="lsForm">
              <h3 className="header-live-streaming">
                {Translate(props, "Webcam stream info")}
              </h3>
              <Form
                className="form"
                //title={state.title}
                defaultValues={defaultValues}
                updatedValues={updatedValues}
                {...props}
                disableButtonSubmit={
                  state.streamType == "rtmp" && !state.scheduled
                    ? !state.streamingStart
                    : false
                }
                generalError={state.error}
                validators={validator}
                submitText={
                  state.editItem
                    ? !state.submitting
                      ? "Edit"
                      : "Editing..."
                    : !state.submitting
                    ? "Submit"
                    : "Submitting..."
                }
                model={formFields}
                onSubmit={(model) => {
                  onSubmit(model);
                }}
              />
            </div>
            {state.editItem && state.approved == 1 ? (
              <div className="go-live-btn">
                <button
                  type="button"
                  disabled={
                    state.streamType == "rtmp" ? !state.streamingStart : false
                  }
                  title={
                    state.streamType == "rtmp"
                      ? props.t(
                          "Go Live button will be enabled once you start streaming from your streaming software."
                        )
                      : ""
                  }
                  onClick={goLive}
                >
                  {props.t("Go Live")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Index;
