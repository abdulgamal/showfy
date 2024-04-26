import React from "react";
import SearchView from "../containers/Search/Search";

const Search = (props) => (
  <React.Fragment>
    { (
      <SearchView {...props} />
    )}
  </React.Fragment>
);

export default Search;
