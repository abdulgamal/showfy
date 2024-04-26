import React from "react";
import VideoView from "../containers/Video/Embed";

const Embed = (props) => (
  <React.Fragment>
    { (
      <VideoView {...props} />
    )}
  </React.Fragment>
);

export default Embed;
