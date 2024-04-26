const express = require('express')
const router = express.Router()
const controller = require("../../controllers/admin/tools")
const is_admin = require("../../middleware/admin/is-admin")

router.use('/tools/announcements/delete/:id',is_admin, controller.deleteAnnouncements);
router.use('/tools/channels',is_admin, controller.getChannels);
router.use('/tools/users',is_admin, controller.getUsers);
router.use('/tools/announcements/:page?',is_admin, controller.announcements);
router.use('/tools/create-announcement/:id?',is_admin, controller.createAnnouncements);

router.use('/tools/mass-notifications/delete/:id',is_admin, controller.deleteNotifications);
router.use('/tools/mass-notifications/:page?',is_admin, controller.massNotifications);
router.use('/tools/create-notifications/:id?',is_admin, controller.createNotifications);

router.use('/tools/channel-subscribe/delete/:id',is_admin, controller.deleteChannelSubscription);
router.use('/tools/channel-subscribe/:page?',is_admin, controller.channelSubscribe);
router.use('/tools/create-channel-subscriber/:id',is_admin, controller.createChannelSubscription);

router.use('/tools/user-subscribe/delete/:id',is_admin, controller.deleteUserSubscription);
router.use('/tools/user-subscribe/:page?',is_admin, controller.userSubscribe);
router.use('/tools/create-user-subscriber/:id',is_admin, controller.createUserSubscription);

router.use('/tools/delete-videos/delete/:id',is_admin, controller.deleteVideos);
router.use('/tools/delete-videos/:page?',is_admin, controller.viewDeleteVideos);
router.use('/tools/create-delete-videos/:id?',is_admin, controller.createDeleteVideos);

router.use('/tools/remove-videos/delete/:id',is_admin, controller.removeDeleteVideos);
router.use('/tools/remove-videos/:page?',is_admin, controller.removeVideos);
router.use('/tools/create-remove-videos/:id?',is_admin, controller.createRemoveVideos);

router.use('/tools/newsletters/delete/:id',is_admin, controller.deleteNewsletter);
router.use('/tools/newsletters/:page?',is_admin, controller.newsletters);
router.use('/tools/create-newsletters/:page?',is_admin, controller.createNewsletters);


module.exports = router;