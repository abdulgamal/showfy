import React,{useReducer,useEffect,useRef} from 'react'
import ShortNumber from "short-number"
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index"

const Index = (props) => {
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            item: props.item
        }
    );
    useEffect(() => {
        if(props.item != state.item){
            setState({item:props.item})
        }
    },[props.item])
    const onChange = () => {
        if(props.disabled){
            return
        }
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            const formData = new FormData()
            formData.append('id', props.id)
            if(props.type == "story")
                formData.append('type',  "stories")
            else
                formData.append('type', props.type + "s")
            formData.append('action', 'dislike')
            let url = '/likes'
            axios.post(url, formData)
                .then(response => {

                }).catch(err => {
                    //setState({submitting:false,error:err});
                });
        }
    }
        if (props.type != "channel_post" && (typeof props.dislike_count == "undefined" || props.pageData.appSettings[`${(props.parentType ? props.parentType + "_" : "") + props.type + "_dislike"}`] != 1)) {
            return null
        }
        return (
            props.pageData.loggedInUserDetails && state.item.like_dislike == "dislike" ?
                    <span onClick={onChange} className="icon active" title={Translate(props,'Dislike')}><span className="material-icons-outlined md-18" data-icon="thumb_down"></span>{" " + `${ShortNumber(props.dislike_count ? props.dislike_count : 0)}`}</span>                    
                :
                    <span onClick={onChange} className="icon" title={Translate(props,'Dislike')}><span className="material-icons-outlined md-18" data-icon="thumb_down"></span>{" " + `${ShortNumber(props.dislike_count ? props.dislike_count : 0)}`}</span>
                    
        )
}


export default Index
