const { validationResult } = require('express-validator')
const fieldErrors = require('../../functions/error')
const errorCodes = require("../../functions/statusCodes")
const constant = require("../../functions/constant")
const globalModel = require("../../models/globalModel")
const commonFunction = require("../../functions/commonFunctions")
const ffmpeg = require("fluent-ffmpeg")
const s3Upload = require('../../functions/upload').uploadtoS3
const resize = require("../../functions/resize")
const dateTime = require('node-datetime')
const path = require('path')
const uniqid = require('uniqid')
const reelModel = require("../../models/reels")
const socketio = require("../../socket")
const notifications = require("../../models/notifications")
const notificationModel = require("../../models/notifications")
const moment = require("moment");
const privacyModel = require("../../models/privacy")


exports.getReels = async (req,res) => {
    let ids = req.body.ids

    let limit = 11

    let reels = []
    let pagging = false;

    let data = {}
    data.not_in_ids = ids.split(",")

    if(req.body.user_id){
        data.user_id = req.body.user_id
    }
    data.limit = limit
    await reelModel.getReels(req,  data).then(result => {
        if (result) {
            reels = result
            if (result.length > limit-1) {
                items = result.splice(0, limit-1);
                pagging = true
            }
        }
    }).catch(err => {})

    for(let i=0;i<reels.length;i++){
        await privacyModel.permission(req, 'reels', 'delete', reels[i]).then(result => {
            reels[i].canDelete = result
        }).catch(err => {})
        await privacyModel.permission(req, 'reels', 'edit', reels[i]).then(result => {
            reels[i].canEdit = result
        }).catch(err => {})
    }

    return res.send({reels:reels,pagging: pagging})

}

