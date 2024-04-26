import React from "react"
import { LazyLoadImage } from 'react-lazy-load-image-component';
// import NextImage from "next/image"
const Image = (props) => {
    let isS3 = true
    if (props.image) {
        const splitVal = props.image.split('/')
         if (splitVal[0] == "http:" || splitVal[0] == "https:") {
            isS3 = false
        }
    }

    if(!props.image || props.image == "undefined"){
        return null;
    }
    let customProps = {}
    if(props.height){
        customProps.height = props.height+"px"
    }
    if(props.objectFit){
        customProps.objectFit = props.objectFit
    }
    if(props.layout){
        customProps.layout = props.layout
    }
    if(props.width){
        customProps.width = props.width+"px"
    }
    if(Object.keys(customProps).length == 0){
        // if(props.layout)
        //     customProps.layout = props.layout
        // else
            customProps.layout = "fill"
    }

    let url = `${props.siteURL}/api/imagefetcher?url=${(
        (isS3 ? props.imageSuffix : "") + props.image
      )}`

      
    if(isS3){
        url = props.imageSuffix+props.image
    }
    return (
        <LazyLoadImage
            alt={props.title}
            effect="blur"
            className={props.className ? props.className : ""}
            src={(isS3 ? props.imageSuffix : "") + props.image} />
        // props.lazyLoad || !isS3 || props.imageSuffix != props.siteURL ? 
        // <LazyLoadImage
        //     alt={props.title}
        //     effect="blur"
        //     className={props.className ? props.className : ""}
        //     src={(isS3 ? props.imageSuffix : "") + props.image} />
        // :
        // <NextImage
        //     alt={props.title}
        //     {...customProps}
        //     src={url}
        //     className={props.className ? props.className : ""}
        //     // src={(isS3 ? props.imageSuffix : "") + props.image} 
        // />
        // <img className={props.className ? props.className : ""} src={(isS3 ? props.imageSuffix : "") + props.image} alt={`${props.title}`} />
    )
}

export default Image