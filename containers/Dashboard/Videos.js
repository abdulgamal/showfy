import React,{useReducer,useEffect,useRef} from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import BrowseVideos from "../Video/Videos"
import Translate from "../../components/Translate/Index"

const Videos = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type: props.pageData.filter ? props.pageData.filter : "my",
            pagging: props.pageData.items.pagging,
            items: props.pageData.items.results,
            canEdit: props.pageData.canEdit,
            canDelete: props.pageData.canDelete,
        }
    );

    useEffect(() => {
        if (props.pageData.filter != state.type || props.pageData.items.results != state.items) {
            setState({ type: props.pageData.filter, pagging: props.pageData.items.pagging, items: props.pageData.items.results })
        }
    },[props.pageData.filter,props.pageData.items.results])

    
    const changeType = (e) => {

        let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";
        let type = ""
        if(e)
            type = e.target.value
        else
            type = state.type
        let asPath = `/dashboard/videos/${type}${userAs}`
        Router.push(
            `${asPath}`,
        )
    }
        const criterials = {}
        criterials["my"] = "My Videos"
        criterials["my_recent"] = "Recently Visited Videos"
        if (props.pageData.appSettings["video_rating"])
            criterials["rated"] = "My Most Rated Videos"
        if (props.pageData.appSettings["video_favourite"])
            criterials["favourited"] = "My Most  Favourite Videos"
        if (props.pageData.appSettings["video_comment"])
            criterials["commented"] = "My Most Commented Videos"
        criterials["watchlater"] = "Watch Later Videos"
        if (props.pageData.appSettings["video_like"])
            criterials["liked"] = "My Most Liked Videos"
        if (props.pageData.appSettings["video_dislike"])
            criterials["disliked"] = "My Most Disliked Videos"
        criterials["viewed"] = "My Most Viewed Videos"
        if (props.pageData.appSettings["video_comment"])
            criterials["my_commented"] = "Videos I Commented"
        if (props.pageData.appSettings["video_favourite"])
            criterials["my_favourited"] = "Videos I  Favourite"
        if (props.pageData.appSettings["video_like"])
            criterials["my_liked"] = "Videos I Liked"
        if (props.pageData.appSettings["video_dislike"])
            criterials["my_disliked"] = "Videos I Disliked"
        if (props.pageData.appSettings["video_rating"])
            criterials["my_rated"] = "Videos I Rated"

        return (
            <React.Fragment>
                <div>
                    <div className="serachRsltsort">
                        <div className="totalno"></div>
                        <div className="sortby formFields">
                            <div className="form-group sortbys">
                                <span className="lble" style={{ width: "105px" }}>{Translate(props,"Criteria")}:</span>
                                <select className="form-control form-select" value={state.type} onChange={(e) => changeType(e) }>
                                    {
                                        Object.keys(criterials).map(function (keyName, keyIndex) {
                                            return <option key={keyName} value={keyName}>{Translate(props,criterials[keyName])}</option>
                                        },this)
                                    }
                                </select>
                                {
                                    state.type == "my_recent" ? 
                                        <a href="#" className="clear-history" onClick={(e) => {
                                            e.preventDefault();
                                            props.clearHistory("videos",changeType);
                                        } }>{props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                            
                        </div>
                    </div>
                </div> 
                <BrowseVideos classNameP={"container"} {...props} canEdit={state.canEdit} canDelete={state.canDelete} videos={state.items} pagging={state.pagging} contentType={state.type} userContent={props.pageData.user ? props.pageData.user.user_id : 0} />
            </React.Fragment>
        )
    }

export default Videos