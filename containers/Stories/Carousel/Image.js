import React, { useReducer, useEffect, useRef } from "react";
import "tui-image-editor/dist/tui-image-editor.css";
import ImageEditor from "@toast-ui/react-image-editor";

const Text = (props) => {
  const editorRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      width: window.innerWidth,
      height: window.inneHeight,
      imageType: props.imageType,
      isSubmit: props.isSubmit,
      seemoreValue: "",
    }
  );

  const resizeEditor = () => {
    let imageEditor = editorRef.current.getInstance();
    imageEditor.ui.resizeEditor({
      imageSize: {
        oldWidth: state.width,
        oldHeight: state.height,
        newWidth: window.innerWidth,
        newHeight: window.innerHeight,
      },
      uiSize: { width: window.innerWidth, height: window.innerHeight },
    });

    imageEditor.ui.resizeEditor();
  };
  const whiteTheme = () => {
    var whiteTheme = {
      "common.bi.image":
        "https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png",
      "common.bisize.width": "251px",
      "common.bisize.height": "21px",
      "common.backgroundImage": "./img/bg.png",
      "common.backgroundColor": "#fff",
      "common.border": "1px solid #c1c1c1",

      // header
      "header.backgroundImage": "none",
      "header.backgroundColor": "transparent",
      "header.border": "0px",

      // load button
      "loadButton.backgroundColor": "#fff",
      "loadButton.border": "1px solid #ddd",
      "loadButton.color": "#222",
      "loadButton.fontFamily": "'Noto Sans', sans-serif",
      "loadButton.fontSize": "12px",

      // download button
      "downloadButton.backgroundColor": "#fdba3b",
      "downloadButton.border": "1px solid #fdba3b",
      "downloadButton.color": "#fff",
      "downloadButton.fontFamily": "'Noto Sans', sans-serif",
      "downloadButton.fontSize": "12px",

      // main icons
      "menu.normalIcon.color": "#8a8a8a",
      "menu.activeIcon.color": "#555555",
      "menu.disabledIcon.color": "#434343",
      "menu.hoverIcon.color": "#e9e9e9",
      "menu.iconSize.width": "24px",
      "menu.iconSize.height": "24px",

      // submenu icons
      "submenu.normalIcon.color": "#8a8a8a",
      "submenu.activeIcon.color": "#555555",
      "submenu.iconSize.width": "32px",
      "submenu.iconSize.height": "32px",

      // submenu primary color
      "submenu.backgroundColor": "transparent",
      "submenu.partition.color": "#e5e5e5",

      // submenu labels
      "submenu.normalLabel.color": "#858585",
      "submenu.normalLabel.fontWeight": "normal",
      "submenu.activeLabel.color": "#000",
      "submenu.activeLabel.fontWeight": "normal",

      // checkbox style
      "checkbox.border": "1px solid #ccc",
      "checkbox.backgroundColor": "#fff",

      // rango style
      "range.pointer.color": "#333",
      "range.bar.color": "#ccc",
      "range.subbar.color": "#606060",

      "range.disabledPointer.color": "#d3d3d3",
      "range.disabledBar.color": "rgba(85,85,85,0.06)",
      "range.disabledSubbar.color": "rgba(51,51,51,0.2)",

      "range.value.color": "#000",
      "range.value.fontWeight": "normal",
      "range.value.fontSize": "11px",
      "range.value.border": "0",
      "range.value.backgroundColor": "#f5f5f5",
      "range.title.color": "#000",
      "range.title.fontWeight": "lighter",
    };

    return whiteTheme;
  };
  const darkTheme = () => {
    var blackTheme = {
      "common.bi.image":
        "https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png",
      "common.bisize.width": "251px",
      "common.bisize.height": "21px",
      "common.backgroundImage": "none",
      "common.backgroundColor": "#1e1e1e",
      "common.border": "0px",

      // header
      "header.backgroundImage": "none",
      "header.backgroundColor": "transparent",
      "header.border": "0px",

      // load button
      "loadButton.backgroundColor": "#fff",
      "loadButton.border": "1px solid #ddd",
      "loadButton.color": "#222",
      "loadButton.fontFamily": "'Noto Sans', sans-serif",
      "loadButton.fontSize": "12px",

      // download button
      "downloadButton.backgroundColor": "#fdba3b",
      "downloadButton.border": "1px solid #fdba3b",
      "downloadButton.color": "#fff",
      "downloadButton.fontFamily": "'Noto Sans', sans-serif",
      "downloadButton.fontSize": "12px",

      // main icons
      "menu.normalIcon.color": "#8a8a8a",
      "menu.activeIcon.color": "#555555",
      "menu.disabledIcon.color": "#434343",
      "menu.hoverIcon.color": "#e9e9e9",
      "menu.iconSize.width": "24px",
      "menu.iconSize.height": "24px",

      // submenu icons
      "submenu.normalIcon.color": "#8a8a8a",
      "submenu.activeIcon.color": "#e9e9e9",
      "submenu.iconSize.width": "32px",
      "submenu.iconSize.height": "32px",

      // submenu primary color
      "submenu.backgroundColor": "#1e1e1e",
      "submenu.partition.color": "#3c3c3c",

      // submenu labels
      "submenu.normalLabel.color": "#8a8a8a",
      "submenu.normalLabel.fontWeight": "lighter",
      "submenu.activeLabel.color": "#fff",
      "submenu.activeLabel.fontWeight": "lighter",

      // checkbox style
      "checkbox.border": "0px",
      "checkbox.backgroundColor": "#fff",

      // range style
      "range.pointer.color": "#fff",
      "range.bar.color": "#666",
      "range.subbar.color": "#d1d1d1",

      "range.disabledPointer.color": "#414141",
      "range.disabledBar.color": "#282828",
      "range.disabledSubbar.color": "#414141",

      "range.value.color": "#fff",
      "range.value.fontWeight": "lighter",
      "range.value.fontSize": "11px",
      "range.value.border": "1px solid #353535",
      "range.value.backgroundColor": "#151515",
      "range.title.color": "#fff",
      "range.title.fontWeight": "lighter",

      // colorpicker style
      "colorpicker.button.border": "1px solid #1e1e1e",
      "colorpicker.title.color": "#fff",
    };
    return blackTheme;
  };
  const handleClickButton = () => {
    const editorInstance = editorRef.current.getInstance();

    editorInstance.flipX();
  };
  const saveButton = (editor) => {
    const dataURL = editor.toDataURL();
    window.open().document.body.innerHTML = `<img src='${dataURL}'>`;
  };
  const validateStory = async () => {
    if (state.isSubmit) {
      return;
    }
    const editor = editorRef.current.getInstance();
    const dataURL = await editor.toDataURL();
    if (!dataURL) {
      alert(props.t("Please select image to upload."));
      return;
    }
    setState({  isSubmit: true });
    let formData = new FormData();

    fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "filename.png");
        let url = "/stories/create/image";
        formData.append("image", file);
        formData.append("seemore", state.seemoreValue);
        props.submitForm(formData, url);
      });
  };
  var createObjectURL =
    (URL || webkitURL || {}).createObjectURL || function () {};

  let theme = "white";

  if (props.pageData.themeMode == "dark") {
    theme = "dark";
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
                  <div className="storyDetails-cntent storyDetails-cntent-image">
                    <div className="imageBox">
                      <ImageEditor
                        ref={editorRef}
                        saveImage={saveButton}
                        includeUI={{
                          loadImage: {
                            path: typeof state.imageType == "string" ? state.imageType : ( state.imageType
                              ? createObjectURL(state.imageType)  : ""),
                            name: "SampleImage",
                          },
                          theme: theme == "white" ? whiteTheme() : darkTheme(),
                          //menu: ['shape', 'filter'],
                          //initMenu: 'filter',
                          uiSize: {
                            //    width: '600px',
                            //    height: '700px',
                          },
                          menuBarPosition: "bottom",
                        }}
                        cssMaxHeight={500}
                        cssMaxWidth={1400}
                        selectionStyle={{
                          cornerSize: 20,
                          rotatingPointOffset: 70,
                        }}
                        usageStatistics={true}
                      />
                    </div>
                  </div>
                  {/* <div className="cropImgStory-wrap">
                                            <div className="lbelMsg">Select photo to crop and rotate</div>
                                        </div> */}
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
