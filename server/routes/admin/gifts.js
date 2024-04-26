const express = require('express');
const router = express.Router();
const controller = require("../../controllers/admin/gifts")
const is_admin = require("../../middleware/admin/is-admin")

const resize = require("../../functions/resize")
const upload = require("../../functions/upload").upload
const path = require("path")
const fs = require("fs")


router.use("/gifts/settings",is_admin,controller.settings)
router.use("/gifts/levels/:level_id?",is_admin,controller.levels)
router.post("/gifts/approve/:id",is_admin,controller.approve)
router.use("/gifts/payments/:page?",is_admin,controller.payments)

router.use("/gifts/create/:id?",is_admin, async (req, res, next) => {
    req.allowedFileTypes = /jpeg|jpg|png|gif|webp/
    req.imageResize = [
        { width: 200, height: 200 }
    ];
    var currUpload = upload('file', "upload/images/gifts/", req)
    currUpload(req, res, function (err) {
        if (err) {
            req.imageError = err.message;
            next()
        } else {
            req.fileName = req.file ? req.file.filename : false;
            if (req.file && req.appSettings.upload_system != "s3"  && req.appSettings.upload_system != "wisabi") {
                const extension = path.extname(req.fileName);
                const file = path.basename(req.fileName, extension);
                const pathName = req.serverDirectoryPath + "/public/upload/images/gifts/"
                const newFileName = file + "_main" + extension;
                var resizeObj = new resize(pathName, req.fileName, req)
                resizeObj.save(pathName+newFileName,{ width: req.widthResize, height: req.heightResize }).then(res => {
                    if(res){
                        fs.unlink(pathName + req.fileName, function (err) {
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
            }else if(req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                req.fileName = req.originalS3ImageName
                next()
            } else {
                next()
            }
        }
    });
},controller.createGifts)
router.get("/gifts/delete/:id?",is_admin,controller.deleteGifts)
router.get("/gifts/payment/delete/:id?",is_admin,controller.deletePayments)

router.get("/gifts/:page?",is_admin,controller.gifts)
module.exports = router;