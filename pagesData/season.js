import React from "react";
import SeasonMovies from "../containers/Movies/BrowseSeasons";

const Season = (props) => (
  <React.Fragment>
    { (
      <SeasonMovies {...props} containerE={true} />
    )}
  </React.Fragment>
);

export default Season;
