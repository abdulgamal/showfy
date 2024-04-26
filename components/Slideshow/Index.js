import React,{useReducer,useEffect,useRef} from 'react'
import Carousel from "react-slick"
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";


const Slideshow = (props) => {
 
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            class:props.class ? props.class : "",
            width:props.isMobile ? props.isMobile : 993,
        }
    );
    const clickedItem = (link) => {
        if(state.width < 993 && link){
            window.open(link, '_blank');
        }
    } 
        if(!props.pageData.slideshow){
            return null
        }
        const Right = props => (
            <button className="control-arrow control-next" onClick={props.onClick}>
              <span className="material-icons" data-icon="keyboard_arrow_right"></span>
            </button>
          )
        const Left = props => (
            <button className="control-arrow control-prev" onClick={props.onClick}>
              <span className="material-icons" data-icon="keyboard_arrow_left"></span>
            </button>
          )
        var settings = {
            dots: true,
            autoplay:true,
            autoplaySpeed:3000,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            className:"carousel-slider",
            initialSlide: 0,
            nextArrow:<Right />,
            prevArrow:<Left />,
          };

        let items = props.pageData.slideshow.map(elem => {
            let videoImage = elem.image
            if(props.pageData.livestreamingtype == 0 && elem.mediaserver_stream_id &&  !elem.orgImage && elem.is_livestreaming == 1 && parseInt(props.pageData.appSettings['antserver_media_hlssupported']) == 1){
                if(props.pageData.liveStreamingCDNServerURL){
                    videoImage = `${props.pageData.liveStreamingCDNServerURL}/${props.pageData.streamingAppName}/previews/${elem.mediaserver_stream_id}.png`
                }else
                    videoImage = `${props.pageData.liveStreamingServerURL}:5443/${props.pageData.streamingAppName}/previews/${elem.mediaserver_stream_id}.png`
            }else  if(elem.mediaserver_stream_id &&  elem.image && (elem.image.indexOf(`LiveApp/previews`) > -1 || elem.image.indexOf(`WebRTCAppEE/previews`) > -1)){
                if(props.pageData.liveStreamingCDNURL){
                    videoImage = `${props.pageData.liveStreamingCDNURL}${elem.image.replace(`/LiveApp`,"").replace(`/WebRTCAppEE`,"")}`
                }else
                    videoImage = `${props.pageData.liveStreamingServerURL}:5443${elem.image}`
            }

            let isS3 = true
            if (videoImage) {
                const splitVal = videoImage.split('/')
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                    isS3 = false
                }
            }

            return (
                <div className="item" key={elem.slideshow_id} onClick={(e) => clickedItem(elem.link1)}>
                    <div className="snglFullWdth-box">
                        <div className="img">
                            <img src={(isS3 ? props.pageData.imageSuffix : "") + videoImage} />
                        </div>
                        <div className="content">
                            <div className="snglFullWdth-content-box">
                                <h3 className="title">{props.t(elem.title ?? "")}</h3>
                                <p className="text d-none d-md-block">{props.t(elem.description ?? "")}</p>
                                <div className="buttons">
                                    {
                                        elem.button_1_enabled && elem.text1 != ""? 
                                        <a className="button hvr-bs animated" href={elem.link1} target="_blank">{props.t(elem.text1 ?? "")}</a>
                                        : null
                                    }
                                    {
                                        elem.button_2_enabled && elem.text2 != ""? 
                                        <a className="button hvr-bs animated" href={elem.link2} target="_blank">{props.t(elem.text2 ?? "")}</a>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })


        return ( 
            <div className={`SlideAdsWrap${state.class}`}>
                <div id="snglFullWdth" className="snglFullWdth">
                    <Carousel {...settings} >
                        {items}
                    </Carousel>
                </div>
            </div>
        )

}


export default Slideshow