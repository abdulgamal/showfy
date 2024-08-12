import Router from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../axios-orders";
import Link from "../../components/Link";
import SendMessageToApps from "../../components/SendMessageToApps/Index";
import Translate from "../../components/Translate/Index";
import SiteModeChange from "../../containers/Sitemode/Index";
import { AppContext } from "../../contexts/AppContext";
import {
  changeSearchText,
  setMenuOpen,
  setSearchChanged,
  setSearchClicked,
} from "../../store/reducers/search";
import CreateButtons from "../Header/CreateButtons";
import CurrencyButtons from "../Header/CurrencyButtons";
import Notifications from "../Header/Notifications";
import SettingMenus from "../Header/SettingMenus";

const FixedMenu = (props) => {
  const { messageCount } = React.useContext(AppContext);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      search: props.pageData.searchTitleText
        ? props.pageData.searchTitleText
        : "",
      path: typeof window != "undefined" ? Router.asPath : "",
      opendMenu: null,
      type: "",
      loggedInUserDetails: props.pageData.loggedInUserDetails,
      style: "none",
      loading: true,
      notifications: [],
      menuStyle: "",
      menuOpened: false,
    }
  );
  let menuOpen = useSelector((state) => {
    return state.search.menuOpen;
  });

  const dispatch = useDispatch();
  let dropRef = useRef(null);
  let searchRef = useRef(null);
  let searchTableRef = useRef(null);
  let dropSettingsRef = useRef(null);
  let dropNotificationRef = useRef(null);
  let currencyRef = useRef(null);

  const setNotificationWrapperRef = (node) => {
    dropNotificationRef.current = node;
  };
  const setCurrencyWrapperRef = (node) => {
    currencyRef.current = node;
  };
  const setSettingsWrapperRef = (node) => {
    dropSettingsRef.current = node;
  };
  const setCreateButtonsWrapperRef = (node) => {
    dropRef.current = node;
  };

  useEffect(() => {
    if (props.mobileMenu) {
      if (state.style == "block") $("body").addClass("menu_open");
      else $("body").removeClass("menu_open");
    }
  }, [state.style]);

  const openToggle = (type, e) => {
    e.preventDefault();
    let style = state.style;
    if (type != state.type) style = "none";
    if (type == "notifications") {
      if ($(e.target).hasClass("notclosenotification")) {
        return;
      }
      if (style == "none") {
        markAllRead(0, "");
      }
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "notifications" : "",
      });
    } else if (type == "settings") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "settings" : "",
      });
    } else if (type == "createbuttons") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "createbuttons" : "",
      });
    } else if (type == "createcurrency") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "createcurrency" : "",
      });
    } else if (type == "search") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "search" : "",
      });
    } else if (type == "searchTable") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "search" : "",
      });
    }
  };
  const handleClickOutside = (e) => {
    let style = "block";
    if (state.type && e.target && !$(e.target).hasClass("parent")) {
      if (state.type == "notifications") {
        if (
          dropNotificationRef.current &&
          !dropNotificationRef.current.contains(e.target)
        ) {
          if (
            !$(e.target).hasClass("notclosenotification") &&
            !$(e.target).hasClass("parent")
          )
            style = "none";
        } else if (
          e.target &&
          !$(e.target).hasClass("notclosenotification") &&
          !$(e.target).hasClass("parent")
        ) {
          style = "none";
        } else if (!e.target) {
          style = "none";
        }
      } else if (state.type == "settings") {
        if (
          dropSettingsRef.current &&
          !dropSettingsRef.current.contains(e.target)
        ) {
          if (!$(e.target).hasClass("notclose")) style = "none";
        } else if (
          e.target &&
          e.target.id != "sitedarkmode" &&
          e.target.id != "sitedarkmodelabel"
        ) {
          style = "none";
        }
      } else if (state.type == "createbuttons") {
        if (dropRef.current && !dropRef.current.contains(e.target)) {
          if (!$(e.target).hasClass("notclosecreate")) style = "none";
        } else if (e.target) {
          style = "none";
        }
      } else if (state.type == "createcurrency") {
        if (currencyRef.current && !currencyRef.current.contains(e.target)) {
          if (!$(e.target).hasClass("notclosecreate")) style = "none";
        } else if (e.target) {
          style = "none";
        }
      } else if (state.type == "search") {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
          style = "none";
        } else if (
          searchTableRef.current &&
          !searchTableRef.current.contains(e.target)
        ) {
          style = "none";
        }
      }
      if (style == "none") {
        setState({ type: "", style: "none" });
        $("body").removeClass("menu_open");
      }
    } else if (
      e.target &&
      !$(e.target).hasClass("menu-bar") &&
      !$(e.target).hasClass("dropdown-toggle")
    ) {
      if (state.menuStyle == " show") {
        setState({ menuStyle: "" });
        $("body").removeClass("menu_open");
      }
    }
  };

  useEffect(() => {
    if (!state.type) return;
    window.addEventListener("click", handleClickOutside, false);
    return () => window.removeEventListener("click", handleClickOutside, false);
  }, [state.type]);

  useEffect(() => {
    if (
      props.pageData.searchTitleText &&
      props.pageData.searchTitleText != state.search
    ) {
      setState({
        search: props.pageData.searchTitleText
          ? props.pageData.searchTitleText
          : "",
        style: false,
      });
    }
  }, [props.pageData.searchTitleText]);

  useEffect(() => {
    if (
      JSON.stringify(props.pageData.loggedInUserDetails) !=
      JSON.stringify(state.loggedInUserDetails)
    ) {
      setState({
        notifications: [],
        loading: false,
        loggedInUserDetails: props.pageData.loggedInUserDetails,
      });
    }
    if (
      props.pageData.loggedInUserDetails &&
      JSON.stringify(props.pageData.loggedInUserDetails) !=
        JSON.stringify(state.loggedInUserDetails)
    ) {
      loadMoreContent(true);
    }
  }, [props.pageData]);

  useEffect(() => {
    if (!props.mobileMenu) {
      $("body").removeClass("menu_open");
    } else if (state.type) {
      $("body").addClass("menu_open");
    }
  }, [props.pageData]);

  const markAllRead = () => {
    const formData = new FormData();

    setState({ unread: 0 });
    let url = "/notifications/read";
    formData.append("allread", 1);
    axios
      .post(url, formData)
      .then((response) => {})
      .catch((err) => {});
  };
  const loadMoreContent = (firstLoaded) => {
    const formData = new FormData();
    let url = "/notifications";
    if (!firstLoaded) {
      formData.append(
        "id",
        state.notifications[state.notifications.length - 1].notification_id
      );
    }
    axios
      .post(url, formData)
      .then((response) => {
        if (response.data.error) {
          setState({ loading: false });
        } else {
          try {
            SendMessageToApps({
              props: props,
              type: "loggedinUser",
              theme: props.pageData.themeMode,
              currentUrl: null,
              notifications: response.data.unread,
            });
            setState({
              loading: false,
              notifications: firstLoaded
                ? response.data.notifications
                : [...state.notifications, ...response.data.notifications],
              unread: response.data.unread,
              pagging: response.data.pagging,
            });
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch((err) => {
        setState({ loading: false });
      });
  };
  useEffect(() => {
    props.socket.on("notifications", (data) => {
      if (props.pageData && props.pageData.loggedInUserDetails) {
        if (data.owner_id == props.pageData.loggedInUserDetails.user_id) {
          SendMessageToApps({
            props: props,
            type: "loggedinUser",
            theme: props.pageData.themeMode,
            currentUrl: null,
            notifications: state.unread + 1,
          });
          setState({
            notifications: [data.notification, ...state.notifications],
            unread: state.unread + 1,
          });
        }
      }
    });
    props.socket.on("deleteNotifications", (data) => {
      let notification_id = data.notification_id;
      let owner_id = data.owner_id;
      if (props.pageData && props.pageData.loggedInUserDetails) {
        if (owner_id == props.pageData.loggedInUserDetails.user_id) {
          let index = getIndex(notification_id);
          if (index > -1) {
            const notifications = [...state.notifications];
            notifications.splice(index, 1);
            setState({ notifications: notifications });
          }
        }
      }
    });
    if (props.pageData.loggedInUserDetails) {
      loadMoreContent(true);
    }

    //Menu
    (function ($) {
      var defaults = {
        sm: 540,
        md: 720,
        lg: 960,
        xl: 1140,
        navbar_expand: "lg",
      };
      $.fn.bootnavbar = function () {
        var screen_width = $(document).width();
        if (screen_width >= defaults.lg) {
          $(this)
            .find(".dropdownmenu")
            .hover(
              function () {
                $(this).addClass("show");
                $(this)
                  .find(".dropdown-menu")
                  .first()
                  .addClass("show")
                  .addClass("animated fadeIn")
                  .one(
                    "animationend oAnimationEnd mozAnimationEnd webkitAnimationEnd",
                    function () {
                      $(this).removeClass("animated fadeIn");
                    }
                  );
              },
              function () {
                $(this).removeClass("show");
                $(this).find(".dropdown-menu").first().removeClass("show");
              }
            );
        }
        $(".dropdown-menu a.dropdown-toggle").on("click", function (e) {
          if (!$(this).next().hasClass("show")) {
            $(this)
              .parents(".dropdown-menu")
              .first()
              .find(".show")
              .addClass("show");
          }
          var $subMenu = $(this).next(".dropdown-menu");
          $subMenu.toggleClass("show");
          $(this)
            .parents("li.nav-item.dropdown.show")
            .on("hidden.bs.dropdown", function (e) {
              $(".dropdown-submenu .show").addClass("show");
            });
          // return false;
        });
      };
    })($);
    $(function () {
      $("#main_navbar").bootnavbar();
    });
  }, []);

  const markUnread = (notification_id, e) => {
    const formData = new FormData();
    let notifications = [];
    state.notifications.forEach((result) => {
      if (notification_id > 0) {
        if (result.notification_id == notification_id) {
          result.is_read = result.is_read == 1 ? 0 : 1;
        }
      } else {
        result.is_read = 1;
      }
      notifications.push(result);
    });
    SendMessageToApps({
      props: props,
      type: "loggedinUser",
      theme: props.pageData.themeMode,
      currentUrl: null,
      notifications: state.unread - 1,
    });
    setState({ notifications: notifications });
    let url = "/notifications/read";
    if (notification_id > 0) {
      formData.append("id", notification_id);
    }
    axios
      .post(url, formData)
      .then((response) => {})
      .catch((err) => {});
  };
  const deleteNotification = (notification_id, e) => {
    let index = getIndex(notification_id);
    if (index > -1 && notification_id > 0) {
      const formData = new FormData();
      const notifications = [...state.notifications];
      notifications.splice(index, 1);
      setState({ notifications: notifications });
      let url = "/notifications/delete";
      if (notification_id > 0) {
        formData.append("id", notification_id);
      }
      axios
        .post(url, formData)
        .then((response) => {})
        .catch((err) => {});
    }
  };
  const getIndex = (id) => {
    const notifications = [...state.notifications];
    const Index = notifications.findIndex((p) => p.notification_id == id);
    return Index;
  };

  const search = (e) => {
    e.preventDefault();
    if (!state.search) return;
    setState({ type: "", style: "none" });
    const currentPath = Router.asPath;
    if (currentPath == "/search") {
      dispatch(setSearchChanged(true));
      dispatch(changeSearchText(state.search));
    } else {
      Router.push(`/search?h=${state.search}`);
    }
  };

  const showHideMenu = (e) => {
    dispatch(setMenuOpen(!menuOpen));
  };
  const searchClickedFn = (e) => {
    if (props.pageData.levelPermissions["member.site_public_access"] == 1) {
      return;
    }
    if (Router.asPath.indexOf("/search/") < 0) {
      dispatch(setSearchClicked(true));
    }
  };
  // render() {
  if (!props.pageData) {
    return null;
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
  return (
    <header
      id="header"
      className={`${
        !props.pageData.removeFixedMenu ? "fixed-top" : "nofixed-top"
      }`}
    >
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="top-header pl-md-3 pr-md-3">
              <div className="left-side">
                <div className="menu-icon" onClick={showHideMenu}>
                  <span className="material-icons" data-icon="menu"></span>
                </div>
                <div className="logo">
                  <Link href="/">
                    <a>
                      {!props.pageData.appSettings.logo_type ||
                      props.pageData.appSettings.logo_type == "0" ? (
                        <img src={logo} className="img-fluid" />
                      ) : (
                        <span className="logo-text">
                          {props.pageData.appSettings.logo_text}
                        </span>
                      )}
                    </a>
                  </Link>
                </div>
              </div>
              <div className="head-search">
                <div className="search-box">
                  <input
                    type="text"
                    name="search"
                    onFocus={searchClickedFn}
                    onChange={(e) => {
                      setState({ search: e.target.value });
                    }}
                    placeholder={Translate(props, "Search")}
                  />
                  <button onClick={search.bind(this)}>
                    <span className="material-icons" data-icon="search"></span>
                  </button>
                </div>
              </div>
              <div className="rightTopList right-side">
                {!props.pageData.loggedInUserDetails ? (
                  <div className="rightTopList">
                    <ul className="custmenuRight logged-out">
                      <CurrencyButtons
                        {...props}
                        type="website"
                        style={
                          state.type == "createcurrency" ? state.style : "none"
                        }
                        openToggle={openToggle}
                        setCurrencyWrapperRef={setCurrencyWrapperRef}
                      />
                      <li
                        className={
                          !props.mobileMenu
                            ? `nav-item dropdown${
                                state.type == "settings" &&
                                state.style == "block"
                                  ? " active"
                                  : ""
                              }`
                            : `dropdown MobDropdownNav${
                                state.type == "settings" &&
                                state.style == "block"
                                  ? " active"
                                  : ""
                              }`
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <a
                          className={
                            !props.mobileMenu
                              ? "parent nav-link notclose usepicHead logged-in-cnt"
                              : "parent loggedUer notclose usepicHead logged-in-cnt"
                          }
                          onClick={(e) => openToggle("settings", e)}
                          style={{ cursor: "pointer" }}
                          href="#"
                          role="button"
                        >
                          <span
                            className="material-icons notclose parent"
                            data-icon="account_circle"
                          ></span>
                          <span
                            className="material-icons notclose parent"
                            data-icon="arrow_drop_down"
                          ></span>
                        </a>
                        <ul
                          className="dropdown-menu dropdown-menu-right iconMenuList"
                          ref={setSettingsWrapperRef}
                          style={{
                            display:
                              state.type == "settings" ? state.style : "none",
                          }}
                        >
                          <span className="dropdown-menu-arrow"></span>

                          {!props.loginButtonHide ? (
                            props.redirectLogin ? (
                              <li>
                                <Link href="/login">
                                  <a
                                    className="dropdown-item iconmenu"
                                    id="loginFormPopup"
                                  >
                                    {Translate(props, "Login")}
                                  </a>
                                </Link>
                              </li>
                            ) : (
                              <li>
                                <a
                                  className="dropdown-item iconmenu"
                                  id="loginFormPopup"
                                  data-bs-toggle="modal"
                                  data-bs-target="#loginpop"
                                  href="/login"
                                >
                                  {Translate(props, "Login")}
                                </a>
                              </li>
                            )
                          ) : null}
                          {!props.signButtonHide &&
                          props.pageData.appSettings["member_registeration"] ==
                            1 ? (
                            props.redirectLogin ? (
                              <li>
                                <Link href="/signup">
                                  <a className="dropdown-item iconmenu">
                                    {Translate(props, "Sign Up")}
                                  </a>
                                </Link>
                              </li>
                            ) : (
                              <li>
                                <a
                                  href="/signup"
                                  className="dropdown-item iconmenu"
                                  data-bs-toggle="modal"
                                  data-bs-target="#registerpop"
                                >
                                  {Translate(props, "Sign Up")}
                                </a>
                              </li>
                            )
                          ) : null}
                          <SiteModeChange {...props} iconLast={true} />
                        </ul>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <ul className="loggedin">
                    <CurrencyButtons
                      {...props}
                      type="website"
                      style={
                        state.type == "createcurrency" ? state.style : "none"
                      }
                      openToggle={openToggle}
                      setCurrencyWrapperRef={setCurrencyWrapperRef}
                    />

                    <CreateButtons
                      type="website"
                      {...props}
                      style={
                        state.type == "createbuttons" ? state.style : "none"
                      }
                      openToggle={openToggle}
                      setCreateButtonsWrapperRef={setCreateButtonsWrapperRef}
                    />
                    {props.pageData.loggedInUserDetails ? (
                      <React.Fragment>
                        {props.pageData.levelPermissions &&
                        parseInt(
                          props.pageData.levelPermissions[
                            "member.allow_messages"
                          ]
                        ) == 1 ? (
                          <li className="nav-item dropdown main">
                            <Link href="/messanger" as="/messages">
                              <a className="nav-link bg-cnt">
                                <span className="noti-cnt">
                                  <span
                                    className="material-icons-outlined parent"
                                    data-icon="chat"
                                  ></span>
                                  {messageCount > 0 && (
                                    <span className="notifNmbr parent">
                                      {messageCount > 10 ? "10+" : messageCount}
                                    </span>
                                  )}
                                </span>
                              </a>
                            </Link>
                          </li>
                        ) : null}
                        <Notifications
                          type="website"
                          {...props}
                          loading={state.loading}
                          notifications={state.notifications}
                          deleteNotification={deleteNotification}
                          markUnread={markUnread}
                          pagging={state.pagging}
                          loadMoreContent={loadMoreContent}
                          unread={state.unread}
                          style={
                            state.type == "notifications" ? state.style : "none"
                          }
                          openToggle={openToggle}
                          setNotificationWrapperRef={setNotificationWrapperRef}
                        />
                        <SettingMenus
                          type="website"
                          {...props}
                          style={
                            state.type == "settings" ? state.style : "none"
                          }
                          openToggle={openToggle}
                          setSettingsWrapperRef={setSettingsWrapperRef}
                        />
                      </React.Fragment>
                    ) : null}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // }
};

export default FixedMenu;
