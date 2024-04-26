import React,{useReducer,useEffect,useRef} from 'react'
import { useSelector } from "react-redux";

import Link from "../../components/Link/index";
import Image from "../Image/Index"
import UserTitle from "../User/Title"
import axios from "../../axios-orders"

const Player = (props) => {
    let reduxStateAudio = useSelector((state) => {
        return state.audio.audios;
    });
    let reduxStateSongId = useSelector((state) => {
        return state.audio.song_id;
    });
    let reduxStatePauseSongId = useSelector((state) => {
        return state.audio.pausesong_id;
    });
    const audioTag = useRef(null)
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            audios:reduxStateAudio,
            width:props.isMobile ? props.isMobile : 993,
            song_id:reduxStateSongId,
            minimizePlayer:false,
            pausesong_id:reduxStatePauseSongId,
            currentTime: null,
            playCount:[],
            passwords:props.pageData &&  props.pageData.audioPassword ? props.pageData.audioPassword : []
        }
    );

    const updateWindowDimensions = () => {
        setState({ width: window.innerWidth });
    }
    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);

        return () => window.removeEventListener('resize', updateWindowDimensions);
    },[])
    
    const closePlayer = (e) => {
        e.preventDefault()
        props.updateAudioData({audios:[], song_id:0,pausesong_id:0})
        return
        swal({
            title: state.title,
            text: state.message,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                props.updateAudioData({audios:[], song_id:0,pausesong_id:0})
            } else {

            }
        });
    }
    const getItemIndex = (item_id) => {
        const audios = [...reduxStateAudio];
        const itemIndex = audios.findIndex(p => p["audio_id"] == item_id);
        return itemIndex;
    }
    
    const ended = () => {
        let song_id = reduxStateSongId
        let itemIndex = 0
        itemIndex = getItemIndex(song_id)
        if (itemIndex > -1) {
            const items = [...reduxStateAudio]
            if(itemIndex+2 <= reduxStateAudio.length){
                itemIndex = itemIndex + 1
            }else{
                itemIndex = 0
            }
            props.updateAudioData({audios:reduxStateAudio, song_id:items[itemIndex].audio_id,pausesong_id:0})
        }
    }
    const audioChange = (song_id,e) => {
        e.preventDefault();
        if(song_id != state.song_id){
            let itemIndex = getItemIndex(song_id)
            if (itemIndex > -1) {
                const items = [...state.audios]            
                setState({ song_id: items[itemIndex].audio_id,current_time:0 })
            }
        }
    }
    const previous = () => {
        let song_id = reduxStateSongId
        let itemIndex = 0
        itemIndex = getItemIndex(song_id)
        if (itemIndex > -1) {
            const items = [...reduxStateAudio]
            if(itemIndex == 0){
                itemIndex = reduxStateAudio.length - 1
            }else{
                itemIndex = itemIndex - 1
            }
            props.updateAudioData({audios:reduxStateAudio, song_id:items[itemIndex].audio_id,pausesong_id:0})
        }
    }
    const updateProgress  = ()  => {
        setState({ currentTime: audioTag.current.currentTime })
    }
    const formatDuration = (duration) => {
        if(isNaN(duration)){
            return "00:00"
        }
        duration = Math.floor(duration)
        let d = Number(duration);
        var h = Math.floor(d / 3600).toString();
        var m = Math.floor(d % 3600 / 60).toString();
        var s = Math.floor(d % 3600 % 60).toString();

        var hDisplay = h.length > 0 ? (h.length < 2 ? "0" + h : h) : "00"
        var mDisplay = m.length > 0 ? ":" + (m.length < 2 ? "0" + m : m) : ":00"
        var sDisplay = s.length > 0 ? ":" + (s.length < 2 ? "0" + s : s) : ":00"
        return (hDisplay != "00" ? hDisplay+mDisplay : mDisplay.replace(":",'')) + sDisplay
    }
    const playSong = () => {
        props.updateAudioData({audios:reduxStateAudio, song_id:reduxStateSongId,pausesong_id:0})
        audioTag.current.play();
    }
    const pauseSong = () => {
        props.updateAudioData({audios:reduxStateAudio, song_id:reduxStateSongId,pausesong_id:reduxStateSongId})
        audioTag.current.pause();
    }
    const toggleLoop  = () => {
        audioTag.current.loop = !audioTag.current.loop;
    }

    const playStart = () => {
        let currentPlayingSong = getItemIndex(reduxStateSongId)
        let audio = reduxStateAudio[currentPlayingSong];
        let sessionPassword = props.pageData && props.pageData.audioPassword ? props.pageData.audioPassword : []
        if(audio.view_privacy == "password" && sessionPassword.indexOf(reduxStateSongId) == -1 && !audio.passwords && ( !props.pageData.levelPermissions || props.pageData.levelPermissions["audio.view"] != 2 ) 
            && (!props.pageData.loggedInUserDetails || props.pageData.loggedInUserDetails.user_id != audio.owner_id)  
            
            ){
                audioTag.current.pause();
                setState({showPassword:true,popup_song_id:audio.audio_id})
                return;
        }
        if(state.playCount[reduxStateSongId]){
            return
        }
        let counts = [...state.playCount]
        counts[reduxStateSongId] = reduxStateSongId
        setState({playCount:counts})
        const formData = new FormData()
        formData.append('id', reduxStateSongId)
        const url = "/audio/play-count"
        axios.post(url, formData)
            .then(response => {
                
            }).catch(err => {
                
            });
    }
    const changeVolume = (e) => {
        let value = e.target.value
        audioTag.current.volume= parseInt(value)/10;
    }
    const closePopup = (e) => {
        setState({ showPassword: false})
    }
    const formSubmit = (e) => {
        e.preventDefault()
        if (!state.password || state.submitting) {
            return
        }
        let password = state.password
        
        const formData = new FormData();
        formData.append("password", password);
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let currentPlayingSong = getItemIndex(reduxStateSongId)
        let audio = reduxStateAudio[currentPlayingSong];
        let url = '/audio/password/' + audio.custom_url
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error[0].message, submitting: false });
                } else {
                    let passwords = state.passwords ? state.passwords : []
                    passwords[reduxStateSongId] = reduxStateSongId
                    setState({ submitting: false, error: null,password:"",showPassword:false,passwords:passwords })
                    
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });

    }
    const passwordValue = (e) => {
        setState({ password: e.target.value })
    }
    const audioSeekSet = (e) => {
        audioTag.current.currentTime = e.target.value
    }
    
        if(!reduxStateAudio || (!reduxStateAudio.length && !reduxStateAudio.length && !reduxStateSongId)){
            return null
        }
        let currentPlayingSong = getItemIndex(reduxStateSongId)
        let audio = reduxStateAudio[currentPlayingSong];
        let isS3 = true
        if (audio.audio_file) {
            const splitVal = audio.audio_file.split('/')
            if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isS3 = false
            }
        }
        if(reduxStateSongId == reduxStatePauseSongId){
            try{
                audioTag.current.pause();
            }catch(err){
                
            }
        }else{
            if(audioTag.current && audioTag.current.paused && !state.showPassword){
                if(audio.view_privacy != "password" || state.popup_song_id != audio.audio_id){
                    audioTag.current.play();
                }
            }
        }
        let password = null
        if(state.showPassword){
            password = <div className="popup_wrapper_cnt">
                            <div className="popup_cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{props.t("Enter Password")}</h2>
                                            <a onClick={closePopup} className="_close"><i></i></a>
                                        </div>
                                        <div className="user_wallet">
                                            <div className="row">
                                                <form onSubmit={formSubmit}>
                                                    <div className="form-group">
                                                        <input type="text" className="form-control" value={state.password ? state.password : ""} onChange={passwordValue} />
                                                        {
                                                            state.error ? 
                                                            <p className="error">
                                                                {
                                                                    state.error
                                                                }
                                                            </p>
                                                            : null
                                                        }
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="name" className="control-label"></label>
                                                        <button type="submit">{props.t("Submit")}</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
        }
        return (
            <React.Fragment>
            {
                password
            }
            <div className="playbar">
                <a href="#" className="close-mini-player" onClick={closePlayer}><span className="material-icons" data-icon="clear"></span></a>
                <ul className="controller">
                    {
                        reduxStateAudio && reduxStateAudio.length > 1 ? 
                            <li onClick={previous}>
                                <i className="fa fa-step-backward"></i>
                            </li>
                        : null
                    }
                    <li>
                    {
                        reduxStatePauseSongId == audio.audio_id ?
                            <i className="fas fa-play" onClick={playSong}></i>
                        :
                            <i className="fas fa-pause" onClick={pauseSong}></i>
                    }
                    </li>
                    {
                        reduxStateAudio.length > 1 ? 
                    <li onClick={ended}>
                        <i className="fa fa-step-forward"></i>
                    </li>
                    : null
                    }
                    <li className="volume" onClick={ toggleLoop }>
                        <input className="volume-bar" type="range" min="0" max="10" onChange={(e) => changeVolume(e)} />
                    </li>
                    <li className={ audioTag.current && audioTag.current.loop == true ? "active" : "" } onClick={ toggleLoop }>
                        <i className="fas fa-redo"></i>
                    </li>
                </ul>
                <audio id="audio" autoPlay preload="auto" ref={ audioTag }
                    src={(isS3 ? props.pageData.imageSuffix : "") + audio.audio_file}
                    type="audio/mpeg" style={{display:"none"}}
                    onTimeUpdate={ updateProgress }
                    onEnded={ ended }
                    onPlay={playStart}></audio>
                <ul className="progress">
                    <li className="currentTime">{formatDuration(audioTag.current ? audioTag.current.currentTime : 0)}</li>
                    {/* <progress value={audioTag ? audioTag.currentTime : 0} max={audio.duration}></progress> */}
                    <input type="range" max={audio.duration} name="rng" value={audioTag.current && audioTag.current.currentTime ? audioTag.current.currentTime : 0} min="0" step="0.25" onChange={audioSeekSet}></input>
                    <li>{formatDuration(Math.floor(audio.duration))}</li>
                </ul>
                <div className="track-info">
                    <div className="img">
                    <Link  href="/audio" customParam={`id=${audio.custom_url}`} as={`/audio/${audio.custom_url}`}>
                        <a className="trackName">
                            <Image height="30px" width="30px" image={audio.image} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                        </a>
                    </Link>
                    </div>
                    <div className="userTrackName">
                        <UserTitle childPrepend={true}  className="username" data={audio} ></UserTitle>
                        <Link  href="/audio" customParam={`id=${audio.custom_url}`} as={`/audio/${audio.custom_url}`}>
                            <a className="trackName">
                                {
                                    audio.title
                                }
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
            </React.Fragment>
        )
}

export default Player