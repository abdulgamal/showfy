import React, { useReducer, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "../../../components/Link";
import LoadMore from "../../LoadMore/Index";
import EndContent from "../../LoadMore/EndContent";
import Release from "../../LoadMore/Release";
import axios from "../../../axios-orders";
import Translate from "../../../components/Translate/Index";

const ReelsBrowse = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      reels: props.reels ? props.reels : props.pageData.reels,
      pagging: props.pagging ? props.pagging : props.pageData.pagging,
      loading: false,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.reels;
  useEffect(() => {
    if (props.pageData && props.reels && props.reels != state.reels) {
      setState({ members: props.reels, pagging: props.pagging });
    }
  }, [props]);

  useEffect(() => {
    props.socket.on("reelDeleted", (socketdata) => {
      let id = socketdata.reel_id;
      let itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        let reels = [...stateRef.current];
        reels.splice(itemIndex, 1);
        setState({  reels: reels });
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    const reels = [...stateRef.current];
    const itemIndex = reels.findIndex((p) => p["reel_id"] == item_id);
    return itemIndex;
  };

  const refreshContent = () => {
    setState({  page: 1, members: [] });
    loadMoreContent();
  };

  const loadMoreContent = () => {
    if (state.fetchingData) {
      return;
    }
    setState({  fetchingData: true });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    let formData = new FormData();
    let ids = [];
    //get current reels
    state.reels.forEach((reel) => {
      ids.push(reel.reel_id);
    });
    formData.append("ids", ids);
    if (props.user_id) {
      formData.append("user_id", props.user_id);
    }
    let url = "/reels/get-reels";
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          //silent
        } else {
          if (response.data.reels) {
            setState({
              
              fetchingData: false,
              reels: [...state.reels, ...response.data.reels],
              pagging: response.data.pagging,
            });
          }
        }
      })
      .catch((err) => {
        //silent
      });
  };
  let reels = state.reels.map((item) => {
    return (
      <div key={item.reel_id} className="gridColumn">
        <div className="slide-item" key={item.owner_id}>
          <div className="storyThumb">
            <Link
              as={`/reel/${item.reel_id}`}
              href={`/reel`}
              customParam={`id=${item.reel_id}&user_id=${props.user_id}&username=${props.username}`}
            >
              <a className="storyThumb-content storyThumb-overlay">
                <div className="storyThumb-img">
                  <img src={props.pageData.imageSuffix + item.image} />
                </div>
                <div className="storyThumb-name">{item.title}</div>
                <div className="reel-content-info">
                  <div className="view">
                    <span
                      className="material-icons-outlined md-18"
                      data-icon="visibility"
                    ></span>
                    {item.view_count}
                  </div>
                  <div className="VdoDuration">{item.duration}</div>
                </div>
                <div className="storyThumb-profileImg reelThumb-profileImg">
                  <img
                    src={props.pageData.imageSuffix + item.avtar}
                    alt=""
                  />
                  {item.user_displayname}
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  });
  return (
    <React.Fragment>
      <InfiniteScroll
        dataLength={state.reels.length}
        next={loadMoreContent}
        hasMore={state.pagging}
        loader={
          <LoadMore
            {...props}
            page={state.page}
            loading={true}
            itemCount={state.reels.length}
          />
        }
        endMessage={
          <EndContent
            {...props}
            text={Translate(props, "No reels created yet.")}
            itemCount={state.reels.length}
          />
        }
        pullDownToRefresh={false}
        pullDownToRefreshContent={<Release release={false} {...props} />}
        releaseToRefreshContent={<Release release={true} {...props} />}
        refreshFunction={refreshContent}
      >
        <div className="gridContainer gridReels">{reels}</div>
      </InfiniteScroll>
    </React.Fragment>
  );
};

export default ReelsBrowse;
