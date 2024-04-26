import React,{useReducer,useEffect,useRef} from 'react'
import Channel from '../Channel/Item';
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
            channels:props.pageData.channels,
            page:2,
            type:"channel",
            pagging:props.pageData.pagging,
            loading:false,
            searchType:"creation_date"
        }
    );
    const stateRef = useRef();
    stateRef.current = state.channels
    useEffect(() => {
        if (props.pageData.channels && props.pageData.channels != state.channels) {
            setState({channels:props.pageData.channels,pagging:props.pageData.pagging,page:2})
        }
    },[props.pageData])
    
    useEffect(() => {
        
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "channels") {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                setState({ channels: items })
            }
        });
        props.socket.on('unfollowUser',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == state.type+"s"){   
                const itemIndex = getItemIndex(id)  
                if(itemIndex > -1){
                    const channels = [...stateRef.current]
                    const changedItem = {...channels[itemIndex]}
                    changedItem.follow_count = changedItem.follow_count - 1
                    if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.follower_id = null
                    }
                    channels[itemIndex] = changedItem
                    setState({channels:channels})
                }
            }
       });
       props.socket.on('followUser',data => {
           let id = data.itemId
           let type = data.itemType
           let ownerId = data.ownerId
           if(type == state.type+"s"){
              const itemIndex = getItemIndex(id)
              if(itemIndex > -1){
                const channels = [...stateRef.current]
                const changedItem = {...channels[itemIndex]}
                changedItem.follow_count =  changedItem.follow_count + 1
                if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                    changedItem.follower_id = 1
                }
                channels[itemIndex] = changedItem
                setState({channels:channels})
              }
           }
      });
        props.socket.on('unfavouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == state.type+"s"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const channels = [...stateRef.current]
                    const changedItem = {...channels[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    channels[itemIndex] = changedItem
                    setState({channels:channels})
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
                    const channels = [...stateRef.current]
                    const changedItem = {...channels[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    channels[itemIndex] = changedItem
                    setState({channels:channels})
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
                    const channels = [...stateRef.current]
                    const changedItem = {... channels[itemIndex]}
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
                    channels[itemIndex] = changedItem
                    setState({channels:channels})
                }
            }
        });
    },[])
    const getItemIndex = (item_id) => {
        if(state.channels){
            const channels = [...state.channels];
            const itemIndex = channels.findIndex(p => p["channel_id"] == item_id);
            return itemIndex;
        }
        return -1;
    }
    
    const refreshContent = () => {
        setState({page:1,channels:[]})
        loadMoreContent()
    }
    const searchResults = (values) => {
        setState({page:1})
        loadMoreContent(values)
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
        let url = `/channels-browse`;
        let queryString = ""
        if (props.pageData.search) {
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        }
        
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.channels){
                let pagging = response.data.pagging
                setState({page:state.page+1,pagging:pagging,channels:[...state.channels,...response.data.channels],loading:false})
            }else{
                setState({loading:false})
            }
        }).catch(err => {
            setState({loading:false})
        });
    }
        let channels = state.channels.map(item => {
            return  <div key={item.channel_id} className="gridColumn">
                        <Channel  {...props}  key={item.channel_id} {...item} channel={item} />
                    </div>
        })
        return(
            <React.Fragment>
                    <div className="user-area">
                        <div className="container">
                            <Search {...props}  type="channel" />
                        </div>
                        <InfiniteScroll
                            dataLength={state.channels.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.channels.length}  />}
                            endMessage={
                                <EndContent {...props} text={props.pageData.search ?  Translate(props,'No channel found with your matching criteria.') : Translate(props,'No channel created yet.')} itemCount={state.channels.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className="container">
                                <div className="gridContainer gridChannel">
                                    {channels}
                                </div>
                            </div>
                        </InfiniteScroll>
                    </div>
            </React.Fragment>
        )
    }


export default Browse