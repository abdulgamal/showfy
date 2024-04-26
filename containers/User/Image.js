import React,{useReducer,useEffect,useRef} from 'react'
import Link from "../../components/Link/index"
import NextImage from "../Image/Index"

const Image = (props) => {
    let isS3 = true
    return (
        props.noRedirect ?
            <a onClick={(e) => {
                e.preventDefault()
              }}>
                 <NextImage height="50" width="50" title={props.data.displayname} image={(isS3 ? props.imageSuffix : "")+props.data.avtar} imageSuffix={props.imageSuffix} siteURL={props.pageData.siteURL} />
            </a>
        :
        <Link href={`/${props.data.username}`}>
            <a>
                <NextImage height="50" width="50" title={props.data.displayname} image={(isS3 ? props.imageSuffix : "")+props.data.avtar} imageSuffix={props.imageSuffix} siteURL={props.pageData.siteURL} />
            </a>
        </Link>
    )

}

export default Image