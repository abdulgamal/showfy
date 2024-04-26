const paypal = require("paypal-rest-sdk");
var url = require("url");
const moment = require("moment");
const dateTime = require("node-datetime");
const globalModel = require("../models/globalModel");
const memberSubscriptions = require("../functions/ipnsFunctions/memberSubscriptions");

exports.MembersSubscription = async (req, subscription) => {
  let isValid = false;
  subscription.type = "user_subscribe";
  let price = +parseFloat(subscription.price).toFixed(2);
  if (subscription.gateway_profile_id.indexOf("wallet_payment") > -1) {

    let transaction;
    await globalModel
      .custom(
        req,
        "SELECT * FROM transactions LEFT JOIN currencies ON transactions.currency = currencies.ID WHERE subscription_id = ?",
        [subscription.subscription_id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          transaction = res[0];
        }
      });


    // check user wallet amount currently
    let user = null;
    await globalModel
      .custom(
        req,
        "SELECT * FROM users LEFT JOIN userdetails ON userdetails.user_id = users.user_id WHERE users.user_id = ?",
        [subscription.user_id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          user = res[0];
        } else {
          isValid = false;
        }
      });
    if (!user) {
      return false;
    }
    let owner = null;
    await globalModel
      .custom(
        req,
        "SELECT * FROM users LEFT JOIN userdetails ON userdetails.user_id = users.user_id WHERE users.user_id = ?",
        [subscription.id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          owner = res[0];
        } else {
          isValid = false;
        }
      });
    if (!owner) {
      return false;
    }

    if (parseFloat(user.wallet) < parseFloat(price)) {
      // low wallet balance
      memberSubscriptions.sendEmail(req, {
        type: subscription.type + "_" + "payment_subscription_expired",
        owner: user,
      });
      globalModel
        .custom(
          req,
          "UPDATE `subscriptions` SET `status` = ? WHERE subscription_id = ?",
          ["expired"]
        )
        .then((res) => {})
        .catch((err) => {
          console.log("ERROR IN LEVEL CHAGE CRON ", err);
        });
      return false;
    }
    // deduct amount from wallet
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet - ? WHERE user_id = ?", [
        price,
        subscription.user_id,
      ])
      .then((result) => {});
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet + ? WHERE user_id = ?", [
        price,
        subscription.id,
      ])
      .then((result) => {});

    let updatedData = {};
    let expiration = null;
    let givenDate = new Date();
    expiration = moment(givenDate).add(1, "M");

    updatedData["expiration_date"] = dateTime
      .create(expiration)
      .format("Y-m-d H:M:S");

    updatedData["status"] = "completed";
    updatedData["is_notification_send"] = "0";
    updatedData["is_level_change"] = "0";

    let insertData = {
      state: "completed",
      order_id: subscription.order_id,
      package_id: subscription.package_id,
      type: subscription.type,
      id: subscription.id,
      owner_id: subscription.owner_id,
      subscription_id: subscription.subscription_id,
      gateway_transaction_id: subscription.gateway_profile_id,
      gateway_id: subscription.gateway_id,
      gateway_transaction_id: subscription.gateway_transaction_id,
      price: price,
      currency: transaction.currency,
      default_currency: req.defaultCurrency.ID,
      change_rate:transaction.currency_value,
      creation_date: dateTime.create().format("Y-m-d H:M:S"),
      modified_date: dateTime.create().format("Y-m-d H:M:S"),
    };
    globalModel
      .custom(
        req,
        "INSERT INTO transactions SET ? ON DUPLICATE KEY UPDATE state = ?",
        [insertData, "completed"]
      )
      .then(async (result) => {});

    globalModel
      .update(
        req,
        updatedData,
        "subscriptions",
        "subscription_id",
        subscription.subscription_id
      )
      .then((result) => {})
      .catch((err) => {});
    memberSubscriptions.sendEmail(req, {
      type: subscription.type + "_" + "payment_subscription_active",
      owner: user,
    });
    return true;
  }

  return isValid;
};

