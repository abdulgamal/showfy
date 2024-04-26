const commonFunction = require("../functions/commonFunctions");
const dateTime = require("node-datetime")
const privacyModel = require("../models/privacy")

module.exports = {
    getReel: function(req,reel_id){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('SELECT * FROM reels WHERE  reel_id = ?',[reel_id],function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const reel = JSON.parse(JSON.stringify(results));
                        resolve(reel[0]);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getReels: function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(async function(err,connection){
                let select = "SELECT likes.like_dislike,followers.follower_id,reels.*,userdetails.displayname as user_displayname,userdetails.username as user_username,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar FROM reels INNER JOIN users ON users.user_id = reels.owner_id INNER JOIN userdetails ON userdetails.user_id = users.user_id "
                let conditions = []

                let owner_id = req.user ? req.user.user_id : 0

                select += ' LEFT JOIN followers on followers.id = users.user_id AND followers.owner_id = ' + owner_id + ' AND followers.type = "members" '

                select += " LEFT JOIN likes ON likes.id = users.user_id AND likes.type = 'reels'  AND likes.owner_id =  " + owner_id

                select += " WHERE 1=1 AND  users.approve = 1 AND users.active = 1 "

                if(data.user_id){
                    conditions.push(data.user_id)
                    select += " AND reels.owner_id = ? "
                }

                //if(!data.reel_id){
                    conditions.push(req.user ? req.user.user_id : 0)
                    conditions.push(dateTime.create().format("Y-m-d H:M:S"))
                    select += " AND (reels.owner_id = ? || reels.scheduled IS NULL || reels.scheduled = '' || CAST(reels.scheduled as DATETIME)  >= ?)"
                //}

                if(req.isview){
                    conditions.push(req.user ? req.user.user_id : 0)
                    select += " AND ( reels.owner_id = ? || "
                }else
                    select += " AND ( "
                select += "  ( reels.status = 1 AND reels.approve = 1 AND reels.completed = 1)) "
                
                if(data.reel_id){
                    conditions.push(data.reel_id)
                    select += " AND reels.reel_id = ? "
                }
                
                if(data.not_in_ids){
                    select += " AND reels.reel_id NOT IN ("+data.not_in_ids+")"
                }

                await privacyModel.checkSQL(req,'reels','reels','reel_id').then(result => {
                    if(result){
                        select += " AND ( "+result+" )"
                    }
                })

                select += " ORDER BY "
                if(data.user_id)
                    select += " reels.reel_id DESC"
                else
                    select += " RAND() "

                if (data.limit) {
                    conditions.push(data.limit)
                    select += " LIMIT ?"
                }

                if (data.offset) {
                    conditions.push(data.offset)
                    select += " OFFSET ?"
                } 
                // console.log(select,conditions);
                connection.query(select,conditions,async function(err,results,fields)
                {
                    if(err){
                        console.log(err);
                        resolve(false)
                    }
                    if(results){
                        const reels = JSON.parse(JSON.stringify(results));
                        resolve(reels)
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    deleteReel: function(req,reel){
        return new Promise(async function(resolve, reject) {
            commonFunction.deleteImage(req,'','',"",reel);
            req.getConnection(function(err,connection){        
                if(err){
                    console.log(err);
                    resolve(false);
                }        
                connection.query('DELETE from `reels` where reel_id = ?',reel.reel_id, function (err, results) {
                    if(!err){
                        resolve(true)
                    }else{
                        reject(err)
                    }
                });
            })
        });
    }
}
