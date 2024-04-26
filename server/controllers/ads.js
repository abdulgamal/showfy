const commonFunction = require("../functions/commonFunctions")
const adsModel = require("../models/userAds")
const privacyModel = require("../models/privacy")
const categoryModel = require("../models/categories")
const oneTimePaypal = require("../functions/one-time-paypal")
const globalModel = require("../models/globalModel")
const notifications = require("../models/notifications")
const dateTime = require("node-datetime")
const constant = require("../functions/constant")
const socketio = require("../socket")
const axios = require("axios")
const userModel = require('../models/users')

exports.recharge = async (req, res) => {
    let currentCurrency = req.currentCurrency
    let changeRate = parseFloat(currentCurrency.currency_value)
    
    req.session.currentCurrency = currentCurrency.ID

    let amount = req.query.amount
    let type = req.query.type
    req.session.orderId = null
    let gateway = req.query.gateway
    let returnUrl = req.query.returnUrl
    if (!amount || isNaN(amount) || !req.user) {
        
        await commonFunction.getGeneralInfo(req, res, "")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if(gateway == "5"){
        if(parseFloat(amount) < 10){
            return res.send({error:req.i18n.t("Please enter minimum recharge value to 10.")})
        }
    }
    let fromBalance = req.query.fromBalance
    let fromVideo = req.query.fromVideo
    if(fromVideo){
        req.session.redirectURL = req.header('Referer')
    }else if(returnUrl){
        req.session.redirectURL = returnUrl
    }
    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    amount = +parseFloat(amount).toFixed(2)
    const data = {}
    data["amount"] = amount
    data["returnUrl"] = `${process.env.PUBLIC_URL}/ads/successulPayment`
    data["cancelUrl"] = `${process.env.PUBLIC_URL}/ads/cancelPayment`
    data.title = req.i18n.t(constant.general.WALLETRECHARGE),
    req.session.adsAmount = amount
    req.session.fromBalance = fromBalance
    
    //delete all user pending orders
    await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'pending'",[req.user.user_id]).then(result => {
        
    })
    //create order
    await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:1,state:"pending",creation_date:currentDate,source_type:"wallet_user",source_id:req.user.user_id,summary:amount,currency:currentCurrency.ID}, "orders").then(result => {
        if (result) {
            req.session.orderId = result.insertId
        } else {

        }
    })
    if (!req.session.orderId) {
        req.session.adsPaymentStatus = "fail"
        res.redirect("/dashboard/ads")
        res.end()
        return
    }
    data.sku = "user_wallet_"+req.session.orderId

    if(gateway == "5"){
        await commonFunction.qpayRefreshTOken(req).then(async result => {
            if(result.error){
                return res.send({error:"Something went wrong, please try again later.",errorMessage:result.error})
            }else{

                // create simple invoice
                await commonFunction.createInvoiceSimple(req,result,{price:amount,order_id:req.session.orderId}).then(resultInvoice => {
                    if(resultInvoice.error){
                        return res.send({error:"Something went wrong, please try again later.",errorMessage:resultInvoice.error})
                    }else{
                        return res.send({...resultInvoice,order_id:req.session.orderId})
                    } 
                })
                
            }
            
        })
    }else if(type == "cashfree"){
        let name = req.body.name
        let email = req.body.email
        let phone = req.body.phone

        if(!name || !email || !phone){
            return  res.send({
                error:"Please fill all fields."
            })
        }

        var request = require('request');
        var options = {
            'method': 'POST',
            'url': `https://${parseInt(req.appSettings["payment_cachfree_sanbox"]) == 0 ? "sandbox.cashfree.com" : "https://api.cashfree.com"}/pg/orders`,
            'headers': {
                'x-api-version': '2023-08-01',
                'content-type': 'application/json',
                'x-client-id': req.appSettings["payment_cashfree_client_id"],
                'x-client-secret': req.appSettings["payment_cashfree_client_secret"],
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "customer_details": {
                    "customer_id":""+req.user.user_id,
                    "customer_phone": req.body.phone ?? req.user.phone_number.replace("+91",''),
                    "customer_email": req.body.email ?? req.user.email,
                    "customer_name": req.body.name ?? req.user.displayname
                },
                "order_meta":{
                    "return_url":process.env.PUBLIC_URL+"/ads/successulPayment?gateway=6&order_id={order_id}"
                },
                "order_id": 'wallet_payment_'+req.session.orderId,
                "order_currency": currentCurrency.ID,
                "order_amount": amount
            })
        };
        await request(options, function (error, response) {
            if (error) {
                console.log(error);
                res.send({
                    error:error.message
                })
                return;
            };
            let body = JSON.parse(response.body)
            if (response.statusCode != 200) {
                
                res.send({
                    error:body.message
                })
                return;
            };
            req.session.ad_user_id = req.user.user_id
            req.session.payment_session_id = body.payment_session_id;
            return res.send({mode:parseInt(req.appSettings["payment_cachfree_sanbox"]) == 0 ? "sandbox" : "production",payment_session_id:body.payment_session_id,successURL:process.env.PUBLIC_URL+"/ads/successulPayment?gateway=6&order_id={order_id}"})
        });
    }else if(gateway == "7"){
        let name = req.body.name
        let email = req.body.email
        let phone = req.body.phone

        if(!name || !email || !phone){
            return  res.send({
                error:"Please fill all fields."
            })
        }

        const Razorpay = require('razorpay');
        var instance = new Razorpay({ key_id: req.appSettings["payment_razorpay_client_id"], key_secret: req.appSettings["payment_razorpay_client_secret"] })
        var options = {
            amount: amount*100,  // amount in the smallest currency unit
            currency: currentCurrency.ID,
            receipt: 'wallet_payment_'+req.session.orderId
        };
        instance.orders.create(options, function(err, order) {
            if(err){
                return res.send({
                    error:body.message
                })
            }else{
                req.session.ad_user_id = req.user.user_id
                return res.send({
                    key:req.appSettings["payment_razorpay_client_id"],
                    order_id:order.id,
                    amount:amount*100,
                    currency:currentCurrency.ID,
                })
            }
        });
        return;
    }else if(gateway == "8"){
        let name = req.body.name
        let email = req.body.email
        let phone = req.body.phone

        if(!name || !email || !phone){
            return  res.send({
                error:"Please fill all fields."
            })
        }

        req.session.ad_user_id = req.user.user_id
        return res.send({
            key:req.appSettings["payment_flutterwave_client_id"],
            order_id:req.session.orderId,
            amount:amount,
            currency:currentCurrency.ID,
            options:"card,mobilemoney,ussd,banktransfer",
            title:req.i18n.t("Wallet Payment")
        })
    }else if(gateway == "9"){
        let name = req.body.name
        let email = req.body.email
        let phone = req.body.phone
        req.session.walletRechargeAmount = amount
        if(!name || !email || !phone){
            return  res.send({
                error:"Please fill all fields."
            })
        }

        req.session.ad_user_id = req.user.user_id
        let queryData = ``
        queryData = "&orderId="+req.session.orderId+queryData
        queryData = "&ad_user_id="+req.session.ad_user_id+queryData
        queryData = "&adsAmount="+req.session.adsAmount+queryData
        if(req.session.redirectURL)
            queryData = "&redirectURL="+req.session.redirectURL+queryData
        queryData = "&fromBalance="+req.session.fromBalance+queryData

        const formData = {
            cus_name:name,
            cus_email:email,
            cus_phone:phone,
            amount,
            tran_id: `${req.appSettings["payment_aamarpay_storeid"]}-${req.session.orderId}`,
            signature_key: req.appSettings["payment_aamarpay_signaturekey"],
            store_id: req.appSettings["payment_aamarpay_storeid"],
            currency:currentCurrency.ID,
            desc:req.i18n.t("Wallet Payment"),
            success_url: `${process.env.PUBLIC_URL}/ads/successulPayment?gateway=9${queryData}`,
            fail_url: `${process.env.PUBLIC_URL}/ads/cancelPayment?gateway=9`,
            cancel_url: `${process.env.PUBLIC_URL}/ads/cancelPayment?gateway=9`,
            type: "json", //This is must required for JSON request
          };
          const { data } = await axios.post(
            `${req.appSettings["payment_aamarpay_sanbox"] == "0" ? "https://sandbox.aamarpay.com" : "https://secure.aamarpay.com"}/jsonpost.php`,
            formData
          );
          if (data.result !== "true") {
            let errorMessage = "";
            for (let key in data) {
              errorMessage += data[key] + ". ";
            }
            return res.send({
              error:errorMessage,
            });
          }else{
            res.send({successURL:data.payment_url})
          }        
    }else{
        return oneTimePaypal.init(req, res, data).then(result => {
            if (result.url) {
                req.session.ad_user_id = req.user.user_id
                req.session.adstokenUserPayment = result.token
                res.redirect(302, result.url)
                res.end()
            } else {
                req.session.adsPaymentStatus = "fail"
                res.redirect("/dashboard/ads")
                res.end()
            }
        }).catch(err => {
            console.log(err, ' ======= Upgrade ONETIME ERR ============')
            res.redirect("/dashboard/ads")
            res.end()
        })
    }
}

