import React,{useReducer,useEffect,useRef} from 'react'
import Playlist from '../Playlist/Item'

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
            playlists: props.pageData.playlists,
            page: 2,
            type: "playlist",
            pagging: props.pageData.pagging,
            loading: false,
            searchType: "creation_date",
            search:props.search ? props.search : []
        }
    );
    const stateRef = useRef();
    stateRef.current = state.playlists
    useEffect(() => {
    if (props.pageData.playlists != state.playlists) {
        setState({ playlists: props.pageData.playlists, pagging: props.pageData.pagging, page: 2,search:props.search ? props.search : [] })
    }
    },[props])
   
    useEffect(() => {
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
                setState({ playlists: items })
            }
        });
        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == state.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const playlists = [...stateRef.current]
                    const changedItem = {...playlists[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    playlists[itemIndex] = changedItem
                    setState({ playlists: playlists })
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
                    const playlists = [...stateRef.current]
                    const changedItem = {...playlists[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    playlists[itemIndex] = changedItem
                    setState({ playlists: playlists })
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
                    const playlists = [...stateRef.current]
                    const changedItem = {...playlists[itemIndex]}
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
                    playlists[itemIndex] = changedItem
                    setState({ playlists: playlists })
                }
            }
        });
    },[])
    const getItemIndex = (item_id) => {
        const playlists = [...stateRef.current];
        const itemIndex = playlists.findIndex(p => p["playlist_id"] == item_id);
        return itemIndex;
    }

    const refreshContent = () => {
        setState({ page: 1, playlists: [] })
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
        let url = `/playlists-browse`;
        let queryString = ""
        if (props.pageData.search) {
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        }else if(props.globalSearch){
            queryString = Object.keys(state.search).map(key => key + '=' + state.search[key]).join('&');
            url = `/search/playlist?${queryString}`
        }

        axios.post(url, formData, config)
            .then(response => {
                if (response.data.playlists) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, playlists: [...state.playlists, ...response.data.playlists], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }
        let playlists = state.playlists.map(item => {
            return <div key={item.playlist_id} className="gridColumn">
                <Playlist {...props}  key={item.playlist_id} {...item} playlist={item} />
            </div>
        })
        return (
            <React.Fragment>
                {
                            !props.globalSearch ?
                    <div className="user-area">
                        {
                            !props.globalSearch ?
                                <div className="container">
                                    <Search {...props}  type="playlist" />
                                </div>
                                : null
                        }
                        <InfiniteScroll
                            dataLength={state.playlists.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.playlists.length} />}
                            endMessage={
                                <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No playlist found with your matching criteria.') : Translate(props,'No playlist created yet.')} itemCount={state.playlists.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className="container">
                                <div className="gridContainer gridPlaylist">
                                    {playlists}
                                </div>
                            </div>
                        </InfiniteScroll>
                        
                    </div>
                :
                <InfiniteScroll
                    dataLength={state.playlists.length}
                    next={loadMoreContent}
                    hasMore={state.pagging}
                    loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.playlists.length} />}
                    endMessage={
                        <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No playlist found with your matching criteria.') : Translate(props,'No playlist created yet.')} itemCount={state.playlists.length} />
                    }
                    pullDownToRefresh={false}
                    pullDownToRefreshContent={<Release release={false} {...props} />}
                    releaseToRefreshContent={<Release release={true} {...props} />}
                    refreshFunction={refreshContent}
                >
                    <div className="container">
                        <div className="gridContainer gridPlaylist">
                            {playlists}
                        </div>
                    </div>
                </InfiniteScroll>
                }
            </React.Fragment>
        )
    }
export default Browse