import React, { useReducer, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Router from "next/router";
import BrowseMovies from "../Movies/Browse";
import Translate from "../../components/Translate/Index";

const Movies = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      type: props.pageData.filter ? props.pageData.filter : "my",
      pagging: props.pageData.items.pagging,
      items: props.pageData.items.results,
      canEdit: props.pageData.canEdit,
      canDelete: props.pageData.canDelete,
      typeItem: props.pageData.type,
    }
  );

  useEffect(() => {
    if (
      props.pageData.filter != state.type ||
      props.pageData.type != state.typeItem ||
      props.pageData.items.results != state.items
    ) {
      setState({
        type: props.pageData.filter,
        pagging: props.pageData.items.pagging,
        items: props.pageData.items.results,
        typeItem: props.pageData.type,
      })
    }
  }, [
    props.pageData.filter,
    props.pageData.type,
    props.pageData.items.results,
  ]);

  const changeType = (e) => {
    let userAs = props.pageData.user
      ? `?user=${props.pageData.user}`
      : "";

    let type = "";
    if (e) type = e.target.value;
    else type = state.type;

    let asPath = `/dashboard/${state.typeItem}/${type}${userAs}`;
    Router.push(`${asPath}`);
  };
  let type = state.typeItem == "movies" ? "Movies" : "Series";
  const criterials = {};
  criterials["my"] = "My " + type;
  criterials["my_recent"] = "Recently Visited " + type;
  if (props.pageData.appSettings["movie_rating"])
    criterials["rated"] = "My Most Rated " + type;
  if (props.pageData.appSettings["movie_favourite"])
    criterials["favourited"] = "My Most  Favourite " + type;
  if (props.pageData.appSettings["movie_comment"])
    criterials["commented"] = "My Most Commented " + type;
  criterials["watchlater"] = "Watch Later " + type;
  if (props.pageData.appSettings["movie_like"])
    criterials["liked"] = "My Most Liked " + type;
  if (props.pageData.appSettings["movie_dislike"])
    criterials["disliked"] = "My Most Disliked " + type;
  criterials["viewed"] = "My Most Viewed " + type;
  if (props.pageData.appSettings["movie_comment"])
    criterials["my_commented"] = type + " I Commented";
  if (props.pageData.appSettings["movie_favourite"])
    criterials["my_favourited"] = type + " I  Favourite";
  if (props.pageData.appSettings["movie_like"])
    criterials["my_liked"] = type + " I Liked";
  if (props.pageData.appSettings["movie_dislike"])
    criterials["my_disliked"] = type + " I Disliked";
  if (props.pageData.appSettings["movie_rating"])
    criterials["my_rated"] = type + " I Rated";

  return (
    <React.Fragment>
      <div>
        <div className="serachRsltsort">
          <div className="totalno"></div>
          <div className="sortby formFields">
            <div className="form-group sortbys">
              <span className="lble" style={{ width: "105px" }}>
                {Translate(props, "Criteria")}:
              </span>
              <select
                className="form-control form-select"
                value={state.type}
                onChange={(e) => changeType(e)}
              >
                {Object.keys(criterials).map(function (keyName, keyIndex) {
                  return (
                    <option key={keyName} value={keyName}>
                      {Translate(props, criterials[keyName])}
                    </option>
                  );
                }, this)}
              </select>
              {state.type == "my_recent" ? (
                <a
                  href="#"
                  className="clear-history"
                  onClick={(e) => {
                    e.preventDefault();
                    props.clearHistory(state.typeItem, changeType);
                  }}
                >
                  {props.t("clear history")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <BrowseMovies
        {...props}
        canEdit={state.canEdit}
        canDelete={state.canDelete}
        typeData={state.typeItem}
        movies={state.items}
        pagging={state.pagging}
        contentType={state.type}
        userContent={
          props.pageData.user ? props.pageData.user.user_id : 0
        }
      />
    </React.Fragment>
  );
};

export default Movies;
