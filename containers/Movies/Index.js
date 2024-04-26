import React,{useReducer,useEffect,useRef} from 'react'
import { useSelector, useDispatch } from "react-redux";
import { setMenuOpen } from "../../store/reducers/search";
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators'
import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router, { withRouter } from "next/router";
import CensorWord from "../CensoredWords/Index"
import Translate from "../../components/Translate/Index"
import Link from "../../components/Link/index";
import Comment from "../../containers/Comments/Index"
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import WatchLater from "../WatchLater/Index"
import swal from "sweetalert"
const Episodes = dynamic(() => import("./Episodes"), {
    ssr: false
});
const Seasons = dynamic(() => import("./Seasons"), {
    ssr: false
});
const Cast = dynamic(() => import("./MovieCast.js"), {
    ssr: false
});
const Reviews = dynamic(() => import("./Reviews"), {
    ssr: false
});
const Images = dynamic(() => import("./Images"), {
    ssr: false
});
const Trailers = dynamic(() => import("./Trailers"), {
    ssr: false
});
import Info from "./Info"
const Movies = dynamic(() => import("../HomePage/Movies"), {
    ssr: false
});
import Currency from "../Upgrade/Currency"
import Gateways from "../Gateways/Index";

const Plans = dynamic(() => import("../User/Plans"), {
    ssr: false
});
const Player = dynamic(() => import("../Video/Player"), {
    ssr: false
});
const OutsidePlayer = dynamic(() => import("../Video/OutsidePlayer"), {
    ssr: false
});
const MediaElementPlayer = dynamic(() => import("../Video/MediaElementPlayer"), {
    ssr: false
});

