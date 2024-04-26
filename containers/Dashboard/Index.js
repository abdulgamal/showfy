import React,{useReducer,useEffect,useRef} from 'react'
import { useSelector, useDispatch } from "react-redux";
import { setMenuOpen } from "../../store/reducers/search";

import axios from "../../axios-orders"
import dynamic from 'next/dynamic'
import Router from 'next/router';
const StreamData = dynamic(() => import("./StreamData"), {
    ssr: false
});
const Channels = dynamic(() => import("./Channels"), {
    ssr: false
});
const Videos = dynamic(() => import("./Videos"), {
    ssr: false
});
const Movies = dynamic(() => import("./Movies"), {
    ssr: false
});
const Playlists = dynamic(() => import("./Playlists"), {
    ssr: false
});
const Audio = dynamic(() => import("./Audio"), {
    ssr: false
});
const Blogs = dynamic(() => import("./Blogs"), {
    ssr: false
});
const Members = dynamic(() => import("./Members"), {
    ssr: false
});
 const Ads = dynamic(() => import("./Ads"), {
    ssr: false
});
const Delete = dynamic(() => import("./Delete"), {
    ssr: false
});
const Verification = dynamic(() => import("./Verification"), {
    ssr: false
});
const Password = dynamic(() => import("./Password"), {
    ssr: false
});
const General = dynamic(() => import("./General"), {
    ssr: false
});
const Profile = dynamic(() => import("./Profile"), {
    ssr: false
});
const Block = dynamic(() => import("./Block"), {
    ssr: false
});
import Cover from "../Cover/User"

import Alert from "./Alert"
const Monetization = dynamic(() => import("./Monetization"), {
    ssr: false
});
const Balance = dynamic(() => import("./Balance"), {
    ssr: false
});
import Translate from "../../components/Translate/Index"
const Purchase = dynamic(() => import("./Purchases"), {
    ssr: false
});
const Earning = dynamic(() => import("./Earning"), {
    ssr: false
});
const Points = dynamic(() => import("./Points"), {
    ssr: false
});

