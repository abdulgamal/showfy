const router = require('express').Router()
const controller = require("../../controllers/api/stories")
const isLogin = require("../../middleware/is-login")
const multer = require("multer")
const upload = require('../../functions/upload').upload
const resize = require("../../functions/resize")
const path = require("path")
const fs = require("fs")

router.post('/stories/privacy',isLogin,multer().none(), controller.privacy)
router.post('/stories/get-privacy',isLogin,multer().none(), controller.getprivacy)
router.post('/stories/get-stories',multer().none(), controller.getStories)
router.post('/stories/get-update-viewer',multer().none(), controller.getViewerStories)
router.post('/stories/get-archive-stories',isLogin,multer().none(), controller.getArchiveStories)
router.post('/stories/get-muted-users',isLogin,multer().none(), controller.getMutedUsers)

router.post('/stories/delete/:id',isLogin,multer().none(), controller.delete)
router.post('/stories/mute/:id',isLogin,multer().none(), controller.mute)


router.post('/stories/create/video',isLogin,(req, res, next) => {
    req.uploadType = "videoStory";
    req.uploadDirect = true
    req.uploadFields = [
    { 
        name: 'videoStories', 
        maxCount: 1 
    }, 
    { 
        name: 'image', 
        maxCount: 1 
    }
    ];
    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/
    var currUpload = upload(false,"upload/stories/",req,'pass')
    req.imageResize = [
        {  width: req.widthResize, height: req.heightResize }
    ];
    currUpload(req,res,function(err){
        if(err){
             req.imageError = "Uploaded image is too large to upload, please choose smaller image and try again.";
             next()
        }else{
            req.fileName = req.files && req.files.image && req.files.image.length ? req.files.image[0].filename : false;
            req.videoName = req.files && req.files.videoStories && req.files.videoStories.length ? req.files.videoStories[0].filename : false;
            if( req.fileName && req.appSettings.upload_system != "s3"  && req.appSettings.upload_system != "wisabi"){
                const extension = path.extname(req.fileName);
                const file = path.basename(req.fileName,extension);
                const pathName = req.serverDirectoryPath+"/public/upload/stories/"
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
            }
            // else if(req.fieldImageName && (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi")){
            //     req.fileName = req.fieldImageName['image']
            //     req.videoName = req.fieldImageName['videoStories']
            //     next()
            // }
            else{
                next()
            }
        }
    });

}, controller.create)
router.post('/stories/create/text',multer().none(), isLogin,(req, res, next) => {
    req.uploadType = "textStory";
    next();
},controller.create);

router.post('/stories/create/audio',isLogin,(req, res, next) => {
    req.uploadType = "audioStory";
    req.uploadDirect = true;
    req.uploadFields = [
    { 
        name: 'audioStories', 
        maxCount: 1 
    }, 
    { 
        name: 'image', 
        maxCount: 1 
    }
    ];
    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/
    var currUpload = upload(false,"upload/stories/",req,'pass')
    req.imageResize = [
        {  width: req.widthResize, height: req.heightResize }
    ];

    currUpload(req,res,function(err){
        if(err){
             req.imageError = "Uploaded image is too large to upload, please choose smaller image and try again.";
             next()
        }else{
            req.fileName = req.files && req.files.image && req.files.image.length ? req.files.image[0].filename : false;
            req.audioName = req.files && req.files.audioStories && req.files.audioStories.length ? req.files.audioStories[0].filename : false;
            if( req.fileName && req.appSettings.upload_system != "s3"  && req.appSettings.upload_system != "wisabi"){
                const extension = path.extname(req.fileName);
                const file = path.basename(req.fileName,extension);
                const pathName = req.serverDirectoryPath+"/public/upload/stories/"
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
            }
            // else if(req.fieldImageName && (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi")){
            //     req.fileName = req.fieldImageName['image']
            //     req.audioName = req.fieldImageName['audioStories']
            //     next()
            // }
            else{
                next()
            }
        }
    });

}, controller.create)

router.post('/stories/create/image',isLogin,(req, res, next) => {
    req.uploadType = "imageStory";
    req.uploadDirect = true;
    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/
    var currUpload = upload("image","upload/stories/",req,'pass')
    req.imageResize = [
        {  width: req.widthResize, height: req.heightResize }
    ];
    currUpload(req,res,function(err){
        if(err){
             req.imageError = "Uploaded image is too large to upload, please choose smaller image and try again.";
             next()
        }else{
            req.fileName = req.file ? req.file.filename : false;
            if( req.fileName && req.appSettings.upload_system != "s3"  && req.appSettings.upload_system != "wisabi"){
                const extension = path.extname(req.fileName);
                const file = path.basename(req.fileName,extension);
                const pathName = req.serverDirectoryPath+"/public/upload/stories/"
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
            }
            // else if((req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi")){
            //     req.fileName = req.originalS3ImageName
            //     next()
            // }
            else{
                next()
            }
        }
    });

}, controller.create)

module.exports = router;