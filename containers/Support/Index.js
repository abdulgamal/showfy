import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency";
import swal from "sweetalert";
import Gateways from "../Gateways/Index";

import Router from "next/router";
const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      item: props.item,
      item_type: props.item_type,
      item_id: props.item_id,
      channelPaymentStatus: props.pageData.channelPaymentStatus,
      isSupported: props.pageData.userSupportChannel,
      gateways: null,
    }
  );
  useEffect(() => {
    if (props.item != state.item) {
      setState({
        item: props.item,
        item_type: props.item_type,
        gateways: false,
      });
    }
  }, [props]);

  useEffect(() => {
    if (state.channelPaymentStatus) {
      if (state.channelPaymentStatus == "success") {
        swal(
          "Success",
          Translate(
            props,
            "Channel Support subscription done successfully.",
            "success"
          )
        );
      } else if (state.channelPaymentStatus == "fail") {
        swal(
          "Error",
          Translate(
            props,
            "Something went wrong, please try again later",
            "error"
          )
        );
      } else if (state.channelPaymentStatus == "cancel") {
        swal(
          "Error",
          Translate(
            props,
            "You have cancelled the Channel Support subscription.",
            "error"
          )
        );
      }
    }
  }, []);

  const submitType = () => {
    //swal("Success", Translate(props, "Redirecting you to payment gateway...", "success"));
    setState({
      
      gateways: true,
      gatewaysURL:
        "/support/successulPayment/" +
        state.item_id +
        "/" +
        state.item_type,
      payPalURL: "/support/" + state.item_id + "/" + state.item_type,
    });
    //window.location.href = "/support/"+state.item_id+"/"+state.item_type;
  };
  const openSupportForm = (e) => {
    e.preventDefault();
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
    } else if (state.isSupported) {
      swal(
        "Success",
        Translate(
          props,
          "You are already supporting this channel.",
          "success"
        )
      );
    } else {
      if (
        state.item.owner_id ==
        props.pageData.loggedInUserDetails.user_id
      ) {
        return;
      }
      submitType();
      // swal({
      //   title: Translate(props, "Are you sure?"),
      //   text: Translate(props, "Are you sure want to support!"),
      //   icon: "warning",
      //   buttons: true,
      //   dangerMode: true,
      // }).then((allowed) => {
      //   if (allowed) {
      //     submitType();
      //   } else {
      //   }
      // });
    }
  };
  if (parseFloat(state.item.channel_subscription_amount) <= 0) {
    return null;
  }
  let gatewaysHTML = "";

  if (state.gateways) {
    gatewaysHTML = (
      <Gateways
        {...props}
        success={() => {
          props.openToast(
            {
              message:Translate(props, "Payment done successfully."),
              type:"success"
            }
          );
          setTimeout(() => {
            Router.push(`/channel/${state.item.custom_url}`);
          }, 1000);
        }}
        successBank={() => {
          props.openToast(
           {
            message: Translate(
              props,
              "Your bank request has been successfully sent, you will get notified once it's approved"
            ),
            type:"success"
           }
          );
          setState({  gateways: null });
        }}
        payPalURL={state.payPalURL}
        finishPayment="/support/finishPayment"
        bank_price={state.item.channel_subscription_amount}
        subscriptionPayment={true}
        bank_type="channel_subscription"
        bank_resource_type="channel"
        bank_resource_id={state.item.custom_url}
        tokenURL={`${state.gatewaysURL}`}
        closePopup={() => setState({  gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }
  let perprice = {};
  perprice["package"] = {
    price: parseFloat(state.item.channel_subscription_amount).toFixed(2),
  };
  let amount = props
    .t("Support: Pay {{price}} per month", {
      price: Currency({ ...props, ...perprice }),
    })
    .replace("<!-- -->", "");
  return (
    <React.Fragment>
      {gatewaysHTML}
      <a
        className={"active follow fbold"}
        href="#"
        onClick={openSupportForm}
      >
        {amount}
      </a>
    </React.Fragment>
  );
};

export default Index;
