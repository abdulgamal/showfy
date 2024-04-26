const express = require('express');
const router = express.Router();
const controller = require("../controllers/ads")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.use(process.env.subFolder+'mainsite/create-ad/:id?',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"ads",'create')
},controller.create);

router.use(process.env.subFolder+'ads/successulPayment',(req,res,next) => {
    console.log(req.session,' -------------------------------- middle');
    next();
},multer().none() ,controller.successul)
router.use(process.env.subFolder+'ads/cancelPayment',controller.cancel)

router.use(process.env.subFolder+'ads/recharge',multer().none(),(req,res,next) => {
    // middlewareEnable.isEnable(req,res,next,"ads",'view')
    next();
},controller.recharge);
module.exports = router;