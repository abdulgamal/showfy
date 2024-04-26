import React from 'react';
import CastView from "../containers/Movies/CastView"
import CastBrowse from "../containers/Movies/Cast"

const Cast = (props) => (
  <React.Fragment>
    {
      
        props.pageData.id ? 
        <CastView {...props} />
        :
        <CastBrowse {...props} />
    }
  </React.Fragment>
)

export default Cast