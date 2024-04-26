import React,{useReducer,useEffect,useRef} from 'react'
import Movie from './Item'
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Search from "../Search/Index"
import Translate from "../../components/Translate/Index";
import dynamic from 'next/dynamic'
const Slideshow = dynamic(() => import("./Slideshow"), {
    ssr: false,
    loading: () => <div className="shimmer-elem">
        <div className="slider shimmer"> </div>
    </div>
});

const Browse = (props) => {
    

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            movies: props.movies ? props.movies :  (props.pageData.movies ? props.pageData.movies : props.pageData.items.results),
            page: 2,
            type: "movie",
            pagging: typeof props.pagging != "undefined" ? props.pagging : (typeof props.pageData.pagging != "undefined" ? props.pageData.pagging : props.pageData.items.pagging),
            loading: false,
            searchType: "creation_date",
            search: props.search ? props.search : [],
            contentType:props.contentType,
            slideshow:props.pageData.slideshow
        }
    );
    const stateRef = useRef();
    stateRef.current = state.movies
    useEffect(() => {
        if (props.movies && props.movies != state.movies) {
            setState({slideshow:props.pageData.slideshow, movies: props.movies, pagging: props.pagging, page: 2, search: props.search ? props.search : [],pageType:props.pageType })
        }else if (props.pageData.movies && props.pageData.movies != state.movies) {
            setState({slideshow:props.pageData.slideshow, movies: props.pageData.movies, pagging: props.pageData.pagging, page: 2, search: props.search ? props.search : [],pageType:props.pageData.pageType })
        } else if (props.pageData.movies && props.pageData.movies != state.movies) {
            setState({slideshow:props.pageData.slideshow, movies: props.pageData.movies, pagging: props.pageData.pagging, page: 2, search: props.search ? props.search : [],pageType:props.pageData.pageType })
        }
    },[props])
    
    useEffect(() => {
        props.socket.on('movieDeleted', data => {
            let id = data.movie_id
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const movies = [...stateRef.current]
                movies.splice(itemIndex, 1);
                setState({ movies: movies })
            }
        })
        props.socket.on('ratedItem', data => {
            let id = data.itemId
            let type = data.itemType 
            let Statustype = data.type
            let rating = data.rating
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1 && type == state.type + "s") {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                changedItem.rating = rating
                items[itemIndex] = changedItem
                setState({ movies: items })
            }
        });
        props.socket.on('unwatchlaterMovies', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = null
                }
                items[itemIndex] = changedItem
                setState({ movies: items })
            }
        });
        props.socket.on('watchlaterMovies', data => {
            let id = data.itemId
            let ownerId = data.ownerId
            const itemIndex = getItemIndex(id)
            if (itemIndex > -1) {
                const items = [...stateRef.current]
                const changedItem = {...items[itemIndex]}
                if (props.pageData && props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                    changedItem.watchlater_id = 1
                }
                items[itemIndex] = changedItem
                setState({ movies: items })
            }
        });

        props.socket.on('unfavouriteItem', data => {
            let id = data.itemId
            let type = data.itemType
            let ownerId = data.ownerId
            if (type == state.type + "s") {
                const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const movies = [...stateRef.current]
                    const changedItem = {...movies[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count - 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = null
                    }
                    movies[itemIndex] = changedItem
                    setState({ movies: movies })
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
                    const movies = [...stateRef.current]
                    const changedItem = {...movies[itemIndex]}
                    changedItem.favourite_count = changedItem.favourite_count + 1
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changedItem.favourite_id = 1
                    }
                    movies[itemIndex] = changedItem
                    setState({ movies: movies })
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
                    const movies = [...stateRef.current]
                    const changedItem =  {...movies[itemIndex]};
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
                    movies[itemIndex] = changedItem
                    setState({ movies: movies })
                }
            }
        });
    },[])
    
    const getItemIndex = (item_id) => {
        const movies = [...stateRef.current];
        const itemIndex = movies.findIndex(p => p["movie_id"] == item_id);
        return itemIndex;
    }

    const refreshContent = () => {
        setState({ page: 1, movies: [] })
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
        let url = `/movies-browse`;
        let queryString = "" 
        if(props.typeData == "series"){
            formData.append("type","series")
        }else{
            formData.append("type","movies")
        }
        if (props.pageData.search) {
            queryString = Object.keys(props.pageData.search).map(key => key + '=' + props.pageData.search[key]).join('&');
            url = `${url}?${queryString}`
        }else if(props.user_id){
            formData.append('owner_id',props.user_id)
             url = `/members/movies`;
        } else if (props.globalSearch) {
            queryString = Object.keys(state.search).map(key => key + '=' + state.search[key]).join('&');
            url = `/search?${queryString}`
        }else if(props.contentTypeMovie){
            formData.append('moviePurchased','1')
            formData.append('movie_user_id',props.member.user_id)            
        }else if(props.contentType){
            let queryUser = ""
            if(props.userContent){
                queryUser = "?user="+props.userContent
            }
            url = `/dashboard/${props.typeData}/${props.contentType}${queryUser}`;
        }
        if(props.is_cast){
            url = "/movies-browse"
            formData.append("is_cast",props.is_cast)
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.movies) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, movies: [...state.movies, ...response.data.movies], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }
    
        return (
            <React.Fragment>
                {
                    state.slideshow ? 
                    <Slideshow {...props} slides={state.slideshow}  />
                    : null
                }
                {
                    !props.globalSearch ? 
                    <div className={`${!props.no_user_area ? "user-area" : ""}`}>
                        {
                            (!props.globalSearch && !props.contentType) || props.showSearch ?
                                <div className="container">
                                    <Search {...props} type="movie" typeData={props.typeData} />
                                </div>
                                : null
                        }
                        <InfiniteScroll
                            dataLength={state.movies.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.movies.length} />}
                            endMessage={
                                <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,`No ${props.typeData ? props.typeData : "movies"} found with your matching criteria.`) : Translate(props,`No ${props.typeData ? props.typeData : "movies"} found to display.`)} itemCount={state.movies.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className={`${!props.no_user_area ? "container" : ""}`}>
                                <div className="gridContainer gridMovie">
                                    {
                                        state.movies.map(item => {
                                            return  <div className="item" key={item.movie_id}><Movie {...props}   {...item} movie={item}  /></div>
                                        })
                                    }
                                </div>
                            </div>
                        </InfiniteScroll>      
                    </div>
                :
                <div className="cnt-movies">
                    <InfiniteScroll
                            dataLength={state.movies.length}
                            next={loadMoreContent}
                            hasMore={state.pagging}
                            loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.movies.length} />}
                            endMessage={
                                <EndContent {...props} text={props.pageData.search || props.globalSearch ?  Translate(props,'No data found with your matching criteria.') : Translate(props,'No data found to display.')} itemCount={state.movies.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            <div className="container">
                                <div className="gridContainer gridMovie">
                                    {
                                        state.movies.map(item => {
                                            return <div className="item" key={item.movie_id}><Movie {...props} key={item.movie_id}  {...item} movie={item}  /></div>
                                        })
                                    }
                                </div>
                            </div>
                    </InfiniteScroll> 
                </div>
            }
            </React.Fragment>
        )
    }




export default Browse