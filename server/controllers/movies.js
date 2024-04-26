const commonFunction = require("../functions/commonFunctions")
const settingModel = require("../models/settings")
const castnCrewModel = require("../models/castncrew")
const categoryModel = require("../models/categories")
const movieModel = require("../models/movies")
const privacyModel = require("../models/privacy")
const privacyLevelModel = require("../models/levelPermissions")
const userModel = require("../models/users")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")
const globalModel = require("../models/globalModel")
const oneTimePaypal = require("../functions/one-time-paypal")
const countryModel = require("../models/country")
const languageModel = require("../models/languages")
const likeModel = require("../models/likes")
const favouriteModel = require("../models/favourites")
const notifications = require("../models/notifications")

exports.castView = async(req,res) => {
    let custom_url = req.params.id
    let cast = {}
 
    await movieModel.findArtistById(custom_url,req).then(result => {
        if(result)
            cast = result
        else{
            return res.send({...req.query,pagenotfound:1});
        }
    }).catch(() => {
        return res.send({...req.query,pagenotfound:1});
    })
    await commonFunction.getGeneralInfo(req,'cast_crew_view')
    await commonFunction.updateMetaData(req,{title:cast.name,description:cast.biography,image:cast.image})
    
    
     let LimitNum = 21;
     
     let data = {}
     data.limit = LimitNum
     data.cast_crew_member_id = cast.cast_crew_member_id 
    req.contentType = "movies"
    await movieModel.getMovies(req,data).then(result => {
        let pagging = false
        if(result){
            pagging = false
            if(result.length > LimitNum - 1){
                result = result.splice(0, LimitNum - 1);
                pagging = true
            }
            req.query.cast_movies = {
                'pagging':pagging,
                results:result
            }
        }
    })
    req.contentType = "series"
    //get series
    await movieModel.getMovies(req,data).then(result => {
        let pagging = false
        if(result){
            pagging = false
            if(result.length > LimitNum - 1){
                result = result.splice(0, LimitNum - 1);
                pagging = true
            }
            req.query.cast_series = {
                'pagging':pagging,
                results:result
            }
        }
    })
    req.contentType = null
    
     await movieModel.getCastPhotos(req,{resource_id:cast.cast_crew_member_id}).then(result => {
        let pagging = false
        if(result){
            pagging = false
            
            req.query.photos = {
                'pagging':pagging,
                results:result
            }
        }
    })

    if(req.user){
        await likeModel.isLiked(cast.cast_crew_member_id,'cast_crew_members',req,res).then(result => {
            if(result){
                cast.like_dislike = result.like_dislike
            }
        })
        
        //favourite
        await favouriteModel.isFavourite(cast.cast_crew_member_id,'cast_crew_members',req,res).then(result => {
            if(result){
                cast['favourite_id'] = result.favourite_id
            }
        })
    }
   
    req.query.cast = cast
    req.query.id = cast.cast_crew_member_id
    recentlyViewed.insert(req,{id:cast.cast_crew_member_id,owner_id:0,type:'cast_crew_members',creation_date:dateTime.create().format("Y-m-d H:M:S")})

    return res.send({...req.query,page_type:"cast-and-crew"});
    
    
}

