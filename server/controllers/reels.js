const commonFunction = require("../functions/commonFunctions")
const reelsModel = require("../models/reels")
const storiesModel = require("../models/stories")
const privacyModel = require("../models/privacy")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")

exports.view = async (req, res) => {
    req.query.id = req.params.id

    await commonFunction.getGeneralInfo(req, res, 'reel_view')
    let video = {}
    req.isview = true;
    let showVideo = true
    await reelsModel.getReels(req,{reel_id:req.params.id,limit:1}).then(result => {
        if (result && result.length) {
            video = result[0]
        } else {
            showVideo = false
        }
    }).catch(error => {
        console.log(error)
        showVideo = false
    })
    req.isview = false;
    
    
    if (!showVideo) {
        return res.send({...req.query,permission_error:1});
    }
    if (!Object.keys(video).length || ( video.status != 1 && (!req.user || (video.owner_id != req.user.user_id && req.levelPermissions['reels.view'] != 2)))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if(video.completed != 1){
        delete video.video_location
    }
    let videoImage = video.image;
    await commonFunction.updateMetaData(req,{title:video.title,description:video.description,image:videoImage})    
    await recentlyViewed.insert(req, { id: video.reel_id, owner_id: video.owner_id, type: 'reels', creation_date: dateTime.create().format("Y-m-d H:M:S") }).catch(err => {

    })
    req.query.pagging = false
    // get other reels
    let otherReels = []
    await reelsModel.getReels(req, { limit: 11,not_in_ids:[video.reel_id],user_id: req.query.user_id ? req.query.user_id : null }).then(result => {
        if (result) {
            if (result.length > 10) {
                otherReels = result.splice(0, 10);
                req.query.pagging = true
            }else{
                otherReels = result
            }
        }
    }).catch(err => {
        console.log(err,' error ro ror roro ')
    })

    let reels = [video].concat(otherReels);
    for(let i=0;i<reels.length;i++){
        await privacyModel.permission(req, 'reels', 'delete', reels[i]).then(result => {
            reels[i].canDelete = result
        }).catch(err => {})
        await privacyModel.permission(req, 'reels', 'edit', reels[i]).then(result => {
            reels[i].canEdit = result
        }).catch(err => {
            
        })
    }
    req.query.reels = reels;
    return res.send({...req.query,page_type:"reel"});
    
}

exports.storyView = async (req, res) => {
    req.query.id = req.params.id

    await commonFunction.getGeneralInfo(req, res, 'story_view')
    let stories = null
    let items = []
    let pagging = false
    req.query.stories = {}
    //stories data
    if(parseInt(req.appSettings["enable_stories"]) == 1 && (req.levelPermissions["stories.view"] == 1 || req.levelPermissions["stories.view"] == 2)){
        
       
       //get story       
       let owner_id = 0
       await storiesModel.getStory(req,req.params.id).then(res => {
        if(res){
            owner_id = res.owner_id
        }
       })
       //get all user stories
       await storiesModel.getUserStories(req,{limit:1,owner_id:owner_id}).then(async result => {
            if(result && result.length > 0){
                let story = result[0];
                stories = story
                let videoImage = story.image;
                await commonFunction.updateMetaData(req,{title:story.title,description:story.description,image:videoImage})    
                await recentlyViewed.insert(req, { id: story.story_id, owner_id: story.owner_id, type: 'stories', creation_date: dateTime.create().format("Y-m-d H:M:S") }).catch(err => {

                })
            }
       });
       if(!stories){
        return res.send({ ...req.query , pagenotfound: 1 });
       }
       let storyPage = 16 
       await storiesModel.getUserStories(req,{limit:storyPage,ids:`${stories.owner_id}`}).then(result => {
            if(result && result.length > 0){
                items = result
                if (result.length > storyPage - 1) {
                    items = result.splice(0, storyPage - 1);
                    pagging = true;
                }
                let storiesItem = result;
                if(req.user && items[0].owner_id == req.user.user_id){
                    storiesItem.splice(1,0,stories)
                }else{
                    storiesItem.unshift(stories)
                }
                req.query.stories.results = storiesItem
            }else{
                req.query.stories.results = [stories]
            }
       });

    }else{
        delete req.query.stories;
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    
    const itemIndex = req.query.stories.results[0].stories.findIndex(p => p.story_id == req.params.id);
    if(itemIndex != -1){
        req.query.openStory = 0
        req.query.selectedStory = itemIndex
    }else{
        const itemIndex = req.query.stories.results[1].stories.findIndex(p => p.story_id == req.params.id);
        req.query.openStory = 1
        req.query.selectedStory = itemIndex
    }

    if(req.query.selectedStory == -1){
        delete req.query.selectedStory;
        delete req.query.openStory;
        delete req.query.stories;
        return res.send({ ...req.query , pagenotfound: 1 });
    }

    req.query.stories.pagging = pagging;

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
   return res.send({...req.query,page_type:"story"});
    
}

exports.create = async (req, res) => {
    let isValid = true
    let videoPageType = "reel_create"
    const id = req.params.id
    if (id) {
        videoPageType = "reel_edit"
        await reelsModel.getReel(req,id).then(async video => { 
            if(video){
                req.query.editItem = video
                await privacyModel.permission(req, 'reels', 'edit', video).then(result => {
                    isValid = result
                }).catch(err => {
                    isValid = false
                })
            }else{
                isValid = false
            }
        }).catch(err => {
            isValid = false
        })
    }
    await commonFunction.getGeneralInfo(req, res, videoPageType)
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }



    if(!req.user){
        return res.send({...req.query,page_type:"login"});
        
    }
    return res.send({...req.query,page_type:"create-reel"});
    
}
