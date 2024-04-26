CREATE TABLE `banwords` (
  `ban_id` int(11) UNSIGNED NOT NULL auto_increment,
  `text` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(150) not NULL default 'default',
  PRIMARY KEY (`ban_id`),
  UNIQUE KEY `UNIQUE` (`text`),
  KEY `text` (`text`),
  KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `banwords` (`text`, `type`) VALUES
( 'subscription', 'default'),
( 'messages', 'default'),
( 'movies', 'default'),
( 'series', 'default'),
( 'cast', 'default'),
( 'crew', 'default'),
( 'api', 'default'),
( 'support', 'default'),
( 'post', 'default'),
('video-admin','default'),
( 'install', 'default'),
( 'videos', 'default'),
( 'channels', 'default'),
( 'playlists', 'default'),
( 'members', 'default'),
( 'blogs', 'default'),
( 'watch', 'default'),
( 'channel', 'default'),
( 'blog', 'default'),
( 'playlist', 'default'),
( 'search', 'default'),
( 'dashboard', 'default'),
( 'upgrade', 'default'),
( 'logout', 'default'),
( 'contact', 'default'),
( 'terms', 'default'),
( 'privacy', 'default'),
( 'channels', 'default'),
( 'pages', 'default'),
( 'video', 'default'),
( 'create-video', 'default'),
( 'create-channel', 'default'),
( 'create-blog', 'default'),
( 'create-ad','default'),
( 'live-streaming','default'),
( 'live', 'default');

DROP TABLE IF EXISTS `channelvideoimports`;
CREATE TABLE `channelvideoimports` (
  `channelvideoimport_id` int(11) unsigned NOT NULL auto_increment,
  `channel_id` varchar(255) NULL,
  `owner_id` int(11) NOT NULL default '0',
  `owner_email` VARCHAR(255) NULL,
  `owner_language` VARCHAR(255) NULL,
  `owner_displayname` VARCHAR(255) NULL,
  `importchannel_id` varchar(255) NOT NULL,
  `params` TEXT NULL,
  `error_description` TEXT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`channelvideoimport_id`),
  KEY `channel_id` (`channel_id`),
  KEY `importchannel_id` (`importchannel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `task_id` int(11) UNSIGNED NOT NULL auto_increment,
  `type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `started` tinyint (1)  NOT NULL DEFAULT '0',
  `start_time` datetime NULL,
  `timeout` int(11) NOT NULL DEFAULT '30',
  `priority` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`task_id`),
  KEY `started` (`started`),
  KEY `priority` (`priority`),
  KEY `start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `tasks` ( `type`, `started`, `start_time`, `timeout`, `priority`) VALUES
('videoEncode',0,NULL,15,1),
( 'notifications', 0, NULL, 30, 2),
( 'userExpiryNotifications', 0, NULL, 21600, 3),
( 'userDowngrade', 0, NULL, 250, 1),
('movieVideoEncode',0,NULL,15,1),
('channelVideoImport',0,NULL,15,1),
('movieImportIMDB',0,NULL,43200,1),
('autoDeleteVideos',0,NULL,300,1),
('autoDeleteImportedVideos',0,NULL,300,1),
('newsletters',0,NULL,300,1),
('reelsVideoEncode',0,NULL,15,1),
('storiesVideoEncode',0,NULL,15,1),
('walletPaymentChannels',0,NULL,15,1),
('userPlanExpiry',0,NULL,15,1);

DROP TABLE IF EXISTS `user_twitter`;
CREATE TABLE `user_twitter` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `twitter_uid` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `twitter_uid` (`twitter_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `user_facebook`;
CREATE TABLE `user_facebook` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `facebook_uid` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `facebook_uid` (`facebook_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `user_forgot`;
CREATE TABLE `user_forgot` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `code` varchar(100) NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `user_verify`;
CREATE TABLE `user_verify` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `code` varchar(100) NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `user_google`;
CREATE TABLE `user_google` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `google_uid` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `google_uid` (`google_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `user_apple`;
CREATE TABLE `user_apple` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `apple_uid` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `apple_uid` (`apple_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `notificationtypes`;
CREATE TABLE `notificationtypes` (
  `notificationtype_id` int(11) UNSIGNED NOT NULL auto_increment,
  `type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `body` text COLLATE utf8_unicode_ci NOT NULL,
  `content_type` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `vars` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`notificationtype_id`),
  KEY `content_type` (`content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `subject_type` varchar(24) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `subject_id` int(11) UNSIGNED NOT NULL,
  `object_type` varchar(24) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `object_id` int(11) UNSIGNED NOT NULL,
  `type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `params` text COLLATE utf8_unicode_ci,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `notification_send` tinyint(1) NOT NULL DEFAULT '1',
  `creation_date` datetime NOT NULL,
   PRIMARY KEY (`notification_id`),
   KEY `notification_send` (`notification_send`),
   KEY `owner_date` (`owner_id`,`creation_date`),
   KEY `subject` (`subject_type`,`subject_id`),
   KEY `object` (`object_type`,`object_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `notificationsettings`;
CREATE TABLE `notificationsettings` (
  `owner_id` int(11) UNSIGNED NOT NULL,
  `type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `notification` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`owner_id`,`type`),
  KEY `notification` (`notification`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `emailsettings`;
CREATE TABLE `emailsettings` (
  `owner_id` int(11) UNSIGNED NOT NULL,
  `type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `email` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`owner_id`,`type`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `emailtemplates`;
CREATE TABLE `emailtemplates` (
  `emailtemplate_id` int(11) UNSIGNED NOT NULL auto_increment,
  `content_type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `type` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `body` text COLLATE utf8_unicode_ci NULL,
  `vars` text COLLATE utf8_unicode_ci NULL,
  `subject` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`emailtemplate_id`),
  UNIQUE KEY `UNIQUE` (`content_type`,`type`),
  KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


INSERT IGNORE INTO `notificationtypes` ( `type`, `body`, `content_type`, `vars`) VALUES
( 'admin_custom_notification', '', 'default', '{}'),
( 'openai_description_create', 'Create content description using OpenAI.', 'default', '{}'),
( 'openai_image_create', 'Create image using OpenAI.', 'default', '{}'),
( 'reels_processed_complete', 'We have completed processing your {reels}.', 'reels', '{\"reels\":\"reel\"}'),
( 'reels_processed_failed', 'We are having trouble processing to your {reels}.', 'reels', '{\"reels\":\"reel\"}'),
( 'reels_comment', '{subject} commented on your {reels} {comment_title}.', 'reels', '{\"reels\":\"reel\"}'),
( 'reels_reply_comment', '{subject} replied to your {comment} on your {reels} {reply_title}', 'reels', '{\"reels\":\"reel\",\"comment\":\"comment\"}'),
( 'reels_comments_like', '{subject} likes your {comment} on your {reels} {comment_title}.', 'reels', '{\"reels\":\"reel\",\"comment\":\"comment\"}'),
( 'reels_comments_dislike', '{subject} dislike your {comment} on your {reels} {comment_title}.', 'reels', '{\"reels\":\"reel\",\"comment\":\"comment\"}'),
( 'reels_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'reels', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'reels_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'reels', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'reels_like', '{subject} likes your {reels}.', 'reels', '{\"reels\":\"reel\"}'),
( 'reels_dislike', '{subject} dislike your {reels}.', 'reels', '{\"reels\":\"reel\"}'),
( 'stories_processed_complete', 'We have completed processing your {stories}.', 'stories', '{\"stories\":\"story\"}'),
( 'stories_processed_failed', 'We are having trouble processing to your {stories}.', 'stories', '{\"stories\":\"story\"}'),
( 'stories_like', '{subject} likes your {stories}.', 'stories', '{\"stories\":\"story\"}'),
( 'stories_dislike', '{subject} dislike your {stories}.', 'stories', '{\"stories\":\"story\"}'),
( 'reels_create', 'Uploaded new Reel', 'default', '{}'),
( 'stories_create', 'Uploaded new Story', 'default', '{}'),
( 'stories_comment', '{subject} commented on your {stories} {comment_title}.', 'story', '{\"stories\":\"story\"}'),
( 'stories_reply_comment', '{subject} replied to your {comment} on your {stories} {reply_title}', 'stories', '{\"stories\":\"story\",\"comment\":\"comment\"}'),
( 'stories_comments_like', '{subject} likes your {comment} on your {stories} {comment_title}.', 'stories', '{\"stories\":\"story\",\"comment\":\"comment\"}'),
( 'stories_comments_dislike', '{subject} dislike your {comment} on your {stories} {comment_title}.', 'stories', '{\"story\":\"reel\",\"comment\":\"comment\"}'),
( 'stories_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'stories', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'stories_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'stories', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
(  'scheduled_live', '{videos} scheduled by {subject}.','livestreaming', '{\"videos\":\"Live Streaming\"}'),
(  'live_video', '{subject} started a live {videos}.','livestreaming', '{\"videos\":\"Live Streaming\"}'),
(  'livestream_purchased', 'You just grabed a ticket for {videos}. We hope you enjoy this experience.','livestreaming', '{\"videos\":\"Live Streaming\"}'),
(  'livestream_purchased_owner','Your {videos} is purchased by {subject}.','livestreaming', '{\"videos\":\"Live Streaming\"}'),
(  'video_purchased','Thanks for purchasing {videos}.','videos', '{\"videos\":\"video\"}'),
(  'video_purchased_owner','Your {videos} is purchased by {subject}.','videos', '{\"videos\":\"video\"}'),
(  'livestreaming_live','{videos} is live now.','livestreaming', '{\"videos\":\"Live Streaming\"}'),
(  'movie_purchased','Thanks for purchasing {movies}.','movies', '{\"movies\":\"movie\"}'),
(  'movie_purchased_owner','Your {movies} is purchased by {subject}.','movies', '{\"movies\":\"movie\"}'),
(  'movie_rent_purchased','Thanks for purchasing {movies} on rent.','movies', '{\"movies\":\"movie\"}'),
(  'movie_rent_purchased_owner','Your {movies} is purchased by {subject}.','movies', '{\"movies\":\"movie\"}'),
(  'series_purchased','Thanks for purchasing {movies}.','movies', '{\"movies\":\"series\"}'),
(  'series_purchased_owner','Your {movies} is purchased by {subject}.','movies', '{\"movies\":\"series\"}'),
(  'series_rent_purchased','Thanks for purchasing {movies} on rent.','movies', '{\"movies\":\"series\"}'),
(  'series_rent_purchased_owner','Your {movies} is purchased by {subject}.','movies', '{\"movies\":\"series\"}'),
(  'wallet_recharge','Wallet recharged successfully.','members', '{}'),
( 'movies_create', 'Created new Movie.', 'default', '{}'),
( 'series_create', 'Created new Series.', 'default', '{}'),
( 'admin_videos_channel_import_complete', 'Videos imported successfully from Youtube Channel.', 'default', '{}'),
( 'videos_channel_import_error', 'Error importing your videos.', 'default', '{}'),
( 'videos_channel_import_complete', 'Videos Imported successfully in your {channels}.', 'default', '{\"channels\":\"channel\"}'),
( 'movies_like', '{subject} likes your {movies}.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_dislike', '{subject} dislike your {movies}.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_comments_like', '{subject} likes your {comment} on your {movies} {comment_title}.', 'movies', '{\"movies\":\"movie\",\"comment\":\"comment\"}'),
( 'movies_comments_dislike', '{subject} dislike your {comment} on your {movies} {comment_title}.', 'movies', '{\"movies\":\"movie\",\"comment\":\"comment\"}'),
( 'movies_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'movies', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'movies_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'movies', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'movies_reply_comment', '{subject} replied to your {comment} on your {movies} {reply_title}', 'movies', '{\"movies\":\"movie\",\"comment\":\"comment\"}'),
( 'movies_comment', '{subject} commented on your {movies} {comment_title}.', 'movies', '{\"movies\":\"movie\"}'),
( 'movievideos_processed_complete', 'We have completed processing your {movies} video.', 'movies', '{\"movies\":\"movie\"}'),
( 'movievideos_processed_failed', 'We are having trouble processing to your {movies} video.', 'movies', '{\"movies\":\"movie\"}'),
( 'purchase_series_purchase_approved', 'Your Bank Transfer request for Series Purchased is approved.', 'default', '{}'),
( 'purchase_movie_purchase_approved', 'Your Bank Transfer request for Movie Purchased is approved.', 'default', '{}'),
( 'rent_series_purchase_approved', 'Your Bank Transfer request for Rent Series is approved.', 'default', '{}'),
( 'rent_movie_purchase_approved', 'Your Bank Transfer request for Rent Movie is approved.', 'default', '{}'),
( 'movies_admin_approved', 'Site Admin approved your {movies}.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_admin_disapproved', 'Site Admin disapproved your {movies}.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_featured', 'Site Admin marked your {movies} as Featured.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_sponsored', 'Site Admin marked your {movies} as Sponsored.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_hot', 'Site Admin marked your {movies} as Hot.', 'movies', '{\"movies\":\"movie\"}'),
( 'movies_favourite', '{subject} marked your {movies} to Favourite.', 'movies', '{\"movies\":\"movie\"}'),
( 'series_like', '{subject} likes your {movies}.', 'series', '{\"movies\":\"series\"}'),
( 'series_dislike', '{subject} dislike your {movies}.', 'series', '{\"movies\":\"series\"}'),
( 'series_comments_like', '{subject} likes your {comment} on your {movies} {comment_title}.', 'series', '{\"movies\":\"series\",\"comment\":\"comment\"}'),
( 'series_comments_dislike', '{subject} dislike your {comment} on your {movies} {comment_title}.', 'series', '{\"movies\":\"series\",\"comment\":\"comment\"}'),
( 'series_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'series', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'series_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'series', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'series_reply_comment', '{subject} replied to your {comment} on your {movies} {reply_title}', 'series', '{\"movies\":\"series\",\"comment\":\"comment\"}'),
( 'series_comment', '{subject} commented on your {movies} {comment_title}.', 'series', '{\"movies\":\"series\"}'),
( 'movievideos_processed_complete', 'We have completed processing your {movies} video.', 'series', '{\"movies\":\"series\"}'),
( 'movievideos_processed_failed', 'We are having trouble processing to your {movies} video.', 'series', '{\"movies\":\"series\"}'),
( 'series_admin_approved', 'Site Admin approved your {movies}.', 'series', '{\"movies\":\"series\"}'),
( 'series_admin_disapproved', 'Site Admin disapproved your {movies}.', 'series', '{\"movies\":\"series\"}'),
( 'series_featured', 'Site Admin marked your {movies} as Featured.', 'series', '{\"movies\":\"series\"}'),
( 'series_sponsored', 'Site Admin marked your {movies} as Sponsored.', 'series', '{\"movies\":\"series\"}'),
( 'series_hot', 'Site Admin marked your {movies} as Hot.', 'series', '{\"movies\":\"series\"}'),
( 'series_favourite', '{subject} marked your {movies} to Favourite.', 'series', '{\"movies\":\"series\"}'),
( 'videos_reminder', '{videos} is live now.', 'livestreaming', '{\"videos\":\"Live Streaming\"}'),
( 'bankdetails_usersubscribe_approved', 'Your Bank Transfer request for Member Subscription is approved.', 'default', '{}'),
( 'level_member_expiry', 'Your subscription plan {planName} going to expire soon in {period}.', 'default', '{}'),
( 'audio_admin_approved', 'Site Admin approved your {audio}.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_comment', '{subject} commented on your {audio} {comment_title}.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_reply_comment', '{subject} replied to your {comment} on your {audio} {reply_title}', 'audio', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio_comments_like', '{subject} likes your {comment} on your {audio} {comment_title}.', 'audio', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio_comments_dislike', '{subject} dislike your {comment} on your {audio} \"{comment_title}\".', 'audio', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'audio', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'audio', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio_favourite', '{subject} marked your {audio} to Favourite.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_like', '{subject} likes your {audio}.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_dislike', '{subject} dislike your {audio}.', 'audio', '{\"audio\":\"audio\"}'),
( 'videos_processed_complete', 'We have completed processing your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_processed_failed', 'We are having trouble processing to your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_comment', '{subject} commented on your {videos} {comment_title}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_reply_comment', '{subject} replied to your {comment} on your {videos} {reply_title}', 'videos', '{\"videos\":\"video\",\"comment\":\"comment\"}'),
( 'videos_comments_like', '{subject} likes your {comment} on your {videos} {comment_title}.', 'videos', '{\"videos\":\"video\",\"comment\":\"comment\"}'),
( 'videos_comments_dislike', '{subject} dislike your {comment} on your {videos} {comment_title}.', 'videos', '{\"videos\":\"video\",\"comment\":\"comment\"}'),
( 'videos_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'videos', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'videos_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'videos', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'videos_favourite', '{subject} marked your {videos} to Favourite.', 'videos', '{\"videos\":\"video\"}'),
-- ( 'videos_watchlater', '{subject} added your {videos} to Watchlater.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_like', '{subject} likes your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_dislike', '{subject} dislike your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_featured', 'Site Admin marked your {videos} as Featured.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_sponsored', 'Site Admin marked your {videos} as Sponsored.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_hot', 'Site Admin marked your {videos} as Hot.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_admin_approved', 'Site Admin approved your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_admin_disapproved', 'Site Admin disapproved your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'videos_rating', '{subject} rated your {videos}.', 'videos', '{\"videos\":\"video\"}'),
( 'channel_posts_like', '{subject} likes your {channel_posts}.', 'channels', '{\"channel_posts\":\"post\"}'),
( 'channel_posts_dislike', '{subject} dislike your {channel_posts}.', 'channels', '{\"channel_posts\":\"post\"}'),
( 'channels_comment', '{subject} commented on your {channels} {comment_title}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_reply_comment', '{subject} replied to your {comment} on your {channels} {reply_title}', 'channels', '{\"channels\":\"channel\",\"comment\":\"comment\"}'),
( 'channels_comments_like', '{subject} likes your {comment} on your {channels} {comment_title}.', 'channels', '{\"channels\":\"channel\",\"comment\":\"comment\"}'),
( 'channels_comments_dislike', '{subject} dislike your {comment} on your {channels} {comment_title}.', 'channels', '{\"channels\":\"channel\",\"comment\":\"comment\"}'),
( 'channel_posts_reply_comment', '{subject} replied to your {comment} on your {channel_posts} {reply_title}', 'channels', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channel_posts_comments_like', '{subject} likes your {comment} on your {channel_posts} {comment_title}.', 'channels', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channel_posts_comments_dislike', '{subject} dislike your {comment} on your {channel_posts} {comment_title}.', 'channels', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channel_posts_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'channels', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channel_posts_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'channels', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channel_posts_comment', '{subject} commented on your {channel_posts} {comment_title}.', 'channels', '{\"channel_posts\":\"post\"}'),
( 'channels_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'channels', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'channels', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels_favourite', '{subject} marked your {channels} to Favourite.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_like', '{subject} likes your {channels}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_dislike', '{subject} dislike your {channels}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_featured', 'Site Admin marked your {channels} as Featured.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_sponsored', 'Site Admin marked your {channels} as Sponsored.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_hot', 'Site Admin marked your {channels} as Hot.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_admin_approved', 'Site Admin approved your {channels}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_admin_disapproved', 'Site Admin disapproved your {channels}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_rating', '{subject} rated your {channels}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_follow', '{subject} started following your {channels}.', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_followed', '{subject} uploaded content that might interest you', 'channels', '{\"channels\":\"channel\"}'),
( 'channels_verified', 'Site Admin Verified your {channels}.', 'channels', '{\"channels\":\"channel\"}'),

( 'playlists_comment', '{subject} commented on your {playlists} {comment_title}.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_reply_comment', '{subject} replied to your {comment} on your {playlists} {reply_title}', 'playlists', '{\"playlists\":\"playlist\",\"comment\":\"comment\"}'),
( 'playlists_comments_like', '{subject} likes your {comment} on your {playlists} {comment_title}.', 'playlists', '{\"playlists\":\"playlist\",\"comment\":\"comment\"}'),
( 'playlists_comments_dislike', '{subject} dislike your {comment} on your {playlists} {comment_title}.', 'playlists', '{\"playlists\":\"playlist\",\"comment\":\"comment\"}'),
( 'playlists_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'playlists', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'playlists_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'playlists', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'playlists_favourite', '{subject} marked your {playlists} to Favourite.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_like', '{subject} likes your {playlists}.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_dislike', '{subject} dislike your {playlists}.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_featured', 'Site Admin marked your {playlists} as Featured.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_sponsored', 'Site Admin marked your {playlists} as Sponsored.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_hot', 'Site Admin marked your {playlists} as Hot.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_admin_approved', 'Site Admin approved your {playlists}.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_admin_disapproved', 'Site Admin disapproved your {playlists}.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'playlists_rating', '{subject} rated your {playlists}.', 'playlists', '{\"playlists\":\"playlists\"}'),
( 'blogs_comment', '{subject} commented on your {blogs} {comment_title}.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_reply_comment', '{subject} replied to your {comment} on your {blogs} {reply_title}', 'blogs', '{\"blogs\":\"blogs\",\"comment\":\"comment\"}'),
( 'blogs_comments_like', '{subject} likes your {comment} on your {blogs} {comment_title}.', 'blogs', '{\"blogs\":\"blogs\",\"comment\":\"comment\"}'),
( 'blogs_comments_dislike', '{subject} dislike your {comment} on your {blogs} {comment_title}.', 'blogs', '{\"blogs\":\"blogs\",\"comment\":\"comment\"}'),
( 'blogs_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'blogs', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'blogs_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'blogs', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'blogs_favourite', '{subject} marked your {blogs} to Favourite.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_like', '{subject} likes your {blogs}.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_dislike', '{subject} dislike your {blogs}.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_featured', 'Site Admin marked your {blogs} as Featured.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_sponsored', 'Site Admin marked your {blogs} as Sponsored.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_hot', 'Site Admin marked your {blogs} as Hot.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_admin_approved', 'Site Admin approved your {blogs}.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_admin_disapproved', 'Site Admin disapproved your {blogs}.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'blogs_rating', '{subject} rated your {blogs}.', 'blogs', '{\"blogs\":\"blogs\"}'),
( 'members_comment', '{subject} commented on your {members} {comment_title}.', 'members', '{\"members\":\"profile\"}'),
( 'members_reply_comment', '{subject} replied to your {comment} on your {members} {reply_title}', 'members', '{\"members\":\"profile\",\"comment\":\"comment\"}'),
( 'members_comments_like', '{subject} likes your {comment} on your {members} {comment_title}.', 'members', '{\"members\":\"profile\",\"comment\":\"comment\"}'),
( 'members_comments_dislike', '{subject} dislike your {comment} on your {members} {comment_title}.', 'members', '{\"members\":\"profile\",\"comment\":\"comment\"}'),
( 'members_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'members', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'members_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'members', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'members_favourite', '{subject} marked your {members} to Favourite.', 'members', '{\"members\":\"profile\"}'),
( 'members_like', '{subject} likes your {members}.', 'members', '{\"members\":\"profile\"}'),
( 'members_dislike', '{subject} dislike your {members}.', 'members', '{\"members\":\"profile\"}'),
( 'members_featured', 'Site Admin marked your {members} as Featured.', 'members', '{\"members\":\"profile\"}'),
( 'members_sponsored', 'Site Admin marked your {members} as Sponsored.', 'members', '{\"members\":\"profile\"}'),
( 'members_admin_approved', 'Site Admin approved your {members}.', 'members', '{\"members\":\"profile\"}'),
( 'members_verified', 'Site Admin Verified your {members}.', 'members', '{\"members\":\"profile\"}'),
( 'members_reject_verified', 'Site Admin Rejected Your Verified {members} Request.', 'members', '{\"members\":\"profile\"}'),

( 'members_admin_disapproved', 'Site Admin disapproved your {members}.', 'members', '{\"members\":\"profile\"}'),

( 'members_hot', 'Site Admin marked your {members} as Hot.', 'members', '{\"members\":\"profile\"}'),
( 'members_rating', '{subject} rated your {members}.', 'members', '{\"members\":\"profile\"}'),
( 'members_follow', '{subject} started following your {members}.', 'members', '{\"members\":\"profile\"}'),
( 'members_followed', '{subject} uploaded content that might interest you', 'members', '{\"members\":\"profile\"}'),
( 'videos_create', 'Uploaded new Video.', 'default', '{}'),
( 'channels_create', 'Created new Channel.', 'default', '{}'),
( 'playlists_create', 'Created new Playlist.', 'default', '{}'),
( 'blogs_create', 'Created new Blog.', 'default', '{}'),
( 'audio_create', 'Uploaded new Audio.', 'default', '{}'),
( 'go_live', 'Go Live.', 'default', '{}'),
( 'bankdetails_videopurchase_approved', 'Your Bank Transfer request for Video Purchase is approved.', 'default', '{}'),
( 'bankdetails_rechargewallet_approved', 'Your Bank Transfer request for Wallet Recharge is approved.', 'default', '{}'),
( 'bankdetails_membersubscription_approved', 'Your Bank Transfer request for Member Subscription is approved.', 'default', '{}'),
( 'bankdetails_channelsubscription_approved', 'Your Bank Transfer request for Channel Support is approved.', 'default', '{}');


  
INSERT IGNORE INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'default', 'user_subscribe_payment_subscription_active', NULL),
( 'default', 'user_subscribe_payment_subscription_pending', NULL),
( 'default', 'user_subscribe_payment_subscription_overdue', NULL),
( 'default', 'user_subscribe_payment_subscription_refunded', NULL),
( 'default', 'user_subscribe_payment_subscription_expired', NULL),
( 'default', 'user_subscribe_payment_subscription_recurrence', NULL),
( 'default', 'user_subscribe_payment_subscription_cancelled', NULL),
( 'default', 'user_subscribe_payment_subscription_disputeclear', NULL),
( 'default', 'user_subscribe_payment_subscription_disputecreate', NULL),
( 'reels', 'reels_processed_complete', '{\"reels\":\"reel\"}'),
( 'reels', 'reels_processed_failed', '{\"reels\":\"reel\"}'),
( 'reels', 'reels_comment', '{\"reels\":\"reel\"}'),
( 'reels', 'reels_reply_comment', '{\"reels\":\"reel\",\"comment\":\"comment\"}'),
( 'reels', 'reels_comments_like', '{\"reels\":\"reel\",\"comment\":\"comment\"}'),
( 'reels', 'reels_comments_dislike', '{\"reels\":\"reel\",\"comment\":\"comment\"}'),
( 'reels', 'reels_reply_like', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'reels', 'reels_reply_dislike', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'reels', 'reels_like', '{\"reels\":\"reel\"}'),
( 'reels', 'reels_dislike', '{\"reels\":\"reel\"}'),
( 'stories', 'stories_processed_failed', '{\"stories\":\"story\"}'),
( 'stories', 'stories_processed_failed', '{\"stories\":\"story\"}'),
( 'stories', 'stories_like', '{\"stories\":\"story\"}'),
( 'stories', 'stories_dislike', '{\"stories\":\"story\"}'),
( 'stories', 'stories_comment', '{\"stories\":\"story\"}'),
( 'stories', 'stories_reply_comment', '{\"stories\":\"story\",\"comment\":\"comment\"}'),
( 'stories', 'stories_comments_like', '{\"stories\":\"story\",\"comment\":\"comment\"}'),
( 'stories', 'stories_comments_dislike', '{\"stories\":\"story\",\"comment\":\"comment\"}'),
( 'stories', 'stories_reply_like', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'stories', 'stories_reply_dislike', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'livestreaming', 'scheduled_live', '{\"videos\":\"Live Streaming\"}'),
( 'livestreaming', 'live_video', '{\"videos\":\"Live Streaming\"}'),
( 'livestreaming', 'livestream_purchased', '{\"videos\":\"Live Streaming\"}'),
( 'livestreaming', 'livestream_purchased_owner', '{\"videos\":\"Live Streaming\"}'),
( 'videos', 'video_purchased', '{\"videos\":\"video\"}'),
( 'videos', 'video_purchased_owner', '{\"videos\":\"video\"}'),
( 'livestreaming', 'livestreaming_live', '{\"videos\":\"Live Streaming\"}'),
( 'movies', 'movie_purchased', '{\"movies\":\"movie\"}'),
( 'movies', 'movie_purchased_owner', '{\"movies\":\"movie\"}'),
( 'movies', 'movie_rent_purchased', '{\"movies\":\"movie\"}'),
( 'movies', 'movie_rent_purchased_owner', '{\"movies\":\"movie\"}'),
( 'movies', 'series_purchased', '{\"movies\":\"series\"}'),
( 'movies', 'series_purchased_owner', '{\"movies\":\"series\"}'),
( 'movies', 'series_rent_purchased', '{\"movies\":\"series\"}'),
( 'movies', 'series_rent_purchased_owner', '{\"movies\":\"series\"}'),
( 'members', 'wallet_recharge', '{}'),

( 'default','admin_videos_channel_import_complete', '{}'),
( 'default', 'videos_channel_import_error', '{}'),
( 'default', 'videos_channel_import_complete', '{\"channels\":\"channel\"}'),
( 'default','bankdetails_moviepurchase_approved', '{}'),
( 'default','bankdetails_rentmovie_approved', '{}'),
( 'livestreaming','live_admin_approved', '{\"videos\":\"Live Streaming\"}'),
( 'livestreaming','live_admin_disapproved', '{\"videos\":\"Live Streaming\"}'),
( 'movies', 'movies_like', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_dislike', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_comments_like', '{\"movies\":\"movie\",\"comment\":\"comment\"}'),
( 'movies', 'movies_comments_dislike', '{\"movies\":\"movie\",\"comment\":\"comment\"}'),
( 'movies', 'movies_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'movies', 'movies_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'movies', 'movies_reply_comment', '{\"movies\":\"movie\",\"comment\":\"comment\"}'),
( 'movies', 'movies_comment', '{\"movies\":\"movie\"}'),
( 'movies', 'movievideos_processed_complete', '{\"movies\":\"movie\"}'),
( 'movies', 'movievideos_processed_failed', '{\"movies\":\"movie\"}'),
( 'default', 'purchase_series_purchase_approved', '{}'),
( 'default', 'purchase_movie_purchase_approved', '{}'),
( 'default', 'rent_series_purchase_approved', '{}'),
( 'default', 'rent_movie_purchase_approved', '{}'),
( 'movies', 'movies_admin_approved', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_admin_disapproved', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_featured', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_sponsored', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_hot', '{\"movies\":\"movie\"}'),
( 'movies', 'movies_favourite', '{\"movies\":\"movie\"}'),
( 'series', 'series_like', '{\"movies\":\"series\"}'),
( 'series', 'series_dislike', '{\"movies\":\"series\"}'),
( 'series', 'series_comments_like', '{\"movies\":\"series\",\"comment\":\"comment\"}'),
( 'series', 'series_comments_dislike', '{\"movies\":\"series\",\"comment\":\"comment\"}'),
( 'series', 'series_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'series', 'series_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'series', 'series_reply_comment', '{\"movies\":\"series\",\"comment\":\"comment\"}'),
( 'series', 'series_comment', '{\"movies\":\"series\"}'),
( 'series', 'movievideos_processed_complete', '{\"movies\":\"series\"}'),
( 'series', 'movievideos_processed_failed', '{\"movies\":\"series\"}'),
( 'series', 'series_admin_approved', '{\"movies\":\"series\"}'),
( 'series', 'series_admin_disapproved', '{\"movies\":\"series\"}'),
( 'series', 'series_featured', '{\"movies\":\"series\"}'),
( 'series', 'series_sponsored', '{\"movies\":\"series\"}'),
( 'series', 'series_hot', '{\"movies\":\"series\"}'),
( 'series', 'series_favourite', '{\"movies\":\"series\"}'),
( 'default', 'videos_reminder', '{\"videos\":\"Live Streaming\"}'),
( 'default', 'bankdetails_usersubscribe_approved', '{}'),
( 'default', 'login_header', NULL),
( 'default', 'loggedout_header', NULL),
( 'default', 'login_footer', NULL),
( 'default', 'loggedout_footer', NULL),
( 'default', 'contact', '{\"usertitle\":\"\",\"senderemail\":\"\",\"message\":\"\"}'),
( 'default', 'email_address_verification', '{\"verificationlink\":\"\",\"email\":\"\"}'),
( 'default', 'lost_password', '{\"resetpasswordlink\":\"\"}'),
( 'default', 'welcome',  '{\"getstarted\":\"\",\"contactus\":\"\",\"email\":\"\"}'),
('default','level_member_expiry','{\"planName\":\"\",\"period\":\"\"}'),
( 'default', 'notify_admin_user_signup','{\"usertitle\":\"\",\"signupdate\":\"\",\"userprofilelink\":\"\"}'),
( 'default', 'payment_subscription_active', NULL),
( 'default', 'payment_subscription_pending', NULL),
( 'default', 'payment_subscription_overdue', NULL),
( 'default', 'payment_subscription_refunded', NULL),
( 'default', 'payment_subscription_expired', NULL),
( 'default', 'payment_subscription_recurrence', NULL),
( 'default', 'payment_subscription_cancelled', NULL),
( 'default', 'payment_subscription_disputeclear', NULL),
( 'default', 'payment_subscription_disputecreate', NULL),
( 'default', 'payment_video_disputecreate', NULL),
( 'default', 'payment_video_disputeclear', NULL),
( 'default', 'payment_video_pending', NULL),
( 'default', 'payment_video_completed', NULL),
( 'default', 'payment_video_failed', NULL),
( 'default', 'payment_video_refunded', NULL),
( 'default', 'channel_support_payment_subscription_active', NULL),
( 'default', 'channel_support_payment_subscription_pending', NULL),
( 'default', 'channel_support_payment_subscription_overdue', NULL),
( 'default', 'channel_support_payment_subscription_refunded', NULL),
( 'default', 'channel_support_payment_subscription_expired', NULL),
( 'default', 'channel_support_payment_subscription_recurrence', NULL),
( 'default', 'channel_support_payment_subscription_cancelled', NULL),
( 'default', 'channel_support_payment_subscription_disputeclear', NULL),
( 'default', 'channel_support_payment_subscription_disputecreate', NULL),
( 'audio', 'audio_admin_approved', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_comment', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_reply_comment', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio', 'audio_comments_like', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio', 'audio_comments_dislike', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio', 'audio_reply_like', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio', 'audio_reply_dislike', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio', 'audio_favourite', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_like', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_dislike', '{\"audio\":\"audio\"}'),
( 'videos', 'videos_processed_complete', '{\"videos\":\"video\"}'),
( 'videos', 'videos_processed_failed', '{\"videos\":\"video\"}'),
( 'videos', 'videos_comment', '{\"videos\":\"video\"}'),
( 'videos', 'videos_reply_comment', '{\"videos\":\"video\",\"comment\":\"comment\"}'),
( 'videos', 'videos_comments_like', '{\"videos\":\"video\",\"comment\":\"comment\"}'),
( 'videos', 'videos_comments_dislike', '{\"videos\":\"video\",\"comment\":\"comment\"}'),
( 'videos', 'videos_reply_like', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'videos', 'videos_reply_dislike', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'videos', 'videos_favourite', '{\"videos\":\"video\"}'),
-- ( 'videos', 'videos_watchlater', '{\"videos\":\"video\"}'),
( 'videos', 'videos_like', '{\"videos\":\"video\"}'),
( 'videos', 'videos_dislike', '{\"videos\":\"video\"}'),
( 'videos', 'videos_featured', '{\"videos\":\"video\"}'),
( 'videos', 'videos_sponsored', '{\"videos\":\"video\"}'),
( 'videos', 'videos_hot', '{\"videos\":\"video\"}'),
( 'videos', 'videos_admin_approved', '{\"videos\":\"video\"}'),
( 'videos', 'videos_admin_disapproved', '{\"videos\":\"video\"}'),
( 'videos', 'videos_rating', '{\"videos\":\"video\"}'),
( 'channels', 'channels_comment', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_reply_comment', '{\"channels\":\"channel\",\"comment\":\"comment\"}'),
( 'channels', 'channels_comments_like', '{\"channels\":\"channel\",\"comment\":\"comment\"}'),
( 'channels', 'channels_comments_dislike', '{\"channels\":\"channel\",\"comment\":\"comment\"}'),
( 'channels', 'channels_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels', 'channels_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_comment', '{\"channel_posts\":\"post\"}'),
( 'channels', 'channel_posts_comments_like', '{\"channel_posts\":\"channel_posts\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_comments_dislike', '{\"channel_posts\":\"channel_posts\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels', 'channels_favourite', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_like', '{\"channels\":\"channel\"}'),
( 'channels', 'channel_posts_like', '{\"channel_posts\":\"channel_posts\"}'),
( 'channels', 'channel_posts_dislike', '{\"channel_posts\":\"channel_posts\"}'),
( 'channels', 'channels_dislike', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_featured', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_sponsored', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_hot', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_admin_approved', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_admin_disapproved', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_rating', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_follow', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_followed', '{\"channels\":\"channel\"}'),
( 'channels', 'channels_verified', '{\"channels\":\"channel\"}'),
( 'playlists', 'playlists_comment', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_reply_comment', '{\"playlists\":\"playlist\",\"comment\":\"comment\"}'),
( 'playlists', 'playlists_comments_like', '{\"playlists\":\"playlist\",\"comment\":\"comment\"}'),
( 'playlists', 'playlists_comments_dislike', '{\"playlists\":\"playlist\",\"comment\":\"comment\"}'),
( 'playlists', 'playlists_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'playlists', 'playlists_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'playlists', 'playlists_favourite', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_like', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_dislike', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_featured', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_sponsored', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_hot', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_admin_approved', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_admin_disapproved', '{\"playlists\":\"playlists\"}'),
( 'playlists', 'playlists_rating', '{\"playlists\":\"playlists\"}'),
( 'blogs', 'blogs_comment', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_reply_comment', '{\"blogs\":\"blogs\",\"comment\":\"comment\"}'),
( 'blogs', 'blogs_comments_like', '{\"blogs\":\"blogs\",\"comment\":\"comment\"}'),
( 'blogs', 'blogs_comments_dislike', '{\"blogs\":\"blogs\",\"comment\":\"comment\"}'),
( 'blogs', 'blogs_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'blogs', 'blogs_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'blogs', 'blogs_favourite', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_like', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_dislike', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_featured', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_sponsored', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_hot', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_admin_approved', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_admin_disapproved', '{\"blogs\":\"blogs\"}'),
( 'blogs', 'blogs_rating', '{\"blogs\":\"blogs\"}'),
( 'members', 'members_comment', '{\"members\":\"profile\"}'),
( 'members', 'members_reply_comment', '{\"members\":\"profile\",\"comment\":\"comment\"}'),
( 'members', 'members_comments_like', '{\"members\":\"profile\",\"comment\":\"comment\"}'),
( 'members', 'members_comments_dislike', '{\"members\":\"profile\",\"comment\":\"comment\"}'),
( 'members', 'members_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'members', 'members_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'members', 'members_favourite', '{\"members\":\"profile\"}'),
( 'members', 'members_like', '{\"members\":\"profile\"}'),
( 'members', 'members_dislike', '{\"members\":\"profile\"}'),
( 'members', 'members_featured', '{\"members\":\"profile\"}'),
( 'members', 'members_sponsored', '{\"members\":\"profile\"}'),
( 'members', 'members_admin_approved', '{\"members\":\"profile\"}'),
( 'members', 'members_verified', '{\"members\":\"profile\"}'),
( 'members', 'members_reject_verified', '{\"members\":\"profile\"}'),
( 'members', 'members_admin_disapproved', '{\"members\":\"profile\"}'),
( 'members', 'members_hot', '{\"members\":\"profile\"}'),
( 'members', 'members_rating', '{\"members\":\"profile\"}'),
( 'members', 'members_follow', '{\"members\":\"profile\"}'),
( 'members', 'members_followed', '{\"members\":\"profile\"}'),
( 'default', 'member_invite', '{}'),
( 'default', 'bankdetails_videopurchase_approved', '{}'),
( 'default', 'bankdetails_rechargewallet_approved', '{}'),
( 'default', 'bankdetails_membersubscription_approved', '{}'),
( 'default', 'bankdetails_channelsubscription_approved', '{}');

DROP TABLE IF EXISTS `bankdetails`;
CREATE TABLE `bankdetails` (
  `bank_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `resource_type` varchar(255) not null,
  `resource_id` varchar(255) not null,
  `package_id` INT(11) NOT NULL DEFAULT '0',
  `price` varchar(255) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `type` varchar(45) NOT NULL,
  `creation_date` datetime NOT NULL,
  `approve_date` datetime NOT NULL,
  `image` varchar(255) NOT NULL,
  `status` tinyint (1) NOT NULL default '0',
  PRIMARY KEY (`bank_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `slideshows`;
CREATE TABLE `slideshows`(
  `slideshow_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT  NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT  NULL,
  `image` varchar(255)  NULL,
  `button_1_enabled` tinyint(1) NOT NULL DEFAULT "1",
  `link1` varchar(255)  NULL,
  `text1` varchar(255)  NULL,
  `button_2_enabled` tinyint(1) NOT NULL DEFAULT "1",
  `link2` varchar(255)  NULL,
  `text2` varchar(255)  NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `order` int(11) unsigned NOT NULL default '0',
  PRIMARY KEY (`slideshow_id`),
  KEY `enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `artists`;
CREATE TABLE `artists`(
  `artist_id` int(11) unsigned NOT NULL auto_increment,
  `custom_url` varchar(255) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT  NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `image` varchar(255)  NULL,
  `type` varchar(10) NOT NULL DEFAULT "video",
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `verified` TINYINT(1) NOT NULL DEFAULT '0',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `rating` float default '0.0',
  `age` VARCHAR(255) NULL,
  `gender` VARCHAR(255) NULL,
  `birthplace` VARCHAR(255) NULL,
  PRIMARY KEY (`artist_id`),
  KEY `custom_url` (`custom_url`),
  KEY `verified` (`verified`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `dislike_count` (`dislike_count`),
  KEY `favourite_count` (`favourite_count`),
  KEY `rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE INTO `artists` (`artist_id`, `custom_url`, `title`, `description`, `image`, `type`, `verified`, `view_count`, `comment_count`, `like_count`, `dislike_count`, `favourite_count`, `rating`) VALUES
(1, 'va9nqk4w8dsix', 'Adele Laurie', 'Adele Laurie Blue Adkins MBE is an English singer-songwriter. After graduating from the BRIT School in 2006, Adele signed a recording contract with XL Recordings. In 2007, she received the Brit Awards Critics Choice award and won the BBC Sound of 2008 poll.', '/upload/images/videos/artists/1577961536493_l35lzd_AdeleLaurie_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(2, 'va9wdk4wiwdor', 'Beyonce Giselle', 'Beyoncé Giselle Knowles-Carter is an American singer, songwriter, record producer, and actress. Born and raised in Houston, Texas, Beyoncé performed in various singing and dancing competitions as a child.', '/upload/images/videos/artists/1577961526811_0fsrks_beyonce_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(3, 'va9wdk4wix66p', 'Britney Spears', 'Britney Jean Spears is an American singer, songwriter, dancer, and actress. Born in McComb, Mississippi and raised in Kentwood, Louisiana, she appeared in stage productions and television series, before signing with Jive Records in 1997. Spears first two studio albums, ...Baby One More Time and Oops!', '/upload/images/videos/artists/1577961518999_hbdjkq_BritneySpears_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(4, 'va9wdk4wixo71', 'Chris Brown', 'Christopher Maurice Brown is an American singer, songwriter and dancer. Born in Tappahannock, Virginia, he was involved in his church choir and several local talent shows from a young age.', '/upload/images/videos/artists/1577961512448_vg6jdk_ChrisBrown_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(5, 'va9wdk4wiyk5c', 'Aubrey Drake Graham', 'Aubrey Drake Graham is a Canadian rapper, singer, songwriter, producer, actor, and businessman. Drake initially gained recognition as an actor on the teen drama television series Degrassi.', '/upload/images/videos/artists/1577961505179_fhp3fl_Drake_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(6, 'va9wdk4wiz3yw', 'Eminem', 'Marshall Bruce Mathers III, known professionally as Eminem, is an American rapper, songwriter, record producer, record executive, film producer, and actor. He is consistently cited as one of the greatest and most influential rappers of all time.', '/upload/images/videos/artists/1577961494637_rhe2zm_Eminem_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(7, 'va9wdk4wkunc4', 'Halle Berry', 'Halle Maria Berry is an American actress. Berry won the Academy Award for Best Actress for her performance in the romantic drama film Monsters Ball, becoming the only woman of African American descent to have won the award.', '/upload/images/videos/artists/1577961488499_x7boe_HalleBerry_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(8, 'va9wdk4wkvont', 'Jay Z', 'Shawn Corey Carter, known professionally as Jay-Z, is an American rapper, songwriter, producer, entrepreneur, and record executive. He is regarded as one of the greatest rappers of all time. ', '/upload/images/videos/artists/1577961482042_wmg23n_JayZ_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(9, 'va9wdk4wkw4cq', 'Jennifer Aniston', 'Jennifer Joanna Aniston is an American actress, film producer, and businesswoman. The daughter of actors John Aniston and Nancy Dow, she began working as an actress at an early age with an uncredited role in the 1987 film Mac and Me. Her first major film role came in the 1993 horror comedy Leprechaun.', '/upload/images/videos/artists/1577961475013_ldq7a_JenniferAniston_main.jpeg', 'video', 0, 0, 0, 0, 0, 0, 0),
(10, 'va9wdk4wkwk45', 'Jennifer Lopez', 'Jennifer Lynn Lopez, also known by her nickname J.Lo, is an American actress, singer, dancer, fashion designer, producer and businesswoman. In 1991, Lopez began appearing as a Fly Girl dancer on In Living Color, where she remained a regular until she decided to pursue an acting career in 1993.', '/upload/images/videos/artists/1577961468900_4d59ls_JenniferLopez_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(11, 'va9wdk4wl107r', 'Justin Bieber', 'Justin Drew Bieber is a Canadian singer, songwriter and actor. Discovered at 13 years old by talent manager Scooter Braun after he had watched his YouTube cover song videos, Bieber was signed to RBMG Records in 2008.', '/upload/images/videos/artists/1577960646986_mqkoje_image_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(12, 'va9wdk4wlnzh3', 'Taylor Swift', 'Taylor Alison Swift is an American singer-songwriter. She is known for narrative songs about her personal life, which have received widespread media coverage. At age 14, she became the youngest artist signed by the Sony/ATV Music publishing house and, at 15, she signed her first record deal.', '/upload/images/videos/artists/1577961718224_8nm4sg_9108999_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(13, 'va9wdk4wlop14', 'Sandra Bullock', 'Sandra Annette Bullock is an American actress, producer, and philanthropist. She was the highest paid actress in the world in 2010 and 2014. In 2015, Bullock was chosen as Peoples Most Beautiful Woman and was included in Times 100 most influential people in the world in 2010.', '/upload/images/videos/artists/1577961751157_k6aff_SandraBullock_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(14, 'va9wdk4wlp6e4', 'Rihanna', 'Robyn Rihanna Fenty is a Barbadian singer, songwriter, fashion designer, actress and businesswoman, who has been recognized for embracing various musical styles and reinventing her image throughout her career.', '/upload/images/videos/artists/1577961775256_v6vkfe_Rihanna_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(15, 'va9wdk4wlpnc4', 'Nicki Minaj', 'Onika Tanya Maraj-Petty, known professionally as Nicki Minaj, is a Trinidad and Tobago-born rapper, singer, songwriter, actress, and model.', '/upload/images/videos/artists/1577961797274_rs17q_NickiMinaj_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(16, 'va9wdk4wlq2e1', 'Shakira', 'Shakira Isabel Mebarak Ripoll is a Colombian singer, songwriter, dancer, businesswoman, and philanthropist. Born and raised in Barranquilla, she made her recording debut under Sony Music Colombia at the age of 13', '/upload/images/videos/artists/1577961816748_vb81r_Shakira_main.jpg', 'video', 0, 0, 0, 0, 0, 0, 0),
(17, 'va9nqk4w8dsixc', 'Adele Laurie', 'Adele Laurie Blue Adkins MBE is an English singer-songwriter. After graduating from the BRIT School in 2006, Adele signed a recording contract with XL Recordings. In 2007, she received the Brit Awards Critics Choice award and won the BBC Sound of 2008 poll.', '/upload/images/channels/artists/1577961536493_l35lzd_AdeleLaurie_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(18, 'va9wdk4wiwdorc', 'Beyonce Giselle', 'Beyoncé Giselle Knowles-Carter is an American singer, songwriter, record producer, and actress. Born and raised in Houston, Texas, Beyoncé performed in various singing and dancing competitions as a child.', '/upload/images/channels/artists/1577961526811_0fsrks_beyonce_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(19, 'va9wdk4wix66pc', 'Britney Spears', 'Britney Jean Spears is an American singer, songwriter, dancer, and actress. Born in McComb, Mississippi and raised in Kentwood, Louisiana, she appeared in stage productions and television series, before signing with Jive Records in 1997. Spears first two studio albums, ...Baby One More Time and Oops!', '/upload/images/channels/artists/1577961518999_hbdjkq_BritneySpears_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(20, 'va9wdk4wixo71c', 'Chris Brown', 'Christopher Maurice Brown is an American singer, songwriter and dancer. Born in Tappahannock, Virginia, he was involved in his church choir and several local talent shows from a young age.', '/upload/images/channels/artists/1577961512448_vg6jdk_ChrisBrown_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(21, 'va9wdk4wiyk5cc', 'Aubrey Drake Graham', 'Aubrey Drake Graham is a Canadian rapper, singer, songwriter, producer, actor, and businessman. Drake initially gained recognition as an actor on the teen drama television series Degrassi.', '/upload/images/channels/artists/1577961505179_fhp3fl_Drake_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(22, 'va9wdk4wiz3ywc', 'Eminem', 'Marshall Bruce Mathers III, known professionally as Eminem, is an American rapper, songwriter, record producer, record executive, film producer, and actor. He is consistently cited as one of the greatest and most influential rappers of all time.', '/upload/images/channels/artists/1577961494637_rhe2zm_Eminem_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(23, 'va9wdk4wkunc4c', 'Halle Berry', 'Halle Maria Berry is an American actress. Berry won the Academy Award for Best Actress for her performance in the romantic drama film Monsters Ball, becoming the only woman of African American descent to have won the award.', '/upload/images/channels/artists/1577961488499_x7boe_HalleBerry_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(24, 'va9wdk4wkvontc', 'Jay Z', 'Shawn Corey Carter, known professionally as Jay-Z, is an American rapper, songwriter, producer, entrepreneur, and record executive. He is regarded as one of the greatest rappers of all time. ', '/upload/images/channels/artists/1577961482042_wmg23n_JayZ_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(25, 'va9wdk4wkw4cqc', 'Jennifer Aniston', 'Jennifer Joanna Aniston is an American actress, film producer, and businesswoman. The daughter of actors John Aniston and Nancy Dow, she began working as an actress at an early age with an uncredited role in the 1987 film Mac and Me. Her first major film role came in the 1993 horror comedy Leprechaun.', '/upload/images/channels/artists/1577961475013_ldq7a_JenniferAniston_main.jpeg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(26, 'va9wdk4wkwk45c', 'Jennifer Lopez', 'Jennifer Lynn Lopez, also known by her nickname J.Lo, is an American actress, singer, dancer, fashion designer, producer and businesswoman. In 1991, Lopez began appearing as a Fly Girl dancer on In Living Color, where she remained a regular until she decided to pursue an acting career in 1993.', '/upload/images/channels/artists/1577961468900_4d59ls_JenniferLopez_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(27, 'va9wdk4wl107rc', 'Justin Bieber', 'Justin Drew Bieber is a Canadian singer, songwriter and actor. Discovered at 13 years old by talent manager Scooter Braun after he had watched his YouTube cover song videos, Bieber was signed to RBMG Records in 2008.', '/upload/images/channels/artists/1577960646986_mqkoje_image_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(28, 'va9wdk4wlnzh3c', 'Taylor Swift', 'Taylor Alison Swift is an American singer-songwriter. She is known for narrative songs about her personal life, which have received widespread media coverage. At age 14, she became the youngest artist signed by the Sony/ATV Music publishing house and, at 15, she signed her first record deal.', '/upload/images/channels/artists/1577961718224_8nm4sg_9108999_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(29, 'va9wdk4wlop14c', 'Sandra Bullock', 'Sandra Annette Bullock is an American actress, producer, and philanthropist. She was the highest paid actress in the world in 2010 and 2014. In 2015, Bullock was chosen as Peoples Most Beautiful Woman and was included in Times 100 most influential people in the world in 2010.', '/upload/images/channels/artists/1577961751157_k6aff_SandraBullock_main.jpg', 'channel', 0, 0, 2, 0, 0, 0, 0),
(30, 'va9wdk4wlp6e4c', 'Rihanna', 'Robyn Rihanna Fenty is a Barbadian singer, songwriter, fashion designer, actress and businesswoman, who has been recognized for embracing various musical styles and reinventing her image throughout her career.', '/upload/images/channels/artists/1577961775256_v6vkfe_Rihanna_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(31, 'va9wdk4wlpnc4c', 'Nicki Minaj', 'Onika Tanya Maraj-Petty, known professionally as Nicki Minaj, is a Trinidad and Tobago-born rapper, singer, songwriter, actress, and model.', '/upload/images/channels/artists/1577961797274_rs17q_NickiMinaj_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0),
(32, 'va9wdk4wlq2e1c', 'Shakira', 'Shakira Isabel Mebarak Ripoll is a Colombian singer, songwriter, dancer, businesswoman, and philanthropist. Born and raised in Barranquilla, she made her recording debut under Sony Music Colombia at the age of 13', '/upload/images/channels/artists/1577961816748_vb81r_Shakira_main.jpg', 'channel', 0, 0, 0, 0, 0, 0, 0);

DROP TABLE IF EXISTS `artist_photos`;
CREATE TABLE `artist_photos` (
  `photo_id` int(11) UNSIGNED NOT NULL auto_increment,
   `artist_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `title` varchar(255) NULL,
  `description` text NULL,
  PRIMARY KEY (`photo_id`),
  KEY `artist_id` (`artist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `item_artists`;
CREATE TABLE `item_artists`(
  `item_artist_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(10) NOT  NULL default "video",
  `id` int(11) unsigned NOT NULL default '0',
  PRIMARY KEY (`item_artist_id`),
  KEY `type` (`type`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages`(
  `page_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(45) NOT NULL DEFAULT "",
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT  NULL, 
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin  NULL,
  `url` varchar(255) NULL,
  `description` varchar(255)  NULL,
  `keywords` varchar(255)  NULL,
  `image` varchar(255)  NULL,
  `content` text NULL,
  `view_count` int(11) NOT NULL DEFAULT '0',
  `custom` tinyint(1) NOT NULL DEFAULT '0',
  `banner_image` tinyint(1) NOT NULL default '0',
  `banner` VARCHAR(255) NULL,
  `custom_tags` TEXT NULL,
  PRIMARY KEY (`page_id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


INSERT IGNORE INTO `pages` ( `type`, `label`, `title`, `url`, `description`, `keywords`, `image`, `content`, `view_count`, `custom`, `banner_image`, `banner`) VALUES
( 'landing_page', 'Home Page', 'Home Page', '', '', NULL, '', '0', 0, 0, 0, NULL),
( 'messages_browse', 'Messages', 'Messages', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'blog_view', 'Blog View Page', 'Blog View', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'video_artist_browse', 'Video Artist Browse Page', 'Videos Artists', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'channel_artist_browse', 'Channel Artist Browse Page', 'Channels Artists', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'video_artist_view', 'Video Artist View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'channel_artist_view', 'Channel Artist View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'blog_browse', 'Blog Browse Page', 'Blogs', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'blog_category_view', 'Blog Category View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'playlist_edit_create', 'Playlist Edit Page', 'Edit Playlist', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'ads_create', 'Ads Create Page', 'Create Advertisement', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'ads_edit', 'Ads Edit Page', 'Edit Advertisement', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'login', 'Login Page', 'Login', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'signup', 'Signup Page', 'Signup', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'forgot_password', 'Forgot Password Page', 'Forgot Password', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'forgot_password_verify', 'Forgot Password Verify Page', 'Forgot Password Verify', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'browse_blog_category_view', 'Blog Browse Category Page', 'Blogs Categories', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'blog_create', 'Blog Create Page', 'Create Blog', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'blog_edit', 'Blog Edit Page', 'Edit Blog', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'browse_channel_category_view', 'Channel Browse Category Page', 'Channels Categories', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'channel_category_view', 'Channel Category View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'channel_browse', 'Channel Browse Page', 'Channels', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'channel_view', 'Channel View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'channel_create', 'Channel Create Page', 'Create Channel', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'channel_edit', 'Channel Edit Page', 'Edit Channel', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'dashboard', 'Member Dashboard', 'Dashboard', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'privacy', 'Privacy Page', 'Privacy Policy', NULL, '', '', NULL, '<h3>Policy Step 1:</h3>\n\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n\n<h3>Policy Step 2:</h3>\n\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n<h3>Policy Step 3:</h3>\n\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>', 0, 0, 1, NULL),
( 'terms', 'Terms of Service Page', 'Terms of Service', NULL, '', '', NULL, '<h3>Terms Step 1:</h3>\r\n\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\r\n\r\n<h3>Terms Step 2:</h3>\r\n\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\r\n<h3>Terms Step 3:</h3>\r\n\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>', 0, 0, 1, NULL),
( 'contact_us', 'Contact Page', 'Contact Us', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'page_not_found', 'Page Not Found', 'Page Not Found', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'playlist_browse', 'Playlist Browse Page', 'Playlists', NULL, '', '', NULL, NULL, 21, 0, 0, NULL),
( 'playlist_view', 'Playlist View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'search', 'Search Page', 'Search', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'upgrade_browse', 'Upgrade Membership Browse Page', 'Upgrade Membership', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'payment_success', 'Membership Payment Success Page', 'Payment Success', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'payment_fail', 'Membership Payment Error Page', 'Payment Error', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'member_browse', 'Member Browse Page', 'Members', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'member_view', 'Member View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'browse_video_category_view', 'Video Browse Category Page', 'Videos Categories', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'video_category_view', 'Video Category View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'video_browse', 'Video Browse Page', 'Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'video_view', 'Video View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'video_create', 'Video Create Page', 'Create Video', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'video_edit', 'Video Edit Page', 'Edit Video', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'permission_error', 'Permission Error Page', 'Permission Error', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'maintenance', 'Maintenance Page', 'Maintenance Page', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'verify_account', 'Verify Account Page', 'Verify Account', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'live_streaming_create', 'Go Live Page', 'Go Live', '', '', NULL, '', '0', 0, 0, 0, NULL),
( 'treading_video_browse', 'Trending Video Browse Page', 'Trending Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'top_video_browse', 'Top Video Browse Page', 'Top Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'latest_video_browse', 'Latest Video Browse Page', 'Latest Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
('live_video_browse', 'Live Videos Browse Page', 'Live Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'audio_browse', 'Audio Browse Page', 'Audio', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'audio_view', 'Audio View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'audio_edit_create', 'Audio Edit Page', 'Edit Audio', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'audio_create', 'Audio Create Page', 'Create Audio', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'blog_view', 'Blog View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'movie_create', 'Movies Create Page', 'Create Movie', '', '', NULL, '', '0', 0, 0, 0, NULL),
( 'movies_browse', 'Movies Browse Page', 'Movies', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'season_browse', 'Seasons Browse Page', 'Seasons', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'movies_series_trailers', 'Trailers Browse Page', 'Trailers', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'movies_series_episodes', 'Episodes Browse Page', 'Episodes', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'movie_edit', 'Movie Edit Page', 'Edit Movie', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'series_create', 'Series Create Page', 'Create Series', '', '', NULL, '', '0', 0, 0, 0, NULL),
( 'series_edit', 'Series Edit Page', 'Edit Series', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'series_browse', 'Series Browse Page', 'Series', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'cast_crew_browse', 'Cast & Crew Browse Page', 'Cast & Crew', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'movies_series_view', 'Movies View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'cast_crew_view', 'Cast & Crew View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'browse_movie_series_category_view', 'Movies & Series Browse Category Page', 'Movies & Series Categories', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'movie_series_category_view', 'Movies & Series Category View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'reel_create', 'Reel Create Page', 'Create Reel', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'reel_view', 'Reel View Page', 'View Reel', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'story_view', 'Story View Page', 'View Story', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'reel_edit', 'Reel Edit Page', 'Edit Reel', NULL, '', '', NULL, NULL, 0, 0, 0, NULL);

DROP TABLE IF EXISTS `livestreaming_chats`;
CREATE TABLE `livestreaming_chats` (
  `chat_id` int(11) UNSIGNED NOT NULL auto_increment,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` int(11) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `params` VARCHAR(255) NOT NULL DEFAULT '{}',
  `id` VARCHAR(255) NULL,
  `creation_date` datetime NOT NULL, 
  PRIMARY KEY (`chat_id`),
  KEY `owner_id` (`owner_id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`(
  `menu_id` int(11) unsigned NOT NULL auto_increment,
  `submenu_id` int(11) unsigned NOT NULL DEFAULT '0',
  `subsubmenu_id` int(11) unsigned NOT NULL DEFAULT '0',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT  NULL,
  `params` varchar(255)  NULL,
  `customParam` varchar(255)  NULL,
  `target` varchar(45) NOT NULL DEFAULT '_self',
  `url` varchar(255) NOT NULL DEFAULT '',
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `order` int(11) NOT NULL DEFAULT '0',
  `icon` varchar(45) NOT NULL DEFAULT '',
  `custom` TINYINT(1) NOT NULL DEFAULT '0',
  `content_type` varchar(45) NULL,
  `type` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '1=>main menu, 2 => footer menu, 3 => bottom footer menu,4 => site social share links',
  PRIMARY KEY (`menu_id`),
  key `type` (`type`),
  KEY `submenu_id` (`submenu_id`),
  KEY `subsubmenu_id` (`subsubmenu_id`),
  KEY `enabled` (`enabled`),
  KEY `order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


INSERT IGNORE INTO `menus` ( `submenu_id`, `subsubmenu_id`, `label`, `params`, `customParam`, `target`, `url`, `enabled`, `order`, `icon`, `custom`, `type`,`content_type`) VALUES
( 0, 0, 'Videos', NULL, NULL, '_self', '/videos', 1, 7, 'fas fa-video', 0, 1,'videos'),
( 0, 0, 'Live', NULL, 'live-streaming=1', '_self', '/live', 0, 7, 'fa fa-play', 0, 1,'live-streaming'),
( 0, 0, 'Channels', NULL, NULL, '_self', '/channels', 1, 6, 'fas fa-file-video', 0, 1,'channels'),
( 0, 0, 'Playlists', NULL, NULL, '_self', '/playlists', 1, 1, 'fa fa-play-circle', 0, 1,'playlists'),
( 0, 0, 'Members', NULL, NULL, '_self', '/members', 1, 5, 'fas fa-user-friends', 0, 1,NULL),
( 0, 0, 'Blogs', NULL, NULL, '_self', '/blogs', 1, 2, 'fas fa-rss', 0, 1,'blogs'),
( 0, 0, 'Categories', NULL, NULL, '_self', 'javascript:void(0)', 1, 3, 'fa fa-list-alt', 0, 1,NULL),
( 0, 0, 'Audio', NULL, NULL, '_self', '/audio', 1, 4, 'fa fa-headphones', 0, 1,'audio'),
( 7, 0, 'Videos', '/categories', 'type=video', '_self', '/video/categories', 1, 1, '', 0, 1,'videos'),
( 7, 0, 'Channels', '/categories', 'type=channel', '_self', '/channel/categories', 1, 2, '', 0, 1,'channels'),
( 0, 0, 'Artists', NULL, NULL, '_self', 'javascript:void(0)', 1, 4, 'far fa-user', 0, 1,NULL),
( 11, 0, 'Videos', '/artists', 'artistType=video', '_self', '/artists/video', 1, 1, '', 0, 1,'videos'),
( 11, 0, 'Channels', '/artists', 'artistType=channel', '_self', '/artists/channel', 1, 2, '', 0, 1,'channels'),
( 0, 0, 'Contact', NULL, NULL, '_self', '/contact', 1, 8, '', 0, 3,NULL),
( 0, 0, 'Terms of Service', NULL, NULL, '_self', '/terms', 1, 9, '', 0, 3,NULL),
( 0, 0, 'Privacy', NULL, NULL, '_self', '/privacy', 1, 10, '', 0, 3,NULL),
( 0, 0, 'Facebook', NULL, NULL, '_self', 'javascript:void(0)', 1, 5, 'fab fa-facebook-f', 0, 4,NULL),
( 0, 0, 'Twitter', NULL, NULL, '_self', 'javascript:void(0)', 1, 4, 'fab fa-twitter', 0, 4,NULL),
( 0, 0, 'Pinterest', NULL, NULL, '_self', 'javascript:void(0)', 1, 1, 'fab fa-pinterest-p', 0, 4,NULL),
( 0, 0, 'Youtube', NULL, NULL, '_self', 'javascript:void(0)', 1, 2, 'fab fa-youtube', 0, 4,NULL),
( 0, 0, 'Vimeo', NULL, NULL, '_self', 'javascript:void(0)', 1, 3, 'fab fa-vimeo-v', 0, 4,NULL),
( 7, 0, 'Blogs', '/categories', 'type=blog', '_self', '/blog/categories', 1, 3, '', 0, 1,'blogs'),
( 0, 0, 'Instagram', NULL, NULL, '_self', 'javascript:void(0)', 1, 6, 'fab fa-instagram', 0, 4,NULL),
( 0, 0, 'Movies', NULL, '', '_self', '/movies', 0, 4, 'fa fa-film', 1, 1,'movies'),
( 0, 0, 'Series', NULL, '', '_self', '/series', 0, 5, 'fa fa-tv', 1, 1,'movies'),
( 7, 0, 'Movies & Series', '/categories', 'type=movies-series', '_self', '/movies-series/categories', 1, 2, '', 0, 1,'movies'),
( 0, 0, 'Cast & Crew', NULL, '', '_self', '/cast-and-crew', 1, 1, 'fa fa-user', 0, 1,'movies');

DROP TABLE IF EXISTS `file_manager`;
CREATE TABLE `file_manager`(
  `file_id` int(11) unsigned NOT NULL auto_increment,
  `path` varchar(255) NOT  NULL,
  `orgName` VARCHAR(255) NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE  INTO `file_manager` (`file_id`, `path`,`orgName`) VALUES
(1, '/resources/1584104330651_ingpr_defaultCover.jpg','defaultCover.jpg'),
(2, '/resources/1584104335798_3zgmrl_defaultFemale.jpg','defaultFemale.jpg'),
(3, '/resources/1584104338796_71wcqm_defaultVideo.png','defaultVideo.png'),
(4, '/resources/1584104341548_l3rnkl_defaultPlaylist.jpg','defaultPlaylist.jpg'),
(5, '/resources/1584104344179_lasxrh_defaultBlog.png','defaultBlog.png'),
(6, '/resources/1584104347443_dwmh1_defaultMale.png','defaultMale.png'),
(8, '/resources/1584179156623_4sn3ah_defaultChannel.jpg','defaultChannel.jpg'),
(11, '/resources/1589822882043_yv14f_logo.png','logo.png'),
(12, '/resources/1589822887203_1in3m6_favicon.png','favicon.png'),
( 13, '/resources/128937918273923_userPlan.png','userPlan.png'),
( 14, '/resources/1607062990688_78ug9n_episodes.jpg','episodes.jpg'),
( 15, '/resources/1607062995120_5c5v1p_movies.jpg','movies.jpg');

DROP TABLE IF EXISTS `site_stats`;
CREATE TABLE `site_stats`(
  `stats_id` int(11) unsigned NOT NULL auto_increment,
  `key` varchar(255) NOT  NULL, 
  `total_count` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`stats_id`),
  KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages`(
  `language_id` int(11) unsigned NOT NULL auto_increment,
  `code` varchar(255) NOT  NULL, 
  `title` varchar(255) NOT  NULL, 
  `class` varchar(255) NOT  NULL,
  `enabled` TINYINT(1) NOT NULL default '1',
  `default` TINYINT(1) NOT NULL DEFAULT '0',
  `is_rtl` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`language_id`),
  KEY `code` (`code`),
  KEY `enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE INTO `languages` (`language_id`, `code`, `title`, `class`, `enabled`, `default`, `is_rtl`) VALUES
(1, 'en', 'English', 'flag-icon-gb', 1, 1, 0);

DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions`(
  `subscription_id` int(11) unsigned NOT NULL auto_increment,
  `order_id` int(10) unsigned NOT NULL default '0',
  `type` VARCHAR(45) NOT NULL DEFAULT 'member',
  `id` int(11) not NULL default '0',
  `owner_id` int(11) unsigned NOT NULL,
  `package_id` int(11) unsigned NOT NULL,
  `status` varchar(45) NOT NULL default 'initial',
  `expiration_date` DATETIME NULL DEFAULT NULL,
  `gateway_id` INT(11) NOT NULL default '1',
  `gateway_profile_id` varchar(255) NULL,
  `is_level_change` tinyint(1) NOT NULL default '0',
  `is_notification_send` tinyint(1) NOT NULL default '0',
  `receipt` TEXT NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`subscription_id`),
  KEY `package_id` (`package_id`),
  KEY `searchIndex` (`status`,`type`,`owner_id`),
  KEY `owner_id` (`owner_id`),
  KEY `order_id` (`order_id`),
  KEY `type` (`type`),
  KEY `id` (`id`),
  KEY `status` (`status`),
  KEY `expiration_date` (`expiration_date`),
  KEY `search` (`owner_id`,`type`,`id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` int(10) UNSIGNED NOT NULL,
  `gateway_id` int(10) UNSIGNED NOT NULL DEFAULT '1',
  `gateway_transaction_id` varchar(128) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
  `state` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT 'pending',
  `creation_date` datetime NOT NULL,
  `source_type` varchar(128) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT "member_subscription",
  `source_id` int(10) UNSIGNED DEFAULT NULL,
  `summary` TEXT NULL,
  PRIMARY KEY (`order_id`),
  KEY `owner_id` (`owner_id`),
  KEY `gateway_id` (`gateway_id`,`gateway_transaction_id`),
  KEY `state` (`state`),
  KEY `sourceType` (`source_type`),
  KEY `sourceType_sourceId` (`source_type`,`source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` int(10) unsigned NOT NULL auto_increment,
  `gateway_id` int(11) not NULL default '1',
  `owner_id` int(10) unsigned NOT NULL default '0',
  `sender_id` INT(11) NOT NULL default '0',
  `order_id` int(10) unsigned NOT NULL default '0',
  `subscription_id` int(11) unsigned NOT NULL default '0',
  `gateway_transaction_id` varchar(255)  NULL ,
  `state` varchar(64) CHARACTER SET latin1 COLLATE latin1_general_ci NULL,
  `type` varchar(64) CHARACTER SET latin1 COLLATE latin1_general_ci NULL,
  `id` INT(11) NOT NULL DEFAULT '0',
  `tip_id` INT(11) NOT NULL default 0,
  `package_id` INT(11) NOT NULL DEFAULT '0',
  `price` decimal(16,2) NOT NULL  default '0',
  `currency` char(3) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL default '',
  `admin_commission` decimal(16,2) NOT NULL default '0',
  `summary` TEXT NULL,
  `default_currency` VARCHAR(50) NULL,
  `change_rate` float DEFAULT '1.00',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY  (`transaction_id`),
  KEY `searchIndex` (`state`,`sender_id`,`type`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `order_id` (`order_id`),
  KEY `package_id` (`package_id`),
  KEY `gateway_transaction_id` (`gateway_transaction_id`),
  KEY `subscription_id` (`subscription_id`),
  KEY `state` (`state`),
  KEY `sender_id` (`sender_id`),
  KEY `type` (`type`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `packages`;
CREATE TABLE `packages`(
  `package_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin  NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `level_id` int(11) unsigned NOT NULL default '0',
  `downgrade_level_id`  int(11) unsigned NOT NULL default '0',
  `interval` INT(11) NOT NULL DEFAULT '0',
  `type` VARCHAR(45) NULL,
  `duration` int(11) unsigned NOT NULL DEFAULT '0',
  `duration_type` varchar(45) NULL,
  `price` decimal(16,2) NOT NULL default '0.00',
  `setup_fee` decimal(16,2) NOT NULL default '0.00',
  `is_recurring` tinyint(1) not NULL default '0',
  `enabled` tinyint(1) not NULL default '1',
  `default` tinyint(1) not NULL default '0',
  `email_notification` tinyint(1) not NULL default '1',
  `site_notification` tinyint(1) not NULL default '1',
  `alert_number` int(11) not NULL default '0',
  `alert_type` varchar(20) not NULL default 'days',
  `apple_id` VARCHAR(255) NULL,
  PRIMARY KEY (`package_id`),
  KEY `default` (`default`),
  KEY `enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE INTO `packages` (`package_id`, `title`, `description`, `level_id`, `downgrade_level_id`, `interval`, `type`, `price`, `is_recurring`, `enabled`, `default`) VALUES
(1, 'Default', 'This is a default package', 4, 4, 0, '', '0.00', 0, 1,1);


DROP TABLE IF EXISTS `video_monetizations`;
CREATE TABLE `video_monetizations`(
  `monetization_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `ad_id` int(11) unsigned NOT NULL,
  `resource_id` int(11) unsigned NOT NULL,
  `amount` varchar(255) NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`monetization_id`),
  KEY `owner_id` (`owner_id`),
  KEY `ad_id` (`ad_id`),
  KEY `resource_id` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `video_monetizations_withdrawals`;
CREATE TABLE `video_monetizations_withdrawals`(
  `withdraw_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `email` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL default '0',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 => approved, 2 => rejected,0 => underprogress',
  `currency` VARCHAR(50) NULL,
  `default_currency` VARCHAR(50) NULL,
  `change_rate` float DEFAULT '1.00',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`withdraw_id`),
  KEY `owner_id` (`owner_id`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `recently_viewed`;
CREATE TABLE `recently_viewed`(
  `view_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `ip` varchar(255) NOT NULL,
  `type` varchar(20) NOT NULL default 'user',
  `id` int(11) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`view_id`),
  UNIQUE KEY `unique` (`ip`,`id`,`owner_id`,`type`),
  KEY `owner_id` (`owner_id`),
  KEY `ip` (`ip`),
  KEY `type` (`type`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `verification_requests`;
CREATE TABLE `verification_requests`(
  `request_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NULL,
  `media` varchar(255) NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`request_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) unsigned NOT NULL auto_increment,
  `email` varchar(128) NOT NULL,
  `password` varchar(255) NOT NULL,
  `device_id` varchar(200) NULL,
  `active` tinyint(1) NOT NULL default '1',
  `level_id` int(11) NOT NULL,
  `last_active` int(11) NOT NULL default '0',
  `wallet` varchar(255) NOT NULL default '0',
  `balance` VARCHAR(255) NOT NULL DEFAULT '0',
  `monetization` TINYINT(1) NOT NULL DEFAULT '0',
  `monetization_request` TINYINT(1) NOT NULL DEFAULT '0',
  `paypal_email` varchar(255)  NULL ,
  `two_factor` tinyint(1) NOT NULL default '0',
  `phone_number` varchar(255) NOT NULL default '',
  `approve` tinyint NOT NULL default '1',
  `timezone` varchar(255) NOT NULL DEFAULT 'America/Los_Angeles',
  `points` INT(11) UNSIGNED NOT NULL DEFAULT '0',
  `affiliate_id` INT(11) UNSIGNED NOT NULL DEFAULT '0',
  `upload_content_length` INT(11) NOT NULL DEFAULT '0',
  `disable_site_notifications` tinyint NOT NULL default '0',
  `disable_email_notifications` tinyint NOT NULL default '0',
  `adult` TINYINT(1) NOT NULL DEFAULT '0',
  `streamkey` varchar(255) NULL,
  `whitelist_domain`TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uniqueemail` (`email`),
  KEY `monetization_request` (`monetization_request`),
  KEY `email` (`email`),
  KEY `streamkey` (`streamkey`),
  KEY `active` (`active`),
  KEY `approve` (`approve`),
  KEY `level_id` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `userdetails`;
CREATE TABLE `userdetails` (
  `user_id` int(11) unsigned NOT NULL auto_increment,
  `username` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `displayname` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `first_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin  NULL,
  `last_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin  NULL,
  `gender` varchar(10) NOT NULL DEFAULT '',
  `language` varchar(22) NOT NULL DEFAULT 'en',
  `country_id` int(11) unsigned NOT NULL default '0',
  `age` int(11) unsigned NOT NULL default '0',
  `verified` tinyint(1) NOT NULL default '0',
  `about` text NULL,
  `avtar` varchar(255)  default '',
  `cover` varchar(255) default '',
  `cover_crop` varchar(255) default '',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `search` tinyint(1) NOT NULL default '1',
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `follow_count` int(11) unsigned NOT NULL default '0',
  `rating` float default '0.0',
  `is_sponsored` tinyint(1) NOT NULL default '0',
  `is_featured` tinyint(1) NOT NULL default '0',
  `is_hot` tinyint(1) NOT NULL default '0',
  `offtheday` tinyint(1) NOT NULL default '0',
  `starttime` date NULL,
  `endtime` date NULL,
  `is_popular` TINYINT(1) NOT NULL DEFAULT '0',
  `ip_address` VARCHAR(45) NULL,
  `facebook`  varchar(100)  NULL,
  `instagram` varchar(100)  NULL,
  `pinterest` varchar(100)  NULL,
  `twitter` varchar(100)  NULL,
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `preferred_currency` VARCHAR(60) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uniqueusername` (`username`),
  KEY `username` (`username`),
  KEY `first_name` (`first_name`),
  KEY `last_name` (`last_name`),
  KEY `gender` (`gender`),
  KEY `country_id` (`country_id`),
  KEY `verified` (`verified`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `dislike_count` (`dislike_count`),
  KEY `is_popular` (`is_popular`),
  KEY `search` (`search`),
  KEY `favourite_count` (`favourite_count`),
  KEY `follow_count` (`follow_count`),
  KEY `rating` (`rating`),
  KEY `is_sponsored` (`is_sponsored`),
  KEY `is_hot` (`is_hot`),
  KEY `is_featured` (`is_featured`),
  KEY `offtheday` (`offtheday`),
  KEY `starttime` (`starttime`),
  KEY `endtime` (`endtime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `video_queue`;
CREATE TABLE `video_queue`(
  `queue_id` int(11) unsigned NOT NULL auto_increment,
  `video_id` int(11) unsigned NOT NULL,
  `video_res` varchar(255) NOT NULL,
  `processing` tinyint(1) NOT NULL DEFAULT "0",
  PRIMARY KEY (`queue_id`),
  KEY `processing` (`processing`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `videos`;
CREATE TABLE `videos` ( 
  `video_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(128)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `custom_url` varchar(128) NOT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `image` varchar(255) NOT NULL default '',
  `scheduled` VARCHAR(25) NULL,
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `search` tinyint(1) NOT NULL default '1',
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `type` varchar(32) NOT NULL default '1',
  `resolution` varchar(55) NULL,
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `video_location` VARCHAR(255) NULL,
  `size` varchar(255) NULL,
  `sample` tinyint(1) NOT NULL DEFAULT '0',
  `240p` tinyint(1) NOT NULL DEFAULT '0',
  `360p` tinyint(1) NOT NULL DEFAULT '0',
  `480p` tinyint(1) NOT NULL DEFAULT '0',
  `720p` tinyint(1) NOT NULL DEFAULT '0',
  `1080p` tinyint(1) NOT NULL DEFAULT '0',
  `2048p` tinyint(1) NOT NULL DEFAULT '0',
  `4096p` tinyint(1) NOT NULL DEFAULT '0',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `code` text NULL,
  `rating` float default '0.0',
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) NULL,
  `status` tinyint(1) NOT NULL default '1',
  `duration` varchar(50) NULL,
  `is_sponsored` tinyint(1) NOT NULL default '0',
  `is_featured` tinyint(1) NOT NULL default '0',
  `is_hot` tinyint(1) NOT NULL default '0',
   `offtheday` tinyint(1) NOT NULL default '0',
  `starttime` date NULL,
  `endtime` date NULL,
  `artists` longtext NULL,
  `price` VARCHAR(255) NOT NULL DEFAULT '0',
  `purchase_count` int(11) not NULL default '0',
  `total_purchase_amount` VARCHAR(255) NOT NULL DEFAULT '0',
  `approve` tinyint NOT NULL default '1',
  `adult` tinyint NOT NULL default '0',
  `completed` TINYINT(1) NOT NULL DEFAULT '0',
  `view_privacy` VARCHAR(24) NOT NULL,
  `is_livestreaming` TINYINT(1) NOT NULL DEFAULT '0',
  `agora_resource_id` TEXT NULL,
  `agora_sid` TEXT NULL,
  `channel_name` VARCHAR(255) NULL,
  `total_viewer` int(11) unsigned NOT NULL DEFAULT '0',
  `enable_chat` TINYINT(1) NOT NULL DEFAULT '0',
  `mediaserver_stream_id` varchar(255) NULL,
  `antmedia_app` VARCHAR(25) NULL default 'LiveApp',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`video_id`),
  KEY `owner_id` (`owner_id`),
  KEY `custom_url` (`custom_url`),
  KEY `purchase_count` (`purchase_count`),
  KEY `scheduled` (`scheduled`),
  KEY `category_id` (`category_id`),
  KEY `subcategory_id` (`subcategory_id`),
  KEY `subsubcategory_id` (`subsubcategory_id`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `adult` (`adult`),
  KEY `like_count` (`like_count`),
  KEY `dislike_count` (`dislike_count`),
  KEY `rating` (`rating`),
  KEY `is_locked` (`is_locked`),
  KEY `is_sponsored` (`is_sponsored`),
  KEY `is_featured` (`is_featured`),
  KEY `is_hot` (`is_hot`),
  KEY `offtheday` (`offtheday`),
  KEY `approve` (`approve`),
  KEY `search` (`search`),
  KEY `view_privacy` (`view_privacy`),
  KEY `is_livestreaming` (`is_livestreaming`),
  KEY `mediaserver_stream_id` (`mediaserver_stream_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `scheduled_videos`;
CREATE TABLE `scheduled_videos` (
  `scheduled_video_id` int(11) unsigned NOT NULL auto_increment,
  `video_id` int(11) unsigned NOT NULL,
  `owner_id` int(11) unsigned NOT NULL default '0',  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`scheduled_video_id`),
  UNIQUE KEY `unique` (`video_id`,`owner_id`),
  KEY `video_id` (`video_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `category_id` int(11) unsigned NOT NULL auto_increment,
    `subcategory_id` int(11) unsigned NOT NULL DEFAULT '0',
    `subsubcategory_id` int(11) unsigned NOT NULL DEFAULT '0',
    `title` varchar(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
    `slug` varchar(255) NULL,
    `show_movies` tinyint(1) NOT NULL DEFAULT '0',
    `show_series` tinyint(1) NOT NULL  DEFAULT '0',
    `item_count` int(11) unsigned NOT NULL default "0",
    `follow_count` int(11) unsigned NOT NULL default "0",
    `order` int(11) unsigned NOT NULL default '0',
    `image` varchar(255) NULL,
    `show_video` tinyint(1) NOT NULL default '0',
    `show_channel` tinyint(1) NOT NULL default '0',
    `show_blog` tinyint(1) NOT NULL default '0',
    `show_home` TINYINT(1) NOT NULL DEFAULT '0',
    PRIMARY KEY (`category_id`),
    KEY `subcategory_id` (`subcategory_id`),
    KEY `subsubcategory_id` (`subsubcategory_id`),
    KEY `slug` (`slug`),
    KEY `item_count` (`item_count`),
    KEY `follow_count` (`follow_count`),
    KEY `show_video` (`show_video`),
    KEY `show_channel` (`show_channel`),
    KEY `show_blog` (`show_blog`),
    KEY `show_home` (`show_home`),
    KEY `order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;


INSERT IGNORE INTO `categories` (`category_id`, `subcategory_id`, `subsubcategory_id`, `title`, `description`, `slug`, `item_count`, `follow_count`, `order`, `image`, `show_video`, `show_channel`, `show_blog`) VALUES
(3, 0, 0, 'Beauty', NULL, 'beauty', 0, 0, 1, '/upload/images/categories/videos/1577892829923_vssq7_beauty_main.jpeg', 1, 0, 0),
(4, 0, 0, 'Challenge', NULL, 'challenge', 0, 0, 2, '/upload/images/categories/videos/1577893773780_qn1lpo_challenge_main.jpeg', 1, 0, 0),
(5, 0, 0, 'Cooking', NULL, 'cooking', 0, 0, 3, '/upload/images/categories/videos/1577893765136_adjsv_cooking_main.jpeg', 1, 0, 0),
(6, 0, 0, 'Entertainment', NULL, 'entertainment', 0, 0, 4, '/upload/images/categories/videos/1577893784949_tejedk_entertainment_main.jpeg', 1, 0, 0),
(7, 0, 0, 'Film & Animation', NULL, 'film-animation', 0, 0, 5, '/upload/images/categories/videos/1577893757807_0gmgio_filmandanimation_main.jpeg', 1, 0, 0),
(8, 0, 0, 'Food', NULL, 'food', 0, 0, 6, '/upload/images/categories/videos/1577893749535_yr9xt8_food_main.jpeg', 1, 0, 0),
(9, 0, 0, 'Games', NULL, 'games', 0, 0, 7, '/upload/images/categories/videos/1577893740733_g671n_games_main.jpeg', 1, 0, 0),
(10, 0, 0, 'Health & Fitness', NULL, 'health-fitness', 0, 0, 8, '/upload/images/categories/videos/1577893732886_kh34pn_heathandfitness_main.jpeg', 1, 0, 0),
(11, 0, 0, 'Howto & Style', NULL, 'howto-style', 0, 0, 9, '/upload/images/categories/videos/1577893724548_3cgrr_howtonstyle_main.jpeg', 1, 0, 0),
(12, 0, 0, 'Parenting', NULL, 'parenting', 0, 0, 10, '/upload/images/categories/videos/1577893716264_mq3x44_parenting_main.jpeg', 1, 0, 0),
(13, 0, 0, 'Music', NULL, 'music', 0, 0, 11, '/upload/images/categories/videos/1577893708492_d4r9lz_music_main.jpeg', 1, 0, 0),
(14, 0, 0, 'News & Politics', NULL, 'news-politics', 0, 0, 12, '/upload/images/categories/videos/1577893700879_rod9lq_newsnpolitics_main.jpeg', 1, 0, 0),
(15, 0, 0, 'People & Blog', NULL, 'people-blog', 0, 0, 13, '/upload/images/categories/videos/1577893691679_vjbmo8_peoplenblog_main.jpeg', 1, 0, 0),
(16, 0, 0, 'Sports', NULL, 'sports', 0, 0, 14, '/upload/images/categories/videos/1577893681090_627oj_sports_main.jpeg', 1, 0, 0),
(17, 0, 0, 'Vehicle & Automobile', NULL, 'vehicle-automobile', 0, 0, 15, '/upload/images/categories/videos/1577893657903_eim2fj_vehiclenanimations_main.jpeg', 1, 0, 0),
(18, 0, 0, 'Photography', NULL, 'photography', 0, 0, 16, '/upload/images/categories/videos/1577893667300_rwyatt_photography_main.jpeg', 1, 0, 0),
(19, 18, 0, 'Animals', NULL, 'animals', 0, 0, 1, '/upload/images/categories/videos/1577894339099_5470u_animals_main.jpeg', 1, 0, 0),
(20, 18, 0, 'Wedding', NULL, 'wedding', 0, 0, 2, '/upload/images/categories/videos/1577894213261_l7vlli_wedding_main.jpeg', 1, 0, 0),
(21, 0, 20, 'Hindu Wedding', NULL, 'hindu-wedding', 0, 0, 1, '/upload/images/categories/videos/1577894233792_xgg4r_hinduwedding_main.jpeg', 1, 0, 0),
(22, 0, 20, 'Christian Wedding', NULL, 'christian-wedding', 0, 0, 2, '/upload/images/categories/videos/1577894225041_03k4e5y_christianwedding_main.jpeg', 1, 0, 0),
(23, 0, 0, 'Beauty', NULL, 'beauty', 0, 0, 1, '/upload/images/categories/channels/1577892829923_vssq7_beauty_main.jpeg', 0, 1, 0),
(24, 0, 0, 'Challenge', NULL, 'challenge', 0, 0, 2, '/upload/images/categories/channels/1577893773780_qn1lpo_challenge_main.jpeg', 0, 1, 0),
(25, 0, 0, 'Cooking', NULL, 'cooking', 0, 0, 3, '/upload/images/categories/channels/1577893765136_adjsv_cooking_main.jpeg', 0, 1, 0),
(26, 0, 0, 'Entertainment', NULL, 'entertainment', 0, 0, 4, '/upload/images/categories/channels/1577893784949_tejedk_entertainment_main.jpeg', 0, 1, 0),
(27, 0, 0, 'Film & Animation', NULL, 'film-animation', 0, 0, 5, '/upload/images/categories/channels/1577893757807_0gmgio_filmandanimation_main.jpeg', 0, 1, 0),
(28, 0, 0, 'Food', NULL, 'food', 0, 0, 6, '/upload/images/categories/channels/1577893749535_yr9xt8_food_main.jpeg', 0, 1, 0),
(29, 0, 0, 'Games', NULL, 'games', 0, 0, 7, '/upload/images/categories/channels/1577893740733_g671n_games_main.jpeg', 0, 1, 0),
(30, 0, 0, 'Health & Fitness', NULL, 'health-fitness', 0, 0, 8, '/upload/images/categories/channels/1577893732886_kh34pn_heathandfitness_main.jpeg', 0, 1, 0),
(31, 0, 0, 'Howto & Style', NULL, 'howto-style', 0, 0, 9, '/upload/images/categories/channels/1577893724548_3cgrr_howtonstyle_main.jpeg', 0, 1, 0),
(32, 0, 0, 'Parenting', NULL, 'parenting', 0, 0, 10, '/upload/images/categories/channels/1577893716264_mq3x44_parenting_main.jpeg', 0, 1, 0),
(33, 0, 0, 'Music', NULL, 'music', 0, 0, 11, '/upload/images/categories/channels/1577893708492_d4r9lz_music_main.jpeg', 0, 1, 0),
(34, 0, 0, 'News & Politics', NULL, 'news-politics', 0, 0, 12, '/upload/images/categories/channels/1577893700879_rod9lq_newsnpolitics_main.jpeg', 0, 1, 0),
(35, 0, 0, 'People & Blog', NULL, 'people-blog', 0, 0, 13, '/upload/images/categories/channels/1577893691679_vjbmo8_peoplenblog_main.jpeg', 0, 1, 0),
(36, 0, 0, 'Sports', NULL, 'sports', 0, 0, 14, '/upload/images/categories/channels/1577893681090_627oj_sports_main.jpeg', 0, 1, 0),
(37, 0, 0, 'Vehicle & Automobile', NULL, 'vehicle-automobile', 0, 0, 15, '/upload/images/categories/channels/1577893657903_eim2fj_vehiclenanimations_main.jpeg', 0, 1, 0),
(38, 0, 0, 'Photography', NULL, 'photography', 0, 0, 16, '/upload/images/categories/channels/1577893667300_rwyatt_photography_main.jpeg', 0, 1, 0),
(39, 38, 0, 'Animals', NULL, 'animals', 0, 0, 1, '/upload/images/categories/channels/1577894339099_5470u_animals_main.jpeg', 0, 1, 0),
(40, 38, 0, 'Wedding', NULL, 'wedding', 0, 0, 2, '/upload/images/categories/channels/1577894213261_l7vlli_wedding_main.jpeg', 0, 1, 0),
(41, 0, 40, 'Hindu Wedding', NULL, 'hindu-wedding', 0, 0, 1, '/upload/images/categories/channels/1577894233792_xgg4r_hinduwedding_main.jpeg', 0, 1, 0),
(42, 0, 40, 'Christian Wedding', NULL, 'christian-wedding', 0, 0, 2, '/upload/images/categories/channels/1577894225041_03k4e5y_christianwedding_main.jpeg', 0, 1, 0),
(55, 0, 0, 'Adventure', NULL, 'adventure', 0, 0, 17, '/upload/images/categories/blogs/1577896950822_2quaqb_advanture_main.jpeg', 0, 0, 1),
(56, 0, 0, 'Art', NULL, 'art', 0, 0, 18, '/upload/images/categories/blogs/1577896942658_28etvc_art_main.jpeg', 0, 0, 1),
(57, 0, 0, 'Business', NULL, 'business', 0, 0, 19, '/upload/images/categories/blogs/1577896934370_1wg02_business_main.jpeg', 0, 0, 1),
(58, 0, 0, 'Home Decor', NULL, 'home-decor', 0, 0, 20, '/upload/images/categories/blogs/1577896924363_m9ssrs_homedecor_main.jpeg', 0, 0, 1),
(59, 0, 0, 'Personal Finance', NULL, 'personal-finance', 0, 0, 21, '/upload/images/categories/blogs/1577897045693_n9ksqj_personalfinance_main.jpeg', 0, 0, 1),
(60, 0, 0, 'Relationships', NULL, 'relationships', 0, 0, 22, '/upload/images/categories/blogs/1577896893642_p16gd_relationship_main.jpeg', 0, 0, 1),
(61, 0, 0, 'Marketing', NULL, 'marketing', 0, 0, 23, '/upload/images/categories/blogs/1577897062377_4dlxn_marketing_main.jpeg', 0, 0, 1),
(62, 0, 0, 'DIY', NULL, 'diy', 0, 0, 24, '/upload/images/categories/blogs/1577896886612_48rpmbc_diy_main.jpeg', 0, 0, 1),
(63, 0, 0, 'Education', NULL, 'education', 0, 0, 25, '/upload/images/categories/blogs/1577896877733_lfkr6r_education_main.jpeg', 0, 0, 1),
(64, 0, 0, 'Political', NULL, 'political', 0, 0, 26, '/upload/images/categories/blogs/1577896858557_tphxdh_politics_main.jpeg', 0, 0, 1),
(65, 0, 0, 'Fashion', NULL, 'fashion', 0, 0, 27, '/upload/images/categories/blogs/1577896815139_bqeotn_fashion_main.jpeg', 0, 0, 1),
(66, 0, 0, 'Tech', NULL, 'tech', 0, 0, 28, '/upload/images/categories/blogs/1577896806082_91g9a_technical_main.jpeg', 0, 0, 1),
(67, 0, 0, 'Travel', NULL, 'travel', 0, 0, 29, '/upload/images/categories/blogs/1577896795625_bpmyv_travel_main.jpeg', 0, 0, 1),
(68, 0, 0, 'Lifestyle', NULL, 'lifestyle', 0, 0, 30, '/upload/images/categories/blogs/1577896787923_bpowtb_lifestyle_main.jpeg', 0, 0, 1),
(69, 0, 0, 'Fitness', NULL, 'fitness', 0, 0, 31, '/upload/images/categories/blogs/1577896779690_5i5v7r_fitness_main.jpeg', 0, 0, 1),
(70, 0, 0, 'Parenting', NULL, 'parenting', 0, 0, 32, '/upload/images/categories/blogs/1577896770089_q0o6z_parenting_main.jpeg', 0, 0, 1),
(71, 65, 0, 'Kids Wear', NULL, 'kids-wear', 0, 0, 1, '/upload/images/categories/blogs/1577896850620_sz5clc_kidswear_main.jpeg', 0, 0, 1),
(72, 65, 0, 'Mens Fashion', NULL, 'mens-fashion', 0, 0, 2, '/upload/images/categories/blogs/1577896823687_xerlgg_mensfashion_main.jpeg', 0, 0, 1),
(74, 0, 72, 'Casual', NULL, 'casual', 0, 0, 1, '/upload/images/categories/blogs/1577896842467_l45etp_casuals_main.jpeg', 0, 0, 1),
(75, 0, 72, 'Formals', NULL, 'formals', 0, 0, 2, '/upload/images/categories/blogs/1577896832363_g6dar_formals_main.jpeg', 0, 0, 1);


UPDATE `categories` SET `show_home` = 1 where `show_video` = 1 AND `subcategory_id` = 0 AND `subsubcategory_id` = 0;

DROP TABLE IF EXISTS `channels`;
CREATE TABLE `channels` (
  `channel_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `custom_url` varchar(255) NOT NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `image` varchar(255) NOT NULL default '',
  `cover` varchar(255) NOT NULL default '',
  `cover_crop` varchar(255) default '',
   `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `follow_count` int(11) unsigned NOT NULL default '0',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `total_playlists` INT(11) NOT NULL DEFAULT '0',
  `search` tinyint(1) NOT NULL default '1',
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `rating` float default '0.0',
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `status` tinyint(1) NOT NULL default '1',
  `total_videos` int(11) NOT NULL DEFAULT '0',
  `is_sponsored` tinyint(1) NOT NULL default '0',
  `is_featured` tinyint(1) NOT NULL default '0',
  `is_hot` tinyint(1) NOT NULL default '0',
  `offtheday` tinyint(1) NOT NULL default '0',
  `starttime` varchar(45) NULL,
  `endtime` varchar(45) NULL,
  `artists` longtext NULL,
  `verified` tinyint(1) NOT NULL default '0',
  `approve` tinyint NOT NULL default '1',
  `adult` tinyint NOT NULL default '1',
  `view_privacy` VARCHAR(24) NOT NULL,
  `channel_subscription_amount` VARCHAR(255) NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`channel_id`),
  KEY `channel_id` (`channel_id`),
  KEY `owner_id` (`owner_id`),
  KEY `adult` (`adult`),
  KEY `custom_url` (`custom_url`),
  KEY `dislike_count` (`dislike_count`),
  KEY `verified` (`verified`),
  KEY `follow_count` (`follow_count`),
  KEY `favourite_count` (`favourite_count`),
  KEY `starttime` (`starttime`),
  KEY `endtime` (`endtime`),
  KEY `total_videos` (`total_videos`),
  KEY `category_id` (`category_id`),
  KEY `subcategory_id` (`subcategory_id`),
  KEY `subsubcategory_id` (`subsubcategory_id`),
  KEY `view_count` (`view_count`),
  KEY  `total_playlists` (`total_playlists`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `rating` (`rating`),
  KEY `is_locked` (`is_locked`),
  KEY `is_sponsored` (`is_sponsored`),
  KEY `is_featured` (`is_featured`),
  KEY `is_hot` (`is_hot`),
  KEY `offtheday` (`offtheday`),
  KEY `approve` (`approve`),
  KEY `search` (`search`),
  KEY `view_privacy` (`view_privacy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `channelvideos`;
CREATE TABLE `channelvideos` (
  `channelvideo_id` int(11) unsigned NOT NULL auto_increment,
  `channel_id` int(11) unsigned NOT NULL default '0',
  `video_id` int(11) unsigned NOT NULL default '0',
  `owner_id` int(11) unsigned NOT NULL default '0',  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`channelvideo_id`),
  UNIQUE KEY `unique` (`channel_id`,`video_id`),
   KEY `searchIndex` (`channel_id`,`video_id`),
  KEY `channel_id` (`channel_id`),
  KEY `video_id` (`video_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `channelplaylists`;
CREATE TABLE `channelplaylists` (
  `channelplaylist_id` int(11) unsigned NOT NULL auto_increment,
  `channel_id` int(11) unsigned NOT NULL default '0',
  `playlist_id` int(11) unsigned NOT NULL default '0',
  `owner_id` int(11) unsigned NOT NULL default '0',  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`channelplaylist_id`),
  UNIQUE KEY `unique` (`channel_id`,`playlist_id`),
   KEY `searchIndex` (`channel_id`,`playlist_id`),
  KEY `channel_id` (`channel_id`),
  KEY `playlist_id` (`playlist_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `playlists`;
CREATE TABLE `playlists` (
  `playlist_id` int(11) unsigned NOT NULL auto_increment,
  `custom_url` varchar(128) NOT NULL,
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `image` varchar(255) NOT NULL default '',
  `follow_count` int(11) NOT NULL default '0',
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `private` tinyint(1) NOT NULL default '0',
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `total_videos` INT(11) NOT NULL DEFAULT '0',
  `is_sponsored` tinyint(1) NOT NULL default '0',
  `is_featured` tinyint(1) NOT NULL default '0',
  `is_hot` tinyint(1) NOT NULL default '0',
  `rating` float default '0.0',
  `offtheday` tinyint(1) NOT NULL default '0',
  `starttime` varchar(45) NULL,
  `endtime` varchar(45) NULL,
  `search` tinyint(1) NOT NULL DEFAULT '1',
  `approve` tinyint NOT NULL default '1',
  `adult` tinyint NOT NULL default '1',
  `view_privacy` VARCHAR(255) NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`playlist_id`),
  KEY `playlist_id` (`playlist_id`),
  KEY `custom_url` (`custom_url`),
  KEY `owner_id` (`owner_id`),
  KEY `adult` (`adult`),
  KEY `dislike_count` (`dislike_count`),
  KEY `follow_count` (`follow_count`),
  KEY `favourite_count` (`favourite_count`),
  KEY `starttime` (`starttime`),
  KEY `endtime` (`endtime`),
  KEY `total_videos` (`total_videos`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `is_sponsored` (`is_sponsored`),
  KEY `is_featured` (`is_featured`),
  KEY `is_hot` (`is_hot`),
  KEY `search` (`search`),
  KEY `offtheday` (`offtheday`),
  KEY `approve` (`approve`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `playlistvideos`;
CREATE TABLE `playlistvideos` (
  `playlistvideo_id` int(11) unsigned NOT NULL auto_increment,
  `playlist_id` int(11) unsigned NOT NULL default '0',
  `video_id` int(11) unsigned NOT NULL default '0',
  `owner_id` int(11) unsigned NOT NULL default '0',  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`playlistvideo_id`),
  UNIQUE KEY `unique` (`playlist_id`,`video_id`),
   KEY `searchIndex` (`playlist_id`,`video_id`),
  KEY `playlist_id` (`playlist_id`),
  KEY `video_id` (`video_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci ;

DROP TABLE IF EXISTS `blogs`;
CREATE TABLE `blogs` (
  `blog_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `custom_url` varchar (255) NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `image` varchar(255) NOT NULL default '',
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `rating` float default '0.0',
  `is_sponsored` tinyint(1) NOT NULL default '0',
  `is_featured` tinyint(1) NOT NULL default '0',
  `is_hot` tinyint(1) NOT NULL default '0',
  `offtheday` tinyint(1) NOT NULL default '0',
  `starttime` varchar(45) NULL,
  `endtime` varchar(45) NULL,
  `approve` tinyint NOT NULL default '1',
  `adult` tinyint NOT NULL default '1',
  `draft` tinyint(1) NOT NULL default '0',
  `search` tinyint(1) NOT NULL default '1',
  `publish_time` datetime NOT NULL,
  `view_privacy` varchar(45) NOT NULL default '',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`blog_id`),
  KEY `blog_id` (`blog_id`),
  KEY `owner_id` (`owner_id`),
  KEY `custom_url` (`custom_url`),
  KEY `adult` (`adult`),
  KEY `draft` (`draft`),
  KEY `publish_time` (`publish_time`),
  KEY `dislike_count` (`dislike_count`),
  KEY `favourite_count` (`favourite_count`),
  KEY `starttime` (`starttime`),
  KEY `search` (`search`),
  KEY `endtime` (`endtime`),
  KEY `category_id` (`category_id`),
  KEY `subcategory_id` (`subcategory_id`),
  KEY `subsubcategory_id` (`subsubcategory_id`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `is_sponsored` (`is_sponsored`),
  KEY `is_featured` (`is_featured`),
  KEY `is_hot` (`is_hot`),
  KEY `offtheday` (`offtheday`),
  KEY `approve` (`approve`),
  KEY `view_privacy` (`view_privacy`),
  KEY `rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `followers`;
CREATE TABLE `followers` (
  `follower_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(45) NOT NULL default 'channel',
  `id` int(11) unsigned NOT NULL,
  `owner_id` int(11) unsigned NOT NULL default '0',  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`follower_id`),
  UNIQUE KEY `unique` (`type`,`id`,`owner_id`),
   KEY `searchIndex` (`type`,`id`,`owner_id`),
  KEY `type` (`type`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `favourites`;
CREATE TABLE `favourites` (
  `favourite_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(45) NOT NULL default 'channel',
  `id` int(11) unsigned NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`favourite_id`),
  UNIQUE KEY `unique` (`type`,`id`,`owner_id`),
  KEY `searchIndex` (`type`,`id`,`owner_id`),
  KEY `type` (`type`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `watchlaters`;
CREATE TABLE `watchlaters` (
  `watchlater_id` int(11) unsigned NOT NULL auto_increment,
  `id` int(11) unsigned NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,  
  `type` VARCHAR(40) NOT NULL DEFAULT 'video',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`watchlater_id`),
  UNIQUE KEY `unique` (`id`,`owner_id`,`type`),
  KEY `searchIndex` (`id`,`owner_id`,`type`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `ratings`;
CREATE TABLE `ratings` (
  `rating_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(45) NOT NULL default 'user',
  `id` int(11) unsigned NOT NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `rating` tinyint(1) NOT NULL default '5',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `unique` (`type`,`id`,`owner_id`),
  KEY `searchIndex` (`type`,`id`,`owner_id`),
  KEY `type` (`type`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes`(
  `like_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(45) NOT NULL default 'user',
  `id` int(11) unsigned NOT NULL,
  `like_dislike` varchar(45) NOT NULL default 'like',
  `owner_id` int(11) unsigned NOT NULL,  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique` (`type`,`id`,`owner_id`),
  KEY `type` (`type`),
  KEY `searchIndex` (`type`,`id`,`owner_id`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`(
  `comment_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(45) NOT NULL default 'user',
  `id` varchar(255) NOT NULL,
  `custom_url` VARCHAR(255) NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `pinned` tinyint(1) NOT NULL default '0',
  `parent_id` int(11) NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',
  `reply_count` INT(11) NOT NULL DEFAULT '0',
  `owner_id` int(11) unsigned NOT NULL default '0',
  `approved` TINYINT(1) NOT NULL DEFAULT '1',
  `replies_approved` INT(11) NOT NULL DEFAULT '0',
  `image` VARCHAR(255) NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `approved` (`approved`),
  KEY `parent_id` (`parent_id`),
  KEY `type` (`type`),
  KEY `id` (`id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `levels`;
CREATE TABLE `levels`(
  `level_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `type` enum('public', 'user', 'moderator', 'admin') default 'user',
  `flag` enum('default', 'superadmin', 'public') NULL,  
  PRIMARY KEY (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `levels` (`level_id`, `title`, `description`, `type`, `flag`) VALUES
(1, 'Admin', 'Users of this level can modify all of your settings and data.', 'admin', 'superadmin'),
(3, 'Moderators', 'Users of this level may edit user-side content.', 'moderator', NULL),
(4, 'Default', 'This is the default user level.  New users are assigned to it automatically.', 'user', 'default'),
(5, 'Public', 'Settings for this level apply to users who have not logged in.', 'public', 'public');

DROP TABLE IF EXISTS `level_permissions`;
CREATE TABLE `level_permissions`(
  `level_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` text NULL, 
  PRIMARY KEY (`level_id`,`type`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `level_permissions` (`level_id`, `type`, `name`, `value`) VALUES
(1, 'blog', 'auto_approve', '1'),
(1, 'blog', 'create', '1'),
(1, 'blog', 'delete', '2'),
(1, 'blog', 'edit', '2'),
(1, 'blog', 'level_id', '1'),
(1, 'blog', 'quota', '0'),
(1, 'blog', 'view', '2'),
(1, 'channel', 'auto_approve', '1'),
(1, 'channel', 'create', '1'),
(1, 'channel', 'delete', '2'),
(1, 'channel', 'edit', '2'),
(1, 'channel', 'featured', '0'),
(1, 'channel', 'hot', '0'),
(1, 'channel', 'level_id', '1'),
(1, 'channel', 'quota', '0'),
(1, 'channel', 'sponsored', '0'),
(1, 'channel', 'verified', '0'),
(1, 'channel', 'view', '2'),
(1, 'livestreaming', 'create', '1'),
(1, 'livestreaming', 'duration', '10'),
(1, 'livestreaming', 'level_id', '1'),
(1, 'livestreaming', 'quota', '0'),
(1, 'member', 'addsapprove', '1'),
(1, 'member', 'ads', '1'),
(1, 'member', 'adsquota', '0'),
(1, 'member', 'coverphoto_upload', '1'),
(1, 'member', 'default_coverphoto', '/resources/1584104330651_ingpr_defaultCover.jpg'),
(1, 'member', 'default_femalemainphoto', '/resources/1584104335798_3zgmrl_defaultFemale.jpg'),
(1, 'member', 'default_mainphoto', '/resources/1584104347443_dwmh1_defaultMale.png'),
(1, 'member', 'delete', '2'),
(1, 'member', 'deleteads', '2'),
(1, 'member', 'edit', '2'),
(1, 'member', 'editads', '2'),
(1, 'member', 'is_featured', '1'),
(1, 'member', 'is_hot', '1'),
(1, 'member', 'is_sponsored', '1'),
(1, 'member', 'level_id', '1'),
(1, 'member', 'monetization', '1'),
(1, 'member', 'monetization_threshold_amount', '50'),
(1, 'member', 'username', '1'),
(1, 'playlist', 'auto_approve', '1'),
(1, 'playlist', 'create', '1'),
(1, 'playlist', 'delete', '2'),
(1, 'playlist', 'edit', '2'),
(1, 'playlist', 'level_id', '1'),
(1, 'playlist', 'quota', '0'),
(1, 'playlist', 'view', '2'),
(1, 'video', 'auto_approve', '1'),
(1, 'video', 'create', '1'),
(1, 'video', 'delete', '2'),
(1, 'video', 'donation', '1'),
(1, 'video', 'edit', '2'),
(1, 'video', 'featured', '0'),
(1, 'video', 'hot', '0'),
(1, 'video', 'level_id', '1'),
(1, 'video', 'quota', '0'),
(1, 'video', 'sell_videos', '1'),
(1, 'video', 'sponsored', '0'),
(1, 'video', 'storage', '0'),
(1, 'video', 'view', '2'),
(1, 'video', 'watermark', ''),
(1, 'video', 'watermark_label', ''),
(3, 'blog', 'auto_approve', '1'),
(3, 'blog', 'create', '1'),
(3, 'blog', 'delete', '2'),
(3, 'blog', 'edit', '2'),
(3, 'blog', 'level_id', '3'),
(3, 'blog', 'quota', '0'),
(3, 'blog', 'view', '2'),
(3, 'channel', 'auto_approve', '1'),
(3, 'channel', 'create', '1'),
(3, 'channel', 'delete', '2'),
(3, 'channel', 'edit', '2'),
(3, 'channel', 'featured', '0'),
(3, 'channel', 'hot', '0'),
(3, 'channel', 'level_id', '3'),
(3, 'channel', 'quota', '0'),
(3, 'channel', 'sponsored', '0'),
(3, 'channel', 'verified', '0'),
(3, 'channel', 'view', '2'),
(3, 'livestreaming', 'create', '1'),
(3, 'livestreaming', 'duration', '10'),
(3, 'livestreaming', 'level_id', '3'),
(3, 'livestreaming', 'quota', '0'),
(3, 'member', 'addsapprove', '1'),
(3, 'member', 'ads', '1'),
(3, 'member', 'adsquota', '0'),
(3, 'member', 'coverphoto_upload', '1'),
(3, 'member', 'default_coverphoto', '/resources/1584104330651_ingpr_defaultCover.jpg'),
(3, 'member', 'default_femalemainphoto', '/resources/1584104335798_3zgmrl_defaultFemale.jpg'),
(3, 'member', 'default_mainphoto', '/resources/1584104347443_dwmh1_defaultMale.png'),
(3, 'member', 'delete', '2'),
(3, 'member', 'deleteads', '2'),
(3, 'member', 'edit', '2'),
(3, 'member', 'editads', '2'),
(3, 'member', 'is_featured', '0'),
(3, 'member', 'is_hot', '0'),
(3, 'member', 'is_sponsored', '0'),
(3, 'member', 'level_id', '3'),
(3, 'member', 'monetization', '1'),
(3, 'member', 'monetization_threshold_amount', '50'),
(3, 'member', 'username', '1'),
(3, 'playlist', 'auto_approve', '1'),
(3, 'playlist', 'create', '1'),
(3, 'playlist', 'delete', '2'),
(3, 'playlist', 'edit', '2'),
(3, 'playlist', 'level_id', '3'),
(3, 'playlist', 'quota', '0'),
(3, 'playlist', 'view', '2'),
(3, 'video', 'auto_approve', '1'),
(3, 'video', 'create', '1'),
(3, 'video', 'delete', '2'),
(3, 'video', 'donation', '1'),
(3, 'video', 'edit', '2'),
(3, 'video', 'featured', '0'),
(3, 'video', 'hot', '0'),
(3, 'video', 'level_id', '3'),
(3, 'video', 'quota', '0'),
(3, 'video', 'sell_videos', '1'),
(3, 'video', 'sponsored', '0'),
(3, 'video', 'storage', '0'),
(3, 'video', 'view', '2'),
(3, 'video', 'watermark', ''),
(3, 'video', 'watermark_label', ''),
(4, 'blog', 'auto_approve', '1'),
(4, 'blog', 'create', '1'),
(4, 'blog', 'delete', '1'),
(4, 'blog', 'edit', '1'),
(4, 'blog', 'level_id', '4'),
(4, 'blog', 'quota', '0'),
(4, 'blog', 'view', '1'),
(4, 'channel', 'auto_approve', '1'),
(4, 'channel', 'create', '1'),
(4, 'channel', 'delete', '1'),
(4, 'channel', 'edit', '1'),
(4, 'channel', 'featured', '0'),
(4, 'channel', 'hot', '0'),
(4, 'channel', 'level_id', '4'),
(4, 'channel', 'quota', '0'),
(4, 'channel', 'sponsored', '0'),
(4, 'channel', 'verified', '0'),
(4, 'channel', 'view', '1'),
(4, 'livestreaming', 'create', '1'),
(4, 'livestreaming', 'duration', '10'),
(4, 'livestreaming', 'level_id', '4'),
(4, 'livestreaming', 'quota', '0'),
(4, 'member', 'addsapprove', '1'),
(4, 'member', 'ads', '1'),
(4, 'member', 'adsquota', '5'),
(4, 'member', 'coverphoto_upload', '1'),
(4, 'member', 'default_coverphoto', '/resources/1584104330651_ingpr_defaultCover.jpg'),
(4, 'member', 'default_femalemainphoto', '/resources/1584104335798_3zgmrl_defaultFemale.jpg'),
(4, 'member', 'default_mainphoto', '/resources/1584104347443_dwmh1_defaultMale.png'),
(4, 'member', 'delete', '1'),
(4, 'member', 'deleteads', '1'),
(4, 'member', 'edit', '1'),
(4, 'member', 'editads', '1'),
(4, 'member', 'is_featured', '0'),
(4, 'member', 'is_hot', '0'),
(4, 'member', 'is_sponsored', '0'),
(4, 'member', 'level_id', '4'),
(4, 'member', 'monetization', '1'),
(4, 'member', 'monetization_threshold_amount', '50'),
(4, 'member', 'username', '0'),
(4, 'playlist', 'auto_approve', '1'),
(4, 'playlist', 'create', '1'),
(4, 'playlist', 'delete', '1'),
(4, 'playlist', 'edit', '1'),
(4, 'playlist', 'level_id', '4'),
(4, 'playlist', 'quota', '0'),
(4, 'playlist', 'view', '1'),
(4, 'video', 'auto_approve', '1'),
(4, 'video', 'create', '1'),
(4, 'video', 'delete', '1'),
(4, 'video', 'donation', '1'),
(4, 'video', 'edit', '1'),
(4, 'video', 'featured', '0'),
(4, 'video', 'hot', '0'),
(4, 'video', 'level_id', '4'),
(4, 'video', 'quota', '0'),
(4, 'video', 'sell_videos', '1'),
(4, 'video', 'sponsored', '0'),
(4, 'video', 'storage', '0'),
(4, 'video', 'view', '1'),
(4, 'video', 'watermark', ''),
(4, 'video', 'watermark_label', ''),
(5, 'blog', 'level_id', '5'),
(5, 'blog', 'view', '1'),
(5, 'channel', 'level_id', '5'),
(5, 'channel', 'view', '1'),
(5, 'playlist', 'level_id', '5'),
(5, 'playlist', 'view', '1'),
(5, 'video', 'level_id', '5'),
(5, 'video', 'view', '1');

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`(
  `name` varchar(255) NOT NULL,
  `value` text NULL, 
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `settings` (`name`, `value`) VALUES
  ("logo_type",'0'),
  ("openai_api_key",''),
  ("openai_model",'gpt-3.5-turbo'),
  ("openai_image_system",'1'),
  ("openai_blog_system",'1'),
  ("openai_blog_price",'0.5'),
  ("openai_description_system",'1'),
  ("openai_image_price",'0.2'),
  ("openai_blog_description_count",'10000'),
  ("openai_description_price",'0.1'),
  ("enable_reels",'1'),
  ("reel_comment",'1'),
  ("reel_comment_like",'1'),
  ("reel_comment_dislike",'1'),
  ("reel_video_upload",'10'),
  ("reel_like",'1'),
  ("reel_dislike",'1'),
  ("story_like",'1'),
  ("story_dislike",'1'),
("enable_stories",'1'),
("stories_audio_image",'1'),
("stories_video_image",'1'),
("stories_duration",'1'),
("stories_delay",'10'),
("stories_video_upload",'10'),
("stories_audio_upload",'5'),
("movie_player_type",'element'),
("movie_process_type",'1'),
("file_cache",'11293871928'),
("antserver_media_app",'LiveApp'),
('enable_movie', '1'),
('cast_crew_member', '1'),
('cast_crew_member_comment', '1'),
('cast_crew_member_comment_dislike', '1'),
('cast_crew_member_comment_like', '1'),
('cast_crew_member_dislike', '1'),
('cast_crew_member_favourite', '1'),
('cast_crew_member_like', '1'),
('cast_crew_member_rating', '1'),
('episode_default_photo', '/resources/1607062990688_78ug9n_episodes.jpg'),
('cast_crew_default_photo', '/resources/1607062990688_78ug9n_episodes.jpg'),
('movie_adult', '1'),
('movie_category_default_photo', '/resources/1607062995120_5c5v1p_movies.jpg'),
('movie_comment', '1'),
('movie_comment_dislike', '1'),
('movie_comment_like', '1'),
('movie_commission_rent_type', '1'),
('movie_commission_rent_value', '0'),
('movie_commission_type', '1'),
('movie_commission_value', '0'),
('movie_conversion_type', 'ultrafast'),
('movie_conversion_type_label', ''),
('movie_default_photo', '/resources/1607062995120_5c5v1p_movies.jpg'),
('movie_dislike', '1'),
('movie_favourite', '1'),
('movie_featured', '1'),
('movie_hot', '1'),
('movie_like', '1'),
('movie_rating', '1'),
('movie_rent', '1'),
('movie_sell', '1'),
('movie_sponsored', '1'),
('movie_upload_limit', '0'),
('movie_upload_movies_type', '360,480,720'),
('movie_watchlater', '1'),
('seasons_default_photo', '/resources/1607062990688_78ug9n_episodes.jpg'),
('default_member_plan','/resources/128937918273923_userPlan.png'),
("member_cancel_user_subscription","1"),
('points_value','0'),
('signup_referrals','0'),
('referrals_points_value','0'),
('payment_bank_method_description1','Account Name:
Account Number:
Bank Name:
Branch Address of Bank:
IFSC Code:'),
('payment_bank_method_note','Upload your bank transfer receipt so we will verify and confirm your order.'),
('video_tip','1'),
('enable_audio','1'),
('audio_favourite','1'),
('audio_like','1'),
('audio_dislike','1'),
('audio_comment','1'),
('audio_comment_like','1'),
('audio_comment_dislike','1'),
('video_embed_code','1'),
('member_default_timezone','America/Los_Angeles'),
('fixed_header',1),
('enable_comment_approve', '0'), 
('autoapproveverified_user_comment', '1'),
('signup_form_lastname', '1') , 
('signup_form_username', '1') ,
('signup_form_gender', '1') ,
('signup_form_image', '1'),
('video_upload_videos_type','360,720'),
('admin_signup_email', '0'),
('ads_cost_perclick', '0.2'),
('ads_cost_perview', '0.1'),
('ads_cost_publisher', '0.1'),
('artists_browse_dislike', '1'),
('artists_browse_favourite', '1'),
('artists_browse_like', '1'),
('artists_browse_rating', '1'),
('artists_browse_share', '1'),
('artists_browse_views', '1'),
('autoapprove_monetization', '1'),
('blog_adult', '1'),
('blog_category_default_photo', ''),
('blog_comment', '1'),
('blog_comment_dislike', '1'),
('blog_comment_like', '1'),
('blog_default_photo', '/resources/1584104344179_lasxrh_defaultBlog.png'),
('blog_dislike', '1'),
('blog_favourite', '1'),
('blog_featured', '1'),
('blog_hot', '1'),
('blog_like', '1'),
('blog_rating', '1'),
('blog_sponsored', '1'),
('blogs_browse_datetime', '1'),
('blogs_browse_description', '1'),
('blogs_browse_dislike', '1'),
('blogs_browse_favourite', '1'),
('blogs_browse_featuredlabel', '1'),
('blogs_browse_hotLabel', '1'),
('blogs_browse_like', '1'),
('blogs_browse_rating', '1'),
('blogs_browse_share', '1'),
('blogs_browse_sponsoredLabel', '1'),
('blogs_browse_tags', '1'),
('blogs_browse_username', '1'),
('blogs_browse_views', '1'),
('censored_words', ''),
('channel_adult', '1'),
('channel_artist_comment', '1'),
('channel_artist_comment_dislike', '1'),
('channel_artist_comment_like', '1'),
('channel_artist_dislike', '1'),
('channel_artist_favourite', '1'),
('channel_artist_like', '1'),
('channel_artist_rating', '1'),
('channel_artists', '1'),
('channel_category_default_photo', ''),
('channel_comment', '1'),
('channel_comment_dislike', '1'),
('channel_comment_like', '1'),
('channel_default_cover_photo', '/resources/1584104330651_ingpr_defaultCover.jpg'),
('channel_default_photo', '/resources/1584179156623_4sn3ah_defaultChannel.jpg'),
('channel_dislike', '1'),
('channel_favourite', '1'),
('channel_featured', '1'),
('channel_hot', '1'),
('channel_like', '1'),
('channel_rating', '1'),
('channel_sponsored', '1'),
('channel_verified', '1'),
('channels_browse_dislike', '1'),
('channels_browse_favourite', '1'),
('channels_browse_featuredlabel', '1'),
('channels_browse_hotLabel', '1'),
('channels_browse_like', '1'),
('channels_browse_rating', '1'),
('channels_browse_share', '1'),
('channels_browse_sponsoredLabel', '1'),
('channels_browse_subscribe', '1'),
('channels_browse_subscribecount', '1'),
('channels_browse_videoscount', '1'),
('channels_browse_views', '1'),
('contact_address', ''),
('contact_email', ''),
('contact_email_from', 'admin@site.com'),
('contact_facebook_url', ''),
('contact_fax', ''),
('contact_from_address', 'admin@site.com'),
('contact_from_name', 'Site Admin'),
('contact_linkedin_url', ''),
('contact_map', ''),
('contact_phone', ''),
('contact_pinterest_url', ''),
('contact_twitter_url', ''),
('contact_whatsapp_url', ''),
('darktheme_logo', '/resources/1589822882043_yv14f_logo.png'),
('default_notification_image', ''),
('email_logo', '/resources/1588527251997_4nvba9_logo.png'),
('email_smtp_host', '127.0.0.1'),
('email_smtp_port', '25'),
('email_smtp_type', '1'),
('email_smtp_username', ''),
('email_type', 'gmail'),
('enable_ads', '1'),
('enable_blog', '1'),
('enable_channel', '1'),
('enable_facebook_import', '0'),
('enable_iframely', '0'),
('enable_monetization', '1'),
('enable_newsletter', '2'),
('enable_playlist', '1'),
('enable_twitch_import', '0'),
('enable_youtube_import', '1'),
('facebook_client_id', ''),
('facebook_client_secret', ''),
('favicon', '/resources/1589822887203_1in3m6_favicon.png'),
('gmail_xauth_clientid', ''),
('gmail_xauth_clientsecret', ''),
('gmail_xauth_email', ''),
('gmail_xauth_refreshtoken', ''),
('google_analytics_code', ''),
('iframely_api_key', ''),
('iframely_disallow_sources', ''),
('lightheme_logo', '/resources/1589822882043_yv14f_logo.png'),
('mailchimp_apikey', ''),
('mailchimp_listId', ''),
('maintanance', '0'),
('maintanance_code', 'yd0zh'),
('member_comment', '1'),
('member_comment_dislike', '1'),
('member_comment_like', '1'),
('member_delete_account', '1'),
('member_dislike', '1'),
('member_email_verification', '0'),
('member_favourite', '1'),
('member_featured', '1'),
('member_hot', '1'),
('member_like', '1'),
('member_rating', '1'),
('member_registeration', '1'),
('member_sponsored', '1'),
('member_verification', '1'),
('newsletter_background_image', ''),
('payment_client_id', ''),
('payment_client_secret', ''),
('payment_default_currency', 'USD'),
('payment_paypal_sanbox', '0'),
('playlist_adult', '1'),
('playlist_comment', '1'),
('playlist_comment_dislike', '1'),
('playlist_comment_like', '1'),
('playlist_default_photo', '/resources/1584104341548_l3rnkl_defaultPlaylist.jpg'),
('playlist_dislike', '1'),
('playlist_favourite', '1'),
('playlist_featured', '1'),
('playlist_hot', '1'),
('playlist_like', '1'),
('playlist_rating', '1'),
('playlist_sponsored', '1'),
('playlists_browse_datetime', '1'),
('playlists_browse_dislike', '1'),
('playlists_browse_favourite', '1'),
('playlists_browse_featuredlabel', '1'),
('playlists_browse_hotLabel', '1'),
('playlists_browse_like', '1'),
('playlists_browse_rating', '1'),
('playlists_browse_share', '1'),
('playlists_browse_sponsoredLabel', '1'),
('playlists_browse_username', '1'),
('playlists_browse_videoscount', '1'),
('playlists_browse_views', '1'),
('s3_access_key', ''),
('s3_bucket', ''),
('s3_region', 'us-east-1'),
('s3_secret_access_key', ''),
('site_title', 'PlayTubeVideo'),
('social_login_fb', '0'),
('social_login_google', '0'),
('social_login_twitter', '0'),
('theme_design_mode', '3'),
('tinymceKey', ''),
('twitch_api_key', ''),
('upload_system', '0'),
('user_follow', '1'),
('users_dislike', '1'),
('users_favourite', '1'),
('users_featuredlabel', '1'),
('users_follow', '1'),
('users_hotLabel', '1'),
('users_like', '1'),
('users_rating', '1'),
('users_share', '1'),
('users_sponsoredLabel', '1'),
('users_views', '1'),
('video_adult', '1'),
('video_artist_comment', '1'),
('video_artist_comment_dislike', '1'),
('video_artist_comment_like', '1'),
('video_artist_dislike', '1'),
('video_artist_favourite', '1'),
('video_artist_like', '1'),
('video_artist_rating', '1'),
('video_artists', '1'),
('video_autoplay', '1'),
('video_category_default_photo', ''),
('video_comment', '1'),
('video_comment_dislike', '1'),
('video_comment_like', '1'),
('video_commission_type', '1'),
('video_commission_value', '0'),
('video_createpage', ''),
('video_default_photo', '/resources/1584104338796_71wcqm_defaultVideo.png'),
('video_dislike', '1'),
('video_donation', '1'),
('video_favourite', '1'),
('video_featured', '1'),
('video_ffmpeg_path', ''),
('video_hot', '1'),
('video_like', '1'),
('video_miniplayer', '1'),
('video_preview', '1'),
('video_rating', '1'),
('video_sell', '1'),
('video_sponsored', '1'),
('video_upload', '0'),
('video_upload_limit', '0'),
('video_watchlater', '1'),
('videos_datetime', '1'),
('videos_dislike', '1'),
('videos_favourite', '1'),
('videos_featuredlabel', '1'),
('videos_hotLabel', '1'),
('videos_like', '1'),
('videos_playlist', '1'),
('videos_rating', '1'),
('videos_share', '1'),
('videos_sponsoredLabel', '1'),
('videos_username', '1'),
('videos_views', '1'),
('videos_watchlater', '1'),
('welcome_email', '0'),
('youtube_api_key', 'AIzaSyDPMpz1x5vQyrumKFwp2a4OdK32c9KCQkE');


DROP TABLE IF EXISTS `emails`;
CREATE TABLE `emails`(
  `email_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(100) NOT NULL,
  `tokens` varchar(255) NULL,
  `language` varchar(40) NOT NULL default 'en',
  `body` text NOT NULL,
  PRIMARY KEY (`email_id`),
  UNIQUE KEY `unique` (`type`,`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `reportmessages`;
CREATE TABLE `reportmessages`(
  `reportmessage_id` int(11) unsigned NOT NULL auto_increment,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `delete` TINYINT (1) NOT NULL DEFAULT "1",
  PRIMARY KEY (`reportmessage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `reportmessages` (`reportmessage_id`, `description`, `delete`) VALUES
(1, 'Sexual content', 1),
(2, 'Violent or repulsive content', 1),
(3, 'Hateful or abusive content', 1),
(4, 'Harmful dangerous acts', 1),
(5, 'Child abuse', 1),
(6, 'Promotes terrorism', 1),
(7, 'Spam or misleading', 1),
(8, 'Infringes my rights', 1),
(9, 'Other', 0);

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports`(
  `report_id` int(11) unsigned NOT NULL auto_increment,
  `reportmessage_id` int(11) unsigned NOT NULL,
  `owner_id` int(11),
  `type` varchar(60) NOT NULL,
  `id` varchar(255) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`report_id`),
  KEY `type_id` (`type`,`id`),
  KEY `creation_date` (`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `advertisements_admin`;
CREATE TABLE `advertisements_admin`(
  `ad_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `click_link` varchar(255) NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `tags` text NULL,
  `adult` TINYINT(1) NULL,
  `link` TEXT NULL,
  `skip` int(5) NOT NULL DEFAULT '5',
  `type` tinyint(1) NOT NULL DEFAULT '1',
  `view_count` int(11) unsigned NOT NULL default '0',
  `click_count` int(11) unsigned NOT NULL default '0',
  `active`  tinyint(1)  NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`ad_id`),
  KEY `type` (`type`),
  KEY `active` (`active`),
  KEY `creation_date` (`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `advertisements_user`;
CREATE TABLE `advertisements_user`(
  `ad_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin  NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `age` int(11) NOT NULL DEFAULT '0',
  `spent` varchar(60)  NULL,
  `status` tinyint(1) NOT NULL default '1',
  `audience` text NULL,
  `media` varchar(255)  NULL,
  `url` varchar(255) NULL,
  `placement` tinyint(1) NOT NULL default '1' COMMENT '1 => video player, 2 => side bar',
  `type` tinyint(1) NOT NULL default '1' COMMENT '1 => per click, 2 => per view/immpression',
  `completed` TINYINT(1) NOT NULL DEFAULT '2',
  `approve` TINYINT(1) NOT NULL DEFAULT '1',
  `adult` TINYINT(1) NULL,
  `results` INT(11) NOT NULL DEFAULT '0',
  `view_count` int(11) unsigned NOT NULL default '0',
  `click_count` int(11) unsigned NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`ad_id`),
  KEY `age` (`age`),
  KEY `adult` (`adult`),
  KEY `approve` (`approve`),
  KEY `owner_id` (`owner_id`),
  KEY `status` (`status`),
  KEY `placement` (`placement`),
  KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `advertisements_transations`;
CREATE TABLE `advertisements_transations`(
  `transaction_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `ad_id` int(11) unsigned NOT NULL,
  `amount` varchar(255) NOT NULL DEFAULT "0",
  `type` varchar(15) NOT NULL DEFAULT "click",
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `amount` (`amount`),
  KEY `ad_id` (`ad_id`),
  KEY `type` (`type`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;



DROP TABLE IF EXISTS `themes`;
CREATE TABLE `themes`(
  `theme_id` int(11) unsigned NOT NULL auto_increment,
  `key` varchar(255) NOT  NULL, 
  `value` varchar(255) NOT NULL DEFAULT '0',
  `type` varchar(20) NOT  NULL, 
  PRIMARY KEY (`theme_id`),
  KEY `key` (`key`),
  UNIQUE KEY `unique` (`type`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `themes` (`theme_id`, `key`, `value`, `type`) VALUES
(1, 'Bgcolor_default', '#F5F5F5', 'white'),
(2, 'Bgcolor_primary', '#FF1744', 'white'),
(3, 'Bgcolor_secondry', '#000000', 'white'),
(4, 'Bgcolor_tertiary', '#F1F1F1', 'white'),
(5, 'Border_color', '#CCCCCC', 'white'),
(6, 'Textcolor_default', '#000000', 'white'),
(7, 'Textcolor_primary', '#FF1744', 'white'),
(8, 'Textcolor_secondry', '#000000', 'white'),
(9, 'Textcolor_tertiary', '#D4D3D3', 'white'),
(10, 'font_style', 'web', 'white'),
(11, 'fontFamily_default', '\'Roboto\', sans-serif', 'white'),
(12, 'fontFamily_heading', '\'Roboto\', sans-serif', 'white'),
(13, 'fontSize_default', '16px', 'white'),
(14, 'menu_FontSize', '16px', 'white'),
(15, 'MenuDropDown_Bg', '#FFFFFF', 'white'),
(16, 'username_varify_color', '#2296F3', 'white'),
(17, 'lableHot_bg', '#FF1744', 'white'),
(18, 'lableFeatured_bg', '#2296F3', 'white'),
(19, 'lableSponsored_bg', '#369B39', 'white'),
(20, 'thmbVideo_height', '400px', 'white'),
(21, 'thmbVideo_Name_Color', '#FFFFFF', 'white'),
(22, 'thmbVideo_Name_fontSize', '16px', 'white'),
(23, 'thmbVideo_bg', '#333333', 'white'),
(24, 'chanlThmb_nameColor', '#000000', 'white'),
(25, 'chanlThmb_nameFontSize', '16px', 'white'),
(26, 'chanlThmb_bg', '#E3E3E3', 'white'),
(27, 'artist_nameColor', '#000000', 'white'),
(28, 'artist_nameFontSize', '16px', 'white'),
(29, 'artist_imgHeight', '250px', 'white'),
(30, 'artist_bg', '#E3E3E3', 'white'),
(31, 'member_nameColor', '#000000', 'white'),
(32, 'member_nameFontSize', '16px', 'white'),
(33, 'member_imgHeigh', '200px', 'white'),
(34, 'member_bg', '#E3E3E3', 'white'),
(35, 'playList_color', '#000000', 'white'),
(36, 'playList_titleFontsize', '16px', 'white'),
(37, 'playList_height', '35px', 'white'),
(38, 'category_color', '#FFFFFF', 'white'),
(39, 'category_titleFontsize', '16px', 'white'),
(40, 'category_height', '200px', 'white'),
(41, 'blogBox_bg', '#E3E3E3', 'white'),
(42, 'blogBox_titleFontSize', '16px', 'white'),
(43, 'blogBox_imgHeight', '250px', 'white'),
(44, 'blogBox_Color', '#FFFFFF', 'white'),
(45, 'blogBox_lightColor', '#333333', 'white'),
(46, 'tabsBtn_bg', '#FFFFFF', 'white'),
(47, 'tabsBtn_bgActive', '#FF1744', 'white'),
(48, 'tabsBtn_color', '#000000', 'white'),
(49, 'tabsBtn_Activecolor', '#FFFFFF', 'white'),
(50, 'tabsBtn_fontSize', '16px', 'white'),
(51, 'formField_lableFontColor', '#000000', 'white'),
(52, 'formField_inputBg', '#F5F5F5', 'white'),
(53, 'formField_inputColor', '#000000', 'white'),
(54, 'formField_inputBdrColor', '#A8A8A8', 'white'),
(55, 'formField_lableFont', '15px', 'white'),
(56, 'formField_inputFont', '16px', 'white'),
(57, 'formPage_bg', '#FFFFFF', 'white'),
(58, 'Bgcolor_default', '#010804', 'dark'),
(59, 'Bgcolor_primary', '#FF1744', 'dark'),
(60, 'Bgcolor_secondry', '#282828', 'dark'),
(61, 'Bgcolor_tertiary', '#808080', 'dark'),
(62, 'Border_color', '#3C3C3C', 'dark'),
(63, 'Textcolor_default', '#FFFFFF', 'dark'),
(64, 'Textcolor_primary', '#FF1744', 'dark'),
(65, 'Textcolor_secondry', '#CFCFCF', 'dark'),
(66, 'Textcolor_tertiary', '#E6E4E4', 'dark'),
(67, 'font_style', 'web', 'dark'),
(68, 'fontFamily_default', '\'Roboto\', sans-serif', 'dark'),
(69, 'fontFamily_heading', '\'Roboto\', sans-serif', 'dark'),
(70, 'fontSize_default', '16px', 'dark'),
(71, 'menu_FontSize', '16px', 'dark'),
(72, 'MenuDropDown_Bg', '#5C5C5C', 'dark'),
(73, 'username_varify_color', '#2296F3', 'dark'),
(74, 'lableHot_bg', '#FF1744', 'dark'),
(75, 'lableFeatured_bg', '#2296F3', 'dark'),
(76, 'lableSponsored_bg', '#369B39', 'dark'),
(77, 'thmbVideo_height', '400px', 'dark'),
(78, 'thmbVideo_Name_Color', '#FFFFFF', 'dark'),
(79, 'thmbVideo_Name_fontSize', '16px', 'dark'),
(80, 'thmbVideo_bg', '#333333', 'dark'),
(81, 'chanlThmb_nameColor', '#FFFFFF', 'dark'),
(82, 'chanlThmb_nameFontSize', '16px', 'dark'),
(83, 'chanlThmb_bg', '#333333', 'dark'),
(84, 'artist_nameColor', '#FFFFFF', 'dark'),
(85, 'artist_nameFontSize', '16px', 'dark'),
(86, 'artist_imgHeight', '200px', 'dark'),
(87, 'artist_bg', '#333333', 'dark'),
(88, 'member_nameColor', '#FFFFFF', 'dark'),
(89, 'member_nameFontSize', '16px', 'dark'),
(90, 'member_imgHeigh', '200px', 'dark'),
(91, 'member_bg', '#333333', 'dark'),
(92, 'playList_color', '#FFFFFF', 'dark'),
(93, 'playList_titleFontsize', '18px', 'dark'),
(94, 'playList_height', '35px', 'dark'),
(95, 'category_color', '#FFFFFF', 'dark'),
(96, 'category_titleFontsize', '18px', 'dark'),
(97, 'category_height', '200px', 'dark'),
(98, 'blogBox_bg', '#333333', 'dark'),
(99, 'blogBox_titleFontSize', '18px', 'dark'),
(100, 'blogBox_imgHeight', '250px', 'dark'),
(101, 'blogBox_Color', '#FFFFFF', 'dark'),
(102, 'blogBox_lightColor', '#CCCCCC', 'dark'),
(103, 'tabsBtn_bg', '#444444', 'dark'),
(104, 'tabsBtn_bgActive', '#FF1744', 'dark'),
(105, 'tabsBtn_color', '#FFFFFF', 'dark'),
(106, 'tabsBtn_Activecolor', '#FFFFFF', 'dark'),
(107, 'tabsBtn_fontSize', '16px', 'dark'),
(108, 'formField_lableFontColor', '#FFFFFF', 'dark'),
(109, 'formField_inputBg', '#F9F9F9', 'dark'),
(110, 'formField_inputColor', '#000000', 'dark'),
(111, 'formField_inputBdrColor', '#3C3C3C', 'dark'),
(112, 'formField_lableFont', '16px', 'dark'),
(113, 'formField_inputFont', '16px', 'dark'),
(114, 'formPage_bg', '#333333', 'dark'),
(115, 'videogrid_info_height', '180px', 'white'),
(116, 'videogrid_text_color', '#000000', 'white'),
(117, 'videoGrid_titlefontSize', '16px', 'white'),
(118, 'artist_bordercolor', '#ECECEC', 'white'),
(119, 'member_bordercolor', '#ECECEC', 'white'),
(120, 'videogrid_info_height', '140px', 'dark'),
(121, 'videogrid_text_color', '#000000', 'dark'),
(122, 'videoGrid_titlefontSize', '16px', 'dark'),
(123, 'artist_bordercolor', '#333333', 'dark'),
(124, 'member_bordercolor', '#333333', 'dark'),
(125, 'header_sidebar_bg', '#212121', 'dark'),
(126, 'header_sidebar_color', '#FFFFFF', 'dark'),
(127, 'header_sidebar_hovercolor', '#383838', 'dark'),
(128, 'header_sidebar_title_color', '#FDFDFD', 'dark'),
(129, 'header_sidebar_icon_color', '#8F908F', 'dark'),
(130, 'header_sidebar_fontsize', '16px', 'dark'),
(131, 'header_sidebar_search_bg', '#282828', 'dark'),
(132, 'header_sidebar_search_border', '#181818', 'dark'),
(133, 'header_sidebar_search_textcolor', '#FFFFFF', 'dark'),
(134, 'header_popup_inputborder', '#1B262C', 'dark'),
(135, 'header_popup_inputbg', '#1B262C', 'dark'),
(136, 'header_popup_inputtextcolor', '#FFFFFF', 'dark'),
(137, 'header_popup_headbg', '#12191D', 'dark'),
(138, 'header_popup_bodybg', '#111111', 'dark'),
(139, 'header_sidebar_bg', '#FFFFFF', 'white'),
(140, 'header_sidebar_color', '#000000', 'white'),
(141, 'header_sidebar_hovercolor', '#E5E5E5', 'white'),
(142, 'header_sidebar_title_color', '#000000', 'white'),
(143, 'header_sidebar_icon_color', '#8F908F', 'white'),
(144, 'header_sidebar_fontsize', '16px', 'white'),
(145, 'header_sidebar_search_bg', '#E4E6EA', 'white'),
(146, 'header_sidebar_search_border', '#F5F5F5', 'white'),
(147, 'header_sidebar_search_textcolor', '#000000', 'white'),
(148, 'header_popup_inputborder', '#F5F5F5', 'white'),
(149, 'header_popup_inputbg', '#E4E6EA', 'white'),
(150, 'header_popup_inputtextcolor', '#000000', 'white'),
(151, 'header_popup_headbg', '#F5F5F5', 'white'),
(152, 'header_popup_bodybg', '#FFFFFF', 'white');



DROP TABLE IF EXISTS `channel_posts`;
CREATE TABLE `channel_posts` (
  `post_id` int(11) UNSIGNED NOT NULL auto_increment,
  `channel_id` int(11) UNSIGNED NOT NULL,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `title` text COLLATE utf8_unicode_ci NULL,
  `image` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_general_ci NULL,
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`post_id`),
  KEY `channel_id` (`channel_id`),
  KEY `creation_date`(`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `invites`;
CREATE TABLE `invites` (
  `id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `recipient` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `creation_date` datetime NOT NULL,
  `new_user_id` int(11) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `tips`;
CREATE TABLE `tips` (
  `tip_id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL default '0',
  `currency` varchar(255) NOT NULL default 'USD',
  `purchase_count` int(11) NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`tip_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id_type` (`resource_id`,`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `defaultstreaming`;
CREATE TABLE `defaultstreaming` (
  `defaultstreaming_id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL default 'Live Streaming',
  `price` VARCHAR(255) NULL,
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `view_privacy` VARCHAR(24) NOT NULL,
  `adult` tinyint NOT NULL default '1',
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `enable_chat` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`defaultstreaming_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id_type` (`resource_type`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



DROP TABLE IF EXISTS `defaulttips`;
CREATE TABLE `defaulttips` (
  `defaulttip_id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL default '0',
  PRIMARY KEY (`defaulttip_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id_type` (`resource_type`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `audio`;
CREATE TABLE `audio`(
  `audio_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `custom_url` varchar(255) NOT NULL,
  `description` text NULL,
  `peaks` LONGTEXT NULL,
  `release_date` varchar(100) NOT NULL,
  `image` varchar(255) NULL,
  `audio_file` varchar(255) NOT NULL,
  `play_count` int(11)  unsigned NOT NULL default '0',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `approve` tinyint NOT NULL default '1',
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `search` tinyint(1) NOT NULL default '1',
  `size` varchar(255) NULL,
  `duration` varchar(50) NULL,
  `view_privacy` VARCHAR(24) NOT NULL,
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`audio_id`),
  KEY (`owner_id`),
  KEY (`approve`),
  KEY (`search`),
  KEY (`title`),
  KEY (`release_date`),
  KEY (`play_count`),
  KEY (`view_count`),
  KEY (`comment_count`),
  KEY (`dislike_count`),
  KEY (`favourite_count`),
  KEY (`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `referers`;
CREATE TABLE `referers` (
  `referer_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) unsigned not null default '0',
  `sitename` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(150) not NULL default 'video',
  `ip` varchar(45) not null default '',
  `content_id` INT(11) UNSIGNED NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`referer_id`),
  KEY `type` (`type`,`owner_id`),
  KEY  `sitename` (`sitename`),
  KEY `typeUnique` (`type`,`owner_id`,`creation_date`),
  KEY `typeIPUnique` (`type`,`ip`,`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'edit' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'delete' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'create' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'quota' as `name`,
    0 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');
  
  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'auto_approve' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'view' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('moderator', 'admin');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'delete' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('moderator', 'admin');

 INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'edit' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('moderator', 'admin');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('public');

DROP TABLE IF EXISTS `tip_donors`;
CREATE TABLE `tip_donors` (
  `donor_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT null default '0',
  `video_id` int(11) unsigned NOT null default '0',
  `price` decimal(16,2) NOT null default '0.00',
  `ip` varchar(45) NOT null default '',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`donor_id`),
  KEY `owner_id` (`video_id`),
  KEY `creation_date` (`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `chat_ban_users`;
CREATE TABLE `chat_ban_users` (
  `ban_id` int(11) unsigned NOT NULL auto_increment,
  `user_id` int(11) unsigned NOT NULL default '0',
  `chat_id` varchar(255) NOT NULL,
  PRIMARY KEY (`ban_id`),
  UNIQUE KEY `unique` (`chat_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `chat_id` (`chat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `otp_code`;
CREATE TABLE `otp_code` (
  `code_id` int(11) unsigned NOT NULL auto_increment,
  `code` varchar(10) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`code_id`),
  KEY `phone` (`phone_number`,`code`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `point_settings`;
CREATE TABLE `point_settings` (
  `point_id` int(11) UNSIGNED NOT NULL auto_increment,
  `level_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `resource_type` varchar(45) NOT NULL,
  `first_time` int(11) NOT NULL default '0',
  `next_time` int(11) NOT NULL default '0',
  `max` int(11) NOT NULL default '0',
  `deduct` int(11) NOT NULL default '0',
  `approve` tinyint(1) NOT NULL default '0',
  PRIMARY KEY (`point_id`),
  UNIQUE KEY `UNIQUE` (`resource_type`,`level_id`,`type`),
  KEY `approve` (`approve`),
  KEY `resource_type` (`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `user_point_values`;
CREATE TABLE `user_point_values` (
  `value_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `resource_type` varchar(45) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `credit` int(11) NOT NULL default '0',
  `debit` int(11) NOT NULL default '0',
  `receiver_id` int(11) NOT NULL default '0',
  `sender_id` int(11) NOT NULL default '0',
  `custom` text NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`value_id`),
  KEY `owner_id` (`owner_id`),
  KEY `resource_type` (`resource_type`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `member_plans`;
CREATE TABLE `member_plans` (
  `member_plan_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `video_categories` TEXT NULL,
  `plan_type` varchar(255) NOT NULL DEFAULT 'month',
  `image` varchar(255) NULL,
  `price` decimal(8,2) NOT NULL, 
  `is_default` tinyint(0) NOT NULL default '0', 
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`member_plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'member' as `type`,
    'allow_create_subscriptionplans' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');

  CREATE TABLE `movies` (
  `movie_id` int(11) UNSIGNED NOT NULL auto_increment,
  `imdb_id` varchar(255) NULL,
  `tmdb_id` bigint(191) UNSIGNED NOT NULL default '0',
  `title` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `tagline` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `category` VARCHAR(45) NOT NULL DEFAULT 'movie',
  `runtime` int(11) unsigned NOT NULL default '0',
  `season_count` int(11) unsigned NOT NULL default '0',
  `episode_count` int(11) unsigned NOT NULL default '0',
  `series_ended` tinyint(1) NOT NULL default '0',
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `owner_id` INT(11) NOT NULL DEFAULT '0',
  `custom_url` varchar(255) NOT NULL,
  `stars` decimal(16,1) NOT NULL DEFAULT '0.0',
  `budget` decimal(16,2) NOT NULL DEFAULT '0.00',
  `revenue` decimal(16,2) NOT NULL DEFAULT '0.00',
  `language` varchar(45) NOT NULL DEFAULT 'en',
  `country` INT(11) NOT NULL DEFAULT '0',
  `image` varchar(255) NOT NULL default '',
  `backdrop` varchar(255) NULL,
  `type` varchar(10) NOT NULL DEFAULT 'movies',
  `rent_price` decimal(16,2) NOT NULL  DEFAULT '0.00',
  `price` decimal(16,2) NOT NULL  DEFAULT '0.00',
  `movie_release` varchar(45) NOT NULL DEFAULT '',
  `rating` float default '0.0',
  `view_count` int(11) UNSIGNED NOT NULL default '0',
  `comment_count` int(11) UNSIGNED NOT NULL default '0',
  `like_count` int(11) UNSIGNED NOT NULL default '0',
  `dislike_count` int(11) UNSIGNED NOT NULL default '0',  
  `search` tinyint(1) NOT NULL default '1',
  `favourite_count` int(11) UNSIGNED NOT NULL default '0',
  `is_sponsored` tinyint(1) NOT NULL default '0',
  `is_featured` tinyint(1) NOT NULL default '0',
  `is_hot` tinyint(1) NOT NULL default '0',
  `show_slider` tinyint(1) NOT NULL default '0',
  `approve` tinyint(1) NOT NULL DEFAULT '1',
  `completed` tinyint(1) NOT NULL DEFAULT '1',
  `adult` tinyint(1) NOT NULL DEFAULT '0',
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) NULL,
  `purchase_count` int(11) not NULL default '0',
  `total_purchase_amount` VARCHAR(255) NOT NULL DEFAULT '0',
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `view_privacy` VARCHAR(24) NOT NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`movie_id`),
  KEY `movie_id` (`movie_id`),
  KEY `custom_url` (`custom_url`),
  KEY `purchase_count` (`purchase_count`),
  KEY `imdb_id` (`imdb_id`),
  KEY `category_id` (`category_id`),
  KEY `subcategory_id` (`subcategory_id`),
  KEY `subsubcategory_id` (`subsubcategory_id`),
  KEY  `owner_id` (`owner_id`),
  KEY  `is_locked` (`is_locked`),
  KEY `rent_price` (`rent_price`),
  KEY  `price` (`price`),
  KEY `type` (`type`),
  KEY `stars` (`stars`),
  KEY `budget` (`budget`),
  KEY `revenue` (`revenue`),
  KEY `language` (`language`),
  KEY `country` (`country`),
  KEY `movie_release` (`movie_release`),
  KEY `is_sponsored` (`is_sponsored`),
  KEY `is_featured` (`is_featured`),
  KEY `is_hot` (`is_hot`),
  KEY `rating` (`rating`),
  KEY `show_slider` (`show_slider`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `dislike_count` (`dislike_count`),
  KEY `search` (`search`),
  KEY `favourite_count` (`favourite_count`),
  KEY `approve` (`approve`),
  KEY `completed` (`completed`),
  KEY `adult` (`adult`),
  KEY `view_privacy` (`view_privacy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `channelmovies` (
  `channelmovie_id` int(11) unsigned NOT NULL auto_increment,
  `channel_id` int(11) unsigned NOT NULL default '0',
  `movie_id` int(11) unsigned NOT NULL default '0',
  `owner_id` int(11) unsigned NOT NULL default '0',  
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`channelmovie_id`),
  UNIQUE KEY `unique` (`channel_id`,`movie_id`),
  KEY `channel_id` (`channel_id`),
  KEY `movie_id` (`movie_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `movie_videos` (
  `movie_video_id` int(11) UNSIGNED NOT NULL auto_increment,
  `movie_id` int(11) UNSIGNED NOT NULL,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `title`  varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `category` varchar(45) NULL,
  `season_id` int(11) UNSIGNED NOT NULL,
  `episode_id` int(11) UNSIGNED NOT NULL,
  `video_location` varchar(255) NULL,
  `image` varchar(255) NULL,
  `resolution` VARCHAR(255) NULL,
  `type` varchar(45) NOT NULL DEFAULT '',
   `size` varchar(255) NULL,
  `duration` varchar(50) NULL,
  `code` TEXT NULL,
  `language` varchar(45) NOT NULL DEFAULT 'en',
  `quality` varchar(45) NULL,
  `sample` tinyint(1) NOT NULL DEFAULT '0',
  `240p` tinyint(1) NOT NULL DEFAULT '0',
  `360p` tinyint(1) NOT NULL DEFAULT '0',
  `480p` tinyint(1) NOT NULL DEFAULT '0',
  `720p` tinyint(1) NOT NULL DEFAULT '0',
  `1080p` tinyint(1) NOT NULL DEFAULT '0',
  `2048p` tinyint(1) NOT NULL DEFAULT '0',
  `4096p` tinyint(1) NOT NULL DEFAULT '0',
  `completed` TINYINT(1) NOT NULL DEFAULT '0',
  `status` TINYINT(1) NOT NULL DEFAULT '1',
  `plays` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`movie_video_id`),
  KEY `movie_id` (`movie_id`),
  KEY  `completed` (`completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



DROP TABLE IF EXISTS `seasons`;
CREATE TABLE `seasons` (
  `season_id` int(11) UNSIGNED NOT NULL auto_increment,
  `movie_id` int(11) UNSIGNED NOT NULL default '0',
  `tmdb_id` bigint(191) UNSIGNED NOT NULL default '0',
  `season` int(11) UNSIGNED NOT NULL default '0',
  `image` varchar(255) NULL,
  PRIMARY KEY (`season_id`),
  KEY `movie_id` (`movie_id`),
  KEY `tmdb_id` (`tmdb_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `episodes` (
  `episode_id` int(11) UNSIGNED NOT NULL auto_increment,
  `tmdb_id` bigint(191) UNSIGNED NOT NULL default '0',
  `season_id` int(11) UNSIGNED NOT NULL,
  `movie_id` int(11) UNSIGNED NOT NULL,
  `owner_id` INT(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `episode_number` int(11) NOT NULL DEFAULT '1',
  `image` varchar(255) NULL DEFAULT '',
  `release_date` varchar(100) NULL,
  `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `rating` float default '0.0',
  `view_count` int(11) UNSIGNED NOT NULL default '0',
  `comment_count` int(11) UNSIGNED NOT NULL default '0',
  `like_count` int(11) UNSIGNED NOT NULL default '0',
  `dislike_count` int(11) UNSIGNED NOT NULL default '0',  
  `search` tinyint(1) NOT NULL default '1',
  `favourite_count` int(11) UNSIGNED NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
    PRIMARY KEY (`episode_id`),
    KEY `season_id` (`season_id`),
    KEY `tmdb_id` (`tmdb_id`),
    KEY `movie_id` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `photos` (
  `photo_id` int(11) UNSIGNED NOT NULL auto_increment,
  `name` VARCHAR(255) NULL,
  `resource_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(45) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `resource_id` (`resource_id`,`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `genres` (
  `genre_id` int(11) UNSIGNED NOT NULL auto_increment,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `movie_count` int(11) unsigned NOT NULL default '0',
  `series_count` int(11) unsigned NOT NULL default '0',
  PRIMARY KEY (`genre_id`),
  KEY `slug` (`slug`),
  KEY `title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `genres` ( `title`, `slug`, `movie_count`, `series_count`) VALUES
( 'Action', 'action', 0, 0),
( 'Adventure', 'adventure', 0, 0),
( 'Animation', 'animation', 0, 0),
( 'Comedy', 'comedy', 0, 0),
( 'Crime', 'crime', 0, 0),
( 'Documentary', 'documentary', 0, 0),
( 'Drama', 'drama', 0, 0),
( 'Family', 'family', 0, 0),
( 'Fantasy', 'fantasy', 0, 0),
( 'History', 'history', 0, 0),
( 'Horror', 'horror', 0, 0),
( 'Music', 'music', 0, 0),
( 'Mystery', 'mystery', 0, 0),
( 'Romance', 'romance', 0, 0),
( 'Science Fiction', 'science-fiction', 0, 0),
( 'TV Movie', 'tv-movie', 0, 0),
( 'Thriller', 'thriller', 0, 0),
( 'War', 'war', 0, 0),
( 'Western', 'western', 0, 0);

CREATE TABLE `movie_genres` (
  `movie_genre_id` int(11) UNSIGNED NOT NULL auto_increment,
  `genre_id` int(11) UNSIGNED NOT NULL default '0',
  `movie_id` int(11) UNSIGNED NOT NULL default '0',
  PRIMARY KEY (`movie_genre_id`),
  KEY `movie_id` (`movie_id`),
  KEY `genre_id` (`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `keywords` (
  `keyword_id` int(11) UNSIGNED NOT NULL auto_increment,
  `movie_id` int(11) UNSIGNED NOT NULL default '0',
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  PRIMARY KEY (`keyword_id`),
  KEY `movie_id` (`movie_id`),
  KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `reviews` (
  `review_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `movie_id` int(11) UNSIGNED NOT NULL,
  `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `rating` float default '0.0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`review_id`),
  KEY `movie_id` (`movie_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `video_type_categories` (
  `video_type_category_id` int(11) UNSIGNED NOT NULL auto_increment,
  `type` varchar(255) NOT NULL DEFAULT 'full',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`video_type_category_id`),
  KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `cast_crew_members` (
  `cast_crew_member_id` int(11) UNSIGNED NOT NULL auto_increment,
  `custom_url` VARCHAR(255) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `image` varchar(255) NOT NULL,
  `biography` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `gender` varchar(45) NULL,
  `birthdate` varchar(25) NULL,
  `deathdate` varchar(25) NULL,
  `birthplace` varchar(255) NULL,
  `imdb_id` varchar(255) NULL,
  `tmdb_id` bigint(191) UNSIGNED NOT NULL default '0',
  `rating` float default '0.0',
  `view_count` int(11) UNSIGNED NOT NULL default '0',
  `comment_count` int(11) UNSIGNED NOT NULL default '0',
  `like_count` int(11) UNSIGNED NOT NULL default '0',
  `dislike_count` int(11) UNSIGNED NOT NULL default '0',
  `favourite_count` int(11) UNSIGNED NOT NULL default '0',
  `type` VARCHAR(255) NOT NULL DEFAULT 'movie',
  PRIMARY KEY (`cast_crew_member_id`),
  KEY `name` (`name`),
  KEY `imdb_id` (`imdb_id`),
  KEY `tmdb_id` (`tmdb_id`),
  KEY `view_count` (`view_count`),
  KEY `comment_count` (`comment_count`),
  KEY `like_count` (`like_count`),
  KEY `dislike_count` (`dislike_count`),
  KEY `favourite_count` (`favourite_count`),
  KEY `rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `cast_crew` (
  `cast_crew_id` int(11) UNSIGNED NOT NULL auto_increment,
  `cast_crew_member_id` int(11) UNSIGNED NOT NULL,
  `character` varchar(255) NULL,
  `job` varchar(255) NULL,
  `department` varchar(255) NULL,
  `resource_type` VARCHAR(255) NOT NULL DEFAULT 'season',
  `resource_id` INT(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`cast_crew_id`),
  KEY `active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `movie_countries` (
  `movie_country_id` int(11) NOT NULL AUTO_INCREMENT,
 `movie_id` INT(11) NOT NULL,
 `country_id` INT(11) NOT NULL,
  PRIMARY KEY (`movie_country_id`),
  KEY `movie_id` (`movie_id`),
  KEY `country_id` (`country_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `iso` char(2) NOT NULL,
  `name` varchar(80) NOT NULL,
  `nicename` varchar(80) NOT NULL,
  `iso3` char(3) DEFAULT NULL,
  `numcode` smallint(6) DEFAULT NULL,
  `phonecode` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

INSERT INTO `video_type_categories` (`type`, `title`) VALUES
('trailer', 'Trailer'),
('clip', 'Clip'),
('teaser', 'Teaser'),
('full', 'Full Movie or episode');


INSERT INTO `countries` (`id`, `iso`, `name`, `nicename`, `iso3`, `numcode`, `phonecode`) VALUES
(1, 'AF', 'AFGHANISTAN', 'Afghanistan', 'AFG', 4, 93),
(2, 'AL', 'ALBANIA', 'Albania', 'ALB', 8, 355),
(3, 'DZ', 'ALGERIA', 'Algeria', 'DZA', 12, 213),
(4, 'AS', 'AMERICAN SAMOA', 'American Samoa', 'ASM', 16, 1684),
(5, 'AD', 'ANDORRA', 'Andorra', 'AND', 20, 376),
(6, 'AO', 'ANGOLA', 'Angola', 'AGO', 24, 244),
(7, 'AI', 'ANGUILLA', 'Anguilla', 'AIA', 660, 1264),
(8, 'AQ', 'ANTARCTICA', 'Antarctica', NULL, NULL, 0),
(9, 'AG', 'ANTIGUA AND BARBUDA', 'Antigua and Barbuda', 'ATG', 28, 1268),
(10, 'AR', 'ARGENTINA', 'Argentina', 'ARG', 32, 54),
(11, 'AM', 'ARMENIA', 'Armenia', 'ARM', 51, 374),
(12, 'AW', 'ARUBA', 'Aruba', 'ABW', 533, 297),
(13, 'AU', 'AUSTRALIA', 'Australia', 'AUS', 36, 61),
(14, 'AT', 'AUSTRIA', 'Austria', 'AUT', 40, 43),
(15, 'AZ', 'AZERBAIJAN', 'Azerbaijan', 'AZE', 31, 994),
(16, 'BS', 'BAHAMAS', 'Bahamas', 'BHS', 44, 1242),
(17, 'BH', 'BAHRAIN', 'Bahrain', 'BHR', 48, 973),
(18, 'BD', 'BANGLADESH', 'Bangladesh', 'BGD', 50, 880),
(19, 'BB', 'BARBADOS', 'Barbados', 'BRB', 52, 1246),
(20, 'BY', 'BELARUS', 'Belarus', 'BLR', 112, 375),
(21, 'BE', 'BELGIUM', 'Belgium', 'BEL', 56, 32),
(22, 'BZ', 'BELIZE', 'Belize', 'BLZ', 84, 501),
(23, 'BJ', 'BENIN', 'Benin', 'BEN', 204, 229),
(24, 'BM', 'BERMUDA', 'Bermuda', 'BMU', 60, 1441),
(25, 'BT', 'BHUTAN', 'Bhutan', 'BTN', 64, 975),
(26, 'BO', 'BOLIVIA', 'Bolivia', 'BOL', 68, 591),
(27, 'BA', 'BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina', 'BIH', 70, 387),
(28, 'BW', 'BOTSWANA', 'Botswana', 'BWA', 72, 267),
(29, 'BV', 'BOUVET ISLAND', 'Bouvet Island', NULL, NULL, 0),
(30, 'BR', 'BRAZIL', 'Brazil', 'BRA', 76, 55),
(31, 'IO', 'BRITISH INDIAN OCEAN TERRITORY', 'British Indian Ocean Territory', NULL, NULL, 246),
(32, 'BN', 'BRUNEI DARUSSALAM', 'Brunei Darussalam', 'BRN', 96, 673),
(33, 'BG', 'BULGARIA', 'Bulgaria', 'BGR', 100, 359),
(34, 'BF', 'BURKINA FASO', 'Burkina Faso', 'BFA', 854, 226),
(35, 'BI', 'BURUNDI', 'Burundi', 'BDI', 108, 257),
(36, 'KH', 'CAMBODIA', 'Cambodia', 'KHM', 116, 855),
(37, 'CM', 'CAMEROON', 'Cameroon', 'CMR', 120, 237),
(38, 'CA', 'CANADA', 'Canada', 'CAN', 124, 1),
(39, 'CV', 'CAPE VERDE', 'Cape Verde', 'CPV', 132, 238),
(40, 'KY', 'CAYMAN ISLANDS', 'Cayman Islands', 'CYM', 136, 1345),
(41, 'CF', 'CENTRAL AFRICAN REPUBLIC', 'Central African Republic', 'CAF', 140, 236),
(42, 'TD', 'CHAD', 'Chad', 'TCD', 148, 235),
(43, 'CL', 'CHILE', 'Chile', 'CHL', 152, 56),
(44, 'CN', 'CHINA', 'China', 'CHN', 156, 86),
(45, 'CX', 'CHRISTMAS ISLAND', 'Christmas Island', NULL, NULL, 61),
(46, 'CC', 'COCOS (KEELING) ISLANDS', 'Cocos (Keeling) Islands', NULL, NULL, 672),
(47, 'CO', 'COLOMBIA', 'Colombia', 'COL', 170, 57),
(48, 'KM', 'COMOROS', 'Comoros', 'COM', 174, 269),
(49, 'CG', 'CONGO', 'Congo', 'COG', 178, 242),
(50, 'CD', 'CONGO, THE DEMOCRATIC REPUBLIC OF THE', 'Congo, the Democratic Republic of the', 'COD', 180, 242),
(51, 'CK', 'COOK ISLANDS', 'Cook Islands', 'COK', 184, 682),
(52, 'CR', 'COSTA RICA', 'Costa Rica', 'CRI', 188, 506),
(53, 'CI', 'COTE D''IVOIRE', 'Cote D''Ivoire', 'CIV', 384, 225),
(54, 'HR', 'CROATIA', 'Croatia', 'HRV', 191, 385),
(55, 'CU', 'CUBA', 'Cuba', 'CUB', 192, 53),
(56, 'CY', 'CYPRUS', 'Cyprus', 'CYP', 196, 357),
(57, 'CZ', 'CZECH REPUBLIC', 'Czech Republic', 'CZE', 203, 420),
(58, 'DK', 'DENMARK', 'Denmark', 'DNK', 208, 45),
(59, 'DJ', 'DJIBOUTI', 'Djibouti', 'DJI', 262, 253),
(60, 'DM', 'DOMINICA', 'Dominica', 'DMA', 212, 1767),
(61, 'DO', 'DOMINICAN REPUBLIC', 'Dominican Republic', 'DOM', 214, 1809),
(62, 'EC', 'ECUADOR', 'Ecuador', 'ECU', 218, 593),
(63, 'EG', 'EGYPT', 'Egypt', 'EGY', 818, 20),
(64, 'SV', 'EL SALVADOR', 'El Salvador', 'SLV', 222, 503),
(65, 'GQ', 'EQUATORIAL GUINEA', 'Equatorial Guinea', 'GNQ', 226, 240),
(66, 'ER', 'ERITREA', 'Eritrea', 'ERI', 232, 291),
(67, 'EE', 'ESTONIA', 'Estonia', 'EST', 233, 372),
(68, 'ET', 'ETHIOPIA', 'Ethiopia', 'ETH', 231, 251),
(69, 'FK', 'FALKLAND ISLANDS (MALVINAS)', 'Falkland Islands (Malvinas)', 'FLK', 238, 500),
(70, 'FO', 'FAROE ISLANDS', 'Faroe Islands', 'FRO', 234, 298),
(71, 'FJ', 'FIJI', 'Fiji', 'FJI', 242, 679),
(72, 'FI', 'FINLAND', 'Finland', 'FIN', 246, 358),
(73, 'FR', 'FRANCE', 'France', 'FRA', 250, 33),
(74, 'GF', 'FRENCH GUIANA', 'French Guiana', 'GUF', 254, 594),
(75, 'PF', 'FRENCH POLYNESIA', 'French Polynesia', 'PYF', 258, 689),
(76, 'TF', 'FRENCH SOUTHERN TERRITORIES', 'French Southern Territories', NULL, NULL, 0),
(77, 'GA', 'GABON', 'Gabon', 'GAB', 266, 241),
(78, 'GM', 'GAMBIA', 'Gambia', 'GMB', 270, 220),
(79, 'GE', 'GEORGIA', 'Georgia', 'GEO', 268, 995),
(80, 'DE', 'GERMANY', 'Germany', 'DEU', 276, 49),
(81, 'GH', 'GHANA', 'Ghana', 'GHA', 288, 233),
(82, 'GI', 'GIBRALTAR', 'Gibraltar', 'GIB', 292, 350),
(83, 'GR', 'GREECE', 'Greece', 'GRC', 300, 30),
(84, 'GL', 'GREENLAND', 'Greenland', 'GRL', 304, 299),
(85, 'GD', 'GRENADA', 'Grenada', 'GRD', 308, 1473),
(86, 'GP', 'GUADELOUPE', 'Guadeloupe', 'GLP', 312, 590),
(87, 'GU', 'GUAM', 'Guam', 'GUM', 316, 1671),
(88, 'GT', 'GUATEMALA', 'Guatemala', 'GTM', 320, 502),
(89, 'GN', 'GUINEA', 'Guinea', 'GIN', 324, 224),
(90, 'GW', 'GUINEA-BISSAU', 'Guinea-Bissau', 'GNB', 624, 245),
(91, 'GY', 'GUYANA', 'Guyana', 'GUY', 328, 592),
(92, 'HT', 'HAITI', 'Haiti', 'HTI', 332, 509),
(93, 'HM', 'HEARD ISLAND AND MCDONALD ISLANDS', 'Heard Island and Mcdonald Islands', NULL, NULL, 0),
(94, 'VA', 'HOLY SEE (VATICAN CITY STATE)', 'Holy See (Vatican City State)', 'VAT', 336, 39),
(95, 'HN', 'HONDURAS', 'Honduras', 'HND', 340, 504),
(96, 'HK', 'HONG KONG', 'Hong Kong', 'HKG', 344, 852),
(97, 'HU', 'HUNGARY', 'Hungary', 'HUN', 348, 36),
(98, 'IS', 'ICELAND', 'Iceland', 'ISL', 352, 354),
(99, 'IN', 'INDIA', 'India', 'IND', 356, 91),
(100, 'ID', 'INDONESIA', 'Indonesia', 'IDN', 360, 62),
(101, 'IR', 'IRAN, ISLAMIC REPUBLIC OF', 'Iran, Islamic Republic of', 'IRN', 364, 98),
(102, 'IQ', 'IRAQ', 'Iraq', 'IRQ', 368, 964),
(103, 'IE', 'IRELAND', 'Ireland', 'IRL', 372, 353),
(104, 'IL', 'ISRAEL', 'Israel', 'ISR', 376, 972),
(105, 'IT', 'ITALY', 'Italy', 'ITA', 380, 39),
(106, 'JM', 'JAMAICA', 'Jamaica', 'JAM', 388, 1876),
(107, 'JP', 'JAPAN', 'Japan', 'JPN', 392, 81),
(108, 'JO', 'JORDAN', 'Jordan', 'JOR', 400, 962),
(109, 'KZ', 'KAZAKHSTAN', 'Kazakhstan', 'KAZ', 398, 7),
(110, 'KE', 'KENYA', 'Kenya', 'KEN', 404, 254),
(111, 'KI', 'KIRIBATI', 'Kiribati', 'KIR', 296, 686),
(112, 'KP', 'KOREA, DEMOCRATIC PEOPLE''S REPUBLIC OF', 'Korea, Democratic People''s Republic of', 'PRK', 408, 850),
(113, 'KR', 'KOREA, REPUBLIC OF', 'Korea, Republic of', 'KOR', 410, 82),
(114, 'KW', 'KUWAIT', 'Kuwait', 'KWT', 414, 965),
(115, 'KG', 'KYRGYZSTAN', 'Kyrgyzstan', 'KGZ', 417, 996),
(116, 'LA', 'LAO PEOPLE''S DEMOCRATIC REPUBLIC', 'Lao People''s Democratic Republic', 'LAO', 418, 856),
(117, 'LV', 'LATVIA', 'Latvia', 'LVA', 428, 371),
(118, 'LB', 'LEBANON', 'Lebanon', 'LBN', 422, 961),
(119, 'LS', 'LESOTHO', 'Lesotho', 'LSO', 426, 266),
(120, 'LR', 'LIBERIA', 'Liberia', 'LBR', 430, 231),
(121, 'LY', 'LIBYAN ARAB JAMAHIRIYA', 'Libyan Arab Jamahiriya', 'LBY', 434, 218),
(122, 'LI', 'LIECHTENSTEIN', 'Liechtenstein', 'LIE', 438, 423),
(123, 'LT', 'LITHUANIA', 'Lithuania', 'LTU', 440, 370),
(124, 'LU', 'LUXEMBOURG', 'Luxembourg', 'LUX', 442, 352),
(125, 'MO', 'MACAO', 'Macao', 'MAC', 446, 853),
(126, 'MK', 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', 'Macedonia, the Former Yugoslav Republic of', 'MKD', 807, 389),
(127, 'MG', 'MADAGASCAR', 'Madagascar', 'MDG', 450, 261),
(128, 'MW', 'MALAWI', 'Malawi', 'MWI', 454, 265),
(129, 'MY', 'MALAYSIA', 'Malaysia', 'MYS', 458, 60),
(130, 'MV', 'MALDIVES', 'Maldives', 'MDV', 462, 960),
(131, 'ML', 'MALI', 'Mali', 'MLI', 466, 223),
(132, 'MT', 'MALTA', 'Malta', 'MLT', 470, 356),
(133, 'MH', 'MARSHALL ISLANDS', 'Marshall Islands', 'MHL', 584, 692),
(134, 'MQ', 'MARTINIQUE', 'Martinique', 'MTQ', 474, 596),
(135, 'MR', 'MAURITANIA', 'Mauritania', 'MRT', 478, 222),
(136, 'MU', 'MAURITIUS', 'Mauritius', 'MUS', 480, 230),
(137, 'YT', 'MAYOTTE', 'Mayotte', NULL, NULL, 269),
(138, 'MX', 'MEXICO', 'Mexico', 'MEX', 484, 52),
(139, 'FM', 'MICRONESIA, FEDERATED STATES OF', 'Micronesia, Federated States of', 'FSM', 583, 691),
(140, 'MD', 'MOLDOVA, REPUBLIC OF', 'Moldova, Republic of', 'MDA', 498, 373),
(141, 'MC', 'MONACO', 'Monaco', 'MCO', 492, 377),
(142, 'MN', 'MONGOLIA', 'Mongolia', 'MNG', 496, 976),
(143, 'MS', 'MONTSERRAT', 'Montserrat', 'MSR', 500, 1664),
(144, 'MA', 'MOROCCO', 'Morocco', 'MAR', 504, 212),
(145, 'MZ', 'MOZAMBIQUE', 'Mozambique', 'MOZ', 508, 258),
(146, 'MM', 'MYANMAR', 'Myanmar', 'MMR', 104, 95),
(147, 'NA', 'NAMIBIA', 'Namibia', 'NAM', 516, 264),
(148, 'NR', 'NAURU', 'Nauru', 'NRU', 520, 674),
(149, 'NP', 'NEPAL', 'Nepal', 'NPL', 524, 977),
(150, 'NL', 'NETHERLANDS', 'Netherlands', 'NLD', 528, 31),
(151, 'AN', 'NETHERLANDS ANTILLES', 'Netherlands Antilles', 'ANT', 530, 599),
(152, 'NC', 'NEW CALEDONIA', 'New Caledonia', 'NCL', 540, 687),
(153, 'NZ', 'NEW ZEALAND', 'New Zealand', 'NZL', 554, 64),
(154, 'NI', 'NICARAGUA', 'Nicaragua', 'NIC', 558, 505),
(155, 'NE', 'NIGER', 'Niger', 'NER', 562, 227),
(156, 'NG', 'NIGERIA', 'Nigeria', 'NGA', 566, 234),
(157, 'NU', 'NIUE', 'Niue', 'NIU', 570, 683),
(158, 'NF', 'NORFOLK ISLAND', 'Norfolk Island', 'NFK', 574, 672),
(159, 'MP', 'NORTHERN MARIANA ISLANDS', 'Northern Mariana Islands', 'MNP', 580, 1670),
(160, 'NO', 'NORWAY', 'Norway', 'NOR', 578, 47),
(161, 'OM', 'OMAN', 'Oman', 'OMN', 512, 968),
(162, 'PK', 'PAKISTAN', 'Pakistan', 'PAK', 586, 92),
(163, 'PW', 'PALAU', 'Palau', 'PLW', 585, 680),
(164, 'PS', 'PALESTINIAN TERRITORY, OCCUPIED', 'Palestinian Territory, Occupied', NULL, NULL, 970),
(165, 'PA', 'PANAMA', 'Panama', 'PAN', 591, 507),
(166, 'PG', 'PAPUA NEW GUINEA', 'Papua New Guinea', 'PNG', 598, 675),
(167, 'PY', 'PARAGUAY', 'Paraguay', 'PRY', 600, 595),
(168, 'PE', 'PERU', 'Peru', 'PER', 604, 51),
(169, 'PH', 'PHILIPPINES', 'Philippines', 'PHL', 608, 63),
(170, 'PN', 'PITCAIRN', 'Pitcairn', 'PCN', 612, 0),
(171, 'PL', 'POLAND', 'Poland', 'POL', 616, 48),
(172, 'PT', 'PORTUGAL', 'Portugal', 'PRT', 620, 351),
(173, 'PR', 'PUERTO RICO', 'Puerto Rico', 'PRI', 630, 1787),
(174, 'QA', 'QATAR', 'Qatar', 'QAT', 634, 974),
(175, 'RE', 'REUNION', 'Reunion', 'REU', 638, 262),
(176, 'RO', 'ROMANIA', 'Romania', 'ROM', 642, 40),
(177, 'RU', 'RUSSIAN FEDERATION', 'Russian Federation', 'RUS', 643, 70),
(178, 'RW', 'RWANDA', 'Rwanda', 'RWA', 646, 250),
(179, 'SH', 'SAINT HELENA', 'Saint Helena', 'SHN', 654, 290),
(180, 'KN', 'SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis', 'KNA', 659, 1869),
(181, 'LC', 'SAINT LUCIA', 'Saint Lucia', 'LCA', 662, 1758),
(182, 'PM', 'SAINT PIERRE AND MIQUELON', 'Saint Pierre and Miquelon', 'SPM', 666, 508),
(183, 'VC', 'SAINT VINCENT AND THE GRENADINES', 'Saint Vincent and the Grenadines', 'VCT', 670, 1784),
(184, 'WS', 'SAMOA', 'Samoa', 'WSM', 882, 684),
(185, 'SM', 'SAN MARINO', 'San Marino', 'SMR', 674, 378),
(186, 'ST', 'SAO TOME AND PRINCIPE', 'Sao Tome and Principe', 'STP', 678, 239),
(187, 'SA', 'SAUDI ARABIA', 'Saudi Arabia', 'SAU', 682, 966),
(188, 'SN', 'SENEGAL', 'Senegal', 'SEN', 686, 221),
(189, 'CS', 'SERBIA AND MONTENEGRO', 'Serbia and Montenegro', NULL, NULL, 381),
(190, 'SC', 'SEYCHELLES', 'Seychelles', 'SYC', 690, 248),
(191, 'SL', 'SIERRA LEONE', 'Sierra Leone', 'SLE', 694, 232),
(192, 'SG', 'SINGAPORE', 'Singapore', 'SGP', 702, 65),
(193, 'SK', 'SLOVAKIA', 'Slovakia', 'SVK', 703, 421),
(194, 'SI', 'SLOVENIA', 'Slovenia', 'SVN', 705, 386),
(195, 'SB', 'SOLOMON ISLANDS', 'Solomon Islands', 'SLB', 90, 677),
(196, 'SO', 'SOMALIA', 'Somalia', 'SOM', 706, 252),
(197, 'ZA', 'SOUTH AFRICA', 'South Africa', 'ZAF', 710, 27),
(198, 'GS', 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', 'South Georgia and the South Sandwich Islands', NULL, NULL, 0),
(199, 'ES', 'SPAIN', 'Spain', 'ESP', 724, 34),
(200, 'LK', 'SRI LANKA', 'Sri Lanka', 'LKA', 144, 94),
(201, 'SD', 'SUDAN', 'Sudan', 'SDN', 736, 249),
(202, 'SR', 'SURINAME', 'Suriname', 'SUR', 740, 597),
(203, 'SJ', 'SVALBARD AND JAN MAYEN', 'Svalbard and Jan Mayen', 'SJM', 744, 47),
(204, 'SZ', 'SWAZILAND', 'Swaziland', 'SWZ', 748, 268),
(205, 'SE', 'SWEDEN', 'Sweden', 'SWE', 752, 46),
(206, 'CH', 'SWITZERLAND', 'Switzerland', 'CHE', 756, 41),
(207, 'SY', 'SYRIAN ARAB REPUBLIC', 'Syrian Arab Republic', 'SYR', 760, 963),
(208, 'TW', 'TAIWAN, PROVINCE OF CHINA', 'Taiwan, Province of China', 'TWN', 158, 886),
(209, 'TJ', 'TAJIKISTAN', 'Tajikistan', 'TJK', 762, 992),
(210, 'TZ', 'TANZANIA, UNITED REPUBLIC OF', 'Tanzania, United Republic of', 'TZA', 834, 255),
(211, 'TH', 'THAILAND', 'Thailand', 'THA', 764, 66),
(212, 'TL', 'TIMOR-LESTE', 'Timor-Leste', NULL, NULL, 670),
(213, 'TG', 'TOGO', 'Togo', 'TGO', 768, 228),
(214, 'TK', 'TOKELAU', 'Tokelau', 'TKL', 772, 690),
(215, 'TO', 'TONGA', 'Tonga', 'TON', 776, 676),
(216, 'TT', 'TRINIDAD AND TOBAGO', 'Trinidad and Tobago', 'TTO', 780, 1868),
(217, 'TN', 'TUNISIA', 'Tunisia', 'TUN', 788, 216),
(218, 'TR', 'TURKEY', 'Turkey', 'TUR', 792, 90),
(219, 'TM', 'TURKMENISTAN', 'Turkmenistan', 'TKM', 795, 7370),
(220, 'TC', 'TURKS AND CAICOS ISLANDS', 'Turks and Caicos Islands', 'TCA', 796, 1649),
(221, 'TV', 'TUVALU', 'Tuvalu', 'TUV', 798, 688),
(222, 'UG', 'UGANDA', 'Uganda', 'UGA', 800, 256),
(223, 'UA', 'UKRAINE', 'Ukraine', 'UKR', 804, 380),
(224, 'AE', 'UNITED ARAB EMIRATES', 'United Arab Emirates', 'ARE', 784, 971),
(225, 'GB', 'UNITED KINGDOM', 'United Kingdom', 'GBR', 826, 44),
(226, 'US', 'UNITED STATES', 'United States', 'USA', 840, 1),
(227, 'UM', 'UNITED STATES MINOR OUTLYING ISLANDS', 'United States Minor Outlying Islands', NULL, NULL, 1),
(228, 'UY', 'URUGUAY', 'Uruguay', 'URY', 858, 598),
(229, 'UZ', 'UZBEKISTAN', 'Uzbekistan', 'UZB', 860, 998),
(230, 'VU', 'VANUATU', 'Vanuatu', 'VUT', 548, 678),
(231, 'VE', 'VENEZUELA', 'Venezuela', 'VEN', 862, 58),
(232, 'VN', 'VIET NAM', 'Viet Nam', 'VNM', 704, 84),
(233, 'VG', 'VIRGIN ISLANDS, BRITISH', 'Virgin Islands, British', 'VGB', 92, 1284),
(234, 'VI', 'VIRGIN ISLANDS, U.S.', 'Virgin Islands, U.s.', 'VIR', 850, 1340),
(235, 'WF', 'WALLIS AND FUTUNA', 'Wallis and Futuna', 'WLF', 876, 681),
(236, 'EH', 'WESTERN SAHARA', 'Western Sahara', 'ESH', 732, 212),
(237, 'YE', 'YEMEN', 'Yemen', 'YEM', 887, 967),
(238, 'ZM', 'ZAMBIA', 'Zambia', 'ZMB', 894, 260),
(239, 'ZW', 'ZIMBABWE', 'Zimbabwe', 'ZWE', 716, 263);

DROP TABLE IF EXISTS `reels`;
CREATE TABLE `reels` (
  `reel_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `owner_id` int(11) unsigned NOT NULL,
  `image` varchar(255) NOT NULL default '',
  `video_location` VARCHAR(255) NULL,
  `size` varchar(255) NULL,
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `code` text NULL,
  `duration` varchar(50) NULL,
  `status` tinyint(1) NOT NULL default '1',
  `completed` tinyint(1) NOT NULL default '0',
  `view_privacy` VARCHAR(24) NOT NULL,
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',   
  `approve` tinyint NOT NULL default '1',
  `scheduled` VARCHAR(25) NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`reel_id`),
  KEY `view_privacy` (`view_privacy`),
  KEY `owner_id` (`owner_id`),
  KEY `approve` (`approve`),
  KEY `status` (`status`),
  KEY `scheduled` (`scheduled`),
  KEY `completed` (`completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'create' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');


INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'edit' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');


INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'view' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'edit' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'delete' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'delete' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');


INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'quota' as `name`,
    0 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'storage' as `name`,
    0 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'embedcode' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'sponsored' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'featured' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'hot' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'auto_approve' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'donation' as `name`,
    0 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'sell_movies' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'movie' as `type`,
    'sell_rent_movies' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin','user','moderator');


DROP TABLE IF EXISTS `movies_imports`;
CREATE TABLE `movies_imports` (
  `import_id` int(11) unsigned NOT NULL auto_increment,
  `type` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,  
  `modified_date` datetime NOT NULL,
  `page` int(11) unsigned NOT NULL,
  PRIMARY KEY (`import_id`),
  UNIQUE KEY `unique` (`type`,`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE INTO `movies_imports` (`type`, `category`,`modified_date`,`page`) VALUES
( 'movie', 'popular',NOW() - INTERVAL 10 DAY,1),
( 'movie', 'top_rated',NOW() - INTERVAL 10 DAY,1),
( 'movie', 'upcoming',NOW() - INTERVAL 10 DAY,1),
( 'movie', 'now_playing',NOW() - INTERVAL 10 DAY,1),
( 'tv', 'popular',NOW() - INTERVAL 10 DAY,1),
( 'tv', 'top_rated',NOW() - INTERVAL 10 DAY,1),
( 'tv', 'on_the_air',NOW() - INTERVAL 10 DAY,1),
( 'tv', 'airing_today',NOW() - INTERVAL 10 DAY,1);

DROP TABLE IF EXISTS `live_banners`;
CREATE TABLE `live_banners` (
  `banner_id` int(11) unsigned NOT NULL auto_increment,
  `user_id` int(11) unsigned NOT NULL,
  `text` TEXT NOT NULL,
  `ticker` tinyint(1) NOT NULL default '0',
  `show` tinyint(1) NOT NULL default '0',    
  PRIMARY KEY (`banner_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'member' as `type`,
    'allow_messages' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');
  
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'livestreaming' as `type`,
    'branding_livestreaming' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');

CREATE TABLE `live_brands` (
  `brand_id` int(11) unsigned NOT NULL auto_increment,
  `user_id` int(11) unsigned NOT NULL,
  `background_color` varchar(255) NULL,
  `text_color` varchar(255) NULL,
  `theme` varchar(255) NULL,
  `logo` varchar(255) NULL,
  `logo_active` tinyint(1) NOT NULL default '1',
  `overlay` varchar(255) NULL,
  `overlay_active` tinyint(1) NOT NULL default '1',
  `redirect_url` varchar(255) NULL,
  PRIMARY KEY (`brand_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `messages` (
  `message_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_id` int(11) UNSIGNED NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `user_resource_id` (`user_id`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `messages_texts` (
  `messages_text_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `message_id` int(11) UNSIGNED NOT NULL,
  `message` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `image` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `video` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `seen` tinyint(1) NOT NULL DEFAULT 0,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`messages_text_id`),
  KEY `message_id` (`message_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `stories`;
CREATE TABLE `stories` (
  `story_id` int(11) unsigned NOT NULL auto_increment,
  `title` VARCHAR(255) NOT NULL DEFAULT 'story',
  `owner_id` int(11) unsigned NOT NULL,
  `type` tinyint(1) unsigned NOT NULL default '0' COMMENT '0-photo,1-video,2-audio,3-text',
  `file` varchar(255) NOT NULL default '',
  `audio_id` int(11) unsigned NOT NULL default '0',
  `image` varchar(255) NULL default '',
  `status` tinyint(1) NOT NULL default '1',
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `background_image` int(11) unsigned NOT NULL default '0',
  `font` VARCHAR(40) NULL,
  `seemore` VARCHAR(255) NULL,
  `text_color` varchar(255) NOT NULL default '#ffffff',
  `view_privacy` VARCHAR(24) NOT NULL,
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',   
  `approve` tinyint NOT NULL default '1',
  `completed` TINYINT(1) NOT NULL DEFAULT '1',
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`story_id`),
  KEY `view_privacy` (`view_privacy`),
  KEY `completed` (`completed`),
  KEY `owner_id` (`owner_id`),
  KEY `approve` (`approve`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `stories_user_settings`;
CREATE TABLE `stories_user_settings` (
  `setting_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `privacy` varchar(45) NOT NULL default 'public',
  PRIMARY KEY (`setting_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `stories_users`;
CREATE TABLE `stories_users` (
  `user_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `story_id` int(11) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UNIQUE` (`owner_id`,`story_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `stories_muted`;
CREATE TABLE `stories_muted` (
  `mute_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `resource_id` int(11) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`mute_id`),
  KEY `owner_id` (`owner_id`),
  KEY `resource_id` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `stories_attachments`;
CREATE TABLE `stories_attachments` (
  `attachment_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) NULL,
  `file` varchar(255) NOT NULL,
  `type` varchar(45) NOT NULL default 'background_image',
  `approve` TINYINT(1) NOT NULL DEFAULT '1',
  `order` int(12) NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`attachment_id`),
  KEY `type` (`type`),
  KEY `order` (`order`),
  KEY `approve` (`approve`),
  KEY `approveOrder` (`approve`,`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `stories_attachments` ( `file`, `type`, `approve`, `order`, `creation_date`) VALUES
( '/upload/images/stories/background/1646241557616_40351129_2163632410574708_8668634735213281280_n.png', 'background_image', 1, 4, NOW()),
( '/upload/images/stories/background/1646241561528_40405650_452537128572519_8149774588180430848_n.png', 'background_image', 1, 5, NOW()),
( '/upload/images/stories/background/1646241564100_40514084_525804507859140_4376480479583404032_n.png', 'background_image', 1, 6, NOW()),
( '/upload/images/stories/background/1646241566874_43877190_291719124775874_7179372009489432576_n.png', 'background_image', 1, 7, NOW()),
( '/upload/images/stories/background/1646241570356_51617388_1009318305928625_4482986936855691264_n.png', 'background_image', 1, 8, NOW()),
( '/upload/images/stories/background/1646241575225_51627537_2013736385406998_2008135126298394624_n.png', 'background_image', 1, 9, NOW()),
('/upload/images/stories/background/1646241578074_51628925_241165290132952_3577861053540728832_n.png', 'background_image', 1, 10, NOW()),
( '/upload/images/stories/background/1646241582010_51695285_459530724584487_5283635580326903808_n.png', 'background_image', 1, 11, NOW()),
( '/upload/images/stories/background/1646241584865_51704502_299352557433930_1558310591364333568_n.png', 'background_image', 1, 12, NOW()),
( '/upload/images/stories/background/1646241587519_51709960_316152732351370_2886250832167174144_n.png', 'background_image', 1, 13, NOW()),
( '/upload/images/stories/background/1646241597712_51721060_1793841944061295_1063735769971032064_n.png', 'background_image', 1, 14, NOW()),
( '/upload/images/stories/background/1646241601937_51756802_367314947184741_2104938466470002688_n.png', 'background_image', 1, 15, NOW()),
( '/upload/images/stories/background/1646241604716_51803344_2173297949665928_4264557780788051968_n.png', 'background_image', 1, 16, NOW()),
( '/upload/images/stories/background/1646241607674_64573208_318989072361867_7052361760598130688_n.png', 'background_image', 1, 17, NOW());

DROP TABLE IF EXISTS `tools_announcements`;
CREATE TABLE `tools_announcements` (
  `announcement_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `level_id` varchar(100) NULL,
  `start_time` datetime NULL,
  `end_time` datetime NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_id`),
  KEY `level_id` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `tools_mass_notifications`;
CREATE TABLE `tools_mass_notifications` (
  `mass_notification_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `level_id` varchar(100) NULL,
  `text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`mass_notification_id`),
  KEY `level_id` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;


DROP TABLE IF EXISTS `tools_channel_subscribe`;
CREATE TABLE `tools_channel_subscribe` (
  `channel_subscribe_id` int(11) unsigned NOT NULL auto_increment,
  `channel_id` int(11) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`channel_subscribe_id`),
  KEY `channel_id` (`channel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `tools_user_subscribe`;
CREATE TABLE `tools_user_subscribe` (
  `user_subscribe_id` int(11) unsigned NOT NULL auto_increment,
  `user_id` int(11) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`user_subscribe_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `tools_delete_videos`;
CREATE TABLE `tools_delete_videos` (
  `delete_video_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `level_id` varchar(100) NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `tags` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `time_interval` TINYINT(10) unsigned NOT NULL,
  `time_duration` varchar(255) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '0',
  `last_process_video_id` INT(11) UNSIGNED NULL DEFAULT '0',
  `delete_video_count` INT(11) UNSIGNED NULL DEFAULT '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`delete_video_id`),
  KEY `time_interval_duration` (`time_interval`,`time_duration`),
  KEY `level_id` (`level_id`),
  KEY `active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `tools_remove_videos`;
CREATE TABLE `tools_remove_videos` (
  `remove_video_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sitename` varchar(255) NOT NULL default '',
  `time_interval` TINYINT(10) unsigned NOT NULL,
  `time_duration` varchar(255) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '0',
  `last_process_video_id` INT(11) UNSIGNED NULL DEFAULT '0',
  `delete_video_count` INT(11) UNSIGNED NULL DEFAULT '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`remove_video_id`),
  KEY `time_interval_duration` (`time_interval`,`time_duration`),
  KEY `active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `tools_newsletters`;
CREATE TABLE `tools_newsletters` (
  `newsletter_id` int(11) unsigned NOT NULL auto_increment,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `level_id` varchar(100) NULL,
  `gender` varchar(45) NULL default '',
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `last_process_user_id` INT(11) UNSIGNED NULL DEFAULT '0',
  `member_count` INT(11) UNSIGNED NULL DEFAULT '0',
  `active` TINYINT(1) NOT NULL DEFAULT '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`newsletter_id`),
  KEY `level_id` (`level_id`),
  KEY `active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

DROP TABLE IF EXISTS `backups`;
CREATE TABLE `backups` (
  `backup_id` int(11) unsigned NOT NULL auto_increment,
  `dirname` varchar(100) NOT NULL,
  `creation_date` datetime NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`backup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;



INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'stories' as `type`,
    'delete' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'stories' as `type`,
    'delete' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'stories' as `type`,
    'view' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'stories' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'stories' as `type`,
    'create' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'stories' as `type`,
    'allowed_types' as `name`,
    'image,video,music' as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');

CREATE TABLE `devices` (
  `device_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `device_udid` varchar(255) NOT NULL,
  `push_token` varchar(255) NOT NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`device_id`),
  UNIQUE KEY `device_udid` (`device_udid`),
  KEY `device_udid_index` (`device_udid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'delete' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'delete' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'edit' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'edit' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'view' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'reels' as `type`,
    'create' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');

CREATE TABLE `user_blocks` (
  `block_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `resource_id` int(11) unsigned NOT NULL,
  `subject_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`block_id`),
  UNIQUE KEY `resource_owner_id` (`resource_id`,`owner_id`),
  KEY `owner_id` (`owner_id`),
  KEY `resource_id` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'openai' as `type`,
    'imagecreate' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'openai' as `type`,
    'imagecreate' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'openai' as `type`,
    'blogcreate' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'openai' as `type`,
    'blogcreate' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'openai' as `type`,
    'descriptioncreate' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('admin');
INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'openai' as `type`,
    'descriptioncreate' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator');

CREATE TABLE IF NOT EXISTS `user_avtar_images` (
  `avtar_id` int(10) UNSIGNED NOT NULL auto_increment,
  `path` varchar(255) NOT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT 1,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`avtar_id`),
  KEY `type` (`type`),
  KEY `enable` (`enable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `currencies` (
  `currency_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `symbol` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `currency` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `currency_value` float NOT NULL DEFAULT 0,
  `default` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `active` tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
  `order` int(11) UNSIGNED NOT NULL DEFAULT 0,
  `gateway_allowed` TEXT DEFAULT NULL,
   PRIMARY KEY (`currency_id`),
   KEY `ID` (`ID`),
   KEY `symbol` (`symbol`),
   KEY `default` (`default`),
   KEY `active` (`active`),
   KEY `order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `currencies` (`currency_id`, `ID`, `symbol`, `currency`, `currency_value`, `default`, `active`, `order`, `gateway_allowed`) VALUES 
(NULL, 'USD', '$', 'United States dollar', '1', '0', '1', '0', NULL),
(NULL, 'MNT', '₮', 'Mongolian Tugrug', '1', '0', '0', '0', NULL),
(NULL, 'AUD', 'A$', 'Australian dollar', '1', '0', '0', '0', NULL),
(NULL, 'CAD', 'CA$', 'Canadian dollar', '1', '0', '0', '0', NULL),
(NULL, 'CZK', 'CZK', 'Czech koruna', '1', '0', '0', '0', NULL),
(NULL, 'DKK', 'DKK', 'Danish krone', '1', '0', '0', '0', NULL),
(NULL, 'EUR', '€', 'Euro', '1', '0', '0', '0', NULL),
(NULL, 'HKD', 'HK$', 'Hong Kong dollar', '1', '0', '0', '0', NULL),
(NULL, 'ILS', '₪', 'Israeli new shekel', '1', '0', '0', '0', NULL),
(NULL, 'MXN', 'MX$', 'Mexican peso', '1', '0', '0', '0', NULL),
(NULL, 'NZD', 'NZ$', 'New Zealand dollar', '1', '0', '0', '0', NULL),
(NULL, 'NOK', 'NOK', 'Norwegian krone', '1', '0', '0', '0', NULL),
(NULL, 'PHP', '₱', 'Philippine peso', '1', '0', '0', '0', NULL),
(NULL, 'PLN', 'PLN', 'Polish złoty', '1', '0', '0', '0', NULL),
(NULL, 'GBP', '£', 'Pound sterling', '1', '0', '0', '0', NULL),
(NULL, 'RUB', 'RUB', 'Russian ruble', '1', '0', '0', '0', NULL),
(NULL, 'SGD', 'SGD', 'Singapore dollar', '1', '0', '0', '0', NULL),
(NULL, 'SEK', 'SEK', 'Swedish krona', '1', '0', '0', '0', NULL),
(NULL, 'CHF', 'CHF', 'Swiss franc', '1', '0', '0', '0', NULL),
(NULL, 'THB', '฿', 'Thai baht', '1', '0', '0', '0', NULL),
(NULL, 'INR', '₹', 'Indian rupee', '1', '0', '0', '0', NULL);

UPDATE `currencies` SET `default` = 1 WHERE ID = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');
UPDATE `transactions` SET `default_currency` = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');
UPDATE `userdetails` SET `preferred_currency` = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');
UPDATE `video_monetizations_withdrawals` SET `currency` = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');
UPDATE `video_monetizations_withdrawals` SET `default_currency` = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');

ALTER TABLE `orders` ADD `currency` VARCHAR(40) NOT NULL default 'USD';
UPDATE `orders` SET `currency` = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');
ALTER TABLE `bankdetails` ADD `change_rate` FLOAT NOT NULL;
ALTER TABLE `bankdetails` ADD `default_currency` VARCHAR(40) NOT NULL default 'USD';
UPDATE `bankdetails` SET `default_currency` = (SELECT `value` from `settings` WHERE `name` = 'payment_default_currency');

INSERT INTO `tasks` (`task_id`, `type`, `started`, `start_time`, `timeout`, `priority`) VALUES (NULL, 'currency', '0', NULL, '3800', '1');

CREATE TABLE `gifts` (
  `gift_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `price` float NOT NULL DEFAULT 0,
  `image` varchar(255) NOT NULL,
  `approve` tinyint(1) NOT NULL DEFAULT '1',
  `used` int(11) UNSIGNED NOT NULL DEFAULT 0,
  `creation_date` datetime NOT NULL,
   PRIMARY KEY (`gift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `notificationtypes` ( `type`, `body`, `content_type`, `vars`) VALUES
( 'gift', '{subject} sent you a gift on {videos}.', 'default', '{\"videos\":\"video\"}');

INSERT IGNORE INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'default', 'gift', '{\"videos\":\"video\"}');


INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'gifts' as `type`,
    'allow' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');

ALTER TABLE `transactions` ADD `tip_id` INT(11) NOT NULL default 0;
INSERT INTO `settings` (`name`, `value`) VALUES
('banktransfer_payout','Account Name:
Account Number:
Bank Name:
Branch Address of Bank:
IFSC Code:'),
('payout_settings','paypal');

ALTER TABLE `video_monetizations_withdrawals` ADD `type` VARCHAR(100) NOT NULL DEFAULT 'paypal',ADD `bank_transfer` TEXT NULL;
ALTER TABLE `users` ADD `payoutType` VARCHAR(50) NOT NULL DEFAULT 'paypal';
ALTER TABLE `users` ADD `bank_transfer` TEXT NULL;
ALTER TABLE `audio` ADD `price` VARCHAR(255) NOT NULL DEFAULT '0';
ALTER TABLE `audio` ADD `purchase_count` INT(11) UNSIGNED NOT NULL AFTER `price`;
ALTER TABLE `audio`  ADD `total_purchase_amount` varchar(255) NOT NULL DEFAULT 0;

INSERT IGNORE INTO `notificationtypes` ( `type`, `body`, `content_type`, `vars`) VALUES
(  'audio_purchased','Thanks for purchasing {audio}.','audio', '{\"audio\":\"audio\"}'),
(  'audio_purchased_owner','Your {audio} is purchased by {subject}.','audio', '{\"audio\":\"audio\"}');

INSERT IGNORE INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'audio', 'audio_purchased', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_purchased_owner', '{\"audio\":\"audio\"}');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'sell_audios' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','moderator','admin');