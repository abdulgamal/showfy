require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const pageModel = require("../models/pages");
const menus = require("../models/menus")
const packagesModel = require("../models/packages")
const subscriptionModel = require("../models/subscriptions")
const languages = require("../models/languages")
const designModel = require("../models/designs")
const avtarsModel = require("../models/avtars")
const videoCategoryModel = require("../models/categories")
const channelModel = require("../models/channels")
const settingModel = require("../models/settings")
const aws = require("aws-sdk")
const fs = require("fs")
const striptags = require("striptags")
const sizeOf = require('image-size');
const http = require('http');
const https = require('https');
const request = require("request");
const axios = require("axios")
const download = require('image-downloader');
const globalModel = require('../models/globalModel');
const s3Upload = require('../functions/upload').uploadtoS3

exports.qpayValidateIPN = (req,tokenData,data = {}) => {
    return new Promise((resolve,reject) => {
        var request = require('request');
        var options = {
            'method': 'GET',
            'url': 'https://merchant.qpay.mn/v2/payment/'+data.qpay_payment_id,
            'headers': {
                'Authorization': 'Bearer '+tokenData.access_token
            }
        };
        request(options, function (error, response) {
            if (error) {
                resolve({error:error});
                return;
            };
            resolve(JSON.parse(response.body))
        });
    })
}
exports.createInvoiceSimple = (req,tokenData, data = {}) => {
    return new Promise ((resolve, _reject) => {
        var options = {
            'method': 'POST',
            'url': 'https://merchant.qpay.mn/v2/invoice',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+tokenData.access_token
            },
            body: JSON.stringify({
                "invoice_code": req.appSettings["payment_qpay_invoice"],
                "sender_invoice_no": `${data.order_id}`,
                "invoice_receiver_code": "terminal",
                "invoice_description": req.i18n.t("Wallet Recharge"),
                "sender_branch_code": req.appSettings["payment_qpay_branch_code"],
                "amount": data.price,
                "callback_url": process.env.PUBLIC_URL+"/qpayPayment/payments?order_id="+data.order_id
            })
        };
        request(options, function (error, response) {
            if (error) {
                resolve({error:error});
                return;
            }
        
            resolve(JSON.parse(response.body))
        });
    });
}

exports.qpayRefreshTOken = (req) => {
    const settings = require("../models/settings")
    return new Promise ((resolve, _reject) => {
        var username = req.appSettings['payment_qpay_username']
        var password = req.appSettings['payment_qpay_password']
        let tokenExpired = true;
        let refreshToken = false;
        let parseRefreshData = {}
        // get settings
        const refreshData = settings.getSetting(req,"qPayTokenData",null);

        if(refreshData){
            parseRefreshData = JSON.parse(refreshData);
            if(parseRefreshData && parseRefreshData.expires_in && parseRefreshData.expires_in > new Date()/1000){
                tokenExpired = false;
                resolve(parseRefreshData)
                return;
            }else if(!parseRefreshData.expires_in){
                tokenExpired = true;
            }else{
                refreshToken = true;
            }
        }
        if(tokenExpired && !refreshToken){
            var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
            var request = require('request');
            var options = {
                'method': 'POST',
                'url': 'https://merchant.qpay.mn/v2/auth/token',
                'headers': {
                    'Authorization': auth,
                }
            };
            request(options, function (error, response) {
                if (error) {
                    resolve({error:error});
                    return;
                }
                
                settings.setSettings(req, {
                    qPayTokenData:response.body
                })
                // set setting for token/refresh token
                resolve(JSON.parse(response.body))
            });
        }else{
            var request = require('request');
            var options = {
            'method': 'POST',
            'url': 'https://merchant.qpay.mn/v2/auth/refresh',
            'headers': {
                'Authorization': 'Bearer '+parseRefreshData.refresh_token
            }
            };
            request(options, function (error, response) {
                if (error) {
                    resolve({error:error});
                    return;
                }
                settings.setSettings(req, {
                    qPayTokenData:response.body
                })
                // set setting for token/refresh token
                resolve(JSON.parse(response.body))
            });
        }
    })
}

exports.appleReceipt = async(req,data) => {

    return new Promise ((resolve, _reject) => {
        var url = req.appSettings["apple_inapp_env"] != "sandbox" ? 'buy.itunes.apple.com' : 'sandbox.itunes.apple.com'
        var receiptEnvelope = {
            "receipt-data": data.receipt,
            "exclude-old-transactions":true,
            "password": req.appSettings["apple_inapp_purchasesecret"]
        };
        
        var receiptEnvelopeStr = JSON.stringify(receiptEnvelope);
        var options = {
            host: url,
            port: 443, 
            path: '/verifyReceipt',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(receiptEnvelopeStr)
            }
        };

        var request = https.request(options, function(res) {
            res.setEncoding('utf8');
            var body = '';
            res.on("data", function (chunk) {
                body = body + chunk;
            });
            res.on('end', function () {
                let responseData = JSON.parse(body);
                if(responseData.status != 0){
                    resolve(false);
                    return;
                }

                resolve(responseData);
            });
            res.on('error', function (error) {
                console.log("error: " + error);
                resolve(false);
            });
        });
        request.write(receiptEnvelopeStr);
        request.end();
    });
}

exports.checkCaptcha = async(req,recaptchaResponse) => {
    const secretKey = req.appSettings["recaptcha_secret_key"]
       return new Promise ((resolve, reject) => {
        
        const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + recaptchaResponse;
         request(verificationUrl
           , function(error, response, body) {
             if (error) {
               return reject(false);
             }
             
             if (response.statusCode !== 200) {
               return reject(false);
             }
   
             body = JSON.parse(body);
             const passCaptcha = !(body.success !== undefined && !body.success) && (body.score !== undefined && parseFloat(body.score) >= 0.5);
             resolve(passCaptcha);
           });
       });
     }
exports.otp = (req,data) => {
    return new Promise(async (resolve, reject) => {
        const randomNumer = Math.floor(1000 + Math.random() * 9000);
        const accountSid = req.appSettings['twillio_sid'];
        const authToken = req.appSettings['twillio_token']
        const client = require('twilio')(accountSid, authToken);
        let template = ""
        let object = {expiration_time:"60 seconds",code:randomNumer}
        if(data.type == "signup"){
            template = req.i18n.t("Use {{code}} to verify your registration. This code will get expired in {{expiration_time}}",object)
        }else if(data.type == "login"){
            template = req.i18n.t("Use {{code}} for verification and login. This code will get expired in {{expiration_time}}",object)
        }else if(data.type == "forgot"){
            template = req.i18n.t("Use {{code}} for verification and reset your password. This code will get expired in {{expiration_time}}",object)
        }else if(data.type == "add"){
            template = req.i18n.t("Use {{code}} for verification and adding your phone number. This code will get expired in {{expiration_time}}",object)
        }else if(data.type == "edit"){
            template = req.i18n.t("Use {{code}} for verification and editing your phone number. This code will get expired in {{expiration_time}}",object)
        }else if(data.type == "delete"){
            template = req.i18n.t("Use {{code}} for verification and delete your account. This code will get expired in {{expiration_time}}",object)
        }else if(data.type == "verification"){
            template = req.i18n.t("Use {{code}} for verification and verify your account. This code will get expired in {{expiration_time}}",object)
        }
        client.messages
                .create({
                    body: template,
                    from: req.appSettings['twillio_phone_number'],
                    to: data.phone
                })
                .then(message => {
                    resolve({code:randomNumer,message:message});
                }).catch(err => {
                    reject(err)
                });

    })
}

