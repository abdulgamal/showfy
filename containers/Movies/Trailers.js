import React, { useReducer, useEffect, useRef } from "react";
import Link from "../../components/Link/index";
import Image from "../Image/Index";

import Translate from "../../components/Translate/Index";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";

const Trailers = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movie: props.movie,
      trailers: props.trailers,
      pagging: props.pagging,
      page: 2,
      episode: props.episode,
      seasons: props.seasons,
    }
  );

  useEffect(() => {
    if (
      props.pageData.movie != state.movie ||
      state.episode != props.episode
    ) {
      setState({
        episode: props.episode,
        movie: props.movie,
        trailers: props.trailers,
        pagging: props.pagging,
        page: 2,
        seasons: props.seasons,
      });
    }
  }, [props]);

  const refreshContent = () => {
    setState({  page: 1, trailers: [] });
    loadMoreContent();
  };

  const loadMoreContent = () => {
    setState({  loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = `/movies-trailers`;
    formData.append("movie_id", state.movie.movie_id);
    if (state.episode && state.seasons) {
      formData.append("episode_id", state.episode.episode_id);
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.trailers) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            trailers: [...state.trailers, ...response.data.trailers],
            loading: false,
          });
        } else {
          setState({  loading: false });
        }
      })
      .catch((err) => {
        setState({  loading: false });
      });
  };

  let items = state.trailers.map((item, _) => {
    let html = (
      <a className="ThumbBox-link">
        <div className="ThumbBox-coverImg">
          <span>
            <Image
              image={item.image}
              imageSuffix={props.pageData.imageSuffix}
              siteURL={props.pageData.siteURL}
            />
          </span>
        </div>
        {item.duration ? (
          <div className="VdoDuration show-gradient">{item.duration}</div>
        ) : null}
        <div className="ThumbBox-Title">
          <div className="title ellipsize2Line">
            <h4 className="m-0">{`${
              item.category.charAt(0).toUpperCase() + item.category.slice(1)
            }: ${item.title}`}</h4>
          </div>
        </div>
      </a>
    );
    return (
      <div key={item.movie_video_id} className="gridColumn">
        <div className="ThumbBox-wrap">
          {item.type == "external" ? (
            <a href={item.code} target="_blank">
              {html}
            </a>
          ) : state.episode && state.seasons ? (
            <Link
              href="/watch"
              customParam={`trailer_id=${item.movie_video_id}&id=${state.movie.custom_url}&season_id=${state.episode.season}&episode_id=${state.episode.episode_number}`}
              as={`/watch/${state.movie.custom_url}/season/${state.episode.season}/episode/${state.episode.episode_number}/trailer/${item.movie_video_id}`}
            >
              {html}
            </Link>
          ) : (
            <Link
              href="/watch"
              customParam={`trailer_id=${item.movie_video_id}&id=${state.movie.custom_url}`}
              as={`/watch/${state.movie.custom_url}/trailer/${item.movie_video_id}`}
            >
              {html}
            </Link>
          )}
        </div>
      </div>
    );
  });

  return (
    <InfiniteScroll
      dataLength={state.trailers.length}
      next={loadMoreContent}
      hasMore={state.pagging}
      loader={
        <LoadMore
          {...props}
          page={state.page}
          loading={true}
          itemCount={state.trailers.length}
        />
      }
      endMessage={
        <EndContent
          {...props}
          text={Translate(props, "No trailers created yet.")}
          itemCount={state.trailers.length}
        />
      }
      pullDownToRefresh={false}
      pullDownToRefreshContent={<Release release={false} {...props} />}
      releaseToRefreshContent={<Release release={true} {...props} />}
      refreshFunction={refreshContent}
    >
      <div className="gridContainer gridTrailers">{items}</div>
    </InfiniteScroll>
  );
};

export default Trailers;