exports.qpayPaymentIPN = async (req,res,next) => {
    
    
    let order_id = req.query.order_id
    let qpay_payment_id = req.query.qpay_payment_id
    let order = null;
    // fetch order
    await globalModel.custom(req, "SELECT * FROM orders WHERE order_id = ?", [order_id]).then(async result => {
        if (result) {
            order = JSON.parse(JSON.stringify(result))[0]
        }
    })

    

    if(!order || order.state != "pending") {
        return res.send({status:false,message:"order ID not found in database - "+order_id})
    }

    let currentCurrency = req.currentCurrency
    let changeRate = parseFloat(currentCurrency.currency_value)
    await globalModel.custom(req, "SELECT * FROM currencies WHERE ID = ?", [order.currency]).then(async result => {
        if (result) {
            currentCurrency = JSON.parse(JSON.stringify(result))[0]
            changeRate = parseFloat(currentCurrency.currency_value)
        }
    })
    // validate qpay payment IPN
    await commonFunction.qpayRefreshTOken(req).then(async result => {
        if(result.error){
            return res.send({error:"Something went wrong, please try again later.",errorMessage:result.error})
        }else{
            // create simple invoice
            await commonFunction.qpayValidateIPN(req,result,{qpay_payment_id:qpay_payment_id}).then(async resultInvoice => {
                if(resultInvoice.error){
                    return res.send({error:"Something went wrong, please try again later.",errorMessage:resultInvoice.error})
                }else{
                    if(resultInvoice.payment_status.toUpperCase() == "PAID"){
                        let currentDate = dateTime.create().format("Y-m-d H:M:S")
                        req.session.ad_user_id = order.owner_id
                        req.session.adsAmount = order.summary
                        req.session.orderId = order.order_id
                        let gatewayResponse = {}
                        console.log(req.session)
                        gatewayResponse.transaction_id = require('uniqid').process('wallet_user')
                        gatewayResponse.state = "completed".toLowerCase()  
                        // payment success
                        await globalModel.custom(req, "SELECT wallet FROM users WHERE user_id = ?", [req.session.ad_user_id]).then(async result => {
                            if (result) {
                                const walletData = parseFloat(JSON.parse(JSON.stringify(result))[0].wallet)+Number((parseFloat(req.session.adsAmount) / changeRate).toFixed(2));

                                await globalModel.update(req, { wallet: walletData }, "users", "user_id", req.session.ad_user_id).then(async result => {
                                    if (result) {
                                        await globalModel.create(req, {order_id:0,subscription_id:0,type:"wallet",id:req.session.ad_user_id,package_id:0,admin_commission:0, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: req.session.ad_user_id, state: gatewayResponse.state, price: (parseFloat(req.session.adsAmount)/changeRate).toFixed(2), currency: currentCurrency.ID,default_currency:req.appSettings.payment_default_currency,change_rate:changeRate, creation_date: currentDate, modified_date: currentDate }, "transactions").then(async result => {
                                            //update order table
                                            req.session.ad_user_id = null
                                            globalModel.update(req,{gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state,summary:""},"orders","order_id",req.session.orderId)                                            
                                            //update points
                                            notifications.insert(req, {owner_id:order.owner_id,insert:true, type: "wallet_recharge", subject_type: "users", subject_id: order.owner_id, object_type: "members", object_id: order.owner_id,forceInsert:true }).then(result => {
                
                                            }).catch(err => {
                                                console.log(err)
                                            })
                                                                                        
                                        })
                                        socketio.getIO().emit('qpayOrderComplete', {
                                            "order_id": order.order_id,
                                            "status": "success",
                                        });
                                        return res.send("OK")
                                    } else {
                                        socketio.getIO().emit('qpayOrderComplete', {
                                            "order_id": order.order_id,
                                            "status": "failed",
                                        });
                                        return res.send("FAILED")

                                    }
                                })
                            } else {
                                socketio.getIO().emit('qpayOrderComplete', {
                                    "order_id": order.order_id,
                                    "status": "failed",
                                });
                                return res.send("FAILED")
                            }
                        })
                    }else if(resultInvoice.payment_status.toUpperCase() == "FAILED"){
                        // payment failed
                        socketio.getIO().emit('qpayOrderComplete', {
                            "order_id": order.order_id,
                            "status": "failed",
                        });
                        return res.send("FAILED")
                    }
                } 
            })
            
        }
        
    })


}

