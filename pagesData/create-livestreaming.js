import React,{useReducer,useEffect,useRef} from 'react';
import LiveStreamingIndex from "../containers/LiveStreaming/Index";

const LiveStreaming = (props) => (
  <React.Fragment>
    { (
      <LiveStreamingIndex {...props} />
    )}
  </React.Fragment>
);

export default LiveStreaming;
