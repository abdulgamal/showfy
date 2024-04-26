import React, { useReducer, useEffect, useRef } from "react";
import Form from "../../components/DynamicForm/Index";
import axios from "../../axios-orders";
import Currency from "../Upgrade/Currency";
import Validator from "../../validators";
import Router, { withRouter } from "next/router";
import Translate from "../../components/Translate/Index";
import swal from "sweetalert";
import Gateways from "../Gateways/Index";

const Balance = (props) => {
  const myRef = useRef(null);
  let fUrl = props.router.asPath.split("?");
  let openWallet = false;
  if (typeof URLSearchParams !== "undefined") {
    const otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
    if (otherQueryParams.get("recharge")) {
      openWallet = true;
    }
  }
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      title: "Withdraw Balance",
      success: false,
      error: null,
      adsWallet: openWallet,
      loading: true,
      member: props.member,
      payoutType: props.pageData.member.payoutType,
      bank_transfer: props.pageData.member.bank_transfer,
      monetization_threshold_amount: props.monetization_threshold_amount,
      submitting: false,
      firstLoaded: true,
      user: props.pageData.user ? true : false,
      adsPaymentStatus: props.pageData.adsPaymentStatus,
      gateways: null,
    }
  );
  useEffect(() => {
    $(document).on("click", ".open_withdraw", function (e) {
      e.preventDefault();
      let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";
      Router.push(`/dashboard/withdraw${userAs}`);
    });
    if (state.adsPaymentStatus) {
      if (state.adsPaymentStatus == "success") {
        swal(
          "Success",
          Translate(props, "Wallet recharge successfully.", "success")
        );
      } else if (state.adsPaymentStatus == "fail") {
        swal(
          "Error",
          Translate(
            props,
            "Something went wrong, please try again later",
            "error"
          )
        );
      } else if (state.adsPaymentStatus == "cancel") {
        swal(
          "Error",
          Translate(props, "You have cancelled the payment.", "error")
        );
      }
    }
  }, []);

  useEffect(() => {
    if (props.pageData.member != state.member) {
      setState({
        success: false,
        payoutType: props.pageData.member.payoutType,
        bank_transfer: props.pageData.member.bank_transfer,
        error: null,
        loading: true,
        member: props.pageData.member,
        monetization_threshold_amount: props.monetization_threshold_amount,
        submitting: false,
        firstLoaded: true,
        user: props.pageData.user ? true : false,
        adsPaymentStatus: props.pageData.adsPaymentStatus,
        gateways: null,
      });
    }
  }, [props]);

  const onSubmit = (model) => {
    if (state.submitting) {
      return;
    }
    let selectedCurrency = props.pageData.selectedCurrency;
    let changeRate = selectedCurrency.currency_value;
    let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";
    let price =
      props.pageData.levelPermissions["member.monetization_threshold_amount"];
    if (state.monetization_threshold_amount) {
      price = state.monetization_threshold_amount;
    }
    if (
      parseFloat(state.member.balance * changeRate) >=
        parseFloat(model["amount"]) &&
      parseFloat(price * changeRate) <= parseFloat(model["amount"])
    ) {
      let formData = new FormData();
      for (var key in model) {
        if (model[key]) formData.append(key, model[key]);
      }
      formData.append("owner_id", state.member.user_id);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let url = "/members/balance-withdraw";
      setState({ submitting: true, error: null });
      axios
        .post(url, formData, config)
        .then((response) => {
          if (response.data.error) {
            window.scrollTo(0, myRef.current.offsetTop);
            setState({ error: response.data.error, submitting: false });
          } else {
            setState({ submitting: false });

            props.openToast({
              message: Translate(props, response.data.message),
              type: "success",
            });
            setTimeout(() => {
              Router.push(`/dashboard/withdraw${userAs}`);
            }, 1000);
          }
        })
        .catch((err) => {
          setState({ submitting: false, error: err });
        });
    } else {
      if (
        parseFloat(state.member.balance * changeRate) <
        parseFloat(model["amount"])
      ) {
        setState({
          error: [
            {
              field: "amount",
              message: "Enter amount must be less than available balance.",
            },
          ],
          submitting: false,
        });
      } else if (parseFloat(price * changeRate) > parseFloat(model["amount"])) {
        setState({
          error: [
            {
              field: "amount",
              message:
                "Enter amount must be greater than minimum withdraw amount.",
            },
          ],
          submitting: false,
        });
      }
    }
  };
  const recharge = (e) => {
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
        "/ads/recharge?fromBalance=1&amount=" + encodeURI(state.walletAmount),
      gateways: true,
    });
    // swal("Success", Translate(props, "Redirecting you to payment gateway...", "success"));
    // window.location.href = "/ads/recharge?fromBalance=1&amount=" + encodeURI(state.walletAmount)
  };
  const closeWalletPopup = (e) => {
    setState({ adsWallet: false, walletAmount: 0 });
  };
  const walletValue = (e) => {
    if (isNaN(e.target.value) || e.target.value < 1) {
      setState({ walletAmount: parseFloat(e.target.value) });
    } else {
      setState({ walletAmount: e.target.value });
    }
  };
  const onCategoryPayout = (type) => {
    setState({ payoutType: type });
  };
  let adsWallet = null;
  if (state.adsWallet && !state.user) {
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
                      <button type="submit">
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
  let validator = [
    
    {
      key: "amount",
      validations: [
        {
          validator: Validator.required,
          message: "Amount is required field",
        },
      ],
    },
    {
      key: "amount",
      validations: [
        {
          validator: Validator.price,
          message: "Please provide valid amount",
        },
      ],
    },
  ];

  if(state.payoutType == "paypal"){
    validator.push({
        key: "paypal_email",
        validations: [
          {
            validator: Validator.required,
            message: "Paypal Email is required field",
          },
        ],
      },
      {
        key: "paypal_email",
        validations: [
          {
            validator: Validator.email,
            message: "Please provide valid email",
          },
        ],
      })
  }else if(state.payoutType == "banktransfer"){
    validator.push({
        key: "bank_transfer",
        validations: [
          {
            validator: Validator.required,
            message: "Bank Transfer is required field",
          },
        ],
      })
  }

  let perclick = {};

  let price =
    props.pageData.levelPermissions["member.monetization_threshold_amount"];
  if (state.monetization_threshold_amount) {
    price = state.monetization_threshold_amount;
  }
  perclick["package"] = { price: parseFloat(price) };

  let wallet = {};
  wallet["package"] = {
    price: state.member
      ? state.member.wallet
      : props.pageData.loggedInUserDetails.wallet,
  };

  // payout type
  let payouts = [];
  let payoutsOptions = props.pageData.appSettings.payout_settings ?? "";
  payoutsOptions.split(",").forEach((res) => {
    payouts.push({
      key: res,
      label: res == "paypal" ? "Paypal" : "Bank Transfer",
      value: res,
    });
  });

  let userBalance = {};
  userBalance["package"] = {
    price: parseFloat(state.member.balance ? state.member.balance : 0),
  };
  let priceData = Currency({ ...props, ...perclick }).replace("<!-- -->", "");
  let formFields = [
    {
      key: "wallet",
      label: "Wallet Total",
      props: { readOnly: true },
      value: Currency({ ...props, ...wallet }).replace("<!-- -->", ""),
    },
    {
      key: "balance",
      label: "Available Balance",
      props: { readOnly: true },
      value: Currency({ ...props, ...userBalance }).replace("<!-- -->", ""),
    },
    {
      key: "payouts",
      label: "Payout Option",
      value: state.payoutType,
      type: "select",
      options: payouts,
      onChangeFunction: onCategoryPayout,
    },
  ];

  if (state.payoutType == "banktransfer") {
    formFields.push({
      key: "bank_transfer",
      label: "Bank Transfer Details",
      value: state.bank_transfer
        ? state.bank_transfer
        : props.pageData.appSettings.banktransfer_payout
        ? props.pageData.appSettings.banktransfer_payout
        : "",
      type: "textarea",
    });
  } else if (state.payoutType == "paypal") {
    formFields.push({
      key: "paypal_email",
      label: "Paypal Email",
      value: state.member.paypal_email ? state.member.paypal_email : "",
      isRequired: true,
    });
  }
  formFields.push(
    {
      key: "amount",
      label: "Amount",
      type: "text",
      value: "",
      placeholder: "00.00",
      isRequired: true,
    },
    {
      key: "res_type_1",
      type: "content",
      content:
        '<h6 class="custom-control minimum_amount_cnt">' +
        props.t(
          "Minimum withdraw amount should be greater than or equal to {{data}}.",
          { data: `(${priceData})` }
        ) +
        "</h6>",
    }
  );

  let initalValues = {
    bank_transfer: state.bank_transfer
      ? state.bank_transfer
      : props.pageData.appSettings.banktransfer_payout
      ? props.pageData.appSettings.banktransfer_payout
      : "",
    paypal_email: state.member.paypal_email ? state.member.paypal_email : "",
  };

  //get current values of fields

  formFields.forEach((item) => {
    initalValues[item.key] = item.value;
  });

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
            Router.push(`/dashboard/balance`);
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
        tokenURL={`ads/successulPayment?fromBalance=1&amount=${encodeURI(
          state.walletAmount
        )}`}
        closePopup={() => setState({ gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  return (
    <React.Fragment>
      {adsWallet}
      {gatewaysHTML}
      <button className="custom-control open_withdraw floatR" href="#">
        {props.t("Withdrawal Requests")}
      </button>
      <button className="floatR balance_recharge" onClick={(e) => recharge(e)}>
        {Translate(props, "Recharge Wallet")}
      </button>
      <div ref={myRef}>
        <Form
          editItem={state.editItem}
          className="form"
          title={state.title}
          initalValues={initalValues}
          defaultValues={initalValues}
          validators={validator}
          submitText={
            !state.submitting ? "Submit Request" : "Submitting Request..."
          }
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

export default withRouter(Balance);
