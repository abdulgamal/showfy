import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";
import Translate from "../../components/Translate/Index";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      item: props.item,
    }
  );
  useEffect(() => {
    if (props.item.watchlater_id != state.item.watchlater_id) {
      setState({ item: props.item });
    }
  }, [props]);

  const onChange = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else {
      const formData = new FormData();
      formData.append("id", props.id);
      let url = "/watch-later";
      if (props.typeWatchLater == "movie-series") {
        formData.append("type", "movie-series");
      }
      axios
        .post(url, formData)
        .then((response) => {})
        .catch((err) => {
          //setState({submitting:false,error:err});
        });
    }
  };
  if (
    props.pageData.appSettings[`video_watchlater`] != 1 &&
    props.typeWatchLater != "movie-series"
  ) {
    return null;
  }
  return props.pageData.loggedInUserDetails &&
    state.item.watchlater_id ? (
    props.icon ? (
      <a
        onClick={onChange}
        title={Translate(props, "Watch Later")}
        className={`active${
          props.className ? " " + props.className : ""
        }`}
      >
        <span
          className="material-icons-outlined"
          data-icon="watch_later"
        ></span>
      </a>
    ) : (
      <button
        onClick={onChange}
        type="button"
        title={Translate(props, "Watch Later")}
        className="btn btn-outline-secondary btn-sm watchlater active"
      >
        <span
          className="material-icons-outlined"
          data-icon="watch_later"
        ></span>
        {props.t("Watch Later")}
      </button>
    )
  ) : props.icon ? (
    <a
      className={`${props.className ? props.className : ""}`}
      title={Translate(props, "Watch Later")}
      onClick={onChange}
    >
      <span className="material-icons-outlined" data-icon="watch_later"></span>
    </a>
  ) : (
    <button
      onClick={onChange}
      type="button"
      title={Translate(props, "Watch Later")}
      className="btn btn-outline-secondary btn-sm watchlater"
    >
      <span className="material-icons-outlined" data-icon="watch_later"></span>
      {props.t("Watch Later")}
    </button>
  );
};

export default Index;
