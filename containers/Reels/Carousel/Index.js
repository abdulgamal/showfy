import React, { useReducer, useEffect, useRef } from "react";
import Slider from "react-slick";
import axios from "../../../axios-orders";
import Link from "../../../components/Link";

const Carousel = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      items:
        props.pageData.reels && props.pageData.reels.results
          ? props.pageData.reels.results
          : [],
      pagging:
        props.pageData.reels && props.pageData.reels.pagging
          ? props.pageData.reels.pagging
          : false,
      openReel: false,
      page: 2,
      fromReel: true,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.items;
  useEffect(() => {
    if (props.pageData.reels && props.pageData.reels.results != state.items) {
      let items =
        props.pageData.reels && props.pageData.reels.results
          ? props.pageData.reels.results
          : [];

      setState({
        items: items,
        page: 2,
        openReel: false,
        pagging:
          props.pageData.reels && props.pageData.reels.pagging
            ? props.pageData.reels.pagging
            : false,
      })
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const items = [...stateRef.current];
      const itemIndex = items.findIndex((p) => p.attachment_id == item_id);
      return itemIndex;
    }
    return -1;
  };
  useEffect(() => {
    props.socket.on("reelDeleted", (socketdata) => {
      let id = socketdata.reel_id;
      let itemIndex = getReelIndex(stateRef.current,id);
      if (itemIndex > -1) {
        let items = [...stateRef.current];
        items.splice(itemIndex, 1);
        props.updatereels(items, state.pagging);
        setState({ items: items });
      }
    });
  }, []);
  const getReelIndex = (reels, reel_id) => {
    if (state.items) {
      const items = [...reels];
      const itemIndex = items.findIndex((p) => p.reel_id == reel_id);
      return itemIndex;
    }
    return -1;
  };
  const getOwnerIndex = (owner_id) => {
    if (state.items) {
      const items = [...state.items];
      const itemIndex = items.findIndex((p) => p.owner_id == owner_id);
      return itemIndex;
    }
    return -1;
  };
  const slideChange = (slide) => {
    if (
      state.items.length > 4 &&
      slide < state.items.length - 4 &&
      state.pagging
    )
      fetchReelsData();
  };

  const fetchReelsData = () => {
    if (state.fetchingData) {
      return;
    }
    setState({ fetchingData: true });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let formData = new FormData();
    let ids = [];
    //get current reels
    state.items.forEach((reel) => {
      ids.push(reel.reel_id);
    });
    formData.append("ids", ids);
    let url = "/reels/get-reels";
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          //silent
        } else {
          if (response.data.reels) {
            props.updatereels(
              [...state.items, ...response.data.reels],
              response.data.pagging
            );
            setState({
              fetchingData: false,
              items: [...state.items, ...response.data.reels],
              pagging: response.data.pagging,
            });
          }
        }
      })
      .catch((err) => {
        //silent
      });
  };
  

  if (!state.items || state.items.length == 0) {
    return null;
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

  let customClass = " stories reels";

  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    className: `carousel-slider${customClass ? customClass : ""}`,
    initialSlide: 0,
    nextArrow: <Right />,
    prevArrow: <Left />,
    afterChange: (current) => slideChange(current),
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 350,
        settings: {
          slidesToShow: 1,

        },
      },
    ],
  };

  let content = state.items.map((item, index) => {
    return (
      <div className="slide-item" key={item.owner_id}>
        <div className="storyThumb">
          <Link
            as={`/reel/${item.reel_id}`}
            href={`/reel`}
            customParam={`id=${item.reel_id}`}
          >
            <a className="storyThumb-content storyThumb-overlay">
              <div className="storyThumb-img">
                <img src={props.pageData.imageSuffix + item.image} />
              </div>
              <div className="storyThumb-name">{item.title}</div>
              <div className="reel-content-info">
                <div className="view">
                  <span
                    className="material-icons-outlined md-18"
                    data-icon="visibility"
                  ></span>
                  {item.view_count}
                </div>
                <div className="VdoDuration">{item.duration}</div>
              </div>
              <div className="storyThumb-profileImg reelThumb-profileImg">
                <img src={props.pageData.imageSuffix + item.avtar} alt="" />
                {item.user_displayname}
              </div>
            </a>
          </Link>
        </div>
      </div>
    );
  });

  return (
    <React.Fragment>
      <div className="strory-widget">
        <Slider {...settings}> {content} </Slider>
      </div>
    </React.Fragment>
  );
};

export default Carousel;
