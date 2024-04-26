import React, { useReducer, useEffect, useRef } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "../../axios-orders";
import Loader from "../LoadMore/Index";

const Analytics = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      ad_id: props.ad_id,
      stats: props.statsData ? props.statsData : null,
      title: "Today Analytics",
      search: "today",
      statsData: props.statsData,
      item: props.item,
    }
  );

  useEffect(() => {
    if (state.statsData && typeof search == "undefined") {
      return;
    }
    getData();
  }, []);

  const getData = (value) => {
    let formData = new FormData();

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    formData.append("type", value ?? state.search);
    let url = "/ads/stats";
    if (state.ad_id) {
      formData.append("ad_id", state.ad_id);
    } else if (state.statsData) {
      url = "/dashboard/earning";
      formData.append("owner_id", props.member.user_id);
    }
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.stats) {
          setState({
            stats: response.data.stats,
            statsData: response.data.stats,
          });
        } else {
          setState({ loading: false });
        }
      })
      .catch((err) => {
        setState({ loading: false });
      });
  };

  const change = (e) => {
    let title = "Today Analytics";
    if (e.target.value == "this_week") {
      title = "This Week Analytics";
    } else if (e.target.value == "this_month") {
      title = "This Month Analytics";
    } else if (e.target.value == "this_year") {
      title = "This Year Analytics";
    }
    setState({ search: e.target.value, title: title, stats: null });
    setTimeout(function () {
      getData(e.target.value);
    }, 200);
  };
  if (!state.stats) {
    return <Loader loading={true} />;
  }

  let series = [];

  if (
    state.statsData &&
    props.pageData.appSettings["video_ffmpeg_path"] &&
    !state.ad_id
  ) {
    series.push({
      name: state.statsData
        ? props.t("Advertisement Earning")
        : props.item.type == 1
        ? props.t("Clicks")
        : props.t("Views"),
      data: state.statsData
        ? state.statsData.adsEarning
        : state.stats.result,
    });
  } else if (!state.statsData && !state.ad_id) {
    series.push({
      name: state.statsData
        ? props.t("Advertisement Earning")
        : props.item.type == 1
        ? props.t("Clicks")
        : props.t("Views"),
      data: state.statsData
        ? state.statsData.adsEarning
        : state.stats.result,
    });
  }

  if (state.statsData && state.statsData.channelSupportEarning) {
    series.push({
      name: props.t("Channel Supports Earning"),
      data: state.statsData.channelSupportEarning,
    });
  }
  if (state.statsData && state.statsData.videosTipEarning) {
    series.push({
      name: props.t("Video Tips Earning"),
      data: state.statsData.videosTipEarning,
    });
  }
  if (state.statsData && state.statsData.videosPerViewEarning) {
    series.push({
      name: props.t("Video Per View Earning"),
      data: state.statsData.videosPerViewEarning,
    });
  }
  if (state.statsData && state.statsData.videosPerViewEarning) {
    series.push({
      name: props.t("Gift Earning"),
      data: state.statsData.giftEarning,
    });
  }
  if (state.statsData && state.statsData.userSubscriptionEarning) {
    series.push({
      name: props.t("Subscriptions Earning"),
      data: state.statsData.userSubscriptionEarning,
    });
  }

  if (state.statsData && state.statsData.movieEarning) {
    series.push({
      name: props.t("Movies Earning"),
      data: state.statsData.movieEarning,
    });
  }

  if (state.statsData && state.statsData.seriesEarning) {
    series.push({
      name: props.t("Series Earning"),
      data: state.statsData.seriesEarning,
    });
  }
  if (state.statsData && state.statsData.audioEarning) {
    series.push({
      name: props.t("Audio Earning"),
      data: state.statsData.audioEarning,
    });
  }

  series.push({
    name:
      state.statsData && !state.ad_id
        ? props.t("Video Earning")
        : props.t("Spent"),
    data:
      state.statsData && !state.ad_id
        ? state.statsData.videosEarning
        : state.stats.spent,
  });

  const options = {
    title: {
      text: props.t(state.title),
    },
    chart: {
      type: "column",
    },
    xAxis: {
      categories: state.stats.xaxis,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: state.stats.yaxis,
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size:10px;color:#fff;">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:#fff;padding:0">{series.name}: </td>' +
        '<td style="color:#fff;"><b>'+props.pageData.defaultCurrency.symbol+'{point.y}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
      backgroundColor: "#444",
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
      series: {
        pointWidth: 10,
      },
    },
    series: series,
  };

  return (
    <React.Fragment>
      <div className="ads_analytics">
        <div className="search_criteria">
          <span>{props.t("Criteria")}:</span>
          <select onChange={(e) => change(e)} value={state.search}>
            <option value="today">{props.t("Today")}</option>
            <option value="this_week">{props.t("This Week")}</option>
            <option value="this_month">{props.t("This Month")}</option>
            <option value="this_year">{props.t("This Year")}</option>
          </select>
        </div>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </React.Fragment>
  );
};

export default Analytics;
