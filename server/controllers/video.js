const commonFunction = require("../functions/commonFunctions")
const settingModel = require("../models/settings")
const movieController = require("../controllers/movies")
const artistModel = require("../models/artists")
const categoryModel = require("../models/categories")
const videoModel = require("../models/videos")
const notifications = require("../models/notifications")
const privacyModel = require("../models/privacy")
const privacyLevelModel = require("../models/levelPermissions")
const userModel = require("../models/users")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")
const playlistModel = require("../models/playlists")
const globalModel = require("../models/globalModel")
const oneTimePaypal = require("../functions/one-time-paypal")
const  axios = require("axios")
const moment = require("moment")

exports.download = async (req,res,next) => {
    const id = req.params.id
    const type = req.params.type
    let video = {}
    await videoModel.findById(id,req).then(result => {
        if(result){
            video = result
        }
    })

    if(Object.keys(video).length == 0 || ( video.type != 3 && !video.mediaserver_stream_id )){
       return res.send({error:"error"}).end();
    }

    if(type && parseInt(video[type]) != 1){
       return res.send({error:"error"}).end();
    }

    var file = ""
    let imageSuffix = req.appSettings['imageSuffix']

    if(type){
        let location = video.video_location
        let splitName = location.split('/')
        let fullName = splitName[splitName.length - 1]
        let videoName = fullName.split('_')[0]
        if(video.type == 3){
            let path = "/upload/videos/video/"
            if(type == "4096p"){
                file = path + videoName + "_4096p.mp4"
            }else if(type == "2048p"){
                file = path + videoName + "_2048p.mp4"
            }else if(type == "1080p"){
                file = path + videoName + "_1080p.mp4"
            }else if(type == "720p"){
                file = path + videoName + "_720p.mp4"
            }else if(type == "480p"){
                file = path + videoName + "_480p.mp4"
            }else if(type == "360p"){
                file = path + videoName + "_360p.mp4"
            }else if(type == "240p"){
                file = path + videoName + "_240p.mp4"
            }
        }else{
            let videos = video.code.split(',')
            let videoPath = req.query['liveStreamingServerURL']+`:5443/${video.antmedia_app}/streams/`
            if(req.query['liveStreamingCDNURL']){
                videoPath = req.query['liveStreamingCDNURL']+"/streams/"
            }
            if(videos.length > 1){
                if(type == "4096p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('_4096p') > -1;
                    });
                    file = videoPath + url
                }else if(type == "2048p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('_2048p') > -1;
                    });
                    file = videoPath + url
                }else if(type == "1080p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('1080p') > -1;
                    });
                    file = videoPath + url
                }else if(type == "720p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('720p') > -1;
                    });
                    file = videoPath + url
                }else if(type == "480p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('480p') > -1;
                    });
                    file = videoPath +url
                }else if(type == "360p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('360p') > -1;
                    });
                    file = videoPath + url
                }else if(type == "240p"){
                    let url = videos.filter(function(item) {
                        return item.indexOf('240p') > -1;
                    });
                    file = videoPath + url
                }
            }else{
                file = req.query['liveStreamingServerURL']+`:5443/${video.antmedia_app}/streams/`+video.code
                if(req.query['liveStreamingCDNURL']){
                    file = req.query['liveStreamingCDNURL']+"/streams/"+video.code
                }
            }
        }
    }
    
    if(file.indexOf("http") == -1 && file.indexOf("https") == -1){
        file = imageSuffix+file
    }

    await res.download(file, (err) => {
        if (err) {
            console.log(err);
            res.end();
          }
    });
}

