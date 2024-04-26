const express = require('express');
const router = express.Router();
const controller = require("../controllers/reels")
const middlewareEnable = require("../middleware/enable")

router.use(process.env.subFolder+'mainsite/create-reel/:id?',(req,res,next) => {
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    middlewareEnable.isEnable(req,res,next,"reels",permission)
},controller.create);

router.use(process.env.subFolder+'mainsite/reel/:id?',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"reels",'view')
},controller.view);

router.use(process.env.subFolder+'mainsite/story/:id?',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"stories",'view')
},controller.storyView);

module.exports = router; 