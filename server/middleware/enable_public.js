const  commonFunction = require("../functions/commonFunctions")

module.exports = async (req, res, next) => {
    if(!req.user && req.levelPermissions && req.levelPermissions["member.site_public_access"] == 1){
        if(req.originalUrl.indexOf("mainsite") == -1){
            next();
            return;
        }
        await commonFunction.getGeneralInfo(req, res, "login");
        return res.send({...req.query,page_type:"login"});
    }
    next();
}