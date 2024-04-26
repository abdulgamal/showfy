import React,{useReducer,useEffect,useRef} from 'react'
import Artist from '../Artist/Item'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Search from "../Search/Index"
import Translate from "../../components/Translate/Index"

const Browse = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            artists:props.pageData.artists,
            page:2,
            type:"artist",
            pagging:props.pageData.pagging,
            loading:false,
            searchType:"creation_date"
        }
    );
    const stateRef = useRef();
    stateRef.current = state.artists
    useEffect(() => {
        if (props.pageData.artists && props.pageData.artists != state.artists) {
             setState({ artists: props.pageData.artists, pagging: props.pageData.pagging, page: 2 })
        }
    },[props.pageData.artists])
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
            if(type == state.type+"s"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const artists = [...stateRef.current]
                    const changedItem = artists[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    setState({artists:artists})
                }
            }
        });
        props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == state.type+"s"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const artists = [...stateRef.current]
                    const changedItem = artists[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    setState({artists:artists})
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
            if(itemType == state.type+"s"){
                const itemIndex = getItemIndex(itemId)
                if(itemIndex > -1){
                    const artists = [...stateRef.current]
                    const changedItem = artists[itemIndex]
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
                    setState({artists:artists})
                }
            }
        });
    },[])
   
    const getItemIndex = (item_id) => {
        if(state.artists){
            const artists = [...state.artists];
            const itemIndex = artists.findIndex(p => p["artist_id"] == item_id);
            return itemIndex;
        }
        return -1;
    }
    
    const refreshContent = () => {
        setState({page:1,artists:[]})
        loadMoreContent()
    }
   
    const loadMoreContent = (values) => {
        setState({loading:true})
        let formData = new FormData();        
        formData.append('page',state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = `/artists-browse`;
        formData.append('type',`${props.pageData.artistType}`)
        let queryString = ""
        if(props.pageData.search){
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
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
        let artists = state.artists.map(item => {
            return  <div key={item.artist_id} className="gridColumn">
                        <Artist  key={item.artist_id} artists={item} {...props} />
                    </div>
        })
        return(
            <React.Fragment>
                    <div className="user-area">
                        <div className="container">
                            <Search  {...props} type="artist" subtype={`${props.pageData.artistType}`}/>
                        </div>
                                <InfiniteScroll
                                    dataLength={state.artists.length}
                                    next={loadMoreContent}
                                    hasMore={state.pagging}
                                    loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.artists.length}  />}
                                    endMessage={
                                        <EndContent {...props} text={Translate(props,"No artists found.")} itemCount={state.artists.length} />
                                    }
                                    pullDownToRefresh={false}
                                    pullDownToRefreshContent={<Release release={false} {...props} />}
                                    releaseToRefreshContent={<Release release={true} {...props} />}
                                    refreshFunction={refreshContent}
                                >
                                    <div className="container">
                                        <div className="gridContainer gridArtist">
                                            {artists}
                                        </div>
                                    </div>
                                </InfiniteScroll>
                    </div>
            </React.Fragment>
        )
}



  
export default Browse