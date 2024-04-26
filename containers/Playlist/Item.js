import React, { useReducer, useEffect, useRef } from "react";
import Image from "../Image/Index";
import UserTitle from "../User/Title";
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index";
import ShortNumber from "short-number";
import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import Timeago from "../Common/Timeago";
import axios from "../../axios-orders";
import swal from "sweetalert";
import Translate from "../../components/Translate/Index";
import Analytics from "../Dashboard/StatsAnalytics";
import CensorWord from "../CensoredWords/Index";

const Item = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      playlist: props.playlist,
    }
  );

  useEffect(() => {
    if (props.playlist != state.playlist) {
      setState({ playlist: props.playlist })
    }
  }, [props]);

  const deletePlaylist = (e) => {
    e.preventDefault();
    let message = !props.contentType
      ? Translate(
          props,
          "Once deleted, you will have to again add the playlist."
        )
      : Translate(
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
        let url = "/channels/delete-playlist";

        if (!props.contentType) {
          formData.append("playlist_id", state.playlist.playlist_id);
          formData.append("channel_id", props.channel_id);
        } else {
          formData.append("id", state.playlist.custom_url);
          url = "/playlists/delete";
        }

        axios
          .post(url, formData)
          .then((response) => {})
          .catch((err) => {
            swal(
              "Error",
              Translate(
                props,
                "Something went wrong, please try again later",
                "error"
              )
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
                id={state.playlist.playlist_id}
                type="playlists"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <React.Fragment>
      {analyticsData}
      <div className="ptv_playlistGrid">
        <div className="playlistGrid_thumb">
          <Image
            className="img-fluid"
            title={CensorWord("fn", props, state.playlist.title)}
            image={state.playlist.image}
            imageSuffix={props.pageData.imageSuffix}
            siteURL={props.pageData.siteURL}
          />
          <div className="overlayVideoNo">
            <div className="verticalCenter videoNo">
              <span className="videoNo">
                {ShortNumber(
                  state.playlist.total_videos
                    ? state.playlist.total_videos
                    : 0
                )}{" "}
                {props.t("video_count", {
                  count: state.playlist.total_videos
                    ? state.playlist.total_videos
                    : 0,
                })}
              </span>
              <span className="videoNoIcon">
                <span className="material-icons" data-icon="play_arrow"></span>
              </span>
            </div>
          </div>
          <div className="overlayPlayBtn">
            {state.playlist.vcustom_url ? (
              <Link
                href="/watch"
                customParam={`id=${state.playlist.vcustom_url}&list=${state.playlist.custom_url}`}
                as={`/watch/${state.playlist.vcustom_url}?list=${state.playlist.custom_url}`}
              >
                <a
                  className="verticalCenter btnText"
                  onClick={props.closePopUp}
                >
                  <span className="playListPlayBtn">
                    <span
                      className="material-icons"
                      data-icon="play_arrow"
                    ></span>{" "}
                    {Translate(props, "Play All")}
                  </span>
                </a>
              </Link>
            ) : (
              <Link
                href="/playlist"
                customParam={`id=${state.playlist.custom_url}`}
                as={`/playlist/${state.playlist.custom_url}`}
              >
                <a
                  className="verticalCenter btnText"
                  onClick={props.closePopUp}
                >
                  <span className="playListPlayBtn">
                    <span
                      className="material-icons"
                      data-icon="play_arrow"
                    ></span>{" "}
                    {Translate(props, "Play All")}
                  </span>
                </a>
              </Link>
            )}
          </div>
          <div className="labelBtn">
            {props.pageData.appSettings[
              "playlists_browse_featuredlabel"
            ] == 1 &&
            props.pageData.appSettings["playlist_featured"] == 1 &&
            state.playlist.is_featured == 1 ? (
              <span
                className="lbl-Featured"
                title={Translate(props, "Featured Playlist")}
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
            {props.pageData.appSettings[
              "playlists_browse_sponsoredLabel"
            ] == 1 &&
            props.pageData.appSettings["playlist_sponsored"] == 1 &&
            state.playlist.is_sponsored == 1 ? (
              <span
                className="lbl-Sponsored"
                title={Translate(props, "Sponsored Playlist")}
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
            {props.pageData.appSettings["playlists_browse_hotLabel"] ==
              1 &&
            props.pageData.appSettings["playlist_hot"] == 1 &&
            state.playlist.is_hot == 1 ? (
              <span
                className="lbl-Hot"
                title={Translate(props, "Hot Playlist")}
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
          </div>
        </div>
        <div className="playlistGrid_content">
          <div
            className={`videoTitle${
              props.canDelete ||
              props.canEdit ||
              props.pageData.appSettings["playlists_browse_share"] == 1
                ? " edit-video-btn"
                : ""
            }`}
          >
            <Link
              href="/playlist"
              customParam={`id=${state.playlist.custom_url}`}
              as={`/playlist/${state.playlist.custom_url}`}
            >
              <a className="playlName" onClick={props.closePopUp}>
                <h4>
                  {
                    <CensorWord
                      {...props}
                      text={state.playlist.title}
                    />
                  }
                </h4>
              </a>
            </Link>
            {props.canDelete ||
            props.canEdit ||
            props.pageData.appSettings["playlists_browse_share"] == 1 ? (
              <div className="dropdown TitleRightDropdown">
                <a href="#" data-bs-toggle="dropdown">
                  <span className="material-icons" data-icon="more_vert"></span>
                </a>
                <ul className="dropdown-menu dropdown-menu-right edit-options">
                  {props.canEdit ? (
                    <li>
                      <Link
                        href="/create-playlist"
                        customParam={`id=${state.playlist.custom_url}`}
                        as={`/create-playlist/${state.playlist.custom_url}`}
                      >
                        <a
                          className="addEdit"
                          title={Translate(props, "Edit")}
                          href={`/create-playlist/${state.playlist.custom_url}`}
                        >
                          <span
                            className="material-icons"
                            data-icon="edit"
                          ></span>
                          {Translate(props, "Edit")}
                        </a>
                      </Link>
                    </li>
                  ) : null}
                  {props.canDelete ? (
                    <li>
                      <a
                        className="addDelete"
                        title={Translate(props, "Delete")}
                        href="#"
                        onClick={deletePlaylist}
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
                        className="addEdit"
                        href="#"
                        title={Translate(props, "Analytics")}
                        onClick={analytics}
                      >
                        <span
                          className="material-icons"
                          data-icon="show_chart"
                        ></span>
                        {Translate(props, "Analytics")}
                      </a>
                    </li>
                  ) : null}
                  {props.pageData.appSettings["playlists_browse_share"] ==
                  1 ? (
                    <SocialShare
                      {...props}
                      buttonHeightWidth="30"
                      url={`/playlist/${state.playlist.custom_url}`}
                      title={CensorWord(
                        "fn",
                        props,
                        state.playlist.title
                      )}
                      imageSuffix={props.pageData.imageSuffix}
                      media={state.playlist.image}
                    />
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="videoInfo">
            {props.pageData.appSettings["playlists_browse_username"] ==
            "1" ? (
              <span className="username">
                <UserTitle
                  className=""
                  {...props}
                  closePopUp={props.closePopUp}
                  data={state.playlist}
                />
              </span>
            ) : null}
            <span className="videoViewDate">
              {props.pageData.appSettings["playlists_browse_views"] ==
              "1" ? (
                <span>
                  {`${ShortNumber(
                    state.playlist.view_count
                      ? state.playlist.view_count
                      : 0
                  )}`}{" "}
                  {props.t("view_count", {
                    count: state.playlist.view_count
                      ? state.playlist.view_count
                      : 0,
                  })}
                </span>
              ) : null}
              {props.pageData.appSettings["playlists_browse_views"] ==
                "1" &&
              props.pageData.appSettings["playlists_browse_datetime"] ==
                "1" ? (
                <span className="seprater">|</span>
              ) : null}
              {props.pageData.appSettings["playlists_browse_datetime"] ==
              "1" ? (
                <span>
                  <Timeago {...props}>
                    {state.playlist.creation_date}
                  </Timeago>
                </span>
              ) : null}
            </span>
          </div>
          <div className="LikeDislikeWrap">
            <ul className="LikeDislikeList">
              {props.pageData.appSettings["playlists_browse_like"] ==
              "1" ? (
                <li>
                  <div className="actionbtn">
                    <Like
                      icon={true}
                      {...props}
                      like_count={state.playlist.like_count}
                      item={state.playlist}
                      type="playlist"
                      id={state.playlist.playlist_id}
                    />
                    {"  "}
                  </div>
                </li>
              ) : null}
              {props.pageData.appSettings["playlists_browse_dislike"] ==
              "1" ? (
                <li>
                  <div className="actionbtn">
                    <Dislike
                      icon={true}
                      {...props}
                      dislike_count={state.playlist.dislike_count}
                      item={state.playlist}
                      type="playlist"
                      id={state.playlist.playlist_id}
                    />
                    {"  "}
                  </div>
                </li>
              ) : null}
              {props.pageData.appSettings["playlists_browse_favourite"] ==
              "1" ? (
                <li>
                  <div className="actionbtn">
                    <Favourite
                      icon={true}
                      {...props}
                      favourite_count={state.playlist.favourite_count}
                      item={state.playlist}
                      type="playlist"
                      id={state.playlist.playlist_id}
                    />
                    {"  "}
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Item;
