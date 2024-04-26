const commonFunction = require("../functions/commonFunctions")
const categoryModel = require("../models/categories")
const channelModel = require("../models/channels")
const blogModel = require("../models/blogs")
const videoModel = require("../models/videos")
const playlistModel = require("../models/playlists")
const userModel = require("../models/users")
const movieModel = require("../models/movies")
const audioModel = require("../models/audio")
const countryModel = require("../models/country")
const languageModel = require("../models/languages")


exports.index = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'search')
    let type = req.params.type
    if (!type) {
        type = "video"
    }
    let response = {}
    let text = req.query.h ? req.query.h : ''
    let sort = req.query.filter ? req.query.filter : ''
    let filter = req.query.sort ? req.query.sort : ''
    let category = req.query.category ? req.query.category : ''
    let country = req.query.country ? req.query.country : ''
    let language = req.query.language ? req.query.language : ''
    req.query.showForm = false
    if(!text){
        req.query.showForm = true
        req.query.type = "video"
        return res.send({...req.query,page_type:"search"});
        
    }
    let isValid = false
    let data = {}
    data.title = text
    req.query.title = text
    response = {
        pagging: false,
        results: []
    }

    if (type == "video") {
        await commonFunction.updateMetaData(req,{title:text+" in videos"})
        data.limit = 21;
        if (!filter) {
            filter = ""
        }
        await categoryModel.findAll(req, { type: "video" }).then(result => {
            if (result)
                req.query.categories = result
        }).catch(error => {
            
        })
        if(category){
            data.category_id = category
        }
        
        if(sort == "featured"){
            data.is_featured = 1
        }else if(sort == "sponsored"){
            data.is_sponsored = 1
        }else if(sort == "hot"){
            data.is_hot = 1
        }
        if (filter == "") {
            isValid = true
            data.orderby = "videos.video_id DESC"
        }else if (filter == "view") {
            isValid = true
            data.orderby = "videos.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["video_favourite"]) {
            isValid = true
            data.orderby = "videos.favourite_count DESC"
        } else if (filter == "like" && req.appSettings["video_like"]) {
            isValid = true
            data.orderby = "videos.like_count DESC"
        } else if (filter == "comment" && req.appSettings["video_comment"]) {
            isValid = true
            data.orderby = "videos.comment_count DESC"
        } else if (filter == "dislike" && req.appSettings["video_dislike"]) {
            isValid = true
            data.orderby = "videos.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["video_rating"]) {
            isValid = true
            data.orderby = "videos.rating DESC"
        }
        if (isValid) {
            await videoModel.getVideos(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    } else if (type == "blog") {
        await commonFunction.updateMetaData(req,{title:text+" in blogs"})
        if (!filter) {
            filter = ""
        }
        await categoryModel.findAll(req, { type: "blog" }).then(result => {
            if (result)
                req.query.categories = result
        }).catch(error => {
            
        })
        if(category){
            data.category_id = category
        }
        if(sort == "featured"){
            data.is_featured = 1
        }else if(sort == "sponsored"){
            data.is_sponsored = 1
        }else if(sort == "hot"){
            data.is_hot = 1
        }
        if (filter == "") {
            isValid = true
            data.orderby = "blogs.blog_id DESC"
        }else if (filter == "view") {
            isValid = true
            data.orderby = "blogs.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["blog_favourite"]) {
            isValid = true
            data.orderby = "blogs.favourite_count DESC"
        } else if (filter == "comment" && req.appSettings["blog_comment"]) {
            isValid = true
            data.orderby = "blogs.comment_count DESC"
        } else if (filter == "like" && req.appSettings["blog_like"]) {
            isValid = true
            data.orderby = "blogs.like_count DESC"
        } else if (filter == "dislike" && req.appSettings["blog_dislike"]) {
            isValid = true
            data.orderby = "blogs.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["blog_rating"]) {
            isValid = true
            data.orderby = "blogs.rating DESC"
        }
        if (isValid) {
            data.limit = 21;
            await blogModel.getBlogs(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    } else if (type == "playlist") {
        await commonFunction.updateMetaData(req,{title:text+" in playlists"})

        if (!filter) {
            filter = ""
        }
        if(sort == "featured"){
            data.is_featured = 1
        }else if(sort == "sponsored"){
            data.is_sponsored = 1
        }else if(sort == "hot"){
            data.is_hot = 1
        }
        if (filter == "") {
            isValid = true
            data.orderby = "playlists.playlist_id DESC"
        }else if (filter == "view") {
            isValid = true
            data.orderby = "playlists.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["playlist_favourite"]) {
            isValid = true
            data.orderby = "playlists.favourite_count DESC"
        } else if (filter == "like" && req.appSettings["playlist_like"]) {
            isValid = true
            data.orderby = "playlists.like_count DESC"
        } else if (filter == "comment" && req.appSettings["playlist_comment"]) {
            isValid = true
            data.orderby = "playlists.comment_count DESC"
        } else if (filter == "dislike" && req.appSettings["playlist_dislike"]) {
            isValid = true
            data.orderby = "playlists.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["playlist_rating"]) {
            isValid = true
            data.orderby = "playlists.rating DESC"
        }
        if (isValid) {
            data.limit = 17;
            await playlistModel.getPlaylists(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    } else if (type == "member") {
        await commonFunction.updateMetaData(req,{title:text+" in members"})

        if (!filter) {
            filter = ""
        }
        if(sort == "featured"){
            data.is_featured = 1
        }else if(sort == "sponsored"){
            data.is_sponsored = 1
        }else if(sort == "hot"){
            data.is_hot = 1
        }else if(sort == "verified"){
            data.verified = 1
        }
        if (filter == "") {
            isValid = true
            data.orderby = "users.user_id DESC"
        }else if (filter == "view") {
            isValid = true
            data.orderby = "userdetails.view_count DESC"
        }  else if (filter == "favourite" && req.appSettings["member_favourite"]) {
            isValid = true
            data.orderby = "userdetails.favourite_count DESC"
        } else if (filter == "like" && req.appSettings["member_like"]) {
            isValid = true
            data.orderby = "userdetails.like_count DESC"
        } else if (filter == "comment" && req.appSettings["member_comment"]) {
            isValid = true
            data.orderby = "userdetails.comment_count DESC"
        } else if (filter == "dislike" && req.appSettings["member_dislike"]) {
            isValid = true
            data.orderby = "userdetails.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["member_rating"]) {
            isValid = true
            data.orderby = "userdetails.rating DESC"
        }
        if (isValid) {
            data.limit = 21;
            if (req.user) {
                data.not_user_id = req.user.user_id
            }
            await userModel.getMembers(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    } else if (type == "channel") {
        await commonFunction.updateMetaData(req,{title:text+" in channels"})

        if (!filter) {
            filter = ""
        }
        await categoryModel.findAll(req, { type: "channel" }).then(result => {
            if (result)
                req.query.categories = result
        }).catch(error => {
            
        })
        if(category){
            data.category_id = category
        }
        if(sort == "featured"){
            data.is_featured = 1
        }else if(sort == "sponsored"){
            data.is_sponsored = 1
        }else if(sort == "hot"){
            data.is_hot = 1
        }else if(sort == "verified"){
            data.verified = 1
        }
        if (filter == "") {
            isValid = true
            data.orderby = "channels.channel_id DESC"
        }else if (filter == "view") {
            isValid = true
            data.orderby = "channels.view_count DESC"
        }  else if (filter == "favourite" && req.appSettings["channel_favourite"]) {
            isValid = true
            data.orderby = "channels.favourite_count DESC"
        } else if (filter == "like" && req.appSettings["channel_like"]) {
            isValid = true
            data.orderby = "channels.like_count DESC"
        } else if (filter == "comment" && req.appSettings["channel_comment"]) {
            isValid = true
            data.orderby = "channels.comment_count DESC"
        } else if (filter == "dislike" && req.appSettings["channel_dislike"]) {
            isValid = true
            data.orderby = "channels.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["channel_rating"]) {
            isValid = true
            data.orderby = "channels.rating DESC"
        }
        if (isValid) {
            data.limit = 21;
            await channelModel.getChannels(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    }else if (type == "audio") {
        await commonFunction.updateMetaData(req,{title:text+" in audio"})
        if (!filter) {
            filter = ""
        }

        if (category) {
            data.category_id = category
        }
        if (sort == "featured") {
            data.is_featured = 1
        } else if (sort == "sponsored") {
            data.is_sponsored = 1
        } else if (sort == "hot") {
            data.is_hot = 1
        } else if (sort == "verified") {
            data.verified = 1
        }
        if (filter == "" || filter == "latest") {
            isValid = true
            data.orderby = "audio.audio_id DESC"
        } else if (filter == "view") {
            isValid = true
            data.orderby = "audio.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["audio_favourite"]) {
            isValid = true
            data.orderby = "audio.favourite_count DESC"
        } else if (filter == "like" && req.appSettings["audio_like"]) {
            isValid = true
            data.orderby = "audio.like_count DESC"
        } else if (filter == "comment" && req.appSettings["audio_comment"]) {
            isValid = true
            data.orderby = "audio.comment_count DESC"
        } else if (filter == "dislike" && req.appSettings["audio_dislike"]) {
            isValid = true
            data.orderby = "audio.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["audio_rating"]) {
            isValid = true
            data.orderby = "audio.rating DESC"
        }
        if (isValid) {
            data.limit = 21;
            if(parseInt(req.body.limit)){
                data.limit = parseInt(req.body.limit)
            }
            let page = 1
            if (req.body.page == '') {
                page = 1;
            } else {
                //parse int Convert String to number 
                page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
            }

            data.offset = (page - 1) * (data.limit - 1)
            await audioModel.getAudios(req, data).then(result => {
                pagging = false
                
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    }else if (type == "movie" || type == "series") {
        await commonFunction.updateMetaData(req,{title:text+" in "+type})
        if (!filter) {
            filter = ""
        }
        await categoryModel.findAll(req, { type: type }).then(result => {
            if (result)
                req.query.categories = result
        }).catch(error => {
            
        })
        
        //languages
        req.query.spokenLanguage =  languageModel.spokenLanguages() 
        //get countries
        await countryModel.findAll(req).then(result => {
            if(result)
                req.query.countries = result
        })

        if(language){
            data.language = language
        }
        if(country){
            data.country = country
        }

        if(type == "series"){
            req.contentType = "series"
        }
        if (category) {
            data.category_id = category
        }
        if (sort == "featured"){
            data.is_featured = 1
        } else if (sort == "sponsored"){
            data.is_sponsored = 1
        } else if (sort == "hot"){
            data.is_hot = 1
        } else if (sort == "verified"){
            data.verified = 1
        }
        if (filter == "" || filter == "latest"){
            isValid = true
            data.orderby = "movies.movie_id DESC"
        } else if (filter == "view") {
            isValid = true
            data.orderby = "movies.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["movie_favourite"]){
            isValid = true
            data.orderby = "movies.favourite_count DESC"
        } else if (filter == "like" && req.appSettings["movie_like"]){
            isValid = true
            data.orderby = "movies.like_count DESC"
        } else if (filter == "comment" && req.appSettings["movie_comment"]){
            isValid = true
            data.orderby = "movies.comment_count DESC"
        } else if (filter == "dislike" && req.appSettings["movie_dislike"]){
            isValid = true
            data.orderby = "movies.dislike_count DESC"
        } else if (filter == "rated" && req.appSettings["movie_rating"]){
            isValid = true
            data.orderby = "movies.rating DESC"
        }
        if (isValid) {
            data.limit = 31;
            if(parseInt(req.body.limit)){
                data.limit = parseInt(req.body.limit)
            }
            let page = 1
            if (req.body.page == '') {
                page = 1;
            } else {
                //parse int Convert String to number 
                page = parseInt(req.body.page) ? parseInt(req.body.page) : 1;
            }

            data.offset = (page - 1) * (data.limit - 1)
            await movieModel.getMovies(req, data).then(result => {
                pagging = false
                
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                response = {
                    pagging: pagging,
                    results: result
                }
            })
        }
    }

    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category  = category
    req.query.type = type
    req.query.sort = filter
    req.query.filter = sort
    req.query.language = language
    req.query.country = country
    req.query.items = response
    return res.send({...req.query,page_type:"search"});
}