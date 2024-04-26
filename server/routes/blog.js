const express = require('express');
const router = express.Router();
const controller = require("../controllers/blog")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.use(process.env.subFolder+'mainsite/create-blog/:id?',(req,res,next) => {
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    middlewareEnable.isEnable(req,res,next,"blog",permission)
},controller.create);
router.use(process.env.subFolder+'mainsite/blog/categories',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"blog",'view')
},controller.categories);
router.use(process.env.subFolder+'mainsite/blog/category/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"blog",'view')
},controller.category);
router.use(process.env.subFolder+'mainsite/blog/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"blog",'view')
},controller.view);
router.use(process.env.subFolder+'mainsite/blogs',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"blog",'view')
},multer().none(),controller.browse);

module.exports = router;