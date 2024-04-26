import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";
import dynamic from "next/dynamic";
import TopVideos from "../../containers/HomePage/TopVideos";
import Members from "../HomePage/Members";
import Movies from "../HomePage/Movies";
import Audio from "../HomePage/Audio";
import ChannelCarousel from "../Channel/CarouselChannel";
import AdsIndex from "../Ads/Index";
import axios from "../../axios-site";
import Link from "../../components/Link";

const NewsLetter = dynamic(() => import("../../containers/Newsletter/Index"), {
  ssr: false,
});
const Channels = dynamic(
  () => import("../../containers/HomePage/CarouselChannel"),
  {
    ssr: false,
  }
);
const ChannelPost = dynamic(() => import("../HomePage/ChannelPosts"), {
  ssr: false,
});
const VideoSlider = dynamic(() => import("../HomePage/VideoSlider"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="slider shimmer"> </div>
    </div>
  ),
});
const Announcements = dynamic(() => import("../HomePage/Announcement"), {
  ssr: false,
});
const Slideshow = dynamic(() => import("../../components/Slideshow/Index"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="slider shimmer"> </div>
    </div>
  ),
});

const Stories = dynamic(() => import("../Stories/Carousel/Index"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="stories-shimer d-flex">
        <div className="item shimmer storyThumb"></div>
        <div className="item shimmer storyThumb"></div>
        <div className="item shimmer storyThumb"></div>
      </div>
    </div>
  ),
});

const Reels = dynamic(() => import("../Reels/Carousel/Index"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="stories-shimer d-flex">
        <div className="item shimmer storyThumb reelThumb"></div>
        <div className="item shimmer storyThumb reelThumb"></div>
        <div className="item shimmer storyThumb reelThumb"></div>
      </div>
    </div>
  ),
});

