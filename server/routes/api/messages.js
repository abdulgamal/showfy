const router = require("express").Router();
const multer = require("multer");
const controller = require("../../controllers/api/messages");
const upload = require("../../functions/upload").upload;
const resize = require("../../functions/resize");
const path = require("path");
const fs = require("fs");
const isLogin = require("../../middleware/is-login");
const globalModel = require("../../models/globalModel");

router.post(
  "/messages/delete",
  isLogin,
  multer().none(),
  controller.deleteChat
);
router.post("/messages/:id?", isLogin, multer().none(), controller.index);
router.post("/message/delete", isLogin, multer().none(), controller.delete);

router.post(
  "/message/create",
  isLogin,
  (req, res, next) => {
    // if(req.body.video_upload){
        // req.allowedFileTypes = /mp4/
        // req.uploadDirect = true
        // var currUpload = upload('video_upload',"upload/images/messages/video/",req,"video")
        // currUpload(req,res,function(err){
        //     if(err){
        //         req.imageError = "Uploaded video is too large to upload, please choose smaller video and try again.";
        //         next()
        //     }else{
        //         req.videoName = req.file ? req.file.filename : false;
        //         next()
        //     }
        // });
    // }else{
    next();
    // }
  },
  async (req, res, next) => {
    if (req.videoName) {
      next();
      return;
    }
    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    var currUpload = upload("upload", "upload/images/messages/", req);
    req.imageResize = [{ width: req.widthResize, height: req.heightResize }];
    currUpload(req, res, function (err) {
      if (err) {
        //req.imageError = "Uploaded image is too large to upload, please choose smaller image and try again.";
        next();
      } else {
        req.fileName = req.file ? req.file.filename : false;
        if (
          req.file &&
          req.appSettings.upload_system != "s3" &&
          req.appSettings.upload_system != "wisabi"
        ) {
          const extension = path.extname(req.fileName);
          const file = path.basename(req.fileName, extension);
          const pathName =
            req.serverDirectoryPath + "/public/upload/images/messages/";
          const newFileName = file + "_main" + extension;
          var resizeObj = new resize(pathName, req.fileName, req);
          resizeObj
            .save(pathName + newFileName, {
              width: req.widthResize,
              height: req.heightResize,
            })
            .then((res) => {
              if (res) {
                fs.unlink(pathName + req.fileName, function (err) {
                  if (err) {
                    console.error(err);
                  }
                });
                req.fileName = newFileName;
                next();
              } else {
                req.imageError =
                  "Your image contains an unknown image file encoding. The file encoding type is not recognized, please use a different image.";
                next();
              }
            });
        } else if (
          req.originalS3ImageName &&
          (req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi")
        ) {
          req.fileName = req.originalS3ImageName;
          next();
        } else {
          next();
        }
      }
    });
    // }else{
    //     next()
    // }
  },
  controller.create
);

module.exports = router;
