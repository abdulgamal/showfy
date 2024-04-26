import React from "react";
import VideoView from "../containers/Video/Index";
import MovieView from "../containers/Movies/Index";

const Watch = (props) => {
  return (
    <React.Fragment>
      {props.pagenotfound ? (
        <PageNotFound {...props} />
      ) : props.user_login ? (
        <Login {...props} />
      ) : props.permission_error ? (
        <PermissionError {...props} />
      ) : props.maintanance ? (
        <Maintanance {...props} />
      ) : props.pageData.contentType == "movies" ||
        props.pageData.contentType == "series" ? (
        <MovieView {...props} />
      ) : (
        <VideoView {...props} />
      )}
    </React.Fragment>
  );
};

export default Watch;
