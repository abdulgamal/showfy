import React,{useReducer,useEffect,useRef} from 'react';
import BlogForm from "../containers/Form/Blog";

const Blog = (props) => (
  <React.Fragment>
    { (
      <BlogForm {...props} />
    )}
  </React.Fragment>
);

export default Blog;
