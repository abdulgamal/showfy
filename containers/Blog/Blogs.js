import React,{useReducer,useEffect,useRef} from 'react'
import Blog from '../Blog/Item'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index";

const Browse = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            page: 2,
            type: 'blog',
            blogs: props.blogs,
            pagging: props.pagging
        }
    );

    const stateRef = useRef();
    stateRef.current = state.blogs

    useEffect(() => {
        if (props.blogs && props.blogs != state.blogs) {
            setState({ blogs: props.blogs, pagging: props.pagging, page: 2})
        }else if (props.pageData.blogs && props.pageData.blogs != state.blogs) {
            setState({ blogs: props.pageData.blogs.results, pagging: props.pageData.blogs.pagging, page: 2 })
        }
    },[props])

    useEffect(() => {
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == "blogs") {
                const items = [...stateRef.current]
                const changedItem = items[itemIndex]
                changedItem.rating = rating
                if(props.updateParentItems)
                    props.updateParentItems("blogs",null,items);
                setState({ blogs: items })
            }
        });
        props.socket.on('blogDeleted', data => {
            let id = data.blog_id
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const blogs = [...stateRef.current]
                blogs.splice(itemIndex, 1);
                if(props.updateParentItems)
                    props.updateParentItems("blogs",null,blogs);
                setState({ blogs: blogs })
            }
        })
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
                    if(props.updateParentItems)
                    props.updateParentItems("blogs",null,blogs);
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
                    if(props.updateParentItems)
                    props.updateParentItems("blogs",null,blogs);
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
                    if(props.updateParentItems)
                    props.updateParentItems("blogs",null,blogs);
                    setState({ blogs: blogs })
                }
            }
        });
    })
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
        loadMoreContent()
    }
    const loadMoreContent = () => {
        setState({ loading: true })
        let formData = new FormData();
        formData.append('page', state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = ""
        if (props.contentType) {
            let queryUser = ""
            if(props.userContent){
                queryUser = "?user="+props.userContent
            }
            url = `/dashboard/blogs/${props.contentType}${queryUser}`;
        } else if (props.user_id) {
            formData.append('owner_id', props.user_id)
            url = `/members/blogs`;
        }

        axios.post(url, formData, config)
            .then(response => {
                if (response.data.blogs) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, blogs: [...state.blogs, ...response.data.blogs], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(() => {
                setState({ loading: false })
            });
    }
        let blogs = state.blogs.map(item => {
            return <div key={item.blog_id} className={`gridColumn`}>
                <Blog {...props} canDelete={props.canDelete} canEdit={props.canEdit} key={item.blog_id} {...item} result={item} />
            </div>
        })
        return (
            <React.Fragment>
                        <InfiniteScroll
                            dataLength={state.blogs.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.blogs.length} />}
                            endMessage={
                                <EndContent {...props} text={props.contentType == "my" ? Translate(props,'No blog created yet.') : (props.contentType ? Translate(props,'No blog found with your matching criteria.') : Translate(props,'No blog created by this user yet.'))} itemCount={state.blogs.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className="gridContainer gridBlog">
                                {blogs}
                            </div>
                        </InfiniteScroll>
            </React.Fragment>
        )
    }


export default Browse