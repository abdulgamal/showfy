import React from "react";
import LoginForm from "../containers/Login/Index";

const Login = (props) => (
  <React.Fragment>
    { (
      <LoginForm {...props} />
    )}
  </React.Fragment>
);

export default Login;