exports.censorWords = (req,text) => {
    if(!text){
        return text
    }
    if(req.appSettings['censored_words']){
        let newBadWords1 = req.appSettings['censored_words'].split(",")
        var re = new RegExp(newBadWords1.join("|"),"gi");
        var str = text
        str = str.replace(re, function(matched){
            return "*";
        });
        return str;
    }
        return text
}

exports.truncate = (text = "", maxLength = 200) => {
    //trim the string to the maximum length
    if (text.indexOf(" ") < 0) {
        return text;
    }
    var trimmedString = text.substr(0, maxLength);
    //re-trim if we are in the middle of a word
    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))
    return trimmedString
}
exports.updateMetaData = async (req,data) => {
    return new Promise(async (resolve, reject) => {

        if(!data.title && req.appSettings['page_default_title']){
            data.title = req.appSettings['page_default_title']
        }
        if(!data.description && req.appSettings['page_default_description']){
            data.description = req.appSettings['page_default_description']
        }
        if(!data.keywords && req.appSettings['page_default_keywords']){
            data.keywords = req.appSettings['page_default_keywords']
        }
        if((!data.image || data.image == 0)  && req.appSettings['page_default_image']){
            data.image = req.appSettings['page_default_image']
        }
        let title = ' | '+ req.appSettings.site_title
        if(req.query.pageInfo){
            let titleLength = title.length
            let dataTitle = striptags(data['title'])
            if(dataTitle){
                let dataLength = (dataTitle ? dataTitle : "").length
                if(dataLength > (160 - titleLength)  ){
                    dataTitle = exports.truncate(dataTitle,(60 - titleLength - 4))+" ..."
                }
                req.query.pageInfo.title =  dataTitle + title
            }
            let dataDescription = striptags(data['description'])
            if(dataDescription){
                let dataDescriptionLength = (dataDescription ? dataDescription : "").length
                if(dataDescriptionLength > 320  ){
                    dataDescription = exports.truncate(dataDescription,(320 - 4))+" ..."
                }
                req.query.pageInfo.description =  dataDescription
            }
            if(data['keywords'])
                req.query.pageInfo.keywords = data['keywords']
            if(data['image'])
                req.query.pageInfo.image = data['image']

            if(data['banner'])
                req.query.pageInfo.banner = data['banner']
        }
        
        var ip = req.headers['x-real-ip'] || 
                        (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : null);
        if(req.query.pageInfo && req.query.pageInfo.image && ip != "::1"){
            let isOutSide = false;
            let image = req.query.pageInfo.image
            let imgUrl = req.query.pageInfo.image;
            if (image.toString().indexOf("https://") === 0 || image.toString().indexOf("http://") === 0) {
                isOutSide = true
            }
            if(req.appSettings.upload_system != "s3"  && req.appSettings.upload_system != "wisabi" && !isOutSide){
                // try{
                //     const dimensions = await sizeOf(req.query.pageInfo.image);
                //     req.query.pageInfo.imageHeight = dimensions.height
                //     req.query.pageInfo.imageWidth = dimensions.width 
                // }catch(e){
                //     //silence
                // }
            }else{
                // var options = url.parse(isOutSide ? imgUrl : req.query.imageSuffix+req.query.pageInfo.image);
                // await exports.getImageSize(req,options,isOutSide ? imgUrl : req.query.imageSuffix+req.query.pageInfo.image).then(dimensions => {
                //     if(dimensions){
                //         req.query.pageInfo.imageHeight = dimensions.height
                //         req.query.pageInfo.imageWidth = dimensions.width 
                //     }
                // }).catch(err => {
                //     console.log(err)
                // })
            }
        }

        resolve(true)
    })
}
exports.getImageSize = async(req,options,image) => {
    return new Promise((resolve, reject) => {
        if(image){
            (image.toString().indexOf("https://") === 0 ? https : http).get(options, function (response) {
                var chunks = [];
                response.on('data', function (chunk) {
                    chunks.push(chunk);
                }).on('end', function() {
                    try{
                        var buffer = Buffer.concat(chunks);
                        if(buffer)
                            resolve(sizeOf(buffer));
                        else
                            reject(false)
                    }catch(err){
                        resolve(false)
                    }
                });
            });
        }else{
            resolve(false);
        }
    })
}
exports.removeURLParameter = (url, parameter) => {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');   
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {    
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
                pars.splice(i, 1);
            }
        }

        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}
