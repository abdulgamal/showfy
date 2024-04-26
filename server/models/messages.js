const globalModel= require("./globalModel")

module.exports = {

    updateReadMessages:function(data,connection) {
        return new Promise(function (resolve, reject) {
            let sql = 'UPDATE messages_texts SET `is_read` = 1,seen = 1 WHERE message_id = ? AND user_id != ? AND is_read = 0'
            let condition = [data.message_id,data.id]
            connection.query(sql, condition, function (err, results) {
                if (err){
                    console.log(err)
                    resolve(false)
                }
                let sql = 'SELECT * from messages where message_id = ?'
                let condition = [data.message_id]
                connection.query(sql, condition, function (err, results) {
                    if (err){
                        console.log(err)
                        resolve(false)
                    }
                    const messages = JSON.parse(JSON.stringify(results));
                    if (messages && messages.length) {
                        if(messages && messages.length > 0){
                            resolve(messages[0])
                        }
                    }
                });
            });
        })
    },
    getMessagesId:function(data,connection) {
        return new Promise(function (resolve, reject) {
            let sql = 'SELECT * from messages where (user_id = ? AND resource_id = ?) || (user_id = ? AND resource_id = ?)'
            let condition = [data.user_id,data.resource_id,data.resource_id,data.user_id]
            connection.query(sql, condition, function (err, results) {
                if (err){
                    console.log(err)
                    resolve(false)
                }
                const messages = JSON.parse(JSON.stringify(results));
                if (messages && messages.length) {
                    if(messages && messages.length > 0){
                        resolve(messages[0])
                    }
                } else {
                    //insert new
                    connection.query('INSERT IGNORE INTO messages SET ?',{user_id:data.user_id,resource_id:data.resource_id},function(err,results,fields)
                    {
                        if(err){
                            console.log(err,'insert')
                            resolve(false)
                        }                        
                        if(results){
                            resolve(resolve({user_id:data.user_id,resource_id:data.resource_id,message_id:results.insertId})) 
                        }else{
                            resolve(false)
                        }
                    })
                }
            });
        })
    },
    getChatMessages:function(data,req) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {

                let sql = 'SELECT messages_texts.*,messages_texts.user_id as last_user_id,messages_texts.user_id as chat_user_id,messages.user_id,messages.resource_id, userdetails.username,userdetails.displayname,userdetails.verified,IF(userdetails.avtar IS NULL OR userdetails.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = "male" THEN "default_mainphoto" WHEN userdetails.gender = "female" THEN "default_femalemainphoto" END AND type = "member" AND level_id = users.level_id),userdetails.avtar) as avtar, ruser.username as rusername,ruser.displayname as rdisplayname,ruser.verified as rverified, IF(ruser.avtar IS NULL OR ruser.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN ruser.gender = "male" THEN "default_mainphoto" WHEN ruser.gender = "female" THEN "default_femalemainphoto" END AND type = "member" AND level_id = rusers.level_id),ruser.avtar) as ravtar,muser.username as musername,muser.displayname as mdisplayname,muser.verified as mverified, IF(muser.avtar IS NULL OR muser.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN muser.gender = "male" THEN "default_mainphoto" WHEN muser.gender = "female" THEN "default_femalemainphoto" END AND type = "member" AND level_id = musers.level_id),muser.avtar) as mavtar from messages_texts LEFT JOIN userdetails ON messages_texts.user_id = userdetails.user_id LEFT JOIN users ON users.user_id = userdetails.user_id  LEFT JOIN messages ON messages.message_id = messages_texts.message_id  LEFT JOIN userdetails as muser ON muser.user_id = messages.user_id LEFT JOIN users as musers ON musers.user_id = messages.user_id LEFT JOIN userdetails as ruser ON ruser.user_id = messages.resource_id LEFT JOIN users as rusers ON ruser.user_id = rusers.user_id WHERE messages_texts.message_id = ?'
                let condition = []
                condition.push(data.id)

                if(data.minId){
                    condition.push(data.minId)
                    sql += " AND messages_text_id < ?"
                }
                
                if(data.messages_text_id){
                    condition.push(data.messages_text_id)
                    sql += " AND messages_texts.messages_text_id = ?"
                }

                sql += " order by messages_texts.messages_text_id DESC"

                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                if (data.offset) {
                    condition.push(data.offset)
                    sql += " OFFSET ?"
                }

                connection.query(sql, condition, function (err, results) {
                    if (err){
                        console.log(err)
                        resolve(false)
                    }

                    if (results && results.length) {
                        const messages = JSON.parse(JSON.stringify(results));
                        
                        //reverse the messages
                        let reverseMessage = messages.reverse();
                        resolve(reverseMessage)
                        
                    } else {
                        resolve([]);
                    }


                });
            })
        })
    },
    sql:function(connection,data,resolve){
        let sql = 'SELECT messages.*,ms.seen,ms.is_read,ms.user_id as last_user_id,ms.message,ms.creation_date as last_message_date,ruser.username as rusername,ruser.displayname as rdisplayname,ruser.verified as rverified, IF(ruser.avtar IS NULL OR ruser.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN ruser.gender = "male" THEN "default_mainphoto" WHEN ruser.gender = "female" THEN "default_femalemainphoto" END AND type = "member" AND level_id = rusers.level_id),ruser.avtar) as ravtar,muser.username as musername,muser.displayname as mdisplayname,muser.verified as mverified, IF(muser.avtar IS NULL OR muser.avtar = "",(SELECT value FROM `level_permissions` WHERE name = CASE WHEN muser.gender = "male" THEN "default_mainphoto" WHEN muser.gender = "female" THEN "default_femalemainphoto" END AND type = "member" AND level_id = musers.level_id),muser.avtar) as mavtar FROM `messages` left join messages_texts as ms on ms.message_id = messages.message_id AND ms.messages_text_id IN (SELECT MAX(messages_text_id) from messages_texts group by message_id) LEFT JOIN userdetails as muser ON muser.user_id = messages.user_id LEFT JOIN users as musers ON musers.user_id = messages.user_id LEFT JOIN userdetails as ruser ON ruser.user_id = messages.resource_id LEFT JOIN users as rusers ON ruser.user_id = rusers.user_id WHERE rusers.active = 1 AND rusers.approve = 1 AND musers.active = 1 AND musers.approve = 1 '
        let condition = []

        if(data.search){
            condition.push(data.resource_id)
            condition.push(data.search)
            condition.push(data.resource_id)
            condition.push(data.search)
            sql += " AND (((messages.resource_id != ? && LOWER(ruser.displayname) LIKE CONCAT('%', ?,  '%'))) || ((messages.user_id != ? && LOWER(muser.displayname) LIKE CONCAT('%', ?,  '%')))) "
        }

        condition.push(data.resource_id)
        condition.push(data.resource_id)
        sql += " AND (messages.resource_id = ? || messages.user_id = ?) "

        if(data.id){
            condition.push(data.id)
            sql += " AND messages.message_id = ?"
        }else{
            condition.push()
            sql += " AND ms.messages_text_id IS NOT NULL"
        }

        sql += " order by ms.messages_text_id DESC"

        if (data.limit) {
            condition.push(data.limit)
            sql += " LIMIT ?"
        }

        if (data.offset) {
            condition.push(data.offset)
            sql += " OFFSET ?"
        }

        connection.query(sql, condition, async function (err, results) {
            if (err){
                resolve(false)
            }
            if (results && results.length) {
                const messages = JSON.parse(JSON.stringify(results));

                for(var i=0;i < messages.length;i++){
                    let item = messages[i]
                    await connection.query("SELECT * FROM user_blocks WHERE owner_id = ? AND resource_id = ?",[item.user_id,item.resource_id],function (err, results) {
                        if(results && results.length > 0){
                            item.block = true;
                        }
                    })
                }
                resolve(messages);
            } else {
                resolve([]);
            }
        });
    },
    getMessages: function (data, req,conn = false) {
        return new Promise(function (resolve, reject) {
            if(!conn){
                req.getConnection(function (err, connection) {
                    module.exports.sql(connection,data,resolve)
                });
            }else{
                module.exports.sql(req,data,resolve)
            }
        });
    }
}