import React, { useReducer, useEffect, useRef } from "react";
import Item from "../Blog/Item";
import Translate from "../../components/Translate/Index";

import Link from "../../components/Link";

const CarouselBlogs = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      blogs: props.blogs,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.blogs;
  useEffect(() => {
    if (props.blogs != state.blogs) {
      setState({ blogs: props.blogs });
    }
  }, [props.blogs]);
  useEffect(() => {
    props.socket.on("blogDeleted", (socketdata) => {
      let id = socketdata.blog_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const blogs = [...stateRef.current];
        blogs.splice(itemIndex, 1);
        setState({  blogs: blogs });
      }
    });
    props.socket.on("ratedItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let Statustype = socketdata.type;
      let rating = socketdata.rating;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1 && type == "blogs") {
        const items = [...stateRef.current];
        const changedItem = { ...items[itemIndex] };
        changedItem.rating = rating;
        items[itemIndex] = changedItem;
        setState({  blogs: items });
      }
    });
    props.socket.on("unfavouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "blogs") {
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
          setState({  blogs: items });
        }
      }
    });
    props.socket.on("favouriteItem", (socketdata) => {
      let id = socketdata.itemId;
      let type = socketdata.itemType;
      let ownerId = socketdata.ownerId;
      if (type == "blogs") {
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
          setState({  blogs: items });
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
      if (itemType == "blogs") {
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
          setState({  blogs: items });
        }
      }
    });
  }, []);

  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const items = [...stateRef.current];
      const itemIndex = items.findIndex((p) => p.blog_id == item_id);
      return itemIndex;
    }
    return -1;
  };

  if (!state.blogs || !state.blogs.length) {
    return null;
  }

  return (
    <div className="VideoRoWrap">
      <div className="row">
        <div className="col-sm-12">
          <div className="titleWrap">
            <span className="title">
              <React.Fragment>
                {props.headerTitle ? props.headerTitle : null}
                {Translate(props, props.title ? props.title : `Related Blogs`)}
              </React.Fragment>
            </span>
            {props.seemore && state.blogs.length > 1 ? (
              <Link
                href={`/blogs?${props.type ? "type" : "sort"}=${
                  props.type ? props.type : props.sort
                }`}
              >
                <a className="seemore_link">{Translate(props, "See more")}</a>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <div className="row">
        {state.blogs.map((result) => {
          return (
            <div key={result.blog_id} className="col-md-6">
              <Item {...props} {...result} result={result} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CarouselBlogs;
