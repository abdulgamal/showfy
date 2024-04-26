import React,{useReducer,useEffect,useRef} from 'react'
import axios from "../../axios-orders"

import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Translate from "../../components/Translate/Index";
import Item from "./CommunityItem"
import AddPost from "./AddPost"

const  Posts = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page:2,
            posts:props.posts,
            channel:props.channel,
            pagging:props.pagging,
            channel_id:props.channel_id
        }
    );
    const stateRef = useRef();
    stateRef.current = state.posts
    useEffect(() => {
        if(state.posts != props.posts){
            setState({posts:props.posts,pagging:props.pagging,page:2,channel_id:props.channel_id})
        }
    },[props.posts])
    
    const getItemIndex = (item_id) => {
        if(state.posts){
            const posts = [...state.posts];
            const itemIndex = posts.findIndex(p => p["post_id"] == item_id);
            return itemIndex;
        } 
        return -1;
    }
    useEffect(() => {

        props.socket.on('communityDeleted',data => {
            let id = data.post_id
            const itemIndex = getItemIndex(id)
            if(itemIndex > -1){
                const posts = [...stateRef.current]
                posts.splice(itemIndex, 1);
                setState({posts:posts})
            } 
        })
        props.socket.on('communityAdded',data => {
            let id = data.channel_id
            if(id == state.channel_id){
                const posts = [data.postData,...stateRef.current]
                setState({posts:posts})
            }
        })
        props.socket.on('communityEdited',data => {
            let id = data.post_id
            const itemIndex = getItemIndex(id)
            if(itemIndex > -1){
                const posts = [...stateRef.current]
                posts[itemIndex]["title"] = data.postData.title
                posts[itemIndex]["image"] = data.postData.image
                setState({posts:posts})
            }
        })

        props.socket.on('likeDislike',data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId =  data.ownerId
            let removeLike  = data.removeLike
            let removeDislike  = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike =  data.insertDislike
            if(itemType == "channel_posts"){
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
                    setState({posts:items})
                }
            }
        });
        
    },[])
    const refreshContent = () => {
        setState({page:1,posts:[]})
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
       
        formData.append('channel_id',props.channel_id)
        url = `/channels/posts`;
       
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.posts){
                let pagging = response.data.pagging
                setState({page:state.page+1,pagging:pagging,posts:[...state.posts,...response.data.posts],loading:false})
            }else{
                setState({loading:false})
            }
        }).catch(err => {
            setState({loading:false})
        });

    }
    const adPost = (data,e) => {
        e.preventDefault();
        setState({addpost:true,editData:data});
    }
    const closePOst = () => { 
        setState({addpost:false,editData:null});
    }
        
        return (
            <React.Fragment>
                {
                    state.addpost ? 
                        <AddPost {...props} closePOst={closePOst} editItem={state.editData} channel_id={props.channel_id} />
                    : null
                }    
                <InfiniteScroll
                            dataLength={state.posts.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.posts.length} />}
                            endMessage={
                                <EndContent {...props} text={Translate(props,'No post created yet.')} itemCount={state.posts.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <React.Fragment>
                                {
                                    state.posts.map(post => {
                                        return (
                                            <div key={post.post_id} className="communty-boxWrap">
                                                <Item adPost={adPost} channel={state.channel} canDelete={props.canDelete} canEdit={props.canEdit} {...props} {...post} post={post}   />
                                            </div>
                                        )
                                    })
                                }
                            </React.Fragment>                  
                </InfiniteScroll>
            </React.Fragment>
        )
    }



export default Posts