exports.delete = async (req, res) => {
    if (!req.item) {
        return res.send({ error: fieldErrors.errors([{ msg: constant.general.PERMISSION_ERROR }], true), status: errorCodes.invalid }).end();
    }

    await reelModel.deleteReel(req,req.item).then(result => {
        if (result) {
            commonFunction.deleteImage(req, res, "", "reel", req.item)
            res.send({"message":constant.reel.DELETED})
            socketio.getIO().emit('reelDeleted', {
                "reel_id": req.item.reel_id,
                "message": constant.reel.DELETED,
            });
        }else{
            res.send({})
        }
    })

   

}
exports.create = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, "", true);
    if (req.imageError) {
        return res.send({ error: fieldErrors.errors([{ msg: req.imageError }], true), status: errorCodes.invalid }).end();
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send({ error: fieldErrors.errors(errors), status: errorCodes.invalid }).end();
    }
    
    // all set now
    let insertObject = {}
    let id = req.body.id
    let reelObject = {}
    if (id) {
        //uploaded
        await globalModel.custom(req, "SELECT * FROM reels WHERE reel_id = ?", id).then(async result => {
            if (result && result.length) {
                reelObject = JSON.parse(JSON.stringify(result))[0];
            }else{
                id = null
            }
        }).catch(err => {

        })
    } else {
        insertObject["owner_id"] = req.user.user_id;
    }
    
    insertObject["title"] = req.body.title
    insertObject["description"] = req.body.description ? req.body.description : ""
    insertObject["view_privacy"] = req.body.privacy ? req.body.privacy : 'everyone'
    
    if (insertObject["view_privacy"] == "password")
        insertObject["view_privacy"] = "everyone"
        

    if(req.body.scheduled){
        let dateS = moment(req.body.scheduled)
        insertObject["scheduled"] = dateS.tz(process.env.TZ).format("YYYY-MM-DD HH:mm:ss");
    }else{
        insertObject["scheduled"] = null
    }

    if (req.body.duration && req.body.duration != "undefined")
        insertObject["duration"] = req.body.duration

    
    if (req.body.reelImage) {
        if(req.body.reelImage.indexOf(process.env.PUBLIC_URL) < 0) 
            insertObject['image'] = req.body.reelImage
        let image = await commonFunction.generateImageFromOpenAi(req,req.body.reelImage)
        if(image){
            insertObject['image'] = image
            if(Object.keys(reelObject).length && reelObject.image)
                commonFunction.deleteImage(req, res, reelObject.image, 'reel/image');
        }
    }else if (req.fileName) { 
        insertObject['image'] = "/upload/images/reels/video/" + req.fileName; 
    }else{
        insertObject['image'] = "";
        if(Object.keys(reelObject).length && reelObject.image)
            commonFunction.deleteImage(req, res, reelObject.image, 'reel/image');
    }

   

    if (Object.keys(reelObject).length && id) {
        if (!req.fileName && !req.body.fromEdit) { 
            const image = reelObject.image
            if (image) {
                const extension = path.extname(image)
                const file = path.basename(image, extension)
                const pathName = req.serverDirectoryPath + "/public"
                const newFileName = file + "_video" + extension
                req.imageResize = [
                    { width: req.widthResize, height: req.heightResize }
                ];
                var resizeObj = new resize(pathName, image, req)
                await resizeObj.save(pathName+"/upload/images/reels/video/" + newFileName).then(async res => {
                    commonFunction.deleteImage(req, res, reelObject.image, 'reel/image');
                    insertObject['image'] = "/upload/images/reels/video/" + newFileName;
                    if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                        await s3Upload(req, req.serverDirectoryPath +"/public"+ insertObject['image'], insertObject['image']).then(result => {
                            //remove local file
                            commonFunction.deleteImage(req, res, insertObject['image'], 'locale')
                        }).catch(err => {

                        })
                    }
                })
            }
        } else {
            if (req.fileName) {
                insertObject['image'] = "/upload/images/reels/video/" + req.fileName;
                commonFunction.deleteImage(req, res, reelObject.image, 'reel/image');
            }
        }
        if(!req.body.fromEdit){
            if(req.appSettings["video_ffmpeg_path"] && req.appSettings["video_ffmpeg_path"] != "" && reelObject.video_location.indexOf(".mp4") == -1){
                insertObject['status'] = 2;
            }else{
                insertObject["status"] = 1;

                //upload video to s3
                if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                    await s3Upload(req, req.serverDirectoryPath +"/public"+ reelObject['video_location'], reelObject['video_location']).then(result => {
                        //remove local file
                        commonFunction.deleteImage(req, res, reelObject['video_location'], 'locale')
                    }).catch(err => {

                    })
                }
            }
        }
    }
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
    if (!Object.keys(reelObject).length || !reelObject.custom_url) {
        insertObject["creation_date"] = formatted
        if(reelObject.video_location.indexOf(".mp4") > -1)
            insertObject["completed"] = 1
    }
    insertObject["modified_date"] = formatted


    if (id) {
        //update existing video
        await globalModel.update(req, insertObject, "reels", 'reel_id', id).then(async result => {

            
            if(!reelObject["view_privacy"]){
                let dataNotification = {}
                dataNotification["type"] = "reels_create"
                dataNotification["owner_id"] = req.user.user_id
                dataNotification["object_type"] = "reels"
                dataNotification["object_id"] =  reelObject.reel_id
                notificationModel.sendPoints(req,dataNotification,req.user.level_id);
            }
            let videoObj = null
            await reelModel.getReel(req,reelObject['reel_id'] ? reelObject['reel_id'] : insertObject['reel_id']).then(result => {
                if(result){
                    if(result.scheduled){
                        let date = moment(result.scheduled)
                        result.scheduled = date.tz(process.env.TZ).toDate();
                    }
                    videoObj = result
                }
            })
            return res.send({editItem:videoObj, reel_id: id, message:reelObject['view_privacy'] ?  constant.reel.EDIT : constant.reel.SUCCESS });
            
        }).catch(err => {
            console.log(err)
            return res.send({ error: fieldErrors.errors([{ msg: constant.general.DATABSE }], true), status: errorCodes.invalid }).end();
        })
    } else {
        //create new video
        await globalModel.create(req, insertObject, "reels").then(async result => {
            if (result) {
                
                let videoObj = null
                await reelModel.getReel(req,reelObject.reel_id).then(result => {
                    if(result){
                        if(result.scheduled){
                            let date = moment(result.scheduled)
                            result.scheduled = date.tz(process.env.TZ).toDate();
                        }
                        videoObj = result
                    }
                })

                let imagevideo = ""
                if(insertObject['image']){
                    imagevideo = insertObject['image']
                }else{
                    imagevideo = req.appSettings['reels_default_photo']
                }
                
                
                if(!insertObject["scheduled"]){
                    await notificationModel.insertFollowNotifications(req,{subject_type:"users",subject_id:req.user.user_id,object_type:"reels",object_id:result.insertId,type:"members_followed"}).then(result => {

                    }).catch(err => {
                        console.log(err)
                    })
                }
                let dataNotification = {}
                dataNotification["type"] = "reels_create"
                dataNotification["owner_id"] = req.user.user_id
                dataNotification["object_type"] = "reels"
                dataNotification["object_id"] =  result.insertId
                notificationModel.sendPoints(req,dataNotification,req.user.level_id);
                        
                res.send({editItem:videoObj,reel_id: result.insertId, message: constant.reel.SUCCESS, title:insertObject['title'],image:imagevideo });
            } else {
                return res.send({ error: fieldErrors.errors([{ msg: constant.general.DATABSE }], true), status: errorCodes.invalid }).end();
            }
        }).catch(err => {
            console.log(err)
            return res.send({ error: fieldErrors.errors([{ msg: constant.general.DATABSE }], true), status: errorCodes.invalid }).end();
        })
    }
}


