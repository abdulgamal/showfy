import React from 'react'
import Link from "../../components/Link/index"
const Title = (props) => {
    return (
        <Link  href="/member" customParam={`id=${props.data.username}`} as={`/${props.data.username}`}>
            <a className={`UserName d-inline-flex align-items-center${props.className ? " "+props.className : ""}`}  onClick={props.closePopUp}>
                {
                    props.childPrepend ?
                        props.childData
                        : null
                }
                <span className="d-flex">{props.data.displayname} 
                    {
                        props.data.verified == 1 ? 
                    <span className="verified"><span className="material-icons" data-icon="check"></span></span>
                    : null
                    }
                
                </span>
                {
                    !props.childPrepend ?
                        props.childData
                        : null
                }
            </a>
        </Link>
    )
}
 
export default Title