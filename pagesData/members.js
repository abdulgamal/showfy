import React from "react";
import MemberBrowse from "../containers/User/Browse";

const Member = (props) => (
  <React.Fragment>
    { (
      <MemberBrowse {...props} />
    )}
  </React.Fragment>
);

export default Member;
