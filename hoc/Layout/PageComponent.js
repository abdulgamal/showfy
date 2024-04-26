import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React, { useEffect, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SendMessageToApps from "../../components/SendMessageToApps/Index";
import AdsIndex from "../../containers/Ads/Index";
import Footer from "../../containers/Footer/Index";
import Gdpr from "../../containers/Gdpr/Index";
import Header from "../../containers/Header/Index";
import SideFixedMenu from "../../containers/Menu/SideFixedMenu";
import UnsupportedBrowser from "../../containers/UnsupportedBrowser/Index";
import { updateAudioData } from "../../store/reducers/audio";
import { upatePlayerTime, updatePlayerData } from "../../store/reducers/miniplayer";
import { openPlaylist } from "../../store/reducers/playlist";
import { ratingStats } from "../../store/reducers/rating";
import { openReport } from "../../store/reducers/report";
import { changeSearchText, setMenuOpen, setSearchChanged, setSearchClicked, setTheme } from "../../store/reducers/search";
import { openSharePopup } from "../../store/reducers/sharepopup";
import { openToast } from "../../store/reducers/toast";
import WithErrorHandler from "../withErrorHandler/withErrorHandler";
const MiniPlayer = dynamic(() => import("../../containers/Video/MiniPlayer"), {
  ssr: false,
});
const AudioPlayer = dynamic(() => import("../../containers/Audio/Player"), {
  ssr: false,
});
const ChatMessages = dynamic(() => import("../../containers/Messages/Chat"), {
  ssr: false,
});

const PageComponent = (props) => {
  let pageProps = { ...props };
  if(pageProps.pageData && pageProps.pageData.custompageParams){
    pageProps = {...pageProps,...pageProps.pageData.custompageParams}
  }
  const dispatch = useDispatch();
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      chats: [],
      width:
        pageProps.pageData && (pageProps.pageData.fromAPP || pageProps.isMobile)
          ? 990
          : 993,
      levelPermissions: {},
      appSettings: {},
    }
  );
  
  let menuOpen = useSelector((state) => {
    return state.search.menuOpen;
  });
  const menuRef = useRef();
  menuRef.current = menuOpen;

  const chatRef = useRef();
  chatRef.current = state.chats;

  const pagePropsRef = useRef();
  pagePropsRef.current = pageProps.pageData;

  const translateRef = useRef();

  const closeMenu = () => {
    dispatch(setMenuOpen(true));
  };

  const onRouteChangeStart = () => {
    if (!menuRef.current && state.width > 992) dispatch(setMenuOpen(true));
    NProgress.start();
  };
  const onRouteChangeComplete = () => {
    NProgress.done();
    $("body").removeClass("modal-open");
    $("body").css("overflow", "auto");
    $(".modal-backdrop").remove();
  };
  const onRouteChangeError = () => {
    NProgress.done();
  };

  useEffect(() => {
    // const handleRouteChange = (url) => {
    //   if (GA_TRACKING_ID) gtag.pageview(url, GA_TRACKING_ID);
    // };
    Router.events.on("routeChangeStart", onRouteChangeStart);
    Router.events.on("routeChangeError", onRouteChangeError);
    Router.events.on("routeChangeComplete", onRouteChangeComplete);
    // Router.events.on("routeChangeComplete", handleRouteChange);
    // Router.events.on("hashChangeComplete", handleRouteChange);
    return () => {
      Router.events.off("routeChangeStart", onRouteChangeStart);
      Router.events.off("routeChangeError", onRouteChangeError);
      Router.events.off("routeChangeComplete", onRouteChangeComplete);
      //   Router.events.off("routeChangeComplete", handleRouteChange);
      //   Router.events.off("hashChangeComplete", handleRouteChange);
    };
  }, [Router.events]);

  const closeChat = (message_id) => {
    let chats = [...chatRef.current];
    let index = getItemIndex(message_id);
    if (index > -1) {
      chats.splice(index, 1);
      setState({ chats: chats });
    }
  };
  const minimizeChat = (message_id) => {
    let chats = [...chatRef.current];
    let index = getItemIndex(message_id);
    if (index > -1) {
      if (!chats[index].minimize || chats[index].minimize == 0)
        chats[index].minimize = 1;
      else chats[index].minimize = 0;
      setState({ chats: chats });
    }
  };
  const updateWindowDimensions = () => {
    let width = window.innerWidth;
    let chats = [...chatRef.current];
    if (chats.length > 0) {
      if (width < 700) {
        if (chats.length > 2) {
          chats.shift();
          chats.shift();
        } else if (chats.length > 1) {
          chats.shift();
        }
      } else if (width < 1060) {
        if (chats.length > 2) {
          chats.shift();
        }
      }
      setState({ width: window.innerWidth, chats: chats });
    } else if (window.innerWidth != state.width) {
      setState({ width: window.innerWidth });
    }
  };

  useEffect(() => {
    props.socket.on("chatOpen", (socketdata) => {
      let chats = [...chatRef.current];
      let index = getItemIndex(socketdata.message_id);
      if (index > -1) {
        return;
      }
      if (state.width < 700) {
        chats.shift();
      } else if (state.width < 1060) {
        if (chats.length == 2) {
          chats.shift();
        }
      } else {
        if (chats.length == 3) {
          chats.shift();
        }
      }
      chats.push(socketdata);
      setState({ chats: chats });
    });
    props.socket.on("chatMessageCreate", (socketdata) => {
      let chat = socketdata.chat;
      let chats = [...chatRef.current];
      let index = getItemIndex(chat.message_id);
      if (index > -1) {
        return;
      }
      if (state.width < 700) {
        chats.shift();
      } else if (state.width < 1060) {
        if (chats.length == 2) {
          chats.shift();
        }
      } else {
        if (chats.length == 3) {
          chats.shift();
        }
      }
      chats.push(chat);
      setState({ chats: chats });
    });
    props.socket.on("chatDelete", (socketdata) => {
      let id = socketdata.message_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const messages = [...chatRef.current];
        messages.splice(itemIndex, 1);
        setState({ chats: messages });
      }
    });

    // Add event listener
    window.addEventListener("resize", updateWindowDimensions);
    // Call handler right away so state gets updated with initial window size
    updateWindowDimensions();

    const { BroadcastChannel } = require("broadcast-channel");
    const userChannel = new BroadcastChannel("user");
    if (pagePropsRef.current && pagePropsRef.current.logout) {
      userChannel.postMessage({
        payload: {
          type: "LOGOUT",
        },
      });
    }
    userChannel.onmessage = (data) => {
      if (data.payload.type === "LOGIN") {
        if (
          !pagePropsRef.current.loggedInUserDetails ||
          pagePropsRef.current.loggedInUserDetails.user_id !=
          pagePropsRef.current.loggedInUserDetails.user_id
        ) {
          if (pagePropsRef.current.loggedInUserDetails)
            props.socket.emit("chatJoin", {
              id: pagePropsRef.current.loggedInUserDetails.user_id,
            });
          let asPath = Router.asPath;
          if (
            asPath == "/login" ||
            asPath == "/signup"
          ) {
            Router.push("/");
          } else {
            Router.push(asPath);
          }
        }
      } else if (data.payload.type == "LOGOUT") {
        if (pagePropsRef.current.loggedInUserDetails) {
          props.socket.emit("chatLeave", {
            id: pagePropsRef.current.loggedInUserDetails.user_id,
          });
          Router.push("/");
          dispatch(updatePlayerData({relatedVideos:[],playlistVideos:[],currentVideo:null,deleteMessage:"",deleteTitle:"",liveStreamingURL:props.pageData.liveStreamingURL}))
          dispatch(updateAudioData({ audios: [], song_id: 0, pausesong_id: 0 }));
          SendMessageToApps({ props: {pageData:pagePropsRef.current}, type: "loggedOut" });
        }
      }
    };

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const getItemIndex = (item_id) => {
    const chats = [...chatRef.current];
    const itemIndex = chats.findIndex((p) => p["message_id"] == item_id);
    return itemIndex;
  };

  let { isMobile } = pageProps;

  if (!pageProps.pageData) {
    return null;
  }

  if (pageProps.pageData.fromAPP) {
    isMobile = true;
  }

  if (!pageProps.pageData.appSettings) {
    pageProps.pageData.appSettings = appSettings;
    pageProps.pageData.levelPermissions = levelPermissions;
  }

  let pathname = true;
  if (typeof window != "undefined") {
    if (Router.asPath == "/messanger") {
      pathname = false;
    }
  }
  let isIE = state.IEBrowser;
  let fixedHeader = "";
  let disableMarginLeftClass = "";
  if (
    pageProps.pageData.appSettings["fixed_header"] == 1 &&
    state.width > 992
  ) {
    if (!pageProps.pageData.removeFixedMenu) fixedHeader = " fixed-header";
    else fixedHeader = " fixed-header nofixed-header";
    if (pageProps.hideSmallMenu || pageProps.pageData.hideSmallMenu) {
      disableMarginLeftClass = " marginLeft0";
    }
  }
  if (
    pageProps.pageData.appSettings["fixed_header"] == 0 &&
    state.width > 992
  ) {
    fixedHeader = " fixed-layout";
  }
  let fixedMenu = "";
  if (state.width > 992)
    fixedMenu =
      (pageProps.hideSmallMenu || pageProps.pageData.hideSmallMenu
        ? " top-menu"
        : " sidemenu") +
      disableMarginLeftClass +
      (menuOpen ? "" : " sidemenu-opened");

  const generalInfo = pageProps.pageData.pageInfo
    ? pageProps.pageData.pageInfo
    : {};

  const { t,i18n } = useTranslation();
  translateRef.current = t
  pageProps.t = (data,type) => {
    return translateRef.current(data,type);
  };
  pageProps.openToast = (data) => {
    dispatch(openToast(data));
  };
  pageProps.openPlaylist = (data) => {
    dispatch(openPlaylist(data));
  };
  pageProps.setSearchClicked = (data) => {
    dispatch(setSearchClicked(data));
  };
  pageProps.setSearchChanged = (data) => {
    dispatch(setSearchChanged(data));
  };
  pageProps.changeSearchText = (data) => {
    dispatch(changeSearchText(data));
  };
  pageProps.changeLanguage = (data) => {
    i18n.changeLanguage(data)
  }
  pageProps.openSharePopup = (data) => {
    dispatch(openSharePopup(data));
  };
  pageProps.updatePlayerData = (data) => {
    dispatch(updatePlayerData(data));
  };
  pageProps.upatePlayerTime = (data) => {
    dispatch(upatePlayerTime(data));
  };
  pageProps.openReport = (data) => {
    dispatch(openReport(data));
  };
  pageProps.updateAudioData = (data) => {
    dispatch(updateAudioData(data));
  };
  pageProps.ratingStats = (data) => {
    dispatch(ratingStats(data));
  };
  pageProps.setTheme = (data) => {
    dispatch(setTheme(data));
  };
  let pageData = (
    <React.Fragment>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        ></meta>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </Head>
      <React.Fragment>
        {isIE ? <UnsupportedBrowser {...pageProps} /> : null}
        {pageProps.embedVideo ? pageProps.children : null}
        {!pageProps.maintenance &&
        !isIE &&
        !pageProps.pageData.maintanance &&
        !pageProps.embedVideo ? (
          <React.Fragment>
            <Header
              {...pageProps}
              menuOpen={menuOpen}
              layout={state.width > 992 ? "" : "mobile"}
              layoutWidth={state.width}
              socket={props.socket}
            />
          </React.Fragment>
        ) : null}
        {!isIE  ? (
          !pageProps.liveStreaming && !pageProps.embedVideo ? (
            <WithErrorHandler {...pageProps}>
              <div
                className={`main-content${
                  pageProps.pageData.themeType == 2 ? " adv-theme" : ""
                }${fixedMenu}${
                  pageProps.pageData.loggedInUserDetails
                    ? " user-logged-in" + fixedHeader
                    : fixedHeader
                }${state.width > 992 ? "" : " mobile-layout-cnt"}${
                  pageProps.pageData.slideshow ||
                  (pageProps.pageData.videos &&
                    pageProps.pageData.videos.featured)
                    ? " slideshow-enable"
                    : ""
                }${
                  pageProps.pageData.showHomeButtom == 1 ||
                  pageProps.pageData.userProfilePage == 1
                    ? " user-subscription-page"
                    : ""
                }${` ${(generalInfo.type
                  ? generalInfo.type
                  : "no-data"
                ).replace(/_/g, "-")}-cs-page`}`}
              >
                {state.width > 992 ? (
                  <React.Fragment>
                    <div className="sidemenu-overlay" onClick={closeMenu}></div>
                    <SideFixedMenu
                      {...pageProps}
                      socket={props.socket}
                    />
                  </React.Fragment>
                ) : null}
                <div
                  className={`content-wrap${
                    menuOpen && !pageProps.hideSmallMenu && state.width > 992
                      ? " ml100"
                      : menuOpen && pageProps.hideSmallMenu && state.width > 992
                      ? " ml0"
                      : ""
                  }${state.width > 992 ? "" : " mobile-layout"}${
                    pageProps.pageData.showHomeButtom == 1 ||
                    pageProps.pageData.userProfilePage
                      ? " user-subscription-cnt"
                      : ""
                  }`}
                >
                  {pageProps.pageData.appSettings["below_header"] ? (
                    <AdsIndex
                      className={`${
                        pageProps.pageData.hideSmallMenu ? "nopad-ads " : ""
                      }header_advertisement`}
                      paddingTop="90px"
                      ads={pageProps.pageData.appSettings["below_header"]}
                    />
                  ) : null}
                  <props.Component
                    {...pageProps}
                    appViewWidth={state.width}
                    isMobile={isMobile ? 992 : 993}
                    socket={props.socket}
                  />
                </div>
              </div>
            </WithErrorHandler>
          ) : (
            <WithErrorHandler {...pageProps}>
              <div
                className={`ls_contentWrap${
                  state.width > 992 ? "" : " mobile-layout-cnt"
                }${pageProps.embedVideo ? " embed-cnt" : ""}`}
              >
                <div className="ls_mainContent">
                  <props.Component
                    {...pageProps}
                    appViewWidth={state.width}
                    isMobile={isMobile ? 992 : 993}
                    socket={props.socket}
                  />
                </div>
              </div>
            </WithErrorHandler>
          )
        ) : null}
      </React.Fragment>
      <MiniPlayer
        {...pageProps}
        appViewWidth={state.width}
        isMobile={isMobile ? 992 : 993}
        socket={props.socket}
      />
      <AudioPlayer
        {...pageProps}
        appViewWidth={state.width}
        isMobile={isMobile ? 992 : 993}
        socket={props.socket}
      />
      {state.chats.length > 0 && pathname ? (
        <div className={`chat-containers${` ${(generalInfo.type
          ? generalInfo.type
          : "no-data"
        ).replace(/_/g, "-")}-cs-page`}`}>
          {state.chats.map((chat, index) => {
            return (
              <ChatMessages
                appViewWidth={state.width}
                fromSmallChat={true}
                chatIndex={index}
                minimize={chat.minimize}
                minimizeChat={minimizeChat}
                closeChat={closeChat}
                key={chat.message_id}
                {...pageProps}
                {...state.t}
                socket={props.socket}
                id={chat.message_id}
                message={chat}
                chats={[]}
              />
            );
          })}
        </div>
      ) : null}
      {!pageProps.maintenance &&
      !pageProps.embedVideo &&
      !isIE &&
      !pageProps.pageData.maintanance &&
      !pageProps.liveStreaming ? (
        <React.Fragment>
          {pageProps.pageData.appSettings["above_footer"] ? (
            <AdsIndex
              className="footer_advertisement"
              paddingTop="20px"
              ads={pageProps.pageData.appSettings["above_footer"]}
            />
          ) : null}
          <Footer
            {...pageProps}
            layout={state.width > 992 ? "" : "mobile"}
            socket={props.socket}
          />
          {!pageProps.pageData.fromAPP ? (
            <Gdpr
              {...pageProps}
              layout={state.width > 992 ? "" : "mobile"}
              socket={props.socket}
            />
          ) : null}
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );

  return pageData;
};

export default PageComponent;
