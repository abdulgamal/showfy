import React from "react";
import HomeContainer from "../containers/Home/Index";

const Home = (props) => (
  <React.Fragment>
    { (
      <HomeContainer {...props} />
    )}
  </React.Fragment>
);
export default Home;
