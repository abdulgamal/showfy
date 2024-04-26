import React,{useReducer,useEffect,useRef} from 'react'
import UserImage from "../User/Image"
import UserTitle from "../User/Title"
import Timeago from "../Common/Timeago"
import Comment from "../../containers/Comments/Index"
import Link from "../../components/Link/index"
import MemberFollow from "../User/Follow"
import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import SocialShare from "../SocialShare/Index"
import Rating from "../Rating/Index"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import swal from "sweetalert"
import axios from "../../axios-orders"
const CarouselBlogs = dynamic(() => import("./CarouselBlogs"), {
    ssr: false
  }); 
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"
import Plans from "../User/Plans"


const Index = (props) => {
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            blog: props.pageData.blog,
            adult:props.pageData.adultBlog,
            needSubscription:props.pageData.needSubscription,
            plans:props.pageData.plans,
        }
    );
    const stateRef = useRef();
    stateRef.current = state.blog

    
    useEffect(() => {
        if ((props.pageData.blog && props.pageData.blog != state.blog)) {
            setState({ 
                blog: props.pageData.blog, adult:props.pageData.adultBlog,
                needSubscription:props.pageData.needSubscription,
                plans:props.pageData.plans,
            })
        }
    },[props.pageData])
    

    const deleteBlog = (e) => {
        e.preventDefault()
        swal({
            title: Translate(props, "Are you sure?"),
            text: Translate(props, "Once deleted, you will not be able to recover this blog!"),
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
                                swal(Translate(props, "Error", "Something went wrong, please try again later"), "error");
                            } else {
                                props.openToast({message:Translate(props,response.data.message),type: "success"});
                                Router.push(`/dashboard/blogs`)
                            }
                        }).catch(err => {
                            swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }

    useEffect(() => {
        props.socket.on('blogDeleted', data => {
            let id = data.blog_id
            if (stateRef.current && id == stateRef.current.blog_id && (!props.pageData.loggedInUserDetails || data.owner_id != props.pageData.loggedInUserDetails.user_id)) {
                window.location.reload()
            }
        })
        props.socket.on('unfollowUser', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.owner.user_id && type == "members") {
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    if (stateRef.current.owner_id == id) {
                        const data = stateRef.current
                        const owner = data.owner
                        owner.follower_id = null
                        setState({ blog: data })
                    }
                }
            }
        });
        props.socket.on('followUser', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.owner.user_id && type == "members") {
                if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    if (stateRef.current.owner_id == id) {
                        const data = stateRef.current
                        const owner = data.owner
                        owner.follower_id = 1
                        setState({ blog: data })
                    }
                }
            }
        });
        props.socket.on('ratedItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let Statustype = socketdata.type
            let rating = socketdata.rating
            if (stateRef.current && id == stateRef.current.blog_id && type == "blogs") {
                const data = stateRef.current
                data.rating = rating
                setState({ blog: data })
            }
        });
        props.socket.on('unfavouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.blog_id && type == "blogs") {
                if (stateRef.current.blog_id == id) {
                    const data = stateRef.current
                    data.favourite_count = data.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    setState({ blog: data })
                }
            }
        });
        props.socket.on('favouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (stateRef.current && id == stateRef.current.blog_id && type == "blogs") {
                if (stateRef.current.blog_id == id) {
                    const data = stateRef.current
                    data.favourite_count = data.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    setState({ blog: data })
                }
            }
        });


        props.socket.on('likeDislike', socketdata => {
            let itemId = socketdata.itemId
            let itemType = socketdata.itemType
            let ownerId = socketdata.ownerId
            let removeLike = socketdata.removeLike
            let removeDislike = socketdata.removeDislike
            let insertLike = socketdata.insertLike
            let insertDislike = socketdata.insertDislike
            if (stateRef.current && itemType == "blogs" && stateRef.current.blog_id == itemId) {
                const item = stateRef.current
                let loggedInUserDetails = {}
                if (props.pageData && props.pageData.loggedInUserDetails) {
                    loggedInUserDetails = props.pageData.loggedInUserDetails
                }
                if (removeLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['like_count'] = parseInt(item['like_count']) - 1
                }
                if (removeDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['dislike_count'] = parseInt(item['dislike_count']) - 1
                }
                if (insertLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "like"
                    item['like_count'] = parseInt(item['like_count']) + 1
                }
                if (insertDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "dislike"
                    item['dislike_count'] = parseInt(item['dislike_count']) + 1
                }
                setState({ blog: item })
            }
        });

    },[])
    const openReport = (e) => {
        e.preventDefault()
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            props.openReport({status:true,id: state.blog.custom_url, type:'blogs'})
        }
    }
    const replaceTags = (description) => {
        if(!description){
            return description
        }
        description = description.replace(/(<a [^>]*)(target="[^"]*")([^>]*>)/gi, '$1$3');
        description = description.replace(/(<a [^>]*)(>)/gi, '$1 target="_blank" rel="nofollow"$2');
        return description;
    }
    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank" rel="nofollow">
          {text}
        </a>
     );
        return (
            
                <React.Fragment>
                <div className="user-area">
                    <div className="maxwidht1300">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                            {
                                state.blog && state.blog.approve != 1 ? 
                                    <div className="generalErrors  approval-pending">
                                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                            {Translate(props,'This blog still waiting for admin approval.')}
                                        </div>
                                    </div>
                                : null
                                }
                                <div className="blog-details">
                                {
                                    state.adult ?
                                            <div className="adult-wrapper">
                                                {Translate(props,'This blog contains adult content.To view this blog, Turn on adult content setting from site footer.')}
                                            </div>
                                    :
                                    <React.Fragment>
                                    <div className="blog-details-title">
                                        <h1 className="title">
                                            <CensorWord {...props} text={state.blog.title} />
                                        </h1>
                                    </div>
                                    <div className="UserInfo clearfix">
                                        <div className="img">
                                            <UserImage  {...props} data={state.blog.owner} imageSuffix={props.pageData.imageSuffix} />
                                        </div>
                                        <div className="blog_user">
                                            <div className="content">
                                                <span className="userflow">
                                                    <UserTitle  {...props} data={state.blog.owner} className="UserName"></UserTitle>
                                                    {
                                                    props.pageData.loggedInUserDetails &&  state.blog.owner.user_id != props.pageData.loggedInUserDetails.user_id ? 
                                                    <MemberFollow  {...props} type="members" user={state.blog.owner} user_id={state.blog.owner.follower_id} />
                                                    : null
                                                    }
                                                </span>                                            
                                            </div>
                                            <div className="blog_time"><span><Timeago {...props}>{state.blog.creation_date}</Timeago></span> · <span>{state.blog.readingTime.text}</span></div>
                                        </div>
                                    </div>
                                    {
                                                state.blog.category ?
                                                    <div className="categories">
                                                        {
                                                            <Link href={`/category`} customParam={`type=blog&id=${state.blog.category.slug}`} as={`/blog/category/` + state.blog.category.slug}>
                                                                <a >
                                                                    {props.t(state.blog.category.title)}
                                                                </a>
                                                            </Link>
                                                        }
                                                        {
                                                            state.blog.subcategory ?
                                                                <React.Fragment>
                                                                    <Link href={`/category`} customParam={`type=blog&id=${state.blog.subcategory.slug}`} as={`/blog/category/` + state.blog.subcategory.slug}>
                                                                        <a >
                                                                            {`${props.t(state.blog.subcategory.title)}`}
                                                                        </a>
                                                                    </Link>
                                                                    {
                                                                        state.blog.subsubcategory ?
                                                                            <React.Fragment>
                                                                                <Link href={`/category`}  customParam={`type=blog&id=${state.blog.subsubcategory.slug}`} as={`/blog/category/` + state.blog.subsubcategory.slug}>
                                                                                    <a >
                                                                                        {`${props.t(state.blog.subsubcategory.title)}`}
                                                                                    </a>
                                                                                </Link>
                                                                            </React.Fragment>
                                                                            : null
                                                                    }
                                                                </React.Fragment>
                                                                : null
                                                        }
                                                    </div>
                                                    : null
                                            }
                                    <div className="blog-content">
                                        {
                                        state.needSubscription ? 
                                            <div className="details-tab">
                                                <div className={`tab-content tab-pane active show`}>
                                                    <div className="details-tab-box">
                                                        <p className="plan-upgrade-subscribe">
                                                            {
                                                            state.needSubscription.type == "upgrade" ? 
                                                                props.t("To watch more content, kindly upgrade your Subcription Plan.")
                                                                :
                                                                props.t("To watch more content, kindly Subscribe.")
                                                            }
                                                        </p>
                                                        <Plans {...props} userSubscription={state.needSubscription.loggedin_package_id ? true : false} userSubscriptionID={state.needSubscription.loggedin_package_id} itemObj={state.blog} member={state.blog.owner} user_id={state.blog.owner_id} plans={state.plans} />
                                                    </div>
                                                </div>
                                            </div>
                                        : 
                                        <React.Fragment>
                                            {
                                                state.blog.image ?
                                                    <div className="img-fluid mb-3">
                                                        <img className="imgFull400h" src={props.pageData.imageSuffix + state.blog.image} alt={CensorWord("fn",props,state.blog.title)} />
                                                    </div>
                                                    : null
                                            }
                                            <div className="content user-html" dangerouslySetInnerHTML={{ __html: replaceTags(state.blog.description) }}>
                                                
                                            </div>
                                        </React.Fragment>
                                        }
                                        
                                    </div>
                                    {
                                        state.blog.tags && state.blog.tags != "" ?
                                            <div className="blogtagListWrap">
                                                <ul className="blogtagList clearfix">
                                                    {
                                                        state.blog.tags.split(',').map(tag => {
                                                            return (
                                                                <li key={tag}>
                                                                    <Link href="/blogs" customParam={`tag=${tag}`} as={`/blogs?tag=${tag}`}>
                                                                        <a>{<CensorWord {...props} text={props.t(tag)} />}</a>
                                                                    </Link>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                            : null
                                    }

                                    <div className="BlogShareLike blogDetailsBtmCol">
                                    {
                                        state.blog.approve == 1 ? 
                                        <React.Fragment>
                                            <div className="LikeDislikeWrap">
                                                <ul className="LikeDislikeList">
                                                    <li>
                                                        <Like  {...props} icon={true} like_count={state.blog.like_count} item={state.blog} type="blog" id={state.blog.blog_id} />
                                                    </li>
                                                    <li>
                                                        <Dislike  {...props} icon={true} dislike_count={state.blog.dislike_count} item={state.blog} type="blog" id={state.blog.blog_id} />
                                                    </li>
                                                    <li>
                                                        <Favourite  {...props} icon={true} favourite_count={state.blog.favourite_count} item={state.blog} type="blog" id={state.blog.blog_id} />
                                                    </li>
                                                    <SocialShare  hideTitle={true} {...props} tags={state.blog.tags} url={`/blog/${state.blog.custom_url}`} title={CensorWord("fn",props,state.blog.title)} imageSuffix={props.pageData.imageSuffix} media={state.blog.image} />
                                                <div className="dropdown TitleRightDropdown">
                                                    <a href="#" data-bs-toggle="dropdown"><span className="material-icons" data-icon="more_vert"></span></a>
                                                    <ul className="dropdown-menu dropdown-menu-right edit-options">
                                                    {
                                                        state.blog.canEdit ?
                                                        <li>
                                                            <Link href="/create-blog" customParam={`id=${state.blog.custom_url}`} as={`/create-blog/${state.blog.custom_url}`}>
                                                                <a><span className="material-icons" data-icon="edit"></span>{Translate(props, "Edit")}</a>
                                                            </Link>
                                                            </li>
                                                            : null
                                                    }
                                                    {
                                                        state.blog.canDelete ?
                                                        <li>
                                                            <a onClick={deleteBlog} href="#"><span className="material-icons" data-icon="delete"></span>{Translate(props, "Delete")}</a>
                                                            </li>
                                                            : null
                                                    }
                                                     {
                                                        state.blog.approve == 1 && !state.blog.canEdit ? 
                                                    <li>
                                                        <a href="#" onClick={openReport}>
                                                            <span className="material-icons" data-icon="flag"></span>
                                                            {Translate(props, "Report")}
                                                        </a>
                                                    </li>
                                                     : null
                                                    }
                                                    </ul>
                                                </div>
                                                </ul>
                                            </div>
                                        
                                        {
                                            !state.needSubscription && props.pageData.appSettings[`${"blog_rating"}`] == 1 ?
                                                <div className="animated-rater">
                                                    <Rating {...props} rating={state.blog.rating} type="blog" id={state.blog.blog_id} />
                                                </div>
                                                : null
                                        }
                                        </React.Fragment>
                                        : null
                                    }
                                        

                                       
                                    </div>
                                    </React.Fragment>
                                }
                                    {
                                        props.pageData.relatedBlogs ?
                                            <CarouselBlogs {...props}  {...props} carouselType="blog" blogs={props.pageData.relatedBlogs} />
                                            : null
                                    }
                                {
                                    !state.adult && state.blog.approve == 1 ?
                                    <div className="blog-comment container">
                                        <div className="row">
                                            <div className="col-sm-12 col-12">
                                                <Comment {...props}  owner_id={state.blog.owner_id} appSettings={props.pageData.appSettings} commentType="blog" type="blogs" comment_item_id={state.blog.blog_id} />
                                            </div>
                                        </div>
                                    </div>
                                : null
                                }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </React.Fragment>
        )
    }



export default Index