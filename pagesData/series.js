import React from "react";
import BrowseMovies from "../containers/Movies/Browse";

const Series = (props) => (
  <React.Fragment>
    { (
      <BrowseMovies typeData="series" {...props} showSearch={true} />
    )}
  </React.Fragment>
);

export default Series;
