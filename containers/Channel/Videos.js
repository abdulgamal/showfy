import React,{useReducer,useEffect,useRef} from 'react'
import {  useDispatch } from "react-redux";
import { openToast } from "../../store/reducers/toast";
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import VideoItem from "../Video/Item"
import Translate from "../../components/Translate/Index"

const  Videos = (props) =>{
    const dispatch = useDispatch()
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page:2,
            videos:props.videos,
            pagging:props.pagging
        }
    );

    const stateRef = useRef();
    stateRef.current = state.videos
    useEffect(() => {
        if ((props.videos && props.videos != state.videos)) {
            setState({ videos: props.videos,pagging: props.pagging,page:2  })
        }
    },[props.videos])
    

    const getItemIndex = (item_id) => {
        const videos = [...state.videos];
        const itemIndex = videos.findIndex(p => p["video_id"] == item_id);
        return itemIndex;
    }
    useEffect(() => {
        props.socket.on('removeScheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.scheduled_video_id = null
                }
                items[itemIndex] = changedItem
                setState({ videos: items })
            }
        });
        props.socket.on('scheduledVideo', data => {
            let id = data.id
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.scheduled_video_id = 1
                }
                items[itemIndex] = changedItem
                setState({ videos: items })
            }
        });
        props.socket.on('videoDeleted',data => {
            let id = data.video_id
            const itemIndex = getItemIndex(id)
            if(itemIndex > -1){
                const items = [...stateRef.current]
                items.splice(itemIndex, 1);
                setState({videos:items})
            }
        });
        props.socket.on('unwatchlater',data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if(itemIndex > -1){
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                    changedItem.watchlater_id = null
                }
                items[itemIndex] = changedItem
                setState({videos:items})
            }
        });
        props.socket.on('watchlater',data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if(itemIndex > -1){
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                    changedItem.watchlater_id = 1
                }
                items[itemIndex] = changedItem
                setState({videos:items})
            }
        });
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "videos") {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                setState({ videos: items })
            }
        });

        props.socket.on('unfavouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "videos"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    setState({videos:items})
                }
            }
        });
        props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "videos"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    setState({videos:items})
                }
            }
        });


        props.socket.on('likeDislike',data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId =  data.ownerId
            let removeLike  = data.removeLike
            let removeDislike  = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike =  data.insertDislike
            if(itemType == "videos"){
                const itemIndex = getItemIndex(itemId)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    let loggedInUserDetails = {}
                    if(props.pageData && props.pageData.loggedInUserDetails){
                        loggedInUserDetails = props.pageData.loggedInUserDetails
                    }
                    if(removeLike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if(removeDislike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if(insertLike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if(insertDislike){
                        if(loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    items[itemIndex] = changedItem
                    setState({videos:items})
                }
            }
        });

        if(props.channel_id){
            props.socket.on('channelVideoDeleted',data => {
                let channel_id = data.channel_id
                let message = data.message
                let video_id = data.video_id
                if(channel_id == props.channel_id){
                    const itemIndex = getItemIndex(video_id)
                    if(itemIndex > -1){
                        const videos = [...stateRef.current]
                        videos.splice(itemIndex, 1);
                        setState({videos:videos})
                        dispatch(openToast({message:Translate(props,message),type:'success'}))
                    }
                }
            });
        }

    },[])
    const refreshContent = () => {
        setState({page:1,videos:[]})
        loadMoreContent()
    }
    
    const loadMoreContent = () => {
        setState({loading:true})
        let formData = new FormData();        
        formData.append('page',state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = ""
        if(props.channel_id){
            formData.append('channel_id',props.channel_id)
             url = `/channels/videos`;
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.videos){
                let pagging = response.data.pagging
                setState({page:state.page+1,pagging:pagging,videos:[...state.videos,...response.data.videos],loading:false})
            }else{
                setState({loading:false})
            }
        }).catch(err => {
            setState({loading:false})
        });

    }
        
        return (
            <InfiniteScroll
                        dataLength={state.videos.length}
                        next={loadMoreContent}
                        hasMore={state.pagging}
                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.videos.length} />}
                        endMessage={
                            <EndContent {...props} text={Translate(props,'No video created in this channel yet.')} itemCount={state.videos.length} />
                        }
                        pullDownToRefresh={false}
                        pullDownToRefreshContent={<Release release={false} {...props} />}
                        releaseToRefreshContent={<Release release={true} {...props} />}
                        refreshFunction={refreshContent}
                    >
                        <div className="">
                                <div className="gridContainer gridVideo">
                                {
                                    state.videos.map(video => {
                                        return (
                                            <div key={video.video_id} className="gridColumn">
                                                <VideoItem channel_id={props.channel_id} canDelete={props.canDelete} {...props} video={video} {...video}  />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
            </InfiniteScroll>
        )
    }


export default Videos