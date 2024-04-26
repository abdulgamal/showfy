import React from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import axios from "../../axios-orders"

const LocaleSwitcher = (props) => {
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const changeLanguage = (code,is_rtl) => {    
    setLanguage(code,is_rtl)
  }
  const [ cookie, setCookie ] = useCookies(['NEXT_LOCALE']);


  const setLanguage = (code,is_rtl) => {
    $('html').attr('dir',is_rtl ? "rtl" : "ltr");
    //setTimeout(() => {
      $('html').attr('lang',code);
    //}, 1000);
    let CDN_URL_FOR_STATIC_RESOURCES = props.pageData.CDN_URL_FOR_STATIC_RESOURCES ? props.pageData.CDN_URL_FOR_STATIC_RESOURCES : ""
    if(is_rtl){
      let RTLlink = `<link id="bootstrap-link-rtl" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.rtl.min.css" rel="stylesheet" />`;
      $(RTLlink).insertAfter("#bootstrap-link");
      let link = `<link id="custom-rtl-link" href="${CDN_URL_FOR_STATIC_RESOURCES}/static/css/rtl.style.css" rel="stylesheet" />`;
      $(link).insertAfter("#custom-responsive-link");
    }else{
      $("#custom-rtl-link").remove();
      $("#bootstrap-link-rtl").remove();
      $("#bootstrap-link").attr("href",'https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css');
    }
    
    const formData = new FormData()
    formData.append('code', code)            
    let url = '/members/language'
    props.changeLanguage(code)
    axios.post(url, formData)
        .then(response => {
          if(cookie.NEXT_LOCALE !== code){
            setCookie("NEXT_LOCALE", code, { path: "/",maxAge:31536000 });
          }
          router.push({ pathname, query }, asPath, { locale: code });
    })
  }
  const getSelectedLanguage = () => {
    let language =  props.pageData.languages.find((elem) => {
      return props.pageData.initialLanguage == elem.code
    })
    return language ? language : ""
  }
    if (!props.pageData.languages || props.pageData.languages.length < 2) {
      return null
    }
    const { t } = props;
    return (
      <li className="nav-item dropdown">
        <a className="nav-link" href="#" id="navbarDropdown"
          role="button" data-bs-toggle="dropdown" aria-haspopup="true"
          aria-expanded="false">
          <span className={`flag-icon ${getSelectedLanguage().class}`}> </span>  {t(getSelectedLanguage().title)}
          </a>
        <ul className="dropdown-menu dropdown-menu-right languageListWrap" aria-labelledby="navbarDropdown">
          {
            props.pageData.languages.map(language => {
              return (
                <li key={language['code']}>
                  <a className="dropdown-item languageList" href="#" onClick={(e) => {e.preventDefault();changeLanguage(language.code,language.is_rtl)}}><span className={`flag-icon ${language.class}`}> </span>  {t(`${language.title}`)}</a>
                </li>
              )
            })
          }
        </ul>
      </li>
    );
}

export default LocaleSwitcher