const express = require('express');
const router = express.Router();
const controller = require("../controllers/dashboard")
const multer = require("multer")

router.use(process.env.subFolder+'mainsite/dashboard/:type?/:filter?',multer().none(),controller.index);

module.exports = router;