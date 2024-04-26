import React,{useReducer,useEffect,useRef} from 'react';
import MovieForm from "../containers/Form/Movie";

const Series = (props) => (
  <React.Fragment>
    { (
      <MovieForm {...props} selectType="series" />
    )}
  </React.Fragment>
);

export default Series;
