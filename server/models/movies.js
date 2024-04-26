const privacyModel = require("../models/privacy")
const dateTime = require("node-datetime")
const commonFunction = require("../functions/commonFunctions");
const globalModel = require("./globalModel")
const languageModel = require("../models/languages")

module.exports = {
    checkMoviePurchased: function (data, req) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let sql = 'SELECT state,transaction_id,type FROM transactions WHERE (state = "approved" || state = "completed") AND ((sender_id = 0 AND owner_id = ?) OR sender_id = ? ) AND id = ? '
                let condition = [parseInt(data.owner_id),parseInt(data.owner_id),parseInt(data.id)]

                if(data.type){
                    let date = dateTime.create().format("Y-m-d H:M:S")
                    if(data.type == "movie"){
                        sql += " AND ( type = 'purchase_movie_purchase' || (type = 'rent_movie_purchase' && DATE_ADD(creation_date, INTERVAL 24 HOUR) >=  ? ))"
                        condition.push(date)
                    }else{
                        sql += " AND ( type = 'purchase_series_purchase' || (type = 'rent_series_purchase' && DATE_ADD(creation_date, INTERVAL 24 HOUR) >=  ? ))"
                        condition.push(date)
                    }
                }else{
                    sql += 'AND type = "movie_purchase"'
                }
                connection.query(sql, condition, function (err, results) {
                    if (err){
                     console.log(err) 
                     resolve(false)
                    }
                    if (results && results.length) {
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    createSeasons: function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM seasons WHERE movie_id = ? ORDER BY season_id DESC', [data.movie_id], function (err, results) {
                    if (err)
                        resolve(false)
                    let season = null
                    if (results) {
                        const seasons = JSON.parse(JSON.stringify(results));
                        season = seasons[0];                      
                    } 
                    //let id = season ? parseInt(season.id) + 1 : 1
                    globalModel.create(req, {movie_id:data.movie_id}, "seasons").then(result => {
                        if (result) {
                            let season = {}
                            season.season_id = result.insertId
                            //season.id =  id
                            season.castncrew = []
                            season.episodes = []
                            resolve(season);
                        } else {
                            resolve([])
                        }
                    })
                })

            });
        });
    },
    getGeneres : function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let sql = 'SELECT * FROM movie_genres LEFT JOIN genres ON genres.genre_id = movie_genres.genre_id WHERE 1=1 ';
                let condition = []

                if(data.resource_id){
                    sql += " AND movie_id = ?"
                    condition.push(data.resource_id)
                }
                if(data.movie_genre_ids){
                    sql += " AND movie_genres.movie_genre_id IN ("+data.movie_genre_ids.join(",")+")"
                }

                sql += " ORDER BY movie_genres.genre_id DESC";
                connection.query(sql, condition, function (err, results) {
                    
                    if (err){
                        console.log(err);
                        resolve(false)
                    }
                        
                    if (results) {
                        const photos = JSON.parse(JSON.stringify(results));
                        resolve(photos)
                    }else{
                        resolve([])
                    }
                })
            });
        });
    },
    getPhotos: function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM photos WHERE resource_id = ? AND resource_type = "movies" ORDER BY photo_id DESC', [data.resource_id], function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        const photos = JSON.parse(JSON.stringify(results));
                        resolve(photos)
                    }else{
                        resolve([])
                    }
                })
            });
        });
    },
    getCastPhotos: function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM photos WHERE resource_id = ? AND resource_type = "cast_crew" ORDER BY photo_id DESC', [data.resource_id], function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        const photos = JSON.parse(JSON.stringify(results));
                        resolve(photos)
                    }else{
                        resolve([])
                    }
                })
            });
        });
    },
    getReviews:function(req,data){
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let sql = "SELECT reviews.*,userdetails.displayname,IF(userdetails.avtar IS NULL || userdetails.avtar = '',(SELECT value FROM `level_permissions` WHERE name = CASE WHEN userdetails.gender = 'male' THEN 'default_mainphoto' WHEN userdetails.gender = 'female'  THEN 'default_femalemainphoto' END  AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar,userdetails.username from reviews INNER JOIN users ON users.user_id = reviews.owner_id INNER JOIN userdetails ON userdetails.user_id = users.user_id WHERE users.active = 1  "
                let condition = []

                if(data.movie_id){
                    sql += " AND reviews.movie_id = ? "
                    condition.push(data.movie_id)
                }
                if(data.review_id){
                    sql += " AND reviews.review_id = ? "
                    condition.push(data.review_id)
                }
                if(data.orderBy){
                    condition.push(req.user ? req.user.user_id : 0)
                    sql += " ORDER BY FIELD(owner_id, ?) DESC,review_id DESC "
                }
                else
                    sql += " ORDER BY reviews.review_id DESC "
                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                if (data.offset) {
                    condition.push(data.offset)
                    sql += " OFFSET ?"
                }

                connection.query(sql, condition, function (err, results) {
                    
                    if (err){
                        console.log(err)
                        resolve(false)
                    }
                        
                    if (results) {
                        const reviews = JSON.parse(JSON.stringify(results));
                        resolve(reviews)
                    }else{
                        resolve([])
                    }
                })
            });
        });
    },
    getVideos: function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {

                let sql = "SELECT movie_videos.*,seasons.season,episodes.episode_number FROM movie_videos LEFT JOIN episodes on episodes.episode_id = movie_videos.episode_id LEFT JOIN seasons on seasons.season_id = movie_videos.season_id  WHERE movie_videos.movie_id = ? "
                let condition = [data.resource_id]

                if(!data.create){
                    sql += " AND movie_videos.status = 1 AND movie_videos.completed = 1 ";
                }

                if(data.episode){
                    condition.push(data.episode)
                    sql += " AND movie_videos.episode_id = ? AND movie_videos.category != ?"
                    condition.push("full")
                }else if(data.movie_video_id){
                    sql += " AND movie_videos.movie_video_id <= ? "
                    condition.push(data.movie_video_id)
                }else if(data.extraVideos){
                    sql += " AND movie_videos.season_id = 0 AND movie_videos.episode_id = 0 AND movie_videos.category != ?"
                    condition.push("full")
                }
                if(data.getFull){
                    sql += " AND movie_videos.category = ? "
                    condition.push("full")
                }
                if(data.episode_number){
                    sql += " AND episodes.episode_number > ? AND movie_videos.category != 'external'"
                    condition.push(data.episode_number)
                }
                if(data.movieorg_video_id){
                    condition.push(data.movieorg_video_id)
                    sql += " AND movie_videos.movie_video_id = ?"
                }
                if(data.movie_id){
                    sql += " AND movie_videos.movie_id = ? "
                    condition.push(data.movie_id)
                }
                if(data.episode_id){
                    sql += " AND movie_videos.episode_id = ? "
                    condition.push(data.episode_id)
                }
                if(data.season_id){
                    sql += " AND movie_videos.season_id = ? "
                    condition.push(data.season_id)
                }

                
                sql += " ORDER BY movie_videos.movie_video_id DESC "
                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                if (data.offset) {
                    condition.push(data.offset)
                    sql += " OFFSET ?"
                }
                connection.query(sql, condition, function (err, results) {
                    
                    if (err){
                        console.log(err)
                        resolve(false)
                    }
                        
                    if (results) {
                        const videos = JSON.parse(JSON.stringify(results));
                        resolve(videos)
                    }else{
                        resolve([])
                    }
                })
            });
        });
    },
    getSeasons: function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let customSelect = ""
                let condition = [data.movie_id]
                if(data.order){
                    customSelect = ',IF(seasons.image IS NULL || seasons.image = "","' + req.appSettings['seasons_default_photo'] + '",seasons.image) as image'
                }
                let sql = 'SELECT *'+customSelect+', (SELECT COUNT(episodes.episode_id) from episodes  WHERE episodes.season_id = seasons.season_id) as episodes_count  FROM seasons WHERE  seasons.movie_id = ? '
                
                if(data.season){
                    condition.push(data.season)
                    sql += " AND season = ?"
                }
                if(data.episode_count){
                    sql += " HAVING episodes_count > 0 "
                }
                
                if(data.order){
                    sql += data.order
                }else{
                    sql += " ORDER BY seasons.season_id ASC"
                }
                connection.query(sql,condition, function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        const seasons = JSON.parse(JSON.stringify(results));
                        resolve(seasons)
                    }else{
                        resolve(false)
                    }
                })
            });
        });
    },
    getEpisods: function (req,data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let customSelect = ""
                if(data.movieCount){
                    customSelect = "movie_videos.type,movie_videos.code,"
                }
                let sql = 'SELECT '+customSelect+'episodes.*,episodes.image as orgImage,IF(episodes.image IS NULL || episodes.image = "","' + req.appSettings['episode_default_photo'] + '",episodes.image) as image FROM episodes '
                let condition = []

                if(data.movieCount){
                    sql += " LEFT JOIN movie_videos ON movie_videos.episode_id = episodes.episode_id AND movie_videos.season_id = ? AND movie_videos.category = 'full' "
                    condition.push(data.season_id)
                }

                condition.push(data.season_id)
                sql += " WHERE  episodes.season_id = ? ORDER BY episode_id ASC "

                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                if (data.offset) {
                    condition.push(data.offset)
                    sql += " OFFSET ?"
                }
                connection.query(sql,condition , function (err, results) {
                    if (err)
                        resolve([])
                    if (results) {
                        const episods = JSON.parse(JSON.stringify(results));
                        resolve(episods)
                    }else{
                        resolve([])
                    }
                })
            });
        });
    },
    findById: function (id, req, isApprove = true) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {

                let approve = ""
                if(isApprove){
                    approve = " approve = 1 AND "
                }
                connection.query('SELECT * FROM movies WHERE '+approve+' completed = 1 AND movie_id = ?', [id], function (err, results) {
                    if (err){
                        console.log(err)
                        resolve(false)
                    }
                        

                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    deleteEpisode:function ( req,episode) {
        return new Promise(function (resolve) {
            req.getConnection(function (err, connection) {
                connection.query("DELETE FROM episodes WHERE episode_id = ?", [episode.episode_id], async function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        let type = "episodes"
                        let id = episode.episode_id
                        commonFunction.deleteImage(req,'',episode.image);
                        connection.query("DELETE FROM comments WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM favourites WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM likes WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM recently_viewed WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM ratings WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM notifications WHERE (object_type = ? && object_id = ?) OR (subject_type = ? && object_id = ?)", [type,id,type,id], function () { })
                        connection.query("DELETE FROM reports WHERE type = ? AND id = ?", [type, episode.custom_url], function () {})
                        await connection.query("SELECT * from movie_videos where episode_id = ?", [id], function (err, results, fields) {
                            if (!err) {
                                const videosItems = JSON.parse(JSON.stringify(results));
                                videosItems.forEach(video => {
                                    commonFunction.deleteImage(req,'',"","",video);
                                })
                            }
                        })
                        connection.query("DELETE FROM movie_videos WHERE episode_id = ?", [id], function () {})
                        resolve(true)
                    } else {
                        resolve("");
                    }
                })
            })
        });
    },
    deleteSeason:function ( req,season) {
        return new Promise(function (resolve) {
            req.getConnection(function (err, connection) {
                connection.query("DELETE FROM seasons WHERE season_id = ?", [season.season_id], async function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        let type = "seasons"
                        let id = season.season_id
                        commonFunction.deleteImage(req,'',season.image);
                        await connection.query("SELECT * from episodes where season_id = ? AND image != ''", [id], function (err, results, fields) {
                            if (!err) {
                                const items = JSON.parse(JSON.stringify(results));
                                items.forEach(item => {
                                    commonFunction.deleteImage(req,'',"","",item.image);
                                })
                            }
                        })
                        connection.query("DELETE FROM episodes WHERE season_id = ?", [id], function () { })
                        connection.query("DELETE FROM cast_crew WHERE resource_type= 'season' AND resource_id = ?", [id], function () { })
                        connection.query("DELETE FROM comments WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM favourites WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM likes WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM recently_viewed WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM ratings WHERE type = ? && id = ?", [type,id], function () { })
                        connection.query("DELETE FROM notifications WHERE (object_type = ? && object_id = ?) OR (subject_type = ? && object_id = ?)", [type,id,type,id], function () { })
                        connection.query("DELETE FROM reports WHERE type = ? AND id = ?", [type, season.custom_url], function () {})
                        await connection.query("SELECT * from movie_videos where season_id = ?", [id], function (err, results, fields) {
                            if (!err) {
                                const videosItems = JSON.parse(JSON.stringify(results));
                                videosItems.forEach(video => {
                                    commonFunction.deleteImage(req,'',"","",video);
                                })
                            }
                        })
                        connection.query("DELETE FROM movie_videos WHERE season_id = ?", [id], function () {})
                        resolve(true)
                    } else {
                        resolve("");
                    }
                })
            })
        });
    },
    delete: function (id, req,type = "movies") {
        return new Promise(function (resolve) {
            req.getConnection(function (err, connection) {
                connection.query("SELECT * FROM movies WHERE movie_id = ?", [id], function (err, results) {
                    const movie = JSON.parse(JSON.stringify(results))[0];
                    connection.query("DELETE FROM movies WHERE movie_id = ?", [id], function (err, results) {
                        if (err)
                            resolve(false)
                        if (results) {
                            commonFunction.deleteImage(req,'',"","",movie);
                            connection.query("DELETE FROM channelmovies WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM videos_meta WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM seasons WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM episodes WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM photos WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM genres WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM keywords WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM reviews WHERE movie_id = ?", [id], function () { })
                            connection.query("DELETE FROM watchlaters WHERE id = ? AND type = ?", [id,"movie-series"], function () { })
                            connection.query("DELETE FROM comments WHERE type = ? && id = ?", [type,id], function () { })
                            connection.query("DELETE FROM favourites WHERE type = ? && id = ?", [type,id], function () { })
                            connection.query("DELETE FROM likes WHERE type = ? && id = ?", [type,id], function () { })
                            connection.query("DELETE FROM recently_viewed WHERE type = ? && id = ?", [type,id], function () { })
                            connection.query("DELETE FROM ratings WHERE type = ? && id = ?", [type,id], function () { })
                            connection.query("DELETE FROM notifications WHERE (object_type = ? && object_id = ?) OR (subject_type = ? && object_id = ?)", [type,id,type,id], function () { })
                            connection.query("DELETE FROM reports WHERE type = ? AND id = ?", [type, movie.custom_url], function () {
                            })
                            resolve(true)
                        } else {
                            resolve("");
                        }
                    })
                })
            })
        });
    },
    getMovies: async function (req, data) {
        return new Promise(function (resolve) {
            req.getConnection(async function (err, connection) {
                let condition = []
                let owner_id = 0
                if (req.user && req.user.user_id) {
                    owner_id = parseInt(req.user.user_id)
                }
                let customSelect = ""
                if (data.orderby == "random") {
                    customSelect = ' FLOOR(1 + RAND() * movie_id) as randomSelect, '
                }

                let fields = 'movies.*,'+customSelect+'categories.title as category_title,likes.like_dislike,users.level_id,userdetails.displayname,userdetails.username,users.paypal_email,userdetails.verified,IF(movies.image IS NULL || movies.image = "","' + req.appSettings['movie_default_photo'] + '",movies.image) as image,IF(userdetails.avtar IS NULL || userdetails.avtar = "",(SELECT value FROM `level_permissions` WHERE name = \"default_mainphoto\" AND type = \"member\" AND level_id = users.level_id),userdetails.avtar) as avtar,watchlaters.watchlater_id,favourites.favourite_id'

                if(data.countITEM){
                    fields = "COUNT(movies.movie_id) as itemCount"
                }

                if(data.purchaseMovie){
                    let date = dateTime.create().format("Y-m-d H:M:S")
                    condition.push(date)
                    fields += ",CASE WHEN (tra.type = 'rent_series_purchase' || tra.type = 'rent_movie_purchase') AND DATE_ADD(tra.creation_date, INTERVAL 24 HOUR) <=  ? THEN 'expired' ELSE 'active' END as purchaseStatus "
                }

                let sql = 'SELECT '+fields+' FROM movies '
                
                if (parseInt(data.channel_id)) {
                    condition.push(parseInt(data.channel_id))
                    if(!data.search){
                        sql += " INNER JOIN channelmovies ON channelmovies.movie_id = movies.movie_id AND channel_id = ?"
                    }else{
                        sql += " LEFT JOIN channelmovies ON channelmovies.movie_id = movies.movie_id AND channel_id = ?"
                    }
                }
                
                sql += ' INNER JOIN users on users.user_id = movies.owner_id  INNER JOIN userdetails on users.user_id = userdetails.user_id LEFT JOIN likes ON likes.id = movies.movie_id AND likes.type = "movies"  AND likes.owner_id =  ' + owner_id + ' LEFT JOIN watchlaters ON watchlaters.id = movies.movie_id AND watchlaters.owner_id = ' + owner_id + ' AND watchlaters.type = "movie-series" LEFT JOIN favourites ON (favourites.id = movies.movie_id AND favourites.type = "movies" AND favourites.owner_id = ' + owner_id + ') '

                sql += " LEFT JOIN categories ON categories.category_id = movies.category_id"

                let orderbyField = false
                if (data.recentlyViewed) {
                    condition.push(parseInt(data.owner_id))
                    orderbyField = " recently_viewed.view_id DESC "
                    sql += " INNER JOIN recently_viewed ON movies.movie_id = recently_viewed.id AND recently_viewed.owner_id = ? AND recently_viewed.type='movies' "
                }
                if (data.myrated) {
                    orderbyField = " ratings.rating_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN ratings ON movies.movie_id = ratings.id AND ratings.owner_id = ? AND ratings.type='movies' "
                }
                if (data.myfav) {
                    orderbyField = " f.favourite_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN favourites as f ON movies.movie_id = f.id AND f.owner_id = ? AND f.type='movies' "
                }
                if (data.mylike) {
                    orderbyField = " l.like_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN likes as l ON movies.movie_id = l.id AND l.owner_id = ? AND l.type='movies' AND l.like_dislike = 'like' "
                }
                if (data.mydislike) {
                    orderbyField = " l.like_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN likes as l ON movies.movie_id = l.id AND l.owner_id = ? AND l.type='movies' AND l.like_dislike = 'dislike' "
                }
                if (data.mywatchlater) {
                    orderbyField = " wtl.watchlater_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN watchlaters as wtl ON movies.movie_id = wtl.id AND wtl.owner_id = ? AND wtl.type = 'movie-series' "
                }

                if (data.mycommented) {
                    orderbyField = " comments.comment_id DESC "
                    condition.push(parseInt(data.owner_id))
                    sql += " INNER JOIN comments ON movies.movie_id = comments.id AND comments.owner_id = ? AND comments.type='movies' "
                }

                if(data.purchaseMovie){
                    sql += " INNER JOIN transactions tra ON movies.movie_id = tra.id "
                }
                if (data.cast_crew_member_id) {
                    sql += " INNER JOIN cast_crew cnc ON movies.movie_id = cnc.resource_id AND cnc.resource_type = 'movie' "
                }
                sql += ' WHERE 1=1 '
                sql += " AND users.active = 1 AND users.approve = 1 "

                if(!req.isview && !data.purchaseMovie && !data.countITEM){
                    if(req.contentType){
                        condition.push(req.contentType == "movies" ? "movie" : "series")
                        sql += " AND movies.category = ?"
                    }else{
                        condition.push("movie")
                        sql += " AND movies.category = ?"
                    }
                }
                if(data.language){
                    condition.push(data.language)
                    sql += " AND movies.language = ?"
                }
                if(data.show_slider){
                    condition.push(data.show_slider)
                    sql += " AND movies.show_slider = ?"
                }
                if(data.country){
                    condition.push(data.country)
                    condition.push(data.country)
                    sql += " AND ( movies.country = ?"
                    sql += " OR movies.movie_id IN (SELECT movie_id FROM movie_countries WHERE movie_countries.country_id = ? AND movies.movie_id = movie_countries.movie_id) )"
                }
                if(data.genre){
                    condition.push(data.genre)
                    sql += " AND movies.movie_id IN (SELECT movie_id FROM movie_genres INNER JOIN genres ON genres.genre_id = movie_genres.genre_id WHERE genres.slug = ? AND movies.movie_id = movie_genres.movie_id)"
                }
                
                if(data.purchaseMovie){
                    condition.push(data.purchase_user_id)
                    condition.push(data.purchase_user_id)
                    sql+= " AND (tra.state = 'completed' || tra.state = 'approved') AND ((tra.sender_id = 0 AND tra.owner_id = ?) OR tra.sender_id = ? ) AND (tra.type = 'rent_movie_purchase' || tra.type = 'purchase_movie_purchase' || tra.type = 'rent_series_purchase' || tra.type = 'purchase_series_purchase') "
                }
                if (!data.myContent) {
                    if (data.movieview) {
                        if(!req.user)
                            sql += " AND movies.approve = 1 "
                    } else if(!data.purchaseMovie) {
                        if (!req.session.adult_allow && req.appSettings['movie_adult'] == 1) {
                            //sql += " AND movies.adult = 0 "
                        }
                        sql += ' AND movies.completed = 1 AND movies.search = 1 AND movies.approve = 1 '
                    }else{
                        sql += " AND movies.approve = 1 "
                    }
                }
                if (parseInt(data.channel_id)) {
                    if(!data.search){
                        sql += " AND channelmovies.movie_id IS NOT NULL "
                    }else{
                        sql += " AND channelmovies.movie_id IS NULL "
                    }
                }
                
                if (data.movie_id) {
                    condition.push(parseInt(data.movie_id))
                    sql += " AND movies.movie_id = ? "
                }
                if (data.not_movie_id) {
                    condition.push(parseInt(data.not_movie_id))
                    sql += " AND movies.movie_id != ?"
                }
                if(data.not_movies_id && data.not_movies_id.length){
                    const movie_ids = []
                    data.not_movies_id.forEach(item => {
                        movie_ids.push(item.movie_id)
                    })
                    sql += " AND movies.movie_id NOT IN ("+movie_ids.join(",")+")"
                }
                //

                if (data.title) {
                    condition.push(data.title.toLowerCase())
                    condition.push(data.title.toLowerCase())
                    sql += " AND ( LOWER(movies.title) LIKE CONCAT('%', ?,  '%') ||  "
                    sql += " CONCAT(',', tags, ',') like CONCAT('%,', ?,  ',%') )"
                }
                if (data.cast_crew_member_id) {
                    condition.push(data.cast_crew_member_id)
                    sql += " AND cnc.cast_crew_member_id = ? "
                    condition.push("movie")
                    sql += " AND cnc.resource_type = ? "
                }
                if (parseInt(data.owner_id) && !data.myCustom) {
                    condition.push(parseInt(data.owner_id))
                    sql += " AND movies.owner_id = ?"
                }
                
                if (data.is_featured) {
                    condition.push(parseInt(data.is_featured))
                    sql += " AND movies.is_featured = ?"
                }
                if (data.is_not_hot) {
                    condition.push(1)
                    sql += " AND movies.is_hot != ?"
                }
                if (data.is_not_featured) {
                    condition.push(1)
                    sql += " AND movies.is_featured != ?"
                }
                if (data.is_not_sponsored) {
                    condition.push(1)
                    sql += " AND movies.is_sponsored != ?"
                }
                if (data.is_hot) {
                    condition.push(parseInt(data.is_hot))
                    sql += " AND movies.is_hot = ?"
                }
                if (data.is_sponsored) {
                    condition.push(parseInt(data.is_sponsored))
                    sql += " AND movies.is_sponsored = ?"
                }
                if (data.offtheday) {
                    condition.push(data.offtheday)
                    sql += " AND movies.offtheday = ?"
                }
                if (data.category_id) {
                    let customBraces = ""
                    if (data.tags && data.related) {
                        customBraces = " ( "
                    }
                    condition.push(parseInt(data.category_id))
                    sql += " AND " + customBraces + " movies.category_id = ?"
                }

                //related channels
                if (data.tags) {
                    if (data.related && data.category_id)
                        sql += " OR ( "
                    else {
                        sql += " AND ( "
                    }
                    const splitVal = data.tags.split(',')
                    let counter = 1
                    splitVal.forEach(tag => {
                        condition.push(tag)
                        sql += " CONCAT(',', tags, ',') like CONCAT('%,', ?,  ',%') "
                        if (counter != splitVal.length) {
                            sql += " OR "
                        }
                        counter = counter + 1
                    });
                    sql += " ) "
                    if (data.related && data.category_id) {
                        sql += "  ) "
                    }
                }
                if (data.subcategory_id) {
                    condition.push(parseInt(data.subcategory_id))
                    sql += " AND movies.subcategory_id = ?"
                }
                if (data.subsubcategory_id) {
                    condition.push(parseInt(data.subsubcategory_id))
                    sql += " AND movies.subsubcategory_id = ?"
                }
                if (data.rating) {
                    condition.push(data.rating)
                    sql += " AND movies.rating = ?"
                }

                if (data.custom_url) {
                    condition.push(data.custom_url)
                    sql += " AND movies.custom_url =?"
                }

                await privacyModel.checkSQL(req,'movie','movies','movie_id').then(result => {
                    if(result){
                        sql += " AND ( "+result+" )"
                    }
                })


                //if (data.mycommented || data.purchaseMovie) {
                    if(!data.countITEM)
                        sql += " GROUP BY movies.movie_id "
                //}
                if(data.purchaseMovie) {
                    sql += " ORDER BY tra.transaction_id DESC "
                }else if (data.orderby == "random") {
                    sql += " ORDER BY randomSelect DESC "
                } else if (data.orderby) {
                    sql += " ORDER BY " + data.orderby
                } else if (orderbyField) {
                    sql += " ORDER BY " + orderbyField
                } else if (parseInt(data.channel_id)) {
                    sql += " ORDER BY channelmovies.movie_id DESC "
                } else if (data.playlist_id) {
                    sql += " ORDER BY playlistmovies.movie_id DESC "
                } else {
                    sql += " ORDER BY movies.movie_id DESC "
                }

                if (data.limit) {
                    condition.push(data.limit)
                    sql += " LIMIT ?"
                }

                if (data.offset) {
                    condition.push(data.offset)
                    sql += " OFFSET ?"
                }
                if(data.countITEM){
                   // console.log(sql,condition,' countITEM');
                }
                connection.query(sql, condition, function (err, results) {
                    if (err) {
                        console.log(err)
                        resolve(false)
                    }
                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        const movies = []
                        if(level && level.length){
                            let spokenLanguage = languageModel.spokenLanguages() 
                            level.forEach(movie => {
                                if(movie.language && movie.language != 0){
                                    let obj = spokenLanguage.find(o => o.code === movie.language);
                                    if(obj)
                                        movie.language_title = obj.name
                                }
                                if(movie.movie_release){
                                    let split = movie.movie_release.split("-")
                                    if(split.length > 0)
                                    movie.release_year = split[0]
                                }
                                delete movie.password
                                movies.push(movie)
                            })
                            resolve(movies)
                        }else
                            resolve(level);
                    } else {
                        resolve(false);
                    }
                })
            })
        })
    },
    userMovieUploadCount: function (req) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT COUNT(movie_id) as totalmovies FROM movies WHERE owner_id = ?', [parseInt(req.user.user_id)], function (err, results) {
                    if (err)
                        reject(err)

                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    } else {
                        resolve("");
                    }
                })
            })
        });
    },
    episodeExists: function (req,value) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let sql = "SELECT * FROM episodes WHERE season_id = ? AND movie_id = ? AND episode_number = ?"
                let condition = [parseInt(req.body.season_id),parseInt(req.body.movie_id),parseInt(value)]

                if(req.body.episode_id){
                    sql += " AND episode_id != ?"
                    condition.push(req.body.episode_id)
                }

                connection.query(sql, condition, function (err, results) {
                    if (err)
                        resolve(false)
                    if (results) {
                        const level = JSON.parse(JSON.stringify(results));
                        resolve(level[0]);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    findByCustomUrl: function (id, req, res, allowData = false) {
        return new Promise(function (resolve) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM movies WHERE custom_url = ?', [id], function (err, results) {
                    if (err)
                        resolve(false)

                    if (results) {
                        const movies = JSON.parse(JSON.stringify(results));
                        let video = movies[0]
                        if (!allowData && video) {
                            delete video['password']
                            delete video['purchase_count']
                            delete video['total_purchase_amount']
                        }
                        resolve(video);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    findArtistById: function (id, req) {
        return new Promise(function (resolve) {
            req.getConnection(function (err, connection) {
                connection.query('SELECT * FROM cast_crew_members WHERE cast_crew_member_id = ?', [id], function (err, results) {
                    if (err)
                        resolve(false)

                    if (results) {
                        const casts = JSON.parse(JSON.stringify(results));
                        resolve(casts[0]);
                    } else {
                        resolve(false);
                    }
                })
            })
        });
    },
    getStats: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let condition = []
                let sql = ""
                let type =  data.type
                if (data.criteria == "today") {
                    let match = { "00 AM": 0, "01 AM": 0, "02 AM": 0, "03 AM": 0, "04 AM": 0, "05 AM": 0, "06 AM": 0, "07 AM": 0, "08 AM": 0, "09 AM": 0, "10 AM": 0, "11 AM": 0, "12 PM": 0, "01 PM": 0, "02 PM": 0, "03 PM": 0, "04 PM": 0, "05 PM": 0, "06 PM": 0, "07 PM": 0, "08 PM": 0, "09 PM": 0, "10 PM": 0, "11 PM": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('Y-m-d') + ' 00:00:00';
                    var d = new Date();
                    let dd = dateTime.create(d)
                    let nextDate = dd.format('Y-m-d') + " 23:59:00"
                    
                    condition.push(currentDay)
                    condition.push(nextDate)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed')  "
                    
                    if(data.type == "movie"){
                        sql += " AND (type = 'rent_movie_purchase' || type = 'purchase_movie_purchase')"
                    }else{
                        sql += " AND (type = 'rent_series_purchase' || type = 'purchase_series_purchase')"
                    }
                    
                    if(data.movie_id){
                        condition.push(data.movie_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d %h')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            
                            if (err){
                                console.log(err)
                                resolve(false)
                            }
                            const resultArray = {}
                            const spentArray = {}
                            if (results) {

                                let spent = []
                                let result = []

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('I p')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })

                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                        //match[key.toString()] = resultArray[key]
                                    } else {
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('W')})
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_month") {
                    var dt = dateTime.create();
                    var currentYear = dt.format('Y');
                    var currentMonth = dt.format('m');
                    let daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

                    var date = new Date();
                    var firstDay = dateTime.create(new Date(date.getFullYear(), date.getMonth(), 1)).format("Y-m-d") + " 00:00:00";
                    var lastDay = dateTime.create(new Date(date.getFullYear(), date.getMonth() + 1, 0)).format("Y-m-d") + " 23:59:00";

                    let match = ""
                    if (daysInMonth == 31) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0, "31 ": 0 }
                    } else if (daysInMonth == 30) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0 }
                    } else if (daysInMonth == 29) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0}
                    } else if (daysInMonth == 28) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0}
                    }

                    condition.push(firstDay)
                    condition.push(lastDay)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed')  "
                    if(data.type == "movie"){
                        sql += " AND (type = 'rent_movie_purchase' || type = 'purchase_movie_purchase')"
                    }else{
                        sql += " AND (type = 'rent_series_purchase' || type = 'purchase_series_purchase')"
                    }
                    if(data.movie_id){
                        condition.push(data.movie_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d')"

                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('d')
                                    resultArray[H+" "] = result.count
                                    spentArray[H+" "] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('f') })
                            } else {
                                resolve(false);
                            }
                        })
                    });

                } else if (data.criteria == "this_week") {
                    let match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('W');
                    var weekStart = ""
                    var weekEnd = ""

                    if (currentDay != "Saturday") {
                        var d = new Date();
                        // set to Monday of this week
                        d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                        // set to previous Saturday
                        d.setDate(d.getDate() - 2);
                        weekStart = d
                    } else {
                        weekStart = new Date()
                    }

                    if (currentDay == "Friday") {
                        weekEnd = new Date()
                    } else {
                        var d = new Date();
                        var resultDate = new Date(d.getTime());
                        resultDate.setDate(d.getDate() + (7 + 5 - d.getDay()) % 7);
                        weekEnd = resultDate
                    }
                    var weekStartObj = dateTime.create(weekStart);
                    var weekObj = weekStartObj.format('Y-m-d');
                    var weekEndObj = dateTime.create(weekEnd);
                    var weekendObj = weekEndObj.format('Y-m-d');
                    match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    condition.push(weekObj)
                    condition.push(weekendObj)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed')  "
                    
                    if(data.type == "movie"){
                        sql += " AND (type = 'rent_movie_purchase' || type = 'purchase_movie_purchase')"
                    }else{
                        sql += " AND (type = 'rent_series_purchase' || type = 'purchase_series_purchase')"
                    }

                    if(data.movie_id){
                        condition.push(data.movie_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%d')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('W')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:weekObj +" - "+weekendObj })
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_year") {
                    let match = { "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }
                    var d = new Date();
                    const start = d.getFullYear() + "-01-01 00:00:00"
                    const end = d.getFullYear() + "-12-31 23:59:00"
                    condition.push(start)
                    condition.push(end)

                    sql += "SELECT COUNT(*) as count,SUM(price) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed')  "
                    
                    if(data.type == "movie"){
                        sql += " AND (type = 'rent_movie_purchase' || type = 'purchase_movie_purchase')"
                    }else{
                        sql += " AND (type = 'rent_series_purchase' || type = 'purchase_series_purchase')"
                    }

                    if(data.movie_id){
                        condition.push(data.movie_id)
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(data.user.user_id)
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                reject(err)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('n')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('Y') })
                            } else {
                                resolve("");
                            }
                        })
                    });
                }
            })
        });
    }
}
