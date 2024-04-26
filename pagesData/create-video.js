import React,{useReducer,useEffect,useRef} from 'react';
import VideoForm from "../containers/Form/Video";

const Video = (props) => (
  <React.Fragment>
    { (
      <VideoForm {...props} />
    )}
  </React.Fragment>
);

export default Video;
