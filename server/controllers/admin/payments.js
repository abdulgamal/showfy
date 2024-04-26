const forms = require("forms");
const formFunctions = require("../../functions/forms/file");
const settings = require("../../models/settings");
const levels = require("../../models/levels");
const packages = require("../../models/packages");
const pagging = require("../../functions/pagging");
const globalModel = require("../../models/globalModel");
const recurringPaypal = require("../../functions/recurring-paypal");
const fileManager = require("../../models/fileManager");
const videoModel = require("../../models/videos");
const notifications = require("../../models/notifications");
const packageModel = require("../../models/packages");
const commonFunction = require("../../functions/commonFunctions");
const dateTime = require("node-datetime");

exports.delete = async (req, res) => {
  const id = req.params.id;
  let existing = {};

  if (id) {
    await packages
      .findById(id, req, res)
      .then((result) => {
        existing = result;
      })
      .catch((error) => {});
  }

  globalModel.delete(req, "packages", "package_id", id).then(() => {
    res.redirect(process.env.ADMIN_SLUG + "/payments/packages/");
  });
};

exports.payments = async (req, res) => {
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  var fields = forms.fields;
  var validators = forms.validators;
  var widgets = forms.widgets;
  var cssClasses = {
    label: [""],
    field: ["form-group"],
    classes: ["form-control"],
  };
  // var currencies = {}
  // currencies["USD"] = "United States dollar (USD)"
  // currencies["MNT"] = "Mongolian Tugrug (MNT)"
  // currencies["AUD"] = "Australian dollar (AUD)"
  // currencies["CAD"] = "Canadian dollar (CAD)"
  // currencies["CZK"] = "Czech koruna (CZK)"
  // currencies["DKK"] = "Danish krone (DKK)"
  // currencies["EUR"] = "Euro (EUR)"
  // currencies["HKD"] = "Hong Kong dollar (HKD)"
  // currencies["ILS"] = "Israeli new shekel (ILS)"
  // currencies["MXN"] = "Mexican peso (MXN)"
  // currencies["NZD"] = "New Zealand dollar (NZD)"
  // currencies["NOK"] = "Norwegian krone (NOK)"
  // currencies["PHP"] = "Philippine peso (PHP)"
  // currencies["PLN"] = "Polish złoty (PLN)"
  // currencies["GBP"] = "Pound sterling (GBP)"
  // currencies["RUB"] = "Russian ruble (RUB)"
  // currencies["SGD"] = "Singapore dollar (SGD)"
  // currencies["SEK"] = "Swedish krona (SEK)"
  // currencies["CHF"] = "Swiss franc (CHF)"
  // currencies["THB"] = "Thai baht (THB)"
  // currencies['INR'] = "Indian rupee (INR)"

  //get uploaded file by admin
  const files = { "": "" };
  await fileManager
    .findAll(req, { column: "path", like: "image" })
    .then((result) => {
      result.forEach((res) => {
        let url = res.path.split(/(\\|\/)/g).pop();
        files[res.path] = res.orgName;
      });
    });

  var reg_form = forms.create(
    {
      // payment_default_currency: fields.string({
      //     choices: currencies,
      //    widget: widgets.select({ "classes": ["select"] }),
      //     label:"Set a Default Currency",
      //     fieldsetClasses:"form_fieldset",
      //     cssClasses: {"field" : ["form-group"]},
      //     value:settings.getSetting(req,"payment_default_currency",'USD')
      // }),
      payment_label: fields.string({
        widget: widgets.label({
          content:
            "You can change the currency of your website by selecting the above radio button. INR currency is supported as a payment currency and a currency balance for in-country paypal accounts only.",
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payment_paypal_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Paypal Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_paypal_method", 1).toString(),
      }),

      payment_paypal_sanbox: fields.string({
        choices: { 1: "Live", 0: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "PayPal Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_paypal_sanbox", "0")
          .toString(),
      }),

      paypal_label: fields.string({
        widget: formFunctions.makeClickable({
          content: "[0] to learn how to create below credentials.",
          replace: [
            {
              0: '<a href="/Documentation/paypal" target="_blank">Click here</a>',
            },
          ],
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payment_client_id: fields.string({
        label: "Paypal Client ID",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_client_id", ""),
      }),
      payment_client_secret: fields.string({
        label: "Paypal Secret Key",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_client_secret", ""),
      }),

      payment_bank_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Bank Transfer",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_bank_method", "0").toString(),
      }),

      payment_bank_method_description: fields.string({
        label: "Bank Transfer Description",
        cssClasses: { field: ["form-group"] },
        widget: widgets.textarea({ classes: ["form-control"] }),
        value: settings.getSetting(
          req,
          "payment_bank_method_description",
          "Bank Transfer Description"
        ),
      }),
      payment_bank_method_note: fields.string({
        label: "Bank Transfer Note",
        cssClasses: { field: ["form-group"] },
        widget: widgets.textarea({ classes: ["form-control"] }),
        value: settings.getSetting(
          req,
          "payment_bank_method_note",
          "Upload your bank transfer receipt so we will verify and confirm your order."
        ),
      }),

      payment_cashfree_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Cashfree Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_cashfree_method", "0")
          .toString(),
      }),
      payment_cachfree_sanbox: fields.string({
        choices: { 1: "Live", 0: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Cashfree Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_cachfree_sanbox", "0")
          .toString(),
      }),

      cashfree_label: fields.string({
        widget: formFunctions.makeClickable({
          content: "[0] to learn how to create below credentials.",
          replace: [
            {
              0: '<a href="https://dev.cashfree.com/payment-gateway/integrations#api-keys" target="_blank">Click here</a>',
            },
          ],
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payment_cashfree_client_id: fields.string({
        label: "Cashfree Client ID",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_cashfree_client_id", ""),
      }),
      payment_cashfree_client_secret: fields.string({
        label: "Cashfree Secret Key",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_cashfree_client_secret", ""),
      }),

      payment_razorpay_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Razorpay Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_razorpay_method", "0")
          .toString(),
      }),
      payment_razorpay_sanbox: fields.string({
        choices: { 1: "Live", 0: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Razorpay Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_razorpay_sanbox", "0")
          .toString(),
      }),

      razorpay_label: fields.string({
        widget: formFunctions.makeClickable({
          content: "[0] to learn how to create below credentials.",
          replace: [
            {
              0: '<a href="https://razorpay.com/docs/api/authentication/#generate-api-keys" target="_blank">Click here</a>',
            },
          ],
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payment_razorpay_client_id: fields.string({
        label: "Razorpay Key ID",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_razorpay_client_id", ""),
      }),
      payment_razorpay_client_secret: fields.string({
        label: "Razorpay Key Secret",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_razorpay_client_secret", ""),
      }),

      payment_flutterwave_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Flutterwave Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_flutterwave_method", "0")
          .toString(),
      }),
      payment_flutterwave_sanbox: fields.string({
        choices: { 1: "Live", 0: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Flutterwave Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_flutterwave_sanbox", "0")
          .toString(),
      }),

      flutterwave_label: fields.string({
        widget: formFunctions.makeClickable({
          content: "[0] to learn how to create below credentials.",
          replace: [
            {
              0: '<a href="https://developer.flutterwave.com/docs/integration-guides/authentication/" target="_blank">Click here</a>',
            },
          ],
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payment_flutterwave_client_id: fields.string({
        label: "Flutterwave Public Key",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_flutterwave_client_id", ""),
      }),
      payment_flutterwave_client_secret: fields.string({
        label: "Flutterwave Secret Key",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_flutterwave_client_secret", ""),
      }),
      payment_flutterwave_encryption: fields.string({
        label: "Flutterwave Encryption Key",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_flutterwave_encryption", ""),
      }),

      payment_stripe_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Stripe Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_stripe_method", "0")
          .toString(),
      }),
      // stripe_ipnlabel: fields.string({
      //     widget: formFunctions.makeClickable({content : 'Set IPN URL: [0]',replace: [{0:'<a href="'+process.env.PUBLIC_URL+'/payment/stripeIPN" target="_blank">'+process.env.PUBLIC_URL+'/payment/stripeIPN</a>'}]}),
      //     cssClasses:{"field" : ["form-group","form-description"]},
      // }),
      payment_stripe_sanbox: fields.string({
        choices: { 1: "Live", 0: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Stripe Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_stripe_sanbox", "0")
          .toString(),
      }),

      stripe_label: fields.string({
        widget: formFunctions.makeClickable({
          content: "[0] to learn how to create below credentials.",
          replace: [
            {
              0: '<a href="https://support.stripe.com/questions/locate-api-keys-in-the-dashboard" target="_blank">Click here</a>',
            },
          ],
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payment_stripe_publish_key: fields.string({
        label: "Stripe Publish Key (starts with pk_)",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_stripe_publish_key", ""),
      }),
      payment_stripe_client_secret: fields.string({
        label: "Stripe Secret Key (starts with sk_)",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_stripe_client_secret", ""),
      }),
      payment_stripe_webhook_key: fields.string({
        label: "Stripe Webhook Secret Key (starts with whsec_)",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "payment_stripe_webhook_key", ""),
      }),
      default_notification_image: fields.string({
        label: "Payment Notification Image",
        choices: files,
        required: false,
        widget: widgets.select({ classes: ["select"] }),
        cssClasses: { field: ["form-group"], label: ["select"] },
        value: settings
          .getSetting(req, "default_notification_image", "")
          .toString(),
      }),
      // apple in app purchase
      payment_appleinapp_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Apple In-App Purchase",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_appleinapp_method", 0)
          .toString(),
      }),
      apple_label: fields.string({
        widget: formFunctions.makeClickable({
          content: "Apple In-App Purchase will work on iOS app only.",
          replace: [],
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),
      apple_inapp_purchasesecret: fields.string({
        label: "Apple In-App Purchase Secret Key",
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: req.loguserallowed
          ? "****"
          : settings.getSetting(req, "apple_inapp_purchasesecret", ""),
      }),
      apple_webhook_label: fields.string({
        widget: widgets.label({
          content:
            "Apple Store Server Notification URL: " +
            process.env.PUBLIC_URL +
            "/apple-pay-notification",
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),
      apple_inapp_env: fields.string({
        choices: { production: "Live", sandbox: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Apple In-App Purchase Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "apple_inapp_env", "1").toString(),
      }),

      payment_qpay_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "QPay Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_qpay_method", 0).toString(),
      }),
      qpay_label: fields.string({
        widget: widgets.label({
          content: "Create QPay account from here: https://qpay.mn",
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),
      payment_qpay_username: fields.string({
        widget: widgets.text({ classes: ["form-control"] }),
        label: "QPay Payment Username",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_qpay_username", "").toString(),
      }),
      payment_qpay_password: fields.string({
        widget: widgets.text({ classes: ["form-control"] }),
        label: "QPay Payment Password",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_qpay_password", "").toString(),
      }),
      payment_qpay_invoice: fields.string({
        widget: widgets.text({ classes: ["form-control"] }),
        label: "QPay Invoice Code",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_qpay_invoice", "").toString(),
      }),
      payment_qpay_branch_code: fields.string({
        widget: widgets.text({ classes: ["form-control"] }),
        label: "QPay Sender Branch Code",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_qpay_branch_code", "")
          .toString(),
      }),


      payment_aamarpay_method: fields.string({
        choices: { 1: "Enabled", 0: "Disabled" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Aamarpay Payment",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_aamarpay_method", 0).toString(),
      }),
      aamarpay_label: fields.string({
        widget: widgets.label({
          content: "Create Aamarpay account from here: https://www.aamarpay.com",
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),
      payment_aamarpay_sanbox: fields.string({
        choices: { 1: "Live", 0: "Sandbox" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Aamarpay Mode",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings
          .getSetting(req, "payment_aamarpay_sanbox", "0")
          .toString(),
      }),
      payment_aamarpay_storeid: fields.string({
        widget: widgets.text({ classes: ["form-control"] }),
        label: "Aamarpay Store ID",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_aamarpay_storeid", "").toString(),
      }),
      payment_aamarpay_signaturekey: fields.string({
        widget: widgets.text({ classes: ["form-control"] }),
        label: "Aamarpay Signature Key",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value: settings.getSetting(req, "payment_aamarpay_signaturekey", "").toString(),
      }),

      // pay by wallet
      // payment_pay_wallet: fields.string({
      //     choices: {"1":"Enabled","0":"Disabled"},
      //     widget: widgets.select({ "classes": ["select"] }),
      //     label:"Enable Site Wallet Payment",
      //     fieldsetClasses:"form_fieldset",
      //     cssClasses: {"field" : ["form-group"]},
      //     value:settings.getSetting(req,"payment_pay_wallet",0).toString()
      // }),
      // payment_pay_single_wallet: fields.string({
      //     choices: {"1":"Enabled","0":"Disabled"},
      //     widget: widgets.select({ "classes": ["select"] }),
      //     label:"Want to make single site wallet payment",
      //     fieldsetClasses:"form_fieldset",
      //     cssClasses: {"field" : ["form-group"]},
      //     value:settings.getSetting(req,"payment_pay_single_wallet",0).toString()
      // }),

      payout_label: fields.string({
        widget: formFunctions.makeClickable({
          content:
            '<h2 style="text-align: center;margin: 40px;text-decoration: underline;">Payout Settings<h2>',
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),

      payout_settings: fields.string({
        label: "Choose Payout Options",
        choices: {
          paypal: "Paypal",
          banktransfer: "Bank Transfer",
        },
        cssClasses: { field: ["form-group"] },
        widget: widgets.multipleCheckbox({
          classes: ["form-control-checkbox"],
        }),
        value: settings.getSetting(req, "payout_settings")
          ? settings.getSetting(req, "payout_settings").split(",")
          : "paypal",
      }),

      banktransfer_payout: fields.string({
        label: "Bank Transfer",
        cssClasses: { field: ["form-group banktransfer_payout"] },
        widget: widgets.textarea({ classes: ["form-control"] }),
        value: settings.getSetting(req, "banktransfer_payout")
          ? settings.getSetting(req, "banktransfer_payout").split(",")
          : `Account Name:
Account Number:
Bank Name:
Branch Address of Bank:
IFSC Code:`,
      }),
    },
    { validatePastFirstError: true }
  );
  reg_form.handle(req, {
    success: function (form) {
      delete form.data["payment_label"];
      delete form.data["payout_label"];
      delete form.data["apple_webhook_label"];
      delete form.data["paypal_label"];
      delete form.data["cashfree_label"];
      delete form.data["razorpay_label"];
      delete form.data["flutterwave_label"];
      delete form.data["stripe_label"];
      delete form.data["apple_label"];
      // delete form.data['stripe_ipnlabel']
      if (!form.data.payout_settings || form.data.payout_settings.length == 0) {
        let errors = {};

        errors.payout_settings_paypal = "This is required field.";

        res.send({ errors: errors });
        return;
      }
      settings.setSettings(req, form.data);
      res.send({ success: 1, message: "Setting Saved Successfully." });
    },
    error: function (form) {
      const errors = formFunctions.formValidations(form);
      res.send({ errors: errors });
    },
    other: function (form) {
      res.render("admin/payments/index", {
        nav: url,
        reg_form: reg_form,
        title: "Settings",
      });
    },
  });
};

exports.transactions = async (req, res) => {
  let LimitNum = 10;
  let page = 1;
  if (req.params.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
  }

  const query = { ...req.query };
  let conditionalWhere = "";
  let condition = [];
  if (query.transaction_id && parseInt(query.transaction_id) > 0) {
    condition.push(query.transaction_id);
    conditionalWhere += " AND transactions.transaction_id = ?";
  }
  if (query.state) {
    if (query.state != "completed") {
      condition.push(query.state);
      conditionalWhere += " AND transactions.state = ?";
    } else {
      conditionalWhere +=
        " AND (transactions.state = 'completed' || transactions.state = 'active' || transactions.state = 'approved')";
    }
  } else {
    query.state = "completed";
    conditionalWhere +=
      " AND (transactions.state = 'completed' || transactions.state = 'active' || transactions.state = 'approved')";
  }
  if (query.order_id && parseInt(query.order_id) > 0) {
    condition.push(query.order_id);
    conditionalWhere += " AND transactions.order_id = ?";
  }
  if (query.subscription_id && parseInt(query.subscription_id) > 0) {
    condition.push(query.subscription_id);
    conditionalWhere += " AND transactions.subscription_id = ?";
  }
  if (query.owner_id && parseInt(query.owner_id) > 0) {
    condition.push(query.owner_id);
    conditionalWhere += " AND transactions.owner_id = ?";
  }
  if (query.displayname) {
    condition.push(query.displayname.toLowerCase());
    conditionalWhere +=
      " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')";
  }
  if (query.email) {
    condition.push(query.email.toLowerCase());
    conditionalWhere += " AND LOWER(users.email) LIKE CONCAT('%', ?,  '%')";
  }

  conditionalWhere += " AND users.user_id IS NOT NULL ";

  let results = [];
  let totalCount = 0;

  let sql =
    "SELECT COUNT(*) as totalCount FROM transactions INNER JOIN users on users.user_id = transactions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' " +
    conditionalWhere;
  await globalModel.custom(req, sql, condition).then((result) => {
    totalCount = result[0].totalCount;
  });
  if (totalCount > 0) {
    condition.push(LimitNum);
    condition.push((page - 1) * LimitNum);
    conditionalWhere +=
      " ORDER BY transactions.transaction_id DESC limit ? offset ?";
    let sqlQuery =
      "SELECT transactions.*,userdetails.username,userdetails.displayname FROM transactions INNER JOIN users on users.user_id = transactions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id  WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' " +
      conditionalWhere;
    await globalModel.custom(req, sqlQuery, condition).then((result) => {
      results = result;
    });
  }

  const paggingData = pagging.create(req, totalCount, page, "", LimitNum);
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  res.render("admin/payments/transactions", {
    defaultCurrencyValue: req.appSettings["payment_default_currency"],
    totalCount: totalCount,
    query: query,
    paggingData: paggingData,
    results: results,
    nav: url,
    title: "Manage Transactions",
  });
};

exports.subscriptions = async (req, res) => {
  let LimitNum = 10;
  let page = 1;
  if (req.params.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
  }

  const query = { ...req.query };
  let conditionalWhere = "";
  let condition = [];
  if (query.transaction_id && parseInt(query.transaction_id) > 0) {
    condition.push(query.transaction_id);
    conditionalWhere += " AND subscriptions.subscription_id = ?";
  }
  if (query.status) {
    if (query.status != "completed") {
      condition.push(query.status);
      conditionalWhere += " AND subscriptions.status = ?";
    } else {
      conditionalWhere +=
        " AND (subscriptions.status = 'completed' || subscriptions.status = 'active' || subscriptions.status = 'approved')";
    }
  } else {
    conditionalWhere +=
      " AND (subscriptions.status = 'completed' || subscriptions.status = 'active' || subscriptions.status = 'approved')";
  }

  if (query.package_id && parseInt(query.package_id) > 0) {
    condition.push(query.package_id);
    conditionalWhere += " AND subscriptions.package_id = ?";
  }
  if (query.type) {
    condition.push(
      query.type == "member" ? "member_subscription" : "channel_subscription"
    );
    conditionalWhere += " AND subscriptions.type = ?";
  } else {
    condition.push("member_subscription");
    conditionalWhere += " AND subscriptions.type = ?";
  }
  if (query.level_id && parseInt(query.level_id) > 0) {
    condition.push(query.level_id);
    conditionalWhere += " AND packages.level_id = ?";
  }
  if (query.owner_id && parseInt(query.owner_id) > 0) {
    condition.push(query.owner_id);
    conditionalWhere += " AND subscriptions.owner_id = ?";
  }
  if (query.displayname) {
    condition.push(query.displayname.toLowerCase());
    conditionalWhere +=
      " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')";
  }
  if (query.email) {
    condition.push(query.email.toLowerCase());
    conditionalWhere += " AND LOWER(users.email) LIKE CONCAT('%', ?,  '%')";
  }

  conditionalWhere += " AND users.user_id IS NOT NULL ";

  let results = [];
  let totalCount = 0;

  let sql =
    "SELECT COUNT(*) as totalCount FROM subscriptions LEFT JOIN packages on packages.package_id = subscriptions.package_id LEFT JOIN levels on levels.level_id = packages.level_id INNER JOIN users on users.user_id = subscriptions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' " +
    conditionalWhere;
  await globalModel.custom(req, sql, condition).then((result) => {
    totalCount = result[0].totalCount;
  });

  if (totalCount > 0) {
    condition.push(LimitNum);
    condition.push((page - 1) * LimitNum);
    conditionalWhere +=
      " ORDER BY subscriptions.subscription_id DESC limit ? offset ?";
    let sqlQuery =
      "SELECT subscriptions.*,userdetails.username,userdetails.displayname,levels.title as levelTitle,levels.level_id as levelID,packages.title as packageTitle,packages.package_id as packageId FROM subscriptions LEFT JOIN packages on packages.package_id = subscriptions.package_id LEFT JOIN levels on levels.level_id = packages.level_id INNER JOIN users on users.user_id = subscriptions.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id  WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' " +
      conditionalWhere;
    await globalModel.custom(req, sqlQuery, condition).then((result) => {
      results = result;
    });
  }

  let memberLevels = [];
  await levels
    .findAll(req, { typeNotIn: "'admin','moderator','public'" })
    .then((result) => {
      if (result) memberLevels = result;
    });

  let packagesData = [];
  await packages
    .findAll(req, { column: "packages.*", enabled: 1 })
    .then((result) => {
      if (result) packagesData = result;
    });

  const paggingData = pagging.create(req, totalCount, page, "", LimitNum);
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  res.render("admin/payments/subscriptions", {
    packagesData: packagesData,
    memberLevels: memberLevels,
    totalCount: totalCount,
    query: query,
    paggingData: paggingData,
    results: results,
    nav: url,
    title: "Manage Subscriptions",
  });
};

exports.bankTransfers = async (req, res) => {
  let LimitNum = 20;
  let page = 1;
  if (req.params.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
  }

  const query = { ...req.query };
  let conditionalWhere = "";
  let condition = [];

  if (query.status) {
    if (query.status == "1") {
      condition.push(1);
      conditionalWhere += " AND bankdetails.status = ?";
    } else {
      condition.push(0);
      conditionalWhere += " AND bankdetails.status = ?";
    }
  } else {
    query.status = "0";
    condition.push(0);
    conditionalWhere += " AND bankdetails.status = ?";
  }

  if (query.owner_id && parseInt(query.owner_id) > 0) {
    condition.push(query.owner_id);
    conditionalWhere += " AND bankdetails.owner_id = ?";
  }
  if (query.displayname) {
    condition.push(query.displayname.toLowerCase());
    conditionalWhere +=
      " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')";
  }
  if (query.email) {
    condition.push(query.email.toLowerCase());
    conditionalWhere += " AND LOWER(users.email) LIKE CONCAT('%', ?,  '%')";
  }

  if (query.type) {
    condition.push(query.type.toLowerCase());
    conditionalWhere += " AND bankdetails.type = ?";
  }

  conditionalWhere += " AND users.user_id IS NOT NULL ";

  let results = [];
  let totalCount = 0;

  let sql =
    "SELECT COUNT(*) as totalCount FROM bankdetails INNER JOIN users on users.user_id = bankdetails.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' " +
    conditionalWhere;
  await globalModel.custom(req, sql, condition).then((result) => {
    totalCount = result[0].totalCount;
  });
  if (totalCount > 0) {
    condition.push(LimitNum);
    condition.push((page - 1) * LimitNum);
    conditionalWhere += " ORDER BY bankdetails.bank_id DESC limit ? offset ?";
    let sqlQuery =
      "SELECT bankdetails.*,userdetails.username,userdetails.displayname FROM bankdetails INNER JOIN users on users.user_id = bankdetails.owner_id  INNER JOIN userdetails ON users.user_id = userdetails.user_id  WHERE 1 = 1 AND users.active = '1' AND users.approve = '1' " +
      conditionalWhere;
    await globalModel.custom(req, sqlQuery, condition).then((result) => {
      results = result;
    });
  }

  const defaultCurrency = req.defaultCurrencySymbol;
  const paggingData = pagging.create(req, totalCount, page, "", LimitNum);
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  res.render("admin/payments/banktransfer", {
    req: req,
    totalCount: totalCount,
    defaultCurrency: defaultCurrency,
    query: query,
    nav: url,
    results: results,
    title: "Manage Bank Transfer",
    paggingData: paggingData,
  });
};
exports.approveBank = async (req, res) => {
  const id = req.params.id;
  if (!id || !req.user || req.user.level_id != 1) {
    res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
    return;
  }

  await globalModel
    .custom(
      req,
      "SELECT * from bankdetails LEFT JOIN users ON bankdetails.owner_id = users.user_id LEFT JOIN userdetails ON userdetails.user_id = users.user_id where bankdetails.bank_id = ?",
      id
    )
    .then(async (result) => {
      if (result && result.length) {
        let bank_details = result[0];
        let currency = bank_details.currency;
        let default_currency = bank_details.default_currency;
        let changeRate = bank_details.change_rate;
        let type = "";
        let currentDate = dateTime.create().format("Y-m-d H:M:S");
        if (bank_details && bank_details.type == "video_purchase") {
          type = "bankdetails_videopurchase_approved";
          //create order
          let video = {};
          await videoModel
            .findByCustomUrl(bank_details.resource_id, req, res, true)
            .then((result) => {
              if (result) {
                video = result;
              }
            });
          await globalModel
            .create(
              req,
              {
                currency: bank_details.currency,
                owner_id: bank_details.owner_id,
                gateway_id: 3,
                state: "initial",
                creation_date: currentDate,
                source_type: "video_purchase",
                source_id: video.video_id,
              },
              "orders"
            )
            .then((result) => {
              if (result) {
                req.session.orderId = result.insertId;
              } else {
              }
            });
          let commission_amount = 0;

          let commissionType =
            video.type == 10 || video.type == 11
              ? parseFloat(req.appSettings["livestreaming_commission_type"])
              : parseFloat(req.appSettings["video_commission_type"]);
          let commissionTypeValue =
            video.type == 10 || video.type == 11
              ? parseFloat(req.appSettings["livestreaming_commission_value"])
              : parseFloat(req.appSettings["video_commission_value"]);

          //calculate admin commission
          if (commissionType == 2 && commissionTypeValue > 0) {
            commission_amount = (
              video.price *
              (commissionTypeValue / 100)
            ).toFixed(2);
          } else if (commissionType == 1 && commissionTypeValue > 0) {
            commission_amount = commissionTypeValue;
          }
          if (commission_amount > parseFloat(video.price).toFixed(2)) {
            commission_amount = 0;
          }
          await globalModel
            .create(
              req,
              {
                type: "video_purchase",
                id: video.video_id,
                owner_id: bank_details.owner_id,
                package_id: 0,
                status: "completed",
                creation_date: currentDate,
                modified_date: currentDate,
                gateway_profile_id: "Bank Transfer",
                order_id: req.session.orderId,
              },
              "subscriptions"
            )
            .then(async (result) => {
              const videoPurchaseModel = require("../../models/videoPurchase");
              await videoPurchaseModel
                .insertTransaction(req, {
                  gateway_id: 3,
                  order_id: req.session.orderId,
                  admin_commission: commission_amount,
                  gateway_transaction_id: "Bank Transfer",
                  owner_id: video.owner_id,
                  sender_id: bank_details.owner_id,
                  state: "completed",
                  price: parseFloat(video.price).toFixed(2) - commission_amount,
                  currency: currency,
                  default_currency: default_currency,
                  change_rate: changeRate,
                  creation_date: currentDate,
                  modified_date: currentDate,
                  id: video.video_id,
                  type: "video_purchase",
                })
                .then(async (result) => {
                  //update user balance
                  await globalModel
                    .custom(
                      req,
                      "UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",
                      [
                        (
                          parseFloat(video.price) -
                          parseFloat(commission_amount)
                        ).toFixed(2),
                        video.owner_id,
                      ]
                    )
                    .then((result) => {});

                  //update points and send email and notification
                  if (
                    parseInt(video.type) == 10 ||
                    parseInt(video.type) == 11
                  ) {
                    //buyer
                    notifications
                      .insert(req, {
                        owner_id: bank_details.owner_id,
                        insert: true,
                        type: "livestream_purchased",
                        subject_type: "users",
                        subject_id: bank_details.owner_id,
                        object_type: "videos",
                        object_id: video.video_id,
                        forceInsert: true,
                      })
                      .then((result) => {})
                      .catch((err) => {
                        console.log(err);
                      });

                    //owner
                    notifications
                      .insert(req, {
                        notChangeOwnerID: true,
                        owner_id: video.owner_id,
                        insert: true,
                        type: "livestream_purchased_owner",
                        subject_type: "users",
                        subject_id: bank_details.owner_id,
                        object_type: "videos",
                        object_id: video.video_id,
                        forceInsert: true,
                      })
                      .then((result) => {})
                      .catch((err) => {
                        console.log(err);
                      });
                  } else {
                    //buyer
                    notifications
                      .insert(req, {
                        owner_id: bank_details.owner_id,
                        insert: true,
                        type: "video_purchased",
                        subject_type: "users",
                        subject_id: bank_details.owner_id,
                        object_type: "videos",
                        object_id: video.video_id,
                        forceInsert: true,
                      })
                      .then((result) => {})
                      .catch((err) => {
                        console.log(err);
                      });
                    //owner
                    notifications
                      .insert(req, {
                        notChangeOwnerID: true,
                        owner_id: video.owner_id,
                        insert: true,
                        type: "video_purchased_owner",
                        subject_type: "users",
                        subject_id: bank_details.owner_id,
                        object_type: "videos",
                        object_id: video.video_id,
                        forceInsert: true,
                      })
                      .then((result) => {})
                      .catch((err) => {
                        console.log(err);
                      });
                  }

                  //update order table
                  req.session.orderId = null;
                  globalModel.update(
                    req,
                    {
                      gateway_transaction_id: "Bank Transfer",
                      state: "completed",
                      source_id: video.video_id,
                    },
                    "orders",
                    "order_id",
                    req.session.orderId
                  );
                });
            });
        } else if (bank_details && bank_details.type == "recharge_wallet") {
          req.session.ad_user_id = bank_details.owner_id;
          req.session.adsAmount = bank_details.price;
          type = "bankdetails_rechargewallet_approved";
          //create order
          await globalModel
            .create(
              req,
              {
                currency: bank_details.currency,
                owner_id: bank_details.owner_id,
                gateway_id: 3,
                state: "pending",
                creation_date: currentDate,
                source_type: "wallet_user",
                source_id: bank_details.owner_id,
              },
              "orders"
            )
            .then((result) => {
              if (result) {
                req.session.orderId = result.insertId;
              } else {
              }
            });
          await globalModel
            .custom(req, "SELECT wallet FROM users WHERE user_id = ?", [
              req.session.ad_user_id,
            ])
            .then(async (result) => {
              if (result) {
                const walletData =
                  parseFloat(JSON.parse(JSON.stringify(result))[0].wallet) +
                  parseFloat(req.session.adsAmount);
                await globalModel
                  .update(
                    req,
                    { wallet: walletData },
                    "users",
                    "user_id",
                    bank_details.owner_id
                  )
                  .then(async (result) => {
                    if (result) {
                      await globalModel
                        .create(
                          req,
                          {
                            order_id: 0,
                            subscription_id: 0,
                            type: "wallet",
                            id: req.session.ad_user_id,
                            package_id: 0,
                            admin_commission: 0,
                            gateway_transaction_id: "Bank Transfer",
                            owner_id: req.session.ad_user_id,
                            state: "completed",
                            price: req.session.adsAmount,
                            currency: currency,
                            default_currency: default_currency,
                            change_rate: changeRate,
                            creation_date: currentDate,
                            modified_date: currentDate,
                          },
                          "transactions"
                        )
                        .then(async (result) => {
                          //update order table
                          req.session.ad_user_id = null;
                          globalModel.update(
                            req,
                            {
                              gateway_transaction_id: "Bank Transfer",
                              state: "completed",
                            },
                            "orders",
                            "order_id",
                            req.session.orderId
                          );
                        });
                    }
                  });
              }
            });
        } else if (bank_details && bank_details.type == "user_subscription") {
          type = "bankdetails_membersubscription_approved";
          let package_id = bank_details.package_id;
          let packageObj = {};
          await packageModel
            .findById(package_id, req, res)
            .then((result) => {
              if (result) {
                packageObj = result;
              } else {
                package_id = null;
              }
            })
            .catch((err) => {
              package_id = null;
            });
          if (Object.keys(packageObj).length == 0) {
            res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
            return;
          }
          //create order
          await globalModel
            .create(
              req,
              {
                currency: bank_details.currency,
                owner_id: bank_details.owner_id,
                gateway_id: 3,
                state: "initial",
                creation_date: currentDate,
                source_type: "subscription",
                source_id: 0,
              },
              "orders"
            )
            .then((result) => {
              if (result) {
                req.session.orderId = result.insertId;
              } else {
              }
            });

          //if (packageObj.is_recurring == 1) {
          //cancel subscription from gateway
          let memberSubscription = require("../../functions/ipnsFunctions/memberSubscriptions");
          let user = {};
          user.user_id = bank_details.owner_id;
          await memberSubscription.cancelAll(
            user,
            "User changed subscription plan.",
            null,
            req
          );
          //cancel other active subscription
          await globalModel.update(
            req,
            { status: "cancelled" },
            "subscriptions",
            "owner_id",
            bank_details.owner_id
          );
          //cancel other active orders
          await globalModel.update(
            req,
            { state: "cancelled" },
            "orders",
            "owner_id",
            bank_details.owner_id
          );

          let changed_expiration_date = await recurringPaypal.getExpirationDate(
            packageObj
          );
          await globalModel
            .create(
              req,
              {
                gateway_id: 3,
                type: "member_subscription",
                id: bank_details.owner_id,
                expiration_date: changed_expiration_date,
                owner_id: bank_details.owner_id,
                package_id: package_id,
                status: "completed",
                creation_date: currentDate,
                modified_date: currentDate,
                gateway_profile_id: "Bank Transfer",
                order_id: req.session.orderId,
              },
              "subscriptions"
            )
            .then(async (result) => {
              globalModel.update(
                req,
                {
                  gateway_id: 3,
                  gateway_transaction_id: "Bank Transfer",
                  state: "completed",
                  source_id: result.insertId,
                },
                "orders",
                "order_id",
                req.session.orderId
              );
            });
          // }else{

          // }
        } else if (bank_details && bank_details.type == "user_subscribe") {
          //create order
          await globalModel
            .create(
              req,
              {
                currency: bank_details.currency,
                owner_id: bank_details.owner_id,
                gateway_id: 3,
                state: "initial",
                creation_date: currentDate,
                source_type: "user_subscribe",
                source_id: id,
              },
              "orders"
            )
            .then((result) => {
              if (result) {
                req.session.orderId = result.insertId;
              } else {
              }
            });
          let itemObject = {};
          let orders = {};
          await globalModel
            .custom(
              req,
              "SELECT * FROM orders where order_id =?",
              req.session.orderId
            )
            .then((result) => {
              let item = JSON.parse(JSON.stringify(result));
              if (item && item.length > 0) {
                orders = item[0];
              } else {
              }
            })
            .catch((_err) => {});
          await globalModel
            .custom(
              req,
              "SELECT member_plans.*, userdetails.username from member_plans LEFT JOIN userdetails ON userdetails.user_id = member_plans.owner_id where member_plan_id = ?",
              bank_details.package_id
            )
            .then((result) => {
              let item = JSON.parse(JSON.stringify(result));
              if (item && item.length > 0) {
                itemObject = item[0];
              }
            })
            .catch((_err) => {});
          if (Object.keys(itemObject).length == 0) {
            res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
            return;
          }
          orders.type = "month";
          orders.duration_type = "year";
          orders.duration = 100;
          orders.interval = 1;
          type = "bankdetails_usersubscribe_approved";
          let changed_expiration_date = await recurringPaypal.getExpirationDate(
            orders
          );
          //cancel subscription from gateway
          let memberSubscription = require("../../functions/ipnsFunctions/channelSupportSubscriptions");
          req.memberUSERID = itemObject.owner_id;
          let user = {};
          user.user_id = bank_details.owner_id;
          await memberSubscription.cancelAll(
            {
              user_id: bank_details.owner_id,
              subscription_type: "user_subscribe",
            },
            "User changed subscription plan.",
            null,
            req
          );
          req.memberUSERID = null;
          //cancel other active subscription
          await globalModel.custom(
            req,
            "UPDATE subscriptions SET status = ? WHERE owner_id = ? AND id = ?",
            ["cancelled", bank_details.owner_id, itemObject.owner_id]
          );
          //cancel other active orders
          // await globalModel.update(req,{state:"cancelled"},"orders","owner_id",bank_details.owner_id)
          //subscribe user
          await globalModel.create(
            req,
            {
              type: "members",
              id: itemObject.owner_id,
              owner_id: bank_details.owner_id,
              creation_date: currentDate,
            },
            "followers"
          );
          let data = {};
          const followModel = require("../../models/followers");
          var dt = dateTime.create();
          var formatted = dt.format("Y-m-d H:M:S");
          data["type"] = "members";
          data["id"] = itemObject.owner_id;
          data["owner_id"] = bank_details.owner_id;
          data["creation_date"] = formatted;
          await followModel
            .isFollowed(req, data.type, req.user.user_id, data.id)
            .then((result) => {
              if (result) {
                data["followId"] = result.follower_id;
              }
            });
          if (!data["followId"]) {
            await followModel.insert(data, req, res).then((result) => {});
          }
          await globalModel
            .create(
              req,
              {
                gateway_id: 3,
                type: "user_subscribe",
                id: itemObject.owner_id,
                expiration_date: changed_expiration_date,
                owner_id: bank_details.owner_id,
                package_id: bank_details.package_id,
                status: "completed",
                creation_date: currentDate,
                modified_date: currentDate,
                gateway_profile_id: "",
                order_id: req.session.orderId,
              },
              "subscriptions"
            )
            .then(async (result) => {
              await globalModel.update(
                req,
                {
                  gateway_id: 2,
                  gateway_transaction_id: "",
                  state: "completed".toLowerCase(),
                },
                "orders",
                "order_id",
                req.session.orderId
              );

              const res = JSON.parse(JSON.stringify(result));
              let subscription = res[0];
              // create transactions
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
                price: parseFloat(itemObject.price).toFixed(2),
                default_currency: default_currency,
                currency: currency,
                change_rate: changeRate,
                creation_date: dateTime.create().format("Y-m-d H:M:S"),
                modified_date: dateTime.create().format("Y-m-d H:M:S"),
              };
              await globalModel
                .custom(
                  req,
                  "INSERT INTO transactions SET ? ON DUPLICATE KEY UPDATE state = ?",
                  [insertData, "completed"]
                )
                .then(async (result) => {});
            });
        } else if (
          bank_details &&
          bank_details.type == "channel_subscription"
        ) {
          type = "bankdetails_channelsubscription_approved";
          let itemObject = {};
          await globalModel
            .custom(
              req,
              "SELECT * FROM channels where custom_url =?",
              bank_details.resource_id
            )
            .then((result) => {
              let item = JSON.parse(JSON.stringify(result));
              if (item && item.length > 0) {
                itemObject = item[0];
              }
            })
            .catch((err) => {});
          if (Object.keys(itemObject).length == 0) {
            res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
            return;
          }
          let orders = {};
          await globalModel
            .create(
              req,
              {
                currency: bank_details.currency,
                owner_id: bank_details.owner_id,
                gateway_id: 3,
                state: "initial",
                creation_date: currentDate,
                source_type: "channel_subscription",
                source_id: id,
              },
              "orders"
            )
            .then((result) => {
              if (result) {
                req.session.orderId = result.insertId;
              } else {
              }
            });
          let orderID = req.session.orderId;
          await globalModel
            .custom(
              req,
              "SELECT * FROM orders where order_id =?",
              req.session.orderId
            )
            .then((result) => {
              let item = JSON.parse(JSON.stringify(result));
              if (item && item.length > 0) {
                orders = item[0];
              }
            })
            .catch((err) => {});
          orders.type = "month";
          orders.duration_type = "year";
          orders.duration = 50;
          orders.interval = 1;
          let commission_amount = 0;
          let price = itemObject.channel_subscription_amount;
          let commissionType = parseFloat(
            req.appSettings["channel_support_commission_type"]
          );
          let commissionTypeValue = parseFloat(
            req.appSettings["channel_support_commission_value"]
          );
          //calculate admin commission
          if (commissionType == 2 && commissionTypeValue > 0) {
            commission_amount = parseFloat((price * (commissionTypeValue / 100)).toFixed(
              2
            ));
          } else if (commissionType == 1 && commissionTypeValue > 0) {
            commission_amount = commissionTypeValue;
          }
          if (commission_amount > parseFloat(price).toFixed(2)) {
            commission_amount = 0;
          }

          await globalModel
            .custom(
              req,
              "UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",
              [
                (
                  parseFloat(itemObject.channel_subscription_amount) -
                  parseFloat(commission_amount)
                ).toFixed(2),
                itemObject.owner_id,
              ]
            )
            .then((result) => {});

          let changed_expiration_date = await recurringPaypal.getExpirationDate(
            orders
          );
          await globalModel
            .create(
              req,
              {
                gateway_id: 3,
                type: "channel_subscription",
                id: bank_details.owner_id,
                expiration_date: changed_expiration_date,
                owner_id: bank_details.owner_id,
                id: itemObject.channel_id,
                status: "completed",
                creation_date: currentDate,
                modified_date: currentDate,
                gateway_profile_id: "Bank Transfer",
                order_id: req.session.orderId,
              },
              "subscriptions"
            )
            .then(async (result) => {
              globalModel.update(
                req,
                {
                  gateway_id: 3,
                  gateway_transaction_id: "Bank Transfer",
                  state: "completed",
                },
                "orders",
                "order_id",
                req.session.orderId
              );
              await globalModel
                .custom(
                  req,
                  "SELECT * FROM subscriptions WHERE subscriptions.subscription_id = ?",
                  [result.insertId]
                )
                .then((result) => {
                  if (result) {
                    const res = JSON.parse(JSON.stringify(result));
                    let subscription = res[0];
                    // create transactions
                    let insertData = {
                      state: "completed",
                      order_id: subscription.order_id,
                      package_id: subscription.package_id,
                      type: subscription.type,
                      admin_commission: commission_amount,
                      id: subscription.id,
                      owner_id: subscription.owner_id,
                      subscription_id: subscription.subscription_id,
                      gateway_transaction_id: subscription.gateway_profile_id,
                      gateway_id: subscription.gateway_id,
                      gateway_transaction_id:
                        subscription.gateway_transaction_id,
                      price: parseFloat(
                        itemObject.channel_subscription_amount
                      ).toFixed(2),
                      default_currency: default_currency,
                      currency: currency,
                      change_rate: changeRate,
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
                  }
                });
            });
        } else if (
          bank_details &&
          (bank_details.type == "purchase_series_purchase" ||
            bank_details.type == "purchase_movie_purchase" ||
            bank_details.type == "rent_series_purchase" ||
            bank_details.type == "rent_movie_purchase")
        ) {
          type = bank_details.type + "_approved";

          let movie = {};
          await movieModel
            .findByCustomUrl(bank_details.resource_id, req)
            .then((result) => {
              if (result) {
                movie = result;
              }
            });
          if (Object.keys(movie).length == 0) {
            res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
            return;
          }
          let type =
            bank_details.type == "purchase_movie_purchase" ||
            bank_details.type == "purchase_series_purchase"
              ? "purchase"
              : "rent";
          let price =
            type == "rent"
              ? parseFloat(movie.rent_price)
              : parseFloat(movie.price);
          let movieSeriesType =
            movie.category == "movie"
              ? type + "_movie_purchase"
              : type + "_series_purchase";

          let currentDate = dateTime.create().format("Y-m-d H:M:S");
          let isValid = true;
          //check movie aleady purchased
          await movieModel
            .checkMoviePurchased(
              {
                id: movie.movie_id,
                owner_id: bank_details.owner_id,
                type: movie.category,
              },
              req
            )
            .then((result) => {
              if (result) {
                isValid = false;
              }
            })
            .catch((err) => {});

          if (!isValid) {
            res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
            return;
          }

          req.session.id = movie.movie_id;
          await globalModel
            .create(
              req,
              {
                currency: bank_details.currency,
                owner_id: bank_details.owner_id,
                gateway_id: 3,
                state: "initial",
                creation_date: currentDate,
                source_type: movieSeriesType,
                source_id: movie.movie_id,
              },
              "orders"
            )
            .then((result) => {
              if (result) {
                req.session.movie_user_id = bank_details.owner_id;
                req.session.orderId = result.insertId;
              } else {
              }
            });

          let commission_amount = 0;
          let commissionType = parseFloat(
            req.appSettings[
              type == "price"
                ? "movie_commission_type"
                : "movie_commission_rent_type"
            ]
          );
          let commissionTypeValue = parseFloat(
            req.appSettings[
              type == "price"
                ? "movie_commission_value"
                : "movie_commission_rent_value"
            ]
          );
          //calculate admin commission
          if (commissionType == 2 && commissionTypeValue > 0) {
            commission_amount = parseFloat((price * (commissionTypeValue / 100)).toFixed(
              2
            ));
          } else if (commissionType == 1 && commissionTypeValue > 0) {
            commission_amount = commissionTypeValue;
          }
          if (commission_amount > parseFloat(price).toFixed(2)) {
            commission_amount = 0;
          }

          await globalModel
            .create(
              req,
              {
                type: movieSeriesType,
                id: movie.movie_id,
                owner_id: movie.owner_id,
                package_id: 0,
                status: "completed",
                creation_date: currentDate,
                modified_date: currentDate,
                gateway_profile_id: "Bank Transfer",
                order_id: req.session.orderId,
              },
              "subscriptions"
            )
            .then(async (result) => {
              const moviePurchaseModel = require("../../models/videoPurchase");
              await moviePurchaseModel
                .insertTransaction(
                  req,
                  {
                    gateway_id: 3,
                    order_id: req.session.orderId,
                    admin_commission: commission_amount,
                    gateway_transaction_id: "Bank Transfer",
                    owner_id: movie.owner_id,
                    sender_id: req.session.movie_user_id,
                    state: "completed",
                    price: parseFloat(price).toFixed(2) - commission_amount,
                    currency: currency,
                    default_currency: default_currency,
                    change_rate: changeRate,
                    creation_date: currentDate,
                    modified_date: currentDate,
                    id: movie.movie_id,
                    type: movieSeriesType,
                  },
                  true
                )
                .then(async (result) => {
                  //update user balance
                  await globalModel
                    .custom(
                      req,
                      "UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",
                      [
                        (
                          parseFloat(price) - parseFloat(commission_amount)
                        ).toFixed(2),
                        movie.owner_id,
                      ]
                    )
                    .then((result) => {});

                  let typePurchased = "";
                  let typeOwnerPurchased = "";

                  if (type == "rent") {
                    if (movie.category == "movie") {
                      typePurchased = "movie_rent_purchased";
                      typeOwnerPurchased = "movie_rent_purchased_owner";
                    } else {
                      typePurchased = "series_rent_purchased";
                      typeOwnerPurchased = "series_rent_purchased_owner";
                    }
                  } else {
                    if (movie.category == "movie") {
                      typePurchased = "movie_purchased";
                      typeOwnerPurchased = "movie_purchased_owner";
                    } else {
                      typePurchased = "series_purchased";
                      typeOwnerPurchased = "series_purchased_owner";
                    }
                  }

                  //buyer
                  notifications
                    .insert(req, {
                      owner_id: bank_details.owner_id,
                      insert: true,
                      type: typePurchased,
                      subject_type: "users",
                      subject_id: bank_details.owner_id,
                      object_type: "movies",
                      object_id: movie.movie_id,
                      forceInsert: true,
                    })
                    .then((result) => {})
                    .catch((err) => {
                      console.log(err);
                    });
                  //owner
                  notifications
                    .insert(req, {
                      notChangeOwnerID: true,
                      owner_id: movie.owner_id,
                      insert: true,
                      type: typeOwnerPurchased,
                      subject_type: "users",
                      subject_id: bank_details.owner_id,
                      object_type: "movies",
                      object_id: movie.movie_id,
                      forceInsert: true,
                    })
                    .then((result) => {})
                    .catch((err) => {
                      console.log(err);
                    });

                  //update order table
                  req.session.movie_user_id = null;
                  req.session.id = null;
                  req.session.movietokenUserPayment = null;
                  globalModel.update(
                    req,
                    {
                      gateway_transaction_id: "Bank Transfer",
                      state: "completed",
                      source_id: movie.movie_id,
                    },
                    "orders",
                    "order_id",
                    req.session.orderId
                  );
                });
            });
        }

        await notifications
          .insert(req, {
            owner_id: bank_details.owner_id,
            type: type,
            subject_type: "users",
            subject_id: bank_details.owner_id,
            object_type: "members",
            object_id: bank_details.owner_id,
            insert: true,
          })
          .then((result) => {})
          .catch((err) => {});
        await globalModel
          .custom(
            req,
            "UPDATE bankdetails SET `status` = 1,approve_date = ?  WHERE bank_id = ?",
            [currentDate, bank_details.bank_id]
          )
          .then((result) => {});
        res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
      } else {
        res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
      }
    });
};
exports.deleteBank = async (req, res) => {
  const id = req.params.id;
  if (!id || !req.user || req.user.level_id != 1) {
    res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
    return;
  }

  await globalModel
    .custom(req, "DELETE FROM bankdetails  WHERE bank_id = ?", [id])
    .then((result) => {});

  res.redirect(process.env.ADMIN_SLUG + "/payments/bank-transfer/");
  res.end();
};
exports.createEdit = async (req, res) => {
  const package_id = req.params.id;
  let existingPackage = {};
  //if exists means req from edit page

  let memberLevels = {};
  memberLevels[0] = "";
  await levels
    .findAll(req, { typeNotIn: "'admin','moderator','public'" })
    .then((result) => {
      if (result) {
        result.forEach((res) => {
          memberLevels[res.level_id] = res.title;
        });
      }
    });

  if (package_id) {
    await packages
      .findById(package_id, req, res)
      .then((result) => {
        existingPackage = result;
      })
      .catch((error) => {});
  }
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  var fields = forms.fields;
  var validators = forms.validators;
  var widgets = forms.widgets;
  const cssClasses = {
    label: [""],
    field: ["form-group"],
    classes: ["form-control"],
  };
  let disabled = package_id ? true : false;
  var reg_form = forms.create(
    {
      title: fields.string({
        label: "Package Title",
        required: true,
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: existingPackage.title,
      }),
      // apple_id: fields.string({
      //     label:"Apple Product ID (for in app purchase)",
      //     cssClasses: {"field" : ["form-group"]},
      //     widget: widgets.text({"classes":["form-control"]}),
      //     value:existingPackage.apple_id
      // }),

      description: fields.string({
        label: "Description",
        cssClasses: { field: ["form-group"] },
        widget: widgets.textarea({ classes: ["form-control"] }),
        value: existingPackage.description,
      }),
      level_id: fields.string({
        label: "Member Role",
        choices: memberLevels,
        required: true,
        widget: widgets.select({ classes: ["select"] }),
        cssClasses: { field: ["form-group"], label: ["select"] },
        value: existingPackage.level_id,
      }),

      downgrade_level_id: fields.string({
        label: "Downgrade Member Role",
        required: true,
        choices: memberLevels,
        widget: widgets.select({ classes: ["select"] }),
        cssClasses: { field: ["form-group"], label: ["select"] },
        value: existingPackage.downgrade_level_id,
      }),
      downgrade_label: fields.string({
        widget: widgets.label({
          content: "When plan expires, member will be move into this role.",
        }),
        cssClasses: { field: ["form-group", "form-description"] },
      }),
      price: fields.string({
        label: "Plan Charges",
        // validators:[validators.integer('Enter integer value only.')],
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: existingPackage.price,
      }),

      // is_recurring: fields.string({
      //     choices: {"1":"Yes",'0':"No"},
      //    widget: widgets.select({ "classes": ["select"] }),
      //     label:"Recurring Plan",
      //     fieldsetClasses:"form_fieldset",
      //     cssClasses: {"field" : ["form-group"]},
      //     value:Object.keys(existingPackage).length > 0 ?  existingPackage.is_recurring.toString() : "0"
      // }),

      interval: fields.string({
        label: "Billing Cycle",
        validators: [validators.integer("Enter integer value only.")],
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"], disabled: disabled }),
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.interval
            : "0",
      }),

      type: fields.string({
        choices: {
          day: "Day",
          week: "Week",
          month: "Month",
          year: "Year",
          forever: "One Time",
        },
        widget: widgets.select({ classes: ["select_1"], disabled: disabled }),
        label: "Frequency",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"], label: ["select_1"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.type
            : "forever",
      }),
      type_label: fields.string({
        widget: widgets.label({ content: "" }),
        cssClasses: { field: ["form-group", "form-description", "type_label"] },
      }),

      duration: fields.string({
        label: "Package Duration",
        validators: [validators.integer("Enter integer value only.")],
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"], disabled: disabled }),
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.duration
            : "0",
      }),

      duration_type: fields.string({
        choices: {
          day: "Day",
          week: "Week",
          month: "Month",
          year: "Year",
          forever: "Forever",
        },
        widget: widgets.select({ classes: ["select_1"], disabled: disabled }),
        label: "Frequency",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"], label: ["select"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.duration_type
            : "forever",
      }),
      duration_type_label: fields.string({
        widget: widgets.label({ content: "" }),
        cssClasses: { field: ["form-group", "form-description", "type_label"] },
      }),

      // setup_fee: fields.string({
      //     label:"Setup Fees",
      //     validators:[validators.integer('Enter integer value only.')],
      //     cssClasses: {"field" : ["form-group"]},
      //     widget: widgets.text({"classes":["form-control"]}),
      //     value:Object.keys(existingPackage).length > 0 ?  existingPackage.setup_fee : ""
      // }),
      // setup_fee_label: fields.string({
      //     widget: widgets.label({content : 'So you want to charge one time setup fees.NOTE: Setup fee work for paid plans only and Paypal Payment gateway only.'}),
      //     cssClasses:{"field" : ["form-group","form-description","type_label"]},
      // }),

      email_notification: fields.string({
        choices: { 1: "Yes", 0: "No" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Want to Enable Email Reminder?",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.email_notification.toString()
            : "1",
      }),
      site_notification: fields.string({
        choices: { 1: "Yes", 0: "No" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Want to Enable Site Notification Reminder?",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.site_notification.toString()
            : "1",
      }),

      alert_number: fields.string({
        label: "Reminders for Emails & Notifications",
        validators: [validators.integer("Enter integer value only.")],
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.alert_number
            : "0",
      }),

      alert_type: fields.string({
        choices: {
          minutes: "Minutes",
          days: "Days",
          weeks: "Weeks",
          months: "Months",
        },
        widget: widgets.select({ classes: ["select_1"] }),
        label: "",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"], label: ["select"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.alert_type
            : "days",
      }),
      alert_type_label: fields.string({
        widget: widgets.label({ content: "" }),
        cssClasses: { field: ["form-group", "form-description", "type_label"] },
      }),
      enabled: fields.string({
        choices: { 1: "Yes", 0: "No" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Want to Enable Plan?",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.enabled.toString()
            : "1",
      }),
      default: fields.string({
        choices: { 1: "Yes", 0: "No" },
        widget: widgets.select({ classes: ["select"] }),
        label: "Default Plan?",
        fieldsetClasses: "form_fieldset",
        cssClasses: { field: ["form-group"] },
        value:
          Object.keys(existingPackage).length > 0
            ? existingPackage.default.toString()
            : "0",
      }),
      default_label: fields.string({
        widget: widgets.label({
          content:
            "This will change the current default plan. Only free plan will be the default plan. ",
        }),
        cssClasses: {
          field: ["form-group", "form-description", "default_label"],
        },
      }),
    },
    { validatePastFirstError: true }
  );
  reg_form.handle(req, {
    success: function (form) {
      let errors = {};
      if (form.data.level_id.toString() == "0") {
        errors.level_id = "This field is required.";
      }
      if (form.data.downgrade_level_id.toString() == "0") {
        errors.downgrade_level_id = "This field is required.";
      }
      if (form.data.default.toString() == "1" && form.data.price > 0) {
        errors.default = "Only free account will become default plan.";
      }
      if (Object.keys(errors) != 0) {
        res.send({ errors: errors });
        return;
      }
      delete form.data["setup_fee_label"];
      delete form.data["ad_create_limit_label"];
      delete form.data["channel_create_limit_label"];
      delete form.data["video_create_limit_label"];
      delete form.data["playlist_create_limit_label"];
      delete form.data["blog_create_limit_label"];
      delete form.data["duration_type_label"];
      delete form.data["default_label"];
      delete form.data["type_label"];
      delete form.data["downgrade_label"];
      delete form.data["level_label"];
      delete form.data["price_label"];
      delete form.data["channel_create_limit_label"];
      delete form.data["alert_type_label"];
      if (form.data.type == "forever") {
        form.data.is_recurring = 0;
      } else {
        form.data.is_recurring = 1;
      }
      if (!parseFloat(form.data.price)) {
        form.data.setup_fee = 0;
        form.data.price = 0;
      }
      if (!parseFloat(form.data.setup_fee)) form.data.setup_fee = 0;

      if (!package_id) globalModel.create(req, form.data, "packages");
      else {
        delete form.data.interval;
        delete form.data.type;
        delete form.data.duration;
        delete form.data.duration_type;
        delete form.data.is_recurring;
        globalModel.update(
          req,
          form.data,
          "packages",
          "package_id",
          package_id
        );
      }
      res.send({
        success: 1,
        message: "Operation performed successfully.",
        url: process.env.ADMIN_SLUG + "/payments/packages",
      });
    },
    error: function (form) {
      const errors = formFunctions.formValidations(form);
      res.send({ errors: errors });
    },
    other: function (form) {
      res.render("admin/payments/create", {
        nav: url,
        reg_form: reg_form,
        title: (!package_id ? "Add" : "Edit") + " Package",
      });
    },
  });
};
exports.packages = async (req, res) => {
  let memberLevels = [];
  await levels.findAll(req, req.query).then((result) => {
    memberLevels = result;
  });
  let LimitNum = 10;
  let page = 1;
  if (req.params.page == "") {
    page = 1;
  } else {
    //parse int Convert String to number
    page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
  }

  const query = { ...req.query };
  query["column"] = "COUNT(*) as totalCount";

  let results = [];
  let totalCount = 0;

  await packages.findAll(req, query).then((result) => {
    totalCount = result[0].totalCount;
  });

  if (totalCount > 0) {
    query["column"] =
      "COUNT(subscriptions.subscription_id) as activeMembers,packages.*";
    query["limit"] = LimitNum;
    query["offset"] = (page - 1) * LimitNum;
    query["groupBy"] = "GROUP by subscriptions.package_id,packages.package_id";
    query["leftJoin"] =
      'LEFT JOIN subscriptions ON (subscriptions.package_id = packages.package_id AND status = "completed")';
    await packages.findAll(req, query).then((result) => {
      results = result;
    });
  }

  const defaultCurrency = req.defaultCurrencySymbol;
  const paggingData = pagging.create(req, totalCount, page, "", LimitNum);
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  res.render("admin/payments/packages", {
    recurringPaypal: recurringPaypal,
    req: req,
    totalCount: totalCount,
    defaultCurrency: defaultCurrency,
    query: query,
    nav: url,
    results: results,
    title: "Manage Packages",
    memberLevels: memberLevels,
    paggingData: paggingData,
  });
};
exports.saveAPI = async (req, res) => {
  let value = req.body.value;
  if (req.user.level_id != 1) {
    return;
  }
  settings.setSettings(req, { currency_api_key: value });
  return res.send({ status: 1 });
};

exports.defaultCurrency = async (req, res, next) => {
  const id = req.params.id;
  if (!id || !req.user || req.user.level_id != 1) {
    res.redirect(process.env.ADMIN_SLUG + "/payments/currencies/");
    return;
  }

  await globalModel
    .custom(req, "SELECT * FROM currencies  WHERE currency_id = ?", [id])
    .then(async (result) => {
      if (result && result.length) {
        let item = result[0];
        await globalModel
          .custom(
            req,
            "UPDATE currencies set `default` = 0 where `default` = ?",
            1
          )
          .then(async (result) => {});
        settings.setSettings(req, { payment_default_currency: item.ID });
        let approve = item.default == 0 ? 1 : 0;
        let params = { default: approve };
        if (approve == 1) {
          params.active = 1;
        }
        params.currency_value = 1;
        await globalModel
          .update(req, params, "currencies", "currency_id", id)
          .then((result) => {});
        res.send({ status: approve == 1 ? true : false });
      } else {
        res.send({ error: 1 });
      }
    });
};

exports.deleteCurrency = async (req, res, next) => {
  const id = req.params.id;
  if (!id || !req.user || req.user.level_id != 1) {
    res.redirect(process.env.ADMIN_SLUG + "/payments/currencies/");
    return;
  }

  await globalModel
    .custom(req, "DELETE FROM currencies  WHERE currency_id = ?", [id])
    .then((result) => {});

  res.redirect(process.env.ADMIN_SLUG + "/payments/currencies/");
  res.end();
};

exports.approveCurrency = async (req, res, next) => {
  const id = req.params.id;
  if (!id || !req.user) {
    res.send({ error: 1 });
    return;
  }
  await globalModel
    .custom(req, "SELECT * from currencies where currency_id = ?", id)
    .then(async (result) => {
      if (result && result.length) {
        let item = result[0];
        await globalModel
          .update(
            req,
            { active: !item.active },
            "currencies",
            "currency_id",
            id
          )
          .then((result) => {
            res.send({ status: !item.active });
          });
      } else {
        res.send({ error: 1 });
      }
    });
};

exports.createEditCurrency = async (req, res, next) => {
  const currency_id = req.params.id;
  let currency = null;
  if (currency_id) {
    await globalModel
      .custom(
        req,
        "SELECT * from currencies where currency_id = ?",
        currency_id
      )
      .then(async (result) => {
        if (result) {
          let results = JSON.parse(JSON.stringify(result));
          currency = results[0];
        }
      });
  }
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  var fields = forms.fields;
  var validators = forms.validators;
  var widgets = forms.widgets;
  const cssClasses = {
    label: [""],
    field: ["form-group"],
    classes: ["form-control"],
  };

  let gateways = {};
  if (
    (!req.appSettings["payment_paypal_method"] ||
      req.appSettings["payment_paypal_method"] == 1) &&
    req.appSettings["payment_client_id"] &&
    req.appSettings["payment_client_secret"]
  ) {
    gateways["paypal"] = "PayPal";
  }
  if (
    (!req.appSettings["payment_qpay_method"] ||
      req.appSettings["payment_qpay_method"] == 1) &&
    req.appSettings["payment_qpay_username"] &&
    req.appSettings["payment_qpay_password"]
  ) {
    gateways["qPay"] = "QPay";
  }
  if (req.appSettings["payment_bank_method"] == 1) {
    gateways["bank"] = "Bank Transfer";
  }
  if (
    req.appSettings["payment_cashfree_method"] == 1 &&
    req.appSettings["payment_cashfree_client_id"] &&
    req.appSettings["payment_cashfree_client_secret"]
  ) {
    gateways["cashfree"] = "Cash Free";
  }
  if (
    req.appSettings["payment_stripe_method"] == 1 &&
    req.appSettings["payment_stripe_publish_key"] &&
    req.appSettings["payment_stripe_client_secret"]
  ) {
    gateways["stripe"] = "Stripe";
  }
  if (
    req.appSettings["payment_razorpay_method"] == 1 &&
    req.appSettings["payment_razorpay_client_id"] &&
    req.appSettings["payment_razorpay_client_secret"]
  ) {
    gateways["razorpay"] = "Razorpay";
  }
  if (
    req.appSettings["payment_flutterwave_method"] == 1 &&
    req.appSettings["payment_flutterwave_client_id"] &&
    req.appSettings["payment_flutterwave_client_secret"]
  ) {
    gateways["flutterwave"] = "Flutterwave";
  }
  if (
    req.appSettings["payment_aamarpay_method"] == 1 &&
    req.appSettings["payment_aamarpay_storeid"] &&
    req.appSettings["payment_aamarpay_signaturekey"]
  ) {
    gateways["aamarpay"] = "Aamarpay";
  }

  let disabled = currency_id ? true : false;
  let formObject = {
    ID: fields.string({
      label: "Currency ID",
      required: true,
      cssClasses: { field: ["form-group"] },
      widget: widgets.text({ classes: ["form-control"] }),
      value: currency ? currency.ID : "",
    }),
    currency: fields.string({
      label: "Currency Title",
      required: true,
      cssClasses: { field: ["form-group"] },
      widget: widgets.text({ classes: ["form-control"] }),
      value: currency ? currency.currency : "",
    }),
  };

  if (!currency || currency.default != 1) {
    let formObject1 = {
      currency_value: fields.string({
        label: "Currency Value",
        required: true,
        cssClasses: { field: ["form-group"] },
        widget: widgets.text({ classes: ["form-control"] }),
        value: currency ? currency.currency_value : "",
      }),
    };
    formObject = { ...formObject, ...formObject1 };
  }
  let formObject2 = {
    symbol: fields.string({
      label: "Symbol",
      required: true,
      cssClasses: { field: ["form-group"] },
      widget: widgets.text({ classes: ["form-control"] }),
      value: currency ? currency.symbol : "",
    }),
    gateway_allowed: fields.string({
      label: "Gateway Allowed",
      choices: gateways,
      cssClasses: { field: ["form-group"] },
      widget: widgets.multipleCheckbox({ classes: ["form-control-checkbox"] }),
      value:
        currency && currency.gateway_allowed
          ? currency.gateway_allowed.split(",")
          : "",
    }),
    active: fields.string({
      label: "Active",
      choices: { 0: "No", 1: "Yes" },
      required: true,
      widget: widgets.select({ classes: ["select"] }),
      cssClasses: { field: ["form-group"] },
      value: currency ? currency.active.toString() : "1",
    }),
  };
  formObject = { ...formObject, ...formObject2 };
  var reg_form = forms.create(formObject, { validatePastFirstError: true });
  reg_form.handle(req, {
    success: function (form) {
      if (!currency_id) globalModel.create(req, form.data, "currencies");
      else {
        globalModel.update(
          req,
          form.data,
          "currencies",
          "currency_id",
          currency_id
        );
      }
      res.send({
        success: 1,
        message: "Operation performed successfully.",
        url: process.env.ADMIN_SLUG + "/payments/currencies",
      });
    },
    error: function (form) {
      const errors = formFunctions.formValidations(form);
      res.send({ errors: errors });
    },
    other: function (form) {
      res.render("admin/payments/create-currency", {
        nav: url,
        reg_form: reg_form,
        title: (!currency_id ? "Add" : "Edit") + " Currency",
      });
    },
  });
};

exports.currencies = async (req, res, next) => {
  const query = { ...req.query };

  let results = [];
  let totalCount = 0;

  await globalModel
    .custom(req, "SELECT * from currencies order by `order` asc")
    .then(async (result) => {
      if (result) {
        results = JSON.parse(JSON.stringify(result));
        totalCount = results.length;
      }
    });
  let apiKEY = settings.getSetting(req, "currency_api_key", "");
  if (req.user.level_id != 1) {
    apiKEY = "***********";
  }
  const url = req.originalUrl.replace(process.env.ADMIN_SLUG, "");
  res.render("admin/payments/currencies", {
    apiKEY: apiKEY,
    req: req,
    totalCount: totalCount,
    query: query,
    nav: url,
    results: results,
    title: "Manage Currencies",
  });
};

exports.updateValues = async (req, res) => {
  let apiKEY = settings.getSetting(req, "currency_api_key", "");
  if (!apiKEY) {
    if (!res) {
      return null;
    }
    return res.redirect(process.env.ADMIN_SLUG + "/payments/currencies");
  }
  var request = require("request");
  //get default currency
  let defaultCurrency;
  await globalModel
    .custom(req, "SELECT * from currencies where `default` = ?", 1)
    .then(async (result) => {
      if (result) {
        let results = JSON.parse(JSON.stringify(result));
        defaultCurrency = results[0];
      }
    });

  // await db.currencies.findAll({}).then(async results => {
  let results;
  await globalModel
    .custom(req, "SELECT * from currencies")
    .then(async (result) => {
      if (result) {
        results = JSON.parse(JSON.stringify(result));
      }
    });
  for (var i = 0; i < results.length; i++) {
    let currency = results[i];
    if (defaultCurrency.ID != currency.ID) {
      let query = `${defaultCurrency.ID}_${currency.ID}`;
      await new Promise(function (resolve) {
        request(
          `https://free.currconv.com/api/v7/convert?q=${query}&compact=ultra&apiKey=${apiKEY}`,
          async function (error, response, body) {
            if (!error && response.statusCode === 200) {
              try {
                let value = JSON.parse(body);
                await globalModel.update(
                  req,
                  { currency_value: value[query] },
                  "currencies",
                  "currency_id",
                  currency.currency_id
                );
              } catch (e) {}
            } else {
              if (process.env.NODE_ENV !== "production") console.log(error);
            }
            resolve(true);
          }
        );
      });
    }
  }
  // })
  if (!res) {
    return true;
  }
  return res.redirect(process.env.ADMIN_SLUG + "/payments/currencies");
};
