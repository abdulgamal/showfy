import React from "react";
import Messages from "../containers/Messages/Index";

const Messagers = (props) => (
  <React.Fragment>
    { (
      <Messages {...props} />
    )}
  </React.Fragment>
);

export default Messagers;
