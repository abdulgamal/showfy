import React from "react";
import Menu from "../Menu/Index";
import FixedMenu from "../Menu/Fixed";
import Link from "../../components/Link";

export default function Index(props) {
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

  return props.liveStreaming ? (
    <div className="ls_HeaderWrap">
      <div className="container-fluid">
        <div className="ls_headerContent">
          <div className="logo">
            <Link href="/">
              {/* <a>
                {!props.pageData.appSettings.logo_type || props.pageData.appSettings.logo_type == "0" ? (
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
      </div>
    </div>
  ) : props.layout != "mobile" ? (
    props.pageData.appSettings["fixed_header"] == 1 ? (
      <FixedMenu {...props} />
    ) : (
      <Menu {...props} />
    )
  ) : (
    <Menu {...props} mobileMenu={true} />
  );
}
