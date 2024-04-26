import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";
import dynamic from "next/dynamic";
import Router from "next/router";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
});
import "react-phone-number-input/style.css";
import OtpInput from "react18-otp-input";
import { withGoogleReCaptcha } from "react-google-recaptcha-v3";

const Form = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      email: "",
      emailError: null,
      isSubmit: false,
      previousUrl: typeof window != "undefined" ? Router.asPath : "",
      successMessage: null,

      otpEnable: props.pageData.appSettings["twillio_enable"] == 1,
      type: "email",
      phone_number: "",
      disableButtonSubmit: false,
      otpTimer: 0,
      getCaptchaToken: true,
      firstToken: true,
      keyCaptcha: 1,
    }
  );
  useEffect(() => {
    const otpFn = (data) => {
      let email = data.email;
      let code = data.code;
      let phone = data.phone;
      let error = data.error;
      if (phone == state.phone_number && !error) {
        let timer = setInterval(() => updateResendTimer(), 1000);
        if (state.resendInterval) {
          clearInterval(state.resendInterval);
        }
        setState({
          orgCode: code,
          otpTimer: 0,
          disableButtonSubmit: false,
          resendInterval: timer,
        });
        //set timer to resend code
      } else if (error) {
        if (state.resendInterval) {
          clearInterval(state.resendInterval);
        }
        setState({
          emailError: Translate(props, error),
          otpValidate: false,
          otpVerificationValidate: false,
          otpValue: "",
          otpError: false,
        });
      }
    };
    props.socket.on("otpCode", otpFn);
    return () => props.socket.off("otpCode", otpFn);
  }, [state.phone_number]);

  const updateResendTimer = () => {
    if (state.otpTimer >= 60) {
      setState({ disableButtonSubmit: true, otpTimer: 0 });
      clearInterval(state.resendInterval);
    } else {
      setState({ otpTimer: state.otpTimer + 1 });
    }
  };

  const validatePhoneNumber = async () => {
    resendOTP();
    setState({ otpValidate: true });
  };

  const closePopup = (e) => {
    setState({
      otpValidate: false,
      otpValue: "",
      otpError: false,
      otpTimer: 0,
    });
  };
  const resendOTP = () => {
    if (state.otpTimer != 0) {
      return;
    }
    //SEND FORM REQUEST
    const querystring = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    querystring.append("phone", state.phone_number);
    querystring.append("type", "forgot");

    axios
      .post("/users/otp", querystring, config)
      .then((response) => {})
      .catch((err) => {});
  };
  const codeValidate = () => {
    if (state.otpValue && state.orgCode && state.otpValue == state.orgCode) {
      forgotPassword();
    }
  };
  const handleOTPChange = (value) => {
    setState({ otpValue: value, otpError: false });
  };

  const onChange = (e) => {
    setState({ email: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (state.isSubmit) {
      return false;
    }
    let valid = true;
    let emailError = null;
    if (state.type == "email") {
      if (!state.email) {
        //email error
        emailError = Translate(props, "Please enter valid Email Address.");
        valid = false;
      } else if (state.email) {
        const pattern =
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!pattern.test(state.email)) {
          //invalid email
          emailError = Translate(props, "Please enter valid Email Address.");
          valid = false;
        }
      }
    } else {
      if (!state.phone_number) {
        //email error
        emailError = Translate(props, "Enter valid Phone Number.");
        valid = false;
      } else {
        let checkError = false; //isValidPhoneNumber(state.phone_number) ? undefined : 'Invalid phone number';
        if (checkError) {
          valid = false;
          emailError = Translate(props, "Enter valid Phone Number.");
        }
      }
    }
    setState({ emailError: emailError });
    if (valid) {
      if (
        props.pageData.appSettings["recaptcha_enable"] == 1 &&
        props.pageData.appSettings["recaptcha_forgotpassword_enable"] == 1
      ) {
        let isSubmit = true;
        if (state.type != "email") {
          //validate phone number
          validatePhoneNumber();
          isSubmit = false;
        } else {
          forgotPassword();
        }
        setState({ isSubmit: isSubmit });
      } else if (state.type != "email") {
        //validate phone number
        validatePhoneNumber();
      } else {
        forgotPassword();
      }
    }
    return false;
  };
  const forgotPassword = async () => {
    setState({ isSubmit: true });
    //SEND FORM REQUEST
    const querystring = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (state.type == "phone") {
      querystring.append("phone", state.phone_number);
    } else {
      querystring.append("email", state.email);
    }

    if (
      props.pageData.appSettings["recaptcha_enable"] == 1 &&
      props.pageData.appSettings["recaptcha_forgotpassword_enable"] == 1
    ) {
      const { executeRecaptcha } = props.googleReCaptchaProps;
      const result = await executeRecaptcha("forgot");
      querystring.append("captchaToken", result);
    }

    axios
      .post("/forgot", querystring, config)
      .then((response) => {
        setState({ isSubmit: false });
        if (response.data.error) {
          //error
          if (state.type == "email")
            setState({
              emailError: Translate(
                props,
                "A user account with that email was not found."
              ),
            });
          else
            setState({
              emailError: Translate(
                props,
                "A user account with that phone number was not found."
              ),
            });
        } else {
          if (state.type == "email")
            setState({
              emailError: null,
              successMessage: Translate(
                props,
                "You have been sent an email with instructions how to reset your password. If the email does not arrive within several minutes, be sure to check your spam or junk mail folders."
              ),
            });
          else {
            setState({
              emailError: null,
              successMessage: Translate(
                props,
                "You have been sent an email with instructions how to reset your password. If the email does not arrive within several minutes, be sure to check your spam or junk mail folders."
              ),
            });
            Router.push(`/reset/${response.data.code}`);
          }
        }
      })
      .catch((err) => {
        if (state.type == "email")
          setState({
            emailError: Translate(
              props,
              "A user account with that email was not found."
            ),
          });
        else
          setState({
            emailError: Translate(
              props,
              "A user account with that phone number was not found."
            ),
          });
        //error
      });
  };
  const setToken = (token) => {
    if (state.firstToken) {
      setState({
        captchaToken: token,
        getCaptchaToken: false,
        firstToken: false,
      });
    } else {
      setState({ captchaToken: token, getCaptchaToken: false });
      if (state.type == "email") {
        forgotPassword();
      }
    }
  };

  let otpHMTL = null;

  if (state.otpValidate) {
    otpHMTL = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt otp-cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap phone-otp">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Enter Verification Code")}</h2>
                <a onClick={closePopup} className="_close">
                  <i></i>
                </a>
              </div>
              <p>
                {props.t(
                  "Verification code is valid for {{expiration_time}}.",
                  { expiration_time: `${60 - state.otpTimer} seconds` }
                )}
              </p>
              <OtpInput
                value={state.otpValue}
                onChange={handleOTPChange}
                numInputs={4}
                placeholder="0000"
                inputStyle="form-control"
                hasErrored={state.otpError ? true : false}
                isInputNum={true}
                separator={<span>-</span>}
              />
              <div className="form-group">
                <label htmlFor="name" className="control-label"></label>
                <button type="submit" onClick={codeValidate}>
                  {Translate(props, "Validate Code")}
                </button>
                <button
                  type="submit"
                  onClick={resendOTP}
                  disabled={!state.disableButtonSubmit}
                >
                  {Translate(props, "Resend Code")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {otpHMTL}
      <div className="titleBarTop">
        <div className="titleBarTopBg">
          <img
            src={
              props.pageData["pageInfo"]["banner"]
                ? props.pageData.imageSuffix +
                  props.pageData["pageInfo"]["banner"]
                : props.pageData["subFolder"] + "static/images/breadcumb-bg.jpg"
            }
            alt={props.t("Forgot Password")}
          />
        </div>
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 offset-md-2">
                <div className="titleHeadng">
                  <h1>
                    {props.t("Forgot Password")}{" "}
                    <i className="fas fa-sign-in-alt"></i>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mainContentWrap">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2 position-relative">
              <div className="formBoxtop loginp">
                <div className="loginformwd">
                  {state.successMessage ? (
                    <p
                      className="form_error"
                      style={{
                        color: "green",
                        margin: "0px",
                        fontSize: "16px",
                      }}
                    >
                      {state.successMessage}
                    </p>
                  ) : (
                    <React.Fragment>
                      {!state.otpEnable ? (
                        <div className="form loginBox">
                          <p>
                            {Translate(
                              props,
                              "If you cannot login because you have forgotten your password, please enter your email address in the field below."
                            )}
                          </p>
                          {state.emailError ? (
                            <p
                              className="form_error"
                              style={{
                                color: "red",
                                margin: "0px",
                                fontSize: "16px",
                              }}
                            >
                              {Translate(props, state.emailError)}
                            </p>
                          ) : null}
                          <form onSubmit={(e) => onSubmit(e)}>
                            <div className="input-group">
                              <input
                                className="form-control"
                                type="text"
                                onChange={(e) => onChange(e)}
                                value={state.email}
                                placeholder={Translate(props, "Email Address")}
                                name="email"
                              />
                            </div>

                            <div className="input-group forgotBtnBlock">
                              <button
                                className="btn btn-default btn-login"
                                type="submit"
                              >
                                {state.isSubmit
                                  ? Translate(props, "Sending Email ...")
                                  : Translate(props, "Send Email")}
                              </button>{" "}
                              {props.t("or")}{" "}
                              <Link href="/">
                                <a href="/">{Translate(props, "cancel")}</a>
                              </Link>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="form loginBox">
                          <p>
                            {Translate(
                              props,
                              "If you cannot login because you have forgotten your password, please enter your email address / phone number in the field below."
                            )}
                          </p>
                          {state.emailError ? (
                            <p
                              className="form_error"
                              style={{
                                color: "red",
                                margin: "0px",
                                fontSize: "16px",
                              }}
                            >
                              {Translate(props, state.emailError)}
                            </p>
                          ) : null}
                          <form onSubmit={onSubmit}>
                            {state.type == "email" ? (
                              <div className="input-group">
                                <input
                                  className="form-control"
                                  type="text"
                                  onChange={(e) => onChange(e)}
                                  value={state.email}
                                  placeholder={Translate(
                                    props,
                                    "Email Address"
                                  )}
                                  name="email"
                                />
                              </div>
                            ) : (
                              <PhoneInput
                                countryCallingCodeEditable={false}
                                countrySelectProps={{ unicodeFlags: true }}
                                placeholder={Translate(props, "Phone Number")}
                                value={state.phone_number}
                                onChange={(value) =>
                                  setState({ phone_number: value })
                                }
                              />
                            )}
                            {props.pageData.appSettings["recaptcha_enable"] ==
                              1 &&
                            props.pageData.appSettings[
                              "recaptcha_forgotpassword_enable"
                            ] == 1 ? (
                              <GoogleReCaptchaProvider
                                useRecaptchaNet={false}
                                language={props.i18n.language}
                                useEnterprise={
                                  props.pageData.appSettings[
                                    "recaptcha_enterprise"
                                  ] == 1
                                    ? true
                                    : false
                                }
                                reCaptchaKey={
                                  props.pageData.appSettings["recaptcha_key"]
                                }
                                scriptProps={{
                                  async: true,
                                  defer: true,
                                  appendTo: "body",
                                }}
                              >
                                <GoogleRecaptchaIndex
                                  keyCaptcha={state.keyCaptcha}
                                  GoogleReCaptcha={GoogleReCaptcha}
                                  token={setToken}
                                  type="signup"
                                />
                              </GoogleReCaptchaProvider>
                            ) : null}
                            {state.type == "email" ? (
                              <div
                                className="input-group"
                                onClick={() =>
                                  setState({
                                    email: "",
                                    type: "phone",
                                    emailError: null,
                                  })
                                }
                              >
                                <p className="choose-option">
                                  {Translate(props, "Use Phone Number")}
                                </p>
                              </div>
                            ) : (
                              <div
                                className="input-group"
                                onClick={() =>
                                  setState({
                                    phone_number: "",
                                    type: "email",
                                    emailError: null,
                                  })
                                }
                              >
                                <p className="choose-option">
                                  {Translate(props, "Use Email Address")}
                                </p>
                              </div>
                            )}
                            <div className="input-group forgotBtnBlock">
                              <button
                                className="btn btn-default btn-login"
                                type="submit"
                              >
                                {state.type == "email"
                                  ? state.isSubmit
                                    ? Translate(props, "Sending Email ...")
                                    : Translate(props, "Send Email")
                                  : Translate(props, "Continue")}
                              </button>{" "}
                              {props.t("or")}{" "}
                              <Link href="/">
                                <a href="/">{Translate(props, "cancel")}</a>
                              </Link>
                            </div>
                          </form>
                        </div>
                      )}
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withGoogleReCaptcha(Form);
