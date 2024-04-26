const commonFunction = require("../functions/commonFunctions")
const audioModel = require("../models/audio")
const privacyModel = require("../models/privacy")
const userModel = require("../models/users")
const likeModel = require("../models/likes")
const favouriteModel = require("../models/favourites")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")
const globalModel = require("../models/globalModel")
const privacyLevelModel = require("../models/levelPermissions")
const notifications = require("../models/notifications")

exports.successul = async (req, res, next) => {
    let id = req.params.id
    let currentCurrency = req.currentCurrency
    let changeRate = parseFloat(currentCurrency.currency_value)

    let gateway = req.body.gateway
    let stripeToken = req.body.stripeToken

    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    if((gateway == "2" && stripeToken) || gateway == "5"){
        let isValid = true
        //check audio aleady purchased
        await audioModel.checkAudioPurchased({id:id,owner_id:req.user.user_id},req).then(result => {
            if(result){
                isValid = false
            }
        }).catch(err => {
        })
        if(!isValid){
            return res.send({ error: "Audio already purchased" });
        }
        req.session.audio_purchase_id = id
        //delete all user pending orders
        await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'initial' AND source_type = 'audio_purchase'",[req.user.user_id]).then(result => {
            
        })
        //create order
        await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:2,state:"initial",creation_date:currentDate,source_type:"audio_purchase",source_id:id}, "orders").then(result => {
            if (result) {
                req.session.audio_user_id = req.user.user_id
                req.session.orderId = result.insertId
            } else {
    
            }
        })
    }

    if(id != req.session.audio_purchase_id){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let audio = {}
    await audioModel.findById(id,req).then(result => {
        if(result){
            audio = result
        }
    })
    if(!req.user.user_id || !Object.keys(audio).length || parseFloat(audio.price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }

    let commission_amount = 0
    let commissionType = parseFloat(req.appSettings['audio_commission_type'])
    let commissionTypeValue = parseFloat(req.appSettings['audio_commission_value'])
    //calculate admin commission
    if(commissionType == 2 && commissionTypeValue > 0){
        commission_amount = parseFloat((audio.price * (commissionTypeValue/100)).toFixed(2));
    }else if(commissionType == 1 && commissionTypeValue > 0){
        commission_amount = commissionTypeValue;
    }
    if(commission_amount > parseFloat(parseFloat(audio.price).toFixed(2))){
        commission_amount = 0
    }


    let gatewayResponse = {}
    let isValidResult = false
    if(gateway == "2" && stripeToken){
        const stripe = require('stripe')(req.appSettings['payment_stripe_client_secret']);
        await new Promise(function(resolve, reject){
            stripe.customers.create({
                source: stripeToken,
                email: req.user.email,
            },function(err, customer) {
                if(err){
                    resolve()
                    res.send({ error: err.raw.message });
                }else{
                    stripe.charges.create({
                        amount: parseFloat(audio.price).toFixed(2)*100,
                        currency: req.appSettings['payment_default_currency'],
                        description: req.i18n.t("Purchase Audio: ")+audio.title,
                        customer: customer.id,
                        metadata: {
                            order_id: req.session.orderId,
                            audio_id:audio.audio_id
                        }
                    },function(err, charge) {
                        if(err) {
                            resolve()
                            res.send({ error: err.raw.message });
                        }
                        else {
                            resolve()
                            gatewayResponse.state = "completed";
                            gatewayResponse.transaction_id = charge.id;
                            isValidResult = true;
                        }
                    })
                }
            });
        })
    }else if(gateway == "5"){
        // check wallet user amount
        if(parseFloat(audio.price) > parseFloat(req.user.wallet)){
            res.send({ error: req.i18n.t("You don't have enough balance to purchase, please recharge your wallet.") });
            return;
        }
        // update user wallet price
        const adsTransaction = require("../models/adsTransactions");
        adsTransaction.reduceOwnerWalletAmount(req,{owner_id:req.user.user_id,amount:parseFloat(audio.price - commission_amount).toFixed(2)})

        // add amount to owner wallet
        await globalModel
        .custom(
            req,
            "UPDATE users SET `wallet` = wallet + ? WHERE user_id = ?",
            [parseFloat(audio.price - commission_amount).toFixed(2), audio.owner_id]
        ).then((result) => {});

        isValidResult = true;
        gatewayResponse.transaction_id = require('uniqid').process('wallet_payment')
        gatewayResponse.state = "completed"
    }


    if(gateway == "1" || !gateway){
        if (!req.user || !req.session.audiotokenUserPayment || !req.session.audio_user_id || !req.session.audio_purchase_id || !req.session.orderId) {
            return res.redirect(302, "/audio/"+audio.custom_url)
        } else {
            const PayerID = req.query.PayerID
            await oneTimePaypal.execute(req, res, PayerID, { price: parseFloat(audio.price).toFixed(2) }).then(async executeResult => {
                if (executeResult) {
                    gatewayResponse.transaction_id = executeResult.transaction_id
                    gatewayResponse.state = executeResult.state.toLowerCase()      
                    isValidResult = true          
                } else {
                    req.session.adsPaymentStatus = "fail"
                    res.redirect("/watch/"+audio.custom_url)
                    res.end()
                }
            }).catch(err => {
                req.session.adsPaymentStatus = "fail"
                res.redirect("/watch/"+audio.custom_url)
                res.end()
            })
        }
    }

    if(isValidResult) {
        await globalModel.create(req, {type:"audio_purchase",id:audio.audio_id, owner_id: req.session.audio_user_id, package_id: 0, status: gatewayResponse.state.toLowerCase(),creation_date: currentDate, modified_date: currentDate, gateway_profile_id: gatewayResponse.transaction_id,order_id:req.session.orderId }, "subscriptions").then(async result => {
            const audioPurchase = require("../models/audioPurchase")
            await audioPurchase.insertTransaction(req, {gateway_id: (gateway ? gateway : 1) , order_id:req.session.orderId,admin_commission:commission_amount, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: audio.owner_id ,sender_id:req.session.audio_user_id, state: gatewayResponse.state.toLowerCase(), price: parseFloat(audio.price).toFixed(2) - commission_amount,currency:currentCurrency.ID,change_rate:changeRate, default_currency: req.appSettings.payment_default_currency, creation_date: currentDate, modified_date: currentDate,id:audio.audio_id,type:"audio_purchase" }).then(async result => {
                //update user balance
                await globalModel.custom(req,"UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",[(parseFloat(audio.price) - parseFloat(commission_amount)).toFixed(2),audio.owner_id]).then(result => {})

                //update order table
                req.session.audio_user_id = null
                req.session.audio_purchase_id = null
                req.session.audiotokenUserPayment = null
                globalModel.update(req,{currency:currentCurrency.ID, gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state.toLowerCase(),'source_id':audio.audio_id},"orders","order_id",req.session.orderId)
                req.session.audioPaymentStatus = "success"

            
                //buyer
                notifications.insert(req, {owner_id:req.user.user_id,insert:true, type: "audio_purchased", subject_type: "users", subject_id: req.user.user_id, object_type: "audio", object_id: audio.audio_id,forceInsert:true }).then(result => {

                }).catch(err => {
                    console.log(err)
                })
                //owner
                notifications.insert(req, {notChangeOwnerID:true,owner_id:audio.owner_id,insert:true, type: "audio_purchased_owner", subject_type: "users", subject_id: req.user.user_id, object_type: "audio", object_id: audio.audio_id,forceInsert:true }).then(result => {

                }).catch(err => {
                    console.log(err)
                })

                if(!gateway){
                    res.redirect("/audio/"+audio.custom_url)
                }else{
                    res.send({status:true})
                }
                res.end()                     
            })
        })
    }

}
exports.purchase = async (req, res) => {
    let id = req.params.id
    

    req.session.orderId = null
    req.session.audio_purchase_id = null
    
    if (!id || isNaN(id) || !req.user) {
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let audio = {}
    await audioModel.findById(id,req).then(result => {
        if(result){
            audio = result
        }
    })
    if(!Object.keys(audio).length || parseFloat(audio.price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let isValid = true
    //check audio aleady purchased
    await audioModel.checkAudioPurchased({id:audio.audio_id,owner_id:req.user.user_id},req).then(result => {
        if(result){
            isValid = false
        }
    }).catch(err => {
    })
    if(!isValid){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    const data = {}
    data["amount"] = parseFloat(audio.price).toFixed(2)
    data["returnUrl"] = `${process.env.PUBLIC_URL}/audio/successulPayment/`+audio.audio_id
    data["cancelUrl"] = `${process.env.PUBLIC_URL}/audio/cancelPayment/`+audio.audio_id
    data.title = req.i18n.t("Purchase Audio: ")+audio.title
    req.session.audio_purchase_id = audio.audio_id 
    //delete all user pending orders
    await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'initial' AND source_type = 'audio_purchase'",[req.user.user_id]).then(result => {
        
    })
    //create order
    await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:1,state:"initial",creation_date:currentDate,source_type:"audio_purchase",source_id:audio.audio_id}, "orders").then(result => {
        if (result) {
            req.session.orderId = result.insertId
        } else {

        }
    })
    if (!req.session.orderId) {
        req.session.audioPaymentStatus = "fail"
        res.redirect("/audio/"+audio.custom_url)
        res.end()
        return
    }
    data.sku = "audio_purchase_"+req.session.orderId
    return oneTimePaypal.init(req, res, data).then(result => {
        if (result.url) {
            req.session.audio_user_id = req.user.user_id
            req.session.audiotokenUserPayment = result.token
            res.redirect(302, result.url)
            res.end() 
        } else {
            console.log( ' ======= Audio Purchase ONETIME ERR Paypal============')
            req.session.audioPaymentStatus = "fail"
            res.redirect("/audio/"+audio.custom_url)
            res.end()
        }
    }).catch(err => {
        console.log(err, ' ======= Audio Purchase ONETIME ERR ============')
        res.redirect("/audio/"+audio.custom_url)
        res.end()
    })
}
exports.cancel = async (req, res, next) => {
    let id = req.params.id
    if(id != req.session.audio_purchase_id){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let audio = {}
    await audioModel.findById(id,req).then(result => {
        if(result){
            audio = result
        }
    })
    if(!Object.keys(audio).length || !parseFloat(audio.price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if (!req.session.audiotokenUserPayment) {
        res.redirect("/audio/"+audio.custom_url)
        if (req.session.paypalData) {
            req.session.paypalData = null
        }
        res.end()
    }
    req.session.audio_user_id = null
    req.session.audio_purchase_id = null
    req.session.audiotokenUserPayment = null
    if (req.session.paypalData) {
        req.session.paypalData = null
    }
    req.session.audioPaymentStatus = "cancel"
    return res.redirect(302, "/audio/"+audio.custom_url)
}

exports.create = async (req,res,next) => {
    
    let isValid = true
    const id = req.params.id
    if (id) {
        await commonFunction.getGeneralInfo(req,res,'audio_edit_create')
        await audioModel.findByCustomUrl(id, req, res,true).then(async audio => {
            req.query.editItem = audio
            req.query.id = id
            await privacyModel.permission(req, 'audio', 'edit', audio).then(result => {
                isValid = result
            }).catch(err => {
                isValid = false
            })
        }).catch(err => {
            isValid = false
        })
    }else{
        await commonFunction.getGeneralInfo(req,res,'audio_create')
    }
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
     //owner plans
     await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',req.user.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1){
        //get user plans
        await userModel.getPlans(req, { owner_id: req.user.user_id }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }
    //check package enable
    if(req.appSettings["audio_sell"]){
        await privacyLevelModel.findBykey(req,"audio",'sell_audios',req.user.level_id).then(result => {
            if(result == 1)
                req.query.sell_audios = result
        })
    }

    req.query.id = id
    return res.send({...req.query,page_type:"create-audio"});
}

exports.browse = async (req, res) => {
    const queryString = req.query
    await commonFunction.getGeneralInfo(req, res, 'audio_browse')
    
    const limit = 17
    const data = { limit: limit }
    req.query.search = {}
    data['type'] = queryString.type
    if (queryString.q && !queryString.tag) {
        req.query.search.q = queryString.q
        data['title'] = queryString.q
    }

    if (queryString.sort == "latest") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.audio_id desc"
    } else if (queryString.sort == "favourite" && req.appSettings['audio_favourite'] == 1) {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.favourite_count desc"
    } else if (queryString.sort == "view") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.view_count desc"
    } else if (queryString.sort == "like" && req.appSettings['audio_like'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.like_count desc"
    } else if (queryString.sort == "dislike" && req.appSettings['audio_dislike'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.dislike_count desc"
    } else if (queryString.sort == "rated" && req.appSettings['audiorating'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.rating desc"
    } else if (queryString.sort == "commented" && req.appSettings['audio_comment'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.comment_count desc"
    }else if (queryString.sort == "played") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "audio.play_count desc"
    } 

    if (queryString.type == "featured" && req.appSettings['audio_featured'] == 1) {
        req.query.search.type = queryString.type
        data['is_featured'] = 1
    } else if (queryString.type == "sponsored" && req.appSettings['audio_sponsored'] == 1) {
        req.query.search.type = queryString.type
        data['is_sponsored'] = 1
    } else if (queryString.type == "hot" && req.appSettings['audio_hot'] == 1) {
        req.query.search.type = queryString.type
        data['is_hot'] = 1
    }
    req.query.fromBrowse = 1
    req.query.audios = []
    //get all channels as per categories
    await audioModel.getAudios(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.audios = items
        }
    })
    return res.send({...req.query,page_type:"audio"});
}

exports.view = async (req, res) => {
 
    await commonFunction.getGeneralInfo(req, res, 'audio_view')
    req.query.tabType = (req.query.type ? req.query.type : null)
    req.query.id = req.params.id

    let audio = {}
    let audioObj = {}

    await audioModel.findByCustomUrl(req.params.id,req).then(results => {
        if (results)
            audioObj = results
    })

    let referer  = ""
    try{
        referer = req.header('Referer');
    }catch(err){
        console.log(err)
    }
    //add user referer
    if(referer){
        let currentServerURL = process.env.PUBLIC_URL
        var currentHost = new URL(currentServerURL);
        var a = new URL(referer);
        if(a.hostname != currentHost.hostname){
            let insertObject = {}
            insertObject['owner_id'] = req.user ? req.user.user_id : 0
            insertObject['sitename'] = a.hostname
            insertObject['content_id'] = audioObj ? audioObj.audio_id : 0
            insertObject['url'] = referer
            insertObject['type'] = "audio"
            insertObject['ip'] = typeof req.headers != "undefined" && req.headers['x-real-ip'] ? req.headers['x-real-ip'] : (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "")
            insertObject['creation_date'] =  new Date(dateTime.create().format("Y-m-d H:M:S"));
            await globalModel.create(req,insertObject,'referers').then(res => {})
        }
    }

    req.isview = true;
    req.allowPeaks = true;
    await audioModel.getAudios(req,{custom_url: req.query.id ? req.query.id : "notfound", audioview: true }).then(result => {
        if (result && result.length > 0)
            audio = result[0]
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })
    req.allowPeaks = false;
    req.isview = false;
    let showAudio = true
    if (Object.keys(audio).length) {
        await privacyModel.check(req, audio, 'audio').then(result => {
            showAudio = result
        }).catch(error => {
            showAudio = false
        })
    }else{
        showAudio = false;
    }
    if (!showAudio) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    
    await privacyModel.permission(req, 'audio', 'delete', audio).then(result => {
        audio.canDelete = result
    })
   
    await privacyModel.permission(req, 'audio', 'edit', audio).then(result => {
        audio.canEdit = result
    })
    if (!Object.keys(audio).length || ((audio.approve != 1) && (!req.user || audio.owner_id != req.user.user_id && req.levelPermissions['audio.view'] != 2  ))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    await commonFunction.updateMetaData(req,{title:audio.title,description:audio.description,image:audio.image})

    if (req.user) {
        await likeModel.isLiked(audio.audio_id, 'audio', req, res).then(result => {
            if (result) {
                audio.like_dislike = result.like_dislike
            }
        })

        //favourite
        await favouriteModel.isFavourite(audio.audio_id, 'audio', req, res).then(result => {
            if (result) {
                audio['favourite_id'] = result.favourite_id
            }
        })
        
    }

    //audio user details
    await userModel.findById(audio.owner_id, req, res).then(result => {
        audio.owner = result
    }).catch(error => {

    })

    if(req.appSettings["audio_sell"]){
        await privacyLevelModel.findBykey(req,"audio",'sell_audios',audio.owner.level_id).then(result => {
            if(result == 1)
                audio.sell_audios = true
        })
    }

    if((parseFloat(audio.price) > 0 && audio.sell_audios) && req.user && !audio.canEdit){
        //check audio purchased 
        if(req.user){
            await audioModel.checkAudioPurchased({id:audio.audio_id,owner_id:req.user.user_id},req).then(result => {
                if(result){
                    audio.audioPurchased = true
                }
            }).catch(err => {
            })
        }
    }

    if(audio.canEdit){
        audio.audioPurchased = true
    }


    //owner plans
    await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',audio.owner.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1 && !audio.audioPurchased){
        let isPermissionAllowed = false
        if(req.user && (req.user.user_id == audio.owner_id || (req.levelPermissions["audio.view"] && req.levelPermissions["audio.view"].toString() == "2"))){
            isPermissionAllowed = true;
        }
        if(audio.view_privacy.indexOf("package_") > -1 && !isPermissionAllowed){
            let owner_id = req.user ? req.user.user_id : 0
            let checkPlanSql = ""
            let conditionPlanSql = [owner_id,audio.audio_id]
            checkPlanSql += 'SELECT `member_plans`.price as `package_price`,`subscriptions`.package_id as loggedin_package_id,mp.price as loggedin_price,'
            checkPlanSql+=  ' CASE WHEN member_plans.price IS NULL THEN 1 WHEN mp.price IS NULL THEN 0 WHEN  `member_plans`.price <= mp.price THEN 1'
            checkPlanSql+=  ' WHEN  `member_plans`.price > mp.price THEN 2'
            checkPlanSql += ' ELSE 0 END as is_active_package'
            checkPlanSql += ' FROM `audio` LEFT JOIN `member_plans` ON `member_plans`.member_plan_id = REPLACE(`audio`.view_privacy,"package_","") LEFT JOIN'
            checkPlanSql += ' `subscriptions` ON subscriptions.id = audio.owner_id AND subscriptions.owner_id = ? AND subscriptions.type = "user_subscribe" AND subscriptions.status IN ("active","completed") LEFT JOIN `member_plans` as mp ON mp.member_plan_id = `subscriptions`.package_id WHERE '
            checkPlanSql += ' audio.audio_id = ? LIMIT 1'
            await globalModel.custom(req,checkPlanSql,conditionPlanSql).then(result => {
                if(result && result.length > 0){
                    const res = JSON.parse(JSON.stringify(result))[0];
                    if(res.is_active_package == 0){
                        res.type = "new"
                        req.query.needSubscription = res; 
                    }else if(res.is_active_package == 2){
                        res.type = "upgrade"
                        req.query.needSubscription = res;
                    }
                }
            })
        }
    }

    if(req.query.needSubscription){
        if(!req.query.tabType){
            req.query.tabType = "plans"
        }
        //get user plans
        await userModel.getPlans(req, { owner_id: audio.owner.user_id, item:req.query.needSubscription }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
        delete audio.audio_file
        delete audio.peaks
    }else{
        if(req.query.tabType == "plans"){
            req.query.tabType = "about"
        }if(!req.query.tabType){
            req.query.tabType = "about"
        }
    }
    
    if(req.session.audioPaymentStatus){
        audio.audioPaymentStatus = true
        req.session.audioPaymentStatus = null
    }

    if (!req.query.password) {
        req.query.audio = audio
        delete req.query.audio.password
        if(audio.approve == 1)
            recentlyViewed.insert(req, { id: audio.audio_id, owner_id: audio.owner_id, type: 'audio', creation_date: dateTime.create().format("Y-m-d H:M:S") })

        await audioModel.getAudios(req, { orderby:" view_count desc ", not_audio_id: audio.audio_id, limit: 10 }).then(result => {
            if (result) {
                req.query.relatedAudios = result
            }
        }).catch(err => {
    
        })


    }
    return res.send({...req.query,page_type:"audio"});
}
