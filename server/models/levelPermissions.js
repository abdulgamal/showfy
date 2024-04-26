const flatCache = require("flat-cache")
const path = require('path');
var self = module.exports = {
    findBykey: function(req,type,permission,id){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('SELECT value FROM level_permissions WHERE level_id = ? AND name = ? AND type = ?',[id,permission,type],function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        let result = JSON.parse(JSON.stringify(results))
                        if(result && result.length){
                            resolve(result[0].value)
                        }else{ 
                            resolve(false)
                        }
                    }else{
                        resolve(false)
                    }
                })
            })
        })
    },
    findById: function(id,req,res,reset,setData = true){
        if(!reset){ 
            reset = reset;
        }
        return new Promise(function(resolve, reject) {
            let cache = flatCache.load("levelPermissions"+id, path.resolve(req.cacheDir));
            let key = "levelPermissions"+id
            let cacheContent = cache.getKey(key)
            if(cacheContent && cacheContent != "{}" && reset == false){
                if(setData)
                req.levelPermissions = cacheContent  
                resolve(cacheContent)
            }else{
                req.getConnection(function(err,connection){
                    connection.query('SELECT * FROM level_permissions WHERE level_id = ?',[id],function(err,results,fields)
                    {
                        if(err)
                            reject("")
                        if(results){
                            flatCache.clearCacheById("levelPermissions"+id)
                            const permissionsArray = {}
                            let resultData = JSON.parse(JSON.stringify(results))
                            Object.keys(resultData).forEach(function(key) {
                                permissionsArray[resultData[key].type+"."+resultData[key].name] = resultData[key].value
                            })
                            cache.setKey(key, permissionsArray)
                            cache.save()
                            if(setData)
                                req.levelPermissions = permissionsArray
                            resolve(permissionsArray) 
                        }else{
                            resolve("")
                        }
                    })
                })
            }
        })
    },
    getKeyValue:function(req,level_id,getKeyName){
        let cache = flatCache.load("levelPermissions"+level_id, path.resolve(req.cacheDir));
        let key = "levelPermissions"+level_id
        let cacheContent = cache.getKey(key)
        if(!cacheContent)
            return {} 
        return cacheContent
    },
    insertUpdate:async function(req,res,data,level_id,type){
        return new Promise(async function(resolve, reject) {
            req.getConnection(async function(err,connection){
                Object.keys(data).forEach(async function(key) {
                    let result = JSON.parse(JSON.stringify(data[key]))
                    await connection.query('INSERT INTO level_permissions SET ? ON DUPLICATE KEY UPDATE value = ?',[{name:key,value:result,level_id:level_id,type:type},result],function(err,results,fields)
                    {
                        
                    })
                })
                await self.findById(level_id,req,res,true).then(results => {
                    resolve(results)
                })
                
            })
        })
    }
}
