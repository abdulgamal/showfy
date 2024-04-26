import React, { useReducer, useEffect, useRef } from "react";
import Currency from "../Upgrade/Currency";
import Plan from "../Form/Plan";
import swal from "sweetalert";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";
import Gateways from "../Gateways/Index";

import Router from "next/router";

const Plans = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      plans: props.plans,
      user_id: props.user_id,
      createPlan: false,
      plan: null,
      member: props.member,
      userSubscriptionID: props.userSubscriptionID,
      userSubscription: props.userSubscription,
      gateways: null,
      memberSubscriptionPaymentStatus:
        props.pageData.memberSubscriptionPaymentStatus,
      itemObj: props.itemObj,
      userPrifile: props.userPrifile,
    }
  );
  useEffect(() => {
    if (props.plans != state.plans) {
      setState({
        plans: props.plans,
        itemObj: props.itemObj,
        user_id: props.user_id,
        createPlan: false,
        plan: null,
        member: props.member,
        userSubscriptionID: props.userSubscriptionID,
        userSubscription: props.userSubscription,
        gateways: null,
        memberSubscriptionPaymentStatus:
          props.pageData.memberSubscriptionPaymentStatus,
        userPrifile: props.userPrifile,
      });
    }
  }, [props]);
  useEffect(() => {
    if (state.memberSubscriptionPaymentStatus && !state.userPrifile) {
      if (state.memberSubscriptionPaymentStatus == "success") {
        swal(
          "Success",
          Translate(
            props,
            "Subscription payment done successfully.",
            "success"
          )
        );
      } else if (state.memberSubscriptionPaymentStatus == "successFree") {
        swal(
          "Success",
          Translate(props, "Subscription done successfully.", "success")
        );
      } else if (state.memberSubscriptionPaymentStatus == "fail") {
        swal(
          "Error",
          Translate(
            props,
            "Something went wrong, please try again later",
            "error"
          )
        );
      } else if (state.memberSubscriptionPaymentStatus == "cancel") {
        swal(
          "Error",
          Translate(
            props,
            "You have cancelled the subscription payment.",
            "error"
          )
        );
      }
    }
  }, []);

  const create = () => {
    setState({ createPlan: true });
  };
  const editPlan = (id, e) => {
    setState({
      createPlan: true,
      plan: state.plans[getItemIndex(id)],
    });
  };
  const getItemIndex = (item_id) => {
    const plans = [...state.plans];
    const itemIndex = plans.findIndex((p) => p["member_plan_id"] == item_id);
    return itemIndex;
  };
  const closePopup = (data, type) => {
    if (type) {
      let plans = [...state.plans];
      if (type == "create") {
        plans.unshift(data);
      } else {
        let index = getItemIndex(state.plan.member_plan_id);
        if (index > -1) {
          plans[index] = data;
        }
      }
      props.onChangePlan(plans);
    } else {
      setState({ createPlan: false, plan: null });
    }
  };
  const deletePlan = (id, e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Once deleted, you will not be able to recover this plan and all existing user in this plan will be switch in free plan and content created with this plan switched to everyone privacy!"
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("plan_id", id);
        const url = "/members/plan-delete";
        axios
          .post(url, formData)
          .then((response) => {
            if (response.data.error) {
              swal(
                "Error",
                Translate(
                  props,
                  "Something went wrong, please try again later"
                ),
                "error"
              );
            } else {
              let plans = [...state.plans];
              const itemIndex = getItemIndex(response.data.member_plan_id);
              if (itemIndex > -1) {
                plans.splice(itemIndex, 1);
              }
              props.deletePlan(
                Translate(props, response.data.message),
                plans
              );
            }
          })
          .catch((err) => {
            swal(
              "Error",
              Translate(
                props,
                "Something went wrong, please try again later"
              ),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  const freePlan = () => {
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Sure want to choose free plan, if you choose yes then your current plan will be cancelled."
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        freePlanRedirect();
      } else {
      }
    });
  };
  const freePlanRedirect = (planid) => {
    let id = planid ? planid : state.choosenPlanID;
    let url = "/subscription/successulPayment/" + id + "?gateway=10";
    if (state.itemObj && state.itemObj.channel_id) {
      url = url + "&type=channel&custom_url=" + state.itemObj.custom_url;
    } else if (state.itemObj && state.itemObj.blog_id) {
      url = url + "&type=blog&custom_url=" + state.itemObj.custom_url;
    } else if (state.itemObj && state.itemObj.playlist_id) {
      url = url + "&type=playlist&custom_url=" + state.itemObj.custom_url;
    } else if (state.itemObj && state.itemObj.audio_id) {
      url = url + "&type=audio&custom_url=" + state.itemObj.custom_url;
    } else if (state.itemObj && state.itemObj.video_id) {
      url = url + "&type=video&custom_url=" + state.itemObj.custom_url;
    }
    window.location.href = url;
    return;
  };
  const subscribeNow = (id, planPrice, e) => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
      return;
    }

    if (parseFloat(planPrice) == 0) {
      setState({ choosenPlanID: id });
      if (state.userSubscriptionID) freePlan();
        else {
          freePlanRedirect(id);
        }

      return;
    }
    setState({
      bankpackage_id: id,
      planPrice: planPrice,
      localUpdate: true,
      gateways: true,
      gatewaysURL: "/subscription/successulPayment/" + id,
      payPalURL: "/subscription/" + id,
    });
  };
  const cancelSubscription = (id) => {
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        "Sure want to cancel your subscription plan, if you choose yes then your current plan will be cancelled."
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        let url = "/subscription/cancelPlan/" + id;
        if (state.itemObj && state.itemObj.channel_id) {
          url =
            url + "?type=channel&custom_url=" + state.itemObj.custom_url;
        } else if (state.itemObj && state.itemObj.blog_id) {
          url = url + "?type=blog&custom_url=" + state.itemObj.custom_url;
        } else if (state.itemObj && state.itemObj.playlist_id) {
          url =
            url + "?type=playlist&custom_url=" + state.itemObj.custom_url;
        } else if (state.itemObj && state.itemObj.audio_id) {
          url = url + "?type=audio&custom_url=" + state.itemObj.custom_url;
        } else if (state.itemObj && state.itemObj.video_id) {
          url = url + "?type=video&custom_url=" + state.itemObj.custom_url;
        }
        window.location.href = url;
      } else {
      }
    });
  };
  if (!state.plans || state.plans.length == 0) {
    return null;
  }
  let planHTML = null;
  if (state.createPlan) {
    planHTML = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="popup_wrapper_cnt_header">
              <h2>
                {props.t(
                  !state.plan ? "Create New Plan" : "Edit Plan"
                )}
              </h2>
              <a onClick={closePopup} className="_close">
                <i></i>
              </a>
            </div>
            <Plan
              {...props}
              closePopup={closePopup}
              plan={state.plan}
            />
          </div>
        </div>
      </div>
    );
  }
  if (state.viewPlan || state.viewPlan == 0) {
    planHTML = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="popup_wrapper_cnt_header">
              <h2>{state.plans[state.viewPlan].title}</h2>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setState({ localUpdate: true, viewPlan: null });
                }}
                className="_close"
              >
                <i></i>
              </a>
            </div>
            <p className="plan-description">
              {state.plans[state.viewPlan].description}
            </p>
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
          props.openToast(
            {
              message: Translate(props, "Payment done successfully."),
              type:"success"
            }
          );
          if (state.itemObj && state.itemObj.channel_id) {
            setTimeout(() => {
              Router.push(`/channel/${state.itemObj.custom_url}`);
            }, 1000);
          } else if (state.itemObj && state.itemObj.blog_id) {
            setTimeout(() => {
              Router.push(`/blog/${state.itemObj.custom_url}`);
            }, 1000);
          } else if (state.itemObj && state.itemObj.playlist_id) {
            setTimeout(() => {
              Router.push(`/playlist/${state.itemObj.custom_url}`);
            }, 1000);
          } else if (state.itemObj && state.itemObj.audio_id) {
            setTimeout(() => {
              Router.push(`/audio/${state.itemObj.custom_url}`);
            }, 1000);
          } else if (state.itemObj && state.itemObj.video_id) {
            setTimeout(() => {
              Router.push(`/watch/${state.itemObj.custom_url}`);
            }, 1000);
          } else {
            setTimeout(() => {
              Router.push(`/${state.member.username}`);
            }, 1000);
          }
        }}
        successBank={() => {
          props.openToast(
            {
              message:Translate(
                props,
                "Your bank request has been successfully sent, you will get notified once it's approved"
              ),
              type:"success"
            }
          );
          setState({ localUpdate: true, gateways: null });
        }}
        bankpackage_id={state.bankpackage_id}
        payPalURL={state.payPalURL}
        finishPayment="/subscription/finishPayment"
        bank_price={state.planPrice}
        subscriptionPayment={true}
        bank_type="user_subscribe"
        bank_resource_type="user"
        bank_resource_id={state.member.username}
        tokenURL={`${state.gatewaysURL}`}
        closePopup={() => setState({ localUpdate: true, gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  let plans = state.plans.map((plan, index) => {
    let image = plan.image;
    const splitVal = plan.image.split("/");
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
    } else {
      image = props.pageData.imageSuffix + image;
    }
    let description = plan.description;
    let viewMore = false;
    if (plan.description.length > 200) {
      viewMore = true;
      description = plan.description.substr(0, 197) + "...";
    }

    let perprice = {};
    perprice["package"] = { price: plan.price };
    return (
      <div
        className={`${state.userPrifile ? "gridColumn" : "gridColumn"}`}
        key={plan.member_plan_id}
      >
        <div className="card mx-auto plancard">
          <div className="card-body">
            <div className="pname-img">
              <div className="img">
                <img className="pimg" src={image} />
              </div>
              <p className="m-0 pname">
                {plan.title}
                <br />
                {props
                  .t("{{price}} / month", {
                    price: Currency({ ...props, ...perprice }),
                  })
                  .replace("<!-- -->", "")}
              </p>
            </div>
            <h6 className="card-subtitle mb-2 text-muted">
              {`${description}`}
              {viewMore ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setState({ viewPlan: index, localUpdate: true });
                  }}
                >
                  {props.t("view more")}
                </a>
              ) : null}
            </h6>
            <div className="row plan-options">
              {props.pageData.loggedInUserDetails &&
              state.user_id ==
                props.pageData.loggedInUserDetails.user_id ? (
                <div className="col-md-12 mt-3">
                  {plan.is_default == 0 ? (
                    <button
                      type="submit"
                      className="btn-block mb-2"
                      onClick={(e) => deletePlan( plan.member_plan_id,e)}
                    >
                      <span>{props.t("Delete Plan")}</span>
                    </button>
                  ) : (
                    <button
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        minHeight: "39px",
                      }}
                      type="submit"
                      className="btn-block mb-2"
                    ></button>
                  )}
                  
                  <button
                    type="submit"
                    className="btn-block mb-2"
                    onClick={(e) => editPlan( plan.member_plan_id,e)}
                  >
                    <span>{props.t("Edit Plan")}</span>
                  </button>
                </div>
              ) : (
                <div className="col-md-12 mt-3">
                  {state.userSubscription &&
                  state.userSubscriptionID == plan.member_plan_id ? (
                    props.pageData.appSettings[
                      "member_cancel_user_subscription"
                    ] == 1 ? (
                      <button
                        type="submit"
                        className="active-subscription btn-block m-0 mb-2"
                        onClick={(e) => cancelSubscription(
                          plan.member_plan_id,
                          e
                        )}
                      >
                        <span>{props.t("Cancel Subscription")}</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="active-subscription btn-block m-0 mb-2"
                      >
                        <span>{props.t("Active Subscription")}</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="submit"
                      className="btn-block m-0 mb-2"
                      onClick={(e) => subscribeNow(
                        plan.member_plan_id,
                        plan.price,
                        e
                      )}
                    >
                      <span>{props.t("Subscibe now")}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <React.Fragment>
      {gatewaysHTML}
      {planHTML}
      {props.pageData.loggedInUserDetails &&
      state.user_id == props.pageData.loggedInUserDetails.user_id ? (
        <button type="submit" className="plan-create-btn" onClick={create}>
          <span>{props.t("Create New Plan")}</span>
        </button>
      ) : null}
      {!state.userPrifile ? (
        <div className="gridContainer gridPlan">{plans}</div>
      ) : (
        <React.Fragment>{plans}</React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Plans;
