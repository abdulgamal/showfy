import React from "react";
import Comments from "../containers/Comments/Comment";

const Comment = (props) => (
  <React.Fragment>
    <Comments {...props} />
  </React.Fragment>
);

export default Comment;
