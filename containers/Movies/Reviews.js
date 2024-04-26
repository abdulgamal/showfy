import React, { useEffect, useReducer, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "../../axios-orders";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import Rating from "../../containers/Rating/Index";
import Timeago from "../Common/Timeago";
import AddReview from "../Form/Review";
import Image from "../Image/Index";
import EndContent from "../LoadMore/EndContent";
import LoadMore from "../LoadMore/Index";
import Release from "../LoadMore/Release";

const Reviews = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      pagging: props.reviews.pagging,
      reviews: props.reviews.results,
      page: 2,
      moreItems: [],
      movie: props.movie,
      canEdit: props.canEdit,
      canDelete: props.canDelete,
      writereview: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.reviews;
  useEffect(() => {
    if (props.pageData.movie != state.movie) {
      setState({
        pagging: props.reviews.pagging,
        reviews: props.reviews.results,
        page: 2,
        moreItems: [],
        movie: props.movie,
        writereview: false,
      });
    }
  }, [props]);
  useEffect(() => {
    props.socket.on("reviewMovieDelete", (socketdata) => {
      let id = socketdata.id;
      let movieID = socketdata.movieID;
      if (state.movie && state.movie.movie_id == movieID) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const reviews = [...stateRef.current];
          reviews.splice(itemIndex, 1);
          setState({ reviews: reviews });
        }
      }
    });
    props.socket.on("movieReviewUpdated", (socketdata) => {
      let review = socketdata.review;
      if (state.movie && state.movie.movie_id == review.movie_id) {
        const itemIndex = getItemIndex(review.review_id);
        if (itemIndex > -1) {
          const reviews = [...stateRef.current];
          reviews[itemIndex] = review;
          setState({ reviews: reviews });
        }
      }
    });
    props.socket.on("movieReviewCreated", (socketdata) => {
      let review = socketdata.review;
      if (state.movie && state.movie.movie_id == review.movie_id) {
        const reviews = [...stateRef.current];
        reviews.unshift(review);
        setState({ reviews: reviews });
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    const reviews = [...stateRef.current];
    const itemIndex = reviews.findIndex((p) => p["review_id"] == item_id);
    return itemIndex;
  };

  const refreshContent = () => {
    setState({ page: 1, cast: [] });
    loadMoreContent();
  };

  const loadMoreContent = () => {
    setState({ loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/movies/reviews";
    formData.append("movie_id", state.movie.movie_id);
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.reviews) {
          let pagging = response.data.pagging;
          setState({
            page: state.page + 1,
            pagging: pagging,
            reviews: [...state.reviews, ...response.data.reviews],
            loading: false,
          });
        } else {
          setState({ loading: false });
        }
      })
      .catch((err) => {
        setState({ loading: false });
      });
  };
  const writeAReview = () => {
    if (props.pageData.loggedInUserDetails) {
      const reviews = [...state.reviews];
      const itemIndex = reviews.findIndex(
        (p) => p["owner_id"] == props.pageData.loggedInUserDetails.user_id
      );
      if (itemIndex > -1) {
        let review = reviews[itemIndex];
        setState({ writereview: true, editItem: review });
      } else {
        setState({ writereview: true });
      }
    } else {
      document.getElementById("loginFormPopup").click();
      return;
    }
  };
  const deleteFn = (id, e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Are you sure?"),
      text: Translate(
        props,
        `Once deleted, you will not be able to recover this review!`
      ),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("movie_id", state.movie.movie_id);
        formData.append("review_id", id);
        const url = "/review/delete";
        axios
          .post(url, formData)
          .then((response) => {
            if (response.data.error) {
              swal(
                "Error",
                Translate(
                  props,
                  "Something went wrong, please try again later"
                ),
                "error"
              );
            } else {
            }
          })
          .catch((err) => {
            swal(
              "Error",
              Translate(props, "Something went wrong, please try again later"),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  const closePopup = () => {
    setState({ editItem: null, writereview: false });
  };

  return (
    <React.Fragment>
      {state.writereview ? (
        <div className="popup_wrapper_cnt">
          <div className="popup_cnt">
            <div className="comments">
              <div className="VideoDetails-commentWrap">
                <div className="popup_wrapper_cnt_header">
                  <h2>
                    {Translate(
                      props,
                      !state.editItem ? "Add Review" : "Update Review"
                    )}
                  </h2>
                  <a onClick={closePopup} className="_close">
                    <i></i>
                  </a>
                </div>
                <div className="row">
                  <AddReview
                    {...props}
                    closePopup={closePopup}
                    movie_id={state.movie.movie_id}
                    editItem={state.editItem}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <button className="write-review mb-3" onClick={writeAReview}>
        {props.t("Write a Review")}
      </button>
      <InfiniteScroll
        dataLength={state.reviews.length}
        next={loadMoreContent}
        hasMore={state.pagging}
        loader={
          <LoadMore
            {...props}
            page={state.page}
            loading={true}
            itemCount={state.reviews.length}
          />
        }
        endMessage={
          <EndContent
            {...props}
            text={Translate(props, "There are no reviews created yet.")}
            itemCount={state.reviews.length}
          />
        }
        pullDownToRefresh={false}
        pullDownToRefreshContent={<Release release={false} {...props} />}
        releaseToRefreshContent={<Release release={true} {...props} />}
        refreshFunction={refreshContent}
      >
        {state.reviews.map((review) => {
          let descriptionText = review.description;
          let type = "";
          if (descriptionText.length > 500) {
            if (state.moreItems[review.review_id]) {
              type = "less";
            } else {
              descriptionText = descriptionText.substring(0, 500) + "...";
              type = "more";
            }
          }
          let description = descriptionText;
          return (
            <div key={review.review_id} className="review-container">
              <div className="header">
                <div className="image">
                  <Link
                    href="/member"
                    customParam={`id=${review.username}`}
                    as={`/${review.username}`}
                  >
                    <a>
                      <Image
                        title={review.displayname}
                        height="40"
                        width="40"
                        image={review.avtar}
                        imageSuffix={props.pageData.imageSuffix}
                        siteURL={props.pageData.siteURL}
                      />
                    </a>
                  </Link>
                </div>
                <div className="info">
                  <div className="author">
                    <Link
                      href="/member"
                      customParam={`id=${review.username}`}
                      as={`/${review.username}`}
                    >
                      <a>{review.displayname}</a>
                    </Link>
                  </div>
                  <div className="date">
                    <Timeago {...props}>{review.creation_date}</Timeago>
                  </div>
                  <div className="rating">
                    <Rating
                      {...props}
                      rating={review.rating}
                      hideStats={true}
                      updateRating={true}
                      ratingInteract={true}
                    />
                  </div>
                </div>
                {state.canDelete ||
                (props.pageData.loggedInUserDetails &&
                  props.pageData.loggedInUserDetails.user_id ==
                    review.owner_id) ? (
                  <div className="option">
                    <a href="#" onClick={(e) => deleteFn(review.review_id, e)}>
                      <span
                        className="material-icons"
                        data-icon="delete"
                      ></span>
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="content">
                <span>{description}</span>
                {type == "more" ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      let items = [...state.moreItems];
                      items[review.review_id] = review.review_id;
                      setState({ moreItems: items });
                    }}
                  >
                    {props.t("view more")}
                  </a>
                ) : type == "less" ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      let items = [...state.moreItems];
                      items[review.review_id] = null;
                      setState({ moreItems: items });
                    }}
                  >
                    {props.t("view less")}
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </InfiniteScroll>
    </React.Fragment>
  );
};

export default Reviews;
