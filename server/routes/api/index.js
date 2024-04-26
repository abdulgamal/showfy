const express = require('express');
const dateTime = require("node-datetime");
const router = express.Router();
const multer = require("multer")
const enableSettings = require("../../middleware/enable_settings")
const commonFunction = require("../../functions/commonFunctions")
const fieldErrors = require('../../functions/error')
const globalModel = require("../../models/globalModel");
const notificationModel = require("../../models/notifications")

router.use(process.env.subFolder+'api/set-currency',multer().none(), async (req, res, next) => {

    if (!req.body.currency) {
        return res.send({
          error_code: "missing_parameter",
          error: true,
          status_code: 400,
          message: req.i18n.t("{{parameter}} parameter missing.", {
            parameter: "currency",
          }),
        });
      }
      let currency;
      await globalModel.custom(req,"SELECT * from currencies where ID = ? AND active = 1",req.body.currency).then(async result => {
        if(result){
            let results = JSON.parse(JSON.stringify(result));
            currency = results[0];
        }
    });
      
      if (!currency) {
        return res.status(400).send({
          error_code: "missing_parameter",
          status_code: 400,
          error: req.i18n.t("{{parameter}} parameter missing.", {
            parameter: "currency",
          }),
        });
      }
      if (req.user) {
        await globalModel.update(req,{preferred_currency:req.body.currency},"userdetails","user_id",req.user.user_id).then(result => {
                
        })
      }
      req.session.defaultUserCurrency = req.body.currency;
      return res.send({
        status_code: 200,
        status: 1,
        message: req.i18n.t("Currency updated successfully."),
      });
});
router.use(process.env.subFolder+'api/ai/choose-images',multer().none(), async (req, res, next) => {
    let type = req.body.type
    if(type != 'cover' && type != 'image'){
        return res.status(400).send({ error: "Invalid Request",status:400 }).end()
    }

    await globalModel.custom(req, "SELECT path as url FROM user_avtar_images WHERE type = ? AND enable = ?", [type == "cover" ? "covers" : "avtars",1]).then(result => {
        if (result) {
            return res.send(JSON.parse(JSON.stringify(result)));
        }
    }).catch(err => {
        return res.send({ error: "No images found to display.", status: 400 }).end();
    })


});

router.use(process.env.subFolder+'api/ai/content-generate',multer().none(), async (req, res, next) => {
    if(!req.user){
        res.send({error:"Please login."})
        return
    }

    let currentCurrency = req.currentCurrency
    let changeRate = parseFloat(currentCurrency.currency_value)

    let title = req.body.title
    let words = req.body.words ?? 10
    let type = req.body.type
    let image_counts = req.body.image_counts ?? 1
    let walletBalance = req.user.wallet
     if(!title){
         return res.send({ error: "Title is required field.", status: 400 }).end();
     }
     let price = 0;

     if(type == "textarea" || type == "tinymce") {
        price = parseFloat(req.appSettings.openai_description_price) || 0
      }else if(type == "blog"){
        price = parseFloat(req.appSettings.openai_blog_price) || 0
      }else {
        price = parseFloat(req.appSettings.openai_image_price) || 0
      }
    let wordsAllowed = Math.floor(walletBalance / price);
    let deductPrice = 0
      if(parseFloat(price) > 0 ){ 
        if(type == "blog"){
            if(parseFloat(walletBalance) < price){
                return res.send({ error: "Wallet balance is low, please recharge your wallet.", status: 400 }).end();
            }
        }else if(type != "file"){
            if(wordsAllowed < words){
                return res.send({ error: "Wallet balance is low, please recharge your wallet.", status: 400 }).end();
            }
        }else{
            if(wordsAllowed < image_counts){
                return res.send({ error: "Wallet balance is low, please recharge your wallet.", status: 400 }).end();
            }
        }
      }

    if(type === "file"){
         if((parseInt(image_counts) || 0) == 0){ 
             return res.send({ error: "Images Count is required field.", status: 400 }).end();
         }
    }else if(!words && type != "blog"){
        if((parseInt(words) || 0) == 0){
            return res.send({ error: "Words Count is required field.", status: 400 }).end();
        }
    }else if(type == "blog"){
        let allowedWords = parseInt(req.appSettings.openai_blog_description_count,10) || 0
        if((parseInt(words) || 0) == 0){
            return res.send({ error: "Words Count is required field.", status: 400 }).end();
        }else if( parseInt(allowedWords) > 0 && parseInt(words) > allowedWords){
            return res.send({ error: req.i18n.t("Words Count should be less than {{count}}.",{count:allowedWords}), status: 400 }).end();
        }
    }
    



     // generate images || description
     if(type == "file"){
        deductPrice = ((parseInt(image_counts)*price)/changeRate).toFixed(2)
         let responseData = await commonFunction.openAIImage(req,title,"512X512",parseInt(image_counts) ?? 1)
         if(responseData.status){
             res.send({data:responseData.data,status:200}).end()            
         }else{
             return res.send({error:responseData.message,status:400}).end()
         }
     }else if(type == "blog"){
        deductPrice = (price/changeRate).toFixed(2)
        let responseData = await commonFunction.openAIBlog(req,title,parseInt(words) ?? 100000)
         if(responseData.status){
             res.send({data:responseData.data,status:200}).end()
         }else{
             return res.send({error:responseData.message,status:400}).end()
         }
     }else{
        deductPrice = ((parseInt(words)*price)/changeRate).toFixed(2)
         let responseData = await commonFunction.openAIText(req,title,parseInt(words) ?? 1)
         if(responseData.status){
             res.send({data:responseData.data,status:200}).end()
         }else{
             return res.send({error:responseData.message,status:400}).end()
         }
     }

     //deduct balance from user account
    await globalModel
    .custom(req, "UPDATE users SET `wallet` = wallet - ? WHERE user_id = ?", [
        deductPrice,
      req.user.user_id,
    ])
    .then((result) => {});
     
    var dt = dateTime.create();
    var formatted = dt.format("Y-m-d H:M:S");
    let insertObject = {};
    insertObject["gateway_id"] = "1";
    insertObject["gateway_transaction_id"] = "";
    insertObject["owner_id"] = req.user.user_id;
    insertObject["state"] = "completed";
    insertObject["type"] = "ai_content";
    insertObject["id"] = "";
    insertObject["price"] = deductPrice;
    insertObject["currency"] = currentCurrency.ID;
    insertObject["change_rate"] = changeRate;
    insertObject["default_currency"] = req.appSettings["payment_default_currency"];
    insertObject["admin_commission"] = 0;
    insertObject["sender_id"] = req.user.user_id;
    insertObject["gateway_transaction_id"] = dt.getTime();

    insertObject["creation_date"] = formatted;
    insertObject["modified_date"] = formatted;

    await globalModel
      .create(req, insertObject, "transactions")
      .then((result) => {});
 
    // give credit points if configured by admin
    let dataNotification = {}
    dataNotification["type"] =  type != "file" ? "openai_description_create" : "openai_image_create"
    dataNotification["owner_id"] = req.user.user_id
    dataNotification["object_type"] = "ai_content"
    dataNotification["object_id"] =  "0"
    notificationModel.sendPoints(req,dataNotification,req.user.level_id);
 
     return;
 
 })
 

