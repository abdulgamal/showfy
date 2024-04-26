const express = require('express');
const router = express.Router();
const controller = require("../controllers/Audio")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.use(process.env.subFolder+'audio/successulPayment/:id',multer().none(),controller.successul)
router.use(process.env.subFolder+'audio/cancelPayment/:id',controller.cancel)
router.get(process.env.subFolder+'audio/purchase/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"audio",'view')
},controller.purchase);

router.use(process.env.subFolder+'mainsite/audio/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"audio",'view')
},controller.view);
router.get(process.env.subFolder+'mainsite/audio',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"audio",'view')
},multer().none(),controller.browse);
router.use(process.env.subFolder+'mainsite/create-audio/:id?',(req,res,next) => {
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    middlewareEnable.isEnable(req,res,next,"audio",permission)
},controller.create);

module.exports = router;