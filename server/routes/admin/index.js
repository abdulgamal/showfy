const express = require('express') 
const fs = require("fs")
const router = express.Router()
const controller = require("../../controllers/admin/dashboard")
const controllerHome = require("../../controllers/home");
const levels = require("../../models/levels")
const settings = require("../../models/settings")

const isAdmin = require("../../middleware/admin/is-admin")

router.use(process.env.subFolder+'sitemap.xml',controllerHome.sitemap);
router.use(process.env.subFolder+"manifest.json",controllerHome.manifest)
router.use(`${process.env.ADMIN_SLUG}/clear-cache`,isAdmin,async (req,res,next) => {
    let backURL = req.header('Referer') || process.env.ADMIN_SLUG ;
    let cachePath = req.serverDirectoryPath + "/../temporary/cache/";
    await levels.findAll(req, {}).then(result => {
        result.forEach(level => {
            fs.unlink(cachePath+"/levelPermissions"+level.level_id,function(err){
                //console.log(err)
            });
        });
    })
    await fs.unlink(cachePath+"/siteMenus",function(err){
        //console.log(err)
    });
    await fs.unlink(cachePath+"/apiSettings",function(err){
        //console.log(err)
    });
    settings.setSetting(req, "file_cache",new Date().getTime());    
    res.redirect(backURL)
})

router.use(process.env.subFolder+'Documentation/:path?', async (req, res, next) => {
    let path = "index.html"
    if(req.params.path){
        path = req.params.path
    }
    if(path.indexOf(".html") < 0){
        path = path+".html"
    }
    res.sendFile(req.documentPATH+path)
})

router.use(process.env.ADMIN_SLUG+'/backups/:page?',controller.backups)
router.use(process.env.ADMIN_SLUG+'/backup/download/:id/:type',controller.downloadBackup)
router.use(process.env.ADMIN_SLUG+'/backup/download/:id/:type',controller.downloadBackup)
router.use(process.env.ADMIN_SLUG+'/backup/delete/:id',controller.deleteBackup)
router.use(process.env.ADMIN_SLUG+'/backup',controller.backup)

router.use(process.env.ADMIN_SLUG, require("./movies"))
router.use(process.env.ADMIN_SLUG, require("./gifts"))
router.use(process.env.ADMIN_SLUG, require("./reels"))
router.use(process.env.ADMIN_SLUG, require("./stories"))
router.use(process.env.ADMIN_SLUG, require("./points"))
router.use(process.env.ADMIN_SLUG, require("./advertisements"))
router.use(process.env.ADMIN_SLUG, require("./blogs"))
router.use(process.env.ADMIN_SLUG, require("./channels"))
router.use(process.env.ADMIN_SLUG, require("./comments"))
router.use(process.env.ADMIN_SLUG, require("./designs"))
router.use(process.env.ADMIN_SLUG, require("./languages"))
router.use(process.env.ADMIN_SLUG, require("./menus"))
router.use(process.env.ADMIN_SLUG, require("./pages"))
router.use(process.env.ADMIN_SLUG, require("./playlists"))
router.use(process.env.ADMIN_SLUG, require("./audio"))
router.use(process.env.ADMIN_SLUG, require("./reports"))
router.use(process.env.ADMIN_SLUG, require("./settings"))
router.use(process.env.ADMIN_SLUG, require("./sitemap"))
router.use(process.env.ADMIN_SLUG, require("./users"))
router.use(process.env.ADMIN_SLUG, require("./videos"))
router.use(process.env.ADMIN_SLUG,require("./liveStreaming"))
router.use(process.env.ADMIN_SLUG, require("./fileManager"))
router.use(process.env.ADMIN_SLUG, require("./payments"))
router.use(process.env.ADMIN_SLUG, require("./slideshow"))
router.use(process.env.ADMIN_SLUG, require("./mailTemplates"))
router.use(process.env.ADMIN_SLUG, require("./earnings"))
router.use(process.env.ADMIN_SLUG, require("./tools"))
router.use(process.env.ADMIN_SLUG, require("./mobileapps"))


router.use(`${process.env.ADMIN_SLUG}`,isAdmin,controller.index);

router.use(`${process.env.ADMIN_SLUG}*`,(req,res,next) => {
    const url = req.originalUrl.replace(process.env.ADMIN_SLUG,'');
    res.render('admin/404',{nav:url,title:"Page Not Found"});
})

module.exports = router;