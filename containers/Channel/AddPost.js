import React, { useState } from "react"

import Form from "../Form/Post"
import Translate from "../../components/Translate/Index";

const AddPost = (props) => {
    const [chanel_id,setChanelId] = useState(props.channel_id)
    
        return (
            <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{props.editItem ? Translate(props,"Edit Post") : Translate(props,"Create Post")}</h2>
                                <a onClick={props.closePOst}  className="_close"><i></i></a>
                            </div>
                            <Form {...props} closePOst={props.closePOst} channel_id={chanel_id} imageSuffix={props.pageData["imageSuffix"]} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

  
export default AddPost