import React, { useReducer, useEffect, useRef } from "react";
import Item from "../Movies/Item";
import Translate from "../../components/Translate/Index";
import dynamic from "next/dynamic";
import Link from "../../components/Link";

const Carousel = dynamic(() => import("../Slider/Index"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="heading shimmer"></div>
      <div className="grid">
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
      </div>
    </div>
  ),
});

const CarouselMovies = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movies: props.movies,
      key: 1,
      type: "movie",
    }
  );
  const stateRef = useRef();
  stateRef.current = state.movies;
  useEffect(() => {
    if (props.movies != state.movies) {
      setState({ movies: props.movies });
    }
  }, [props.movies]);

  useEffect(() => {
    props.socket.on("movieDeleted", (socketdata) => {
      let id = socketdata.movie_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const movies = [...stateRef.current];
        movies.splice(itemIndex, 1);
        setState({  movies: movies });
      }
    });
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == state.type + "s") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  movies: items });
      }
    });
    props.socket.on("unwatchlaterMovies", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.watchlater_id = null;
        }
        items[itemIndex] = changedItem;
        setState({  movies: items });
      }
    });
    props.socket.on("watchlaterMovies", (socketdata) => {
      let id = socketdata.itemId;
      let ownerId = socketdata.ownerId;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        if (
          props.pageData &&
          props.pageData.loggedInUserDetails &&
          props.pageData.loggedInUserDetails.user_id == ownerId
        ) {
          changedItem.watchlater_id = 1;
        }
        items[itemIndex] = changedItem;
        setState({  movies: items });
      }
    });

    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == state.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const movies = [...stateRef.current];
          const changedItem = { ...movies[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          movies[itemIndex] = changedItem;
          setState({  movies: movies });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == state.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const movies = [...stateRef.current];
          const changedItem = { ...movies[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          movies[itemIndex] = changedItem;
          setState({  movies: movies });
        }
      }
    });

    props.socket.on("likeDislike", (socketdata) => {
      let itemId = socketdata.itemId;
      let itemType = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      let removeLike = socketdata.removeLike;
      let removeDislike = socketdata.removeDislike;
      let insertLike = socketdata.insertLike;
      let insertDislike = socketdata.insertDislike;
      if (itemType == state.type + "s") {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const movies = [...stateRef.current];
          const changedItem = { ...movies[itemIndex] };
          let loggedInUserDetails = {};
          if (props.pageData && props.pageData.loggedInUserDetails) {
            loggedInUserDetails = props.pageData.loggedInUserDetails;
          }
          if (removeLike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = null;
            changedItem["like_count"] = parseInt(changedItem["like_count"]) - 1;
          }
          if (removeDislike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = null;
            changedItem["dislike_count"] =
              parseInt(changedItem["dislike_count"]) - 1;
          }
          if (insertLike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = "like";
            changedItem["like_count"] = parseInt(changedItem["like_count"]) + 1;
          }
          if (insertDislike) {
            if (loggedInUserDetails.user_id == ownerId)
              changedItem["like_dislike"] = "dislike";
            changedItem["dislike_count"] =
              parseInt(changedItem["dislike_count"]) + 1;
          }
          movies[itemIndex] = changedItem;
          setState({  movies: movies });
        }
      }
    });
  }, []);

  const getItemIndex = (item_id) => {
    const movies = [...stateRef.current];
    const itemIndex = movies.findIndex((p) => p["movie_id"] == item_id);
    return itemIndex;
  };

  if (!state.movies || !state.movies.length) {
    return null;
  }

  const content = state.movies.map((result) => {
    return (
      <div key={result.movie_id}>
        <Item {...props} {...result} movie={result} />
      </div>
    );
  });

  return (
    <div className="VideoRoWrap">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titleWrap">
              {props.pageData.themeType == 2 && props.seemore ? (
                <Link
                  href={`/${
                    props.headerType == "Series" ? "series" : "movies"
                  }?${props.type ? "type" : "sort"}=${
                    props.type ? props.type : props.sort
                  }`}
                >
                  <a className="link">
                    <span className="title">
                      <React.Fragment>
                        {props.headerTitle ? props.headerTitle : null}
                        {Translate(props, props.title)}
                      </React.Fragment>
                    </span>
                  </a>
                </Link>
              ) : (
                <span className="title">
                  <React.Fragment>
                    {props.headerTitle ? props.headerTitle : null}
                    {Translate(
                      props,
                      props.title
                        ? props.title
                        : `Popular ${props.headerType}`
                    )}
                  </React.Fragment>
                </span>
              )}
              {props.seemore && state.movies.length > 8 ? (
                props.headerType == "Series" ? (
                  <Link
                    href={`/series?${props.type ? "type" : "sort"}=${
                      props.type ? props.type : props.sort
                    }`}
                  >
                    <a className="seemore_link">
                      {Translate(props, "See more")}
                    </a>
                  </Link>
                ) : (
                  <Link
                    href={`/movies?${props.type ? "type" : "sort"}=${
                      props.type ? props.type : props.sort
                    }`}
                  >
                    <a className="seemore_link">
                      {Translate(props, "See more")}
                    </a>
                  </Link>
                )
              ) : null}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {
              <Carousel
                {...props}
                carouselType="movie"
                items={content}
                itemAt1024={4}
                itemAt1200={4}
                itemAt900={3}
                itemAt600={2}
                itemAt480={1}
              >
                {content}
              </Carousel>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselMovies;
