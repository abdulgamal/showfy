import React, { useReducer, useEffect, useRef } from "react";

const Text = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      storiesBackground:
        props.pageData.storiesBackground &&
        props.pageData.storiesBackground.length > 0
          ? props.pageData.storiesBackground
          : [],
      selectedStoryImage:
        props.pageData.storiesBackground &&
        props.pageData.storiesBackground.length > 0
          ? props.pageData.storiesBackground[0].attachment_id
          : 0,
      textValue: props.defaultDescription ?? "",
      seemoreValue: "",
      textColor: "#ffffff",
      isSubmit: props.isSubmit,
      font: "clean",
    }
  );
  useEffect(() => {
    if (props.isSubmit != state.isSubmit) {
      setState({ isSubmit: props.isSubmit });
    }
  }, []);

  const getImagePath = () => {
    let index = getAttachment(state.selectedStoryImage);
    if (index > -1) {
      let attachment = state.storiesBackground[index];
      return props.pageData.imageSuffix + attachment.file;
    }
    return "";
  };
  const getAttachment = (id) => {
    const attachments = [...state.storiesBackground];
    const index = attachments.findIndex((p) => p.attachment_id == id);
    return index;
  };
  const validateStory = () => {
    if (state.isSubmit) {
      return;
    }
    if (!state.textValue) {
      alert(props.t("Please select story text."));
      return;
    }
    setState({  isSubmit: true });
    let formData = new FormData();
    let url = "/stories/create/text";
    formData.append("text", state.textValue);
    formData.append("seemore", state.seemoreValue);
    formData.append("textColor", state.textColor);
    formData.append("background", state.selectedStoryImage);
    formData.append("font", state.font);
    props.submitForm(formData, url);
  };

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
                <textarea
                  className="storyTextarea form-control"
                  rows="4"
                  placeholder={props.t("Start Typing")}
                  onChange={(e) => {
                    setState({ textValue: e.target.value });
                  }}
                  value={state.textValue}
                ></textarea>
              </div>

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
              {state.isFont ? (
                <div className="storyFont-wrap mt-3">
                  <select
                    className="form-control"
                    value={state.font}
                    onChange={(e) => {
                      setState({
                        
                        font: e.target.value,
                      });
                    }}
                  >
                    <option value="clean">{props.t("Clean")}</option>
                    <option value="simple">{props.t("Simple")}</option>
                    <option value="casual">{props.t("Casual")}</option>
                    <option value="fancy">{props.t("Fancy")}</option>
                    <option value="headline">{props.t("Headline")}</option>
                  </select>
                </div>
              ) : null}
              <div className="storyFont-wrap mt-3">
                <div className="title">{props.t("Text color")}</div>
                <div className="storyBgApply">
                  <input
                    type="color"
                    value={state.textColor}
                    onChange={(e) => {
                      setState({
                        
                        textColor: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="storyBgimg-wrap mt-3">
                <div className="title">{props.t("Backgrounds")}</div>
                <div className="storyBgApply">
                  {state.storiesBackground.map((story) => {
                    return (
                      <div
                        key={story.attachment_id}
                        className={`storyBgSelect${
                          state.selectedStoryImage == story.attachment_id
                            ? " active"
                            : ""
                        }`}
                        onClick={(e) => {
                          setState({
                            
                            selectedStoryImage: story.attachment_id,
                          });
                        }}
                      >
                        <div className="imgbg">
                          <img src={props.pageData.imageSuffix + story.file} />
                        </div>
                      </div>
                    );
                  })}
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
                <div className="storyPreview-title">{props.t("Preview")}</div>
                <div className="storyPreview-conent flex-column">
                  <div className="storyDetails-cntent">
                    <div className="imageBox">
                      <img className="img-fluid" src={getImagePath()} />
                    </div>
                    <div className="storyText-Content">
                      <div className="storyText-innr">
                        <div
                          className="textShow fontset"
                          style={{ color: state.textColor }}
                        >
                          {state.textValue != ""
                            ? state.textValue
                            : props.t("Start Typing")}
                        </div>
                      </div>
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

export default Text;
