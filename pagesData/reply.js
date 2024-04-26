import React from "react";
import ReplyContainer from "../containers/Comments/Reply";

const Reply = (props) => (
  <React.Fragment>
    { (
      <ReplyContainer {...props} />
    )}
  </React.Fragment>
);

export default Reply;
