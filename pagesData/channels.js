import React from 'react';
import BrowseChannels from "../containers/Channel/Browse"

const Channels = (props) => (
  <React.Fragment>
    {
      <BrowseChannels {...props} />
    }
  </React.Fragment>
)

export default Channels