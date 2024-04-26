import React,{useReducer,useEffect,useRef} from 'react'
import ReactStars from 'react-rating-stars-component'
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index"
const Index = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            rating: props.rating,
            id:props.id,
            type:props.type,
            newRating:0,
            openStats:false
        }
    );

    useEffect(() => {
    if(props.rating != state.rating){
        setState({rating:props.rating})
    }
    },[props])
   
    const updateRating = (rating) => {
        if(props.hideStats){
            props.updateRating(rating ? rating : state.newRating);
            return;
        }
        if(props.pageData && !props.pageData.loggedInUserDetails){
            document.getElementById('loginFormPopup').click();
        }else{
            const formData = new FormData()
            formData.append('id',props.id)
            formData.append("rating",rating ? rating : state.newRating)
            formData.append('type',props.type+"s")
            let url = '/ratings'
            axios.post(url,formData)
            .then(response => {
                
            }).catch(err => {
                //setState({submitting:false,error:err});
            });
        }
    }
    const handleRate = ( rating ) => {
        setState({
            newRating:rating,
        })
        setTimeout(() => updateRating(rating),200)
      }
      const openRatingBox = (e) => {
          e.preventDefault()
          props.ratingStats({status:true,data:{id:state.id,type:state.type,rating:state.rating}})
      }

      return(
            <React.Fragment>
                    <ReactStars
                        count={5}
                        size={24}
                        value={state.rating}
                        onChange={handleRate.bind(this)}
                        edit={props.ratingInteract ? false : true}
                    >                    
                    </ReactStars>
                    {
                        !props.hideStats ? 
                <a href="#" onClick={openRatingBox}><span>{state.rating % 1 != 0 ?  state.rating.toFixed(1) : state.rating} {Translate(props,"out of 5 stars")}</span></a>
                : null
                    }
            </React.Fragment>
        )
    }


export default Index