const Movie = (props) => {
    let reduxStateSongId = useSelector((state) => {
        return state.audio.song_id;
      });
      let reduxStatePauseSongId = useSelector((state) => {
        return state.audio.pausesong_id;
      });
    let menuOpen = useSelector((state) => {
        return state.search.menuOpen;
    });
    const dispatch = useDispatch()
    
    const plansSubscription = useRef(null)
    let seasonCurrentIndex = props.pageData.seasonCurrentIndex ? props.pageData.seasonCurrentIndex : 0

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            styles: {
                visibility: "hidden",
                overflow: "hidden"
            },
            showMore: false,
            showMoreText: "See more",
            collapse: true,
            trailer:props.pageData.trailer,
            contentType:props.pageData.contentType,
            movie:props.pageData.movie,
            seasons:props.pageData.seasons,
            clipsTrailers:props.pageData.clipsTrailers,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
            tabType:props.pageData.tabType ? props.pageData.tabType : "episodes",
            relatedMovies:props.pageData.relatedMovies,
            movie_countries:props.pageData.movie ? props.pageData.movie.movie_countries : null,
            generes:props.pageData.movie ? props.pageData.movie.generes : null,
            castncrew:props.pageData.movie ? props.pageData.movie.castncrew : null,
            images:props.pageData.movie ? props.pageData.movie.images : null,
            adult: props.pageData.adultMovie,
            password: props.pageData.password,
            episode:props.pageData.episode,
            adminAdVideo:props.pageData.adminAdVideo,
            userAdVideo:props.pageData.userAdVideo,
            reviews:props.pageData.reviews ? props.pageData.reviews : null,
            episodes: props.pageData.episodes ? props.pageData.episodes : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex].episodes ? props.pageData.seasons[seasonCurrentIndex].episodes : null),
            episode_season: props.pageData.episode_season ? props.pageData.episode_season : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex] ? props.pageData.seasons[seasonCurrentIndex].season : null),
            episode_pagging: props.pageData.episodes ? props.pageData.episode_pagging : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex].episodes ? props.pageData.seasons[seasonCurrentIndex].episode_pagging : false),
            nextTrailer:props.pageData.nextTrailer,
            nextEpisode:props.pageData.nextEpisode
        }
    );
    const stateRef = useRef();
    stateRef.current = state.movie
    useEffect(() => {
        if (props.pageData.movie != state.movie || props.pageData.trailer != state.trailer || props.pageData.episode != state.episode || (state.movie && props.pageData.movie.status != state.movie.status) || 
        (props.pageData.password != state.password) || props.pageData.adultMovie != state.adult) {
            let seasonCurrentIndex = props.pageData.seasonCurrentIndex ? props.pageData.seasonCurrentIndex : 0
           setState({
                nextTrailer:props.pageData.nextTrailer,
                nextEpisode:props.pageData.nextEpisode,
                adminAdVideo:props.pageData.adminAdVideo,
                userAdVideo:props.pageData.userAdVideo,
                episode:props.pageData.episode,
                trailer:props.pageData.trailer,
                gateways:false,
                purchasePopup:false,
                contentType:props.pageData.contentType,
                movie:props.pageData.movie,
                seasons:props.pageData.seasons,
                clipsTrailers:props.pageData.clipsTrailers,
                needSubscription:props.pageData.needSubscription,
                plans:props.pageData.plans,
                tabType:props.pageData.tabType ? props.pageData.tabType : "episodes",
                relatedMovies:props.pageData.relatedMovies,
                movie_countries:props.pageData.movie ? props.pageData.movie.movie_countries : null,
                generes:props.pageData.movie ? props.pageData.movie.generes : null,
                castncrew:props.pageData.movie ? props.pageData.movie.castncrew : null,
                images:props.pageData.movie ? props.pageData.movie.images : null,
                reviews:props.pageData.reviews ? props.pageData.reviews : null,
                password: props.pageData.password,
                logout:false,
                changeHeight:true,
                adult: props.pageData.adultMovie,
                episodes: props.pageData.episodes ? props.pageData.episodes : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex].episodes ? props.pageData.seasons[seasonCurrentIndex].episodes : null),
                episode_season: props.pageData.episode_season ? props.pageData.episode_season : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex] ? props.pageData.seasons[seasonCurrentIndex].season : null),
                episode_pagging: props.pageData.episodes ? props.pageData.episode_pagging : (props.pageData.seasons && props.pageData.seasons[seasonCurrentIndex].episodes ? props.pageData.seasons[seasonCurrentIndex].episode_pagging : false),
            })
            setTimeout(() => {
                getHeight();
            if(typeof window != "undefined"){
                if($(".nav-tabs > li > a.active").length == 0){ 
                    if(state.needSubscription){
                      pushTab("plans")
                    }else{
                      if(state.clipsTrailers && state.clipsTrailers.results.length > 0)
                        pushTab("trailers")
                      else
                        pushTab("about")
                    }
                }
            }
            })
        }
    },[props])

    const updateWindowDimensions = () => {
        setState({ width: window.innerWidth });
        setTimeout(() => getHeight(),200)
    }
    useEffect(() => {
        
        
        // Router.beforePopState(({ url, as, options }) => {
        //     console.log(url,as,options)
        // })

        if(reduxStateSongId)
            props.updateAudioData({audios:props.audios, song_id:reduxStateSongId,pausesong_id:reduxStatePauseSongId})

        props.updatePlayerData({relatedVideos:[],playlistVideos:[],currentVideo:null,deleteMessage:"",deleteTitle:"",liveStreamingURL:props.pageData.liveStreamingURL})
        if(props.pageData.appSettings["fixed_header"] == 1 && props.hideSmallMenu && !menuOpen){
            dispatch(setMenuOpen(true))
        }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        getHeight();
        if (stateRef.current) {
            if ($('#movieDescription').height() > 110) {
                setState({ showMore: true, styles: { visibility: "visible", overflow: "hidden", height: "100px" }, collapse: true })
            } else {
                setState({ showMore: false, styles: { visibility: "visible", height: "auto" } })
            }
        }
        
        props.socket.on('unwatchlaterMovies', socketdata => {
            let id = socketdata.itemId
            let ownerId = socketdata.ownerId
            if (stateRef.current && stateRef.current.movie_id == id) {
                const movie = { ...stateRef.current }
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    movie.watchlater_id = null
                    setState({ movie: movie })
                }
            }
        });
        props.socket.on('watchlaterMovies', socketdata => {
            let id = socketdata.itemId
            let ownerId = socketdata.ownerId
            if (stateRef.current && stateRef.current.movie_id == id) {
                const movie = { ...stateRef.current }
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    movie.watchlater_id = 1
                    setState({ movie: movie })
                }
            }
        });

        props.socket.on('unfollowUser', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.owner.user_id && type == "members") {
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...stateRef.current }
                    const owner = data.owner
                    owner.follower_id = null
                    setState({ movie: data })
                }
            }
        });
        props.socket.on('followUser', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.owner.user_id && type == "members") {
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    const data = { ...stateRef.current }
                    const owner = data.owner
                    owner.follower_id = 1
                    setState({ movie: data })
                }
            }
        });
        props.socket.on('ratedItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let Statustype = socketdata.type
            let rating = socketdata.rating
            if (stateRef.current && id == stateRef.current.movie_id && type == "movies") {
                const data = { ...stateRef.current }
                data.rating = rating
                setState({ movie: data })
            }
        });
        props.socket.on('unfavouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.movie_id && type == "movies") {
                if (stateRef.current.movie_id == id) {
                    const data = { ...stateRef.current }
                    data.favourite_count = data.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    setState({ movie: data })
                }
            }
        });
        props.socket.on('favouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.movie_id && type == "movies") {
                if (stateRef.current.movie_id == id) {
                    const data = { ...stateRef.current }
                    data.favourite_count = data.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    setState({ movie: data })
                }
            }
        });


        props.socket.on('likeDislike', socketdata => {
            let itemId = socketdata.itemId
            let itemType = socketdata.itemType
            let ownerId = socketdata.ownerId
            let removeLike = socketdata.removeLike
            let removeDislike = socketdata.removeDislike
            let insertLike = socketdata.insertLike
            let insertDislike = socketdata.insertDislike
            if (stateRef.current && itemType == "movies" && stateRef.current.movie_id == itemId) {
                const item = { ...stateRef.current }
                let loggedInUserDetails = {}
                if (props.pageData && props.pageData.loggedInUserDetails) {
                    loggedInUserDetails = props.pageData.loggedInUserDetails
                }
                if (removeLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['like_count'] = parseInt(item['like_count']) - 1
                }
                if (removeDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['dislike_count'] = parseInt(item['dislike_count']) - 1
                }
                if (insertLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "like"
                    item['like_count'] = parseInt(item['like_count']) + 1
                }
                if (insertDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "dislike"
                    item['dislike_count'] = parseInt(item['dislike_count']) + 1
                }
                setState({ movie: item })
            }
        });
        return () => window.removeEventListener('resize', updateWindowDimensions);
    },[])
   const getHeight = () => {
        if(!stateRef.current){
            return
        }
        if($('.movie-player').length && $(".movie-player-height").length){
            let height = (($(".movie-player-height").outerWidth(true) /  2.2)) + "px";
            $(".player-wrapper, .video-js").css("height","100%");
            $(".movie-player-height").css("height",(($(".movie-player-height").outerWidth(true) /  2.2)) + "px");
            $('video, iframe').css('height', '100%');
        }else{
            $(".movie-player-height").removeAttr("style");
            $(".MBnrBg").removeAttr("style")
        }
    } 
    
    useEffect(() => {
        if (
          props.router.query &&
          props.router.query.tab != state.tabType &&
          props.router.query.tab
        ) {
          setState({ tabType: props.router.query.tab });
        } else if (props.router.query && !props.router.query.tab) {
          if ($(".nav-tabs").children().length > 0) {
            let type = $(".nav-tabs")
              .children()
              .first()
              .find("a")
              .attr("aria-controls");
            setState({ tabType: type });
          }
        }
      }, [props.router.query]);
      const pushTab = (type, e) => {
        if (e) e.preventDefault();
        if (state.tabType == type || !state.movie) {
          return;
        }
        let fUrl = props.router.asPath.split("?");
        let url = fUrl[0];
        let otherQueryParams = null;
        if (typeof URLSearchParams !== "undefined") {
          otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
          otherQueryParams.delete("tab");
        }
        let fURL =
          url +
          "?" +
          (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");
        Router.push(`${fURL}tab=${type}`, `${fURL}tab=${type}`, { shallow: true });
      };
    const linkify = (inputText) => {
        inputText = inputText.replace(/&lt;br\/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br \/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br&gt;/g, ' <br/>')
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>');
    
        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" rel="nofollow">$1</a>');
    
        return replacedText;
    }
    const showMore = (e) => {
        e.preventDefault()
        let showMoreText = ""
        let styles = {}
        if (state.collapse) {
            showMoreText = Translate(props, "Show less")
            styles = { visibility: "visible", overflow: "visible" }
        } else {
            showMoreText = Translate(props, "Show more")
            styles = { visibility: "visible", overflow: "hidden", height: "100px" }
        }
        setState({ styles: styles, showMoreText: showMoreText, collapse: !state.collapse })
    }
    const checkPassword = model => {
        if (state.submitting) {
            return
        }
        const formData = new FormData();
        for (var key in model) {
            formData.append(key, model[key]);
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/password/' + props.pageData.id;
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, submitting: false });
                } else {
                    setState({ submitting: false, error: null })
                    Router.push(`/watch/${props.pageData.id}`)
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    }
    const openReport = (e) => {
        e.preventDefault()
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            props.openReport({status:true, id:state.movie.custom_url, type:state.contentType})
        }
    }
    const deleteMovie = (e) => {
        e.preventDefault()
        swal({
            title: Translate(props, "Are you sure?"),
            text: Translate(props, `Once deleted, you will not be able to recover this ${state.contentType == "movies" ? "movie" : "series"}!`),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('movie_id', state.movie.movie_id)
                    const url = "/movies/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                            } else {
                                props.openToast({message:Translate(props, response.data.message),type: "success"});
                                setState({logout:true})
                                setTimeout(() => {
                                    Router.push( `/dashboard/movies`)
                                },200)
                            } 
                        }).catch(err => {
                            swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    const purchaseClicked = () => {
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        }else{
            setState({purchasePopup:true,gatewaysURL:`/movies/purchase/${state.movie.movie_id}?chooseType=${state.chooseType}`});
        }
    }
    const scrollToSubscriptionPlans = () => {
        if(state.tabType != "plans"){
            setState({tabType:"plans"})
            setTimeout(() => plansSubscription.current.scrollIntoView(),200)
            return
        }
        plansSubscription.current.scrollIntoView()
    }
    const showGateways = (type,e) => {
        e.preventDefault();
        setState({gateways:true,gatewaysURL:`/movies/purchase/${state.movie.movie_id}?chooseType=${state.chooseType}`,chooseType:type});
    }
    const watchNow = (e) => {
        e.preventDefault();
        if(state.episodes && state.episodes.length > 0){
            let episode = state.episodes[0]
            let customParams = ""
            let customString = ""
            let type = ""
            if(state.seasons){
                customParams += "/season/"+state.episode_season
                customString += "&season_id="+state.episode_season                
                customParams += "/episode/"+episode.episode_number
                customString += "&episode_id="+episode.episode_number
                if(episode.trailer_id){
                    customParams += "/trailer/"+episode.trailer_id
                    customString += "&trailer_id="+episode.trailer_id
                }
                type = `?type=${state.tabType}`
                Router.push( `/watch/${state.movie.custom_url}${customParams}${type}`)
            }else{
                customParams += "/play"
                customString += "&play=1"
                //setState({episode:episode})
                Router.push(`/watch/${state.movie.custom_url}${customParams}${type}`)
            }
            return;
        }
    }
    const videoEnd = (type) => {
        if(type == "episode" && state.nextEpisode){
            let item = state.nextEpisode
            Router.push( `/watch/${state.movie.custom_url}/season/${state.episode_season}/episode/${item.episode_number}`)
        }else if(type == "trailer" && state.nextTrailer){
            let item = state.nextTrailer
            state.episode && state.seasons? 
                Router.push(`/watch/${state.movie.custom_url}/season/${item.season}/episode/${item.episode_number}/trailer/${item.movie_video_id}`)
            :
            Router.push( `/watch/${state.movie.custom_url}/trailer/${item.movie_video_id}`)
        }
    }
    const updatePlayCount = (id) => {
        if(typeof window == "undefined"){
            return
        }
        const formData = new FormData();
        formData.append("movie_video_id",id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
        let url = '/movies/update-play-count';
        axios.post(url, formData, config)
        .then(response => {
            
        }).catch(err => {
            
        });
    }
        let imageURL = state.movie ? state.movie.image : ""
        if(imageURL){
            if(imageURL.indexOf("http://") == 0 || imageURL.indexOf("https://") == 0){
                imageURL = imageURL
            }else{
                imageURL = props.pageData.imageSuffix+imageURL
            }
        }
        let validatorUploadImport = []
        let fieldUploadImport = []
        validatorUploadImport.push({
            key: "password",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Password is required field"
                }
            ]
        })
        fieldUploadImport.push({ key: "password", label: "", type: "password" })

        let metaData = []

        
        if(state.movie){
            if(state.movie.language_title){
                metaData.push(state.movie.language_title)
            }
        
            if(state.movie.release_year){
                metaData.push(state.movie.release_year)
            }
            if(state.movie.adult == 1){
                metaData.push("18+")
            }
        }
        let userBalance = {}
        userBalance['package'] = { price: parseFloat(state.movie ? state.movie.price : 0) }
        let rentPrice = {}
        rentPrice['package'] = { price: parseFloat(state.movie ? state.movie.rent_price : 0) } 

        let purchaseHTML = ""

        if(state.purchasePopup){
            purchaseHTML = 
                            <div className="popup_wrapper_cnt movie-series-purchase">
                                <div className="popup_cnt">
                                    <div className="comments">
                                        <div className="VideoDetails-commentWrap">
                                            <div className="modal-content-popup">
                                                <span className="close-popup" onClick = {() => setState({purchasePopup:false})}>
                                                    <span className="material-icons">close</span>
                                                </span>
                                                <div className="buyRent-wrap">
                                                    <div className="buyRent-btn">
                                                        <div className="moviePoster">
                                                            <img src={imageURL} alt={state.movie.title} />
                                                        </div>
                                                        <div className="content">
                                                            {
                                                                parseFloat(state.movie.rent_price) > 0 ? 
                                                                    <div className="rent mb-3">
                                                                        <h4 className="textBlck">{props.t("Rent")}</h4>
                                                                        <p className="rent-valid">{props.t("valid for 24 hours")}</p>
                                                                        <div className="buttong">
                                                                            <button type="button" className="btn btn-primary btn-lg" onClick={showGateways.bind(this,"rent")}><Currency { ...props} {...rentPrice} /></button>
                                                                        </div>
                                                                    </div>
                                                            : null
                                                            }
                                                            {
                                                                parseFloat(state.movie.price) > 0 ? 
                                                            <div className="rent">
                                                                <h4 className="textBlck">{props.t("Purchase")}</h4>
                                                                <div className="buttong">
                                                                    <button type="button" className="btn btn-primary btn-lg" onClick={showGateways.bind(this,"purchase")}><Currency { ...props} {...userBalance} /></button>
                                                                </div>
                                                            </div>
                                                            : null
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
        }

        let gatewaysHTML = ""
        if(state.gateways){
            gatewaysHTML = <Gateways {...props} success={() => {
                props.openToast({message:Translate(props, "Payment done successfully."), type:"success"});
                setTimeout(() => {
                    let customParams = ""
                    let customString = ""
                    if(props.pageData.season_id){
                    customParams += "/season/"+props.pageData.season_id
                    customString += "&season_id="+props.pageData.season_id
                    }
                    if(props.pageData.episode_id){
                    customParams += "/episode/"+props.pageData.episode_id
                    customString += "&episode_id="+props.pageData.episode_id
                    }
                    if(props.pageData.trailer_id){
                    customParams += "/trailer/"+props.pageData.trailer_id
                    customString += "&trailer_id="+props.pageData.trailer_id
                    }
                    Router.push( `/watch/${state.movie.custom_url}${customParams}?type=${state.tabType}`)

                  },1000);
            }} successBank={() => {
                props.openToast({message:Translate(props, "Your bank request has been successfully sent, you will get notified once it's approved"),type: "success"});
                setState({gateways:null})
            }} bank_price={state.chooseType == "rent" ? state.movie.rent_price : state.movie.price} bank_type={`${state.contentType == "movies" ? state.chooseType+"_movie_purchase" : state.chooseType+"_series_purchase"}`} bank_resource_type={state.contentType == "movies" ? state.chooseType+"_movie" : state.chooseType+"_series"} bank_resource_id={state.movie.custom_url} tokenURL={`movies/successulPayment/${state.movie.movie_id}?chooseType=${state.chooseType}`} closePopup={() => setState({gateways:false})} gatewaysUrl={state.gatewaysURL} />
        }

        let fUrl = props.router.asPath.split("?");
        let url = fUrl[0];
        let otherQueryParams = null;
        if (typeof URLSearchParams !== "undefined") {
          otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
          otherQueryParams.delete("tab");
        }
        let fURL =
          url +
          "?" +
          (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");

        return (
            <React.Fragment>
                {
                    purchaseHTML
                }
                {
                    gatewaysHTML
                }
                {
                    state.password ?
                        <Form
                            className="form password-mandatory"
                            generalError={state.error}
                            title={"Enter Password"}
                            validators={validatorUploadImport}
                            model={fieldUploadImport}
                            {...props}
                            submitText={state.submitting ? "Submit..." : "Submit"}
                            onSubmit={model => {
                                checkPassword(model);
                            }}
                        />
                :
                state.adult ?
                    <div className="container">
                        <div className="row">
                            <div className={`col-md-12`}>
                                <div className="adult-wrapper">
                                    {Translate(props, 'This movie contains adult content.To view this movie, Turn on adult content setting from site footer.')}
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <React.Fragment>
                        {
                            state.movie && state.movie.approve != 1 ? 
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-12 approval-pending">
                                        <div className="generalErrors">
                                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                {Translate(props,'This movie still waiting for admin approval.')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        : null
                        }
                        {
                            !state.trailer && !state.episode ? 
                            <React.Fragment>
                            <div className={`SlideAdsWrap${" nobtn"}`}>
                                <div id="snglFullWdth" className="snglFullWdth">
                                    <div className="banner-wrap justify-content-between align-items-center" key={state.movie.movie_id}>
                                        <div className="left-wrap ellipsize2Line">
                                            <h4 className="my-3">
                                                <a href="#" onClick={(e) => {e.preventDefault();}}>{<CensorWord {...props} text={state.movie.title} />}</a>
                                            </h4>
                                            {
                                                metaData.length > 0 ?
                                                <div className="movieInfo">
                                                    {
                                                        metaData.join(" | ")   
                                                    }
                                                </div>
                                                : null
                                            }
                                            <div className="MvtimeLng">
                                            {
                                                state.generes && state.generes.length > 0 ?                                                 
                                                    state.generes.map((gener,index) => {
                                                        return (
                                                            <Link key={index} href={state.contentType} customParam={`genre=${gener.slug}`} as={`/${state.contentType}?genre=${gener.slug}`}>
                                                                <a>{Translate(props, gener.title)}</a>
                                                            </Link>
                                                        )
                                                    }).reduce((prev, curr) => [prev, " / ", curr])
                                                : null
                                            }
                                            </div>
                                            <div className="smInfo d-flex align-items-center flex-wrap mb-5">
                                                <div className="pvtBannerLike">
                                                    <ul className="LikeDislikeList">                                                            
                                                        
                                                                <React.Fragment>
                                                                {
                                                                    state.movie.approve == 1 ? 
                                                                        <React.Fragment>
                                                                            <li>
                                                                                <Like icon={true} {...props} like_count={state.movie.like_count} item={state.movie} type="movie" id={state.movie.movie_id} />{"  "}
                                                                            </li>
                                                                            <li>
                                                                                <Dislike icon={true} {...props} dislike_count={state.movie.dislike_count} item={state.movie} type="movie" id={state.movie.movie_id} />{"  "}
                                                                            </li>
                                                                            <li>
                                                                                <Favourite icon={true} {...props} favourite_count={state.movie.favourite_count} item={state.movie} type="movie" id={state.movie.movie_id} />{"  "}
                                                                            </li>
                                                                            <li>
                                                                                <WatchLater className="watchLater" typeWatchLater="movie-series" icon={true} {...props} item={state.movie} id={state.movie.movie_id} />
                                                                            </li>
                                                                            <SocialShare {...props} hideTitle={true} className="video_share" buttonHeightWidth="30" tags={state.movie.tags} url={`/watch/${state.movie.custom_url}`} title={state.movie.title} imageSuffix={props.pageData.imageSuffix} media={state.movie.image} />
                                                                        
                                                                        </React.Fragment>
                                                                    : null
                                                                }
                                                                   <li>
                                                                        <div className="dropdown TitleRightDropdown"><a href="#"
                                                                                data-bs-toggle="dropdown"><span
                                                                                    className="material-icons">more_verti</span></a>
                                                                            <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                                            {
                                                                                state.movie.canEdit ?
                                                                                    <li>
                                                                                        <Link href={`${state.contentType == "movies" ? "/create-movie" : "/create-series"}`} customParam={`id=${state.movie.custom_url}`} as={`${state.contentType == "movies" ? "/create-movie" : "/create-series"}/${state.movie.custom_url}`}>
                                                                                            <a><span className="material-icons" data-icon="edit"></span>{Translate(props, "Edit")}</a>
                                                                                        </Link>
                                                                                    </li>
                                                                                    : null
                                                                            }
                                                                            {
                                                                                state.movie.canDelete ?
                                                                                    <li>
                                                                                        <a onClick={deleteMovie.bind(this)} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(props, "Delete")}</a>
                                                                                    </li>
                                                                                    : null
                                                                            }
                                                                            {
                                                                                !state.movie.canEdit && state.movie.approve == 1 ?
                                                                                    <li>
                                                                                        <a href="#" onClick={openReport.bind(this)}>
                                                                                        <span className="material-icons" data-icon="flag"></span>
                                                                                            {Translate(props, "Report")}
                                                                                        </a>
                                                                                    </li>
                                                                            : null
                                                                            }
                                                                            </ul>
                                                                        </div>
                                                                    </li>
                                                                </React.Fragment>
                                                                                                        
                                                    </ul>
                                                </div>
                                            </div>
                                            {
                                                state.episodes && state.episodes.length > 0 ? 
                                                    <div className="d-flex align-items-center">
                                                            <a className="btn btn-lg playBtn" href="#" onClick={watchNow}>
                                                                <span className="d-flex align-items-center justify-content-center">
                                                                    <span className="material-icons-outlined">
                                                                        play_arrow
                                                                    </span> {props.t("Watch Now")}
                                                                </span>
                                                            </a>
                                                    </div>
                                            : null
                                            }
                                        </div>
                                    <div className="right-wrap" style={{ backgroundImage: `url(${imageURL})` }}></div>
                                </div>
                                </div>
                            </div>
                            </React.Fragment>
                        :
                        state.trailer ?  
                        <div className="moviePlayer-wrap movie-player-height">
                            <div className="movie-player">
                                {
                                    state.trailer.type == 'external' ?
                                        <a href={state.trailer.code} target="_blank">{props.t("External Link")}</a>
                                    :
                                    state.trailer.type == 'upload' && props.pageData.appSettings['player_type'] == "element" ?
                                        <MediaElementPlayer {...props} updatePlayCount={updatePlayCount} getHeight={getHeight} playType={"trailer"} ended={videoEnd} height={"500px"} userAdVideo={state.userAdVideo} adminAdVideo={state.adminAdVideo} imageSuffix={props.pageData.imageSuffix} video={props.pageData.trailer} {...props.pageData.trailer} />
                                    :
                                    state.trailer.type == 'upload' ?
                                        <Player {...props} updatePlayCount={updatePlayCount} getHeight={getHeight} playType={"trailer"} ended={videoEnd} height={"500px"} userAdVideo={state.userAdVideo} adminAdVideo={state.adminAdVideo} imageSuffix={props.pageData.imageSuffix} video={props.pageData.trailer} {...props.pageData.trailer} />
                                    :
                                        <OutsidePlayer {...props} updatePlayCount={updatePlayCount} getHeight={getHeight} ended={videoEnd} playType={"trailer"} height={"500px"} imageSuffix={props.pageData.imageSuffix} video={props.pageData.trailer}  {...props.pageData.trailer} />
                                }
                            </div>
                        </div>
                        :
                        state.episode ?
                            <div className="moviePlayer-wrap movie-player-height">
                            {
                                state.needSubscription ? 
                                <div className="movie-player player-wrapper">
                                    <div className="subscription-update-plan-cnt">
                                        <div className="subscription-update-plan-title">
                                            {
                                                    state.needSubscription.type == "upgrade" ? 
                                                        props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                    :
                                                        props.t("To watch more content, kindly Subscribe.")
                                            }
                                            <div className="subscription-options">
                                                { 
                                                    <button onClick={scrollToSubscriptionPlans}>
                                                        {props.t("Subscription Plans")}
                                                    </button>
                                                }
                                                {
                                                    props.t("or")
                                                }
                                                {
                                                    <button onClick={purchaseClicked}>
                                                        {props.t('Purchase {{type}}',{type:state.contentType == "movies" ? "Movie" : "Series"})}
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                    state.movie && (parseFloat(state.movie.price) > 0 || parseFloat(state.movie.rent_price) > 0) && !state.movie.moviePurchased ?
                                        <div key="purchasevideo_purchase movie-player" >
                                            <div data-vjs-player className="video_player_cnt player-wrapper" style={{ width: "100%"}} >
                                                <div className="purchase_video_content video_purchase" style={{ width: "100%", "height":"100%"}}>
                                                    <div className="purchase_video_content_background"></div>
                                                    <h5>
                                                        {
                                                            props.t("This {{type}} is paid, you have to purchase the {{type_1}} to watch it.",{type:state.contentType == "movies" ? "movie" : "series",type_1:state.contentType == "movies" ? "movie" : "series"})
                                                        }<br /><br />
                                                        <button className="btn btn-main" onClick={purchaseClicked}>{props.t('Purchase {{type}}',{type:state.contentType == "movies" ? "Movie" : "Series"})}</button>                                                    
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    :
                                    state.episode.type == 'external' ?
                                        <div key="purchasevideo_purchase movie-player" >
                                            <a href={state.episode.code} target="_blank">{props.t("External Link")}</a>
                                        </div>
                                    :
                                    state.episode.code || state.episode.type == "upload" ?
                                        <div className="movie-player">
                                            {
                                                state.episode.type == 'upload' && props.pageData.appSettings['player_type'] == "element" ?
                                                <MediaElementPlayer {...props} updatePlayCount={updatePlayCount} getHeight={getHeight} playType={"episode"} ended={videoEnd} height={"500px"} userAdVideo={state.userAdVideo} adminAdVideo={state.adminAdVideo} imageSuffix={props.pageData.imageSuffix} video={state.episode} {...state.episode} />
                                                :
                                                state.episode.type == 'upload' ?
                                                    <Player {...props} updatePlayCount={updatePlayCount} getHeight={getHeight} playType={"episode"} ended={videoEnd} height={"500px"} userAdVideo={state.userAdVideo} adminAdVideo={state.adminAdVideo} imageSuffix={props.pageData.imageSuffix} video={state.episode} {...state.episode} />
                                            :
                                                state.episode.code ?
                                                <OutsidePlayer {...props} updatePlayCount={updatePlayCount} getHeight={getHeight} playType={"episode"}  ended={videoEnd}  height={"500px"}  imageSuffix={props.pageData.imageSuffix} video={state.episode}  {...state.episode} />
                                            :
                                                null
                                            }
                                        </div>
                                    :
                                    <div key="purchasevideo_purchase movie-player" >
                                        <div data-vjs-player className="video_player_cnt player-wrapper" style={{ width: "100%"}} >
                                            <div className="purchase_video_content video_purchase" style={{ width: "100%", "height":"100%"}}>
                                                <div className="purchase_video_content_background"></div>
                                                <h5>
                                                    {
                                                        props.t("No videos found for this episode.")
                                                    }
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                            }
                            </div>      
                            : null                      
                        }
                        <div className="container movie-series-cnt">
                            <div className="row">
                                <div className={`col-md-12`}> 
                                    <div className="details-tab">
                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                            {
                                                state.needSubscription ? 
                                                    <li className="nav-item">
                                                    <a className={`nav-link${state.tabType == "plans" ? " active" : ""}`} onClick={
                                                        () => pushTab("plans")
                                                    } data-bs-toggle="tab" href={`${fURL}?tab=plans`} ref={plansSubscription} role="tab" aria-controls="discription" aria-selected="false">{Translate(props,"Choose Plan")}</a>
                                                    </li>
                                                : null
                                            }
                                            {
                                                state.episodes && state.seasons ? 
                                                    <li className="nav-item">
                                                        <a className={`nav-link${state.tabType == "episodes" ? " active" : ""}`} onClick={
                                                            () => pushTab("episodes")
                                                        } data-bs-toggle="tab" href={`${fURL}?tab=episodes`} role="tab" aria-controls="episodes" aria-selected="true">{Translate(props, "Episodes")}</a>
                                                    </li>
                                            : null
                                            }
                                            {
                                                state.seasons ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${state.tabType == "seasons" ? " active" : ""}`} onClick={
                                                    () => pushTab("seasons")
                                                } data-bs-toggle="tab" href={`${fURL}?tab=seasons`} role="tab" aria-controls="seasons" aria-selected="true">{Translate(props, "Seasons")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                state.clipsTrailers && state.clipsTrailers.results.length > 0 ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${state.tabType == "trailers" ? " active" : ""}`} onClick={
                                                    () => pushTab("trailers")
                                                } data-bs-toggle="tab" href={`${fURL}?tab=trailers`} role="tab" aria-controls="trailers" aria-selected="true">{Translate(props, "Trailers & More")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                state.castncrew && state.castncrew.length > 0 && props.pageData.appSettings['cast_crew_member'] == 1 ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${state.tabType == "cast" ? " active" : ""}`} onClick={
                                                    () => pushTab("cast")
                                                } data-bs-toggle="tab" href={`${fURL}?tab=cast`} role="tab" aria-controls="cast" aria-selected="true">{Translate(props, "Cast & Crew")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                state.images && state.images.length > 0 ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${state.tabType == "images" ? " active" : ""}`} onClick={
                                                    () => pushTab("images")
                                                } data-bs-toggle="tab" href={`${fURL}?tab=images`} role="tab" aria-controls="images" aria-selected="true">{Translate(props, "Images")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                state.reviews ? 
                                            <li className="nav-item">
                                                <a className={`nav-link${state.tabType == "reviews" ? " active" : ""}`} onClick={
                                                    () => pushTab("reviews")
                                                } data-bs-toggle="tab" href={`${fURL}?tab=reviews`} role="tab" aria-controls="reviews" aria-selected="true">{Translate(props, "Reviews")}</a>
                                            </li>
                                            : null
                                            }
                                            {
                                                props.pageData.appSettings[`${"movie_comment"}`] == 1 && state.movie.approve == 1 && (!state.episode || !state.seasons) ?
                                                    <li className="nav-item">
                                                        <a className={`nav-link${state.tabType == "comments" ? " active" : ""}`} onClick={
                                                            () => pushTab("comments")
                                                        } data-bs-toggle="tab" href={`${fURL}?tab=comments`}role="tab" aria-controls="comments" aria-selected="true">{`${Translate(props,"Comments")}`}</a>
                                                    </li>
                                                    : null
                                            }
                                            <li className="nav-item">
                                                <a className={`nav-link${state.tabType == "about" ? " active" : ""}`} onClick={
                                                    () => pushTab("about")
                                                } data-bs-toggle="tab" href={`${fURL}?tab=about`} role="tab" aria-controls="about" aria-selected="true">{Translate(props, "About")}</a>
                                            </li>
                                        </ul>
                                        <div className="tab-content" id="myTabContent">
                                            {
                                            state.needSubscription ? 
                                                <div className={`tab-pane fade${state.tabType == "plans" ? " active show" : ""}`} id="plans" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <p className="plan-upgrade-subscribe">
                                                        {
                                                        state.needSubscription.type == "upgrade" ? 
                                                            props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                            :
                                                            props.t("To watch more content, kindly Subscribe.")
                                                        }
                                                    </p>
                                                    <Plans {...props} userSubscription={state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={state.needSubscription.loggedin_package_id} itemObj={state.movie} member={state.movie.owner} user_id={state.movie.owner_id} plans={state.plans} />
                                                </div>
                                                </div>
                                            : null
                                            }
                                            {
                                                props.pageData.appSettings[`${"movie_comment"}`] == 1 && state.movie.approve == 1 && (!state.episode || !state.seasons) ?
                                                    <div className={`tab-pane fade${state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Comment  {...props}  owner_id={state.movie.owner_id} hideTitle={true} appSettings={props.pageData.appSettings} commentType="movie" type="movies" comment_item_id={state.movie.movie_id} />
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            <div className={`tab-pane fade${state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Info {...props} watchNow={watchNow} movie={state.movie} episode={state.episode} seasons={state.seasons} />
                                                </div>
                                            </div>
                                            {
                                                state.episodes && state.seasons ?
                                                    <div className={`tab-pane fade${state.tabType == "episodes" ? " active show" : ""}`} id="episodes" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Episodes {...props} movie={state.movie} episodes={state.episodes} pagging={state.episode_pagging} season={state.episode_season} />
                                                        </div>
                                                    </div>
                                            : null
                                            }
                                            {
                                                state.seasons ? 
                                                    <div className={`tab-pane fade${state.tabType == "seasons" ? " active show" : ""}`} id="seasons" role="tabpanel">
                                                        <div className="details-tab-box">
                                                            <Seasons {...props} movie={state.movie} seasons={state.seasons} />
                                                        </div>
                                                    </div>
                                            : null
                                            }
                                            {
                                                state.clipsTrailers && state.clipsTrailers.results.length > 0 ? 
                                            <div className={`tab-pane fade${state.tabType == "trailers" ? " active show" : ""}`} id="trailers" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Trailers {...props} movie={state.movie} episode={state.episode} seasons={state.seasons} trailers={state.clipsTrailers.results} pagging={state.clipsTrailers.pagging} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                            {
                                                state.castncrew && state.castncrew.length > 0 && props.pageData.appSettings['cast_crew_member'] == 1 ? 
                                            <div className={`tab-pane fade${state.tabType == "cast" ? " active show" : ""}`} id="cast" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Cast {...props} movie={state.movie} cast={state.castncrew} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                            {
                                                state.reviews ? 
                                            <div className={`tab-pane fade${state.tabType == "reviews" ? " active show" : ""}`} id="reviews" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Reviews {...props} reviews={state.reviews} movie={state.movie} canEdit={state.movie.canEdit} canDelete={state.movie.canDelete} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                            {
                                                state.images && state.images.length > 0 ? 
                                            <div className={`tab-pane fade${state.tabType == "images" ? " active show" : ""}`} id="images" role="tabpanel">
                                                <div className="details-tab-box">
                                                    <Images {...props} images={state.images} siteURL={props.pageData.siteURL} />
                                                </div>
                                            </div>
                                            : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {
                            state.relatedMovies && state.relatedMovies.length > 0 ?
                                <React.Fragment>
                                    <div className="container"><div className="row"><div className="col-sm-12"><hr className="horline" /></div></div></div>
                                    <Movies {...props} title={state.contentType == "movies" ? "Related Movies" : "Related Series"} movies={state.relatedMovies} />
                                </React.Fragment>
                            : null
                        }
                    </React.Fragment>
                }
            </React.Fragment>
        )
    }

export default withRouter(Movie)