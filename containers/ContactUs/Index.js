import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";
import { withGoogleReCaptcha } from "react-google-recaptcha-v3";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      submitting: false,
      fields: {
        name: "",
        email: "",
        subject: "",
        message: "",
      },
      errors: {
        name: "",
        email: "",
        subject: "",
        message: "",
      },
      getCaptchaToken: true,
      firstToken: true,
      keyCaptcha: 1,
    }
  );

  const change = (e) => {
    const previousValue = { ...state.fields };
    previousValue[e.target.id] = e.target.value;
    setState({ fields: previousValue });
  };
  const submitForm = async () => {
    let formData = new FormData();
    for (var key in state.fields) {
      formData.append(key, state.fields[key]);
    }

    if (
      props.pageData.appSettings["recaptcha_enable"] == 1 &&
      props.pageData.appSettings["recaptcha_contactus_enable"] == 1
    ) {
      const { executeRecaptcha } = props.googleReCaptchaProps;
      const result = await executeRecaptcha("contactus");
      formData.append("captchaToken", result);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/contact";

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({ error: response.data.error, submitting: false });
        } else {
          setState({
            fields: {
              name: "",
              email: "",
              subject: "",
              message: "",
            },
            error: null,
            submitting: false,
          });
          props.openToast({
            message: Translate(props, response.data.message),
            type: "success",
          });
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };
  const submit = async (e) => {
    e.preventDefault();
    const previousErrors = { ...state.errors };
    let valid = true;
    for (var key in state.fields) {
      if (state.fields.hasOwnProperty(key)) {
        if (!state.fields[key]) {
          previousErrors[key] = props.t("This is required field.");
          valid = false;
        } else if (key == "email") {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!pattern.test(state.fields[key])) {
            //invalid email
            previousErrors[key] = props.t("Please enter valid email.");
            valid = false;
          } else {
            previousErrors[key] = null;
          }
        } else {
          previousErrors[key] = null;
        }
      }
    }

    if (!valid) {
      setState({ errors: previousErrors });
      return false;
    }
    if (state.submitting) {
      return false;
    }
    setState({ submitting: true, errors: previousErrors });

    submitForm();
  };
  const setToken = (token) => {
    if (state.firstToken) {
      setState({
        captchaToken: token,
        getCaptchaToken: false,
        firstToken: false,
      });
    } else {
      setState({ captchaToken: token, getCaptchaToken: false }, () => {
        submitForm();
      });
    }
  };

  return (
    <React.Fragment>
      <div className="titleBarTop">
        <div className="titleBarTopBg">
          <img
            src={
              props.pageData["pageInfo"]["banner"]
                ? props.pageData.imageSuffix +
                  props.pageData["pageInfo"]["banner"]
                : props.pageData["subFolder"] + "static/images/breadcumb-bg.jpg"
            }
            alt={props.t("Contact Us")}
          />
        </div>
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="titleHeadng">
                  <h1>{props.t("Contact Us")}</h1>
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
                <div className="contact-area">
                  {props.pageData.appSettings["contact_map"] ? (
                    <div className="gmap">
                      <iframe
                        src={props.pageData.appSettings["contact_map"]}
                        width="100%"
                        height="500"
                        frameBorder="0"
                        style={{ border: "0" }}
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : null}
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="contact-us">
                          <div className="cf-msg"></div>
                          <form method="POST" onSubmit={submit}>
                            <div className="row">
                              <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                                <div className="cf-input-box">
                                  <input
                                    type="text"
                                    placeholder={props.t("Name")}
                                    value={state.fields.name}
                                    onChange={change}
                                    id="name"
                                    name="name"
                                    required=""
                                  />
                                  {state.errors.name ? (
                                    <p className="error">{state.errors.name}</p>
                                  ) : null}
                                </div>
                              </div>
                              <div className="col-lg-6 col-md-6 col-sm-12 col-12">
                                <div className="cf-input-box">
                                  <input
                                    type="email"
                                    placeholder={props.t("Email")}
                                    value={state.fields.email}
                                    onChange={change}
                                    id="email"
                                    name="email"
                                    required=""
                                  />
                                  {state.errors.email ? (
                                    <p className="error">
                                      {state.errors.email}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="cf-input-box">
                                  <input
                                    type="text"
                                    placeholder={props.t("Subject")}
                                    value={state.fields.subject}
                                    onChange={change}
                                    id="subject"
                                    name="subject"
                                    required=""
                                  />
                                  {state.errors.subject ? (
                                    <p className="error">
                                      {state.errors.subject}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="cf-input-box">
                                  <textarea
                                    className="contact-textarea"
                                    placeholder={props.t("Message")}
                                    value={state.fields.message}
                                    id="message"
                                    name="message"
                                    onChange={change}
                                    required=""
                                  ></textarea>
                                  {state.errors.message ? (
                                    <p className="error">
                                      {state.errors.message}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="cf-input-box">
                                  <button
                                    id="submit"
                                    className="cont-submit btn-contact"
                                    name="submit"
                                  >
                                    {props.t(
                                      state.submitting
                                        ? "Submitting..."
                                        : "Submit"
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                      <div className="col-md-5 offset-lg-1">
                        {props.pageData.appSettings["contact_address"] ||
                        props.pageData.appSettings["contact_phone"] ||
                        props.pageData.appSettings["contact_fax"] ||
                        props.pageData.appSettings["contact_email"] ? (
                          <div className="contact-info">
                            <h4 className="contact-title">
                              {props.t("Address")}
                            </h4>
                            <ul className="info">
                              {props.pageData.appSettings["contact_address"] ? (
                                <li>
                                  <span className="material-icons">room</span>{" "}
                                  <span>
                                    {
                                      props.pageData.appSettings[
                                        "contact_address"
                                      ]
                                    }
                                  </span>
                                </li>
                              ) : null}
                              {props.pageData.appSettings["contact_phone"] ? (
                                <li>
                                  <span className="material-icons">
                                    stay_current_portrait
                                  </span>{" "}
                                  <span>
                                    {
                                      props.pageData.appSettings[
                                        "contact_phone"
                                      ]
                                    }
                                  </span>
                                </li>
                              ) : null}
                              {props.pageData.appSettings["contact_fax"] ? (
                                <li>
                                  <i className="fas fa-fax"></i>{" "}
                                  <span>
                                    {props.pageData.appSettings["contact_fax"]}
                                  </span>
                                </li>
                              ) : null}
                              {props.pageData.appSettings["contact_email"] ? (
                                <li>
                                  <i className="far fa-envelope"></i>{" "}
                                  <span>
                                    {
                                      props.pageData.appSettings[
                                        "contact_email"
                                      ]
                                    }
                                  </span>
                                </li>
                              ) : null}
                            </ul>
                            <div className="Share__container">
                              {props.pageData.appSettings[
                                "contact_facebook_url"
                              ] ? (
                                <a
                                  className="social-share"
                                  target="_blank"
                                  href={
                                    props.pageData.appSettings[
                                      "contact_facebook_url"
                                    ]
                                  }
                                >
                                  <div
                                    aria-label="facebook"
                                    role="button"
                                    className="SocialMediaShareButton SocialMediaShareButton--facebook social-share__share-button"
                                  >
                                    <div
                                      style={{ width: "40px", height: "40px" }}
                                    >
                                      <svg
                                        viewBox="0 0 64 64"
                                        width="40"
                                        height="40"
                                        className="social-icon social-icon--facebook "
                                      >
                                        <g>
                                          <rect
                                            width="64"
                                            height="64"
                                            rx="0"
                                            ry="0"
                                            fill="#3b5998"
                                          ></rect>
                                        </g>
                                        <g>
                                          <path
                                            d="M34.1,47V33.3h4.6l0.7-5.3h-5.3v-3.4c0-1.5,0.4-2.6,2.6-2.6l2.8,0v-4.8c-0.5-0.1-2.2-0.2-4.1-0.2 c-4.1,0-6.9,2.5-6.9,7V28H24v5.3h4.6V47H34.1z"
                                            fill="white"
                                          ></path>
                                        </g>
                                      </svg>
                                    </div>
                                  </div>
                                </a>
                              ) : null}
                              {props.pageData.appSettings[
                                "contact_twitter_url"
                              ] ? (
                                <a
                                  className="social-share"
                                  target="_blank"
                                  href={
                                    props.pageData.appSettings[
                                      "contact_twitter_url"
                                    ]
                                  }
                                >
                                  <div
                                    aria-label="twitter"
                                    role="button"
                                    className="SocialMediaShareButton SocialMediaShareButton--twitter social-share__share-button"
                                  >
                                    <div
                                      style={{ width: "40px", height: "40px", background:"#000" }}
                                    >
                                      <img src="/static/images/twitter.png" style={{
                                            height: "20px",
                                            width: "20px",
                                            verticalAlign: "middle",
                                            marginTop: "10px"
                                      }} />
                                    </div>
                                  </div>
                                  <div className="social-share__share-count">
                                    &nbsp;
                                  </div>
                                </a>
                              ) : null}
                              {props.pageData.appSettings[
                                "contact_whatsapp_url"
                              ] ? (
                                <a
                                  className="social-share"
                                  target="_blank"
                                  href={
                                    props.pageData.appSettings[
                                      "contact_whatsapp_url"
                                    ]
                                  }
                                >
                                  <div
                                    aria-label="whatsapp"
                                    role="button"
                                    className="SocialMediaShareButton SocialMediaShareButton--whatsapp social-share__share-button"
                                  >
                                    <div
                                      style={{ width: "40px", height: "40px" }}
                                    >
                                      <svg
                                        viewBox="0 0 64 64"
                                        width="40"
                                        height="40"
                                        className="social-icon social-icon--whatsapp "
                                      >
                                        <g>
                                          <rect
                                            width="64"
                                            height="64"
                                            rx="0"
                                            ry="0"
                                            fill="#2cb742"
                                          ></rect>
                                        </g>
                                        <g>
                                          <path
                                            d="m42.32286,33.93287c-0.5178,-0.2589 -3.04726,-1.49644 -3.52105,-1.66732c-0.4712,-0.17346 -0.81554,-0.2589 -1.15987,0.2589c-0.34175,0.51004 -1.33075,1.66474 -1.63108,2.00648c-0.30032,0.33658 -0.60064,0.36247 -1.11327,0.12945c-0.5178,-0.2589 -2.17994,-0.80259 -4.14759,-2.56312c-1.53269,-1.37217 -2.56312,-3.05503 -2.86603,-3.57283c-0.30033,-0.5178 -0.03366,-0.80259 0.22524,-1.06149c0.23301,-0.23301 0.5178,-0.59547 0.7767,-0.90616c0.25372,-0.31068 0.33657,-0.5178 0.51262,-0.85437c0.17088,-0.36246 0.08544,-0.64725 -0.04402,-0.90615c-0.12945,-0.2589 -1.15987,-2.79613 -1.58964,-3.80584c-0.41424,-1.00971 -0.84142,-0.88027 -1.15987,-0.88027c-0.29773,-0.02588 -0.64208,-0.02588 -0.98382,-0.02588c-0.34693,0 -0.90616,0.12945 -1.37736,0.62136c-0.4712,0.5178 -1.80194,1.76053 -1.80194,4.27186c0,2.51134 1.84596,4.945 2.10227,5.30747c0.2589,0.33657 3.63497,5.51458 8.80262,7.74113c1.23237,0.5178 2.1903,0.82848 2.94111,1.08738c1.23237,0.38836 2.35599,0.33657 3.24402,0.20712c0.99159,-0.15534 3.04985,-1.24272 3.47963,-2.45956c0.44013,-1.21683 0.44013,-2.22654 0.31068,-2.45955c-0.12945,-0.23301 -0.46601,-0.36247 -0.98382,-0.59548m-9.40068,12.84407l-0.02589,0c-3.05503,0 -6.08417,-0.82849 -8.72495,-2.38189l-0.62136,-0.37023l-6.47252,1.68286l1.73463,-6.29129l-0.41424,-0.64725c-1.70875,-2.71846 -2.6149,-5.85116 -2.6149,-9.07706c0,-9.39809 7.68934,-17.06155 17.15993,-17.06155c4.58253,0 8.88029,1.78642 12.11655,5.02268c3.23625,3.21036 5.02267,7.50812 5.02267,12.06476c-0.0078,9.3981 -7.69712,17.06155 -17.14699,17.06155m14.58906,-31.58846c-3.93529,-3.80584 -9.1133,-5.95471 -14.62789,-5.95471c-11.36055,0 -20.60848,9.2065 -20.61625,20.52564c0,3.61684 0.94757,7.14565 2.75211,10.26282l-2.92557,10.63564l10.93337,-2.85309c3.0136,1.63108 6.4052,2.4958 9.85634,2.49839l0.01037,0c11.36574,0 20.61884,-9.2091 20.62403,-20.53082c0,-5.48093 -2.14111,-10.64081 -6.03239,-14.51915"
                                            fill="white"
                                          ></path>
                                        </g>
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="social-share__share-count">
                                    &nbsp;
                                  </div>
                                </a>
                              ) : null}
                              {props.pageData.appSettings[
                                "contact_linkedin_url"
                              ] ? (
                                <a
                                  className="social-share"
                                  target="_blank"
                                  href={
                                    props.pageData.appSettings[
                                      "contact_linkedin_url"
                                    ]
                                  }
                                >
                                  <div
                                    aria-label="linkedin"
                                    role="button"
                                    className="SocialMediaShareButton SocialMediaShareButton--linkedin social-share__share-button"
                                  >
                                    <div
                                      style={{ width: "40px", height: "40px" }}
                                    >
                                      <svg
                                        viewBox="0 0 64 64"
                                        width="40"
                                        height="40"
                                        className="social-icon social-icon--linkedin "
                                      >
                                        <g>
                                          <rect
                                            width="64"
                                            height="64"
                                            rx="0"
                                            ry="0"
                                            fill="#007fb1"
                                          ></rect>
                                        </g>
                                        <g>
                                          <path
                                            d="M20.4,44h5.4V26.6h-5.4V44z M23.1,18c-1.7,0-3.1,1.4-3.1,3.1c0,1.7,1.4,3.1,3.1,3.1 c1.7,0,3.1-1.4,3.1-3.1C26.2,19.4,24.8,18,23.1,18z M39.5,26.2c-2.6,0-4.4,1.4-5.1,2.8h-0.1v-2.4h-5.2V44h5.4v-8.6 c0-2.3,0.4-4.5,3.2-4.5c2.8,0,2.8,2.6,2.8,4.6V44H46v-9.5C46,29.8,45,26.2,39.5,26.2z"
                                            fill="white"
                                          ></path>
                                        </g>
                                      </svg>
                                    </div>
                                  </div>
                                </a>
                              ) : null}
                              {props.pageData.appSettings[
                                "contact_pinterest_url"
                              ] ? (
                                <a
                                  className="social-share"
                                  target="_blank"
                                  href={
                                    props.pageData.appSettings[
                                      "contact_pinterest_url"
                                    ]
                                  }
                                >
                                  <div
                                    aria-label="pinterest"
                                    role="button"
                                    className="SocialMediaShareButton SocialMediaShareButton--pinterest social-share__share-button"
                                  >
                                    <div
                                      style={{ width: "40px", height: "40px" }}
                                    >
                                      <svg
                                        viewBox="0 0 64 64"
                                        width="40"
                                        height="40"
                                        className="social-icon social-icon--pinterest "
                                      >
                                        <g>
                                          <rect
                                            width="64"
                                            height="64"
                                            rx="0"
                                            ry="0"
                                            fill="#cb2128"
                                          ></rect>
                                        </g>
                                        <g>
                                          <path
                                            d="M32,16c-8.8,0-16,7.2-16,16c0,6.6,3.9,12.2,9.6,14.7c0-1.1,0-2.5,0.3-3.7 c0.3-1.3,2.1-8.7,2.1-8.7s-0.5-1-0.5-2.5c0-2.4,1.4-4.1,3.1-4.1c1.5,0,2.2,1.1,2.2,2.4c0,1.5-0.9,3.7-1.4,5.7 c-0.4,1.7,0.9,3.1,2.5,3.1c3,0,5.1-3.9,5.1-8.5c0-3.5-2.4-6.1-6.7-6.1c-4.9,0-7.9,3.6-7.9,7.7c0,1.4,0.4,2.4,1.1,3.1 c0.3,0.3,0.3,0.5,0.2,0.9c-0.1,0.3-0.3,1-0.3,1.3c-0.1,0.4-0.4,0.6-0.8,0.4c-2.2-0.9-3.3-3.4-3.3-6.1c0-4.5,3.8-10,11.4-10 c6.1,0,10.1,4.4,10.1,9.2c0,6.3-3.5,11-8.6,11c-1.7,0-3.4-0.9-3.9-2c0,0-0.9,3.7-1.1,4.4c-0.3,1.2-1,2.5-1.6,3.4 c1.4,0.4,3,0.7,4.5,0.7c8.8,0,16-7.2,16-16C48,23.2,40.8,16,32,16z"
                                            fill="white"
                                          ></path>
                                        </g>
                                      </svg>
                                    </div>
                                  </div>
                                </a>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withGoogleReCaptcha(Index);
