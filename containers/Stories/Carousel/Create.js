import React, { useReducer, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "../../../axios-orders";

const StoryArchive = dynamic(() => {
  return import("./Archive");
});

const MusicVideo = dynamic(() => import("./MusicVideo"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="slider shimmer"> </div>
    </div>
  ),
});

const Image = dynamic(() => import("./Image"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="slider shimmer"> </div>
    </div>
  ),
});

const Text = dynamic(() => import("./Text"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="slider shimmer"> </div>
    </div>
  ),
});
const OpenAI = dynamic(() => import("../../OpenAI"), {
  ssr: false,
});

const Create = (props) => {
  const imageref = useRef(null);
  const imageAIref = useRef(null);
  const musicref = useRef(null);
  const videoref = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      type: null,
      imageType: null,
      privacy: props.pageData.storyPrivacy
        ? props.pageData.storyPrivacy
        : "public",
      defaultPrivacy: props.pageData.storyPrivacy
        ? props.pageData.storyPrivacy
        : "public",
    }
  );
  useEffect(() => {
    $("body").addClass("stories-open");
    getPrivacy();
    if (props.fromDirect) {
      props.closePopupFirst(true);
    }
  }, []);

  const discard = () => {
    if (
      confirm(
        props.t(
          "Are you sure you want to discard this story? Your story won't be saved."
        )
      )
    ) {
      setState({ type: null, imageType: null, textDescription: null });
    }
  };
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };
  const changeMusic = (picture) => {
    var url = picture.target.value;
    var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    var allowedExtensions = ["mp3", "m4a", "aac", "wav", "mp4", "wma"];
    if (allowedExtensions.indexOf(ext) === -1) {
      alert(
        props.t("Invalid file Format. Only {{data}} are allowed.", {
          data: allowedExtensions.join(", "),
        })
      );
      return false;
    } else if (picture.target.files && picture.target.files[0]) {
      if (
        parseInt(props.pageData.appSettings["stories_audio_upload"]) > 0 &&
        picture.target.files[0].size >
          parseInt(props.pageData.appSettings["stories_audio_upload"]) * 1000000
      ) {
        alert(
          props.t("Maximum upload limit is {{upload_limit}}", {
            upload_limit:
              props.pageData.appSettings["stories_audio_upload"] + "MB",
          })
        );
        return false;
      }

      var url = picture.target.files[0].name;
      var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();

      setState({
        type: "music",
        imageType: picture.target.files[0],
        musicExt: ext,
      });
      picture.target.value = "";
    }
  };
  const changeVideo = (picture) => {
    var url = picture.target.value;
    var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
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
    if (allowedExtensions.indexOf(ext) === -1) {
      alert(
        props.t("Invalid file Format. Only {{data}} are allowed.", {
          data: allowedExtensions.join(", "),
        })
      );
      return false;
    } else if (picture.target.files && picture.target.files[0]) {
      if (
        parseInt(props.pageData.appSettings["stories_video_upload"]) > 0 &&
        picture.target.files[0].size >
          parseInt(props.pageData.appSettings["stories_video_upload"]) * 1000000
      ) {
        alert(
          props.t("Maximum upload limit is {{upload_limit}}", {
            upload_limit:
              props.pageData.appSettings["stories_video_upload"] + "MB",
          })
        );
        return false;
      }

      setState({
        type: "video",
        imageType: picture.target.files[0],
        videoExt: ext,
      });
      picture.target.value = "";
    }
  };
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
      setState({
        type: "image",
        imageType: picture.target.files[0],
      });
    } else {
      alert(props.t("Only jpeg,png and gif images are allowed."));
    }
  };
  const submitForm = (formData, url) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          alert(props.t("Error uploading story, please try again later."));
          setState({ isSubmit: false, localUpdate: true });
        } else {
          if (props.newDataPosted) {
            props.newDataPosted(response.data.story);
          }
          props.closePopup("close");
        }
      })
      .catch((err) => {
        alert(props.t("Error uploading story, please try again later."));
        setState({ isSubmit: false, localUpdate: true });
      });
  };
  const getPrivacy = () => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/get-privacy";
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
          setState({
            defaultPrivacy: response.data.privacy,
            privacy: response.data.privacy,
          });
        }
      })
      .catch((err) => {});
  };
  const submitPrivacy = (e) => {
    e.preventDefault();
    setState({
      isSubmit: false,

      settingMenu: false,
      defaultPrivacy: state.privacy,
    });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let url = "/stories/privacy";
    formData.append("privacy", state.privacy);
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
        }
      })
      .catch((err) => {});
  };
  const openSettings = (e) => {
    setState({
      settingMenu: true,
      privacy: state.defaultPrivacy,
    });
  };

  let allowedTypes = props.pageData.levelPermissions["stories.allowed_types"];
  let image = null;
  let video = null;
  let audio = null;
  if (allowedTypes) {
    if (allowedTypes.indexOf("video") > -1) {
      video = true;
    }
    if (allowedTypes.indexOf("music") > -1) {
      audio = true;
    }
    if (allowedTypes.indexOf("image") > -1) {
      image = true;
    }
  }

  let type = state.type;
  let createContentData = null;
  if (type == "image") {
    createContentData = (
      <Image
        {...props}
        openSettings={openSettings}
        isSubmit={state.isSubmit}
        submitForm={submitForm}
        discard={discard}
        imageType={state.imageType}
      />
    );
  } else if (type == "video") {
    createContentData = (
      <MusicVideo
        {...props}
        openSettings={openSettings}
        isSubmit={state.isSubmit}
        submitForm={submitForm}
        discard={discard}
        videoExt={state.videoExt}
        videoType={state.imageType}
      />
    );
  } else if (type == "music") {
    createContentData = (
      <MusicVideo
        {...props}
        openSettings={openSettings}
        isSubmit={state.isSubmit}
        submitForm={submitForm}
        discard={discard}
        musicType={state.imageType}
        musicExt={state.musicExt}
      />
    );
  } else if (type == "text") {
    createContentData = (
      <Text
        {...props}
        defaultDescription={state.textDescription}
        openSettings={openSettings}
        isSubmit={state.isSubmit}
        submitForm={submitForm}
        discard={discard}
      />
    );
  }

  let settings = null;
  if (state.settingMenu) {
    settings = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{props.t("Story Privacy")}</h2>
                <a
                  onClick={(e) => {
                    setState({ settingMenu: false });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <div className="stories_privacy">
                <form
                  className="formFields px-3"
                  method="post"
                  onSubmit={submitPrivacy}
                >
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "public"}
                      onChange={(e) => {
                        setState({
                          privacy: e.target.value,
                        });
                      }}
                      id="public_pr"
                      name="privacy"
                      value="public"
                    />
                    <label className="form-check-label" htmlFor="public_pr">
                      {props.t("Public")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "onlyme"}
                      onChange={(e) => {
                        setState({
                          privacy: e.target.value,
                        });
                      }}
                      id="onlyme_pr"
                      name="privacy"
                      value="onlyme"
                    />
                    <label className="form-check-label" htmlFor="onlyme_pr">
                      {props.t("Only Me")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "follow"}
                      onChange={(e) => {
                        setState({
                          privacy: e.target.value,
                        });
                      }}
                      id="foll_pr"
                      name="privacy"
                      value="follow"
                    />
                    <label className="form-check-label" htmlFor="foll_pr">
                      {props.t("People I Follow")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      checked={state.privacy === "followers"}
                      onChange={(e) => {
                        setState({
                          privacy: e.target.value,
                        });
                      }}
                      id="mefoll_pr"
                      name="privacy"
                      value="followers"
                    />
                    <label className="form-check-label" htmlFor="mefoll_pr">
                      {props.t("People Follow Me")}
                    </label>
                  </div>
                  <div className="input-group">
                    <button type="submit">{props.t("Save")}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let archiveStories = null;
  if (state.archiveStories) {
    archiveStories = (
      <StoryArchive
        {...props}
        closePopup={(e) => {
          e.preventDefault();
          setState({ archiveStories: false });
        }}
      ></StoryArchive>
    );
  }
  let logo = "";
  if (props.pageData.themeMode == "dark") {
    logo =
      props.pageData["imageSuffix"] +
      props.pageData.appSettings["darktheme_logo"];
  } else {
    logo =
      props.pageData["imageSuffix"] +
      props.pageData.appSettings["lightheme_logo"];
  }

  let allowedPhoto = false;
  if (
    parseInt(props.pageData.appSettings["openai_image_system"], 10) == 1 &&
    props.pageData.levelPermissions &&
    parseInt(props.pageData.levelPermissions["openai.imagecreate"], 10) == 1 &&
    parseInt(props.pageData.appSettings.allowOpenAi, 10) == 1
  ) {
    allowedPhoto = true;
  }

  let allowedDescription = false;
  if (
    parseInt(props.pageData.appSettings["openai_description_system"], 10) ==
      1 &&
    props.pageData.levelPermissions &&
    parseInt(props.pageData.levelPermissions["openai.descriptioncreate"], 10) ==
      1 &&
    parseInt(props.pageData.appSettings.allowOpenAi, 10) == 1
  ) {
    allowedDescription = true;
  }
  let descriptionPrice =
  parseFloat(props.pageData.appSettings.openai_description_price) || 0;
  let price = parseFloat(props.pageData.appSettings.openai_image_price) || 0;

  let aiPopup = null;
  if (state.openAiPopup) {
    aiPopup = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt"  style={{maxWidth:"700px"}}>
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{props.t("Create Photo Using AI")}</h2>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setState({ openAiPopup: null });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <OpenAI
                {...props}
                data={state.openAiPopup}
                setValue={(key, value) => {
                  if (key == "storyimage")
                    setState({
                      type: "image",
                      imageType: value,
                    });
                  else {
                    setState({
                      type: "text",
                      textDescription: value,
                    });
                  }
                  setState({ openAiPopup: null });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {aiPopup}
      {settings}
      <div className={`story-details`}>
        <div className="popupHeader">
          <div className="HeaderCloseLogo">
            <a
              className="closeBtn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                props.closePopup(props.fromDirect ? "" : "notClose");
              }}
            >
              <span className="material-icons">close</span>
            </a>
            <div className="HeaderCloseLogo-logo">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  props.closePopup(props.fromDirect ? "" : "notClose");
                }}
              >
                {!props.pageData.appSettings.logo_type || props.pageData.appSettings.logo_type == "0" ? (
                  <img src={logo} className="img-fluid" />
                ) : (
                  <span className="logo-text">
                    {props.pageData.appSettings.logo_text}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>
        <div className="story-sidebar">
          <div className="d-flex align-items-center justify-content-between my-3">
            <h2 className="heading-sdbar"> {props.t("Your Story")} </h2>
            <div className="options">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setState({ archiveStories: true });
                }}
              >
                {" "}
                {props.t("Archive")}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setState({
                    settingMenu: true,
                    privacy: state.defaultPrivacy,
                  });
                }}
              >
                {" "}
                {props.t("Settings")}
              </a>
            </div>
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
              </div>
            </div>
          </div>
        </div>
        <div className="story-content position-relative">
          <div className="storyDetails-contentWrap">
            <div className="createstory-content">
              <div className="box460330">
                {image ? (
                  <React.Fragment>
                    <div
                      className="boxes create-story-photo-box"
                      onClick={(e) => {
                        imageref.current.click();
                      }}
                    >
                      <input
                        className="fileNone"
                        accept="image/*"
                        onChange={changeImage}
                        ref={imageref}
                        type="file"
                      />
                      <div className="icon">
                        <span className="material-icons">insert_photo</span>
                      </div>
                      <div className="name">
                        {props.t("Create a photo story")}
                      </div>
                    </div>
                    {allowedPhoto && (
                      <div
                        className="boxes create-story-photo-box"
                        onClick={(e) => {
                          setState({
                            openAiPopup: {
                              price: price,
                              type: "file",
                              key: "storyimage",
                            },
                          });
                        }}
                      >
                        <div className="icon">
                          <span className="material-icons">insert_photo</span>
                        </div>
                        <div className="name">
                          {props.t("Create a photo using AI")}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ) : null}
                <div
                  className="boxes create-story-text-box"
                  onClick={(e) => {
                    setState({ type: "text" });
                  }}
                >
                  <div className="icon">
                    <span className="material-icons">text_format</span>
                  </div>
                  <div className="name">{props.t("Create a text story")}</div>
                </div>
                {allowedDescription ? (
                  <div
                    className="boxes create-story-text-box"
                    onClick={(e) => {
                      setState({
                        openAiPopup: {
                          price: descriptionPrice,
                          type: "textarea",
                          key: "description",
                        },
                      });
                    }}
                  >
                    <div className="icon">
                      <span className="material-icons">text_format</span>
                    </div>
                    <div className="name">
                      {props.t("Create a text story using AI")}
                    </div>
                  </div>
                ) : null}
                {video ? (
                  <div
                    className="boxes create-story-text-box"
                    onClick={(e) => {
                      videoref.current.click();
                    }}
                  >
                    <input
                      className="fileNone"
                      onChange={changeVideo}
                      accept="video/*"
                      ref={videoref}
                      type="file"
                    />
                    <div className="icon">
                      <span className="material-icons">videocam</span>
                    </div>
                    <div className="name">
                      {props.t("Create a video story")}
                    </div>
                  </div>
                ) : null}
                {audio ? (
                  <div
                    className="boxes create-story-text-box"
                    onClick={(e) => {
                      musicref.current.click();
                    }}
                  >
                    <input
                      className="fileNone"
                      onChange={changeMusic}
                      accept="audio/*"
                      ref={musicref}
                      type="file"
                    />
                    <div className="icon">
                      <span className="material-icons">audiotrack</span>
                    </div>
                    <div className="name">
                      {props.t("Create a audio story")}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {createContentData}
      {archiveStories}
    </React.Fragment>
  );
};

export default Create;
