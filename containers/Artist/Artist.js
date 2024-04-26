import React,{useReducer,useEffect,useRef} from 'react'
import axios from "../../axios-orders"
import Router, { withRouter } from "next/router";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import ShortNumber from "short-number"
import Rating from "../Rating/Index"

import dynamic from 'next/dynamic'
const ChannelItem = dynamic(() => import("../Channel/Item"), {
    ssr: false,
});
const VideoItem = dynamic(() => import("../Video/Item"), {
    ssr: false,
});
const Photos = dynamic(() => import("./Photos"), {
    ssr: false,
});

import TopView from "./TopView"
import Comment from "../Comments/Index"
import Translate from "../../components/Translate/Index"

const Artist = (props) =>  {
  
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page: 2,
            artist: props.pageData.artist,
            items: props.pageData.items.results,
            pagging: props.pageData.items.pagging,
            photos:props.pageData.photos,
            tabType:props.pageData.tabType ? props.pageData.tabType : "about"
        }
    );
    const stateRef = useRef();
    stateRef.current = state.items
    const stateRefArtist = useRef();
    stateRefArtist.current = state.artist
    const  getItemIndex = (item_id) => {
        const items = [...state.items];
        const itemIndex = items.findIndex(p => p[state.artist.type == "video" ? "video_id" : "channel_id"] == item_id);
        return itemIndex;
    }
    useEffect(() => {
        props.socket.on('ratedItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let Statustype = socketdata.type
            let rating = socketdata.rating
            if (id == stateRefArtist.artist_id && type == "artists") {
                const data = {...stateRefArtist.current}
                data.rating = rating
                setState({ artist: data })
            }
        });
        props.socket.on('unfollowUser', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == state.artist.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {

                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.follow_count = changedItem.follow_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.follower_id = null
                    }
                    setState({  items: items })
                }
            }
        });
        props.socket.on('followUser', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == state.artist.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.follow_count = data.follow_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.follower_id = 1
                    }
                    setState({  items: items })
                }
            }
        });
        props.socket.on('unfavouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == state.artist.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    setState({  items: items })
                }
            }
        });
        props.socket.on('favouriteItem', socketdata => {
            let id = socketdata.itemId
            let type = socketdata.itemType
            let ownerId = socketdata.ownerId
            if (type == state.artist.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    setState({  items: items })
                }
            }
        });


        props.socket.on('likeDislike', socketdata => {
            let itemId = socketdata.itemId
            let itemType = socketdata.itemType
            let ownerId = socketdata.ownerId
            let removeLike = socketdata.removeLike
            let removeDislike = socketdata.removeDislike
            let insertLike = socketdata.insertLike
            let insertDislike = socketdata.insertDislike
            if (itemType == state.artist.type + "s") {
                const itemIndex = getItemIndex(itemId)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    let loggedInUserDetails = {}
                    if (props.pageData && props.pageData.loggedInUserDetails) {
                        loggedInUserDetails = props.pageData.loggedInUserDetails
                    }
                    if (removeLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['like_count'] = parseInt(changedItem['like_count']) - 1
                    }
                    if (removeDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = null
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) - 1
                    }
                    if (insertLike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "like"
                        changedItem['like_count'] = parseInt(changedItem['like_count']) + 1
                    }
                    if (insertDislike) {
                        if (loggedInUserDetails.user_id == ownerId)
                            changedItem['like_dislike'] = "dislike"
                        changedItem['dislike_count'] = parseInt(changedItem['dislike_count']) + 1
                    }
                    setState({  items: items })
                }
            }
        });
    },[])
   
    const refreshContent = () => {
        setState({  page: 1, items: [] })
        loadMoreContent()
    }

    const loadMoreContent = () =>  {
        setState({  loading: true })
        let formData = new FormData();
        formData.append('page', state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/artist-view"
        formData.append("id", state.artist.custom_url)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.items) {
                    let pagging = response.data.pagging
                    setState({  page: state.page + 1, pagging: pagging, items: [...state.items, ...response.data.items], loading: false })
                } else {
                    setState({  loading: false })
                }
            }).catch(err => {
                setState({  loading: false })
            });

    }
    const linkify = (inputText) => {
        return inputText;
        inputText = inputText.replace(/&lt;br\/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br \/&gt;/g, ' <br/>')
        inputText = inputText.replace(/&lt;br&gt;/g, ' <br/>')
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
    
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank" rel="nofollow">$1</a>');
    
        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>');
    
        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1" rel="nofollow">$1</a>');
    
        return replacedText;
    }
    useEffect(()=>{
        if(props.router.query && props.router.query.tab != state.tabType && props.router.query.tab){
          setState({  tabType: props.router.query.tab });
        }else if(props.router.query && !props.router.query.tab){
          if ($(".nav-tabs").children().length > 0) {
            let type = $(".nav-tabs").children().first().find("a").attr("aria-controls")
              setState({  tabType: type });
          }
        }
      }, [props.router.query]);
      const pushTab = (type, e) => {
        if (e) e.preventDefault();
        if (state.tabType == type) {
          return;
        }
        let fUrl = props.router.asPath.split("?")
        let url = fUrl[0];
        let otherQueryParams = null
        if (typeof URLSearchParams !== 'undefined') {
            otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
            otherQueryParams.delete('tab')
        }
        let fURL = url+"?"+(otherQueryParams.toString() ? otherQueryParams.toString()+"&" : "");
        Router.push(`${fURL}tab=${type}`, `${fURL}tab=${type}`,{ shallow: true })
      };
        let content = null
        if (state.artist.type == "video") {
            content = state.items.map(video => {
                return (
                    <div key={video.video_id} className="gridColumn">
                        <VideoItem  {...props} video={video} {...video} />
                    </div>
                )
            })
        } else {
            content = state.items.map(channel => {
                return (
                    <div key={channel.channel_id} className="gridColumn">
                        <ChannelItem  {...props} channel={channel} {...channel} />
                    </div>
                )
            })
        }

        let fUrl = props.router.asPath.split("?");
        let url = fUrl[0];
        let otherQueryParams = null;
        if (typeof URLSearchParams !== "undefined") {
            otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
            otherQueryParams.delete("tab");
        }
        let fURL =
            url +
            "?" +
            (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");

        return (
            <React.Fragment>
                <TopView {...props}  type={state.artist.type} artist={state.artist} />
                <div className="userDetailsWraps">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="details-tab">
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item">
                                            <a className={`nav-link${state.tabType == "about" ? " active" : ""}`} onClick={
                                                (e) => { e.preventDefault(); pushTab("about") }
                                            } data-bs-toggle="tab" href={`${fURL}?tab=about`} role="tab" aria-controls="about" aria-selected="true">{Translate(props, "About")}</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={`nav-link${state.tabType == "items" ? " active" : ""}`} onClick={
                                                (e) => { e.preventDefault(); pushTab("items") }
                                            } data-bs-toggle="tab" href={`${fURL}?tab=items`} role="tab" aria-controls="items" aria-selected="true">{Translate(props, state.artist.type == "video" ? "Videos" : "Channels")}</a>
                                        </li>
                                       
                                        {
                                            props.pageData.appSettings[`${state.artist.type + "_artist_comment"}`] == 1 ?
                                                <li className="nav-item">
                                                    <a className={`nav-link${state.tabType == "comments" ? " active" : ""}`} onClick={
                                                        (e) => { e.preventDefault(); pushTab("comments") }
                                                    } data-bs-toggle="tab" href={`${fURL}?tab=comments`} role="tab" aria-controls="comments" aria-selected="true">{`${Translate(props,"Comments")}`}</a>
                                                </li>
                                                : null
                                        }
                                         {
                                            state.photos && state.photos.results.length > 0 ?
                                                <li className="nav-item">
                                                    <a className={`nav-link${state.tabType == "photos" ? " active" : ""}`} onClick={
                                                        (e) => { e.preventDefault(); pushTab("photos") }
                                                    } data-bs-toggle="tab" href={`${fURL}?tab=photos`} role="tab" aria-controls="photos" aria-selected="true">{Translate(props, "Photos")}</a>
                                                </li>
                                                : null
                                        }
                                    </ul>
                                    <div className="tab-content" id="myTabContent">
                                    <div className={`tab-pane fade${state.tabType == "about" ? " active show" : ""}`} id="about" role="tabpanel">
                                            <div className="details-tab-box">
                                                <React.Fragment>
                                                {
                                                    props.pageData.appSettings[`${state.artist.type + "_artist_rating"}`] == 1 ?
                                                <div className="tabInTitle">
                                                    <h6>{Translate(props,'Rating')}</h6>
                                                    <div className="owner_name">
                                                        <React.Fragment>
                                                                <div className="animated-rater rating">
                                                                    <Rating {...props} rating={state.artist.rating} type="artist" id={state.artist.artist_id} />
                                                                </div>
                                                                
                                                        </React.Fragment>
                                                    </div>
                                                </div>
                                                    : null
                                                }
                                                <div className="tabInTitle">
                                                    <h6>{props.t("view_count", { count: state.artist.view_count ? state.artist.view_count : 0 })}</h6>
                                                    <div className="owner_name">
                                                        <React.Fragment>
                                                        {`${ShortNumber(state.artist.view_count ? state.artist.view_count : 0)}`}{" "}{props.t("view_count", { count: state.artist.view_count ? state.artist.view_count : 0 })}
                                                        </React.Fragment>
                                                    </div>
                                                </div>
                                                {
                                                    state.artist.age ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(props,"Age")}</h6>
                                                    <div className="owner_name">
                                                        {state.artist.age}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                 {
                                                    state.artist.gender ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(props,"Gender")}</h6>
                                                    <div className="owner_name">
                                                        {state.artist.gender}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                 {
                                                    state.artist.birthplace ? 
                                                <div className="tabInTitle">
                                                    <h6>{Translate(props,"Birth Place")}</h6>
                                                    <div className="owner_name">
                                                        {state.artist.birthplace}
                                                    </div>
                                                </div>
                                                : null
                                                }
                                                {
                                                    state.artist.description ? 
                                                
                                                    <div className="tabInTitle">
                                                        <h6>{Translate(props, "Description")}</h6>
                                                        <div className="channel_description">
                                                        <div className="channel_description" id="VideoDetailsDescp" style={{ ...state.styles, whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{__html:linkify(state.artist.description)}}></div>
                                                            {/* <Linkify properties={{ target: '_blank' }}>{<CensorWord {...props} text={state.artist.description} />}</Linkify> */}
                                                        </div>
                                                    </div>
                                                    : null
                                                }
                                                </React.Fragment>
                                            </div>
                                        </div>
                                        <div className={`tab-pane fade${state.tabType == "items" ? " active show" : ""}`} id="items" role="tabpanel">
                                            <div className="details-tab-box">
                                                <InfiniteScroll
                                                    dataLength={state.items.length}
                                                    next={loadMoreContent}
                                                    hasMore={state.pagging}
                                                    loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.items.length} />}
                                                    endMessage={
                                                        <EndContent {...props} text={state.artist.type == "channel" ? Translate(props, "No channel created for this artist.") : Translate(props, "No video created for this artist.")} itemCount={state.items.length} />
                                                    }
                                                    pullDownToRefresh={false}
                                                    pullDownToRefreshContent={<Release release={false} {...props} />}
                                                    releaseToRefreshContent={<Release release={true} {...props} />}
                                                    refreshFunction={refreshContent}
                                                >
                                                    <div className={`gridContainer ${state.artist.type == "video" ? "gridVideo" : "gridChannel"}`}>
                                                        {content}
                                                    </div>
                                                </InfiniteScroll>
                                            </div>
                                        </div>
                                        
                                        {
                                            props.pageData.appSettings[`${state.artist.type + "_artist_comment"}`] == 1 ?
                                                <div className={`tab-pane fade${state.tabType == "comments" ? " active show" : ""}`} id="comments" role="tabpanel">
                                                    <div className="details-tab-box">
                                                        <Comment  {...props}  owner_id="artist" hideTitle={true} subtype={state.artist.type + "_"} appSettings={props.pageData.appSettings} commentType="artist" type="artists" comment_item_id={state.artist.artist_id} />
                                                    </div>
                                                </div>
                                                : null
                                        }
                                        {
                                            state.photos && state.photos.results.length > 0 ?
                                                <div className={`tab-pane fade${state.tabType == "photos" ? " active show" : ""}`} id="photos" role="tabpanel">
                                                    <div className="details-tab-box">
                                                        <Photos  {...props}  photos={state.photos} artist={state.artist} />
                                                    </div>
                                                </div>
                                            : null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
}


export default withRouter(Artist)