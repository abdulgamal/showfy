const MovieDB = require('node-themoviedb');
const uniqid = require('uniqid')
const dateTime = require("node-datetime")
const globalModel = require("../models/globalModel")
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original'
const BACKDROP_BASE_URI = 'https://image.tmdb.org/t/p/w1280'
const PROFILE_BASE_URI = 'https://image.tmdb.org/t/p/w500'
const YOUTUBE_BASE_URI = 'https://youtube.com/embed/'
let OWNER_ID = 1
let INDEX_ITEM = 1
exports.getType = (data) => {   
    if (data["season_number"] && data['episode_number']) {
        return "episode";
    } else if (data["season_number"]) {
        return "season"
    } else if (data['media_type'] === 'person' || data['birthday']) {
        return "people"
    } else if (data['first_air_date']) {
        return "season"
    } else {
        return "movie"
    }
}

exports.getDiscover = async (req,page,mdb) => {
    let args = {
        pathParameters: {
          
        },
        query: {
            limit:1000,
            sort_by: 'popularity.desc',
            include_adult:req.appSettings['movie_tmdb_adult'],
            page:page,
            ...req.query
        },
    };

    let lists = null
    if(req.query.type == "movie"){
        lists = await mdb.discover.movie(args);
    }else{
        lists = await mdb.discover.tv(args);
    }
    return lists
}

exports.importMovies = async(req,res,next,page = 1) => {
    OWNER_ID = parseInt(req.appSettings['movie_tmdb_owner']) > 0 ? req.appSettings['movie_tmdb_owner'] : 1;
    const mdb = new MovieDB(req.appSettings["movie_tmdb_api_key"], {language:req.appSettings['movie_tmdb_language']});
    if(page == 1){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
    }
    if(req.query && !req.query.cronData && req.query.type){
        if(!req.appSettings['movie_tmdb_api_key']){
            res.write(`<b style="color:red">TMDB Api key missing in setting.</b>`);
            res.end();
            return
        }
        if(!req.query.type)
            req.query.type = "movie"
        let lists = null
        try{
         lists = await exports.getDiscover(req,page,mdb)
        }catch(error){
            res.write(`<b style="color:red">${error}</b>`);
            res.end();
            return
        }
        if(lists.data){
            let total_pages = lists.data.total_pages
            if(page == 1){
                res.write(`<b style="color:green">Total Pages: ${total_pages}</b><br>`);
                res.write(`<b style="color:green">Total Results: ${lists.data.total_results}</b><br><br>`);
            }
            for(const data of lists.data.results){
                if(!data.adult ||  (data.adult && parseInt(req.appSettings['movie_tmdb_adult']) == 1)){
                  let title =  await exports.getTitles(res,req,data,mdb,req.query.type);  
                  res.write(`<b>Page</b>: ${page} | <b>Index</b>: ${INDEX_ITEM} | <b>Title</b>: ${await exports.getTitle(title)}<br>` );          
                }else{
                    res.write(`<b>Page</b>: ${page} | <b>Index</b>: ${INDEX_ITEM} | <b style="color:red">Skiping due to adult content</b>: ${await exports.getTitle(title)}<br>`);    
                }
                INDEX_ITEM = INDEX_ITEM + 1
            }
            if(page != total_pages){
                await exports.importMovies(req,res,next,page+1);
            }else{
                res.write(`<b style="color:green">Import Completed.</b>`);
                res.end();
            }
        }else{
            res.write(`<b style="color:red">No record found to import. Please choose different search.</b>`);
            res.end();
        }
          return;
    }

    //get unimported lists
    let listApis = await globalModel.custom(req,"SELECT * from movies_imports WHERE DATE(modified_date) < DATE(NOW())");
    try {
        const args = {
          pathParameters: {
            
          },
          query: {
              limit:1000,
              //sort_by: 'popularity.desc',
              include_adult:req.appSettings['movie_tmdb_adult']
          },
        };
        for (const list of listApis) {
            let lists = {};
            args.query.page = listApis.page
            if(list.type == "movie"){
                try {
                    if(list.category == "popular"){
                        lists = await mdb.movie.getPopular(args);
                    }else if(list.category == "top_rated"){
                        lists = await mdb.movie.getTopRated(args);
                    }else if(list.category == "upcoming"){
                        lists = await mdb.movie.getUpcoming(args);
                    }else if(list.category == "now_playing"){
                        lists = await mdb.movie.getNowPlaying(args);
                    }else{
                        continue;
                    }
                }catch(err){
                    console.log(err)
                    continue;
                }
            }else{
                if(lists){
                    if(list.category == "popular"){
                        lists = await mdb.tv.getPopular(args);
                    }else if(list.category == "top_rated"){
                        lists = await mdb.tv.getTopRated(args);
                    }else if(list.category == "upcoming"){
                        lists = await mdb.tv.getOnAir(args);
                    }else if(list.category == "now_playing"){
                        lists = await mdb.tv.getAiringToday(args);
                    }else{
                        continue;
                    }
                }
            }
            if(lists){
                for(const data of lists.data.results){
                    if(!data.adult ||  (data.adult && parseInt(req.appSettings['movie_tmdb_adult']) == 1))
                        await exports.getTitles(res,req,data,mdb,list.type);
                }
            }
        }
        res.send({completed:1});
    } catch (error) {
        console.error(error);
    }
}
exports.getTitles = async (res,req,data,mdb,type) => {
    if (!data.id) return {};
    const appends = [
        'credits', 'external_ids', 'images', 'content_ratings',
        'keywords', 'release_dates', 'videos', 'seasons'
    ];
    let args = null
    if(type == "movie"){
     args = {
        pathParameters: {
            movie_id:data.id
        },
        query: {
            append_to_response: appends.join(",")
        },
      };
    }else{
        args = {
            pathParameters: {
                tv_id:data.id
            },
            query: {
                append_to_response: appends.join(",")
            },
          };
    }
    let response = null
    
    try {
        if(type == "movie"){
            response = await mdb.movie.getDetails(args);
        }else{
            response = await mdb.tv.getDetails(args);
        }
    }catch(error){
        console.log(error)
        return null
    }
    if(response.data)
        await exports.importTitles(res,req,response.data,type,mdb);
    return response.data;
}
exports.getTitle = (data) => {
    if (data['title']) {
        return data['title'];
    } else if (data['name']) {
        return data['name'];
    } else {
        return null;
    }
}

