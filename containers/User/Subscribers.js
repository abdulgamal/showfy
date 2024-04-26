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
      user_id: props.user_id,
      pagging: props.pagging,
      page: 2,
      plans: props.plans,
    }
  );
  useEffect(() => {
    if (props.plans != state.plans) {
      setState({
        members: props.members,
        user_id: props.user_id,
        pagging: props.pagging,
        page: 2,
        plans: props.plans,
      });
    }
  }, [props]);

  const getItemIndex = (item_id) => {
    const plans = [...state.plans];
    const itemIndex = plans.findIndex((p) => p["member_plan_id"] == item_id);
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
    url = `/members/subscribers`;

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.members) {
          let pagging = response.data.pagging;
          setState({
            
            page: state.page + 1,
            pagging: pagging,
            members: state.page == 1 ? response.data.members : [...state.members, ...response.data.members],
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
  const filterPlan = (e) => {
    let id = e.target.value;
    setState({ loading: true, members: [],  page: 2 });
    let formData = new FormData();
    formData.append("page", 1);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "";
    formData.append("owner_id", props.user_id);
    formData.append("plan_id", id);
    url = `/members/subscribers`;

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.members) {
          let pagging = response.data.pagging;
          setState({
            
            page: 2,
            pagging: pagging,
            members: response.data.members,
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

  let plans = state.plans.map((item) => {
    return (
      <option value={item.member_plan_id} key={item.member_plan_id}>
        {item.title}
      </option>
    );
  });

  return (
    <React.Fragment>
      <div className="sort plan-subscribers-sort">
        <select
          className="form-control form-control-sm form-select"
          onChange={filterPlan}
        >
          {
            <React.Fragment>
              <option key={"default1"}></option>
              {plans}
            </React.Fragment>
          }
        </select>
      </div>
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
              let image = plan.avtar;
              const splitVal = plan.avtar.split("/");
              if (splitVal[0] == "http:" || splitVal[0] == "https:") {
              } else {
                image = props.pageData.imageSuffix + image;
              }
              let perprice = {};
              perprice["package"] = { price: plan.plan_price };
              return (
                <div className="gridColumn" key={plan.user_id}>
                  <div className="card mx-auto plancard">
                    <div className="card-body">
                      <div className="pname-img">
                        <div className="img">
                          <Link
                            href="/member"
                            customParam={`id=${plan.username}`}
                            as={`/${plan.username}`}
                          >
                            <a>
                              <img className="pimg" src={image} />
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
                          <br />
                          {props
                            .t("{{price}} / month", {
                              price: Currency({ ...props, ...perprice }),
                            })
                            .replace("<!-- -->", "")}
                        </p>
                      </div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        {props.t("Plan Title: {{plan_title}}", {
                          plan_title: plan.plan_title,
                        })}
                      </h6>
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
