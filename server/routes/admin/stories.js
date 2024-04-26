const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/stories")
const is_admin = require("../../middleware/admin/is-admin")
const upload = require("../../functions/upload").upload

router.post('/stories/background/approve/:id',is_admin, controller.approve);
router.get('/stories/background/delete/:id',is_admin, controller.delete);
router.get('/story/delete/:id',is_admin, controller.deleteStory);


router.get('/stories/background',is_admin, controller.background);
router.post('/stories/background',is_admin,(req,res,next) => {

    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/
   req.fromadmin = true;
    //req.uploadDirect = true
    var currUpload = upload('file',"upload/images/stories/background/",req,'fromadmin')
    currUpload(req,res,function(err){ 
        req.fromadmin = false;
        if(err){
            console.log(err);
            req.imageError = err.message;
            next()
       }else{
           req.fileName = req.file ? req.file.filename : false;
            if(req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi"){
               req.fileName = req.originalS3ImageName
               next()
           }else{
               next()
           }
       }
    });
}, controller.background);
router.get('/stories/settings',is_admin, controller.settings);
router.post('/stories/settings',is_admin, controller.settings);
router.get('/stories/levels/:level_id?',is_admin, controller.levels);
router.post('/stories/levels/:level_id?',is_admin, controller.levels);
router.get('/stories/:page?',is_admin, controller.index);
router.post('/stories',is_admin, controller.index);
module.exports = router;