import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index" 

import CensorWord from "../CensoredWords/Index"
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Translate from "../../components/Translate/Index"
import axios from "../../axios-orders"


const Photos = (props) => {
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            photos: props.photos.results,
            pagging: props.photos.pagging,
            artist:props.artist,
            page:2,
            cast:props.cast
        }
    );
   
    useEffect(() => {
        if(props.photos != state.photos){
            setState({photos: props.photos.results,pagging:props.photos.pagging,page:2})
        }
    },[props.photos])
   
    const refreshContent = () => {
        setState({ page: 1, items: [] })
        loadMoreContent()
    }
    const openImage = (id,e) => {
        e.preventDefault()
        if(typeof lightboxJquery == "undefined"){
            return
        }

        var items = [];
        state.photos.forEach(photo => {

            let isS3 = true
            if (photo.image) {
                const splitVal = photo.image.split('/')
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                    isS3 = false
                }
            }

            items.push({
                src:  (isS3 ? props.pageData.imageSuffix : "") + photo.image,
                title: photo.title,
                description: photo.description,
                type: 'image'
            });
        });
        lightboxJquery.magnificPopup.open({
            items:items,
            gallery: {
              enabled: true 
            },
            tCounter:""
          },id);
    }
    const loadMoreContent = () => {
        if(state.loading){
            return
        }
        setState({ loading: true })
        let formData = new FormData();
        if(state.cast)
            formData.append('cast_crew_member_id', state.cast.cast_crew_member_id)
        else
            formData.append('artist_id', state.artist.artist_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/artist-photos"
        if(state.cast)
            url = "/movies/cast-photos"
        formData.append("page", state.page)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.results) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, photos: [...state.photos, ...response.data.results], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });

    }
    
        const photos = state.photos.map((photo,key) => {
            return (
                <div className="gridColumn" key={photo.photo_id}>
                    <div className="ptv_artists_wrap" >
                        <div className="ptv_artist_thumb">
                            <a href="#" onClick={(e) => {openImage(key,e)}}>
                                <Image title={CensorWord("fn",props,photo.name)} image={photo.image} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                            </a>
                        </div>
                        <div className="artist_photo_content">
                            <div className="title">
                                <a href="#" onClick={(e) => {openImage(key,e)}}>
                                    <h4><CensorWord {...props} text={photo.name} /></h4>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )
            
        })
        
        return (
            <InfiniteScroll
                dataLength={state.photos.length}
                next={loadMoreContent}
                hasMore={state.pagging}
                loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.photos.length} />}
                endMessage={
                    <EndContent {...props} text={Translate(props, "No photo uploaded for this artist.")} itemCount={state.photos.length} />
                }
                pullDownToRefresh={false}
                pullDownToRefreshContent={<Release release={false} {...props} />}
                releaseToRefreshContent={<Release release={true} {...props} />}
                refreshFunction={refreshContent}
            >
                <div className="gridContainer artist-gallery">
                    {photos}
                </div>
            </InfiniteScroll>
        )
}

export default Photos
