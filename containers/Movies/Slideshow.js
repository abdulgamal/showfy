import React, { useReducer, useEffect, useRef } from "react";
import Carousel from "react-slick";
import Link from "../../components/Link";
import CensorWord from "../CensoredWords/Index";

const Slideshow = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      slides: props.slides,
      id: 1,
    }
  );

  useEffect(() => {
    if (props.slides != state.slides) {
      setState({ slides: props.slides });
    }
  }, [props]);

  const linkify = (inputText) => {
    inputText = inputText.replace(/&lt;br\/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br \/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br&gt;/g, " <br/>");
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(
      replacePattern1,
      '<a href="$1" target="_blank" rel="nofollow">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 =
      /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1" rel="nofollow">$1</a>'
    );

    return replacedText;
  };
  if (!state.slides || !state.slides.length) {
    return null;
  }

  const Right = (props) => (
    <button className="control-arrow control-next" onClick={props.onClick}>
      <span className="material-icons" data-icon="keyboard_arrow_right"></span>
    </button>
  );
  const Left = (props) => (
    <button className="control-arrow control-prev" onClick={props.onClick}>
      <span className="material-icons" data-icon="keyboard_arrow_left"></span>
    </button>
  );
  var settings = {
    dots: true,
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: "carousel-slider",
    initialSlide: 0,
    nextArrow: <Right />,
    prevArrow: <Left />,
    centerMode: true,
    centerPadding: "4%",
  };
  return (
    <div className={`SlideAdsWrap  nobtn`}>
      <div id="snglFullWdth" className="snglFullWdth">
        <Carousel {...settings}>
          {state.slides.map((item) => {
            let isS3 = true;
            let background = "";
            let avtar = "";
            if (item.image) {
              const splitVal = item.image.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isS3 = false;
              }
            }
            background =
              (isS3 ? props.pageData.imageSuffix : "") + item.image;
            let isS3Avtar = true;
            if (item.avtar) {
              const splitVal = item.avtar.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isS3Avtar = false;
              }
            }
            avtar =
              (isS3Avtar ? props.pageData.imageSuffix : "") + item.avtar;
            return (
              <div
                className="banner-wrap justify-content-between align-items-center"
                key={item.movie_id}
              >
                <div className="left-wrap">
                  <h4 className="my-3 ellipsize2Line">
                    <Link
                      href="/watch"
                      customParam={`id=${item.custom_url}`}
                      as={`/watch/${item.custom_url}`}
                    >
                      <a>{<CensorWord {...props} text={item.title} />}</a>
                    </Link>
                  </h4>
                  <div
                    className="BnrUserInfo mb-3 description"
                    style={{ whiteSpace: "pre-line" }}
                    dangerouslySetInnerHTML={{
                      __html: linkify(item.description),
                    }}
                  ></div>
                  <div className="d-flex align-items-center">
                    <Link
                      href="/watch"
                      customParam={`id=${item.custom_url}`}
                      as={`/watch/${item.custom_url}`}
                    >
                      <a className="btn btn-lg playBtn">
                        <span className="d-flex align-items-center justify-content-center">
                          <span className="material-icons-outlined">
                            play_arrow
                          </span>{" "}
                          {props.t("Watch Now")}
                        </span>
                      </a>
                    </Link>
                  </div>
                </div>
                <div
                  className="right-wrap"
                  style={{ backgroundImage: `url(${background})` }}
                ></div>
              </div>
            );
          })}
        </Carousel>
      </div>
    </div>
  );
};

export default Slideshow;
