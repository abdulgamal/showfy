import React, { useReducer, useEffect, useRef } from "react";
import axios from "../../axios-orders";
import Loader from "../LoadMore/Index";
import ReactStars from "react-rating-stars-component";
import Translate from "../../components/Translate/Index";

const Stats = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      stats: null,
    }
  );
  
  useEffect(() => {
    const formData = new FormData();
    formData.append("id", props.ratingData.data.id);
    formData.append("type", props.ratingData.data.type + "s");
    let url = "/ratings/stats";
    axios
      .post(url, formData)
      .then((response) => {
        if (!response.data.error) setState({ stats: response.data });
        else setState({ openStats: false });
      })
      .catch((err) => {});
  }, []);

  const closeEditPopup = (e) => {
    e.preventDefault();
    props.ratingStats({status:false,data:{}});
  };
  let stats = null;

  if (state.stats) {
    const fiveStar = Math.floor(
      (state.stats.fiveStar / state.stats.totalRating) * 100
    );
    const fourStar = Math.floor(
      (state.stats.fourStar / state.stats.totalRating) * 100
    );
    const threeStar = Math.floor(
      (state.stats.threeStar / state.stats.totalRating) * 100
    );
    const twoStar = Math.floor(
      (state.stats.twoStar / state.stats.totalRating) * 100
    );
    const oneStar = Math.floor(
      (state.stats.oneStar / state.stats.totalRating) * 100
    );

    stats = (
      <div className="modal-body ratingpopup">
        <div className="row">
          <div className="col-sm-5 ratingPpup">
            <div className="rating-block">
              <h4>{Translate(props, "Average rating")}</h4>
              <h2 className="bold padding-bottom-7">
                {`${props.ratingData.data.rating.toFixed(1)}`} <small>/ 5</small>
              </h2>
              <ReactStars
                count={5}
                size={24}
                edit={false}
                value={props.ratingData.data.rating}
              ></ReactStars>
            </div>
            {state.stats.isRated ? (
              <div className="rating-block" style={{ marginTop: "10px" }}>
                <h4>{Translate(props, "You rated")}</h4>
                <h2 className="bold padding-bottom-7">
                  {`${state.stats.ownRating.toFixed(1)}`}{" "}
                  <small>/ 5</small>
                </h2>
                <ReactStars
                  count={5}
                  edit={false}
                  size={24}
                  value={state.stats.ownRating}
                ></ReactStars>
              </div>
            ) : null}
          </div>
          <div className="col-sm-7">
            <h4>{Translate(props, "Rating breakdown")}</h4>
            <div className="pull-left">
              <div
                className="pull-left"
                style={{ width: "35px", lineHeight: "1" }}
              >
                <div style={{ height: "9px", margin: "5px 0" }}>
                  5 <span className="fas fa-star"></span>
                </div>
              </div>
              <div className="pull-left" style={{ width: "180px" }}>
                <div
                  className="progress"
                  style={{ height: "12px", margin: "6px 0" }}
                >
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    aria-valuenow="5"
                    aria-valuemin="0"
                    aria-valuemax="5"
                    style={{ width: `${fiveStar}%` }}
                  ></div>
                </div>
              </div>
              <div className="pull-right" style={{ marginLeft: "10px" }}>
                {state.stats.fiveStar}
              </div>
            </div>
            <div className="pull-left">
              <div
                className="pull-left"
                style={{ width: "35px", lineHeight: "1" }}
              >
                <div style={{ height: "9px", margin: "5px 0" }}>
                  4 <span className="fas fa-star"></span>
                </div>
              </div>
              <div className="pull-left" style={{ width: "180px" }}>
                <div
                  className="progress"
                  style={{ height: "12px", margin: "6px 0" }}
                >
                  <div
                    className="progress-bar  bg-primary"
                    role="progressbar"
                    aria-valuenow="4"
                    aria-valuemin="0"
                    aria-valuemax="5"
                    style={{ width: `${fourStar}%` }}
                  ></div>
                </div>
              </div>
              <div className="pull-right" style={{ marginLeft: "10px" }}>
                {state.stats.fourStar}
              </div>
            </div>

            <div className="pull-left">
              <div
                className="pull-left"
                style={{ width: "35px", lineHeight: "1" }}
              >
                <div style={{ height: "9px", margin: "5px 0" }}>
                  3 <span className="fas fa-star"></span>
                </div>
              </div>
              <div className="pull-left" style={{ width: "180px" }}>
                <div
                  className="progress"
                  style={{ height: "12px", margin: "6px 0" }}
                >
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    aria-valuenow="4"
                    aria-valuemin="0"
                    aria-valuemax="5"
                    style={{ width: `${threeStar}%` }}
                  ></div>
                </div>
              </div>
              <div className="pull-right" style={{ marginLeft: "10px" }}>
                {state.stats.threeStar}
              </div>
            </div>

            <div className="pull-left">
              <div
                className="pull-left"
                style={{ width: "35px", lineHeight: "1" }}
              >
                <div style={{ height: "9px", margin: "5px 0" }}>
                  2 <span className="fas fa-star"></span>
                </div>
              </div>
              <div className="pull-left" style={{ width: "180px" }}>
                <div
                  className="progress"
                  style={{ height: "12px", margin: "6px 0" }}
                >
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    aria-valuenow="4"
                    aria-valuemin="0"
                    aria-valuemax="5"
                    style={{ width: `${twoStar}%` }}
                  ></div>
                </div>
              </div>
              <div className="pull-right" style={{ marginLeft: "10px" }}>
                {state.stats.twoStar}
              </div>
            </div>

            <div className="pull-left">
              <div
                className="pull-left"
                style={{ width: "35px", lineHeight: "1" }}
              >
                <div style={{ height: "9px", margin: "5px 0" }}>
                  1 <span className="fas fa-star"></span>
                </div>
              </div>
              <div className="pull-left" style={{ width: "180px" }}>
                <div
                  className="progress"
                  style={{ height: "12px", margin: "6px 0" }}
                >
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    aria-valuenow="4"
                    aria-valuemin="0"
                    aria-valuemax="5"
                    style={{ width: `${oneStar}%` }}
                  ></div>
                </div>
              </div>
              <div className="pull-right" style={{ marginLeft: "10px" }}>
                {state.stats.oneStar}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    stats = <Loader loading={true} />;
  }
  return (
    <div className="popup_wrapper_cnt">
      <div className="popup_cnt">
        <div className="comments">
          <div className="VideoDetails-commentWrap">
            <div className="popup_wrapper_cnt_header">
              <h2>{Translate(props, "View Stats")}</h2>
              <a onClick={closeEditPopup} className="_close">
                <i></i>
              </a>
            </div>
            {stats}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
