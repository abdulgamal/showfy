import React,{useReducer,useEffect,useRef} from 'react'
import Slider from "react-slick"
import axios from "../../../axios-orders"
import dynamic from 'next/dynamic'
import Stories from "./Stories"

const Create = dynamic(() => import("./Create"), {
    ssr: false,
    loading: () => <></>
});

const Carousel = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            items:props.pageData.stories && props.pageData.stories.results ? props.pageData.stories.results : [],
            pagging:props.pageData.stories && props.pageData.stories.pagging ? props.pageData.stories.pagging : false,
            openStory:props.openStory ?? false,
            // selectedStory: 0,
            page:2,
            fromStory:true
        }
    );
    const stateRef = useRef();
    stateRef.current = state.items
    useEffect(() => {
        if(props.pageData.stories && props.pageData.stories.results != state.items){
            let items = props.pageData.stories && props.pageData.stories.results ? props.pageData.stories.results : []
            
            setState({
                items:items,
                page:2,
                openStory:false,
                pagging:props.pageData.stories && props.pageData.stories.pagging ? props.pageData.stories.pagging : false
            })
        }
    },[props])
    useEffect(() => {
        props.socket.on('storiesCreated', data => {
            let id = data.id;
            let owner_id = data.owner_id
            let file = data.file
            let status = data.status 
            let itemIndex = getOwnerIndex(owner_id)
            if(itemIndex > -1){
                const items = stateRef.current
                if(items[itemIndex].stories){
                    let getStoryIndex = getStoryItemIndex(items[itemIndex].stories,id)
                    if(getStoryIndex > -1){
                        items[itemIndex].stories[getStoryIndex].file = file
                        items[itemIndex].stories[getStoryIndex].status = status
                        let stateItem = {}
                        stateItem["items"] = items;
                        props.updateStories(items,state.pagging)
                        setState(stateItem);
                    }
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
            let itemOwnerID = data.itemOwnerID
            if (itemType == "stories") {
                let itemIndex = getOwnerIndex(itemOwnerID)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    let getStoryIndex = getStoryItemIndex(items[itemIndex].stories,itemId)
                    if(getStoryIndex > -1){
                        const changedItem = items[itemIndex].stories[getStoryIndex]

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
                        props.updateStories(items,state.pagging)
                        setState({ items: items })
                    }
                }
            }
        });


        props.socket.on('unfollowUser', data => {
            let type = data.itemType
            let id = data.itemId
            let ownerId = data.ownerId
            let changed = false;
            if (type == "members") {
                let itemIndex = getOwnerIndex(id)
                if(itemIndex > -1){
                    let items = [...stateRef.current]
                    
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changed = true;
                        items[itemIndex].follower_id = null
                    }

                
                    if(changed){
                        props.updateStories(items,state.pagging)
                        setState({items:items,loadingViewer:true})
                    }
                        
                }
            }
        });
        props.socket.on('followUser', data => {
            let type = data.itemType
            let ownerId = data.ownerId
            let id = data.itemId
            let changed = false;
            if (type == "members") {
                let itemIndex = getOwnerIndex(id)
                if(itemIndex > -1){
                    let items = [...stateRef.current]
                    
                    if (props.pageData.loggedInUserDetails && props.pageData.loggedInUserDetails.user_id == ownerId) {
                        changed = true;
                        items[itemIndex].follower_id = 1
                    }
                
                    if(changed){
                        props.updateStories(items,state.pagging)
                        setState({items:items,loadingViewer:true})
                    }
                        
                }
            }
        });

        props.socket.on('deleteStory',data => {
            let story = data.story
            let owner_id = story.owner_id
            let itemIndex = getOwnerIndex(owner_id)
            if(itemIndex > -1){
                const items = stateRef.current
                if(items[itemIndex].stories){
                    let getStoryIndex = getStoryItemIndex(items[itemIndex].stories,story.story_id)
                    if(getStoryIndex > -1){
                        items[itemIndex].stories.splice(getStoryIndex, 1)
                        let stateItem = {}
                        if(items[itemIndex].stories.length == 0){
                            //remove story
                            items.splice(itemIndex, 1);
                            let totalLength = items.length;
                            if(items.length && items[0].type == "create"){
                                totalLength = totalLength - 1;
                                itemIndex = itemIndex -1
                            }
                            if(itemIndex <= totalLength - 1){
                                stateItem.selectedOpenStory = itemIndex;
                            }else if(itemIndex - 1 <= totalLength - 1){
                                stateItem.selectedOpenStory = itemIndex - 1;
                            }else{
                                $("body").removeClass("stories-open");
                                stateItem.openStory = false
                            }
                            stateItem.selectedStory = 0
                        }else{
                            if(items[itemIndex].stories.length - 1 < getStoryIndex){
                                stateItem.selectedStory = 0
                            }
                        }
                        stateItem["items"] = items;
                        stateItem["selectedOpenStory"] = null;
                        stateItem["selectedStory"] = null;
                        props.updateStories(items,state.pagging)
                        setState(stateItem);
                    }
                }
            }
        })
        props.socket.on('muteStory',data => {
            let resource_owner = data.resource_owner
            let owner_id = data.owner_id
            if(props.pageData.loggedInUserDetails && owner_id == props.pageData.loggedInUserDetails.user_id){
                let itemIndex = getOwnerIndex(resource_owner)
                if(itemIndex > -1){
                    const items = [...stateRef.current]
                    items.splice(itemIndex, 1);
                    let stateItem = {}
                    let totalLength = items.length;
                    if(items.length && items[0].type == "create"){
                        totalLength = totalLength - 1;
                        itemIndex = itemIndex -1
                    }
                    if(itemIndex <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex;
                    }else if(itemIndex - 1 <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex - 1;
                    }else{
                        $("body").removeClass("stories-open");
                        stateItem.openStory = false
                    }
                    props.updateStories(items,state.pagging)
                    stateItem.items = items
                    stateItem.selectedOpenStory = null
                    stateItem.selectedStory = null
                    setState(stateItem);
                }
            }
        })
    },[])
    
    const getStoryItemIndex = (stories,story_id) => {
        if(stateRef.current){
            const items = [...stories];
            const itemIndex = items.findIndex(p => p.story_id == story_id);
            return itemIndex;
        }
        return -1
    }
    const getOwnerIndex = (owner_id) => {
        if(stateRef.current){
            const items = [...stateRef.current];
            const itemIndex = items.findIndex(p => p.owner_id == owner_id);
            return itemIndex;
        }
        return -1
    }
    const slideChange = (slide) => {
        if(state.items.length > 4 && slide < state.items.length - 4 && state.pagging)
            fetchStoriesData()
    }
    const getStoryViewer = (item,story_id) => {
        setState({loadingViewer:true,});
        let itemIndex = getOwnerIndex(item.owner_id);
        let stories = null;
        const items = [...state.items];
        if(itemIndex > -1){
            let storyIndex = getStoryItemIndex(items[itemIndex].stories,story_id);
            if(storyIndex > -1){
                stories = items[itemIndex].stories[storyIndex];

            }
        }
        let owner_id = false
        if(props.pageData.loggedInUserDetails && item.owner_id != props.pageData.loggedInUserDetails.user_id){
            owner_id = props.pageData.loggedInUserDetails.user_id
        }else if(!props.pageData.loggedInUserDetails){
            owner_id = -1;
        }
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        if(owner_id){
            //update viewers
            formData.append('owner_id',owner_id);
        }
        formData.append('story_id',story_id);
        if(props.pageData.loggedInUserDetails && item.owner_id == props.pageData.loggedInUserDetails.user_id){
            if(stories){
                formData.append('getViewer',1);
                if(stories.viewers && stories.viewers[stories.viewers.length - 1]){
                    formData.append('last',stories.viewers[stories.viewers.length - 1].user_id);
                }
            }
        }
        
        let url = '/stories/get-update-viewer';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.viewers){
                    if(stories.viewers){
                        stories.viewers = [...stories.viewers,...response.data.viewers]
                    }else{
                        stories.viewers = []
                        stories.viewers = response.data.viewers
                    }
                    props.updateStories(items,state.pagging)
                    setState({items:items,loadingViewer:false})
                }else if(stories){
                    if(!stories.viewers){
                        stories.viewers = []
                    }
                    stories.viewersPagging = true;
                    props.updateStories(items,state.pagging)
                    setState({items:items,loadingViewer:false})
                }
                   
            }
        }).catch(err => {
            //silent
        });

    }
    const fetchStoriesData = () => {
        if(state.fetchingData){
            return;
        }
        setState({fetchingData:true});
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let formData = new FormData();
        formData.append('page',state.page);
        let ids = []
        //get current stories
        state.items.forEach(story => {
            if(story.owner_id)
                ids.push(story.owner_id)
        })
        formData.append('ids',ids)
        let url = '/stories/get-stories';
        axios.post(url, formData,config)
        .then(response => {
            if(response.data.error){
                //silent
            }else{
                if(response.data.stories){
                    props.updateStories([...state.items,...response.data.stories],response.data.pagging)
                    setState({fetchingData:false,page:state.page + 1,items:[...state.items,...response.data.stories],pagging:response.data.pagging})
                }
            }
        }).catch(err => {
            //silent
        });
    }
    const closePopup = (e) => {
        if(e != "notClose")
            props.closePopupFirst(false);
        let data = {create:false,fromStory:true}
        if(e == "close")
            data.openStory = false;
        setState(data)    
    }
    const closeStoriesPopup = (e) => {
        props.closePopupFirst(false);
        setState({openStory:false})    
    }
    const removeStory = (id,owner_id) => {
        const items = [...state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == owner_id);        
        let stateItem = {}
        if(itemIndex > -1){
            let stories = state.items[itemIndex]
            let storyIndex = stories.stories.findIndex(p => p.story_id == id);
            if(storyIndex > -1){
                //remove Story
                stories.stories.splice(storyIndex, 1);
                if(stories.stories.length == 0){
                    //remove story
                    items.splice(itemIndex, 1);
                    let totalLength = items.length;
                    if(items.length && items[0].type == "create"){
                        totalLength = totalLength - 1;
                        itemIndex = itemIndex -1
                    }
                    if(itemIndex <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex;
                    }else if(itemIndex - 1 <= totalLength - 1){
                        stateItem.selectedOpenStory = itemIndex - 1;
                    }else{
                        $("body").removeClass("stories-open");
                        stateItem.openStory = false
                    }
                    stateItem.selectedStory = 0
                }else{
                    if(stories.stories.length - 1 < storyIndex){
                        stateItem.selectedStory = 0
                    }
                }
                stateItem["items"] = items;
                props.updateStories(items,state.pagging)
                stateItem.selectedStory = null
                stateItem.selectedStory = null
                setState(stateItem);
            }
        }
    }
    const muteStory = (id) => {
        let items = [...state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == id);        
        let stateItem = {}
        if(itemIndex > -1){
            items.splice(itemIndex, 1);
            let totalLength = items.length;
            if(items.length && items[0].type == "create"){
                totalLength = totalLength - 1;
                itemIndex = itemIndex - 1
            }
            if(itemIndex <= totalLength - 1){
                stateItem.selectedOpenStory = itemIndex;
            }else if(itemIndex - 1 <= totalLength - 1){
                stateItem.selectedOpenStory = itemIndex - 1;
            }else{
                $("body").removeClass("stories-open");
                stateItem.openStory = false
            }
            stateItem["items"] = items;
            stateItem["selectedOpenStory"] = null;
            stateItem["selectedStory"] = null;
            props.updateStories(items,state.pagging)
            setState(stateItem);
        }
    }
    const newDataPosted = (data) => {
        if(!data)
            return;
        const items = [...state.items];
        let itemIndex = items.findIndex(p => p["owner_id"] == data.owner_id); 
        if(itemIndex > -1){
            items[itemIndex].stories.unshift(data.stories[0]);            
        }else{
            items.splice(1,0,data)
        }    
        props.updateStories(items,state.pagging)
        setState({items:items});
    }

        if(!state.items || state.items.length == 0){
            return null
        }
        // const Right = props => (
        //     <button className={`storySlide-next storySlideBtn${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`}  onClick={props.onClick}>
        //         <span className="material-icons-outlined">
        //             arrow_forward_ios
        //         </span>
        //     </button>
        //   )
        // const Left = props => {
        //   return  <button className={`storySlide-prev storySlideBtn${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`}  onClick={props.onClick}>
        //             <span className="material-icons-outlined">
        //                 arrow_back_ios
        //             </span>
        //         </button>
        // }
        const Right = props => (
            <button className={`control-arrow control-next${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`} onClick={props.onClick}>
              <span className="material-icons" data-icon="keyboard_arrow_right"></span>
            </button>
          )
        const Left = props => {
          return  <button className={`control-arrow control-prev${props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""}`} onClick={props.onClick}>
              <span className="material-icons" data-icon="keyboard_arrow_left"></span>
            </button>
        }
        
        let customClass = " stories" 

        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 10,
            slidesToScroll: 1,
            className:`carousel-slider${customClass ? customClass : ''}`,
            initialSlide: 0,
            nextArrow:<Right />,
            prevArrow:<Left />,
            afterChange: current => slideChange(current),
            responsive: [
                {
                    breakpoint: 1400,
                    settings: {
                      slidesToShow: 6,
                    }
                },
                {
                    breakpoint: 1300,
                    settings: {
                        slidesToShow: 5,
                    }
                },
                {
                    breakpoint: 1000,
                    settings: {
                        slidesToShow: 4,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                    }
                }
            ]
          };

          const truncateString = (string = '', maxLength = 50) => 
            string.length > maxLength 
                ? `${string.substring(0, maxLength)}…`
                : string

        let content = state.items.map((item,index) => {
            return (
                item.type == "create" && props.pageData.loggedInUserDetails && props.pageData.levelPermissions["stories.create"] == 1 ? 
                    <div className="slide-item" key={item}>
                        <div className="storyThumb createStoryBlock">
                            <a className="storyThumb-content storyThumb-overlay" href="#" onClick={
                                (e) => {
                                    
                                    e.preventDefault();
                                    setState({create:true})
                                }
                            }>
                                <div className="storyThumb-img">
                                    <img src={props.pageData.imageSuffix+props.pageData.loggedInUserDetails.avtar} alt="" />
                                </div>
                                <div className="create-story-btn">
                                        <div className="icon"><span className="material-icons">add</span></div>
                                        <div className="text">{props.t("Create Story")}</div>
                                    </div>

                                {/* <div className="storyThumb-name">
                                    {props.t("Create Story")}
                                </div> */}
                            </a>
                        </div>
                    </div>
                :
                    <div className="slide-item" key={item.owner_id}>
                        <div className="storyThumb">
                            <a className="storyThumb-content storyThumb-overlay" href="#" onClick={(e) => {
                                e.preventDefault();
                                let indexNumber = index
                                if(state.items[0].type == "create"){
                                    indexNumber = index - 1
                                }
                                setState({openStory:indexNumber})
                            }}>
                                <div className="storyThumb-img">
                                    <img src={props.pageData.imageSuffix + (item.stories[0].type == 3 ? item.stories[0].background_image : item.stories[0].image)} alt="" />
                                    {
                                        item.stories[0].type == 3 ? 
                                            <p style={{color:item.stories[0].text_color}}>{truncateString(item.stories[0].description, 30)}</p>
                                        : null
                                    }
                                </div>
                                <div className="storyThumb-name">
                                    {item.yourstory ? item.yourstory : item.displayname}
                                </div>
                                <div className="storyThumb-profileImg">
                                    <img src={props.pageData.imageSuffix+ item.avtar} alt="" />
                                </div>
                            </a>
                        </div>
                    </div>
            )
            
        })

        let createD = null
        if(state.create){
            createD = <Create {...props} fromDirect={state.fromStory} closePopup={closePopup} closePopupFirst={props.closePopupFirst} newDataPosted={newDataPosted} />
        }
        let openStory = null
        if(state.openStory === 0 || state.openStory){
            let items = [...state.items]
            if(items.length && items[0].type == "create"){
                items.shift(); 
            }
            openStory = <Stories {...props} closePopupFirst={props.closePopupFirst} loadingViewer={state.loadingViewer} getStoryViewer={getStoryViewer} pagging={state.pagging} fetchingData={state.fetchingData} fetchStoriesData={fetchStoriesData} muteStory={muteStory} selectedOpenStory={state.selectedOpenStory} selectedStory={state.selectedStory} removeStory={removeStory} items={items} openStory={state.openStory} closePopup={closeStoriesPopup} createStory={
                (e) => {
                    e.preventDefault();
                    setState({create:true,fromStory:false})
                }
            } />
        }

        return (
            <React.Fragment>
                {openStory}
                {createD}
                {
                    props.fromStoryViewPage ? 
                    null
                :
                <div className="strory-widget">
                    <Slider {...settings} > {content} </Slider>
                </div>
                }
            </React.Fragment>
        )
    }



export default Carousel