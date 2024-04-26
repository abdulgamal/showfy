import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index"

import UserTitle from "../User/Title"
import Link from "../../components/Link/index";

import SocialShare from "../SocialShare/Index"

import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import swal from "sweetalert"
import axios from "../../axios-orders"
import striptags from "striptags"
import Timeago from "../Common/Timeago"
import Translate from "../../components/Translate/Index"
import ShortNumber from "short-number"
import Analytics from "../Dashboard/StatsAnalytics"
import CensorWord from "../CensoredWords/Index"

const Index = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            blog: props.result
        }
    );
    useEffect(()=>{
        if (props.result && props.result != state.blog) {
            setState({ blog: props.result })
        }
    },[props.result])
    
    const deleteFn = (e) => {
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
                    formData.append('id', state.blog.custom_url)
                    const url = "/blogs/delete"
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
                            <Analytics {...props} id={state.blog.blog_id} type="blogs" />
                        </div>
                    </div>
                </div>
            </div>
        }
        let description = striptags(state.blog.description)
        if (description.length > 300) {
            description = description.substring(0, 300);
        }
        return (
            <React.Fragment>
                {analyticsData}
                <div className="snglblog-block clearfix" key={state.blog.blog_id}>
                    <div className="blogImgWrap">
                        <Link href={`/blog`} customParam={`id=${state.blog.custom_url}`} as={`/blog/${state.blog.custom_url}`}>
                            <a className="blogImg"  onClick={props.closePopUp}>
                                <Image image={state.blog.image} title={<CensorWord {...props} text={state.blog.title} />} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />

                            </a>
                        </Link>

                        <div className="lbletop">

                            {
                                props.pageData.appSettings['blogs_browse_featuredlabel'] == 1 && props.pageData.appSettings['blog_featured'] == 1 && state.blog.is_featured == 1 ?
                                    <span className="lbl-Featured" title={Translate(props, "Featured Blog")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                props.pageData.appSettings['blogs_browse_sponsoredLabel'] == 1 && props.pageData.appSettings['blog_sponsored'] == 1 && state.blog.is_sponsored == 1 ?
                                    <span className="lbl-Sponsored" title={Translate(props, "Sponsored Blog")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                            {
                                props.pageData.appSettings['blogs_browse_hotLabel'] == 1 && props.pageData.appSettings['blog_hot'] == 1 && state.blog.is_hot == 1 ?
                                    <span className="lbl-Hot" title={Translate(props, "Hot Blog")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-award"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                    </span>
                                    : null
                            }
                        </div>
                    </div>


                    
                    <div className={`blogContent${props.canDelete || props.canEdit  || props.pageData.appSettings["blogs_browse_share"] == 1 ? " edit-blog-btn" : ""}`}>                        
                        <Link href={`/blog`} customParam={`id=${state.blog.custom_url}`} as={`/blog/${state.blog.custom_url}`}>
                            <a className="blogTitle"  onClick={props.closePopUp}>{CensorWord("fn",props,state.blog.title)}</a>
                        </Link>
                        {
                                    props.canDelete || props.canEdit || props.pageData.appSettings["blogs_browse_share"] == 1 ? 
                                <div className="dropdown TitleRightDropdown">
                                    <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                    <ul className="dropdown-menu dropdown-menu-right edit-options">
                                    {
                                        props.canEdit ?
                                        <li>
                                            <Link href="/create-blog" customParam={`id=${state.blog.custom_url}`} as={`/create-blog/${state.blog.custom_url}`}>
                                                <a className="addPlaylist addEdit" title={Translate(props, "Edit")}>
                                                <span className="material-icons" data-icon="edit"></span>{Translate(props, "Edit")}
                                                </a>
                                            </Link>
                                            </li>
                                            : null
                                    }
                                    {
                                        props.canDelete ?
                                        <li>
                                            <a className="addPlaylist addDelete"  title={Translate(props, "Delete")} href="#" onClick={deleteFn}>
                                                <span className="material-icons" data-icon="delete"></span>
                                                {Translate(props, "Delete")}
                                            </a>
                                            </li>
                                            : null
                                    }
                                    {
                                        props.canEdit ?
                                        <li>
                                            <a href="#" className="addPlaylist addEdit"  onClick={analytics} title={Translate(props, "Analytics")}>
                                                <span className="material-icons" data-icon="show_chart"></span>
                                                    {Translate(props, "Analytics")}
                                            </a>
                                            </li>
                                            : null
                                    }
                                    {
                                        props.pageData.appSettings['blogs_browse_share'] == 1 ?
                                            <SocialShare {...props} buttonHeightWidth="30" round="true" tags={state.blog.tags} url={`/blog/${state.blog.custom_url}`} title={CensorWord("fn",props,state.blog.title)} imageSuffix={props.pageData.imageSuffix} media={state.blog.image} />
                                            : null
                                    }
                                    </ul>
                                </div>
                                : null
                            }
                    </div>
                    
                    <div className="blogFootr">
                    {
                            props.pageData.appSettings['blogs_browse_username'] == 1 ?
                                <div className="authorDate">
                                        {
                                            props.pageData.appSettings['blogs_browse_username'] == 1 ?
                                                <React.Fragment>
                                                    <UserTitle childPrepend={true}  closePopUp={props.closePopUp} className="UserName" data={state.blog} ></UserTitle>
                                                </React.Fragment>
                                                : null
                                        }
                                </div>
                                : null
                        }
                    {
                                    props.pageData.appSettings["blogs_browse_views"] == 1 || props.pageData.appSettings["blogs_browse_datetime"] ? 
                            <span className="videoViewDate">
                                {
                                    props.pageData.appSettings["blogs_browse_views"] == 1  ? 
                                <span>{`${ShortNumber(state.blog.view_count ? state.blog.view_count : 0)}`}{" "}{props.t("view_count", { count: state.blog.view_count ? state.blog.view_count : 0 })}</span>
                                : null
                                }
                                 {
                            props.pageData.appSettings["blogs_browse_views"] == "1" && props.pageData.appSettings["blogs_browse_datetime"] == "1" ?
                                <span className="seprater">|</span>
                            : null
                            }
                                {
                                    props.pageData.appSettings["blogs_browse_datetime"] == 1  ? 
                                        <span><Timeago {...props}>{state.blog.creation_date}</Timeago></span>
                                    : null
                                }
                            </span>
                    : null
                    }
                    <div className="LikeDislikeWrap">
                        <ul className="LikeDislikeList">
                                
                                {
                                    props.pageData.appSettings['blogs_browse_like'] == 1 ?
                                        <li>
                                            <Like icon={true} {...props} like_count={state.blog.like_count} item={state.blog} type="blog" id={state.blog.blog_id} />{"  "}
                                        </li>
                                        : null
                                }
                                {
                                    props.pageData.appSettings['blogs_browse_dislike'] == 1 ?
                                        <li>
                                            <Dislike icon={true} {...props} dislike_count={state.blog.dislike_count} item={state.blog} type="blog" id={state.blog.blog_id} />{"  "}
                                        </li>
                                        : null
                                }
                                {
                                    props.pageData.appSettings['blogs_browse_favourite'] == 1 ?
                                        <li>
                                            <Favourite icon={true} {...props} favourite_count={state.blog.favourite_count} item={state.blog} type="blog" id={state.blog.blog_id} />{"  "}
                                        </li>
                                        : null
                                }
                                
                               </ul>
                            </div>
                            
                        

                    </div>
                </div>
            </React.Fragment>
        )
    }
export default Index