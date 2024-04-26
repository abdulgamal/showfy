import React, { useReducer, useEffect } from "react";

const MusicVideo = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      videoType: props.videoType,
      musicType: props.musicType,
      musicExt: props.musicExt,
      seemoreValue: "",
      videoExt: props.videoExt,
      isSubmit: props.isSubmit,
    }
  );
  useEffect(() => {
    if (props.isSubmit != state.isSubmit) {
      setState({ isSubmit: props.isSubmit });
    }
  }, [props]);

  const changeImage = (picture) => {
    var url = picture.target.value;
    var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    if (
      picture.target.files &&
      picture.target.files[0] &&
      (ext === "png" ||
        ext === "jpeg" ||
        ext === "jpg" ||
        ext === "PNG" ||
        ext === "webp" ||
        ext === "JPEG" ||
        ext === "JPG" ||
        ext === "gif" ||
        ext === "GIF")
    ) {
      setState(
        {  imageType: picture.target.files[0] }
      );
    } else {
      alert(props.t("Only jpeg,png and gif images are allowed."));
    }
  };
  const validateStory = () => {
    if (state.isSubmit) {
      return;
    }
    if (
      state.videoType &&
      !state.imageType &&
      parseInt(props.pageData.appSettings["stories_video_image"]) == 1
    ) {
      alert(props.t("Please select image to upload."));
      return;
    } else if (
      state.musicType &&
      !state.imageType &&
      parseInt(props.pageData.appSettings["stories_audio_image"]) == 1
    ) {
      alert(props.t("Please select image to upload."));
      return;
    }
    setState({  isSubmit: true });
    let formData = new FormData();
    let url = "/stories/create/video";
    if (state.videoType) formData.append("videoStories", state.videoType);
    else if (state.musicType) {
      url = "/stories/create/audio";
      formData.append("audioStories", state.musicType);
    }
    if (state.imageType)
      formData.append("image", state.imageType, state.imageType.name);
    formData.append("seemore", state.seemoreValue);
    props.submitForm(formData, url);
  };
  var createObjectURL =
    (URL || webkitURL || {}).createObjectURL || function () {};
  let updatedWidth = {};

  if (
    state.musicExt == "mp3" ||
    state.musicExt == "wav" ||
    state.videoExt == "mp4" ||
    state.videoExt == "3gp" ||
    state.videoExt == "webp" ||
    state.videoExt == "mov"
  ) {
  } else {
    updatedWidth.width = "100%";
  }
  return (
    <div className="story-details story-details-create">
      <div className="story-sidebar">
        <div className="d-flex align-items-center justify-content-between my-3">
          <h2 className="heading-sdbar"> {props.t("Your Story")} </h2>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.openSettings();
            }}
          >
            {" "}
            {props.t("Settings")}
          </a>
        </div>
        <div className="storyList">
          <div className="storyListBox sidebar-scroll">
            {/* <h3 className="sdTitleStory">{props.t("Your story")}</h3> */}
            <div className="story-users-list">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="story-media">
                  <img
                    src={
                      props.pageData.imageSuffix +
                      props.pageData.loggedInUserDetails.avtar
                    }
                    alt={props.pageData.loggedInUserDetails.displayname}
                  />
                </div>
                <div className="story-text">
                  <div className="story-username">
                    {props.pageData.loggedInUserDetails.displayname}
                  </div>
                </div>
              </a>
              <div className="storyText-wrap mt-3">
                <input
                  type="url"
                  className="storyTextarea form-control"
                  placeholder={props.t("See More URL")}
                  onChange={(e) => {
                    setState({ seemoreValue: e.target.value });
                  }}
                  value={state.seemoreValue}
                ></input>
              </div>
              <div className="storyBgimg-wrap mt-3">
                <div className="title">{props.t("Image")}</div>
                <div className="storyBgApply">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={changeImage.bind(this)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="storyShare-btnWrap">
          <div className="storyShare-btnB">
            <button
              className="btn btn-secondary"
              onClick={() => props.discard()}
            >
              {props.t("Discard")}
            </button>
            <button
              className={`btn ${
                state.isSubmit ? "btn-secondary" : "btn-primary"
              }`}
              onClick={(e) => {
                validateStory();
              }}
            >
              {props.t("Share to Story")}
            </button>
          </div>
        </div>
      </div>
      <div className="story-content position-relative">
        <div className="storyDetails-contentWrap">
          <div className="createstory-content">
            <div className="storyPreview-wrap">
              <div className="storyPreview-innr">
                <div className="storyPreview-title">Preview</div>
                <div className="storyPreview-conent flex-column">
                  <div
                    className="storyDetails-cntent"
                    style={{ ...updatedWidth }}
                  >
                    <div className="align-items-center d-flex imageBox justify-content-center imageBox">
                      {state.imageType && !state.videoType ? (
                        <img
                          className="img-fluid position-absolute"
                          src={
                            state.imageType
                              ? createObjectURL(state.imageType)
                              : ""
                          }
                        />
                      ) : null}
                      {state.musicExt == "mp3" || state.musicExt == "wav" ? (
                        <audio controls autoPlay={true} loop>
                          <source
                            src={
                              state.musicType
                                ? createObjectURL(state.musicType)
                                : ""
                            }
                            type="audio/mpeg"
                          />
                        </audio>
                      ) : state.videoExt == "mp4" ||
                        state.videoExt == "3gp" ||
                        state.videoExt == "webp" ||
                        state.videoExt == "mov" ? (
                        <video
                          style={{ width: "100%" }}
                          controls
                          autoPlay={true}
                          playsInline={true}
                          loop
                        >
                          <source
                            src={
                              state.videoType
                                ? createObjectURL(state.videoType)
                                : ""
                            }
                            type="video/mp4"
                          />
                        </video>
                      ) : state.videoType ? (
                        <div className="no-content text-center">
                          {props.t(
                            "Format not supported for preview, video will be available after video conversion completed on server once story submitted successfully."
                          )}
                        </div>
                      ) : (
                        <div className="no-content text-center">
                          {props.t(
                            "Format not supported for preview, audio will be available after audio conversion completed on server once story submitted successfully."
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicVideo;
