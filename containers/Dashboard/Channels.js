import React,{useReducer,useEffect,useRef} from 'react'
import Router from 'next/router';
import BrowseChannels from "../Channel/Channels"
import Translate from "../../components/Translate/Index"

const  Channels = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type:props.pageData.filter ? props.pageData.filter : "my",
            pagging:props.pageData.items.pagging,
            items:props.pageData.items.results,
            canEdit:props.pageData.canEdit,
            canDelete:props.pageData.canDelete,
        }
    );
    useEffect(() => {
        if (props.pageData.filter != state.type || props.pageData.items.results != state.items) {
            setState({type:props.pageData.filter,pagging:props.pageData.items.pagging,items:props.pageData.items.results})
        }
    },[props.pageData.filter,props.pageData.items.results])

    const changeType = (e) => {
        let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";

        let type = ""
        if(e)
            type = e.target.value
        else
            type = state.type

        let asPath = `/dashboard/channels/${type}${userAs}`
        Router.push(
            `${asPath}`,
        )
    } 
        const criterials = {}
        criterials["my"] = "My Channels"
        criterials["my_recent"] = "Recently Visited Channels"
        if (props.pageData.appSettings["channel_rating"])
            criterials["rated"] = "My Most Rated Channels"
        if (props.pageData.appSettings["channel_favourite"])
            criterials["favourited"] = "My Most  Favourite Channels"
        if (props.pageData.appSettings["channel_comment"])
            criterials["commented"] = "My Most Commented Channels"
        criterials["my_subscribed"] = "My Most Subscribed Channels"
        if (props.pageData.appSettings["channel_like"])
            criterials["liked"] = "My Most Liked Channels"
        if (props.pageData.appSettings["channel_dislike"])
            criterials["disliked"] = "My Most Disliked Channels"
        criterials["viewed"] = "My Most Viewed Channels"
        criterials["subscribed"] = "Channels I Subscribed"
        if (props.pageData.appSettings["channel_comment"])
            criterials["my_commented"] = "Channels I Commented"
        if (props.pageData.appSettings["channel_favourite"])
            criterials["my_favourited"] = "Channels I  Favourite"
        if (props.pageData.appSettings["channel_like"])
            criterials["my_liked"] = "Channels I Liked"
        if (props.pageData.appSettings["channel_dislike"])
            criterials["my_disliked"] = "Channels I Disliked"
        if (props.pageData.appSettings["channel_rating"])
            criterials["my_rated"] = "Channels I Rated"

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
                                            props.clearHistory("channels",changeType);
                                        } }>{props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <BrowseChannels {...props} canEdit={state.canEdit} canDelete={state.canDelete} channels={state.items} pagging={state.pagging} contentType={state.type} userContent={props.pageData.user ? props.pageData.user.user_id : 0} />
            </React.Fragment>
        )
    }

export default Channels