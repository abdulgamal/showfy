const express = require('express');
const router = express.Router();
const controller = require("../controllers/comments")

router.use(process.env.subFolder+'mainsite/comment/:id?',controller.comment);
router.use(process.env.subFolder+'mainsite/reply/:id?',controller.reply);
module.exports = router;