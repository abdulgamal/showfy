const LanguageJOSN = require("./temporary/cache/languages.json")
const OTHER_LANGUAGES = LanguageJOSN['others'];
const path = require('path')

module.exports = {
    i18n: {
      // debug: process.env.NODE_ENV === 'development',
      // all the locales supported in the application
      locales: OTHER_LANGUAGES.concat([LanguageJOSN["default"]]), 
      // the default locale to be used when visiting
      // a non-localized route (e.g. `/about`)   
      defaultLocale: LanguageJOSN["default"],
    //   localePath:"./public/static/locales"
    //   fallbackLng: LanguageJOSN["default"],
    //   ns: "common",
    //   backend: {
    //     loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}`
    // },
    },
    poweredByHeader:false,
}