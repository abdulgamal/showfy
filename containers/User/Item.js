import React, { useReducer, useEffect, useRef } from "react";
import Image from "../Image/Index";
import Link from "../../components/Link/index";
import SocialShare from "../SocialShare/Index";
import ShortNumber from "short-number";
import Like from "../Like/Index";
import Favourite from "../Favourite/Index";
import Dislike from "../Dislike/Index";
import Subscribe from "../User/Follow";
import Translate from "../../components/Translate/Index";

const Item = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      member: props.member,
    }
  );
  useEffect(() => {
    if (state.member != props.member) {
      setState({ member: props.member });
    }
  }, [props]);

  return props.pageData.appSettings.member_advanced_grid != 1 ? (
    <div className="member-block">
      <div className="member-img-block">
        <Link
          href="/member"
          customParam={`id=${state.member.username}`}
          as={`/${state.member.username}`}
        >
          <a onClick={props.closePopUp}>
            <Image
              title={state.member.displayname}
              image={state.member.avtar}
              imageSuffix={props.pageData.imageSuffix}
              siteURL={props.pageData.siteURL}
            />
          </a>
        </Link>
        <div className="lbletop">
          {props.pageData.appSettings["users_featuredlabel"] == 1 &&
          props.pageData.appSettings["member_featured"] == 1 &&
          state.member.is_featured == 1 ? (
            <span
              className="lbl-Featured"
              title={Translate(props, "Featured Member")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-award"
              >
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </span>
          ) : null}
          {props.pageData.appSettings["users_sponsoredLabel"] == 1 &&
          props.pageData.appSettings["member_sponsored"] == 1 &&
          state.member.is_sponsored == 1 ? (
            <span
              className="lbl-Sponsored"
              title={Translate(props, "Sponsored Member")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-award"
              >
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </span>
          ) : null}
          {props.pageData.appSettings["users_hotLabel"] == 1 &&
          props.pageData.appSettings["member_hot"] == 1 &&
          state.member.is_hot == 1 ? (
            <span
              className="lbl-Hot"
              title={Translate(props, "Hot Member")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-award"
              >
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </span>
          ) : null}
        </div>
      </div>
      <Link
        href="/member"
        customParam={`id=${state.member.username}`}
        as={`/${state.member.username}`}
      >
        <a className="name" onClick={props.closePopUp}>
          <React.Fragment>
            {state.member.displayname}
            {props.pageData.appSettings["member_verification"] == 1 &&
            state.member.verified == 1 ? (
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

      <div className="member-content">
        <div className="member-stats">
          {props.pageData.appSettings["users_views"] == "1" ? (
            <span>
              {`${ShortNumber(
                state.member.view_count ? state.member.view_count : 0
              )}`}{" "}
              {props.t("view_count", {
                count: state.member.view_count
                  ? state.member.view_count
                  : 0,
              })}
            </span>
          ) : null}
          {props.pageData.appSettings["users_views"] == "1" &&
          props.pageData.appSettings["users_followers"] == "1" ? (
            <span className="seprater">|</span>
          ) : null}
          {props.pageData.appSettings["users_followers"] == "1" ? (
            <span>
              {`${ShortNumber(
                state.member.follow_count
                  ? state.member.follow_count
                  : 0
              )}`}{" "}
              {props.t("follow_count", {
                count: state.member.follow_count
                  ? state.member.follow_count
                  : 0,
              })}
            </span>
          ) : null}
        </div>
        {props.pageData.appSettings["users_follow"] == 1 && !props.dontShowSubscribe ? (
          <Subscribe
            {...props}
            className="follwbtn"
            type="members"
            user={state.member}
            user_id={state.member.user_id}
          />
        ) : null}
        <div className="LikeDislikeWrap">
          <ul className="LikeDislikeList">
            {props.pageData.appSettings["users_like"] == 1 ? (
              <li>
                <Like
                  icon={true}
                  {...props}
                  like_count={state.member.like_count}
                  item={state.member}
                  type="member"
                  id={state.member.user_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["users_dislike"] == 1 ? (
              <li>
                <Dislike
                  icon={true}
                  {...props}
                  dislike_count={state.member.dislike_count}
                  item={state.member}
                  type="member"
                  id={state.member.user_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["users_favourite"] == 1 ? (
              <li>
                <Favourite
                  icon={true}
                  {...props}
                  favourite_count={state.member.favourite_count}
                  item={state.member}
                  type="member"
                  id={state.member.user_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["users_share"] == 1 ? (
              <SocialShare
                {...props}
                hideTitle={true}
                buttonHeightWidth="30"
                url={`/${state.member.username}`}
                title={state.member.displayname}
                imageSuffix={props.pageData.imageSuffix}
                media={state.member.avtar}
              />
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  ) : (
    <div className="ThumbBox-wrap member-container">
      <Link
        href="/member"
        customParam={`id=${state.member.username}`}
        as={`/${state.member.username}`}
      >
        <a className="ThumbBox-link" onClick={props.closePopUp}>
          <div className="ThumbBox-coverImg">
            <span>
              <Image
                title={state.member.displayname}
                image={state.member.avtar}
                imageSuffix={props.pageData.imageSuffix}
                siteURL={props.pageData.siteURL}
              />
            </span>
          </div>
        </a>
      </Link>
      <div className="labelBtn">
        {props.pageData.appSettings["users_featuredlabel"] == 1 &&
        props.pageData.appSettings["member_featured"] == 1 &&
        state.member.is_featured == 1 ? (
          <span
            className="lbl-Featured"
            title={Translate(props, "Featured Member")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-award"
            >
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
          </span>
        ) : null}
        {props.pageData.appSettings["users_sponsoredLabel"] == 1 &&
        props.pageData.appSettings["member_sponsored"] == 1 &&
        state.member.is_sponsored == 1 ? (
          <span
            className="lbl-Sponsored"
            title={Translate(props, "Sponsored Member")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-award"
            >
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
          </span>
        ) : null}
        {props.pageData.appSettings["users_hotLabel"] == 1 &&
        props.pageData.appSettings["member_hot"] == 1 &&
        state.member.is_hot == 1 ? (
          <span className="lbl-Hot" title={Translate(props, "Hot Member")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-award"
            >
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
          </span>
        ) : null}
      </div>
      <div className="ThumbBox-Title hide-on-expand">
        <div className="title ellipsize2Line">
          <h4 className="name m-0">
            {
              <React.Fragment>
                {state.member.displayname}
                {props.pageData.appSettings["member_verification"] == 1 &&
                state.member.verified == 1 ? (
                  <span
                    className="verifiedUser"
                    title={Translate(props, "verified")}
                  >
                    <span className="material-icons" data-icon="check"></span>
                  </span>
                ) : null}
              </React.Fragment>
            }
          </h4>
        </div>
      </div>
      <div className="ItemDetails">
        <div className="d-flex justify-content-between VdoTitle ">
          <Link
            href="/member"
            customParam={`id=${state.member.username}`}
            as={`/${state.member.username}`}
          >
            <a
              className="ThumbBox-Title-expand d-flex align-items-center"
              onClick={props.closePopUp}
            >
              <div className="title ellipsize2Line">
                <h4 className="name m-0">
                  {
                    <React.Fragment>
                      {state.member.displayname}
                      {props.pageData.appSettings["member_verification"] ==
                        1 && state.member.verified == 1 ? (
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
                  }
                </h4>
              </div>
            </a>
          </Link>
        </div>
        <div className="Vdoinfo d-flex flex-column">
          <span className="videoViewDate">
            {props.pageData.appSettings["users_views"] == "1" ? (
              <span>
                {`${ShortNumber(
                  state.member.view_count
                    ? state.member.view_count
                    : 0
                )}`}{" "}
                {props.t("view_count", {
                  count: state.member.view_count
                    ? state.member.view_count
                    : 0,
                })}
              </span>
            ) : null}
            {props.pageData.appSettings["users_views"] == "1" &&
            props.pageData.appSettings["users_followers"] == "1" ? (
              <span className="seprater">|</span>
            ) : null}
            {props.pageData.appSettings["users_followers"] == "1" ? (
              <span>
                {`${ShortNumber(
                  state.member.follow_count
                    ? state.member.follow_count
                    : 0
                )}`}{" "}
                {props.t("follow_count", {
                  count: state.member.follow_count
                    ? state.member.follow_count
                    : 0,
                })}
              </span>
            ) : null}
          </span>
        </div>
        <div className="cn-subscribe">
          {props.pageData.appSettings["users_follow"] == 1 && !props.dontShowSubscribe ? (
            <Subscribe
              {...props}
              hideButton={true}
              className="subscribe"
              type="members"
              user={state.member}
              user_id={state.member.user_id}
            />
          ) : null}
        </div>
        <div className="likeDislike-Wrap mt-2">
          <ul className="likeDislike-List">
            {props.pageData.appSettings["users_like"] == 1 ? (
              <li>
                <Like
                  icon={true}
                  {...props}
                  like_count={state.member.like_count}
                  item={state.member}
                  type="member"
                  id={state.member.user_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["users_dislike"] == 1 ? (
              <li>
                <Dislike
                  icon={true}
                  {...props}
                  dislike_count={state.member.dislike_count}
                  item={state.member}
                  type="member"
                  id={state.member.user_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["users_favourite"] == 1 ? (
              <li>
                <Favourite
                  icon={true}
                  {...props}
                  favourite_count={state.member.favourite_count}
                  item={state.member}
                  type="member"
                  id={state.member.user_id}
                />
                {"  "}
              </li>
            ) : null}
            {props.pageData.appSettings["users_share"] == 1 ? (
              <SocialShare
                {...props}
                hideTitle={true}
                buttonHeightWidth="30"
                url={`/${state.member.username}`}
                title={state.member.displayname}
                imageSuffix={props.pageData.imageSuffix}
                media={state.member.avtar}
              />
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Item;