// imageSuffix
exports.getGeneralInfo = async (req, res, type, fromNode = false) => {
    if(req.appSettings['site_images_cdn_url']){
        req.query.imageSuffix = req.appSettings['site_images_cdn_url']
    }else if (req.appSettings.upload_system == "s3") {
        req.query.imageSuffix = "https://" + req.appSettings.s3_bucket + ".s3.amazonaws.com";
    }else if( req.appSettings.upload_system == "wisabi"){
        req.query.imageSuffix = "https://s3.wasabisys.com/"+req.appSettings.s3_bucket ;
    } else {
        req.query.imageSuffix = req.APP_HOST+process.env.subFolder.slice(0, -1)
    }

    if(req.appSettings['site_videos_cdn_url']){
        req.query.videoCDNSuffix = req.appSettings['site_videos_cdn_url']
    }

    let url = exports.removeURLParameter(req.originalUrl.replace("/mainsite",''),"fromWebsite")
    url = exports.removeURLParameter(url,"siteLocale")
    req.query.currentURL = url;
    if(req.session && req.session.selectedThemeUser){
        req.query.themeType = req.session.selectedThemeUser
    }else if(typeof req.appSettings['site_theme'] == "undefined"){
        req.query.themeType = "1"
    }else if(parseInt(req.appSettings['site_theme']) > 2){
        req.query.themeType = "1";
    }else{
        req.query.themeType = req.appSettings['site_theme']
    }

    let typeTheme = 0;
    if(req.query.themeType == 2){
        typeTheme = 1;
    }

    req.appSettings['member_advanced_grid'] = typeTheme;
    req.appSettings['video_advanced_grid'] = typeTheme;
    req.appSettings['video_carousel_home'] = typeTheme;
    req.appSettings['video_adv_slider'] = typeTheme;
    req.appSettings['movie_advanced_grid'] = typeTheme;
    req.appSettings['channel_advanced_grid'] = typeTheme;
    req.appSettings['audio_advgrid'] = typeTheme;

    if(req.appSettings['fixed_header'] == 1){
        if(req.appSettings['hideSmallMenu'] == 1)
            req.query.hideSmallMenu = true
        if(req.appSettings['removeFixedMenu'] == 1)
            req.query.removeFixedMenu = true
    }

    //live streaming url
    let settings = await settingModel.settingData(req);
    let agora_app_id = settings["agora_app_id"];
    let type_livestreaming = settings["live_streaming_type"];
    if(!type_livestreaming){
        type_livestreaming = 1
    }
    req.query.siteURL = process.env.PUBLIC_URL+process.env.subFolder.slice(0, -1)
    req.query.livestreamingtype = type_livestreaming;
    if(agora_app_id && settings["agora_s3_bucket"]){
        req.query.liveStreamingURL = "https://" + settings["agora_s3_bucket"] + ".s3."+settings["agora_s3_region"]+".amazonaws.com";
    }
    req.query.streamingAppName = req.appSettings['antserver_media_app'];
    if(settings['live_streaming_cdn']){
        req.query.liveStreamingCDNURL = settings['live_streaming_cdn'];
    }
    if(settings['live_streaming_cdnserver']){
        req.query.liveStreamingCDNServerURL = settings['live_streaming_cdnserver'];
    }

    if(settings["antserver_media_url"]){
       req.query.liveStreamingServerURL = settings["antserver_media_url"];
    }
    
    if( ( (type_livestreaming == 1 && agora_app_id) || (type_livestreaming == 0 && settings["antserver_media_url"]) ) &&  parseInt(settings['live_stream_start'],10) == 1){
        req.query.liveStreamingEnable = true
    }
    
    await pageModel.findByType(type, req, res).then(async result => {
        if(result.type == "privacy" || result.type == "terms"){
            req.query.pagecontent = result.content
            delete result.content
            delete result.type
        }
        if(!result.custom_tags  && req.appSettings['page_default_custom_tags']){
            let custom_tags = req.appSettings['page_default_custom_tags']
            let tags = [];
            var counter = 0;
            let string = custom_tags;
            try{
                string.match(/<\/?[\w\s="/.':;#-\/\?]+>/gi).map(function(val){
                    if(val.indexOf("<meta") > -1){
                        var arrStr = val.match("<meta(.*)/>");
                        if(arrStr && arrStr.length > 0){
                            let subCounter = 0;
                            tags[counter] = [];
                            arrStr[1].trim().split(" ").forEach(function(item){
                                tags[counter][subCounter] = item.trim().replace(/"/g, "").split("=");
                                subCounter++;
                            })
                            counter++;
                        }
                    }
                });
                result.custom_tags = tags;
            }catch(err){
                //silence
            }
        }
        req.query.pageInfo = result
        await exports.updateMetaData(req,req.query.pageInfo)
    })
    //check IE browser
    if(req.headers['user-agent'] && (req.headers['user-agent'].indexOf("MSIE") >= 0 || req.headers['user-agent'].indexOf("Trident") >= 0)) {
        req.query.IEBrowser = true
    }

    var ip = req.headers['x-real-ip'] || 
                        (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : null);
    if(req.query.pageInfo && req.query.pageInfo.image && ip != "::1"){
        let isOutSide = false;
        let image = req.query.pageInfo.image
        let imgUrl = req.query.pageInfo.image;
        if (image.toString().indexOf("https://") === 0 || image.toString().indexOf("http://") === 0) {
            isOutSide = true
        }
        if(req.appSettings.upload_system != "s3" && req.appSettings.upload_system != "wisabi" && !isOutSide){
            // try{
            //     const dimensions = await sizeOf(req.serverDirectoryPath+ "/public"+req.query.pageInfo.image);
            //     req.query.pageInfo.imageHeight = dimensions.height
            //     req.query.pageInfo.imageWidth = dimensions.width 
            // }catch(e){
            //     console.log(e)
            //     //silence
            // }
        }else{
            // var options = url.parse(isOutSide ? imgUrl : req.query.imageSuffix+req.query.pageInfo.image);
            // await exports.getImageSize(req,options,isOutSide ? imgUrl : req.query.imageSuffix+req.query.pageInfo.image).then(dimensions => {
            //     if(dimensions){
            //         req.query.pageInfo.imageHeight = dimensions.height
            //         req.query.pageInfo.imageWidth = dimensions.width 
            //     }
            // }).catch(err => {
            //     console.log(err)
            // })
        }
    }

    let CDN_URL_FOR_STATIC_RESOURCES = ""
    if(req.appSettings['site_cdn_url']){
        CDN_URL_FOR_STATIC_RESOURCES = req.appSettings['site_cdn_url']
    }
    req.query.CDN_URL_FOR_STATIC_RESOURCES = CDN_URL_FOR_STATIC_RESOURCES;
    
    req.query.audioPassword = req.session && req.session.audio ? req.session.audio : []
    
    if(req.user){
        await globalModel.custom(req,`SELECT COUNT(DISTINCT(message_id)) as count FROM messages_texts WHERE is_read = 0 AND message_id IN (SELECT message_id from messages WHERE user_id = ${req.user.user_id} || resource_id = ${req.user.user_id}) AND user_id != ${req.user.user_id}`).then(async result => {
            if(result && result.length > 0){
                req.query.messageCount = JSON.parse(JSON.stringify(result))[0].count;
            }
        });
    }


    if(req.appSettings['fixed_header'] == 1){
        //get video categories for sidebar
        await videoCategoryModel.findAll(req, { type: 'video', onlyCategories: 1, limit:20 }).then(results => {
            if (results && results.length > 0) { 
                req.query.categoriesVideo = results
            }
        })
        if(req.user){
            //get loggedin user channel subscription
            channelModel.getFollowedChannels(req,{limit:5}).then(result => {
                if(result){
                    req.query.channelSubscriptions = result
                }
            }).catch(err => {
                //silence
            })
        }
        const userModel = require("../models/users")
        await userModel.getMembers(req,{ limit:16,orderby: "random",is_popular:true }).then(results => {
            if (results && results.length > 0) { 
                req.query.popularMembers = results
            }
        }).catch(err => {
            console.log(err)
        })
    }
    req.query.selectedCurrency = req.currentCurrency
    req.query.defaultCurrency = req.defaultCurrency
    // currencies
    await globalModel.custom(req,"SELECT * from currencies WHERE active = 1 ORDER BY `order` ASC").then(async result => {
        if(result && result.length > 1){
            req.query.currencies = JSON.parse(JSON.stringify(result));
        }
    });

    await avtarsModel.findAll(req, {type:"avtars",enabled:true,limit:1}).then(result => {
        if (result && result.length > 0) {
            req.appSettings.avtarAIEnabled = 1
        }
    }) 
    await avtarsModel.findAll(req, {type:"covers",enabled:true,limit:1}).then(result => {
        if (result && result.length > 0) {
            req.appSettings.coverAIEnabled = 1
        }
    }) 


    if(req.user){
        req.query.adultAllowed =  req.user.adult == 1 ? true : false
    }else{
        req.query.adultAllowed = req.session.adult_allow ? true : false
    }
    await designModel.findAll(req,{}).then(result => {
        if(result){
            req.query.cssValues = result
        }
    }).catch(err => {
        console.log(err)
    })


    let enabledGateways = req.currentCurrency.gateway_allowed ? req.currentCurrency.gateway_allowed.split(",") : ""
    //check enabled gateways
    if(enabledGateways.indexOf("paypal") > -1 && (!req.appSettings['payment_paypal_method'] || req.appSettings['payment_paypal_method'] == 1) && req.appSettings['payment_client_id'] && req.appSettings['payment_client_secret']){
        req.appSettings['paypalEnabled'] = 1;
    }
    if(enabledGateways.indexOf("qPay") > -1 && ( !req.appSettings['payment_qpay_method'] || req.appSettings['payment_qpay_method'] == 1) && req.appSettings['payment_qpay_username'] && req.appSettings['payment_qpay_password']){
        req.appSettings['qPayEnabled'] = 1;
    }
    if(enabledGateways.indexOf("bank") > -1 && req.appSettings['payment_bank_method'] == 1){
        req.appSettings['bankTransferEnabled'] = 1;
    } 
    // if(req.appSettings['payment_pay_wallet'] == 1){
        req.appSettings['walletPaymentEnabled'] = 1;
        req.appSettings['payment_pay_single_wallet'] = 1;
    // }
    if(enabledGateways.indexOf("cashfree") > -1 && req.appSettings['payment_cashfree_method'] == 1 && req.appSettings['payment_cashfree_client_id'] && req.appSettings['payment_cashfree_client_secret']){
        req.appSettings['cashfreeEnabled'] = 1;
    }
    if(enabledGateways.indexOf("stripe") > -1 && req.appSettings['payment_stripe_method'] == 1 && req.appSettings['payment_stripe_publish_key'] && req.appSettings['payment_stripe_client_secret']){
        req.appSettings['stripeEnabled'] = 1;
    }
    if(enabledGateways.indexOf("razorpay") > -1 && req.appSettings['payment_razorpay_method'] == 1 && req.appSettings['payment_razorpay_client_id'] && req.appSettings['payment_razorpay_client_secret']){
        req.appSettings['razorpayEnabled'] = 1;
    }
    if(enabledGateways.indexOf("flutterwave") > -1 && req.appSettings['payment_flutterwave_method'] == 1 && req.appSettings['payment_flutterwave_client_id'] && req.appSettings['payment_flutterwave_client_secret']){
        req.appSettings['flutterwaveEnabled'] = 1;
    }
    if(enabledGateways.indexOf("aamarpay") > -1 && req.appSettings['payment_aamarpay_method'] == 1 && req.appSettings['payment_aamarpay_storeid'] && req.appSettings['payment_aamarpay_signaturekey']){
        req.appSettings['aamarpayEnabled'] = 1;
    }

 
    
    if (!fromNode) {
        delete req.appSettings.payment_aamarpay_storeid
        delete req.appSettings.payment_aamarpay_signaturekey

        //delete security settings
        delete req.appSettings.import_youtube_channel_video
        delete req.appSettings.qPayTokenData
        delete req.appSettings.api_token
        delete req.appSettings.oneSignal_restapi_key
        delete req.appSettings.antserver_media_app
        delete req.appSettings.import_youtube_channel_video_ownerid
        delete req.appSettings.google_translateapi_key
        delete req.appSettings.recaptcha_secret_key
        delete req.appSettings.twillio_sid
        delete req.appSettings.twillio_token
        delete req.appSettings.twillio_phone_number
        delete req.appSettings.movie_tmdb_language
        delete req.appSettings.movie_tmdb_api_key
        delete req.appSettings.movie_tmdb_adult

        req.appSettings.allowOpenAi = req.appSettings.openai_api_key != "" && req.appSettings.openai_model != "" ? 1 : 0

        delete req.appSettings.old_channel_import
        delete req.appSettings.old_import_time
        delete req.appSettings.openai_api_key
        delete req.appSettings.openai_model


        delete req.appSettings.email_smtp_host
        delete req.appSettings.email_smtp_password
        delete req.appSettings.email_smtp_password
        delete req.appSettings.email_smtp_port
        delete req.appSettings.contact_email_from
        delete req.appSettings.email_smtp_type
        delete req.appSettings.email_smtp_username
        delete req.appSettings.maintanance_code
        delete req.appSettings.payment_client_secret
        delete req.appSettings.payment_paypal_sanbox
        delete req.appSettings.payment_client_id
        
        delete req.appSettings.payment_cashfree_client_id
        delete req.appSettings.payment_qpay_username
        delete req.appSettings.payment_qpay_password
        delete req.appSettings.payment_qpay_invoice
        delete req.appSettings.payment_qpay_branch_code

        delete req.appSettings.payment_cashfree_client_secret
        delete req.appSettings.payment_stripe_publish_key
        delete req.appSettings.payment_stripe_client_secret
        delete req.appSettings.payment_stripe_webhook_key
        if(!req.query.fromAppDevice)
            delete req.appSettings.apple_inapp_purchasesecret
        
        delete req.appSettings.s3_access_key
        delete req.appSettings.s3_bucket
        delete req.appSettings.s3_region
        delete req.appSettings.s3_secret_access_key
        delete req.appSettings.restrict_ips

        delete req.appSettings.email_type
        delete req.appSettings.iframely_api_key
        delete req.appSettings.enable_twitch_import
        delete req.appSettings.enable_youtube_import
        delete req.appSettings.facebook_client_id
        delete req.appSettings.facebook_client_secret
        delete req.appSettings.iframely_disallow_sources
        delete req.appSettings.mailchimp_apikey
        delete req.appSettings.mailchimp_listId

        req.appSettings.fid = req.appSettings.social_login_fb_apiid

        delete req.appSettings.social_login_fb_apiid
        delete req.appSettings.social_login_fb_apikey

        req.appSettings.gid = req.appSettings.social_login_google_apiid
        delete req.appSettings.social_login_google_apiid
        delete req.appSettings.social_login_google_apikey
        delete req.appSettings.social_login_twitter_apiid
        delete req.appSettings.social_login_twitter_apikey

        req.appSettings.aid = req.appSettings.social_login_apple_clientid
        delete req.appSettings.social_login_apple_clientid
        delete req.appSettings.social_login_apple_teamid
        delete req.appSettings.social_login_apple_keyid
        delete req.appSettings.social_login_apple_p8
        
        delete req.appSettings.gmail_xauth_clientid
        delete req.appSettings.gmail_xauth_clientsecret
        delete req.appSettings.gmail_xauth_email
        delete req.appSettings.gmail_xauth_refreshtoken
        
        if(req.fromBlog)
            req.query.tinymceKey = req.appSettings.tinymceKey
        delete req.appSettings.tinymceKey
        delete req.appSettings.twitch_api_key
        delete req.appSettings.youtube_api_key
        
        delete req.appSettings.agora_app_id
        delete req.appSettings.agora_app_certificate
        delete req.appSettings.agora_customer_certificate
        delete req.appSettings.agora_customer_id
        delete req.appSettings.agora_s3_access_key
        delete req.appSettings.agora_s3_bucket
        delete req.appSettings.agora_s3_region
        delete req.appSettings.agora_s3_secret_access_key

        if (req.appSettings.video_ffmpeg_path && req.appSettings.video_upload == "1") {
            req.appSettings.uploadVideo = "1"
        }
        let ffmpegpath = req.appSettings.video_ffmpeg_path
        delete req.appSettings.video_ffmpeg_path
        if(ffmpegpath){
            req.appSettings.video_ffmpeg_path = true
        }
        
    }
     
    //languages
    await languages.findAll(req, { enabled: 1 }).then(result => {
            req.query.languages = result
    }).catch(err => { })
    let defaultLan = "en"
    let languageCookie = req.cookies['NEXT_LOCALE']
    let isLanguageValid = false;
    if(req.query.languages){
        req.query.languages.forEach(lan => {
            if(languageCookie && lan.code == languageCookie){
                isLanguageValid = true;
            }
            if(req.i18n.languages && lan.code == req.i18n.languages[0]){
                req.query.isRTL = lan.is_rtl
            }
            
            if(parseInt(lan.default) == 1){
                defaultLan = lan.code
            }
            
        })
    }
    req.query.defaultTimezone = req.user ? req.user.timezone : req.appSettings["member_default_timezone"]
    req.query.initialLanguage = languageCookie && isLanguageValid ? languageCookie : (req.user ? req.user.language : defaultLan)
    if(req.currentLocale){
        req.query.initialLanguage = req.currentLocale
    }

    let theme = req.session.siteMode == "dark" ? "dark" : "white"
    req.query.themeMode = theme

    let enable_theme_design_mode = req.levelPermissions && typeof req.levelPermissions['member.enable_theme_design_mode'] != "undefined" ? req.levelPermissions['member.enable_theme_design_mode'] : 1;
    let theme_design_mode = req.levelPermissions && typeof req.levelPermissions['member.theme_design_mode'] != "undefined" ? req.levelPermissions['member.theme_design_mode'] : 3;

    if(theme_design_mode == 3 || theme_design_mode == 4 ){
        if(enable_theme_design_mode == 1)
            req.query.toogleMode = true
        if(theme_design_mode == 3 && !req.session.siteMode){
            req.query.themeMode = "white"
        }else if(theme_design_mode == 4 && !req.session.siteMode){
            req.query.themeMode = "dark"
        }
    }else if(theme_design_mode == 2){
        req.query.themeMode = "white"
    }else{
        req.query.themeMode = "dark"
    }
    
    if (req.user && req.user.level_id == 1) {
        req.query.admin_url = process.env.ADMIN_SLUG
    }
    if(process.env.NODE_ENV != "production"){
        req.query.environment = "dev"
    }
    //menus data
    await menus.getFetchedMenus(req).then(result => {
        req.query.menus = result
    })
    if (req.query.h)
        req.query.searchTitleText = req.query.h
    
    if (req.user) {
        req.query.loggedInUserDetails = req.user
    }
    if((!req.user || req.user.levelFlag != "superadmin" ) &&  (typeof process.env.ALLOWALLUSERINADMIN != "undefined" || process.env.ALLOWALLUSERINADMIN)){
        req.query.ALLOWALLUSERINADMIN = true
        req.query.admin_url = process.env.ADMIN_SLUG
    }
    req.query.subFolder = process.env.subFolder
    req.query.appSettings = req.appSettings
    
    //settings
    if (req.user) {
        req.query.packagesExists = false
        await packagesModel.findAll(req, { column: "packages.*", enabled: 1, not_default_plan: 1 }).then(async (result) => {
            if (result && result.length) {
                req.query.packagesExists = true
                if (req.getPackages) {
                    req.query.packages = result
                }
                await packagesModel.default(req, res).then(async (result) => {
                    if (result) {
                        //package enable
                        //get logged in user subscription package
                        await subscriptionModel.userActivePackage(req, res).then(async (result) => {
                            if (result) {
                                packageEnable = true
                                if (req.getPackages) {
                                    req.query.userActivePackage = result
                                }
                            } else {
                                //default plan
                                await packagesModel.default(req, res).then(result => {
                                    if (result) {
                                        packageEnable = true
                                        if (req.getPackages) {
                                            req.query.userActivePackage = result
                                        }
                                    }
                                }).catch(error => {
                                    //silence
                                })
                            }
                        }).catch(error => {
                            //silence
                        })
                    }
                }).catch(error => {
                    //silence
                })
            }
        })
    }
    req.query.levelPermissions = req.levelPermissions
    return
}
exports.deleteAntmediaContent = async (req, res, image,type) => {
    const upload_system = req.appSettings.antmedia_upload_system
    if ((upload_system == "s3" || upload_system == "wisabi" )) {
        let wisabiStorage = {}
        if(upload_system == "s3"){
            aws.config.update({
                secretAccessKey: req.appSettings.agora_s3_secret_access_key,
                accessKeyId: req.appSettings.agora_s3_access_key,
                region: req.appSettings.agora_s3_region
            });
        }else{
            const accessKeyId = req.appSettings.agora_s3_access_key;
            const secretAccessKey = req.appSettings.agora_s3_secret_access_key;    
            const wasabiEndpoint = new aws.Endpoint(`s3.${req.appSettings.agora_s3_region}.wasabisys.com`);
             wisabiStorage = {
              endpoint: wasabiEndpoint,
              region: req.appSettings.agora_s3_region,
              accessKeyId,
              secretAccessKey
            };
        }
        const s3 = new aws.S3(wisabiStorage)
        let trimImage = image
        if (image.charAt(0) == "/") trimImage = image.substr(1);
        const params = {
            Bucket: req.appSettings.agora_s3_bucket,
            Key: trimImage //if any sub folder-> path/of/the/folder.ext
        }
        try {
            s3.deleteObject(params, function (err, data) {
                if (err)
                    console.log(err, err.stack); // error
                
            });
        } catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err))
        }
    }
}
exports.deleteUploadedContent = async (req, res, image,type) => {
    const upload_system = req.appSettings.upload_system
    if ((upload_system == "s3" || upload_system == "wisabi" ) && type != "locale") {
        let wisabiStorage = {}
        if(upload_system == "s3"){
            aws.config.update({
                secretAccessKey: req.appSettings.s3_secret_access_key,
                accessKeyId: req.appSettings.s3_access_key,
                region: req.appSettings.s3_region
            });
        }else{
            const accessKeyId = req.appSettings.s3_access_key;
            const secretAccessKey = req.appSettings.s3_secret_access_key;    
            const wasabiEndpoint = new aws.Endpoint(`s3.${req.appSettings.s3_region}.wasabisys.com`);
             wisabiStorage = {
              endpoint: wasabiEndpoint,
              region: req.appSettings.s3_region,
              accessKeyId,
              secretAccessKey
            };
        }
        const s3 = new aws.S3(wisabiStorage)
        let trimImage = image
        if (image.charAt(0) == "/") trimImage = image.substr(1);
        const params = {
            Bucket: req.appSettings.s3_bucket,
            Key: trimImage //if any sub folder-> path/of/the/folder.ext
        }
        try {
            s3.deleteObject(params, function (err, data) {
                if (err)
                    console.log(err, err.stack); // error
                
            });
        } catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err))
        }
    }
    let trimMainImage = image
    if (image.charAt(0) == "/") trimMainImage = image.substr(1);
    fs.unlink(req.serverDirectoryPath + "/public/"+trimMainImage, function (err) {
        // if (err) {
        //     console.error(err);
        // } 
    });
    
}
exports.deleteAgoraHLSVideos = (path,req) => {
    if ( req.appSettings['agora_s3_bucket'] && req.appSettings['agora_s3_access_key'] && req.appSettings['agora_s3_secret_access_key']  ) {
        aws.config.update({
            secretAccessKey: req.appSettings.agora_s3_secret_access_key,
            accessKeyId: req.appSettings.agora_s3_access_key,
            region: req.appSettings.agora_s3_region
        });
        const s3 = new aws.S3()
        var params = {
            Bucket: req.appSettings['agora_s3_bucket'],
            Prefix: 'upload/livestreamings/'+path+"/"
        };
        s3.listObjects(params, function(err, data) {
            if (err) 
                return ""
            if (!data.Contents || data.Contents.length == 0) 
                return ""
            params = {Bucket: req.appSettings['agora_s3_bucket']};
            params.Delete = {Objects:[]};
            data.Contents.forEach(function(content) {
                params.Delete.Objects.push({Key: content.Key});
            });        
            s3.deleteObjects(params, function(err, data) {
                if (err || !data.Contents) 
                    return ""
                if(data.Contents.length == 1000) 
                    exports.deleteAgoraHLSVideos(path,req);
            });
        });
    }
  }
