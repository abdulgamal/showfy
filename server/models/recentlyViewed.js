const globalModel = require("./globalModel");

module.exports = {
    insert: function(req,data){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                let owner_id = 0
                let column = "video_id"
                if(data.type == "channels"){
                    column = "channel_id"
                }else if(data.type == "blogs"){
                    column = "blog_id"
                }else if(data.type == "members" || data.type == "users"){
                    column = "user_id"
                }else if(data.type == "artists"){
                    column = "artist_id"
                }else if(data.type == "playlists"){
                    column = "playlist_id"
                }else if(data.type == "movies"){
                    column = "movie_id"
                }else if(data.type == "cast_crew_members"){
                    column = "cast_crew_member_id"
                }else if(data.type == "reels"){
                    column = "reel_id"
                }else if(data.type == "audio"){
                    column = "audio_id"
                }
                if(req.user && req.user.user_id){
                    owner_id = req.user.user_id
                }
                let type = "view_count"

                let ip = ""

                if (req.headers['x-forwarded-for']) {
                    ip = req.headers['x-forwarded-for'].split(",")[0];
                }else if (req.headers['x-real-ip']) {
                    ip = req.headers['x-real-ip'].split(",")[0];
                } else if (req.socket && req.socket.remoteAddress) {
                    ip = req.socket.remoteAddress;
                } else {
                    ip = req.ip;
                }

                if(typeof req.query.needSubscription == "undefined" && parseInt(owner_id) != parseInt(data.owner_id)){
                    
                    let sql = "SELECT owner_id from recently_viewed  WHERE type = ? AND id = ? "
                    let condition = []
                    condition.push(data.type)
                    condition.push(data.id)  
                    if(req.user){
                        condition.push(owner_id)
                        sql += " AND owner_id = ?"
                    }else if(ip){
                        condition.push(ip)
                        sql += " AND ip = ?"
                    }else{
                        resolve(false)
                        return
                    }
                    globalModel.custom(req,sql,condition).then( result => {
                        if (result) {
                            
                            let results = JSON.parse(JSON.stringify(result));
                            if(results.length == 0){
                                connection.query("UPDATE "+ (data.type == "members" ? "userdetails" : data.type) + " SET "+type+" = "+type+" + 1 WHERE "+column+" = "+data.id,function(err,results,fields)
                                {
                                    if(err && process.env.NODE_ENV != "production") 
                                        console.log(err)
                                });
                            }
                        }
                    });
                }

                
                if(owner_id == 0){
                    // resolve(false)
                    // return
                }
                if(parseInt(owner_id) == parseInt(data.owner_id)){
                    resolve(false)
                    return
                }
                
                connection.query('INSERT INTO recently_viewed SET ? ON DUPLICATE KEY UPDATE creation_date = ?',[{owner_id:owner_id,id:data.id,type:data.type,creation_date:data.creation_date,ip:ip},data.creation_date],function(err,results,fields)
                {
                    
                    if(err)
                        resolve(false)
                    if(results){
                        
                        resolve(true)
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    }
}
