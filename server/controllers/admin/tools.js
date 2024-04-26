const pagging = require("../../functions/pagging")
const globalModel = require("../../models/globalModel")
const levels = require("../../models/levels")
const toolsModel = require("../../models/tools")
const moment = require("moment")
const dateTime = require("node-datetime")
const categoryModel = require("../../models/categories")

exports.getChannels = async(req,res,next) => {
    let q = req.query.q
    let page = req.query.page ? req.query.page : 1
    let totalCount = 0
    let condition = []
    condition.push(q);
    let conditionalWhere = " AND LOWER(channels.title) LIKE CONCAT('%', ?,  '%')"
    conditionalWhere += " AND users.user_id IS NOT NULL AND channels.channel_id NOT IN (SELECT channel_id from tools_channel_subscribe)"

    let sql = "SELECT COUNT(*) as totalCount FROM channels LEFT JOIN users on users.user_id = channels.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE 1 = 1 " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })
    let LimitNum = 10
    condition.push(LimitNum)
    condition.push((page - 1) * LimitNum)

    conditionalWhere += " ORDER BY channels.channel_id DESC limit ? offset ?"
    let sqlQuery = 'SELECT channels.*,channels.channel_id as id,IF(channels.image IS NULL || channels.image = "","' + req.appSettings['channel_default_photo'] + '",channels.image) as image,userdetails.username,userdetails.displayname FROM channels LEFT JOIN users on users.user_id = channels.owner_id LEFT JOIN userdetails on userdetails.user_id = channels.owner_id  WHERE 1 = 1 ' + conditionalWhere
    
    let response = {}
    response.total_count = totalCount
    response.items = []
    await globalModel.custom(req, sqlQuery, condition).then(result => {
        if(result){
            response.items = result
        }
    })

    return res.send(response);

}
exports.getUsers = async(req,res,next) => {
    let q = req.query.q
    let page = req.query.page ? req.query.page : 1
    let totalCount = 0
    let condition = []
    condition.push(q);
    let conditionalWhere = " AND LOWER(userdetails.displayname) LIKE CONCAT('%', ?,  '%')"
    conditionalWhere += " AND userdetails.user_id IS NOT NULL AND users.user_id NOT IN (SELECT user_id from tools_user_subscribe) AND users.active = 1 && users.approve = 1"

    let sql = "SELECT COUNT(*) as totalCount FROM users LEFT JOIN userdetails on users.user_id = userdetails.user_id WHERE 1 = 1 " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })
    let LimitNum = 10
    condition.push(LimitNum)
    condition.push((page - 1) * LimitNum)

    conditionalWhere += " ORDER BY users.user_id DESC limit ? offset ?"
    let sqlQuery = "SELECT userdetails.*,userdetails.user_id as id,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM users LEFT JOIN userdetails on userdetails.user_id = users.user_id  WHERE 1 = 1 " + conditionalWhere
    
    let response = {}
    response.total_count = totalCount
    response.items = []
    await globalModel.custom(req, sqlQuery, condition).then(result => {
        if(result){
            response.items = result
        }
    })

    return res.send(response);

}
exports.announcements = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_announcements","announcement_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_announcements" + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY tools_announcements.announcement_id DESC limit ? offset ?"
        let sqlQuery = "SELECT tools_announcements.* FROM tools_announcements  " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    let memberLevels = []
    await levels.findAll(req, req.query).then(result => {
        memberLevels = result;
    })

    res.render('admin/tools/announcements', {memberLevels:memberLevels, loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Announcements", paggingData: paggingData });
    
}
exports.createAnnouncements = async (req,res) => {
    let id = req.params.id
    let announcement = null;

    if(id){
        await toolsModel.findAnnouncementById(id,req,res).then(result => {
            announcement = result
        }).catch(error => {
            
        });
        if(!announcement){
            return res.redirect(process.env.ADMIN_SLUG+"/tools/announcements")
        }
    }
    let insertObject = {}
    insertObject["title"] = req.body.title
    insertObject["description"] = req.body.description
    insertObject["level_id"] = req.body.level_id ? req.body.level_id.join(",") : ""
    if(req.body.start_time){
        let starttime = req.body.start_time
        insertObject["start_time"] = dateTime.create(starttime).format("Y-m-d H:M:S")
    }
    if(req.body.end_time){
        let endtime = req.body.end_time
        insertObject["end_time"] = dateTime.create(endtime).format("Y-m-d H:M:S")
    }
    if(id){
        globalModel.update(req,insertObject,'tools_announcements','announcement_id',id).then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }else{
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
        globalModel.create(req,insertObject,'tools_announcements').then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }

}
exports.deleteAnnouncements = async (req, res) =>{
    let id = req.params.id

    globalModel.delete(req,"tools_announcements","announcement_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/announcements")
    })
}
exports.createNotifications = async (req, res) => {
    let id = req.params.id

    let insertObject = {}
    insertObject["text"] = req.body.text
    insertObject["title"] = req.body.title
    insertObject["level_id"] = req.body.level_id ? req.body.level_id.join(",") : ""
    
    if(id){
        globalModel.update(req,insertObject,'tools_mass_notifications','mass_notification_id',id).then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }else{
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
        globalModel.create(req,insertObject,'tools_mass_notifications').then(result => {
            const date = dateTime.create().format("Y-m-d H:M:S")
            //INSERT NOTIFICATIONS TO ALL USERS
            let query = "INSERT INTO notifications (`owner_id`,`subject_type`,`subject_id`,`object_type`,`object_id`,`type`,`notification_send`,`creation_date`,`params`) SELECT user_id,?,?,?,?,?,?,?,? FROM `users`";
            if(req.body.level_id && insertObject["level_id"] && insertObject["level_id"] !== ""){
                query += " WHERE FIND_IN_SET(level_id, ?) > 0 "
            }
            let params = {}
            params.text = insertObject["text"]
            globalModel.custom(req,query,["user",0,"user_profile","0","admin_custom_notification",0,date,JSON.stringify(params),insertObject["level_id"]]);
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }
}
exports.deleteNotifications = async (req, res) => {
    let id = req.params.id

    globalModel.delete(req,"tools_mass_notifications","mass_notification_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/mass-notifications")
    })
}

