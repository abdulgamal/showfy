import React from 'react';
import AudioView from "../containers/Audio/Index"
import AudioBrowse from "../containers/Audio/Browse"

const Audio = (props) => (
  <React.Fragment>
    {
     
        props.pageData.fromBrowse ?
          <AudioBrowse {...props} />
          :
          <AudioView {...props} />
    }
  </React.Fragment>
)

export default Audio