exports.convertVideo = async(req,reelObject) => {
    return new Promise(async (resolve,reject) =>  {
        const res = {}
        const videoLocation = reelObject.video_location
        const FFMPEGpath = req.appSettings.video_ffmpeg_path
        const id = reelObject.reel_id
        //convert videos
        var orgPath = req.serverDirectoryPath + "/public" + videoLocation
        ffmpeg.setFfprobePath(req.appSettings["video_ffmpeg_path"].replace("ffmpeg",'ffprobe'));
	    ffmpeg.setFfmpegPath(req.appSettings["video_ffmpeg_path"]);
        let command = ffmpeg(orgPath)
            //.audioCodec('libfaac')
            .videoCodec('libx264')
            .format('mp4');
        const videoName = uniqid.process('v')
        const path_240 = "/public/upload/reels/video/" + videoName + ".mp4"
        
        let is_validVideo = false
        await module.exports.executeFFMPEG(command, req.serverDirectoryPath + path_240, 240, orgPath, FFMPEGpath, "", req).then(async result => {
            //upate video 240
            if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                await s3Upload(req, req.serverDirectoryPath + path_240, path_240.replace("/public",'')).then(result => {
                    //remove local file
                    commonFunction.deleteImage(req, res, path_240.replace("/public",''), 'locale')
                }).catch(err => {
                })
            }
            const updatedObject = {}
            updatedObject["video_location"] = path_240.replace('/public', '')
            await globalModel.update(req, updatedObject, "reels", "reel_id", id).then(result => {
            
            }).catch(error => {

            })
            is_validVideo = true
        }).catch(err => {
            console.log(err)
        })
                

        const updatedObject = {}
        if (is_validVideo)
            updatedObject["status"] = 1
        else
            updatedObject["status"] = 3
        updatedObject['completed'] = 1


        //unlink org file
        if (videoLocation)
            commonFunction.deleteImage(req, res, videoLocation.replace("/public",''), "reel/video")

        await globalModel.update(req, updatedObject, "reels", "reel_id", id).then(async result => {
            //send socket data

        }).catch(error => {

        })
        if (is_validVideo) {
            notifications.insert(req, {owner_id:reelObject.owner_id,insert:true, type: "reels_processed_complete", subject_type: "users", subject_id: reelObject.owner_id, object_type: "reels", object_id: id,forceInsert:true }).then(result => {

            }).catch(err => {

            })
            notificationModel.insertFollowNotifications(req, { subject_type: "users", subject_id: reelObject.owner_id, object_type: "reels", object_id: id, type: "members_followed" }).then(result => {

            }).catch(err => {

            })
            let dataNotification = {}
            dataNotification["type"] = "reels_create"
            dataNotification["owner_id"] = req.user.user_id
            dataNotification["object_type"] = "reels"
            dataNotification["object_id"] =  id
            notificationModel.sendPoints(req,dataNotification,req.user.level_id);
        } else {
            notifications.insert(req, {owner_id:reelObject.owner_id,insert:true, type: "reels_processed_failed", subject_type: "users", subject_id: reelObject.owner_id, object_type: "reels", object_id: id,forceInsert:true }).then(result => {

            }).catch(err => {

            })
        }
        socketio.getIO().emit('reelsCreated', {
            id :  reelObject.reel_id,
            status: is_validVideo ? 1 : 0
        });
        resolve(true)
    })
}

exports.executeFFMPEG = async (command, filePath, resolution, orgPath, FFMPEGpath, watermarkImage, req) => {
    return new Promise((resolve, reject) => {
        command.clone()
            .outputOption([
                "-preset", req.appSettings['video_conversion_type'] ? req.appSettings['video_conversion_type']  : "ultrafast",
                "-filter:v", "scale=iw:ih:-2",
                "-crf 26",
            ])
            .on('start', function (commandLine) {
                //console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('progress', (progress) => {
                //console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
            })
            .on('error', (err) => {
                reject(false);
            })
            .on('end', () => {
                resolve(true);
            }).save(filePath)
    })
}

