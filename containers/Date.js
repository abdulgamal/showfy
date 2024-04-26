import moment from 'moment-timezone';
const Timeago = (props,creation_date,initialLanguage,format,defaultTimezone) => {
    var language = initialLanguage
    if(typeof window != "undefined"){
        language = document.getElementsByTagName("html")[0].getAttribute("lang");
    }
    let dateS = moment(creation_date).locale(language ? language : props.pageData.initialLanguage )
    return dateS.tz(defaultTimezone).format(format ? format : 'dddd, MMMM Do YYYY')
}

export default Timeago