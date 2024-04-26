import React from "react";
import { useSelector } from "react-redux";
import axios from "../../axios-orders";
import SendMessageToApps from "../../components/SendMessageToApps/Index";

const Sitemode = (props) => {
  let reduxStateSearch = useSelector((state) => {
    return state.search.themeType;
  });
  
  const changeSiteMode = (e) => {
    e.preventDefault();
    let theme =
    reduxStateSearch == "dark"
        ? "white"
        : reduxStateSearch
        ? "dark"
        : props.pageData.themeMode == "dark"
        ? "white"
        : "dark";
    props.setTheme(theme);
    //set site mode
    const data = { ...props.pageData };
    data.themeMode = theme;
    const formData = new FormData();
    formData.append("mode", theme);

    SendMessageToApps({ props: props, type: "themeModeChanged", theme: theme });

    if (theme == "dark") {
      let link = `<link id="custom-color-dark-css" href="/static/css/variable_dark.css?v=1656355657112" rel="stylesheet">`;
      $(link).insertAfter("#custom-color-white-css");
    } else {
      $("#custom-color-dark-css").remove();
    }

    let url = "/members/theme-mode";
    axios.post(url, formData).then((response) => {});
  };

  if (!props.pageData.toogleMode) {
    return false;
  }
  return (
    <li>
      <a
        className="dropdown-item iconmenu parent"
        style={{ cursor: "pointer" }}
        href="#"
        onClick={changeSiteMode}
      >
        {!props.iconLast ? (
          <span
            style={{marginLeft:"5px"}}
            className="material-icons parent"
            data-icon="nights_stay"
          ></span>
        ) : null}
        {props.t("Mode")}
        {props.iconLast ? (
          <span
            style={{marginLeft:"5px"}}
            className="material-icons parent ml-2"
            data-icon="nights_stay"
          ></span>
        ) : null}
      </a>
    </li>
  );
};

export default Sitemode;
