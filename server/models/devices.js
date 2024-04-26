
module.exports = {
    findAll:function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                
                let condition = []
                
                let sql = "SELECT * FROM devices LEFT JOIN users ON users.user_id = devices.owner_id WHERE users.active = 1 AND users.approve = 1 "

                if(data.owner_id){
                    condition.push(data.owner_id);
                    sql += " AND owner_id = ?"
                }
                if(data.device_udid){
                    condition.push(data.device_udid);
                    sql += " AND device_udid = ?"
                }
                if(data.push_token){
                    condition.push(data.push_token);
                    sql += " AND push_token = ?"
                }
                
                if(data.limit){
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                connection.query(sql ,condition,function(err,results,fields)
                {
                    if(err){
                      console.log(err)
                      resolve(false)
                    }
                    if(results){
                        resolve(JSON.parse(JSON.stringify(results)));
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    createDevice:function(req,data = {}){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                
                // remove old data
                connection.query('DELETE FROM devices where device_udid = ?',[data.device_udid]),function(err,results,fields){};
                if(data.type == "delete"){
                    resolve(true);
                }
                if(!data.type){
                    connection.query('INSERT IGNORE INTO devices SET ?',data,function(err,results,fields)
                    {
                        
                        if(err){
                            console.log(err,'insert')
                            resolve(false)
                        }
                        
                        if(results){
                            resolve(results) 
                        }else{
                            resolve(false)
                        }
                    })
                }
            })
        })
    }
}
