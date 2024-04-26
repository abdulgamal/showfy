import { GoogleOAuthProvider } from "@react-oauth/google";
import { appWithTranslation } from "next-i18next";
import Router from "next/router";
import React, { useEffect, useReducer } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import OneSignal from "react-onesignal";
import "react-phone-number-input/style.css";
import { Provider } from "react-redux";
import socketOpen from "socket.io-client";
import axios from "../axios-main";
import SendMessageToApps from "../components/SendMessageToApps/Index";
import config from "../config";
import { AppContext } from '../contexts/AppContext';
import PageComponent from "../hoc/Layout/PageComponent";
import { store } from "../store/index";

const socket = socketOpen(config.actualPath, {
  path: `${config.basePath}socket.io`,
});

const MyApp = ({ Component, pageProps }) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      messageCount:pageProps.pageData && pageProps.pageData.messageCount
      ? pageProps.pageData.messageCount
      : 0,
      pageData: pageProps.pageData,
      levelPermissions:
        pageProps.pageData && pageProps.pageData.levelPermissions
          ? pageProps.pageData.levelPermissions
          : {},
      appSettings:
        pageProps.pageData && pageProps.pageData.appSettings
          ? pageProps.pageData.appSettings
          : {},
    }
  );
  if (!state.appSettings) {
    return "error";
  }
  const updateUserToken = (userId) => {
    if (!userId || userId == "") {
      return;
    }
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (window.localStorage) {
      let oldToken = window.localStorage.getItem("push-token");
      if (oldToken) {
        formData.append("oldToken", oldToken);
      }
      window.localStorage.setItem("push-token", userId);
    }

    let url = `/update-user-push-token`;
    formData.append("token", userId);
    axios
      .post(url, formData, config)
      .then((response) => {})
      .catch((err) => {});
  };
  useEffect(() => {
    if (
      typeof window != "undefined" &&
      pageProps &&
      pageProps.pageData &&
      state.pageData &&
      pageProps.pageData.loggedInUserDetails &&
      state.pageData.loggedInUserDetails !=
        pageProps.pageData.loggedInUserDetails
    ) {
      SendMessageToApps({ props: pageProps, type: "loggedinUser" });
      let oldToken = window.localStorage.getItem("push-token");
      if (oldToken) {
        updateUserToken(oldToken);
      }
    }
    let updateValue = {};
    if (JSON.stringify(pageProps.pageData) != JSON.stringify(state.pageData)) {
      updateValue.pageProps = pageData;
    }
    if (
      pageProps.pageData &&
      pageProps.pageData.appSettings &&
      (JSON.stringify(pageProps.pageData.appSettings) !=
        JSON.stringify(state.appSettings) ||
        JSON.stringify(pageProps.pageData.levelPermissions) !=
          JSON.stringify(state.levelPermissions))
    ) {
      updateValue.levelPermissions =
        pageProps.pageData && pageProps.pageData.levelPermissions
          ? pageProps.pageData.levelPermissions
          : {};
      updateValue.appSettings =
        pageProps.pageData && pageProps.pageData.appSettings
          ? pageProps.pageData.appSettings
          : {};
    }
    if (Object.keys(updateValue).length > 0) {
      setState(updateValue);
    }
  }, [pageProps]);
  useEffect(() => {
    if (pageProps.pageData && pageProps.pageData.fromAppDevice == "ios") {
      window.addEventListener("PTVNativeAppbridge", function (event) {
        const message = event.detail;
        if (message.type === "login") {
          $(".loginRgtrBoxPopup").find("button").eq(0).trigger("click");
          if (
            !pageProps.pageData.loggedInUserDetails ||
            pageProps.pageData.loggedInUserDetails.user_id !=
              pageProps.pageData.loggedInUserDetails.user_id
          ) {
            if (pageProps.pageData.loggedInUserDetails)
              socket.emit("chatJoin", {
                id: pageProps.pageData.loggedInUserDetails.user_id,
              });
            let path = state.previousUrl ? state.previousUrl : Router.asPath;
            if (
              path == "/login" ||
              asPath == "/login" ||
              path == "/signup" ||
              asPath == "/signup"
            ) {
              Router.push("/");
            } else {
              Router.push(path).catch((err) => {
                window.location.href = path;
              });
            }
          }
        }
      });
    }

    // push notifications
    if (
      !pageProps.pageData.fromAPP &&
      pageProps.pageData &&
      pageProps.pageData.appSettings["enable_pushnotification"] == 1 &&
      pageProps.pageData.appSettings["oneSignal_app_id"] != ""
    ) {
      OneSignal.init({
        appId: pageProps.pageData.appSettings["oneSignal_app_id"],
        requiresUserPrivacyConsent: true,
        allowLocalhostAsSecureOrigin: pageProps.pageData.environment == "dev",
        notifyButton: {
          enable: true,
        },
        promptOptions: {
          autoPrompt: true,
        },
      }).then(async () => {});
      OneSignal.User.PushSubscription.addEventListener("change", (event) => {
        if (event.current.token) {
          updateUserToken(event.current.id, event.previous.id);
        }
      });
    }
    if (pageProps.pageData) {
      SendMessageToApps({
        props: pageProps,
        type: "loggedinUser",
        theme: pageProps.pageData.themeMode,
      });
    }
  }, []);

  const setMessageCount = (count) => {
    setState({messageCount:count})
  }
  let messageCount = state.messageCount
  
  let pageData = (
    <AppContext.Provider value={{ messageCount, setMessageCount }}><PageComponent {...pageProps} Component={Component} socket={socket} /></AppContext.Provider>
  );
  {
    pageProps.pageData &&
    pageProps.pageData.appSettings["recaptcha_enable"] == 1
      ? (pageData = (
          <GoogleReCaptchaProvider
            useRecaptchaNet={false}
            // language={pageProps.i18n.language}
            useEnterprise={
              pageProps.pageData.appSettings["recaptcha_enterprise"] == 1
                ? true
                : false
            }
            reCaptchaKey={pageProps.pageData.appSettings["recaptcha_key"]}
            scriptProps={{ async: true, defer: true, appendTo: "head" }}
          >
            {pageData}
          </GoogleReCaptchaProvider>
        ))
      : null;
  }
  return pageProps.pageData && pageProps.pageData.appSettings["gid"] ? (
    <GoogleOAuthProvider clientId={pageProps.pageData.appSettings["gid"]}>
      <Provider store={store}>{pageData}</Provider>
    </GoogleOAuthProvider>
  ) : (
    <Provider store={store}>{pageData}</Provider>
  );
};
export default appWithTranslation(MyApp);
