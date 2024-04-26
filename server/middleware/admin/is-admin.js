module.exports = (req, res, next) => {
    //if(req.user)
    if (!req.user) {
        return res.redirect(process.env.subFolder+'login');
    }else if(req.user.levelFlag != "superadmin" && (typeof process.env.ALLOWALLUSERINADMIN == "undefined" || !process.env.ALLOWALLUSERINADMIN)){
        return res.redirect(process.env.PUBLIC_URL+process.env.subFolder);
    }else if((!req.user || req.user.levelFlag != "superadmin" ) &&  (typeof process.env.ALLOWALLUSERINADMIN != "undefined" || process.env.ALLOWALLUSERINADMIN)){
        if(req.method == "POST"){
            res.send({});
            return
        }
    }
    next();
}