exports.purchase = async (req, res) => {
    let id = req.params.id
    

    req.session.orderId = null
    req.session.video_purchase_id = null
    
    if (!id || isNaN(id) || !req.user) {
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let video = {}
    await videoModel.findById(id,req).then(result => {
        if(result){
            video = result
        }
    })
    if(!Object.keys(video).length || parseFloat(video.price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let isValid = true
    //check video aleady purchased
    await videoModel.checkVideoPurchased({id:video.video_id,owner_id:req.user.user_id},req).then(result => {
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
    data["amount"] = parseFloat(video.price).toFixed(2)
    data["returnUrl"] = `${process.env.PUBLIC_URL}/videos/successulPayment/`+video.video_id
    data["cancelUrl"] = `${process.env.PUBLIC_URL}/videos/cancelPayment/`+video.video_id
    data.title = req.i18n.t("Purchase Video: ")+video.title
    req.session.video_purchase_id = video.video_id 
    //delete all user pending orders
    await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'initial' AND source_type = 'video_purchase'",[req.user.user_id]).then(result => {
        
    })
    //create order
    await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:1,state:"initial",creation_date:currentDate,source_type:"video_purchase",source_id:video.video_id}, "orders").then(result => {
        if (result) {
            req.session.orderId = result.insertId
        } else {

        }
    })
    if (!req.session.orderId) {
        req.session.videoPaymentStatus = "fail"
        res.redirect("/watch/"+video.custom_url)
        res.end()
        return
    }
    data.sku = "video_purchase_"+req.session.orderId
    return oneTimePaypal.init(req, res, data).then(result => {
        if (result.url) {
            req.session.video_user_id = req.user.user_id
            req.session.videotokenUserPayment = result.token
            res.redirect(302, result.url)
            res.end() 
        } else {
            console.log( ' ======= Video Purchase ONETIME ERR Paypal============')
            req.session.videoPaymentStatus = "fail"
            res.redirect("/watch/"+video.custom_url)
            res.end()
        }
    }).catch(err => {
        console.log(err, ' ======= Video Purchase ONETIME ERR ============')
        res.redirect("/watch/"+video.custom_url)
        res.end()
    })
}

exports.successul = async (req, res, next) => {
    let id = req.params.id
    let currentCurrency = req.currentCurrency
    let changeRate = parseFloat(currentCurrency.currency_value)

    let gateway = req.body.gateway
    let stripeToken = req.body.stripeToken

    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    if((gateway == "2" && stripeToken) || gateway == "5"){
        let isValid = true
        //check video aleady purchased
        await videoModel.checkVideoPurchased({id:id,owner_id:req.user.user_id},req).then(result => {
            if(result){
                isValid = false
            }
        }).catch(err => {
        })
        if(!isValid){
            return res.send({ error: "Video already purchased" });
        }
        req.session.video_purchase_id = id
        //delete all user pending orders
        await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'initial' AND source_type = 'video_purchase'",[req.user.user_id]).then(result => {
            
        })
        //create order
        await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:2,state:"initial",creation_date:currentDate,source_type:"video_purchase",source_id:id}, "orders").then(result => {
            if (result) {
                req.session.video_user_id = req.user.user_id
                req.session.orderId = result.insertId
            } else {
    
            }
        })
    }

    if(id != req.session.video_purchase_id){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let video = {}
    await videoModel.findById(id,req).then(result => {
        if(result){
            video = result
        }
    })
    if(!req.user.user_id || !Object.keys(video).length || parseFloat(video.price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }

    let commission_amount = 0
    let commissionType = video.type == 10 || video.type == 11 ? parseFloat(req.appSettings["livestreaming_commission_type"]) :  parseFloat(req.appSettings['video_commission_type'])
    let commissionTypeValue = video.type == 10 || video.type == 11 ? parseFloat(req.appSettings["livestreaming_commission_value"]) : parseFloat(req.appSettings['video_commission_value'])
    //calculate admin commission
    if(commissionType == 2 && commissionTypeValue > 0){
        commission_amount = parseFloat((video.price * (commissionTypeValue/100)).toFixed(2));
    }else if(commissionType == 1 && commissionTypeValue > 0){
        commission_amount = commissionTypeValue;
    }
    if(commission_amount > parseFloat(parseFloat(video.price).toFixed(2))){
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
                        amount: parseFloat(video.price).toFixed(2)*100,
                        currency: req.appSettings['payment_default_currency'],
                        description: req.i18n.t("Purchase Video: ")+video.title,
                        customer: customer.id,
                        metadata: {
                            order_id: req.session.orderId,
                            video_id:video.video_id
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
        if(parseFloat(video.price) > parseFloat(req.user.wallet)){
            res.send({ error: req.i18n.t("You don't have enough balance to purchase, please recharge your wallet.") });
            return;
        }
        // update user wallet price
        const adsTransaction = require("../models/adsTransactions");
        adsTransaction.reduceOwnerWalletAmount(req,{owner_id:req.user.user_id,amount:parseFloat(video.price - commission_amount).toFixed(2)})

        // add amount to owner wallet
        await globalModel
        .custom(
            req,
            "UPDATE users SET `wallet` = wallet + ? WHERE user_id = ?",
            [parseFloat(video.price - commission_amount).toFixed(2), video.owner_id]
        ).then((result) => {});

        isValidResult = true;
        gatewayResponse.transaction_id = require('uniqid').process('wallet_payment')
        gatewayResponse.state = "completed"
    }


    if(gateway == "1" || !gateway){
        if (!req.user || !req.session.videotokenUserPayment || !req.session.video_user_id || !req.session.video_purchase_id || !req.session.orderId) {
            return res.redirect(302, "/watch/"+video.custom_url)
        } else {
            const PayerID = req.query.PayerID
            await oneTimePaypal.execute(req, res, PayerID, { price: parseFloat(video.price).toFixed(2) }).then(async executeResult => {
                if (executeResult) {
                    gatewayResponse.transaction_id = executeResult.transaction_id
                    gatewayResponse.state = executeResult.state.toLowerCase()      
                    isValidResult = true          
                } else {
                    req.session.adsPaymentStatus = "fail"
                    res.redirect("/watch/"+video.custom_url)
                    res.end()
                }
            }).catch(err => {
                req.session.adsPaymentStatus = "fail"
                res.redirect("/watch/"+video.custom_url)
                res.end()
            })
        }
    }

    if(isValidResult) {
        await globalModel.create(req, {type:"video_purchase",id:video.video_id, owner_id: req.session.video_user_id, package_id: 0, status: gatewayResponse.state.toLowerCase(),creation_date: currentDate, modified_date: currentDate, gateway_profile_id: gatewayResponse.transaction_id,order_id:req.session.orderId }, "subscriptions").then(async result => {
            const videoPurchaseModel = require("../models/videoPurchase")
            await videoPurchaseModel.insertTransaction(req, {gateway_id: (gateway ? gateway : 1) , order_id:req.session.orderId,admin_commission:commission_amount, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: video.owner_id ,sender_id:req.session.video_user_id, state: gatewayResponse.state.toLowerCase(), price: parseFloat(video.price).toFixed(2) - commission_amount,currency:currentCurrency.ID,change_rate:changeRate, default_currency: req.appSettings.payment_default_currency, creation_date: currentDate, modified_date: currentDate,id:video.video_id,type:"video_purchase" }).then(async result => {
                //update user balance
                await globalModel.custom(req,"UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",[(parseFloat(video.price) - parseFloat(commission_amount)).toFixed(2),video.owner_id]).then(result => {})

                //update order table
                req.session.video_user_id = null
                req.session.video_purchase_id = null
                req.session.videotokenUserPayment = null
                globalModel.update(req,{currency:currentCurrency.ID, gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state.toLowerCase(),'source_id':video.video_id},"orders","order_id",req.session.orderId)
                req.session.videoPaymentStatus = "success"

                //update points and send email and notification
                if(parseInt(video.type) == 10 || parseInt(video.type) == 11){
                    //buyer
                    notifications.insert(req, {owner_id:req.user.user_id,insert:true, type: "livestream_purchased", subject_type: "users", subject_id: req.user.user_id, object_type: "videos", object_id: video.video_id,forceInsert:true }).then(result => {

                    }).catch(err => {
                        console.log(err)
                    })

                    //owner
                    notifications.insert(req, {notChangeOwnerID:true,owner_id:video.owner_id,insert:true, type: "livestream_purchased_owner", subject_type: "users", subject_id: req.user.user_id, object_type: "videos", object_id: video.video_id,forceInsert:true }).then(result => {

                    }).catch(err => {
                        console.log(err)
                    })
                }else{
                    //buyer
                    notifications.insert(req, {owner_id:req.user.user_id,insert:true, type: "video_purchased", subject_type: "users", subject_id: req.user.user_id, object_type: "videos", object_id: video.video_id,forceInsert:true }).then(result => {

                    }).catch(err => {
                        console.log(err)
                    })
                    //owner
                    notifications.insert(req, {notChangeOwnerID:true,owner_id:video.owner_id,insert:true, type: "video_purchased_owner", subject_type: "users", subject_id: req.user.user_id, object_type: "videos", object_id: video.video_id,forceInsert:true }).then(result => {

                    }).catch(err => {
                        console.log(err)
                    })
                }




                if(!gateway){
                    res.redirect("/watch/"+video.custom_url)
                }else{
                    res.send({status:true})
                }
                res.end()                     
            })
        })
    }

}

exports.cancel = async (req, res, next) => {
    let id = req.params.id
    if(id != req.session.video_purchase_id){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let video = {}
    await videoModel.findById(id,req).then(result => {
        if(result){
            video = result
        }
    })
    if(!Object.keys(video).length || !parseFloat(video.price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if (!req.session.videotokenUserPayment) {
        res.redirect("/watch/"+video.custom_url)
        if (req.session.paypalData) {
            req.session.paypalData = null
        }
        res.end()
    }
    req.session.video_user_id = null
    req.session.video_purchase_id = null
    req.session.videotokenUserPayment = null
    if (req.session.paypalData) {
        req.session.paypalData = null
    }
    req.session.videoPaymentStatus = "cancel"
    return res.redirect(302, "/watch/"+video.custom_url)
}


exports.categories = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'browse_video_category_view')
    req.query.type = "video"
    let category = {}
    await categoryModel.findAll(req, {getCount:1, type: req.query.type,orderBy:" categories.item_count DESC " }).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})

    const limit = 12
    const data = { limit: limit, orderby: " view_count DESC" }

    await videoModel.getVideos(req, data).then(result => {
        if (result) {
            let items = result
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"categories"});
}
exports.category = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'video_category_view')
    req.query.id = req.params.id
    req.query.type = "video"
    let category = {}
    await categoryModel.findByCustomUrl({ id: req.query.id, type: req.query.type }, req, res).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})
    if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
        await categoryModel.findAll(req, { type: "video", subcategory_id: category.category_id, item_count: 1 }).then(result => {
            if (result) {
                req.query.subcategories = result
            }
        });
    } else if (category.subcategory_id > 0) {
        await categoryModel.findAll(req, { type: "video", subsubcategory_id: category.category_id, item_count: 1 }).then(result => {
            if (result) {
                req.query.subsubcategories = result
            }
        });
    }
    const limit = 21
    const data = { limit: limit }
    if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
        data['category_id'] = category.category_id
    } else if (category.subcategory_id > 0) {
        data['subcategory_id'] = category.category_id
    } else if (category.subsubcategory_id > 0) {
        data['subsubcategory_id'] = category.category_id
    }


    //get all blogs as per categories
    await videoModel.getVideos(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"category"});
}
exports.browse = async (req, res) => {
    const queryString = req.query 

    const limit = 21
    const data = { limit: limit }
    req.query.search = {}
    req.query.pageType = req.params.pageType
    data['pageType'] = req.query.pageType
    if(data.pageType == "trending"){
        await commonFunction.getGeneralInfo(req, res, 'treading_video_browse')
    }else if(data.pageType == "top"){
        await commonFunction.getGeneralInfo(req, res, 'top_video_browse')
    }else if(data.pageType == "latest"){
        await commonFunction.getGeneralInfo(req, res, 'latest_video_browse')
    }else if(req.isLiveStreaming){
        await commonFunction.getGeneralInfo(req, res, 'live_video_browse')
    }else{
        await commonFunction.getGeneralInfo(req, res, 'video_browse')
    }
    
    if(req.isLiveStreaming){
         data['liveStreamingPage'] = true
         req.query.liveStreamingPage = 1;
    }
   
    
    data['type'] = queryString.type
    if (queryString.q && !queryString.tag) {
        req.query.search.q = queryString.q
        data['title'] = queryString.q
    }
    if (queryString.tag) {
        req.query.search.tag = queryString.tag
        req.query.search.q = queryString.tag
        data['tags'] = queryString.tag
    }
    if (queryString.category_id) {
        data['category_id'] = queryString.category_id
        req.query.search.category_id = queryString.category_id
    }
    if (queryString.subcategory_id) {
        data['subcategory_id'] = queryString.subcategory_id
        queryString.category_id = queryString.subcategory_id
        req.query.search.subcategory_id = queryString.subcategory_id
    }
    if (queryString.subsubcategory_id) {
        data['subsubcategory_id'] = queryString.subsubcategory_id
        queryString.category_id = queryString.subsubcategory_id
        req.query.search.subsubcategory_id = queryString.subsubcategory_id
    }

    if (queryString.sort == "latest") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.video_id desc"
    } else if (queryString.sort == "favourite" && req.appSettings['video_favourite'] == 1) {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.favourite_count desc"
    } else if (queryString.sort == "view") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.view_count desc"
    } else if (queryString.sort == "like" && req.appSettings['video_like'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.like_count desc"
    } else if (queryString.sort == "dislike" && req.appSettings['video_dislike'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.dislike_count desc"
    } else if (queryString.sort == "rated" && req.appSettings['video_rating'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.rating desc"
    } else if (queryString.sort == "commented" && req.appSettings['video_comment'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "videos.comment_count desc"
    }

    if (queryString.type == "featured" && req.appSettings['video_featured'] == 1) {
        req.query.search.type = queryString.type
        data['is_featured'] = 1
    } else if (queryString.type == "sponsored" && req.appSettings['video_sponsored'] == 1) {
        req.query.search.type = queryString.type
        data['is_sponsored'] = 1
    } else if (queryString.type == "hot" && req.appSettings['video_hot'] == 1) {
        req.query.search.type = queryString.type
        data['is_hot'] = 1
    }

    //get all videos as per categories
    await videoModel.getVideos(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.videos = items
        }
    })
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
        req.query.categories = categories

    if(req.isLiveStreaming){
        return res.send({...req.query,page_type:"live"});
    }else
        return res.send({...req.query,page_type:"videos"});
}

exports.updateLiveStreamingSharePoints = async (req,id,video_id,type,appSetting) => {
    return new Promise(async (resolve,_) => {
        var formatted = dateTime.create().format('Y-m-d H:M:S');
        let insertPointsObject = {}
        insertPointsObject["owner_id"] = id
        insertPointsObject["type"] = type
        insertPointsObject["resource_type"] = "video"
        insertPointsObject["resource_id"] = video_id
        let pointValue = parseInt(req.appSettings[appSetting])
        if(pointValue == 0){
            resolve()
            return
        }
        insertPointsObject["credit"] = pointValue
        insertPointsObject["creation_date"] = formatted
        insertPointsObject["modified_date"] = formatted

        req.getConnection(function (err, connection) {
            if(err){
                resolve();
                return;
            }
            connection.query('INSERT INTO user_point_values SET ? ', [insertPointsObject], function (err, results, fields) {
                if(err){
                    resolve(false)
                }else{
                    //update user points
                    connection.query('UPDATE users SET points = points + '+pointValue + " WHERE user_id = ?", [id], function (err, results, fields) {
                        if(err){
                            resolve()
                        }else{
                            resolve()
                        }
                    })
                }
            })
        })
    })
}

exports.view = async (req, res) => {
    req.query.id = req.params.id

    if(req.query.id){
        let id = req.query.id
        let movieID = id.substring(0, 4);
        if(movieID == "mov1"){
            movieController.view(req,res);
            return
        }
    }

    await commonFunction.getGeneralInfo(req, res, 'video_view')
    req.query.tabType = (req.query.type ? req.query.type : null)
    let video = {}
    let id = req.query.list
    let playlist = {}
    if (id) {
        await playlistModel.findByCustomUrl(id, req).then(async result => {
            if (result) {
                playlist = result
                await userModel.findById(result.owner_id, req, res).then(result => {
                    playlist.owner = result
                }).catch(error => {

                })
            }
        }).catch(err => {
            return res.send({ ...req.query , pagenotfound: 1 });
        })
    }
    if ((id && !Object.keys(playlist).length) || (id && Object.keys(playlist).length && playlist.private == 1 && (!req.user || req.user.user_id != playlist.owner_id))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if (id) {
        //get playlist videos
        await videoModel.getVideos(req, { playlist_id: playlist.playlist_id }).then(result => {
            if (result && result.length > 0) {
                req.query.playlistVideos = result
                req.query.playlist = playlist
            } else {
                return res.send({ ...req.query , pagenotfound: 1 });
            }
        }).catch(error => {

        })
    }
    let videoObject = {}
    await videoModel.findByCustomUrl(req.params.id,req).then(result => {
        if (result) {
            videoObject = result
        } 
    }).catch(error => {
        
    })
   

    
    var userip;
    if (req.headers['x-real-ip']) {
        userip = req.headers['x-real-ip'].split(",")[0];
    } else if (req.socket && req.socket.remoteAddress) {
        userip = req.socket.remoteAddress;
    } else {
        userip = req.ip;
    }
    if(((!req.user && userip) || req.user) && req.query.ref){
        //update shared ref values of live streaming
        if(videoObject.is_livestreaming == 1){
            let sqlDomain = "SELECT sitename,content_id from referers where 1 = 1 AND content_id = ?"
            let condition = []
            condition.push(videoObject.video_id)
            let currentTime = dateTime.create().format("Y-m-d H:M:S")
            if(req.user){
                condition.push(req.user.user_id)
                condition.push(userip)
                condition.push(currentTime)
                sqlDomain += " AND ( owner_id = ? || ip = ? ) AND sitename = 'n/a' AND type = 'video' AND creation_date > ? - INTERVAL 24 HOUR "
            }else{
                condition.push(userip)
                condition.push(currentTime)
                sqlDomain += " AND ip = ? AND type = 'video' AND sitename = 'n/a' AND creation_date > ? - INTERVAL 24 HOUR "
            }
            sqlDomain += " limit 1 "

            await globalModel.custom(req,sqlDomain,condition).then(async result => {
                if(!result || result.length == 0){
                    //update points
                    if(!req.user  || (parseInt(videoObject.owner_id) != parseInt(req.user.user_id) && parseInt(videoObject.owner_id) != parseInt(req.query.ref) && parseInt(req.query.ref) != parseInt(req.user.user_id))){
                        //not video owner condition
                        if(parseInt(req.query.ref) == parseInt(videoObject.owner_id)){
                            //live streaming owner
                            await exports.updateLiveStreamingSharePoints(req,req.query.ref,videoObject.video_id,"share_video","livestreamer_owner_points_value").then(async result => {
                                let insertObject = {}
                                insertObject['owner_id'] = req.user ? req.user.user_id : 0
                                insertObject['sitename'] = "n/a"
                                insertObject['url'] = "n/a"
                                insertObject['type'] = "video"
                                insertObject['content_id'] = videoObject ? videoObject.video_id : 0
                                insertObject['ip'] = typeof req.headers != "undefined" && req.headers['x-real-ip'] ? req.headers['x-real-ip'] : (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "")
                                insertObject['creation_date'] =  new Date(dateTime.create().format("Y-m-d H:M:S"));
                                await globalModel.create(req,insertObject,'referers').then(res => {})
                            })
                        }else{
                            //shared by other user
                            await exports.updateLiveStreamingSharePoints(req,req.query.ref,videoObject.video_id,"share_video","livestreamer_user_points_value").then(async result => {
                                let insertObject = {}
                                insertObject['owner_id'] = req.user ? req.user.user_id : 0
                                insertObject['sitename'] = "n/a"
                                insertObject['url'] = "n/a"
                                insertObject['type'] = "video"
                                insertObject['content_id'] = videoObject ? videoObject.video_id : 0
                                insertObject['ip'] = typeof req.headers != "undefined" && req.headers['x-real-ip'] ? req.headers['x-real-ip'] : (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "")
                                insertObject['creation_date'] =  new Date(dateTime.create().format("Y-m-d H:M:S"));
                                await globalModel.create(req,insertObject,'referers').then(res => {})
                            })
                        }
                    }
                }
            })
            
        }
    }

    let showVideo = true
    req.isview = true;
    //set referer
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
            insertObject['url'] = referer
            insertObject['type'] = "video"
            insertObject['content_id'] = videoObject ? videoObject.video_id : 0
            insertObject['ip'] = typeof req.headers != "undefined" && req.headers['x-real-ip'] ? req.headers['x-real-ip'] : (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "")
            insertObject['creation_date'] =  new Date(dateTime.create().format("Y-m-d H:M:S"));
            await globalModel.create(req,insertObject,'referers').then(res => {})
        }
    }

    await videoModel.getVideos(req, { custom_url: req.query.id ? req.query.id : "notfound", videoview: true }).then(result => {
        if (result && result.length > 0) {
            video = result[0]
        } else {
            showVideo = false
        }
    }).catch(error => {
        showVideo = false
    })
    req.isview = false;
    if (Object.keys(video).length) {
        await privacyModel.check(req, video, 'video').then(result => {
            showVideo = result
        }).catch(error => {
            showVideo = false
        })
    }
    if (!showVideo) {
        return res.send({...req.query,permission_error:1});
    }
    if (!Object.keys(video).length || ((video.status != 1 || video.approve != 1) && (!req.user || (video.owner_id != req.user.user_id && req.levelPermissions['video.view'] != 2)))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let videoImage = video.image;
    if(req.query.livestreamingtype == 0 && video.mediaserver_stream_id &&  !video.orgImage && video.is_livestreaming == 1 && parseInt(req.appSettings['antserver_media_hlssupported']) == 1){
        if(req.query.liveStreamingCDNServerURL){
            videoImage = `${req.query.liveStreamingCDNServerURL}/${video.antmedia_app}/previews/${video.mediaserver_stream_id}.png`
        }else
            videoImage = `${req.query.liveStreamingServerURL}:5443/${video.antmedia_app}/previews/${video.mediaserver_stream_id}.png`
    }else  if(video.mediaserver_stream_id &&  video.image && video.image.indexOf('LiveApp/previews') > -1 && video.image.indexOf('WebRTCAppEE/previews') > -1){
        if(req.query.liveStreamingCDNURL){
            videoImage = `${req.query.liveStreamingCDNURL}${video.image.replace("/LiveApp",'').replace("/WebRTCAppEE",'')}`
        }else
            videoImage = `${req.query.liveStreamingServerURL}:5443${video.image}`
    } 
    await commonFunction.updateMetaData(req,{title:video.title,description:video.description,image:videoImage,keywords:video.tags})
    if(req.appSettings["video_sell"]){
        await privacyLevelModel.findBykey(req,"video",'sell_videos',video.level_id).then(result => {
            if(result == 1)
                video.sell_videos = true
        })
    }
    await privacyLevelModel.findBykey(req,"video",'donation',video.level_id).then(result => {
        if(result == 1)
            video.donation = result
    })
    
    await privacyModel.permission(req, 'video', 'delete', video).then(result => {
        video.canDelete = result
    }).catch(err => {

    })
    await privacyModel.permission(req, 'video', 'edit', video).then(result => {
        video.canEdit = result
    }).catch(err => {

    })
    //video user details
    await userModel.findById(video.owner_id, req, res).then(result => {
        video.owner = result
    }).catch(error => {

    })

    

     
    let settings = await settingModel.settingData(req);
    if(parseInt(settings['live_stream_start']) == 1 && (parseInt(video.is_livestreaming) == 1 || video.scheduled)){
        if(settings['live_streaming_type'] == 1)
            req.query.agora_app_id = settings["agora_app_id"];
        //get time diff
        let currentTime = new Date(dateTime.create().format("Y-m-d H:M:S")).getTime();
        let videoTime = new Date(dateTime.create(video.creation_date).format("Y-m-d H:M:S")).getTime();
        const diff = currentTime - videoTime;
        req.query.currentTime =  Math.floor(diff / 1000);
        let condition = []
        //get chat messages for live streaming
        let sql = 'SELECT displayname,username,livestreaming_chats.params,livestreaming_chats.owner_id as user_id, livestreaming_chats.chat_id,livestreaming_chats.message,livestreaming_chats.creation_date,IF(userdetails.avtar IS NULL OR userdetails.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = "male" THEN "default_mainphoto" WHEN userdetails.gender = "female" THEN "default_femalemainphoto" END AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image from livestreaming_chats inner join users on users.user_id = livestreaming_chats.owner_id inner join userdetails ON userdetails.user_id = livestreaming_chats.owner_id WHERE  '
        // if(settings['live_streaming_type'] == 1 || !video.mediaserver_stream_id){
        //     condition.push(video.channel_name)
        //     sql += "livestreaming_chats.channel = ? ORDER BY chat_id ASC LIMIT 100";
        // }else{
        //     condition.push(video.custom_url)
        //     sql += "livestreaming_chats.id = ? ORDER BY chat_id ASC LIMIT 100";
        // }
        condition.push(video.custom_url)
        sql += "livestreaming_chats.id = ? ORDER BY chat_id ASC LIMIT 100";
        await globalModel.custom(req,sql,condition).then(result => {
            if(result){
                const chats = JSON.parse(JSON.stringify(result));
                video.chatcomments = chats
            }
        });

        if(req.user && (req.user.user_id == video.owner_id || req.user.level_id == 1) ){
            req.query.banEnable = 1;
            //get ban users
            let condition = [video.custom_url]
            let sql = 'SELECT chat_id,displayname,username,chat_ban_users.user_id, IF(userdetails.avtar IS NULL OR userdetails.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = "male" THEN "default_mainphoto" WHEN userdetails.gender = "female" THEN "default_femalemainphoto" END AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image from chat_ban_users inner join users on users.user_id = chat_ban_users.user_id inner join userdetails ON userdetails.user_id = chat_ban_users.user_id WHERE  chat_id = ?'
            await globalModel.custom(req,sql,condition).then(result => {
                if(result){
                    const banusers = JSON.parse(JSON.stringify(result));
                    video.banusers = banusers
                }
            });
        }

    }

    
    //fetch user ads
    if(video.approve == 1){
        if((video.type == 3 || video.type == 11) && parseFloat(video.price) <= 0){
            let ads_cost_perclick = req.query.appSettings['ads_cost_perclick']
            let ads_cost_perview = req.query.appSettings['ads_cost_perview']
            let sql = "SELECT advertisements_user.* from advertisements_user LEFT JOIN users ON users.user_id = advertisements_user.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE users.active = 1 AND users.approve = 1 AND advertisements_user.approve = 1 AND advertisements_user.status = 1 AND advertisements_user.completed = 1 "
            sql += " AND ( CASE WHEN advertisements_user.type = 1 AND CAST(users.wallet AS DECIMAL(10,2)) >= "+ ads_cost_perclick + " THEN true "
            sql += " WHEN advertisements_user.type = 2 AND CAST(users.wallet AS DECIMAL(10,2)) >= "+ ads_cost_perview + " THEN true "
            sql += " ELSE false  END ) AND ( category_id = 0 OR category_id = ? ) AND ( subcategory_id = 0 OR subcategory_id = ? ) AND ( subsubcategory_id = 0 OR subsubcategory_id = ? )"
            if(video.adult == 1){
                sql += " AND ( advertisements_user.adult IS NULL OR  advertisements_user.adult = 1) "
            }else if(video.adult == 0){
                sql += " AND ( advertisements_user.adult IS NULL OR  advertisements_user.adult = 0) "
            }

            sql += " ORDER BY RAND() DESC LIMIT 1 "
            await globalModel.custom(req,sql,[video.category_id,video.subcategory_id,video.subsubcategory_id]).then(result => {
                if(result){
                    const adsResults = JSON.parse(JSON.stringify(result));
                    if(adsResults && adsResults.length){
                        req.query.userAdVideo = adsResults[0]
                        const adsTransaction = require("../models/adsTransactions");
                        const ads = adsResults[0]
                        if(ads.type == 2){
                            adsTransaction.adSpent(req,{owner_id:ads.owner_id,ad_id:ads.ad_id,amount:req.query.appSettings['ads_cost_perview'],type:"view",creation_date:dateTime.create().format("Y-m-d H:M:S")})
                            //reduce ad owner wallet amount
                            adsTransaction.reduceOwnerWalletAmount(req,{owner_id:ads.owner_id,amount:req.query.appSettings['ads_cost_perview']})
                        }
                    }
                }
            })
            if(!req.query.userAdVideo){
                //fetch admin ads
                let sql = "SELECT * from advertisements_admin WHERE advertisements_admin.active = 1 "

                sql += " AND ( category_id = 0 OR category_id = ? ) AND ( subcategory_id = 0 OR subcategory_id = ? ) AND ( subsubcategory_id = 0 OR subsubcategory_id = ? ) "

                if(video.adult == 1){
                    sql += " AND ( adult IS NULL OR adult = 1) "
                }else if(video.adult == 2){
                    sql += " AND ( adult IS NULL OR adult = 0) "
                }
                sql += " ORDER BY RAND() DESC LIMIT 1 "
                
                await globalModel.custom(req,sql,[video.category_id,video.subcategory_id,video.subsubcategory_id]).then(result => {
                    if(result){
                        const adsResults = JSON.parse(JSON.stringify(result));
                        if(adsResults && adsResults.length){
                            req.query.adminAdVideo = adsResults[0]
                            globalModel.custom(req,"UPDATE advertisements_admin SET view_count = view_count + 1 WHERE ad_id = ?",[adsResults[0].ad_id]).then(result => {

                            })
                        }
                    }
                })
            }
        }else if((video.type == 10 || video.type == 11) && (parseFloat(video.price) > 0 && video.sell_videos) && req.user && !video.canEdit){
            //check video purchased 
            if(req.user){
                await videoModel.checkVideoPurchased({id:video.video_id,owner_id:req.user.user_id},req).then(result => {
                    if(result){
                        video.videoPurchased = true
                    }
                }).catch(err => {
                })
            }
        }else if((video.type == 3 || video.type == 11) && (parseFloat(video.price) > 0 && video.sell_videos) && req.user && !video.canEdit){
            //check video purchased
            if(req.user){
                await videoModel.checkVideoPurchased({id:video.video_id,owner_id:req.user.user_id},req).then(result => {
                    if(result){
                        video.videoPurchased = true
                    }
                }).catch(err => {
                })
            }
        }
    }
    if(video.canEdit){
        video.videoPurchased = true
    }

    //owner plans
    await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',video.owner.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1 && !video.videoPurchased){
        let isPermissionAllowed = false
        if(req.user && (req.user.user_id == video.owner_id || (req.levelPermissions["videos.view"] && req.levelPermissions["videos.view"].toString() == "2"))){
            isPermissionAllowed = true;
        }
        if(video.view_privacy.indexOf("package_") > -1 && !isPermissionAllowed){
            let owner_id = req.user ? req.user.user_id : 0
            let checkPlanSql = ""
            let conditionPlanSql = [owner_id,video.video_id]
            checkPlanSql += 'SELECT `member_plans`.price as `package_price`,`subscriptions`.package_id as loggedin_package_id,mp.price as loggedin_price,'
            checkPlanSql+=  ' CASE WHEN member_plans.price IS NULL THEN 1 WHEN mp.price IS NULL THEN 0 WHEN  `member_plans`.price <= mp.price THEN 1'
            checkPlanSql += ' WHEN `member_plans`.price <= mp.price AND (videos.category_id = 0 || mp.video_categories IS NULL || videos.category_id IN (mp.video_categories) ) THEN 1'
            checkPlanSql+=  ' WHEN  `member_plans`.price > mp.price THEN 2'
            checkPlanSql += ' ELSE 0 END as is_active_package'
            checkPlanSql += ' FROM `videos` LEFT JOIN `member_plans` ON `member_plans`.member_plan_id = REPLACE(`videos`.view_privacy,"package_","") LEFT JOIN'
            checkPlanSql += ' `subscriptions` ON subscriptions.id = videos.owner_id AND subscriptions.owner_id = ? AND subscriptions.type = "user_subscribe" AND subscriptions.status IN ("active","completed") LEFT JOIN `member_plans` as mp ON mp.member_plan_id = `subscriptions`.package_id WHERE '
            checkPlanSql += ' videos.video_id = ? LIMIT 1'
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
        await userModel.getPlans(req, { owner_id: video.owner.user_id, item:req.query.needSubscription }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }else{
        if(req.query.tabType == "plans"){
            req.query.tabType = "about"
        }else if(!req.query.tabType){
            req.query.tabType = "about"
        }
    }
    if (req.session.adsPaymentStatus) {
        req.query.adsPaymentStatus = req.session.adsPaymentStatus
        req.session.adsPaymentStatus = null
    }
    //fetch artists
    if (video.artists && video.artist != "" && req.appSettings['video_artists'] == "1") {
        await artistModel.findByIds(video.artists, req, res).then(result => {
            if (result)
                video.artists = result
        }).catch(error => {

        })
    }
    
    if(req.session.videoPaymentStatus){
        video.videoPaymentStatus = true
        req.session.videoPaymentStatus = null
    }
    //fetch artists
    let LimitNumArtist = 17;
    let pageArtist = 1
    let offsetArtist = (pageArtist - 1) * LimitNumArtist
    if (video.artists && video.artist != "" && req.appSettings['video_artists'] == "1") {
        await artistModel.findByIds(video.artists, req, res, LimitNumArtist, offsetArtist).then(result => {
            let pagging = false
            if (result) {
                pagging = false
                if (result.length > LimitNumArtist - 1) {
                    result = result.splice(0, LimitNumArtist - 1);
                    pagging = true
                }
                video.artists = {
                    'pagging': pagging,
                    results: result
                }
            }
        }).catch(error => {
            console.log(error)
        })
    } else {
        video.artists = {
            'pagging': false,
            results: []
        }
    }

    
    video.watermark  = req.appSettings['video_watermark']
   
    //category details
    if (video.category_id) {
        await categoryModel.findById(video.category_id, req, res).then(result => {
            if (result) {
                video.category = result
            }
        }).catch(err => {

        })
        if (video.subcategory_id) {
            await categoryModel.findById(video.subcategory_id, req, res).then(result => {
                if (result) {
                    video.subcategory = result
                }
            }).catch(err => {

            })
            if (video.subsubcategory_id) {
                await categoryModel.findById(video.subsubcategory_id, req, res).then(result => {
                    if (result) {
                        video.subsubcategory = result
                    }
                }).catch(err => {

                })
            }
        }
    }

     //tip data if enabled
     if(parseInt(req.appSettings['video_tip']) == 1 && video.approve == 1){
        //get tip data
        await videoModel.getTips(req,{resource_id:video.video_id,resource_type:"video",view:true}).then(result => {
            if(result && result.length > 0)
                video.tips = result
        })

        let LimitNum = 21;
        let page = 1
        let offsetDonor = (page - 1) * LimitNum

        //get donors
        await videoModel.donors({video_id:video.video_id, limit: LimitNum, offset:offsetDonor}, req).then(result => {
            let pagging = false
            if (result) {
                pagging = false
                if (result.length > LimitNum - 1) {
                    result = result.splice(0, LimitNum - 1);
                    pagging = true
                }
                video.donors = {
                    'pagging': pagging,
                    results: result
                }
            }
        }).catch(error => {

        })
    }
    
    let videoOwnerAllowGifts = 0
    // gifts data
    await privacyLevelModel.findBykey(req,"gifts",'allow',video.level_id).then(result => {
        if(result){
            videoOwnerAllowGifts = parseInt(result)
        }
    })
    if(parseInt(req.appSettings['enable_gifts']) == 1 && video.approve == 1 && videoOwnerAllowGifts == 1){
        await videoModel.getGifts(req,{view:true}).then(result => {
            if(result && result.length > 0)
                video.gifts = result
        })
        // gifts sender
        let LimitNum = 21;
        let page = 1
        let offsetDonor = (page - 1) * LimitNum

        //get donors
        await videoModel.giftsenders({video_id:video.video_id, limit: LimitNum, offset:offsetDonor}, req).then(result => {
            let pagging = false
            if (result) {
                pagging = false
                if (result.length > LimitNum - 1) {
                    result = result.splice(0, LimitNum - 1);
                    pagging = true
                }
                video.giftSenders = {
                    'pagging': pagging,
                    results: result
                }
            }
        }).catch(error => {

        })
    }

    if(req.levelPermissions && req.levelPermissions['video.download'] == 1 && (video.type == 3 || video.mediaserver_stream_id) && video.is_livestreaming == 0){
        var file = []

        
        if(video.type == 3 && !video.mediaserver_stream_id){
            let location = video.video_location
            let splitName = location.split('/')
            let fullName = splitName[splitName.length - 1]
            let videoName = fullName.split('_')[0]
            let path = "/upload/videos/video/"
            if(video['4096p'] == 1){
                file.push({key:"4096p", "url" : path + videoName + "_4096p.mp4" })
            }
            if(video['2048p'] == 1){
                file.push({key:"2048p", "url" : path + videoName + "_2048p.mp4" })
            }
            if(video['1080p'] == 1){
                file.push({key:"1080p","url" : path + videoName + "_1080p.mp4" })
            }
            if(video['720p'] == 1){
                file.push({key:"720p", "url" : path + videoName + "_720p.mp4" })
            }
            if(video['480p'] == 1){
                file.push({key:"480p", "url" : path + videoName + "_480p.mp4" })
            }
            if(video['360p'] == 1){
                file.push({key:"360p", "url" : path + videoName + "_360p.mp4" })
            }
            if(video['240p'] == 1){
                file.push({key:"240p", "url" : path + videoName + "_240p.mp4" })
            }
            
        }else if(video.code && video.mediaserver_stream_id && req.query.liveStreamingServerURL){
            let videos = video.code.split(',')
            let videoPath = req.query.liveStreamingServerURL+`:5443/${video.antmedia_app}/streams/`
            if(req.query['liveStreamingCDNURL']){
                videoPath = req.query['liveStreamingCDNURL']+"/streams/"
            }
            if(videos.length > 1){
                if(video['4096p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('_4096p') > -1;
                    });
                    file.push({key:"4096p", "url" : videoPath + url })
                }
                if(video['2048p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('_2048p') > -1;
                    });
                    file.push({ key:"2048p", url : videoPath + url })
                }
                if(video['1080p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('1080p') > -1;
                    });
                    file.push({key:"1080p", "url" : videoPath + url })
                }
                if(video['720p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('720p') > -1;
                    });
                    file.push({key:"720p", "url" : videoPath + url })
                }
                if(video['480p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('480p') > -1;
                    });
                    file.push({key:"480p", "url" : videoPath + url })
                }
                if(video['360p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('360p') > -1;
                    });
                    file.push({key:"360p", "url" : videoPath + url })
                }
                if(video['240p'] == 1){
                    let url = videos.filter(function(item) {
                        return item.indexOf('240p') > -1;
                    });
                    file.push({key:"240p", "url" : videoPath + url })
                }
            }else{
                if(req.query['liveStreamingCDNURL']){
                    file.push({key:"240p", "url" : req.query['liveStreamingCDNURL']+"/streams/"+video.code })
                }else
                    file.push({key:"240p", "url" : req.query['liveStreamingServerURL']+`:5443/${video.antmedia_app}/streams/`+video.code })
            }
        }
        if(Object.keys(file).length > 0)
        video.downloadFiles = file   
    }

    
    let isBranding = false;
    await privacyLevelModel.findBykey(req,"livestreaming",'branding_livestreaming',video.level_id).then(result => {
        if(result){
            isBranding = result
        }
    })
    if(video.is_livestreaming == 1 && req.query["livestreamingtype"] == 0 && isBranding == 1){
        //brands and banners
        await globalModel.custom(req,"SELECT * FROM live_banners WHERE user_id = ? AND `show` = 1",[video.owner_id]).then(result => {
            if(result){
                req.query.banners = JSON.parse(JSON.stringify(result));
            }
        })
        await globalModel.custom(req,"SELECT * FROM live_brands WHERE user_id = ?",[video.owner_id]).then(result => {
            if(result){
                req.query.brands = JSON.parse(JSON.stringify(result))[0];
            }
        })
    }

    if (!req.query.password && (req.appSettings['video_adult'] != 1 ||  (video.adult == 0 || (video.adult == 1 && req.query.adultAllowed)))) {
        req.query.video = video
        delete req.query.video.password
        if(video.approve == 1){
            recentlyViewed.insert(req, { id: video.video_id, owner_id: video.owner_id, type: 'videos', creation_date: dateTime.create().format("Y-m-d H:M:S") }).catch(err => {

            })
            // pay per view commission to video owner
    if(req.user && video.owner.user_id != req.user.user_id){
        var odt = dateTime.create();
        odt.offsetInDays(-1);
        let isValid = true;
        // select if payperview amount is transferred
        await globalModel.custom(req,"SELECT * FROM transactions WHERE owner_id = ? AND `id` = ? AND `sender_id` = ? AND `creation_date` > ? LIMIT 1",[video.owner_id,video.video_id,req.user.user_id,odt.format("Y-m-d H:M:S")]).then(result => {
            if(result && result.length > 0){
                isValid = false;
            }
        })
        if(isValid){
            await privacyLevelModel.findBykey(req,"video",'payperview',video.owner.level_id).then(async result => {
                if(parseFloat(result) > 0){
                    let uploadedvideoOnly = true;

                    await privacyLevelModel.findBykey(req,"video",'uploadedvideo',video.owner.level_id).then(async result => {
                        if(result){
                            uploadedvideoOnly = parseInt(result) == 1 ? true : false;
                        }
                    });

                    if(!uploadedvideoOnly || parseInt(video.type) == 3){
                        var dt = dateTime.create();
                        var formatted = dt.format("Y-m-d H:M:S");
                        let amountcommission = parseFloat(result).toFixed(2);
                        await globalModel
                        .custom(
                        req,
                        "UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",
                            [amountcommission, video.owner.user_id]
                        ).then((result) => {});
                        // update in transaction
                        let insertObject = {};
                        insertObject["gateway_id"] = "1";
                        insertObject["gateway_transaction_id"] = "";
                        insertObject["owner_id"] = video.owner.user_id;
                        insertObject["state"] = "completed";
                        insertObject["type"] = "video_pay_per_view";
                        insertObject["id"] = video.video_id;
                        insertObject["price"] = amountcommission;
                        insertObject["admin_commission"] = 0;
                        insertObject["sender_id"] = req.user.user_id;
                        insertObject["gateway_transaction_id"] = dt.getTime();
                        insertObject["currency"] = req.appSettings["payment_default_currency"]
                        insertObject["default_currency"] = req.appSettings["payment_default_currency"]
                        insertObject["change_rate"] = 1
                        insertObject["creation_date"] = formatted;
                        insertObject["modified_date"] = formatted;
                        
                        await globalModel
                            .create(req, insertObject, "transactions")
                            .then((result) => {});
                    }
                }
            })
        }
    }
        }
    }else{
        req.query.adultVideo = video.adult
    }
    //related videos category || tags
    await videoModel.getVideos(req, { orderby:" view_count desc ",category_id: video.category_id, tags: video.tags, not_video_id: video.video_id, 'related': true, limit: 10,not_in_ids:req.query.playedVideos }).then(result => {
        if (result) {
            req.query.relatedVideos = result
        }
    }).catch(err => {

    })
 
    if(!req.query.relatedVideos || req.query.relatedVideos.length < 10){
        await videoModel.getVideos(req, { orderby:" view_count desc ",not_in_ids:req.query.playedVideos , not_videos_id: req.query.relatedVideos, limit: 10 - (req.query.relatedVideos && req.query.relatedVideos.length ? req.query.relatedVideos.length : 0),not_video_id: video.video_id, }).then(result => {
            if (result) {
                if(req.query.relatedVideos && req.query.relatedVideos.length){
                    req.query.relatedVideos = req.query.relatedVideos.concat(result)
                }else{
                    req.query.relatedVideos = result
                }
                
            }
        }).catch(err => {
    
        })
    }

    
    if(req.embed){
        return res.send({...req.query,page_type:"embed"});
    }else{
        return res.send({...req.query,page_type:"watch"});
    }
}
exports.adClicked = async(req,res) => {
    let id = req.params.id
    let type = req.params.type
    let video_id = req.params.video_id
    let valid = false
    if(type == "admin"){
        await globalModel.custom(req,"SELECT * FROM advertisements_admin WHERE ad_id = ?",[id]).then(result => {
            if(result){
                const adsResults = JSON.parse(JSON.stringify(result));
                if(adsResults && adsResults.length){
                    let ad = adsResults[0]
                    globalModel.custom(req,"UPDATE advertisements_admin SET click_count = click_count + 1 WHERE ad_id = ?",[id]).then(result => {
                    
                    })
                    valid = true
                    let adUrl = ad.click_link.indexOf("http://") == -1 || ad.click_link.indexOf("https://") == -1 ? "http://"+ad.click_link : ad.click_link
                    return res.redirect(decodeURI(adUrl));
                }
            } 
        })
    }else if(type == "user"){
        let ads_cost_perclick = req.appSettings['ads_cost_perclick']
        let ads_cost_perview = req.appSettings['ads_cost_perview']
        let whereD = " ( CASE WHEN advertisements_user.type = 1 AND users.wallet >= "+ ads_cost_perclick + " THEN true "
        whereD += " WHEN advertisements_user.type = 2 AND users.wallet >= "+ ads_cost_perview + " THEN true "
        whereD += " ELSE false  END ) ";

        await globalModel.custom(req,"SELECT advertisements_user.*,users.level_id FROM advertisements_user LEFT JOIN users ON users.user_id = advertisements_user.owner_id WHERE users.user_id IS NOT NULL AND users.active = 1 AND users.approve = 1 AND ad_id = ? AND "+whereD,[id]).then(async result => {
            if(result){
                const adsResults = JSON.parse(JSON.stringify(result));
                if(adsResults && adsResults.length){
                    const adsTransaction = require("../models/adsTransactions");
                    let ads = adsResults[0]
                    
                    let videoObject = {}
                    await videoModel.getVideos(req,{video_id:video_id}).then(result => {
                        if (result && result.length > 0) {
                            videoObject = result[0]
                        } 
                    }).catch(error => {
                        
                    })
                    
                    if(Object.keys(videoObject).length > 0){
                        privacyLevelModel.findBykey(req,"member",'monetization',videoObject.level_id).then(result => {
                            if(req.user && videoObject.owner_id != req.user.user_id  && result){
                                if(result == 1 && req.appSettings['ads_cost_publisher'] > 0){
                                    //set monetization balance to video owner account
                                    const videoMonetization = require("../models/videoMonetizations")
                                    videoMonetization.earning(req,{owner_id:videoObject.owner_id,ad_id:ads.ad_id,resource_id:req.user.user_id,amount:req.appSettings['ads_cost_publisher'],creation_date:dateTime.create().format("Y-m-d H:M:S")})
                                }
                            }
                        })
                    }

                    if(ads.type == 1){
                        //reduce ad owner wallet amount
                        adsTransaction.reduceOwnerWalletAmount(req,{owner_id:ads.owner_id,amount:req.appSettings['ads_cost_perview']})
                    }
                    adsTransaction.adSpent(req,{owner_id:ads.owner_id,ad_id:ads.ad_id,amount:req.appSettings['ads_cost_perview'],type:"click",creation_date:dateTime.create().format("Y-m-d H:M:S")})
                    valid = true
                    let adUrl = ads.url.indexOf("http://") == 0 || ads.url.indexOf("https://") == 0 ? "http://"+ads.url : ads.url
                    return res.redirect(decodeURI(adUrl));
                }
            }
        })
    }
    if(!valid){
        res.redirect(process.env.PUBLIC_URL);
    }
}
exports.create = async (req, res) => {
    let isValid = true
    let videoPageType = "video_create"
    const id = req.params.id
    if (id) {
        videoPageType = "video_edit"
        await videoModel.findByCustomUrl(id, req, res, true).then(async video => { 
            if(video){
                if(video.scheduled){
                    let date = moment(video.scheduled)
                    video.scheduled = date.tz(process.env.TZ).toDate();
                }
                req.query.editItem = video
                
                await privacyModel.permission(req, 'video', 'edit', video).then(result => {
                    isValid = result
                }).catch(err => {
                    isValid = false
                })
            }else{
                isValid = false
            }
        }).catch(err => {
            isValid = false
        })
    }
    await commonFunction.getGeneralInfo(req, res, videoPageType)
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if(!req.user){
        return res.send({...req.query,page_type:"login"});
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
        req.query.videoCategories = categories


    //tip data if enabled
    if(parseInt(req.appSettings['video_tip']) == 1 && req.query.editItem){
        //get tip data
        await videoModel.getTips(req,{resource_id:req.query.editItem.video_id,resource_type:"video",view:true}).then(result => {
            if(result && result.length > 0)
                req.query.editItem.tips = result
        })
    }

    //check package enable
    if(req.appSettings["video_sell"]){
        await privacyLevelModel.findBykey(req,"video",'sell_videos',req.user.level_id).then(result => {
            if(result == 1)
                req.query.sell_videos = result
        })
    }
    
    
    //get artists
    if (settingModel.getSetting(req, "video_artists", 1) != 0) {
        await artistModel.findAll(req, { type: "video" }).then(artist => {
            if (artist)
                req.query.videoArtists = artist;
        })
    }
    // if(req.appSettings['livestreamingtype'] && req.appSettings['livestreamingtype'] == 0 && (typeof req.appSettings['antserver_media_token'] == "undefined" || req.appSettings['antserver_media_token'] == 1)){
    //     let maximum = 15000
    //     let minimum = 12987
    //     let date = new Date()
    //     let time = date.getTime()
    //     let number = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    //     let streamingId = "" + number + time
    //     if(req.appSettings['antserver_media_singlekey'] == 1){
    //         streamingId = md5(""+req.user.user_id+process.env.SECRETKEY)
    //     }
    //     await exports.createKey(req,streamingId).then(response => {
    //         req.query.tokenStream = response.token
    //     }).catch(err => {
    //         console.log(err)
    //     });
    //     req.query.streamingId = streamingId
    // }else if(req.appSettings['antserver_media_singlekey'] == 1){
    //     req.query.streamingId = md5(""+req.user.user_id+process.env.SECRETKEY);

    // }
    
    return res.send({...req.query,page_type:"create-video"});
}

exports.createKey = (req,streamingId) => {
    return new Promise(async (resolve,reject) => {
        const https = require('https');
        const agent = new https.Agent({  
            rejectUnauthorized: false
        });
        let reqData = {listenerHookURL:process.env.PUBLIC_URL+"/api/live-streaming/status","streamId":streamingId,"type": "liveStream","name": req.user.user_id+" - "+req.user.displayname+" live streaming",rtmpURL:"rtmp://"+(req.appSettings['antserver_media_url'].replace("https://","").replace("http://",""))+`/${req.appSettings['antserver_media_app']}`}
        var config = {
            method: 'post',
            url: req.appSettings["antserver_media_url"].replace("https://","http://")+`:5080/${req.appSettings['antserver_media_app']}/rest/v2/broadcasts/create`,
            headers: { 
                'Content-Type': 'application/json;charset=utf-8'
            },
            data : JSON.stringify(reqData),
            //httpsAgent: agent
        };
        axios(config)
        .then(function (response) {
        if(response.data.status == "created"){
            var myDate = new Date();
            myDate.setHours(myDate.getHours()+24);
            var config = {
                method: 'get',
                url: req.appSettings["antserver_media_url"].replace("https://","http://")+`:5080/${req.appSettings['antserver_media_app']}/rest/v2/broadcasts/`+streamingId+"/token?expireDate="+(myDate.getTime() / 1000).toFixed(0)+"&type=publish",
                headers: { 
                    'Content-Type': 'application/json;charset=utf-8'
                },
                //httpsAgent: agent
            };
            axios(config)
            .then(function (response) {
                if(response.data.tokenId){
                    resolve({ token:response.data.tokenId });
                }else{
                    reject(response.error)
                }
            })
        }else{
            console.log(response.data);
            reject(false);
        }        
        })
        .catch(function (error) {
            console.log(error)
            reject(error);
        });
    });
}