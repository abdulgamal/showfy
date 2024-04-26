const express = require('express');
const router = express.Router();
const controller = require("../controllers/video")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")


router.use(process.env.subFolder+'videos/successulPayment/:id',multer().none(),controller.successul)
router.use(process.env.subFolder+'videos/cancelPayment/:id',controller.cancel)

router.get(process.env.subFolder+'videos/purchase/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"video",'view')
},controller.purchase);

router.get(process.env.subFolder+'video/download/:id/:type?',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"video",'download')
},controller.download);

router.use(process.env.subFolder+'mainsite/create-video/:id?',(req,res,next) => {
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    
    middlewareEnable.isEnable(req,res,next,"video",permission)
},controller.create);
router.use(process.env.subFolder+'mainsite/watch/:id?',(req,res,next) => {
    if(req.params.id){
        let id = req.params.id
        let movieID = id.substring(0, 4);
        if(movieID == "mov1"){
            middlewareEnable.isEnable(req,res,next,"movie",'view')
        }else{
            middlewareEnable.isEnable(req,res,next,"video",'view') 
        }
    }else
        middlewareEnable.isEnable(req,res,next,"video",'view')
},controller.view);
router.use(process.env.subFolder+'mainsite/embed/:id?',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"video",'view')
    req.embed = true;
},controller.view);
router.use(process.env.subFolder+'mainsite/video/categories',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"video",'view')
},controller.categories);
router.use(process.env.subFolder+'mainsite/video/category/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"video",'view')
},controller.category);
router.get(process.env.subFolder+'mainsite/videos/:pageType?',multer().none(),(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"video",'view')
},controller.browse);
router.get(process.env.subFolder+'ad-clicked/:type/:id/:video_id?',multer().none(),controller.adClicked);

module.exports = router; 