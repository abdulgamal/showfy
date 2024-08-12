import Router from "next/router";
import React, { useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../axios-orders";
import Link from "../../components/Link/index";
import LanguageSwitcher from "../../components/LocaleSwitcher";
import Translate from "../../components/Translate/Index";
import { setMenuOpen } from "../../store/reducers/search";
import Image from "../Image/Index";

const SideFixedMenu = (props) => {
  const dispatch = useDispatch();
  let menuOpen = useSelector((state) => {
    return state.search.menuOpen;
  });
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      adult: props.pageData.adultAllowed ? true : false,
      previousUrl: typeof window != "undefined" ? Router.asPath : "",
    }
  );
  const openMenu = (e, submenu) => {
    if (submenu) {
      if (state.submenu != submenu[0].menu_id) {
        setState({ submenu: submenu[0].menu_id });
      } else {
        setState({ submenu: null });
      }
    }
  };

  const openSubMenu = (e, submenu) => {
    if (submenu) {
      if (state.subsubmenu != submenu[0].menu_id) {
        setState({ subsubmenu: submenu[0].menu_id });
      } else {
        setState({ subsubmenu: null });
      }
    }
  };
  const allowAdultContent = (e) => {
    setState({ adult: !state.adult });
    const formData = new FormData();
    formData.append("adult", !state.adult ? 1 : 0);
    let url = "/members/adult";
    axios.post(url, formData).then((response) => {
      Router.push(Router.asPath);
    });
  };
  const showHideMenu = (e) => {
    dispatch(setMenuOpen(true));
  };
  let path = "";

  if (typeof window != "undefined") {
    path = Router.asPath;
  } else {
    path = props.pageData.currentURL;
  }

  if (!path) {
    return null;
  }

  // console.log(props);
  if (props.pageData.appSettings["fixed_header"] != 1) {
    return null;
  }
  let bottomFooterMenus = props.pageData.menus.bottomFooterMenus;
  let socialShareMenus = props.pageData.menus.socialShareMenus;
  let menus = null;
  if (props.pageData.menus && props.pageData.menus.menus) {
    menus = props.pageData.menus.menus.map((elem) => {
      return (
        <li
          onClick={(e) => {
            openMenu(e, elem.submenus);
          }}
          className={
            "nav-item" +
            (elem.submenus ? " dropdown dropdownmenu" : "") +
            (menuOpen && elem.submenus ? "" : "")
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
                "nav-link" +
                (elem.submenus ? " dropdown-toggle" : "") +
                (path.indexOf(elem.url) > -1 && path.indexOf(elem.url + "/") < 0
                  ? " active"
                  : "")
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
              className={`submenu collapse${
                state.submenu && state.submenu == elem.submenus[0].menu_id
                  ? " show"
                  : ""
              }`}
            >
              {elem.submenus.map((subMenu) => {
                return (
                  <li
                    onClick={(e) => {
                      openSubMenu(e, subMenu.subsubmenus);
                    }}
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
                          subMenu.subsubmenus ? " dropdown-toggle" : ""
                        }
                        target={subMenu.target}
                        id={"navbarDropdown" + subMenu.menu_id}
                      >
                        {subMenu.icon ? <i className={subMenu.icon}></i> : null}
                        {props.t(subMenu.label)}
                      </a>
                    </Link>
                    {subMenu.subsubmenus ? (
                      <ul
                        className={`submenu collapse${
                          state.subsubmenu &&
                          state.subsubmenu == subMenu.subsubmenus[0].menu_id
                            ? " show"
                            : ""
                        }`}
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
                                {subsubMenu.icon ? (
                                  <i className={subsubMenu.icon}></i>
                                ) : null}
                                <a target={subsubMenu.target}>
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
    });
  }
  var hideSmallMenu = props.hideSmallMenu || props.pageData.hideSmallMenu;

  if (menuOpen && props.mobileMenu) {
    menuOpen = false;
    hideSmallMenu = false;
  }

  if (hideSmallMenu && menuOpen) {
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
    <div className={`sidebar-menu${menuOpen ? " mini-menu" : ""}`}>
      {hideSmallMenu ? (
        <div className="top-header side-menu-top">
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
        </div>
      ) : null}
      <div className="menu-list sidebar-scroll">
        <ul
          className={`main-menu border-sidebar${menuOpen ? " small-menu" : ""}`}
        >
          <li>
            <Link href="/">
              <a className={path == "/" ? "active" : ""}>
                <span className="material-icons" data-icon="home"></span>{" "}
                {Translate(props, "Home")}
              </a>
            </Link>
          </li>
          {props.pageData.levelPermissions &&
          props.pageData.levelPermissions["livestreaming.create"] == 1 &&
          props.pageData.liveStreamingEnable ? (
            <li>
              <Link href="create-livestreaming" as="/live-streaming">
                <a>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="6" fill="#f44336" />
                    <path
                      fill="#f44336"
                      d="M17.09,16.789L14.321,13.9C11.663,16.448,10,20.027,10,24s1.663,7.552,4.321,10.1l2.769-2.889 C15.19,29.389,14,26.833,14,24C14,21.167,15.19,18.61,17.09,16.789z"
                    />
                    <path
                      fill="#f44336"
                      d="M33.679,13.9l-2.769,2.889C32.81,18.611,34,21.167,34,24c0,2.833-1.19,5.389-3.09,7.211l2.769,2.889 C36.337,31.552,38,27.973,38,24S36.337,16.448,33.679,13.9z"
                    />
                    <g>
                      <path
                        fill="#f44336"
                        d="M11.561,11.021l-2.779-2.9C4.605,12.125,2,17.757,2,24s2.605,11.875,6.782,15.879l2.779-2.9 C8.142,33.701,6,29.1,6,24S8.142,14.299,11.561,11.021z"
                      />
                      <path
                        fill="#f44336"
                        d="M39.218,8.121l-2.779,2.9C39.858,14.299,42,18.9,42,24s-2.142,9.701-5.561,12.979l2.779,2.9 C43.395,35.875,46,30.243,46,24S43.395,12.125,39.218,8.121z"
                      />
                    </g>
                  </svg>
                  {props.t("Go Live")}
                </a>
              </Link>
            </li>
          ) : null}
          {props.pageData.loggedInUserDetails ? (
            <React.Fragment>
              <li>
                <Link
                  href="/dashboard"
                  as="/dashboard/videos/my_recent"
                  customParam="type=videos&filter=my_recent"
                >
                  <a
                    className={
                      path.indexOf("/dashboard/videos/my_recent") > -1
                        ? "active"
                        : ""
                    }
                  >
                    <span className="material-icons" data-icon="history"></span>{" "}
                    {Translate(props, "History")}
                  </a>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  as="/dashboard/purchases"
                  customParam="type=purchases"
                >
                  <a
                    className={
                      path.indexOf("/dashboard/purchases") > -1 ? "active" : ""
                    }
                  >
                    <span
                      className="material-icons"
                      data-icon="shop_two"
                    ></span>{" "}
                    {Translate(props, "Purchases")}
                  </a>
                </Link>
              </li>
            </React.Fragment>
          ) : null}
          <li>
            <Link href="/videos" as="/videos/latest" customParam="sort=latest">
              <a
                className={path.indexOf("/videos/latest") > -1 ? "active" : ""}
              >
                <span className="material-icons" data-icon="videocam"></span>{" "}
                {Translate(props, "Latest Videos")}
              </a>
            </Link>
          </li>
          <li>
            <Link
              href="/videos"
              as="/videos/trending"
              customParam="pageType=trending"
            >
              <a
                className={
                  path.indexOf("/videos/trending") > -1 ? "active" : ""
                }
              >
                <span className="material-icons" data-icon="trending_up"></span>{" "}
                {Translate(props, "Trending Videos")}
              </a>
            </Link>
          </li>
          <li>
            <Link href="/videos" as="/videos/top" customParam="pageType=top">
              <a className={path.indexOf("/videos/top") > -1 ? "active" : ""}>
                <span className="material-icons" data-icon="bar_chart"></span>{" "}
                {Translate(props, "Top Videos")}
              </a>
            </Link>
          </li>
        </ul>

        {props.pageData.channelSubscriptions &&
        props.pageData.channelSubscriptions.length > 0 ? (
          <ul className={`main-menu border-sidebar${menuOpen ? " hide" : ""}`}>
            <li className={`sidebar-menu-title`}>
              {Translate(props, "Subscriptions")}
            </li>
            {props.pageData.channelSubscriptions.map((channel) => {
              return (
                <li key={channel.custom_url}>
                  <Link
                    href="/channel"
                    customParam={`id=${channel.custom_url}`}
                    as={`/channel/${channel.custom_url}`}
                  >
                    <a className="sidebar-icon">
                      <Image
                        className="sidebar-img"
                        height="24"
                        width="24"
                        imageSuffix={props.pageData.imageSuffix}
                        image={channel.image}
                        title={channel.title}
                        siteURL={props.pageData.siteURL}
                      />
                      <span className="title">{channel.title}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/channels">
                <a>
                  <span className="material-icons">add_circle</span>{" "}
                  {Translate(props, "Browse channels")}
                </a>
              </Link>
            </li>
          </ul>
        ) : null}
        {props.pageData.popularMembers ? (
          <ul className={`main-menu border-sidebar${menuOpen ? " hide" : ""}`}>
            <li className="sidebar-menu-title">
              {Translate(props, "Popular Members")}
            </li>
            {props.pageData.popularMembers.map((member, index) => {
              if (index < 25) {
                return (
                  <li key={member.user_id}>
                    <Link
                      href="/member"
                      customParam={`id=${member.username}`}
                      as={`/${member.username}`}
                    >
                      <a className="sidebar-icon">
                        <Image
                          className="sidebar-img"
                          height="24"
                          width="24"
                          imageSuffix={props.pageData.imageSuffix}
                          image={member.avtar}
                          title={props.t(member.displayname)}
                          siteURL={props.pageData.siteURL}
                        />
                        <span className="title">{member.displayname}</span>
                      </a>
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        ) : null}
        {menus ? (
          <ul className={`main-menu border-sidebar${menuOpen ? " hide" : ""}`}>
            <li className={`sidebar-menu-title`}>
              {Translate(props, "Menus")}
            </li>
            {menus}
          </ul>
        ) : null}

        <div className={`sidebar-menu-two${menuOpen ? " hide" : ""}`}>
          {props.pageData.categoriesVideo ? (
            <ul className="main-menu border-sidebar">
              <li className="sidebar-menu-title">
                {Translate(props, "Categories")}
              </li>
              {props.pageData.categoriesVideo.map((category) => {
                return (
                  <li key={category.category_id}>
                    <Link
                      href={`/category`}
                      customParam={`type=video&id=` + category.slug}
                      as={`/video/category/` + category.slug}
                    >
                      <a className="sidebar-icon">
                        <Image
                          className="sidebar-img"
                          height="24"
                          width="24"
                          imageSuffix={props.pageData.imageSuffix}
                          image={category.image}
                          title={props.t(category.title)}
                          siteURL={props.pageData.siteURL}
                        />
                        <span className="title">{props.t(category.title)}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {props.pageData.appSettings["video_adult"] == 1 ||
          props.pageData.appSettings["channel_adult"] == 1 ||
          props.pageData.appSettings["blog_adult"] == 1 ||
          props.pageData.appSettings["playlist_adult"] == 1 ||
          (props.pageData.languages && props.pageData.languages.length > 1) ? (
            <ul className="main-menu border-sidebar">
              <li className="sidebar-menu-title">
                {Translate(props, "Settings")}
              </li>
              <LanguageSwitcher {...props} />
              {props.pageData.appSettings["video_adult"] == 1 ||
              props.pageData.appSettings["channel_adult"] == 1 ||
              props.pageData.appSettings["blog_adult"] == 1 ||
              props.pageData.appSettings["playlist_adult"] == 1 ? (
                <div className="form-check form-switch adultSwitchFtr">
                  <input
                    onChange={allowAdultContent}
                    defaultChecked={state.adult}
                    type="checkbox"
                    className="form-check-input"
                    id="adultSwitchFtr"
                  />
                  <label className="form-check-label" htmlFor="adultSwitchFtr">
                    {props.t("Adult content")}
                  </label>
                  <span className="error"></span>
                </div>
              ) : null}
            </ul>
          ) : null}

          {socialShareMenus && socialShareMenus.length ? (
            <ul className="main-menu border-sidebar">
              <li className="sidebar-menu-title">{props.t("Follow us on")}</li>
              <div className="social-follow-btn">
                {socialShareMenus.map((menu) => {
                  return (
                    <a
                      key={menu.menu_id}
                      href={
                        menu.url != "javascript:void(0)" && menu.url != "#"
                          ? menu.url
                          : "#"
                      }
                      target="_blank"
                    >
                      <i className={menu.icon}></i>
                    </a>
                  );
                })}
              </div>
            </ul>
          ) : null}
          {bottomFooterMenus && bottomFooterMenus.length ? (
            <div className="imp-links">
              {bottomFooterMenus.map((menu) => {
                return (
                  <Link href={menu.url} key={menu.menu_id}>
                    <a target={menu.target}>{props.t(menu.label)}</a>
                  </Link>
                );
              })}
            </div>
          ) : null}
          <div className="copyright">
            {props.t(
              "Copyright © {{year}} {{site_title}}. All Rights Reserved.",
              {
                year: new Date().getFullYear(),
                site_title: props.pageData.appSettings["site_title"],
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideFixedMenu;
