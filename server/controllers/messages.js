const commonFunction = require("../functions/commonFunctions")
const messagesModel = require("../models/messages")
const globalModel= require("../models/globalModel")

exports.index = async(req,res) => {
    await commonFunction.getGeneralInfo(req, res, "messages_browse")
    let messageID = req.params.id
    req.query.id = messageID
    req.query.orgMessageID = messageID
    const limit = 21
    //get messages
    await messagesModel.getMessages({resource_id:req.user.user_id,limit:limit},req).then(result => {
        req.query.pagging = false
        let items = result
        if (result.length > limit - 1) {
            items = result.splice(0, limit - 1);
            req.query.pagging = true
        }
        req.query.messages = items
    })

    if(!messageID){
        if(req.query.messages && req.query.messages.length > 0)
        messageID = req.query.messages[0].message_id
         req.query.id = messageID
    }

    //get current message id
    if(messageID){
        await messagesModel.getMessages({resource_id:req.user.user_id,limit:1,id:messageID},req).then(result => {
            req.query.openMessage = result[0]
        }) 
        if(!req.query.openMessage){
            return res.send({ ...req.query , pagenotfound: 1 });
        }
        // //get chat messages
        // await messagesModel.getChatMessages({limit:5,id:messageID},req).then(result => {
        //     if(result)
        //         req.query.chatMessages = result
        // })
        await globalModel.custom(req,"SELECT * FROM user_blocks WHERE owner_id = ? AND resource_id = ?",[req.user.user_id,req.query.openMessage.user_id != req.user.user_id ? req.query.openMessage.user_id: req.query.openMessage.resource_id]).then(result => {
            if(result && result.length > 0){
                req.query.openMessage.block = true;
            }
        })
    }

    
    return res.send({...req.query,page_type:"messanger"});
    
  
}