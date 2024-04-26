import React,{useReducer,useEffect,useRef} from 'react'
import Translate from "../../../components/Translate/Index";
import swal from "sweetalert"
import axios from "../../../axios-orders"
import AddVideo from "./AddVideo"
import Image from "../../Image/Index"
import LoadMore from "../../LoadMore/Index"
import EndContent from "../../LoadMore/EndContent"
import Release from "../../LoadMore/Release"
import InfiniteScroll from "react-infinite-scroll-component";

const Videos = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            videos:props.videos && props.videos.results ? props.videos.results : [],
            pagging:props.videos.pagging,
            movie:props.movie ? props.movie : {},
            seasons:props.seasons ? props.seasons : [],
            editItem:props.editItem ? props.editItem : null,
            page:2
        }
    );

    useEffect(() => {
        if(props.editItem != state.editItem || props.movie != state.movie || props.videos != state.videos){
            setState({
                page:2,
                videos:props.videos && props.videos.results ? props.videos.results : [],   
                pagging:props.videos.pagging,    
                movie:props.movie ? props.movie : {},
                seasons:props.seasons ? props.seasons : [],
                editItem:props.editItem ? props.editItem : null  
            })
        }
    },[props])
    
    const updateValues = (values) => {
        //update the values
        let videosItem = {}
        videosItem["pagging"] = state.pagging
        videosItem["results"] = values
        props.updateSteps({key:"videos",value:videosItem})
    }
    const closeCreate = (data,message) => {
        if(message && data){
            props.openToast({message:Translate(props,message), type:"success"});
        }
        const items = [...state.videos]
        if(state.editVideoItem){
            const videoIndex = items.findIndex(p => p["movie_video_id"] == state.editVideoItem.movie_video_id);
            if(videoIndex > -1){
                items[videoIndex] = data
                setState({addVideo:false,editVideoItem:null})
                updateValues(items)
            }
        }else{
            items.unshift(data)
            setState({addVideo:false,editVideoItem:null})
            updateValues(items)
        }        
    }
    const closeVideo = () => {
        setState({addVideo:false,editVideoItem:null})
    }
    const editVideo = (video_id,e) => {
        e.preventDefault();
        const items = [...state.videos]
        const itemIndex = items.findIndex(p => p["movie_video_id"] == video_id)
        if(itemIndex > -1){
            let video = items[itemIndex];
            setState({addVideo:true,editVideoItem:video})
        }
    }
    const deleteVideo = (video_id,e) => {
        e.preventDefault();
        swal({
            title: Translate(props,"Are you sure?"),
            text: Translate(props,"Once deleted, you will not be able to recover this video!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', video_id)
                    formData.append('movie_id', state.movie.movie_id)
                    const url = "/movies/video/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                const items = [...state.videos]
                                const itemIndex = items.findIndex(p => p["movie_video_id"] == video_id)
                                if(itemIndex > -1){
                                    items.splice(itemIndex, 1)
                                    updateValues(items)
                                }
                            }
                        }).catch(err => {
                            swal("Error", Translate(props,"Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    const addVideo = () => {
        setState({addVideo:true})
    }
    const refreshContent = () => {
        setState({ page: 1, videos: [] })
        loadMoreContent()
    }
    const loadMoreContent = (values) => {
        setState({ loading: true })
        let formData = new FormData();
        formData.append('page', state.page)
        formData.append('movie_id', state.movie.movie_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/movies/videos`;
        let queryString = ""
        if (props.pageData.search) {
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
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
        let addVideoData = null

        if(state.addVideo){
            addVideoData = (
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{state.editVideoItem ? Translate(props,"Edit Video") : Translate(props,"Create Video")}</h2>
                                    <a onClick={closeVideo}  className="_close"><i></i></a>
                                </div>
                                <AddVideo {...props} closeCreate={closeCreate} movie_id={state.movie.movie_id} closeVideoCreate={closeVideo} editItem={state.editVideoItem} movie={state.movie} seasons={state.seasons} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }


        return (
            <React.Fragment>
                {
                    addVideoData
                }
                <div className="movie_videos">
                    <div className="container">
                        <div className="row"> 
                            <div className="col-md-12">        
                                <button className="add_videos" onClick={addVideo}>
                                    {
                                        props.t("Add Video")
                                    }
                                </button>     
                                {
                                    state.videos.length > 0 ? 
                                    <InfiniteScroll
                                        dataLength={state.videos.length}
                                        next={loadMoreContent}
                                        hasMore={state.pagging}
                                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.videos.length} />}
                                        endMessage={
                                            <EndContent {...props} text={props.pageData.search ?  Translate(props,'No video found with your matching criteria.') : Translate(props,'No video created yet.')} itemCount={state.videos.length} />
                                        }
                                        pullDownToRefresh={false}
                                        pullDownToRefreshContent={<Release release={false} {...props} />}
                                        releaseToRefreshContent={<Release release={true} {...props} />}
                                        refreshFunction={refreshContent}
                                    >
                                        <div className="table-responsive">
                                            <table className="table custTble1">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">{props.t("Name")}</th>
                                                        <th scope="col">{props.t("Type")}</th>
                                                        {
                                                            props.pageData.selectType == "movie" ? 
                                                                <th scope="col">{props.t("Category")}</th>
                                                        : null
                                                        }
                                                        <th scope="col">{props.t("Plays")}</th>
                                                        <th scope="col">{props.t("Season")}</th>
                                                        <th scope="col">{props.t("Episode")}</th>
                                                        <th scope="col">{props.t("Status")}</th>
                                                        <th scope="col">{props.t("Options")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="movie-video-listing">
                                                    
                                                        {
                                                            state.videos.map((video,index) => {
                                                                return (
                                                                    <tr key={video.movie_video_id}>
                                                                        <td className="center-img-txt">
                                                                            <Image className="img" height="35" width="35" image={video.image} imageSuffix={props.pageData.imageSuffix}  siteURL={props.pageData.siteURL}/>
                                                                            {video.title}
                                                                        </td>
                                                                        <td>
                                                                            {video.type}
                                                                        </td>
                                                                        {
                                                                            props.pageData.selectType == "movie" ? 
                                                                                <td>{props.t(video.category)}</td>
                                                                        : null
                                                                        }
                                                                        <td>
                                                                                {video.plays}
                                                                        </td>
                                                                        <td>
                                                                                {
                                                                                    !video.season || video.season == 0 ? "-" : video.season
                                                                                }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                !video.episode_number || video.episode_number == 0 ? "-" : video.episode_number
                                                                            }
                                                                        </td>
                                                                        <td>{video.completed == 1 ? "Completed" : "Processing"}</td>
                                                                        <td>
                                                                            <div className="actionBtn d-flex">
                                                                                <a className="text-success" href="#" title={Translate(props, "Edit")} onClick={(e) => editVideo( video.movie_video_id,e)}><span className="material-icons" data-icon="edit"></span></a> 
                                                                                <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={(e) => deleteVideo( video.movie_video_id,e)}><span className="material-icons" data-icon="delete"></span></a>                                                                                           
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                </tbody>
                                            </table>
                                        </div>
                                    </InfiniteScroll>
                                : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

export default Videos