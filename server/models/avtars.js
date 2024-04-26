module.exports = {
    findAll:  function(req,data){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                const condition = []
                let sql = 'SELECT * FROM user_avtar_images  where 1 = 1'
                if(data && data.enabled){
                    sql += " AND `enable` = 1"
                }
                if(data && data.type){
                    sql += " AND type = '"+data.type+"'"
                }
                
                
                
                sql += " ORDER BY avtar_id DESC" 

                if(data && data.limit){
                    sql += " limit "+data.limit
                }
                connection.query(sql,condition,function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    findById: function(id,req,res){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('SELECT * FROM user_avtar_images WHERE avtar_id = ?',[id],function(err,results,fields)
                {
                    if(err)
                        reject("")
                    if(results){
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    }else{
                        resolve("");
                    }
                })
            })
        });
    }
}
