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

            formData.append('type', props.type + "s")
            let url = '/favourites'
            axios.post(url, formData)
                .then(response => {
                    if (response.data.error) {

                    } else {

                    }
                }).catch(err => {
                    //setState({submitting:false,error:err});
                });
        }
    }
        if (typeof props.favourite_count == "undefined" || props.pageData.appSettings[`${(props.parentType ? props.parentType + "_" : "") + props.type + "_favourite"}`] != 1) {
            return null
        }

        return (
            props.pageData.loggedInUserDetails && state.item.favourite_id ?
                    <span onClick={onChange} className="active" title={Translate(props,'Favourite')}><span className="material-icons-outlined md-18" data-icon="favorite_border"></span>{" " + `${ShortNumber(props.favourite_count ? props.favourite_count : 0)}`}</span>                    
                :
                    <span onClick={onChange} className="icon" title={Translate(props,'Favourite')}><span className="material-icons-outlined md-18" data-icon="favorite_border"></span>{" " + `${ShortNumber(props.favourite_count ? props.favourite_count : 0)}`}</span>
        )
}


export default Index