const Home = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      closePopup: false,
      videos: props.pageData.videos,
      channels: props.pageData.channels,
      categories: props.pageData.categoryVideos,
      members: props.pageData.popularMembers,
      slideshow: props.pageData.slideshow,
      audio: props.pageData.audio,
      livestreamers: props.pageData.livestreamers,
      movies: props.pageData.movies,
      series: props.pageData.series,
      stories:
        props.pageData.stories && props.pageData.stories.results.length > 0
          ? props.pageData.stories
          : null,
      reels:
        props.pageData.reels && props.pageData.reels.results.length > 0
          ? props.pageData.reels
          : null,
      announcements: props.pageData.announcements,
      page: 1,
    }
  );

  useEffect(() => {
    updatePageData();
  }, []);
  useEffect(() => {
    if (!state.closePopup) $("body").removeClass("stories-open");
  }, [state.closePopup]);

  const updatePageData = () => {
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = `/home-data`;

    axios.post(url, formData, config).then((response) => {
      let dataTypes = { ...state };
      dataTypes.page = 2;
      let propsData = response.data.data;
      if (propsData.movies) {
        dataTypes.movies = propsData.movies;
      }
      if (propsData.series) {
        dataTypes.series = propsData.series;
      }
      if (propsData.popularMembers) {
        dataTypes.members = propsData.popularMembers;
      }

      if (propsData.channels) {
        dataTypes.channels = propsData.channels;
      }
      if (propsData.audio) {
        dataTypes.audio = propsData.audio;
      }
      if (propsData.livestreamers) {
        dataTypes.livestreamers = propsData.livestreamers;
      }
      if (propsData.categoryVideos) {
        dataTypes.categories = propsData.categoryVideos;
      }
      setState({ ...dataTypes, page: 2 });
    });
  };

  const updatereels = (items, pagging) => {
    let reels = {};
    reels.results = items;
    reels.pagging = pagging;
    props.pageData.reels = reels;
    if (items && items.length == 0) {
      setState({ closePopup: false });
    }
  };

  const updateStories = (items, pagging) => {
    let stories = {};
    stories.results = items;
    stories.pagging = pagging;
    props.pageData.stories = stories;
    if (items && items.length == 0) {
      setState({ closePopup: false });
    }
  };
  const closePopup = (type) => {
    if (typeof type == "undefined") type = false;
    if (type == "close") type = false;

    if (props.stories && props.stories.results.length == 0) {
      type = false;
    }
    setState({ closePopup: type });
  };
  return (
    <React.Fragment>
      {state.slideshow ? (
        <Slideshow
          {...props}
          class={`${
            props.pageData.appSettings["video_adv_slider"] == 1 ? " nobtn" : ""
          }`}
        />
      ) : null}
      {!state.slideshow && state.videos && state.videos.featured ? (
        <VideoSlider {...props} videos={state.videos.featured} />
      ) : null}
      {state.announcements ? (
        <Announcements {...props} announcements={state.announcements} />
      ) : null}
      {props.pageData.appSettings["enable_stories"] == 1 &&
      (props.pageData.levelPermissions["stories.view"] == 1 ||
        props.pageData.levelPermissions["stories.view"] == 2) &&
      (state.stories ||
        props.pageData.levelPermissions["stories.create"] == 1) ? (
        <div
          className={`${
            state.closePopup ? `` : `container `
          }VideoRoWrap stories-cnt`}
        >
          <div className="row">
            <div className="col-md-12">
              <div className="titleWrap">
                {
                  <span className="title">
                    <React.Fragment>
                      {Translate(props, `Stories`)}
                    </React.Fragment>
                  </span>
                }
              </div>
            </div>
          </div>
          <Stories
            {...props}
            closePopupFirst={closePopup}
            updateStories={updateStories}
          />
        </div>
      ) : null}

      {state.slideshow && state.videos && state.videos.featured ? (
        <React.Fragment>
          <TopVideos
            {...props}
            openPlaylist={props.openPlaylist}
            headerTitle={
              <span className="featured">
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
            }
            seemore={true}
            title={Translate(props, "Featured Videos")}
            videos={state.videos.featured}
            type="featured"
          />
        </React.Fragment>
      ) : null}

      {state.videos && state.videos.featured ? (
        props.pageData.appSettings["featuredvideo_ads"] ? (
          <AdsIndex
            paddingTop="20px"
            className="featuredvideo_ads"
            ads={props.pageData.appSettings["featuredvideo_ads"]}
          />
        ) : null
      ) : null}
      {state.videos && state.videos.sponsored ? (
        <React.Fragment>
          {state.videos && state.videos.featured && state.slideshow ? (
            <div className="container hr">
              <div className="row">
                <div className="col-sm-12">
                  <hr className="horline" />
                </div>
              </div>
            </div>
          ) : null}
          <TopVideos
            {...props}
            openPlaylist={props.openPlaylist}
            headerTitle={
              <span className="sponsored">
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
            }
            seemore={true}
            title={Translate(props, "Sponsored Videos")}
            videos={state.videos.sponsored}
            type="sponsored"
          />
          {props.pageData.appSettings["sponsoredvideo_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="sponsoredvideo_ads"
              ads={props.pageData.appSettings["sponsoredvideo_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}

      {state.videos && state.videos.hot ? (
        <React.Fragment>
          {state.videos && state.videos.sponsored ? (
            <div className="container hr">
              <div className="row">
                <div className="col-sm-12">
                  <hr className="horline" />
                </div>
              </div>
            </div>
          ) : null}
          <TopVideos
            {...props}
            openPlaylist={props.openPlaylist}
            headerTitle={
              <span className="hot">
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
            }
            seemore={true}
            title={Translate(props, "Hot Videos")}
            type="hot"
            videos={state.videos.hot}
          />
          {props.pageData.appSettings["hotvideo_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="hotvideo_ads"
              ads={props.pageData.appSettings["hotvideo_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.videos && state.videos.recent_videos ? (
        <React.Fragment>
          {state.videos && (state.videos.sponsored || state.videos.hot) ? (
            <div className="container hr">
              <div className="row">
                <div className="col-sm-12">
                  <hr className="horline" />
                </div>
              </div>
            </div>
          ) : null}
          <TopVideos
            {...props}
            openPlaylist={props.openPlaylist}
            headerTitle={
              <span className="recent_video">
                <span
                  className="material-icons"
                  data-icon="video_library"
                ></span>
              </span>
            }
            seemore={true}
            title={Translate(props, "Recent Videos")}
            sort="recent"
            videos={state.videos.recent_videos}
          />
          {props.pageData.appSettings["recentvideo_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="recentvideo_ads"
              ads={props.pageData.appSettings["recentvideo_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {props.pageData.appSettings["enable_reels"] == 1 &&
      (props.pageData.levelPermissions["reels.view"] == 1 ||
        props.pageData.levelPermissions["reels.view"] == 2) &&
      state.reels &&
      state.reels.results.length > 0 ? (
        <React.Fragment>
          {state.videos &&
          (state.videos.sponsored ||
            state.videos.hot ||
            state.videos.recent_videos) ? (
            <div className="container hr">
              <div className="row">
                <div className="col-sm-12">
                  <hr className="horline" />
                </div>
              </div>
            </div>
          ) : null}
          <div
            className={`${
              state.closePopup ? `` : `container `
            }VideoRoWrap stories-cnt`}
          >
            <div className="row">
              <div className="col-md-12">
                <div className="titleWrap">
                  <Link
                    href={`/reel`}
                    customParam={`id=${state.reels.results[0].reel_id}`}
                    as={`/reel/${state.reels.results[0].reel_id}`}
                  >
                    <a>
                      <span className="title">
                        <React.Fragment>
                          {Translate(props, `Reels and short videos`)}
                        </React.Fragment>
                      </span>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            <Reels
              {...props}
              closePopupFirst={closePopup}
              updatereels={updatereels}
            />
          </div>
        </React.Fragment>
      ) : null}
      {state.livestreamers ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <div className="container">
            <Members
              {...props}
              headerTitle={
                <span className="recent_video">
                  <span className="material-icons" data-icon="live_tv"></span>
                </span>
              }
              seemore={true}
              titleHeading={Translate(props, "Best Livestreamer Of The Month")}
              sort="recent"
              type="member"
              members={state.livestreamers}
            />
            {props.pageData.appSettings["livestreamer_ads"] ? (
              <AdsIndex
                paddingTop="20px"
                className="livestreamer_ads"
                ads={props.pageData.appSettings["livestreamer_ads"]}
              />
            ) : null}
          </div>
        </React.Fragment>
      ) : null}
      {state.members ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <div className="container">
            <Members
              {...props}
              headerTitle={
                <span className="recent_video">
                  <span className="material-icons" data-icon="people"></span>
                </span>
              }
              seemore={true}
              titleHeading={Translate(props, "Popular Members")}
              sort="recent"
              type="member"
              members={state.members}
            />
            {props.pageData.appSettings["popularmembers_ads"] ? (
              <AdsIndex
                paddingTop="20px"
                className="popularmembers_ads"
                ads={props.pageData.appSettings["popularmembers_ads"]}
              />
            ) : null}
          </div>
        </React.Fragment>
      ) : null}

      {state.movies && state.movies.featured ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Movies"
            headerTitle={
              <span className="featured">
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
            }
            seemore={true}
            title={Translate(props, "Featured Movies")}
            movies={state.movies.featured}
            type="featured"
          />
          {props.pageData.appSettings["featuredmovie_ads"] ? (
            <AdsIndex
              className="featuredmovie_ads"
              paddingTop="20px"
              ads={props.pageData.appSettings["featuredmovie_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.movies && state.movies.sponsored ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Movies"
            headerTitle={
              <span className="sponsored">
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
            }
            seemore={true}
            title={Translate(props, "Sponsored Movies")}
            movies={state.movies.sponsored}
            type="sponsored"
          />
          {props.pageData.appSettings["sponsoredmovie_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="sponsoredmovie_ads"
              ads={props.pageData.appSettings["sponsoredmovie_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.movies && state.movies.hot ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Movies"
            headerTitle={
              <span className="hot">
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
            }
            seemore={true}
            title={Translate(props, "Hot Movies")}
            type="hot"
            movies={state.movies.hot}
          />
          {props.pageData.appSettings["hotmovie_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="hotmovie_ads"
              ads={props.pageData.appSettings["hotmovie_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.movies && state.movies.recent_movies ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Movies"
            headerTitle={
              <span className="recent_video">
                <span
                  className="material-icons"
                  data-icon="video_library"
                ></span>
              </span>
            }
            seemore={true}
            title={Translate(props, "Recent Movies")}
            sort="latest"
            movies={state.movies.recent_movies}
          />
        </React.Fragment>
      ) : null}

      {state.series && state.series.featured ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Series"
            headerTitle={
              <span className="featured">
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
            }
            seemore={true}
            title={Translate(props, "Featured Series")}
            movies={state.series.featured}
            type="featured"
          />
          {props.pageData.appSettings["featuredseries_ads"] ? (
            <AdsIndex
              className="featuredseries_ads"
              paddingTop="20px"
              ads={props.pageData.appSettings["featuredseries_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.series && state.series.sponsored ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Series"
            headerTitle={
              <span className="sponsored">
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
            }
            seemore={true}
            title={Translate(props, "Sponsored Series")}
            movies={state.series.sponsored}
            type="sponsored"
          />
          {props.pageData.appSettings["sponsoredseries_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="sponsoredseries_ads"
              ads={props.pageData.appSettings["sponsoredseries_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.series && state.series.hot ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Series"
            headerTitle={
              <span className="hot">
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
            }
            seemore={true}
            title={Translate(props, "Hot Series")}
            type="hot"
            movies={state.series.hot}
          />
          {props.pageData.appSettings["hotseries_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="hotseries_ads"
              ads={props.pageData.appSettings["hotseries_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.series && state.series.recent_series ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Movies
            {...props}
            headerType="Series"
            headerTitle={
              <span className="recent_video">
                <span
                  className="material-icons"
                  data-icon="video_library"
                ></span>
              </span>
            }
            seemore={true}
            title={Translate(props, "Recent Series")}
            sort="latest"
            movies={state.series.recent_series}
          />
        </React.Fragment>
      ) : null}

      {state.channels && state.channels.posts ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <ChannelPost {...props} posts={state.channels.posts} />
          {props.pageData.appSettings["channelpost_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="channelpost_ads"
              ads={props.pageData.appSettings["channelpost_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.channels && state.channels.featured ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          {props.pageData.themeType != 2 ? (
            <Channels
              {...props}
              headerTitle={
                <span className="featured">
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
              }
              seemore={true}
              title={Translate(props, "Featured Channels")}
              channels={state.channels.featured}
              type="featured"
            />
          ) : (
            <ChannelCarousel
              {...props}
              headerTitle={
                <span className="featured">
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
              }
              seemore={true}
              title={Translate(props, "Featured Channels")}
              channels={state.channels.featured}
              type="featured"
            />
          )}
          {props.pageData.appSettings["featuredchannel_ads"] ? (
            <AdsIndex
              className="featuredchannel_ads"
              paddingTop="20px"
              ads={props.pageData.appSettings["featuredchannel_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.channels && state.channels.sponsored ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          {props.pageData.themeType != 2 ? (
            <Channels
              {...props}
              headerTitle={
                <span className="sponsored">
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
              }
              seemore={true}
              title={Translate(props, "Sponsored Channels")}
              channels={state.channels.sponsored}
              type="sponsored"
            />
          ) : (
            <ChannelCarousel
              {...props}
              headerTitle={
                <span className="sponsored">
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
              }
              seemore={true}
              title={Translate(props, "Sponsored Channels")}
              channels={state.channels.sponsored}
              type="sponsored"
            />
          )}

          {props.pageData.appSettings["sponsoredchannel_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="sponsoredchannel_ads"
              ads={props.pageData.appSettings["sponsoredchannel_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.channels && state.channels.hot ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          {props.pageData.themeType != 2 ? (
            <Channels
              {...props}
              headerTitle={
                <span className="hot">
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
              }
              seemore={true}
              title={Translate(props, "Hot Channels")}
              type="hot"
              channels={state.channels.hot}
            />
          ) : (
            <ChannelCarousel
              {...props}
              headerTitle={
                <span className="hot">
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
              }
              seemore={true}
              title={Translate(props, "Hot Channels")}
              type="hot"
              channels={state.channels.hot}
            />
          )}
          {props.pageData.appSettings["hotchannel_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="hotchannel_ads"
              ads={props.pageData.appSettings["hotchannel_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
      {state.audio && state.audio ? (
        <React.Fragment>
          <div className="container hr">
            <div className="row">
              <div className="col-sm-12">
                <hr className="horline" />
              </div>
            </div>
          </div>
          <Audio
            {...props}
            headerTitle={
              <span className="recent_video">
                <span className="material-icons" data-icon="headset"></span>
              </span>
            }
            seemore={true}
            title={Translate(props, "Recent Audio")}
            type="latest"
            audio={state.audio}
          />
          {props.pageData.appSettings["audio_ads"] ? (
            <AdsIndex
              paddingTop="20px"
              className="audio_ads"
              ads={props.pageData.appSettings["audio_ads"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}

      {state.categories
        ? state.categories.map((cat) => {
            return (
              <React.Fragment key={cat.category.category_id + "_cnt"}>
                <div className="container hr">
                  <div className="row">
                    <div className="col-sm-12">
                      <hr className="horline" />
                    </div>
                  </div>
                </div>
                <TopVideos
                  {...props}
                  openPlaylist={props.openPlaylist}
                  headerTitle={
                    <span className="category">
                      <span
                        className="material-icons"
                        data-icon="category"
                      ></span>
                    </span>
                  }
                  subType="category_id"
                  seemore={true}
                  key={cat.category.category_id}
                  videos={cat.videos}
                  title={Translate(props, cat.category.title)}
                  type={cat.category.category_id}
                />
              </React.Fragment>
            );
          })
        : null}
      {state.categories ? (
        props.pageData.appSettings["categoryvideo_ads"] ? (
          <AdsIndex
            paddingTop="20px"
            className="categoryvideo_ads"
            ads={props.pageData.appSettings["categoryvideo_ads"]}
          />
        ) : null
      ) : null}
      {state.page == 1 ? (
        <React.Fragment>
          <div className="VideoRoWrap">
            <div className="container">
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
            </div>
          </div>
        </React.Fragment>
      ) : null}

      {!props.pageData.loggedInUserDetails ? <NewsLetter {...props} /> : null}
    </React.Fragment>
  );
};

export default Home;
