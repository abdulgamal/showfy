import React, { useReducer, useEffect, useRef } from "react";
import Breadcrum from "../../components/Breadcrumb/Form";
import Form from "../../components/DynamicForm/Index";
import Validator from "../../validators";
import axios from "../../axios-orders";
import Router from "next/router";
import moment from "moment-timezone";

const Reel = (props) => {
  const myRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      appViewWidth: props.appViewWidth,
      processing: false,
      percentCompleted: 0,
      chooseType: "upload",
      editItem: props.chooseVideos ? null : props.pageData.editItem,
      reelTitle: props.pageData.editItem ? props.pageData.editItem.title : null,
      reelDescription: props.pageData.editItem
        ? props.pageData.editItem.description
        : null,
      reelImage: null,
      success: props.pageData.editItem ? true : false,
      error: null,
      privacy: props.pageData.editItem
        ? props.pageData.editItem.view_privacy
        : "everyone",
    }
  );
  useEffect(() => {
    if (props.pageData.editItem != state.editItem) {
      setState({
        processing: false,
        percentCompleted: 0,
        chooseType: "upload",
        editItem: props.chooseVideos ? null : props.pageData.editItem,
        reelTitle: props.pageData.editItem
          ? props.pageData.editItem.title
          : null,
        reelDescription: props.pageData.editItem
          ? props.pageData.editItem.description
          : null,
        reelImage: null,
        success: props.pageData.editItem ? true : false,
        error: null,
        privacy: props.pageData.editItem
          ? props.pageData.editItem.view_privacy
          : "everyone",
      });
    }
  }, [props]);

  const onSubmit = (model) => {
    if (state.submitting) {
      return;
    }

    let formData = new FormData();
    for (var key in model) {
      if (model[key] != null && typeof model[key] != "undefined")
        formData.append(key, model[key]);
    }
    if (state.id) {
      formData.append("id", state.id);
      formData.append("videoResolution", state.videoWidth);
    }

    //image
    if (model["image"]) {
      let image = typeof model["image"] == "string" ? model["image"] : false;
      if (image) {
        formData.append("reelImage", image);
      }
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/reels/create";
    if (state.editItem) {
      url = "/reels/create";
      formData.append("fromEdit", 1);
      formData.append("id", state.editItem.reel_id);
    }
    setState({  submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({
            
            error: response.data.error,
            submitting: false,
          });
        } else {
          if (props.chooseVideos) {
            props.chooseVideos();
          } else {
            Router.push(`/reel/${response.data.reel_id}`);
          }
        }
      })
      .catch((err) => {
        setState({  submitting: false, error: err });
      });
  };

  const onChangePrivacy = (value) => {
    setState({  privacy: value });
  };
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };
  const uploadMedia = (e) => {
    let res_field = e.name;
    var extension = res_field
      .substr(res_field.lastIndexOf(".") + 1)
      .toLowerCase();
    var allowedExtensions = [
      "mp4",
      "mov",
      "webm",
      "mpeg",
      "3gp",
      "avi",
      "flv",
      "ogg",
      "mkv",
      "mk3d",
      "mks",
      "wmv",
    ];
    if (
      !props.pageData.appSettings["video_ffmpeg_path"] ||
      props.pageData.appSettings["video_ffmpeg_path"] == ""
    ) {
      allowedExtensions = ["mp4"];
    }
    if (allowedExtensions.indexOf(extension) === -1) {
      alert(
        props.t("Invalid file Format. Only {{data}} are allowed.", {
          data: allowedExtensions.join(", "),
        })
      );
      return false;
    } else if (
      parseInt(props.pageData.appSettings["reel_video_upload"]) > 0 &&
      e.size >
        parseInt(props.pageData.appSettings["reel_video_upload"]) * 1000000
    ) {
      alert(
        props.t("Maximum upload limit is {{upload_limit}}", {
          upload_limit: formatBytes(
            parseInt(props.pageData.appSettings["reel_video_upload"]) *
              1000000
          ),
        })
      );
      return false;
    }
    onSubmitUploadImport({ upload: e });
  };
  const onSubmitUploadImport = (model) => {
    if (state.validating) {
      return;
    }
    const formData = new FormData();
    for (var key in model) {
      formData.append(key, model[key]);
    }

    var config = {};

    if (key == "upload") {
      config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          var percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setState({
            
            percentCompleted: percentCompleted,
            processing: percentCompleted == 100 ? true : false,
          });
        },
      };
    } else {
      config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
    }
    formData.append("type", "reel");
    let url = "/reels/" + key;
    if (state.isEdit) {
      url = "/reels/create/" + state.isEdit;
    }
    setState({  validating: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({
            
            error: response.data.error,
            validating: false,
          });
        } else {
          setState({
            
            videoWidth: response.data.videoWidth,
            validating: false,
            id: response.data.id,
            success: true,
            reelTitle: response.data.name,
            reelImage: response.data.images[0],
          });
        }
      })
      .catch((err) => {
        setState({  validating: false, error: err });
      });
  };

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

  let imageUrl = null;
  if (state.editItem && state.editItem.image) {
    if (
      state.editItem.image.indexOf("http://") == 0 ||
      state.editItem.image.indexOf("https://") == 0
    ) {
      imageUrl = state.editItem.image;
    } else {
      imageUrl = props.pageData.imageSuffix + state.editItem.image;
    }
  }
  let formFields = [
    {
      key: "title",
      label: "Reel Title",
      value: state.editItem ? state.editItem.title : null,
      isRequired: true,
    },
    {
      key: "description",
      label: "Reel Description",
      type: "textarea",
      value: state.editItem ? state.editItem.description : null,
    },
  ];

  formFields.push({
    key: "image",
    label: "Upload Reel Image",
    type: "file",
    value: imageUrl,
  });

  let defaultValues = {};
  if (state.chooseType) {
    formFields.forEach((elem) => {
      if (elem.value) defaultValues[elem.key] = elem.value;
    });
  }
  if (
    state.reelTitle ||
    state.reelImage ||
    state.reelDescription
  ) {
    if (state.reelTitle) {
      defaultValues["title"] = state.reelTitle;
    }
    if (state.reelImage) {
      defaultValues["image"] = state.reelImage;
    }
    if (state.reelDescription) {
      defaultValues["description"] = state.reelDescription;
    }
  }
  if (state.privacy) {
    defaultValues["privacy"] = state.privacy;
  }
  let validatorUploadImport = [];
  let fieldUploadImport = [];
  if (state.chooseType == "upload" && !state.editItem) {
    validatorUploadImport.push({
      key: "upload",
      validations: [
        {
          validator: Validator.required,
          message: "Upload reel is required field.",
        },
      ],
    });
    fieldUploadImport.push({
      key: "upload",
      label: "",
      type: "video",
      defaultText: "Drag & Drop Video File Here",
      onChangeFunction: uploadMedia,
    });
  }
  // if(state.editItem && state.editItem.scheduled){
  let value =
    state.editItem &&
    state.editItem.scheduled &&
    state.editItem.scheduled != ""
      ? new Date(state.editItem.scheduled.toString())
      : new Date();
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
    label: "Schedule Reel",
    type: "datetime",
    minDate: minDate,
    value: currentTime,
  });
  // }
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
      value: "link",
      label: "Only to people who have video link",
      key: "link",
    },
  ];
  if (props.pageData.appSettings.user_follow == "1") {
    privacyOptions.push({
      value: "follow",
      label: "Only people I follow",
      key: "follow",
    });
  }
  // if(state.plans.length > 0){
  //     state.plans.forEach(item => {
  //         let perprice = {}
  //         perprice['package'] = { price: item.price }
  //         privacyOptions.push({
  //             value:"package_"+item.member_plan_id,label:props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...props,...perprice})}),key:"package_"+item.member_plan_id
  //         })
  //     })
  // }

  formFields.push({
    key: "privacy",
    label: "Privacy",
    type: "select",
    value: state.editItem ? state.editItem.view_privacy : "everyone",
    onChangeFunction: onChangePrivacy,
    options: privacyOptions,
  });

  return (
    <React.Fragment>
      {state.success ? (
        <React.Fragment>
          <Breadcrum
            {...props}
            image={
              props.pageData["pageInfo"]["banner"]
                ? props.pageData["pageInfo"]["banner"]
                : props.pageData["subFolder"] +
                  "static/images/breadcumb-bg.jpg"
            }
            title={`${state.editItem ? "Edit" : "Create"} Reel`}
          />
          <div className="mainContentWrap">
            <div className="container">
              <div className="row">
                <div className="col-md-12 position-relative">
                  <div
                    className="formBoxtop loginp content-form"
                    ref={myRef}
                  >
                    <Form
                      editItem={state.editItem}
                      className="form"
                      defaultValues={defaultValues}
                      {...props}
                      generalError={state.error}
                      validators={validator}
                      submitText={
                        !state.submitting ? "Submit" : "Submitting..."
                      }
                      model={formFields}
                      onSubmit={(model) => {
                        onSubmit(model);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      ) : (
        <div className="videoBgWrap container" ref={myRef}>
          {
            <div className="user-area">
              <div className="container">
                <div className="BtnUpld"></div>
              </div>
            </div>
          }
          {state.chooseType ? (
            //upload file
            <React.Fragment>
              <Form
                editItem={state.editItem}
                className="form"
                videoKey="video"
                generalError={state.error}
                title={"Upload Video"}
                validators={validatorUploadImport}
                model={fieldUploadImport}
                submitText={"Fetch Video"}
                {...props}
                percentCompleted={state.percentCompleted}
                processing={state.processing}
                textProgress="Video is processing, this may take few minutes."
                submitHide={state.chooseType == "upload" ? true : false}
                loading={state.validating ? true : false}
                onSubmit={(model) => {
                  onSubmitUploadImport(model);
                }}
              />
            </React.Fragment>
          ) : null}
        </div>
      )}
    </React.Fragment>
  );
};

export default Reel;