exports.successul = async (req, res, next) => {
    let currentCurrency = req.currentCurrency
    let changeRate = parseFloat(currentCurrency.currency_value)
    
    let gateway = req.body.gateway ?? req.query.gateway
    let stripeToken = req.body.stripeToken
    let amount = parseFloat(req.body.price ?? req.session.walletRechargeAmount)
    let returnUrl = req.body.returnUrl

    let currentDate = dateTime.create().format("Y-m-d H:M:S")

    if(gateway == "2" && stripeToken){
        if (!amount || isNaN(amount) || !req.user) {
            return res.send({error:"Invalid request"});
        }
        amount = +parseFloat(amount).toFixed(2)
        req.session.ad_user_id = req.user.user_id
        req.session.adsAmount = amount
         //delete all user pending orders
        await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'pending'",[req.user.user_id]).then(result => {
            
        })
        //create order
        await globalModel.create(req, {currency:req.appSettings["payment_default_currency"], owner_id:req.user.user_id,gateway_id:2,state:"pending",creation_date:currentDate,source_type:"wallet_user",source_id:req.user.user_id}, "orders").then(result => {
            if (result) {
                req.session.orderId = result.insertId
            } else {

            }
        })
    }

    let gatewayResponse = {}
    let isValidResult = false
    if(gateway == "2" && stripeToken){
        
        const stripe = require('stripe')(req.appSettings['payment_stripe_client_secret']);
        await new Promise(function(resolve, reject){
            stripe.customers.create({
                source: stripeToken,
                email: req.user.email
            },function(err, customer) {
                if(err){
                    
                    res.send({ error: err.raw.message });
                    resolve()
                }else{
                    stripe.charges.create({
                        amount: parseFloat(amount/changeRate).toFixed(2)*100,
                        currency: currentCurrency.ID,
                        description: req.i18n.t(constant.general.WALLETRECHARGE),
                        customer: customer.id,
                        metadata: {
                            order_id: req.session.orderId,
                            user_id:req.user.user_id
                        }
                    },function(err, charge) {
                        if(err) {
                            
                            res.send({ error: err.raw.message });
                            resolve()
                        }
                        else {
                            
                            gatewayResponse.state = "completed";
                            gatewayResponse.transaction_id = charge.id;
                            isValidResult = true;
                            resolve()
                        }
                    })
                }
            });
        })
    }
    if(gateway == "1" || !gateway){
        if (!req.user || !req.session.adstokenUserPayment || !req.session.ad_user_id || !req.session.adsAmount || !req.session.orderId) {
            return res.redirect(302, '/dashboard/ads')
        } else {
            const PayerID = req.query.PayerID
            await oneTimePaypal.execute(req, res, PayerID, { price: parseFloat(parseFloat(req.session.adsAmount)).toFixed(2) }).then(async executeResult => {
                if (executeResult) {
                    gatewayResponse.transaction_id = executeResult.transaction_id
                    gatewayResponse.state = executeResult.state.toLowerCase()      
                    isValidResult = true       
                    
                } else {
                    req.session.adsPaymentStatus = "fail"
                    if(req.session.redirectURL){
                        res.redirect(req.session.redirectURL)
                    }else if(returnUrl){
                        res.redirect(returnUrl)
                    }else if(req.session.fromBalance){
                        res.redirect("/dashboard/balance");
                    }else{
                        res.redirect("/dashboard/ads")
                    }
                    res.end()
                }
            }).catch(err => {
                console.log(err,' ================================================================= ')
                req.session.adsPaymentStatus = "fail"
                if(req.session.redirectURL){
                    res.redirect(req.session.redirectURL)
                }else if(returnUrl){
                    res.redirect(returnUrl)
                }else if(req.session.fromBalance){
                    res.redirect("/dashboard/balance");
                }else{
                    res.redirect("/dashboard/ads")
                }
                res.end()
            })
        }
    }
    if(gateway == "6"){
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': `https://${parseInt(req.appSettings["payment_cachfree_sanbox"]) == 0 ? "sandbox.cashfree.com" : "https://api.cashfree.com"}/pg/orders/${req.query.order_id}`,
            'headers': {
                'x-api-version': '2023-08-01',
                'content-type': 'application/json',
                'x-client-id': req.appSettings["payment_cashfree_client_id"],
                'x-client-secret': req.appSettings["payment_cashfree_client_secret"],
                'Accept': 'application/json'
            }
        };
        await new Promise(async function(resolve, reject){
            await request(options, function (error, response) {
                if(!error){
                    let body = JSON.parse(response.body)
                    if (response.statusCode == 200) {
                        if(body.order_status == "PAID"){
                            gatewayResponse.state = "completed";
                            gatewayResponse.transaction_id = req.query.order_id;
                            isValidResult = true;
                            resolve();
                        }                
                    }else{
                        resolve();
                    }
                }else{
                    resolve();
                }
            });
        })
    }else if(gateway == "7"){
        const crypto = require("crypto");
        const hmac = crypto.createHmac('sha256', req.appSettings["payment_razorpay_client_secret"]);

        hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id);
        let generatedSignature = hmac.digest('hex');
        let isSignatureValid = generatedSignature == req.body.razorpay_signature;

        if(isSignatureValid){
            gatewayResponse.state = "completed";
            gatewayResponse.transaction_id = req.body.razorpay_payment_id;
            isValidResult = true;
        }
    }else if(gateway == "8"){
        const Flutterwave = require('flutterwave-node-v3');
        const flw = new Flutterwave(req.appSettings["payment_flutterwave_client_id"], req.appSettings["payment_flutterwave_client_secret"]);

        await flw.Transaction.verify({ id: req.body.transaction_id }).then((response) => {
            if (
                response.data.status === "successful") {
                    gatewayResponse.state = "completed";
                    gatewayResponse.transaction_id = req.body.transaction_id;
                    isValidResult = true;
            } else {
               
            }
        })
        .catch(console.log);
    }else if(gateway == "9"){
        const {
            pay_status,
          } = req.body;
        
        if(pay_status == "Successful"){
            req.session.orderId = req.query.orderId
            req.session.ad_user_id = req.query.ad_user_id
            req.session.adsAmount = req.query.adsAmount
            if(req.query.redirectURL && req.query.redirectURL != "undefined")
            req.session.redirectURL = req.query.redirectURL
            req.session.fromBalance = req.query.fromBalance
            await userModel.findById(req.session.ad_user_id, req, res,true).then(async (user) => {
                if (user){
                    req.session.user = user.user_id
                    req.user = user
                }
            })
            gatewayResponse.state = "completed";
            gatewayResponse.transaction_id = req.body.pg_txnid;
            isValidResult = true;
        }          
    }
    let order;
    await globalModel.custom(req, "SELECT * FROM orders WHERE order_id = ?", [req.session.orderId]).then(async result => {
        if (result) {
            order = JSON.parse(JSON.stringify(result))[0]
        }
    })

    await globalModel.custom(req, "SELECT * FROM currencies WHERE ID = ?", [order.currency]).then(async result => {
        if (result) {
            currentCurrency = JSON.parse(JSON.stringify(result))[0]
            changeRate = parseFloat(currentCurrency.currency_value)
        }
    })
    if(isValidResult){
        await globalModel.custom(req, "SELECT wallet FROM users WHERE user_id = ?", [req.session.ad_user_id]).then(async result => {
            if (result) {
                const walletData = parseFloat(JSON.parse(JSON.stringify(result))[0].wallet)+Number((parseFloat(req.session.adsAmount) / changeRate).toFixed(2));
                await globalModel.update(req, { wallet: walletData }, "users", "user_id", req.session.ad_user_id).then(async result => {
                    if (result) {
                        await globalModel.create(req, {order_id:req.session.orderId,subscription_id:0,type:"wallet",id:req.session.ad_user_id,package_id:0,admin_commission:0, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: req.session.ad_user_id, state: gatewayResponse.state, price: (parseFloat(req.session.adsAmount)/changeRate).toFixed(2), currency: currentCurrency.ID,default_currency:req.appSettings.payment_default_currency,change_rate:changeRate, creation_date: currentDate, modified_date: currentDate }, "transactions").then(async result => {
                            //update order table
                            req.session.ad_user_id = null
                            globalModel.update(req,{gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state},"orders","order_id",req.session.orderId)
                            
                            //update points
                            
                            notifications.insert(req, {owner_id:req.user.user_id,insert:true, type: "wallet_recharge", subject_type: "users", subject_id: req.user.user_id, object_type: "members", object_id: req.user.user_id,forceInsert:true }).then(result => {

                            }).catch(err => {
                                console.log(err)
                            })
                            
                            if(!gateway || gateway == "6" || gateway == "9"){
                                req.session.adsPaymentStatus = "success"
                                if(req.session.redirectURL){
                                    res.redirect(req.session.redirectURL)
                                }else if(returnUrl){
                                    res.redirect(returnUrl)
                                }else if(req.session.fromBalance){
                                    res.redirect("/dashboard/balance");
                                }else{
                                    res.redirect("/dashboard/ads")
                                }
                            }else{
                                res.send({status:true})
                            }
                            res.end()
                        })
                    } else {
                        if(!gateway || gateway == "6" || gateway == "9"){
                            req.session.adsPaymentStatus = "fail"
                            if(req.session.redirectURL){
                                res.redirect(req.session.redirectURL)
                            }else if(returnUrl){
                                res.redirect(returnUrl)
                            }else if(req.session.fromBalance){
                                res.redirect("/dashboard/balance");
                            }else{
                                res.redirect("/dashboard/ads")
                            }
                        }else{
                            res.send({error:constant.general.DATABSE})
                        }
                        res.end()
                    }
                })
                return;
            } else {
                if(!gateway || gateway == "6" || gateway == "9"){
                    req.session.adsPaymentStatus = "fail"
                    if(req.session.redirectURL){
                        res.redirect(req.session.redirectURL)
                    }else if(returnUrl){
                        res.redirect(returnUrl)
                    }else if(req.session.fromBalance){
                        res.redirect("/dashboard/balance");
                    }else{
                        res.redirect("/dashboard/ads")
                    }
                }else{
                    res.send({error:constant.general.DATABSE})
                }
                res.end()
            }
        })
        return;
    }
    req.session.adsPaymentStatus = "fail"
    if(req.session.redirectURL){
        res.redirect(req.session.redirectURL)
    }else if(returnUrl){
        res.redirect(returnUrl)
    }else if(req.session.fromBalance){
        res.redirect("/dashboard/balance");
    }else{
        res.redirect("/dashboard/ads")
    }
    res.end()
}