exports.massNotifications = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_mass_notifications","mass_notification_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = "  "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_mass_notifications " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " GROUP BY tools_mass_notifications.mass_notification_id ORDER BY tools_mass_notifications.mass_notification_id DESC limit ? offset ? "
        let sqlQuery = "SELECT tools_mass_notifications.*,GROUP_CONCAT(levels.title ORDER BY levels.level_id) as levels FROM tools_mass_notifications LEFT JOIN levels ON FIND_IN_SET(levels.level_id, tools_mass_notifications.level_id) > 0  " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    let memberLevels = []
    await levels.findAll(req, req.query).then(result => {
        memberLevels = result;
    })

    res.render('admin/tools/notifications', {memberLevels:memberLevels, loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Mass Notifications", paggingData: paggingData });

}

exports.channelSubscribe = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_channel_subscribe","channel_subscribe_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_channel_subscribe INNER JOIN channels on channels.channel_id = tools_channel_subscribe.channel_id " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY tools_channel_subscribe.channel_subscribe_id DESC limit ? offset ?"
        let sqlQuery = "SELECT tools_channel_subscribe.*,channels.title,channels.custom_url,channels.image FROM tools_channel_subscribe INNER JOIN channels on channels.channel_id = tools_channel_subscribe.channel_id  " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    let memberLevels = []
    await levels.findAll(req, req.query).then(result => {
        memberLevels = result;
    })

    let defaultChannelImage = req.appSettings["channel_default_photo"];

    res.render('admin/tools/channel-subscribe', {defaultChannelImage:defaultChannelImage,memberLevels:memberLevels, loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Channel Auto Subscribers", paggingData: paggingData });
    

}
exports.createChannelSubscription = async (req, res) => {
    let channels = [req.params.id]
    for (let i = 0; i < channels.length;i++){
        if(channels[i]){
        let insertObject = {}
        insertObject["channel_id"] = channels[i]
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
          await  globalModel.create(req,insertObject,'tools_channel_subscribe').then(result => {
                
            })
        }   
    }
    res.send({success:1,message:"Operation performed successfully.",refresh:true})
}
exports.deleteChannelSubscription = async (req, res) => {
    let id = req.params.id

    globalModel.delete(req,"tools_channel_subscribe","channel_subscribe_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/channel-subscribe")
    })
}
exports.userSubscribe = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_user_subscribe","user_subscribe_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
    
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_user_subscribe INNER JOIN users on users.user_id = tools_user_subscribe.user_id " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY tools_user_subscribe.user_subscribe_id DESC limit ? offset ?"
        let sqlQuery = "SELECT tools_user_subscribe.*,userdetails.displayname,userdetails.username,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM tools_user_subscribe INNER JOIN users on users.user_id = tools_user_subscribe.user_id INNER JOIN userdetails on userdetails.user_id = tools_user_subscribe.user_id " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    
    res.render('admin/tools/user-subscribe', { loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage User Auto Subscribers", paggingData: paggingData });
    
}
exports.createUserSubscription = async (req, res) => {
    let users = [req.params.id]
    for (let i = 0; i < users.length;i++){
        if(users[i]){
        let insertObject = {}
        insertObject["user_id"] = users[i]
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
          await  globalModel.create(req,insertObject,'tools_user_subscribe').then(result => {
                
            })
        }   
    }
    res.send({success:1,message:"Operation performed successfully.",refresh:true})
}
exports.deleteUserSubscription = async (req, res) => {
    let id = req.params.id

    globalModel.delete(req,"tools_user_subscribe","user_subscribe_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/user-subscribe")
    })
}

