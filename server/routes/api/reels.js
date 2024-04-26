const router = require('express').Router()
const multer = require("multer")
const controller = require('../../controllers/api/reels')
const upload = require('../../functions/upload').upload
const resize = require("../../functions/resize")
const path = require("path")
const fs = require("fs")
const { check } = require('express-validator')
const reelModel = require("../../models/reels")
const constant = require("../../functions/constant")
const privacyMiddleware = require("../../middleware/has-permission")
const isLogin = require("../../middleware/is-login")


router.post('/reels/get-reels',isLogin,multer().none(),controller.getReels)

router.post('/reels/delete/:reel_id',isLogin,multer().none(),async (req,res,next) => {
    const id = req.params.reel_id
    await reelModel.getReel(req,id).then(result => {
        if(result){
            req.item = result
        }
    }) 
    
    privacyMiddleware.isValid(req,res,next,'reels','delete')
},controller.delete)


router.post('/reels/create',isLogin,(req,res,next) => {
    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/
    var currUpload = upload('image',"upload/images/reels/video/",req)
    req.imageResize = [
        {  width: req.widthResize, height: req.heightResize }
    ];
    currUpload(req,res,function(err){
        if(err){
             req.imageError = "Uploaded image is too large to upload, please choose smaller image and try again.";
             next()
        }else{
            req.fileName = req.file ? req.file.filename : false;
            if( req.file && req.appSettings.upload_system != "s3"  && req.appSettings.upload_system != "wisabi"){
                const extension = path.extname(req.fileName);
                const file = path.basename(req.fileName,extension);
                const pathName = req.serverDirectoryPath+"/public/upload/images/reels/video/"
                const newFileName = file+"_main"+extension;
                var resizeObj = new resize(pathName,req.fileName,req)
                resizeObj.save(pathName+newFileName,{  width: req.widthResize, height: req.heightResize }).then(res => {
                    if(res){
                        fs.unlink(pathName+req.fileName,function (err) {            
                            if (err) {                                                 
                                console.error(err);                                    
                            }                                                          
                        });    
                        req.fileName = newFileName;
                        next()
                    }else{
                        req.imageError = "Your image contains an unknown image file encoding. The file encoding type is not recognized, please use a different image.";
                        next()
                    }
                })
            }else if(req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi"){
                req.fileName = req.originalS3ImageName
                next()
            }else{
                next()
            }
        }
    });
},[
    check("title").not().isEmpty().withMessage(constant.error.TITLEMESSAGE).trim(),
  ],controller.create)


router.post('/reels/upload',isLogin,(req,res,next) => {
    
    req.allowedFileTypes = /mp4|mov|webm|mpeg|3gp|avi|flv|ogg|mkv|mk3d|mks|wmv/
    req.uploadDirect = true
    var currUpload = upload('upload',"upload/reels/video/",req,"video")
    currUpload(req,res,function(err){
        if(err){
             req.imageError = "Uploaded video is too large to upload, please choose smaller video and try again.";
             next()
        }else{
            req.fileName = req.file ? req.file.filename : false;
            next()
        }
    });
},controller.upload)
module.exports = router;