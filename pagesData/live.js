import React from "react";
import BrowseVideos from "../containers/Video/Browse";

const Live = (props) => (
  <React.Fragment>
    { (
      <BrowseVideos {...props} />
    )}
  </React.Fragment>
);

export default Live;
