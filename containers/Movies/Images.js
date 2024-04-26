import React, { useReducer, useEffect, useRef } from "react";
import Image from "../Image/Index";

const Images = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movie: props.movie,
      images: props.images,
    }
  );
  useEffect(() => {
    if (props.pageData.movie != state.movie) {
      setState({
        movie: props.movie,
        images: props.images,
      });
    }
  }, []);

  const openImage = (id, e) => {
    e.preventDefault();
    if (typeof lightboxJquery == "undefined") {
      return;
    }

    var items = [];
    state.images.forEach((photo) => {
      let isS3 = true;
      if (photo.image) {
        const splitVal = photo.image.split("/");
        if (splitVal[0] == "http:" || splitVal[0] == "https:") {
          isS3 = false;
        }
      }

      items.push({
        src: (isS3 ? props.pageData.imageSuffix : "") + photo.image,
        //title: photo.title,
        //description: photo.description,
        type: "image",
      });
    });
    lightboxJquery.magnificPopup.open(
      {
        items: items,
        gallery: {
          enabled: true,
        },
        tCounter: "",
      },
      id
    );
  };

  let items = state.images.map((item, key) => {
    return (
      <div className="gridColumn" key={item.photo_id}>
        <div className="ptv_artists_wrap">
          <div className="ptv_artist_thumb">
            <a
              href="#"
              onClick={(e) => {
                openImage(key, e);
              }}
            >
              <Image
                image={item.image}
                imageSuffix={props.pageData.imageSuffix}
                siteURL={props.pageData.siteURL}
              />
            </a>
          </div>
        </div>
      </div>
    );
  });

  return <div className="gridContainer gridMovieImage">{items}</div>;
};

export default Images;
