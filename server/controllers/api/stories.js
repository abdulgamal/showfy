const storiesModel = require("../../models/stories")
const uniqid = require("uniqid")
const globalModel = require("../../models/globalModel")
const notificationModel = require("../../models/notifications")
const dateTime = require('node-datetime')
const socketio = require("../../socket")
const commonFunction = require("../../functions/commonFunctions")
const errorCodes = require("../../functions/statusCodes")
const fieldErrors = require('../../functions/error')
const constant = require("../../functions/constant")
const ffmpeg = require("fluent-ffmpeg")
const s3Upload = require('../../functions/upload').uploadtoS3

exports.getArchiveStories = async (req,res,next) => {
    let min_story_id = req.body.min_story_id
    let limit = 16;
    //update viewer
    await storiesModel.getArchieveStory(req,{last:min_story_id,limit:limit}).then(result => {
        let pagging = false
        let items = result
        if (result.length > limit - 1) {
            items = result.splice(0, limit - 1);
            pagging = true
        }
        res.send({ stories: items, pagging: pagging })
    })
}
exports.getMutedUsers = async (req,res,next) => {
    let min_user_id = req.body.min_user_id
    let limit = 16;
    //update viewer
    await storiesModel.getMutedUsers(req,{last:min_user_id,limit:limit}).then(result => {
        let pagging = false
        let items = result
        if (result.length > limit - 1) {
            items = result.splice(0, limit - 1);
            pagging = true
        }
        res.send({ users: items, pagging: pagging })
    })
}
exports.getViewerStories = async (req,res,next) => {
    let last = req.body.last
    let story_id = req.body.story_id

    let story = null
    //stories_muted
    await storiesModel.getStory(req,story_id).then(async res => {
        if(res){
            story = res
        }
    });
    if(!story){
        return res.send({status:0})
    }

    //update viewer
    let owner = false;
    if(req.user && story.owner_id != req.user.user_id){
        owner = req.user.user_id
    }else if(!req.user){
        owner = 0
    }
    if(owner){
        await globalModel.custom(req,"INSERT IGNORE INTO stories_users (`owner_id`,`story_id`,`creation_date`) VALUES (?,?,?)",[owner,story_id,dateTime.create().format("Y-m-d H:M:S")])
    }

    if(req.user && story.owner_id == req.user.user_id){
        await storiesModel.getStoryViewer(req,{last:last,story_id:story_id}).then(result => {
            if(result && result.length > 0){
                res.send({viewers:result});
            }else{
                res.send({})
            }
        })
    }else{
        res.send({error:1})
    }
}
exports.getStories = async (req,res,next) => {

    let limit = 16
    let ids = req.body.ids

    // let page = 1
    // if (req.body.page == '') {
    //     page = 1;
    // } else {
    //     //parse int Convert String to number 
    //     page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
    // }

    // let offset = (page - 1) * (limit - 1)

    await storiesModel.getUserStories(req,{limit:limit,ids:ids}).then(result => {
        if(result){
            let pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                pagging = true
            }
            res.send({ stories: items, pagging: pagging })
        }
    });
}

exports.delete = async (req,res,next) => {
    let id = req.params.id
    let story = null
    //stories_muted
    await storiesModel.getStory(req,id).then(async res => {
        if(res){
            story = res
        }
    });
    if(!story){
        return res.send({status:0})
    }
    await storiesModel.deleteStory(req,story).then(async res => {
        if(res){
            socketio.getIO().emit('deleteStory', {
                story: story,
                owner_id:req.user.user_id
            });
        }
    })

    return res.send({status:1})
}



