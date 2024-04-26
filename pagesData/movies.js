import React from "react";
import BrowseMovies from "../containers/Movies/Browse";

const Movies = (props) => (
  <React.Fragment>
    { (
      <BrowseMovies {...props} showSearch={true} />
    )}
  </React.Fragment>
);

export default Movies;
