import React,{useReducer,useEffect,useRef} from 'react'
import Header from "./Header"
import Comment from "./Index"

const CommentContainer =  (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            item : props.pageData.item,
            comments : props.pageData.comments,
            pagging:props.pageData.pagging
        }
    );
    const linkify = (inputText) => {
        // inputText = inputText.replace(/&lt;br\/&gt;/g, ' <br/>')
        // inputText = inputText.replace(/&lt;br \/&gt;/g, ' <br/>')
        // inputText = inputText.replace(/&lt;br&gt;/g, ' <br/>')
        // var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        // //URLs starting with http://, https://, or ftp://
        // replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        // replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    
        // //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        // replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        // replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>');
    
        // //Change email addresses to mailto:: links.
        // replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        // replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" rel="nofollow">$1</a>');
    
        return inputText;
    }

        let commentType = state.comments[0].type
        commentType = commentType.replace(/s$/, "");

        return (
            <React.Fragment>
                <div className="container">
                    <div className="row">
                        <div className="col-md-10">
                            <Header {...props} linkify={linkify} title={state.item.title} item={state.item} image={state.comments[0].type == "members" ? state.item.avtar : state.item.image} type={state.comments[0].type} />
                            <Comment  {...props} paggingComment={state.pagging} comments={state.comments}  hideTitle={true} appSettings={props.pageData.appSettings} commentType={commentType} type={state.comments[0].type} comment_item_id={state.comments[0].type == "members" ? state.item.user_id : (state.comments[0].type != "channel_posts" ? state.item[commentType+"_id"] : state.item["post_id"])} />
            
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

export default CommentContainer