import React, { useReducer, useEffect, useRef } from "react";
import Plans from "./Plans";
import Videos from "../Video/Videos";
import Blog from "../Blog/Blogs";
import Audio from "../Audio/Browse";
import Image from "../Image/Index";
import Link from "../../components/Link/index";
import Timeago from "../Common/Timeago";
import Currency from "../Upgrade/Currency";
import ProfileTabe from "./ProfileTabs";
import SocialShare from "../SocialShare/Index";
import Translate from "../../components/Translate/Index";

const Patreon = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      styles: {
        visibility: "hidden",
        overflow: "hidden",
      },
      showMore: false,
      showMoreText: "See more",
      userSubscription: props.userSubscription,
      userSubscriptionID: props.userSubscriptionID,
      member: props.member,
      deletePlan: props.deletePlan,
      planChange: props.planChange,
      plans: props.plans,
      homeData: props.homeData,
    }
  );
  useEffect(() => {
    if (
      props.userSubscription != state.userSubscription ||
      props.userSubscriptionID != state.userSubscriptionID ||
      props.member != state.member ||
      props.plans != state.plans
    ) {
      let updatedState = {
        userSubscription: props.userSubscription,
        userSubscriptionID: props.userSubscriptionID,
        member: props.member,
        deletePlan: props.deletePlan,
        planChange: props.planChange,
        userSubscription: props.userSubscription,
        plans: props.plans,
      };
      if (props.member != state.member) {
        updatedState["homeData"] = props.homeData;
        updatedState.styles = {
          visibility: "hidden",
          overflow: "hidden",
        };
        updatedState.showMore = false;
        updatedState.showMoreText = "See more";
      }
      setTimeout(() => {
        componentDidMount();
      }, 200);
      return updatedState;
    }
  }, []);
  const componentDidMount = () => {
    if (state.member) {
      if ($("#memberDescription").height() > 200) {
        setState({
          showMore: true,
          styles: {
            visibility: "visible",
            overflow: "hidden",
            height: "200px",
          },
          collapse: true,
        });
      } else {
        setState({
          showMore: false,
          styles: { visibility: "visible", height: "auto" },
        });
      }
    }
  };
  useEffect(() => {
    componentDidMount();
  }, []);

  const showMore = (e) => {
    e.preventDefault();
    let showMoreText = "";
    let styles = {};
    if (state.collapse) {
      showMoreText = Translate(props, "Show less");
      styles = { visibility: "visible", overflow: "visible" };
    } else {
      showMoreText = Translate(props, "Show more");
      styles = { visibility: "visible", overflow: "hidden", height: "200px" };
    }
    setState({
      
      styles: styles,
      showMoreText: showMoreText,
      collapse: !state.collapse,
    });
  };
  const updateParentItems = (type, subType, items) => {
    let homeData = { ...state.homeData };
    if (type == "blogs") {
      if (state.blogs == "view") {
        homeData["most_latest_blogs"] = items;
        homeData["most_latest_blogs"].forEach((item) => {
          const fitems = [...homeData["latest_blogs"]];
          const itemIndex = fitems.findIndex(
            (p) => p["blog_id"] == item.blog_id
          );
          if (itemIndex > -1) {
            homeData["latest_blogs"][itemIndex] = item;
          }
        });
      } else {
        homeData["latest_blogs"] = items;
        homeData["latest_blogs"].forEach((item) => {
          const fitems = [...homeData["most_latest_blogs"]];
          const itemIndex = fitems.findIndex(
            (p) => p["blog_id"] == item.blog_id
          );
          if (itemIndex > -1) {
            homeData["most_latest_blogs"][itemIndex] = item;
          }
        });
      }
    } else if (type == "audio") {
      if (state.audios == "view") {
        homeData["most_latest_audio"] = items;
        homeData["most_latest_audio"].forEach((item) => {
          const fitems = [...homeData["latest_audio"]];
          const itemIndex = fitems.findIndex(
            (p) => p["audio_id"] == item.audio_id
          );
          if (itemIndex > -1) {
            homeData["latest_audio"][itemIndex] = item;
          }
        });
      } else {
        homeData["latest_audio"] = items;
        homeData["latest_audio"].forEach((item) => {
          const fitems = [...homeData["most_latest_audio"]];
          const itemIndex = fitems.findIndex(
            (p) => p["audio_id"] == item.audio_id
          );
          if (itemIndex > -1) {
            homeData["most_latest_audio"][itemIndex] = item;
          }
        });
      }
    } else if (type == "videos") {
      if (subType == "paid") {
        if (state.sellvideos == "view") {
          homeData["most_sell_videos"] = items;
          homeData["most_sell_videos"].forEach((item) => {
            const fitems = [...homeData["sell_videos"]];
            const itemIndex = fitems.findIndex(
              (p) => p["video_id"] == item.video_id
            );
            if (itemIndex > -1) {
              homeData["sell_videos"][itemIndex] = item;
            }
          });
        } else {
          homeData["sell_videos"] = items;
          homeData["sell_videos"].forEach((item) => {
            const fitems = [...homeData["most_sell_videos"]];
            const itemIndex = fitems.findIndex(
              (p) => p["video_id"] == item.video_id
            );
            if (itemIndex > -1) {
              homeData["most_sell_videos"][itemIndex] = item;
            }
          });
        }
      } else {
        if (state.videos == "view") {
          homeData["most_latest_videos"] = items;
          homeData["most_latest_videos"].forEach((item) => {
            const fitems = [...homeData["latest_videos"]];
            const itemIndex = fitems.findIndex(
              (p) => p["video_id"] == item.video_id
            );
            if (itemIndex > -1) {
              homeData["latest_videos"][itemIndex] = item;
            }
          });
        } else {
          homeData["latest_videos"] = items;
          homeData["latest_videos"].forEach((item) => {
            const fitems = [...homeData["most_latest_videos"]];
            const itemIndex = fitems.findIndex(
              (p) => p["video_id"] == item.video_id
            );
            if (itemIndex > -1) {
              homeData["most_latest_videos"][itemIndex] = item;
            }
          });
        }
      }
    }
    setState({  homeData: homeData });
  };
  const linkify = (inputText) => {
    inputText = inputText.replace(/&lt;br\/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br \/&gt;/g, " <br/>");
    inputText = inputText.replace(/&lt;br&gt;/g, " <br/>");
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(
      replacePattern1,
      '<a href="$1" target="_blank" rel="nofollow">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 =
      /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1" rel="nofollow">$1</a>'
    );

    return replacedText;
  };

  return (
    <div className="new_design">
      <div className="row">
        <div className="col-xl-9">
          <ProfileTabe
            {...props}
            newDesign={true}
            pushTab={props.pushTab}
            member={state.member}
            state={props.stateHome}
          />

          <div className="details-tab">
            <div className="tab-content">
              <div className="details-tab-box">
                <div className="social-share">
                  {props.t("Share this page and support {{name}}!", {
                    name: state.member.displayname,
                  })}
                  <ul className="share">
                    <SocialShare
                      countItems={30}
                      {...props}
                      hideTitle={true}
                      url={`/${state.member.username}`}
                      title={state.member.displayname}
                      imageSuffix={props.pageData.imageSuffix}
                      media={state.member.avtar}
                    />
                  </ul>
                </div>
                {state.member.about && state.member.about != "" ? (
                  <div className="about">
                    {
                      <div
                        id="memberDescription"
                        style={{ ...state.styles, whiteSpace: "pre-line" }}
                        dangerouslySetInnerHTML={{
                          __html: linkify(state.member.about),
                        }}
                      ></div>
                    }
                    {state.showMore ? (
                      <div className="MemberDetailsDescpBtn text-center">
                        <a
                          href="#"
                          onClick={showMore.bind(this)}
                          className="btn btn-danger btn-sm"
                        >
                          {Translate(props, state.showMoreText)}
                        </a>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="social-profile">
                  {state.member.facebook ? (
                    <a
                      className="btn btn-danger btn-sm"
                      href={state.member.facebook}
                      target="_blank"
                    >
                      <span
                        className="material-icons-outlined"
                        data-icon="link"
                      ></span>
                      {props.t("Facebook")}
                    </a>
                  ) : null}

                  {state.member.instagram ? (
                    <a
                      className="btn btn-danger btn-sm"
                      href={state.member.instagram}
                      target="_blank"
                    >
                      <span
                        className="material-icons-outlined"
                        data-icon="link"
                      ></span>
                      {props.t("Instagram")}
                    </a>
                  ) : null}
                  {state.member.pinterest ? (
                    <a
                      className="btn btn-danger btn-sm"
                      href={state.member.pinterest}
                      target="_blank"
                    >
                      <span
                        className="material-icons-outlined"
                        data-icon="link"
                      ></span>
                      {props.t("Pinterest")}
                    </a>
                  ) : null}
                  {state.member.twitter ? (
                    <a
                      className="btn btn-danger btn-sm"
                      href={state.member.twitter}
                      target="_blank"
                    >
                      <span
                        className="material-icons-outlined"
                        data-icon="link"
                      ></span>
                      {props.t("Twitter")}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="infinite-scroll-component details-tab-box mt-3">
            <div className="titleSort mb-3">
              <h4 className="title">{props.t("Videos")}</h4>
              {state.homeData.latest_videos &&
              state.homeData.latest_videos.length > 0 ? (
                <div className="sort">
                  <div className="form-group">
                    <select
                      className="form-control form-control-sm form-select"
                      onChange={(e) => {
                        setState({ videos: e.target.value });
                      }}
                      value={state.videos ? state.videos : "latest"}
                    >
                      <option value="latest">{props.t("Latest Videos")}</option>
                      <option value="view">
                        {props.t("Most Viewed Videos")}
                      </option>
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
            <Videos
              {...props}
              updateParentItems={updateParentItems}
              from_user_profile={true}
              videos={
                !state.videos || state.videos == "latest"
                  ? state.homeData.latest_videos
                  : state.homeData.most_latest_videos
              }
              pagging={false}
            />
            {state.homeData.latest_videos &&
            state.homeData.latest_videos.length > 0 ? (
              <div className="viewmore-subs-btn align-items-center d-flex justify-content-center">
                <a
                  href="#"
                  className="align-items-center d-flex btn"
                  onClick={(e) => {
                    e.preventDefault();
                    props.pushTab("videos");
                  }}
                >
                  {props.t("All Videos")}
                  <span
                    className="material-icons-outlined"
                    data-icon="arrow_right"
                  ></span>
                </a>
              </div>
            ) : null}
          </div>
          {state.homeData.latest_audio.length > 0 ? (
            <div className="infinite-scroll-component details-tab-box mt-3">
              <div className="titleSort mb-3">
                <h4 className="title">{props.t("Audio")}</h4>
                <div className="sort">
                  <div className="form-group">
                    <select
                      className="form-control form-control-sm form-select"
                      onChange={(e) => {
                        setState({ audios: e.target.value });
                      }}
                      value={state.audios ? state.audios : "latest"}
                    >
                      <option value="latest">{props.t("Latest Audio")}</option>
                      <option value="view">
                        {props.t("Most Viewed Audio")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <Audio
                {...props}
                updateParentItems={updateParentItems}
                from_user_profile={true}
                search={true}
                audios={
                  !state.audios || state.audios == "latest"
                    ? state.homeData.latest_audio
                    : state.homeData.most_latest_audio
                }
                pagging={false}
              />
              <div className="viewmore-subs-btn align-items-center d-flex justify-content-center">
                <a
                  href="#"
                  className="align-items-center d-flex btn"
                  onClick={(e) => {
                    e.preventDefault();
                    props.pushTab("audio");
                  }}
                >
                  {props.t("All Audio")}
                  <span
                    className="material-icons-outlined"
                    data-icon="arrow_right"
                  ></span>
                </a>
              </div>
            </div>
          ) : null}
          {state.homeData.latest_blogs.length > 0 ? (
            <div className="infinite-scroll-component details-tab-box mt-3">
              <div className="titleSort mb-3">
                <h4 className="title">{props.t("Blogs")}</h4>
                <div className="sort">
                  <div className="form-group">
                    <select
                      className="form-control form-control-sm form-select"
                      onChange={(e) => {
                        setState({ blogs: e.target.value });
                      }}
                      value={state.blogs ? state.blogs : "latest"}
                    >
                      <option value="latest">{props.t("Latest Blogs")}</option>
                      <option value="view">
                        {props.t("Most Viewed Blogs")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <Blog
                {...props}
                updateParentItems={updateParentItems}
                from_user_profile={true}
                blogs={
                  !state.blogs || state.blogs == "latest"
                    ? state.homeData.latest_blogs
                    : state.homeData.most_latest_blogs
                }
                pagging={false}
              />
              <div className="viewmore-subs-btn align-items-center d-flex justify-content-center">
                <a
                  href="#"
                  className="align-items-center d-flex btn"
                  onClick={(e) => {
                    e.preventDefault();
                    props.pushTab("blogs");
                  }}
                >
                  {props.t("All Blogs")}
                  <span
                    className="material-icons-outlined"
                    data-icon="arrow_right"
                  ></span>
                </a>
              </div>
            </div>
          ) : null}
          {state.homeData.sell_videos.length > 0 ? (
            <div className="infinite-scroll-component  details-tab-box mt-3">
              <div className="titleSort mb-3">
                <h4 className="title">{props.t("Paid Videos")}</h4>
                <div className="sort">
                  <div className="form-group">
                    <select
                      className="form-control form-control-sm form-select"
                      onChange={(e) => {
                        setState({ sellvideos: e.target.value });
                      }}
                      value={state.sellvideos ? state.sellvideos : "latest"}
                    >
                      <option value="latest">{props.t("Latest Videos")}</option>
                      <option value="view">
                        {props.t("Most Viewed Videos")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <Videos
                {...props}
                subTypeVideos="paid"
                updateParentItems={updateParentItems}
                from_user_profile={true}
                videos={
                  !state.sellvideos || state.sellvideos == "latest"
                    ? state.homeData.sell_videos
                    : state.homeData.most_sell_videos
                }
                pagging={false}
              />
              {state.homeData.sell_videos.length > 0 ? (
                <div className="viewmore-subs-btn align-items-center d-flex justify-content-center">
                  <a
                    href="#"
                    className="align-items-center d-flex btn"
                    onClick={(e) => {
                      e.preventDefault();
                      props.pushTab("paid");
                    }}
                  >
                    {props.t("All Paid Videos")}
                    <span
                      className="material-icons-outlined"
                      data-icon="arrow_right"
                    ></span>
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="col-xl-3">
          <div className="details-tab-box">
            <h4 className="heading mb-3">{props.t("Plans")}</h4>
            <Plans
              {...props}
              userPrifile={true}
              userSubscription={state.userSubscription}
              userSubscriptionID={state.userSubscriptionID}
              member={state.member}
              // deletePlan={deletePlan}
              // onChangePlan={planChange}
              user_id={state.member.user_id}
              plans={state.plans}
            />
          </div>
          {state.homeData.donation_videos &&
          state.homeData.donation_videos.length > 0 ? (
            <div className="card mx-auto comntcard details-tab-box mt-3">
              <h4 className="heading mb-3">{props.t("Donations")}</h4>
              <div className="card-body plancard">
                {state.homeData.donation_videos.map((item) => {
                  let userBalance = {};
                  userBalance["package"] = {
                    price: parseInt(item.donatePrice ? item.donatePrice : 0),
                  };
                  return (
                    <div className="sdbrTopComments-row" key={item.user_id}>
                      <div className="imgbox">
                        <Link
                          href="/member"
                          customParam={`id=${item.username}`}
                          as={`/${item.username}`}
                        >
                          <a>
                            <Image
                              className="img"
                              title={item.displayname}
                              image={item.avtar}
                              imageSuffix={props.pageData.imageSuffix}
                              siteURL={props.pageData.siteURL}
                            />
                          </a>
                        </Link>
                      </div>
                      <div className="content">
                        <Link
                          href="/member"
                          customParam={`id=${item.username}`}
                          as={`/${item.username}`}
                        >
                          <a className="UserName">
                            <React.Fragment>
                              {item.displayname}
                              {props.pageData.appSettings[
                                "member_verification"
                              ] == 1 && item.verified == 1 ? (
                                <span
                                  className="verifiedUser"
                                  title={Translate(props, "verified")}
                                >
                                  <span
                                    className="material-icons"
                                    data-icon="check"
                                  ></span>
                                </span>
                              ) : null}
                            </React.Fragment>
                          </a>
                        </Link>
                        <span>
                          <time className="text-muted">
                            <Timeago {...props}>{item.tip_date}</Timeago>
                          </time>
                        </span>
                        <div className="commentText">
                          {props.t("Donated: {{price}}", {
                            price: Currency({ ...props, ...userBalance }),
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Patreon;
