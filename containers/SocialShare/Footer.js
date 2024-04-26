import React, { useReducer } from "react";
import Links from "./Links";
import config from "../../config";
import CensorWord from "../CensoredWords/Index";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      ...props.shareData,
    }
  );
  const closeEditPopup = () => {
    props.openSharePopup({status:false});
  };
  const onClickCopy = (value, e) => {
    e.preventDefault();
    var textField = document.createElement("textarea");
    textField.innerText = value;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    setState({ copied: true });
    var _ = this;
    setTimeout(() => {
      setState({ copied: false });
    }, 2000);
  };
  let isS3 = true;

  let shareUrl = config.app_server + state.url;
  const title = state.title;
  if (props.pageData.loggedInUserDetails) {
    shareUrl = shareUrl + "?ref=" + props.pageData.loggedInUserDetails.user_id;
  }

  let media = state.media;
  if (
    props.pageData.livestreamingtype == 0 &&
    state.media &&
    state.media.indexOf(`${props.pageData.streamingAppName}/previews`) > 0
  ) {
    if (props.pageData.liveStreamingCDNURL) {
      media =
        props.pageData.liveStreamingCDNURL +
        state.media.replace(`/LiveApp`, "").replace(`/WebRTCAppEE`, "");
    } else
      media = props.pageData.liveStreamingServerURL + ":5443" + state.media;
  }
  if (state.media) {
    const splitVal = media.split("/");
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
      isS3 = false;
    }
  }
  media = (isS3 ? state.imageSuffix : "") + media;
  const emailTitle = title;
  const emailBody = "Email Body";
  return (
    <div className="popup_wrapper_cnt">
      <div className="popup_cnt">
        <div className="comments">
          <div className="VideoDetails-commentWrap">
            <div className="popup_wrapper_cnt_header">
              <h2>{props.t("Share")}</h2>
              <a onClick={closeEditPopup} className="_close">
                <i></i>
              </a>
            </div>
            <div className="shareVdoInfo">
              <div className="thumb">
                <img className="" src={media} />
              </div>
              <div className="name">
                <h3>{<CensorWord {...props} text={state.title} />}</h3>
                <div className="share-input">
                  <input
                    type="text"
                    className="form-control"
                    value={shareUrl}
                    readOnly
                  />
                  <a href="#" onClick={(e) => onClickCopy(shareUrl, e)}>
                    {props.t("Copy")}
                  </a>
                </div>
                {state.copied ? (
                  <p className="success">{props.t("Copied!")}</p>
                ) : null}
              </div>
            </div>
            <Links
              tags={state.tags}
              countItems="all"
              url={shareUrl}
              title={title}
              media={media}
              emailTitle={emailTitle}
              emailBody={emailBody}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