exports.mute = async (req,res,next) => {
    let id = req.params.id
    let owner_id = req.body.owner_id

    let story = null
    //stories_muted
    if(!owner_id){
        await storiesModel.getStory(req,id).then(async res => {
            if(res){
                story = res
            }
        });
        if(!story){
            return res.send({status:0})
        }
        await globalModel.create(req,{owner_id:req.user.user_id,resource_id:story.owner_id,creation_date: dateTime.create().format("Y-m-d H:M:S")},'stories_muted').then(async res => {
            if(res){
                socketio.getIO().emit('muteStory', {
                    resource_owner: story.owner_id,
                    story_id:id,
                    owner_id:req.user.user_id
                });
            }
        })
    }else{
        await storiesModel.getMuteUser(req,owner_id).then(result => {            
            if(!result){
                globalModel.create(req,{owner_id:req.user.user_id,resource_id:owner_id,creation_date: dateTime.create().format("Y-m-d H:M:S")},'stories_muted').then(async res => {
                    socketio.getIO().emit('muteStory', {
                        resource_owner: owner_id,
                        story_id:id,
                        owner_id:req.user.user_id
                    });
                })
            }else{
                globalModel.delete(req,"stories_muted","mute_id",result.mute_id);
            }
        });
    }
    

    return res.send({status:1})
}
exports.privacy = async (req,res,next) => {
    let privacy = req.body.privacy
    let user_id = req.user.user_id

    await storiesModel.getStoryPrivacy(req,req.user.user_id).then(async res => {
        if(res){
            await globalModel.update(req,{privacy:privacy,owner_id:user_id},"stories_user_settings","setting_id",res.setting_id);
        }else{
            await globalModel.create(req,{privacy:privacy,owner_id:user_id},"stories_user_settings");
        }
    })

    

    return res.send({status:1})

}
exports.getprivacy = async (req,res,next) => {
    let privacy = "public"
    await storiesModel.getStoryPrivacy(req,req.user.user_id).then(async res => {
        if(res){
            privacy = res.privacy
        }else{
            
        }
    })

    

    return res.send({privacy:privacy})

}
exports.create = async (req,res,next) => {

    let privacy = "public"
    await storiesModel.getStoryPrivacy(req,req.user.user_id).then(async res => {
        if(res){
            privacy = res.privacy
        }else{
            
        }
    })

    let approve = 1;//req.levelPermissions["stories.auto_approve"];

    let uploadType = req.uploadType
    let insertObject = {}
    insertObject["owner_id"] = req.user.user_id
    if(req.fileName){
        //upload audio to s3
        if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
            await s3Upload(req, req.serverDirectoryPath +"/public"+ "/upload/stories/"+req.fileName, "/upload/stories/"+req.fileName).then(result => {
                //remove local file
                commonFunction.deleteImage(req, res, "/upload/stories/"+req.fileName, 'locale')
            }).catch(err => {

            })
        }
        insertObject["image"] = "/upload/stories/"+req.fileName
    }
    insertObject["status"] = 1;
    insertObject["view_privacy"] = privacy

    insertObject["approve"] = approve
    if(req.body.seemore)
        insertObject["seemore"] = req.body.seemore ? req.body.seemore : ""
    insertObject["creation_date"] = dateTime.create().format("Y-m-d H:M:S")
    insertObject["modified_date"] = dateTime.create().format("Y-m-d H:M:S")
    insertObject['status'] = 1;
    insertObject['completed'] = 1;

    if(uploadType == "videoStory"){
        if(!req.videoName){
            return res.send({ error: fieldErrors.errors([{ msg: constant.stories.VIDEO }], true), status: errorCodes.invalid }).end();
        }else{
            insertObject["type"] = "1" 
            if(req.appSettings["video_ffmpeg_path"] && req.appSettings["video_ffmpeg_path"] != "" && req.videoName.indexOf(".mp4") == -1){
                insertObject['status'] = 2;
                insertObject['completed'] = 0;
            }else{
                insertObject["status"] = 1;
                //upload video to s3
                if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                    await s3Upload(req, req.serverDirectoryPath +"/public"+ "/upload/stories/"+req.videoName, "/upload/stories/"+req.videoName).then(result => {
                        //remove local file
                        commonFunction.deleteImage(req, res, "/upload/stories/"+req.videoName, 'locale')
                    }).catch(err => {

                    })
                }
            } 
            insertObject["file"] = "/upload/stories/"+req.videoName
        }
    }else if(uploadType == "audioStory"){
        if(!req.audioName){
            return res.send({ error: fieldErrors.errors([{ msg: constant.stories.AUDIO }], true), status: errorCodes.invalid }).end();
        }else{
            insertObject["type"] = "2"
            if(req.appSettings["video_ffmpeg_path"] && req.appSettings["video_ffmpeg_path"] != "" && req.audioName.indexOf(".mp3") == -1){
                insertObject['status'] = 2;
                insertObject['completed'] = 0;
            }else{
                //upload audio to s3
                if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                    await s3Upload(req, req.serverDirectoryPath +"/public"+ "/upload/stories/"+req.audioName, "/upload/stories/"+req.audioName).then(result => {
                        //remove local file
                        commonFunction.deleteImage(req, res, "/upload/stories/"+req.audioName, 'locale')
                    }).catch(err => {

                    })
                }
            }
            insertObject["file"] = "/upload/stories/"+req.audioName
        }
    }else if(uploadType == "imageStory"){
        
        if(!req.fileName){
            return res.send({ error: fieldErrors.errors([{ msg: constant.stories.IMAGE }], true), status: errorCodes.invalid }).end();
        }else{
            insertObject["type"] = "0"
        }
        
    }else if(uploadType == "textStory"){
        if(!req.body.text){
            return res.send({ error: fieldErrors.errors([{ msg: constant.stories.TEXT }], true), status: errorCodes.invalid }).end();
        }else{
            insertObject["type"] = "3"
            insertObject["description"] = req.body.text
            insertObject["text_color"] = req.body.textColor
            insertObject["background_image"] = req.body.background
            insertObject["font"] = req.body.font
        }
    }
    let story = null
    await globalModel.create(req,insertObject,"stories").then(async result => {
        if(result){
            await storiesModel.getUserStories(req,{story_id:result.insertId}).then(result => {
                if(result){
                    story = result[0]
                }
            })
            // socketio.getIO().emit('storyCreated', {
            //     story: story,
            //     story_id:id,
            //     owner_id:req.user.user_id
            // });
            if(insertObject['status'] == 1){
                await notificationModel.insertFollowNotifications(req,{subject_type:"users",subject_id:req.user.user_id,object_type:"stories",object_id:result.insertId,type:"stories_create"}).then(result => {
        
                }).catch(err => {
                    console.log(err)
                })
                let dataNotification = {}
                dataNotification["type"] = "stories_create"
                dataNotification["owner_id"] = req.user.user_id
                dataNotification["object_type"] = "stories"
                dataNotification["object_id"] =  result.insertId
                notificationModel.sendPoints(req,dataNotification,req.user.level_id);
            }
        }
    })
    
    return res.send({create:1,story:story});

}

