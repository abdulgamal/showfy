const express = require('express');
const router = express.Router();
const controller = require("../controllers/movies")
const importMoviecontroller = require("../controllers/importMovies")
const multer = require("multer")
const middlewareEnable = require("../middleware/enable")

router.get(process.env.subFolder+'mainsite/movies/import',multer().none(),importMoviecontroller.importMovies);

router.use(process.env.subFolder+'movies/successulPayment/:id',multer().none(),controller.successul)
router.use(process.env.subFolder+'movies/cancelPayment/:id',controller.cancel)

router.get(process.env.subFolder+'movies/purchase/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.purchase);

router.use(process.env.subFolder+'mainsite/create-movie/:id?',(req,res,next) => {
    req.query.selectType = "movie"
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    
    middlewareEnable.isEnable(req,res,next,"movie",permission)
},controller.create);

router.use(process.env.subFolder+'mainsite/cast-and-crew/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.castView);
router.use(process.env.subFolder+'mainsite/cast-and-crew',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.castBrowse);

router.use(process.env.subFolder+'mainsite/create-series/:id?',(req,res,next) => {
    req.query.selectType = "series"
    let permission = "create"
    if(req.params.id){
        permission = "edit"
    }
    middlewareEnable.isEnable(req,res,next,"movie",permission)
},controller.create);


router.use(process.env.subFolder+'mainsite/watch/:id/trailer/:trailer_id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.trailerView);



router.use(process.env.subFolder+'mainsite/watch/:id/play',(req,res,next) => {
    req.query.play = 1;
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.play);
router.use(process.env.subFolder+'mainsite/watch/:id/season/:season_id/episode/:episode_id/trailer/:trailer_id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.episodeView);
router.use(process.env.subFolder+'mainsite/watch/:id/season/:season_id/episode/:episode_id/',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.episodeView);
router.use(process.env.subFolder+'mainsite/watch/:id/season/:season_id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.browseSeason);

router.use(process.env.subFolder+'mainsite/movies-series/categories',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.categories);
router.use(process.env.subFolder+'mainsite/movies-series/category/:id',(req,res,next) => {
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.category);
router.get(process.env.subFolder+'mainsite/movies',multer().none(),(req,res,next) => {
    req.contentType = "movies";
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.browse);
router.get(process.env.subFolder+'mainsite/series',multer().none(),(req,res,next) => {
    req.contentType = "series";
    middlewareEnable.isEnable(req,res,next,"movie",'view')
},controller.browse);
module.exports = router; 