import React,{useReducer,useEffect,useRef} from 'react'
import Create from "./Create"

import CommentLi from "./CommentLi"

import axios from "../../axios-orders"

import swal from "sweetalert"
import ReactMediumImg from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import Translate from "../../components/Translate/Index"

import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import AdsIndex from "../Ads/Index"

const Comment = (props) => {
   

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            comments: props.comments ? props.comments : [],
            id: props.comment_item_id,
            type: props.type,
            owner_id: props.owner_id,
            page: 1,
            subtype: props.subtype ? props.subtype : "",
            error: null,
            pagging: typeof props.paggingComment != "undefined" ? props.paggingComment : true,
            submitting: false,
            replyCommentId: 0,
            replyImage: null,
            commentImage: null,
            replyMessage: "",
            commentMessage: "",
            fetchingComments: true,
            editMessage: "",
            editImage: null,
            edit_comment_id: 0,
            edit_reply_comment_id: 0,
            search:"newest",
            approved:"approved"
        }
    );
    const stateRef = useRef();
    stateRef.current = state

    useEffect(() => {
        if (props.commentType != "channel_post" && props.appSettings[(stateRef.current.subtype  ? stateRef.current.subtype  : "")+ props.commentType + "_comment"] != 1) {
            return
        }
        getContent();
    },[state.id,state.type])

    useEffect(() => {
        if (props.comment_item_id != stateRef.current.id || props.type != stateRef.current.type) {
            if (props.appSettings[(props.subtype ? props.subtype : "") + props.commentType + "_comment"] != 1) {
                return
            }
            setState({
                comments: [],
                page: 1,
                subtype: props.subtype ? props.subtype : "",
                id: props.comment_item_id,
                type: props.type,
                owner_id: props.owner_id,
                error: null,
                pagging: true,
                submitting: false,
                replyCommentId: 0,
                replyImage: null,
                commentImage: null,
                replyMessage: "",
                commentMessage: "",
                fetchingComments: true,
                editMessage: "",
                editImage: null,
                edit_comment_id: 0,
                edit_reply_comment_id: 0,
                search:"newest",
                approved:"approved"
            })
        }
    },[props.comment_item_id,props.type])
   
    
    
    const replaceTags = (description) => {
        description = description.replace(/(<a [^>]*)(target="[^"]*")([^>]*>)/gi, '$1$3');
        description = description.replace(/(<a [^>]*)(>)/gi, '$1 target="_blank" rel="nofollow"$2');
        return description;
    }
    const getContent = () => {
        var id = stateRef.current.id
        var type = stateRef.current.type
        if (id && type && !stateRef.current.getComment) {
            const formData = new FormData()
            formData.append('page', stateRef.current.page)
            if (stateRef.current.search)
                formData.append('search', stateRef.current.search)
            formData.append("approved",stateRef.current.approved)
            let url = '/comments/' + id + "/" + type;
            setState({ error: null,getComment:true });
            axios.post(url, formData)
                .then(response => {
                    if (response.data.error) {
                        setState({getComment:false, error: response.data.error, fetchingComments: false });
                    } else {
                        if (state.page == 1) {
                            setState({getComment:false,page: 2,comments:response.data.comments,pagging: response.data.pagging,fetchingComments: false, error: null})
                        } else {
                            setState({getComment:false,fetchingComments: false, error: null, page: stateRef.current.page + 1, pagging: response.data.pagging, comments: [...stateRef.current.comments, ...response.data.comments] })
                        }
                    }
                }).catch(err => {
                    setState({ fetchingComments: false, error: err });
                });
        }
    }
   

    useEffect(() => {
        if (props.commentType != "channel_post" && props.appSettings[(stateRef.current.subtype  ? stateRef.current.subtype  : "")+ props.commentType + "_comment"] != 1) {
            return
        }
        // getContent()
        if(!props.comments || props.comments.length == 0){
            // getContent();
            props.socket.on('commentCreated', data => {
                let id = data.id;
                let type = data.type
                let owner_id = data.owner_id
                let approve = data.approved

                let loggedinuserid = 0
                if(props.pageData.loggedInUserDetails){
                    loggedinuserid = props.pageData.loggedInUserDetails.user_id
                }
                if (id == stateRef.current.id && type == stateRef.current.type) {
                    if(approve == 1 || owner_id == loggedinuserid){
                        const comment = data.comment
                        if (comment) {
                            setState({ comments: [comment, ...stateRef.current.comments] })
                        }
                    }
                }
            });
        }else{
            if(stateRef.current.id){
                $('html, body').animate({
                    'scrollTop' : $(`#comment-`+stateRef.current.id).position().top
                });
            }
        }
        
        props.socket.on('deleteComment', data => {
            let id = data.id;
            let type = data.type
            if (id == stateRef.current.id && type == stateRef.current.type) {
                const comment_id = data.comment_id
                const commentIndex = getComment(comment_id)
                if (commentIndex > -1) {
                    const comments = [...stateRef.current.comments]
                    comments.splice(commentIndex, 1);
                    setState({ comments: comments })
                }
            }
        });

        props.socket.on('deleteReply', data => {
            let id = data.id;
            let type = data.type
            if (id == stateRef.current.id && type == stateRef.current.type) {
                const comment_id = data.comment_id
                const reply_id = data.reply_id
                const commentIndex = getComment(comment_id)
                if (commentIndex > -1) {
                    const comments = [...stateRef.current.comments]
                    let commentReplies = comments[commentIndex]['replies']
                    if (!commentReplies)
                        return
                    const replyIndex = getReplies(reply_id, commentReplies["reply"])
                    if (replyIndex > -1) {
                        commentReplies['reply'].splice(replyIndex, 1);
                        setState({ comments: comments })
                    }
                }
            }
        });

        props.socket.on('commentEdited', data => {
            let id = data.id;
            let type = data.type
            if (id == stateRef.current.id && type == stateRef.current.type) {
                const comment_id = data.comment_id
                const commentIndex = getComment(comment_id)
                if (commentIndex > -1) {
                    const comments = [...stateRef.current.comments]
                    comments[commentIndex]['message'] = data.comment.message
                    comments[commentIndex]['image'] = data.comment.image
                    setState({ comments: comments })
                }
            }
        });
        props.socket.on('replyEdited', data => {
            let id = data.id;
            let type = data.type
            if (id == stateRef.current.id && type == stateRef.current.type) {
                const comment_id = data.comment_id
                const commentIndex = getComment(comment_id)
                const id = data.reply_id
                if (commentIndex > -1) {
                    let comments = [...stateRef.current.comments]
                    let replies = comments[commentIndex]['replies']
                    if (!replies)
                        return
                    replies = replies['reply']
                    const replyIndex = getReplies(id, replies)
                    if (replyIndex > -1) {
                        replies[replyIndex]['message'] = data.comment.message
                        replies[replyIndex]['image'] = data.comment.image
                        setState({ comments: comments })
                    }
                }
            }
        });
        props.socket.on('replyCreated', data => {
            let id = data.id;
            let type = data.type
            if (id == stateRef.current.id && type == stateRef.current.type) {
                const comment = data.comment
                const id = data.comment_id

                let owner_id = data.owner_id
                let approve = data.approved

                let loggedinuserid = 0
                if(props.pageData.loggedInUserDetails){
                    loggedinuserid = props.pageData.loggedInUserDetails.user_id
                }

                if (comment && id) {
                    if(approve == 1 || owner_id == loggedinuserid){
                        const commentIndex = getComment(id)
                        if (commentIndex > -1) {
                            let comments = [...stateRef.current.comments]
                            let replies = comments[commentIndex]['replies']
                            if (!replies) {
                                replies = {}
                                replies.reply = []
                            }
                            replies.reply = [comment, ...replies.reply]
                            comments[commentIndex]['replies'] = replies
                            setState({ comments: comments })
                        }
                    }
                }
            }
        });

        props.socket.on('likeDislike', data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId = data.ownerId
            let reply_comment_id = data.reply_comment_id
            let removeLike = data.removeLike
            let removeDislike = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike = data.insertDislike
            if (itemType == "comments") {
                if (reply_comment_id) {
                    const commentIndex = getComment(reply_comment_id)
                    if (commentIndex > -1) {
                        let comments = [...stateRef.current.comments]
                        let replies = comments[commentIndex]['replies']
                        if (!replies)
                            return
                        let repliesData = replies['reply']
                        let replyIndex = getReplies(itemId, repliesData)
                        if (replyIndex > -1) {
                            let loggedInUserDetails = {}
                            if (props.pageData && props.pageData.loggedInUserDetails) {
                                loggedInUserDetails = props.pageData.loggedInUserDetails
                            }
                            if (removeLike) {
                                if (loggedInUserDetails.user_id == ownerId)
                                    repliesData[replyIndex]['like_dislike'] = null
                                repliesData[replyIndex]['like_count'] = parseInt(repliesData[replyIndex]['like_count']) - 1
                            }
                            if (removeDislike) {
                                if (loggedInUserDetails.user_id == ownerId)
                                    repliesData[replyIndex]['like_dislike'] = null
                                repliesData[replyIndex]['dislike_count'] = parseInt(repliesData[replyIndex]['dislike_count']) - 1
                            }
                            if (insertLike) {
                                if (loggedInUserDetails.user_id == ownerId)
                                    repliesData[replyIndex]['like_dislike'] = "like"
                                repliesData[replyIndex]['like_count'] = parseInt(repliesData[replyIndex]['like_count']) + 1
                            }
                            if (insertDislike) {
                                if (loggedInUserDetails.user_id == ownerId)
                                    repliesData[replyIndex]['like_dislike'] = "dislike"
                                repliesData[replyIndex]['dislike_count'] = parseInt(repliesData[replyIndex]['dislike_count']) + 1
                            }
                            comments[commentIndex]['replies'] = replies
                            setState({ comments: comments })
                        }
                    }
                } else {
                    const commentIndex = getComment(itemId)
                    if (commentIndex > -1) {
                        let commentData = [...stateRef.current.comments]
                        let loggedInUserDetails = {}
                        if (props.pageData && props.pageData.loggedInUserDetails) {
                            loggedInUserDetails = props.pageData.loggedInUserDetails
                        }
                        if (removeLike) {
                            if (loggedInUserDetails.user_id == ownerId)
                                commentData[commentIndex]['like_dislike'] = null
                            commentData[commentIndex]['like_count'] = parseInt(commentData[commentIndex]['like_count']) - 1
                        }
                        if (removeDislike) {
                            if (loggedInUserDetails.user_id == ownerId)
                                commentData[commentIndex]['like_dislike'] = null
                            commentData[commentIndex]['dislike_count'] = parseInt(commentData[commentIndex]['dislike_count']) - 1
                        }
                        if (insertLike) {
                            if (loggedInUserDetails.user_id == ownerId)
                                commentData[commentIndex]['like_dislike'] = "like"
                            commentData[commentIndex]['like_count'] = parseInt(commentData[commentIndex]['like_count']) + 1
                        }
                        if (insertDislike) {
                            if (loggedInUserDetails.user_id == ownerId)
                                commentData[commentIndex]['like_dislike'] = "dislike"
                            commentData[commentIndex]['dislike_count'] = parseInt(commentData[commentIndex]['dislike_count']) + 1
                        }
                        setState({ comments: commentData })
                    }
                }
            }
        });
    },[])
    const refreshContent = () => {
        setState({ page: 1, comments: [] })
        loadMoreContent()
    }
    const loadMoreContent = () => {
        setState({ fetchingComments: true })
        getContent()
    }
    const loadMoreReplies = (comment_id) => {
        var id = state.id
        var type = state.type
        if (id && type) {
            const formData = new FormData()
            formData.append('comment_id', comment_id)
            let url = '/replies/' + id + "/" + type;

            const commentIndex = getComment(comment_id)
            if (commentIndex > -1) {
                let comments = [...state.comments]
                let replies = comments[commentIndex]['replies']
                replies.loading = true

                if (replies.page) {
                    formData.append('page', replies.page)
                } else {
                    formData.append('page', 2)
                }
                setState({ comments: comments })
            }
            formData.append("approved",state.approved)
            axios.post(url, formData)
                .then(response => {
                    if (response.data.error) {
                        //setState({error:response.data.error,submitting:false});
                    } else {
                        
                        //get comment index
                        const commentIndex = getComment(comment_id)
                        if (commentIndex > -1) {
                            let comments = [...state.comments]
                            let replies = comments[commentIndex]['replies']
                            replies.pagging = response.data.pagging
                            replies.loading = false
                            replies.reply = [...replies.reply, ...response.data.reply]
                            if (replies.page) {
                                replies.page = replies.page + 1
                            } else {
                                replies.page = 3
                            }
                            comments[commentIndex]['replies'] = replies
                            setState({submitting: false, error: null , comments: comments })
                        }
                    }
                }).catch(err => {
                    setState({ submitting: false, error: err });
                });
        }
    }
    const getReplies = (reply_id, replies) => {
        const replyIndex = replies.findIndex(p => p.comment_id == reply_id);
        return replyIndex;
    }
    const getComment = (comment_id) => {
        const comments = [...stateRef.current.comments];
        const commentIndex = comments.findIndex(p => p.comment_id == comment_id);
        return commentIndex;
    }
    const replyClick = (comment_id) => {
        if (state.replyPosting)
            return;
        if (comment_id == state.replyCommentId) {
            setState({ replyCommentId: 0, replyMessage: "", replyImage: null })
        } else {
            if (comment_id != state.replyCommentId) {
                setState({ replyMessage: "", replyImage: null })
            }
            setState({ replyCommentId: comment_id })
        }
    }
    const selectedImage = (comment_id, e) => {
        if (comment_id && state.replyPosting) {
            setState({ replyImage: e.target.value })
        } else if (!state.commentPosting) {
            setState({ commentImage: e.target.value })
        }
    }
    const textChange = (isReply, e) => {
        if (isReply && !state.replyPosting) {
            setState({ replyMessage: e.target.value })
        } else if (!state.commentPosting) {
            setState({ commentMessage: e.target.value })
        }
    }
    const createComment = (isReply, comment_id, e) => {
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            const formData = new FormData()
            formData.append('id', state.id)
            formData.append('type', state.type)
            if (isReply) {
                if(state.replyPosting){
                    return
                }
                if (state.replyImage || state.replyMessage) {
                    if((!state.replyMessage.trim()) && !state.replyImage){
                        return
                    }
                    formData.append("parent_id", comment_id)
                    formData.append('message', state.replyMessage)
                    formData.append('image', state.replyImage)
                    setState({ replyPosting: true })
                } else {
                    return
                }
            } else {
                if((!state.commentMessage.trim()) && !state.commentImage){
                    return
                }
                if(state.commentPosting){
                    return
                }
                if (state.commentImage || state.commentMessage) {
                    formData.append('message', state.commentMessage)
                    formData.append('image', state.commentImage)
                    setState({ commentPosting: true })
                } else {
                    return
                }
            }

            let url = '/comments/create'

            axios.post(url, formData)
                .then(response => {
                    if (response.data.error) {
                        setState({commentPosting:false,replyPosting:false,error:response.data.err})
                        swal("Error", response.data.error[0].message, "error");
                    } else {
                        setState({ submitting: false, error: null })
                        if (isReply) {
                            setState({ replyImage: null, replyMessage: "", replyPosting: false, replyCommentId: 0 })
                        } else {
                            setState({ commentImage: null, commentMessage: "", commentPosting: false })
                        }
                    }
                }).catch(err => {
                    setState({commentPosting:false,replyPosting:false})
                    swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                });
        }
    }
    const removeImage = (isReply, e) => {
        if (isReply) {
            setState({ replyImage: null })
        } else {
            setState({ commentImage: null })
        }
    }
    const changeImage = (comment_id, picture) => {
        let aiImage = null;
        var ext;
        if (typeof picture === "string") {
            aiImage = picture
             ext = picture.substring(picture.lastIndexOf('.') + 1).toLowerCase();
        } else {
            var url = picture.target.value;
             ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        }
        
        if ((ext === "png" || ext === "jpeg" || ext === "webp" || ext === "jpg" || ext === 'PNG' || ext === 'JPEG' || ext === 'JPG' || ext === 'gif' || ext === 'GIF')) {
            if (!comment_id)
                setState({ commentImage: aiImage ? aiImage : picture.target.files[0], commentImageDelete: true });
            else
                setState({ replyImage: aiImage ? aiImage : picture.target.files[0], replyImageDelete: true });
        } else {
            if (!comment_id)
                setState({ commentImage: null, commentImageDelete: true });
            else
                setState({ replyImage: null, replyImageDelete: true });
        }
    }
    const likeBtn = (comment_id, isReply) => {
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            const formData = new FormData()
            formData.append('id', comment_id)
            if (isReply)
                formData.append('reply_comment_id', isReply)
            formData.append('type', "comments")
            formData.append('action', 'like')
            formData.append('subType', props.commentType)
            let url = '/likes'
            axios.post(url, formData)
                .then(response => {

                }).catch(err => {
                    //setState({submitting:false,error:err});
                });
        }
    }
    const disLikeBtn = (comment_id, isReply) => {
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            const formData = new FormData()
            formData.append('id', comment_id)
            formData.append('type', "comments")
            formData.append('action', 'dislike')
            formData.append('subType', props.commentType)
            if (isReply)
                formData.append('reply_comment_id', isReply)
            let url = '/likes'
            axios.post(url, formData)
                .then(response => {

                }).catch(err => {
                    //setState({submitting:false,error:err});
                });
        }
    }
    const editComment = (comment_id, isReply) => {
        if (comment_id) {
            //reply
            const comments = [...state.comments]
            const commentIndex = getComment(comment_id)
            if (commentIndex > -1) {
                const replies = comments[commentIndex]['replies']['reply']
                const replyIndex = getReplies(isReply, replies)
                if (replyIndex > -1) {
                    const reply = replies[replyIndex]
                    setState({ editing: true, editMessage: reply.message, editImage: (reply.image ? props.pageData.imageSuffix + reply.image : null), edit_comment_id: comment_id, edit_reply_comment_id: isReply })
                }
            }
        } else {
            //comment
            const comments = [...state.comments]
            const commentIndex = getComment(isReply)
            if (commentIndex > -1) {
                const comment = comments[commentIndex]
                setState({ editing: true, editMessage: comment.message, editImage: (comment.image ? props.pageData.imageSuffix + comment.image : null), edit_comment_id: isReply, edit_reply_comment_id: 0 })
            }
        }
    }
    const postEditComment = () => {
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            const formData = new FormData()
            formData.append('id', state.id)
            formData.append('type', state.type)
            if(state.commentPosting){
                return;
            }
            if (state.edit_reply_comment_id) {
                if (state.editImage || state.editMessage || state.removeEditImage) {
                    formData.append("parent_id", state.edit_comment_id)
                    formData.append('comment_id', state.edit_reply_comment_id)
                    formData.append('message', state.editMessage)
                    formData.append('image', state.editImage)
                    if (state.removeEditImage)
                        formData.append('remove_image', state.removeEditImage)
                    setState({ commentPosting: true })
                } else {
                    return
                }
            } else {
                if (state.editImage || state.editMessage || state.removeEditImage) {
                    formData.append('message', state.editMessage)
                    formData.append('comment_id', state.edit_comment_id)
                    formData.append('image', state.editImage)
                    if (state.removeEditImage)
                        formData.append('remove_image', state.removeEditImage)
                    setState({ commentPosting: true })
                } else {
                    return
                }
            }
            formData.append("fromedit",1);
            let url = '/comments/create'

            axios.post(url, formData)
                .then(response => {
                    setState({ commentPosting: false })
                    if (response.data.error) {
                        swal("Error", response.data.error[0].message, "error");
                    } else {
                        setState({ editing: false, editMessage: "", editImage: null, edit_comment_id: 0, edit_reply_comment_id: 0, removeEditImage: false })
                    }
                }).catch(err => {
                    //setState({submitting:false,error:err});
                });
        }
    }
    const textEditChange = (isReply, e) => {
        setState({ editMessage: e.target.value })
    }
    const removeEditImage = (isReply, e) => {
        setState({ editImage: null, removeEditImage: true })
    }
    const changeEditImage = (comment_id, picture) => {
        let aiImage = null;
        var ext;
        if (typeof picture === "string") {
            aiImage = picture
             ext = picture.substring(picture.lastIndexOf('.') + 1).toLowerCase();
        } else {
            var url = picture.target.value;
            ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        }
        if ((ext === "png" || ext === "webp" || ext === "jpeg" || ext === "jpg" || ext === 'PNG' || ext === 'JPEG' || ext === 'JPG' || ext === 'gif' || ext === 'GIF')) {
            setState({ editImage: aiImage ? aiImage : picture.target.files[0], removeEditImage: true });
        } else {
            setState({ editImage: null, removeEditImage: true });
        }
    }
    const closeEditPopup = () => {
        setState({ editing: false, editMessage: "", editImage: null, edit_comment_id: 0, edit_reply_comment_id: 0 })
    }
    const deleteComment = (comment_id, isReply) => {
        let delete_comment_id = 0
        let delete_reply_id = 0
        if (comment_id) {
            delete_comment_id = comment_id
            delete_reply_id = isReply
        } else {
            delete_comment_id = isReply
        }
        swal({
            title: Translate(props, "Are you sure?"),
            text: Translate(props, "Once deleted, you will not be able to recover this!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    //swal("Error", "Something went wrong, please try again later\nsf", "error");
                    const formData = new FormData()
                    formData.append('comment_id', delete_comment_id)
                    formData.append('reply_id', delete_reply_id)
                    formData.append('id', state.id)
                    formData.append('type', state.type)

                    const url = "/comments/delete"

                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {

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
    const changeSearch = (e) => {
        setState({ search: e.target.value, page: 1, fetchingComments: true, comments: [] })
        setTimeout(() => {
            getContent()
        },200)

    }
    const changeModeration = (e) => {
        setState({ approved: e.target.value, page: 1, fetchingComments: true, comments: [] })
        setTimeout(() => {
            getContent()
        },200)
    }
    const approve = (comment_id, isReply) => {
        const formData = new FormData()
        
        if (isReply){
            formData.append('id', isReply)
            formData.append('reply_comment_id', comment_id)
        }else{
            formData.append("id",comment_id)
        }
        formData.append('type', props.commentType)
        let url = '/comments/approve'
        if(isReply){
            const reply_id = comment_id
            const commentIndex = getComment(isReply)
            if (commentIndex > -1) {
                let comments = [...state.comments]
                let commentReplies = comments[commentIndex]['replies']
                if (!commentReplies)
                    return
                const replyIndex = getReplies(reply_id, commentReplies["reply"])
                if (replyIndex > -1) {
                    commentReplies['reply'].splice(replyIndex, 1);
                    setState({ comments: comments })
                }
            }
        }else{
            const commentIndex = getComment(comment_id)
            if (commentIndex > -1) {
                const comments = [...state.comments]
                comments.splice(commentIndex, 1);
                setState({ comments: comments })
            }
        }
        
        axios.post(url, formData)
            .then(response => {

            }).catch(err => {
                
            });
    }
        
        if (props.commentType != "channel_post" && props.appSettings[(state.subtype ? state.subtype : "") + props.commentType + "_comment"] != 1) {
            return null
        }

        let moderation = null
        if (props.pageData && props.pageData.loggedInUserDetails) {
            if(state.owner_id == props.pageData.loggedInUserDetails.user_id && props.pageData.appSettings['enable_comment_approve'] == 1){
                moderation = <select onChange={changeModeration.bind(this)} value={state.approved}><option value="approved">{Translate(props,"Published Comments")}</option><option value="needreview">{Translate(props,"Held for review")}</option></select>
            }
        }

        const comments = state.comments.map(comment => {
            let reply = null
            let replyLoading = false
            if (comment.replies) {
                reply = comment.replies.reply.map(reply => {
                    return <CommentLi {...props} approveCommentType={state.approved} moderation={moderation} approve={approve} replaceTags={replaceTags} key={reply.comment_id} keyName={reply.comment_id} ReactMediumImg={ReactMediumImg} deleteComment={deleteComment} editComment={editComment} like={likeBtn} dislike={disLikeBtn} replyClick={replyClick} comment={comment} imageSuffix={props.pageData.imageSuffix} data={reply} commentType={props.commentType} appSettings={props.appSettings} />
                })
                replyLoading = comment.replies.pagging
            }
            let canShowReplyForm = false
            if (state.replyCommentId == comment.comment_id)
                canShowReplyForm = true
            return (
                <CommentLi {...props} moderation={moderation} approveCommentType={state.approved}  approve={approve} replaceTags={replaceTags}  key={comment.comment_id} keyName={comment.comment_id} ReactMediumImg={ReactMediumImg} deleteComment={deleteComment} editComment={editComment} like={likeBtn} dislike={disLikeBtn}  posting={state.replyPosting} createComment={createComment} message={state.replyMessage} textChange={textChange} removeImage={removeImage} changeImage={changeImage} image={state.replyImage} data={comment} create={canShowReplyForm} replyClick={replyClick} loadMoreReplies={loadMoreReplies} imageSuffix={props.pageData.imageSuffix}  reply={reply} replyLoading={replyLoading} commentType={props.commentType} appSettings={props.appSettings} />
            )
        })
        
        let commentReplyEdit = null

        if (state.editing) {
            commentReplyEdit =
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{Translate(props, "Edit")}</h2>
                                    <a onClick={closeEditPopup} className="_close"><i></i></a>
                                </div>
                                <Create edit={true} className="edit_comment" {...props} posting={state.commentPosting} create={postEditComment} message={state.editMessage} textChange={textEditChange} removeImage={removeEditImage} image={state.editImage} changeImage={changeEditImage} />
                            </div>
                        </div>
                    </div>
                </div>
        }

        

        return (
            <React.Fragment>
                {commentReplyEdit}
                <div className="VideoDetails-commentWrap">
                    {
                        !props.hideTitle ?
                            <h3>{Translate(props, "Comments")}</h3>
                            : null
                    }
                    {
                        !props.comments ? 
                            <React.Fragment>
                                <Create {...props} posting={state.commentPosting} create={createComment} message={state.commentMessage} textChange={textChange} removeImage={removeImage} image={state.commentImage} changeImage={changeImage} />
                                {
                                    state.comments.length && state.comments.length > 0  ? 
                                <p style={{ float: "right" }}>{Translate(props, "Sort By")} &nbsp;<select onChange={changeSearch.bind(this)} value={state.search}><option value="newest">{Translate(props,"Newest")}</option><option value="oldest">{Translate(props,"Oldest")}</option></select> &nbsp; &nbsp;{moderation}</p>
                                    : <p style={{ float: "right" }}>{moderation}</p>
                                }
                                
                            </React.Fragment>
                            : null
                    }
                    {
                        props.pageData.appSettings['above_comment'] ? 
                            <AdsIndex paddingTop="20px" className="above_comment" ads={props.pageData.appSettings['above_comment']} />
                        : null
                    }
                    
                    <div className="newCommentWrap commentListView clearfix">
                        {
                            state.fetchingComments && state.comments.length == 0 ? 
                                <ul className="userCommentsList clearfix">
                                    <LoadMore {...props} loading={true} itemCount={state.comments.length} />
                                </ul>
                            : null
                        }
                        {
                            !state.fetchingComments || state.comments.length > 0 ?
                        <InfiniteScroll
                            dataLength={state.comments.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} loading={true} itemCount={state.comments.length} />}
                            endMessage={
                                <EndContent {...props} text={Translate(props,"No comment posted yet.")} itemCount={state.comments.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <ul className="userCommentsList clearfix">
                                {comments}
                            </ul>
                        </InfiniteScroll>
                        : null
                        }
                    </div>

                    {
                        props.pageData.appSettings['below_comment'] ? 
                            <AdsIndex paddingTop="20px" className="below_comment" ads={props.pageData.appSettings['below_comment']} />
                        : null
                    }

                </div>
            </React.Fragment>
        )
    }



export default Comment