exports.castBrowse = async(req,res) => {
    const queryString = req.query
    await commonFunction.getGeneralInfo(req,'cast_crew_browse')
    
    const limit = 17
    const data = {}
    req.query.search = {}
    if(queryString.q && !queryString.tag){
        req.query.search.q = queryString.q
        data['name'] = queryString.q
    }
    
    if(queryString.sort == "favourite" && req.appSettings['cast_crew_member_favourite'] == 1){
        req.query.search.sort = queryString.sort
        data['orderby'] = "cast_crew_members.favourite_count desc"
    }else if(queryString.sort == "view"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "cast_crew_members.view_count desc"
    }else if(queryString.sort == "like" && req.appSettings['cast_crew_member_like'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "cast_crew_members.like_count desc"
    }else if(queryString.sort == "dislike" && req.appSettings['cast_crew_member_dislike'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "cast_crew_members.dislike_count desc"
    }else if(queryString.sort == "rated" && req.appSettings['cast_crew_member_rating'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "cast_crew_members.rating desc"
    }else if(queryString.sort == "commented" && req.appSettings['cast_crew_member_comment'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "cast_crew_members.comment_count desc"
    }
    data.limit = limit
    await castnCrewModel.getCrewMembers(req,data).then(result => {
        let items = []
        if(result){
            req.query.pagging = false
             items = result
            if(result.length > limit - 1){
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
        }
        req.query.casts = items
    })
    
    return res.send({...req.query,page_type:"cast-and-crew"});
    
}

exports.trailerView = async (req,res) => {
    await commonFunction.getGeneralInfo(req, res, 'movies_series_trailers')
    await exports.view(req,res,true);
}
exports.episodeView = async (req,res) => {    
    await commonFunction.getGeneralInfo(req, res, 'movies_series_trailers')
    let season_id = req.params.season_id
    let episode_id = req.params.episode_id
    const id = req.params.id
    let movieObject = {}
    if (id) {
        await movieModel.findByCustomUrl(id, req, res, true).then(async movie => {
            if(movie){
                movieObject = movie
            }
        }).catch(err => {
            
        })
    }
    if(Object.keys(movieObject) == 0){
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let seasonObject = {}
    if (season_id) {
        await movieModel.getSeasons(req,{movie_id:movieObject.movie_id,season:season_id}).then(async result => {
            if(result && result.length){
                seasonObject = result[0]
            }
        })
    }
    if(Object.keys(seasonObject) == 0){
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let episodeObject = {}
    if (episode_id) {
        await globalModel.custom(req,"SELECT * from episodes WHERE movie_id = ? AND episode_number = ? AND season_id = ?",[movieObject.movie_id,episode_id,seasonObject.season_id]).then(result => {
            if(result && result.length > 0){
                const res = JSON.parse(JSON.stringify(result))[0];
                episodeObject = res
            }
        }).catch(err => {
            
        })
    }
    if(Object.keys(episodeObject) == 0){
        return res.send({ ...req.query , pagenotfound: 1 });
    }

    let data = {}
    data.season_id = seasonObject.season_id
    data.episode_id = episodeObject.episode_id
    data.episode = episodeObject
    data.season = seasonObject
    await exports.view(req,res,data);
}
exports.browseSeason = async (req,res) => {
    const id = req.params.season_id
    const movie_id = req.params.id
    
    let movieObject = {}
    req.query.id = movie_id
    req.query.season_id = id
    await commonFunction.getGeneralInfo(req, res, "season_browse")
    if (movie_id) {
        await movieModel.findByCustomUrl(movie_id, req, res, true).then(async movie => {
            if(movie){
                movieObject = movie
                
            }
        }).catch(err => {
            
        })
    }

    if(Object.keys(movieObject) == 0){
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    
    
    let season_id = 0
    let seasonObject = {}
    if (id) {
        await globalModel.custom(req,"SELECT * from seasons WHERE movie_id = ? AND season = ?",[movieObject.movie_id,id]).then(result => {
            if(result && result.length > 0){
                const res = JSON.parse(JSON.stringify(result))[0];
                season_id = res.season
                seasonObject = res
            }
        }).catch(err => {
            
        })
    }

    if(Object.keys(seasonObject) == 0){
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    await commonFunction.updateMetaData(req,{title:movieObject.title+" - "+req.i18n.t("Season")+" "+id,description:movieObject.description,image:seasonObject.image,keywords:movieObject.tags})

    
    req.query.movie = movieObject
    req.query.season = seasonObject
    req.query.season_id = id
    let limit = 26
    await  movieModel.getEpisods(req,{season_id:seasonObject.season_id,limit:limit,movieCount:1}).then(async result => {
        if(result){
            let pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                pagging = true
            }
            req.query.episodes = items
            req.query.pagging = pagging
        }
    })
    return res.send({...req.query,page_type:"season"});
  
}
exports.create = async (req, res) => {
    let isValid = true
    let moviePageType = req.query.selectType == "movie" ? "movie_create" : "series_create"
    const id = req.params.id
    if (id) {
        await movieModel.findByCustomUrl(id, req, res, true).then(async movie => {
            if(movie){
                moviePageType = req.query.selectType == "movie" ? "movie_edit" : "series_edit"
                req.query.editItem = movie
                req.query.id = id
            }else{
                isValid = false
            }
            // await privacyModel.permission(req, 'movie', 'edit', movie).then(result => {
            //     isValid = result
            // }).catch(err => {
            //     isValid = false
            // })
        }).catch(err => {
            isValid = false
        })
    }
    await commonFunction.getGeneralInfo(req, res, moviePageType)
    if (!isValid || (req.query.editItem && req.query.editItem.category != req.query.selectType)) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if(!req.user){
        return res.send({...req.query,page_type:"login"});
    }
    req.query.tabType = (req.query.type ? req.query.type : null)
    //get categories
    const categories = []
    await categoryModel.findAll(req, { type: "movie" }).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    if (categories.length > 0)
        req.query.movieCategories = categories
    
    //check package enable
    if(req.appSettings["movie_sell"] == 1){
        await privacyLevelModel.findBykey(req,"movie",'sell_movies',req.user.level_id).then(result => {
            if(result == 1)
                req.query.movie_sell = result
        })
    }
    if(req.appSettings["movie_rent"] == 1){
        await privacyLevelModel.findBykey(req,"movie",'sell_rent_movies',req.user.level_id).then(result => {
            if(result == 1)
                req.query.movie_rent = result
        })
    }
    
    req.query.spokenLanguage =  languageModel.spokenLanguages() 
    req.query.departments =  require("../models/departments").getAll();

    //get countries
    await countryModel.findAll(req).then(result => {
        if(result)
            req.query.countries = result
    })

    //get seasons
    req.query.seasons = []
    req.query.images  = []
    if(req.query.editItem){
        //get all countries
        await countryModel.findAllMoviesCountries(req,{movie_id:req.query.editItem.movie_id}).then(result => {
            if(result)
            req.query.movie_countries = result
        })
        //get all generes
        await movieModel.getGeneres(req,{resource_id:req.query.editItem.movie_id}).then(result => {
            req.query.generes = result
        })


         //get all crew members
        await castnCrewModel.getAllCrewMember(req,{resource_type:"movie",resource_id:req.query.editItem.movie_id}).then(resultCrew => {
            if(resultCrew){
                req.query.castncrew = resultCrew
            }
        })
        //get images
        req.query.images = []
        await movieModel.getPhotos(req,{resource_id:req.query.editItem.movie_id}).then(result => {
            req.query.images = result
        })
         //get videos
         req.query.videos = {}
         let limit = 51 
         await movieModel.getVideos(req,{resource_id:req.query.editItem.movie_id,limit:limit,create:1}).then(result => {
            req.query.videos.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.videos.pagging = true
            }
            req.query.videos.results = items
        })

        await movieModel.getSeasons(req,{movie_id:req.query.editItem.movie_id}).then(async result => {
            if(result && result.length){
                await exports.seasonData(req,result).then(async result => { 
                    
                })
                await exports.seasonCrew(req,result).then(async result => { 
                    
                })
            }
        })
    }

    

    //owner plans
    await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',req.user.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1){
        //get user plans
        await userModel.getPlans(req, { owner_id: req.user.user_id }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }

    
    if(req.query.selectType == "series")
    return res.send({...req.query,page_type:"create-series"});
    else
    return res.send({...req.query,page_type:"create-movie"});
}

exports.seasonCrew = (req,seasons) => {
    return new Promise(async function(resolve, reject) {
        await asyncForEach(seasons, async (season,i) => {
            //get all crew members
            await castnCrewModel.getAllCrewMember(req,{resource_type:"season",resource_id:season.season_id}).then(resultCrew => {
                if(resultCrew){
                    let resultData = season
                    resultData.castncrew = resultCrew
                    req.query.seasons[i] = resultData
                }
            })
            if(i == seasons.length - 1){
                resolve()
            }
        })
    })
    

}

exports.seasonData = (req,seasons,limit,season_id) => {
   return new Promise(async function(resolve, reject) {
        await asyncForEach(seasons, async (season,i) => {
            await  movieModel.getEpisods(req,{season_id:season.season_id,limit:limit ? limit : false,movieCount:limit ? 1 : false}).then(async result => {
                if(result){
                    let resultData = season
                    if(limit){
                        let episode_pagging = false
                        let items = result
                        if (result.length > limit - 1) {
                            items = result.splice(0, limit - 1);
                            episode_pagging = true
                        }
                        resultData.episodes = items
                        resultData.episode_pagging = episode_pagging
                        let isValid = true
                        if(season_id){
                            //get current season id
                            const seasons = [...req.query.seasons];
                            const itemIndex = seasons.findIndex(p => p["season_id"] == season_id);
                            if(itemIndex > -1){
                                isValid = false
                                req.query.seasonCurrentIndex = itemIndex
                                req.query.seasons[itemIndex] = resultData
                            }                        
                        }
                        if(isValid)
                            req.query.seasons[i] = resultData
                    }else{
                        resultData.episodes = result
                        req.query.seasons.push(resultData)
                    }
                }
            })
            if(i == seasons.length - 1){
                resolve()
            }
        })
    })
}
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

exports.purchase = async (req, res) => {
    let id = req.params.id
    let type = req.query.chooseType
    req.session.orderId = null
    req.session.id = null
    req.session.chooseTypeMoviePayment = type
    if (!id || isNaN(id) || !req.user || !type) {
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let movie = {}
    await movieModel.findById(id,req).then(result => {
        if(result){
            movie = result
        }
    })
    let price = type == "rent" ? parseFloat(movie.rent_price) : parseFloat(movie.price)
    let movieSeriesType = movie.category == "movie" ? type+"_movie_purchase" : type+"_series_purchase"
    if(!Object.keys(movie).length || parseFloat(price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let isValid = true
    //check movie aleady purchased
    await movieModel.checkMoviePurchased({id:movie.movie_id,owner_id:req.user.user_id,type:movie.category},req).then(result => {
        if(result){
            isValid = false
        }
    }).catch(err => {
    })
    if(!isValid){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    const data = {}
    data["amount"] = parseFloat(price).toFixed(2)
    data["returnUrl"] = `${process.env.PUBLIC_URL}/movies/successulPayment/`+movie.movie_id+"?chooseType="+type
    data["cancelUrl"] = `${process.env.PUBLIC_URL}/movies/cancelPayment/`+movie.movie_id+"?chooseType="+type
    data.title = movie.title
    req.session.id = movie.movie_id 
    //delete all user pending orders
    await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'initial' AND source_type = ?",[req.user.user_id,movieSeriesType]).then(result => {
        
    })
    //create order
    await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:1,state:"initial",creation_date:currentDate,source_type:movieSeriesType,source_id:movie.movie_id}, "orders").then(result => {
        if (result) {
            req.session.orderId = result.insertId
        } else {

        }
    })
    if (!req.session.orderId) {
        req.session.moviePaymentStatus = "fail"
        res.redirect("/watch/"+movie.custom_url)
        res.end()
        return
    }
    data.sku = "movie_purchase_"+req.session.orderId
    return oneTimePaypal.init(req, res, data).then(result => {
        if (result.url) {
            req.session.movie_user_id = req.user.user_id
            req.session.movietokenUserPayment = result.token
            res.redirect(302, result.url)
            res.end()
        } else {
            console.log( ' ======= Movie Purchase ONETIME ERR Paypal============')
            req.session.moviePaymentStatus = "fail"
            res.redirect("/watch/"+movie.custom_url)
            res.end()
        }
    }).catch(err => {
        console.log(err, ' ======= Movie Purchase ONETIME ERR ============')
        res.redirect("/watch/"+movie.custom_url)
        res.end()
    })
}

exports.successul = async (req, res, next) => {
    let id = req.params.id
    let type = req.query.chooseType
    let gateway = req.body.gateway
    let stripeToken = req.body.stripeToken
    if(id != req.session.id && (gateway != 2 && gateway != 5)){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let movie = {}
    await movieModel.findById(id,req).then(result => {
        if(result){
            movie = result
        }
    })
    let price = type == "rent" ? parseFloat(movie.rent_price) : parseFloat(movie.price)
    let movieSeriesType = movie.category == "movie" ? type+"_movie_purchase" : type+"_series_purchase"

    if(!req.user.user_id || !Object.keys(movie).length || parseFloat(price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let currentCurrency = req.currentCurrency
    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    if((gateway == "2" && stripeToken) || gateway == "5"){
        let isValid = true
        //check movie aleady purchased
        await movieModel.checkMoviePurchased({id:id,owner_id:req.user.user_id,type:movie.category},req).then(result => {
            if(result){
                isValid = false
            }
        }).catch(err => {
        })
        if(!isValid){
            res.send({ error: "Already purchased" });
            return;
        }
        req.session.id = id
        //delete all user pending orders
        await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'initial' AND source_type = ?",[req.user.user_id,movieSeriesType]).then(result => {
            
        })
        //create order
        await globalModel.create(req, {currency:currentCurrency.ID, owner_id:req.user.user_id,gateway_id:gateway,state:"initial",creation_date:currentDate,source_type:movieSeriesType,source_id:id}, "orders").then(result => {
            if (result) {
                req.session.movie_user_id = req.user.user_id
                req.session.orderId = result.insertId
            } else {
    
            }
        })
    }

   
    let changeRate = parseFloat(currentCurrency.currency_value)

    let commission_amount = 0
    let commissionType = parseFloat(req.appSettings[type == "price" ?  'movie_commission_type' : 'movie_commission_rent_type'])
    let commissionTypeValue = parseFloat(req.appSettings[type == "price" ? 'movie_commission_value' : "movie_commission_rent_value"])
    //calculate admin commission
    if(commissionType == 2 && commissionTypeValue > 0){
        commission_amount = parseFloat((price * (commissionTypeValue/100)).toFixed(2));
    }else if(commissionType == 1 && commissionTypeValue > 0){
        commission_amount = commissionTypeValue;
    }
    if(commission_amount > parseFloat(price).toFixed(2)){
        commission_amount = 0
    }

    let gatewayResponse = {}
    let isValidResult = false
    if(gateway == "2" && stripeToken){
        const stripe = require('stripe')(req.appSettings['payment_stripe_client_secret']);
        await new Promise(function(resolve, reject){
            stripe.customers.create({
                source: stripeToken,
                email: req.user.email,
            },function(err, customer) {
                if(err){
                    resolve()
                    res.send({ error: err.raw.message });
                }else{
                    stripe.charges.create({
                        amount: parseFloat(price).toFixed(2)*100,
                        currency: currentCurrency.ID,
                        description: movie.title,
                        customer: customer.id,
                        metadata: {
                            order_id: req.session.orderId,
                            movie_id:movie.movie_id
                        }
                    },function(err, charge) {
                        if(err) {
                            resolve()
                            res.send({ error: err.raw.message });
                        }
                        else {
                            resolve()
                            gatewayResponse.state = "completed";
                            gatewayResponse.transaction_id = charge.id;
                            isValidResult = true;
                        }
                    })
                }
            });
        })
    }else if(gateway == "5"){
        // check wallet user amount
        if(parseFloat(price) > parseFloat(req.user.wallet)){
            res.send({ error: req.i18n.t("You don't have enough balance to purchase, please recharge your wallet.") });
            return;
        }
        // update user wallet price
        const adsTransaction = require("../models/adsTransactions");
        adsTransaction.reduceOwnerWalletAmount(req,{owner_id:req.user.user_id,amount:parseFloat(price - commission_amount).toFixed(2)})

        // add amount to owner wallet
        // await globalModel
        // .custom(
        //     req,
        //     "UPDATE users SET `wallet` = wallet + ? WHERE user_id = ?",
        //     [parseFloat(price - commission_amount).toFixed(2), movie.owner_id]
        // )
        // .then((result) => {});

        isValidResult = true;
        gatewayResponse.transaction_id = require('uniqid').process('wallet_payment')
        gatewayResponse.state = "completed"
    }


    if(gateway == "1" || !gateway){
        if (!req.user || !req.session.movietokenUserPayment || !req.session.movie_user_id || !req.session.id || !req.session.orderId) {
            return res.redirect(302, "/watch/"+movie.custom_url)
        } else {
            const PayerID = req.query.PayerID
            await oneTimePaypal.execute(req, res, PayerID, { price: parseFloat(price).toFixed(2) }).then(async executeResult => {
                if (executeResult) {
                    gatewayResponse.transaction_id = executeResult.transaction_id
                    gatewayResponse.state = executeResult.state.toLowerCase()      
                    isValidResult = true          
                } else {
                    req.session.adsPaymentStatus = "fail"
                    res.redirect("/watch/"+movie.custom_url)
                    res.end()
                }
            }).catch(err => {
                req.session.adsPaymentStatus = "fail"
                res.redirect("/watch/"+movie.custom_url)
                res.end()
            })
        }
    }

    if(isValidResult) {
        await globalModel.create(req, {type:movieSeriesType,id:movie.movie_id, owner_id: req.session.movie_user_id, package_id: 0, status: gatewayResponse.state.toLowerCase(),creation_date: currentDate, modified_date: currentDate, gateway_profile_id: gatewayResponse.transaction_id,order_id:req.session.orderId }, "subscriptions").then(async result => {
            const moviePurchaseModel = require("../models/videoPurchase")
            await moviePurchaseModel.insertTransaction(req, {gateway_id: (gateway ? gateway : 1) , order_id:req.session.orderId,admin_commission:commission_amount, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: movie.owner_id ,sender_id:req.session.movie_user_id, state: gatewayResponse.state.toLowerCase(), price: parseFloat(price - commission_amount).toFixed(2) , currency:currentCurrency.ID,change_rate:changeRate, default_currency: req.appSettings.payment_default_currency, creation_date: currentDate, modified_date: currentDate,id:movie.movie_id,type:movieSeriesType },true).then(async result => {
                //update user balance
                await globalModel.custom(req,"UPDATE users SET `balance` = balance + ?  WHERE user_id = ?",[(parseFloat(price) - parseFloat(commission_amount)).toFixed(2),movie.owner_id]).then(result => {})

                let typePurchased = ""
                let typeOwnerPurchased = ""
                
                if(type == "rent"){
                    if(movie.category == "movie"){
                        typePurchased = "movie_rent_purchased";
                        typeOwnerPurchased = "movie_rent_purchased_owner"
                    }else{
                        typePurchased = "series_rent_purchased";
                        typeOwnerPurchased = "series_rent_purchased_owner"
                    }
                }else{
                    if(movie.category == "movie"){
                        typePurchased = "movie_purchased";
                        typeOwnerPurchased = "movie_purchased_owner"
                    }else{
                        typePurchased = "series_purchased";
                        typeOwnerPurchased = "series_purchased_owner"
                    }
                }
                
                //buyer
                notifications.insert(req, {owner_id:req.user.user_id,insert:true, type: typePurchased, subject_type: "users", subject_id: req.user.user_id, object_type: "movies", object_id: movie.movie_id,forceInsert:true }).then(result => {

                }).catch(err => {
                    console.log(err)
                })
                //owner
                notifications.insert(req, {notChangeOwnerID:true,owner_id:movie.owner_id,insert:true, type: typeOwnerPurchased, subject_type: "users", subject_id: req.user.user_id, object_type: "movies", object_id: movie.movie_id,forceInsert:true }).then(result => {

                }).catch(err => {
                    console.log(err)
                })

                //update order table
                req.session.movie_user_id = null
                req.session.id = null
                req.session.movietokenUserPayment = null
                globalModel.update(req,{gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state.toLowerCase(),'source_id':movie.movie_id},"orders","order_id",req.session.orderId)
                req.session.moviePaymentStatus = "success"
                if(!gateway){
                    res.redirect("/watch/"+movie.custom_url)
                }else{
                    res.send({status:true})
                }
                res.end()                     
            })
        })
    }
}

exports.cancel = async (req, res) => {
    let id = req.params.id
    if(id != req.session.id){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    let movie = {}
    await movieModel.findById(id,req).then(result => {
        if(result){
            movie = result
        }
    })
    let type = req.query.chooseType
    let price = type == "rent" ? parseFloat(movie.rent_price) : parseFloat(movie.price)
    if(!Object.keys(movie).length || !parseFloat(price) <= 0){
        await commonFunction.getGeneralInfo(req, res, "page_not_found")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if (!req.session.movietokenUserPayment) {
        res.redirect("/watch/"+movie.custom_url)
        if (req.session.paypalData) {
            req.session.paypalData = null
        }
        res.end()
    }
    req.session.movie_user_id = null
    req.session.id = null
    req.session.movietokenUserPayment = null
    if (req.session.paypalData) {
        req.session.paypalData = null
    }
    req.session.moviePaymentStatus = "cancel"
    return res.redirect(302, "/watch/"+movie.custom_url)
}


exports.categories = async (req, res) => { 
    await commonFunction.getGeneralInfo(req, res, 'browse_movie_series_category_view')
    let category = {}
    await categoryModel.findAll(req, { type: "movie",orderBy:" categories.item_count DESC ",getCount:1 }).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    req.query.type = "movies-series"
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})

    const limit = 12
    const data = { limit: limit, orderby: " view_count DESC" }

    await movieModel.getVideos(req, data).then(result => {
        if (result) {
            let items = result
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"categories"});
}
exports.category = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'movie_series_category_view')
    req.query.id = req.params.id
    let category = {}
    await categoryModel.findByCustomUrl({ id: req.query.id, type: "movie" }, req, res).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})
    if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
        await categoryModel.findAll(req, { type: "movie", subcategory_id: category.category_id, item_count: 1 }).then(result => {
            if (result) {
                req.query.subcategories = result
            }
        });
    } else if (category.subcategory_id > 0) {
        await categoryModel.findAll(req, { type: "movie", subsubcategory_id: category.category_id, item_count: 1 }).then(result => {
            if (result) {
                req.query.subsubcategories = result
            }
        });
    }
    const limit = 21
    const data = { limit: limit }
    if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
        data['category_id'] = category.category_id
    } else if (category.subcategory_id > 0) {
        data['subcategory_id'] = category.category_id
    } else if (category.subsubcategory_id > 0) {
        data['subsubcategory_id'] = category.category_id
    }


    //get all movies as per categories
    await movieModel.getMovies(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.items = items
        }
    })
     //get all series as per categories
     req.contentType = "series"
     await movieModel.getMovies(req, data).then(result => {
        if (result) {
            req.query.seriespagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.seriespagging = true
            }
            req.query.series = items
        }
    })
    req.query.type = "movies-series"
    return res.send({...req.query,page_type:"category"});
    
}
exports.browse = async (req, res) => {
    const queryString = req.query 

    const limit = 21
    const data = { limit: limit }
    req.query.search = {}
    
    
    await commonFunction.getGeneralInfo(req, res, req.contentType == "movies" ? 'movies_browse' : 'series_browse')
    
    //countries and languages
    req.query.spokenLanguage =  languageModel.spokenLanguages() 

    data["contentType"] = req.contentType
    if (queryString.q && !queryString.tag && !queryString.genre) {
        req.query.search.q = queryString.q
        data['title'] = queryString.q
    }
    if (queryString.country) {
        req.query.search.country = queryString.country
        data['country'] = queryString.country
    }
    if (queryString.language) {
        req.query.search.language = queryString.language
        data['language'] = queryString.language
    }
    if (queryString.tag) {
        req.query.search.tag = queryString.tag
        req.query.search.q = queryString.tag
        data['tags'] = queryString.tag
    }
    if (queryString.genre) {
        req.query.search.genre = queryString.genre
        req.query.search.q = queryString.genre
        data['genre'] = queryString.genre
    }
    if (queryString.category_id) {
        data['category_id'] = queryString.category_id
        req.query.search.category_id = queryString.category_id
    }
    if (queryString.subcategory_id) {
        data['subcategory_id'] = queryString.subcategory_id
        queryString.category_id = queryString.subcategory_id
        req.query.search.subcategory_id = queryString.subcategory_id
    }
    if (queryString.subsubcategory_id) {
        data['subsubcategory_id'] = queryString.subsubcategory_id
        queryString.category_id = queryString.subsubcategory_id
        req.query.search.subsubcategory_id = queryString.subsubcategory_id
    }

    if (queryString.sort == "latest") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.movie_id desc"
    } else if (queryString.sort == "favourite" && req.appSettings['movie_favourite'] == 1) {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.favourite_count desc"
    } else if (queryString.sort == "view") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.view_count desc"
    } else if (queryString.sort == "like" && req.appSettings['movie_like'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.like_count desc"
    } else if (queryString.sort == "dislike" && req.appSettings['movie_dislike'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.dislike_count desc"
    } else if (queryString.sort == "rated" && req.appSettings['movie_rating'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.rating desc"
    } else if (queryString.sort == "commented" && req.appSettings['movie_comment'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "movies.comment_count desc"
    }

    if (queryString.type == "featured" && req.appSettings['movie_featured'] == 1) {
        req.query.search.type = queryString.type
        data['is_featured'] = 1
    } else if (queryString.type == "sponsored" && req.appSettings['movie_sponsored'] == 1) {
        req.query.search.type = queryString.type
        data['is_sponsored'] = 1
    } else if (queryString.type == "hot" && req.appSettings['movie_hot'] == 1) {
        req.query.search.type = queryString.type
        data['is_hot'] = 1
    }

    //get all movies as per categories
    await movieModel.getMovies(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.movies = items
        }
    })
    //get categories
    const categories = []
    await categoryModel.findAll(req, { type: "movie" }).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    if (categories.length > 0)
        req.query.categories = categories
    //get countries
    await countryModel.findAll(req).then(result => {
        if(result)
            req.query.countries = result
    })

    //get slider content
    await movieModel.getMovies(req,{show_slider:1,limit:10,contentType:req.contentType}).then(result => {
        if(result && result.length){
            req.query.slideshow = result;
        }
    })
   
    if(req.contentType == "movies")
    return res.send({...req.query,page_type:"movies"});
    else
    return res.send({...req.query,page_type:"series"});
}
exports.play = async (req,res) => {
    req.play = 1
    exports.view(req,res,false)
}
exports.view = async (req, res, fromOtherSource) => {
    if(!fromOtherSource)
        await commonFunction.getGeneralInfo(req, res, 'movies_series_view')
        
    req.query.id = req.params.id
    req.query.contentType = "movies"
    let trailer_id = req.params.trailer_id
    let season_id = req.params.season_id
    let episode_id = req.params.episode_id
    req.query.season_id = season_id
    req.query.episode_id = episode_id
    req.query.trailer_id = trailer_id

    let movie = {}
    let showMovie = true
    req.isview = true;
    await movieModel.getMovies(req, { custom_url: req.query.id ? req.query.id : "notfound", movieview: true }).then(result => {
        if (result && result.length > 0) {
            movie = result[0]
        } else {
            showMovie = false
        }
    }).catch(error => {
        showMovie = false
    })
    req.isview = false;
    if (Object.keys(movie).length) {
        await privacyModel.check(req, movie, 'movie').then(result => {
            showMovie = result
        }).catch(error => {
            showMovie = false
        })
    }
    if (!showMovie) {
        return res.send({...req.query,permission_error:1});
    }
    if (!Object.keys(movie).length || (movie.approve != 1 && (!req.user || (movie.owner_id != req.user.user_id && req.levelPermissions['movie.view'] != 2)))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if(movie.category != "movie"){
        req.query.contentType = "series"
    }
    if(!fromOtherSource)
        await commonFunction.updateMetaData(req,{title:movie.title,description:movie.description,image:movie.image,keywords:movie.tags})
    
    if(trailer_id){
        await movieModel.getVideos(req,{resource_id:movie.movie_id,limit:2,extraVideos:true,movie_video_id:trailer_id,season_id:fromOtherSource ? fromOtherSource.season_id : false,episode_id:fromOtherSource ? fromOtherSource.episode_id : false}).then(async result => {
            if(result && result.length > 0){
                req.query.trailer = result[0];
                req.query.tabType = "trailers"
                await commonFunction.updateMetaData(req,{title: req.query.trailer.category.charAt(0).toUpperCase() + req.query.trailer.category.slice(1)+": "+ req.query.trailer.title,description:movie.description,image:req.query.trailer.image,keywords:movie.tags})
                //get next trailer
                if(result.length > 1){
                    req.query.nextTrailer = result[1];
                }
            }
        })
        if(!req.query.trailer){
            return res.send({ ...req.query , pagenotfound: 1 });
        }
    }
    if(season_id && episode_id){
        await movieModel.getVideos(req,{getFull:1,resource_id:movie.movie_id,limit:1,episode_id:fromOtherSource.episode_id,season_id:fromOtherSource.season_id}).then(async result => {
            if(!result || result.length == 0){
                await movieModel.getVideos(req,{resource_id:movie.movie_id,limit:1,episode_id:fromOtherSource.episode_id,season_id:fromOtherSource.season_id}).then(async resultNew => {
                    if(resultNew && resultNew.length > 0){
                        result = resultNew
                    }
                })
            }
            if(!result || result.length == 0){
                result[0] = fromOtherSource.episode
            }
            if(result && result.length > 0){
                req.query.episode = result[0];
                if(!req.query.trailer)
                    req.query.tabType = "episodes"
                
                
                await commonFunction.updateMetaData(req,{title:fromOtherSource.episode.title,description:fromOtherSource.episode.description,image:fromOtherSource.episode.image,keywords:movie.tags})
                if(!req.query.trailer){
                    //get next episode
                    await movieModel.getVideos(req,{resource_id:movie.movie_id,limit:1,episode_number:req.query.episode.episode_number}).then(async result => {
                        if(result && result.length > 0){
                            req.query.nextEpisode = result[0];
                        }
                    });
                }
            }
        })
        if(!req.query.episode){
            return res.send({ ...req.query , pagenotfound: 1 });
        }
    }
    //movie user details
    await userModel.findById(movie.owner_id, req, res).then(result => {
        movie.owner = result
    }).catch(error => {

    })
    if(!movie.owner){
        return res.send({...req.query,pagenotfound:1});
    }
    if(req.appSettings["movie_sell"] == 1){
        await privacyLevelModel.findBykey(req,"movie",'sell_movies',movie.owner.level_id).then(result => {
            if(result == 1)
            movie.sell_movies = true
        })
    }
    if(req.appSettings["movie_rent"] == 1){
        await privacyLevelModel.findBykey(req,"movie",'sell_rent_movies',movie.owner.level_id).then(result => {
            if(result == 1)
            movie.sell_rent_movies = true
        })
    }
    await privacyLevelModel.findBykey(req,"movie",'donation',movie.owner.level_id).then(result => {
        if(result == 1)
            movie.donation = result
    })
    
    await privacyModel.permission(req, 'movie', 'delete', movie).then(result => {
        movie.canDelete = result
    }).catch(err => {

    })
    await privacyModel.permission(req, 'movie', 'edit', movie).then(result => {
        movie.canEdit = result
    }).catch(err => {

    })
    
   
    if(req.session.moviePaymentStatus){
        movie.moviePaymentStatus = true
        req.session.moviePaymentStatus = null
    }
   
    

    //get all countries
    await countryModel.findAllMoviesCountries(req,{movie_id:movie.movie_id}).then(result => {
        if(result)
            movie.movie_countries = result
    })
    //get all generes
    await movieModel.getGeneres(req,{resource_id:movie.movie_id}).then(result => {
        movie.generes = result
    })


     //get all crew members
     if(req.query.episode){
        await castnCrewModel.getAllCrewMember(req,{resource_type:"season",resource_id:fromOtherSource.season.season_id}).then(resultCrew => {
            if(resultCrew){
                movie.castncrew = resultCrew
            }
        })
    }else{
        await castnCrewModel.getAllCrewMember(req,{resource_type:"movie",resource_id:movie.movie_id}).then(resultCrew => {
            if(resultCrew){
                movie.castncrew = resultCrew
            }
        })
    }
    if(!req.query.episode){
        //get images
        await movieModel.getPhotos(req,{resource_id:movie.movie_id}).then(result => {
            movie.images = result
        })
    }
    
    //get seasons
    await movieModel.getSeasons(req,{movie_id:movie.movie_id,order:" ORDER BY seasons.season_id DESC",episode_count:1}).then(async result => {
        if(result && result.length){
            req.query.seasons = result
            await exports.seasonData(req,[fromOtherSource && fromOtherSource.season ? fromOtherSource.season : result[0]],26,fromOtherSource && fromOtherSource.season ? fromOtherSource.season.season_id : 0).then(async result => { 
                
            })
        }
    })

    //movie reviews
    let limitReview = 11
    await movieModel.getReviews(req,{movie_id:movie.movie_id,limit:limitReview,orderBy:true}).then(result => {
        if(result){
            req.query.reviews = {}
            let pagging = false
            let items = result
            if (result.length > limitReview - 1) {
                items = result.splice(0, limitReview - 1);
                pagging = true
            }
            req.query.reviews.pagging = pagging
            req.query.reviews.results = items
        }
   })

    //clips not attached with episode  and seasons
    let limit = 25
    await movieModel.getVideos(req,{resource_id:movie.movie_id,limit:limit,extraVideos:true,episode:req.query.episode ? req.query.episode.episode_id : false}).then(result => {
        if(result){
            req.query.clipsTrailers = {}
            let pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                pagging = true
            }
            req.query.clipsTrailers.pagging = pagging
            req.query.clipsTrailers.results = items
        }
   })
   
   if( !movie.canEdit && ((parseFloat(movie.price) > 0 && movie.sell_movies) || (parseFloat(movie.rent_price) > 0 && movie.sell_rent_movies))){
        //check movie purchased 
        if(req.user){
            await movieModel.checkMoviePurchased({id:movie.movie_id,owner_id:req.user.user_id,type:movie.category},req).then(result => {
                if(result){
                    movie.moviePurchased = true
            }
            }).catch(err => {
                
            })
        }
   } 
   //owner plans
   await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',movie.owner.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1 && !movie.moviePurchased){
        let isPermissionAllowed = false
        if(req.user && (req.user.user_id == movie.owner_id || (req.levelPermissions["movie.view"] && req.levelPermissions["movie.view"].toString() == "2"))){
            isPermissionAllowed = true;
        }
        if(movie.view_privacy.indexOf("package_") > -1 && !isPermissionAllowed){
            let owner_id = req.user ? req.user.user_id : 0
            let checkPlanSql = ""
            let conditionPlanSql = [owner_id,movie.movie_id]
            checkPlanSql += 'SELECT `member_plans`.price as `package_price`,`subscriptions`.package_id as loggedin_package_id,mp.price as loggedin_price,'
            checkPlanSql+=  ' CASE WHEN member_plans.price IS NULL THEN 1 WHEN mp.price IS NULL THEN 0 WHEN  `member_plans`.price <= mp.price THEN 1'
            checkPlanSql+=  ' WHEN  `member_plans`.price > mp.price THEN 2'
            checkPlanSql += ' ELSE 0 END as is_active_package'
            checkPlanSql += ' FROM `movies` LEFT JOIN `member_plans` ON `member_plans`.member_plan_id = REPLACE(`movies`.view_privacy,"package_","") LEFT JOIN'
            checkPlanSql += ' `subscriptions` ON subscriptions.id = movies.owner_id AND subscriptions.owner_id = ? AND subscriptions.type = "user_subscribe" AND subscriptions.status IN ("active","completed") LEFT JOIN `member_plans` as mp ON mp.member_plan_id = `subscriptions`.package_id WHERE '
            checkPlanSql += ' movies.movie_id = ? LIMIT 1'
            await globalModel.custom(req,checkPlanSql,conditionPlanSql).then(result => {
                if(result && result.length > 0){
                    const res = JSON.parse(JSON.stringify(result))[0];
                    if(res.is_active_package == 0){
                        res.type = "new"
                        req.query.needSubscription = res; 
                    }else if(res.is_active_package == 2){
                        res.type = "upgrade"
                        req.query.needSubscription = res;
                    }
                }
            })
        }
    }

    if(req.query.needSubscription){
        if(!req.query.tabType){
            req.query.tabType = "plans"
        }
        //get user plans
        await userModel.getPlans(req, { owner_id: movie.owner.user_id, item:req.query.needSubscription }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }else{
        if(req.query.tabType == "plans"){
            req.query.tabType = ""
        }else if(!req.query.tabType && !req.query.episodes){
            req.query.tabType = ""
        }else if(req.query.episodes){
            req.query.tabType = "episodes"
        }
    }
    if(!req.query.seasons || req.query.seasons.length == 0){
        //get full video
        await movieModel.getVideos(req,{resource_id:movie.movie_id,limit:1,getFull:true}).then(result => {
            if(result && result.length){
                req.query.episodes = result
                if(req.query.tabType == "episodes"){
                    if(req.query.clipsTrailers){
                        req.query.tabType = "trailers"
                    }else{
                        req.query.tabType = "info"
                    }
                }
            }
        })
    }
    if(req.play && !req.query.seasons && req.query.episodes && req.query.episodes.length > 0){
        req.query.episode = req.query.episodes[0]
        req.query.play = 1
    }
    if(movie.canEdit){
        movie.moviePurchased = true
    }
    //fetch user ads
    if(movie.approve == 1 && (req.query.trailer || req.query.episode) && !movie.moviePurchased){
        if( ( (req.query.trailer && req.query.trailer.type == "upload") || ( req.query.episode && req.query.episode.type == "upload")) && ( ( !movie.moviePurchased && req.query.trailer ? true : false ) ||  (parseFloat(movie.price) <= 0 && parseFloat(movie.rent_price) <= 0) ) && !movie.canEdit ) {
            let ads_cost_perclick = req.query.appSettings['ads_cost_perclick']
            let ads_cost_perview = req.query.appSettings['ads_cost_perview']
            let sql = "SELECT advertisements_user.* from advertisements_user LEFT JOIN users ON users.user_id = advertisements_user.owner_id  LEFT JOIN userdetails ON users.user_id = userdetails.user_id WHERE users.active = 1 AND users.approve = 1 AND advertisements_user.approve = 1 AND advertisements_user.completed = 1 "
            sql += " AND ( CASE WHEN advertisements_user.type = 1 AND users.wallet >= "+ ads_cost_perclick + " THEN true "
            sql += " WHEN advertisements_user.type = 2 AND users.wallet >= "+ ads_cost_perview + " THEN true "
            sql += " ELSE false  END ) AND ( category_id = 0 ) AND ( subcategory_id = 0 ) AND ( subsubcategory_id = 0 )"
            if(movie.adult == 1){
                sql += " AND ( advertisements_user.adult IS NULL OR  advertisements_user.adult = 1) "
            }else if(movie.adult == 0){
                sql += " AND ( advertisements_user.adult IS NULL OR  advertisements_user.adult = 0) "
            }
            sql += " ORDER BY RAND() DESC LIMIT 1 "
            await globalModel.custom(req,sql,[]).then(result => {
                if(result){
                    const adsResults = JSON.parse(JSON.stringify(result));
                    if(adsResults && adsResults.length){
                        req.query.userAdmovie = adsResults[0]
                        const adsTransaction = require("../models/adsTransactions");
                        const ads = adsResults[0]
                        if(ads.type == 2){
                            adsTransaction.adSpent(req,{owner_id:ads.owner_id,ad_id:ads.ad_id,amount:req.query.appSettings['ads_cost_perview'],type:"view",creation_date:dateTime.create().format("Y-m-d H:M:S")})
                            //reduce ad owner wallet amount
                            adsTransaction.reduceOwnerWalletAmount(req,{owner_id:ads.owner_id,amount:req.query.appSettings['ads_cost_perview']})
                        }
                    }
                }
            })
            if(!req.query.userAdVideo){
                //fetch admin ads
                let sql = "SELECT * from advertisements_admin WHERE advertisements_admin.active = 1 "
                sql += " AND ( category_id = 0 ) AND ( subcategory_id = 0 ) AND ( subsubcategory_id = 0 ) "
                if(movie.adult == 1){
                    sql += " AND ( adult IS NULL OR adult = 1) "
                }else if(movie.adult == 2){
                    sql += " AND ( adult IS NULL OR adult = 0) "
                }
                sql += " ORDER BY RAND() DESC LIMIT 1 "
                await globalModel.custom(req,sql,[]).then(result => {
                    if(result){
                        const adsResults = JSON.parse(JSON.stringify(result));
                        if(adsResults && adsResults.length){
                            req.query.adminAdmovie = adsResults[0]
                            globalModel.custom(req,"UPDATE advertisements_admin SET view_count = view_count + 1 WHERE ad_id = ?",[adsResults[0].ad_id]).then(result => {

                            })
                        }
                    }
                })
            }
        }
    }
    if (!req.query.password && (req.appSettings['movie_adult'] != 1 ||  (movie.adult == 0 || (movie.adult == 1 && req.query.adultAllowed)))) {
        req.query.movie = movie
        delete req.query.movie.password
        if(movie.approve == 1)
        recentlyViewed.insert(req, { id: movie.movie_id, owner_id: movie.owner_id, type: 'movies', creation_date: dateTime.create().format("Y-m-d H:M:S") }).catch(err => {

        })
    }else{
        req.query.adultMovie = movie.adult
    }
    

    //related movies category || tags
    req.contentType = movie.category == "movie" ? "movies" : "series"
    await movieModel.getMovies(req, { orderby:" view_count desc ",category_id: movie.category_id, tags: movie.tags, not_movie_id: movie.movie_id, 'related': true, limit: 10 }).then(result => {
        if (result) {
            req.query.relatedMovies = result
        }
    }).catch(err => {

    })

    if(!req.query.relatedMovies || req.query.relatedMovies.length < 10){
        await movieModel.getMovies(req, { orderby:" view_count desc ", not_movies_id: req.query.relatedMovies, limit: 10 - (req.query.relatedMovies && req.query.relatedMovies.length ? req.query.relatedMovies.length : 0),not_movie_id: movie.movie_id, }).then(result => {
            if (result) {
                if(req.query.relatedMovies && req.query.relatedMovies.length){
                    req.query.relatedMovies = req.query.relatedMovies.concat(result)
                }else{
                    req.query.relatedMovies = result
                }
                
            }
        }).catch(err => {
    
        })
    }
    //category details
    if (movie.category_id) {
        await categoryModel.findById(movie.category_id, req, res).then(result => {
            if (result) {
                movie.categories = result
            }
        }).catch(err => {

        })
        if (movie.subcategory_id) {
            await categoryModel.findById(movie.subcategory_id, req, res).then(result => {
                if (result) {
                    movie.subcategory = result
                }
            }).catch(err => {

            })
            if (movie.subsubcategory_id) {
                await categoryModel.findById(movie.subsubcategory_id, req, res).then(result => {
                    if (result) {
                        movie.subsubcategory = result 
                    }
                }).catch(err => {

                })
            }
        }
    }
    req.contentType = null
    return res.send({...req.query,page_type:"watch"});
}
