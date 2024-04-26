import React from "react";
import PostView from "../containers/Channel/Post";

const Post = (props) => (
  <React.Fragment>
    { (
      <PostView {...props} />
    )}
  </React.Fragment>
);

export default Post;
