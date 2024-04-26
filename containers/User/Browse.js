import React, { useReducer, useEffect, useRef } from "react";
import Member from "./Item";
import Link from "../../components/Link";
import LoadMore from "../LoadMore/Index";
import EndContent from "../LoadMore/EndContent";
import Release from "../LoadMore/Release";
import axios from "../../axios-orders";
import InfiniteScroll from "react-infinite-scroll-component";
import Search from "../Search/Index";
import Translate from "../../components/Translate/Index";

const Browse = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      members: props.channel_members
        ? props.channel_members
        : props.pageData.members,
      page: 2,
      type: "member",
      pagging: props.channel_pagging
        ? props.channel_pagging
        : props.pageData.pagging,
      loading: false,
      search: props.search ? props.search : [],
    }
  );
  const stateRef = useRef();
  stateRef.current = state;
  useEffect(() => {
    if (
      props.pageData &&
      props.channel_members &&
      props.channel_members != state.members
    ) {
      setState({
        members: props.channel_members,
        pagging: props.channel_members,
        page: 2,
        search: props.search ? props.search : [],
      });
    } else if (
      props.pageData &&
      props.pageData.members &&
      props.pageData.members != state.members
    ) {
      setState({
        members: props.pageData.members,
        pagging: props.pageData.pagging,
        page: 2,
        search: props.search ? props.search : [],
      });
    } else if (
      props.pageData.members &&
      props.pageData.members != state.members
    ) {
      setState({
        members: props.pageData.members,
        pagging: props.pageData.pagging,
        page: 2,
        search: props.search ? props.search : [],
      });
    }
  }, [props]);

  useEffect(() => {
    props.socket.on("unfollowUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "members") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current.members];
          const changedItem = { ...items[itemIndex] };
          changedItem.follow_count = changedItem.follow_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = null;
          }
          items[itemIndex] = changedItem;
          setState({  members: items });
        }
      }
    });
    props.socket.on("followUser", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "members") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const items = [...stateRef.current.members];
          const changedItem = { ...items[itemIndex] };
          changedItem.follow_count = changedItem.follow_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.follower_id = 1;
          }
          items[itemIndex] = changedItem;
          setState({  members: items });
        }
      }
    });
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == stateRef.current.type + "s") {
        const items = [...stateRef.current.members];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  members: items });
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == stateRef.current.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const members = [...stateRef.current.members];
          const changedItem = { ...members[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count - 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = null;
          }
          members[itemIndex] = changedItem;
          setState({  members: members });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == stateRef.current.type + "s") {
        const itemIndex = getItemIndex(id);
        if (itemIndex > -1) {
          const members = [...stateRef.current.members];
          const changedItem = { ...members[itemIndex] };
          changedItem.favourite_count = changedItem.favourite_count + 1;
          if (
            props.pageData.loggedInUserDetails &&
            props.pageData.loggedInUserDetails.user_id == ownerId
          ) {
            changedItem.favourite_id = 1;
          }
          members[itemIndex] = changedItem;
          setState({  members: members });
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
      if (itemType == stateRef.current.type + "s") {
        const itemIndex = getItemIndex(itemId);
        if (itemIndex > -1) {
          const members = [...stateRef.current.members];
          const changedItem = { ...members[itemIndex] };
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
          members[itemIndex] = changedItem;
          setState({  members: members });
        }
      }
    });
  }, []);
  const getItemIndex = (item_id) => {
    const members = [...stateRef.current.members];
    const itemIndex = members.findIndex((p) => p["user_id"] == item_id);
    return itemIndex;
  };

  const refreshContent = () => {
    setState({  page: 1, members: [] });
    loadMoreContent();
  };
  const searchResults = (values) => {
    setState({  page: 1 });
    loadMoreContent(values);
  };
  const loadMoreContent = (values) => {
    setState({  loading: true });
    let formData = new FormData();
    formData.append("page", state.page);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    let url = `/members/browse`;
    let queryString = "";
    if (props.pageData.search) {
      queryString = Object.keys(props.pageData.search)
        .map((key) => key + "=" + props.pageData.search[key])
        .join("&");
      url = `${url}?${queryString}`;
    } else if (props.contentType) {
      let queryUser = "";
      if (props.userContent) {
        queryUser = "?user=" + props.userContent;
      }
      url = `/dashboard/members/${props.contentType}${queryUser}`;
    } else if (props.globalSearch) {
      queryString = Object.keys(state.search)
        .map((key) => key + "=" + state.search[key])
        .join("&");
      url = `/search/member?${queryString}`;
    }
    if (props.channel_id) {
      queryString = "";
      url = "/channels/supporters";
      formData.append("channel_id", props.channel_id);
    }
    if (props.video_id) {
      queryString = "";
      url = "/videos/donors";
      formData.append("video_id", props.video_id);
    }
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
  let members = state.members.map((item) => {
    return (
      <div key={item.user_id} className="gridColumn">
        <Member {...props} key={item.user_id} {...item} member={item} />
      </div>
    );
  });
  return (
    <React.Fragment>
      {props.headerTitle ? (
        <div className="row">
          <div className="col-sm-12">
            <div className="titleWrap">
              <span className="title">
                <React.Fragment>
                  {props.headerTitle ? props.headerTitle : null}
                  {Translate(props, props.titleHeading)}
                </React.Fragment>
              </span>
              {props.seemore && state.members.length > 3 ? (
                <Link href={`/members?sort=latest`}>
                  <a className="seemore_link">{Translate(props, "See more")}</a>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {!props.globalSearch ? (
        <div className="user-area">
          {!props.contentType && !props.globalSearch ? (
            <div className="container">
              <Search {...props} type="member" />
            </div>
          ) : null}
          <InfiniteScroll
            dataLength={state.members.length}
            next={loadMoreContent}
            hasMore={state.pagging}
            loader={
              <LoadMore
                {...props}
                page={state.page}
                loading={true}
                itemCount={state.members.length}
              />
            }
            endMessage={
              <EndContent
                {...props}
                text={Translate(
                  props,
                  "No member found with your matching criteria."
                )}
                itemCount={state.members.length}
              />
            }
            pullDownToRefresh={false}
            pullDownToRefreshContent={<Release release={false} {...props} />}
            releaseToRefreshContent={<Release release={true} {...props} />}
            refreshFunction={refreshContent}
          >
            <div className="container">
              <div className="gridContainer gridMember">{members}</div>
            </div>
          </InfiniteScroll>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={state.members.length}
          next={loadMoreContent}
          hasMore={state.pagging}
          loader={
            <LoadMore
              {...props}
              page={state.page}
              loading={true}
              itemCount={state.members.length}
            />
          }
          endMessage={
            <EndContent
              {...props}
              text={Translate(
                props,
                "No member found with your matching criteria."
              )}
              itemCount={state.members.length}
            />
          }
          pullDownToRefresh={false}
          pullDownToRefreshContent={<Release release={false} {...props} />}
          releaseToRefreshContent={<Release release={true} {...props} />}
          refreshFunction={refreshContent}
        >
          <div className="container">
            <div className="gridContainer gridMember">{members}</div>
          </div>
        </InfiniteScroll>
      )}
    </React.Fragment>
  );
};

export default Browse;
