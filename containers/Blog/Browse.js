import React,{useReducer,useEffect,useRef} from 'react'
import Blog from '../Blog/Item'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Search from "../Search/Index"
import Masonry from 'react-masonry-css'

import Translate from "../../components/Translate/Index";


const Browse = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            blogs: props.pageData.blogs,
            page: 2,
            type: "blog",
            pagging: props.pageData.pagging,
            loading: false,
            searchType: "creation_date",
            search: props.search ? props.search : []
        }
    );
    const stateRef = useRef();
    stateRef.current = state.blogs


    useEffect(() => {
        if (props.pageData.blogs && props.pageData.blogs != state.blogs) {
            setState({ blogs: props.pageData.blogs, pagging: props.pageData.pagging, page: 2, search: props.search ? props.search : [] })
        }
    },[props.pageData])

    useEffect(() => {
        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == state.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const blogs = [...stateRef.current]
                    const changedItem = blogs[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    setState({ blogs: blogs })
                }
            }
        });
        props.socket.on('favouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == state.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const blogs = [...stateRef.current]
                    const changedItem = blogs[itemIndex]
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    setState({ blogs: blogs })
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
            if (itemType == state.type + "s") {
                const itemIndex = getItemIndex(itemId)
                if (itemIndex > -1) {
                    const blogs = [...stateRef.current]
                    const changedItem = blogs[itemIndex]
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
                    setState({ blogs: blogs })
                }
            }
        });
    },[])
    
    const getItemIndex = (item_id) => {
        const blogs = [...state.blogs];
        const itemIndex = blogs.findIndex(p => p["blog_id"] == item_id);
        return itemIndex;
    }

    const refreshContent = () => {
        setState({ page: 1, blogs: [] })
        loadMoreContent()
    }
    const searchResults = (values) => {
        setState({ page: 1 })
        loadMoreContent(values)
    }
    const loadMoreContent = (values) => {
        setState({ loading: true })
        let formData = new FormData();
        formData.append('page', state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/blogs-browse`;
        let queryString = ""
        if (props.pageData.search) {
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        } else if (props.globalSearch) {
            queryString = Object.keys(state.search).map(key => key + '=' + state.search[key]).join('&');
            url = `/search/blog?${queryString}`
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.blogs) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, blogs: [...state.blogs, ...response.data.blogs], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }
        let blogs = state.blogs.map(item => {
            return <Blog key={item.blog_id}  {...props} {...item} result={item} />
        })
        const breakpointColumnsObj = {
            default: 3,
            1300: 3,
            900:2,
            700: 2,
            500: 1
        };
        return (
            <React.Fragment>
                {
                                !props.globalSearch ?
                    <div className="user-area">
                        
                            {
                                !props.globalSearch ?
                                <div className="container">
                                    <Search {...props}  type="blog" />
                                </div>
                                    : null
                            }

                                <InfiniteScroll
                                    dataLength={state.blogs.length}
                                    next={loadMoreContent}
                                    hasMore={state.pagging}
                                    loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.blogs.length} />}
                                    endMessage={
                                        <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No blog found with your matching criteria.') : Translate(props,'No blog created yet.')} itemCount={state.blogs.length} />
                                    }
                                    pullDownToRefresh={false}
                                    pullDownToRefreshContent={<Release release={false} {...props} />}
                                    releaseToRefreshContent={<Release release={true} {...props} />}
                                    refreshFunction={refreshContent}
                                >
                                    <div className="container">
                                            <Masonry
                                                breakpointCols={breakpointColumnsObj}
                                                className="my-masonry-grid row"
                                                columnClassName="my-masonry-grid_column">
                                                {blogs}
                                            </Masonry>
                                    </div>
                                </InfiniteScroll>
                        
                    </div>
                :
                    <InfiniteScroll
                        dataLength={state.blogs.length}
                        next={loadMoreContent}
                        hasMore={state.pagging}
                        loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.blogs.length} />}
                        endMessage={
                            <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No blog found with your matching criteria.') : Translate(props,'No blog created yet.')} itemCount={state.blogs.length} />
                        }
                        pullDownToRefresh={false}
                        pullDownToRefreshContent={<Release release={false} {...props} />}
                        releaseToRefreshContent={<Release release={true} {...props} />}
                        refreshFunction={refreshContent}
                    >
                        <div className="container">
                                <Masonry
                                    breakpointCols={breakpointColumnsObj}
                                    className="my-masonry-grid row"
                                    columnClassName="my-masonry-grid_column">
                                    {blogs}
                                </Masonry>
                        </div>
                    </InfiniteScroll>
                }
            </React.Fragment>
        )
    
}
export default Browse