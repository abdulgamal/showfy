const express = require('express');
const router = express.Router();
const dateTime = require('node-datetime');
const multer = require("multer")
const controller = require("../controllers/home");
const adscontroller = require("../controllers/ads");
const enablePublicLogin = require("../middleware/enable_public")
const globalModel = require("../models/globalModel")

 
router.use(process.env.subFolder+'mainsite/update-user-push-token',multer().none(), async (req, res) => {
    let token = req.body.token
    let user_id = req.user ? req.user.user_id : 0
    let oldToken = req.body.oldToken
    
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    await globalModel.custom(req,"SELECT * FROM devices WHERE push_token = ?",[token]).then(async result => {
        const devices = JSON.parse(JSON.stringify(result));
        if(oldToken && (!devices || devices.length == 0 || devices[0].push_token != oldToken)){
            await globalModel.delete(req,"devices","push_token",oldToken);
        }
        if(devices.length > 0){
            if(devices[0].push_token != oldToken && devices[0].owner_id != user_id)
                await globalModel.update(req,{owner_id: user_id,push_token:token,modified_date:formatted},"devices","push_token",token);
            else if(devices[0].owner_id != user_id)
            await globalModel.update(req,{owner_id: user_id,modified_date:formatted},"devices","push_token",token);
        }else{
            await globalModel.create(req,{owner_id: user_id,push_token:token,creation_date:formatted,modified_date:formatted},"devices");
        }
    })
    res.send({status:1});
    return;
})
router.use(process.env.subFolder+':install?', async (req, res, next) => {
    if(process.env.ALLOWALLUSERINADMIN && (req.query.theme == "default" || req.query.theme == "trendott")){
        req.session.selectedThemeUser = req.query.theme == "default" ? 1 : 2;
    }

    if(req.installScript){
        if(req.params.install == "install"){
            next()
            return
        }else{
            res.redirect(process.env.PUBLIC_URL+"/install")
            return
        }
    }
    var isValid = false;
    if (req.user && req.user.level_id == 1) {
        isValid = true
    } else {
        if(req.body.maintenance_code && !req.query.cronData){
            if(req.body.maintenance_code == req.appSettings.maintanance_code){
                req.session.maintanance = true
                res.redirect(process.env.PUBLIC_URL)
                res.end()
                return
                //next()
            }
        } 
        if (req.session && !req.session.maintanance && !req.query.cronData) {
            if (req.appSettings["maintanance"] == 1 && req.originalUrl.indexOf("mainsite") > -1) {
                
                const commonFunction = require("../functions/commonFunctions")
                await commonFunction.getGeneralInfo(req, res, 'maintenance')
                let appSettings = {}
                appSettings['favicon'] = req.appSettings['favicon']
                appSettings['darktheme_logo'] = req.appSettings['darktheme_logo']
                appSettings['lightheme_logo'] = req.appSettings['lightheme_logo']
                delete req.query.appSettings
                //delete req.query.languages
                delete req.query.levelPermissions
                const menus = { ...req.query.menus }
                req.query.appSettings = appSettings
                delete req.query.menus
                req.query.socialShareMenus = menus.socialShareMenus
                req.query.maintanance = true
                return res.send({...req.query,page_type:"maintenance"});
            } else {
                isValid = true
            }
        }else{
            isValid = true
        }
    }

    if(isValid){
        next()
    }
})


//member.site_public_access
router.use(require("./auth"))
router.use(require("./ipn"))
router.use(process.env.subFolder+'mainsite/qpayPayment/payments' ,adscontroller.qpayPaymentIPN)
router.use(process.env.subFolder+'mainsite/contact',controller.contact )
router.use(process.env.subFolder+'mainsite/privacy',controller.privacy )
router.use(process.env.subFolder+'mainsite/terms',controller.terms )
router.use(process.env.subFolder+'cron/execute',controller.cronFunction);
router.use(require("./dashboard"))
router.use(require("./member"))
router.use(process.env.subFolder+'mainsite/pages/:id',enablePublicLogin,controller.pages )
router.use(enablePublicLogin,require("./search"))
router.use(enablePublicLogin,require("./movies"))
router.use(enablePublicLogin,require("./comment"))
router.use(enablePublicLogin,require("./messages"))

router.use(enablePublicLogin,require("./video"))
router.use(enablePublicLogin,require("./livestreaming"))
router.use(enablePublicLogin,require('./channel'))
router.use(enablePublicLogin,require("./blog"))
router.use(enablePublicLogin,require('./playlists'))
router.use(enablePublicLogin,require('./audio'))
router.use(enablePublicLogin,require('./artist'))
router.use(enablePublicLogin,require('./reels'))

router.use(enablePublicLogin,require("./ads"))

router.use(process.env.subFolder+'home-data',enablePublicLogin, controller.homeData)
router.use(process.env.subFolder+'mainsite/:data?',enablePublicLogin, controller.index)
router.use(process.env.subFolder+'mainsite/*',enablePublicLogin, controller.notFound)
// router.use(process.env.subFolder+'*',enablePublicLogin, controller.notFound)
module.exports = router