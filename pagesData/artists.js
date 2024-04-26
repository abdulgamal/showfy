import React from 'react';
import BrowseArtists from "../containers/Artist/Browse"

const Artists = (props) => (
  <React.Fragment>
    {
      
      <BrowseArtists {...props} />
    }
  </React.Fragment>
)

export default Artists