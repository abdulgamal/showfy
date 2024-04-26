import React, { useReducer, useEffect, useRef } from "react";
import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import Subscribe from "../User/Follow";
const SocialShare = dynamic(() => import("../SocialShare/Index"), {
  ssr: false,
});
import LoadMore from "../LoadMore/Index";
import axios from "../../axios-orders";
import Translate from "../../components/Translate/Index";
// if(typeof window != "undefined"){
//     require("jquery-ui/ui/widgets/draggable");
// }
import AdsIndex from "../Ads/Index";
import ShortNumber from "short-number";

import Link from "../../components/Link/index";

import CensorWord from "../CensoredWords/Index";
import Support from "../Support/Index";
import dynamic from "next/dynamic";
import swal from "sweetalert";

const imageCompression = dynamic(() => import("browser-image-compression"), {
  ssr: false,
});
const OpenAI = dynamic(() => import("../../containers/OpenAI"), {
  ssr: false,
});
const CoverImages = dynamic(
  () => import("../../containers/OpenAI/CoverImages"),
  {
    ssr: false,
  }
);

const Cover = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      item: props.item,
      type: props.type,
      loadingCover: false,
      loadingImage: false,
      reposition: false,
      repositionDisplay: "none",
      showReposition: false,
      processing: false,
      percentCompleted: 0,
    }
  );

  useEffect(() => {
    if (props.item.showCoverReposition) {
      setState({
        item: props.item,
        reposition: true,
        loadingCover: false,
        loadingImage: false,
        processing: false,
        percentCompleted: 0,
      });
    } else if (props.item != state.item) {
      setState({
        item: props.item,
        loadingCover: false,
        loadingImage: false,
        processing: false,
        percentCompleted: 0,
      });
    } else {
      setState({ loadingCover: false, loadingImage: false });
    }
    if (
      props.item.showCoverReposition &&
      props.item.showCoverReposition != state.item.showCoverReposition
    ) {
      if (typeof $ != "undefined") {
        uiMinJS(".coverphotoUsercnt img").draggable({ disabled: false });
        $(".cover-image").css("height", "auto");
      }
    }
  }, [props.item.showCoverReposition, props.item]);

  const imageSize = (url) => {
    const img = document.createElement("img");

    const promise = new Promise((resolve, reject) => {
      img.onload = () => {
        // Natural size is the actual image size regardless of rendering.
        // The 'normal' `width`/`height` are for the **rendered** size.
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Resolve promise with the width and height
        resolve({ width, height });
      };

      // Reject promise on error
      img.onerror = reject;
    });

    // Setting the source makes it start downloading and eventually call `onload`
    img.src = props.pageData.imageSuffix + url;

    return promise;
  };

  const uploadCover = async (picture) => {
    let aiImage = null;
    let compressedFile;
    if (typeof picture === "string") {
      aiImage = picture;
    } else {
      var value = picture.target.value;
      var ext = value.substring(value.lastIndexOf(".") + 1).toLowerCase();
      if (
        picture.target.files &&
        picture.target.files[0] &&
        (ext === "png" ||
          ext === "webp" ||
          ext === "jpeg" ||
          ext === "jpg" ||
          ext === "PNG" ||
          ext === "webp" ||
          ext === "JPEG" ||
          ext === "JPG" ||
          ext === "gif" ||
          ext === "GIF")
      ) {
      } else {
        return false;
      }

      const imageFile = picture.target.files[0];

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      compressedFile = picture.target.files[0];
      if (ext != "gif" && ext != "GIF") {
        try {
          compressedFile = await imageCompression(imageFile, options);
        } catch (error) {}
      }
    }
    let formData = new FormData();
    const config = {
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
    // setState({loadingCover:true})
    let url = "";
    if (state.item.channel_id) {
      formData.append("channel_id", state.item.channel_id);
      if (!aiImage) formData.append("image", compressedFile, value);
      else formData.append("aiImage", aiImage);
      url = `/channels/upload-cover`;
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          swal(
            "Error",
            Translate(props, response.data.error[0].message),
            "error"
          );
          setState({ percentCompleted: 0, processing: false });
        } else {
          //setState({percentCompleted:0,processing:true})
        }
      })
      .catch((err) => {
        setState({
          loadingCover: false,
          percentCompleted: 0,
          processing: false,
        });
      });
  };
  const uploadImage = async (picture) => {
    let aiImage = null;
    let compressedFile;
    if (typeof picture === "string") {
      aiImage = picture;
    } else {
      var value = picture.target.value;
      var ext = value.substring(value.lastIndexOf(".") + 1).toLowerCase();
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
      } else {
        return false;
      }

      const imageFile = picture.target.files[0];

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
       compressedFile = picture.target.files[0];
      if (ext != "gif" && ext != "GIF") {
        try {
          compressedFile = await imageCompression(imageFile, options);
        } catch (error) {}
      }
    }

    // setState({loadingImage:true})
    let formData = new FormData();
    const config = {
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
    let url = "";
    if (state.item.channel_id) {
      formData.append("channel_id", state.item.channel_id);
      if (!aiImage) formData.append("image", compressedFile, value);
      else formData.append("aiImage", aiImage);
      url = `/channels/upload-image`;
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          swal(
            "Error",
            Translate(props, response.data.error[0].message),
            "error"
          );
          setState({ percentCompleted: 0, processing: false });
        } else {
          //setState({percentCompleted:0,processing:true})
        }
      })
      .catch((err) => {
        setState({
          loadingCover: false,
          percentCompleted: 0,
          processing: false,
        });
      });
  };
  const openReport = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      props.openReport({
        status: true,
        id: state.item.custom_url,
        type: "channels",
      });
    }
  };

  useEffect(() => {
    if (window.innerWidth > 800) {
      setState({ repositionDisplay: "block", reposition: state.reposition });
    } else {
      setState({ reposition: false });
    }
    window.addEventListener("resize", updateDimensions);
    uiMinJS(".coverphotoUsercnt img").draggable({
      disabled: state.reposition,
      scroll: false,
      axis: "y",
      cursor: "-webkit-grab",
      drag: function (event, ui) {
        let y1 = $(".header-info-wrap").height();
        let y2 = $(".coverphotoUsercnt").find("img").height();
        if (ui.position.top >= 0) {
          ui.position.top = 0;
        } else if (ui.position.top <= y1 - y2) {
          ui.position.top = y1 - y2;
        }
      },
      stop: function (event, ui) {
        setState({ position: ui.position.top });
      },
    });
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const updateDimensions = () => {
    if (window.innerWidth > 800) {
      setState({ repositionDisplay: "block" });
    } else {
      setState({ repositionDisplay: "none" });
    }
  };
  const repositionCover = async (e) => {
    e.preventDefault();
    setState({ reposition: true });
    setTimeout(async () => {
      uiMinJS(".coverphotoUsercnt img").draggable({ disabled: false });
      const imageDimensions = await imageSize(state.item.cover);
      $(".cover-image").css("height", imageDimensions.height + "px");
    }, 200);
  };
  const repositionCancel = (e) => {
    e.preventDefault();
    $(".cover-image").css("top", "");
    $(".cover-image").css("height", "100%");
    setState({ reposition: false });
    uiMinJS(".coverphotoUsercnt img").draggable({ disabled: true });
  };
  const repositionSave = (e) => {
    e.preventDefault();
    uiMinJS(".coverphotoUsercnt img").draggable({ disabled: true });
    $(".cover-image").css("top", "");
    $(".cover-image").css("height", "100%");
    let formData = new FormData();
    const config = {
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
    setState({ reposition: false, showReposition: true });
    let url = "";
    formData.append("screenWidth", $(".coverphotoUser").width());
    formData.append("channel_id", state.item.channel_id);
    formData.append("position", state.position);
    url = `/channels/reposition-cover?containerHeight=${$(
      ".header-info-wrap"
    ).height()}`;
    axios
      .post(url, formData, config)
      .then((response) => {
        setState({ processing: true });
      })
      .catch((err) => {
        setState({ loadingCover: false, processing: false });
      });
  };

  let coverImage = state.item.cover;
  let mainPhoto = state.item.image;
  if (!state.reposition && state.item.cover_crop) {
    let image = state.item.cover_crop;
    const splitVal = image.split("/");
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
    } else {
      coverImage = props.pageData.imageSuffix + image;
    }
  }
  if (coverImage) {
    const splitVal = coverImage.split("/");
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
    } else {
      coverImage = props.pageData.imageSuffix + coverImage;
    }
  }
  if (mainPhoto) {
    const splitVal = mainPhoto.split("/");
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
    } else {
      mainPhoto = props.pageData.imageSuffix + mainPhoto;
    }
  }

  let gif = false;
  if (
    coverImage &&
    (coverImage.indexOf(".gif") > -1 || coverImage.indexOf(".GIF") > -1)
  ) {
    gif = true;
  }

  const coverref = React.createRef();
  const imageref = React.createRef();

  let allowAICreate = false;
  let customTags = {};
  if (
    parseInt(props.pageData.appSettings["openai_image_system"], 10) == 1 &&
    props.pageData.levelPermissions &&
    parseInt(props.pageData.levelPermissions["openai.imagecreate"], 10) == 1 &&
    parseInt(props.pageData.appSettings.allowOpenAi, 10) == 1
  ) {
    allowAICreate = true;
    customTags = {
      "data-bs-toggle": "dropdown",
      "aria-expanded": "false",
    };
  }
  let isCoverAvtar = false;
  if (props.pageData.appSettings.coverAIEnabled == 1) {
    isCoverAvtar = true;
    customTags = {
      "data-bs-toggle": "dropdown",
      "aria-expanded": "false",
    };
  }
  let isImageAvtar = false;
  if (props.pageData.appSettings.avtarAIEnabled == 1) {
    isImageAvtar = true;
    customTags = {
      "data-bs-toggle": "dropdown",
      "aria-expanded": "false",
    };
  }

  let price = parseFloat(props.pageData.appSettings.openai_image_price) || 0;

  let aiPopup = null;
  if (state.openAiPopup) {
    aiPopup = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt" style={{ maxWidth: "700px" }}>
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Create Content Using AI")}</h2>
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
                data={state.openAiPopup}
                {...props}
                setValue={(key, value) => {
                  if (key == "cover") {
                    uploadCover(value);
                  } else {
                    uploadImage(value);
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
  let chooseCoverImages = null;
  if (state.chooseCoverImages) {
    chooseCoverImages = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments" style={{ overflow: "inherit" }}>
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Select Image")}</h2>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setState({ chooseCoverImages: null });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <CoverImages
                data={{
                  type: state.chooseCoverImages,
                  key: state.chooseCoverImages,
                }}
                {...props}
                setValue={(key, value) => {
                  if (key == "cover") {
                    uploadCover(props.pageData.imageSuffix + value);
                  } else {
                    uploadImage(props.pageData.imageSuffix + value);
                  }
                  setState({ chooseCoverImages: null });
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
      {chooseCoverImages}
      <div
        className={`${
          props.pageData.themeType != 2
            ? "header-info-wrap container"
            : "header-info-wrap subscription-urser"
        } `}
      >
        <div className="coverphotoUser coverphotoUsercnt">
          <img className="cover-image" src={coverImage} />
          {state.loadingCover ? (
            <div className="cover-loading">
              <LoadMore loading={true} />
            </div>
          ) : null}
          {state.item.canEdit ? (
            <React.Fragment>
              {/* <div className="box-overlay"></div> */}
              {!state.reposition ? (
                <React.Fragment>
                  <div className="TitleRightDropdown editCoverImg dropstart">
                    {!allowAICreate && !isCoverAvtar && (
                      <input
                        className="fileNone"
                        accept="image/*"
                        onChange={uploadCover}
                        ref={coverref}
                        type="file"
                      />
                    )}
                    <a
                      className="link"
                      {...customTags}
                      href="#"
                      title={Translate(props, "Edit cover photo")}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!allowAICreate && !isCoverAvtar) coverref.current.click();
                      }}
                    >
                      <span
                        className="material-icons"
                        data-icon="camera_alt"
                      ></span>
                    </a>
                    {allowAICreate ? (
                      <ul className="dropdown-menu edit-options">
                        <li>
                          <input
                            className="fileNone"
                            accept="image/*"
                            onChange={uploadCover}
                            ref={coverref}
                            type="file"
                          />
                          <a
                            className="a-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              coverref.current.click();
                            }}
                            style={{
                              lineHeight: "20px",
                              color: "var(--Textcolor-default)",
                            }}
                          >
                            {props.t("Upload New")}
                          </a>
                        </li>
                        <li>
                          <a
                            className="a-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setState({
                                openAiPopup: {
                                  price: price,
                                  type: "file",
                                  key: "cover",
                                },
                              });
                            }}
                            style={{
                              lineHeight: "20px",
                              color: "var(--Textcolor-default)",
                            }}
                          >
                            {props.t("Generate Using AI")}
                          </a>
                        </li>
                        {props.pageData.appSettings.coverAIEnabled == 1 && (
                          <li>
                            <a
                              className="a-link"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setState({ chooseCoverImages: "cover" });
                              }}
                              style={{
                                lineHeight: "20px",
                                color: "var(--Textcolor-default)",
                              }}
                            >
                              {props.t("Choose Cover Images")}
                            </a>
                          </li>
                        )}
                      </ul>
                    ) : isCoverAvtar ? (
                      <ul className="dropdown-menu edit-options">
                        <li>
                          <input
                            className="fileNone"
                            accept="image/*"
                            onChange={uploadCover}
                            ref={coverref}
                            type="file"
                          />
                          <a
                            className="a-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              coverref.current.click();
                            }}
                            style={{
                              lineHeight: "20px",
                              color: "var(--Textcolor-default)",
                            }}
                          >
                            {props.t("Upload New")}
                          </a>
                        </li>
                        {props.pageData.appSettings.coverAIEnabled == 1 && (
                          <li>
                            <a
                              className="a-link"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setState({ chooseCoverImages: "cover" });
                              }}
                              style={{
                                lineHeight: "20px",
                                color: "var(--Textcolor-default)",
                              }}
                            >
                              {props.t("Choose Cover Images")}
                            </a>
                          </li>
                        )}
                      </ul>
                    ) : null}
                  </div>
                  {state.repositionDisplay == "block" &&
                  state.item.channelcover &&
                  !gif ? (
                    <div className="editCoverImg resizeCoverImg">
                      <a
                        href="#"
                        title={Translate(props, "Reposition cover photo")}
                        onClick={repositionCover}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M21,15H23V17H21V15M21,11H23V13H21V11M23,19H21V21C22,21 23,20 23,19M13,3H15V5H13V3M21,7H23V9H21V7M21,3V5H23C23,4 22,3 21,3M1,7H3V9H1V7M17,3H19V5H17V3M17,19H19V21H17V19M3,3C2,3 1,4 1,5H3V3M9,3H11V5H9V3M5,3H7V5H5V3M1,11V19A2,2 0 0,0 3,21H15V11H1M3,19L5.5,15.79L7.29,17.94L9.79,14.72L13,19H3Z"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  ) : null}
                  {state.percentCompleted > 0 || state.processing ? (
                    <div className="upload-progressbar">
                      {state.percentCompleted < 100 && !state.processing ? (
                        <React.Fragment>
                          <div className="percentage-100">
                            {state.percentCompleted}%
                          </div>
                          <div className="progressbar-cnt">
                            <div
                              className="progressbar"
                              style={{ width: state.percentCompleted + "%" }}
                            ></div>
                          </div>
                        </React.Fragment>
                      ) : null}
                      {state.processing ? (
                        <div className="imageprocess">
                          <svg
                            width="60px"
                            viewBox="0 0 100 100"
                            height="60px"
                            dangerouslySetInnerHTML={{
                              __html:
                                '<circle cx="84" cy="50" r="2.56936" fill="#e91d2a"><animate attributeName="r" repeatCount="indefinite" dur="0.5434782608695652s" calcMode="spline" keyTimes="0;1" values="8;0" keySplines="0 0.5 0.5 1" begin="0s"></animate><animate attributeName="fill" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="discrete" keyTimes="0;0.25;0.5;0.75;1" begin="0s"></animate></circle><circle cx="73.0786" cy="50" r="8" fill="#e91d2a"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="0s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="0s"></animate></circle><circle cx="16" cy="50" r="0" fill="#e91d2a"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.5434782608695652s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.5434782608695652s"></animate></circle><circle cx="16" cy="50" r="5.43026" fill="#e91d2a"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.0869565217391304s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.0869565217391304s"></animate></circle><circle cx="39.0786" cy="50" r="8" fill="#e91d2a"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.6304347826086956s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.6304347826086956s"></animate></circle>',
                            }}
                          ></svg>
                          {props.t(
                            "Image is processing, this may take few minutes."
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div className="cover-reposition-cnt" align="center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M21,15H23V17H21V15M21,11H23V13H21V11M23,19H21V21C22,21 23,20 23,19M13,3H15V5H13V3M21,7H23V9H21V7M21,3V5H23C23,4 22,3 21,3M1,7H3V9H1V7M17,3H19V5H17V3M17,19H19V21H17V19M3,3C2,3 1,4 1,5H3V3M9,3H11V5H9V3M5,3H7V5H5V3M1,11V19A2,2 0 0,0 3,21H15V11H1M3,19L5.5,15.79L7.29,17.94L9.79,14.72L13,19H3Z"
                      ></path>
                    </svg>
                    {Translate(props, "Drag to reposition cover")}
                  </div>
                  <div className="editCoverImg">
                    <a
                      href="#"
                      title={Translate(props, "Cancel reposition")}
                      onClick={repositionCancel}
                    >
                      <span className="material-icons" data-icon="clear"></span>
                    </a>
                  </div>
                  <div className="editCoverImg resizeCoverImg">
                    <a
                      href="#"
                      title={Translate(props, "Save reposition")}
                      onClick={repositionSave}
                    >
                      <span className="material-icons" data-icon="check"></span>
                    </a>
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : null}
        </div>
      </div>
      {props.pageData.themeType == 2 ? (
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="userInfo-block-wrap">
                <div className="userInfo-block-content">
                  <div className="userinfoLeft">
                    <div className="userphoto-profile-img">
                      <img src={mainPhoto} alt={state.item.title} />
                      {state.loadingImage ? (
                        <div className="cover-loading">
                          <LoadMore className="main-photo" loading={true} />
                        </div>
                      ) : null}
                      {state.item.canEdit ? (
                        <div className="TitleRightDropdown editCoverImg dropend">
                          {!allowAICreate && !isImageAvtar && (
                            <input
                              className="fileNone"
                              accept="image/*"
                              onChange={uploadImage}
                              ref={imageref}
                              type="file"
                            />
                          )}
                          <span
                            className="editProfImg link"
                            href="#"
                            {...customTags}
                            title={Translate(props, "Edit profile photo")}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (!allowAICreate && !isImageAvtar) imageref.current.click();
                            }}
                          >
                            <span
                              className="material-icons"
                              data-icon="edit"
                            ></span>
                          </span>
                          {allowAICreate ? (
                            <ul className="dropdown-menu edit-options">
                              <li>
                                <input
                                  className="fileNone"
                                  accept="image/*"
                                  onChange={uploadImage}
                                  ref={imageref}
                                  type="file"
                                />
                                <a
                                  className="a-link"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    imageref.current.click();
                                  }}
                                  style={{ lineHeight: "20px" }}
                                >
                                  {props.t("Upload New")}
                                </a>
                              </li>
                              <li>
                                <a
                                  className="a-link"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setState({
                                      openAiPopup: {
                                        price: price,
                                        type: "file",
                                        key: "image",
                                      },
                                    });
                                  }}
                                  style={{ lineHeight: "20px" }}
                                >
                                  {props.t("Generate Using AI")}
                                </a>
                              </li>
                              {props.pageData.appSettings.avtarAIEnabled ==
                                1 && (
                                <li>
                                  <a
                                    className="a-link"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setState({ chooseCoverImages: "image" });
                                    }}
                                    style={{ lineHeight: "20px" }}
                                  >
                                    {props.t("Choose Avtar Images")}
                                  </a>
                                </li>
                              )}
                            </ul>
                          ) : isImageAvtar ? (
                            <ul className="dropdown-menu edit-options">
                              <li>
                                <input
                                  className="fileNone"
                                  accept="image/*"
                                  onChange={uploadImage}
                                  ref={imageref}
                                  type="file"
                                />
                                <a
                                  className="a-link"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    imageref.current.click();
                                  }}
                                  style={{ lineHeight: "20px" }}
                                >
                                  {props.t("Upload New")}
                                </a>
                              </li>

                              {props.pageData.appSettings.avtarAIEnabled ==
                                1 && (
                                <li>
                                  <a
                                    className="a-link"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setState({ chooseCoverImages: "image" });
                                    }}
                                    style={{ lineHeight: "20px" }}
                                  >
                                    {props.t("Choose Avtar Images")}
                                  </a>
                                </li>
                              )}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="user-profile-title">
                      <h4>
                        <CensorWord {...props} text={state.item.title} />{" "}
                        {state.item.verified ? (
                          <span
                            className="verifiedUser"
                            title={Translate(props, "verified")}
                          >
                            <span
                              className="material-icons"
                              data-icon="check"
                            ></span>
                          </span>
                        ) : null}
                      </h4>
                      <div className="ChannelMoreinfo">
                        {props.pageData.appSettings["channel_featured"] == 1 &&
                        state.item.is_featured == 1 ? (
                          <span
                            className="lbl-Featured"
                            title={Translate(props, "Featured Channel")}
                          >
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
                        ) : null}
                        {props.pageData.appSettings["channel_sponsored"] == 1 &&
                        state.item.is_sponsored == 1 ? (
                          <span
                            className="lbl-Sponsored"
                            title={Translate(props, "Sponsored Channel")}
                          >
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
                        ) : null}
                        {props.pageData.appSettings["channel_hot"] == 1 &&
                        state.item.is_hot == 1 ? (
                          <span
                            className="lbl-Hot"
                            title={Translate(props, "Hot Channel")}
                          >
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
                        ) : null}
                      </div>
                      <div className="actionbtn" style={{ display: "none" }}>
                        {`${ShortNumber(
                          state.item.view_count ? state.item.view_count : 0
                        )}`}{" "}
                        {props.t("view_count", {
                          count: state.item.view_count
                            ? state.item.view_count
                            : 0,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="user_followed">
                    <div className="follow-cnt">
                      {state.item.approve == 1 ? (
                        <div className="channel_subscribe">
                          {props.pageData.appSettings["channel_support"] == 1 &&
                          parseFloat(state.item.channel_subscription_amount) >
                            0 ? (
                            <Support
                              {...props}
                              item={state.item}
                              item_type="channel"
                              item_id={state.item.channel_id}
                            />
                          ) : null}
                          <Subscribe
                            button={true}
                            fromView={true}
                            {...props}
                            title={
                              state.item.follower_id
                                ? props.t("Subscribed")
                                : props.t("Subscribe")
                            }
                            follow_count={state.item.follow_count}
                            user={state.item}
                            type={"channels"}
                            id={props.id}
                          />
                          {`${ShortNumber(
                            props.follow_count ? props.follow_count : 0
                          )}`}{" "}
                          {props.t("subscribe_count", {
                            count: state.item.follow_count,
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="LikeDislikeWrap">
                    <ul className="LikeDislikeList">
                      {props.pageData.appSettings[`${"channel_like"}`] == 1 &&
                      state.item.approve == 1 ? (
                        <li>
                          <Like
                            {...props}
                            icon={true}
                            like_count={state.item.like_count}
                            item={state.item}
                            type={state.type}
                            id={props.id}
                          />
                        </li>
                      ) : null}
                      {props.pageData.appSettings[`${"channel_dislike"}`] ==
                        1 && state.item.approve == 1 ? (
                        <li>
                          <Dislike
                            {...props}
                            icon={true}
                            dislike_count={state.item.dislike_count}
                            item={state.item}
                            type={state.type}
                            id={props.id}
                          />
                        </li>
                      ) : null}

                      {props.pageData.appSettings[`${"channel_favourite"}`] ==
                        1 && state.item.approve == 1 ? (
                        <li>
                          <Favourite
                            {...props}
                            icon={true}
                            favourite_count={state.item.favourite_count}
                            item={state.item}
                            type={state.type}
                            id={props.id}
                          />
                        </li>
                      ) : null}

                      {state.item.approve == 1 ? (
                        <SocialShare
                          {...props}
                          hideTitle={true}
                          tags={state.item.tags}
                          url={`${props.url}`}
                          title={CensorWord("fn", props, state.item.title)}
                          imageSuffix={props.pageData.imageSuffix}
                          media={state.item.image}
                        />
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
                            {state.item.canEdit ? (
                              <li>
                                <Link
                                  href="/create-channel"
                                  customParam={`id=${state.item.custom_url}`}
                                  as={`/create-channel/${state.item.custom_url}`}
                                >
                                  <a
                                    href={`/create-channel/${state.item.custom_url}`}
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
                            {state.item.canDelete ? (
                              <li>
                                <a onClick={props.deleteChannel} href="#">
                                  <span
                                    className="material-icons"
                                    data-icon="delete"
                                  ></span>
                                  {Translate(props, "Delete")}
                                </a>
                              </li>
                            ) : null}
                            {state.item.approve == 1 && !state.item.canEdit ? (
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
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-md-12 position-relative">
              <div className="channelInfo-wrap">
                <div className="channel-profile-img">
                  <img src={mainPhoto} alt={state.item.title} />
                  {state.loadingImage ? (
                    <div className="cover-loading">
                      <LoadMore className="main-photo" loading={true} />
                    </div>
                  ) : null}
                  {state.item.canEdit ? (
                    <div className="TitleRightDropdown editCoverImg dropend">
                      {!allowAICreate && !isImageAvtar && (
                        <input
                          className="fileNone"
                          accept="image/*"
                          onChange={uploadImage}
                          ref={imageref}
                          type="file"
                        />
                      )}
                      <span
                        className="editProfImg link"
                        href="#"
                        {...customTags}
                        title={Translate(props, "Edit profile photo")}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!allowAICreate) imageref.current.click();
                        }}
                      >
                        <span
                          className="material-icons"
                          data-icon="edit"
                        ></span>
                      </span>
                      {allowAICreate ? (
                        <ul className="dropdown-menu edit-options">
                          <li>
                            <input
                              className="fileNone"
                              accept="image/*"
                              onChange={uploadImage}
                              ref={imageref}
                              type="file"
                            />
                            <a
                              className="a-link"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                imageref.current.click();
                              }}
                              style={{ lineHeight: "20px" }}
                            >
                              {props.t("Upload New")}
                            </a>
                          </li>
                          <li>
                            <a
                              className="a-link"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setState({
                                  openAiPopup: {
                                    price: price,
                                    type: "file",
                                    key: "image",
                                  },
                                });
                              }}
                              style={{ lineHeight: "20px" }}
                            >
                              {props.t("Generate Using AI")}
                            </a>
                          </li>
                          {props.pageData.appSettings.avtarAIEnabled == 1 && (
                            <li>
                              <a
                                className="a-link"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setState({ chooseCoverImages: "image" });
                                }}
                                style={{ lineHeight: "20px" }}
                              >
                                {props.t("Choose Avtar Images")}
                              </a>
                            </li>
                          )}
                        </ul>
                      ) : isImageAvtar ? (
                        <ul className="dropdown-menu edit-options">
                          <li>
                            <input
                              className="fileNone"
                              accept="image/*"
                              onChange={uploadImage}
                              ref={imageref}
                              type="file"
                            />
                            <a
                              className="a-link"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                imageref.current.click();
                              }}
                              style={{ lineHeight: "20px" }}
                            >
                              {props.t("Upload New")}
                            </a>
                          </li>
                          {props.pageData.appSettings.avtarAIEnabled == 1 && (
                            <li>
                              <a
                                className="a-link"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setState({ chooseCoverImages: "image" });
                                }}
                                style={{ lineHeight: "20px" }}
                              >
                                {props.t("Choose Avtar Images")}
                              </a>
                            </li>
                          )}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="channel-profile-title">
                  <h4>
                    <CensorWord {...props} text={state.item.title} />{" "}
                    {state.item.verified ? (
                      <span
                        className="verifiedUser"
                        title={Translate(props, "verified")}
                      >
                        <span
                          className="material-icons"
                          data-icon="check"
                        ></span>
                      </span>
                    ) : null}
                  </h4>
                  <div className="ChannelMoreinfo">
                    {props.pageData.appSettings["channel_featured"] == 1 &&
                    state.item.is_featured == 1 ? (
                      <span
                        className="lbl-Featured"
                        title={Translate(props, "Featured Channel")}
                      >
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
                    ) : null}
                    {props.pageData.appSettings["channel_sponsored"] == 1 &&
                    state.item.is_sponsored == 1 ? (
                      <span
                        className="lbl-Sponsored"
                        title={Translate(props, "Sponsored Channel")}
                      >
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
                    ) : null}
                    {props.pageData.appSettings["channel_hot"] == 1 &&
                    state.item.is_hot == 1 ? (
                      <span
                        className="lbl-Hot"
                        title={Translate(props, "Hot Channel")}
                      >
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
                    ) : null}
                  </div>
                </div>

                {state.item.approve == 1 ? (
                  <div className="channel_subscribe">
                    {props.pageData.appSettings["channel_support"] == 1 &&
                    parseFloat(state.item.channel_subscription_amount) > 0 ? (
                      <Support
                        {...props}
                        item={state.item}
                        item_type="channel"
                        item_id={state.item.channel_id}
                      />
                    ) : null}
                    <Subscribe
                      button={true}
                      fromView={true}
                      {...props}
                      title={
                        state.item.follower_id
                          ? props.t("Subscribed")
                          : props.t("Subscribe")
                      }
                      follow_count={state.item.follow_count}
                      user={state.item}
                      type={"channels"}
                      id={props.id}
                    />
                    {`${ShortNumber(
                      props.follow_count ? props.follow_count : 0
                    )}`}{" "}
                    {props.t("subscribe_count", {
                      count: state.item.follow_count,
                    })}
                  </div>
                ) : null}

                <div className="LikeDislikeWrap">
                  <ul className="LikeDislikeList">
                    {props.pageData.appSettings[`${"channel_like"}`] == 1 &&
                    state.item.approve == 1 ? (
                      <li>
                        <Like
                          {...props}
                          icon={true}
                          like_count={state.item.like_count}
                          item={state.item}
                          type={state.type}
                          id={props.id}
                        />
                      </li>
                    ) : null}
                    {props.pageData.appSettings[`${"channel_dislike"}`] == 1 &&
                    state.item.approve == 1 ? (
                      <li>
                        <Dislike
                          {...props}
                          icon={true}
                          dislike_count={state.item.dislike_count}
                          item={state.item}
                          type={state.type}
                          id={props.id}
                        />
                      </li>
                    ) : null}

                    {props.pageData.appSettings[`${"channel_favourite"}`] ==
                      1 && state.item.approve == 1 ? (
                      <li>
                        <Favourite
                          {...props}
                          icon={true}
                          favourite_count={state.item.favourite_count}
                          item={state.item}
                          type={state.type}
                          id={props.id}
                        />
                      </li>
                    ) : null}

                    {state.item.approve == 1 ? (
                      <SocialShare
                        {...props}
                        hideTitle={true}
                        tags={state.item.tags}
                        url={`${props.url}`}
                        title={CensorWord("fn", props, state.item.title)}
                        imageSuffix={props.pageData.imageSuffix}
                        media={state.item.image}
                      />
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
                          {state.item.canEdit ? (
                            <li>
                              <Link
                                href="/create-channel"
                                customParam={`id=${state.item.custom_url}`}
                                as={`/create-channel/${state.item.custom_url}`}
                              >
                                <a
                                  href={`/create-channel/${state.item.custom_url}`}
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
                          {state.item.canDelete ? (
                            <li>
                              <a onClick={props.deleteChannel} href="#">
                                <span
                                  className="material-icons"
                                  data-icon="delete"
                                ></span>
                                {Translate(props, "Delete")}
                              </a>
                            </li>
                          ) : null}
                          {state.item.approve == 1 && !state.item.canEdit ? (
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
          </div>
        </div>
      )}
      {props.pageData.appSettings["below_cover"] ? (
        <AdsIndex
          paddingTop="20px"
          className="below_cover"
          ads={props.pageData.appSettings["below_cover"]}
        />
      ) : null}
      <style jsx>
        {`
          .header-info-wrap .coverphotoUser .editCoverImg a.a-link {
            text-align: left;
          }
          .TitleRightDropdown .edit-options.show {
            min-width: 200px;
          }
          .TitleRightDropdown .edit-options.show li a {
            align-items: flex-start;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default Cover;
