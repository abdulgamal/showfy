import dynamic from "next/dynamic";
import React, { useEffect, useReducer } from "react";
import axios from "../../axios-orders";
import Translate from "../../components/Translate/Index";

const Stripe = dynamic(() => import("./Stripe"), {
  ssr: false,
});
const QPay = dynamic(() => import("./QPay"), {
  ssr: false,
});
const Bank = dynamic(() => import("./Bank"), {
  ssr: false,
});
const Wallet = dynamic(() => import("./Wallet"), {
  ssr: false,
});
const CashFree = dynamic(() => import("./Cashfree"), {
  ssr: false,
});

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      packageObj: props.packageObj,
      paypal: props.pageData.appSettings["paypalEnabled"] == 1,
      stripe: props.pageData.appSettings["stripeEnabled"] == 1,
      cashfree: props.pageData.appSettings["cashfreeEnabled"] == 1,
      bank: props.pageData.appSettings["bankTransferEnabled"] == 1,
      razorpay: props.pageData.appSettings["razorpayEnabled"] == 1,
      flutterwave: props.pageData.appSettings["flutterwaveEnabled"] == 1,
      wallet:
        props.pageData.appSettings["payment_pay_single_wallet"] == 1 &&
        props.pageData.appSettings["walletPaymentEnabled"] == 1 &&
        props.bank_type != "recharge_wallet"
          ? true
          : props.pageData.appSettings["walletPaymentEnabled"] == 1 &&
            props.bank_type != "recharge_wallet",
      qPay: props.pageData.appSettings["qPayEnabled"] == 1,
      aamarpay: props.pageData.appSettings["aamarpayEnabled"] == 1,
    }
  );
  const paypal = () => {
    window.location.href = props.payPalURL
      ? props.payPalURL
      : props.gatewaysUrl +
        (props.gatewaysUrl.indexOf("?") > -1 ? "&type=paypal" : "?type=paypal");
    props.closePopup();
  };
  const stripe = () => {
    setState({ paymentType: "stripe" });
  };
  const cashFreeBackend = () => {
    return  props.gatewaysUrl + (props.gatewaysUrl.indexOf("?") > -1 ? "&type=cashfree&gateway=6" : "?type=cashfree&gateway=6");
  }
  const razorpayBackend = () => {
    return  props.gatewaysUrl + (props.gatewaysUrl.indexOf("?") > -1 ? "&type=razorpay&gateway=7" : "?type=razorpay&gateway=7");
  }
  const aamarpayBackend = () => {
    return  props.gatewaysUrl + (props.gatewaysUrl.indexOf("?") > -1 ? "&type=aamarpay&gateway=9" : "?type=aamarpay&gateway=9");
  }
  const cashfree = () => {
   setState({opneCashfree:1})
  };
  const flutterwave = () => {
   setState({opneFlutterwave:1})
  };
  const flutterwaveBackend = () => {
    return  props.gatewaysUrl + (props.gatewaysUrl.indexOf("?") > -1 ? "&type=flutterwave&gateway=8" : "?type=flutterwave&gateway=8");
  }
  const razorpay = () => {
   setState({opneRazorpay:1})
  };
  const aamarpay = () => {
   setState({opneAamarpay:1})
  };
  const bank = () => {
    setState({ paymentType: "bank" });
  };
  const wallet = () => {
    setState({ paymentType: "wallet" });
  };
  const getStripeKey = () => {
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/member/stripekey";

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
        } else {
          setState({ stripekey: response.data.stripekey });
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    if (state.stripe) {
      getStripeKey();
    }
  }, []);
  const qpay = () => {
    setState({ paymentType: "qpay" });
  };
  if (props.pageData.fromAPP && props.pageData.fromAppDevice == "ios") {
    // return null;
  }
  let htmlData = null;
  if (state.paymentType == "stripe") {
    htmlData = (
      <Stripe
        {...props}
        stripekey={state.stripekey}
        tokenURL={props.tokenURL}
        closePopup={() => setState({ paymentType: null })}
        gatewaysUrl={props.gatewaysUrl}
      />
    );
  } else if (state.paymentType == "bank") {
    htmlData = (
      <Bank
        {...props}
        tokenURL={props.tokenURL}
        closePopup={() => setState({ paymentType: null })}
        gatewaysUrl={props.gatewaysUrl}
      />
    );
  } else if (state.paymentType == "wallet") {
    htmlData = (
      <Wallet
        {...props}
        tokenURL={props.tokenURL}
        closePopup={() => setState({ paymentType: null })}
        gatewaysUrl={props.gatewaysUrl}
      />
    );
  } else if (state.paymentType == "qpay") {
    htmlData = (
      <QPay
        {...props}
        tokenURL={props.tokenURL}
        closePopup={() => setState({ paymentType: null })}
        gatewaysUrl={props.gatewaysUrl}
      />
    );
  }

  if(state.opneCashfree == 1){
    // show cashfree form
    htmlData = <CashFree {...props} cashFreeBackend={cashFreeBackend()} url={cashFreeBackend()}  closePopup={() => {
      setState({opneCashfree:0})
    }} />
  }
  if(state.opneFlutterwave == 1){
    // show cashfree form
    htmlData = <CashFree {...props} flutterwaveBackend={flutterwaveBackend()} url={flutterwaveBackend()} closePopup={() => {
      setState({opneFlutterwave:0})
    }} />
  }
  if(state.opneRazorpay == 1){
    // show cashfree form
    htmlData = <CashFree {...props} razorpayBackend={razorpayBackend()} url={razorpayBackend()}  closePopup={() => {
      setState({opneRazorpay:0})
    }} />
  }
  if(state.opneAamarpay == 1){
    // show cashfree form
    htmlData = <CashFree {...props} aamarpayBackend={aamarpayBackend()} url={aamarpayBackend()}  closePopup={() => {
      setState({opneAamarpay:0})
    }} />
  }

  if (
    props.bank_type != "recharge_wallet" &&
    state.wallet &&
    props.pageData.appSettings["payment_pay_single_wallet"] == 1
  ) {
    return (
      <Wallet
        {...props}
        tokenURL={props.tokenURL}
        closePopup={() => props.closePopup()}
        gatewaysUrl={props.gatewaysUrl}
      />
    );
  }
  return (
    <React.Fragment>
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="payment-cnt">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Choose a payment method")}</h2>
                <a onClick={props.closePopup} className="_close">
                  <i></i>
                </a>
              </div>
              {!state.paypal &&
              !state.stripe &&
              !state.bank &&
              !state.cashfree &&
              !state.razorpay &&
              !state.wallet &&
              !state.qPay &&
              !state.aamarpay &&
              !state.flutterwave &&
              !state.packageObj ? (
                <p className="no-gateway-enabled">
                  {props.t("No Payment Gateway enabled. Please contact admin.")}
                </p>
              ) : (
                <div className=" gateway-options">
                  {props.pageData.appSettings["payment_appleinapp_method"] ==
                    "1" &&
                  // state.packageObj &&
                  // state.packageObj.apple_id &&
                  props.pageData.fromAppDevice == "ios" ? (
                    <a
                      href={`/applepay?password=${props.pageData.appSettings.apple_inapp_purchasesecret}&user_id=${props.pageData.loggedInUserDetails.user_id}&price=${props.bank_price}`}
                      className="apple_pay"
                    >
                      <img src="/static/images/apple.png" />
                      {Translate(props, "In-App Purchase")}
                    </a>
                  ) : null}
                  {state.paypal ? (
                    <button onClick={paypal}>
                      <img src="/static/images/paypal.png" />
                      {Translate(props, "Paypal")}
                    </button>
                  ) : null}
                  {state.wallet ? (
                    <button onClick={wallet}>
                      <img src="/static/images/wallet.png" />
                      {Translate(props, "Wallet")}
                    </button>
                  ) : null}
                  {state.stripe ? (
                    <button onClick={stripe}>
                      <img src="/static/images/stripe.webp" />
                      {Translate(props, "Credit Card")}
                    </button>
                  ) : null}
                  {state.razorpay ? (
                    <button onClick={razorpay}>
                      <img src="/static/images/razorpay.png" />
                      {Translate(props, "Razorpay")}
                    </button>
                  ) : null}
                  {state.aamarpay ? (
                    <button onClick={aamarpay}>
                      <img src="/static/images/aamarpay.png" />
                      {Translate(props, "Aamarpay")}
                    </button>
                  ) : null}
                  {state.qPay ? (
                    <button onClick={qpay}>
                      <svg
                        className="bi me-2"
                        width="75"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 186.7 73.6"
                      >
                        <path d="M111.4 13.5c3.1 2.8 4.7 7 4.7 12.4s-1.6 9.5-4.7 12.4-7.3 4.3-12.4 4.3h-5.9V58c-1.8.3-3.6.5-5.5.4-1.8 0-3.6-.1-5.4-.4V10l.5-.5c7.9-.2 13.3-.3 16.2-.3 5.2.1 9.4 1.5 12.5 4.3zm-18.3 4v17c1.4 0 3-.1 4.9-.1 1.6.1 3.2-.4 4.5-1.5 1-.8 1.7-1.9 2.1-3.1.3-1.5.5-2.9.5-4.4 0-1.9-.5-3.7-1.5-5.2-1.1-1.7-3-2.7-5-2.5-2.4-.1-4.2-.1-5.5-.2zM150.9 53.2c-.3 1.1-.7 2.1-1.3 3-.5.9-1.2 1.7-2 2.4-2.9 0-5.7-1.4-7.4-3.8-2.6 2.7-6.2 4.2-10 4.2-3.7 0-6.4-1.1-8.3-3.3-1.8-2-2.8-4.7-2.8-7.4 0-4 1.3-7 4-9.1 2.9-2.2 6.4-3.3 10-3.1 1.6 0 3.3.1 5.3.2v-1.5c0-3.1-1.6-4.7-4.8-4.7-2 0-5.5.8-10.6 2.3-1.4-1.6-2.3-4.1-2.6-7.4 2.5-1 5.2-1.8 7.9-2.3 2.6-.5 5.3-.8 8-.8 3.2-.1 6.4.9 8.9 2.9 2.4 2 3.6 5 3.6 9.1v14.4c.1 2.4.7 3.9 2.1 4.9zm-18.1-1.9c2.1-.1 4-.9 5.5-2.3v-5.9c-1 0-2.4-.1-4.2-.1-3.2 0-4.7 1.6-4.7 4.7 0 .9.4 1.8 1 2.5s1.5 1.1 2.4 1.1zM186.7 23.9l-8.9 33.2c-1.5 5.5-3.4 9.7-5.9 12.4-2.5 2.7-6.2 4.1-11.2 4.1-2.8 0-5.7-.5-8.4-1.4v-1.3c.1-1 .2-2 .5-3 .3-1.2.8-2.3 1.6-3.2 2 .6 4.1 1 6.2 1.1 3.5 0 5.9-2.1 7.1-6.2l.3-1c-4-.1-6.3-1.6-7.1-4.4l-8.4-30.6c1.8-.9 3.8-1.4 5.8-1.4 1.4-.1 2.8.2 3.9 1 1 1 1.6 2.2 1.8 3.5l3.5 14c.4 1.4.9 4.5 1.7 9.4 0 .3.3.5.6.5l6.4-27.8c1.5-.3 3.1-.5 4.6-.4 1.8 0 3.5.2 5.2.8l.7.7zM52.6 52.2l3.8 3.8c1.5-1.5 2.8-3.1 3.9-4.8l-4.4-2.9c-1 1.4-2.1 2.7-3.3 3.9z"></path>
                        <path d="M65.8 32.9v-.2c0-2.1-.2-4.1-.7-6.2V26C61.9 11 48.7.2 33.3 0h-.4C14.7 0 0 14.7 0 32.9s14.7 32.9 32.9 32.9c3.3 0 6.5-.5 9.6-1.4l1.1-.3 2.1-.8 2.6 1 8.5 3.3c1.4.6 1.8 0 .9-1.2L44.1 48c-1-1.3-2.7-1.7-4.1-1-2.2 1.1-4.6 1.7-7 1.8-8.8 0-16-7.1-16.1-15.9s7.1-16 15.9-16.1c7.6 0 14.2 5.3 15.7 12.7v.5c.2.9.2 1.8.3 2.7v.3c0 1-.1 1.9-.3 2.9l5.4 1c.2-1.3.4-2.6.4-3.9v-.2h6.2v.2c0 1.7-.1 3.4-.4 5.1v.2h-.2l-5.6-1.1c-.3 1.3-.7 2.6-1.2 3.9l-.1.2-.2-.1-5-2.1c-.4.9-.8 1.7-1.4 2.5l-.1.2c-.5.8-1.2 1.5-1.8 2.2l3.9 3.8c.9-.9 1.8-2 2.5-3.1l.1-.2.2.1 4.8 3.2c.9-1.4 1.7-2.9 2.4-4.5l.1-.2.2.1 4.9 2c.8-1.9 1.4-3.9 1.8-5.9v-.2c.2-2.1.4-4.1.4-6.2z"></path>
                      </svg>
                      {Translate(props, "QPay")}
                    </button>
                  ) : null}
                  {
                      state.cashfree ? 
                          <button onClick={cashfree}><img src="/static/images/cashfree.png" />{Translate(props,'Cashfree')}</button>
                      : null
                  }
                  {
                      state.flutterwave ? 
                          <button onClick={flutterwave}><img src="/static/images/flutterwave.png" />{Translate(props,'Flutterwave')}</button>
                      : null
                  }
                  {state.bank ? (
                    <button onClick={bank}>
                      <img src="/static/images/bank.png" />
                      {Translate(props, "Bank Transfer")}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {htmlData}
    </React.Fragment>
  );
};

export default Index;
