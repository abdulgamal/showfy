const express = require('express');
const router = express.Router();
const controller = require("../controllers/search")
const multer = require("multer")

router.use(process.env.subFolder+'mainsite/search/:type?',multer().none(),controller.index);

module.exports = router;