exports.cancel = (req, res, next) => {
    if (!req.session.adstokenUserPayment) {
        if(req.session.fromBalance){
            res.redirect("/dashboard/balance");
        }else{
            res.redirect("/dashboard/ads")
        }
        if (req.session.paypalData) {
            req.session.paypalData = null
        }
        res.end()
    }
    req.session.ad_user_id = null
    req.session.adstokenUserPayment = null
    if (req.session.paypalData) {
        req.session.paypalData = null
    }
    req.session.adsPaymentStatus = "cancel"
    if(req.session.redirectURL){
        res.redirect(req.session.redirectURL)
    }else if(req.session.fromBalance){
        res.redirect("/dashboard/balance");
    }else{
        res.redirect("/dashboard/ads")
    }
    return res.end();
}

exports.create = async (req, res) => {
    let adType = "ads_create"
    let isValid = true
    const id = req.params.id
    if (id) {
        adType = "ads_edit"
        await adsModel.findById(id, req, res, true).then(async ad => {
            req.query.editItem = ad
            req.query.id = id
            await privacyModel.permission(req, 'member', 'editads', ad).then(result => {
                isValid = result
            }).catch(err => {
                isValid = false
            })
        }).catch(err => {
            isValid = false
        })
    }else{
        if(!req.appSettings['video_ffmpeg_path'] && req.user.level_id != 1){
            return res.send({ ...req.query , pagenotfound: 1 });
        }
    }
    await commonFunction.getGeneralInfo(req, res, adType)
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }

    //get categories
    const categories = []
    await categoryModel.findAll(req, { type: "video" }).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    if (categories.length > 0)
        req.query.adCategories = categories

    
    return res.send({...req.query,page_type:"create-ad"});
    
}