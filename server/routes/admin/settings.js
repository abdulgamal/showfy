const express = require('express')
const router = express.Router()
const {upload} = require("../../functions/upload")
const resize = require("../../functions/resize")
const controller = require("../../controllers/admin/settings")
const is_admin = require("../../middleware/admin/is-admin")

router.get('/settings',is_admin, controller.settings);
router.post('/settings',is_admin, controller.settings);


router.get('/settings/email',is_admin, controller.emails);
router.post('/settings/email',is_admin, controller.emails);

router.get('/settings/login',is_admin, controller.login);
router.post('/settings/login',is_admin, controller.login);
router.get('/settings/recaptcha',is_admin, controller.recaptcha);
router.post('/settings/recaptcha',is_admin, controller.recaptcha);

router.get('/settings/s3',is_admin, controller.s3);
router.post('/settings/s3',is_admin, controller.s3);

router.get('/settings/newsletter',is_admin, controller.newsletter);
router.post('/settings/newsletter',is_admin, controller.newsletter);

router.get('/settings/contact',is_admin, controller.contact);
router.post('/settings/contact',is_admin, controller.contact);

router.get('/settings/signup',is_admin, controller.signup);
router.post('/settings/signup',is_admin, controller.signup);
router.get('/settings/otp',is_admin, controller.otp);
router.post('/settings/otp',is_admin, controller.otp);

router.get('/pwa',is_admin, controller.pwa);
router.post('/pwa',is_admin, controller.pwa);

router.get('/ai/delete-image/:id',is_admin, controller.aiDeleteImage);
router.get('/ai/settings',is_admin, controller.aiSettings);
router.post('/ai/settings',is_admin, controller.aiSettings);
router.get('/ai/levels/:level_id?',is_admin, controller.aiLevels);
router.post('/ai/levels/:level_id?',is_admin, controller.aiLevels);
router.get('/ai/avtars',is_admin, controller.aiAvtars);
router.post('/ai/avtars',is_admin, controller.aiAvtars);
router.get('/ai/covers',is_admin, controller.aiCovers);
router.post('/ai/covers',is_admin, controller.aiCovers);
router.post('/ai/import/images',is_admin, controller.aiImportImages);

router.post('/ai/upload/images/:type',is_admin,(req,res,next) => {
    req.allowedFileTypes = /jpeg|jpg|png|webp|gif/
    let isCover = req.params.type
   req.fromadmin = true;
    var currUpload = upload('file',`upload/images/${isCover == "true" ? "cover-ai" : "avtar-ai"}/`,req)
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
}, controller.UploadAIImagesDirect);


module.exports = router;