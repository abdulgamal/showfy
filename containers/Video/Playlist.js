import React,{useReducer} from 'react'

import Form from "../Form/Playlist"
import Translate from "../../components/Translate/Index";

const Playlist = (props) => {
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            video_id:props.playlistVideoId
        }
    );
   
    const close = () => {
        props.openPlaylist({status:false})
    }
        if(state.video_id == 0){
            return null
        }
        return (
            <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props,"Create Playlist")}</h2>
                                <a onClick={close}  className="_close"><i></i></a>
                            </div>
                            <Form {...props} video_id={props.playlistVideoId} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

export default Playlist