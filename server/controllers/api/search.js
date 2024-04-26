const commonFunction = require("../../functions/commonFunctions")
const categoryModel = require("../../models/categories")
const channelModel = require("../../models/channels")
const blogModel = require("../../models/blogs")
const videoModel = require("../../models/videos")
const playlistModel = require("../../models/playlists")
const movieModel = require("../../models/movies")
const userModel = require("../../models/users")
const audioModel = require("../../models/audio")
exports.index = async (req, res) => {
    let type = req.params.type ? req.params.type : req.body.type
    if (!type) {
        type = "video"
    }
    
    let text = req.query.h && req.query.h != "" ? req.query.h : ''
    let sort = req.query.filter && req.query.filter != "" ? req.query.filter : ''
    let filter = req.query.sort && req.query.sort != "" ? req.query.sort : ''
    let category = req.query.category && req.query.category != "" ? req.query.category : null
    let country = req.query.country && req.query.country != "" ? req.query.country : null
    let language = req.query.language && req.query.language != "" ? req.query.language : null
    req.query.showForm = false
    if (!text) {
        req.query.showForm = true
        if (req.query.data) {
            
            res.send({})
            return
        }
        return
    }
    let isValid = false
    let data = {}
    data.title = text
    req.query.search_title = text


    if (type == "video") {
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
        }
        if (filter == "" || filter == "latest") {
            isValid = true
            data.orderby = "videos.video_id DESC"
        } else if (filter == "view") {
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
                return res.send({
                    pagging: pagging,
                    videos: result
                })
            })
        }
    } else if (type == "blog") {
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
        }
        if (filter == "" || filter == "latest") {
            isValid = true
            data.orderby = "blogs.blog_id DESC"
        } else if (filter == "view") {
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
            await blogModel.getBlogs(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                return res.send({
                    pagging: pagging,
                    blogs: result
                })
            })
        }
    } else if (type == "playlist") {
        if (!filter) {
            filter = ""
        }
        if (sort == "featured") {
            data.is_featured = 1
        } else if (sort == "sponsored") {
            data.is_sponsored = 1
        } else if (sort == "hot") {
            data.is_hot = 1
        }
        if (filter == "" || filter == "latest") {
            isValid = true
            data.orderby = "playlists.playlist_id DESC"
        } else if (filter == "view") {
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
            await playlistModel.getPlaylists(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                return res.send({
                    pagging: pagging,
                    playlists: result
                })
            })
        }
    } else if (type == "member") {
        if (!filter) {
            filter = ""
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
            data.orderby = "users.user_id DESC"
        } else if (filter == "view") {
            isValid = true
            data.orderby = "userdetails.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["member_favourite"]) {
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
            if (req.user) {
                data.not_user_id = req.user.user_id
            }
            await userModel.getMembers(req, data).then(result => {
                pagging = false
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                return res.send({
                    pagging: pagging,
                    members: result
                })
            })
        }
    } else if (type == "channel") {
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
            data.orderby = "channels.channel_id DESC"
        } else if (filter == "view") {
            isValid = true
            data.orderby = "channels.view_count DESC"
        } else if (filter == "favourite" && req.appSettings["channel_favourite"]) {
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
            await channelModel.getChannels(req, data).then(result => {
                pagging = false
                
                if (result.length > data.limit - 1) {
                    result = result.splice(0, data.limit - 1);
                    pagging = true
                }
                return res.send({
                    pagging: pagging,
                    channels: result
                })
            })
        }
    }else if (type == "audio") {
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
                return res.send({
                    pagging: pagging,
                    audios: result
                })
            })
        }
    }else if (type == "movie" || type == "movies" || type == "series") {
        if (!filter) {
            filter = ""
        }
        if(type == "series"){
            req.contentType = "series"
        }
        if (category) {
            data.category_id = category
        }
        if(language){
            data.language = language
        }
        if(country){
            data.country = country
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
                if(type == "movie" || req.body.fromSearchPage){
                    return res.send({
                        pagging: pagging,
                        movies: result
                    })
                }else{
                    return res.send({
                        pagging: pagging,
                        series: result
                    })
                }
            })
        }
    }
    if (!isValid) {
        res.send({})
        return
    }
    if(!res.headersSent)
    res.send({})
}