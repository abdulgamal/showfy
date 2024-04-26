import React, { useReducer, useEffect, useRef } from "react";
import Image from "../Image/Index";
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index";
import WatchLater from "../WatchLater/Index";
import axios from "../../axios-orders";
import swal from "sweetalert";
import Translate from "../../components/Translate/Index";
import Analytics from "../Dashboard/StatsAnalytics";
import CensorWord from "../CensoredWords/Index";

const Item = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movie: props.movie,
      hover: false,
    }
  );
  useEffect(() => {
    if (state.movie != props.movie) {
      setState({ movie: props.movie })
    }
  }, [props]);

  const deleteMovie = (e) => {
    e.preventDefault();
    let message = Translate(
      props,
      "Once deleted, you will not be able to recover this!"
    );
    swal({
      title: Translate(props, "Are you sure?"),
      text: message,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        let url = "/movies/delete";
        formData.append("movie_id", state.movie.movie_id);
        axios
          .post(url, formData)
          .then((response) => {})
          .catch((err) => {
            swal(
              "Error",
              Translate(
                props,
                "Something went wrong, please try again later"
              ),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  const analytics = (e) => {
    e.preventDefault();
    setState({  analytics: true });
  };
  const closePopup = (e) => {
    setState({  analytics: false });
  };

  let analyticsData = null;
  if (state.analytics) {
    analyticsData = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt" style={{ maxWidth: "60%" }}>
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Analytics")}</h2>
                <a onClick={closePopup} className="_close">
                  <i></i>
                </a>
              </div>
              <Analytics
                {...props}
                id={state.movie.movie_id}
                type="movies"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  let movieImage = state.movie.image;

  let metaData = [];

  if (state.movie.language_title) {
    metaData.push(state.movie.language_title);
  }
  if (state.movie.category_title) {
    metaData.push(state.movie.category_title);
  }
  if (state.movie.release_year) {
    metaData.push(state.movie.release_year);
  }

  return (
    <React.Fragment>
      {analyticsData}
      {props.pageData.appSettings.movie_advanced_grid != 1 ? (
        <div className="ptv_movieList_wrap">
          <div className="movieList_thumb">
            <Link
              href="/watch"
              customParam={`id=${state.movie.custom_url}`}
              as={`/watch/${state.movie.custom_url}`}
            >
              <a
                className="ImgBlockRatio-img imgblock"
                onClick={props.closePopUp}
              >
                <span>
                  <Image
                    className="img"
                    title={CensorWord("fn", props, state.movie.title)}
                    image={movieImage}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                </span>
              </a>
            </Link>
            <div className="btnHover">
              <WatchLater
                className="watchlater"
                typeWatchLater="movie-series"
                icon={true}
                {...props}
                item={state.movie}
                id={state.movie.movie_id}
              />
              <SocialShare
                className="share"
                aTagDirect={true}
                hideTitle={true}
                {...props}
                buttonHeightWidth="30"
                tags={state.movie.tags}
                url={`/watch/${state.movie.custom_url}`}
                title={CensorWord("fn", props, state.movie.title)}
                imageSuffix={props.pageData.imageSuffix}
                media={state.movie.image}
              />
            </div>

            <div className="playBtn">
              <Link
                href="/watch"
                customParam={`id=${state.movie.custom_url}`}
                as={`/watch/${state.movie.custom_url}`}
              >
                <a onClick={props.closePopUp}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    width="36px"
                    height="36px"
                    className="playicon"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                  </svg>
                </a>
              </Link>
            </div>
            <div className="labelBtn">
              {state.movie.is_featured == 1 ? (
                <span
                  className="lbl-Featured"
                  title={Translate(props, "Featured")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-award"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </span>
              ) : null}
              {state.movie.is_sponsored == 1 ? (
                <span
                  className="lbl-Sponsored"
                  title={Translate(props, "Sponsored")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-award"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </span>
              ) : null}
              {state.movie.is_hot == 1 ? (
                <span className="lbl-Hot" title={Translate(props, "Hot")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-award"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </span>
              ) : null}
            </div>
            {state.movie.purchaseStatus ? (
              <div className="purchase-status">
                <span className={state.movie.purchaseStatus}>
                  {state.movie.purchaseStatus}
                </span>
              </div>
            ) : null}
          </div>
          <div className="movieList_content">
            <div className="movieTitle d-flex">
              <Link
                href="/watch"
                customParam={`id=${state.movie.custom_url}`}
                as={`/watch/${state.movie.custom_url}`}
              >
                <a onClick={props.closePopUp}>
                  <CensorWord {...props} text={state.movie.title} />
                </a>
              </Link>
              {props.canDelete || props.canEdit ? (
                <div className="dropdown TitleRightDropdown">
                  <a href="#" data-bs-toggle="dropdown">
                    <span
                      className="material-icons"
                      data-icon="more_vert"
                    ></span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right edit-options">
                    {props.canEdit ? (
                      <li>
                        {state.movie.category == "movie" ? (
                          <Link
                            href="/create-movie"
                            customParam={`id=${state.movie.custom_url}`}
                            as={`/create-movie/${state.movie.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        ) : (
                          <Link
                            href="/create-series"
                            customParam={`id=${state.movie.custom_url}`}
                            as={`/create-series/${state.movie.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        )}
                      </li>
                    ) : null}
                    {props.canDelete ? (
                      <li>
                        <a
                          className="addPlaylist addDelete"
                          title={Translate(props, "Delete")}
                          href="#"
                          onClick={deleteMovie}
                        >
                          <span
                            className="material-icons"
                            data-icon="delete"
                          ></span>
                          {Translate(props, "Delete")}
                        </a>
                      </li>
                    ) : null}
                    {props.canEdit ? (
                      <li>
                        <a
                          href="#"
                          className="addPlaylist addEdit"
                          onClick={analytics}
                          title={Translate(props, "Analytics")}
                        >
                          <span
                            className="material-icons"
                            data-icon="show_chart"
                          ></span>
                          {Translate(props, "Analytics")}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
            {metaData.length > 0 ? (
              <div className="movieInfo">{metaData.join(" | ")}</div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="ThumbBox-wrap ms-container">
          <Link
            href="/watch"
            customParam={`id=${state.movie.custom_url}`}
            as={`/watch/${state.movie.custom_url}`}
          >
            <a className="ThumbBox-link" onClick={props.closePopUp}>
              <div className="ThumbBox-coverImg">
                <span>
                  <Image
                    className="img"
                    title={CensorWord("fn", props, state.movie.title)}
                    image={movieImage}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                </span>
              </div>
            </a>
          </Link>

          <div className="labelBtn">
            {state.movie.is_featured == 1 ? (
              <span
                className="lbl-Featured"
                title={Translate(props, "Featured")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-award"
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            ) : null}
            {state.movie.is_sponsored == 1 ? (
              <span
                className="lbl-Sponsored"
                title={Translate(props, "Sponsored")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-award"
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            ) : null}
            {state.movie.is_hot == 1 ? (
              <span className="lbl-Hot" title={Translate(props, "Hot")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-award"
                >
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            ) : null}
          </div>
          <div className="btnPlayListSave">
            <WatchLater
              className="btnPlayListSave-btn"
              typeWatchLater="movie-series"
              icon={true}
              {...props}
              item={state.movie}
              id={state.movie.movie_id}
            />
            <SocialShare
              className="btnPlayListSave-btn"
              aTagDirect={true}
              hideTitle={true}
              {...props}
              buttonHeightWidth="30"
              tags={state.movie.tags}
              url={`/watch/${state.movie.custom_url}`}
              title={CensorWord("fn", props, state.movie.title)}
              imageSuffix={props.pageData.imageSuffix}
              media={state.movie.image}
            />
          </div>
          <div className="ThumbBox-Title hide-on-expand">
            <div className="PlayIcon">
              <span className="material-icons-outlined">play_arrow</span>
            </div>
            <div className="title ellipsize2Line">
              <h4 className="m-0">
                {<CensorWord {...props} text={state.movie.title} />}
              </h4>
            </div>
          </div>
          <div className="ItemDetails">
            <div className="d-flex justify-content-between VdoTitle ">
              <Link
                href="/watch"
                customParam={`id=${state.movie.custom_url}`}
                as={`/watch/${state.movie.custom_url}`}
              >
                <a
                  className="ThumbBox-Title-expand d-flex align-items-center"
                  onClick={props.closePopUp}
                >
                  <div className="PlayIcon">
                    <span className="material-icons-outlined">play_arrow</span>
                  </div>
                  <div className="title ellipsize2Line">
                    <h4 className="m-0">
                      {
                        <CensorWord
                          {...props}
                          text={state.movie.title}
                        />
                      }
                    </h4>
                  </div>
                </a>
              </Link>
              {props.canDelete || props.canEdit ? (
                <div className="dropdown TitleRightDropdown">
                  <a href="#" data-bs-toggle="dropdown">
                    <span
                      className="material-icons"
                      data-icon="more_vert"
                    ></span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start edit-options">
                    {props.canEdit ? (
                      <li>
                        {state.movie.category == "movie" ? (
                          <Link
                            href="/create-movie"
                            customParam={`id=${state.movie.custom_url}`}
                            as={`/create-movie/${state.movie.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        ) : (
                          <Link
                            href="/create-series"
                            customParam={`id=${state.movie.custom_url}`}
                            as={`/create-series/${state.movie.custom_url}`}
                          >
                            <a
                              className="addPlaylist addEdit"
                              title={Translate(props, "Edit")}
                            >
                              <span
                                className="material-icons"
                                data-icon="edit"
                              ></span>
                              {Translate(props, "Edit")}
                            </a>
                          </Link>
                        )}
                      </li>
                    ) : null}
                    {props.canDelete ? (
                      <li>
                        <a
                          className="addPlaylist addDelete"
                          title={Translate(props, "Delete")}
                          href="#"
                          onClick={deleteMovie}
                        >
                          <span
                            className="material-icons"
                            data-icon="delete"
                          ></span>
                          {Translate(props, "Delete")}
                        </a>
                      </li>
                    ) : null}
                    {props.canEdit ? (
                      <li>
                        <a
                          href="#"
                          className="addPlaylist addEdit"
                          onClick={analytics}
                          title={Translate(props, "Analytics")}
                        >
                          <span
                            className="material-icons"
                            data-icon="show_chart"
                          ></span>
                          {Translate(props, "Analytics")}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="Vdoinfo d-flex flex-column">
              <span className="videoViewDate">
                {metaData.length > 0 ? metaData.join(" | ") : null}
              </span>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Item;
