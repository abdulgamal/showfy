import React from "react";

const Pages = (props) => (
  <React.Fragment>
    { (
      <React.Fragment>
        {props.pageData.pageInfo.image ? (
          <div className="titleBarTop">
            <div className="titleBarTopBg">
              <img
                src={props.pageData.imageSuffix + props.pageData.pageInfo.image}
                alt={props.pageData.pageInfo.title}
              />
            </div>
            <div className="overlay">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="titleHeadng">
                      {/* <h1>{props.pageData.pageInfo.title}</h1> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="mainContentWrap">
          <div className="container">
            <div className="row">
              <div className="col-md-12 position-relative">
                <div
                  className="ContentBoxTxt"
                  style={{
                    marginTop: !props.pageData.pageInfo.image
                      ? "10px"
                      : "-100px",
                  }}
                >
                  <div
                    className="content page_content"
                    dangerouslySetInnerHTML={{
                      __html: props.pageData.pageContent,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )}
  </React.Fragment>
);

export default Pages;
