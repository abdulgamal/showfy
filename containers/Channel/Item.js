import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index"
import Link from "../../components/Link/index";
import swal from "sweetalert"
import SocialShare from "../SocialShare/Index"
import ShortNumber from "short-number"
import ChannelFollow from "../User/Follow"

import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import axios from "../../axios-orders"
import UserTitle from "../User/Title"
import Timeago from "../Common/Timeago"
import Translate from "../../components/Translate/Index"
import Analytics from "../Dashboard/StatsAnalytics"
import CensorWord from "../CensoredWords/Index"

const Item = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            channel: props.channel,
        }
    );
    useEffect(() => {
        if ((props.channel && props.channel != state.channel)) {
            setState({ channel: props.channel})
        }
    },[props.channel])
   

    const deleteFn = (e) => {
        e.preventDefault()
        swal({
            title: Translate(props,"Are you sure?"),
            text: Translate(props,"Once deleted, you will not be able to recover this!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', state.channel.custom_url)
                    const url = "/channels/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {

                            }
                        }).catch(err => {
                            swal("Error", Translate(props,"Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    const analytics = ( e) => {
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
                            <Analytics {...props} id={state.channel.channel_id} type="channels" />
                        </div>
                    </div>
                </div>
            </div>
        }
        return (
            <React.Fragment>
                {analyticsData}
                {
                    props.pageData.appSettings.channel_advanced_grid != 1 ? 
                    <div className="snglChnnl-block clearfix">
                        <Link href="/channel" customParam={`id=${state.channel.custom_url}`} as={`/channel/${state.channel.custom_url}`}>
                            <a className="snglChnnl-coverimg" onClick={props.closePopUp}>
                                <Image className="img-fluid" layout="fill" title={CensorWord("fn",props,state.channel.title)} image={state.channel.cover_crop ? state.channel.cover_crop : state.channel.cover} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                <div className="lbletop">
                                    {
                                        props.pageData.appSettings['channels_browse_featuredlabel'] == 1 && props.pageData.appSettings['channel_featured'] == 1 && state.channel.is_featured == 1 ?
                                            <span className="lbl-Featured" title={Translate(props,"Featured Channel")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                            </span>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings['channels_browse_sponsoredLabel'] == 1 && props.pageData.appSettings['channel_sponsored'] == 1 && state.channel.is_sponsored == 1 ?
                                            <span className="lbl-Sponsored" title={Translate(props,"Sponsored Channel")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                            </span>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings['channels_browse_hotLabel'] == 1 && props.pageData.appSettings['channel_hot'] == 1 && state.channel.is_hot == 1 ?
                                            <span className="lbl-Hot" title={Translate(props,"Hot Channel")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                            </span>
                                            : null
                                    }
                                </div>
                            </a>
                        </Link>
                        <div className="snglChnnl-content">
                            <div className="userImg">
                                <Link href="/channel" customParam={`id=${state.channel.custom_url}`} as={`/channel/${state.channel.custom_url}`}>
                                    <a  onClick={props.closePopUp}>
                                        <Image className="img-fluid" height={110} width={110} title={CensorWord("fn",props,state.channel.title)} image={state.channel.image} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                    </a>
                                </Link>
                            </div>
                            <div className="videoList_content">
                                <div className={`videoTitle${props.canDelete || props.canEdit  || props.pageData.appSettings["channels_browse_share"] == 1 ? " edit-video-btn" : ""}`}>
                                    <Link href="/channel" customParam={`id=${state.channel.custom_url}`} as={`/channel/${state.channel.custom_url}`}>
                                        <a className="chnnlName" onClick={props.closePopUp}>
                                            {<CensorWord {...props} text={state.channel.title} />}
                                            {state.channel.channelverified == 1 ?
                                                <span className="verifiedUser" title={Translate(props,"verified")}><span className="material-icons" data-icon="check"></span></span>
                                                : null
                                            }
                                        </a>
                                    </Link>
                                    {
                                            props.canDelete || props.canEdit || props.pageData.appSettings["channels_browse_share"] == 1 ? 
                                        <div className="dropdown TitleRightDropdown">
                                            <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                            <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                {
                                                    props.canEdit ?
                                                        <li>
                                                            <Link href="/create-channel" customParam={`id=${state.channel.custom_url}`} as={`/create-channel/${state.channel.custom_url}`}>
                                                                <a>
                                                                <span className="material-icons" data-icon="edit"></span>{Translate(props,"Edit")}
                                                            </a>
                                                            </Link>
                                                        </li>
                                                        : null
                                                }
                                                {
                                                    props.canDelete ?
                                                        <li>
                                                            <a href="#" onClick={deleteFn}>
                                                            <span className="material-icons" data-icon="delete"></span>{Translate(props,"Delete")}
                                                        </a>
                                                        </li>
                                                        : null
                                                }
                                                {
                                                    props.canEdit ?
                                                        <li>
                                                            <a href="#"  onClick={analytics}>
                                                                <span className="material-icons" data-icon="show_chart"></span>
                                                                {Translate(props,"Analytics")}
                                                        </a>
                                                        </li>
                                                        : null
                                                }
                                                
                                                {
                                                    props.pageData.appSettings["channels_browse_share"] == 1 ?
                                                    <SocialShare {...props} buttonHeightWidth="30" url={`/channel/${state.channel.custom_url}`} title={CensorWord("fn",props,state.channel.title)} imageSuffix={props.pageData.imageSuffix} media={state.channel.image} />
                                                    : null
                                                }
                                            </ul>
                                        </div>
                                        : null
                                    }
                                </div>
                            </div>
                            <div className="channelInfo">
                                {
                                props.pageData.appSettings["channels_browse_username"] == "1" ?
                                    <span className="username">
                                        <UserTitle className=""  closePopUp={props.closePopUp} {...props} data={state.channel} ></UserTitle>
                                    </span>
                                : null
                                }
                                <span className="channelViewDate">
                                    {
                                        props.pageData.appSettings["channels_browse_views"] == "1" ?                                   
                                        <span>{`${ShortNumber(state.channel.view_count ? state.channel.view_count : 0)}`}{" "}{props.t("view_count", { count: state.channel.view_count ? state.channel.view_count : 0 })}</span>
                                        : null
                                    }
                                    {
                                    props.pageData.appSettings["channels_browse_views"] == "1" && props.pageData.appSettings["channels_browse_datetime"] == "1" ?
                                        <span className="seprater">|</span>
                                    : null
                                    }
                                    {
                                    props.pageData.appSettings["channels_browse_datetime"] == "1" ?
                                        <span><Timeago {...props}>{state.channel.creation_date}</Timeago></span>
                                    : null
                                    }
                                </span>
                            </div>
                            {
                                props.pageData.appSettings['channels_browse_videoscount'] == 1 || props.pageData.appSettings['channels_browse_subscribecount'] == 1  ? 
                            <div className="videono">
                                {
                                    props.pageData.appSettings['channels_browse_videoscount'] == 1 ? 
                                <span>{`${ShortNumber(state.channel.total_videos ? state.channel.total_videos : 0)}`} {" "} {props.t("videos_count", { count: state.channel.total_videos_count ? state.channel.total_videos_count : 0 })}</span>
                                : null
                                }
                                {
                                    props.pageData.appSettings['channels_browse_videoscount'] == 1 && props.pageData.appSettings['channels_browse_subscribecount'] == 1 ? 
                                    <React.Fragment>
                                        &nbsp;&nbsp;|&nbsp;&nbsp;
                                    </React.Fragment>
                                : null
                                }
                                {
                                    props.pageData.appSettings['channels_browse_subscribecount'] == 1 ? 
                                <span>{`${ShortNumber(state.channel.follow_count ? state.channel.follow_count : 0)}`} {" "} {props.t("subscribe_count", { count: state.channel.follow_count ? state.channel.follow_count : 0 })}</span>
                                    : null
                                }
                            </div>
                            : null
                            }
                            {
                                props.pageData.appSettings['channels_browse_subscribe'] == 1 ? 
                                    <ChannelFollow  {...props} className="subscribe" title={state.channel.follower_id ? Translate(props,"Subscribed") : Translate(props,"Subscribe")} type="channels" user={state.channel} user_id={state.channel.follower_id} />
                                : null
                            }
                            <div className="LikeDislikeWrap">
                                <ul className="LikeDislikeList">
                                {
                                props.pageData.appSettings["channels_browse_like"] == "1" ? 
                                    <li>
                                        <Like icon={true} {...props} like_count={state.channel.like_count} item={state.channel} type="channel" id={state.channel.channel_id} />{"  "}
                                    </li>
                                : null
                                }
                                {
                                    props.pageData.appSettings["channels_browse_dislike"] == "1" ? 
                                <li>
                                    <Dislike icon={true} {...props} dislike_count={state.channel.dislike_count} item={state.channel} type="channel" id={state.channel.channel_id} />{"  "}
                                </li>
                                : null
                                }
                                {
                                    props.pageData.appSettings["channels_browse_favourite"] == "1" ? 
                                <li>
                                    <Favourite icon={true} {...props} favourite_count={state.channel.favourite_count} item={state.channel} type="channel" id={state.channel.channel_id} />{"  "}
                                </li>
                                : null
                                }                            
                                </ul>
                            </div>
                        </div>
                    </div>
                :
                <div className="ThumbBox-wrap video-container">
                    <Link href="/channel" customParam={`id=${state.channel.custom_url}`} as={`/channel/${state.channel.custom_url}`}>
                        <a className="ThumbBox-link" onClick={props.closePopUp}>
                            <div className="ThumbBox-coverImg">
                                <span>
                                    <Image className="img-fluid" title={CensorWord("fn",props,state.channel.title)} image={state.channel.image} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                </span>
                            </div>    
                        </a>
                    </Link>
                            <div className="labelBtn">
                            {
                                props.pageData.appSettings['channels_browse_featuredlabel'] == 1 && props.pageData.appSettings['channel_featured'] == 1 && state.channel.is_featured == 1 ?
                                    <span className="lbl-Featured" title={Translate(props,"Featured Channel")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                props.pageData.appSettings['channels_browse_sponsoredLabel'] == 1 && props.pageData.appSettings['channel_sponsored'] == 1 && state.channel.is_sponsored == 1 ?
                                    <span className="lbl-Sponsored" title={Translate(props,"Sponsored Channel")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                props.pageData.appSettings['channels_browse_hotLabel'] == 1 && props.pageData.appSettings['channel_hot'] == 1 && state.channel.is_hot == 1 ?
                                    <span className="lbl-Hot" title={Translate(props,"Hot Channel")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            </div>
                            <div className="ThumbBox-Title hide-on-expand">
                                <div className="title ellipsize2Line">
                                    <h4 className="m-0">{<CensorWord {...props} text={state.channel.title} />}</h4>
                                </div>
                            </div>
                            <div className="ItemDetails">
                                <div className="d-flex justify-content-between VdoTitle ">
                                <Link href="/channel" customParam={`id=${state.channel.custom_url}`} as={`/channel/${state.channel.custom_url}`}>
                                    <a className="ThumbBox-Title-expand d-flex align-items-center" onClick={props.closePopUp}>
                                        <div className="title ellipsize2Line">
                                            <h4 className="m-0">{<CensorWord {...props} text={state.channel.title} />}</h4>
                                        </div>
                                    </a>
                                    </Link>
                                    {
                                    props.canDelete || props.canEdit || props.pageData.appSettings["channels_browse_share"] == 1 ? 
                                        <div className="dropdown TitleRightDropdown">
                                            <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start edit-options">
                                                {
                                                    props.canEdit ?
                                                        <li>
                                                            <Link href="/create-channel" customParam={`id=${state.channel.custom_url}`} as={`/create-channel/${state.channel.custom_url}`}>
                                                                <a>
                                                                <span className="material-icons" data-icon="edit"></span>{Translate(props,"Edit")}
                                                            </a>
                                                            </Link>
                                                        </li>
                                                        : null
                                                }
                                                {
                                                    props.canDelete ?
                                                        <li>
                                                            <a href="#" onClick={deleteFn}>
                                                            <span className="material-icons" data-icon="delete"></span>{Translate(props,"Delete")}
                                                        </a>
                                                        </li>
                                                        : null
                                                }
                                                {
                                                    props.canEdit ?
                                                        <li>
                                                            <a href="#"  onClick={analytics}>
                                                                <span className="material-icons" data-icon="show_chart"></span>
                                                                {Translate(props,"Analytics")}
                                                        </a>
                                                        </li>
                                                        : null
                                                }
                                                
                                                {
                                                    props.pageData.appSettings["channels_browse_share"] == 1 ?
                                                    <SocialShare {...props} buttonHeightWidth="30" url={`/channel/${state.channel.custom_url}`} title={CensorWord("fn",props,state.channel.title)} imageSuffix={props.pageData.imageSuffix} media={state.channel.image} />
                                                    : null
                                                }
                                            </ul>
                                        </div>
                                        : null
                                    }

                                </div>
                                <div className="Vdoinfo d-flex flex-column">
                                    {
                                        props.pageData.appSettings["channels_browse_username"] == "1" ?
                                            <span className="username">
                                                <UserTitle className=""  closePopUp={props.closePopUp} {...props} data={state.channel} ></UserTitle>
                                            </span>
                                        : null
                                    }
                                    <span className="videoViewDate">
                                    {
                                        props.pageData.appSettings["channels_browse_views"] == "1" ?                                   
                                        <span>{`${ShortNumber(state.channel.view_count ? state.channel.view_count : 0)}`}{" "}{props.t("view_count", { count: state.channel.view_count ? state.channel.view_count : 0 })}</span>
                                        : null
                                    }
                                    {
                                    props.pageData.appSettings["channels_browse_views"] == "1" && props.pageData.appSettings["channels_browse_datetime"] == "1" ?
                                        <span className="seprater">|</span>
                                    : null
                                    }
                                    {
                                    props.pageData.appSettings["channels_browse_datetime"] == "1" ?
                                        <span><Timeago {...props}>{state.channel.creation_date}</Timeago></span>
                                    : null
                                    }
                                    </span>
                                </div>
                                <div className="videoViewDate">
                                {
                                    props.pageData.appSettings['channels_browse_videoscount'] == 1 || props.pageData.appSettings['channels_browse_subscribecount'] == 1  ? 
                                        <div className="videono">
                                            {
                                                props.pageData.appSettings['channels_browse_videoscount'] == 1 ? 
                                            <span>{`${ShortNumber(state.channel.total_videos ? state.channel.total_videos : 0)}`} {" "} {props.t("videos_count", { count: state.channel.total_videos_count ? state.channel.total_videos_count : 0 })}</span>
                                            : null
                                            }
                                            {
                                                props.pageData.appSettings['channels_browse_videoscount'] == 1 && props.pageData.appSettings['channels_browse_subscribecount'] == 1 ? 
                                                <React.Fragment>
                                                    &nbsp;&nbsp;|&nbsp;&nbsp;
                                                </React.Fragment>
                                            : null
                                            }
                                            {
                                                props.pageData.appSettings['channels_browse_subscribecount'] == 1 ? 
                                            <span>{`${ShortNumber(state.channel.follow_count ? state.channel.follow_count : 0)}`} {" "} {props.t("subscribe_count", { count: state.channel.follow_count ? state.channel.follow_count : 0 })}</span>
                                                : null
                                            }
                                            
                                        </div>
                                    : null
                                } 
                                </div>
                                {
                                        props.pageData.appSettings['channels_browse_subscribe'] == 1 ? 
                                            <div className="cn-subscribe">
                                                <ChannelFollow  {...props}  hideButton={true} className="subscribe" title={state.channel.follower_id ? Translate(props,"Subscribed") : Translate(props,"Subscribe")} type="channels" user={state.channel} user_id={state.channel.follower_id} />
                                            </div>
                                        : null
                                }
                                <div className="likeDislike-Wrap mt-2">
                                    <ul className="likeDislike-List">
                                    {
                                    props.pageData.appSettings["channels_browse_like"] == "1" ? 
                                        <li>
                                            <Like icon={true} {...props} like_count={state.channel.like_count} item={state.channel} type="channel" id={state.channel.channel_id} />{"  "}
                                        </li>
                                    : null
                                    }
                                    {
                                        props.pageData.appSettings["channels_browse_dislike"] == "1" ? 
                                            <li>
                                                <Dislike icon={true} {...props} dislike_count={state.channel.dislike_count} item={state.channel} type="channel" id={state.channel.channel_id} />{"  "}
                                            </li>
                                    : null
                                    }
                                    {
                                        props.pageData.appSettings["channels_browse_favourite"] == "1" ? 
                                            <li>
                                                <Favourite icon={true} {...props} favourite_count={state.channel.favourite_count} item={state.channel} type="channel" id={state.channel.channel_id} />{"  "}
                                            </li>
                                    : null
                                    }
                                    </ul>
                                </div>
                            </div>
                       
                </div> 
            }
            </React.Fragment>
        )
    }

export default Item;