exports.channelSubscription = async (req, subscription) => {
  let isValid = false;
  subscription.type = "channel_support";
  let price = parseFloat(subscription.channel_subscription_amount).toFixed(2);
  if (subscription.gateway_profile_id.indexOf("wallet_payment") > -1) {

    let transaction;
    await globalModel
      .custom(
        req,
        "SELECT * FROM transactions LEFT JOIN currencies ON transactions.currency = currencies.ID WHERE subscription_id = ?",
        [subscription.subscription_id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          transaction = res[0];
        }
      });

    // check user wallet amount currently
    let user = null;

    await globalModel
      .custom(
        req,
        "SELECT * FROM users LEFT JOIN userdetails ON userdetails.user_id = users.user_id WHERE users.user_id = ?",
        [subscription.owner_id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          user = res[0];
        } else {
          isValid = false;
        }
      });
    if (!user) {
      return false;
    }

    if (parseFloat(user.wallet) < price) {
      // low wallet balance
      memberSubscriptions.sendEmail(req, {
        type: subscription.type + "_" + "payment_subscription_expired",
        owner: user,
      });
      globalModel
        .custom(
          req,
          "UPDATE `subscriptions` SET `status` = ? WHERE subscription_id = ?",
          ["expired"]
        )
        .then((res) => {})
        .catch((err) => {
          console.log("ERROR IN LEVEL CHAGE CRON ", err);
        });
      return false;
    }
    // deduct amount from wallet
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet - ? WHERE user_id = ?", [
        price,
        subscription.owner_id,
      ])
      .then((result) => {});
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet + ? WHERE user_id = ?", [
        price,
        subscription.channel_owner_id,
      ])
      .then((result) => {});

    let updatedData = {};
    let expiration = null;
    let givenDate = new Date();
    expiration = moment(givenDate).add(1, "M");

    updatedData["expiration_date"] = dateTime
      .create(expiration)
      .format("Y-m-d H:M:S");

    updatedData["status"] = "completed";
    updatedData["is_notification_send"] = "0";
    updatedData["is_level_change"] = "0";

    let insertData = {
      state: "completed",
      order_id: subscription.order_id,
      package_id: subscription.package_id,
      type: "channel_subscription",
      id: subscription.id,
      owner_id: subscription.owner_id,
      subscription_id: subscription.subscription_id,
      gateway_transaction_id: subscription.gateway_profile_id,
      gateway_id: subscription.gateway_id,
      gateway_transaction_id: subscription.gateway_transaction_id,
      price: price,
      default_currency:req.defaultCurrency.ID,
      change_rate: transaction.currency_value,
      currency: transaction.currency,
      creation_date: dateTime.create().format("Y-m-d H:M:S"),
      modified_date: dateTime.create().format("Y-m-d H:M:S"),
    };
    globalModel
      .custom(
        req,
        "INSERT INTO transactions SET ? ON DUPLICATE KEY UPDATE state = ?",
        [insertData, "completed"]
      )
      .then(async (result) => {});

    globalModel
      .update(
        req,
        updatedData,
        "subscriptions",
        "subscription_id",
        subscription.subscription_id
      )
      .then((result) => {})
      .catch((err) => {});
    memberSubscriptions.sendEmail(req, {
      type: subscription.type + "_" + "payment_subscription_active",
      owner: user,
    });
    return true;
  }

  return isValid;
};
exports.userSubscription = async (req, subscription) => {
  let isValid = false;
  let price = +parseFloat(subscription.price).toFixed(2);
  if (subscription.gateway_profile_id.indexOf("wallet_payment") > -1) {
    // check user wallet amount currently
    let transaction;
    await globalModel
      .custom(
        req,
        "SELECT * FROM transactions LEFT JOIN currencies ON transactions.currency = currencies.ID WHERE subscription_id = ?",
        [subscription.subscription_id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          transaction = res[0];
        }
      });

    let user = null;
    await globalModel
      .custom(
        req,
        "SELECT * FROM users LEFT JOIN userdetails ON userdetails.user_id = users.user_id WHERE users.user_id = ?",
        [subscription.owner_id]
      )
      .then((result) => {
        if (result) {
          const res = JSON.parse(JSON.stringify(result));
          user = res[0];
        } else {
          isValid = false;
        }
      });
    if (!user) {
      return false;
    }

    if (parseFloat(user.wallet) < price || parseInt(subscription.is_recurring,10) == 0) {
      // low wallet balance
      memberSubscriptions.sendEmail(req, {
        type: "payment_subscription_expired",
        owner: user,
      });
      return false;
    }
    // deduct amount from wallet
    await globalModel
      .custom(req, "UPDATE users SET `wallet` = wallet - ? WHERE user_id = ?", [
        price,
        subscription.owner_id,
      ])
      .then((result) => {});

    let updatedData = {};
    let expiration = null;
    if (subscription.is_recurring) {
      expiration = await exports.getExpirationDate(subscription);
      if (subscription) {
        let planExpirationDate = await exports.planExpirationDate(
          subscription,
          subscription.creation_date
        );
        //check plan exires
        if (planExpirationDate) {
          let planExpireDate = new Date(planExpirationDate);
          let currentDate = new Date();
          if (planExpireDate.getTime() <= currentDate.getTime()) {
            //expire plan
            expiration = null;
          }
        }
      }
    }
    if (expiration) {
      updatedData["expiration_date"] = dateTime
        .create(expiration)
        .format("Y-m-d H:M:S");
    } else {
      updatedData["expiration_date"] = null;
    }
    updatedData["status"] = "completed";
    updatedData["is_notification_send"] = "0";
    updatedData["is_level_change"] = "0";

    let insertData = {
      state: "completed",
      order_id: subscription.order_id,
      package_id: subscription.package_id,
      type: subscription.type,
      id: subscription.id,
      gateway_transaction_id: subscription.gateway_profile_id,
      owner_id: subscription.owner_id,
      subscription_id: subscription.subscription_id,
      gateway_id: subscription.gateway_id,
      gateway_transaction_id: subscription.gateway_transaction_id,
      price: price,
      currency: transaction.currency,
      default_currency: req.defaultCurrency.ID,
      change_rate:transaction.currency_value,
      creation_date: dateTime.create().format("Y-m-d H:M:S"),
      modified_date: dateTime.create().format("Y-m-d H:M:S"),
    };
    globalModel
      .custom(
        req,
        "INSERT INTO transactions SET ? ON DUPLICATE KEY UPDATE state = ?",
        [insertData, "completed"]
      )
      .then(async (result) => {});

    globalModel
      .update(
        req,
        updatedData,
        "subscriptions",
        "subscription_id",
        subscription.subscription_id
      )
      .then((result) => {})
      .catch((err) => {});
    memberSubscriptions.sendEmail(req, {
      type: "payment_subscription_active",
      owner: user,
    });
    return true;
  }

  return isValid;
};

