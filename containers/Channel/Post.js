import React,{useReducer,useEffect,useRef} from 'react'
import Comment from "../Comments/Index"
import CommunityItem from "./CommunityItem"

const Post = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            post: props.pageData.post,
            channel: props.pageData.channel
        }
    );
    const stateRef = useRef();
    stateRef.current = state.post
    useEffect(() => {
        props.socket.on('likeDislike', data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId = data.ownerId
            let removeLike = data.removeLike
            let removeDislike = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike = data.insertDislike
            if (itemType ==  "channel_posts") {
                
                    const post = {...stateRef.current}
                    let loggedInUserDetails = {}
                    if (props.pageData && props.pageData.loggedInUserDetails) {
                        loggedInUserDetails = props.pageData.loggedInUserDetails
                    }
                    if (removeLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            post['like_dislike'] = null
                        post['like_count'] = parseInt(post['like_count']) - 1
                    }
                    if (removeDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            post['like_dislike'] = null
                        post['dislike_count'] = parseInt(post['dislike_count']) - 1
                    }
                    if (insertLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            post['like_dislike'] = "like"
                        post['like_count'] = parseInt(post['like_count']) + 1
                    }
                    if (insertDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            post['like_dislike'] = "dislike"
                        post['dislike_count'] = parseInt(post['dislike_count']) + 1
                    }
                    setState({  post: post })
                
            }
        });
    })
    
    const linkify = (inputText) => {
        inputText = inputText.replace(/&lt;br\/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br \/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br&gt;/g, ' <br/>')
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>');
    
        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" rel="nofollow">$1</a>');
    
        return replacedText;
    }
            
        return (
            <React.Fragment>
                <div className="details-video-wrap movieWatch-mainInfo">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="communty-boxWrap post_view">
                                    <CommunityItem {...props} linkify={linkify} post={state.post} />
                                </div>

                                <div className="details-tab">
                                    
                                    <div className="tab-content" id="myTabContent">
                                        <div className="tab-pane active show" id="comments" role="tabpanel">
                                            <div className="details-tab-box">
                                                <Comment  {...props}  hideTitle={true}  appSettings={props.pageData.appSettings} commentType="channel_post" type="channel_posts" comment_item_id={state.post.post_id} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }


export default Post