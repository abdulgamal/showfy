import React, { useReducer, useEffect } from "react";
import Image from "../Image/Index";

import Link from "../../components/Link/index";

import SocialShare from "../SocialShare/Index";

import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import Translate from "../../components/Translate/Index";
import CensorWord from "../CensoredWords/Index";

const Item = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      artist: props.artists,
    }
  );

  useEffect(() => {
    if (JSON.stringify(props.artists) != JSON.stringify(state.artist)) {
      setState({ artist: props.artists });
    }
  }, [props.artists]);

  return (
    <div className="single-user">
      <div className={`img${props.className ? " " + props.className : ""}`}>
        <Link
          href="/artist"
          customParam={`id=${state.artist.custom_url}`}
          as={`/artist/${state.artist.custom_url}`}
        >
          <a>
            <Image
              title={CensorWord(
                "fn",
                props,
                Translate(props, state.artist.title)
              )}
              image={state.artist.image}
              siteURL={props.pageData.siteURL}
              imageSuffix={props.pageData.imageSuffix}
            />
          </a>
        </Link>
      </div>
      <div className="content">
        <Link
          href="/artist"
          customParam={`id=${state.artist.custom_url}`}
          as={`/artist/${state.artist.custom_url}`}
        >
          <a className="name">
            <React.Fragment>
              {
                <CensorWord
                  {...props}
                  text={Translate(props, state.artist.title)}
                />
              }
              {state.artist.verified ? (
                <span
                  className="verifiedUser"
                  title={Translate(props, "verified")}
                >
                  <span className="material-icons" data-icon="check"></span>
                </span>
              ) : null}
            </React.Fragment>
          </a>
        </Link>
        <div className="LikeDislikeWrap">
          <ul className="LikeDislikeList">
            {props.pageData.appSettings["artists_browse_like"] == "1" ? (
              <li>
                <Like
                  icon={true}
                  {...props}
                  like_count={state.artist.like_count}
                  item={state.artist}
                  parentType={state.artist.type}
                  type="artist"
                  id={state.artist.artist_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["artists_browse_dislike"] == "1" ? (
              <li>
                <Dislike
                  icon={true}
                  {...props}
                  dislike_count={state.artist.dislike_count}
                  item={state.artist}
                  parentType={state.artist.type}
                  type="artist"
                  id={state.artist.artist_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["artists_browse_favourite"] == "1" ? (
              <li>
                <Favourite
                  icon={true}
                  {...props}
                  favourite_count={state.artist.favourite_count}
                  item={state.artist}
                  parentType={state.artist.type}
                  type="artist"
                  id={state.artist.artist_id}
                />
                {"  "}
              </li>
            ) : null}

            {props.pageData.appSettings["artists_browse_share"] == "1" ? (
              <SocialShare
                {...props}
                hideTitle={true}
                buttonHeightWidth="30"
                url={`/playlist/${state.artist.custom_url}`}
                title={CensorWord(
                  "fn",
                  props,
                  Translate(props, state.artist.title)
                )}
                imageSuffix={props.pageData.imageSuffix}
                media={state.artist.image}
              />
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Item;
