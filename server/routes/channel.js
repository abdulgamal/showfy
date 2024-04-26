const express = require('express');
const router = express.Router();
const controller = require("../controllers/channel")
const support = require("../controllers/channelSupport")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.use(process.env.subFolder+'mainsite/create-channel/:id?',(req,res,next) => {
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    middlewareEnable.isEnable(req,res,next,"channel",permission)
},controller.create);
router.use(process.env.subFolder+'mainsite/channel/categories',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"channel",'view')
},controller.categories);
router.use(process.env.subFolder+'mainsite/channel/category/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"channel",'view')
},controller.category);
router.use(process.env.subFolder+'mainsite/post/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"channel",'view')
},controller.post);
router.use(process.env.subFolder+'mainsite/channel/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"channel",'view')
},controller.view);
router.get(process.env.subFolder+'mainsite/channels',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"channel",'view')
},multer().none(),controller.browse);


router.use("/support/cancelPayment", support.cancel)
router.use("/support/successulPayment/:id?/:type?",multer().none(), support.successul)
router.use("/support/finishPayment", support.finishPayment)
router.use("/support/:id/:type",support.browse) 

module.exports = router;