exports.getBillingCycles = (data) => {
  if (parseInt(data.interval) == 0 || data.type == "forever") {
    return 1;
  }
  // Indefinite
  else if (!(parseInt(data.duration) > 0 && data.duration_type != "forever")) {
    return 0;
  } else {
    let multiplier = 0;
    switch (data.type + "-" + data.duration_type) {
      case "day-day":
      case "week-week":
      case "month-month":
      case "year-year":
        multiplier = 1;
        break;

      case "day-week":
        multiplier = 7;
        break;
      case "day-month":
        multiplier = 30;
        break;
      case "day-year":
        multiplier = 365;
        break;
      case "week-month":
        multiplier = 4;
        break;
      case "week-year":
        multiplier = 52;
        break;
      case "month-year":
        multiplier = 12;
        break;
      case "week-day":
        multiplier = 1 / 7;
        break;
      case "month-day":
        multiplier = 1 / 30;
        break;
      case "month-week":
        multiplier = 1 / 4;
        break;
      case "year-day":
        multiplier = 1 / 365;
        break;
      case "year-week":
        multiplier = 1 / 52;
        break;
      case "year-month":
        multiplier = 1 / 12;
        break;
      default:
        break;
    }

    return Math.ceil((parseInt(data.duration) * multiplier) / data.interval);
  }
};

exports.planExpirationDate = (data, date = "") => {
  let givenDate = date;
  if ("" === givenDate || !givenDate) {
    givenDate = new Date();
  } else {
    givenDate = new Date(date);
  }

  //if one time payment
  if (data.duration_type == "forever" || parseFloat(data.price) == 0) {
    return null;
  }
  let interval = "";
  let interval_type = "";
  interval = data.duration;
  interval_type = data.duration_type;

  let dateConverted = null;
  // get plan expiration date
  switch (interval_type) {
    case "day":
      dateConverted = moment(givenDate).add(interval, "d");
      break;
    case "week":
      dateConverted = moment(givenDate).add(interval, "w");
      break;
    case "month":
      dateConverted = moment(givenDate).add(interval, "M");
      break;
    case "year":
      dateConverted = moment(givenDate).add(interval, "y");
      break;
    default:
      break;
  }

  return dateConverted
    ? dateConverted.format("YYYY-MM-DD HH:mm:ss")
    : dateConverted;
};