exports.deleteImage = async (req, res, image, type, obj) => {
    if (obj) {
        if (obj.reel_id) {
            if (obj.image && obj.image.indexOf("://") < 0) {
                exports.deleteUploadedContent(req, res, obj.image)
            } 
            if(obj.video_location){
                exports.deleteUploadedContent(req,res,obj.video_location)
            }
        }else if (obj.video_id) {
            if (obj.image && obj.image.indexOf("://") < 0) {
                exports.deleteUploadedContent(req, res, obj.image)
            } 
            if (obj.type == 3) {
                let path = "/upload/videos/video/"
                if(obj.video_location){
                    let splitName = obj.video_location.split('/')
                    let fullName = splitName[splitName.length - 1]
                    let videoName = fullName.split('_')[0]
                    if (obj['4096p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_4096p.mp4")
                    }
                    if (obj['2048p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_2048p.mp4")
                    }
                    if (obj['1080p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_1080p.mp4")
                    }
                    if (obj['720p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_720p.mp4")
                    }
                    if (obj['480p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_480p.mp4")
                    }
                    if (obj['360p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_360p.mp4")
                    }
                    if (obj['240p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_240p.mp4")
                    }
                    if (obj['sample'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_sample.mp4")
                    }
                }
            }
            if(obj.mediaserver_stream_id){
                let videos = []
                if(obj.agora_resource_id){
                    videos = obj.agora_resource_id.split(',')
                }else{
                    videos = [obj.mediaserver_stream_id]
                }
                if(req.appSettings["agora_s3_bucket"] && req.appSettings["agora_s3_access_key"] && req.appSettings['agora_s3_secret_access_key'] && req.appSettings['agora_s3_region']){
                    let imagepaths = obj.code
                    if(imagepaths){
                        imagepaths.split(',').forEach(item => {
                            exports.deleteAntmediaContent(req,res,"streams/"+item);
                        })
                    }
                    if(obj.image && (obj.image.indexOf('/LiveApp/') > -1 || obj.image.indexOf('/WebRTCAppEE/') > -1))
                        exports.deleteAntmediaContent(req,res,obj.image.replace("/LiveApp/",'').replace("/WebRTCAppEE/",''));
                }
                videos.forEach(item => {
                    if(item){
                        var config = { 
                            method: 'delete',
                            url: req.appSettings["antserver_media_url"].replace("https://","http://")+`:5080/${obj.antmedia_app}/rest/v2/vods/`+item,
                            headers: { 
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            //httpsAgent: agent
                        };
                        axios(config)
                        .then(function (response) {
                        }).catch(function (error) {});
                    }
                })
            }else if(obj.agora_resource_id){
                exports.deleteAgoraHLSVideos(obj.custom_url,req)
            }
        }else if (obj.movie_video_id) {
            if (obj.image && obj.image.indexOf("://") < 0) {
                exports.deleteUploadedContent(req, res, obj.image)
            } 
            if (obj.type == 3) {
                let path = "/upload/movies/video/"
                if(obj.video_location){
                    let splitName = obj.video_location.split('/')
                    let fullName = splitName[splitName.length - 1]
                    let videoName = fullName.split('_')[0]
                    if (obj['4096p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_4096p.mp4")
                    }
                    if (obj['2048p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_2048p.mp4")
                    }
                    if (obj['1080p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_1080p.mp4")
                    }
                    if (obj['720p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_720p.mp4")
                    }
                    if (obj['480p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_480p.mp4")
                    }
                    if (obj['360p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_360p.mp4")
                    }
                    if (obj['240p'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_240p.mp4")
                    }
                    if (obj['sample'] == 1) {
                        exports.deleteUploadedContent(req,res,path + videoName + "_sample.mp4")
                    }
                }
            }
            
        } else if (obj.post_id) {
            if (obj.image ) {
                exports.deleteUploadedContent(req, res, obj.image)
            }
        } else if (obj.channel_id) {
            if (obj.channelimage ) {
                exports.deleteUploadedContent(req, res, obj.image)
            }
            if (obj.channelcover ) {
                exports.deleteUploadedContent(req, res, obj.cover)
            }
            if (obj.cover_crop ) {
                exports.deleteUploadedContent(req, res, obj.cover_crop)
            }
        } else if (obj.playlist_id) {
            if (obj.image ) {
                exports.deleteUploadedContent(req, res, obj.image)
            }
        } else if (obj.blog_id) {
            if (obj.image ) {
                exports.deleteUploadedContent(req, res, obj.image)
            }
        }else if (obj.audio_id) {
            if (obj.image ) {
                exports.deleteUploadedContent(req, res, obj.image)
            }
            if (obj.audio_file ) {
                exports.deleteUploadedContent(req, res, obj.audio_file)
            }
        }else if(obj.user_id){
            if (obj.avtar ) {
                exports.deleteUploadedContent(req, res, obj.avtar)
            }
            if (obj.cover ) {
                exports.deleteUploadedContent(req, res, obj.cover)
            }
            if (obj.cover_crop ) {
                exports.deleteUploadedContent(req, res, obj.cover_crop)
            }
        }
    } else {
        if(image)
        exports.deleteUploadedContent(req, res, image,type)
    }
}

exports.getUploadVideoInfo = async (url) => {
    const urlParser = require("js-video-url-parser")
    const videoUrlObject = await urlParser.parse(url)
    let responseObject = {}
    if (videoUrlObject && videoUrlObject.provider == "youtube" && videoUrlObject.mediaType == "video") {
        responseObject = videoUrlObject
    } else if (videoUrlObject && videoUrlObject.provider == "vimeo" && videoUrlObject.mediaType == "video") {
        responseObject = videoUrlObject
    } else if (videoUrlObject && videoUrlObject.provider == "dailymotion" && videoUrlObject.mediaType == "video") {
        responseObject = videoUrlObject
    } else if (videoUrlObject && videoUrlObject.provider == "twitch" && (videoUrlObject.mediaType == "stream" || videoUrlObject.mediaType == "clip"  || videoUrlObject.mediaType == "video")) {
        responseObject = videoUrlObject
        if(videoUrlObject.mediaType == "clip"){
            responseObject.id = url.split("/").pop();
        }
    } else if (/(^http(?:s?):\/\/(?:www\.|web\.|m\.)?facebook\.com\/([A-z0-9\.]+)\/videos(?:\/[0-9A-z].+)?\/(\d+)(?:.+)?$)/.test(url)) {
        responseObject["provider"] = "facebook"
        responseObject['id'] = url
    }else if(/^(http[s]?:\/\/)?([^:\/\s]+)(:([^\/]*))?(\/\w+\.)*([^#?\s]+)(\?([^#]*))?(\.mp4|\.m3u8)$/gm.test(url)){
        responseObject["provider"] = "mp4_mov"
        responseObject['id'] = url
    } else {
        responseObject = { status: false }
    }
    return responseObject
}

exports.getScript = async (url) => {
    return new Promise((resolve, reject) => {
        const http = require('http'),
            https = require('https');

        let client = http;

        if (url.toString().indexOf("https") === 0) {
            client = https;
        }

        client.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(data);
            });

        }).on("error", (err) => {
            reject(false);
        });
    });
};

exports.convertTime = async (duration) => {
    return new Promise((resolve, reject) => {
        var n = duration.indexOf('.');
        duration = duration.substring(0, n != -1 ? n : duration.length)
        d = Number(duration);
        var h = Math.floor(d / 3600).toString();
        var m = Math.floor(d % 3600 / 60).toString();
        var s = Math.floor(d % 3600 % 60).toString();

        var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00"
        var mDisplay = m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00"
        var sDisplay = s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00"
        resolve(hDisplay + mDisplay + sDisplay)
    })
}
exports.convert_time = (duration) => {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}
exports.twitch = (params) => {
    const twitchApi = {}
    let apiUrl = "https://api.twitch.tv/helix/"
    twitchApi["stream"] = apiUrl+"streams/"
    twitchApi["clip"] = apiUrl+"clips/"
    twitchApi["video"] = apiUrl+"videos/"
    return twitchApi[params]
}
exports.getTwitchData = async (params,callback) => {
    const request = require('request');
    let clientID = params.clientID;
    let clientSecret = params.clientSecret;
    if(!clientID || clientID === '') return callback('No client id specified');
    if(!clientSecret || clientSecret === '') return callback('No client secret specified');
    

    //get access token
    let token = ""
    await axios({
        method: "post",
        url: "https://id.twitch.tv/oauth2/token",
        data:  {
            "client_id": clientID,
            "client_secret": clientSecret,
            "grant_type": "client_credentials"
          },
        headers: { 
         //   "Content-Type": "multipart/form-data" 
        },
      })
        .then(function (response) {
          //handle success
            token = response.data.access_token;
        })
        .catch(function (response) {
          //handle error
        });
    let options = {
        url: params.url,
        method: "GET",
        headers: {
            'Client-ID': clientID,
            //'Accept': 'application/vnd.twitchtv.v5+json',
            //'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    // Headers for v4 API (clips and video upload)
 //   options.headers.Accept = 'application/vnd.twitchtv.v5+json';
    // if(params['content-length']) {
    //     options.encoding = null;
    //     options.headers['content-length'] = params['content-length'];
    // }

    // if(options.headers.Authorization != '' && options.headers.Authorization.indexOf('OAuth') === -1) {
    //     options.headers.Authorization = 'OAuth ' + params.auth;
    // }

    request(options, (err, res, body) => {
        if(err) return callback(err);
        try {
            if(body.length === 0) return callback({ statusCode: res.statusCode });
            let bodyD = JSON.parse(body)
            callback(null, bodyD.data[0]);
        }
        catch(err) {
            err.statusCode = res.statusCode;
            callback(err);
        }
    });
}
exports.getVideoData = async (type, code, req, resObject) => {
    return new Promise(async (resolve, reject) => {
        const responseData = {}
        let url;
        switch (type) {
            case "youtube":
                if (req.appSettings["enable_youtube_import"] == "1" && req.appSettings["youtube_api_key"] != "") {
                    url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + code + "&key=" + req.appSettings["youtube_api_key"]
                    await exports.getScript(url).then(async result => {
                        if (result) {
                            const parseResponse = JSON.parse(result)
                            const data = parseResponse["items"][0]
                            responseData["title"] = data["snippet"]['title']
                            responseData["description"] = data['snippet']['description'];
                            await exports.convertTime(exports.convert_time(data['contentDetails']['duration']).toString()).then(result => {
                                responseData["duration"] = result
                            })
                            responseData["tags"] = data['snippet']['tags'];
                            if (data['snippet']['thumbnails']['maxres'] && data['snippet']['thumbnails']['maxres']['url']) {
                                responseData['image'] = data['snippet']['thumbnails']['maxres']['url'];
                            } else if (data['snippet']['thumbnails']['maxres'] && data['snippet']['thumbnails']['maxres']['url']) {
                                responseData['image'] = data['snippet']['thumbnails']['maxres']['url']
                            }  else if (data['snippet']['thumbnails']['medium'] && data['snippet']['thumbnails']['medium']['url']) {
                                responseData['image'] = data['snippet']['thumbnails']['medium']['url']
                            } else
                                responseData['image'] = "https://i.ytimg.com/vi/" + code + "/sddefault.jpg"
                            responseData['image'] = responseData['image'].replace("http://",'https://')
                            responseData['code'] = code
                            resolve(responseData)
                        }
                    }).catch(error => {
                        resolve(false)
                    })
                } else {
                    resolve(false)
                }
                break;
            case "vimeo":
                url = "http://vimeo.com/api/v2/video/" + code + ".xml"
                await exports.getScript(url).then(async data => {
                    if (data) {
                        const parser = require('fast-xml-parser')
                        var result = parser.validate(data);
                        if (result !== true) {
                            resolve(false)
                            return
                        }
                        var jsonData = parser.parse(data);
                        const jsonObj = jsonData['videos']['video']
                        responseData["title"] = jsonObj['title']
                        responseData["description"] = jsonObj['description']
                        await exports.convertTime(jsonObj['duration'].toString()).then(result => {
                            responseData["duration"] = result
                        })
                        responseData['image'] = jsonObj['thumbnail_large']
                        responseData['image'] = responseData['image'].replace("http://",'https://')
                        if (jsonObj['tags'])
                            responseData['tags'] = jsonObj['tags'].split(',')
                        resolve(responseData)
                    }
                }).catch(error => {
                    console.log(error)
                    resolve(false)
                })
                break;
            case "dailymotion":
                url = "https://api.dailymotion.com/video/" + code + "?fields=allow_embed,description,duration,thumbnail_url,title,tags"
                await exports.getScript(url).then(async result => {
                    if (result) {
                        const parseResponse = JSON.parse(result)
                        responseData["title"] = parseResponse['title']
                        responseData["description"] = parseResponse['description'];
                        await exports.convertTime(parseResponse["duration"].toString()).then(result => {
                            responseData['duration'] = result
                        })
                        responseData['image'] = parseResponse['thumbnail_url']
                        responseData['image'] = responseData['image'].replace("http://",'https://')
                        responseData['tags'] = parseResponse['tags']
                        resolve(responseData)
                    }
                }).catch(error => {
                    resolve(false)
                })
                break;
            case "twitch":
                if (req.appSettings["enable_twitch_import"] == "1" && req.appSettings["twitch_api_key"] != "") {
                    var api = require('twitch-api-v5');
                    let clientID = req.appSettings["twitch_api_key"];
                    let clientSecret = req.appSettings["twitch_api_secret"];
                    api.debug = false
                    //get twitch url
                    if (resObject.mediaType == "video") {
                        const url = await exports.twitch(resObject.mediaType)+"?id="+resObject.id.replace("v",'')
                        await exports.getTwitchData({ clientID: clientID,url:url,clientSecret:clientSecret }, async (err, res) => {
                            try{
                                if (err) {
                                    resolve(false)
                                } else if(res.id){
                                    responseData['title'] = res['title']
                                    responseData['description'] = res['description']
                                    responseData['image'] = res['thumbnail_url'].replace("%{width}",500).replace("%{height}",500);
                                    //await exports.convertTime(res["duration"].toString()).then(result => {
                                        responseData['duration'] = res["duration"].replace("h",':').replace("m",':').replace("s",'');
                                    //})
                                    resolve(responseData)
                                }else{
                                    resolve(false)
                                }
                            }catch(err){
                                resolve(false)
                            }
                        });
                    } else if (resObject.mediaType == "clip") {
                        const url = await exports.twitch(resObject.mediaType)+"?id="+resObject.id
                        await exports.getTwitchData({ clientID: clientID,url:url,clientSecret:clientSecret }, async (err, res) => {
                            try{
                                if (err) {
                                    resolve(false)
                                } else {
                                    responseData['title'] = res['title'];
                                    await exports.convertTime(res["duration"].toString()).then(result => {
                                        responseData['duration'] = result
                                    })
                                    responseData['image'] = res['thumbnail_url'].replace("%{width}",500).replace("%{height}",500);
                                    responseData['embedCode'] = res['embed_url']+"&parent="+process.env.PUBLIC_URL.replace("https://",'').replace("http://",'')
                                    resolve(responseData)
                                }
                            }catch(err){
                                resolve(false)
                            }
                        });
                    } else {
                        let userId = ""
                        await exports.getTwitchData({clientID: clientID, url:"https://api.twitch.tv/helix/users?login="+resObject.channel,clientSecret:clientSecret }, async (err, res) => {
                            try{
                                if(err) {
                                    resolve(false)
                                } else {
                                    userId = res.id
                                    const url = await exports.twitch(resObject.mediaType)+"?id="+userId
                                    await exports.getTwitchData({ clientID: clientID,url:url,clientSecret:clientSecret }, (err, res) => {
                                        try{
                                            if(err) {
                                                resolve(false)
                                            } else {
                                                responseData['title'] = res.title;
                                                responseData['image'] = res.thumbnail_url.replace("{width}",500).replace("{height}",500)
                                                responseData['image'] = responseData['image'].replace("http://",'https://')
                                                //responseData['description'] = res.stream.channel.status
                                                responseData["adult"] = res.is_mature ? 1 : 0
                                                resolve(responseData)
                                            }
                                        }catch(err) {
                                            resolve(false)
                                        }
                                    });
                                }
                            }catch(err) {
                                resolve(false)
                            }
                        });
                                            
                    }
                } else {
                    resolve(false)
                }
                break;
            case "facebook":
                if (req.appSettings["enable_facebook_import"] == "1" && req.appSettings["facebook_client_id"] != "" && req.appSettings["facebook_client_secret"] != "") {
                    const token_url = `https://graph.facebook.com/oauth/access_token?client_id=${req.appSettings["facebook_client_id"]}&client_secret=${req.appSettings["facebook_client_secret"]}&grant_type=client_credentials`
                    await exports.getScript(token_url).then(async result => {
                        if (result) {
                            const token = JSON.parse(result)
                            if (token["access_token"]) {
                                const id = code.match(/(\d+)\/?$/)[1]
                                await exports.getScript(`https://graph.facebook.com/${id}?access_token=${token["access_token"]}&fields=format,source,description,length,title,tags`).then(async results => {
                                    if (results) {
                                        const res = JSON.parse(results)
                                        if (res.error) {
                                            resolve(false)
                                            return
                                        }
                                        if (res['title'])
                                            responseData['title'] = res['title']
                                        if (res['description'])
                                            responseData['description'] = res['description']

                                        await exports.convertTime(res["length"].toString()).then(result => {
                                            responseData['duration'] = result
                                        })
                                        for (var key in res.format) {
                                            var obj = res.format[key];
                                            if (obj.filter == "native") {
                                                responseData['image'] = obj.picture
                                            }
                                        }
                                        if (res['tags'])
                                            responseData['tags'] = res.tags
                                        resolve(responseData)
                                    } else {
                                        resolve(false)
                                    }
                                }).catch(error => {
                                    resolve(false)
                                })
                            }
                        } else {
                            resolve(false)
                        }
                    }).catch(error => {
                        resolve(false)
                    })

                } else {
                    resolve(false)
                }
                break
            default:
                resolve(false)
                break;
        }

    })
}

exports.iframely = async (url, key, disallow, req) => {
    return new Promise(async (resolve, reject) => {
        const parseURL = require('url')
        const iurl = "http://iframe.ly/api/iframely?url=" + url + "&api_key=" + key
        const hostURL = parseURL.parse(url).hostname

        if (disallow && disallow != "") {
            const array = disallow.split(',')
            if (array.indexOf(hostURL) > -1) {
                resolve(false)
                return
            }
        }
        let responseData = {}
        await exports.getScript(iurl).then(async result => {
            if (result) {
                const parseResponse = JSON.parse(result)
                if (parseResponse.links) {
                    if (parseResponse.links.player) {
                        if (parseResponse.meta['title'])
                            responseData["title"] = parseResponse.meta['title']
                        if (parseResponse.meta['description'])
                            responseData["description"] = parseResponse.meta['description'];
                        if (parseResponse.meta["duration"])
                            await exports.convertTime(parseResponse.meta["duration"].toString()).then(result => {
                                responseData['duration'] = result
                            })
                        responseData['image'] = parseResponse.links.thumbnail[0]['href']
                        if (parseResponse.meta['tags'])
                            responseData['tags'] = parseResponse.meta['tags']
                        responseData['html'] = parseResponse.html
                        resolve(responseData)
                        return
                    }
                }
            }
            resolve(false)
        }).catch(error => {
            resolve(false)
        })
    })
}

 
exports.openAIBlog = async (req,content,word_count = 100000) => {
    let titleContent = `write a title for this article (${content})`;
    let titleData = await exports.openAIText(req,titleContent,100);
    let title;
    if(titleData.status){
        title = titleData.data.replace(/"/g, "")            
    }else{
        return {status:false,message:titleData.message}
    }
    let descriptionContent = `write a content for this article (${content}) in ${word_count} word max and put it in html`
    let descriptionData = await exports.openAIText(req,descriptionContent,200);
    let description;
    if(descriptionData.status){
        description = descriptionData.data            
    }else{
        return {status:false,message:descriptionData.message}
    }

    let tagContent = `write 10 tags seperated by # for this article (${content})`;
    let tagData = await exports.openAIText(req,tagContent,100);
    let tags;
    if(tagData.status){
        tags = tagData.data.replace(/#/g, ",") 
        tags = tags.replace(',',''); 
        tags = tags.replace(/\s/g, '') 
    }
    
    let imageData = await exports.openAIImage(req,title,"1024x1024",1);
    let images;
    if(imageData.status){
        images = imageData.data && imageData.data.length > 0 ? imageData.data[0].url : "" 
    }
    return ({status:true,data:{title:title,description:description,tags:tags,image:images}});

}
exports.openAIText = async (req,content,word_count = 10) => {
    let openAIKey = req.appSettings["openai_api_key"];
    let model = req.appSettings["openai_model"];
    if(!openAIKey || !model || !content){
        return {status:false,message:req.i18n.t("Required data missing.")};
    }
    var options = {
        'method': 'POST',
        'url': 'https://api.openai.com/v1/chat/completions',
        'headers': {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "model": model, 
            "messages": [
            {
                "role": "user",
                "content": content
            }
            ],
            "max_tokens": parseInt(word_count)
        })
    };
    return new Promise(async (resolve, _reject) => {
        return request(options, function (error, response) {
            try{
                if (error) return resolve({status:false,message:error.message});
                let data = JSON.parse(response.body)
                if (!data.choices) {
                    return resolve({status:false,message:error});
                }
                return resolve({status:true,data:data.choices[0].message.content});
            }catch(err) {
                return resolve({status:false,message:err});
            }
        });
    });

}

exports.openAIImage = async (req,content,size = "512x512",limit = 1) => {

    let openAIKey = req.appSettings["openai_api_key"];
    if(!openAIKey || !content){
        return {status:false,message:req.i18n.t("Required data missing.")};
    }
    var options = {
        'method': 'POST',
        'url': 'https://api.openai.com/v1/images/generations',
        'headers': {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "n": parseInt(limit) > 10 ? 10 : parseInt(limit) ,
            "prompt": content,
            "size": size
        })
    };
    return new Promise(async (resolve, _reject) => {
        request(options, function (error, response) {
            try{
                if (error) return resolve({status:false,message:error.message});
                let data = JSON.parse(response.body)
                if (!data) {
                    return resolve({status:false,message:error});
                }
                return resolve({status:true,data:data.data});
            }catch(err){
                return resolve({status:false,message:err});
            }
        });
    });

}

exports.generateImageFromOpenAi = (req,image) => {
    return new Promise((resolve,_reject) => {
        if(image.indexOf("cdn.openai.com") > -1 || image.indexOf("cover-ai") > -1 || image.indexOf("avtar-ai") > -1){
            let fileName = image
            // download image on local and upload on s3/wasabi if enabled
            const imageName = Date.now() + '_' + Math.random().toString(36).substring(7) + '.png';
            let image_path = req.serverDirectoryPath + `/public/upload/images/ai-image/` + imageName;
            if(!fs.existsSync(req.serverDirectoryPath + `/public/upload/images/ai-image`))
                fs.mkdirSync(req.serverDirectoryPath + `/public/upload/images/ai-image`, { recursive: true,mode:'0777' });

            let options = {
                url: fileName,
                dest: image_path
            } 
            download.image(options)
                .then(async ({ filename, image }) => {
                    if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                        await s3Upload(req,  image_path, image_path.replace(req.serverDirectoryPath + '/public', '')).then(result => {
                            //remove local file
                            exports.deleteImage(req, "", image_path, 'user/ai')
                        }).catch(err => {
                        })
                    }
                    resolve(image_path.replace(req.serverDirectoryPath + '/public', ''))
                    
                }).catch((err) => {
                    resolve(false)
                })
        }else{
            resolve(false)
        }
    });
}