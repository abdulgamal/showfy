import React,{useReducer,useEffect,useRef} from 'react'
import Video from "../Video/Browse";
import Movie from "../Movies/Browse";
import Audio from "../Audio/Browse";

const Purchases = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            value:"video",
            movies:props.pageData.items.movies,
            audio:props.pageData.items.audio,
            pagging:props.pageData.items.movies_pagging,
            audio_pagging:props.pageData.items.audio_pagging,
        }
    );

        return(
            <div className="dashboard-purchases">
                {
                    state.movies || state.audio ? 
                    <div>
                        <div className="serachRsltsort">
                            <div className="totalno"></div>
                            <div className="sortby formFields">
                                <div className="form-group sortbys">
                                    <select className="form-control form-select purchase" value={state.value} onChange={(e) => setState({value:e.target.value})}>
                                        <option value="video">{props.t("Video")}</option>
                                        <option value="movie">{props.t("Movies & Series")}</option>
                                        <option value="audio">{props.t("Audio")}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
                }
                {
                    state.value == "video" ?
                    <Video {...props} contentType={props.contentType} member={props.member}  />
                    : state.value == "audio" ?
                        <Audio {...props} contentTypePurchase={props.contentType} member={props.member} audios={state.audio} pagging={state.audio_pagging}  />
                    :
                    <Movie {...props} contentTypeMovie={props.contentType} member={props.member} movies={state.movies} pagging={state.pagging} />
                }
            </div>
        )

    }

export default Purchases