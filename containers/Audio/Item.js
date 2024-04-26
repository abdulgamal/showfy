import React,{useReducer,useEffect,useRef} from 'react'
import { useSelector } from "react-redux";

import swal from "sweetalert"
import Image from "../Image/Index"
import UserTitle from "../User/Title"
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import ShortNumber from "short-number"
import CensorWord from "../CensoredWords/Index"
import Translate from "../../components/Translate/Index";
import Analytics from "../Dashboard/StatsAnalytics"
import axios from "../../axios-orders"
import Currency from "../Upgrade/Currency";

const Index = (props) => {
    let reduxStateSongId = useSelector((state) => {
        return state.audio.song_id;
      });
      let reduxStatePauseSongId = useSelector((state) => {
        return state.audio.pausesong_id;
      });
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            audio: props.audio
        }
    );
    
    useEffect(() => {
        if (props.audio && props.audio != state.audio) {
            setState({audio:props.audio})
        }
    },[props.audio])
    const deleteAudio = (e) => {
        e.preventDefault()
        swal({
            title: Translate(props, "Are you sure?"),
            text: Translate(props, "Once deleted, you will not be able to recover this!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append("id", state.audio.custom_url);
                    const url = "/audio/delete";
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                            } else {

                            }
                        }).catch(err => {
                            swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    const analytics = (e) => {
        e.preventDefault()
        setState({ analytics: true })
    }
    const closePopup = (e) => {
        setState({ analytics: false })
    }
        let analyticsData = null
        if (state.analytics) {
            analyticsData = <div className="popup_wrapper_cnt">
                <div className="popup_cnt" style={{ maxWidth: "60%" }}>
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Analytics")}</h2>
                                <a onClick={closePopup} className="_close"><i></i></a>
                            </div>
                            <Analytics {...props} id={state.audio.audio_id} type="audio" />
                        </div>
                    </div>
                </div>
            </div>
        }
        let item = state.audio
        return (
            <React.Fragment>
                {analyticsData}
                {
                props.pageData.appSettings["audio_advgrid"] == 1 ? 
                    <div className="ThumbBox-wrap audio-container">
                        <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                            <a className="ThumbBox-link" onClick={props.closePopUp}>
                                <div className="ThumbBox-coverImg">
                                    <span>
                                        <Image image={item.image} title={item.title} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                    </span>
                                </div>
                            </a>
                        </Link>     
                                <div className="miniplay">
                                    {
                                        reduxStateSongId != item.audio_id || reduxStatePauseSongId == item.audio_id ?
                                        <div className="playbtn"  onClick={() => props.playSong(item.audio_id,item)}>
                                            <i className="fas fa-play"></i>
                                        </div>
                                        :
                                        <div className="playbtn"  onClick={() => props.pauseSong(item.audio_id,item)}>
                                            <i className="fas fa-pause" ></i>
                                        </div>
                                    }
                                </div>
                                <div className="ThumbBox-Title hide-on-expand">
                                {
                                            item && item.price > 0 ?
                                            <span className="live_now_cnt" style={{
                                            top:"auto",
                                            bottom:"50px"
                                            }}>
                                            {Currency({
                                                        ...props,
                                                        ...{
                                                        package:{
                                                            price: parseFloat(item ? item.price : 0)
                                                        }
                                                        },
                                                    })
                                            }
                                            </span>
                                            : null
                                        }
                                        {
                                            item && item.view_privacy.indexOf("package_") > -1 ?
                                            <span className="live_now_cnt" style={{top:"auto",bottom:item && item.price > 0 ? "80px" : "50px"}}>
                                            {Translate(props, "Subscription Plan")}
                                            </span>
                                            : null
                                        }
                                    <div className="PlayIcon">
                                        <span className="material-icons-outlined">
                                            play_arrow
                                        </span>
                                    </div>
                                    <div className="title ellipsize2Line">
                                        <h4 className="m-0">{<CensorWord {...props} text={item.title} />}</h4>
                                    </div>
                                </div>
                                <div className="ItemDetails">
                                    <div className="d-flex justify-content-between VdoTitle ">
                                    <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                        <a className="ThumbBox-Title-expand d-flex align-items-center" onClick={props.closePopUp}>
                                            <div className="PlayIcon">
                                                <span className="material-icons-outlined">
                                                    play_arrow
                                                </span>
                                            </div>
                                            <div className="title ellipsize2Line">
                                                <h4 className="m-0">{<CensorWord {...props} text={item.title} />}</h4>
                                            </div>
                                        </a>
                                        </Link>
                                        {
                                            props.canDelete || props.canEdit ? 
                                        <div className="moreOptions">
                                            <a href="#" className="icon-Dvert" data-bs-toggle="dropdown" aria-expanded="false">
                                                <span className="material-icons">
                                                    more_vert
                                                </span>
                                            </a>

                                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start moreOptionsShow">
                                            {
                                                props.canEdit ?
                                                    <li>
                                                        <Link href="/create-audio" customParam={`id=${item.custom_url}`} as={`/create-audio/${item.custom_url}`}>
                                                            <a className="addPlaylist addEdit"  title={Translate (props, "Edit")}>
                                                            <span className="material-icons" data-icon="edit"></span>
                                                            {Translate(props, "Edit")}
                                                            </a>
                                                        </Link>
                                                    </li>
                                                    : null
                                            }
                                            {
                                                    props.canDelete ?
                                                    <li>
                                                        <a className="addPlaylist addDelete" title={Translate(props, "Delete")} href="#" onClick={deleteAudio}>
                                                        <span className="material-icons" data-icon="delete"></span>
                                                        {Translate(props, "Delete")}
                                                        </a>
                                                    </li>
                                                    : null
                                            }
                                            {
                                                props.canEdit ?
                                                        <li>
                                                            <a href="#" className="addPlaylist addEdit" onClick={analytics} title={Translate(props, "Analytics")}>
                                                            <span className="material-icons" data-icon="show_chart"></span>
                                                            {Translate(props, "Analytics")}
                                                            </a>
                                                        </li>
                                                    : null
                                            }
                                            <SocialShare {...props} buttonHeightWidth="30" tags={item.tags} url={`/audio/${item.custom_url}`} title={CensorWord("fn",props,item.title)} imageSuffix={props.pageData.imageSuffix} media={item.image} />                                            
                                        </ul>
                                    </div>
                                    : null    
                                    }

                                    </div>
                                    <div className="Vdoinfo d-flex flex-column">
                                        
                                        <UserTitle childPrepend={true}  className="user" data={item} ></UserTitle>
                                        
                                        <span className="videoViewDate">
                                            <span title="play">
                                                <i className="fas fa-play"></i>{" "}
                                                {`${ShortNumber(item.play_count ? item.play_count : 0)}`}{" "}{props.t("play_count", { count: item.play_count ? item.play_count : 0 })}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="likeDislike-Wrap mt-2">
                                        <ul className="likeDislike-List">
                                            <li>
                                                <Like icon={true} {...props} like_count={item.like_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                            </li>
                                            <li>
                                                <Dislike icon={true} {...props} dislike_count={item.dislike_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                            </li>
                                            <li>
                                                <Favourite icon={true} {...props} favourite_count={item.favourite_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                            </li>
                                            <SocialShare {...props} hideTitle={true} buttonHeightWidth="30" url={`/audio/${item.custom_url}`} title={item.title} imageSuffix={props.pageData.imageSuffix} media={item.image} />
                                        </ul>
                                    </div>
                                </div>
                            
                    </div>  
                    : 
                    <div key={item.audio_id} className={`${props.from_user_profile ? 'adiodiv' : "adiodiv"}`}>
                    <div className="audio-grid">
                        <div className="audioGrid-content">
                            
                                    <div className="audio-track-img">
                                    <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                        <a className="d-block">
                                            <Image image={item.image} title={item.title} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                        </a>
                                    </Link>
                                        <div className="audioPlayBtn-wrap">
                                            {
                                                reduxStateSongId != item.audio_id || reduxStatePauseSongId == item.audio_id ?
                                                <div className="audioPlayBtn" onClick={() => props.playSong(item.audio_id,item)}>
                                                    <i className="fas fa-play"></i>
                                                </div>
                                                :
                                                <div className="audioPlayBtn" onClick={() => props.pauseSong(item.audio_id,item)}>
                                                    <i className="fas fa-pause"></i>
                                                </div>
                                            }
                                        </div>
                                        {
                                            item && item.price > 0 ?
                                            <span className="live_now_cnt" style={{
                                            top:"auto",
                                            bottom:"0px"
                                            }}>
                                            {Currency({
                                                        ...props,
                                                        ...{
                                                        package:{
                                                            price: parseFloat(item ? item.price : 0)
                                                        }
                                                        },
                                                    })
                                            }
                                            </span>
                                            : null
                                        }
                                        {
                                            item && item.view_privacy.indexOf("package_") > -1 ?
                                            <span className="live_now_cnt" style={{top:"auto",bottom:item && item.price > 0 ? "30px" : "0px"}}>
                                            {Translate(props, "Subscription Plan")}
                                            </span>
                                            : null
                                        }
                                    </div>
                                    <div className="audioName">
                                    <Link href={`/audio`} customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                        <a className="d-block">
                                            <CensorWord {...props} text={item.title} />
                                        </a>
                                    </Link>
                                    </div>
                                
                            <UserTitle childPrepend={true}  className="audioUserName d-inline-flex align-items-center user" data={item} ></UserTitle>

                            <div className="LikeDislikeWrap audiolikedisshr mt-3">
                                <ul className="LikeDislikeList">
                                <li>
                                    <Like icon={true} {...props} like_count={item.like_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                </li>

                                <li>
                                    <Dislike icon={true} {...props} dislike_count={item.dislike_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                </li>
                                <li>
                                    <Favourite icon={true} {...props} favourite_count={item.favourite_count} item={item} type="audio" id={item.audio_id} />{"  "}
                                </li>
                                <SocialShare {...props} hideTitle={true} buttonHeightWidth="30" url={`/audio/${item.custom_url}`} title={item.title} imageSuffix={props.pageData.imageSuffix} media={item.image} />                                
                                <li>
                                    <span title="play">
                                        <i className="fas fa-play"></i>&nbsp;&nbsp;
                                        {`${ShortNumber(item.play_count ? item.play_count : 0)}`}{props.t("play_count", { count: item.play_count ? item.play_count : 0 })}
                                    </span>
                                </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }
            </React.Fragment>
        )
}
export default Index