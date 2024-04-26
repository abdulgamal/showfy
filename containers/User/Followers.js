import React, { useReducer, useEffect, useRef } from "react";
import Item from "./Item";
import Link from "../../components/Link/index";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";

const FollowFollowing = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      members: props.items,
      user_id: props.user_id,
      pagging: props.pagging,
      page: 2,
    }
  );
  useEffect(() => {
    if (props.plans != state.plans) {
      setState({
        members: props.items,
        user_id: props.user_id,
        pagging: props.pagging,
        page: 2,
      })
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    const plans = [...state.members];
    const itemIndex = plans.findIndex((p) => p["user_id"] == item_id);
    return itemIndex;
  };
  const refreshContent = () => {
    setState({  page: 1, members: [] });
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
    let url = "";
    formData.append("owner_id", props.user_id);
    formData.append("type", props.type);
    url = `/members/follow-following`;

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.members) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            members: [...state.members, ...response.data.members],
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
              text={Translate(props, "No user subscribed yet.")}
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
              return <Item key={plan.user_id} {...props} dontShowSubscribe={true} member={plan} />
              // let image = plan.avtar;
              // const splitVal = plan.avtar.split("/");
              // if (splitVal[0] == "http:" || splitVal[0] == "https:") {
              // } else {
              //   image = props.pageData.imageSuffix + image;
              // }
 
              // return (
              //   <div className="gridColumn" key={plan.user_id}>
              //     <div className="card mx-auto plancard followcard">
              //       <Link
              //         href="/member"
              //         customParam={`id=${plan.username}`}
              //         as={`/${plan.username}`}
              //       >
              //         <a>
              //           <div className="card-body">
              //             <div className="pname-img">
              //               <div className="img">
              //                 <img className="pimg" src={image} />
              //               </div>
              //               <p className="m-0 pname">
              //                 {plan.displayname}
              //                 {props.pageData.appSettings[
              //                   "member_verification"
              //                 ] == 1 && plan.verified == 1 ? (
              //                   <span
              //                     className="verifiedUser"
              //                     title={Translate(props, "verified")}
              //                   >
              //                     <span
              //                       className="material-icons"
              //                       data-icon="check"
              //                     ></span>
              //                   </span>
              //                 ) : null}
              //               </p>
              //             </div>
              //           </div>
              //         </a>
              //       </Link>
              //     </div>
              //   </div>
              // );
            })}
          </div>
        </InfiniteScroll>
      </div>
    </React.Fragment>
  );
};

export default FollowFollowing;
