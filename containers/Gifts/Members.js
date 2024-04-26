import React, { useReducer, useEffect, useRef } from "react";
import Currency from "../Upgrade/Currency";
import Link from "../../components/Link/index";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";

const Subscribers = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      members: props.members,
      video_id: props.video_id,
      pagging: props.pagging,
      page: 2,
    }
  );
  useEffect(() => {
    if (props.video_id != state.video_id) {
      setState({
        members: props.members,
        video_id: props.video_id,
        pagging: props.pagging,
        page: 2,
      });
    }
  }, [props]);

  const refreshContent = () => {
    setState({ page: 1, members: [] });
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
    let url = "";
    formData.append("video_id", props.video_id);
    url = "/videos/gifts";

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.members) {
          let pagging = response.data.pagging;
          setState({
            page: state.page + 1,
            pagging: pagging,
            members:
              state.page == 1
                ? response.data.members
                : [...state.members, ...response.data.members],
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

  return (
    <React.Fragment>
      <div className="plan-subscribers">
        <InfiniteScroll
          dataLength={state.members.length}
          next={loadMoreContent}
          hasMore={state.pagging}
          loader={
            <LoadMore
              {...props}
              loading={true}
              page={state.page}
              itemCount={state.members.length}
            />
          }
          endMessage={
            <EndContent
              {...props}
              text={Translate(props, "No user send gift yet.")}
              itemCount={state.members.length}
            />
          }
          pullDownToRefresh={false}
          pullDownToRefreshContent={<Release release={false} {...props} />}
          releaseToRefreshContent={<Release release={true} {...props} />}
          refreshFunction={refreshContent}
        >
          <div className="gridContainer gridUserSubscriber">
            {state.members.map((plan) => {
              let image = plan.avtar;
              const splitVal = plan.avtar.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
              } else {
                image = props.pageData.imageSuffix + image;
              }

              return (
                <div className="gridColumn" key={plan.user_id}>
                  <div className="card mx-auto plancard h-auto">
                    <div className="card-body pb-0">
                      <div className="pname-img">
                        <div className="img">
                          <Link
                            href="/member"
                            customParam={`id=${plan.username}`}
                            as={`/${plan.username}`}
                          >
                            <a>
                              <img className="pimg rounded-circle" src={image} />
                            </a>
                          </Link>
                        </div>
                        <p className="m-0 pname">
                          <Link
                            href="/member"
                            customParam={`id=${plan.username}`}
                            as={`/${plan.username}`}
                          >
                            {plan.displayname}
                          </Link>
                          <div className="align-items-center coinBlance d-flex gap-2 font-size-16">
                            <img src="/static/images/coin.png" alt="" />
                            <span>{Math.floor(plan.giftPrice)}</span>
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      </div>
    </React.Fragment>
  );
};

export default Subscribers;
