import React from 'react';
import BlogView from "../containers/Blog/Index"

const Blog = (props) => (
  <React.Fragment>
    {
     
      <BlogView {...props} />
    }
  </React.Fragment>
)


export default Blog