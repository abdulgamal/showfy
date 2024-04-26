import React, { useReducer, useEffect, useRef } from "react";
import Items from "./NotificationItems";

const Notifications = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: props.loading,
      notifications: props.notifications,
      unread: props.unread,
      open: false,
      style: props.style,
      pagging: props.pagging,
      type: props.type,
    }
  );
  useEffect(() => {
    if (
      props.style != state.style ||
      props.unread != state.unread ||
      props.notifications != state.notifications ||
      props.loading != state.loading ||
      props.pagging != state.pagging ||
      props.type != state.type
    ) {
      setState({
        style: props.style,
        unread: props.unread,
        notifications: props.notifications,
        pagging: props.pagging,
        loading: props.loading,
        type: props.type,
      })
    }
  }, [props]);

  return (
    <React.Fragment>
      <li
        className={
          !props.mobileMenu
            ? `nav-item dropdown main notclosenotification${
                state.style == "block" ? " active" : ""
              }`
            : `main dropdown MobDropdownNav notclosenotification${
                state.style == "block" ? " active" : ""
              }`
        }
        id="navbarDropdownList"
        onClick={(e) => props.openToggle("notifications", e)}
      >
        <a
          className={
            !props.mobileMenu
              ? "nav-link markReadAll parent notclosenotification bg-cnt"
              : "parent"
          }
          href="#"
        >
          <span className="noti-cnt">
            <span
              className="material-icons parent"
              data-icon="notifications"
            ></span>
            {state.unread > 0 ? (
              <span className="notifNmbr parent">
                {state.unread > 10 ? "10+" : state.unread}
              </span>
            ) : null}
          </span>
          {props.mobileMenu ? (
            <span className="title parent">{props.t("Notifications")}</span>
          ) : null}
        </a>
        {!props.mobileMenu ? (
          <ul
            className={`dropdown-menu notificationMenu dropdown-menu-right iconMenuList`}
            ref={props.setNotificationWrapperRef}
            style={{ display: state.style }}
          >
            <span className="dropdown-menu-arrow"></span>
            <Items
              {...props}
              loadMoreContent={props.loadMoreContent}
              pagging={state.pagging}
              notifications={state.notifications}
              loading={state.loading}
            />
          </ul>
        ) : null}
      </li>
    </React.Fragment>
  );
};

export default Notifications;
