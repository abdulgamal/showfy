const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/reels")
const is_admin = require("../../middleware/admin/is-admin")

router.get('/reel/delete/:id',is_admin, controller.deleteReel);
router.get('/reels/settings',is_admin, controller.settings);
router.post('/reels/settings',is_admin, controller.settings);
router.get('/reels/levels/:level_id?',is_admin, controller.levels);
router.post('/reels/levels/:level_id?',is_admin, controller.levels);
router.get('/reels/:page?',is_admin, controller.index);
router.post('/reels',is_admin, controller.index);
module.exports = router;