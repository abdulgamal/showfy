import React from "react";
const Maintenance = (props) => {
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

  let background = props.pageData.pageInfo.banner;

  return (
    <div
      className="content-wrap maintenancepage"
      style={{
        background: `url(${background})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="overlay"></div>
      <div className="container">
        <div className="row">
          <div className="col-md-12 maintenancepageTxt">
            <div className="logo">
              {!props.pageData.appSettings.logo_type ||
              props.pageData.appSettings.logo_type == "0" ? (
                <img src={logo} />
              ) : (
                <span className="logo-text">
                  {props.pageData.appSettings.logo_text}
                </span>
              )}
            </div>
            <h2>{props.t("MAINTENANCE PAGE")}</h2>
            <div className="msg">
              <p>
                {props.t(
                  "We are very sorry for this inconvenience. We are currently working on something new and we will be back soon with awesome new features. Thanks for your patience."
                )}
              </p>
            </div>
            <div className="access_code">
              <form method="POST">
                <div className="meintenaceForm">
                  <input
                    className="meintenaceFormInput form-control"
                    type="text"
                    placeholder={props.t("Enter Access Code")}
                    name="maintenance_code"
                  />
                  <input
                    className="meintenaceFormBtn"
                    type="submit"
                    value={props.t("Submit")}
                  />
                </div>
              </form>
            </div>
            <div className="meintenaceSocial">
              <ul className="footerLinks d-flex gap-2">
                {props.pageData.socialShareMenus &&
                props.pageData.socialShareMenus.length
                  ? props.pageData.socialShareMenus.map((menu) => {
                      return (
                        <li key={menu.menu_id}>
                          {menu.icon.indexOf("twitter") > -1 ? (
                            <a
                              href={
                                menu.url != "javascript:void(0)" &&
                                menu.url != "javascript:"
                                  ? menu.url
                                  : "#"
                              }
                              target="_blank"
                              className="twitter"
                            >
                              <img src="/static/images/twitter.png" />
                            </a>
                          ) : (
                            <a
                              href={
                                menu.url != "javascript:void(0)" &&
                                menu.url != "javascript:"
                                  ? menu.url
                                  : "#"
                              }
                              target="_blank"
                            >
                              <i className={menu.icon}></i>
                            </a>
                          )}
                        </li>
                      );
                    })
                  : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .twitter {
            width: 30px;
            height: 30px;
            background: rgb(0, 0, 0);
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
          }
          .twitter img {
            height: 15px;
            width: 15px;
            vertical-align: middle;
          }
          input[name=maintenance_code]{
            min-width:250px;
          }
        `}
      </style>
    </div>
  );
};

export default Maintenance;
