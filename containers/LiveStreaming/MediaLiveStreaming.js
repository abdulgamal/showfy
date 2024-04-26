import React,{useReducer,useEffect,useRef} from 'react'
import { useSelector } from "react-redux";

import Translate from "../../components/Translate/Index"
import axios from "../../axios-orders"
import ShortNumber from "short-number"
import SocialShare from "../SocialShare/Index"
import Chat from "./Chat"
import Link from "../../components/Link"
import ToastMessage from "../ToastMessage/Index"
import ToastContainer from "../ToastMessage/Container"
import Router from 'next/router';
import config from "../../config"

const Index = (props) => {
    let reduxState = useSelector((state) => {
        return state.share.status;
    });
    const inputFileLogo = useRef(null)
    const inputFileOverlay = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            scheduled:props.scheduled,
            streamingId:props.streamingId,
            allow_chat:props.allow_chat ? props.allow_chat : 1,
            like:props.like_count ? props.like_count : 0,
            dislike:props.dislike_count ? props.dislike_count : 0,
            randNumber:Math.floor( Math.random() * (99999999 - 9999) + 9999 ),
            user_id:props.pageData.loggedInUserDetails ? props.pageData.loggedInUserDetails.user_id : 0,
            title:props.title,
            image:props.image,
            allowedTime: props.allowedTime ? props.allowedTime : 0,
            currentTime: props.currentTime ? props.currentTime : 0,
            channel:props.channel,
            role:props.role, 
            custom_url:props.custom_url,
            video:props.video,
            video_id:props.video_id,
            streamleave:false,
            viewer:props.viewer ? props.viewer : 0,           
            comments:[],
            videoMuted:false,
            audioMuted:false,
            streamType:props.streamType,
            streamToken:props.streamToken,
            iframeSRC:"",
            hide:false,
            banners:  props.pageData.banners ? props.pageData.banners : [],
            backgroundColor: props.pageData.brands && props.pageData.brands.background_color ? props.pageData.brands.background_color : "#000000",
            textColor: props.pageData.brands && props.pageData.brands.text_color ? props.pageData.brands.text_color : "#ffffff",
            brands:props.pageData.brands ? props.pageData.brands : {},
            isChecked:false,
            showAddBtn:false
        }
    );
    const stateRef = useRef();
    stateRef.current = state
    useEffect(() => {
        if (props.streamId && props.streamId != state.streamId) {
            setState({
                banners:props.pageData.banners ? props.pageData.banners : [],
                showAddBtn:false,
                editBanner:0,
                backgroundColor: props.pageData.brands && props.pageData.brands.background_color ? props.pageData.brands.background_color : "#000000",
                textColor: props.pageData.brands && props.pageData.brands.text_color ? props.pageData.brands.text_color : "#ffffff",
                brands:props.pageData.brands ? props.pageData.brands : {},
                hide:false,streamToken:props.streamToken,streamType:props.streamType,streamingId:props.streamingId, currentTime: props.currentTime,  role: props.role, custom_url: props.custom_url,video:props.video,video_id:props.video_id,viewer:props.viewer,comments:props.comments 
            })
        }
    },[props])
    const mounted = useRef();
    useEffect(() => {
        if (!mounted.current) {
            // do componentDidMount logic
            mounted.current = true;
        } else {
            if(props.streamId != stateRef.current.streamId){
                if(stateRef.current.timerID)
                    clearInterval(stateRef.current.timerID);
                if(stateRef.current.timerHostUpdate)
                    clearInterval(stateRef.current.timerHostUpdate)
                createAuthToken()
                updateViewer("delete",stateRef.current.custom_url)
            }
        }
    });
   
    const onUnload = (type) => {
        if(!type)
        props.socket.emit('leaveRoom', {streamId:stateRef.current.streamingId,custom_url:stateRef.current.custom_url})
       // props.socket.disconnect();
        if(stateRef.current.role == "host"){
            finish()
        }else if(type){
            updateViewer("delete",stateRef.current.custom_url)
        }
    }
    const createAuthToken = () => {
        createVideoStreaming();
    }
    useEffect(() => {
        if(stateRef.current.role != "host"){
            Router.events.on("routeChangeStart", url => {
                onUnload();
            });
        }
        setState({iframeSRC:`${getURL()}/media-streaming/play.html`})
        window.addEventListener("beforeunload", onUnload);
        //if(state.role != "host"){
        props.socket.on('bannerData', data => {
            let owner_id = stateRef.current.video ? stateRef.current.video.owner_id : props.pageData.loggedInUserDetails.user_id
            if(owner_id == data.user_id){
                data.message = "brands";
                if(document.getElementById("media_treaming_iframe"))
                    document.getElementById("media_treaming_iframe").contentWindow.postMessage(data, '*');
            }
        });
        //}   
        if(stateRef.current.role == "host"){
            props.socket.on('hideBannerLive', data => {
                let banner_id = data.banner_id;
                let show = data.show;
                let user_id = data.user_id;
                let previousHide = data.previousHide;
                let itemIndex = getItemIndex(banner_id);
                let previousHideIndex = getItemIndex(previousHide);
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == user_id && itemIndex > -1) {
                    let banners = [...stateRef.current.banners]
                    banners[itemIndex]["show"] = parseInt(show);
                    if(previousHideIndex > -1){
                        banners[previousHideIndex]["show"] = 0;
                    }
                    setState({banners:banners});
                }
            });
            props.socket.on('deleteBannerLive', data => {
                let banner_id = data.banner_id;
                let user_id = data.user_id;
                let itemIndex = getItemIndex(banner_id);
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == user_id && itemIndex > -1) {
                    let banners = [...stateRef.current.banners]
                    banners.splice(itemIndex, 1);
                    setState({banners:banners});
                }
            });
            props.socket.on('newBannerLive', data => {
                let banner_id = data.banner_id;
                let text = data.text;
                let show = data.show;
                let ticker = data.ticker;
                let user_id = data.user_id;
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == user_id) {
                    let banners = [...stateRef.current.banners]
                    let banner = {}
                    banner.text = text
                    banner.show = show
                    banner.ticker = ticker
                    banner.user_id = user_id
                    banner.banner_id = banner_id
                    banners[banners.length] = banner
                    setState({banners:banners});
                }
            });
            props.socket.on('updateBannerLive', data => {
                let banner_id = data.banner_id;
                let text = data.text;
                let ticker = data.ticker;
                let user_id = data.user_id;
                let itemIndex = getItemIndex(banner_id);
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == user_id && itemIndex > -1) {
                    let banners = [...stateRef.current.banners]
                    let banner = banners[itemIndex]
                    banner.text = text
                    banner.ticker = ticker
                    banners[itemIndex] = banner
                    setState({banners:banners});
                }
            });
        }

        props.socket.on('liveStreamingViewerDelete', data => {
            let id = data.custom_url;
            if (stateRef.current.custom_url == id) {
                let viewer = parseInt(stateRef.current.viewer,10) - 1
                setState({viewer:viewer < 0 ? 0 : viewer})
            }
        });
        props.socket.on('liveStreamingViewerAdded', data => {
            let id = data.custom_url;
            if (stateRef.current.custom_url == id) {
                let viewer = parseInt(stateRef.current.viewer,10) + 1
                setState({viewer:viewer < 0 ? 0 : viewer})
            }
        });
        
        props.socket.on('liveStreamStatus', data => {
            let id = data.id;
            if (stateRef.current.streamingId == id) {
                if(data.action == "liveStreamEnded"){
                    finish();
                }
            }
        });
        props.socket.on('updateBrandLive', data => {
            if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == data.user_id) {
                let brand = {...stateRef.current.brands,...data}
                setState({brands:brand})
            }
        });
        props.socket.on('likeDislike', data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId = data.ownerId
            let removeLike = data.removeLike
            let removeDislike = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike = data.insertDislike
            if (itemType == "videos" && stateRef.current.video_id == itemId) {
                const item = { ...stateRef.current }
                
                if (removeLike) {
                    item['like'] = parseInt(item['like']) - 1
                }
                if (removeDislike) {
                    item['dislike'] = parseInt(item['dislike']) - 1
                }
                if (insertLike) {                    
                    item['like'] = parseInt(item['like']) + 1
                }
                if (insertDislike) { 
                    item['dislike'] = parseInt(item['dislike']) + 1
                }
                setState({ ...item })
            }
        });
        if (window.addEventListener) {
            window.addEventListener("message", receiveMessage);
        } else {
            window.attachEvent("onmessage", receiveMessage);
        }        
        if(props.getHeight)
            props.getHeight();
        return () => {
            window.removeEventListener("beforeunload", onUnload("refresh"));
            if(stateRef.current.timerID)
                clearInterval(stateRef.current.timerID);
            if(stateRef.current.timerHostUpdate)
                clearInterval(stateRef.current.timerHostUpdate)
            if(stateRef.current.role == "host"){
                finish()
            }
        }
    },[])
    
    
    const createVideoStreaming = async () => {
        if(stateRef.current.role == "host"){
            if(parseInt(props.pageData.levelPermissions['livestreaming.duration'],10) != 0){
                props.openToast({message:props.t("You can go live for {{duration}} minutes.",{duration:parseInt(props.pageData.levelPermissions['livestreaming.duration'])}), type:"success"})
            }
            stateRef.current.timerHostUpdate = setInterval(
                () => updateHostLiveTime(),
                30000
            );
            stateRef.current.timerID = setInterval(
                () => timer(),
                1000
            );
        }else{
            updateViewer('add');
            stateRef.current.timerID = setInterval(
                () => timer(),
                1000
            );
        }
    }
   
    const postMessage = (data) => {
        setTimeout(() => {
            if(document.getElementById("media_treaming_iframe"))
                document.getElementById("media_treaming_iframe").contentWindow.postMessage(data, '*');
        },500)
    }
    const iframeLoaded = () => {
        var orgName = props.pageData.liveStreamingServerURL
        var path =  (props.pageData.liveStreamingServerURL.replace("https://",'').replace("http://",''));
        var websocketURL =  "ws://" + path+`:5080/${props.pageData.streamingAppName}/websocket?rtmpForward=`;
        if (orgName.startsWith("https")) {
            websocketURL = "wss://" + path+`:5443/${props.pageData.streamingAppName}/websocket?rtmpForward=`;
        } 
        let values = {orgName:orgName,streamId:stateRef.current.streamingId,url:websocketURL,connecting:props.t("Connecting..."),networkWarning:props.t("Your connection isn't fast enough to play this stream!")}
        values['videosource'] = props.t("Video Source");
        values['appName'] = props.pageData.streamingAppName;
        values['isCommunityEdition'] = false;
        if(parseInt(props.pageData.appSettings['antserver_community_edition']) == 1)
        values['isCommunityEdition'] = 1

        if(parseInt(props.pageData.appSettings['antserver_media_hlssupported']) == 1)
        values['playOrder'] = parseInt(props.pageData.appSettings['antserver_media_hlssupported']) == 1 ? "hls,webrtc" : "webrtc,hls";
        values['screen'] = props.t("Screen");
        values['screenwithcamera'] = props.t("Screen with Camera");
        values['audiosource'] = props.t("Audio Source");
        values['token'] = props.streamToken
        values['browser_screen_share_doesnt_support'] = props.t("Your browser doesn't support screen share. You can see supported browsers in this link");
        values['liveStreamingCDNURL'] = props.pageData.liveStreamingCDNURL ? props.pageData.liveStreamingCDNURL : null
        values['liveStreamingCDNServerURL'] = props.pageData.liveStreamingCDNServerURL ? props.pageData.liveStreamingCDNServerURL : null
        postMessage({message:"getData","value":values});
        if(stateRef.current.brands || stateRef.current.banners){
            let data = {}
            if(stateRef.current.role != "host")
            data.banners = stateRef.current.banners
            else
            data.banners = []
            data.brand = stateRef.current.brands
            data.message = "brands";
            if(document.getElementById("media_treaming_iframe"))
                document.getElementById("media_treaming_iframe").contentWindow.postMessage(data, '*');
        }
    }
    const receiveMessage = (event) => {
        const message = event.data.message;
        switch (message) {
          case 'finished':
            finish();
            break;
          case 'playStarted':
            startRecording();
            createAuthToken()
            break;
         case 'resize_window':
            if(props.resizeWindow)
                props.resizeWindow();
            break;
        }
    }

    const updateViewer = (data,customURL) => {
        let formData = new FormData();
        formData.append("custom_url",customURL ? customURL : stateRef.current.custom_url)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/'+data+'-viewer';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    
    const startRecording = () => {
        if(stateRef.current.role == "host"){
            let formData = new FormData();
            formData.append("streamID",stateRef.current.streamingId)
            
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            let url = '/live-streaming/media-stream/recording';
            
            axios.post(url, formData, config)
                .then(response => {
                    if (response.data.error) {
                        
                    } else {
                        
                    }
                }).catch(err => {
                    
                });
        }
    }
    const finishStreaming = () => {
        let formData = new FormData();
        formData.append("streamID",stateRef.current.streamingId)
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/media-stream/finish';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    const finish = () => {
        if(stateRef.current.role == "host"){
            postMessage({message:"stop"});
            finishStreaming();
        }
        if(stateRef.current.timerID)
            clearInterval(stateRef.current.timerID);
        if(stateRef.current.timerHostUpdate)
            clearInterval(stateRef.current.timerHostUpdate)
        setState({streamleave:true,confirm:false,hostleave:stateRef.current.role != "host" ? true : false})
    }
    const changeTimeStamp = () => {
        let currentTime = stateRef.current.currentTime
        var seconds = parseInt(currentTime, 10); // don't forget the second param
        var hours   = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        seconds = seconds - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        return time;
    }
    const timer = () => {
        if(stateRef.current.streamleave)
            return;
        let allowedTime = 0
        if(stateRef.current.role == "host"){
            if(props.pageData.levelPermissions && parseInt(props.pageData.levelPermissions['livestreaming.duration'],10) != 0){
                allowedTime = parseInt(props.pageData.levelPermissions['livestreaming.duration'],10)
            }
        }

        if(allowedTime == 0 || (allowedTime * 60) >= (stateRef.current.currentTime - 1)){
            let currentTime = parseInt(stateRef.current.currentTime, 10)
            setState({currentTime:currentTime+1})
        }else{
            if(stateRef.current.timerID)
                clearInterval(stateRef.current.timerID);
            if(stateRef.current.timerHostUpdate)
                clearInterval(stateRef.current.timerHostUpdate)
            finish()
        }
    }
    const updateHostLiveTime = () => {
        if(stateRef.current.role == "host"){
            //update host time
            let data = {}
            data.custom_url = stateRef.current.custom_url
            props.socket.emit('updateLiveHostTime', data)
        }
    }
    const confirmfinish = () => {
        setState({confirm:true})
    }
   
    const getURL = () => {
       return props.pageData.siteURL
    }
    const hideShowChat = (type) => {
        if(type == "remove"){
            //remove class
            setState({hide:false})
        }else{
            //add class
            setState({hide:true})
        }
    }
    const getItemIndex = (item_id) => {
        const banners = [...stateRef.current.banners];
        const itemIndex = banners.findIndex(p => p["banner_id"] == item_id);
        return itemIndex;
    }
    const showHideBanner = (banner_id) => {
        let formData = new FormData();
        formData.append("banner_id",banner_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/show-hide-banner';
        
        axios.post(url, formData, config)
            .then(response => {
                
            }).catch(err => {
            });
    }
    const editBanner = (banner_id) => {
        let indexItem = getItemIndex(banner_id)
        if(indexItem > -1){
            let banner = stateRef.current.banners[indexItem];
            setState({editTextAreaHeight:"70px",editBanner:banner_id,editBannerText:banner.text,editBannerTicker:banner.ticker,showAddBtn:false,isBannerSaving:false,isChecked:false,newBannerText:"",textAreaHeight:"70px"});
        }
    }
    const deleteBanner = (banner_id) => {
        let formData = new FormData();
        formData.append("banner_id",banner_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/delete-banner';
        
        axios.post(url, formData, config)
            .then(response => {
                
            }).catch(err => {
            });
    }
    const submitBanner = (e) => {
        if((state.newBannerText && state.newBannerText.trim() != "") || (state.editBannerText && state.editBannerText.trim() != "")){
            let isCheckBoxChecked = state.isChecked
            if(isCheckBoxChecked){
                if(state.newBannerText && state.newBannerText.length > 1000){
                    return;
                }
            }else{
                if(state.newBannerText && state.newBannerText.length > 200){
                    return;
                }
            }
            //save banner text
            if(state.isBannerSaving){
                return;
            }
            setState({isBannerSaving:true})
            
            let formData = new FormData();
            if(state.editBanner){
                formData.append("ticker",state.editBannerTicker == 1 ? 1 : 0)
                formData.append("text",state.editBannerText)
                formData.append("banner_id",state.editBanner)
            }else{
                formData.append("ticker",state.isChecked == 1 ? 1 : 0)
                formData.append("text",state.newBannerText)
            }
            
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            let url = '/live-streaming/add-banner';
            
            axios.post(url, formData, config)
                .then(response => {
                    if (response.data.error) {
                        setState({isBannerSaving:false,isEditBannerSaving:false,editBanner:0})
                    } else {
                        setState({isBannerSaving:false,isChecked:false,newBannerText:"",textAreaHeight:"70px",isEditBannerSaving:false,editBanner:0})
                    }
                }).catch(err => {
                    setState({isBannerSaving:false,isEditBannerSaving:false,editBanner:0})
                });
        }
    }
    const logoOverlayInactive = (type) => {
        let formData = new FormData();
        formData.append("type",type);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/status-brands-images';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    const removeBrandLogoOverlay = (type) => {
        let formData = new FormData();
        formData.append("type",type);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/delete-brands-images';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    const setFile = (fileT,type) => {
        if(fileT.length == 0){
            return
        }
        var file = fileT[0]
        var name = file.name;
        
        var ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        var isValid = false;
        if ((ext == "png" || ext == "jpeg" || ext == "jpg" || ext == 'PNG' || ext == 'JPEG' || ext == 'JPG')) {
            isValid = true;
        }

        if(!isValid){
            return
        }

        let formData = new FormData();
        formData.append("type",type);
        formData.append("file",file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/add-brands-images';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
    const updateBrands = (arr) => {
        let formData = new FormData();
        arr.forEach(item => {
            formData.append(item.name,item.value);
        });
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/add-brands';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    
                }
            }).catch(err => {
                
            });
    }
        if(state.role != "host"){
            return (
                <React.Fragment>
                    <div className="lsVideoTop">
                        <div className="liveTimeWrap">
                            <span className="liveText">{Translate(props,'LIVE')}</span>
                            <span className="liveTime">{changeTimeStamp()}</span>
                        </div>
                        <div className="participentNo">
                            <i className="fa fa-users" aria-hidden="true"></i> {`${ShortNumber(state.viewer ? state.viewer : 0)}`}
                        </div>
                    </div>
                    <div className="video_player_cnt player-wrapper" style={{ width: "100%", position: "relative" }} >
                        {
                            <React.Fragment>
                                {
                                    !state.hostleave ? 
                                    <React.Fragment>
                                        
                                        {
                                            state.video.watermark ? 
                                                <div className="watermarkLogo">
                                                    <a href={config.app_server} {...props.watermarkLogoParams}>
                                                        <img src={props.imageSuffix+state.video.watermark} />
                                                    </a>
                                                </div>
                                                : null
                                        }
                                        <div className="videoWrapCnt" id="video_container" style={{ width: "100%", "height": "100%", position: "relative" }} >
                                            <iframe id="media_treaming_iframe" onLoad={iframeLoaded} className="media_treaming_iframe" src={state.iframeSRC}></iframe>
                                            {
                                              (state.role == "host" && props.allow_chat == 1) ||  (!props.needSubscription && props.videoElem && props.videoElem.approve == 1 && props.videoElem.enable_chat == 1 && ( (props.videoElem.is_livestreaming == 1 && (props.videoElem.channel_name || props.videoElem.mediaserver_stream_id)) || props.videoElem.scheduled   )) ? 
                                                    <div className={`mobile-chat${state.hide ? " hide-chat" : ""}`}>
                                                        <div className="ls_sidbar top_video_chat">
                                                            <Chat {...props} hideShowChat={hideShowChat} showHideChat={true} channel={props.videoElem.channel_name} streamId={props.videoElem.mediaserver_stream_id} custom_url={props.videoElem.custom_url} comments={props.videoElem.chatcomments ? props.videoElem.chatcomments : []} />
                                                        </div>    
                                                    </div>
                                                : null
                                            } 
                                        </div>
                                    </React.Fragment>
                                    :
                                        <div className="purchase_video_content video_processing_cnt livestreaming_end">
                                            <h5>{props.t("Thanks For Watching!")}</h5>
                                            <p>{props.t("Live Video has been Ended")}</p>
                                        </div>
                                }
                            </React.Fragment>                                
                        }
                    </div>
                </React.Fragment>
            )
        }

        const CameraAudio = (type,e) => {

        }

        return (
            <React.Fragment>
                {
                    reduxState ? 
                        <SocialShare {...props} buttonHeightWidth="30" url={`/watch/${state.custom_url}`} title={state.title} imageSuffix={props.pageData.imageSuffix} media={state.image} countItems="all" checkcode={true} />
                : null
                }
                {
                    <React.Fragment>
                        <ToastContainer {...props} />
                        <ToastMessage {...props} />
                    </React.Fragment>
                }
            <div className="videoSection2">
                <div className={`videoWrap${state.allow_chat != 1 ? " nochat" : ""}`}>
                    {
                        state.confirm ? 
                        <div className="popup_wrapper_cnt livestreaming_end">
                            <div className="popup_cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{Translate(props,'Are you sure you want to end your stream?')}</h2>
                                            <a className="_close" href="#" onClick={(e) => {e.preventDefault(); setState({confirm:false})}}><i></i></a>
                                            <div className="footer">
                                                <a href="#" onClick={(e) => {e.preventDefault(); setState({confirm:false})}}>
                                                    {Translate(props,'NOT YET')}
                                                </a>
                                                <button onClick={finish}>
                                                    {Translate(props,'END')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : null
                    }
                    <div className="lsVideoTop">
                        <div className="liveTimeWrap">
                            <span className="liveText">{Translate(props,'LIVE')}</span>
                            <span className="liveTime">{changeTimeStamp()}</span>
                        </div>
                        <div className="participentNo">
                            <i className="fa fa-users" aria-hidden="true"></i> {`${ShortNumber(state.viewer ? state.viewer : 0)}`}
                        </div>
                        {
                            props.pageData.appSettings["video_like"] ? 
                                <div className="likebtn">
                                    <i className="fa fa-thumbs-up" aria-hidden="true"></i> {`${ShortNumber(state.like ? state.like : 0)}`}
                                </div>
                        : null
                        }
                        {
                            props.pageData.appSettings["video_dislike"] ? 
                                <div className="likebtn">
                                    <i className="fa fa-thumbs-down" aria-hidden="true"></i> {`${ShortNumber(state.dislike ? state.dislike : 0)}`}
                                </div>
                         : null
                        }
                    </div>
                    {
                        !state.streamleave ? 
                            <div className="videoWrapCnt" id="video">
                                <div id="local_stream" className={`video-placeholder${state.role == "host" ? "" : " remote_audience"}`}>
                                    {
                                        state.streamType == "rtmp" ?
                                        <iframe id="media_treaming_iframe" onLoad={iframeLoaded} className="media_treaming_iframe" src={`${getURL()}/media-streaming/play.html`}></iframe>
                                    :
                                        <iframe id="media_treaming_iframe" onLoad={iframeLoaded} className="media_treaming_iframe" src={`${getURL()}/media-streaming/live.html`}></iframe>
                                    }
                                    {
                                        (state.role == "host" && props.allow_chat == 1) ||  (!props.needSubscription && props.videoElem && props.videoElem.approve == 1 && props.videoElem.enable_chat == 1 && ( (props.videoElem.is_livestreaming == 1 && (props.videoElem.channel_name || props.videoElem.mediaserver_stream_id)) || props.videoElem.scheduled   )) ? 
                                            <div className={`mobile-chat${state.hide ? " hide-chat" : ""}`}>
                                                <div className="ls_sidbar top_video_chat">
                                                    <Chat {...props} hideShowChat={hideShowChat} showHideChat={true} channel={props.videoElem.channel_name} streamId={props.videoElem.mediaserver_stream_id} custom_url={props.videoElem.custom_url} comments={props.videoElem.chatcomments ? props.videoElem.chatcomments : []} />
                                                </div>    
                                            </div>
                                        : null
                                    } 
                                </div>
                            </div>
                            : 
                            <div className="videoWrapCnt live_host_end" id="video">
                                <div className="centeredForm">
                                    <div className="finishedStream">
                                        <div className="head">
                                            {Translate(props,'Stream Finished')}
                                        </div>
                                        <div className="thumbStream">
                                            <img src={props.pageData.imageSuffix+props.pageData.loggedInUserDetails.avtar} />

                                            <div className="overlay">
                                                <div className="nameThumb">
                                                    <span className="big">{state.title}</span>
                                                    <span className="namesmall">{props.pageData.loggedInUserDetails.displayname}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="foot">
                                            <Link href="/">
                                                <a className="editbtn">{Translate(props,'Go back to site')}</a>
                                            </Link>
                                        </div>
                                    </div>                        
                                </div>
                            </div>
                    }
                    {
                        !state.streamleave ? 
                            <div className="ls_footer">
                                <div className="ls_footerOption">
                                {
                                      state.streamType != "rtmp" && state.cameraList && state.cameraList.length > 1 ?
                                    <div className="icon shareLinks">                                    
                                        <span className="material-icons" data-icon="flip_camera_android" onClick={changeCamera}>
                                            
                                        </span>
                                         {/* <select value={state.cameraId} onChange={changeCamera}>
                                            <option>{props.t("Select Camera Option")}</option>
                                            {
                                                state.cameraList.map(item => {
                                                    return (
                                                        <option value={item.value} key={item.value}>{item.label}</option>
                                                    )
                                                })
                                            }
                                        </select> */}
                                    </div>
                                    : null
                                }
                                {
                                    state.streamType != "rtmp" && false ? 
                                        <React.Fragment>
                                            <div className="icon valumeBtn" onClick={(e) => CameraAudio('video',e)}>
                                                {
                                                    state.videoMuted ? 
                                                        <span className="material-icons" data-icon="videocam_off">
                                                            
                                                        </span>
                                                    : 
                                                        <span className="material-icons" data-icon="videocam">
                                                            
                                                        </span>
                                                }
                                            </div>
                                            <div className="icon valumeBtn" onClick={(e) => CameraAudio("audio",e)}>
                                                {
                                                    state.audioMuted ? 
                                                        <i className="fas fa-microphone-slash"></i>
                                                : <i className="fas fa-microphone"></i>
                                                }
                                            </div>
                                        </React.Fragment>
                                    : null
                                    }
                                    <div className="icon shareLinks">
                                    {
                                        props.pageData.appSettings["videos_share"] == 1 ?
                                        <ul className="social_share_livestreaming" style={{padding:"0px"}}>
                                            <SocialShare {...props} buttonHeightWidth="30" url={`/watch/${state.custom_url}`} title={state.title} imageSuffix={props.pageData.imageSuffix} media={state.image} />
                                        </ul>
                                    : null
                                    }
                                    </div>
                                    <div className="icon endBtn" onClick={confirmfinish}><button>{Translate(props,'End Stream')}</button></div>
                                </div>
                            </div>
                        : null
                    }
                </div>
                {
                    state.allow_chat == 1 && props.pageData.levelPermissions["livestreaming.branding_livestreaming"] != 1 ?  
                        <div className="ls_sidbar">
                            <Chat {...props} finish={state.streamleave} deleteAll={true} streamId={state.streamingId} custom_url={state.custom_url} />
                        </div>    
                    : 
                <div className="ls_sidbar">
                    <div className="Lschat-wrapper d-lg-flex flex-lg-row-reverse">
                        <div className="Lschat-side-menu flex-lg-column me-lg-1 ms-lg-0">
                            <div className="flex-lg-column my-auto">
                                <ul className="nav nav-pills Lschat-side-menu-nav justify-content-center" role="tablist">                                    
                                    {
                                        state.allow_chat == 1 ? 
                                            <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top">
                                                <a className="nav-link active" id="pills-comment-tab" data-bs-toggle="pill"
                                                    href="#pills-comment" role="tab">
                                                    <i className="fas fa-comment"></i>
                                                    {props.t("Comments")}
                                                </a>
                                            </li>
                                    : null
                                    }
                                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top">
                                        <a className={`nav-link${!state.allow_chat ? " active" : ""}`} id="pills-banner-tab" data-bs-toggle="pill"
                                            href="#pills-banner" role="tab">
                                            <i className="fas fa-users"></i>
                                            {props.t("Banners")}
                                        </a>
                                    </li>
                                    <li className="nav-item" data-bs-toggle="tooltip" data-bs-placement="top">
                                        <a className="nav-link" id="pills-brand-tab" data-bs-toggle="pill"
                                            href="#pills-brand" role="tab">
                                            <i className="fas fa-users"></i>
                                            {props.t("Brands")}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="Lschat-contentWrap me-lg-1 ms-lg-0">
                            <div className="tab-content">
                                {
                                    state.allow_chat == 1 ?
                                        <div className="tab-pane fade show active" id="pills-comment" role="tabpanel" aria-labelledby="pills-comment-tab">
                                            <div className="livechatBox">                    
                                                <Chat {...props} finish={state.streamleave} deleteAll={true} streamId={state.streamingId} custom_url={state.custom_url} />
                                            </div>
                                        </div>
                                    : null
                                }
                                <div className={`tab-pane${state.allow_chat != 1 ? " fade show active" : ""}`} id="pills-banner" role="tabpanel" aria-labelledby="pills-banner-tab">
                                   <div className="lsBanner-wrap">
                                        <div className="ls_sdTitle">
                                            <div className="title">{props.t("Banners")}</div>
                                        </div>
                                        <div className="lsBanner-component">
                                            <div className="lsBannerList mt-2">
                                                <div className="lsBanner-content scrollcustom">
                                                    {
                                                        state.banners.map(banner => {
                                                            return (
                                                                banner.banner_id == state.editBanner ? 
                                                                <div key={banner.banner_id} className="addBnr mt-3 edit-banner pb-3">
                                                                    <textarea className={`form-control${state.editBannerText && state.editBannerText.length > 200 && !state.editBannerTicker ? " ft-red" : (state.editBannerText && state.editBannerText.length > 1000 && state.editBannerTicker ? " ft-red" : "")}`} style={{height:state.editTextAreaHeight ? state.editTextAreaHeight : "70px"}} type="text" value={state.editBannerText ? state.editBannerText : ""} onChange={(e) => {
                                                                        let height = parseInt(`${e.target.scrollHeight}`);
                                                                        let isCheckBoxChecked = state.editBannerTicker
                                                                        if(isCheckBoxChecked){
                                                                            if(e.target.value && e.target.value.length > 1000){
                                                                                return;
                                                                            }
                                                                        }else{
                                                                            if(e.target.value && e.target.value.length > 200){
                                                                                return;
                                                                            }
                                                                        }
                                                                        if(height > 310){
                                                                            height = 310
                                                                        }else if(height < 70 || !e.target.value || e.target.value == ""){
                                                                            height = 70
                                                                        }
                                                                        setState({editBannerText:e.target.value,editTextAreaHeight:height+"px"})
                                                                    }} placeholder={props.t("")} />
                                                                    <div className={`floatR mt-2 mb-2${state.editBannerText && state.editBannerText.length > 200 && !state.editBannerTicker ? " ft-red" : (state.editBannerText && state.editBannerText.length > 1000 && state.editBannerTicker ? " ft-red" : "")}`}>{
                                                                        `${state.editBannerText ? state.editBannerText.length : 0}/${!state.editBannerTicker ? "200" : "1000"}`
                                                                    }</div>
                                                                    <div className="form-check mt-2">
                                                                        <input className="form-check-input" type="checkbox" value="1" checked={state.editBannerTicker} onChange={(e) => {
                                                                            setState({editBannerTicker:!state.editBannerTicker})
                                                                        }} id="flexCheckDefault" />
                                                                        <label className="form-check-label form-text" htmlFor="flexCheckDefault">
                                                                        {props.t("Scroll across bottom (ticker)")}
                                                                        </label>
                                                                    </div>
                                                                    <button className="mt-3" onClick={submitBanner}>{props.t(state.isEditBannerSaving ? "Saving..." : "Edit Banner")}</button>
                                                                    <a href="#" className="banner-close-btn" onClick={
                                                                        (e) => {
                                                                            e.preventDefault()
                                                                            setState({editBanner:0})
                                                                        }
                                                                    }>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>
                                                                    </a>
                                                                </div>
                                                                :
                                                                <div key={banner.banner_id} className={`lsBannerList-box${banner.show == 1 ? " active" : ""}`}>
                                                                    
                                                                    <div className="text">
                                                                        <div className="title">
                                                                            {banner.text}
                                                                        </div>
                                                                        {
                                                                            banner.ticker == 1 ? 
                                                                                <span className="inTicker">{props.t("Ticker")} </span>
                                                                            : null
                                                                        }
                                                                    </div>
                                                                    <div className="options">
                                                                        <a className="show-hide" onClick={(e) => {
                                                                            e.preventDefault();
                                                                            showHideBanner(banner.banner_id)
                                                                        }}>{banner.show == 1 ? props.t("Hide") : props.t("Show")}</a>
                                                                        {
                                                                            banner.show == 0 ? 
                                                                                <div className="edit-delete">
                                                                                    <a href="#" className="edit mr-3" onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    editBanner(banner.banner_id)
                                                                                }}>
                                                                                    Edit
                                                                                    </a>
                                                                                    <a href="#" className="delete" onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        deleteBanner(banner.banner_id)
                                                                                    }}>
                                                                                        Delete
                                                                                    </a>
                                                                                </div>
                                                                        : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                    
                                                    <div className="addBnr mt-3">
                                                        {
                                                            state.showAddBtn ? 
                                                            <React.Fragment>
                                                                <textarea className={`form-control${state.newBannerText && state.newBannerText.length > 200 && !state.isChecked ? " ft-red" : (state.newBannerText && state.newBannerText.length > 1000 && state.isChecked ? " ft-red" : "")}`} style={{height:state.textAreaHeight ? state.textAreaHeight : "70px"}} type="text" value={state.newBannerText ? state.newBannerText : ""} onChange={(e) => {
                                                                    let height = parseInt(`${e.target.scrollHeight}`);
                                                                    let isCheckBoxChecked = state.isChecked
                                                                    if(isCheckBoxChecked){
                                                                        if(e.target.value && e.target.value.length > 1000){
                                                                            return;
                                                                        }
                                                                    }else{
                                                                        if(e.target.value && e.target.value.length > 200){
                                                                            return;
                                                                        }
                                                                    }
                                                                    if(height > 310){
                                                                        height = 310
                                                                    }else if(height < 70 || !e.target.value || e.target.value == ""){
                                                                        height = 70
                                                                    }
                                                                    setState({newBannerText:e.target.value,textAreaHeight:height+"px"})
                                                                }} placeholder={props.t("Enter a banner..")} />
                                                                <div className={`floatR mt-2 mb-2${state.newBannerText && state.newBannerText.length > 200 && !state.isChecked ? " ft-red" : (state.newBannerText && state.newBannerText.length > 1000 && state.isChecked ? " ft-red" : "")}`}>{
                                                                    `${state.newBannerText ? state.newBannerText.length : 0}/${!state.isChecked ? "200" : "1000"}`
                                                                }</div>
                                                                <div className="form-check mt-2">
                                                                    <input className="form-check-input" type="checkbox" value="1" checked={state.isChecked} onChange={(e) => {
                                                                        setState({isChecked:!state.isChecked})
                                                                    }} id="flexCheckDefault" />
                                                                    <label className="form-check-label form-text" htmlFor="flexCheckDefault">
                                                                    {props.t("Scroll across bottom (ticker)")}
                                                                    </label>
                                                                </div>
                                                            </React.Fragment>
                                                        : null
                                                        }
                                                        {
                                                            state.showAddBtn ? 
                                                            <button className="mt-3" onClick={submitBanner}>{props.t(state.isBannerSaving ? "Saving..." : "Add Banner")}</button>
                                                        :
                                                            <button className="mt-3" onClick={e => {
                                                                    e.preventDefault()
                                                                    setState({showAddBtn:true,editBanner:false})
                                                                }
                                                            }>{props.t("Add Banner")}</button>
                                                        }
                                                        {
                                                            state.showAddBtn ? 
                                                                <a href="#" className="banner-close-btn" onClick={e => {
                                                                        e.preventDefault()
                                                                        setState({showAddBtn:false})
                                                                    }
                                                                }>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>
                                                                </a>
                                                        : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane" id="pills-brand" role="tabpanel" aria-labelledby="pills-brand-tab">
                                   <div className="lsBanner-wrap">
                                    <div className="ls_sdTitle">
                                        <div className="title">{props.t("Brands")}</div>
                                    </div>
                                    <div className="lsBanner-content scrollcustom">
                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{props.t("Background color")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.t("It's important to brand your broadcast. This color is used in your banners.")} >?</p>                                    
                                            </div>
                                            <div className="colorpick mt-2">
                                                <input type="color" value={state.backgroundColor ? state.backgroundColor : "#000000"} id="colorPicker" onChange={(e) => {
                                                    setState({backgroundColor:e.target.value});
                                                    updateBrands([{name:"background_color",value:e.target.value}]);
                                                }} />
                                            </div>
                                        </div>
                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{props.t("Text color")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.t("This color is used in your banners text.")}>?</p>                                    
                                            </div>
                                            <div className="colorpick mt-2">
                                                <input type="color" id="colorPicker2" value={state.textColor ? state.textColor : "#ffffff"} onChange={(e) => {
                                                    setState({textColor:e.target.value});
                                                    updateBrands([{name:"text_color",value:e.target.value}]);
                                                }} />
                                            </div>
                                        </div>

                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{props.t("Theme")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.t("Choose the style that fits your brand. This will affect banners.")}>?</p>                                    
                                            </div>
                                            <div className="themepick mt-2">
                                               <div onClick={() => {
                                                   let brand = {...state.brands}
                                                   brand.theme = "default"
                                                   setState({brands:brand})
                                                   updateBrands([{name:"theme",value:"default"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${state.brands.theme == "default" ? " active" : ""}`}>
                                                   <div className="lsThemeOption-default d-flex align-items-center justify-content-center" style={{background:state.backgroundColor,color:state.textColor}}>
                                                       {props.t("Default")}
                                                   </div>
                                               </div>
                                               <div onClick={() => {
                                                   let brand = {...state.brands}
                                                   brand.theme = "minimal"
                                                   setState({brands:brand})
                                                   updateBrands([{name:"theme",value:"minimal"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${state.brands.theme == "minimal" ? " active" : ""}`}>
                                                <div className="lsThemeOption-minimal d-flex align-items-center justify-content-center" style={{backgroundColor:state.backgroundColor,color:state.textColor}}>
                                                    {props.t("Minimal")}
                                                </div>
                                            </div>
                                            <div onClick={() => {
                                                   let brand = {...state.brands}
                                                   brand.theme = "bubble"
                                                   setState({brands:brand})
                                                   updateBrands([{name:"theme",value:"bubble"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${state.brands.theme == "bubble" ? " active" : ""}`}>
                                                <div className="lsThemeOption-bubble d-flex align-items-center justify-content-center" style={{background:state.backgroundColor,color:state.textColor}}>
                                                    {props.t("Bubble")}
                                                </div>
                                            </div>
                                            <div onClick={() => {
                                                   let brand = {...state.brands}
                                                   brand.theme = "block"
                                                   setState({brands:brand})
                                                   updateBrands([{name:"theme",value:"block"}]);
                                               }} className={`lsThemeOption d-flex align-items-center${state.brands.theme == "block" ? " active" : ""}`}>
                                                <div className="lsThemeOption-block d-flex align-items-center justify-content-center" style={{background:state.backgroundColor,color:state.textColor}}>
                                                    {props.t("Block")}
                                                </div>
                                            </div>
                                            </div>
                                        </div>

                                        <div className="lsBanner-component my-4">
                                            <div className="lsBanner-component-title">
                                                <h4>{props.t("Logo")}</h4>                                                        
                                                <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.t("Adding your logo to the broadcast makes you look like a pro. Plus, it's great marketing if people are sharing your streams! Try using a PNG with a transparent background.Recommended size: 200 x 200.")}>?</p>                                    
                                            </div>
                                            <div className="logopick mt-2">
                                                <div className="lsLogoOptions">
                                                    
                                                    {
                                                        state.brands.logo ? 
                                                            <div className={`lsLogoOptions-box${state.brands.logo_active == 1 ? " active" : ""}`}>
                                                                <img src={props.pageData.imageSuffix+state.brands.logo} className="img-fluid" onClick={(e) => {
                                                                    let brand = {...state.brands}
                                                                    brand.logo_active = state.brands.logo_active == 1 ? 0 : 1
                                                                    setState({brands:brand})
                                                                    logoOverlayInactive('logo');
                                                                }} />
                                                                <a href="#" onClick={(e) =>  {
                                                                    e.preventDefault();
                                                                    removeBrandLogoOverlay('logo');
                                                                    let brand = {...state.brands}
                                                                    brand.logo = null
                                                                    setState({brands:brand})
                                                                }}>
                                                                    Delete
                                                                </a>
                                                            </div>
                                                    :
                                                            <div className="lsLogoOptions-box addlogobtn" onClick={(e) => {
                                                                inputFileLogo.current.click()
                                                            }}>
                                                                <input type="file" ref={inputFileLogo} accept="image/*" onChange={(e) => {
                                                                    setFile(e.target.files,"logo")
                                                                }} style={{display:"none"}} />
                                                                <i className="fas fa-plus"></i>
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="logopick mt-2">
                                                <div className="lsBanner-component-title">
                                                    <h4>{props.t("Overlay")}</h4>                                                        
                                                    <p className="quetsn" data-bs-toggle="tooltip" data-bs-placement="bottom" title={props.t("Overlays are custom graphics on top of your stream. Use a PNG with a transparent background so you don't cover yourself.Recommended size: 1280 x 720.")}>?</p>                                    
                                                </div>
                                                <div className="overlaypick mt-2">
                                                    <div className="lsLogoOptions">
                                                        {
                                                            state.brands.overlay ? 
                                                            <div className={`lsLogoOptions-box${state.brands.overlay_active == 1 ? " active" : ""}`}>
                                                                <img src={props.pageData.imageSuffix+state.brands.overlay} className="img-fluid" onClick={(e) => {
                                                                    let brand = {...state.brands}
                                                                    brand.overlay_active = state.brands.overlay_active == 1 ? 0 : 1
                                                                    setState({brands:brand})
                                                                    logoOverlayInactive('overlay');
                                                                }}  />
                                                                <a href="#" onClick={(e) =>  {
                                                                        e.preventDefault();
                                                                        removeBrandLogoOverlay('overlay');
                                                                        let brand = {...state.brands}
                                                                        brand.overlay = null
                                                                        setState({brands:brand})
                                                                    }}>
                                                                        Delete
                                                                </a>
                                                            </div>
                                                        :
                                                            <div className="lsLogoOptions-box addlogobtn" onClick={(e) => {
                                                                inputFileOverlay.current.click()
                                                            }}>
                                                                <input type="file" ref={inputFileOverlay} accept="image/*" onChange={(e) => {
                                                                    setFile(e.target.files,"overlay")
                                                                }} style={{display:"none"}} />
                                                                <i className="fas fa-plus"></i>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        
                                        <div className="lsBannerList mt-2">
                                            <div className="lsBannerList-content">
                                                <div className="addBnr mt-3">
                                                    <input className="form-control form-control-sm" type="url" onChange={(e) => {
                                                        let brand = {...state.brands}
                                                        brand.redirect_url = e.target.value
                                                        setState({brands:brand})
                                                    }} value={state.brands.redirect_url ? state.brands.redirect_url : ""} placeholder={props.t("Enter Redirect URL")} />
                                                    <button className="mt-3" onClick={() => {
                                                        if(state.brands.redirect_url)
                                                            updateBrands([{name:"redirect_url",value:state.brands.redirect_url}]);
                                                    }}>{props.t("Add URL")}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>   

                }
            </div>
            </React.Fragment>
        )
    }

export default Index