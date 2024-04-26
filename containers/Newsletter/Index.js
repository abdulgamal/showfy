import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";

import Translate from "../../components/Translate/Index";

const Newsletter = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      email: "",
    }
  );

  const submitForm = (e) => {
    e.preventDefault();
    if (state.submitting || !state.email) {
      return;
    }
    const pattern =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!pattern.test(state.email)) {
      //invalid email
      props.openToast({message:props.t("Please enter valid email."),type: "error"});
      return;
    }
    let formData = new FormData();
    formData.append("email", state.email);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/members/newsletter";
    setState({ submitting: true, error: null });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({ error: response.data.error, submitting: false });
        } else {
          setState({ submitting: false, email: "" });
          props.openToast({message:Translate(props, response.data.message), type:"success"});
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };

  if (props.pageData.appSettings["enable_newsletter"] != 1) {
    return null;
  }
  let image = "static/images/newsletter-bg.jpg";
  if (props.pageData.appSettings["newsletter_background_image"]) {
    image =
      props.pageData.imageSuffix +
      props.pageData.appSettings["newsletter_background_image"];
  }
  return (
    <div
      className="newsletter-wrap newsletter-overlay"
      style={{ backgroundImage: "url('" + image + "')" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2 col-12">
            <div className="newsletter">
              <h2 className="title">{Translate(props, "We move fast")}</h2>
              <p className="text">
                {Translate(
                  props,
                  "Send us your email, we'll make sure you never miss a thing!"
                )}
              </p>
              <form onSubmit={submitForm}>
                <div className="newsleter-input-box">
                  <input
                    type="text"
                    value={state.email}
                    onChange={(e) => {
                      setState({ email: e.target.value });
                    }}
                    placeholder={Translate(props, "Enter your email .......")}
                  />
                  <button type="submit">
                    <i className="far fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
