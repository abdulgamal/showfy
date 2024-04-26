import React,{useReducer,useEffect,useRef} from 'react'
import Router from 'next/router';
import Browse from "../Audio/Browse"
import Translate from "../../components/Translate/Index"

const Playlists = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type:props.pageData.filter ? props.pageData.filter : "my",
            pagging:props.pageData.items.pagging,
            items:props.pageData.items.results,
            canEdit:props.pageData.canEdit,
            canDelete:props.pageData.canDelete,
            updateComponent:true
        }
    );
    useEffect(() => {
        if (props.pageData.filter != state.type || props.pageData.items.results != state.items) {
            setState({type:props.pageData.filter,pagging:props.pageData.items.pagging,items:props.pageData.items.results,updateComponent:true})
        }
    },[props.pageData])

    
    const changeType = (e) => {
        let user = props.pageData.user ? `&user=${props.pageData.user}` : "";
        let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";

        let type = ""
        if(e)
            type = e.target.value
        else
            type = state.type

        let subtype = `/dashboard?type=audio&filter=${type}${user}`
        let asPath = `/dashboard/audio/${type}${userAs}`
        Router.push(
            `${asPath}`,
        )
    } 
        const criterials = {}
        criterials["my"] = "My Audio"
        criterials["my_recent"] = "Recently Visited Audio"
        if (props.pageData.appSettings["audio_rating"])
            criterials["rated"] = "My Most Rated Audio"
        if (props.pageData.appSettings["audio_favourite"])
            criterials["favourited"] = "My Most  Favourite Audio"
        if (props.pageData.appSettings["audio_comment"])
            criterials["commented"] = "My Most Commented Audio"
        if (props.pageData.appSettings["playlist_like"])
            criterials["liked"] = "My Most Liked Audio"
        if (props.pageData.appSettings["audio_dislike"])
            criterials["disliked"] = "My Most Disliked Audio"
        criterials["viewed"] = "My Most Viewed Audio"
        if (props.pageData.appSettings["audio_comment"])
            criterials["my_commented"] = "Audio I Commented"
        if (props.pageData.appSettings["audio_favourite"])
            criterials["my_favourited"] = "Audio I  Favourite"
        if (props.pageData.appSettings["audio_like"])
            criterials["my_liked"] = "Audio I Liked"
        if (props.pageData.appSettings["audio_dislike"])
            criterials["my_disliked"] = "Audio I Disliked"
        if (props.pageData.appSettings["audio_rating"])
            criterials["my_rated"] = "Audio I Rated"

        return (
            <React.Fragment>
                <div>
                    <div className="serachRsltsort">
                        <div className="totalno"></div>
                        <div className="sortby formFields">
                            <div className="form-group sortbys">
                                <span className="lble" style={{ width: "105px" }}>{Translate(props,"Criteria")}:</span>
                                <select className="form-control form-select" value={state.type} onChange={(e) => changeType(e)}>
                                    {
                                        Object.keys(criterials).map(function(keyName, keyIndex) {
                                           return <option key={keyName} value={keyName}>{Translate(props,criterials[keyName])}</option>
                                        },this)
                                    }
                                </select>
                                {
                                    state.type == "my_recent" ? 
                                        <a href="#" className="clear-history" onClick={(e) => {
                                            e.preventDefault();
                                            props.clearHistory("audio",changeType);
                                        } }>{props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Browse {...props} canEdit={state.canEdit} updateComponent={state.updateComponent} search={true} canDelete={state.canDelete} audios={state.items} pagging={state.pagging} contentType={state.type} userContent={props.pageData.user ? props.pageData.user.user_id : 0}  />
            </React.Fragment>
        )
    }

export default Playlists