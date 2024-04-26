const commonFunction = require("../functions/commonFunctions")
const i18n = require('i18next');
const slideshow = require("../models/slideshow")
const globalModel = require("../models/globalModel")
const uniqid = require('uniqid')
const channelVideosModel = require("../models/channelvideos")
const videoModel = require("../models/videos")
const channelModel = require("../models/channels")
const videoCategoryModel = require("../models/categories")
const reelsModel = require("../models/reels")
const storiesModel = require("../models/stories")
const audioModel = require("../models/audio")
const movieModel = require("../models/movies")
const async = require('async')
const notificationModel = require("../models/notifications")
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const socketio = require("../socket")
const emailFunction = require("../functions/emails")
const dateTime = require("node-datetime")
const videoController = require("./api/video")
const reelsController = require("./api/reels")
const storiesController = require("./api/stories")
const paymentController = require("./admin/payments")
const movieController = require("./api/movie")
const importMovies = require("./importMovies")
const recurringFunctions = require("../functions/recurring-paypal")
const axios = require('axios');
const https = require('https');

exports.pages = async (req, res, next) => {

    var id = req.params.id
    let pageData = {}
    await globalModel.custom(req,"SELECT * from pages WHERE url = ?",[id]).then(results => {
        if(results){
            const data = JSON.parse(JSON.stringify(results));
            if(data.length){
                pageData = data[0]
            }
        }
    })
    if(!Object.keys(pageData).length){
        next()
        return
    }
    await commonFunction.getGeneralInfo(req, res, pageData.type)
    req.query.pageContent = pageData.content
    if(pageData.banner){
        await commonFunction.updateMetaData(req,{banner:pageData.banner})
    }
    return res.send({...req.query,page_type:"pages"});
    
}

exports.privacy = async (req, res, next) => {
    await commonFunction.getGeneralInfo(req, res, 'privacy')
    return res.send({...req.query,page_type:"privacy"});
   
}
exports.terms = async (req, res, next) => {
    await commonFunction.getGeneralInfo(req, res, 'terms')
    return res.send({...req.query,page_type:"terms"});
   
}

exports.contact = async (req, res, next) => {
    await commonFunction.getGeneralInfo(req, res, 'contact_us')
    return res.send({...req.query,page_type:"contact"});
    
}
exports.index = async (req, res, next) => {

    const lang = req.params.lng
    const data = req.params.data
    // if (lang) {
    //     if (req.i18n.languages && req.i18n.languages.indexOf(lang) < 0) {
    //         next()
    //         return
    //     }
    // }
    
    await commonFunction.getGeneralInfo(req, res, 'landing_page')
    if (data) {
        next()
        return
    }
    //slideshow data
    await slideshow.findAll(req, {enabled:1}).then(result => {
        if (result && result.length > 0)
            req.query.slideshow = result
    })
    if(req.session.logout){
        req.query.logout = true
        req.session.logout = false
    }

    let user_level_id = 0
    if(req.user){
        user_level_id = req.user.level_id
    }

    //announcements
    let condition = []
    let sql = "SELECT description from tools_announcements where 1 = 1 "

    
    condition.push(user_level_id)
    sql += " AND ( level_id IS NULL || level_id = '' || FIND_IN_SET(?, level_id) > 0 )"
    
    sql += " ORDER BY RAND() LIMIT 1"

    await globalModel.custom(req,sql,condition).then(async results => {
        if(results && results.length > 0){
            let items = JSON.parse(JSON.stringify(results))[0];
            req.query.announcements = items
        }
    });


    
    //get featured, sponsored, hot and latest videos
    req.query.videos = {}
    if (req.appSettings["video_featured"] == 1) {
        var cachedData = myCache.get("home_video_featured")
        if (!cachedData) {
            await videoModel.getVideos(req, { is_featured: 1, limit:req.query.themeType == 2 ? 10 : 10, orderby: "random" }).then(result => {
                if (result && result.length > 0) {
                    req.query.videos['featured'] = result
                    myCache.set('home_video_featured', result, req.ttlTime)
                }
            })

        } else {
            req.query.videos['featured'] = cachedData
        }
    }
    if (req.appSettings["video_sponsored"] == 1) {
        var cachedData = myCache.get("home_video_sponsored")
        if (!cachedData) {
            await videoModel.getVideos(req, { is_sponsored: 1, limit: req.query.themeType == 2 ? 10 : 10, orderby: "random" }).then(result => {
                if (result && result.length > 0) {
                    req.query.videos['sponsored'] = result
                    myCache.set('home_video_sponsored', result, req.ttlTime)
                }
            })

        } else {
            req.query.videos['sponsored'] = cachedData
        }
    }
    if (req.appSettings["video_hot"] == 1) {
        var cachedData = myCache.get("home_video_hot")
        if (!cachedData) {
            await videoModel.getVideos(req, { is_hot: 1, limit: req.query.themeType == 2 ? 10 : 10, orderby: "random" }).then(result => {
                if (result && result.length > 0) {
                    req.query.videos['hot'] = result
                    myCache.set('home_video_hot', result, req.ttlTime)
                }
            })
        } else {
            req.query.videos['hot'] = cachedData
        }
    }

    var cachedData = myCache.get("home_video_recent")
    if (!cachedData) {
        await videoModel.getVideos(req, { is_not_hot: 1, is_not_sponsored: 1, is_not_featured: 1, limit: req.query.themeType == 2 ? 10 : 10 }).then(result => {
            if (result && result.length > 0) {
                req.query.videos['recent_videos'] = result
                myCache.set('home_video_recent', result, req.ttlTime)
            }
        })
    } else {
        req.query.videos['recent_videos'] = cachedData
    }


    //reels
    if(parseInt(req.appSettings["enable_reels"]) == 1 && (req.levelPermissions["reels.view"] == 1 || req.levelPermissions["reels.view"] == 2)){
        await reelsModel.getReels(req,{limit:9}).then(result => {
            req.query.reels = {}
            let reelPage = 9
            req.query.reels.pagging = false
            let items = result
            if (result.length > reelPage - 1) {
                items = result.splice(0, reelPage - 1);
                req.query.reels.pagging = true
            }
            
            req.query.reels.results = items
        }).catch(error => {
            
        })
    }

    //stories data
    if(parseInt(req.appSettings["enable_stories"]) == 1 && (req.levelPermissions["stories.view"] == 1 || req.levelPermissions["stories.view"] == 2)){
        //story privacy
        if(req.user){
            await storiesModel.getStoryPrivacy(req,req.user.user_id).then(res => {
                if(res){
                    req.query.storyPrivacy = res.privacy
                }
            })
        }
        //get background images
       await storiesModel.getBackgroundImages(req).then(res => {
           if(res){
               req.query.storiesBackground = res
           }
       });
       //get all user stories
       let storyPage = 16 
       await storiesModel.getUserStories(req,{limit:storyPage}).then(result => {
            if(result){
                req.query.stories = {}
                req.query.stories.pagging = false
                let items = result
                if (result.length > storyPage - 1) {
                    items = result.splice(0, storyPage - 1);
                    req.query.stories.pagging = true
                }
                if(req.user && req.levelPermissions["stories.create"] == 1){
                    items.unshift({type:"create",owner_id:0})
                }
                req.query.stories.results = items
            }
       });
    }
    res.send({...req.query,page_type:"index"})
}

