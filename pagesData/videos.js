import React from "react";
import BrowseVideos from "../containers/Video/Browse";

const Videos = (props) => (
  <React.Fragment>
    { (
      <BrowseVideos {...props} />
    )}
  </React.Fragment>
);

export default Videos;
