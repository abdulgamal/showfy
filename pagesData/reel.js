import React from "react";
import ReelView from "../containers/Reels/Carousel/Reels";

const Reel = (props) => (
  <React.Fragment>{<ReelView {...props} />}</React.Fragment>
);

export default Reel;
