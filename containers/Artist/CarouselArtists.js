import React,{useReducer,useEffect,useRef} from 'react'
import Item from "./Item"
import Translate from "../../components/Translate/Index"

import Link from "../../components/Link/index"
const CarouselArtist = (props) => {
  
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            artists: props.artists
        }
    );
    const stateRef = useRef();
    stateRef.current = state.artists
    useEffect(() => {
        if (props.artists && props.artists != state.artists) {
            setState({ artists: props.artists })
        }
    },[props.artists])
    useEffect(() => {
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "artists") {
                const items = [...stateRef.current]
                const changedItem = items[itemIndex]
                changedItem.rating = rating
                setState({ artists: items })
            }
        });
        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "artists") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    setState({ artists: items })
                }
            }
        });
        props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "artists") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    setState({ artists: items })
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
            if (itemType == "artists") {
                const itemIndex = getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
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
                    setState({ artists: items })
                }
            }
        });
    },[])
   
    const getItemIndex = (item_id) => {
        if (state.artists) {
            const items = [...state.artists];
            const itemIndex = items.findIndex(p => p.artist_id == item_id);
            return itemIndex;
        }
        return -1;
    }

        if (!state.artists || !state.artists.length) {
            return null
        }


        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="titleWrap">
                                <span className="title">
                                    <React.Fragment>
                                        {
                                            props.headerTitle ?
                                                props.headerTitle :
                                                null
                                        }
                                        {Translate(props, props.title ? props.title : `Related Artists`)}
                                    </React.Fragment>
                                </span>
                                {
                                    props.seemore && state.artists.length > 3 ?
                                        <Link href="/artists" customParam={`artistType=${props.type}`} as={`/artists/${props.type}`}>
                                            <a className="seemore_link">
                                                {Translate(props, "See more")}
                                            </a>
                                        </Link>
                                        : null
                                }

                            </div>
                        </div>
                    </div>
                    <div className="gridContainer gridArtist">
                        {

                            state.artists.map(result => {
                                return <div key={result.artist_id} className="gridColumn"><Item  {...props} {...result} artists={result} /></div>
                            })
                        }
                    </div>
                </div>
            </div>
        )
}


export default CarouselArtist