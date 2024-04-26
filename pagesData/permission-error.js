import React from 'react';
import PermissionError from "../containers/Error/PermissionError"

const Index = (props) => (
  <React.Fragment>     
     <PermissionError {...props} />        
  </React.Fragment>
)

export default Index