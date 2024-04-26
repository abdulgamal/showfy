import React from "react";
import ReelForm from "../containers/Form/Reel";

const Reel = (props) => (
  <React.Fragment>
    { (
      <ReelForm {...props} />
    )}
  </React.Fragment>
);
export default Reel;
