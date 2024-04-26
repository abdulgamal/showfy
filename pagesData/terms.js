import React from "react";

const Terms = (props) => (
  <React.Fragment>
    {
      <React.Fragment>
        <div className="titleBarTop">
          <div className="titleBarTopBg">
            <img
              src={
                props.pageData["pageInfo"]["banner"]
                  ? props.pageData.imageSuffix +
                    props.pageData["pageInfo"]["banner"]
                  : props.pageData["subFolder"] +
                    "static/images/breadcumb-bg.jpg"
              }
              alt={props.t("Terms of Service")}
            />
          </div>
          <div className="overlay">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="titleHeadng">
                    <h1>{props.t("Terms of Service")}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mainContentWrap">
          <div className="container">
            <div className="row">
              <div className="col-md-12 position-relative">
                <div className="ContentBoxTxt">
                  <div
                    className="content page_content"
                    dangerouslySetInnerHTML={{
                      __html: props.pageData.pagecontent,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    }
  </React.Fragment>
);

export default Terms;
