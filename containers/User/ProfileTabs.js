import React,{useReducer,useEffect,useRef} from 'react'
import Translate from "../../components/Translate/Index"


const Index = (props) => {
    let member = props.member
    let state = props.state
    return (
        <ul className={`nav nav-tabs${props.newDesign ? " sidebar-scroll-new" : ""}`} id="myTab" role="tablist">
        {
                state.showHomeButtom == 1 ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "home" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("home",e)
                        } href={`${props.fURL}type=home`}>{Translate(props, "All Posts")}</a>
                    </li>
                :
                    null
            }
            
            {
                state.planCreate ?
                    <React.Fragment>
                        <li className="nav-item">
                            <a className={`nav-link${state.tabType == "plans" ? " active" : ""}`} onClick={
                                (e) => props.pushTab("plans",e)
                            } href={`${props.fURL}type=plans`} aria-controls="plans">{Translate(props, "Plans")}</a>
                        </li>
                        {
                            member.subscribers ? 
                        <li className="nav-item">
                            <a className={`nav-link${state.tabType == "subscribers" ? " active" : ""}`} onClick={
                                (e) => props.pushTab("subscribers",e)
                            } href={`${props.fURL}type=subscribers`} aria-controls="subscribers">{Translate(props, "Subscribers")}</a>
                        </li>
                        : null
                        }
                    </React.Fragment>
            : null
            }
            {
                state.liveVideos && state.liveVideos.results && state.liveVideos.results.length > 0 ? 
                <li className="nav-item">
                    <a className={`nav-link${state.tabType == "live" ? " active" : ""}`} onClick={
                        (e) => props.pushTab("live",e)
                    } href={`${props.fURL}type=live`} aria-controls="live" aria-selected="false">{Translate(props, "Live")}</a>
                </li>
                : null
            }
            {
                props.pageData.followers ? 
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "followers" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("followers",e)
                        } href={`${props.fURL}type=followers`} aria-controls="followers" aria-selected="false">{Translate(props, "Followers")}</a>
                    </li>
                : null
            }
            {
                props.pageData.following ? 
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "following" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("following",e)
                        } href={`${props.fURL}type=following`} aria-controls="following" aria-selected="false">{Translate(props, "Following")}</a>
                    </li>
                : null
            }
            {
                props.pageData.videos ? 
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "videos" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("videos",e)
                        } href={`${props.fURL}type=videos`} aria-controls="videos" aria-selected="false">{Translate(props, "Videos")}</a>
                    </li>
                : null
            }
            {
                props.pageData.reels ? 
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "reels" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("reels",e)
                        } href={`${props.fURL}type=reels`} aria-controls="reels" aria-selected="false">{Translate(props, "Reels")}</a>
                    </li>
                : null
            }
            {
                state.movies ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "movies" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("movies",e)
                        } href={`${props.fURL}type=movies`} aria-controls="movies">{Translate(props, "Movies")}</a>
                    </li>
                    : null
            }
            {
                state.series ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "series" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("series",e)
                        } href={`${props.fURL}type=series`} aria-controls="series">{Translate(props, "Series")}</a>
                    </li>
                    : null
            }
            {
                state.channels ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "channels" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("channels",e)
                        } href={`${props.fURL}type=channels`} aria-controls="channels">{Translate(props, "Channels")}</a>
                    </li>
                    : null
            }
            {
                state.audios ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "audio" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("audio",e)
                        } href={`${props.fURL}type=audios`} aria-controls="audios">{Translate(props, "Audio")}</a>
                    </li>
                    : null
            }
            {
                state.blogs ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "blogs" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("blogs",e)
                        } href={`${props.fURL}type=blogs`} aria-controls="blogs">{Translate(props, "Blogs")}</a>
                    </li>
                    : null
            }
            
            {
                state.paidVideos && state.paidVideos.results && state.paidVideos.results.length > 0 ? 
                <li className="nav-item">
                    <a className={`nav-link${state.tabType == "paid" ? " active" : ""}`} onClick={
                        (e) => props.pushTab("paid",e)
                    } href={`${props.fURL}type=paid`} aria-controls="paid" aria-selected="false">{Translate(props, "Paid Videos")}</a>
                </li>
                : null
            }
            {
                state.playlists ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "playlists" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("playlists",e)
                        } href={`${props.fURL}type=playlists`} aria-controls="playlists">{Translate(props, "Playlists")}</a>
                    </li>
                    : null
            }
                        
            {
                props.pageData.appSettings[`${"member_comment"}`] == 1 ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "comments" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("comments",e)
                        } href={`${props.fURL}type=comments`} aria-controls="comments">{`${Translate(props,"Comments")}`}</a>
                    </li>
                    : null
            }
            {
                state.showHomeButtom != 1 ?
                    <li className="nav-item">
                        <a className={`nav-link${state.tabType == "about" ? " active" : ""}`} onClick={
                            (e) => props.pushTab("about",e)
                        } href={`${props.fURL}type=about`} aria-controls="about">{Translate(props, "About")}</a>
                    </li>
            : null
            }
        </ul>
    )
}
export default Index;