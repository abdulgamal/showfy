import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";
import Currency from "./Currency";
import Gateways from "../Gateways/Index";

import Router from "next/router";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      packages: props.pageData.packages,
      userActivePackage: props.pageData.userActivePackage,
      gateways: false,
    }
  );
  useEffect(() => {
    if (
      props.packages != state.packages ||
      props.userActivePackage != state.userActivePackage
    ) {
      setState({
        packages: props.pageData.packages,
        userActivePackage: props.pageData.userActivePackage,
        gateways: false,
      });
    }
  }, [props]);

  const selectedPackage = (package_id, price, subscriptionPayment, e) => {
    e.preventDefault();
    if (
      !state.userActivePackage ||
      package_id != state.userActivePackage.package_id
    ) {
      const packages = [...state.packages];
      const itemIndex = packages.findIndex(
        (p) => p["package_id"] == package_id
      );
      let packageObj = packages[itemIndex];
      setState({
        packageObj: packageObj,
        payPalURL: "/upgrade/" + package_id,
        
        bankpackage_id: package_id,
        gateways: true,
        gatewaysURL: `/upgrade/successulPayment/${package_id}`,
        gatewayPrice: price,
        subscriptionPayment: subscriptionPayment,
      });
    }
  };

  const donationVideo = props.pageData.appSettings["video_donation"];
  const sellVideo = props.pageData.appSettings["video_sell"];
  const sellAudio = props.pageData.appSettings["audio_sell"];
  const channelEnable = props.pageData.appSettings["enable_channel"];
  const moviesEnable = props.pageData.appSettings["enable_movie"];
  const blogEnable = props.pageData.appSettings["enable_blog"];
  const playlistEnable = props.pageData.appSettings["enable_playlist"];
  const audioEnable = props.pageData.appSettings["enable_audio"];
  const adsEnable = props.pageData.appSettings["enable_ads"];
  const memberHot = props.pageData.appSettings["member_hot"];
  const memberSponsored = props.pageData.appSettings["member_sponsored"];
  const memberFeatured = props.pageData.appSettings["member_featured"];
  const livestreamingEnable =
    props.pageData.appSettings["live_stream_start"];
  const uploadLimitSize = {
    1048576: "1 MB",
    5242880: "5 MB",
    26214400: "25 MB",
    52428800: "50 MB",
    104857600: "100 MB",
    524288000: "50 MB",
    1073741824: "1 GB",
    2147483648: "2 GB",
    5368709120: "5 GB",
    10737418240: "10 GB",
    0: "Unlimited",
  };
  const sitemodeEnable = 1;

  let gatewaysHTML = "";

  if (state.gateways) {
    gatewaysHTML = (
      <Gateways
        {...props}
        success={() => {
          props.openToast(
           {
            message: Translate(props, "Payment done successfully."),
            type:"success"
           }
          );
          setTimeout(() => {
            Router.push(`/upgrade`);
          }, 1000);
        }}
        successBank={() => {
          props.openToast(
            {
              message:Translate(
                props,
                "Your bank request has been successfully sent, you will get notified once it's approved"
              ),
              type:"success"
            }
          );
          setState({  gateways: null });
        }}
        packageObj={state.packageObj}
        payPalURL={state.payPalURL}
        finishPayment="/upgrade/finishPayment"
        bankpackage_id={state.bankpackage_id}
        bank_price={state.gatewayPrice}
        subscriptionPayment={state.subscriptionPayment}
        bank_type="user_subscription"
        bank_resource_type="user"
        bank_resource_id={props.pageData.loggedInUserDetails.username}
        tokenURL={`${state.gatewaysURL}`}
        closePopup={() => setState({  gateways: false })}
        gatewaysUrl={state.gatewaysURL}
      />
    );
  }

  return (
    <React.Fragment>
      {gatewaysHTML}
      <div className="titleBarTop">
        <div className="titleBarTopBg">
          <img
            src={
              props.pageData["pageInfo"]["banner"]
                ? props.pageData.imageSuffix +
                  props.pageData["pageInfo"]["banner"]
                : props.pageData["subFolder"] +
                  "static/images/breadcumb-bg.jpg"
            }
            alt={props.t("Choose a plan.")}
          />
        </div>
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="titleHeadng">
                  <h1>{props.t("Choose a plan.")}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mainContentWrap">
        <div className="container">
          <div className="row">
            <div className="col-md-12 position-relative">
              <div className="ContentBoxTxt">
                <div className="comparison tableResponsive upgradetableResponsive">
                  <table style={{ width: `100%` }}>
                    <thead>
                      <tr className="upgrade-header">
                        <th className="infoprice">
                          <span>{Translate(props, "Start Today!")}</span>
                          {Translate(props, "Upgrade or cancel anytime.")}
                        </th>
                        {state.packages.map((result) => {
                          return (
                            <th
                              key={result.package_id}
                              className={`price-info${
                                state.userActivePackage &&
                                result.package_id ==
                                  state.userActivePackage.package_id
                                  ? " active"
                                  : ""
                              }`}
                            >
                              <div
                                className="compare-heading plan1Bg"
                                style={{ background: `${result.color}` }}
                              >
                                {Translate(props, result.title)}
                              </div>
                              <div className="price-now">
                                <span>
                                  <Currency {...props} {...result} />
                                </span>{" "}
                                /
                                {result.package_description
                                  ? " " +
                                    Translate(
                                      props,
                                      result.package_description.trim()
                                    )
                                  : ""}
                              </div>
                              {!state.userActivePackage ||
                              result.package_id !=
                                state.userActivePackage.package_id ? (
                                <div>
                                  <a
                                    href="#"
                                    className="price-buy"
                                    onClick={(e) => selectedPackage(
                                      result.package_id,
                                      result.price,
                                      result.is_recurring,
                                      e
                                    )}
                                  >
                                    {Translate(props, "Buy Now")}
                                  </a>
                                </div>
                              ) : null}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pricing-heading">
                          {Translate(props, "Description")}
                        </td>
                        {state.packages.map((result) => {
                          return (
                            <td key={result.package_id} className="description">
                              {result.description
                                ? result.description
                                : Translate(props, "N/A")}
                            </td>
                          );
                        })}
                      </tr>
                      <React.Fragment>
                        {memberFeatured == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Featured")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.is_featured == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {memberSponsored == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Sponsored")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.is_sponsored == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {memberHot == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Hot")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.is_hot == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {sitemodeEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Site Theme Mode")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {props.t(result.themeMode)}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {livestreamingEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Go Live")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_livestreaming != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.livestreaming_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} livestream(s)",
                                      {
                                        limit:
                                          result.livestreaming_create_limit,
                                      }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {channelEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Videos")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.video_upload != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.video_create_limit != 0 ? (
                                    `${props.t(
                                      "Upload upto {{video}} video(s)",
                                      { video: result.video_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Upload Videos")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.upload_video_limit != 0
                                    ? ` ${props.t("Upto ")}${
                                        uploadLimitSize[
                                          result.upload_video_limit
                                        ]
                                      }`
                                    : props.t("Unlimited")}
                                </td>
                              );
                            })}
                          </tr>
                        }
                      </React.Fragment>
                      <React.Fragment>
                        {sellVideo ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Sell Uploaded Videos")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.sell_videos == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {sellAudio ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Sell Audio")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.sell_audios == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {donationVideo ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Get Donation on Videos")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.get_donation == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Video Monetization")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.monetization == 1 ? (
                                    <span className="tick">
                                      <span
                                        className="material-icons"
                                        data-icon="check"
                                      ></span>
                                    </span>
                                  ) : (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        }
                      </React.Fragment>

                      <React.Fragment>
                        {channelEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Channel")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_channel != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.channel_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} channel(s)",
                                      { limit: result.channel_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {moviesEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Movies & Series")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_movies != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.movies_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} movie(s)/series",
                                      { limit: result.movies_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {blogEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Blog")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_blogs != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.blog_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} blog(s)",
                                      { limit: result.blog_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {playlistEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Playlist")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_playlist != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.playlist_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} playlist(s)",
                                      { limit: result.playlist_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                        {audioEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Audio")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_audio != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.audio_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} audio(s)",
                                      { limit: result.audio_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                      <React.Fragment>
                        {adsEnable == 1 ? (
                          <tr>
                            <td className="pricing-heading">
                              {props.t("Create Advertisement")}
                            </td>
                            {state.packages.map((result) => {
                              return (
                                <td key={result.package_id}>
                                  {result.create_advertisement != 1 ? (
                                    <span className="notick">
                                      <span
                                        className="material-icons"
                                        data-icon="close"
                                      ></span>
                                    </span>
                                  ) : result.ad_create_limit != 0 ? (
                                    `${props.t(
                                      "Create {{limit}} advertisement(s)",
                                      { limit: result.ad_create_limit }
                                    )}`
                                  ) : (
                                    props.t("Unlimited")
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </React.Fragment>
                    </tbody>
                  </table>

                  {/* {
                                   // state.type == "month" ? 
                                        monthly
                                   // : 
                                   //     state.type == "year" ? 
                                   //         yearly
                                   //     :
                                   //         oneTime
                                } */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Index;
