import React, { useReducer, useEffect, useRef } from "react";
import Episode from "./Episode";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index";

const Episodes = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movie: props.movie,
      episodes: props.episodes,
      pagging: props.pagging,
      season: props.season,
      page: 2,
    }
  );
  useEffect(() => {
    if (props.pageData.movie != state.movie) {
      setState({
        movie: props.movie,
        episodes: props.episodes,
        pagging: props.pagging,
        season: props.season,
        page: 2,
      })
    }
  }, [props]);

  const refreshContent = () => {
    setState({  page: 1, episodes: [] });
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
    let url = `/movies-episodes`;
    formData.append("movie_id", state.movie.movie_id);
    formData.append("season", state.season);
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.episodes) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            episodes: [...state.episodes, ...response.data.episodes],
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

  let items = state.episodes.map((item, _) => {
    return (
      <Episode
        key={item.episode_id}
        {...props}
        episode={item}
        movie_id={state.movie.custom_url}
        season_id={state.season}
      />
    );
  });

  return (
    <InfiniteScroll
      dataLength={state.episodes.length}
      next={loadMoreContent}
      hasMore={state.pagging}
      loader={
        <LoadMore
          {...props}
          page={state.page}
          loading={true}
          itemCount={state.episodes.length}
        />
      }
      endMessage={
        <EndContent
          {...props}
          text={Translate(props, "No episodes created yet.")}
          itemCount={state.episodes.length}
        />
      }
      pullDownToRefresh={false}
      pullDownToRefreshContent={<Release release={false} {...props} />}
      releaseToRefreshContent={<Release release={true} {...props} />}
      refreshFunction={refreshContent}
    >
      <div className="gridContainer gridEpisode">{items}</div>
    </InfiniteScroll>
  );
};

export default Episodes;
