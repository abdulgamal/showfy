import React, { useReducer, useEffect } from "react";
import axios from "../../axios-orders";
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency";
import dynamic from "next/dynamic";
import swal from "sweetalert";
import Router from "next/router";
const Celebrate = dynamic(() => import("../Donation/Celebrate"), {
  ssr: false,
});
import Gateways from "../Gateways/Index";

const Donation = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      adsPaymentStatus: props.pageData.adsPaymentStatus,
      item: props.item,
      item_id: props.item_id,
      item_type: props.item_type,
      balance: parseFloat(
        props.pageData.loggedInUserDetails
          ? props.pageData.loggedInUserDetails.wallet
          : 0
      ),
      gateways: null,
      custom_url: props.custom_url,
    }
  );

  useEffect(() => {
    if (props.item_id != state.item_id || props.item_type != state.item_type) {
      setState({
        id: null,
        gateways: null,
        custom_url: props.custom_url,
        item: props.item,
        item_id: props.item_id,
        item_type: props.item_type,
        balance: parseFloat(
          props.pageData.loggedInUserDetails
            ? props.pageData.loggedInUserDetails.wallet
            : 0
        ),
      });
    }
    // else if (parseFloat(props.pageData.loggedInUserDetails ? props.pageData.loggedInUserDetails.wallet : 0) != state.balance) {
    //     setState({
    //         id:null,
    //         gateways:null,
    //         custom_url:props.custom_url,
    //         item: props.item,
    //         item_id:props.item_id,
    //         item_type:props.item_type,
    //         balance:parseFloat(props.pageData.loggedInUserDetails ? props.pageData.loggedInUserDetails.wallet : 0)
    //     })
    // }
  }, [props]);

  useEffect(() => {
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

  const submitType = (id) => {
    // let id = state.id
    let items = state.item.gifts;
    let index = items.findIndex(item => item.gift_id === id);
    let item = null;
    if(index > -1) {
        item = items[index];
    }
    if (item) {
      if (props.pageData && !props.pageData.loggedInUserDetails) {
        document.getElementById("loginFormPopup").click();
        return;
      }
      let balance = parseFloat(state.balance);
      let amount = parseFloat(item.price);
      if (parseFloat(amount) > parseFloat(balance)) {
        //show error
        props.openToast({
          message: Translate(
            props,
            "Your balance is low, please recharge your account."
          ),
          type: "error",
        });
      } else {
        const formData = new FormData();
        formData.append("id", item.gift_id);
        formData.append("video_id", state.item_id);
        let url = "/send-gift";
        axios
          .post(url, formData)
          .then((response) => {
            if (response.data.error) {
              setState({ id: null, localUpdate: false });
              props.openToast({
                message: Translate(props, response.data.message),
                type: "error",
              });
            } else {
              var _ = this;
              setTimeout(() => {
                setState({ celebrate: false });
              }, 5000);
              setState({
                balance: parseFloat(balance - amount),
                id: null,
                celebrate: true,
              });
              props.openToast({
                message: Translate(props, response.data.message),
                type: "success",
              });
            }
          })
          .catch((err) => {
            setState({ id: null, localUpdate: false });
            props.openToast({
              message: Translate(
                props,
                "Something went wrong, please try again later"
              ),
              type: "error",
            });
          });
      }
    }
  };
  const chooseOption = (id, e) => {
    if (state.id) {
      return;
    }
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
      return;
    }
    if (state.item.owner_id == props.pageData.loggedInUserDetails.user_id) {
      return;
    }
    setState({ id: id });
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(props, "Are you sure want to give gift!"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        submitType(id);
      } else {
        setState({ id: null });
      }
    });
  };
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
        "/ads/recharge?fromVideo=1&amount=" + encodeURI(state.walletAmount),
      gateways: true,
    });
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
  let perprice = {};
  perprice["package"] = { price: state.balance };

  let celebrate = null;
  if (state.celebrate) {
    celebrate = <Celebrate />;
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
            Router.push(`/watch/${state.custom_url}`);
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
        tokenURL={`ads/successulPayment?fromVideo=1&amount=${encodeURI(
          state.walletAmount
        )}`}
        closePopup={() => setState({ gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  let price = {};
  price["package"] = { price: state.balance };

  return (
    <React.Fragment>
      {celebrate}
      {adsWallet}
      {gatewaysHTML}
      <div className="donationWrap mb-4">
        <div className="donationInnr">
          <div className="giftSection mt-1">
            {state.item.gifts.map((item, i) => {
              let perprice = {};
              perprice["package"] = { price: item.price };
              return (
                <div className="giftItem cursor" key={i}>
                  <div className="giftItem-img">
                    <img src={props.pageData.imageSuffix+ item.image} alt="" />
                  </div>
                  <span className="giftItem-name">{item.title}</span>
                  <div className="giftItem-coin">
                    <img src="/static/images/coin.png" alt="" />
                    <span>
                      {Currency({
                        ...props,
                        returnPriceOnly: true,
                        ...perprice,
                      }).replace("<!-- -->", "")}
                    </span>
                  </div>
                  <button onClick={(e) => chooseOption(item.gift_id,e)} className="mt-2 mb-2">{props.t("Send")}</button>
                </div>
              );
            })}
          </div>
          <div className="giftItemBtn pt-4">
            <div className="align-items-center coinBlance d-flex gap-2">
              <span className="">{props.t("Coin Balance:")}</span>
              <img src="/static/images/coin.png" alt="" />
              <span>
                {Currency({
                  ...props,
                  returnPriceOnly: true,
                  ...price
                }).replace("<!-- -->", "")}
              </span>
            </div>
            <button onClick={recharge}>{props.t("Get Coins")}</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Donation;
