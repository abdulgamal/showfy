import React,{useReducer,useEffect,useRef} from 'react'
import Router from 'next/router';
import BrowseBlogs from "../Blog/Blogs"
import Translate from "../../components/Translate/Index"

const Blogs = (props) => {
    
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

        let asPath = `/dashboard/blogs/${type}${userAs}`
        Router.push(
            `${asPath}`,
        )
    } 
        const criterials = {}
        criterials["my"] = "My Blogs"
        criterials["my_recent"] = "Recently Visited Blogs"
        if (props.pageData.appSettings["blog_rating"])
            criterials["rated"] = "My Most Rated Blogs"
        if (props.pageData.appSettings["blog_favourite"])
            criterials["favourited"] = "My Most  Favourite Blogs"
        if (props.pageData.appSettings["blog_comment"])
            criterials["commented"] = "My Most Commented Blogs"
        if (props.pageData.appSettings["blog_like"])
            criterials["liked"] = "My Most Liked Blogs"
        if (props.pageData.appSettings["blog_dislike"])
            criterials["disliked"] = "My Most Disliked Blogs"
        criterials["viewed"] = "My Most Viewed Blogs"
        if (props.pageData.appSettings["blog_comment"])
            criterials["my_commented"] = "Blogs I Commented"
        if (props.pageData.appSettings["blog_favourite"])
            criterials["my_favourited"] = "Blogs I  Favourite"
        if (props.pageData.appSettings["blog_like"])
            criterials["my_liked"] = "Blogs I Liked"
        if (props.pageData.appSettings["blog_dislike"])
            criterials["my_disliked"] = "Blogs I Disliked"
        if (props.pageData.appSettings["blog_rating"])
            criterials["my_rated"] = "Blogs I Rated"

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
                                            props.clearHistory("blogs",changeType);
                                        } }>{props.t("clear history")}</a>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <BrowseBlogs {...props} canEdit={state.canEdit} canDelete={state.canDelete} blogs={state.items} pagging={state.pagging} contentType={state.type} userContent={props.pageData.user ? props.pageData.user.user_id : 0} />
            </React.Fragment>
        )
    }

export default Blogs