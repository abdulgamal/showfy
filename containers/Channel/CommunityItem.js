import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index"

import Link from "../../components/Link/index";
import swal from "sweetalert"
import ShortNumber from "short-number"

import Like from "../Like/Index"
import Dislike from "../Dislike/Index"
import axios from "../../axios-orders"
import Timeago from "../Common/Timeago"
import Translate from "../../components/Translate/Index"
const Item = (props) => {
  
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            channel:props.channel,
            post: props.post,
        }
    )
    useEffect(() => {
        if ((props.post && props.post != state.post)) {
            setState({ post: props.post})
        }
    },[props.post])
   

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
                    formData.append('id', state.post.post_id)
                    formData.append('channel_id', state.post.channel_id)
                    const url = "/post/delete"
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
    
        
        var description = state.post.title
        if (description.length > 300) {
            description = description.substring(0, 300);
        } 
        return (
            <React.Fragment>
                <div className="communty-content d-flex">
                    <div className="profileImg">
                        <Link href="/channel" customParam={`id=${state.post.channel_custom_url}`} as={`/channel/${state.post.channel_custom_url}`}>
                            <a>
                                <Image height="40" width="40" title={state.post.channel_name} image={state.post.avtar} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                            </a>
                        </Link>
                    </div>
                    <div className="content flex-grow-1">
                        <div className="postBy"> 
                            <div className="authr">
                                <Link href="/channel" customParam={`id=${state.post.channel_custom_url}`} as={`/channel/${state.post.channel_custom_url}`}>
                                    <a>
                                        {state.post.channel_name}
                                    </a>
                                </Link>
                            </div>
                            <div className="pdate">
                                <Link  href="/post" customParam={`id=${state.post.post_id}`} as={`/post/${state.post.post_id}`}>
                                    <a><Timeago {...props} tile={true}>{state.post.creation_date}</Timeago></a>
                                </Link>
                            </div>
                        </div>
                        {
                            state.channel && (state.channel.canEdit || state.channel.canDelete) ?
                        <div className="options">
                            <div className="LikeDislikeWrap">
                                <ul className="LikeDislikeList">
                                    <li>
                                        <div className="dropdown TitleRightDropdown">
                                            <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_verti"></span></a>
                                            <ul className="dropdown-menu dropdown-menu-right edit-options">
                                            {
                                                state.channel.canEdit ?
                                                <li>
                                                    <a href="#" onClick={(e) => props.adPost(state.post,e)}><span className="material-icons" data-icon="edit"></span>{Translate(props, "Edit")}</a>
                                                </li>
                                                    : null
                                            } 
                                            {
                                                state.channel.canDelete ?
                                                <li>
                                                    <a onClick={deleteFn} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(props, "Delete")}</a>
                                                    </li>
                                                    : null
                                            }
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        : null
                        }
                        <div className="text">
                            {
                                !props.linkify ? 
                            <Link  href="/post" customParam={`id=${state.post.post_id}`} as={`/post/${state.post.post_id}`}>
                                <a className="postImg">
                                    <p>{description}</p>
                                    <div className="community-post-img">
                                        {
                                            state.post.image ? 
                                                <Image lazyLoad={true} image={state.post.image} className="img-fluid" imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                        : null
                                        }
                                    </div>
                                </a>
                            </Link>
                            :
                            <React.Fragment>
                                <p style={{whiteSpace:"pre-line"}} dangerouslySetInnerHTML={{__html:props.linkify(state.post.title)}}></p>
                                {
                                    state.post.image ? 
                                        <div className="community-post-img">
                                            <Image lazyLoad={true} image={state.post.image} className="img-fluid" imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                        </div>
                                    : null
                                }
                            </React.Fragment>
                            }
                        </div>
                        <div className="LikeDislikeWrap">
                            <ul className="LikeDislikeList">
                            
                            <li>
                                <Like icon={true} {...props} like_count={state.post.like_count} item={state.post} type="channel_post" id={state.post.post_id} />{"  "}
                            </li>
                            
                            <li>
                                <Dislike icon={true} {...props} dislike_count={state.post.dislike_count} item={state.post} type="channel_post" id={state.post.post_id} />{"  "}
                            </li>
                          
                            <li>
                                <Link  href="/post" customParam={`id=${state.post.post_id}`} as={`/post/${state.post.post_id}`}>
                                    <a className="community-comment-a">
                                        <span title={props.t("Comments")}><span className="material-icons" data-icon="comment"></span> {`${ShortNumber(state.post.comment_count ? state.post.comment_count : 0)}`}</span>
                                    </a> 
                                </Link>  
                            </li>
                               
                            </ul>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }


export default Item;