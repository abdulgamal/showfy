import React,{useReducer,useEffect,useRef} from 'react'

const Index = (props) => {
    
    useEffect(() => {
        try{
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            }catch(e){
                //console.log("error",e)
            }
    },[])

    
        return (
            <div className={props.className ? props.className + " advertisement_container" : "advertisement_container"} style={{paddingTop:props.paddingTop}} dangerouslySetInnerHTML={ {__html: props.ads} }></div>
        )
    }

export default Index