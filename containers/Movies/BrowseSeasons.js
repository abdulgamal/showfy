import React, { useReducer, useEffect, useRef } from "react";
import Episode from "./Episode";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index";
import Link from "../../components/Link/index";

const Browse = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      episodes: props.pageData.episodes,
      page: 2,
      pagging: props.pageData.pagging,
      loading: false,
      movie_id: props.pageData.id,
      season_id: props.pageData.season_id,
      movie: props.pageData.movie,
    }
  );
  useEffect(() => {
    if (props.episodes && props.episodes != state.episodes) {
      setState({
        movie: props.pageData.movie,
        movie_id: props.pageData.movie_id,
        id: props.pageData.season_id,
        episodes: props.pageData.episodes,
        pagging: props.pageData.pagging,
        page: 2,
      });
    }
  }, []);

  const refreshContent = () => {
    setState({ page: 1, episodes: [] });
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
    let url = `/movies-episodes`;
    formData.append("movie_id", state.movie.movie_id);
    formData.append("season", state.season_id);
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
          setState({ loading: false });
        }
      })
      .catch((err) => {
        setState({ loading: false });
      });
  };

  let items = state.episodes.map((item, _) => {
    return (
      <Episode
        key={item.episode_id}
        {...props}
        episode={item}
        movie_id={state.movie_id}
        season_id={state.season_id}
      />
    );
  });

  return (
    <React.Fragment>
      <div className="season-browse container py-3">
        <h2>
          <Link
            href="/watch"
            customParam={`id=${state.movie.custom_url}`}
            as={`/watch/${state.movie.custom_url}`}
          >
            {state.movie.title}
          </Link>{" "}
          - {props.t("Season")} {state.season_id}
        </h2>
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
              text={Translate(
                props,
                "No episodes created yet for this season."
              )}
              itemCount={state.episodes.length}
            />
          }
          pullDownToRefresh={false}
          pullDownToRefreshContent={<Release release={false} {...props} />}
          releaseToRefreshContent={<Release release={true} {...props} />}
          refreshFunction={refreshContent}
        >
          {props.containerE ? (
            <div className="container">
              <div className="gridContainer gridSeason">{items}</div>
            </div>
          ) : (
            <div className="gridContainer gridSeason">{items}</div>
          )}
        </InfiniteScroll>
      </div>
    </React.Fragment>
  );
};

export default Browse;
