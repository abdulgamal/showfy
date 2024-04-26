import React from 'react';
import BrowseBlogs from "../containers/Blog/Browse"

const Blogs = (props) => (
  <React.Fragment>
    {
     
      <BrowseBlogs {...props} />
    }
  </React.Fragment>
)


export default Blogs