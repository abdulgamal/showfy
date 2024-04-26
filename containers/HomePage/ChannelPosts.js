import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";
import Timeago from "../Common/Timeago";
import Like from "../Like/Index";
import Dislike from "../Dislike/Index";
import ShortNumber from "short-number";
import Link from "../../components/Link/index";
import Image from "../Image/Index";
import dynamic from "next/dynamic";

const Carousel = dynamic(() => import("../Slider/Index"), {
  ssr: false,
  loading: () => (
    <div className="shimmer-elem">
      <div className="heading shimmer"></div>
      <div className="grid">
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
        <div className="item shimmer"></div>
      </div>
    </div>
  ),
});

const Posts = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      posts: props.posts,
    }
  );
  const stateRef = useRef();
  stateRef.current = state.posts

  useEffect(() => {
    if (state.posts != props.posts) {
      setState({ posts: props.posts });
    }
  }, [props.posts]);

  const getItemIndex = (item_id) => {
    if (stateRef.current) {
      const posts = [...stateRef.current];
      const itemIndex = posts.findIndex((p) => p["post_id"] == item_id);
      return itemIndex;
    }
    return -1;
  };
  useEffect(() => {
    props.socket.on("communityDeleted", (socketdata) => {
      let id = socketdata.post_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const posts = [...stateRef.current];
        posts.splice(itemIndex, 1);
        setState({  posts: posts });
      }
    });

    props.socket.on("communityEdited", (socketdata) => {
      let id = socketdata.post_id;
      const itemIndex = getItemIndex(id);
      if (itemIndex > -1) {
        const posts = [...stateRef.current];
        posts[itemIndex]["title"] = socketdata.postData.title;
        posts[itemIndex]["image"] = socketdata.postData.image;
        setState({  posts: posts });
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
      if (itemType == "channel_posts") {
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
          setState({  posts: items });
        }
      }
    });
  }, []);

  let items = state.posts.map((post) => {
    var description = post.title;
    if (description.length > 300) {
      description = description.substring(0, 300);
    }
    return (
      <div className="card postCard-box" key={post.post_id}>
        <div className="card-body">
          <div className="head">
            <div className="clogo">
              <Link
                href="/channel"
                customParam={`id=${post.channel_custom_url}`}
                as={`/channel/${post.channel_custom_url}`}
              >
                <a>
                  <Image
                    height="24"
                    width="24"
                    title={post.channel_name}
                    image={post.avtar}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                </a>
              </Link>
            </div>
            <span className="cname">
              <Link
                href="/channel"
                customParam={`id=${post.channel_custom_url}`}
                as={`/channel/${post.channel_custom_url}`}
              >
                <a>{post.channel_name}</a>
              </Link>
            </span>
            <div className="postdate">
              <Timeago {...props}>{post.creation_date}</Timeago>
            </div>
          </div>
          <div className="content">
            <div className="text">
              <Link
                href="/post"
                customParam={`id=${post.post_id}`}
                as={`/post/${post.post_id}`}
              >
                <a>{description}</a>
              </Link>
            </div>
            <div className="imgbox">
              <Link
                href="/post"
                customParam={`id=${post.post_id}`}
                as={`/post/${post.post_id}`}
              >
                <a>
                  <Image
                    image={post.image}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                </a>
              </Link>
            </div>
          </div>

          <div className="foot">
            <div className="likeDislike">
              <div className="icon like">
                <Like
                  icon={true}
                  {...props}
                  like_count={post.like_count}
                  item={post}
                  type="channel_post"
                  id={post.post_id}
                />
                {"  "}
              </div>
              <div className="icon like">
                <Dislike
                  icon={true}
                  {...props}
                  dislike_count={post.dislike_count}
                  item={post}
                  type="channel_post"
                  id={post.post_id}
                />
                {"  "}
              </div>
            </div>

            <div className="commentOption">
              <div className="icon like">
                <Link
                  href="/post"
                  customParam={`id=${post.post_id}`}
                  as={`/post/${post.post_id}`}
                >
                  <a className="community-comment-a">
                    <span
                      className="material-icons-outlined md-18"
                      data-icon="comment"
                    ></span>{" "}
                    {`${ShortNumber(
                      post.comment_count ? post.comment_count : 0
                    )}`}
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <React.Fragment>
      {
        <div className="container mb-5">
          <h4>{Translate(props, "")}</h4>
          <div className="row">
            <div className="col-sm-12">
              <div className="titleWrap">
                <span className="title">
                  <React.Fragment>
                    <span className="channel_post">
                      <span className="material-icons">post_add</span>
                    </span>
                    {Translate(props, "Latest Channel Posts")}
                  </React.Fragment>
                </span>
              </div>
            </div>
          </div>

          {props.pageData.themeType == 2 ? (
            <div className="VideoRoWrap">
              <Carousel
                {...props}
                carouselType="channel_post"
                items={items}
                itemAt1024={4}
                itemAt1200={4}
                itemAt900={3}
                itemAt600={2}
                itemAt480={1}
              >
                {items}
              </Carousel>
            </div>
          ) : (
            <div className="PostCard-wrap">{items}</div>
          )}
        </div>
      }
    </React.Fragment>
  );
};

export default Posts;
