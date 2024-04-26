import React,{useReducer,useEffect} from 'react'
import Router from 'next/router';
import BrowseMembers from "../User/Browse"
import Translate from "../../components/Translate/Index"

const Members = (props) => {
    
   
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
        let asPath = `/dashboard/members/${type}${userAs}`
        Router.push(
            `${asPath}`,
        )
    } 
        const criterials = {}
        criterials["my_subscribed"] = "Members Who Followed Me"
        criterials["subscribed"] = "Members I Followed"
        criterials["my_recent"] = "Members Recently Viewed"
        if (props.pageData.appSettings["member_like"])
            criterials["my_liked"] = "Members I Liked"
        if (props.pageData.appSettings["member_dislike"])
            criterials["my_disliked"] = "Members I Disliked"
        if (props.pageData.appSettings["member_favourite"])
            criterials["my_favourited"] = "Members I  Favourite"
        if (props.pageData.appSettings["member_comment"])
            criterials["my_commented"] = "Members I Commented"
        if (props.pageData.appSettings["member_rating"])
            criterials["my_rated"] = "Members I Rated"
        
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
                                            props.clearHistory("members",changeType);
                                        } }>{props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <BrowseMembers {...props} canEdit={state.canEdit} canDelete={state.canDelete} pageData={{...props.pageData,members:state.items,pagging:state.pagging}} contentType={state.type} userContent={props.pageData.user ? props.pageData.user.user_id : 0} />
            </React.Fragment>
        )
    }

export default Members