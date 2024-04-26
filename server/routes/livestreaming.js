const express = require('express');
const router = express.Router();
const controller = require("../controllers/livestreaming")
const videoController = require("../controllers/video")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.use(process.env.subFolder+'media-streaming/:path.html', async (req, res, next) => {
    path = req.params.path+".html"
    // if(path.indexOf(".html") < 0){
    //     path = path+".html"
    // }
    res.sendFile(req.streamingPATH+path)
})

router.get(process.env.subFolder+'mainsite/live-streaming/:custom_url?',multer().none(),async (req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"livestreaming",'create')
},controller.create);


router.get(process.env.subFolder+'mainsite/live',multer().none(),(req,res,next) => {
    req.isLiveStreaming = true
    next()
},videoController.browse);
module.exports = router; 