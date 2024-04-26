import moment from "moment-timezone";
import React from "react";
import TimeAgo from "timeago-react";
import { register } from "timeago.js";

const Timeago = (props) => {
  var language = props.initialLanguage;
 
  if (typeof window != "undefined") {
    language = document.getElementsByTagName("html")[0].getAttribute("lang");
  }

  // if(language != "en"){
  //     try{
  //         register(language, require("timeago.js/lib/lang/"+language+".js").default);
  //     }catch(err){
  //         //silence
  //     }
  // }

  const SECONDS = 60;
  const MINUTES = 60;
  const HOURS = 24;
  const SECONDS_IN_DAY = HOURS * MINUTES * SECONDS;

  register(language ?? "en", (number, index, total_sec) => {
    // Between 105s - 120s, round up to 2 minutes
    // Won’t work for already mounted components because won’t update between 60-120s
    if (index === 2 && total_sec >= 105) {
      return [props.t("2 minutes ago"), props.t("in 2 minutes")];
    }

    // 1-6 days ago should be based on actual days of the week (from 0:00 - 23:59)
    if (index === 6 || index === 7) {
      // Calculate seconds since midnight for right now
      const now = new Date();
      const secondsSinceMidnight =
        now.getSeconds() +
        now.getMinutes() * SECONDS +
        now.getHours() * MINUTES * SECONDS;

      // Subtract seconds since midnight from total_sec, divide by seconds in a day, round down
      // Result is off-by-one number of days since datetime (unless time was at midnight)
      const daysFloored = Math.floor(
        (total_sec - secondsSinceMidnight) / SECONDS_IN_DAY
      );
      // If time was at midnight (00:00), it will divide evenly with SECONDS_IN_DAY
      // That will make it count as from the previous day, which we do not want
      const remainder = (total_sec - secondsSinceMidnight) % SECONDS_IN_DAY;
      const days = remainder >= 1 ? daysFloored + 1 : daysFloored;
      const noun = days === 1 ? props.t("day") : props.t("days");
      return [props.t(`{{days}} {{noun}} ago`,{days:days,noun:noun}), props.t(`in {{days}} {{noun}}`,{days:days,noun:noun})];
    }

    // For 9-12 days ago, Convert “1 week ago” to “__ days ago”
    // For 13 days, round it to “2 weeks ago”
    if (index === 8) {
      const days = Math.round(total_sec / SECONDS / MINUTES / HOURS);
      if (days > 8) {
        return days === 13
          ? [props.t("2 weeks ago"), props.t("in 2 weeks")]
          : [props.t(`{{days}} days ago`,{days:days}), props.t(`in {{days}} days`,{days:days})];
      }
    }

    return [
      [props.t("just now"), props.t("right now")],
      [props.t("%s seconds ago"), props.t("in %s seconds")],
      [props.t("1 minute ago"), props.t("in 1 minute")],
      [props.t("%s minutes ago"), props.t("in %s minutes")],
      [props.t("1 hour ago"), props.t("in 1 hour")],
      [props.t("%s hours ago"), props.t("in %s hours")],
      [props.t("1 day ago"), props.t("in 1 day")],
      [props.t("%s days ago"), props.t("in %s days")],
      [props.t("1 week ago"), props.t("in 1 week")],
      [props.t("%s weeks ago"), props.t("in %s weeks")],
      [props.t("1 month ago"), props.t("in 1 month")],
      [props.t("%s months ago"), props.t("in %s months")],
      [props.t("1 year ago"), props.t("in 1 year")],
      [props.t("%s years ago"), props.t("in %s years")],
    ][index];
  });

  let dateS = moment(props.children);
  let date = dateS
    .tz(
      props.pageData.defaultTimezone
        ? props.pageData.defaultTimezone
        : props.pageData.defaultTimezone
    )
    .format("YYYY-MM-DD HH:mm:ss ZZ");

  return <TimeAgo live={false} datetime={date} locale={language} />;
};

export default Timeago;