exports.convertVideo = async(req,storiesObject) => {
    return new Promise(async (resolve,reject) =>  {
        const res = {}
        const videoLocation = storiesObject.file
        const FFMPEGpath = req.appSettings.video_ffmpeg_path
        const id = storiesObject.story_id
        //convert videos
        var orgPath = req.serverDirectoryPath + "/public" + videoLocation
        ffmpeg.setFfprobePath(req.appSettings["video_ffmpeg_path"].replace("ffmpeg",'ffprobe'));
	    ffmpeg.setFfmpegPath(req.appSettings["video_ffmpeg_path"]);
        let command = ffmpeg(orgPath)
        const videoName = uniqid.process('v')
        let path_240 = "/public/upload/stories/" + videoName + ".mp4"
        if(storiesObject.type == 1){
            command
                //.audioCodec('libfaac')
                .videoCodec('libx264')
                .format('mp4');
        }else{
            command
                //.audioCodec('libfaac')
                // .videoCodec('libx264')
                .format('mp3');
            
            path_240 = "/public/upload/stories/" + videoName + ".mp3"
        }
        
        
        let is_validVideo = false
        const updatedObject = {}
        if(storiesObject.type == 1){
            await module.exports.executeFFMPEG(command, req.serverDirectoryPath + path_240, 240, orgPath, FFMPEGpath, "", req).then(async result => {
                //upate video 240
                if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                    await s3Upload(req, req.serverDirectoryPath + path_240, path_240.replace("/public",'')).then(result => {
                        //remove local file
                        commonFunction.deleteImage(req, res, path_240.replace("/public",''), 'locale')
                    }).catch(err => {
                    })
                }
                updatedObject["file"] = path_240.replace('/public', '')
                // await globalModel.update(req, updatedObject, "reels", "story_id", id).then(result => {
                
                // }).catch(error => {

                // })
                is_validVideo = true
            }).catch(err => {
                console.log(err)
            })
        }else{
            await module.exports.executeAudioFFMPEG(command, req.serverDirectoryPath + path_240, 240, orgPath, FFMPEGpath, "", req).then(async result => {
                //upate video 240
                if (req.appSettings.upload_system == "s3"  || req.appSettings.upload_system == "wisabi") {
                    await s3Upload(req, req.serverDirectoryPath + path_240, path_240.replace("/public",'')).then(result => {
                        //remove local file
                        commonFunction.deleteImage(req, res, path_240.replace("/public",''), 'locale')
                    }).catch(err => {
                    })
                }
                
                updatedObject["file"] = path_240.replace('/public', '')
                // await globalModel.update(req, updatedObject, "reels", "story_id", id).then(result => {
                
                // }).catch(error => {

                // })
                is_validVideo = true
            }).catch(err => {
                console.log(err)
            })
        }

        if (is_validVideo)
            updatedObject["status"] = 1
        else
            updatedObject["status"] = 3
        updatedObject['completed'] = 1

        //unlink org file
        if (videoLocation)
            commonFunction.deleteImage(req, res, videoLocation.replace("/public",''), "story/video")

        await globalModel.update(req, updatedObject, "stories", "story_id", id).then(async result => {
            //send socket data

        }).catch(error => {

        })

       
        if (is_validVideo) {
            notificationModel.insert(req, {owner_id:storiesObject.owner_id,insert:true, type: "stories_processed_complete", subject_type: "users", subject_id: storiesObject.owner_id, object_type: "stories", object_id: id,forceInsert:true }).then(result => {

            }).catch(err => {

            }) 
            notificationModel.insertFollowNotifications(req, { subject_type: "users", subject_id: storiesObject.owner_id, object_type: "stories", object_id: id, type: "members_followed" }).then(result => {

            }).catch(err => {

            })
            let dataNotification = {}
            dataNotification["type"] = "stories_create"
            dataNotification["owner_id"] = storiesObject.owner_id
            dataNotification["object_type"] = "stories"
            dataNotification["object_id"] =  id
            notificationModel.sendPoints(req,dataNotification);
        } else {
            notificationModel.insert(req, {owner_id:storiesObject.owner_id,insert:true, type: "stories_processed_failed", subject_type: "users", subject_id: storiesObject.owner_id, object_type: "stories", object_id: id,forceInsert:true }).then(result => {

            }).catch(err => {

            })
        } 
        socketio.getIO().emit('storiesCreated', {
            id :  storiesObject.story_id,
            owner_id:storiesObject.owner_id,
            file:updatedObject["file"],
            status:  updatedObject["status"]
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
exports.executeAudioFFMPEG = async (command, filePath, resolution, orgPath, FFMPEGpath, watermarkImage, req) => {
    return new Promise((resolve, reject) => {
        command.clone()
            .outputOption([
                "-acodec libmp3lame",
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
