var passport = require('passport');
var TwitterTokenStrategy = require('passport-twitter-token');
const User = require('./models/users');
var FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
const AppleStrategy = require('@nicokaiser/passport-apple').Strategy;
const axios = require('axios');

module.exports = async function (req, res) {
	return new Promise(async function (resolve, reject) {
		const setting = req.appSettings
		if (setting["social_login_twitter"] == 1) {
			try{
			passport.use(new TwitterTokenStrategy({
				consumerKey: setting.social_login_twitter_apiid,
				consumerSecret: setting.social_login_twitter_apikey,
				includeEmail: true,
				_passReqToCallback: true
			},
				function (token, tokenSecret, profile, done) {
					User.upsertTwitterUser(req, token, tokenSecret, profile, function (err, user) {
						return done(err, user);
					});
				}));
			}catch(e){
				if(process.env.NODE_ENV == "development")
					console.log("error",e)
			}
		}
		if (setting["social_login_fb"] == 1) {
			try{
				passport.use(new FacebookTokenStrategy({
					clientID: setting.social_login_fb_apiid,
					clientSecret: setting.social_login_fb_apikey,
					callbackURL: process.env.PUBLIC_URL + "auth/facebook",
					passReqToCallback:true
				},
					function (req, accessToken, refreshToken, profile, done) {
						User.upsertFbUser(req, accessToken, refreshToken, profile, function (err, user) {
							return done(err, user);
						});
					}));
			}catch(e){
				if(process.env.NODE_ENV == "development")
					console.log("error",e)
			}
		}
		if (setting["social_login_google"] == 1) {
			try{
				passport.use(new GoogleTokenStrategy({
					clientID: setting.social_login_google_apiid,
					clientSecret: setting.social_login_google_apikey,
					callbackURL: process.env.PUBLIC_URL + "auth/google",
					_passReqToCallback: true
				},function (accessToken, refreshToken, profile, done) {
					User.upsertGoogleUser(req, accessToken, refreshToken, profile, function (err, user) {
						return done(err, user);
					});
				}));
			}catch(e){
				if(process.env.NODE_ENV == "development")
					console.log("error",e)
			}
		}

		if (setting["social_login_apple"] == 1) {
			const fs = require("fs");
			let url = ""
			let key = ""
			if(req.appSettings.upload_system == "s3"){
				url = "https://" + req.appSettings.s3_bucket + ".s3.amazonaws.com";
				await axios.get(url+setting.social_login_apple_p8).then(response => {
					key = response.data				
				});
			}else if (req.appSettings.upload_system == "wisabi") {
				url = "https://s3.wasabisys.com/"+req.appSettings.s3_bucket ;
				await axios.get(url+setting.social_login_apple_p8).then(response => {
					key = response.data				
				});
			}else{
				url = req.serverDirectoryPath+"/public"
				key = fs.readFileSync(url+setting.social_login_apple_p8)
			}
			try{
				passport.use('apple',new AppleStrategy({
					clientID: setting.social_login_apple_clientid,
					teamID: setting.social_login_apple_teamid,
					callbackURL: process.env.PUBLIC_URL + "/auth/apple",
					keyID: setting.social_login_apple_keyid,
					key:key,
					passReqToCallback:true,
					scope: ['name', 'email'],
				}, function(req, accessToken, refreshToken, profile, cb) {
					User.upsertAppleUser(req, accessToken, refreshToken, profile, function (err, user) {
						return cb(err, user);
					});
				}));
			}catch(e){
				if(process.env.NODE_ENV == "development")
					console.log("error",e)
			}
		}

		resolve()
	})
};