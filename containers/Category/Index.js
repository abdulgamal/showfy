import React, { useReducer, useEffect, useRef } from "react";
import Breadcrum from "../../components/Breadcrumb/Category";

import dynamic from "next/dynamic";
import Router from "next/router";
const Video = dynamic(() => import("../Video/Item"), {
  ssr: false,
});
const Channel = dynamic(() => import("../Channel/Item"), {
  ssr: false,
});
const Blog = dynamic(() => import("../Blog/Item"), {
  ssr: false,
});
const Movie = dynamic(() => import("../Movies/Item"), {
  ssr: false,
});
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";
import Translate from "../../components/Translate/Index";
const Masonry = dynamic(() => import("react-masonry-css"), {
  ssr: false,
});

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      id: props.pageData.id,
      type: props.pageData.type,
      items: props.pageData.items,
      category: props.pageData.category,
      subsubcategories: props.pageData.subsubcategories,
      subcategories: props.pageData.subcategories,
      page: 2,
      pagging: props.pageData.pagging,
      seriespage: 2,
      seriespagging: props.pageData.seriespagging,
      loading: false,
      series: props.pageData.series,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.items;
  useEffect(() => {
    if (props.pageData.id && props.pageData.id != state.id) {
      setState({
        id: props.pageData.id,
        type: props.pageData.type,
        items: props.pageData.items,
        category: props.pageData.category,
        subsubcategories: props.pageData.subsubcategories,
        subcategories: props.pageData.subcategories,
        page: 2,
        pagging: props.pageData.pagging,
        loading: false,
        seriespage: 2,
        seriespagging: props.pageData.seriespagging,
        series: props.pageData.series,
      });
    }
  }, [props.pageData]);

  useEffect(() => {
    if (state.type == "movies-series") {
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
          setState({ items: items });
        }

        //update series
        const itemIndexSeries = getItemSeriesIndex(id);
        if (itemIndexSeries > -1) {
          const items = [...state.series];
          const changedItem = { ...items[itemIndexSeries] };
          if (
            props.pageData &&
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.watchlater_id = null;
          }
          items[itemIndexSeries] = changedItem;
          setState({ series: items });
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
          setState({ items: items });
        }
        //update series
        const itemIndexSeries = getItemSeriesIndex(id);
        if (itemIndexSeries > -1) {
          const items = [...state.series];
          const changedItem = { ...items[itemIndexSeries] };
          if (
            props.pageData &&
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.watchlater_id = 1;
          }
          items[itemIndexSeries] = changedItem;
          setState({ series: items });
        }
      });
    } else if (state.type == "video") {
      props.socket.on("unwatchlater", (socketdata) => {
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

          setState({ items: items });
        }
      });
      props.socket.on("watchlater", (socketdata) => {
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

          setState({ items: items });
        }
      });
    }
    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        type ==
        (state.type == "movies-series" ? "movie" : state.type) + "s"
      ) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.follow_count = changedItem.follow_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = null;
          }
          items[itemIndex] = changedItem;
          setState({ items: items });
        }
      }
    });
    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        type ==
        (state.type == "movies-series" ? "movie" : state.type) + "s"
      ) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.follow_count = changedItem.follow_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = 1;
          }
          items[itemIndex] = changedItem;
          setState({ items: items });
        }
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        type ==
        (state.type == "movies-series" ? "movie" : state.type) + "s"
      ) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          items[itemIndex] = changedItem;
          setState({ items: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (
        type ==
        (state.type == "movies-series" ? "movie" : state.type) + "s"
      ) {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          items[itemIndex] = changedItem;
          setState({ items: items });
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
      if (
        itemType ==
        (state.type == "movies-series" ? "movie" : state.type) + "s"
      ) {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const items = [...stateRef.current];
          const changedItem = { ...items[itemIndex] };
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
          items[itemIndex] = changedItem;
          setState({ items: items });
        }
      }
    });
  });
  const getItemSeriesIndex = (item_id) => {
    if (state.series) {
      const items = [...state.series];
      let checkId = "movie_id";
      const itemIndex = items.findIndex((p) => p[checkId] == item_id);
      return itemIndex;
    }
    return -1;
  };
  const getItemIndex = (item_id) => {
    if (state.items) {
      const items = [...state.items];
      let checkId = "blog_id";
      if (state.type == "channel") {
        checkId = "channel_id";
      } else if (state.type == "video") {
        checkId = "video_id";
      } else if (state.type == "movies-series") {
        checkId = "movie_id";
      }
      const itemIndex = items.findIndex((p) => p[checkId] == item_id);
      return itemIndex;
    }
    return -1;
  };

  const onChange = (e) => {
    if (e.target.value) {
      Router.push(`/${state.type}/category/${e.target.value}`);
    }
  };
  const refreshContent = () => {
    setState({ page: 1, items: [] });
    loadMoreContent();
  };
  const loadMoreSeriesContent = () => {
    if (state.loadingSeries) {
      return;
    }
    setState({ loadingSeries: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = `${
      state.type == "movies-series" ? "movies" : state.type
    }-category/${state.id}`;
    formData.append("type", "series");

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.items) {
          let pagging = response.data.pagging;
          setState({
            page: state.page + 1,
            seriespagging: pagging,
            series: [...state.series, ...response.data.items],
            loadingSeries: false,
          });
        } else {
          setState({ loadingSeries: false });
        }
      })
      .catch((err) => {
        setState({ loadingSeries: false });
      });
  };
  const loadMoreContent = () => {
    if (state.loading) {
      return;
    }
    setState({ loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = `${
      state.type == "movies-series" ? "movies" : state.type
    }-category/${state.id}`;
    if (state.type == "movies-series") {
      formData.append("type", "movies");
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.items) {
          let pagging = response.data.pagging;
          setState({
            page: state.page + 1,
            pagging: pagging,
            items: [...state.items, ...response.data.items],
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
  let items = null;
  if (state.type == "blog") {
    const breakpointColumnsObj = {
      default: 3,
      1300: 3,
      900: 2,
      700: 2,
      500: 1,
    };
    items = (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid row"
        columnClassName="my-masonry-grid_column"
      >
        {state.items.map((item) => {
          return <Blog {...props} key={item.blog_id} {...item} result={item} />;
        })}
      </Masonry>
    );
  } else if (state.type == "channel") {
    items = (
      <div className="gridContainer gridChannel">
        {state.items.map((item) => {
          return (
            <div key={item.channel_id} className="gridColumn">
              <Channel
                {...props}
                key={item.channel_id}
                {...item}
                channel={item}
              />
            </div>
          );
        })}
      </div>
    );
  } else if (state.type == "video") {
    items = (
      <div className="gridContainer gridVideo">
        {state.items.map((item) => {
          return (
            <div key={item.video_id} className={"gridColumn"}>
              <Video {...props} key={item.video_id} {...item} video={item} />
            </div>
          );
        })}
      </div>
    );
  }

  if (state.type == "movies-series") {
    return (
      <React.Fragment>
        <Breadcrum
          {...props}
          onChange={onChange}
          subcategories={state.subcategories}
          subsubcategories={state.subsubcategories}
          image={
            state.category.image
              ? state.category.image
              : props.pageData.appSettings["movie_category_default_photo"]
          }
          title={state.category.title}
        />

        <div className="container details-tab">
          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className={`nav-link active`}
                data-bs-toggle="tab"
                href="#movies"
                role="tab"
                aria-controls="discription"
                aria-selected="false"
              >
                {Translate(props, "Movies")}
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link`}
                data-bs-toggle="tab"
                href="#series"
                role="tab"
                aria-controls="discription"
                aria-selected="false"
              >
                {Translate(props, "Series")}
              </a>
            </li>
          </ul>

          <div className="tab-content" id="myTabContent">
            <div
              className={`tab-pane fade active show`}
              id="movies"
              role="tabpanel"
            >
              <div className="details-tab-box">
                <InfiniteScroll
                  dataLength={state.items.length}
                  next={loadMoreContent}
                  hasMore={state.pagging}
                  loader={
                    <LoadMore
                      {...props}
                      page={state.page}
                      loading={true}
                      itemCount={state.items.length}
                    />
                  }
                  endMessage={
                    <EndContent
                      {...props}
                      text={Translate(
                        props,
                        "No movies created in this category yet."
                      )}
                      itemCount={state.items.length}
                    />
                  }
                  pullDownToRefresh={false}
                  pullDownToRefreshContent={
                    <Release release={false} {...props} />
                  }
                  releaseToRefreshContent={
                    <Release release={true} {...props} />
                  }
                  refreshFunction={refreshContent}
                >
                  <div className="gridContainer gridMovie">
                    {state.items.map((item) => {
                      return (
                        <div className="item" key={item.movie_id}>
                          <Movie
                            {...props}
                            key={item.movie_id}
                            {...item}
                            movie={item}
                          />
                        </div>
                      );
                    })}
                  </div>
                </InfiniteScroll>
              </div>
            </div>

            <div className={`tab-pane fade`} id="series" role="tabpanel">
              <div className="details-tab-box">
                <InfiniteScroll
                  dataLength={state.series.length}
                  next={loadMoreSeriesContent}
                  hasMore={state.seriespagging}
                  loader={
                    <LoadMore
                      {...props}
                      page={state.seriespage}
                      loading={true}
                      itemCount={state.series.length}
                    />
                  }
                  endMessage={
                    <EndContent
                      {...props}
                      text={Translate(
                        props,
                        "No series created in this category yet."
                      )}
                      itemCount={state.series.length}
                    />
                  }
                  pullDownToRefresh={false}
                  pullDownToRefreshContent={
                    <Release release={false} {...props} />
                  }
                  releaseToRefreshContent={
                    <Release release={true} {...props} />
                  }
                  refreshFunction={refreshContent}
                >
                  <div className="gridContainer gridMovie">
                    {state.series.map((item) => {
                      return (
                        <div className="item" key={item.movie_id}>
                          <Movie
                            {...props}
                            key={item.movie_id}
                            {...item}
                            movie={item}
                          />
                        </div>
                      );
                    })}
                  </div>
                </InfiniteScroll>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Breadcrum
        {...props}
        onChange={onChange}
        subcategories={state.subcategories}
        subsubcategories={state.subsubcategories}
        image={
          state.category.image
            ? state.category.image
            : props.pageData.appSettings[state.type + "_category_default_photo"]
        }
        title={state.category.title}
      />
      <div className="user-area">
        <InfiniteScroll
          dataLength={state.items.length}
          next={loadMoreContent}
          hasMore={state.pagging}
          loader={
            <LoadMore
              {...props}
              page={state.page}
              loading={true}
              itemCount={state.items.length}
            />
          }
          endMessage={
            <EndContent
              {...props}
              text={
                state.type == "blog"
                  ? Translate(props, "No blog created in this category yet.")
                  : state.type == "channel"
                  ? Translate(props, "No channel created in this category yet.")
                  : Translate(props, "No video created in this category yet.")
              }
              itemCount={state.items.length}
            />
          }
          pullDownToRefresh={false}
          pullDownToRefreshContent={<Release release={false} {...props} />}
          releaseToRefreshContent={<Release release={true} {...props} />}
          refreshFunction={refreshContent}
        >
          <div className="container">{items}</div>
        </InfiniteScroll>
      </div>
    </React.Fragment>
  );
};

export default Index;
