import React from "react";
import BrowsePlaylists from "../containers/Playlist/Browse";

const Playlists = (props) => (
  <React.Fragment>
    { (
      <BrowsePlaylists {...props} />
    )}
  </React.Fragment>
);

export default Playlists;