exports.importTitles = async (res,req,data,type,mdb) => {

        let release_key = type == "movie" ? 'release_date' : 'first_air_date';
        
        let orgData = {
            
            'image' :  data["poster_path"] ? PROFILE_BASE_URI+ data["poster_path"] : "",
            'movie_release' :  data[release_key],
            'title' :  await exports.getTitle(data),
            'description' :  data.overview ? data.overview : "",
            'language' : data.original_language ? data.original_language : "",
            'tagline' : data.tagline ? data.tagline : "",
            'budget' : data.budget ? data.budget : 0,
            'revenue' : data.revenue ? data.revenue : 0,
            'runtime' :  `${!isNaN(exports.getRuntime(req,data,type,mdb)) && exports.getRuntime(req,data,type,mdb) != NaN ? parseInt(exports.getRuntime(req,data,type,mdb)) : 0}`,
            'backdrop' :  await exports.getBackdrop(req,data,type,mdb),
            'imdb_id' : data.external_ids && data.external_ids.imdb_id ? data.external_ids.imdb_id : null,
            'tmdb_id' :  data['id'],
            'tags' :  await exports.getKeywords(req,data,type,mdb),
            'season_count' : data.number_of_seasons ? data.number_of_seasons : 0,
            'episode_count' : data.number_of_episodes ? data.number_of_episodes : 0,
            'series_ended' : data.status && (data.status == "Canceled" || data.status == "Ended") ? 1 : 0,
            modified_date:dateTime.create().format("Y-m-d H:M:S")
        }
        if(orgData.runtime == "NaN" || isNaN(orgData.runtime)){
            orgData.runtime = 0
        }
        //insert update item
        let movie = null
        await globalModel.custom(req,"SELECT * from movies WHERE (imdb_id =? && imdb_id IS NOT NULL) || (tmdb_id = ? && tmdb_id != 0) ",[orgData.imdb_id,orgData.tmdb_id]).then(result => {
            if(result && result.length > 0){
                const res = JSON.parse(JSON.stringify(result))[0];
                movie = res
            }
        })
        let newMovie = 0
        if(!movie){
            newMovie = 1;
            //create new
            orgData.adult  = data.adult ? data.adult : 0
            orgData.search = 1
            orgData.approve = 1
            orgData.owner_id = OWNER_ID
            orgData.completed = 1
            orgData.autoapprove_comments = 1
            orgData.view_privacy = "everyone"
            orgData.creation_date = dateTime.create().format("Y-m-d H:M:S")
            orgData.custom_url = uniqid.process('mov1'),
            orgData.category = type == "movie" ? "movie" : "series",
            await globalModel.create(req, orgData, "movies").then(async result => {
                if (result) {
                    movie = orgData
                    movie.movie_id = result.insertId
                    await exports.getCountries(req,data,movie,type,mdb);
                    await exports.getImages(req,data,movie,"movies",mdb);
                    await exports.getGenres(req,data,movie,type,mdb);
                }
            })
        }else{
            if(exports.compareDates(movie.modified_date)){
                //update records
                await globalModel.update(req, orgData, "movies", 'movie_id', movie.movie_id).then(() => {
                    
                })
            }else{
                return null
            }
        }
        if(!movie){
            return null
        }
        await exports.getCast(req,data,movie,"movie",mdb);        
        await exports.getVideos(req,data,movie,type,mdb)
        if (data.seasons && (newMovie == 0 || movie.series_ended == 0)) {
            orgData['seasons'] = await exports.getSeasons(req,data,movie,type,mdb);
        }

        return orgData;
}
exports.compareDates = async (date1) => {
    let date1Obj = new Date(date1)
    let date2Obj = new Date(dateTime.create().format("Y-m-d H:M:S"))
    date1Obj.setDate(date1Obj.getDate() + 7);
    if(date2Obj.getTime() > date1Obj.getTime()){
        return true
    }
    return false
}
exports.getRuntime = (req,data,type,mdb) => {
    let runtime =  data.runtime ? data.runtime : (data.episode_run_time ? data.episode_run_time : 0);
    return (runtime && runtime instanceof Array) ? Math.min(...runtime) : parseInt(runtime);
}
exports.getImages = async (req,data,movie,type,mdb) => {
    let dataIma = data.images && data.images.backdrops ? data.images.backdrops : null
    if(!dataIma)
        return ""

    for(const image of dataIma){
        await globalModel.create(req, {resource_type:"movies",resource_id:movie.movie_id,image:BACKDROP_BASE_URI+image.file_path}, "photos").then(async result => {

        });
    };
}
exports.getKeywords = async (req,data,type,mdb) => {
    let keywordsArray = []
    if(data.keywords && data.keywords.results){
        keywordsArray = data.keywords.results
    }
    if(data.keywords && data.keywords.keywords){
        keywordsArray = keywordsArray.concat(data.keywords.keywords)
    }
    let keywords = keywordsArray.map(item => {
        return item.name
    })
    return keywords  ? keywords.join(",") : null
}
exports.getGenres = async (req,data,movie,type,mdb) => {
    let generes = data.genres ? data.genres : null
    if(!generes)
        return null;

    for(const data of generes){
        let slug = data.name.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
        await globalModel.custom(req,"SELECT genre_id from genres WHERE slug = ?",[slug]).then(async result => {
            if(result && result.length > 1){
                const res = JSON.parse(JSON.stringify(result))[0]
                await globalModel.create(req, {genre_id:res.genre_id,movie_id:movie.movie_id}, "movie_genres").then(async result => {

                });
            }else{
                await globalModel.create(req, {title:data.name,slug:slug}, "genres").then(async result => {
                    await globalModel.create(req, {genre_id:result.insertId,movie_id:movie.movie_id}, "movie_genres").then(async result => {

                    });
                });
            }
        })  
    }

   return generes
}
exports.getBackdrop = async (req,data,type,mdb) => {
    if(!data.backdrop_path)
        return null
    return data.backdrop_path ? BACKDROP_BASE_URI + data.backdrop_path : null;
}
exports.getVideos = async (req,dataOrg,movie,type,mdb) => {
    if(dataOrg.videos && dataOrg.videos.results){
        for(const data of dataOrg.videos.results){
            let sql = "SELECT movie_video_id from movie_videos WHERE `code` = ? AND movie_id = ?"
            let condition = [`https://youtube.com/embed/${data.key}`,movie.movie_id]

            if(movie.season_id){
                sql += " AND season_id = ?"
                sql += " AND episode_id = ?"
                condition.push(movie.season_id)
                condition.push(movie.episode_id)
            }
            await globalModel.custom(req,sql,condition).then(async result => {
                let insertData = {movie_id:movie.movie_id,category:data.type.toLowerCase(),title:data.name,type:"embed",language:data.iso_639_1,code:YOUTUBE_BASE_URI+data.key,completed:1,status:1,modified_date:dateTime.create().format("Y-m-d H:M:S"),image:`https://i.ytimg.com/vi/${data.key}/hqdefault.jpg`}

                if(result && result.length > 1){
                    const res = JSON.parse(JSON.stringify(result))[0]
                    
                    insertData.creation_date = dateTime.create().format("Y-m-d H:M:S")
                    insertData.owner_id = OWNER_ID
                    await globalModel.update(req, insertData, "movie_videos","movie_video_id",res.movie_video_id).then(async result => {
                        
                    });
                }else{
                    if(movie.season_id){
                        insertData.season_id = movie.season_id
                        insertData.episode_id = movie.episode_id
                    }
                    await globalModel.create(req, insertData, "movie_videos").then(async result => {
                       
                    });
                }
            })
        }
    }
    return null
}
exports.getCountries = async (req,data,movie,type,mdb) => {
    if(data.production_countries){
        for(const dataC of data.production_countries){
            await globalModel.custom(req,"SELECT id from countries WHERE iso = ?",[dataC.iso_3166_1.toLowerCase()]).then(async result => {
                if(result && result.length > 1){
                    const res = JSON.parse(JSON.stringify(result))[0];
                    await globalModel.create(req, {movie_id:movie.movie_id,country_id:res.id}, "movie_countries").then(async result => {

                    });
                }
            })  
        }
    }
    return null
}
exports.getCast = async (req,data,movie,type,mdb) => {
    // cast/crew from series, movies and episodes
    let castsArray = []
    if(data.credits){
        if(data.credits.cast){
            castsArray = castsArray.concat(data.credits.cast)
        }
        if(data.credits.crew){
            castsArray = castsArray.concat(data.credits.crew)
        }
    }

    if(data.crew){
        castsArray = castsArray.concat(data.crew)
    }
    if(data.guest_stars){
        castsArray = castsArray.concat(data.guest_stars)
    }

    if (data.created_by) {
        let creatorArray = data.created_by.map(item => {
            let creator = item
            creator["job"] = "creator"
            creator["department"] = "creator"
            return creator
        });
        castsArray = castsArray.concat(creatorArray);
    }
    let casts = castsArray.map(async item => {
        return await exports.getPerson(req,item,data,movie,type,mdb);
    })
   
    return casts
}
exports.getPerson = async (req,item,data,movie,type,mdb) => {
    
    let args = null
    let appends = [ 'images']
    args = {
        pathParameters: {
            person_id:item.id
        },
        query: {
            append_to_response: appends.join(",")
            
        },
    };
    
    let response = null
    
    try {
       response = await mdb.person.getDetails(args)
    }catch(error){
        console.log(error)
        return null
    }
    if(!response.data)
        return response;
    
    let person = response.data

    let orgData = {
        
        'name' :  person['name'],
        'tmdb_id' :  person['id'],
        'imdb_id' :  person.imdb_id ? person.imdb_id : 0,
        'gender' :  await exports.getGender(person.gender),
        'image' :  await exports.getPoster(person.profile_path),
        'type' :  "movie",
        "biography":person.biography,
        "birthplace":person.place_of_birth,
        "deathdate":person.deathday,
        "birthdate":person.birthday,
    }

    //insert update item
    let crew_member = null
    await globalModel.custom(req,"SELECT * from cast_crew_members WHERE (imdb_id =? && imdb_id IS NOT NULL) || (tmdb_id = ? && tmdb_id != 0) ",[person.imdb_id,person.id]).then(result => {
        if(result && result.length > 0){
            const res = JSON.parse(JSON.stringify(result))[0];
            crew_member = res
        }
    })

    if(!crew_member){
        //create new
        await globalModel.create(req, orgData, "cast_crew_members").then(async result => {
            if (result) {
                crew_member = orgData
                crew_member.cast_crew_member_id = result.insertId
                crew_member.custom_url =  uniqid.process('cc')
                let insertData = {
                    'character' :  item.character ? item.character : null,
                    'department' :  item.department ? item.department : "department",
                    'job' :  item.job ? item.job : "job",
                    'cast_crew_member_id': result.insertId,
                    resource_id:movie.season_id ? movie.season_id : movie.movie_id,
                    resource_type:type
                }
                //insert
                await globalModel.create(req, insertData, "cast_crew").then(async result => {

                });
                //insert images
                if(person.images && person.images.profiles){
                    for(const data of person.images.profiles){
                        await globalModel.create(req, {resource_type:"cast_crew",resource_id:result.insertId,image:BACKDROP_BASE_URI+data.file_path}, "photos").then(async result => {

                        });
                    };
                }

            }
        })
    }else{
        //update records
        await globalModel.update(req, orgData, "cast_crew_members", 'cast_crew_member_id', crew_member.cast_crew_member_id).then(() => {
            
        })
        //check people exists
        let crew = null
        await globalModel.custom(req,"SELECT * from cast_crew WHERE cast_crew_member_id = ? AND resource_type = ? AND resource_id = ?",[crew_member.cast_crew_member_id,type,movie.season_id ? movie.season_id : movie.movie_id]).then(result => {
            if(result && result.length > 0){
                const res = JSON.parse(JSON.stringify(result))[0];
                crew = res
            }
        })
        if(!crew){
            let insertData = {
                'character' :  item.character ? item.character : null,
                'department' :  item.department ? item.department : "department",
                'job' :  item.job ? item.job : "job",
                'cast_crew_member_id': crew_member.cast_crew_member_id,
                resource_id:movie.season_id ? movie.season_id : movie.movie_id,
                resource_type:type
            }
            await globalModel.create(req, insertData, "cast_crew").then(async result => {

            });
        }

    }

    return person;
}
exports.getPoster =  async (path)  =>
{
    return path ? PROFILE_BASE_URI + path : "";
}
exports.getGender = async (gender) => {
    if (gender == 1) {
        return 'female';
    } else if (gender == 2) {
        return 'male';
    } else {
        return "";
    }
}
exports.getSeasons = async (req,data,movie,type,mdb) => {
    if(!data.seasons)
        return null

    for(const season of data.seasons){
        if(season.season_number != 0){
            let args = null
            let appends = [ 'credits','episode_groups','videos']
            args = {
                pathParameters: {
                    tv_id:movie.tmdb_id,
                    season_number:season.season_number
                },
                query: {
                    append_to_response: appends.join(",")
                    
                },
            };
            
            let response = null
            
            try {
                response = await mdb.tv.season.getDetails(args)
            }catch(error){
                console.log(error)
                return null
            }
            if(response.data){
                let seasonData = response.data
                let tmdb_id = seasonData.id
                let insertData = {}
                insertData.movie_id = movie.movie_id
                insertData.image =  season["poster_path"] ? PROFILE_BASE_URI+ season["poster_path"] : "",
                insertData.season = season.season_number
                insertData.tmdb_id = tmdb_id

                let seasonExists = null
                await globalModel.custom(req,"SELECT * from seasons WHERE (tmdb_id = ? && tmdb_id != 0) ",[tmdb_id]).then(result => {
                    if(result && result.length > 0){
                        const res = JSON.parse(JSON.stringify(result))[0];
                        seasonExists = res
                    }
                })

                if(!seasonExists){
                    await globalModel.create(req,insertData,"seasons").then(result => {
                        insertData.season_id = result.insertId
                        seasonExists = insertData
                    })
                }else{
                    await globalModel.update(req, insertData, "seasons", 'season_id', seasonExists.season_id).then(() => {
                        
                    })
                }
                await exports.getCast(req,seasonData,seasonExists,"season",mdb);
                
                if(seasonData.episodes){
                    for(const episode of seasonData.episodes){

                        let episodeData = {}
                        episodeData.tmdb_id = episode.id
                        episodeData.season_id = seasonExists.season_id
                        episodeData.movie_id = movie.movie_id
                        
                        episodeData.title = episode.name
                        episodeData.episode_number = episode.episode_number
                        episodeData.image = episode["still_path"] ? PROFILE_BASE_URI+ episode["still_path"] : "",
                        episodeData.release_date = episode.air_date
                        episodeData.description = episode.overview
                        episodeData.search = 1
                        episodeData.modified_date = dateTime.create().format("Y-m-d H:M:S")


                        let episodeExists = null
                        await globalModel.custom(req,"SELECT * from episodes WHERE (tmdb_id = ? && tmdb_id != 0) ",[episode.id]).then(result => {
                            if(result && result.length > 0){
                                const res = JSON.parse(JSON.stringify(result))[0];
                                episodeExists = res
                            }
                        })

                        if(!episodeExists){
                            episodeData.owner_id = OWNER_ID
                            episodeData.creation_date = dateTime.create().format("Y-m-d H:M:S")
                            await globalModel.create(req,episodeData,"episodes").then(result => {
                                episodeExists = episodeData
                                episodeExists.episode_id = result.insertId
                            })
                        }else{
                            await globalModel.update(req, episodeData, "episodes", 'episode_id', episodeExists.episode_id).then(() => {
                                
                            })
                        }
                        if(episode.videos){
                            movie.season_id = seasonExists.season_id
                            movie.episode_id = episodeExists.episode_id
                            await exports.getVideos(req,episode,movie,"episode",mdb);
                        }else if(process.env.ALLOWALLUSERINADMIN){
                            movie.season_id = seasonExists.season_id
                            movie.episode_id = episodeExists.episode_id
                            await exports.getVideos(req,seasonData.videos ? seasonData : season,movie,"episode",mdb);
                        }
                    }
                }
            }
        }
    }
}