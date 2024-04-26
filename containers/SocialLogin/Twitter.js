import React, { useReducer, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const TwitterLogin = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  );
  const onButtonClick = (e) => {
    e.preventDefault();
    return getRequestToken();
  };

  const getHeaders = () => {
    const headers = Object.assign({}, props.customHeaders);
    headers["Content-Type"] = "application/json";
    return headers;
  };

  const getRequestToken = () => {
    var popup = openPopup();

    return window
      .fetch(props.requestTokenUrl, {
        method: "POST",
        credentials: props.credentials,
        headers: getHeaders(),
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let authenticationUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}&force_login=${props.forceLogin}`;

        if (props.screenName) {
          authenticationUrl = `${authenticationUrl}&screen_name=${props.screenName}`;
        }

        popup.location = authenticationUrl;
        polling(popup);
      })
      .catch((error) => {
        popup.close();
        return props.onFailure(error);
      });
  };

  const openPopup = () => {
    const w = props.dialogWidth;
    const h = props.dialogHeight;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;

    return window.open(
      "",
      "",
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );
  };

  const polling = (popup) => {
    const polling = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(polling);
        props.onFailure(new Error("Popup has been closed by user"));
      }

      const closeDialog = () => {
        clearInterval(polling);
        popup.close();
      };
      try {
        if (
          !popup.location.hostname.includes("api.twitter.com") &&
          !popup.location.hostname == ""
        ) {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search);
            const oauthToken = query.get("oauth_token");
            const oauthVerifier = query.get("oauth_verifier");

            closeDialog();
            return getOauthToken(oauthVerifier, oauthToken);
          } else {
            closeDialog();
            return props.onFailure(
              new Error(
                "OAuth redirect has occurred but no query or hash parameters were found. " +
                  "They were either not set during the redirect, or were removed—typically by a " +
                  "routing library—before Twitter react component could read it."
              )
            );
          }
        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // A hack to get around same-origin security policy errors in IE.
      }
    }, 500);
  };

  const getOauthToken = (oAuthVerifier, oauthToken) => {
    return window
      .fetch(
        `${props.loginUrl}?oauth_verifier=${oAuthVerifier}&oauth_token=${oauthToken}`,
        {
          method: "POST",
          credentials: props.credentials,
          headers: getHeaders(),
        }
      )
      .then((response) => {
        props.onSuccess(response);
      })
      .catch((error) => {
        return props.onFailure(error);
      });
  };

  const twitterButton = React.createElement(
    props.tag,
    {
      onClick: onButtonClick,
      style: props.style,
      disabled: props.disabled,
      className: props.className,
    },
    props.children
  );
  return twitterButton;
};

TwitterLogin.propTypes = {
  tag: PropTypes.string,
  text: PropTypes.string,
  loginUrl: PropTypes.string.isRequired,
  requestTokenUrl: PropTypes.string.isRequired,
  onFailure: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  dialogWidth: PropTypes.number,
  dialogHeight: PropTypes.number,
  showIcon: PropTypes.bool,
  credentials: PropTypes.oneOf(["omit", "same-origin", "include"]),
  customHeaders: PropTypes.object,
  forceLogin: PropTypes.bool,
  screenName: PropTypes.string,
};

TwitterLogin.defaultProps = {
  tag: "button",
  text: "Sign in with Twitter",
  disabled: false,
  dialogWidth: 600,
  dialogHeight: 400,
  showIcon: true,
  credentials: "same-origin",
  customHeaders: {},
  forceLogin: false,
  screenName: "",
};

export default TwitterLogin;
