import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index"
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import Link from "../../components/Link/index"
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"

const TopView = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            playlist: props.playlist
        }
    );
    const stateRef = useRef();
    stateRef.current = state.playlist
    useEffect(() => {
        if(props.playlist != state.playlist){
            setState({playlist:props.playlist})
        }
    },[props])
    
    useEffect(() => {
        props.socket.on('ratedItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let Statustype = socketdata.type
            let rating = socketdata.rating
            if (id == stateRef.current.playlist_id && type == "playlists") {
                const data = {...stateRef.current}
                data.rating = rating
                setState({ playlist: data })
            }
        });
        props.socket.on('unfavouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == "playlists") {
                if (stateRef.current.playlist_id == id) {
                    const changedItem = { ...stateRef.current }
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    setState({ playlist: changedItem })
                }
            }
        });
        props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "playlists") {
                if (stateRef.current.playlist_id == id) {
                    const changedItem = { ...stateRef.current }
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    setState({ playlist: changedItem })
                }
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
            if (itemType == "playlists") {
                if (stateRef.current.playlist_id == itemId) {
                    const changedItem = { ...stateRef.current }
                    let loggedInUserDetails = {}
                    if (props.pageData && props.pageData.loggedInUserDetails) {
                        loggedInUserDetails = props.pageData.loggedInUserDetails
                    }
                    if (removeLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if (removeDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if (insertLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if (insertDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    setState({ playlist: changedItem })
                }
            }
        });
    },[])
    const openReport = (e) => {
        e.preventDefault()
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            props.openReport({status:true, id:state.playlist.custom_url, type:'playlists'})
        }
    }
        let mainPhoto = null
        if (state.playlist.image) {
            mainPhoto = props.pageData.imageSuffix + state.playlist.image
        } else {
            mainPhoto = props.pageData.imageSuffix + props.pageData.appSettings["playlist_default_photo"]
        }
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12 position-relative">
                        <div className="channelInfo-wrap">
                            <div className="playlist-profile-img">
                                <Image title={CensorWord("fn",props,state.playlist.title)} width="170" height="170" image={mainPhoto} imageSuffix={props.pageData.imageSuffix}  siteURL={props.pageData.siteURL} />
                            </div>
                            <div className="playlist-profile-title">
                                <h4><CensorWord {...props} text={state.playlist.title} />{" "} {
                                    state.playlist.verified ?
                                        <span className="verifiedUser" title={Translate(props, "verified")}><span className="material-icons" data-icon="check"></span>
                                        </span>
                                        : null
                                }</h4>
                                <div className="ChannelMoreinfo">

                                    {
                                        props.pageData.appSettings['playlist_featured'] == 1 && state.playlist.is_featured == 1 ?
                                            <span className="lbl-Featured" title={Translate(props, "Featured Playlist")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                            </span>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings['playlist_sponsored'] == 1 && state.playlist.is_sponsored == 1 ?
                                            <span className="lbl-Sponsored" title={Translate(props, "Sponsored Playlist")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                            </span>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings['playlist_hot'] == 1 && state.playlist.is_hot == 1 ?
                                            <span className="lbl-Hot" title={Translate(props, "Hot Playlist")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                            </span>
                                            : null
                                    }
                                </div>
                            </div>

                            

                                    <div className="LikeDislikeWrap">
                                         <ul className="LikeDislikeList">
                                    {
                                        props.pageData.appSettings[`${"playlist_like"}`] == 1  && state.playlist.approve == 1 ?
                                            <li>
                                                <Like {...props} icon={true} like_count={state.playlist.like_count} item={state.playlist} parentType={state.playlist.type} type="playlist" id={state.playlist.playlist_id} />
                                            </li>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings[`${"playlist_dislike"}`] == 1  && state.playlist.approve == 1 ?
                                            <li>
                                                <Dislike {...props} icon={true}  dislike_count={state.playlist.dislike_count} item={state.playlist} parentType={state.playlist.type} type="playlist" id={state.playlist.playlist_id} />
                                            </li>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings[`${"playlist_favourite"}`] == 1  && state.playlist.approve == 1 ?
                                            <li>
                                                <Favourite {...props} icon={true}  favourite_count={state.playlist.favourite_count} item={state.playlist} parentType={state.playlist.type} type="playlist" id={state.playlist.playlist_id} />
                                            </li>
                                            : null
                                    }
                                    {
                                    state.playlist.approve == 1 ? 
                                        <SocialShare {...props} hideTitle={true} tags={state.playlist.tags} url={`/playlist/${state.playlist.custom_url}`} title={state.playlist.title} imageSuffix="" media={mainPhoto} />
                                    : null
                                    }
                                    
                                    
                                    <li>
                                        <div className="dropdown TitleRightDropdown">
                                            <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                            <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                 {
                                                    state.playlist.canEdit ?
                                                    <li>
                                                        <Link href="/create-playlist" customParam={`id=${state.playlist.custom_url}`} as={`/create-playlist/${state.playlist.custom_url}`}>
                                                            <a href={`/create-playlist/${state.playlist.custom_url}`}><span className="material-icons" data-icon="edit"></span>{Translate(props, "Edit")}</a>
                                                        </Link>
                                                    </li>
                                                        : null
                                                }
                                                {
                                                    state.playlist.canDelete ?
                                                    <li>
                                                        <a onClick={props.deletePlaylist} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(props, "Delete")}</a>
                                                    </li>
                                                        : null
                                                }
                                                {
                                                     state.playlist.approve == 1 && !state.playlist.canEdit ? 
                                                
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
                                </ul>
                            </div>

                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }


export default TopView