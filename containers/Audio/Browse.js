import React,{useReducer,useEffect,useRef} from 'react'
import Translate from "../../components/Translate/Index";
import Audio from "./Item"
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Search from "../Search/Index"
import axios from "../../axios-orders"
import Router from 'next/router';

const Browse = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page: 2,
            audios: props.pageData.audios ? props.pageData.audios : props.audios,
            pagging: props.pageData.pagging ? props.pageData.pagging : props.pagging,
            search:props.pageData.search,
            updateComponent:props.updateComponent,
            contentType:props.contentTypePurchase,
        }
    );
    const stateRef = useRef();
    stateRef.current = state.audios
    useEffect(() => {
        if (props.pageData.filter && props.pageData.filter != state.filter) {
            setState({
                page:2, 
                audios: props.pageData.audios ? props.pageData.audios : props.audios, 
                pagging: props.pageData.pagging ? props.pageData.pagging : props.pagging,
                filter:props.pageData.filter
            })
        }else if (props.pageData.search != state.search) {
            setState({
                page:2, 
                audios: props.pageData.audios ? props.pageData.audios : props.audios, 
                pagging: props.pageData.pagging ? props.pageData.pagging : props.pagging,
                search:props.pageData.search
            })
        }else if (props.audios && props.audios != state.audios) {
            setState({
                page:2, 
                audios: props.pageData.audios ? props.pageData.audios : props.audios, 
                pagging: props.pageData.pagging ? props.pageData.pagging : props.pagging,
                search:props.pageData.search
            })
        }
    },[props.pageData.filter,props.pageData.search,props.audios])
    

    useEffect(()=>{
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (state.audios && itemIndex > -1 && type == "audio") {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                if(props.updateParentItems)
                    props.updateParentItems("audio",null,items);
                setState({ audios: items })
            }
        });
        props.socket.on('audioDeleted', data => {
            let id = data.audio_id
            const itemIndex = getItemIndex(id)
            if (state.audios && itemIndex > -1) {
                const items = [...stateRef.current]
                items.splice(itemIndex, 1);
                if(props.updateParentItems)
                    props.updateParentItems("audio",null,items);
                setState({ audios: items })
            }
        });
       
        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (state.audios && type == "audio") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    items[itemIndex] = changedItem
                    if(props.updateParentItems)
                    props.updateParentItems("audio",null,items);
                    setState({ audios: items })
                }
            }
        }); 
        props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (state.audios && type == "audio") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    items[itemIndex] = changedItem
                    if(props.updateParentItems)
                    props.updateParentItems("audio",null,items);
                    setState({ audios: items })
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
            if (state.audios && itemType == "audio") {
                const itemIndex = getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = {...items[itemIndex]}
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
                    if(props.updateParentItems)
                        props.updateParentItems("audio",null,items);
                    setState({ audios: items })
                }
            }
        });
    },[])

    const getItemIndex = (item_id) => {
        if(!state.audios){
            return -1
        }
        const items = [...state.audios];
        const itemIndex = items.findIndex(p => p["audio_id"] == item_id);
        return itemIndex;
    }
    const playSong = (song_id,audio,e) =>{
        if(!audio.audio_file){
            Router.push( `/audio/${audio.custom_url}`)
            return;
        }
        let audios = [...state.audios]
        audios.forEach( (audio, itemIndex) => {
            if(!audio.audio_file){
                audios.splice(itemIndex, 1);
            }
        });
        setState({
            song_id:song_id,
            playsong_id:0
        })
        props.updateAudioData({audios:audios, song_id:song_id,pausesong_id:0})
        
    }
    const pauseSong = (song_id,audio,e) => {
        if(!audio.audio_file){
            Router.push(`/audio/${audio.custom_url}`)
            return;
        }
        let audios = [...state.audios]
        audios.forEach( (audio, itemIndex) => {
            if(!audio.audio_file){
                audios.splice(itemIndex, 1);
            }
        });
        setState({
            song_id:song_id,
            playsong_id:song_id
        })
        props.updateAudioData({audios:audios, song_id:song_id,pausesong_id:song_id})
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

        let url = `/audio/browse`;
        if(props.userowner_id){
            formData.append("owner_id",props.userowner_id)
        }
        let queryString = ""
        if(props.contentType){
            let queryUser = ""
            if(props.userContent){
                queryUser = "?user="+props.userContent
            }
            url = `/dashboard/audio/${props.contentType}${queryUser}`;
            
        }else if(props.pageData.search){
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        }else if(props.contentTypePurchase){
            formData.append('audioPurchased','1')
            formData.append('audio_user_id',props.member.user_id)            
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.audios){
                let pagging = response.data.pagging
                setState({page:state.page+1,pagging:pagging,audios:[...state.audios,...response.data.audios],loading:false})
            }else{
                setState({loading:false})
            }
        }).catch(err => {
            setState({loading:false})
        });
    } 
        let items = state.audios.map(item => {
            return <div key={item.audio_id} className="item gridColumn"><Audio {...props} key={item.audio_id} playSong={playSong} pauseSong={pauseSong}  {...item} audio={item}  /></div>

        })

        return (
            <React.Fragment>
                <div className={`${props.from_user_profile ? 'audio-cnt' : ""}`}>
                        {
                            !props.search && !state.contentType ? 
                        <div className="container">
                            <Search  {...props} type="audio"/>
                        </div>
                            : null
                        } 
                        {
                            !props.from_user_profile ? 
                                <InfiniteScroll
                                        dataLength={state.audios.length}
                                        next={loadMoreContent}
                                        hasMore={state.pagging}
                                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.audios.length}  />}
                                        endMessage={
                                            <EndContent {...props} text={Translate(props,"No audio found.")} itemCount={state.audios.length} />
                                        }
                                        pullDownToRefresh={false}
                                        pullDownToRefreshContent={<Release release={false} {...props} />}
                                        releaseToRefreshContent={<Release release={true} {...props} />}
                                        // refreshFunction={refreshContent}
                                    >
                                        {
                                            props.fromUserProfile ? 
                                                <div className="gridContainer gridAudio">
                                                    {
                                                        items
                                                    }
                                                </div>
                                            :
                                            <div className="container">
                                                <div className="gridContainer gridAudio">
                                                    {
                                                        items
                                                    }
                                                </div>
                                            </div>
                                        }
                                </InfiniteScroll>
                            :
                            <InfiniteScroll
                                    dataLength={state.audios.length}
                                    next={loadMoreContent}
                                    hasMore={state.pagging}
                                    loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.audios.length}  />}
                                    endMessage={
                                        <EndContent {...props} text={Translate(props,"No audio found.")} itemCount={state.audios.length} />
                                    }
                                    pullDownToRefresh={false}
                                    pullDownToRefreshContent={<Release release={false} {...props} />}
                                    releaseToRefreshContent={<Release release={true} {...props} />}
                                    // refreshFunction={refreshContent}
                                >
                                    <div className="container">
                                        <div className="gridContainer gridVideo">
                                            {
                                                items
                                            }
                                        </div>
                                    </div>
                            </InfiniteScroll>
                        }
                        </div>
            </React.Fragment>
        )
}

export default Browse