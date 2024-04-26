import React,{useReducer,useEffect,useRef} from 'react'
import axios from "../../axios-orders"
import Player from "./Player"
import OutsidePlayer from "./OutsidePlayer"
import LoadMore from "../LoadMore/Index"
import Translate from "../../components/Translate/Index";
import InfiniteScroll from "react-infinite-scroll-component";
import EndContent from "../LoadMore/EndContent"
import VideoForm from "../../containers/Form/Video"

const Popup = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type:props.playlist ? "search" : "upload",
            channel_id:props.channel_id,
            loading:false,
            playlist:props.playlist,
            content:[],
            page:1,
            myContent:[],
            pageMyContent:1,
            selectedVideo:[],
            submitEnable:false,
            nextPageMyContent:false,
            nextPageContent:false
        }
    );
    useEffect(() => {
        searchButtonClick(true,'my')
    },[])
    const changeType = (e,type) => {
        if(type == "my"){
            $('#video_search_btn').val('')
            setState({type:"my",submitEnable:false})
        }else if(type == "url"){
            $('#video_search_btn').val('')
            setState({type:"url",page:1,content:[],selectedVideo:[],submitEnable:false})
        }else if(type == "search"){
            $('#video_search_btn').val('')
            setState({type:"search",page:1,content:[],selectedVideo:[],submitEnable:false})
        }else if(type == "upload"){
            $('#video_search_btn').val('')
            setState({type:"upload",page:1,content:[],selectedVideo:[],submitEnable:false})
        }
    }
    const searchButtonClick = (isCheck = false,type = "",page) => {
        let formData = new FormData();
        if(!type || type != "my"){
            var value = $('#video_search_btn').val();
            if(!value)
                return;
            if(value){
                setState({loading:true})
            }
            formData.append("value",value)
            formData.append("criteria",state.type)
            formData.append('page',page ? page : state.page)
        }else{
            formData.append('criteria',type)
            formData.append('page',state.pageMyContent)
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        if(state.channel_id){
            formData.append('channel_id',state.channel_id)
        }
        let url = '/videos/search';
        if(state.playlist){
            url = "/channels/get-playlists"
        }
        axios.post(url, formData ,config)
        .then(response => {
            if(response.data.videos || response.data.playlists){
                let pagging = response.data.pagging
                if(type == "" || type != "my"){
                    if(state.page == 1){
                        if(state.playlist){
                            setState({nextPageContent:pagging,page:2,content:response.data.playlists,loading:false,submitEnable:response.data.playlists.length > 0 && state.type == "url" ? true : false,selectedVideo:response.data.playlists.length > 0 && state.type == "url" ? [response.data.playlists[0].playlist_id] : []})
                        }else{
                            setState({nextPageContent:pagging,page:2,content:response.data.videos,loading:false,submitEnable:response.data.videos.length > 0 && state.type == "url" ? true : false,selectedVideo:response.data.videos.length > 0 && state.type == "url" ? [response.data.videos[0].video_id] : []})
                        }
                    }else{
                        if(state.playlist){
                            setState({nextPageContent:pagging,page:state.page + 1,content:[...state.content,...response.data.playlists],loading:false,submitEnable:response.data.playlists.length > 0 && state.type == "url" ? true : false,selectedVideo:response.data.playlists.length > 0 && state.type == "url" ? [response.data.playlists[0].playlist_id] : []})
                        }else{
                            setState({nextPageContent:pagging,page:state.page + 1,content:[...state.content,...response.data.videos],loading:false,submitEnable:response.data.videos.length > 0 && state.type == "url" ? true : false,selectedVideo:response.data.videos.length > 0 && state.type == "url" ? [response.data.videos[0].video_id] : []})
                        }
                    }
                }else{
                    if(state.pageMyContent == 1){
                        if(!state.playlist){
                            setState({pageMyContent:2,nextPageMyContent:pagging,myContent:response.data.videos,loading:false})
                        }else{
                            setState({pageMyContent:2,nextPageMyContent:pagging,myContent:response.data.playlists,loading:false})
                        }
                    }else{
                        if(!state.playlist){
                            setState({pageMyContent:state.pageMyContent+1,nextPageMyContent:pagging,myContent:[...state.myContent,...response.data.videos],loading:false})
                        }else{
                            setState({pageMyContent:state.pageMyContent+1,nextPageMyContent:pagging,myContent:[...state.myContent,...response.data.playlists],loading:false})
                        }
                    }
                }
            }
        }).catch(err => {
            setState({loading:false})
        });

    }
    
    const loadMoreMyContent = () => {
        setState({loading:true})
        searchButtonClick(true,'my')
    }
    const loadMoreContent = () => {
        searchButtonClick()
    }
    const selectedVideo = (video_id) => {
        const videos = [...state.selectedVideo]
        var index = videos.indexOf(video_id);
        if (index > -1) {
            videos.splice(index, 1); 
        }else{
            videos.push(video_id)
        }
        let enableSubmit = false
        if(videos.length > 0){
            enableSubmit = true
        }
        setState({selectedVideo:videos,submitEnable:enableSubmit})
    }
    const chooseVideos = (e,selectedVideo) => {
        if(selectedVideo){
            props.chooseVideos([selectedVideo])
        }else if(state.selectedVideo.length > 0){
            props.chooseVideos(state.selectedVideo)
        }else if(state.type == "upload"){
            props.chooseVideos(state.selectedVideo)
        }
    }
     
        return (
            <div id="myModal" className="modal-popup">
                <div className="modal-content-popup">
                    <span className={"close-popup"} onClick={props.closePopup}>&times;</span>
                    <ul className="popupTabList clearfix">
                        {
                            !state.playlist ? 
                                <li className={(state.type == "upload" ? "active" : "")} onClick={() => changeType(this,'upload')}>
                                    {Translate(props, "Upload Video" )}
                                </li>
                            : null
                        }
                        <li className={(state.type == "search" ? "active" : "")} onClick={() => changeType(this,'search')}>
                            {Translate(props, state.playlist ? "Playlist search" : "Video search" )}
                        </li>
                        <li className={(state.type == "url" ? "active" : "")} onClick={() => changeType(this,'url')}>
                        {Translate(props, "URL")}
                        </li>
                        <li className={(state.type == "my" ? "my" : "")} onClick={() => changeType(this,'my')}>
                        {Translate(props, `My uploaded ${state.playlist ? "playlist" : "video"}`)} 
                        </li>
                    </ul>
                    {
                        state.type == "search" ?
                        <div className="populatTabListContent">
                            <p>{Translate(props,`Type your search in the box below to find ${state.playlist ? "playlists" : "videos"}`)}</p>
                            <div style={{marginBottom:"10px"}}>
                                <input type="text" id="video_search_btn" /> 
                                <button type="button" onClick={() => { setState({page:1});searchButtonClick(null,null,1) }}>{Translate(props,"Search")}</button>
                            </div>
                            {
                            state.content.length > 0 ?
                                <div id="scrollableDivPopupSearch" className="popup_container custScrollBar">
                                    <InfiniteScroll
                                            dataLength={state.content.length}
                                            next={loadMoreContent}
                                            hasMore={state.nextPageContent}
                                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.content.length} />}
                                            endMessage={
                                                <EndContent {...props} text={Translate(props,'No data found to display.')} itemCount={state.content.length} />
                                            }
                                            pullDownToRefresh={false}
                                            scrollableTarget="scrollableDivPopupSearch"
                                        >
                                        {
                                            state.content.map(result =>{
                                                let imageUrl = ""
                                                if(result.image.indexOf("http://") == 0 || result.image.indexOf("https://") == 0){
                                                    imageUrl = result.image
                                                }else{
                                                    if(props.pageData.livestreamingtype == 0 && result.mediaserver_stream_id &&  !result.orgImage && result.is_livestreaming == 1 && parseInt(props.pageData.appSettings['antserver_media_hlssupported']) == 1){
                                                        if(props.pageData.liveStreamingCDNServerURL){
                                                            videoImage = `${props.pageData.liveStreamingCDNServerURL}/${props.pageData.streamingAppName}/previews/${result.mediaserver_stream_id}.png`
                                                        }else
                                                            videoImage = `${props.pageData.liveStreamingServerURL}:5443/${props.pageData.streamingAppName}/previews/${result.mediaserver_stream_id}.png`
                                                    }else if(props.pageData.livestreamingtype == 0 && result.mediaserver_stream_id &&  result.image && result.image.indexOf(`${props.pageData.streamingAppName}/previews`) > 0){
                                                        if(props.pageData.liveStreamingCDNURL){
                                                            imageUrl = props.pageData.liveStreamingCDNURL+result.image.replace(`/LiveApp`,'').replace(`/WebRTCAppEE`,'')
                                                        }else
                                                            imageUrl = props.pageData.liveStreamingServerURL+":5443"+result.image
                                                    }else{
                                                        imageUrl = props.pageData.imageSuffix+result.image
                                                    }
                                                }
                                                return (
                                                    <div className={`upldPopupVdo${state.selectedVideo.indexOf(result.video_id ? result.video_id : result.playlist_id) > -1 ? " popup_content_selected" : ""}`} key={result.video_id ? result.video_id : result.playlist_id} onClick={selectedVideo.bind(this,result.video_id ? result.video_id : result.playlist_id)}>
                                                        <img style={{height:"100px",width:"100px"}} src={ imageUrl} />
                                                        <div>
                                                            {result.title}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                        </InfiniteScroll>
                                    </div>
                            :
                            <p>{Translate(props,`No ${state.playlist ? "playlist" : "video"} found`)}</p>
                        }
                        
                        </div>
                        :
                        state.type == "my" ? 
                        <div className="popup_container custScrollBar" id="scrollableDivPopup">
                        {
                            state.myContent.length > 0 ? 
                                
                                <InfiniteScroll
                                        dataLength={state.myContent.length}
                                        next={loadMoreMyContent}
                                        hasMore={state.nextPageMyContent}
                                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.myContent.length} />}
                                        endMessage={
                                            <EndContent {...props} text={Translate(props,'No data found to display.')} itemCount={state.myContent.length} />
                                        }
                                        pullDownToRefresh={false}
                                        scrollableTarget="scrollableDivPopup"
                                    >
                                    {
                                        state.myContent.map(result =>{
                                            let imageUrl = ""
                                            if(result.image.indexOf("http://") == 0 || result.image.indexOf("https://") == 0){
                                                imageUrl = result.image
                                            }else{
                                                if(props.pageData.livestreamingtype == 0 && result.mediaserver_stream_id &&  result.image && result.image.indexOf(`${props.pageData.streamingAppName}/previews`) > 0){
                                                    if(props.pageData.liveStreamingCDNURL){
                                                        imageUrl = props.pageData.liveStreamingCDNURL+result.image.replace(`/LiveApp`,'').replace(`/WebRTCAppEE`,'')
                                                    }else
                                                        imageUrl = props.pageData.liveStreamingServerURL+":5443"+result.image
                                                }else{
                                                    imageUrl = props.pageData.imageSuffix+result.image
                                                }
                                            }
                                            return (
                                                <div  className={`upldPopupVdo${state.selectedVideo.indexOf(result.video_id ? result.video_id : result.playlist_id) > -1 ? " popup_content_selected" : ""}`}  key={result.video_id ? result.video_id : result.playlist_id} onClick={selectedVideo.bind(this,result.video_id ? result.video_id : result.playlist_id)}>
                                                    <img style={{height:"100px",width:"100px"}} src={ imageUrl } />
                                                    <div>
                                                        {result.title}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    </InfiniteScroll>

                            :
                            <p>{Translate(props,`No ${state.playlist ? "playlist" : "video"} create by you yet`)}</p>
                        }
                        </div>
                        :
                        state.type == "upload" ? 
                            <VideoForm {...props} fromChannel={true} channel_id={state.channel_id} chooseVideos={chooseVideos} />
                        :
                        <div className="populatTabListContent">
                            <p>{Translate(props,'Paste site URL here:')}</p>
                            <div style={{marginBottom:"10px"}}>
                            <input type="text" id="video_search_btn" /> 
                            <button type="button" onClick={searchButtonClick}>{Translate(props,'search')}</button>
                            </div>
                            {
                                state.content.length > 0 ? 
                                state.playlist ? 
                                    <div className={`upldPopupVdo${state.selectedVideo.indexOf(state.content[0].playlist_id ? state.content[0].playlist_id : state.content[0].video_id) > -1 ? " popup_content_selected" : ""}`} key={state.content[0].playlist_id ? state.content[0].playlist_id : state.content[0].video_id} onClick={selectedVideo.bind(this,state.content[0].playlist_id ? state.content[0].playlist_id : state.content[0].video_id)}>
                                        <img style={{height:"100px",width:"100px"}} src={ /^((http|https):\/\/)/.test(state.content[0].image) ? state.content[0].image : props.pageData.imageSuffix+state.content[0].image} />
                                        <div>
                                            {state.content[0].title}
                                        </div>
                                    </div>
                                :
                                state.content[0].type == 3 ?
                                    <Player {...props} video={state.content[0]}  />
                                :
                                    <OutsidePlayer code={state.content[0].code} {...props} video={state.content[0]} /> 
                                :
                                <p>{Translate(props,`No ${state.playlist ? "playlist" : "video"} found`)}</p>
                            }
                            
                        </div>
                    }
                    {
                        state.type != "upload" ? 
                            <div className="modal-popup-footer">
                                <button  className={state.submitEnable ? "popup-enable-btn" : "popup-disable-btn"}  onClick={chooseVideos}>
                                    {Translate(props,`Add ${state.playlist ? "playlist" : "video"}`)}
                                </button>
                                <button onClick={props.closePopup}>
                                    {Translate(props,"Cancel")}
                                </button>
                            </div>
                        : null
                    }
                </div>
            </div>
        )
    }

 
export default Popup