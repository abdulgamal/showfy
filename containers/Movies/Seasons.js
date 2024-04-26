import React, { useEffect, useReducer } from "react";
import Link from "../../components/Link/index";
import Image from "../Image/Index";

const Season = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      movie: props.movie,
      seasons: props.seasons,
    }
  );

  useEffect(() => {
    if (props.pageData.movie != state.movie) {
      setState({
        movie: props.movie,
        seasons: props.seasons,
      })
    }
  }, [props]);

  let items = state.seasons.map((item, _) => {
    return (
      <div key={item.season_id} className="item">
        <div className="ThumbBox-wrap">
          <Link
            href="/season"
            customParam={`season_id=${item.season}&id=${state.movie.custom_url}`}
            as={`/watch/${state.movie.custom_url}/season/${item.season}`}
          >
            <a className="ThumbBox-link">
              <div className="ThumbBox-coverImg">
                <span>
                  <Image
                    image={item.image}
                    imageSuffix={props.pageData.imageSuffix}
                    siteURL={props.pageData.siteURL}
                  />
                </span>
              </div>
              <div className="ThumbBox-Title">
                <div className="title ellipsize2Line">
                  <h4 className="m-0">
                    {`${props.t("Season")} ${item.season}`}{" "}
                    <span className="material-icons">fiber_manual_record</span>{" "}
                    {`${item.episodes_count} ${props.t("Episodes")}`}
                  </h4>
                </div>
              </div>
            </a>
          </Link>
        </div>
      </div>
    );
  });

  return <div className="gridContainer gridSeason">{items}</div>;
};

export default Season;
