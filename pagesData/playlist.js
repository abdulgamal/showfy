import React from "react";
import PLaylistView from "../containers/Playlist/Index";

const Playlist = (props) => (
  <React.Fragment>
    { (
      <PLaylistView {...props} />
    )}
  </React.Fragment>
);

export default Playlist;
