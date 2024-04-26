import React from 'react';
import ArtistView from "../containers/Artist/Artist"

const Artist = (props) => (
  <React.Fragment>
    {
      <ArtistView {...props} />
    }
  </React.Fragment>
)

export default Artist