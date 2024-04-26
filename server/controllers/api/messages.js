const dateTime = require('node-datetime')
const socketio = require("../../socket")
const commonFunction = require("../../functions/commonFunctions")
const globalModel = require('../../models/globalModel')
const messagesModel = require("../../models/messages")
const s3Upload = require("../../functions/upload").uploadtoS3;

exports.create = async (req,res) => {
    let message = req.body.message
    let message_id = req.body.message_id
    if(!message_id || req.imageError){
        res.send({status:false,message:req.imageError})
        return
    }

    let messageObj = null
    await globalModel.custom(req,"SELECT * FROM messages WHERE message_id = ?",[message_id]).then(result => {
        messageObj = JSON.parse(JSON.stringify(result))[0];
    });

    let isBlocked = false;
    // check user block
    await globalModel.custom(
        req,
        "SELECT * FROM user_blocks WHERE owner_id = ? AND resource_id = ?",
        [messageObj.user_id, messageObj.resource_id]).then(results => {
          if (results && results.length > 0) {
            isBlocked = true;
          }
        }
      );

    if(isBlocked){
        res.send({status:false,message:"Action not allowed"});
        return
    }

    let insertObject = {}
    if(req.fileName){
        insertObject["image"] = "/upload/images/messages/"+req.fileName
    }
    if(req.videoName){
        insertObject["video"] = "/upload/images/messages/video/"+req.videoName

        if (
            req.appSettings.upload_system == "s3" ||
            req.appSettings.upload_system == "wisabi"
          ) {
            await s3Upload(
              req,
              req.serverDirectoryPath + "/public"+insertObject["video"],
              insertObject["video"]
            )
              .then((result) => {
                //remove local file
                commonFunction.deleteImage(req, res, insertObject["video"], "locale");
              })
              .catch((err) => {});
          }

    }

    if(req.body.upload) {
        let image = await commonFunction.generateImageFromOpenAi(req,req.body.upload)
        if(image){
            insertObject["image"] = image;
        }
    }

    insertObject["message"] = message
    insertObject["message_id"] = message_id
    insertObject["user_id"] = req.user.user_id
    insertObject['is_read'] = 0
    insertObject['seen'] = 0
    insertObject['creation_date'] = dateTime.create().format('Y-m-d H:M:S');
    await globalModel.create(req,insertObject,"messages_texts").then(async result => {
        let id = result.insertId
        //get messages
        await messagesModel.getChatMessages({messages_text_id:id,id:message_id},req).then(result => {
            if(result){
                let chat = result[0]
                socketio.getIO().to(chat.user_id).to(chat.resource_id).emit('chatMessageCreate', {chat:chat});
                res.send({status:true})
            }else{
                res.send({status:false})
            }
        })
    })

}

exports.deleteChat = async (req,res,next) => {
    let id = req.body.message_id
    if(!id){
        res.send({status:false})
        return;
    }
    let message = null
    await globalModel.custom(req,"SELECT * FROM messages WHERE message_id = ?",[id]).then(result => {
         message = JSON.parse(JSON.stringify(result))[0];
    });
    if(!message){
        res.send({status:false})
        return;
    }
    globalModel.custom(req,"DELETE FROM messages WHERE message_id = ?",[id]).then(async result => {
        await globalModel.custom(req,"SELECT * FROM messages_texts WHERE message_id = ? AND image IS NOT NULL",[id]).then(result => {
            const messages = JSON.parse(JSON.stringify(result));
            messages.forEach(img => {
                if(img.image)
                    commonFunction.deleteImage(req, res, img.image, "message/chat")
                if(img.video)
                    commonFunction.deleteImage(req, res, img.video, "message/chat")
            });
        });
        globalModel.custom(req,"DELETE FROM messages_texts WHERE message_id = ?",[id]).then(result => {});
        socketio.getIO().to(message.user_id).to(message.resource_id).emit('chatDelete', {message_id:id});
    })
    res.send({status:false})
}

exports.delete = async(req,res) => {
    let id = req.body.id
    if(!id){
        res.send({status:false})
        return;
    }
    let message = null
    await globalModel.custom(req,"SELECT messages.message_id,messages.user_id,messages.resource_id,messages_texts.image,messages_texts.video,messages_texts.user_id as chat_user_id FROM messages_texts LEFT JOIN messages ON messages.message_id = messages_texts.message_id WHERE messages_text_id = ?",[id]).then(results => {
        if(results){
            const messages = JSON.parse(JSON.stringify(results));
            message = messages[0]
        }
    })
    if(!message){
        res.send({status:false})
        return;
    }
    
    if(message.chat_user_id != req.user.user_id){
        res.send({status:false})
        return;
    }
    
    globalModel.custom(req,"DELETE FROM messages_texts WHERE messages_text_id = ?",[id]).then(result => {
        if(message.image)
            commonFunction.deleteImage(req, res, message.image, "message/chat")
        if(message.video)
            commonFunction.deleteImage(req, res, message.video, "message/chat")
        socketio.getIO().to(message.user_id).to(message.resource_id).emit('chatMessageDelete', {id:id,message_id:message.message_id});
        res.send({status:1});
    })
}

exports.index = async (req,res) => {

    let messageID = req.params.id
    req.query.id = messageID
    if(messageID){
        const limit = 21
        let page = 1
        if(parseInt(req.body.limit)){
            limit = parseInt(req.body.limit)
        } 
        if (req.body.page == '') {
            page = 1;
        } else {
            //parse int Convert String to number 
            page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
        }
        //get chat messages
        await messagesModel.getChatMessages({limit:limit,id:messageID,minId:req.body.min_id},req).then(result => {
            let pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                pagging = true
            }
            res.send({ chats: items, pagging: pagging })
        })
        return
    }

    const limit = 21
    //get messages
    let page = 1
    if(parseInt(req.body.limit)){
        limit = parseInt(req.body.limit)
    }

    if (req.body.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
    }

    let offset = (page - 1) * (limit - 1)
    await messagesModel.getMessages({resource_id:req.user.user_id,limit:limit,offset:offset,search:req.body.search},req).then(result => {
        let pagging = false
        let items = result
        if (result.length > limit - 1) {
            items = result.splice(0, limit - 1);
            pagging = true
        }
        res.send({ messages: items, pagging: pagging })
    })

}