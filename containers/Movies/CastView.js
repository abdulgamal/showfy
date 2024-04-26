import React, { useReducer, useEffect, useRef } from "react";
import ShortNumber from "short-number";
import Router, { withRouter } from "next/router";
import Rating from "../Rating/Index";
import TopView from "./TopView";
import Comment from "../Comments/Index";
import Translate from "../../components/Translate/Index";
import Photos from "../Artist/Photos";
import Movies from "./Browse";

const Cast = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      page: 2,
      cast: props.pageData.cast,
      movies: props.pageData.cast_movies
        ? props.pageData.cast_movies.results
        : [],
      series: props.pageData.cast_series
        ? props.pageData.cast_series.results
        : [],
      moviesPagging: props.pageData.cast_movies
        ? props.pageData.cast_movies.pagging
        : false,
      seriesPagging: props.pageData.cast_series
        ? props.pageData.cast_series.pagging
        : false,
      photos: props.pageData.photos,
      tabType: props.pageData.tabType ? props.pageData.tabType : "about",
    }
  );
  const stateRef = useRef();
  stateRef.current = state.cast
  useEffect(() => {
    props.socket.on('ratedItem', socketdata => {
      let id = socketdata.itemId
      let type = socketdata.itemType
      let Statustype = socketdata.type
      let rating = socketdata.rating
      if (id == stateRef.current.cast_crew_member_id && type == "cast_crew_members") {
          const data = {...stateRef.current}
          data.rating = rating
          setState({ cast: data })
      }
    });
  },[])

  const getItemIndex = (item_id) => {
    const movies = [...state.movies];
    const itemIndex = movies.findIndex((p) => p["movie_id"] == item_id);
    return itemIndex;
  };
  const getSeriesItemIndex = (item_id) => {
    const movies = [...state.series];
    const itemIndex = movies.findIndex((p) => p["movie_id"] == item_id);
    return itemIndex;
  };
  const linkify = (inputText) => {
    return inputText;
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
  useEffect(() => {
    if (
      props.router.query &&
      props.router.query.tab != state.tabType &&
      props.router.query.tab
    ) {
      setState({ tabType: props.router.query.tab });
    } else if (props.router.query && !props.router.query.tab) {
      if ($(".nav-tabs").children().length > 0) {
        let type = $(".nav-tabs")
          .children()
          .first()
          .find("a")
          .attr("aria-controls");
        setState({ tabType: type });
      }
    }
  }, [props.router.query]);
  const pushTab = (type, e) => {
    if (e) e.preventDefault();
    if (state.tabType == type) {
      return;
    }
    let fUrl = props.router.asPath.split("?");
    let url = fUrl[0];
    let otherQueryParams = null;
    if (typeof URLSearchParams !== "undefined") {
      otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
      otherQueryParams.delete("tab");
    }
    let fURL =
      url +
      "?" +
      (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");
    Router.push(`${fURL}tab=${type}`, `${fURL}tab=${type}`, { shallow: true });
  };
  let fUrl = props.router.asPath.split("?");
  let url = fUrl[0];
  let otherQueryParams = null;
  if (typeof URLSearchParams !== "undefined") {
    otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
    otherQueryParams.delete("tab");
  }
  let fURL =
    url +
    "?" +
    (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");
  return (
    <React.Fragment>
      <TopView {...props} type={state.cast.type} cast={state.cast} />
      <div className="userDetailsWraps">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="details-tab">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item">
                    <a
                      className={`nav-link${
                        state.tabType == "about" ? " active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        pushTab("about");
                      }}
                      data-bs-toggle="tab"
                      href={`${fURL}?tab=about`}
                      role="tab"
                      aria-controls="about"
                      aria-selected="true"
                    >
                      {Translate(props, "About")}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link${
                        state.tabType == "movies" ? " active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        pushTab("movies");
                      }}
                      data-bs-toggle="tab"
                      href={`${fURL}?tab=movies`}
                      role="tab"
                      aria-controls="movies"
                      aria-selected="true"
                    >
                      {Translate(props, "Movies")}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link${
                        state.tabType == "series" ? " active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        pushTab("series");
                      }}
                      data-bs-toggle="tab"
                      href={`${fURL}?tab=series`}
                      role="tab"
                      aria-controls="series"
                      aria-selected="true"
                    >
                      {Translate(props, "Series")}
                    </a>
                  </li>

                  {props.pageData.appSettings[
                    `${"cast_crew_member_comment"}`
                  ] == 1 ? (
                    <li className="nav-item">
                      <a
                        className={`nav-link${
                          state.tabType == "comments" ? " active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          pushTab("comments");
                        }}
                        data-bs-toggle="tab"
                        href={`${fURL}?tab=comments`}
                        role="tab"
                        aria-controls="comments"
                        aria-selected="true"
                      >{`${Translate(props, "Comments")}`}</a>
                    </li>
                  ) : null}
                  {state.photos && state.photos.results.length > 0 ? (
                    <li className="nav-item">
                      <a
                        className={`nav-link${
                          state.tabType == "photos" ? " active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          pushTab("photos");
                        }}
                        data-bs-toggle="tab"
                        href={`${fURL}?tab=photos`}
                        role="tab"
                        aria-controls="photos"
                        aria-selected="true"
                      >
                        {Translate(props, "Photos")}
                      </a>
                    </li>
                  ) : null}
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div
                    className={`tab-pane fade${
                      state.tabType == "about" ? " active show" : ""
                    }`}
                    id="about"
                    role="tabpanel"
                  >
                    <div className="details-tab-box">
                      <React.Fragment>
                        {props.pageData.appSettings[
                          `cast_crew_member_rating`
                        ] == 1 ? (
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Rating")}</h6>
                            <div className="owner_name">
                              <React.Fragment>
                                <div className="animated-rater rating">
                                  <Rating
                                    {...props}
                                    rating={state.cast.rating}
                                    type="cast_crew_member"
                                    id={state.cast.cast_crew_member_id}
                                  />
                                </div>
                              </React.Fragment>
                            </div>
                          </div>
                        ) : null}
                        <div className="tabInTitle">
                          <h6>
                            {props.t("view_count", {
                              count: state.cast.view_count
                                ? state.cast.view_count
                                : 0,
                            })}
                          </h6>
                          <div className="owner_name">
                            <React.Fragment>
                              {`${ShortNumber(
                                state.cast.view_count
                                  ? state.cast.view_count
                                  : 0
                              )}`}{" "}
                              {props.t("view_count", {
                                count: state.cast.view_count
                                  ? state.cast.view_count
                                  : 0,
                              })}
                            </React.Fragment>
                          </div>
                        </div>
                        {state.cast.birthdate ? (
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Birth Date")}</h6>
                            <div className="owner_name">
                              {state.cast.birthdate}
                            </div>
                          </div>
                        ) : null}
                        {state.cast.deathdate ? (
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Death Date")}</h6>
                            <div className="owner_name">
                              {state.cast.deathdate}
                            </div>
                          </div>
                        ) : null}
                        {state.cast.gender ? (
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Gender")}</h6>
                            <div className="owner_name">
                              {state.cast.gender}
                            </div>
                          </div>
                        ) : null}
                        {state.cast.birthplace ? (
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Birth Place")}</h6>
                            <div className="owner_name">
                              {state.cast.birthplace}
                            </div>
                          </div>
                        ) : null}
                        {state.cast.biography ? (
                          <div className="tabInTitle">
                            <h6>{Translate(props, "Description")}</h6>
                            <div className="channel_description">
                              <div
                                className="channel_description"
                                id="VideoDetailsDescp"
                                style={{
                                  ...state.styles,
                                  whiteSpace: "pre-line",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: linkify(state.cast.biography),
                                }}
                              ></div>
                            </div>
                          </div>
                        ) : null}
                      </React.Fragment>
                    </div>
                  </div>
                  <div
                    className={`tab-pane fade${
                      state.tabType == "movies" ? " active show" : ""
                    }`}
                    id="movies"
                    role="tabpanel"
                  >
                    <div className="details-tab-box">
                      <Movies
                        contentType="movies"
                        no_user_area={true}
                        is_cast={state.cast.cast_crew_member_id}
                        typeData="movies"
                        {...props}
                        movies={state.movies}
                        pagging={state.moviesPagging}
                      />
                    </div>
                  </div>
                  <div
                    className={`tab-pane fade${
                      state.tabType == "series" ? " active show" : ""
                    }`}
                    id="series"
                    role="tabpanel"
                  >
                    <div className="details-tab-box">
                      <Movies
                        contentType="series"
                        no_user_area={true}
                        is_cast={state.cast.cast_crew_member_id}
                        typeData="series"
                        {...props}
                        movies={state.series}
                        pagging={state.seriesPagging}
                      />
                    </div>
                  </div>
                  {props.pageData.appSettings[
                    `${"cast_crew_member_comment"}`
                  ] == 1 ? (
                    <div
                      className={`tab-pane fade${
                        state.tabType == "comments" ? " active show" : ""
                      }`}
                      id="comments"
                      role="tabpanel"
                    >
                      <div className="details-tab-box">
                        <Comment
                          {...props}
                          owner_id="artist"
                          hideTitle={true}
                          appSettings={props.pageData.appSettings}
                          commentType="cast_crew_member"
                          type="cast_crew_members"
                          comment_item_id={state.cast.cast_crew_member_id}
                        />
                      </div>
                    </div>
                  ) : null}
                  {state.photos && state.photos.results.length > 0 ? (
                    <div
                      className={`tab-pane fade${
                        state.tabType == "photos" ? " active show" : ""
                      }`}
                      id="photos"
                      role="tabpanel"
                    >
                      <div className="details-tab-box">
                        <Photos
                          {...props}
                          photos={state.photos}
                          cast={state.cast}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Cast);
