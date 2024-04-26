import React,{useReducer,useEffect,useRef} from 'react'
import Link from "../../components/Link"
import SiteModeChange from "../../containers/Sitemode/Index"

const index = (props) => {
    return (
        <React.Fragment>
           <li>
                <Link href={`/${props.pageData.loggedInUserDetails.username}`} customParam={`id=${props.pageData.loggedInUserDetails.username}`} as={`/${props.pageData.loggedInUserDetails.username}`}>
                    <a className="dropdown-item iconmenu"   style={{cursor:"pointer"}}>
                    <span className="material-icons" data-icon="person"></span>
                        {props.t("View Profile")}
                    </a>
                </Link>
            </li>
            {
                props.pageData.appSettings["enable_ponts"] == 1 ?
            <li>
                <Link href="/dashboard/points" customParam={`type=points`} as={`/dashboard/points`}>
                    <a className="dropdown-item iconmenu" style={{cursor:"pointer"}}>
                    <span className="material-icons" data-icon="credit_score"></span>
                       {props.pageData.loggedInUserDetails.points} {" "} {props.t("Points")}
                    </a>
                </Link>
            </li>
            : null
            }
            <li>
                <Link href="/dashboard">
                    <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}} >
                        <span className="material-icons" data-icon="edit"></span>
                        {props.t("Dashboard")}
                </a>
                </Link>
            </li>
            {
                props.pageData.appSettings['video_watchlater'] == 1 ? 
            <li> 
                <Link href="/dashboard/videos/watchlater" customParam={`type=videos&filter=watchlater`} as={`/dashboard/videos/watchlater`}>
                    <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}}>
                        <span className="material-icons" data-icon="videocam"></span>
                        {props.t("Watch Later Videos")}
                </a>
                </Link>
            </li>
            : null
            }
            {
                props.pageData.appSettings["enable_movie"] == 1 && props.pageData.appSettings['movie_watchlater'] == 1 ?
                <React.Fragment>
                   
                    <li>
                        <Link href="/dashboard/movies/watchlater" customParam={`type=movies&filter=watchlater`} as={`/dashboard/movies/watchlater`}>
                            <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}}>
                                <span className="material-icons" data-icon="movie"></span>
                                {props.t("Watch Later Movies")}
                        </a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/series/watchlater" customParam={`type=series&filter=watchlater`} as={`/dashboard/series/watchlater`}>
                            <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}}>
                                <span className="material-icons" data-icon="live_tv"></span>
                                {props.t("Watch Later Series")}
                        </a>
                        </Link>
                    </li>
                </React.Fragment>
            : null
            }
            {
                props.pageData.packagesExists && (!props.pageData.admin_url || (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.level_id != 1)) ?
                    <li>
                        <Link href="/upgrade" >
                            <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}} >
                            <span className="material-icons" data-icon="subscriptions"></span>
                                {props.t("Upgrade pro")}
                            </a>
                        </Link>
                    </li>
                    : null
            }
            {
                props.pageData && (props.pageData.admin_url || props.pageData.ALLOWALLUSERINADMIN) ?
                    <li>
                            <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}} rel="nofollow" href={props.pageData.admin_url}>
                            <span className="material-icons" data-icon="account_circle"></span> {props.t("Admin Panel")}
                            </a>
                    </li>
                    : null
            }
            <li>
                <Link href="/logout" >
                    <a className="dropdown-item iconmenu"  style={{cursor:"pointer"}} >
                    <span className="material-icons" data-icon="exit_to_app"></span>
                        {props.t("Logout")}
                </a>
                </Link>
            </li>
            {
                <SiteModeChange {...props} />
            }
        </React.Fragment>
    )
}
 export default  index