const commonFunction = require("../functions/commonFunctions")
module.exports = {
    isEnable: async (req, res, next,type,permissionType) => {
        if (type != "video" && type != "livestreaming" && req.appSettings["enable_"+type] != 1) {
            await commonFunction.getGeneralInfo(req, res, "page_not_found")
            return res.send({ ...req.query , pagenotfound: 1 });
        }else if(req.levelPermissions[type != "ads" ? type+"."+permissionType : "member.ads"] != 1 && req.levelPermissions[type != "ads" ? type+"."+permissionType : "member.ads"] != 2){
            if(!req.user){
                if(permissionType == "view" || permissionType == "edit" || permissionType == "create"){
                    await commonFunction.getGeneralInfo(req, res, "login")
                    return res.send({...req.query,page_type:"login"});
                }
            }
            await commonFunction.getGeneralInfo(req, res, "permission_error")
            return res.send({...req.query,permission_error:1});
        }else{
            next()
        }
    }
}