router.use(process.env.subFolder+'api', enableSettings,  require('./liveStreaming'));
router.use(process.env.subFolder+'api', enableSettings,  require('./stories'));
router.use(process.env.subFolder+'api', enableSettings,  require('./reels'));
router.use(process.env.subFolder+'api', enableSettings,  require('./dashboard'))
router.use(process.env.subFolder+'api', enableSettings,  require('./auth'));
router.use(process.env.subFolder+'api', enableSettings,  require('./search'));
router.use(process.env.subFolder+'api', enableSettings,  require('./report'));
router.use(process.env.subFolder+'api', enableSettings,  require('./video'));
router.use(process.env.subFolder+'api', enableSettings,  require('./movies'));
router.use(process.env.subFolder+'api', enableSettings,  require('./channel'));
router.use(process.env.subFolder+'api', enableSettings,  require('./comment'));
router.use(process.env.subFolder+'api', enableSettings,  require('./like'));
router.use(process.env.subFolder+'api', enableSettings,  require('./rattings'))

router.use(process.env.subFolder+'api', enableSettings,  require('./follow'));
router.use(process.env.subFolder+'api', enableSettings,  require('./favourite'));
router.use(process.env.subFolder+'api', enableSettings,  require('./blog'));
router.use(process.env.subFolder+'api', enableSettings,  require('./user'));
router.use(process.env.subFolder+'api', enableSettings,  require('./watchLater'))
router.use(process.env.subFolder+'api', enableSettings,  require('./playlists'))
router.use(process.env.subFolder+'api', enableSettings,  require('./audio'))
router.use(process.env.subFolder+'api', enableSettings,  require('./artist'))
router.use(process.env.subFolder+'api', enableSettings,  require('./notifications'))
router.use(process.env.subFolder+'api', enableSettings,  require('./ads'))
router.use(process.env.subFolder+'api', enableSettings,  require('./messages'))



router.use(process.env.subFolder+'api/contact',enableSettings,multer().none(), async (req, res, next) => {
    constant = require("../../functions/constant")
    let captchaToken = req.body.captchaToken
    if(req.appSettings['recaptcha_enable'] == 1  && !req.fromAPP){
        let isValidCaptcha = true;
        await commonFunction.checkCaptcha(req,captchaToken).then(result => {
        if(!result){
            isValidCaptcha = false;
        }
        }).catch(err => {
            isValidCaptcha = false;
            console.log(err,'error')
        })
        if(!isValidCaptcha){
            return res.send({ error: fieldErrors.errors([{ msg: constant.general.CAPTCHAVALIDATION }], true) }).end();
        }
    }
    const emailFunction = require("../../functions/emails")
    
    const globalModel = require("../../models/globalModel")
    await globalModel.custom(req, "SELECT vars,type FROM emailtemplates WHERE type = ?", ["contact"]).then(async resultsType => {
        if (resultsType) {
            const typeData = JSON.parse(JSON.stringify(resultsType))[0];
            let result = {}
            result.vars = typeData.vars
            result.type = "contact"

            result['usertitle'] = {}
            result['usertitle']["title"] = req.body.name
            result['usertitle']['type'] = "text"

            result['senderemail'] = {}
            result['senderemail']["title"] = req.body.email
            result['senderemail']['type'] = "text"

            result['message'] = {}
            result['message']["title"] = req.body.message
            result['message']['type'] = "text"

            result.ownerEmail = {language:"en"}
            result.toName = req.appSettings["contact_from_name"]
            result.toEmail = req.appSettings["contact_email_from"]
            result.disableFooter = true
            result.disableHeader = true
            emailFunction.sendMessage(req, result)
        }
    })
    res.send({message:constant.general.CONTACTSUCCESS})
});

router.use(process.env.subFolder+'api', enableSettings,  (req, res, next) => {
    return res.status(404).send({ error: [{ "message": "Invalid Request" }], status: 404 }).end()
});

module.exports = router;