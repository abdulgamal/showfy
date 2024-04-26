import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";
import dynamic from "next/dynamic";
import Router, { withRouter } from "next/router";
import SocialLogin from "../SocialLogin/Index";
import { updateObject } from "../../shared/validate";
import Error from "../../containers/Error/Error";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import imageCompression from "browser-image-compression";
import timezones from "../../utils/timezone";
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
});
const CoverImages = dynamic(
  () => import("../../containers/OpenAI/CoverImages"),
  {
    ssr: false,
  }
);
import "react-phone-number-input/style.css";
import OtpInput from "react18-otp-input";
const { BroadcastChannel } = require("broadcast-channel");

import { withGoogleReCaptcha } from "react-google-recaptcha-v3";

const Form = (props) => {
  const resendInterval = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      orgCode: "",
      fields: {
        email: {
          value: "",
          error: null,
        },
        timezone: {
          value: props.pageData.appSettings["member_default_timezone"],
          error: null,
        },
        username: {
          value: "",
          error: null,
        },
        password: {
          value: "",
          error: null,
        },
        first_name: {
          value: "",
          error: null,
        },
        last_name: {
          value: "",
          error: null,
        },
        gender: {
          value: "male",
          error: null,
        },
        accept: {
          value: "",
          error: null,
        },
        subscribe: {
          value: true,
          error: null,
        },
        file: {
          value: "",
          error: null,
        },
        phone_number: {
          value: "",
          error: null,
        },
      },
      isSubmit: false,
      errors: null,
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
      if (
        email == state.fields.email.value &&
        phone == state.fields.phone_number.value &&
        !error
      ) {
        setState({ orgCode: code, otpTimer: 0, disableButtonSubmit: false });
        if (resendInterval.current) {
          clearInterval(resendInterval.current);
        }
        resendInterval.current = setInterval(() => updateResendTimer(), 1000);
      } else if (error) {
        if (resendInterval.current) {
          clearInterval(resendInterval.current);
        }
        let key = "phone_number";
        setState({
          fields: updateObject(state.fields, {
            [key]: updateObject(state.fields[key], {
              value: state.fields.phone_number.value,
              error: Translate(props, error),
            }),
          }),
          otpValidate: false,
          otpValue: "",
          otpError: false,
        });
      }
    };
    props.socket.on("otpCode", otpFn);

    return () => props.socket.off("otpCode", otpFn);
  }, [state.fields]);

  const forgot = () => {
    try {
      if ($("#loginpop").css("display") == "block")
        document.getElementById("closeloginRgtrBoxPopupForm").click();
      if ($("#registerpop").css("display") == "block")
        document.getElementById("closeregistertrBoxPopupForm").click();
    } catch (err) {
      console.log(err);
    }
  };

  const updateResendTimer = () => {
    if (state.otpTimer >= 60) {
      setState({ disableButtonSubmit: true, otpTimer: 0 });
      clearInterval(resendInterval.current);
    } else {
      setState({ otpTimer: state.otpTimer + 1 });
    }
  };
  const onChange = (e, key) => {
    if (key == "file") {
      var url = e.target.value;
      var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
      if (
        e.target.files &&
        e.target.files[0] &&
        (ext == "png" ||
          ext == "jpeg" ||
          ext == "jpg" ||
          ext == "PNG" ||
          ext == "JPEG" ||
          ext == "JPG" ||
          ext == "gif" ||
          ext == "GIF")
      ) {
        setState({
          fields: updateObject(state.fields, {
            [key]: updateObject(state.fields[key], {
              value: e.target.files[0],
              error: null,
            }),
          }),
        });
        return;
      } else {
        setState({
          fields: updateObject(state.fields, {
            [key]: updateObject(state.fields[key], {
              value: "",
              error: Translate(
                props,
                "Please select png,jpeg or gif file only."
              ),
            }),
          }),
        });

        return;
      }
    }
    setState({
      fields: updateObject(state.fields, {
        [key]: updateObject(state.fields[key], {
          value:
            key == "subscribe"
              ? !state.fields.subscribe.value
              : key == "accept"
              ? !state.fields.accept.value
              : e.target.value,
          error: null,
        }),
      }),
    });
  };
  const phoneNumber = (value) => {
    if (value || !state.fields.phone_number.value) {
      setState({
        fields: updateObject(state.fields, {
          ["phone_number"]: updateObject(state.fields["phone_number"], {
            value: value,
            error: "",
          }),
        }),
      });
    } else if ( 
      props.pageData.appSettings["signup_phone_number_required"] == 1
    ) {
      setState({
        fields: updateObject(state.fields, {
          ["phone_number"]: updateObject(state.fields["phone_number"], {
            value: "",
            error: Translate(props, "Phone Number should not be empty."),
          }),
        }),
      });
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    const currentState = { ...state.fields };
    if (!state.fields.first_name.value) {
      isValid = false;
      currentState["first_name"]["error"] = Translate(
        props,
        "First Name should not be empty."
      );
    }
    if (!state.fields.file.value && parseInt(props.pageData.appSettings["signup_form_image_required"],10) == 1) {
      isValid = false;
      currentState["file"]["error"] = Translate(
        props,
        "Profile Image should not be empty."
      );
    }
    if (!state.fields.accept.value) {
      isValid = false;
      currentState["accept"]["error"] = Translate(
        props,
        "Please agree to the Terms of Service & Privacy Policy."
      );
    }
    if (!state.fields.email.value) {
      //email error
      currentState["email"]["error"] = Translate(
        props,
        "Email Id should not be empty."
      );
      isValid = false;
    } else if (state.fields.email.value) {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!pattern.test(state.fields.email.value)) {
        //invalid email
        currentState["email"]["error"] = Translate(
          props,
          "Please enter valid Email ID."
        );
        isValid = false;
      }
    }
    if (!state.fields.password.value) {
      isValid = false;
      currentState["password"]["error"] = Translate(
        props,
        "Password should not be empty."
      );
    }

    if (
      props.pageData.appSettings["twillio_enable"] == 1 &&
      props.pageData.appSettings["signup_phone_number"] == 1
    ) {
      if (
        !state.fields.phone_number.value &&
        props.pageData.appSettings["signup_phone_number_required"] == 1
      ) {
        isValid = false;
        currentState["phone_number"]["error"] = Translate(
          props,
          "Phone Number should not be empty."
        );
      } else if (state.fields.phone_number.value) {
        let checkError = false; // isValidPhoneNumber(state.fields.phone_number.value) ? undefined : 'Invalid phone number';
        if (checkError)
          currentState["phone_number"]["error"] = Translate(
            props,
            "Enter valid Phone Number."
          );
      }
    }

    if (!isValid) {
      setState({ fields: currentState });
      return;
    }
    if (
      props.pageData.appSettings["recaptcha_enable"] == 1 &&
      props.pageData.appSettings["recaptcha_signup_enable"] == 1
    ) {
      let isSubmit = true;
      if (
        state.fields.phone_number.value &&
        props.pageData.appSettings["twillio_enable"] == 1 &&
        props.pageData.appSettings["signup_phone_number"] == 1
      ) {
        //validate phone number
        validatePhoneNumber();
        isSubmit = false;
      } else {
        createUser();
      }
      // setState({getCaptchaToken:true,isSubmit:isSubmit,keyCaptcha: state.keyCaptcha + 1});
    } else if (
      state.fields.phone_number.value &&
      props.pageData.appSettings["twillio_enable"] == 1 &&
      props.pageData.appSettings["signup_phone_number"] == 1
    ) {
      //validate phone number
      validatePhoneNumber();
    } else {
      createUser();
    }

    return false;
  };

  const validatePhoneNumber = async () => {
    resendOTP();
    setState({ otpValidate: true });
  };

  const createUser = async () => {
    const currentState = { ...state.fields };
    setState({ isSubmit: true, otpValidate: false, otpError: false });

    //SEND FORM REQUEST
    const querystring = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    for (let controlName in currentState) {
      let value = currentState[controlName].value;
      if (value) {
        if (controlName == "username") {
          value = changedUsername(value);
        }
        if (controlName == "file") {
          if (typeof value == "string") {
            querystring.append(controlName, value);
          } else {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1200,
              useWebWorker: true,
            };
            var ext = value.name
              .substring(value.name.lastIndexOf(".") + 1)
              .toLowerCase();
            let compressedFile = value;
            if (ext != "gif" && ext != "GIF") {
              try {
                compressedFile = await imageCompression(value, options);
              } catch (error) {}
            }
            querystring.append(controlName, compressedFile, value.name);
          }
        } else {
          querystring.append(controlName, value);
        }
      }
    }
    if (props.pageData.code) {
      querystring.append("code", props.pageData.code);
    }

    if (
      props.pageData.appSettings["recaptcha_enable"] == 1 &&
      props.pageData.appSettings["recaptcha_signup_enable"] == 1
    ) {
      const { executeRecaptcha } = props.googleReCaptchaProps;
      const result = await executeRecaptcha("signup");
      querystring.append("captchaToken", result);
    }

    if (state.otpValue) querystring.append("otpValue", state.otpValue);
    axios
      .post("/signup", querystring, config)
      .then((response) => {
        setState({ isSubmit: false });
        if (response.data.error) {
          //error
          setState({ errors: response.data.error, otpValue: "" });
        } else {
          if (response.data.emailVerification) {
            Router.push(`/verify-account`);
          } else {
            const userChannel = new BroadcastChannel("user");
            userChannel.postMessage({
              payload: {
                type: "LOGIN",
              },
            });
            const currentPath = Router.asPath;
            //success
            $("body").removeClass("modal-open");
            $("body").removeAttr("style");
            $("#registerpop")
              .find(".loginRgtrBoxPopup")
              .find("button")
              .eq(0)
              .trigger("click");
            // if (currentPath == "/" || currentPath == "/signup")
            //     Router.push('/')
            // else {
            //     Router.push(Router.asPath)
            // }
          }
        }
      })
      .catch((err) => {
        setState({ errors: err, otpValue: "" });
        //error
      });
  };

  const changedUsername = (value) => {
    value = value.replace(/[^a-z0-9]/gi, "");
    if (!value) value = "username";
    return value;
  };
  const removeImage = (e, key) => {
    setState({
      fields: updateObject(state.fields, {
        ["file"]: updateObject(state.fields["file"], {
          value: "",
          error: null,
        }),
      }),
    });
    $("#signup_file").val("");
  };
  const handleOTPChange = (value) => {
    setState({ otpValue: value, otpError: false });
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

    querystring.append("email", state.fields.email.value);
    querystring.append("phone", state.fields.phone_number.value);

    axios
      .post("/users/otp", querystring, config)
      .then((response) => {})
      .catch((err) => {});
  };
  const codeValidate = () => {
    if (state.otpValue && state.orgCode && state.otpValue == state.orgCode) {
      createUser();
    }
  };

  let errorMessage = null;
  let errorDiv = null;
  if (state.errors) {
    errorMessage = state.errors.map((value, index, array) => {
      return <Error {...props} message={value.message} key={index}></Error>;
    });
    errorDiv = <div className="form-error">{errorMessage}</div>;
  }

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

  var createObjectURL =
    (URL || webkitURL || {}).createObjectURL || function () {};

  let chooseImages = null;
  if (state.chooseImages) {
    chooseImages = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Select Image")}</h2>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setState({ chooseImages: null });
                  }}
                  className="_close"
                >
                  <i></i>
                </a>
              </div>
              <CoverImages
                data={{
                  type: state.chooseImages,
                  key: state.chooseImages,
                }}
                {...props}
                setValue={(_keyname, value) => {
                  let key = "file";
                  setState({
                    fields: updateObject(state.fields, {
                      [key]: updateObject(state.fields[key], {
                        value: props.pageData.imageSuffix + value,
                        error: null,
                      }),
                    }),
                  });
                  setState({ chooseImages: null });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {chooseImages}
      {otpHMTL}
      {props.pageData.appSettings["member_registeration"] == 1 ? (
        <SocialLogin {...props} />
      ) : null}
      <div className="form loginBox signup-form">
        <form
          onSubmit={(e) => {
            onSubmit(e);
          }}
        >
          {errorDiv}
          <div className="row">
            <div
              className={`col-sm-${
                props.pageData.appSettings["signup_form_lastname"] == 1
                  ? "6"
                  : "12"
              }`}
            >
              <div className="form-group">
                <input
                  value={state.fields.first_name.value}
                  onChange={(e) => {
                    onChange(e, "first_name");
                  }}
                  className="form-control"
                  type="text"
                  placeholder={Translate(props, "First Name")}
                  name="first_name"
                />
                {state.fields.first_name.error ? (
                  <p className="form_error">{state.fields.first_name.error}</p>
                ) : null}
              </div>
            </div>
            {props.pageData.appSettings["signup_form_lastname"] == 1 ? (
              <div className="col-sm-6">
                <div className="form-group">
                  <input
                    value={state.fields.last_name.value}
                    onChange={(e) => {
                      onChange(e, "last_name");
                    }}
                    className="form-control"
                    type="text"
                    placeholder={Translate(props, "Last Name")}
                    name="last_name"
                  />
                  {state.fields.last_name.error ? (
                    <p className="form_error">{state.fields.last_name.error}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="form-group">
                <input
                  className="form-control"
                  value={state.fields.email.value}
                  type="text"
                  onChange={(e) => {
                    onChange(e, "email");
                  }}
                  placeholder={Translate(props, "Email")}
                  name="email"
                />
                {state.fields.email.error ? (
                  <p className="form_error">{state.fields.email.error}</p>
                ) : null}
              </div>
            </div>
          </div>
          {props.pageData.appSettings["signup_phone_number"] == 1 &&
          props.pageData.appSettings["twillio_enable"] == 1 ? (
            <div className="row">
              <div className="col-sm-12">
                <div className="form-group">
                  <PhoneInput
                    countryCallingCodeEditable={false}
                    countrySelectProps={{ unicodeFlags: true }}
                    placeholder={Translate(props, "Phone Number")}
                    value={state.fields.phone_number.value}
                    onChange={(e) => {
                      phoneNumber(e);
                    }}
                  />
                  {state.fields.phone_number.error ? (
                    <p className="form_error">
                      {state.fields.phone_number.error}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          {props.pageData.appSettings["signup_form_username"] == 1 ? (
            <div className="row">
              <div className="col-sm-12">
                <div className="form-group">
                  <input
                    className="form-control"
                    value={state.fields.username.value}
                    type="text"
                    onChange={(e) => {
                      onChange(e, "username");
                    }}
                    placeholder={Translate(props, "Username")}
                    name="username"
                  />
                  <p className="website_signup_link">
                    {Translate(
                      props,
                      "This will be the end of your profile link, for example:"
                    )}{" "}
                    {`${
                      process.env.PUBLIC_URL
                        ? process.env.PUBLIC_URL
                        : window.location.protocol + "//" + window.location.host
                    }` +
                      "/" +
                      changedUsername(state.fields.username.value)}
                  </p>
                  {state.fields.username.error ? (
                    <p className="form_error">{state.fields.username.error}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {props.pageData.appSettings["signup_form_timezone"] == 1 ? (
            <div className="row">
              <div className="col-sm-6">
                <div className="form-group">
                  <input
                    className="form-control"
                    value={state.fields.password.value}
                    autoComplete="off"
                    onChange={(e) => {
                      onChange(e, "password");
                    }}
                    type="password"
                    placeholder={Translate(props, "Password")}
                    name="password"
                  />
                  {state.fields.password.error ? (
                    <p className="form_error">
                      {Translate(props, state.fields.password.error)}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <select
                    name="timezone"
                    className="form-control form-select"
                    value={state.fields.timezone.value}
                    onChange={(e) => {
                      onChange(e, "timezone");
                    }}
                  >
                    {timezones.timezones.map((item) => {
                      return (
                        <option value={item.value} key={item.value}>
                          {item.label}
                        </option>
                      );
                    })}
                  </select>
                  {state.fields.password.error ? (
                    <p className="form_error">
                      {Translate(props, state.fields.password.error)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-sm-12">
                <div className="form-group">
                  <input
                    className="form-control"
                    value={state.fields.password.value}
                    autoComplete="off"
                    onChange={(e) => {
                      onChange(e, "password");
                    }}
                    type="password"
                    placeholder={Translate(props, "Password")}
                    name="password"
                  />
                  {state.fields.password.error ? (
                    <p className="form_error">
                      {Translate(props, state.fields.password.error)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
          {props.pageData.appSettings["signup_form_gender"] == 1 ? (
            <div className="row gy-2 mt-2 mb-3">
              <div className="col-sm-12">
                <label htmlFor="file">{Translate(props, "Gender")}</label>
              </div>
              <div className="col-sm-12">
                <input
                  className="genter_signup"
                  type="radio"
                  checked={state.fields.gender.value == "male"}
                  onChange={(e) => {
                    onChange(e, "gender");
                  }}
                  id="male"
                  value="male"
                />
                <label htmlFor="male">{Translate(props, "Male")}</label>
                <input
                  className="genter_signup"
                  type="radio"
                  checked={state.fields.gender.value == "female"}
                  onChange={(e) => {
                    onChange(e, "gender");
                  }}
                  id="female"
                  value="female"
                />
                <label htmlFor="female">{Translate(props, "Female")}</label>
              </div>
            </div>
          ) : null}
          {props.pageData.appSettings["signup_form_image"] == 1 ? (
            <div className="row mb-2">
              <div className="col-sm-12">
                <label htmlFor="file">
                  {Translate(props, "Profile Image")}
                </label>
                {props.pageData.appSettings.avtarAIEnabled == 1 && (
                  <div className="floatR mb-2" style={{ marginTop: "-10px" }}>
                    <button
                      type="button"
                      className=""
                      onClick={(e) => {
                        e.preventDefault();
                        setState({ chooseImages: "image" });
                      }}
                    >
                      {props.t("Choose Image")}
                    </button>
                  </div>
                )}
              </div>
              {!state.fields.file.value ? (
                <div className="col-sm-12 clear">
                  <input
                    className="form-control"
                    type="file"
                    id="signup_file"
                    accept="image/*"
                    onChange={(e) => {
                      onChange(e, "file");
                    }}
                  />

                  {state.fields.file.error ? (
                    <p className="form_error">
                      {Translate(props, state.fields.file.error)}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {state.fields.file.value ? (
                <div className="col-sm-12 clear">
                  <div className="previewRgisterImg">
                    <img
                      src={
                        typeof state.fields.file.value == "string"
                          ? state.fields.file.value
                          : createObjectURL(state.fields.file.value)
                      }
                    />
                    <span
                      className="close closePreviewImage"
                      onClick={removeImage}
                    >
                      x
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {props.pageData.appSettings["enable_newsletter"] != 2 ? (
            <div className="row">
              <div className="col-sm-12">
                <div className="form-group">
                  <input
                    id="subscribe"
                    value={state.fields.subscribe.value}
                    onChange={(e) => {
                      onChange(e, "subscribe");
                    }}
                    type="checkbox"
                    name="subscribe"
                  />
                  <label htmlFor="subscribe">
                    &nbsp;{Translate(props, "Subscribe to newsletter")}
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          <div className="row">
            <div className="col-sm-12">
              <div className="form-group">
                <input
                  id="accept"
                  value={state.fields.accept.value}
                  onChange={(e) => {
                    onChange(e, "accept");
                  }}
                  type="checkbox"
                  name="accept"
                />
                <label className="signup_accept" htmlFor="accept">
                  {Translate(
                    props,
                    "By creating your account, you agree to our "
                  )}
                  <Link href="/terms">
                    <a onClick={forgot}>
                      {Translate(props, "Terms of Service")}
                    </a>
                  </Link>
                  {" & "}{" "}
                  <Link href="/privacy">
                    <a onClick={forgot}>{Translate(props, "Privacy Policy")}</a>
                  </Link>
                </label>
                {state.fields.accept.error ? (
                  <p className="form_error">
                    {Translate(props, state.fields.accept.error)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-sm-12">
              <button className="btn btn-default btn-login" type="submit">
                {state.isSubmit
                  ? Translate(props, "Registering ...")
                  : Translate(props, "Register")}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="forgot">
        {props.router.asPath == "/login" || props.router.asPath == "/signup" ? (
          <Link href="/login">
            <a>{Translate(props, "Already have an account login?")}</a>
          </Link>
        ) : (
          <a
            href="/login"
            id="loginbtn"
            data-bs-dismiss="modal"
            data-bs-target="#loginpop"
            data-bs-toggle="modal"
          >
            {Translate(props, "Already have an account login?")}
          </a>
        )}
        <Link href="/forgot">
          <a className="forgot-btn-signup" onClick={forgot}>
            {Translate(props, "forgot password?")}
          </a>
        </Link>
      </div>
    </React.Fragment>
  );
};

export default withRouter(withGoogleReCaptcha(Form));