exports.getExpirationDate = (data, date = "") => {
  let givenDate = date;
  if ("" === givenDate || !givenDate) {
    givenDate = new Date();
  } else {
    givenDate = new Date(date);
  }

  //if one time payment
  if (
    (((parseInt(data.interval) == 0 || data.type == "forever") &&
      parseInt(data.duration) == 0) ||
      parseInt(data.price) == 0) &&
    !(parseInt(data.duration_type) > 0 && data.duration_type != "forever")
  ) {
    return null;
  }
  let interval = "";
  let interval_type = "";
  if (
    parseInt(data.interval) == 0 ||
    data.type == "forever" ||
    parseInt(data.price) == 0
  ) {
    interval = data.duration;
    interval_type = data.duration_type;
  } else {
    interval = data.interval;
    interval_type = data.type;
  }

  if (interval == "forever") {
    return null;
  }
  let dateConverted = null;
  // get plan expiration date
  switch (interval_type) {
    case "day":
      dateConverted = moment(givenDate).add(interval, "d");
      break;
    case "week":
      dateConverted = moment(givenDate).add(interval, "w");
      break;
    case "month":
      dateConverted = moment(givenDate).add(interval, "M");
      break;
    case "year":
      dateConverted = moment(givenDate).add(interval, "y");
      break;
    default:
      break;
  }

  return dateConverted
    ? dateConverted.format("YYYY-MM-DD HH:mm:ss")
    : dateConverted;
};
exports.getDescription = (req, data, noPrice = false) => {
  let price = req.convertCurrency({price:data.price,req:req})
  
  if (noPrice) {
    price = "";
  }
  let str = "";
  let subStr = "";
  if (parseFloat(data.price) == 0 || parseInt(data.price) == 0) {
    str = req.i18n.t("FREE");
  } else if (parseInt(data.interval) > 0 && data.type != "forever") {
    if (parseInt(data.interval) == 1) {
      //singuar
      if (data.type == "day") {
        subStr = "Daily";
      } else {
        subStr = data.type + "ly";
      }
      str = req.i18n.t("{{price}} " + subStr, { price: price });
    } else {
      //plural
      subStr = data.type + "s";
      str = req.i18n.t("{{price}} per {{interval}} {{type}}", {
        price: price,
        interval: data.interval,
        type: subStr,
      });
    }
  } else {
    str = req.i18n.t("One-time fee of {{price}}", { price: price });
    if (noPrice) {
      str = req.i18n.t("One-time fee");
    }
  }

  if (parseInt(data.duration) > 0 && data.duration_type != "forever") {
    if (parseInt(data.duration) == 1) {
      //singuar
      if (data.duration_type == "day") {
        subStr = "Day";
      } else {
        subStr = data.duration_type;
      }
    } else {
      //plural
      subStr = data.duration_type + "s";
    }

    str = req.i18n.t("{{type}} for {{duration}} {{subtype}}", {
      type: str,
      duration: data.duration,
      subtype: subStr,
    });
  }
  return str;
};

