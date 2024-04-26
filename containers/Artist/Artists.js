import React,{useReducer,useEffect,useRef} from 'react'
import axios from "../../axios-orders"

import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Item from "../Artist/Item"
import Translate from "../../components/Translate/Index"

const  Artists = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page:2,
            artists:props.artists,
            pagging:props.pagging
        }
    );
    const stateRef = useRef();
    stateRef.current = state.artists
    useEffect(() => {
        if (props.artists && props.artists != state.artists) {
            setState({artists: props.artists, pagging: props.pagging, page: 2})
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
        props.socket.on('unfavouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "artists"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    setState({artists:items})
                }
            }
        });
        props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "artists"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    setState({artists:items})
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
            if(itemType == "artists"){
                const itemIndex = getItemIndex(itemId)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
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
                    setState({artists:items})
                }
            }
        });
    },[])
    const getItemIndex = (item_id) => {
        if(state.artists){
            const artists = [...state.artists];
            const itemIndex = artists.findIndex(p => p["artist_id"] == item_id);
            return itemIndex;
        }else{
            return -1;
        }
    }
    
    const refreshContent = () => {
        setState({page:1,artists:[]})
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
        let url = "/videos/artists"
        if(props.channel_id){
            formData.append('channel_id',props.channel_id)
            url = `/channels/artists`;
        }else{
            formData.append('video_id',props.video_id)
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.artists){
                let pagging = response.data.pagging
                setState({page:state.page+1,pagging:pagging,artists:[...state.artists,...response.data.artists],loading:false})
            }else{
                setState({loading:false})
            }
        }).catch(err => {
            setState({loading:false})
        });
    }
        
        return (
            <InfiniteScroll
                        dataLength={state.artists.length}
                        next={loadMoreContent}
                        hasMore={state.pagging}
                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.artists.length} />}
                        endMessage={
                            <EndContent {...props} text={props.channel_id ? Translate(props,"No artist found for this channel.") : Translate(props,"No artist found for this video.")} itemCount={state.artists.length} />
                        }
                        pullDownToRefresh={false}
                        pullDownToRefreshContent={<Release release={false} {...props} />}
                        releaseToRefreshContent={<Release release={true} {...props} />}
                        refreshFunction={refreshContent}
                    >
                        <div className="gridContainer gridArtist">
                        {
                            state.artists.map(artist => {
                                return (
                                    <div key={artist.artist_id} className={'gridColumn'}>
                                        <Item {...props} artists={artist} {...artist}  />
                                    </div>
                                )
                            })
                        }
                        </div>                    
            </InfiniteScroll>
        )
} 

  
export default Artists