const Index = (props) => {
    const dispatch = useDispatch()
    let menuOpen = useSelector((state) => {
        return state.search.menuOpen
    });
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            filter: props.pageData ? props.pageData.filter : "",
            type: props.pageData ? props.pageData.type : "general",
            member: props.pageData ? props.pageData.member : {},
            items: props.pageData ? props.pageData.items.results : null,
            pagging: props.pageData ? props.pageData.items.pagging : null,
            notificationTypes: props.pageData ? props.pageData.notificationTypes : null,
            user:props.pageData ? props.pageData.user : "",
            userShowBalance:props.pageData ? props.pageData.userShowBalance : "",
            memberMonetization:props.pageData ? props.pageData.memberMonetization : "",
            monetization_threshold_amount:props.pageData ? props.pageData.monetization_threshold_amount : null,
            statsData:props.pageData ? props.pageData.statsData : null,
            width:props.isMobile ? props.isMobile : 993
        }
    );
    const stateRef = useRef();
    stateRef.current = state.member
    const updateWindowDimensions = ()  => {
        setState({ width: window.innerWidth });
    }
    useEffect(() => {
        if (props.type != state.type || props.filter != state.filter) {
            setState({
                filter: props.pageData ? props.pageData.filter : "",
                type: props.pageData ? props.pageData.type : "general",
                member: props.pageData ? props.pageData.member : {},
                items: props.pageData ? props.pageData.items.results : null,
                pagging: props.pageData ? props.pageData.items.pagging : null,
                notificationTypes: props.pageData ? props.pageData.notificationTypes : null,
                user:props.pageData ? props.pageData.user : "",
                userShowBalance:props.pageData ? props.pageData.userShowBalance : "",
                memberMonetization:props.pageData ? props.pageData.memberMonetization : "",
                monetization_threshold_amount:props.pageData ? props.pageData.monetization_threshold_amount : null,
                statsData:props.pageData ? props.pageData.statsData : null
            })
        }
    },[props])

   

    useEffect(() => {
        if(props.pageData.appSettings["fixed_header"] == 1 && props.hideSmallMenu && !menuOpen){
            dispatch(setMenuOpen(true))
         }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);

        props.socket.on('unfavouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (id == state.member.user_id && type == "members") {
                if (state.member.user_id == id) {
                    const data = { ...stateRef.current }
                    data.favourite_count = data.favourite_count - 1
                    if (props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = null
                    }
                    setState({ member: data })
                }
            }
        });
        props.socket.on('favouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (id == state.member.user_id && type == "members") {
                if (state.member.user_id == id) {
                    const data = { ...stateRef.current }
                    data.favourite_count = data.favourite_count + 1
                    if (props.pageData.loggedInUserDetails.user_id == ownerId) {
                        data.favourite_id = 1
                    }
                    setState({ member: data })
                }
            }
        });

        props.socket.on('likeDislike', data => {
            let itemId = data.itemId
            let itemType = data.itemType
            let ownerId = data.ownerId
            let removeLike = data.removeLike
            let removeDislike = data.removeDislike
            let insertLike = data.insertLike
            let insertDislike = data.insertDislike
            if (itemType == "members" && state.member.user_id == itemId) {
                const item = { ...stateRef.current }
                let loggedInUserDetails = {}
                if (props.pageData && props.pageData.loggedInUserDetails) {
                    loggedInUserDetails = props.pageData.loggedInUserDetails
                }
                if (removeLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['like_count'] = parseInt(item['like_count']) - 1
                }
                if (removeDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = null
                    item['dislike_count'] = parseInt(item['dislike_count']) - 1
                }
                if (insertLike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "like"
                    item['like_count'] = parseInt(item['like_count']) + 1
                }
                if (insertDislike) {
                    if (loggedInUserDetails.user_id == ownerId)
                        item['like_dislike'] = "dislike"
                    item['dislike_count'] = parseInt(item['dislike_count']) + 1
                }
                setState({ member: item })
            }
        });


        props.socket.on('userCoverReposition', data => {
            let id = data.user_id
            if (id == state.member.user_id) {
                const item = {...stateRef.current}
                item.cover_crop = data.image
                item.showCoverReposition = false
                setState({ member: item, loadingCover: false })
                props.openToast({message:Translate(props,data.message), type:"success"});
            }
        });
        props.socket.on('userMainPhotoUpdated', data => {
            let id = data.user_id
            if (id == state.member.user_id) {
                const item = {...stateRef.current}
                item.avtar = data.image
                setState({ member: item, loadingCover: false })
                props.openToast({message:Translate(props,data.message), type:"success"});
            }
        });
        props.socket.on('userCoverUpdated', data => {
            let id = data.user_id
            if (id == state.member.user_id) {
                const item = {...stateRef.current}
                item.cover = data.image
                item.usercover = true;
                item.cover_crop = null;
                item.showCoverReposition = true
                setState({ member: item, loadingCover: false })
                props.openToast({message:Translate(props,data.message), type:"success"});
            }
        });

        return () => window.removeEventListener('resize', updateWindowDimensions);
    },[])

    

    const changeType = (type, e) => {
        e.preventDefault()
        let subtype = `/dashboard?type=${type}`
        let asPath = `/dashboard/${type}`
        if(state.user){
            subtype = subtype+"&user="+state.user
            asPath = asPath + "?user="+state.user
        }
        Router.push(
            `${asPath}`
        )
    }
    const changeFilter = (e) => {
        e.preventDefault()
        let type = e.target.value
        let subtype = `/dashboard?type=${type}`
        let asPath = `/dashboard/${type}`
        if(state.user){
            subtype = subtype+"&user="+state.user
            asPath = asPath + "?user="+state.user
        }
        Router.push(
            `${asPath}`,
        )
    }
    const clearHistory = (type,changeFunction) => {
        swal({
            title: Translate(props, "Are you sure?"),
            text: Translate(props, "Are you sure want to clear history!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('type', type)
                    formData.append('user_id', state.member.user_id)
                    const url = "/dashboard/clear-history"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                            } else {
                                changeFunction();
                            }
                        }).catch(err => {
                            //console.log(err)
                            swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }

        let user = ""
        let isOwner = true
        if(state.user){
            user = "?user="+state.user
            if(state.user == props.pageData.loggedInUserDetails.username){
                isOwner = true
            }else{
                isOwner = false;
            }
        }
        
        const options = {}
        
        if(state.member.canEdit) {
            options['general'] = Translate(props,'General');
            options['profile'] = Translate(props,'Profile');
        }
        options['password'] = Translate(props,'Password');
        if(state.memberMonetization && isOwner)
            options['monetization'] = Translate(props,'Monetization');
        if(state.userShowBalance && isOwner)
            options['balance'] = Translate(props,'Balance');
        if(state.member.verificationFunctionality && isOwner)
         options['verification'] = Translate(props,'Verification');

         options['block'] = Translate(props,'Blocked Users');


        if(isOwner){
            options['notifications'] = Translate(props,'Notifications Alert');
            options['emails'] = Translate(props,'Emails Alert');
            options['videos'] = Translate(props,'Videos');
            if(props.pageData['livestreamingtype'] == 0 && props.pageData.appSettings['antserver_media_singlekey'] == 1)
                options['streamdata'] = Translate(props,'Default Stream Data');


            if((props.pageData.levelPermissions["movie.edit"] == 1 || props.pageData.levelPermissions["movie.edit"] == 2) && props.pageData.appSettings["enable_movie"] == 1)
                options['movies'] = Translate(props,'Movies');
            if((props.pageData.levelPermissions["movie.edit"] == 1 || props.pageData.levelPermissions["movie.edit"] == 2) && props.pageData.appSettings["enable_movie"] == 1)
                options['series'] = Translate(props,'Series');

            if((props.pageData.levelPermissions["channel.edit"] == 1 || props.pageData.levelPermissions["channel.edit"] == 2) && props.pageData.appSettings["enable_channel"] == 1)
                options['channels'] = Translate(props,'Channels');
            if((props.pageData.levelPermissions["blog.edit"] == 1 || props.pageData.levelPermissions["blog.edit"] == 2) && props.pageData.appSettings["enable_blog"] == 1)
                options['blogs'] = Translate(props,'Blogs');
            options['members'] = Translate(props,'Members');
            if((props.pageData.levelPermissions["playlist.create"] == 1 || props.pageData.levelPermissions["playlist.edit"] == 2) && props.pageData.appSettings["enable_playlist"] == 1)
                options['playlists'] = Translate(props,'Playlists');
            if((props.pageData.levelPermissions["audio.create"] == 1 || props.pageData.levelPermissions["audio.edit"] == 2) && props.pageData.appSettings["enable_audio"] == 1)
                options['audio'] = Translate(props,'Audio');
            options['purchases'] = Translate(props,'Purchases');
            if(state.userShowBalance)
                options['earning'] = Translate(props,'Earning');
            if((props.pageData.levelPermissions["member.ads"] == 1) && props.pageData.appSettings["enable_ads"] == 1)
                options['ads'] = Translate(props,'Advertisements');
        }
        if( state.member.canDelete)
            options['delete'] = Translate(props,'Delete Account');
        return (
            <React.Fragment>
                <Cover {...props} profile={true}  settings={true} {...state.member} member={state.member} type="member" id={state.member.user_id} />
                    <div className="container-fluid mt-5">
                        <div className="row">
                            <div className="col-lg-2">
                                <div className="sdBarSettBox">
                                    {
                                        state.width > 992 ? 
                                    <ul className="nav nav-tabs tabsLeft">

                                        {
                                            state.member.canEdit ?
                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/general${user}`} onClick={(e) => changeType("general",e)} className={state.type == "general" ? "active" : ""}>{Translate(props, "General")}</a>
                                                </li>
                                                : null
                                        }

                                        {
                                            state.member.canEdit ?
                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/profile${user}`} onClick={(e) => changeType("profile",e)} className={state.type == "profile" ? "active" : ""}>{Translate(props, "Profile")}</a>
                                                </li>
                                                : null
                                        }
                                        <li >
                                            <a href={`${props.pageData.subFolder}dashboard/password${user}`} onClick={(e) => changeType("password",e)} className={state.type == "password" ? "active" : ""}>{Translate(props, "Password")}</a>
                                        </li>
                                        {
                                            state.memberMonetization && isOwner ?
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/monetization${user}`} onClick={(e) => changeType("monetization",e)} className={state.type == "monetization" ? "active" : ""}>{Translate(props, "Monetization")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            state.userShowBalance && isOwner ?
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/balance${user}`} onClick={(e) => changeType("balance",e)} className={state.type == "balance" || state.type == "withdraw" ? "active" : ""}>{Translate(props, "Balance")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            props.pageData.appSettings['enable_ponts'] == 1 && isOwner ?
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/points${user}`} onClick={(e) => changeType("points",e)} className={state.type == "points" ? "active" : ""}>{Translate(props, "Points")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            state.member.verificationFunctionality && isOwner ?
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/verification${user}`} onClick={(e) => changeType("verification",e)} className={state.type == "verification" ? "active" : ""}>{Translate(props, "Verification")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ?
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/block${user}`} onClick={(e) => changeType("block",e)} className={state.type == "block" ? "active" : ""}>{Translate(props, "Blocked Users")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ? 
                                        <li>
                                            <a href={`${props.pageData.subFolder}dashboard/notifications${user}`} onClick={(e) => changeType("notifications",e)} className={state.type == "notifications" ? "active" : ""} >{Translate(props, "Notifications Alert")}</a>
                                        </li>
                                        : null
                                        }
                                        {
                                            isOwner && props.pageData['livestreamingtype'] == 0 && props.pageData.appSettings['antserver_media_singlekey'] == 1 ?
                                            <li>
                                                <a href={`${props.pageData.subFolder}dashboard/streamdata${user}`} onClick={(e) => changeType("streamdata",e)} className={state.type == "streamdata" ? "active" : ""} >{Translate(props, "Default Stream Data")}</a>
                                            </li>
                                            : null
                                        }
                                        {
                                            isOwner ? 
                                            <React.Fragment>
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/emails${user}`} onClick={(e) => changeType("emails",e)} className={state.type == "emails" ? "active" : ""} >{Translate(props, "Emails Alert")}</a>
                                                </li>
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/videos${user}`} onClick={(e) => changeType("videos",e)} className={state.type == "videos" ? "active" : ""} >{Translate(props, "Videos")}</a>
                                                </li>
                                            </React.Fragment>
                                        : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["movie.edit"] == 1 || props.pageData.levelPermissions["movie.edit"] == 2) && props.pageData.appSettings["enable_movie"] == 1 ?

                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/movies${user}`} onClick={(e) => changeType("movies",e)} className={state.type == "movies" ? "active" : ""}>{Translate(props, "Movies")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["movie.edit"] == 1 || props.pageData.levelPermissions["movie.edit"] == 2) && props.pageData.appSettings["enable_movie"] == 1 ?

                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/series${user}`} onClick={(e) => changeType("series",e)} className={state.type == "series" ? "active" : ""}>{Translate(props, "Series")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["channel.edit"] == 1 || props.pageData.levelPermissions["channel.edit"] == 2) && props.pageData.appSettings["enable_channel"] == 1 ?

                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/channels${user}`} onClick={(e) => changeType("channels",e)} className={state.type == "channels" ? "active" : ""}>{Translate(props, "Channels")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["blog.edit"] == 1 || props.pageData.levelPermissions["blog.edit"] == 2) && props.pageData.appSettings["enable_blog"] == 1 ?

                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/blogs${user}`} onClick={(e) => changeType("blogs",e)} className={state.type == "blogs" ? "active" : ""}>{Translate(props, "Blogs")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ? 
                                                <li>
                                                    <a href={`${props.pageData.subFolder}dashboard/members${user}`} onClick={(e) => changeType("members",e)} className={state.type == "members" ? "active" : ""}>{Translate(props, "Members")}</a>
                                                </li>
                                        : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["playlist.create"] == 1 || props.pageData.levelPermissions["playlist.edit"] == 2) && props.pageData.appSettings["enable_playlist"] == 1 ?

                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/playlists${user}`} onClick={(e) => changeType("playlists",e)} className={state.type == "playlists" ? "active" : ""}>{Translate(props, "Playlists")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["audio.create"] == 1 || props.pageData.levelPermissions["audio.edit"] == 2) && props.pageData.appSettings["enable_audio"] == 1 ?

                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/audio${user}`} onClick={(e) => changeType("audio",e)} className={state.type == "audio" ? "active" : ""}>{Translate(props, "Audio")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner ? 
                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/purchases${user}`} onClick={(e) => changeType("purchases",e)} className={state.type == "purchases" ? "active" : ""}>{Translate(props, "Purchases")}</a>
                                                </li>   
                                        : null
                                        }         
                                        {
                                            isOwner && state.userShowBalance ? 
                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/earning${user}`} onClick={(e) => changeType("earning",e)} className={state.type == "earning" ? "active" : ""}>{Translate(props, "Earning")}</a>
                                                </li>
                                                : null
                                        }
                                        {
                                            isOwner && (props.pageData.levelPermissions["member.ads"] == 1) && props.pageData.appSettings["enable_ads"] == 1 && (props.pageData.appSettings['video_ffmpeg_path'] || props.pageData.loggedInUserDetails.level_id == 1) ?

                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/ads${user}`} onClick={(e) => changeType("ads",e)} className={state.type == "ads" ? "active" : ""}>{Translate(props, "Advertisements")}</a>
                                                </li>
                                                : null
                                        }

                                        {
                                            state.member.canDelete ?
                                                <li >
                                                    <a href={`${props.pageData.subFolder}dashboard/delete${user}`} onClick={(e) => changeType("delete",e)} className={state.type == "delete" ? "active" : ""}>{Translate(props, "Delete Account")}</a>
                                                </li>
                                                : null
                                        }
                                    </ul>
                                    : 
                                    <div className="formFields">
                                        <div className="form-group">
                                            <select className="form-control form-select" value={state.type} onChange={changeFilter}>
                                                {
                                                    Object.keys(options).map(function(key) {
                                                        return (
                                                            <option value={key} key={key}>{options[key]}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                }
                                </div>
                            </div>
                            <div className="col-lg-10 bgSecondry">
                                <div className="tab-content dashboard">
                                    {
                                        state.type == "purchases" ?
                                            <Purchase  {...props} contentType={state.type} member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "block" ?
                                            <Block  {...props} contentType={state.type} member={state.member} />
                                        : null
                                    }
                                    {
                                        props.pageData.appSettings['enable_ponts'] == 1 && state.type == "points" ?
                                            <Points {...props} contentType={state.type} member={state.member} />
                                        : null
                                    }
                                    {
                                        state.userShowBalance && state.type == "earning" ? 
                                            <Earning  {...props} statsData={state.statsData} items={state.items} contentType={state.type} member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "general" ?
                                            <General  {...props} member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "monetization" ?
                                            <Monetization  {...props} member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "balance" || state.type == "withdraw" ?
                                            <Balance  {...props} member={state.member} type={state.type} />
                                        : null
                                    }

                                    {
                                        state.type == "profile" ?
                                            <Profile {...props}  member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "streamdata" ?
                                            <StreamData {...props}  member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "password" ?
                                            <Password {...props}  member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "verification" ?
                                            <Verification {...props}  member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "notifications" ?
                                            <Alert {...props}  type={state.type} member={state.member} notificationTypes={state.notificationTypes} />
                                        : null
                                    }
                                    {
                                        state.type == "emails" ?
                                            <Alert {...props}  type={state.type} member={state.member} notificationTypes={state.notificationTypes} />
                                        : null
                                    }
                                    {
                                        state.type == "videos" ?
                                            <Videos {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    {
                                        state.type == "movies" || state.type == "series"?
                                            <Movies {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    
                                    {
                                        state.type == "channels" ?
                                            <Channels {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    {
                                        state.type == "blogs" ?
                                            <Blogs {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    {
                                        state.type == "members" ?
                                            <Members {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    {
                                        state.type == "playlists" ?
                                            <Playlists {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    {
                                        state.type == "audio" ?
                                            <Audio {...props}  member={state.member} clearHistory={clearHistory} />
                                        : null
                                    }
                                    {
                                        state.type == "ads" ?
                                            <Ads {...props}  member={state.member} />
                                        : null
                                    }
                                    {
                                        state.type == "delete" ?
                                            <Delete {...props}  member={state.member} />
                                        : null
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
            </React.Fragment>
        )
    }

export default Index