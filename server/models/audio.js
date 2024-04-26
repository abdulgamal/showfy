const dateTime = require('node-datetime');
const commonFunction = require("../functions/commonFunctions");
const privacyModel = require("../models/privacy")
const privacyLevelModel = require("../models/levelPermissions")

module.exports = {
    checkAudioPurchased: function (data, req) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT state FROM transactions WHERE (state = "approved" || state = "completed") AND ((sender_id = 0 AND owner_id = ?) OR sender_id = ? ) AND id = ? AND type = "audio_purchase"', [parseInt(data.owner_id),parseInt(data.owner_id),parseInt(data.id)], function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    findById: function (id, req) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM audio WHERE approve = 1 AND audio_id = ?', [id], function (err, results) {
                    if (err)
                        resolve(false)

                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    delete: function (id, req) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query("SELECT * FROM audio WHERE audio_id = ?", [id], function (err, results, fields) {
                    const audio = JSON.parse(JSON.stringify(results))[0];
                    connection.query("DELETE FROM audio WHERE audio_id = ?", [id], function (err, results, fields) {
                        if (err)
                            resolve(false)
                        if (results) {
                            commonFunction.deleteImage(req,'',"","",audio);
                            connection.query("DELETE FROM comments WHERE type = 'audio' && id = ?", [id], function (err, results, fields) { })
                            connection.query("DELETE FROM favourites WHERE type = 'audio' && id = ?", [id], function (err, results, fields) { })
                            connection.query("DELETE FROM likes WHERE type = 'audio' && id = ?", [id], function (err, results, fields) { })
                            connection.query("DELETE FROM recently_viewed WHERE type = 'audio' && id = ?", [id], function (err, results, fields) { })
                            connection.query("DELETE FROM ratings WHERE type = 'audio' && id = ?", [id], function (err, results, fields) { })
                            connection.query("DELETE FROM notifications WHERE (object_type = 'audio' && object_id = ?) OR (subject_type = 'audio' && object_id = ?)", [id,id], function (err, results, fields) { })
                            connection.query("DELETE FROM reports WHERE type = ? AND id = ?", ["audio", audio.custom_url], function (err, results, fields) {
                            })
                            resolve(true)
                        } else {
                            resolve("");
                        }
                    })
                })
            })
        });
    },
    getAudios: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(async function (err, connection) {
                let condition = []
                let owner_id = 0
                if (req.user && req.user.user_id) {
                    owner_id = parseInt(req.user.user_id)
                }
                let customSelect = ""
                if (data.orderby == "random") {
                    customSelect = ' FLOOR(1 + RAND() * audio.audio_id) as randomSelect, '
                }
                let customUrlAudio = ""
               // if(!data.myContent){
                customUrlAudio = "audio.custom_url as vcustom_url,"
               // }

               let isAllowedView = req.levelPermissions["audio.view"] && req.levelPermissions["audio.view"].toString() == "2";
                let checkPlanColumn =  ' CASE WHEN '+(isAllowedView ? 1 : 0)+' = 1 THEN 1 WHEN audio.owner_id = '+owner_id+' THEN 1 WHEN member_plans.price IS NULL THEN 1 WHEN transactions.transaction_id IS NOT NULL THEN 1 WHEN mp.price IS NULL THEN 0 WHEN  `member_plans`.price <= mp.price THEN 1'
                checkPlanColumn +=  ' WHEN  `member_plans`.price > mp.price THEN 2'
                checkPlanColumn += ' ELSE 0 END as is_active_package, '

                let sql = 'SELECT '+checkPlanColumn+customUrlAudio+'audio.*,'+customSelect+'transactions.transaction_id as ptran_id,likes.like_dislike,users.level_id as owner_level_id,userdetails.displayname,userdetails.username,userdetails.verified,IF(audio.image IS NULL || audio.image = "","' + req.appSettings['audio_default_photo'] + '",audio.image) as image,IF(userdetails.avtar IS NULL || userdetails.avtar = "",(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar,favourites.favourite_id FROM audio '
                let orderbyField = false
                if (data.recentlyViewed) {
                    condition.push(parseInt(data.owner_id))
                    orderbyField = " recently_viewed.view_id DESC "
                    sql += " INNER JOIN recently_viewed ON audio.audio_id = recently_viewed.id AND recently_viewed.owner_id = ? AND recently_viewed.type='audio' "
                }
                if (data.myrated) {
                    orderbyField = " ratings.rating_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN ratings ON audio.audio_id = ratings.id AND ratings.owner_id = ? AND ratings.type='audio' "
                }
                if (data.myfav) {
                    orderbyField = " f.favourite_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN favourites as f ON audio.audio_id = f.id AND f.owner_id = ? AND f.type='audio' "
                }
                if (data.mylike) {
                    orderbyField = " l.like_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN likes as l ON audio.audio_id = l.id AND l.owner_id = ? AND l.type='audio' AND l.like_dislike = 'like' "
                }
                if (data.mydislike) {
                    orderbyField = " l.like_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN likes as l ON audio.audio_id = l.id AND l.owner_id = ? AND l.type='audio' AND l.like_dislike = 'dislike' "
                }

                if (data.mycommented) {
                    orderbyField = " comments.comment_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN comments ON audio.audio_id = comments.id AND comments.owner_id = ? AND comments.type='audio' "
                }

                if(data.purchaseAudio){
                    sql += " INNER JOIN transactions as tra ON audio.audio_id = tra.id "
                }

                if(data.purchaseAudio){
                    condition.push(data.purchase_user_id)
                    sql+= " AND (tra.state = 'completed' || tra.state = 'approved') AND tra.owner_id = ? AND tra.type = 'audio_purchase'"
                }
                
                condition.push(req.user ? req.user.user_id : 0)
                sql += ' LEFT JOIN `member_plans` ON `member_plans`.member_plan_id = REPLACE(`audio`.view_privacy,"package_","") LEFT JOIN '
                sql += ' `subscriptions` ON subscriptions.id = audio.owner_id AND subscriptions.owner_id = ? AND subscriptions.type = "user_subscribe" AND subscriptions.status IN ("active","completed") LEFT JOIN `member_plans` as mp ON mp.member_plan_id = `subscriptions`.package_id '
                condition.push(owner_id)
                sql += ' LEFT JOIN transactions ON transactions.id = audio.audio_id AND (transactions.state = "approved" || transactions.state = "completed") AND transactions.owner_id = ? AND transactions.type = "audio_purchase" '

                if (data.channel_id) {
                    sql += " LEFT JOIN channelaudio ON channelaudio.audio_id = audio.audio_id AND channel_id = " + data.channel_id
                }
                sql += ' LEFT JOIN users on users.user_id = audio.owner_id LEFT JOIN userdetails on users.user_id = userdetails.user_id LEFT JOIN likes ON likes.id = audio.audio_id AND likes.type = "audio"  AND likes.owner_id =  ' + owner_id + ' LEFT JOIN favourites ON (favourites.id = audio.audio_id AND favourites.type = "audio" AND favourites.owner_id = ' + owner_id + ') '

               
                

                sql += " WHERE 1=1 "

                await privacyModel.checkSQL(req,'audio','audio','audio_id').then(result => {
                    if(result){
                        sql += " AND ( "+result+" )"
                    }
                })


                sql += " AND users.active = 1 AND users.approve = 1 "
                if (!data.myContent) {
                    if (data.audioview) {
                        if(!req.user || req.levelPermissions['audio.view'] != 2)
                            sql += " AND audio.approve = 1 "
                    }else if(!data.purchaseAudio){
                        sql += ' AND audio.search = 1 AND audio.approve = 1 '
                    }else if(!data.purchaseAudio){
                        sql += ' AND audio.approve = 1 '
                    }

                }
                sql += " AND audio.title IS NOT NULL AND audio.title != '' "
                if (data.title) {
                    condition.push(data.title.toLowerCase())
                    sql += " AND LOWER(audio.title) LIKE CONCAT('%', ?,  '%')"
                }

                if (data.owner_id && !data.myCustom) {
                    condition.push(parseInt(data.owner_id))
                    sql += " AND audio.owner_id = ?"
                }
               
                if (data.is_featured) {
                    condition.push(parseInt(data.is_featured))
                    sql += " AND audio.is_featured = ?"
                }
                if (data.is_not_hot) {
                    condition.push(1)
                    sql += " AND audio.is_hot != ?"
                }
                if (data.is_not_featured) {
                    condition.push(1)
                    sql += " AND audio.is_featured != ?"
                }
                if (data.not_audio_id) {
                    condition.push(parseInt(data.not_audio_id))
                    sql += " AND audio.audio_id != ?"
                }
                if (data.is_not_sponsored) {
                    condition.push(1)
                    sql += " AND audio.is_sponsored != ?"
                }
                if (data.is_hot) {
                    condition.push(parseInt(data.is_hot))
                    sql += " AND audio.is_hot = ?"
                }
                if (data.is_sponsored) {
                    condition.push(parseInt(data.is_sponsored))
                    sql += " AND audio.is_sponsored = ?"
                }
                if (data.offtheday) {
                    condition.push(data.offtheday)
                    sql += " AND audio.offtheday = ?"
                }


                if (data.custom_url) {
                    condition.push(data.custom_url)
                    sql += " AND audio.custom_url =?"
                }

                if(data.user_home_content){
                    sql += " AND view_privacy LIKE 'package_%'";
                }

                //if (!data.myContent) {
                    sql += " GROUP BY audio.audio_id "
               // }
               if(data.purchaseAudio) {
                    sql += " ORDER BY tra.transaction_id DESC "
                }else if (data.orderby == "random") {
                    sql += " ORDER BY randomSelect DESC "
                } else if (orderbyField) {
                    sql += " ORDER BY " + orderbyField
                } else if (data.orderby) {
                    sql += " ORDER BY " + data.orderby
                } else {
                    sql += " ORDER BY audio.audio_id desc "
                }

                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                if (data.offset) {
                    condition.push(data.offset)
                    sql += " OFFSET ?"
                }

                connection.query(sql, condition,async function (err, results, fields) {
                    if (err)
                        resolve(err)

                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        const audios = []
                        if(level && level.length){
                            for(var key in level){
                                let audio = {...level[key]}
                                delete audio.password
                                let isValidCreatePlan = 0;
                                if(!req.allowPeaks){
                                    delete audio.peaks;
                                }
                                await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',audio.owner_level_id).then(result => {
                                    isValidCreatePlan = result  == 1 ? 1 : 0
                                })

                                if(audio.is_active_package != 1 && !audio.ptran_id && isValidCreatePlan == 1){
                                    audio.purchasePackage = 1;
                                    delete audio.audio_file
                                }
                                await privacyModel.permission(req, 'audio', 'edit', audio).then(result => {
                                    if(parseFloat(audio.price) > 0 && !audio.ptran_id && !result && (audio.view_privacy.indexOf("package_") == -1)) {
                                        delete audio.audio_file
                                    }
                                })
                                
                               
                                audios.push(audio)
                            }
                            resolve(audios)
                        }else{
                            resolve(level);
                        }
                    } else {
                        resolve("");
                    }
                })
            })
        })
    },
    userAudioUploadCount: function (req, res) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT COUNT(audio_id) as totalAudios FROM audio WHERE  owner_id = ?', [req.user.user_id], function (err, results, fields) {
                    if (err)
                        reject(err)

                    if (results) {
                        const audio = JSON.parse(JSON.stringify(results));
                        resolve(audio[0]);
                    } else {
                        resolve("");
                    }
                })
            })
        });
    },
    findByCustomUrl: function (id, req,allowData = false) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM audio WHERE custom_url = ?', [id], function (err, results, fields) {
                    if (err)
                        reject(false)
                    if (results) {
                        const audio1 = JSON.parse(JSON.stringify(results));
                        let audio = audio1[0]
                        if (!allowData && audio) {
                            delete audio['password']
                        }
                        resolve(audio);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    getStats: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let condition = []
                let sql = ""
                let type = data.type ? data.type : "audio_purchase"
                if (data.criteria == "today") {
                    let match = { "00 AM": 0, "01 AM": 0, "02 AM": 0, "03 AM": 0, "04 AM": 0, "05 AM": 0, "06 AM": 0, "07 AM": 0, "08 AM": 0, "09 AM": 0, "10 AM": 0, "11 AM": 0, "12 PM": 0, "01 PM": 0, "02 PM": 0, "03 PM": 0, "04 PM": 0, "05 PM": 0, "06 PM": 0, "07 PM": 0, "08 PM": 0, "09 PM": 0, "10 PM": 0, "11 PM": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('Y-m-d') + ' 00:00:00';
                    var d = new Date();
                    let dd = dateTime.create(d)
                    let nextDate = dd.format('Y-m-d') + " 23:59:00"
                    
                    condition.push(currentDay)
                    condition.push(nextDate)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    condition.push(type)
                    if(data.audio_id){
                        condition.push(data.audio_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    if(data.sender){
                        condition.push(data.sender.user_id)
                        sql += " AND sender_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d %h')"

                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            
                            if (err)
                                resolve(false)
                            const resultArray = {}
                            const spentArray = {}
                            if (results) {

                                let spent = []
                                let result = []

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('I p')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })

                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                        //match[key.toString()] = resultArray[key]
                                    } else {
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('W')})
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_month") {
                    var dt = dateTime.create();
                    var currentYear = dt.format('Y');
                    var currentMonth = dt.format('m');
                    let daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

                    var date = new Date();
                    var firstDay = dateTime.create(new Date(date.getFullYear(), date.getMonth(), 1)).format("Y-m-d") + " 00:00:00";
                    var lastDay = dateTime.create(new Date(date.getFullYear(), date.getMonth() + 1, 0)).format("Y-m-d") + " 23:59:00";

                    let match = ""
                    if (daysInMonth == 31) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0, "31 ": 0 }
                    } else if (daysInMonth == 30) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0 }
                    } else if (daysInMonth == 29) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0}
                    } else if (daysInMonth == 28) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0}
                    }

                    condition.push(firstDay)
                    condition.push(lastDay)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    condition.push(type)
                    if(data.audio_id){
                        condition.push(data.audio_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    if(data.sender){
                        condition.push(data.sender.user_id)
                        sql += " AND sender_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d')"

                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('d')
                                    resultArray[H+" "] = result.count
                                    spentArray[H+" "] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('f') })
                            } else {
                                resolve(false);
                            }
                        })
                    });

                } else if (data.criteria == "this_week") {
                    let match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('W');
                    var weekStart = ""
                    var weekEnd = ""

                    if (currentDay != "Saturday") {
                        var d = new Date();
                        // set to Monday of this week
                        d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                        // set to previous Saturday
                        d.setDate(d.getDate() - 2);
                        weekStart = d
                    } else {
                        weekStart = new Date()
                    }

                    if (currentDay == "Friday") {
                        weekEnd = new Date()
                    } else {
                        var d = new Date();
                        var resultDate = new Date(d.getTime());
                        resultDate.setDate(d.getDate() + (7 + 5 - d.getDay()) % 7);
                        weekEnd = resultDate
                    }
                    var weekStartObj = dateTime.create(weekStart);
                    var weekObj = weekStartObj.format('Y-m-d');
                    var weekEndObj = dateTime.create(weekEnd);
                    var weekendObj = weekEndObj.format('Y-m-d');
                    match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    condition.push(weekObj)
                    condition.push(weekendObj)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    condition.push(type)
                    if(data.audio_id){
                        condition.push(data.audio_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    if(data.sender){
                        condition.push(data.sender.user_id)
                        sql += " AND sender_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%d')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('W')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:weekObj +" - "+weekendObj })
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_year") {
                    let match = { "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }
                    var d = new Date();
                    const start = d.getFullYear() + "-01-01 00:00:00"
                    const end = d.getFullYear() + "-12-31 23:59:00"
                    condition.push(start)
                    condition.push(end)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    condition.push(type)
                    if(data.audio_id){
                        condition.push(data.audio_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    if(data.sender){
                        condition.push(data.sender.user_id)
                        sql += " AND sender_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                reject(err)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('n')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('Y') })
                            } else {
                                resolve("");
                            }
                        })
                    });
                }
            })
        });
    }
}
