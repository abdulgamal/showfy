import React, { useReducer, useEffect } from "react";
import Router from "next/router";
import BrowsePlaylists from "../Playlist/Playlists";
import Translate from "../../components/Translate/Index";

const Playlists = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      type: props.pageData.filter ? props.pageData.filter : "my",
      pagging: props.pageData.items.pagging,
      items: props.pageData.items.results,
      canEdit: props.pageData.canEdit,
      canDelete: props.pageData.canDelete,
    }
  );

  useEffect(() => {
    if (
      props.pageData.filter != state.type ||
      props.pageData.items.results != state.items
    ) {
      setState({
        type: props.pageData.filter,
        pagging: props.pageData.items.pagging,
        items: props.pageData.items.results,
      });
    }
  }, [props.pageData.filter, props.pageData.items.results]);

  const changeType = (e) => {
    let user = props.pageData.user ? `&user=${props.pageData.user}` : "";
    let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";

    let type = "";
    if (e) type = e.target.value;
    else type = state.type;
    let subtype = `/dashboard?type=playlists&filter=${type}${user}`;
    let asPath = `/dashboard/playlists/${type}${userAs}`;
    Router.push(`${asPath}`);
  };
  const criterials = {};
  criterials["my"] = "My Playlists";
  criterials["my_recent"] = "Recently Visited Playlists";
  if (props.pageData.appSettings["playlist_rating"])
    criterials["rated"] = "My Most Rated Playlists";
  if (props.pageData.appSettings["playlist_favourite"])
    criterials["favourited"] = "My Most  Favourite Playlists";
  if (props.pageData.appSettings["playlist_comment"])
    criterials["commented"] = "My Most Commented Playlists";
  if (props.pageData.appSettings["playlist_like"])
    criterials["liked"] = "My Most Liked Playlists";
  if (props.pageData.appSettings["playlist_dislike"])
    criterials["disliked"] = "My Most Disliked Playlists";
  criterials["viewed"] = "My Most Viewed Playlists";
  if (props.pageData.appSettings["playlist_comment"])
    criterials["my_commented"] = "Playlists I Commented";
  if (props.pageData.appSettings["playlist_favourite"])
    criterials["my_favourited"] = "Playlists I  Favourite";
  if (props.pageData.appSettings["playlist_like"])
    criterials["my_liked"] = "Playlists I Liked";
  if (props.pageData.appSettings["playlist_dislike"])
    criterials["my_disliked"] = "Playlists I Disliked";
  if (props.pageData.appSettings["playlist_rating"])
    criterials["my_rated"] = "Playlists I Rated";

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
                    props.clearHistory("playlists", changeType);
                  }}
                >
                  {props.t("clear history")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <BrowsePlaylists
        {...props}
        canEdit={state.canEdit}
        canDelete={state.canDelete}
        playlists={state.items}
        pagging={state.pagging}
        contentType={state.type}
        userContent={props.pageData.user ? props.pageData.user.user_id : 0}
      />
    </React.Fragment>
  );
};

export default Playlists;