exports.init = async (req, res, data, packageObj) => {
  return new Promise(async function (resolve, reject) {
    var isoDate = new Date();
    isoDate.setSeconds(isoDate.getSeconds() + 20);
    isoDate.toISOString().slice(0, 19) + "Z";
    // paypal auth configuration
    var config = {
      api: {
        mode: req.appSettings.payment_paypal_sanbox == "0" ? "sandbox" : "live", //sandbox or live
        client_id: req.appSettings.payment_client_id,
        client_secret: req.appSettings.payment_client_secret,
        headers: {
          custom: "header",
        },
      },
    };
    paypal.configure(config.api);
    let cycles = await exports.getBillingCycles(packageObj);
    var billingPlanAttributes = {
      description:
        data.description.length > 127
          ? data.description.substr(0, 124) + "..."
          : data.description,
      merchant_preferences: {
        auto_bill_amount: "yes",
        cancel_url: data.cancelUrl,
        initial_fail_amount_action: "continue",
        max_fail_attempts: "1",
        return_url: data.returnUrl,
        setup_fee: {
          currency: req.appSettings.payment_default_currency,
          value: packageObj.setup_fee
            ? parseFloat(packageObj.setup_fee).toFixed(2)
            : 0,
        },
      },
      name: data.headingTitle,
      payment_definitions: [
        {
          amount: {
            currency: req.appSettings.payment_default_currency,
            value: data.amount,
          },
          cycles: cycles,
          frequency: data.frequency,
          frequency_interval: data.interval,
          name: data.title,
          type: "REGULAR",
        },
      ],
      type: cycles <= 0 ? "INFINITE" : "FIXED",
    };

    var billingPlanUpdateAttributes = [
      {
        op: "replace",
        path: "/",
        value: {
          state: "ACTIVE",
        },
      },
    ];

    var billingAgreementAttributes = {
      name: data.title,
      description: "Agreement for " + data.title,
      start_date: isoDate,
      plan: {
        id: "",
      },
      payer: {
        payment_method: "paypal",
      },
    };
    // Create the billing plan
    paypal.billingPlan.create(
      billingPlanAttributes,
      function (error, billingPlan) {
        if (error) {
          reject(
            error.response.details && error.response.details.length > -1
              ? error.response.details[0].issue
              : ""
          );
        } else {
          // Activate the plan by changing status to Active
          paypal.billingPlan.update(
            billingPlan.id,
            billingPlanUpdateAttributes,
            function (error, response) {
              if (error) {
                reject(
                  error.response.details && error.response.details.length > -1
                    ? error.response.details[0].issue
                    : ""
                );
              } else {
                billingAgreementAttributes.plan.id = billingPlan.id;
                // Use activated billing plan to create agreement
                paypal.billingAgreement.create(
                  billingAgreementAttributes,
                  function (error, billingAgreement) {
                    if (error) {
                      reject(
                        error.response.details &&
                          error.response.details.length > -1
                          ? error.response.details[0].issue
                          : ""
                      );
                    } else {
                      for (
                        var index = 0;
                        index < billingAgreement.links.length;
                        index++
                      ) {
                        if (
                          billingAgreement.links[index].rel === "approval_url"
                        ) {
                          var approval_url = billingAgreement.links[index].href;
                          resolve({
                            url: approval_url,
                            token: url.parse(approval_url, true).query.token,
                          });
                        }
                      }
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};

exports.execute = (req, token) => {
  return new Promise(function (resolve, reject) {
    // paypal auth configuration
    var config = {
      api: {
        mode: req.appSettings.payment_paypal_sanbox == "0" ? "sandbox" : "live", //sandbox or live
        client_id: req.appSettings.payment_client_id,
        client_secret: req.appSettings.payment_client_secret,
        headers: {
          custom: "header",
        },
      },
    };
    paypal.configure(config.api);
    paypal.billingAgreement.execute(
      token,
      {},
      function (error, billingAgreement) {
        if (error) {
          console.log(error);
          reject(
            error.response.details && error.response.details.length > -1
              ? error.response.details[0].issue
              : ""
          );
        } else {
          const result = JSON.stringify(billingAgreement);
          resolve({ id: billingAgreement.id, state: billingAgreement.state });
        }
      }
    );
  });
};

exports.suspend = (req, billingAgreementId) => {
  return new Promise(function (resolve, reject) {
    var suspend_note = {
      note: "Suspending the agreement",
    };
    // paypal auth configuration
    var config = {
      api: {
        mode: req.appSettings.payment_paypal_sanbox == "0" ? "sandbox" : "live", //sandbox or live
        client_id: req.appSettings.payment_client_id,
        client_secret: req.appSettings.payment_client_secret,
        headers: {
          custom: "header",
        },
      },
    };
    paypal.configure(config.api);
    paypal.billingAgreement.suspend(
      billingAgreementId,
      suspend_note,
      function (error, response) {
        if (error) {
          console.log(error);
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};

exports.reactive = (req, billingAgreementId) => {
  return new Promise(function (resolve, reject) {
    var reactivate_note = {
      note: "Reactivating the agreement",
    };
    // paypal auth configuration
    var config = {
      api: {
        mode: req.appSettings.payment_paypal_sanbox == "0" ? "sandbox" : "live", //sandbox or live
        client_id: req.appSettings.payment_client_id,
        client_secret: req.appSettings.payment_client_secret,
        headers: {
          custom: "header",
        },
      },
    };
    paypal.configure(config.api);
    paypal.billingAgreement.reactivate(
      billingAgreementId,
      reactivate_note,
      function (error, response) {
        if (error) {
          console.log(error);
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};
exports.cancelStripe = (req, billingAgreementId, note) => {
  return new Promise(async function (resolve) {
    const stripe = require("stripe")(
      req.appSettings["payment_stripe_client_secret"]
    );
    await stripe.subscriptions.del(
      billingAgreementId,
      function (err, _response) {
        if (err) {
          //console.log(err)
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};
exports.cancel = (req, billingAgreementId, note) => {
  return new Promise(function (resolve, reject) {
    var cancel_note = {
      note: note ? note : "Canceling the agreement",
    };
    // paypal auth configuration
    var config = {
      api: {
        mode: req.appSettings.payment_paypal_sanbox == "0" ? "sandbox" : "live", //sandbox or live
        client_id: req.appSettings.payment_client_id,
        client_secret: req.appSettings.payment_client_secret,
        headers: {
          custom: "header",
        },
      },
    };
    paypal.configure(config.api);
    paypal.billingAgreement.cancel(
      billingAgreementId,
      cancel_note,
      function (error, response) {
        if (error) {
          console.log(error);
          reject(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};
