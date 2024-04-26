import React, { useReducer, useRef } from "react";
import Router from "next/router";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";

import Gateways from "../Gateways/Index";

const OpenAI = (props) => {
  const myRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      data: props.data,
      image_counts: 1,
      words: "",
      balance: parseFloat(
        props.pageData.loggedInUserDetails
          ? props.pageData.loggedInUserDetails.wallet
          : 0
      ),
      gateways: null,
    }
  );

  if (!state.data) return null;
  let type = state.data.type;
  let price = state.data.price;
  let walletAmount = 0;
  if (props.pageData && props.pageData.loggedInUserDetails) {
    walletAmount = parseFloat(props.pageData.loggedInUserDetails.wallet);
  }

  const recharge = (e) => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
      return;
    }
    setState({ adsWallet: true });
  };
  const walletFormSubmit = (e) => {
    e.preventDefault();
    if (!state.walletAmount) {
      return;
    }
    setState({
      adsWallet: false,
      gatewaysURL:
        "/ads/recharge?returnUrl=" +
        props.pageData.currentURL +
        "&amount=" +
        encodeURI(state.walletAmount),
      gateways: true,
    });
  };
  const closeWalletPopup = (e) => {
    setState({ adsWallet: false, walletAmount: 0 });
  };
  const walletValue = (e) => {
    

    let value = parseFloat(e.target.value);

    if (isNaN(value) || value < 1) {
      setState({ walletAmount: parseFloat(value) });
    } else {
      setState({ walletAmount: value });
    }
  };

  let adsWallet = null;
  if (state.adsWallet) {
    adsWallet = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Recharge Wallet")}</h2>
                <a onClick={closeWalletPopup} className="_close">
                  <i></i>
                </a>
              </div>
              <div className="user_wallet">
                <div className="row">
                  <form onSubmit={walletFormSubmit}>
                    <div className="form-group">
                      <label htmlFor="name" className="control-label">
                        {Translate(props, "Enter Amount :")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={state.walletAmount ? state.walletAmount : ""}
                        onChange={walletValue}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="name" className="control-label"></label>
                      <button type="submit" className="rounded-pill">
                        {Translate(props, "Submit")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let gatewaysHTML = "";

  if (state.gateways) {
    gatewaysHTML = (
      <Gateways
        {...props}
        success={() => {
          props.openToast({
            message: Translate(props, "Payment done successfully."),
            type: "success",
          });
          setTimeout(() => {
            Router.push(props.pageData.currentURL);
          }, 1000);
        }}
        successBank={() => {
          props.openToast({
            message: Translate(
              props,
              "Your bank request has been successfully sent, you will get notified once it's approved"
            ),
            type: "success",
          });
          setState({ gateways: null });
        }}
        bank_price={state.walletAmount}
        bank_type="recharge_wallet"
        bank_resource_type="user"
        bank_resource_id={props.pageData.loggedInUserDetails.username}
        tokenURL={`ads/successulPayment?returnUrl=${
          props.pageData.currentURL
        }&amount=${encodeURI(state.walletAmount)}`}
        closePopup={() => setState({ gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  const submitForm = () => {
    if (state.submitting) {
      return;
    }
    let errorValidation = {};
    if (!state.title) {
      errorValidation.errorTitle = "This is required field.";
    }

    if (type != "file") {
      if (!state.words) {
        errorValidation.errorWords = "This is required field.";
      }
    }

    if (Object.keys(errorValidation).length > 0) {
      setState(errorValidation);
      return;
    }
    // send ajax request to backend
    let formData = new FormData();
    formData.append("title", state.title);
    formData.append("words", state.words);
    formData.append("type", type);
    formData.append("image_counts", state.image_counts);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = state.data.url ?? "/ai/content-generate";

    setState({
      submitting: true,
      errorWords: null,
      errorTitle: null,
      error: null,
      files: null,
      imageChecked:null
    });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({ error: response.data.error, submitting: false });
        } else {
          setState({ submitting: false });
          if (type != "file")
            props.setValue(state.data.key, response.data.data);
          else {
            setState({ files: response.data.data });
          }
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err });
      });
  };

  const openImage = (id) => {
    if (typeof lightboxJquery == "undefined") {
      return;
    }

    var items = [];
    state.files.forEach((photo) => {
      items.push({
        src: photo.url,
        type: "image",
      });
    });
    lightboxJquery.magnificPopup.open(
      {
        items: items,
        gallery: {
          enabled: true,
        },
        tCounter: "",
      },
      id
    );
  };

  let walletPrice = walletAmount / price

  if(type == "blog"){
    walletPrice = parseInt(props.pageData.appSettings.openai_blog_description_count,10) || 0
  }
  return (
    <React.Fragment>
      {adsWallet}
      {gatewaysHTML}
      <div className="ai-cnt row m-0">
        {/* <img src="/static/images/ai-image.png" className="position-abosolute w-50" /> */}
        <div className="col-lg-5 left-panel">
          <p>
            {type == "tinymce"
              ? props.t(
                  "You can generate HTML content using AI, describe your content so our AI generator generate content for you."
                )
              : type == "textarea"
              ? props.t(
                  "You can generate content using AI, describe your content so our AI generator generate content for you."
                )
              : type == "file"
              ? props.t(
                  "You can generate images using AI, describe your image so our AI image generator generate images for you."
                )
              : type == "blog" ? 
                props.t("You can generate blog using AI, describe your content so our AI generator generate content for you.")
              : null}
          </p>
          {parseFloat(price) > 0 && (
            <div className="description">
              {
                type == "blog" ? 
                <div>
                  {
                    parseInt(props.pageData.appSettings.openai_blog_description_count) > 0 &&
                      <b>{props.t("Max Word Count: {{count}}",{count:parseInt(props.pageData.appSettings.openai_blog_description_count)})}</b>
                  }
                  <p>{props.t("Blogs")}</p>
                </div>
                : null
              }
              <b className="d-block mb-1">{props.t("Available Balance")}</b>
              {
                type == "blog" ? 
                  <div>
                    <b>{Math.floor(walletAmount / price)}</b>
                    <p>{props.t("Blogs")}</p>
                  </div>
                :
                <div>
                  <b>{Math.floor(walletAmount / price)}</b>
                  <p>{type == "file" ? props.t("Images") : props.t("Words")}</p>
                </div>
              }
            </div>
          )}
          <div className="rechargebtn">
            <button onClick={recharge} className="rounded-pill">{props.t("Recharge Wallet")}</button>
          </div>
        </div>
        <div className="col-lg-7 right-panel">
          <div className="form" ref={myRef}>
            {state.error && (
              <div
                key="error_1"
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {Translate(props, state.error)}
              </div>
            )}
            <form
              className="formFields px-3 gx-2"
              onSubmit={(e) => {
                e.preventDefault();
                submitForm();
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  {props.t("Write Something here...")}
                  <span className="field_mantatory">*</span>
                </label>
                <textarea
                  className="form-input form-control"
                  type="text"
                  id="title"
                  placeholder={props.t("Enter a prompt to search...")}
                  value={state.title ?? ""}
                  onChange={(e) => {
                    setState({
                      title: e.target.value,
                    });
                  }}
                />
                {state.errorTitle && (
                  <span className="error">{state.errorTitle}</span>
                )}
              </div>

              <div className="form-group">
                {type != "file" ? (
                  <React.Fragment>
                    <label className="form-label" htmlFor="words">
                      {props.t("Words Count")}
                      <span className="field_mantatory">*</span>
                    </label>
                    <input
                      className="form-input form-control"
                      type="number"
                      id="words"
                      value={state.words ?? ""}
                      min="1"
                      max={Math.floor(walletPrice)}
                      onInput={(e) => {
                        if (
                          parseInt(e.target.value, 10) >
                          Math.floor(walletPrice)
                        ) {
                          setState({ words: Math.floor(walletPrice) });
                        } else {
                          setState({ words: e.target.value });
                        }
                      }}
                    />
                    {state.errorWords && (
                      <span className="error">{state.errorWords}</span>
                    )}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <label className="form-label" htmlFor="image-count">
                      {props.t("Number of Images")}
                      <span className="field_mantatory">*</span>
                    </label>
                    <select
                      className="form-control form-select"
                      id="image-count"
                      value={state.image_counts ?? 1}
                      onChange={(e) => {
                        setState({ image_counts: e.target.value });
                      }}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </React.Fragment>
                )}
              </div>

              {state.files && (
                <div className="images d-flex imageandtext mb-4 row">
                  {state.files.map((file, index) => {
                    return (
                      <div className="image-cnt col-sm-6 col-md-3" key={index}>
                        <div className="imageandtext image_grid">
                          <label htmlFor={`image_${index}`}>
                            <img src={file.url} style={{ width: "200px" }} />
                          </label>
                          <input type="checkbox" id={`image_${index}`} checked={state.imageChecked == index ? true : false} onChange={(e) => {
                            if(state.imageChecked == index){
                                setState({imageChecked: null})
                            }else{
                                setState({imageChecked:index})
                            }
                          }} />
                          <div className="caption"></div>
                        </div>
                        {/* <a
                          href="#"
                          className="view-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            openImage(index);
                          }}
                        >
                          {props.t("view")}
                        </a> */}
                      </div>
                    );
                  })}
                </div>
              )}
             {
                !state.files ?
              <div className="input-group">
                <button type="submit" className="rounded-pill">
                  {props.t(state.submitting ? "Please wait..." : "Submit")}
                </button>
              </div>

              :
              <div className="d-flex input-group">
                <button type="button" style={{marginRight:"10px"}} className="rounded-pill" onClick={(e) => {
                    let url = state.files[state.imageChecked].url
                    props.setValue(state.data.key, url);
                }} disabled={typeof state.imageChecked != "undefined" && state.imageChecked != null ? false : true}>
                  {props.t("Select")}
                </button>
                <button type="submit" className="rounded-pill">
                  {props.t("Search again")}
                </button>
              </div>
            }
            </form>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .view-btn {
            text-align: center;
            width: 100%;
            display: block;
          }
          img {
            border-radius: 50%;
            cursor:pointer;
          }

          .caption {
            position: absolute;
            top: 0;
            left: 5px;
            height: 100%;
            width: calc(100% - 5px);
            padding: 0 10px;
            box-sizing: border-box;
            pointer-events: none;
            border-radius: 500px;
          }

          .imageandtext {
            position: relative;
          }
          .image_grid {
            display: inline-block;
            padding-left: 5px;
          }
          .image_grid img {
            display: block;
          }

          .image_grid input {
            display: none;
          }
          .image_grid input:checked + .caption {
            background: rgba(0, 0, 0, 0.5);
          }
          .image_grid input:checked + .caption::after {
            content: "✔";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 20px;
            text-align: center;
            border-radius: 50%;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default OpenAI;
