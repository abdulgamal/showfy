import React, { useEffect, useReducer } from "react";
import ShortNumber from "short-number";
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import CensorWord from "../CensoredWords/Index";
import Timeago from "../Common/Timeago";
import Rating from "../Rating/Index";
import Currency from "../Upgrade/Currency";

const Info = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movie: props.movie,
      episode: props.episode,
      seasons: props.seasons,
    }
  );
  useEffect(() => {
    if (
      props.movie != state.movie ||
      props.movie.rating != state.movie.rating ||
      props.episode != state.episode
    ) {
      setState({
        movie: props.movie,
        episode: props.episode,
        seasons: props.seasons,
      });
    }
  }, [props]);

  let perpriceB = {};
  perpriceB["package"] = { price: state.movie.budget };
  let perpriceR = {};
  perpriceR["package"] = { price: state.movie.revenue };

  return (
    <React.Fragment>
      {state.episode && state.seasons ? (
        <React.Fragment>
          <div className="tabInTitle">
            <h6>{Translate(props, "Title")}</h6>
            <div className="owner_name">
              <CensorWord {...props} text={state.episode.title} />
            </div>
          </div>
          {state.episode.description ? (
            <div className="tabInTitle">
              <h6>{Translate(props, "Description")}</h6>
              <div className="channel_description">
                <CensorWord {...props} text={state.episode.description} />
              </div>
            </div>
          ) : null}
          <div className="tabInTitle">
            <h6>{Translate(props, "Movie")}</h6>
            <div className="owner_name">
              <Link
                href="/watch"
                customParam={`id=${state.movie.custom_url}`}
                as={`/watch/${state.movie.custom_url}`}
              >
                <a>
                  <CensorWord {...props} text={state.movie.title} />
                </a>
              </Link>
            </div>
          </div>
          <div className="tabInTitle">
            <h6>{Translate(props, "Release Date")}</h6>
            <div className="owner_name">
              <Timeago {...props}>{state.episode.release_date}</Timeago>
            </div>
          </div>
          <div className="tabInTitle">
            <h6>{Translate(props, "Season")}</h6>
            <div className="owner_name">{`S` + state.episode.season}</div>
          </div>
          <div className="tabInTitle">
            <h6>{Translate(props, "Episode Number")}</h6>
            <div className="owner_name">
              {`E` + state.episode.episode_number}
            </div>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {props.pageData.appSettings[`${"movie_rating"}`] == 1 &&
          state.movie.approve == 1 ? (
            <div className="tabInTitle">
              <h6>{Translate(props, "Rating")}</h6>
              <div className="rating">
                <React.Fragment>
                  <div className="animated-rater">
                    <Rating
                      {...props}
                      rating={state.movie.rating}
                      type="movie"
                      id={state.movie.movie_id}
                    />
                  </div>
                </React.Fragment>
              </div>
            </div>
          ) : null}
          {!state.seasons ? (
            <div className="tabInTitle categories_cnt">
              <h6>{Translate(props, "Watch Now")}</h6>
              <div className="boxInLink">
                {
                  <button className="mWatchBtn" onClick={props.watchNow}>
                    {props.t("Watch Now")}
                  </button>
                }
              </div>
            </div>
          ) : null}
          {state.movie.budget > 0 ? (
            <div className="tabInTitle">
              <h6>{props.t("Budget")}</h6>
              <div className="owner_name">
                <React.Fragment>
                  {`${Currency({ ...props, ...perpriceB })}`}
                </React.Fragment>
              </div>
            </div>
          ) : null}
          {state.movie.revenue > 0 ? (
            <div className="tabInTitle">
              <h6>{props.t("Revenue")}</h6>
              <div className="owner_name">
                <React.Fragment>
                  {`${Currency({ ...props, ...perpriceR })}`}
                </React.Fragment>
              </div>
            </div>
          ) : null}
          {state.movie.language_title ? (
            <div className="tabInTitle">
              <h6>{props.t("Language")}</h6>
              <div className="owner_name">
                <React.Fragment>{state.movie.language_title}</React.Fragment>
              </div>
            </div>
          ) : null}
          <div className="tabInTitle">
            <h6>
              {props.t("view_count", {
                count: state.movie.view_count ? state.movie.view_count : 0,
              })}
            </h6>
            <div className="owner_name">
              <React.Fragment>
                {`${ShortNumber(
                  state.movie.view_count ? state.movie.view_count : 0
                )}`}{" "}
                {props.t("view_count", {
                  count: state.movie.view_count ? state.movie.view_count : 0,
                })}
              </React.Fragment>
            </div>
          </div>
          <div className="tabInTitle">
            <h6>{Translate(props, "Release Date")}</h6>
            <div className="owner_name">
              <Timeago {...props}>{state.movie.release_date}</Timeago>
            </div>
          </div>
          {state.movie.categories ? (
            <React.Fragment>
              <div className="tabInTitle categories_cnt">
                <h6>{Translate(props, "Category")}</h6>
                <div className="boxInLink">
                  {
                    <Link
                      href={`/category`}
                      customParam={
                        `type=movies-series&id=` + state.movie.categories.slug
                      }
                      as={
                        `/movies-series/category/` + state.movie.categories.slug
                      }
                    >
                      <a>
                        {
                          <CensorWord
                            {...props}
                            text={state.movie.categories.title}
                          />
                        }
                      </a>
                    </Link>
                  }
                </div>
                {state.movie.subcategory ? (
                  <React.Fragment>
                    {/* <span> >> </span> */}
                    <div className="boxInLink">
                      <Link
                        href={`/category`}
                        customParam={
                          `type=movies-series&id=` +
                          state.movie.subcategory.slug
                        }
                        as={
                          `/movies-series/category/` +
                          state.movie.subcategory.slug
                        }
                      >
                        <a>
                          {
                            <CensorWord
                              {...props}
                              text={state.movie.subcategory.title}
                            />
                          }
                        </a>
                      </Link>
                    </div>
                    {state.movie.subsubcategory ? (
                      <React.Fragment>
                        {/* <span> >> </span> */}
                        <div className="boxInLink">
                          <Link
                            href={`/category`}
                            customParam={
                              `type=movies-series&id=` +
                              state.movie.subsubcategory.slug
                            }
                            as={
                              `/movies-series/category/` +
                              state.movie.subsubcategory.slug
                            }
                          >
                            <a>
                              {
                                <CensorWord
                                  {...props}
                                  text={state.movie.subsubcategory.title}
                                />
                              }
                            </a>
                          </Link>
                        </div>
                      </React.Fragment>
                    ) : null}
                  </React.Fragment>
                ) : null}
              </div>
            </React.Fragment>
          ) : null}
          {state.movie.movie_countries && state.movie.movie_countries != "" ? (
            <div className="blogtagListWrap">
              <div className="tabInTitle">
                <h6>{Translate(props, "Countries")}</h6>
                <ul className="TabTagList clearfix">
                  {state.movie.movie_countries.map((country) => {
                    return (
                      <li key={country.movie_country_id}>
                        <Link
                          href={`${
                            props.pageData.contentType == "movies"
                              ? "movies"
                              : "series"
                          }`}
                          customParam={`country=${country.country_id}`}
                          as={`/${
                            props.pageData.contentType == "movies"
                              ? "movies"
                              : "series"
                          }?country=${country.country_id}`}
                        >
                          <a>
                            {
                              <CensorWord
                                {...props}
                                text={`${country.nicename}`}
                              />
                            }
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}
          {state.movie.tags && state.movie.tags != "" ? (
            <div className="blogtagListWrap">
              <div className="tabInTitle">
                <h6>{Translate(props, "Tags")}</h6>
                <ul className="TabTagList clearfix">
                  {state.movie.tags.split(",").map((tag) => {
                    return (
                      <li key={tag}>
                        <Link
                          href={`${
                            props.pageData.contentType == "movies"
                              ? "movies"
                              : "series"
                          }`}
                          customParam={`tag=${tag}`}
                          as={`/${
                            props.pageData.contentType == "movies"
                              ? "movies"
                              : "series"
                          }?tag=${tag}`}
                        >
                          <a>{<CensorWord {...props} text={tag} />}</a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}
          {state.movie.description ? (
            <React.Fragment>
              <div className="tabInTitle">
                <h6>{Translate(props, "Description")}</h6>
                <div className="channel_description">
                  <CensorWord {...props} text={state.movie.description} />
                </div>
              </div>
            </React.Fragment>
          ) : null}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Info;
