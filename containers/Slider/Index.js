import React,{useReducer,useEffect} from 'react'
import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      items: props.children ? props.children : props.items,
    }
  );
  useEffect(() => {
    if (props.children != state.children || props.items != state.items) {
      setState({ items: props.children ? props.children : props.items });
    }
  }, [props]);

  let customClass = "";

  if (props.carouselType) {
    if (props.carouselType == "movie") {
      customClass = " movie-carousel";
    } else if (props.carouselType == "video") {
      customClass = " video-carousel";
    } else if (props.carouselType == "user") {
      customClass = " user-carousel";
    } else if (props.carouselType == "channel_post") {
      customClass = " channel-posts-carousel";
    } else if (props.carouselType == "channel") {
      customClass = " channel-carousel";
    } else if (props.carouselType == "blog") {
      customClass = " blog-carousel";
    } else if (props.carouselType == "audio") {
      customClass = " audio-carousel";
    }
  }

  const Right = (props) => (
    <button
      className={`control-arrow control-next${
        props.className.indexOf("slick-disabled") > -1 ? " slick-disabled" : ""
      }`}
      onClick={props.onClick}
    >
      <span className="material-icons" data-icon="keyboard_arrow_right"></span>
    </button>
  );
  const Left = (props) => {
    return (
      <button
        className={`control-arrow control-prev${
          props.className.indexOf("slick-disabled") > -1
            ? " slick-disabled"
            : ""
        }`}
        onClick={props.onClick}
      >
        <span className="material-icons" data-icon="keyboard_arrow_left"></span>
      </button>
    );
  };

  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: props.defaultItemCount
      ? props.defaultItemCount
      : props.itemAt1024,
    slidesToScroll: 1,
    className: `carousel-slider${customClass ? customClass : ""}`,
    initialSlide: 0,
    // rtl:props.pageData.isRTL ? true : false,
    nextArrow: <Right />,
    prevArrow: <Left />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: props.itemAt1024,
          slidesToScroll: 1,
          infinite: false,
          initialSlide: 0,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: props.itemAt600,
          slidesToScroll: 1,
          infinite: false,
          initialSlide: 0,
          dots: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: props.itemAt480,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      },
    ],
  };

  if (props.itemAt1200) {
    settings.responsive.push({
      breakpoint: 1200,
      settings: {
        slidesToShow: props.itemAt1200,
        slidesToScroll: 1,
        infinite: false,
        dots: false,
      },
    });
  }
  if (props.itemAt1500) {
    settings.responsive.push({
      breakpoint: 1500,
      settings: {
        slidesToShow: props.itemAt1500,
        slidesToScroll: 1,
        infinite: false,
        dots: false,
      },
    });
  }
  if (props.itemAt900) {
    settings.responsive.push({
      breakpoint: 900,
      settings: {
        slidesToShow: props.itemAt900,
        slidesToScroll: 1,
        infinite: false,
        dots: false,
      },
    });
  }

  if (props.pageData.appSettings && props.pageData["themeType"] == 2) {
    settings.responsive = [];
    settings.responsive.push(
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3.1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4.1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 5.1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 1900,
        settings: {
          slidesToShow: 5.1,
          slidesToScroll: 1,
          infinite: false,
          dots: false,
        },
      }
    );
  }

  return <Slider {...settings}> {state.items} </Slider>;
};

export default Index;