exports.upload = async (req, res) => {
    if (req.imageError) {
        return res.send({ error: fieldErrors.errors([{ msg: req.imageError }], true), status: errorCodes.invalid }).end();
    }
    
    let basePath = req.serverDirectoryPath + "/public"
    const filePath = basePath + "/upload/reels/video/" + req.fileName
    let images = []
    let duration = 0
    let videoWidth = 0, videoHeight = 0, size = 0

    if(!req.appSettings["video_ffmpeg_path"] || req.appSettings["video_ffmpeg_path"] == ""){
        let reelObject = {}
        reelObject["owner_id"] = req.user.user_id;
        reelObject["video_location"] = "/upload/reels/video/" + req.fileName
        reelObject['title'] = "Untitled"
        // reelObject['view_privacy'] = "everyone"
        reelObject['description'] = ""
        reelObject['completed'] = "0"
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');
        reelObject['creation_date'] = formatted
        reelObject['modified_date'] = formatted
        reelObject['status'] = 2
        reelObject['size'] = size
        reelObject['duration'] = 0
        await globalModel.create(req, reelObject, "reels").then(result => {
            res.send({ videoWidth: videoWidth, videoHeight: videoHeight, id: result.insertId, images: [], name: path.basename(req.fileName, path.extname(req.fileName)) })
        })
        return;
    }
    ffmpeg.setFfprobePath(req.appSettings["video_ffmpeg_path"].replace("ffmpeg",'ffprobe'));
	ffmpeg.setFfmpegPath(req.appSettings["video_ffmpeg_path"]);
    var command =
        ffmpeg.ffprobe(filePath, function (err, metadata) {
            duration = metadata.format.duration.toString()
            videoWidth = metadata.streams[0].width ? metadata.streams[0].width : (metadata.streams[1] ? metadata.streams[1].width : "")
            videoHeight = metadata.streams[0].height ? metadata.streams[0].height : (metadata.streams[1] ? metadata.streams[1].height : "")
            size = metadata.format.size
            ffmpeg(filePath)
                .on('filenames', function (filenames) {
                    images = filenames;
                }).on('end', function () {
                    //append base path in images
                    let uploadedImages = []
                    images.forEach(image => {
                        uploadedImages.push(req.APP_HOST + "/upload/images/reels/video/" + image)
                    })

                    //create item video in table
                    let reelObject = {}
                    reelObject["owner_id"] = req.user.user_id;
                    reelObject['image'] = "/upload/images/reels/video/" + images[0];
                    reelObject["video_location"] = "/upload/reels/video/" + req.fileName
                    reelObject['title'] = "Untitled"
                    reelObject['completed'] = "0"
                    // reelObject['view_privacy'] = "everyone"
                    reelObject['description'] = ""
                    var dt = dateTime.create();
                    var formatted = dt.format('Y-m-d H:M:S');
                    reelObject['creation_date'] = formatted
                    reelObject['modified_date'] = formatted
                    reelObject['status'] = 2
                    reelObject['size'] = size
                    var n = duration.indexOf('.');
                    duration = duration.substring(0, n != -1 ? n : duration.length)
                    let d = Number(duration);
                    var h = Math.floor(d / 3600).toString();
                    var m = Math.floor(d % 3600 / 60).toString();
                    var s = Math.floor(d % 3600 % 60).toString();

                    var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00"
                    var mDisplay = m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00"
                    var sDisplay = s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00"
                    const time = hDisplay + mDisplay + sDisplay
                    reelObject['duration'] = time

                    globalModel.create(req, reelObject, "reels").then(result => {
                        res.send({ videoWidth: videoWidth, videoHeight: videoHeight, id: result.insertId, images: uploadedImages, name: path.basename(metadata.format.filename, path.extname(metadata.format.filename)) })
                    })
                }).screenshots({
                    // Will take screens at 20%, 40%, 60% and 80% of the video
                    count: 1,
                    folder: basePath + "/upload/images/reels/video/",
                    filename: "%w_%h_%b_%i"
                });
        });

    // Kill ffmpeg after 5 minutes anyway
    setTimeout(function () {
        if (typeof command != "undefined") {
            command.on('error', function () {
                return res.send({ error: fieldErrors.errors([{ msg: constant.general.GENERAL }], true), status: errorCodes.serverError }).end();
            });
            command.kill();
        }
    }, 60 * 5 * 1000);

}