const globalModel = require('./globalModel');
const commonFunction = require("../functions/commonFunctions");
const dateTime = require("node-datetime")

module.exports = {
    getMuteUser: function(req,resource_id){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('SELECT * FROM stories_muted WHERE  owner_id = ? AND resource_id = ?',[req.user.user_id,resource_id],function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const story = JSON.parse(JSON.stringify(results));
                        resolve(story[0]);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getStoryPrivacy: function(req,owner_id){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('SELECT * FROM stories_user_settings WHERE  owner_id = ?',[owner_id],function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const favourite = JSON.parse(JSON.stringify(results));
                        resolve(favourite[0]);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getMutedUsers:function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){

                let sql = "SELECT mute_id,resource_id,displayname,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM stories_muted INNER JOIN users ON users.user_id = stories_muted.resource_id INNER JOIN userdetails ON userdetails.user_id = users.user_id WHERE 1=1 AND users.approve = 1 AND users.active = 1 "
                let conditions = []
                
                conditions.push(req.user.user_id)
                sql += " AND stories_muted.owner_id = ?"
                
                if(data.last){
                    sql += " AND stories_muted.mute_id < ?"
                    conditions.push(data.last)
                }

                sql += " ORDER BY "
                sql += " stories_muted.mute_id DESC "
                
                conditions.push(data.limit)
                sql += " LIMIT ?"
                connection.query(sql,conditions,function(err,results,fields)
                {
                    console.log(err);
                    if(err)
                        resolve(false)
                    if(results){
                        const stories = JSON.parse(JSON.stringify(results));
                        resolve(stories);
                    }
                });

            });
        });

    },
    getArchieveStory:function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                let sql = "SELECT stories.*,stories_attachments.file as background_image,userdetails.displayname as user_displayname,userdetails.username as user_username,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM stories LEFT JOIN stories_attachments ON stories_attachments.attachment_id = stories.background_image AND stories_attachments.type = 'background_image' INNER JOIN users ON users.user_id = stories.owner_id INNER JOIN userdetails ON userdetails.user_id = users.user_id WHERE 1=1 "
                let conditions = []


                if(data.last){
                    sql += " AND stories.story_id < ?"
                    conditions.push(data.last)
                }

                sql += " AND stories.owner_id = ?"
                conditions.push(req.user.user_id)

                let days = req.appSettings['stories_duration'] ? req.appSettings['stories_duration'] : 1
                let currentDate = dateTime.create().format("Y-m-d H:M:S")

                let prevDate = new Date(currentDate)
                prevDate.setDate(prevDate.getDate() - days);
                let prevADate = dateTime.create(prevDate).format("Y-m-d H:M:S")
                conditions.push(days)
               // conditions.push(currentDate)
                sql += " AND stories.creation_date <= now() - INTERVAL ? DAY"

                sql += " ORDER BY "
                sql += " stories.story_id DESC "
                
                conditions.push(data.limit)
                sql += " LIMIT ?"
                connection.query(sql,conditions,function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const stories = JSON.parse(JSON.stringify(results));
                        let userStory = []
                        for(var i=0;i<stories.length;i++){
                            let userData = {}
                            userData.username = stories[i].user_username
                            userData.displayname = stories[i].user_displayname
                            if(req.user && stories[i].owner_id == req.user.user_id){
                                userData.yourstory = req.i18n.t("Your story")
                            }
                            userData.avtar = stories[i].avtar
                            userData.story_id = stories[i].story_id
                            userData.owner_id = stories[i].owner_id
                            let story = {...stories[i]};
                            delete story.user_username
                            delete story.user_displayname
                            delete story.avtar
                            delete story.owner_id
                            userData.stories = [story]
                            userStory.push(userData);
                                
                        }
                        resolve(userStory)
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getStoryViewer:function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                let sql = "SELECT stories_users.user_id,stories_users.creation_date,userdetails.displayname as user_displayname,userdetails.username as user_username,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM stories_users INNER JOIN users ON users.user_id = stories_users.owner_id INNER JOIN userdetails ON userdetails.user_id = users.user_id WHERE 1=1 AND  users.approve = 1 AND users.active = 1 "
                let conditions = []

                sql += " AND stories_users.story_id = ?"
                conditions.push(data.story_id)

                if(data.last){
                    sql += " AND stories_users.user_id < ?"
                    conditions.push(data.last)
                }

                sql += " ORDER BY "
                sql += " stories_users.user_id DESC "

                conditions.push(15)
                sql += " LIMIT ?"
                connection.query(sql,conditions,function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const story = JSON.parse(JSON.stringify(results));
                        resolve(story);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getStory: function(req,story_id){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('SELECT * FROM stories WHERE  story_id = ?',[story_id],function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const story = JSON.parse(JSON.stringify(results));
                        resolve(story[0]);
                    }else{
                        resolve(false);
                    }
                })
            })
        }); 
    },
    getUserStories: function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                let select = "SELECT *,likes.like_dislike,followers.follower_id,userdetails.displayname as user_displayname,userdetails.username as user_username,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar,MAX(story_id) as max_story_id,GROUP_CONCAT(story_id) as ids FROM stories INNER JOIN users ON users.user_id = stories.owner_id INNER JOIN userdetails ON userdetails.user_id = users.user_id "

                let owner_id = req.user ? req.user.user_id : 0
                select += ' LEFT JOIN followers on followers.id = users.user_id AND followers.owner_id = ' + owner_id + ' AND followers.type = "members" '
                select += " LEFT JOIN likes ON likes.id = users.user_id AND likes.type = 'stories'  AND likes.owner_id =  " + owner_id

                select += " WHERE 1=1 AND  users.approve = 1 AND users.active = 1 "

                let conditions = []
                let days = req.appSettings['stories_duration'] ? req.appSettings['stories_duration'] : 1
                let currentDate = dateTime.create().format("Y-m-d H:M:S")

                let prevDate = new Date(currentDate)
                prevDate.setDate(prevDate.getDate() - days);
                let prevADate = dateTime.create(prevDate).format("Y-m-d H:M:S")
                conditions.push(prevADate)
                conditions.push(currentDate)
                select += " AND stories.creation_date BETWEEN ? AND ?"
                
                if(req.user)
                    select += " AND stories.owner_id NOT IN (SELECT resource_id from user_blocks WHERE owner_id = "+req.user.user_id+" ) "

               
                conditions.push(req.user ? req.user.user_id : 0)
                select += " AND ( stories.owner_id = ? || "
                select += "  ( stories.status = 1 AND stories.approve = 1 AND stories.completed = 1)) "

                if(req.user && req.user.user_id){
                    conditions.push(req.user.user_id)
                    select += " AND stories.owner_id NOT IN (SELECT resource_id FROM stories_muted WHERE owner_id = ?)"
                }
                if(data.ids){
                    conditions.push(data.ids.split(","))
                    select += " AND stories.owner_id NOT IN (?)"
                }
                if(data.story_id){
                    conditions.push(data.story_id)
                    select += " AND stories.story_id = ? "
                }
                if(data.owner_id){
                    conditions.push(data.owner_id)
                    select += " AND stories.owner_id = ? "
                }
                //privacy: public,onlyme,follow,followers
                let allowedPrivate = parseInt(req.levelPermissions["stories.view"]) == 2
                if(!allowedPrivate){
                    conditions.push(req.user ? req.user.user_id : 0)
                    conditions.push(req.user ? req.user.user_id : 0)
                    select += " AND ( CASE WHEN stories.owner_id = ? OR stories.view_privacy = 'public' OR (stories.view_privacy = 'onlyme' AND stories.owner_id = ?) THEN true "
                    conditions.push(req.user ? req.user.user_id : 0)
                    select += " WHEN stories.view_privacy = 'follow' THEN ? IN (SELECT id from followers WHERE type= 'members' AND owner_id = stories.owner_id) "
                    conditions.push(req.user ? req.user.user_id : 0)
                    select += " WHEN stories.view_privacy = 'followers' THEN ? IN (SELECT owner_id from followers WHERE type= 'members' AND id = stories.owner_id) "
                    select += " ELSE FALSE END ) "
                }
                select += " GROUP BY stories.owner_id "
                select += "ORDER BY "
                if(req.user){
                    conditions.push(req.user.user_id)
                    select += " stories.owner_id = ? DESC ,"
                }
                select += " MAX(stories.story_id) DESC"

                if (data.limit) {
                    conditions.push(data.limit)
                    select += " LIMIT ?"
                }

                if (data.offset) {
                    conditions.push(data.offset)
                    select += " OFFSET ?"
                } 
                connection.query(select,conditions,async function(err,results,fields)
                {
                    if(err){
                        console.log(err);
                        resolve(false)
                    }
                    if(results){
                        const stories = JSON.parse(JSON.stringify(results));
                        //resolve(stories);
                        //get all stories
                        if(stories){
                            let userStory = []
                            for(var i=0;i<stories.length;i++){
                                await module.exports.getStories(stories[i],req).then(result => {
                                    if(result){
                                        let userData = {}
                                        userData.username = stories[i].user_username
                                        userData.displayname = stories[i].displayname
                                        userData.follower_id = stories[i].follower_id
                                        if(req.user && result[0].owner_id == req.user.user_id){
                                            userData.yourstory = req.i18n.t("Your story")
                                        }
                                        
                                        userData.avtar = stories[i].avtar
                                        userData.owner_id = result[0].owner_id

                                        for(let i=0;i<result.length; i++){
                                            if(result[i].completed == 0 || result[i].status != 1){
                                                delete result[i].file
                                            }
                                        }

                                        userData.stories = result
                                        userStory.push(userData);
                                    }
                                })
                            }
                            resolve(userStory)
                        }else{
                            resolve()
                        }
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getStories:function(story,req){
        return new Promise(function(resolve, reject) { 
            req.getConnection(function(err,connection){
                let select = "SELECT stories.*,stories_attachments.file as background_image FROM stories LEFT JOIN stories_attachments ON stories_attachments.attachment_id = stories.background_image AND stories_attachments.type = 'background_image' WHERE 1=1 "
                let conditions = []
                conditions.push(story.ids.split(","))
                select += " AND story_id IN (?)"
                select += " ORDER BY "
                select += " stories.story_id DESC"
                connection.query(select,conditions,async function(err,results,fields)
                {
                    if(err){
                        console.log(err);
                        resolve(false)
                    }
                    resolve(results)
                })
            })
        });
    },
    getBackgroundImages: function(req){
        return new Promise(function(resolve, reject) {
            
            req.getConnection(function(err,connection){
                connection.query('SELECT * FROM stories_attachments WHERE  type = "background_image" AND approve = 1 order by `order` DESC',[],function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const favourite = JSON.parse(JSON.stringify(results));
                        resolve(favourite);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    deleteStory: function(req,story){
        return new Promise(async function(resolve, reject) {
        
            if(story.file)
                commonFunction.deleteImage(req,'',story.file,"",story);
            if(story.image)
                commonFunction.deleteImage(req,'',story.image,"",story);

            req.getConnection(function(err,connection){        
                if(err){
                    console.log(err);
                    resolve(false);
                }        
                connection.query('DELETE from `stories` where story_id = ?',story.story_id, function (err, results) {
                    if(!err){
                         connection.query("DELETE FROM stories_users WHERE story_id = ? ", [story.story_id], function (err, results, fields) { })
                        resolve(true)
                    }else{
                        console.log(err)
                        reject(err)
                    }
                });
            })
        });
    },
    deleteBackgroundImage: function(id,req){
        return new Promise(async function(resolve, reject) {
            let stories = null;
            await globalModel.custom(req, "SELECT * from stories_attachments where attachment_id = ?", id).then(async result => {
                if(result && result.length > 0){
                    stories = result[0]
                }
            });
            if(!stories){
                resolve(false)
            }

            commonFunction.deleteImage(req,'',stories.file,"",stories);

            req.getConnection(function(err,connection){        
                if(err){
                    console.log(err);
                    resolve(false);
                }        
                connection.query('DELETE from `stories_attachments` where attachment_id = ?',id, function (err, results) {
                    if(!err){
                        //delete user stories associate to background image.
                        connection.query('DELETE from `stories` where background_image = ?',id, function (err, results) {})
                        resolve(true)
                    }else{
                        console.log(err)
                        reject(err)
                    }
                });
            })
        });
    },
}
