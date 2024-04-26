import React,{useReducer,useEffect,useRef} from 'react'
import Video from '../Video/Item'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Search from "../Search/Index"
import Translate from "../../components/Translate/Index";

const Browse = (props) => {

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            videos: props.pageData.videos ? props.pageData.videos : props.pageData.items.results,
            page: 2,
            pageType:props.pageData.pageType && props.pageData.pageType != "latest" ? props.pageData.pageType : "",
            liveStreamingPage:props.pageData.liveStreamingPage ? props.pageData.liveStreamingPage : null,
            type: "video",
            pagging: typeof props.pageData.pagging != "undefined" ? props.pageData.pagging : props.pageData.items.pagging,
            loading: false,
            searchType: "creation_date",
            search: props.search ? props.search : [],
            contentType:props.contentType,
        }
    );
    const stateRef = useRef();
    stateRef.current = state.videos
    useEffect(() => {
        if (props.videos && props.videos != state.videos) {
            setState({ videos: props.videos, pagging: false, page: 2, search: props.search ? props.search : [],pageType:props.pageType })
        }else if (props.pageData.videos && props.pageData.videos != state.videos) {
            setState({ videos: props.pageData.videos, pagging: props.pageData.pagging, page: 2, search: props.search ? props.search : [],pageType:props.pageData.pageType })
        } else if (props.pageData.videos && props.pageData.videos != state.videos) {
            setState({ videos: props.pageData.videos, pagging: props.pageData.pagging, page: 2, search: props.search ? props.search : [],pageType:props.pageData.pageType })
        }
    },[props])

   
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

        props.socket.on('videoDeleted', data => {
            let id = data.video_id
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const videos = [...stateRef.current]
                videos.splice(itemIndex, 1);
                setState({ videos: videos })
            }
        })
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType 
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == state.type + "s") {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                setState({ videos: items })
            }
        });
        props.socket.on('unwatchlater', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = null
                }
                items[itemIndex] = changedItem
                setState({ videos: items })
            }
        });
        props.socket.on('watchlater', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = 1
                }
                items[itemIndex] = changedItem
                setState({ videos: items })
            }
        });

        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == state.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const videos = [...stateRef.current]
                    const changedItem = {...videos[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    videos[itemIndex] = changedItem
                    setState({ videos: videos })
                }
            }
        });
        props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == state.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const videos = [...stateRef.current]
                    const changedItem = {...videos[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    videos[itemIndex] = changedItem
                    setState({ videos: videos })
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
            if (itemType == state.type + "s") {
                const itemIndex = getItemIndex(itemId)
                if (itemIndex > -1) {
                    const videos = [...stateRef.current]
                    const changedItem =  {...videos[itemIndex]};
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
                    videos[itemIndex] = changedItem
                    setState({ videos: videos })
                }
            }
        });
    },[])
    const getItemIndex = (item_id) => {
        const videos = [...stateRef.current];
        const itemIndex = videos.findIndex(p => p["video_id"] == item_id);
        return itemIndex;
    }

    const refreshContent = () => {
        setState({ page: 1, videos: [] })
        loadMoreContent()
    }
    const searchResults = (values) => {
        setState({ page: 1 })
        loadMoreContent(values)
    }
    const loadMoreContent = (values) => {

        setState({ loading: true })
        let formData = new FormData();
        formData.append('page', state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/videos-browse`;
        let queryString = ""
        if(state.pageType){
            formData.append("pageType",state.pageType)
        }
        if(state.liveStreamingPage){
            formData.append("liveStreamingPage",1);
        }
        if (props.pageData.search) {
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        } else if (props.globalSearch) {
            queryString = Object.keys(state.search).map(key => key + '=' + state.search[key]).join('&');
            url = `/search?${queryString}`
        }else if(props.contentType){
            formData.append('videoPurchased','1')
            formData.append('video_user_id',props.member.user_id)            
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.videos) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, videos: [...state.videos, ...response.data.videos], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }
    
        return (
            <React.Fragment>
                {
                    !props.globalSearch && !state.pageType ? 
                    <div className="user-area">
                        {
                            !props.globalSearch && !props.contentType ?
                                <div className="container">
                                    <Search {...props} liveStreamingPage={state.liveStreamingPage}  type="video" />
                                </div>
                                : null
                        }
                        <InfiniteScroll
                            dataLength={state.videos.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.videos.length} />}
                            endMessage={
                                <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No video found with your matching criteria.') : Translate(props,'No video found to display.')} itemCount={state.videos.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className="container">
                                <div className="gridContainer gridVideo">
                                    {
                                        state.videos.map(item => {
                                            return <div key={item.video_id} className="gridColumn">
                                                <Video {...props} key={item.video_id}  {...item} video={item}  />
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        </InfiniteScroll>      
                    </div>
                :
                <div className="cnt-videos">
                    <InfiniteScroll
                            dataLength={state.videos.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.videos.length} />}
                            endMessage={
                                <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No video found with your matching criteria.') : Translate(props,'No video found to display.')} itemCount={state.videos.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className="container">
                                <div className="gridContainer gridVideo">
                                    {
                                        state.videos.map(item => {
                                            return <div key={item.video_id} className={"gridColumn"}>
                                                <Video {...props} key={item.video_id}  {...item} video={item}  />
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                    </InfiniteScroll> 
                </div>
            }
            </React.Fragment>
        )
    }

export default Browse