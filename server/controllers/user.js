const commonFunction = require("../functions/commonFunctions")
const privacyModel = require("../models/privacy")
const userModel = require("../models/users")
const likeModel = require("../models/likes")
const favouriteModel = require("../models/favourites")
const videoModel = require("../models/videos")
const channelModel = require("../models/channels")
const playlistModel = require("../models/playlists")
const blogModel = require("../models/blogs")
const reelsModel = require("../models/reels")
const movieModel = require("../models/movies")
const audioModel = require("../models/audio")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")
const globalModel = require("../models/globalModel")


exports.browse = async (req, res) => {
    
    const queryString = req.query
    await commonFunction.getGeneralInfo(req, res, 'member_browse')

    const limit = 21
    const data = {}
    req.query.search = {}
    data['type'] = queryString.type
    if (queryString.q && !queryString.tag) {
        req.query.search.q = queryString.q
        data['title'] = queryString.q
    }
    
    if (queryString.sort == "latest") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "users.user_id desc"
    } else if (queryString.sort == "favourite" && req.appSettings['member_favourite'] == 1) {
        req.query.search.sort = queryString.sort
        data['orderby'] = "userdetails.favourite_count desc"
    } else if (queryString.sort == "view") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "userdetails.view_count desc"
    } else if (queryString.sort == "like" && req.appSettings['member_like'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "userdetails.like_count desc"
    } else if (queryString.sort == "dislike" && req.appSettings['member_dislike'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "userdetails.dislike_count desc"
    } else if (queryString.sort == "rated" && req.appSettings['member_rating'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "userdetails.rating desc"
    } else if (queryString.sort == "commented" && req.appSettings['member_comment'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "userdetails.comment_count desc"
    }

    if (queryString.type == "featured" && req.appSettings['member_featured'] == 1) {
        req.query.search.type = queryString.type
        data['is_featured'] = 1
    } else if (queryString.type == "sponsored" && req.appSettings['member_sponsored'] == 1) {
        req.query.search.type = queryString.type
        data['is_sponsored'] = 1
    } else if (queryString.type == "hot" && req.appSettings['member_hot'] == 1) {
        req.query.search.type = queryString.type
        data['is_hot'] = 1
    }
    //get all members
    await userModel.getMembers(req, data).then(result => {
        let members = []
        if (result) {
            req.query.pagging = false
            members = result
            if (result.length > limit - 1) {
                members = result.splice(0, limit - 1);
                req.query.pagging = true
            }
        }
        req.query.members = members
    }).catch(err => {
        console.log(err)
    })

    return res.send({...req.query,page_type:"members"});
}

exports.view = async (req, res, next) => {
    const custom_url = req.params.id
    req.query.tabType = (req.query.type ? req.query.type : null)

    let member = {}
    await userModel.findByUsername(custom_url, req, res).then(result => {
        if (result)
            member = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })
    if (Object.keys(member).length) {
        if(!req.user && req.levelPermissions && req.levelPermissions["member.site_public_access"] == 1){
            if(req.originalUrl.indexOf("mainsite") == -1){
                next();
                return;
            }
            await commonFunction.getGeneralInfo(req, res, "login");
            return res.send({...req.query,page_type:"login"});
        }
        await commonFunction.getGeneralInfo(req, res, 'member_view')
        await commonFunction.updateMetaData(req,{title:member.displayname,description:member.about,image:member.avtar})
        let LimitNum = 21;
        let members = {
            pagging: false,
            result: []
        }

        member.allowBlock = false;
        member.showBlock = true;
        member.block = false;
        
        // check user blocked the user
        if(req.user && req.user.user_id != member.user_id){

            if(req.query.block){
                await globalModel.custom(req,"SELECT * FROM user_blocks WHERE owner_id = ? AND resource_id = ?",[req.user.user_id,member.user_id]).then(async result => {
                    if(result && result.length > 0){
                        member.block = false;
                        await globalModel.custom(req,"DELETE FROM user_blocks WHERE owner_id = ? AND resource_id = ?",[req.user.user_id,member.user_id]);
                        await globalModel.custom(req,"DELETE FROM user_blocks WHERE resource_id = ? AND owner_id = ?",[req.user.user_id,member.user_id]);

                    }else{
                        member.block = true;
                        await globalModel.create(req,{owner_id:req.user.user_id,resource_id:member.user_id,subject_id:req.user.user_id},"user_blocks");
                        await globalModel.create(req,{resource_id:req.user.user_id,owner_id:member.user_id,subject_id:req.user.user_id},"user_blocks");
                    }
                })
                

                member.allowBlock = true;
            }
            if(!req.query.block){
                // check allow block
                let allowBlock = true;
                // get member level
                await globalModel.custom(req,"SELECT * FROM levels WHERE level_id = ?",[member.level_id]).then(results => {
                    if(results && results.length > 0){
                        const level = JSON.parse(JSON.stringify(results))[0];
                        if(level.flag != "superadmin"){
                            allowBlock = true;
                        }else{
                            member.showBlock = false;
                        }
                    }
                })
                member.allowBlock = allowBlock;
                if(allowBlock){
                    // get block data
                    await globalModel.custom(req,"SELECT * FROM user_blocks WHERE owner_id = ? AND resource_id = ?",[req.user.user_id,member.user_id]).then(result => {
                        if(result && result.length > 0){
                            const level = JSON.parse(JSON.stringify(result))[0];
                            member.block = true;
                            member.showBlock = level.subject_id == req.user.user_id;
                        }
                    })
                }
            }
        }

        let data = {}
        data.limit = LimitNum
        data.owner_id = member.user_id
        if(member.block){
            req.query.tabType = "about"
        }
        if(!member.block){
            //get videos
            await videoModel.getVideos(req, data).then(result => {
                let pagging = false
                if (result) {
                    pagging = false
                    if (result.length > LimitNum - 1) {
                        result = result.splice(0, LimitNum - 1);
                        pagging = true
                    }
                    if(result.length > 0){
                        req.query.videos = {
                            'pagging': pagging,
                            results: result
                        }
                    }
                }
            })
            if(req.appSettings['enable_movie'] == 1){
                //get movies
                req.contentType = "movies"
                await movieModel.getMovies(req, data).then(async result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.movies_data = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
                req.contentType = "series"
                //get series
                await movieModel.getMovies(req, data).then(async result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.series = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
            }
            if (req.appSettings["enable_channel"] == 1) {
                //get channels
                await channelModel.getChannels(req, data).then(result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.channels = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
            }else{
                if(req.query.tabType == "channels"){
                    req.query.tabType = null
                }
            }
            if (req.appSettings["enable_playlist"] == 1) {
                //get playlists
                let dataPlaylist = data
                dataPlaylist['limit'] = 17
                await playlistModel.getPlaylists(req, dataPlaylist).then(result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > dataPlaylist['limit'] - 1) {
                            result = result.splice(0, dataPlaylist['limit'] - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.playlists = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
            }else{
                if(req.query.tabType == "playlists"){
                    req.query.tabType = null
                }
            }
            if (req.appSettings["enable_blog"] == 1) {
                //get blogs
                await blogModel.getBlogs(req, { limit: 17, owner_id: member.user_id }).then(result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.blogs = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
            }else{
                if(req.query.tabType == "blogs"){
                    req.query.tabType = null
                }
            }

            //reels
            if(parseInt(req.appSettings["enable_reels"]) == 1 && (req.levelPermissions["reels.view"] == 1 || req.levelPermissions["reels.view"] == 2)){
                let reelPage = 11
                await reelsModel.getReels(req,{limit:reelPage,user_id:member.user_id}).then(result => {
                    
                    let items = result
                    let pagging = false
                    if (result.length > reelPage - 1) {
                        items = result.splice(0, reelPage - 1);
                        pagging = true
                    }

                    if(items.length > 0){
                        req.query.reels = {
                            'pagging': pagging,
                            results: items
                        }
                    }

                }).catch(error => {
                    
                })
            }else{
                if(req.query.tabType == "reels"){
                    req.query.tabType = null
                }
            }

            if (req.appSettings["enable_audio"] == 1) {
                //get audio
                await audioModel.getAudios(req, { limit: LimitNum, owner_id: member.user_id }).then(result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.audio = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
            }else{
                if(req.query.tabType == "audio"){
                    req.query.tabType = null
                }
            }
            if(req.appSettings['user_follow'] == 1){
                // followers
                await userModel.getFollowersFollowing(req, { limit: LimitNum, owner_id: member.user_id,type:"followers" }).then(result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.followers = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })

                
                // following
                await userModel.getFollowersFollowing(req, { limit: LimitNum, owner_id: member.user_id,type:"following" }).then(result => {
                    let pagging = false
                    if (result) {
                        pagging = false
                        if (result.length > LimitNum - 1) {
                            result = result.splice(0, LimitNum - 1);
                            pagging = true
                        }
                        if(result.length > 0){
                            req.query.following = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }
                })
            }
            
            if (req.user) {
                await likeModel.isLiked(member.user_id, 'members', req, res).then(result => {
                    if (result) {
                        member.like_dislike = result.like_dislike
                    }
                })

                //favourite
                await favouriteModel.isFavourite(member.user_id, 'members', req, res).then(result => {
                    if (result) {
                        member['favourite_id'] = result.favourite_id
                    }
                })
            }
            const privacyLevelModel = require("../models/levelPermissions")
            await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',member.level_id).then(result => {
                req.query.planCreate = result  == 1 ? 1 : 0
            })
       
            await privacyLevelModel.findBykey(req,"member",'show_homebutton_profile',member.level_id).then(result => {
                req.query.showHomeButtom = result  == 1 && req.query.planCreate == 1 ? 1 : 0
            })

            let dataPaid = {}
            dataPaid.limit = LimitNum
            dataPaid.owner_id = member.user_id
            dataPaid.user_sell_home_content = true;
            //get videos
            await videoModel.getVideos(req, dataPaid).then(result => {
                let pagging = false
                if (result) {
                    pagging = false
                    if (result.length > LimitNum - 1) {
                        result = result.splice(0, LimitNum - 1);
                        pagging = true
                    }
                    if(result.length > 0){
                        req.query.paidVideos = {
                            'pagging': pagging,
                            results: result
                        }
                    }
                } 
            })

            let dataLive = {}
            dataLive.limit = LimitNum
            dataLive.owner_id = member.user_id
            dataLive.is_live_videos = true;
            //get videos
            await videoModel.getVideos(req, dataLive).then(result => {
                let pagging = false
                if (result) {
                    pagging = false
                    if (result.length > LimitNum - 1) {
                        result = result.splice(0, LimitNum - 1);
                        pagging = true
                    }
                    if(result.length > 0){
                        req.query.liveVideos = {
                            'pagging': pagging,
                            results: result
                        }
                    }
                }
            })

            if(req.query.planCreate == 1){
                req.query.userProfilePage = 1;
                //if home button is enabled
                if(req.query.showHomeButtom == 1){          
                    // get top 3 newest monthly plan videos
                    
                    req.query.homeData = {}
                    req.query.homeData['latest_videos'] = []
                    req.query.homeData['latest_blogs'] = []
                    req.query.homeData['latest_audio'] = []
                    req.query.homeData['sell_videos'] = []
                    
                    req.query.homeData['most_latest_videos'] = []
                    req.query.homeData['most_latest_blogs'] = []
                    req.query.homeData['most_latest_audio'] = []
                    req.query.homeData['most_sell_videos'] = []
                    
                    req.query.homeData['donation_videos'] = []
                    let data = {}
                    data['orderby'] = "videos.video_id desc"
                    data['user_home_content'] = true;
                    data.owner_id = member.user_id
                    await videoModel.getVideos(req, data).then(result => {
                        if (result && result.length) {
                            req.query.homeData['latest_videos'] = result
                        }
                    }).catch(error => {
            
                    })

                    let dataMost = {}
                    dataMost['orderby'] = "videos.view_count desc"
                    dataMost['user_home_content'] = true;
                    dataMost.owner_id = member.user_id
                    await videoModel.getVideos(req, dataMost).then(result => {
                        if (result && result.length) {
                            req.query.homeData['most_latest_videos'] = result
                        }
                    }).catch(error => {
            
                    })

                    if (req.appSettings["enable_blog"] == 1) {
                        // get top 3 newest monthly plan blog
                        let dataBlog = {}
                        dataBlog['orderby'] = "blogs.blog_id desc"
                        dataBlog['user_home_content'] = true;
                        dataBlog.owner_id = member.user_id
                        await blogModel.getBlogs(req, dataBlog).then(result => {
                            if (result && result.length) {
                                req.query.homeData['latest_blogs'] = result
                            }
                        }).catch(error => {
            
                        })
                        let mostDataBlog = {}
                        mostDataBlog['orderby'] = "blogs.view_count desc"
                        mostDataBlog['user_home_content'] = true;
                        mostDataBlog.owner_id = member.user_id
                        await blogModel.getBlogs(req, mostDataBlog).then(result => {
                            if (result && result.length) {
                                req.query.homeData['most_latest_blogs'] = result
                            }
                        }).catch(error => {
            
                        })
                    }
                    if (req.appSettings["enable_audio"] == 1) {
                        // get top 3 newest monthly plan audio
                        let dataAudio = {}
                        dataAudio['orderby'] = "audio.audio_id desc"
                        dataAudio['user_home_content'] = true;
                        dataAudio.owner_id = member.user_id
                        await audioModel.getAudios(req, dataAudio).then(result => {
                            if (result && result.length) {
                                req.query.homeData['latest_audio'] = result
                            }
                        }).catch(error => {
            
                        })
                        let mostDataAudio = {}
                        mostDataAudio['orderby'] = "audio.view_count desc"
                        mostDataAudio['user_home_content'] = true;
                        mostDataAudio.owner_id = member.user_id
                        await audioModel.getAudios(req, mostDataAudio).then(result => {
                            if (result && result.length) {
                                req.query.homeData['most_latest_audio'] = result
                            }
                        }).catch(error => {
            
                        })
                    }
                    //get top 3 newest price sell videos
                    let dataVideos = {}
                    dataVideos['orderby'] = "videos.video_id desc"
                    dataVideos['user_sell_home_content'] = true;
                    dataVideos.owner_id = member.user_id
                    await videoModel.getVideos(req, dataVideos).then(result => {
                        if (result && result.length) {
                            req.query.homeData['sell_videos'] = result
                        }
                    }).catch(error => {
            
                    })

                    let sellDataVideos = {}
                    sellDataVideos['orderby'] = "videos.view_count desc"
                    sellDataVideos['user_sell_home_content'] = true;
                    sellDataVideos.owner_id = member.user_id
                    await videoModel.getVideos(req, sellDataVideos).then(result => {
                        if (result && result.length) {
                            req.query.homeData['most_sell_videos'] = result
                        }
                    }).catch(error => {
            
                    })

                    //top donated users
                    await videoModel.donors({limit: 10, offset:0, video_owner_id: member.user_id, offthemonth:1}, req).then(result => {
                        if (result && result.length) {
                            req.query.homeData['donation_videos'] = result
                        }
                    }).catch(error => {
            
                    })
                }

                //get user plans
                //get audio
                await userModel.getPlans(req, { owner_id: member.user_id }).then(result => {
                    if (result) {
                        req.query.plans = {
                            results: result
                        }
                    }
                })

                if(req.user){
                    const condition = []
                    let sql = 'SELECT expiration_date,package_id FROM subscriptions where 1 = 1'
                    condition.push(parseInt(req.user.user_id))
                    sql += " and owner_id = ?"
                    condition.push("user_subscribe")
                    sql += " and type = ?"
                    condition.push(member.user_id)
                    sql += " and id = ?"
                    var dt = dateTime.create();
                    var formatted = dt.format('Y-m-d H:M:S');
                    condition.push(formatted)
                    sql += " and (expiration_date IS NULL || expiration_date >= ?)"
                    sql += " and (status = 'completed' || status = 'approved' || status = 'active') "
                    condition.push(1)
                    sql += " LIMIT ?"
                    await globalModel.custom(req,sql,condition).then(result => {
                        if(result && result.length > 0){
                            let item = JSON.parse(JSON.stringify(result));
                            if(item && item.length > 0){
                                let subscription = item[0] 
                                req.query.userSubscription = true
                                req.query.userSubscriptionID = subscription.package_id
                            } 
                            
                        }
                    })
                }
                if(req.user && req.user.user_id == member.user_id){
                    //get subscribers
                    let LimitNum = 21;
                    let page = 1
                    let offsetArtist = (page - 1) * LimitNum
                    await userModel.getSubscribers(req,{user_id:member.user_id, limit: LimitNum, offset:offsetArtist}).then(result => {
                        let pagging = false
                        if (result) {
                            pagging = false
                            if (result.length > LimitNum - 1) {
                                result = result.splice(0, LimitNum - 1);
                                pagging = true
                            }
                            member.subscribers = {
                                'pagging': pagging,
                                results: result
                            }
                        }
                    }).catch(error => {
                        console.log(error)
                    })
                }
            }
            await privacyModel.permission(req, 'member', 'delete', member).then(result => {
                member.canDelete = result
            })
            await privacyModel.permission(req, 'member', 'edit', member).then(result => {
                member.canEdit = result
            })
            if (req.session.memberSubscriptionPaymentStatus) {
                req.query.memberSubscriptionPaymentStatus = req.session.memberSubscriptionPaymentStatus
                req.session.memberSubscriptionPaymentStatus = null
            }
            if(!req.query.tabType){
            // req.query.tabType = "about"
            }

        }

        req.query.member = member
        recentlyViewed.insert(req, { id: member.user_id, owner_id: member.user_id, type: 'members', creation_date: dateTime.create().format("Y-m-d H:M:S") })
        req.query.id = custom_url
        return res.send({...req.query,page_type:"member"});
    } else {
        next()
    }
}
