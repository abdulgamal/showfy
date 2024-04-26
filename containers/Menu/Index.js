import Router from "next/router";
import React, { useEffect, useReducer, useRef } from "react";
import axios from "../../axios-orders";
import Link from "../../components/Link";
import Translate from "../../components/Translate/Index";
import SideFixedMenu from "../../containers/Menu/SideFixedMenu";
import SiteModeChange from "../../containers/Sitemode/Index";
import { AppContext } from "../../contexts/AppContext";
import CreateButtons from "../Header/CreateButtons";
import CreateButtonsItems from "../Header/CreateButtonsItem";
import CurrencyButtons from "../Header/CurrencyButtons";
import NotificationItems from "../Header/NotificationItems";
import Notifications from "../Header/Notifications";
import SettingMenus from "../Header/SettingMenus";
import SettingsItems from "../Header/SettingsMenuItems";

const Menu = (props) => {
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
      style: "none",
      loading: true,
      notifications: [],
      menuStyle: "",
      showBackbutton: false,
    }
  );

  let dropMenuButtons = useRef(null);
  let dropNotificationRef = useRef();
  let dropSettingsRef = useRef();
  let dropRef = useRef();
  let searchRef = useRef();
  let searchTableRef = useRef();
  let currencyRef = useRef();
  const stateRef = useRef();

  stateRef.current = state;
  const setMenuButtons = (node) => {
    dropMenuButtons.current = node;
  };
  const setNotificationWrapperRef = (node) => {
    dropNotificationRef.current = node;
  };
  const setSettingsWrapperRef = (node) => {
    dropSettingsRef.current = node;
  };
  const setCreateButtonsWrapperRef = (node) => {
    dropRef.current = node;
  };
  const setCurrencyWrapperRef = (node) => {
    currencyRef.current = node;
  };
  const setSearchRef = (node) => {
    searchRef.current = node;
  };
  const setTableSearch = (node) => {
    searchTableRef = node;
  };

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
  }, [props]);

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      // do componentDidMount logic
      mounted.current = true;
    } else {
      if (!props.mobileMenu) {
        $("body").removeClass("menu_open");
      } else if (state.type && state.type != "search") {
        $("body").addClass("menu_open");
      } else if (state.type == "search") {
        $("body").removeClass("menu_open");
      }
    }
  });

  useEffect(() => {
    const { BroadcastChannel } = require("broadcast-channel");
    const userChannel = new BroadcastChannel("user");
    userChannel.onmessage = (data) => {
      if (data.payload.type === "LOGIN") {
        loadMoreContent(true);
      }
    };

    props.socket.on("notifications", (data) => {
      if (props.pageData && props.pageData.loggedInUserDetails) {
        if (data.owner_id == props.pageData.loggedInUserDetails.user_id) {
          setState({
            notifications: [
              data.notification,
              ...stateRef.current.notifications,
            ],
            unread: stateRef.current.unread + 1,
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
            const notifications = [...stateRef.current.notifications];
            notifications.splice(index, 1);
            setState({ notifications: notifications });
          }
        }
      }
    });
    if (props.pageData.loggedInUserDetails) loadMoreContent(true);
    document.addEventListener("click", handleClickOutside, false);
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
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);

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
      if (props.mobileMenu) {
        if ((style == "block" ? "none" : "block") == "block")
          $("body").addClass("menu_open");
        else $("body").removeClass("menu_open");
      }
    } else if (type == "settings") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "settings" : "",
      });
      if (props.mobileMenu) {
        if ((style == "block" ? "none" : "block") == "block")
          $("body").addClass("menu_open");
        else $("body").removeClass("menu_open");
      }
    } else if (type == "createcurrency") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "createcurrency" : "",
      });
      if (props.mobileMenu) {
        if ((style == "block" ? "none" : "block") == "block")
          $("body").addClass("menu_open");
        else $("body").removeClass("menu_open");
      }
    } else if (type == "createbuttons") {
      setState({
        style: style == "block" ? "none" : "block",
        type: style == "none" ? "createbuttons" : "",
      });
      if (props.mobileMenu) {
        if ((style == "block" ? "none" : "block") == "block")
          $("body").addClass("menu_open");
        else $("body").removeClass("menu_open");
      }
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
    if (
      stateRef.current.type &&
      e.target &&
      !$(e.target).hasClass("parent") &&
      (!$(e.target).data("bs-toggle") ||
        ($(e.target).data("bs-toggle") &&
          $(e.target).data("bs-toggle") != "dropdown"))
    ) {
      if (stateRef.current.type == "notifications") {
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
      } else if (stateRef.current.type == "settings") {
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
      } else if (stateRef.current.type == "createbuttons") {
        if (dropRef.current && !dropRef.current.contains(e.target)) {
          if (!$(e.target).hasClass("notclosecreate")) style = "none";
        } else if (e.target) {
          style = "none";
        }
      } else if (stateRef.current.type == "createcurrency") {
        if (currencyRef.current && !currencyRef.current.contains(e.target)) {
          if (!$(e.target).hasClass("notclosecreate")) style = "none";
        } else if (e.target) {
          style = "none";
        }
      } else if (stateRef.current.type == "search") {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
          style = "none";
        } else if (searchTableRef && !searchTableRef.contains(e.target)) {
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
      !$(e.target).hasClass("dropdown-toggle") &&
      (!$(e.target).data("bs-toggle") ||
        ($(e.target).data("bs-toggle") &&
          $(e.target).data("bs-toggle") != "dropdown")) &&
      (!dropMenuButtons.current || !dropMenuButtons.current.contains(e.target))
    ) {
      if (stateRef.current.menuStyle == " show") {
        setState({ menuStyle: "" });
        $("body").removeClass("menu_open");
      }
    }
  };

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
        stateRef.current.notifications[
          stateRef.current.notifications.length - 1
        ].notification_id
      );
    }
    axios
      .post(url, formData)
      .then((response) => {
        if (response.data.error) {
          setState({ loading: false });
        } else {
          setState({
            loading: false,
            notifications: [
              ...stateRef.current.notifications,
              ...response.data.notifications,
            ],
            unread: response.data.unread,
            pagging: response.data.pagging,
          });
        }
      })
      .catch((err) => {
        setState({ loading: false });
      });
  };

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

  const onClickLoginPopUp = (e) => {
    e.preventDefault();
  };
  const search = (e) => {
    e.preventDefault();
    if (!state.search) return;
    setState({ type: "", style: "none" });
    if ($("#MobSearchbox").length > 0) {
      if ($(".MobileSearchBtn").css("display") != "none") {
        $(".MobileSearchBtn").trigger("click");
      }
    }
    const currentPath = Router.asPath;
    if (currentPath == "/search") {
      props.setSearchChanged(true);
      props.changeSearchText(state.search);
    } else {
      Router.push(`/search?h=${state.search}`);
    }
  };
  const openMobileMenu = (e) => {
    e.preventDefault();
    if (state.menuStyle == " show") {
      setState({ menuStyle: "" });
      $("body").removeClass("menu_open");
    } else {
      let stateChange = {};
      stateChange["menuStyle"] = " show";
      $("body").addClass("menu_open");
      if (state.type == "search") {
        stateChange["type"] = "";
        stateChange["style"] = "none";
      }
      setState(stateChange);
    }
  };
  if (!props.pageData || !props.pageData.menus || !props.pageData.menus.menus) {
    return null;
  }
  let menus = null;

  !props.mobileMenu
    ? (menus = props.pageData.menus.menus.map((elem) => {
        return (
          <li
            className={
              "nav-item" + (elem.submenus ? " dropdown dropdownmenu" : "")
            }
            key={elem.menu_id}
          >
            <Link
              href={elem.params ? elem.params : elem.url}
              customParam={elem.customParam}
              as={elem.url}
            >
              <a
                className={
                  "nav-link" + (elem.submenus ? " dropdown-toggle" : "")
                }
                target={elem.target}
                id={"navbarDropdown" + elem.menu_id}
              >
                {elem.icon ? <i className={elem.icon}></i> : null}
                {props.t(elem.label)}
              </a>
            </Link>
            {elem.submenus ? (
              <ul
                className="dropdown-menu"
                aria-labelledby={"navbarDropdown" + elem.menu_id}
              >
                {elem.submenus.map((subMenu) => {
                  return (
                    <li
                      className={
                        "nav-item" +
                        (subMenu.subsubmenus ? " dropdown dropdownmenu" : "")
                      }
                      key={subMenu.menu_id}
                    >
                      <Link
                        href={subMenu.params ? subMenu.params : subMenu.url}
                        customParam={subMenu.customParam}
                        as={subMenu.url}
                      >
                        <a
                          className={
                            "dropdown-item" +
                            (subMenu.subsubmenus ? " dropdown-toggle" : "")
                          }
                          target={subMenu.target}
                          id={"navbarDropdown" + subMenu.menu_id}
                        >
                          {subMenu.icon ? (
                            <i className={subMenu.icon}></i>
                          ) : null}
                          {props.t(subMenu.label)}
                        </a>
                      </Link>
                      {subMenu.subsubmenus ? (
                        <ul
                          className="dropdown-menu"
                          aria-labelledby={"navbarDropdown" + subMenu.menu_id}
                        >
                          {subMenu.subsubmenus.map((subsubMenu) => {
                            return (
                              <li key={subsubMenu.menu_id}>
                                <Link
                                  href={
                                    subsubMenu.params
                                      ? subsubMenu.params
                                      : subsubMenu.url
                                  }
                                  customParam={subsubMenu.customParam}
                                  as={subsubMenu.url}
                                >
                                  <a
                                    target={subsubMenu.target}
                                    className="dropdown-item"
                                  >
                                    {subsubMenu.icon ? (
                                      <i className={subsubMenu.icon}></i>
                                    ) : null}
                                    {props.t(subsubMenu.label)}
                                  </a>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      }))
    : (menus = props.pageData.menus.menus.map((elem) => {
        let attribute = {};
        if (elem.submenus) {
          attribute["data-bs-toggle"] = "collapse";
          attribute["aria-expanded"] = "false";
        }
        return (
          <li key={elem.menu_id}>
            {!elem.submenus ? (
              <Link
                href={elem.params ? elem.params : elem.url}
                customParam={elem.customParam}
                as={elem.url}
              >
                <a
                  className={
                    "nav-link" + (elem.submenus ? " dropdown-toggle" : "")
                  }
                  {...attribute}
                  target={elem.target}
                  id={"navbarDropdown" + elem.menu_id}
                >
                  {props.t(elem.label)}
                </a>
              </Link>
            ) : (
              <a
                className={elem.submenus ? " dropdown-toggle" : ""}
                {...attribute}
                target={elem.target}
                href={"#navbarDropdown" + elem.menu_id}
              >
                {props.t(elem.label)}
              </a>
            )}
            {elem.submenus ? (
              <ul
                className="collapse list-unstyled MobMenuSidebarLvl1"
                id={"navbarDropdown" + elem.menu_id}
              >
                {elem.submenus.map((subMenu) => {
                  let attribute = {};
                  if (subMenu.subsubmenus) {
                    attribute["data-bs-toggle"] = "collapse";
                    attribute["aria-expanded"] = "false";
                  }
                  return (
                    <li key={subMenu.menu_id}>
                      {!subMenu.subsubmenus ? (
                        <Link
                          href={subMenu.params ? subMenu.params : subMenu.url}
                          customParam={subMenu.customParam}
                          as={subMenu.url}
                        >
                          <a
                            className={
                              "nav-link" +
                              (subMenu.subsubmenus ? " dropdown-toggle" : "")
                            }
                            {...attribute}
                            target={subMenu.target}
                            id={"navbarDropdown" + subMenu.menu_id}
                          >
                            {props.t(subMenu.label)}
                          </a>
                        </Link>
                      ) : (
                        <a
                          className={
                            subMenu.subsubmenus ? " dropdown-toggle" : ""
                          }
                          {...attribute}
                          target={subMenu.target}
                          href={"#navbarDropdown" + subMenu.menu_id}
                        >
                          {props.t(subMenu.label)}
                        </a>
                      )}
                      {subMenu.subsubmenus ? (
                        <ul
                          className="collapse list-unstyled MobMenuSidebarLvl2"
                          id={"navbarDropdown" + subMenu.menu_id}
                        >
                          {subMenu.subsubmenus.map((subsubMenu) => {
                            return (
                              <li key={subsubMenu.menu_id}>
                                <Link
                                  href={
                                    subsubMenu.params
                                      ? subsubMenu.params
                                      : subsubMenu.url
                                  }
                                  customParam={subsubMenu.customParam}
                                  as={subsubMenu.url}
                                >
                                  <a
                                    target={subsubMenu.target}
                                    className="dropdown-item"
                                  >
                                    {props.t(subsubMenu.label)}
                                  </a>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      }));

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

  let page_type_class = "";
  if (props.pageData.pageInfo) {
    if (props.pageData.pageInfo.type) {
      page_type_class = " page_" + props.pageData.pageInfo.type;
    }
  }

  return !props.mobileMenu ? (
    <div className="header-wrap">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="hedearTop">
              <div className="logo">
                <Link href="/">
                  {/* <a>
                    {!props.pageData.appSettings.logo_type ||
                    props.pageData.appSettings.logo_type == "0" ? (
                      <img src={logo} />
                    ) : (
                      <span className="logo-text">
                        {props.pageData.appSettings.logo_text}
                      </span>
                    )}
                  </a> */}
                  <span className="logo-text">Showfy</span>
                </Link>
              </div>

              <div className="searchBoxWrap">
                <div className="searchBoxContent">
                  <form action="#" onSubmit={search.bind(this)}>
                    <input
                      type="text"
                      value={state.search}
                      onChange={(e) => {
                        setState({ search: e.target.value });
                      }}
                    />
                    <button type="submit">
                      <span
                        className="material-icons"
                        data-icon="search"
                      ></span>
                    </button>
                  </form>
                </div>
              </div>
              <div className="rightTop">
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
                          ref={props.setSettingsWrapperRef}
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
                                  className="dropdown-item iconmenu"
                                  data-bs-toggle="modal"
                                  data-bs-target="#registerpop"
                                  href="/signup"
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
                ) : null}
                <div className="rightTopList">
                  <ul className="custmenuRight">
                    {props.pageData.loggedInUserDetails ? (
                      <React.Fragment>
                        <CurrencyButtons
                          {...props}
                          type="website"
                          style={
                            state.type == "createcurrency"
                              ? state.style
                              : "none"
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
                          setCreateButtonsWrapperRef={
                            setCreateButtonsWrapperRef
                          }
                        />
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
                </div>
              </div>
            </div>
            <nav className="navbar navbar-expand-lg" id="main_navbar">
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbartogglericon">
                  <span className="material-icons" data-icon="menu"></span>
                </span>
              </button>
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav mr-auto mainMenu justify-content-center d-flex flex-fill">
                  {menus}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <React.Fragment>
      <div className={`MobeaderWrap${page_type_class}`} id="MobHeader">
        <div className="MobeaderContent">
          <div className="MobLeftSide">
            <div className="MobmenuWrap">
              <nav className="navbar navbar-toggleable-lg">
                <div className="align-items-center d-flex">
                  <div
                    className="backArrow ms-2"
                    onClick={(e) => {
                      Router.back();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 0 24 24"
                      width="24px"
                      fill="var(--arowBackColor)"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                      <path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z" />
                    </svg>
                  </div>
                  <button
                    className="navbar-toggler navbar-toggler-right menu-bar"
                    onClick={openMobileMenu}
                  >
                    <span
                      className="material-icons parent menu-bar"
                      data-icon="menu"
                    ></span>
                  </button>
                  <div className="MobLogo">
                    <Link href="/">
                      {/* <a>
                        {!props.pageData.appSettings.logo_type ||
                        props.pageData.appSettings.logo_type == "0" ? (
                          <img src={logo} />
                        ) : (
                          <span className="logo-text">
                            {props.pageData.appSettings.logo_text}
                          </span>
                        )}
                      </a> */}
                      <span className="logo-text">Showfy</span>
                    </Link>
                  </div>
                </div>

                <div
                  className={`collapse navbar-collapse bg-inverse MobMenuScroll${state.menuStyle}`}
                >
                  {!props.pageData.loggedInUserDetails ? (
                    <div className="mobMenuLoginBtn" ref={setMenuButtons}>
                      <ul>
                        {!props.loginButtonHide ? (
                          props.redirectLogin ? (
                            <li>
                              <Link href="/login">
                                <a className="btncomm" id="loginFormPopup">
                                  {Translate(props, "Login")}
                                </a>
                              </Link>
                            </li>
                          ) : (
                            <li>
                              <a
                                className="btncomm"
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
                                <a className="btncomm">
                                  {Translate(props, "Sign Up")}
                                </a>
                              </Link>
                            </li>
                          ) : (
                            <li>
                              <a
                                className="btncomm"
                                data-bs-toggle="modal"
                                data-bs-target="#registerpop"
                                href="/signup"
                              >
                                {Translate(props, "Sign Up")}
                              </a>
                            </li>
                          )
                        ) : null}
                        <SiteModeChange {...props} />
                      </ul>
                    </div>
                  ) : null}
                  {props.pageData.appSettings["fixed_header"] == 0 ? (
                    <ul className="list-unstyled components MobMenuSidebar">
                      {menus}
                    </ul>
                  ) : (
                    <SideFixedMenu {...props} />
                  )}
                </div>
              </nav>
            </div>
            {props.pageData.currencies &&
            props.pageData.currencies.length > 1 ? (
              <ul className="MobileCurrency MobileCurrencyBtn">
                <CurrencyButtons
                  {...props}
                  type="website"
                  style={state.type == "createcurrency" ? state.style : "none"}
                  openToggle={openToggle}
                  setCurrencyWrapperRef={setCurrencyWrapperRef}
                />
              </ul>
            ) : null}
            {/* {
                                    !props.pageData.loggedInUserDetails ? */}
            <React.Fragment>
              <div
                className="MobSearchicon MobileSearchBtn"
                data-bs-toggle="collapse"
                data-bs-target="#MobSearchbox"
                aria-expanded="false"
                aria-controls="MobSearchbox"
              >
                <span className="material-icons" data-icon="search"></span>
              </div>
              <div
                className={`Mobsearch-bar collapse MobSearchbox-loggedout`}
                id="MobSearchbox"
              >
                <form action="#" className="MobsearchForm">
                  <input
                    className="form-control"
                    id="search-text"
                    type="text"
                    value={state.search}
                    onChange={(e) => {
                      setState({ search: e.target.value });
                    }}
                  />
                  <button
                    onClick={search.bind(this)}
                    className="btn btn-default search-btn"
                  >
                    <span className="material-icons" data-icon="search"></span>
                  </button>
                </form>
              </div>
            </React.Fragment>
            {/* : null */}
            {/* } */}
          </div>
        </div>
      </div>
      {props.pageData.loggedInUserDetails ? (
        <React.Fragment>
          <div className="MobRightSide headerRightMenu">
            <ul className="mobRightNav ">
              <li className="dropdown main">
                <Link href="/">
                  <a className="nav-link bg-cnt">
                    <span
                      className="material-icons-outlined"
                      data-icon="home"
                    ></span>
                    <span className="title">{props.t("Home")}</span>
                  </a>
                </Link>
              </li>
              <Notifications
                {...props}
                type="mobile"
                loading={state.loading}
                notifications={state.notifications}
                deleteNotification={deleteNotification}
                markUnread={markUnread}
                pagging={state.pagging}
                loadMoreContent={loadMoreContent}
                unread={state.unread}
                style={state.type == "notifications" ? state.style : "none"}
                openToggle={openToggle}
                setNotificationWrapperRef={setNotificationWrapperRef}
              />
              <CreateButtons
                {...props}
                type="mobile"
                style={state.type == "createbuttons" ? state.style : "none"}
                openToggle={openToggle}
                setCreateButtonsWrapperRef={setCreateButtonsWrapperRef}
              />
              {props.pageData.levelPermissions &&
              parseInt(
                props.pageData.levelPermissions["member.allow_messages"]
              ) == 1 ? (
                <li className="dropdown main">
                  <Link href="/messanger" as="/messages">
                    <a className="nav-link bg-cnt">
                      <span className="noti-cnt">
                        <span
                          className="material-icons-outlined"
                          data-icon="chat"
                        ></span>
                        {messageCount > 0 && (
                          <span className="notifNmbr parent">
                            {messageCount > 10 ? "10+" : messageCount}
                          </span>
                        )}
                      </span>
                      <span className="title">{props.t("Messages")}</span>
                    </a>
                  </Link>
                </li>
              ) : null}
              <SettingMenus
                {...props}
                type="mobile"
                style={state.type == "settings" ? state.style : "none"}
                openToggle={openToggle}
                setSettingsWrapperRef={setSettingsWrapperRef}
              />
            </ul>
          </div>
          {state.type == "notifications" ? (
            <div className="mobMenuBox">
              <ul>
                <NotificationItems
                  type="mobile"
                  {...props}
                  loadMoreContent={loadMoreContent}
                  deleteNotification={deleteNotification}
                  markUnread={markUnread}
                  pagging={state.pagging}
                  unread={state.unread}
                  notifications={state.notifications}
                  loading={state.loading}
                />
              </ul>
            </div>
          ) : null}
          {state.type == "settings" ? (
            <div className="mobMenuBox">
              <ul>
                <SettingsItems {...props} type="mobile" />
              </ul>
            </div>
          ) : null}
          {state.type == "createbuttons" ? (
            <div className="mobMenuBox">
              <ul>
                <CreateButtonsItems {...props} type="mobile" />
              </ul>
            </div>
          ) : null}
          {state.type == "search" ? (
            <div className={`Mobsearch-bar`} ref={setSearchRef}>
              <form action="#" className="MobsearchForm">
                <input
                  className="form-control"
                  id="search-text"
                  type="text"
                  value={state.search}
                  onChange={(e) => {
                    setState({ search: e.target.value });
                  }}
                />
                <button
                  onClick={search.bind(this)}
                  className="btn btn-default search-btn"
                >
                  <span className="material-icons" data-icon="search"></span>
                </button>
              </form>
            </div>
          ) : null}
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default Menu;
