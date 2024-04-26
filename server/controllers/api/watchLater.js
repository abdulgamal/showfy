const watchLaterModel = require("../../models/watchLater")
const dateTime = require('node-datetime')
const socketio = require("../../socket")

exports.index = async (req,res,next) => {
    let data = {}
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    data['id'] = req.body.id
    data['owner_id'] = req.user.user_id
    data['creation_date'] = formatted
    if(req.body.type == "movie-series"){
        data.type = "movie-series";
    }
    await watchLaterModel.isActive(data.id,req,data.type).then(result => {
        if(result){
            data['watchLaterId'] = result.watchlater_id
        }
    })
    await watchLaterModel.insert(data,req,res).then(result => {
        
        if(data['watchLaterId']){
            let type = "unwatchlater"
            if(req.body.type == "movie-series"){
                type = "unwatchlaterMovies"
            }
            socketio.getIO().emit(type, {
                "itemId": req.body.id,
                "ownerId":req.user.user_id,
            });
        }else{
            let type = "watchlater"
            if(req.body.type == "movie-series"){
                type = "watchlaterMovies"
            }
            //insert
            socketio.getIO().emit(type, {
                "itemId": req.body.id,
                "ownerId":req.user.user_id,
            });
        }
        res.send({})
    })
}