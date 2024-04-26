import React from "react";
import SignForm from "../containers/Signup/Index";

const Signup = (props) => (
  <React.Fragment>
    { (
      <SignForm {...props} />
    )}
  </React.Fragment>
);

export default Signup;
