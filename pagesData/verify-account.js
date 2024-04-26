import React from "react";
import Link from "../components/Link/index";

const VerifyAccount = (props) => (
  <React.Fragment>
    { (
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
              alt={props.t("Verify Email")}
            />
          </div>
          <div className="overlay">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="titleHeadng">
                    <h1>{props.t("Thanks for joining!")}</h1>
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
                <div className="ContentBoxTxt text-center">
                  <p>
                    {props.t(
                      "Welcome! A verification message has been sent to your email address with instructions for activating your account. Once you have activated your account, you will be able to sign in."
                    )}
                  </p>
                  <Link href="/">
                    <a className="thanks_link" href="/">
                      {props.t("OK, thanks!")}
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )}
  </React.Fragment>
);

export default VerifyAccount;
