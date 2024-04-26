import React,{useReducer,useEffect,useRef} from 'react'

import axios from "../../axios-orders"

import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Item from "../Channel/Item"
import Translate from "../../components/Translate/Index"

const  Channels = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page:2,
            channels:props.channels,
            pagging:props.pagging,
            search:props.search ? props.search : []
        }
    );
    const stateRef = useRef();
    stateRef.current = state.channels
    useEffect(() => {
        if (props.channels && props.channels != state.channels) {
            setState({ channels: props.channels, pagging: props.pagging, page: 2,search:props.search ? props.search : []})
        }
    },[props.channels])

    const getItemIndex = (item_id) => {
        if(state.channels){
            const channels = [...state.channels];
            const itemIndex = channels.findIndex(p => p["channel_id"] == item_id);
            return itemIndex;
        }else{
            return -1;
        }
    }
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
        props.socket.on('channelDeleted',data => {
            let id = data.channel_id
            const itemIndex = getItemIndex(id)
            if(itemIndex > -1){
                const channels = [...stateRef.current]
                channels.splice(itemIndex, 1);
                setState({channels:channels})
            }
        })

        props.socket.on('unfollowUser',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "channels"){   
                const itemIndex = getItemIndex(id)  
                if(itemIndex > -1){
                    const channels = [...stateRef.current]
                    const changedItem = {...channels[itemIndex]}
                    changedItem.follow_count = changedItem.follow_count - 1
                    if(props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.follower_id = null
                    }
                    channels[itemIndex]  = changedItem
                    setState({channels:channels})
                }
            }
       });
       props.socket.on('followUser',data => {
           let id = data.itemId
           let type = data.itemType
           let ownerId = data.ownerId
           if(type == "channels"){
              const itemIndex = getItemIndex(id)
              if(itemIndex > -1){
                const channels = [...stateRef.current]
                const changedItem = {...channels[itemIndex]}
                changedItem.follow_count = data.follow_count + 1
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
            if(type == "channels"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    setState({channels:items})
                }
            }
        });
        props.socket.on('favouriteItem',data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if(type == "channels"){
                const itemIndex = getItemIndex(id)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if(props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId){
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    setState({channels:items})
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
            if(itemType == "channels"){
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
                    setState({channels:items})
                }
            }
        });

    },[])
    const refreshContent = () => {
        setState({page:1,channels:[]})
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
        if(props.contentType){
            let queryUser = ""
            if(props.userContent){
                queryUser = "?user="+props.userContent
            }
            url = `/dashboard/channels/${props.contentType}${queryUser}`;

        }else if(props.channel_id){
            formData.append('channel_id',props.channel_id)
            url = `/channels`;
        }else if(props.user_id){
            formData.append('owner_id',props.user_id)
            url = `/members/channels`;
        }else if(props.globalSearch){
           let queryString = Object.keys(state.search).map(key => key + '=' + state.search[key]).join('&');
            url = `/search/channel?${queryString}`
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
        return (
            <InfiniteScroll
                        dataLength={state.channels.length}
                        next={loadMoreContent}
                        hasMore={state.pagging}
                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.channels.length} />}
                        endMessage={
                            <EndContent {...props} text={props.contentType == "my" ? Translate(props,'No channel created yet.') : (props.contentType || props.globalSearch ? Translate(props,'No channel found with your matching criteria.') : (props.user_id ? Translate(props,'No channel created by this user yet.') : Translate(props,'No channel found.')))} itemCount={state.channels.length} />
                        }
                        pullDownToRefresh={false}
                        pullDownToRefreshContent={<Release release={false} {...props} />}
                        releaseToRefreshContent={<Release release={true} {...props} />}
                        refreshFunction={refreshContent}
                    >
                        <div className="gridContainer gridChannel">
                                {
                                state.channels.map(channel => {
                                    return (
                                        <div key={channel.channel_id} className="gridColumn">
                                            <Item canDelete={props.canDelete} canEdit={props.canEdit} {...props} {...channel} channel={channel}   />
                                        </div>
                                    )
                                })
                            }
                        </div>                   
            </InfiniteScroll>
        )
    }


  
export default Channels