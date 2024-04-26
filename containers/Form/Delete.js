import React, { useReducer, useEffect, useRef } from "react";
import Form from "../../components/DynamicForm/Index";
import Validator from "../../validators";
import axios from "../../axios-orders";
import Router from "next/router";
import Translate from "../../components/Translate/Index";
import OtpInput from "react18-otp-input";

const General = (props) => {
  const myRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      title: "Delete Account",
      success: false,
      error: null,
      loading: true,
      member: props.member,
      submitting: false,
      otpTimer: 0,
    }
  );

  useEffect(() => {
    props.socket.on("userDeleted", (socketdata) => {
      let id = socketdata.user_id;
      let message = socketdata.message;
      if (id == state.member.user_id) {
        props.openToast({message:Translate(props, message), type:"success"});
        Router.push(`/`);
      }
    });
    props.socket.on("otpCode", (socketdata) => {
      let email = socketdata.email;
      let code = socketdata.code;
      let phone = socketdata.phone;
      let error = socketdata.error;
      if (
        email == state.member.email &&
        phone == state.member.phone_number &&
        !error
      ) {
        const resendInterval = setInterval(() => updateResendTimer(), 1000);
        if (state.resendInterval) {
          clearInterval(state.resendInterval);
        }
        setState({
          orgCode: code,
          otpTimer: 0,
          disableButtonSubmit: false,
          resendInterval: resendInterval,
        });
        //set timer to resend code
      } else if (error) {
        if (state.resendInterval) {
          clearInterval(state.resendInterval);
        }
        setState({
          error: Translate(props, error),
          otpValidate: false,
          otpValue: "",
          otpError: false,
        });
      }
    });
  }, []);

  const updateResendTimer = () => {
    if (state.otpTimer >= 60) {
      setState({ disableButtonSubmit: true, otpTimer: 0 });
      clearInterval(state.resendInterval);
    } else {
      setState({ otpTimer: state.otpTimer + 1 });
    }
  };
  const deleteUser = (model) => {
    let formData = new FormData();
    for (var key in model) {
      if (model[key]) formData.append(key, model[key]);
    }

    formData.append("user_id", state.member.user_id);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/members/delete";

    setState({ submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({
            error: response.data.error,
            submitting: false,
            otpValidate: false,
            otpValue: "",
            otpError: false,
          });
        } else {
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };
  const onSubmit = (model) => {
    if (state.submitting) {
      return;
    }

    if (
      state.member.phone_number &&
      props.pageData.appSettings["twillio_enable"] == 1
    ) {
      //validate phone number
      validatePhoneNumber(model);
    } else {
      deleteUser(model);
    }
  };

  const validatePhoneNumber = async (model) => {
    resendOTP(model);
    setState({ otpValidate: true, model: model });
  };

  const closePopup = (e) => {
    setState({ otpValidate: false, otpValue: "", otpError: false });
  };
  const resendOTP = (model) => {
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

    querystring.append("email", state.member.email);
    querystring.append("phone", state.member.phone_number);
    querystring.append("type", "delete");

    axios
      .post("/users/otp", querystring, config)
      .then((response) => {})
      .catch((err) => {});
  };
  const codeValidate = () => {
    if (state.otpValue && state.orgCode && state.otpValue == state.orgCode) {
      deleteUser(state.model);
    }
  };
  const handleOTPChange = (value) => {
    setState({ otpValue: value, otpError: false });
  };

  let validator = [];

  validator.push({
    key: "password",
    validations: [
      {
        validator: Validator.required,
        message: "Password is required field",
      },
    ],
  });
  let formFields = [];

  formFields.push({
    key: "password",
    label: "Current Password",
    type: "password",
    isRequired: true,
  });

  let initalValues = {};

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
      <div ref={myRef}>
        <Form
          editItem={state.editItem}
          className="form"
          title={state.title}
          initalValues={initalValues}
          validators={validator}
          submitText={!state.submitting ? "Delete" : "Deleting..."}
          model={formFields}
          {...props}
          generalError={state.error}
          onSubmit={(model) => {
            onSubmit(model);
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default General;
