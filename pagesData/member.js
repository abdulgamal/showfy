import React from "react";
import ViewMember from "../containers/User/Index";

const Members = (props) => (
  <React.Fragment>
    { (
      <ViewMember {...props} />
    )}
  </React.Fragment>
);

export default Members;