exports.viewDeleteVideos = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_delete_videos","delete_video_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_delete_videos LEFT JOIN levels on levels.level_id = tools_delete_videos.level_id LEFT JOIN categories on categories.category_id = tools_delete_videos.category_id LEFT JOIN categories as subcat on subcat.category_id = tools_delete_videos.subcategory_id LEFT JOIN categories as subsubcat on subsubcat.category_id = tools_delete_videos.subsubcategory_id " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " GROUP BY tools_delete_videos.delete_video_id ORDER BY tools_delete_videos.delete_video_id DESC limit ? offset ?"
        let sqlQuery = "SELECT tools_delete_videos.*,GROUP_CONCAT(levels.title ORDER BY levels.level_id) as levels,categories.title as cattitle,subcat.title as subcattitle,subsubcat.title as subsubcattitle FROM tools_delete_videos LEFT JOIN levels ON FIND_IN_SET(levels.level_id, tools_delete_videos.level_id) > 0  LEFT JOIN categories on categories.category_id = tools_delete_videos.category_id LEFT JOIN categories as subcat on subcat.category_id = tools_delete_videos.subcategory_id LEFT JOIN categories as subsubcat on subsubcat.category_id = tools_delete_videos.subsubcategory_id " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    let memberLevels = []
    await levels.findAll(req, req.query).then(result => {
        memberLevels = result;
    })

    const categories = []
    await categoryModel.findAll(req, { type: "video" }).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    res.render('admin/tools/delete-videos', {categories:categories,memberLevels:memberLevels, loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Delete Videos", paggingData: paggingData });
}
exports.deleteVideos = async (req, res) => {
    let id = req.params.id

    globalModel.delete(req,"tools_delete_videos","delete_video_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/delete-videos")
    })

}
exports.createDeleteVideos = async (req, res) => {
    let id = req.params.id

    let insertObject = {}
    insertObject["category_id"] = req.body.category_id ? req.body.category_id : 0
    insertObject["subcategory_id"] = req.body.subcategory_id ? req.body.subcategory_id : 0
    insertObject["subsubcategory_id"] = req.body.subsubcategory_id ? req.body.subsubcategory_id : 0
    insertObject["level_id"] = req.body.level_id ? req.body.level_id.join(",") : ""
    insertObject["time_interval"] = req.body.time_interval ? req.body.time_interval : ""
    insertObject["time_duration"] = req.body.time_duration ? req.body.time_duration : ""
    insertObject["tags"] = req.body.tags ? req.body.tags : ""
    insertObject["title"] = req.body.title ? req.body.title : ""
    
    if(id){
        globalModel.update(req,insertObject,'tools_delete_videos','delete_video_id',id).then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }else{
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
        globalModel.create(req,insertObject,'tools_delete_videos').then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }

}


