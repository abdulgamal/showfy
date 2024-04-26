import React, { useReducer, useEffect, useRef } from "react";
import Router from "next/router";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-site";
import Currency from "../Upgrade/Currency";

const Bank = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      submitting: false,
    }
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    if (state.submitting) {
      return;
    }
    setState({ submitting: true });
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    formData.append("gateway", "5");
   
    axios
      .post(props.tokenURL, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({ errorMessage: response.data.error, submitting: false });
        } else {
          props.success();
        }
      })
      .catch((err) => {});
  };
  let payPrice = {};
  payPrice["package"] = { price: parseFloat(props.bank_price) };

  let walletPrice =
    props.pageData.loggedInUserDetails &&
    props.pageData.loggedInUserDetails.wallet;
  let walletErrorMessage = null;
  if (parseFloat(walletPrice) < parseFloat(props.bank_price)) {
    walletErrorMessage = props.t(
      "You don't have enough balance to purchase, please recharge your wallet."
    );
  }
  
  return (
    <div className="popup_wrapper_cnt">
      <div className="popup_cnt">
        <div className="comments">
          <div className="VideoDetails-commentWrap">
            <div className="popup_wrapper_cnt_header">
              <h2>{Translate(props, "Pay By Wallet")}</h2>
              {!state.submitting ? (
                <a onClick={props.closePopup} className="_close">
                  <i></i>
                </a>
              ) : null}
            </div>
            {state.errorMessage ? (
              <p className="error" style={{ marginLeft: "20px" }}>
                {Translate(props, state.errorMessage)}
              </p>
            ) : null}
            {walletErrorMessage ? (
              <div className="wallet-pay-error" style={{ textAlign: "center" }}>
                <img
                  style={{ marginBottom: "10px", height: "50px" }}
                  src="/static/images/wallet.png"
                />
                <p className="message" style={{ marginBottom: "10px" }}>
                  {Translate(props, walletErrorMessage)}
                </p>
                <button
                  onClick={() => {
                    let type = "balance";
                    let asPath = `/dashboard/${type}?recharge=1`;
                    if (state.user) {
                      asPath = asPath;
                    }
                    Router.push(`${asPath}`);
                  }}
                >
                  {props.t("Recharge Wallet")}
                </button>
              </div>
            ) : (
              <button
                disabled={state.submitting}
                onClick={(e) => {
                  handleSubmit(e);
                }}
                className="btn-pay"
                style={{ marginLeft: "20px" }}
              >
                {Translate(props, "Pay ")}
                <Currency {...props} {...payPrice} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bank;
