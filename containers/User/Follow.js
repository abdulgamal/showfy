import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";

const Follow = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      item: props.user,
    }
  );
  useEffect(() => {
    if (props.user.follower_id != state.item.follower_id) {
      setState({ item: props.user });
    }
  }, [props]);

  const onChange = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      const formData = new FormData();
      if (!props.user.channel_id)
        formData.append("id", props.user.user_id);
      else if (props.user.channel_id)
        formData.append("id", props.user.channel_id);
      formData.append("type", props.type);
      let url = "/follow";
      axios
        .post(url, formData)
        .then((response) => {
          if (response.data.error) {
          } else {
          }
        })
        .catch((err) => {
          //setState({submitting:false,error:err});
        });
    }
  };

  if (
    props.pageData.appSettings["user_follow"] != 1 &&
    props.type != "channels"
  ) {
    return null;
  }
  let style = {style:{ opacity: "0"} };
  if (props.hideButton) style.display = "none";
  if (
    props.pageData.loggedInUserDetails &&
    props.pageData.loggedInUserDetails.user_id ==
      (state.item.user_id
        ? state.item.user_id
        : state.item.owner_id)
  ) {
    if (!props.fromView) {
      return (
        <a
          className={props.className ? props.className : "follow"}
          {...style}
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          {props.title ? props.title : props.t("Following")}
        </a>
      );
    } else {
      return null;
    }
  }

  return props.pageData.loggedInUserDetails &&
    state.item.follower_id ? (
    props.nolink ? (
      <span className={"follow-member"} onClick={onChange} href="#">
        {props.title ? props.title : props.t("Following")}
      </span>
    ) : !props.button ? (
      <a
        className={
          props.className
            ? props.className + " active"
            : "follow active"
        }
        onClick={onChange}
        href="#"
      >
        {props.title ? props.title : props.t("Following")}
      </a>
    ) : (
      <a className="follow active" onClick={onChange} href="#">
        {props.title ? props.title : props.t("Following")}
      </a>
    )
  ) : props.nolink ? (
    <span className={"follow-member"} onClick={onChange} href="#">
      {props.title ? props.title : props.t("Follow")}
    </span>
  ) : !props.button ? (
    <a
      className={props.className ? props.className : "follow"}
      onClick={onChange}
      href="#"
    >
      {props.title ? props.title : props.t("Follow")}
    </a>
  ) : (
    <a className="follow" onClick={onChange} href="#">
      {props.title ? props.title : props.t("Follow")}
    </a>
  );
};

export default Follow;