exports.removeVideos = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_remove_videos","remove_video_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_remove_videos " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " ORDER BY tools_remove_videos.remove_video_id DESC limit ? offset ?"
        let sqlQuery = "SELECT tools_remove_videos.* FROM tools_remove_videos " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');

    
    res.render('admin/tools/remove-videos', { loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Remove Videos", paggingData: paggingData });

}
exports.removeDeleteVideos = async (req, res) => {
    let id = req.params.id

    globalModel.delete(req,"tools_remove_videos","remove_video_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/remove-videos")
    })

}
exports.createRemoveVideos = async (req, res) => {
    let id = req.params.id

    let insertObject = {}
    insertObject["sitename"] = req.body.sitename ? req.body.sitename : 'youtube'
    insertObject["time_interval"] = req.body.time_interval ? req.body.time_interval : ""
    insertObject["time_duration"] = req.body.time_duration ? req.body.time_duration : ""
    insertObject["title"] = req.body.title ? req.body.title : ""

    if(id){
        globalModel.update(req,insertObject,'tools_remove_videos','remove_video_id',id).then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }else{
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
        globalModel.create(req,insertObject,'tools_remove_videos').then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }

}


exports.newsletters = async (req, res) => {
    if(req.query.ids){
        let ids = req.query.ids.split(',')
        for(let i=0;i<ids.length; i++){
            if(parseInt(ids[i]) > 0){
                await globalModel.delete(req,"tools_newsletters","newsletter_id",ids[i]).then(result => {})
            }
        }
        res.redirect(req.originalUrl.split("?")[0]);
        return;
    }
    let LimitNum = 10;
    let page = 1
    if (req.params.page == '') {
        page = 1;
    } else {
        //parse int Convert String to number 
        page = parseInt(req.params.page) ? parseInt(req.params.page) : 1;
    }

    const query = { ...req.query }
    let conditionalWhere = " "
    let condition = []

    let results = []
    let totalCount = 0
 
    let sql = "SELECT COUNT(*) as totalCount FROM tools_newsletters LEFT JOIN levels on levels.level_id = tools_newsletters.level_id " + conditionalWhere
    await globalModel.custom(req, sql, condition).then(result => {
        totalCount = result[0].totalCount
    })

    if (totalCount > 0) {
        condition.push(LimitNum)
        condition.push((page - 1) * LimitNum)
        conditionalWhere += " GROUP BY tools_newsletters.newsletter_id ORDER BY tools_newsletters.newsletter_id DESC limit ? offset ?"
        let sqlQuery = "SELECT tools_newsletters.*,GROUP_CONCAT(levels.title ORDER BY levels.level_id) as levels FROM tools_newsletters LEFT JOIN levels ON FIND_IN_SET(levels.level_id, tools_newsletters.level_id) > 0 " + conditionalWhere
        await globalModel.custom(req, sqlQuery, condition).then(result => {
            results = result
        })
    }
    const paggingData = pagging.create(req, totalCount, page, '', LimitNum)
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG, '');
    let memberLevels = []
    await levels.findAll(req, req.query).then(result => {
        memberLevels = result;
    })
    res.render('admin/tools/newsletters', {memberLevels:memberLevels, loggedin_id: (req.user ? req.user.user_id : ""), loggedinLevel_id: (req.user ? req.user.level_id : ""), totalCount: totalCount, query: query, nav: url, results: results, title: "Manage Newsletters", paggingData: paggingData });
}
exports.deleteNewsletter = async (req, res) => {
    let id = req.params.id

    globalModel.delete(req,"tools_newsletters","newsletter_id",id).then(result => {
        res.redirect(process.env.ADMIN_SLUG+"/tools/newsletters")
    })

}
exports.createNewsletters = async (req, res) => {
    let id = req.params.id

    let insertObject = {}
    insertObject["level_id"] = req.body.level_id.join(",") ? req.body.level_id.join(",") : ''
    insertObject["gender"] = req.body.gender ? req.body.gender : ""
    insertObject["subject"] = req.body.subject
    insertObject["description"] = req.body.description
    insertObject["title"] = req.body.title
    
    if(id){
        globalModel.update(req,insertObject,'tools_newsletters','newsletter_id',id).then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }else{
        insertObject["creation_date"] = moment().format("YYYY-MM-DDTHH:mm")
        globalModel.create(req,insertObject,'tools_newsletters').then(result => {
            res.send({success:1,message:"Operation performed successfully.",refresh:true})
        })
    }

}