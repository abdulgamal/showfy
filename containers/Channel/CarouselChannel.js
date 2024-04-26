import React,{useReducer,useEffect,useRef} from 'react'

import Item from "./Item"
import Translate from "../../components/Translate/Index"
import dynamic from 'next/dynamic'
const Carousel = dynamic(() => import("../Slider/Index"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="heading shimmer"></div>
        <div className="grid">
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
            <div className="item shimmer"></div>
        </div>
    </div>
});
import Link from "../../components/Link"
const CarouselChannel = (props) => {
  
    
const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
        channels: props.channels,
        key: 1,
    }
);

const stateRef = useRef();
    stateRef.current = state.channels
    useEffect(() =>{
        if (props.channels != state.channels) {
            setState({ channels: props.channels })
        }
    },[props.channels])

 
    useEffect(() =>{
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...stateRef.current]
                const changedItem = { ...items[itemIndex] }
                changedItem.rating = rating
                items[itemIndex] = changedItem
                setState({ channels: items })
            }
        });
        props.socket.on('unfollowUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...stateRef.current]
                const changedItem = { ...items[itemIndex] }
                if (id == changedItem.channel_id) {
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.follower_id = null
                    }
                    changedItem.follow_count = (changedItem.follow_count ? changedItem.follow_count : 0) - 1
                    items[itemIndex] = changedItem
                    setState({ channels: items })
                }
            }
        });
        props.socket.on('followUser', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...stateRef.current]
                const changedItem = { ...items[itemIndex] }
                if (id == changedItem.channel_id) {
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.follower_id = 1
                    }
                    changedItem.follow_count = (changedItem.follow_count ? changedItem.follow_count : 0) + 1
                    items[itemIndex] = changedItem
                    setState({ channels: items })
                }
            }
        });
        props.socket.on('channelDeleted', data => {
            let id = data.channel_id
            if (type == "channels") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const channels = [...stateRef.current]
                    channels.splice(itemIndex, 1);
                    setState({ channels: channels })
                }
            }
        })
        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "channels") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = { ...items[itemIndex] }
                    changedItem.favourite_count = parseInt(changedItem.favourite_count) - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    setState({ channels: items })
                }
            }
        });
        props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == "channels") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = { ...items[itemIndex] }
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    setState({ channels: items })
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
            if (itemType == "channels") {
                const itemIndex = getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = { ...items[itemIndex] }
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
                    items[itemIndex] = changedItem
                    setState({ channels: items })
                }
            }
        });
    })
    const getItemIndex = (item_id) => {
        if (state.channels) {
            const items = [...state.channels];
            const itemIndex = items.findIndex(p => p.channel_id == item_id);
            return itemIndex;
        } else {
            return -1;
        }
    }
    

        if (!state.channels || !state.channels.length) {
            return null
        }
       
        const content = state.channels.map(result => {
            return <div  key={result.channel_id}><Item {...props} {...result} channel={result} /></div>
        })

        return (
            <div className="VideoRoWrap">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="titleWrap">
                                {
                                props.pageData.themeType == 2 && props.seemore && ( props.type || props.sort ) ?
                                <Link href={`/channels?${props.type ? "type" : "sort"}=${props.type ? props.type : props.sort}`}>
                                    <a className="link">
                                        <span className="title">
                                            <React.Fragment>
                                                {
                                                    props.headerTitle ? 
                                                        props.headerTitle : 
                                                        null
                                                }
                                                {Translate(props,props.title)}
                                            </React.Fragment>
                                        </span>
                                    </a>
                                    </Link>
                                :
                                    <span className="title">
                                        <React.Fragment>
                                            {
                                                props.headerTitle ?
                                                    props.headerTitle :
                                                    null
                                            }
                                            {Translate(props, props.title ? props.title : `Related Channels`)}
                                        </React.Fragment>
                                    </span>
                                }
                                {
                                    props.seemore && state.channels.length > 4 ?
                                        <Link href={`/channels?${props.type ? "type" : "sort"}=${props.type ? props.type : props.sort}`}>
                                            <a className="seemore_link">
                                                {Translate(props, "See more")}
                                            </a>
                                        </Link>
                                        : null
                                }

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                <Carousel {...props} items={content} carouselType="channel" itemAt1024={props.pageData.themeType == 2 ? 4 : 3} itemAt600={props.pageData.themeType == 2 ? 3 : 2} itemAt480={props.pageData.themeType == 2 ? 2 : 1}  />
                            }
                        </div>
                    </div>


                </div>
            </div>
        )
    }



export default CarouselChannel