exports.homeData = async (req,res) => {

    //get live streamer
    if(req.appSettings['video_tip'] == 1){
        var cachedData = myCache.get("video_tip")
        if (!cachedData) {
            await videoModel.donorsOfTheMonth( { limit: 10,offthemonth:true},req).then(result => {
                if (result && result.length > 0) {
                    req.query.livestreamers = result
                    myCache.set('video_tip', result, req.ttlTime)
                }
            })
        } else {
            req.query.livestreamers = cachedData
        }
    }

    //get featured, sponsored, hot and latest movies
    if(req.appSettings['enable_movie'] == 1){
        req.query.movies = {}
        req.contentType = "movies";
        if (req.appSettings["movie_featured"] == 1) {
            var cachedData = myCache.get("home_movie_featured")
            if (!cachedData) {
                await movieModel.getMovies(req, { is_featured: 1, limit: 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.movies['featured'] = result
                        myCache.set('home_movie_featured', result, req.ttlTime)
                    }
                })

            } else {
                req.query.movies['featured'] = cachedData
            }
        }
        if (req.appSettings["movie_sponsored"] == 1) {
            var cachedData = myCache.get("home_movie_sponsored")
            if (!cachedData) {
                await movieModel.getMovies(req, { is_sponsored: 1, limit: 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.movies['sponsored'] = result
                        myCache.set('home_movie_sponsored', result, req.ttlTime)
                    }
                })

            } else {
                req.query.movies['sponsored'] = cachedData
            }
        }
        if (req.appSettings["movie_hot"] == 1) {
            var cachedData = myCache.get("home_movie_hot")
            if (!cachedData) {
                await movieModel.getMovies(req, { is_hot: 1, limit: 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.movies['hot'] = result
                        myCache.set('home_movie_hot', result, req.ttlTime)
                    }
                })

            } else {
                req.query.movies['hot'] = cachedData
            }
        }

        var cachedData = myCache.get("home_movie_recent")
        if (!cachedData) {
            await movieModel.getMovies(req, { is_not_hot: 1, is_not_sponsored: 1, is_not_featured: 1, limit: 10 }).then(result => {
                if (result && result.length > 0) {
                    req.query.movies['recent_movies'] = result
                    myCache.set('home_movie_recent', result, req.ttlTime)
                }
            })

        } else {
            req.query.movies['recent_movies'] = cachedData
        }

        //get series
        req.contentType = "series";
        req.query.series = {}
        if (req.appSettings["movie_featured"] == 1) {
            var cachedData = myCache.get("home_series_featured")
            if (!cachedData) {
                await movieModel.getMovies(req, { is_featured: 1, limit: 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.series['featured'] = result
                        myCache.set('home_series_featured', result, req.ttlTime)
                    }
                })

            } else {
                req.query.series['featured'] = cachedData
            }
        }
        if (req.appSettings["movie_sponsored"] == 1) {
            var cachedData = myCache.get("home_series_sponsored")
            if (!cachedData) {
                await movieModel.getMovies(req, { is_sponsored: 1, limit: 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.series['sponsored'] = result
                        myCache.set('home_series_sponsored', result, req.ttlTime)
                    }
                })

            } else {
                req.query.series['sponsored'] = cachedData
            }
        }
        if (req.appSettings["movie_hot"] == 1) {
            var cachedData = myCache.get("home_series_hot")
            if (!cachedData) {
                await movieModel.getMovies(req, { is_hot: 1, limit: 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.series['hot'] = result
                        myCache.set('home_series_hot', result, req.ttlTime)
                    }
                })

            } else {
                req.query.series['hot'] = cachedData
            }
        }

        var cachedData = myCache.get("home_series_recent")
        if (!cachedData) {
            await movieModel.getMovies(req, { is_not_hot: 1, is_not_sponsored: 1, is_not_featured: 1, limit: 10 }).then(result => {
                if (result && result.length > 0) {
                    req.query.series['recent_series'] = result
                    myCache.set('home_series_recent', result, req.ttlTime)
                }
            })

        } else {
            req.query.series['recent_series'] = cachedData
        }

        req.contentType = null;
    }

    if (req.appSettings["enable_audio"] == 1) {
        var cachedData = myCache.get("home_audio_recent")
        if (!cachedData) {
            await audioModel.getAudios(req, { limit: 10, orderby: "random" }).then(result => {
                if (result && result.length > 0) {
                    req.query.audio = result
                    myCache.set('home_audio_recent', result, req.ttlTime)
                }
            })

        } else {
            req.query.audio = cachedData
        }
    }
    if (req.appSettings["enable_channel"] == 1) {
        //get featured, sponsored, hot channels and latest channels
        req.query.channels = {}
        if (req.appSettings["channel_featured"] == 1) {
            var cachedData = myCache.get("home_channel_featured")
            if (!cachedData) {
                await channelModel.getChannels(req, { is_featured: 1, limit: req.query.themeType == 2 ? 10 : 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.channels['featured'] = result
                        myCache.set('home_channel_featured', result, req.ttlTime)
                    }
                })

            } else {
                req.query.channels['featured'] = cachedData
            }
        }
        if (req.appSettings["channel_sponsored"] == 1) {
            var cachedData = myCache.get("home_channel_sponsored")
            if (!cachedData) {
                await channelModel.getChannels(req, { is_sponsored: 1, limit: req.query.themeType == 2 ? 10 : 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.channels['sponsored'] = result
                        myCache.set('home_channel_sponsored', result, req.ttlTime)
                    }
                })

            } else {
                req.query.channels['sponsored'] = cachedData
            }
        }

        await channelModel.findAllCommunity(0,req,res,req.query["themeType"] == 2 ? 10 : 5,0,0).then(result => {
            if (result && result.length > 0) {
                req.query.channels['posts'] = result
            }
        })
        if (req.appSettings["channel_hot"] == 1) {
            var cachedData = myCache.get("home_channel_hot")
            if (!cachedData) {
                await channelModel.getChannels(req, { is_hot: 1, limit: req.query.themeType == 2 ? 10 : 10, orderby: "random" }).then(result => {
                    if (result && result.length > 0) {
                        req.query.channels['hot'] = result
                        myCache.set('home_channel_hot', result, req.ttlTime)
                    }
                })

            } else {
                req.query.channels['hot'] = cachedData
            }
        }
        var cachedRecentChannel = myCache.get("home_channel_recent")
        if (!cachedRecentChannel) {
            await channelModel.getChannels(req, { is_not_hot: 1, is_not_sponsored: 1, is_not_featured: 1, limit: req.query.themeType == 2 ? 10 : 10 }).then(result => {
                if (result && result.length > 0) {
                    req.query.channels['recent_channels'] = result
                    myCache.set('home_channel_recent', result, req.ttlTime)
                }
            })

        } else {
            req.query.channels['recent_channels'] = cachedRecentChannel
        }
       
    }
    var cachedVideoCategories = myCache.get("home_video_categories")
    if (!cachedVideoCategories) {
        //fetch top 5 categories data and rest categories will come from page load
        await videoCategoryModel.findAll(req, { type: 'video', onlyCategories: 1, item_count: 1,limit:20 }).then(async results => {
            if (results && results.length > 0) { 
                req.query.videoCategories = results
                myCache.set('home_video_categories', results, req.ttlTime)
            }
        })
    } else {
        req.query.videoCategories = cachedVideoCategories
    }
    if (req.query.videoCategories && req.query.videoCategories.length > 0) {
        var cachedCategoriesVideos = myCache.get("home_categories_videos")
        if (!cachedCategoriesVideos) {
            await exports.categories(req, req.query.videoCategories).then(res => { })
            myCache.set('home_categories_videos', req.query.categoryVideos, req.ttlTime)
        } else {
            req.query.categoryVideos = cachedCategoriesVideos
        }
    }
    res.send({ data: req.query })
    return
}

