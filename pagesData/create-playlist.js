import React,{useReducer,useEffect,useRef} from 'react';
import PlaylistForm from "../containers/Form/Playlist";

const Playlist = (props) => (
  <React.Fragment>
    { (
      <PlaylistForm {...props} />
    )}
  </React.Fragment>
);

export default Playlist;
