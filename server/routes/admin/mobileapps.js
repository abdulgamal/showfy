const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/mobileapps")
const is_admin = require("../../middleware/admin/is-admin")

router.use('/mobileapps/push',is_admin, controller.push);
router.use('/mobileapps/token',is_admin, controller.token);


module.exports = router;