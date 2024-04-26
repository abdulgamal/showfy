const express = require('express');
const router = express.Router();
const controller = require("../controllers/auth")
const commonFunction = require("../functions/commonFunctions")

router.use(process.env.subFolder+'mainsite/logout', async (req, res, next) => {
    req.session.logout = 1;
    if(!req.user){
        res.send({logout:1})
        return
    }
   // req.logOut()
     
    //remove app udid
    if(req.session.fromAPP){
        const devicedModel = require('../models/devices')
         devicedModel.createDevice(req, {owner_id:req.session.user,device_udid:req.session.device_udid,type:"delete"}).then(async result => {

        });
    }

    req.session.user = null;
    req.session.logout = 1
    await commonFunction.getGeneralInfo(req, res, 'logout')
    return res.send({...req.query,page_type:"logout"});
    
})
router.get(process.env.subFolder+'mainsite/login',controller.login);
router.get(process.env.subFolder+'mainsite/signup',controller.signup);
router.get(process.env.subFolder+'mainsite/signup/invite/:code',controller.invitesignup);
router.get(process.env.subFolder+'mainsite/forgot',controller.forgotPassword);
router.get(process.env.subFolder+'mainsite/reset/:code',controller.verifyCode);
router.get(process.env.subFolder+'mainsite/verify-account/:code?',controller.verifyAccount)
module.exports = router;