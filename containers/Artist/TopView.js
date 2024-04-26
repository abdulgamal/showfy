import React,{useReducer,useEffect,useRef} from 'react'

import Image from "../Image/Index"
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"

const TopView = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            artist: props.artist
        }
    );
    const stateRef = useRef();
    stateRef.current = state.artist
    useEffect(() => {
        props.socket.on('ratedItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let Statustype = socketdata.type
            let rating = socketdata.rating
            if (id == state.artist.artist_id && type == "artists") {
                const data = {...stateRef.current}
                data.rating = rating
                setState({ artist: data })
            }
        });
        props.socket.on('unfavouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == "artists") {
                if (state.artist.artist_id == id) {
                    const changedItem = { ...stateRef.current }
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    setState({ artist: changedItem })
                }
            }
        });
        props.socket.on('favouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == "artists") {
                if (state.artist.artist_id == id) {
                    const changedItem = { ...stateRef.current }
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    setState({ artist: changedItem })
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
            if (itemType == "artists") {
                if (state.artist.artist_id == itemId) {
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
                    setState({ artist: changedItem })
                }
            }
        });
    },[])
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12 position-relative">
                        <div className="channelInfo-wrap artistDetailsWrap">
                            <div className="playlist-profile-img">
                                <Image title={state.artist.title} width="170" height="170" image={state.artist.image} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                            </div>
                            <div className="playList-profileRight">
                            <div className="playlist-profile-title">
                                <h4>{Translate(props,state.artist.title) + " "} {
                                    state.artist.verified ?
                                        <span className="verifiedUser" title={Translate(props, "verified")}><span className="material-icons" data-icon="check"></span>
                                        </span>
                                        : null
                                }</h4>
                            </div>
                            
                            <div className="LikeDislikeWrap">
                                <ul className="LikeDislikeList">
                                    <li> 
                                        <Like  {...props} icon={true} like_count={state.artist.like_count} item={state.artist} parentType={state.artist.type} type="artist" id={state.artist.artist_id} />{"  "}
                                    </li>
                                    <li>
                                        <Dislike  {...props} icon={true} dislike_count={state.artist.dislike_count} item={state.artist} parentType={state.artist.type} type="artist" id={state.artist.artist_id} />{"  "}
                                    </li>
                                    <li>
                                        <Favourite  {...props} icon={true} favourite_count={state.artist.favourite_count} item={state.artist} parentType={state.artist.type} type="artist" id={state.artist.artist_id} />{"  "}
                                    </li>
                                    <SocialShare {...props} hideTitle={true} buttonHeightWidth="30" url={`/artist/${state.artist.custom_url}`} title={CensorWord("fn",props,Translate(props,state.artist.title))} imageSuffix={props.pageData.imageSuffix} media={state.artist.image} />
                                </ul>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
}

export default TopView