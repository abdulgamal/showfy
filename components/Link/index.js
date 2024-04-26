import React from "react";
import NextLink from "next/link";
import { withRouter } from "next/router"

const Link = (props) => {
  const { children, href, customParam, as } = props;
  if ((href && href == "javascript:;") || href == "javascript:void(0)") {
    return children;
  }
  // href={href+(customParam ? "?"+customParam : "")}

  let app_url = ""
    if(typeof window != "undefined"){
      app_url = window.location.protocol+"//"+window.location.host
    }else{
      app_url = `${process.env.PUBLIC_URL}`
    }

   
    let hrefPath = props.router.asPath
    if(app_url+hrefPath == as || hrefPath == as) {
      const handleClick = (e) => {
        e.preventDefault();
        window.scrollTo(0, 0)
      }
      return <NextLink href={href} passHref legacyBehavior >
          { React.cloneElement( children, { onClick: handleClick } ) }
      </NextLink>
    }
    
  return (
    <NextLink passHref legacyBehavior href={props.as ?? href}>
      {children}
    </NextLink>
  );
};
export default withRouter(Link);