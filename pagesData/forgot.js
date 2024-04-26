import React from "react";
import ForgotForm from "../containers/Forgot/Index";

const Forgot = (props) => (
  <React.Fragment>
    { (
      <ForgotForm {...props} />
    )}
  </React.Fragment>
);

export default Forgot;
