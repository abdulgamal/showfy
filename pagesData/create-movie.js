import React,{useReducer,useEffect,useRef} from 'react';
import MovieForm from "../containers/Form/Movie";

const Movie = (props) => (
  <React.Fragment>
    { (
      <MovieForm selectType="movie" {...props} />
    )}
  </React.Fragment>
);

export default Movie;
