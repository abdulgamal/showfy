const express = require('express');
const router = express.Router();
const controller = require("../../controllers/install/index");

router.post(process.env.subFolder+'install/run-queries', controller.install)

router.use(process.env.subFolder+'install', controller.index)

module.exports = router