exports.categories = async (req, results) => {
    const categoriesVideos = []
    return new Promise(async function (resolve, reject) {
        for(let i=0;i<results.length;i++){
            let category = results[i];
            const data = {}
            data.category_id = category.category_id
            data.limit = req.query.themeType == 2 ? 10 : 5
            if(category.show_home == 1){
                await videoModel.getVideos(req, data).then(async videos => {
                    if (videos && videos.length > 0) {
                        const dataCategory = {}
                        dataCategory["category"] = category
                        dataCategory['videos'] = videos
                        categoriesVideos.push(dataCategory)
                    }
                })
            }
        }
        req.query.categoryVideos = categoriesVideos
        resolve("")
    })
}

exports.notFound = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'page_not_found')
    res.send({...req.query,pagenotfound: 1});
}
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  exports.importChannelVideoA = (req,channelInfo) => {
    return new Promise(function(resolve,reject){
        const settings = require("../models/settings")
        if(!channelInfo['importchannel_id'] || !req.appSettings['youtube_api_key']){
            resolve(true)
        }
        let channelID = channelInfo.importchannel_id
        const https = require('https');
        const agent = new https.Agent({
            rejectUnauthorized: false
        });
        let reqData = {}
        //reqData["order"] = "date"
        reqData["channelId"] = channelID
        reqData["maxResults"] = "100"
        reqData["key"] = req.appSettings['youtube_api_key'] 
        // reqData["eventType"] = "completed"
        reqData["type"] = "video"
        reqData["part"] = "snippet"
        reqData["videoEmbeddable"] = "true"
        if(req.appSettings['import_pageToken'])
            reqData["pageToken"] = req.appSettings['import_pageToken']
        // else if(req.appSettings['old_import_time'])
        //     reqData["publishedAfter"] = req.appSettings['old_import_time']            
       
        axios.get("https://www.googleapis.com/youtube/v3/search",{
            params:reqData
        })
        .then(async function (response) {
            if(response.data.items && response.data.items.length){
                let updatedObject = {}
                //update after time import
                // if(req.appSettings['import_old_finish'] || !req.appSettings['old_import_time']){
                //     let pubDate =  new Date(response.data.items[0].snippet.publishedAt)
                //     //add 1 second
                //     //pubDate.setTime(pubDate.getTime() + 1000);
                //     updatedObject['old_import_time'] = pubDate.toISOString();
                // }
                //if(!req.appSettings['import_old_finish']){
                    let status = 'pending';
                    if(response.data.nextPageToken)
                        updatedObject['import_pageToken'] = response.data.nextPageToken
                    else{
                        status = "completed"
                        updatedObject['import_pageToken'] = null
                        // updatedObject['import_old_finish'] = true
                    }
                //}
                settings.setSettings(req, updatedObject)
                await exports.getImportVideosYoutube(req,response.data.items,channelInfo);
                resolve({status:status,error:null});
            }else{
                //update after time import
                settings.setSettings(req, {import_pageToken:null})
                resolve({status:"completed"});
            }        
        })
        .catch(function (error) {
            resolve({status:"error",error:error});
        });
    });
}
exports.getImportVideosYoutube = async (req, results,channelInfo) => {
    return new Promise(async function (resolve, reject) {
        let channelData = JSON.parse(channelInfo.params);
        if(!channelData.fromAdmin){
            const privacyLevelModel = require("../models/levelPermissions")
            await privacyLevelModel.findBykey(req,"video",'sponsored',channelData.level_id).then(result => {
                channelInfo["is_sponsored"] = result  == 1 ? 1 : 0
            })
            await privacyLevelModel.findBykey(req,"video",'featured',channelData.level_id).then(result => {
                channelInfo["is_featured"] = result  == 1 ? 1 : 0
            })
            await privacyLevelModel.findBykey(req,"video",'hot',channelData.level_id).then(result => {
                channelInfo["is_hot"] = result  == 1 ? 1 : 0
            })
            await privacyLevelModel.findBykey(req,"video",'auto_approve',channelData.level_id).then(result => {
                channelInfo["approve"] = result  == 1 ? 1 : 0
            })
        }
        async.forEachOf(results, async function (videoData, i, callback) {
            await commonFunction.getVideoData("youtube", videoData.id.videoId, req, null).then(async result => {
                if (result) {
                    let ownerID = channelData.owner_id
                    let insertObject = {}                    
                    insertObject['owner_id'] = ownerID
                    insertObject['code'] = result.code
                    //check video exists for this user
                    var isValid = true
                    if(channelData.fromAdmin){
                        await globalModel.custom(req,"SELECT video_id FROM videos WHERE owner_id = ? AND code = ? AND type = ?",[ownerID,result.code,1]).then(result => {
                            if(result && result.length){
                                isValid = false
                            }
                        });
                    }
                    if(isValid){
                        insertObject['title'] = result.title
                        insertObject['description'] = result.description
                        insertObject['duration'] = result.duration
                        insertObject['tags'] = result.tags ? result.tags.join(",") : ""
                        insertObject['image'] = result.image
                        insertObject['custom_url'] = uniqid.process('v')
                        insertObject['type'] = 1
                        insertObject['search'] = 1
                        insertObject['status'] = 1
                        insertObject['approve'] = 1
                        insertObject['completed'] = 1
                        insertObject['view_privacy'] = "everyone"
                        if(!channelData.fromAdmin){
                            insertObject["is_sponsored"] = channelInfo.is_sponsored ? channelInfo.is_sponsored : 0
                            insertObject["is_featured"] = channelInfo.is_featured ? channelInfo.is_featured : 0
                            insertObject["is_hot"] = channelInfo.is_hot ? channelInfo.is_hot : 0
                            insertObject["approve"] = channelInfo.approve ? channelInfo.approve : 1
                        }else{
                            insertObject["is_sponsored"] = parseInt(channelData['is_sponsored']) == 1 ? 1 : 0
                            insertObject["is_featured"] = parseInt(channelData['is_featured']) == 1 ? 1 : 0
                            insertObject["is_hot"] = parseInt(channelData['is_hot']) == 1 ? 1 : 0
                            insertObject["adult"] = parseInt(channelData['adult']) ? 1 : 0
                            insertObject["like_count"] = parseInt(channelData['like_count']) ? parseInt(channelData['like_count']) : 0
                            insertObject["dislike_count"] = parseInt(channelData['dislike_count']) ? parseInt(channelData['dislike_count']) : 0

                            insertObject["view_count"] = parseInt(channelData['dislike_count']) ? parseInt(channelData['view_count']) : 0
                            insertObject["favourite_count"] = parseInt(channelData['favourite_count']) ? parseInt(channelData['favourite_count']) : 0
                            insertObject["category_id"] = parseInt(channelData['category_id']) ? parseInt(channelData['category_id']) : 0
                            insertObject["subcategory_id"] = parseInt(channelData['subcategory_id']) ? parseInt(channelData['subcategory_id']) : 0
                            insertObject["subsubcategory_id"] = parseInt(channelData['subcategory_id']) ?  parseInt(channelData['subcategory_id']) : 0
                        }
                        insertObject['creation_date'] = dateTime.create().format("Y-m-d H:M:S")
                        insertObject['modified_date'] = dateTime.create().format("Y-m-d H:M:S")
                        await globalModel.create(req,insertObject,"videos").then(async result => {
                            if(channelInfo.channel_id && parseInt(channelInfo.channel_id) != 0){
                                await exports.insertVideos(req, result.insertId, channelInfo.channel_id).then(result => {
                                    if (result) {
                                        
                                    }
                                })
                            }
                        });
                    }
                }
            })
            if (i == results.length - 1) {
                resolve(true)
            }
        }, function (err) {
            resolve(true)
        });
    })
}
exports.insertVideos = async (req, video_id, channel_id) => {
    return new Promise(async function (resolve, reject) {
        var dt = dateTime.create()
        var formatted = dt.format('Y-m-d H:M:S')
        const channelVideoObj = []
        channelVideoObj.push(video_id)
        channelVideoObj.push(channel_id)
        channelVideoObj.push(req.user.user_id)
        channelVideoObj.push(formatted)
        await channelVideosModel.insert(channelVideoObj, req, channel_id)
        resolve(true);
    })
}
exports.cronFunction = async(req,res,next) => {
    return new Promise(function(resolve, reject) { 
        req.getConnection(function(err,connection){

            //update video and movies task if not run from last 3 hours
            connection.query("UPDATE tasks SET started = 0,start_time = ? WHERE (type = ? || type = ? || type = ? || type = ? || type = ? || type = ? || type = ? || type = ? || type = ? || type = ? || type = ? || type = ?) AND started = 1 AND DATE_ADD(start_time, INTERVAL 3 hour) <= ? ", [dateTime.create().format("Y-m-d H:M:S"),"channelVideoImport","notifications","movieImportIMDB","videoEncode","movieVideoEncode","movieImportIMDB","movieImportChangeIMDB","autoDeleteVideos","autoDeleteImportedVideos","newsletters","reelsVideoEncode","storiesVideoEncode",dateTime.create().format("Y-m-d H:M:S")], async function (err, results, fields) {

                connection.query("SELECT * from tasks WHERE started = 0 AND (start_time IS NULL || DATE_ADD(start_time, INTERVAL `timeout` second) <= ? ) ORDER BY priority ASC", [dateTime.create().format("Y-m-d H:M:S")], async function (err, results, fields) {
                    if (!err) {
                    await asyncForEach(results, async (notification, i) => {
                        let taskResult = JSON.parse(JSON.stringify(results[i]))
                        if (taskResult.type == "notifications") {
                            await notificationModel.findAll(req, { limit: 200, notification_send: 2 }).then(async result => {
                                
                                //set cron started
                                connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                    
                                })
                                if (result && result.length > 0) {
                                    await asyncForEach(result, async (data, i) => {
                                        await notificationModel.getNotification(req, data).then(async result => {
                                            
                                            if (result) {
                                                globalModel.custom(req, "UPDATE notifications SET notification_send = 1 WHERE notification_id = ?", [result.notification_id]).then(result => { }).catch(err => { })
                                                socketio.getIO().emit('notifications', {
                                                    owner_id: result.owner_id,
                                                    notification: result
                                                });
                                                let column = "video_id"
                                                if (result.object_type == "channels") {
                                                    column = "channel_id"
                                                } else if (result.object_type == "blogs") {
                                                    column = "blog_id"
                                                } else if (result.object_type == "members") {
                                                    column = "user_id"
                                                } else if (result.object_type == "artists") {
                                                    column = "artist_id"
                                                } else if (result.object_type == "playlists") {
                                                    column = "playlist_id"
                                                } else if (result.object_type == "comments") {
                                                    column = "comment_id"
                                                }else if (result.object_type == "reels") {
                                                    column = "reel_id"
                                                }else if (result.object_type == "stories") {
                                                    column = "story_id"
                                                }else if (result.object_type == "audio") {
                                                    column = "audio_id"
                                                }
                                                //email notifications
                                                await globalModel.custom(req, 'SELECT ' + result.object_type + '.' + (column == "user_id" ? "user_id" : "owner_id") + ',emailsettings.type FROM ' + result.object_type + ' LEFT JOIN emailsettings ON emailsettings.owner_id = ' + result.object_type + '.' + (column == "user_id" ? "user_id" : "owner_id") + ' AND emailsettings.type = "' + result.type + '" AND emailsettings.email = 0 WHERE ' + column + " = ? ", [result.object_id]).then(async results => {
                                                    let emailNotificationEnable = true
                                                    if (results) {
                                                        const item = JSON.parse(JSON.stringify(results));
                                                        if (item.length > 0) {
                                                            if (item[0].type) {
                                                                emailNotificationEnable = false
                                                            }
                                                        }
                                                    }
                                                    if (emailNotificationEnable) {
                                                        await globalModel.custom(req, "SELECT * FROM users LEFT JOIN userdetails ON userdetails.user_id = users.user_id WHERE users.user_id = ?", [result.owner_id]).then(async ownerData => {
                                                            if (ownerData) {
                                                                await globalModel.custom(req, "SELECT vars,type FROM emailtemplates WHERE type = ?", [result.type]).then(async resultsType => {
                                                                    if (resultsType) {
                                                                        const typeData = JSON.parse(JSON.stringify(resultsType))[0];
                                                                        result.vars = typeData.vars
                                                                        result.type = typeData.type
                                                                        result.ownerEmail = ownerData[0]
                                                                        result.toName = ownerData[0].displayname
                                                                        result.toEmail = ownerData[0].email
                                                                        i18n.changeLanguage( ownerData[0].language)
                                                                        req.i18n = i18n
                                                                        await emailFunction.sendMessage(req, result,false).then(emailData => {
                                                                            //email send
                                                                        }).catch(err => {
                                                                            
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    })
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "videoEncode") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from videos WHERE completed = 0 AND type = 3 AND custom_url != '' LIMIT "+(parseInt(req.appSettings["video_process_type"]) > 0 ? parseInt(req.appSettings['video_process_type']) : (parseInt(req.appSettings["video_process_type"]) == 0 ? 50 : 1)), [], async function (err, results, fields) {
                                if (!err) {
                                    let videos = JSON.parse(JSON.stringify(results))
                                    if(videos.length){
                                        await asyncForEach(videos, async (data, i) => {
                                            await videoController.convertVideo(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if(taskResult.type == "currency"){
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            await paymentController.updateValues(req,null);
                            connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                            })
                        }
                        if (taskResult.type == "reelsVideoEncode") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from reels WHERE completed = 0 AND view_privacy != '' LIMIT "+(parseInt(req.appSettings["reels_process_type"]) > 0 ? parseInt(req.appSettings['reels_process_type']) : (parseInt(req.appSettings["reels_process_type"]) == 0 ? 50 : 1)), [], async function (err, results, fields) {
                                if (!err) {
                                    let reels = JSON.parse(JSON.stringify(results))
                                    if(reels.length){
                                        await asyncForEach(reels, async (data, i) => {
                                            await reelsController.convertVideo(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "storiesVideoEncode") {
                            //find stories
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from stories WHERE completed = 0 LIMIT 5", [], async function (err, results, fields) {
                                if (!err) {
                                    let stories = JSON.parse(JSON.stringify(results))
                                    if(stories.length){
                                        await asyncForEach(stories, async (data, i) => {
                                            await storiesController.convertVideo(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "autoDeleteVideos") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from tools_delete_videos WHERE active != '1' LIMIT 1", [], async function (err, results, fields) {
                                if (!err) {
                                    let items = JSON.parse(JSON.stringify(results))
                                    if(items.length){
                                        await asyncForEach(items, async (data, i) => {
                                            await videoController.autoDeleteVideos(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "autoDeleteImportedVideos") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from tools_remove_videos WHERE active != '1' LIMIT 1", [], async function (err, results, fields) {
                                if (!err) {
                                    let items = JSON.parse(JSON.stringify(results))
                                    if(items.length){
                                        await asyncForEach(items, async (data, i) => {
                                            await videoController.autoDeleteImportedVideos(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "newsletters") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from tools_newsletters WHERE active != '1' LIMIT 1 ", [], async function (err, results, fields) {
                                if (!err) {
                                    let items = JSON.parse(JSON.stringify(results))
                                    if(items.length){
                                        await asyncForEach(items, async (data, i) => {
                                            await exports.newsletters(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "movieVideoEncode") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT movie_videos.*,movies.category from movie_videos LEFT JOIN movies ON movies.movie_id = movie_videos.movie_id WHERE movie_videos.completed = 0 AND movie_videos.type = 'upload' AND movie_videos.movie_id != 0 LIMIT "+(parseInt(req.appSettings["movie_process_type"]) > 0 ? parseInt(req.appSettings['movie_process_type']) :  (parseInt(req.appSettings["movie_process_type"]) == 0 ? 50 : 1) ), [], async function (err, results, fields) {
                                if (!err) {
                                    let videos = JSON.parse(JSON.stringify(results))
                                    if(videos.length){
                                        await asyncForEach(videos, async (data, i) => {
                                            await movieController.convertVideo(req,data).then(result => {})
                                        });
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if(taskResult.type == "walletPaymentChannels"){
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {})
                            let currenttime = dateTime.create().format("Y-m-d H:M:S")
                            let sql = "SELECT `subscriptions`.*,channels.channel_subscription_amount,channels.owner_id as channel_owner_id FROM `subscriptions` INNER JOIN `channels` ON channels.channel_id = subscriptions.id INNER JOIN `users` ON users.user_id = subscriptions.owner_id AND subscriptions.type = 'channel_subscription' INNER JOIN `userdetails` ON userdetails.user_id =users.user_id WHERE (CASE WHEN expiration_date IS NULL THEN false WHEN expiration_date IS NOT NULL THEN expiration_date < '"+currenttime+"' ELSE false END ) AND (subscriptions.status = 'completed') AND subscriptions.type = 'channel_subscription' AND (users.user_id IS NOT NULL) ORDER BY `subscriptions`.`expiration_date` ASC LIMIT 100";
                            await globalModel.custom(req,sql).then(async results => {
                                let subscriptions = JSON.parse(JSON.stringify(results))
                                if(subscriptions.length){
                                    await asyncForEach(subscriptions, async (subscription, i) => {
                                        await recurringFunctions.channelSubscription(req,subscription);
                                    });
                                }  
                            })
                            connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                            })
                        }
                        if(taskResult.type == "userPlanExpiry"){
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {})
                            let currenttime = dateTime.create().format("Y-m-d H:M:S")
                            let sql = "SELECT `subscriptions`.*,member_plans.*,users.user_id FROM `subscriptions` INNER JOIN `member_plans` ON member_plans.member_plan_id = subscriptions.package_id INNER JOIN `users` ON users.user_id = subscriptions.owner_id AND subscriptions.type = 'user_subscribe' INNER JOIN `userdetails` ON userdetails.user_id =users.user_id WHERE (CASE WHEN expiration_date IS NULL THEN false WHEN expiration_date IS NOT NULL THEN expiration_date < '"+currenttime+"' ELSE false END ) AND (subscriptions.status = 'completed') AND subscriptions.type = 'user_subscribe' AND (users.user_id IS NOT NULL) ORDER BY `subscriptions`.`expiration_date` ASC LIMIT 100";
                            
                            await globalModel.custom(req,sql).then(async results => {
                                let subscriptions = JSON.parse(JSON.stringify(results))
                                if(subscriptions.length){
                                    await asyncForEach(subscriptions, async (subscription, i) => {
                                        await recurringFunctions.MembersSubscription(req,subscription);
                                    });
                                }  
                            })
                            connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                            })
                        }
                        if(taskResult.type == "userDowngrade") {
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {})
                            let currenttime = dateTime.create().format("Y-m-d H:M:S")
                            let sql = "SELECT `subscriptions`.*, `packages`.* FROM `subscriptions` INNER JOIN `users` ON users.user_id =subscriptions.id AND subscriptions.type = 'member_subscription' INNER JOIN `packages` ON packages.package_id = subscriptions.package_id INNER JOIN `userdetails` ON userdetails.user_id =users.user_id WHERE (CASE WHEN expiration_date IS NULL THEN false WHEN expiration_date IS NOT NULL THEN expiration_date < '"+currenttime+"' ELSE false END ) AND (subscriptions.status = 'active' || subscriptions.status = 'completed' || subscriptions.status = 'approved') AND subscriptions.is_level_change = 0 AND subscriptions.type = 'member_subscription' AND (users.user_id IS NOT NULL) AND (packages.package_id IS NOT NULL) ORDER BY `subscriptions`.`expiration_date` ASC LIMIT 100";
                            await globalModel.custom(req,sql).then(async results => {
                                let subscriptions = JSON.parse(JSON.stringify(results))
                                if(subscriptions.length){
                                    await asyncForEach(subscriptions, async (subscription, i) => {
                                        let isDowngrade = await recurringFunctions.userSubscription(req,subscription);
                                        if(!isDowngrade){
                                            //update user level
                                            if(subscription.downgrade_level_id){
                                                globalModel.custom(req,"UPDATE `users` SET `level_id` = ? WHERE `user_id` = ?",[subscription.downgrade_level_id,subscription.id]).then(res=>{}).catch(err => {
                                                    console.log("ERROR IN LEVEL CHAGE CRON ",err)
                                                })
                                            }
                                            //update subscription status
                                            globalModel.custom(req,"UPDATE `subscriptions` SET `status` = ? , `is_level_change` = 1 WHERE subscription_id = ?",['expired',subscription.subscription_id]).then(res=>{}).catch(err => {
                                                console.log("ERROR IN LEVEL CHAGE CRON ",err)
                                            })
                                        }
                                    });
                                } 
                            })
                            connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                            })
                        }
                        if(taskResult.type == "userExpiryNotifications") {
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            let currenttime = dateTime.create().format("Y-m-d H:M:S")
                            let sql = "SELECT `subscriptions`.*,packages.*,userdetails.*,users.email FROM `subscriptions`  JOIN `users` ON users.user_id =subscriptions.owner_id JOIN `userdetails` ON users.user_id =userdetails.user_id  LEFT JOIN `packages` ON packages.package_id = subscriptions.package_id WHERE (CASE WHEN expiration_date IS NULL then false WHEN expiration_date IS NOT NULL AND packages.alert_type = 'minutes' THEN DATE_SUB(expiration_date,INTERVAL `alert_number` MINUTE) <= '"+currenttime+"' WHEN expiration_date IS NOT NULL AND packages.alert_type = 'hours' THEN DATE_SUB(expiration_date,INTERVAL `alert_number` HOUR) <= '"+currenttime+"' WHEN expiration_date IS NOT NULL AND packages.alert_type = 'days' THEN DATE_SUB(expiration_date,INTERVAL `alert_number` DAY) <= '"+currenttime+"' WHEN expiration_date IS NOT NULL AND packages.alert_type = 'weeks' THEN DATE_SUB(expiration_date,INTERVAL `alert_number` WEEK) <= '"+currenttime+"' WHEN expiration_date IS NULL AND packages.`alert_type` = 'minutes' THEN DATE_SUB(subscriptions.creation_date,INTERVAL `alert_number` MINUTE) <= '"+currenttime+"' WHEN expiration_date IS NULL AND packages.`alert_type` = 'hours' THEN DATE_SUB(subscriptions.creation_date,INTERVAL `alert_number` HOUR) <= '"+currenttime+"' WHEN expiration_date IS NULL AND packages.`alert_type` = 'days' THEN DATE_SUB(subscriptions.creation_date,INTERVAL `alert_number` DAY) <= '"+currenttime+"' ELSE DATE_SUB(subscriptions.creation_date,INTERVAL `alert_number` WEEK) <= '"+currenttime+"' END ) AND is_notification_send = 0 AND (subscriptions.status = 'active' || subscriptions.status = 'completed' || subscriptions.status = 'approved') AND (users.user_id IS NOT NULL) AND subscriptions.type = 'member_subscription'  ORDER BY `subscriptions`.`expiration_date` ASC LIMIT 100";
                           
                            await globalModel.custom(req,sql).then(async results => {
                                let subscriptions = JSON.parse(JSON.stringify(results))
                                if(subscriptions.length){
                                    await asyncForEach(subscriptions, async (subscription, i) => {
                                        
                                        //send notification and email as per setting in package
                                        //email_notification
                                        //level_member_expiry_email
                                        if(subscription.email_notification == 1){
                                            connection.query("SELECT vars,type FROM emailtemplates WHERE type = ?", ['level_member_expiry'], function (err, resultsType, fields) {
                                                if (!err) {
                                                    const typeData = JSON.parse(JSON.stringify(resultsType))[0];
                                                    let result = {}
                                                    result.vars = typeData.vars
                                                    result.type = "level_member_expiry"
                                                    result.ownerEmail = subscription
                                                    result.toName = subscription.displayname
                                                    result.toEmail = subscription.email
                                                    result['planName'] = {}
                                                    result['planName']["title"] = subscription.title
                                                    result['planName']['type'] = "text"
                                                    result['period'] = {}
                                                    result['period']["title"] = subscription.alert_number+" "+subscription.alert_type
                                                    result['period']['type'] = "text"
                                                    emailFunction.sendMessage(req, result)
                                                }
                                            })
                                        }
                                        //site_notification
                                        if(subscription.site_notification == 1){
                                            let params = {}
                                            params['planName'] = subscription.title
                                            params['period'] = subscription.alert_number+" "+subscription.alert_type
                                            let notificationData= {owner_id:subscription.id, type: 'level_member_expiry', subject_type: "website", subject_id: 0, object_type: 'package', object_id: 0,creation_date:dateTime.create().format("Y-m-d H:M:S"),notification_send:1,params:JSON.stringify(params) }
                                            connection.query('INSERT INTO notifications SET ? ', [notificationData], function (err, results, fields) {
                                                notificationData.notification_id = results.insertId
                                                notificationModel.getNotification(req, notificationData).then(async result => {
                                                    socketio.getIO().emit('notifications', {
                                                        owner_id: result.owner_id,
                                                        notification: result
                                                    });
                                                });
                                                
                                            })
                                        }
                                        //update subscription notification send flag
                                        globalModel.custom(req,"UPDATE `subscriptions` SET `is_notification_send` = 1 WHERE subscription_id = ?",[subscription.subscription_id]).then(res=>{}).catch(err => {
                                            console.log("ERROR IN LEVEL CHAGE CRON ",err)
                                        })

                                    });
                                }
                            })
                            connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                            })
                        }
                        if (taskResult.type == "channelVideoImport") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {
                                
                            })
                            connection.query("SELECT * from channelvideoimports WHERE completed = 0 LIMIT 1", [], async function (err, results, fields) {
                                if (!err) {
                                    let channels = JSON.parse(JSON.stringify(results))
                                    if(channels.length > 0){
                                    // await asyncForEach(videos, async (data, i) => {
                                        let channel = channels[0];
                                        let channelData = JSON.parse(channel.params);
                                          await exports.importChannelVideoA(req,channel).then(result => {
                                              if(result.status == "completed"){
                                                //send notification queue completed
                                                connection.query("UPDATE channelvideoimports SET completed = 1 WHERE channelvideoimport_id = ?", [channel.channelvideoimport_id], async function (err, results, fields) {
                                                    
                                                    if(channelData.fromAdmin){
                                                        let notificationData= {owner_id:channelData.owner_id, type: 'admin_videos_channel_import_complete', subject_type: "website", subject_id: 0, object_type: 'user_profile', object_id: 0,creation_date:dateTime.create().format("Y-m-d H:M:S"),notification_send:1}
                                                        connection.query('INSERT INTO notifications SET ? ', [notificationData], function (err, results, fields) {
                                                            notificationData.notification_id = results.insertId
                                                            notificationModel.getNotification(req, notificationData).then(async result => {
                                                                socketio.getIO().emit('notifications', {
                                                                    owner_id: result.owner_id,
                                                                    notification: result
                                                                });
                                                            });
                                                        })
                                                        connection.query("SELECT vars,type FROM emailtemplates WHERE type = ?", ['admin_videos_channel_import_complete'], function (err, resultsType, fields) {
                                                            if (!err) {
                                                                const typeData = JSON.parse(JSON.stringify(resultsType))[0];
                                                                if(typeData){
                                                                    let result = {}
                                                                    result.vars = typeData.vars
                                                                    result.type = "admin_videos_channel_import_complete"
                                                                    result.ownerEmail = {email:channel.owner_email,language:channel.owner_language}
                                                                    result.toName = channel.owner_displayname
                                                                    result.toEmail = channel.owner_email
                                                                    emailFunction.sendMessage(req, result)
                                                                }
                                                            }
                                                        })
                                                    }else{
                                                        notificationModel.insert(req, {owner_id:channel.owner_id,insert:true, type: "videos_channel_import_complete", subject_type: "users", subject_id: channel.owner_id, object_type: "channels", object_id: channel.channel_id,forceInsert:true }).then(result => {

                                                        }).catch(err => {
                                            
                                                        })
                                                    }
                                                })
                                              }else if(result.status == "error"){
                                                let error = result.error
                                                connection.query("UPDATE channelvideoimports SET completed = 1,error_description = ? WHERE channelvideoimport_id = ?", [error,channel.channelvideoimport_id], async function (err, results, fields) {
                                                    
                                                    if(channelData.fromAdmin){
                                                        let notificationData= {owner_id:channelData.owner_id, type: 'admin_videos_channel_import_error', subject_type: "website", subject_id: 0, object_type: 'user_profile', object_id: 0,creation_date:dateTime.create().format("Y-m-d H:M:S"),notification_send:1}
                                                        connection.query('INSERT INTO notifications SET ? ', [notificationData], function (err, results, fields) {
                                                            notificationData.notification_id = results.insertId
                                                            notificationModel.getNotification(req, notificationData).then(async result => {
                                                                socketio.getIO().emit('notifications', {
                                                                    owner_id: result.owner_id,
                                                                    notification: result
                                                                });
                                                            });
                                                        })
                                                        connection.query("SELECT vars,type FROM emailtemplates WHERE type = ?", ['admin_videos_channel_import_error'], function (err, resultsType, fields) {
                                                            if (!err) {
                                                                const typeData = JSON.parse(JSON.stringify(resultsType))[0];
                                                                if(typeData){
                                                                    let result = {}
                                                                    result.vars = typeData.vars
                                                                    result.type = "admin_videos_channel_import_error"
                                                                    result.ownerEmail = {email:channel.owner_email,language:channel.owner_language}
                                                                    result.toName = channel.owner_displayname
                                                                    result.toEmail = channel.owner_email
                                                                    emailFunction.sendMessage(req, result)
                                                                }
                                                            }
                                                        })
                                                    }else{
                                                        notificationModel.insert(req, {owner_id:channel.owner_id,insert:true, type: "videos_channel_import_error", subject_type: "users", subject_id: channel.owner_id, object_type: "channels", object_id: channel.channel_id,forceInsert:true }).then(result => {

                                                        }).catch(err => {
                                            
                                                        })
                                                    }
                                                })
                                              }
                                          })
                                        //});
                                    }
                                }
                                connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {
                                    
                                })
                            })
                        }
                        if (taskResult.type == "movieImportIMDB") {
                            //find videos
                            connection.query("UPDATE tasks SET started = 1,start_time = ? WHERE type = ?", [dateTime.create().format("Y-m-d H:M:S"),taskResult.type], async function (err, results, fields) {})
                            //import movies
                            if(req.appSettings['movie_tmdb_api_key']){
                                await importMovies.importMovies(req,res,next,1);
                            }
                            connection.query("UPDATE tasks SET started = 0 WHERE type = ?", [taskResult.type], async function (err, results, fields) {})
                        }
                    })
                        //remove unuploaded videos
                        var d = new Date();
                        d.setHours(d.getHours() - 4);
                        let dateTimePrevious = dateTime.create(d).format("Y-m-d H:M:S")
                        await connection.query("SELECT * from videos WHERE (custom_url IS NULL || custom_url = '') AND type = 3 AND creation_date < ? LIMIT 20", [dateTimePrevious], async function (err, results, fields) {
                            if (!err) {
                                let videos = JSON.parse(JSON.stringify(results))
                                if(videos.length){
                                    videos.forEach(function (item, index) {
                                            //remove videos and image
                                            videoModel.delete(item.video_id, req).then(result => {}) 
                                    })
                                }
                            }
                        })

                        res.send(true)
                        resolve(true)
                    } else {
                        res.send(false)
                        resolve(true)
                        console.log(err, 'ERROR IN CRON FUNCTION')
                    }
                })
            })
        })

    })
}

exports.newsletters = async (req, data) => {
    return new Promise(async function (resolve) {
        if(data.active != 2)
            await globalModel.update(req, {active:2}, "tools_remove_videos", 'remove_video_id', data.remove_video_id);

        let lastProcessUserID = data.last_process_user_id

        let condition = []
        let sql = "SELECT * from users INNER JOIN userdetails ON userdetails.user_id = users.user_id where 1 = 1 "

        if(data.last_process_user_id != 0){
            condition.push(lastProcessUserID)
            sql += " AND users.user_id < ?"
        }
        if(data.gender != ''){
            condition.push(data.gender)
            sql += " AND userdetails.gender = ?"
        }
        if(data.level_id && data.level_id.trim() != ""){
            condition.push(data.level_id)
            sql += " AND FIND_IN_SET(users.level_id, ?) > 0 "
        }
        sql += " ORDER BY users.user_id DESC LIMIT 100"

        await globalModel.custom(req,sql,condition).then(async results => {
            if(results && results.length > 0){
                let items = JSON.parse(JSON.stringify(results));
                let newsletterMemberCount = data.member_count
                for(let i = 0;i<items.length; i++){
                    let result = {}
                    result.type = "newsletters"
                    result.ownerEmail = items[i].email
                    result.toName = items[i].displayname
                    result.toEmail = items[i].email
                    result.subjectEmail = data.subject.replace("{name}",items[i].displayname)
                    result.body = data.description
                    
                    // result.disableHeader = true;
                    // result.disableFooter = true;
                    await emailFunction.sendMessage(req, result)
                    newsletterMemberCount = parseInt(newsletterMemberCount) + 1;
                    await globalModel.update(req, {last_process_user_id:items[i].user_id,member_count:newsletterMemberCount}, "tools_newsletters", 'newsletter_id', data.newsletter_id);
                }
                    
                if(items.length <100){
                    await globalModel.update(req, {active:1}, "tools_newsletters", 'newsletter_id', data.newsletter_id); 
                }
            }else{
                await globalModel.update(req, {active:1}, "tools_newsletters", 'newsletter_id', data.newsletter_id); 
            }
        })
        resolve(true);
    })
}

exports.manifest = async(req,res) => {
    //manifest.json
    let data = {}
    data["name"] = req.appSettings["pwa_app_name"];
    data["short_name"] = req.appSettings["pwa_short_name"];
    data["desciption"] = req.appSettings["pwa_app_description"];
    data["theme_color"] = req.appSettings["pwa_app_theme_color"];
    data["background_color"] = req.appSettings["pwa_app_bg_color"];
    data["display"] = "standalone";
    data["orientation"] = "any";
    data["app_icon"] = req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_512"];
    data["start_url"] = process.env.PUBLIC_URL;
    data["id"] = process.env.PUBLIC_URL;

    let icons = []
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_72"],sizes:"72x72",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_96"],sizes:"96x96",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_128"],sizes:"128x128",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_144"],sizes:"144x144",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_152"],sizes:"152x152",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_192"],sizes:"192x192",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_384"],sizes:"384x384",type:"image/png"})
    icons.push({"src":req.appSettings['imageSuffix'] + req.appSettings["pwa_icon_sizes_512"],sizes:"512x512",type:"image/png"})
    data.icons = icons;

    res.send(data)
    
}

exports.sitemap = async (req,res) => {
    //Return an XML content type
  	res.set('Content-Type', 'text/xml')

    let itemResults = []
    itemResults.push({custom_url:'', priority:'1.0',frequency:'daily'});
    await new Promise(function (resolve, reject) {
        req.getConnection(function (err, connection) {
            connection.query("SELECT username as custom_url,displayname as title,'users' as item,users.modified_date from users LEFT JOIN userdetails on users.user_id = userdetails.user_id WHERE active = 1 AND approve = 1 AND userdetails.search = 1", [], function (err, results, fields) {
                if (err)
                    resolve()
                if (results) {
                    let users = JSON.parse(JSON.stringify(results));
                    //itemResults.concat(users)
                    itemResults = [...itemResults,...users]
                    resolve();
                } else {
                    resolve();
                }
            })
        })
    })
    //get videos
    await new Promise(function (resolve, reject) {
        req.getConnection(function (err, connection) {
            connection.query("SELECT custom_url,title,'videos' as item,modified_date from videos WHERE approve = 1 AND completed = 1 AND ( is_livestreaming = 0 AND (code IS NOT NULL || videos.type = 3) )  AND is_locked = 0  AND search = 1 AND (view_privacy= 'everyone' || view_privacy IS NULL) ", [], function (err, results, fields) {
                if (err)
                    resolve()
                if (results) {
                    let videos = JSON.parse(JSON.stringify(results));
                    itemResults = [...itemResults,...videos]
                    resolve();
                } else {
                    resolve();
                }
            })
        })
    })

    if(req.appSettings["enable_blog"] == 1){
        //get blogs
        await new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query("SELECT custom_url,title,'blogs' as item,modified_date from blogs WHERE approve = 1 AND draft = 1 AND search = 1 AND (view_privacy= 'everyone' || view_privacy IS NULL) ", [], function (err, results, fields) {
                    if (err)
                        resolve()
                    if (results) {
                        let blogs = JSON.parse(JSON.stringify(results));
                        itemResults = [...itemResults,...blogs]
                        resolve();
                    } else {
                        resolve();
                    }
                })
            })
        })
    }

    if(req.appSettings["enable_channel"] == 1){
        //get channels
        await new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query("SELECT custom_url,title,'channels' as item,modified_date from channels WHERE approve = 1 AND search = 1 AND (view_privacy= 'everyone' || view_privacy IS NULL) AND is_locked = 0 ", [], function (err, results, fields) {
                    if (err)
                        resolve()
                    if (results) {
                        let channels = JSON.parse(JSON.stringify(results));
                        itemResults = [...itemResults,...channels]
                        resolve();
                    } else {
                        resolve();
                    }
                })
            })
        })
    }
    if(req.appSettings["enable_playlist"] == 1){
        itemResults.push({custom_url:'playlists', priority:'0.1',frequency:'daily'});
    }
    itemResults.push({custom_url:'privacy', priority:'0.1',frequency:'weekly'});
    itemResults.push({custom_url:'contact', priority:'0.1',frequency:'weekly'});
    itemResults.push({custom_url:'terms', priority:'0.1',frequency:'weekly'});

    res.render('home/sitemap', {
        //whatever data you need to show in the sitemap
        itemResults: itemResults,
        rootPath:process.env.PUBLIC_URL
    })

}