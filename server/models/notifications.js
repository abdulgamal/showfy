const dateTime = require("node-datetime")
const socketio = require("../socket")
const emailFunction = require("../functions/emails")
const globalModel = require("../models/globalModel")
module.exports = {
    getNotification: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                if (data.type.indexOf("_reply_") > -1) {

                    connection.query("SELECT 'reply' as commentType, message as title,image,type,comment_id as id,parent_id FROM comments WHERE comment_id = ?", [data.object_id], function (err, results, fields) {
                        if (!err && results) {
                            const replyData = JSON.parse(JSON.stringify(results));
                            const reply = replyData[0]
                            data.reply = reply
                            connection.query("SELECT 'comments' as commentType, message as title,image,type,comment_id as id,id as content_id FROM comments WHERE comment_id = ?", [reply.parent_id], function (err, results, fields) {
                                if (!err && results) {
                                    const commentData = JSON.parse(JSON.stringify(results));
                                    const comment = commentData[0]
                                    if(comment){
                                        data.comment = comment
                                        let customUrl = "custom_url"
                                        let column = "video_id"
                                        let urlParam = "custom_url"
                                        let leftJOIN = ""
                                        if (reply.type == "channels") {
                                            column = "channel_id"
                                        }else if (reply.type == "reels") {
                                            column = "reel_id"
                                        }else if (reply.type == "stories") {
                                            column = "story_id"
                                        } else if (reply.type == "blogs") {
                                            column = "blog_id"
                                        } else if (reply.type == "members") {
                                            column = "user_id"
                                            customUrl = "user_id"
                                            urlParam = "username as custom_url"
                                            leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "
                                        } else if (reply.type == "artists") {
                                            column = "artist_id"
                                        } else if (reply.type == "playlists") {
                                            column = "playlist_id"
                                        }else if (reply.type == "channel_posts") {
                                            column = "post_id"
                                            urlParam = "post_id as custom_url"
                                            customUrl = "post_id"
                                        }else if (reply.type == "audio") {
                                            column = "audio_id"
                                        }else if (reply.type == "movies" || reply.type == "series") {
                                            column = "movie_id"
                                        }
                                        let typeName = comment.type.replace(/\s$/, '')
                                        if (typeName.charAt(typeName.length - 1) == "s") {
                                            typeName = typeName.slice(0, -1)
                                        }
                                        connection.query("SELECT '" + reply.type + "' as type," + (comment.type == "members" ? "displayname as title" : "title") + "," + (comment.type == "members" ? "avtar as image" : "image") + "," + column + " as id," + urlParam + " FROM " + (reply.type == "members" ? "users" : reply.type) +leftJOIN+ " WHERE " + customUrl + " = ?", [comment.content_id], function (err, results, fields) {
                                            if (!err && results) {
                                                const itemData = JSON.parse(JSON.stringify(results));
                                                const item = itemData[0]
                                                data[reply.type] = item
                                                let column = "users.user_id"
                                                let urlParam = "username as custom_url"
                                                leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "

                                                if (data.subject_type == "channels") {
                                                    column = "channel_id"
                                                    urlParam = "custom_url"
                                                    leftJOIN = ""
                                                }
                                                let typeName = data.subject_type.replace(/\s$/, '')
                                                if (typeName.charAt(typeName.length - 1) == "s") {
                                                    typeName = typeName.slice(0, -1)
                                                }
                                                connection.query("SELECT '" + data.subject_type + "' as type," + (data.subject_type != "channels" ? "displayname as title" : "title") + "," + (data.subject_type == "users" ? "IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image" : "IF(" + data.subject_type + ".image IS NULL || " + data.subject_type + ".image = '','" + req.appSettings[typeName + '_default_photo'] + "'," + data.subject_type + ".image) as image") + "," + (data.subject_type == "users" ? "avtar as image" : "image") + "," + column + " as id, " + urlParam + " FROM " + data.subject_type +leftJOIN+ " WHERE " + column + " = ?", [data.subject_id], function (err, results, fields) {
                                                    if (!err && results) {
                                                        const subjectData = JSON.parse(JSON.stringify(results));
                                                        const subject = subjectData[0]
                                                        data["subject"] = subject
                                                        resolve(data)
                                                    } else {
                                                        resolve(false)
                                                    }
                                                })
                                            } else {
                                                resolve(false)
                                            }
                                        })
                                    }else {
                                        resolve(false)
                                    }
                                } else {
                                    resolve(false)
                                }
                            })

                        } else {
                            resolve(false)
                        }
                    })
                } else if (data.type.indexOf('_comments_') > -1) {
                    connection.query("SELECT 'comments' as commentType, message as title,image,type,comment_id as id,id as content_id  FROM comments WHERE comment_id = ?", [data.object_id], function (err, results, fields) {
                        if (!err && results) {
                            let commentData = JSON.parse(JSON.stringify(results));
                            let comment = commentData[0]
                            if(comment){
                                let customUrl = "custom_url"
                                data.comment = comment
                                let urlParam = "custom_url"
                                let column = "video_id"
                                let leftJOIN = ""
                                if (comment.type == "channels") {
                                    column = "channel_id"
                                } else if (comment.type == "blogs") {
                                    column = "blog_id"
                                } else if (comment.type == "reels") {
                                    column = "reel_id"
                                } else if (comment.type == "members") {
                                    column = "user_id"
                                    urlParam = "username as custom_url"
                                    customUrl = "user_id"
                                    leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "
                                } else if (comment.type == "artists") {
                                    column = "artist_id"
                                }else if (comment.type == "stories") {
                                    column = "story_id"
                                } else if (comment.type == "playlists") {
                                    column = "playlist_id"
                                } else if (comment.type == "channel_posts") {
                                    column = "post_id"
                                    urlParam = "post_id as custom_url"
                                    customUrl = "post_id"
                                }else if (comment.type == "audio") {
                                    column = "audio_id"
                                } else if (comment.type == "movies" || comment.type == "series") {
                                    column = "movie_id"
                                } 
                                let typeName = comment.type.replace(/\s$/, '')
                                if (typeName.charAt(typeName.length - 1) == "s") {
                                    typeName = typeName.slice(0, -1)
                                }
                                connection.query("SELECT '" + comment.type + "' as type," + (comment.type == "members" ? "displayname as title" : "title") + "," + (comment.type == "members" ? "IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image" : "IF(" + comment.type + ".image IS NULL || " + comment.type + ".image = '','" + req.appSettings[typeName + '_default_photo'] + "'," + comment.type + ".image) as image") + "," + column + " as id, " + urlParam + " FROM " + (comment.type == "members" ? "users" : comment.type) +leftJOIN+ " WHERE " + customUrl + " = ?", [comment.content_id], function (err, results, fields) {
                                    if (!err && results) {
                                        const itemData = JSON.parse(JSON.stringify(results));
                                        const item = itemData[0]
                                        data[comment.type] = item

                                        let column = "users.user_id"
                                        let urlParam = "username as custom_url"
                                        leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "
                                        if (data.subject_type == "channels") {
                                            column = "channel_id"
                                            urlParam = "custom_url"
                                            leftJOIN = ""
                                        }
                                        let typeName = data.subject_type.replace(/\s$/, '')
                                        if (typeName.charAt(typeName.length - 1) == "s") {
                                            typeName = typeName.slice(0, -1)
                                        }
                                        connection.query("SELECT '" + data.subject_type + "' as type," + (data.subject_type == "users" ? "displayname as title" : "title") + "," + (data.subject_type == "users" ? "IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image" : "IF(" + data.subject_type + ".image IS NULL || " + data.subject_type + ".image = '','" + req.appSettings[typeName + '_default_photo'] + "'," + data.subject_type + ".image) as image") + "," + column + " as id, " + urlParam + " FROM " + data.subject_type +leftJOIN+ " WHERE " + column + " = ?", [data.subject_id], function (err, results, fields) {
                                            if (!err && results) {
                                                const subjectData = JSON.parse(JSON.stringify(results));
                                                const subject = subjectData[0]
                                                data["subject"] = subject
                                                resolve(data)
                                            } else {
                                                resolve(false)
                                            }
                                        })
                                    } else {
                                        resolve(false)
                                    }
                                })
                            }else {
                                resolve(false)
                            }
                        } else {
                            resolve(false)
                        }
                    })
                } else {
                    let leftJOIN = ""
                    let urlParam = "custom_url"
                    let column = "video_id"
                    if (data.object_type == "channels") {
                        column = "channel_id"
                    } else if (data.object_type == "blogs") {
                        column = "blog_id"
                    }else if (data.object_type == "reels") {
                        column = "reel_id"
                        urlParam = "reel_id as custom_url"
                    }else if (data.object_type == "stories") {
                        column = "story_id"
                        urlParam = "story_id as custom_url"
                    } else if (data.object_type == "members") {
                        column = "users.user_id"
                        urlParam = "username as custom_url"
                        leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "

                    } else if (data.object_type == "artists") {
                        column = "artist_id"
                    } else if (data.object_type == "playlists") {
                        column = "playlist_id"
                    }else if (data.object_type == "audio") {
                        column = "audio_id"
                    }else if (data.object_type == "movies" || data.object_type == "series") {
                        column = "movie_id"
                    }else if (data.object_type == "channel_posts") {
                        column = "post_id"
                        urlParam = "post_id as custom_url"
                    }else if(data.object_type == "package" || data.object_type == "user_profile"){
                        if(data.params){
                            let dataParams = JSON.parse(data.params);
                            for (var key in dataParams) {
                                if(data.type == "admin_custom_notification" && key == "text"){
                                    data.body = dataParams[key];
                                }
                                var obj = dataParams[key];
                                data[key] = {}
                                data[key]['title'] = req.i18n.t(obj)
                                data[key]['type'] = "custom"
                            }
                            data.vars = data.params
                        }
                        
                        data['subject'] = {}
                        if(!data['image'])
                            data['subject']['image'] = req.appSettings['default_notification_image']
                        data['subject']['type'] = data.object_type
                        resolve(data)
                        return
                    }
                    let typeName = data.object_type.replace(/\s$/, '')
                    if (typeName.charAt(typeName.length - 1) == "s") {
                        typeName = typeName.slice(0, -1)
                    }
                    connection.query("SELECT '" + data.object_type + "' as type," + (data.object_type == "members" ? "displayname as title" : "title") + "," + (data.object_type == "members" ? "IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image," : "IF(" + data.object_type + ".image IS NULL || " + data.object_type + ".image = '','" + req.appSettings[typeName + '_default_photo'] + "'," + data.object_type + ".image) as image,") + column + " as id, " + urlParam + " FROM " + (data.object_type == "members" ? "users" : data.object_type) +leftJOIN+ " WHERE " + column + " = ?", [data.object_id], function (err, results, fields) {
                        if(err) console.log(err)
                        if (!err && results) {
                            const itemData = JSON.parse(JSON.stringify(results));
                            const item = itemData[0]
                            data[data.object_type] = item
                            let column = "users.user_id"
                            let urlParam = "username as custom_url"
                            leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "
                            if (data.subject_type == "channels") {
                                column = "channel_id"
                                urlParam = "custom_url"
                                leftJOIN = ""
                            }
                            let typeName = data.subject_type.replace(/\s$/, '')
                            if (typeName.charAt(typeName.length - 1) == "s") {
                                typeName = typeName.slice(0, -1)
                            }
                            connection.query("SELECT '" + data.subject_type + "' as type," + (data.subject_type != "channels" ? "IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image" : "IF(" + data.subject_type + ".image IS NULL || " + data.subject_type + ".image = '','" + req.appSettings[typeName + '_default_photo'] + "'," + data.subject_type + ".image) as image") + "," + column + " as id, " + urlParam + " FROM " + data.subject_type +leftJOIN+ " WHERE " + column + " = ?", [data.subject_type], function (err, results, fields) {
                                if(err) console.log(err)    
                                if (!err && results) {
                                    const subjectData = JSON.parse(JSON.stringify(results));
                                    const subject = subjectData[0]
                                    data["subject"] = subject
                                    let column = "users.user_id"
                                    let urlParam = "username as custom_url"
                                    leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "

                                    if (data.subject_type == "channels") {
                                        column = "channel_id"
                                        urlParam = "custom_url"
                                        leftJOIN = ""
                                    }
                                    let typeName = data.subject_type.replace(/\s$/, '')
                                    if (typeName.charAt(typeName.length - 1) == "s") {
                                        typeName = typeName.slice(0, -1)
                                    }
                                    connection.query("SELECT '" + data.subject_type + "' as type," + (data.subject_type == "users" ? "displayname as title" : "title") + "," + (data.subject_type == "users" ? "IF(userdetails.avtar IS NULL OR userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as image," : "IF(" + data.subject_type + ".image IS NULL || " + data.subject_type + ".image = '','" + req.appSettings[typeName + '_default_photo'] + "'," + data.subject_type + ".image) as image,") + column + " as id, " + urlParam + " FROM " + data.subject_type +leftJOIN+ " WHERE " + column + " = ?", [data.subject_id], function (err, results, fields) {
                                        if (!err && results) {
                                            const subjectData = JSON.parse(JSON.stringify(results));
                                            const subject = subjectData[0]
                                            data["subject"] = subject
                                            resolve(data)
                                        } else {
                                            resolve(false)
                                        }
                                    })
                                } else {
                                    resolve(false)
                                }
                            })
                        } else {
                            resolve(false)
                        }
                    })
                }
            })
        })
    },
    findAll: function (req, data) {
        return new Promise(function (resolve, reject) {
            if (!req.user && !data.notification_send) {
                resolve(false)
                return false
            }
            req.getConnection(function (err, connection) {
                let owner_id = 0
                if (!data.notification_send && req.user.user_id) {
                    owner_id = parseInt(req.user.user_id)
                }

                let condition = []
                let modulesIn = "'members','videos'"

                if(req.query && req.query.packagesExists){
                    modulesIn = modulesIn+",'default'";
                }

                if (req.appSettings["enable_blog"] == 1) {
                    modulesIn = modulesIn + ",'blogs'"
                }
                if (req.appSettings["enable_playlist"] == 1) {
                    modulesIn = modulesIn + ",'playlists'"
                }
                if (req.appSettings["enable_audio"] == 1) {
                    modulesIn = modulesIn + ",'audio'"
                }
                if (req.appSettings["enable_movie"] == 1) {
                    modulesIn = modulesIn + ",'movies'"
                    modulesIn = modulesIn + ",'series'"
                }
                if (req.appSettings["enable_channel"] == 1) {
                    modulesIn = modulesIn + ",'channels'"
                }
                if (req.appSettings["enable_reels"] == 1) {
                    modulesIn = modulesIn + ",'reels'"
                }
                if (req.appSettings["enable_stories"] == 1) {
                    modulesIn = modulesIn + ",'stories'"
                }
                if (req.appSettings["live_stream_start"] == 1) {
                    modulesIn = modulesIn + ",'livestreaming'"
                }
                let sql = "SELECT notifications.*,notificationtypes.body,notificationtypes.vars From notifications LEFT JOIN notificationtypes on notificationtypes.type = notifications.type WHERE notificationtypes.content_type IN (" + modulesIn + ") "

                if (owner_id > 0) {
                    sql += " AND notifications.owner_id = " + owner_id
                }
                if (data.notification_send > 0) {
                    sql += " AND notifications.notification_send = " + (data.notification_send == 2 ? 0 : 1)
                }
                if (data.minid) {
                    condition.push(parseInt(data.minid))
                    sql += " AND notifications.notification_id < ?"
                }
                sql += " ORDER By notification_id DESC "
                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }
                
                connection.query(sql, condition, function (err, results, fields) {
                    if (err)
                        resolve(false)
                    if (results) {
                        const notifications = JSON.parse(JSON.stringify(results));
                        resolve(notifications);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    insert: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
               
                if (!data.owner_id) {
                    resolve(true)
                    return;
                }
                
                connection.query('SELECT notification_id FROM notifications WHERE owner_id = ? AND subject_type = ? AND subject_id = ? AND object_type = ? AND object_id = ? AND type = ?', [data.owner_id, data.subject_type, data.subject_id, data.object_type, data.object_id, data.type], function (err, results, fields) {
                    if(!data.notDelete){
                        connection.query('DELETE FROM notifications WHERE owner_id = ? AND subject_type = ? AND subject_id = ? AND object_type = ? AND object_id = ? AND type = ?', [data.owner_id, data.subject_type, data.subject_id, data.object_type, data.object_id, data.type], function (err, data, fields) {
                        });
                    }
                    if (data.insert) {
                        let leftJOIN = ""
                        const date = dateTime.create().format("Y-m-d H:M:S")
                        let column = "video_id"
                        let customSelectColumn = ""
                        if (data.object_type == "channels") {
                            column = "channel_id"
                        } else if (data.object_type == "blogs") {
                            column = "blog_id"
                        } else if (data.object_type == "members") {
                            column = "users.user_id"
                            leftJOIN = " LEFT JOIN userdetails ON users.user_id = userdetails.user_id "
                        } else if (data.object_type == "artists") {
                            column = "artist_id"
                        } else if (data.object_type == "playlists") {
                            column = "playlist_id"
                        } else if (data.object_type == "comments") {
                            column = "comment_id"
                        } else if (data.object_type == "channel_posts") {
                            column = "post_id"
                        }else if (data.object_type == "audio") {
                            column = "audio_id"
                        }else if (data.object_type == "movies" || data.object_type == "series") {
                            column = "movie_id"
                            customSelectColumn = ",movies.category as mvcategory"
                        }else if (data.object_type == "reels") {
                            column = "reel_id"
                        }else if (data.object_type == "stories") {
                            column = "story_id"
                        }
                        //site notifications
                        connection.query('SELECT ' + (data.object_type == "members" ? "users" : data.object_type) + '.' + (data.object_type == "members" ? "user_id" : "owner_id") + customSelectColumn +',notificationsettings.type FROM ' + (data.object_type == "members" ? "users" : data.object_type) + leftJOIN+ ' LEFT JOIN notificationsettings ON notificationsettings.owner_id = ' + (data.object_type == "members" ? "users" : data.object_type) + '.' + (data.object_type == "members" ? "user_id" : "owner_id") + ' AND notificationsettings.type = "' + data.type + '" WHERE ' + column + " = ? ", [data.object_id], function (err, results, fields) {
                            if(err){
                                console.log(err)
                            }
                            if (err)
                                resolve(false)
                            let ownerSame = false
                            let notificationEnable = true
                            const item = JSON.parse(JSON.stringify(results));
                            if (results && !data.forceInsert) {
                                if (item.length > 0) {
                                    if (item[0][data.object_type == "members" ? "user_id" : "owner_id"] == req.user.user_id) {
                                        ownerSame = true
                                    }
                                    if (item[0].type) {
                                        notificationEnable = false
                                    }
                                }
                            }
                            if(column == "movie_id"){
                                if(results){
                                    if(item[0].mvcategory == "series" && data.type.indexOf("purchase_approved") < 0){
                                        data.type = data.type.replace("movies_",'series_');
                                    }
                                }
                            }
                            if (!ownerSame && notificationEnable) {
                                let notificationData = { owner_id: data.owner_id, subject_type: data.subject_type, subject_id: data.subject_id, object_type: data.object_type, object_id: data.object_id, type: data.type, creation_date: date, read: 0, is_read: 0 }
                                connection.query('INSERT INTO notifications SET ? ', [notificationData], function (err, results, fields) {
                                    if(err){
                                        console.log(err)
                                    }
                                    if (err)
                                        resolve(false)
                                    if (results) {

                                        //send notification to user
                                        connection.query("SELECT vars,body FROM notificationtypes WHERE type = ?", [data.type], function (err, resultsType, fields) {
                                            if (!err) {
                                                const typeData = JSON.parse(JSON.stringify(resultsType))[0];
                                                module.exports.getNotification(req, notificationData).then(result => {
                                                    if (result) {
                                                        result.notification_id = results.insertId
                                                        result.vars = typeData.vars
                                                        result.body = typeData.body
                                                         // send push notifications
                                                         module.exports.sendPushNotifications(req,result,data.owner_id);
                                                        socketio.getIO().emit('notifications', {
                                                            owner_id: data.owner_id,
                                                            notification: result
                                                        });
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        
                        connection.query('SELECT ' + (data.object_type == "members" ? "users" : data.object_type) + '.' + (data.object_type == "members" ? "user_id" : "owner_id") + ' FROM ' + (data.object_type == "members" ? "users" : data.object_type) + ' WHERE ' + column + " = ? ", [data.object_id], function (err, results, fields) {
                            if(err){
                                console.log(err)
                            }
                            if (err)
                                resolve(false)
                            let ownerSame = false
                            if (results && !data.forceInsert) {
                                const item = JSON.parse(JSON.stringify(results));
                                if (item.length > 0) {
                                    if (item[0][data.object_type == "members" ? "user_id" : "owner_id"] == req.user.user_id) {
                                        ownerSame = true
                                    }
                                }
                            }

                            if (!ownerSame) {
                                //send points to user
                                module.exports.sendPoints(req,data);
                            }
                        })



                        //email notifications
                        connection.query('SELECT ' + (data.object_type == "members" ? "users" : data.object_type) + '.' + (data.object_type == "members" ? "user_id" : "owner_id") + customSelectColumn+',emailsettings.type FROM ' + (data.object_type == "members" ? "users" : data.object_type) + leftJOIN+ ' LEFT JOIN emailsettings ON emailsettings.owner_id = ' + (data.object_type == "members" ? "users" : data.object_type) + '.' + (data.object_type == "members" ? "user_id" : "owner_id") + ' AND emailsettings.type = "' + data.type + '" AND emailsettings.email = 0 WHERE ' + column + " = ? ", [data.object_id], function (err, results, fields) {
                            if (err)
                                resolve(false)
                            let ownerSame = false
                            let notificationEnable = true
                            const item = JSON.parse(JSON.stringify(results));
                            if (results && !data.forceInsert) {
                                if (item.length > 0) {
                                    if (item[0][data.object_type == "members" ? "user_id" : "owner_id"] == req.user.user_id) {
                                        ownerSame = true
                                    }
                                    if (item[0].type) {
                                        notificationEnable = false
                                    }
                                }
                            }
                            if(column == "movie_id"){
                                if(results){
                                    if(item[0].mvcategory == "series" && data.type.indexOf("purchase_approved") < 0){
                                        data.type = data.type.replace("movies_",'series_');
                                    }
                                }
                            }
                            if (!ownerSame && notificationEnable) {
                                let notificationData = { owner_id: data.owner_id, subject_type: data.subject_type, subject_id: data.subject_id, object_type: data.object_type, object_id: data.object_id, type: data.type, creation_date: date, read: 0, is_read: 0 }
                                connection.query("SELECT * FROM users left join userdetails ON userdetails.user_id = users.user_id WHERE users.user_id = ?", [notificationData.owner_id], function (err, ownerData, fields) {
                                    if (!err) {
                                        //send notification to user
                                        connection.query("SELECT vars,type FROM emailtemplates WHERE type = ?", [data.type], function (err, resultsType, fields) {
                                            if (!err) {
                                                const typeData = JSON.parse(JSON.stringify(resultsType))[0];
                                                module.exports.getNotification(req, notificationData).then(result => {
                                                    if (result && typeData) {
                                                        result.vars = typeData.vars
                                                        result.type = typeData['type']
                                                        result.ownerEmail = ownerData[0]
                                                        result.toName = ownerData[0].displayname
                                                        result.toEmail = ownerData[0].email
                                                        emailFunction.sendMessage(req, result)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })

                    }else{
                        if(results){
                            const id = JSON.parse(JSON.stringify(results));
                            if(id && id.length){
                            //delete notifications
                                socketio.getIO().emit('deleteNotifications', {
                                    owner_id: data.owner_id,
                                    notification_id: id[0].notification_id
                                });
                            }
                        }
                    }
                })
            })
            resolve(true)
        })

    },
    sendPushNotifications:async(req,notification,owner_id) => {
        if(req.appSettings["enable_pushnotification"] == 0 || req.appSettings["oneSignal_app_id"] == "" || req.appSettings["oneSignal_restapi_key"] == "")
            return;
        let restAPIToken = req.appSettings["oneSignal_restapi_key"]
        let appID = req.appSettings["oneSignal_app_id"]

        // get push tokens

        let tokens = []
        await globalModel.custom(req,"SELECT * FROM devices WHERE owner_id =?",[owner_id]).then(results => {
            let devices = JSON.parse(JSON.stringify(results));
            devices.forEach(device => {
                if(device.push_token)
                    tokens.push(device.push_token);
            })
        })
        if(tokens.length == 0){
            return;
        }

        //notification body and title

        let body = notification.body
        const rx = /(\{.*?\})/gi;
        const matches = body.match(rx)

        const array = {}
        const vars = JSON.parse(notification.vars)
        if (matches && matches.length) {
            let i = 0
            matches.forEach(match => {
                if (match.indexOf('_') < 0 || match == "{channel_posts}") {
                    let data = { ...notification[match.replace('{', '').replace('}', '')] }
                    if (data) {
                        if (vars[match.replace('{', '').replace('}', '')]) {
                            data.title = req.i18n.t(vars[match.replace('{', '').replace('}', '')])
                        }
                        array[match] = module.exports.notificationURLs(data)
                    }
                } else {
                    const matchOrg = match
                    let matchString = match.split('_')[0]
                    let data = { ...notification[matchString.replace('{', '')] }
                    array[matchOrg] = module.exports.notificationURLs({ title: data.title, type: match.replace('{', '').replace('}', '') })
                }
                i = i + 1;
            });
        }

        const pattern = /(\{stories\})|(\{reels\})|(\{subject\})|(\{audio\})|(\{videos\})|(\{movies\})|(\{channels\})|(\{blogs\})|(\{playlists\})|(\{comment\})|(\{reply\})|(\{comment_title\})|(\{reply_title\})|(\{members\})|(\{planName\})|(\{channel_posts\})|(\{period\})/g;
                
        let image = null
        if (notification.object_type == "channels") {
            if(notification['channels'])
                image = notification["channels"].image;
        } else if (notification.object_type == "blogs") {
            if(notification['blogs'])
                image = notification["blogs"].image;
        } else if (notification.object_type == "artists") {
            if(notification['artists'])
                image = notification["artists"].image;
        } else if (notification.object_type == "playlists") {
            if(notification['playlists'])
                image = notification["playlists"].image;
        } else if (notification.object_type == "videos") {
            if(notification['videos'])
                image = notification["videos"].image;
        }else if (notification.object_type == "movies") {
            if(notification['movies'])
                image = notification["movies"].image;
        } else if (notification.object_type == "audio") {
            if(notification['audio'])
                image = notification["audio"].image;
        }else if (notification.object_type == "reels") {
            if(notification['reels'])
                image = notification["reels"].image;
        }else if (notification.object_type == "stories") {
            if(notification['stories'])
                image = notification["stories"].image;
        }

        if(image){
            image = image.indexOf("http://") > -1 || image.indexOf("https://") > -1 ? image : process.env.PUBLIC_URL+image
        }

        let titleString = module.exports.replacePatternToComponent(body, pattern, array);
        titleString = titleString ?? []
        var title = ""
        var link = ""
        if(titleString != 'string' && titleString instanceof String){
            titleString.forEach(item => {
                if (typeof item === 'string' || item instanceof String){
                    title += item
                }else{
                    if(item.title){
                        title += item.title
                    }
                    if(item.link){
                        link = item.link.indexOf("http://") > -1 || item.link.indexOf("https://") > -1 ? item.link : process.env.PUBLIC_URL+item.link
                    }
                }
            })
        }
        if(title == ""){
            return;
        }
        notification.link = link
        notification.imageSuffix = req.appSettings.imageSuffix
        notification.baseURL = process.env.PUBLIC_URL
        var data = {
            app_id: appID,
            contents: {
                "en": title,
            },
            // headings: {
            //     "en": title,
            // },
            data:notification,
            include_player_ids: tokens,
            large_icon: image ? image : null,
            android_led_color: 'FF0000FF',
            priority: 9
        }
        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic "+restAPIToken
        };
    
        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };
    
        var https = require('https');
        var req = https.request(options, function (res) {
            res.on('data', function (data) {
                if(process.env.NODE_ENV != 'production'){
                    console.log("Response:");
                    try{
                        console.log(JSON.parse(data));
                    }catch(err){
                        
                    }
                }
            });
        });
    
        req.on('error', function (e) {
            console.log("ERROR:");
            console.log(e);
        });
    
        req.write(JSON.stringify(data));
        req.end();
    },
    replacePatternToComponent:function (text, pattern, array){
        const splitText = text.split(pattern);
        const matches = text.match(pattern);
        if (splitText.length <= 1) {
            return text;
        }
        return splitText.reduce((arr, element) => {
            if (!element) return arr;

            if (matches.includes(element)) {
                return [...arr, array[element]];
            }
            return [...arr, element];
        },
            []
        );
    },
    notificationURLs:function(data){
        if (!data.commentType && ( data.type == "users" || data.type == "members")) {
            return {
                link:`/${data.custom_url}`,
                title:data.title
            }
        } else if (!data.commentType && data.type == "channels") {
            return {
                link:`/channel/${data.custom_url}`,
                title:data.title
            }
        } else if (!data.commentType && data.type == "channel_posts") {
            return {
                link:`/post/${data.post_id ? data.post_id : data.custom_url}`,
                title:data.title
            }
        }else if (!data.commentType && data.type == "blogs") {
            return {
                link:`/blog/${data.custom_url}`,
                title:data.title
            }
        } else if (!data.commentType && data.type == "artists") {
            return {
                link:`/artist/${data.custom_url}`,
                title:data.title
            }
        } else if (!data.commentType && data.type == "playlists") {
            return {
                link:`/playlist/${data.custom_url}`,
                title:data.title
            }
        }else if (!data.commentType && data.type == "stories") {
            return {
                link:`/story/${data.story_id}`,
                title:data.title
            }
        } else if (!data.commentType && data.type == "audio") {
            return {
                link:`/audio/${data.custom_url}`,
                title:data.title
            }
        } else if (!data.commentType && data.type == "videos") {
            return {
                link:`/watch/${data.custom_url}`,
                title:data.title
            }
        }else if (!data.commentType && data.type == "reels") {
            return {
                link:`/reel/${data.reel_id}`,
                title:data.title
            }
        }else if (!data.commentType && (data.type == "movies" || data.type == "series")) {
            return {
                link:`/watch/${data.custom_url}`,
                title:data.title
            }
        }else if(data.commentType == "comments" || data.type == "comment"){
            return {
                link:`/comment/${data.custom_url}`,
                title:data.title
            }
        }else if(data.commentType == "reply" || data.type == "reply"){
            return {
                link:`/reply/${data.custom_url}`,
                title:data.title
            }
        }else if(data.type == "package"){
            return {
                link:`/upgrade`,
                title:data.title
            }
           
        }else if(data.type == "reply_title" || data.type == "comment_title"){
            return {
                title:data.title
            }
        }else if(data.type == "custom"){
            return {
                title:data.title
            }
        }else{
            return {}
        }
    },
    sendPoints:async function(req,data,level_id){
        let dataObject = {...data}
        req.getConnection(async function (err, connection) {
            if(!level_id){
                //get user
                let owner_id = req.user && !data.notChangeOwnerID ? req.user.user_id : dataObject.owner_id
                await new Promise(async function(resolve, reject){
                    connection.query("SELECT * FROM users where user_id = ?", [owner_id], function (err, resultsType, fields) {
                        if(!err && resultsType && resultsType.length > 0){
                            let typeData = JSON.parse(JSON.stringify(resultsType))[0];
                            level_id = typeData.level_id
                        }
                        resolve();
                    })
                })
            }
            connection.query("SELECT * FROM point_settings WHERE level_id = ? AND type = ? AND approve = 1 LIMIT 1", [level_id,dataObject.type], function (err, resultsType, fields) {
                if(err){
                    console.log(err)
                }
                if (!err && resultsType && resultsType.length > 0) {
                    let typeData = JSON.parse(JSON.stringify(resultsType))[0];
                    if(req.user && req.user.user_id != dataObject.owner_id && !data.notChangeOwnerID){
                        dataObject.owner_id = req.user.user_id
                    }
                    
                    if(typeof typeData == "undefined"){
                        typeData.first_time = 0
                        typeData.next_time = 0
                        typeData.max = 0
                    }
                    //get points for today
                    const date = dateTime.create().format("Y-m-d")
                    connection.query("SELECT SUM(credit) as totalCredit FROM user_point_values WHERE type = ? AND credit != 0 AND owner_id = ? AND DATE(creation_date) = ? ORDER BY value_id DESC LIMIT 1", [dataObject.type,dataObject.owner_id,date], function (err, resultsType, fields) {
                        if(err){
                            console.log(err)
                        }
                        if (!err) {
                            const previousActivity = JSON.parse(JSON.stringify(resultsType));
                            let isPreviousActivityExists = false
                            let totalCredit = 0
                            if(previousActivity.length > 0){
                                totalCredit = parseFloat(previousActivity[0].totalCredit)
                                if(totalCredit > 0){
                                    isPreviousActivityExists = true
                                }
                            }
                            
                            if((!isPreviousActivityExists && parseFloat(typeData.first_time) > 0) || (isPreviousActivityExists && (parseFloat(typeData.next_time) > 0 && parseFloat(totalCredit + typeData.next_time) <= parseInt(typeData.max) ))){
                                let insertObject = {}
                                insertObject["owner_id"] = dataObject.owner_id
                                insertObject["type"] = dataObject.type
                                insertObject["resource_type"] = dataObject.object_type
                                insertObject["resource_id"] = dataObject.object_id
                                let pointValue = 0
                                if(isPreviousActivityExists){
                                    pointValue = typeData.next_time
                                }else{
                                    pointValue = typeData.first_time
                                }
                                insertObject["credit"] = pointValue
                                insertObject["creation_date"] = dateTime.create().format("Y-m-d H:M:S")
                                insertObject["modified_date"] = dateTime.create().format("Y-m-d H:M:S")
                                connection.query('INSERT INTO user_point_values SET ? ', [insertObject], function (err, results, fields) {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        //update user points
                                        connection.query('UPDATE users SET points = points + '+pointValue + " WHERE user_id = ?", [dataObject.owner_id], function (err, results, fields) {
                                            if(err){
                                                console.log(err)
                                            }
                                        })
                                    }
                                })
                            }

                        }

                    })

                }
            })
        })
    },
    insertFollowNotifications: function (req, data) {
        return new Promise(function (resolve,reject) {
            req.getConnection(function (_, connection) {
                const date = dateTime.create().format("Y-m-d H:M:S")
                let sql = "INSERT INTO notifications (`owner_id`,`subject_type`,`subject_id`,`object_type`,`object_id`,`type`,`notification_send`,`creation_date`) SELECT owner_id,?,?,?,?,?,0,? FROM `followers` WHERE id = ? AND type = ? AND owner_id NOT IN ( SELECT resource_id from user_blocks WHERE owner_id = "+data.subject_id+" ) "
                connection.query(sql, [data.subject_type, data.subject_id, data.object_type, data.object_id, data.type, date, data.subject_id, data.subject_type == "users" ? "members" : data.subject_type], function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
            })
        })
    },
    insertScheduledFollowers: function (req, data) {
        return new Promise(function (resolve,reject) {
            req.getConnection(function (_, connection) {
                const date = dateTime.create().format("Y-m-d H:M:S")
                connection.query("INSERT INTO notifications (`owner_id`,`subject_type`,`subject_id`,`object_type`,`object_id`,`type`,`notification_send`,`creation_date`) SELECT owner_id,?,?,?,?,?,0,? FROM `scheduled_videos` WHERE video_id = ? AND owner_id NOT IN ( SELECT resource_id from user_blocks WHERE owner_id = "+data.subject_id+" )", [data.subject_type, data.subject_id, data.object_type, data.object_id, data.type, date, data.object_id], function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
            })
        })
    }
}
