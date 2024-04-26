const express = require('express');
const router = express.Router();
const controller = require("../controllers/messages")

router.use(process.env.subFolder+'mainsite/messages/:id?',(req,res,next) => {
    next();
},controller.index);



module.exports = router; 