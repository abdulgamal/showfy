import React,{useReducer,useEffect,useRef} from 'react';
import ChannelForm from "../containers/Form/Channel";

const Channel = (props) => (
  <React.Fragment>
    { (
      <ChannelForm {...props} />
    )}
  </React.Fragment>
);

export default Channel;
