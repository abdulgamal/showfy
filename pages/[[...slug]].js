import React from "react";
import dynamic from "next/dynamic";
import axios from "../axios-main";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../hoc/Layout/Layout";
import PageNotFound from "../containers/Error/PageNotFound";
import PermissionError from "../containers/Error/PermissionError";
import Login from "../containers/Login/Index";
import Maintanance from "../containers/Error/Maintenance";

const DynamicImport = (name) => dynamic(() => import(`../pagesData/${name}`),{
  ssr: false,
});
function Page(props) {
  let page_type = props.pageData.page_type ?? "index";
  if (props.pagenotfound) {
    page_type = "page-not-found";
  }
  

  let Page = DynamicImport(page_type);
  let customParams = {};

  return (
    <Layout {...props} {...customParams}>
      <React.Fragment>
        {props.pagenotfound ? (
          <PageNotFound {...props} {...customParams} />
        ) : props.user_login ? (
          <Login {...props} {...customParams} />
        ) : props.permission_error ? (
          <PermissionError {...props} {...customParams} />
        ) : props.maintanance ? (
          <Maintanance {...props} />
        ) : (
          <Page {...props} {...customParams} />
        )}
      </React.Fragment>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  // cache response
  // context.res?.setHeader(
  //   "cache-control",
  //   "public, s-maxage=10, stale-while-revalidate=59"
  // );
  context.res?.setHeader(
    "cache-control",
    'private, no-cache, no-store, must-revalidate'
  );

  let userAgent;
  userAgent = context.req?.headers["user-agent"];
  let isMobile = false;
  let IEBrowser = false;
  if (userAgent) {
    isMobile = Boolean(
      userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      )
    );
    IEBrowser =
      context.req?.headers["user-agent"] &&
      (context.req?.headers["user-agent"].indexOf("MSIE") >= 0 ||
        context.req?.headers["user-agent"].indexOf("Trident") >= 0);
  }
  let subPath = "/";
  if (context.params.slug) {
    subPath = "/" + context.params.slug.join("/");
  }
  context.query.fromWebsite = true;
  if (context.query) {
    delete context.query.slug;
  }
  if (process.env.NODE_ENV !== "production")
    console.log("===== PATH: ", subPath, " ============= ", context.locale);

  const result = await axios
    .get(subPath, {
      params: {...context.query,siteLocale:context.locale},
      withCredentials: true,
      headers: {
        Cookie: context.req?.headers?.cookie ?? "",
      },
    })
    .catch((err) => {
      console.log("error axios");
    });
  let data = {...result.data};
  if (!data) data = {};
  if (data.error) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
  if (data.redirect) {
    return {
      redirect: {
        permanent: false,
        destination: data.url,
      },
    };
  }
  if (data.logout) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  data.IEBrowser = IEBrowser;
  data.isMobile = isMobile;
  let responseData = {
    pageData: data,
    initialLanguage: data.initialLanguage,
    ...(await serverSideTranslations(data.initialLanguage, "common")),
  };
  let page_type = data.page_type ?? "index";
  let customParams = {}
  if (
    page_type == "dashboard" ||
    page_type == "create-movie" ||
    page_type == "create-series" ||
    page_type == "embed" ||
    page_type == "search" ||
    page_type == "watch"
  )
    customParams.hideSmallMenu = true;

  if (page_type == "artist" || page_type == "cast-and-crew")
    customParams.artistView = true;

  if (page_type == "channel" || page_type == "channelView")
    customParams.channelView = true;

  if (page_type == "create-livestreaming") customParams.liveStreaming = true;

  if (page_type == "embed") {
    customParams.videoView = true;
    customParams.embedVideo = true;
  }
  if (page_type == "watch") {
    customParams.videoView = true;
  }
  if (page_type == "signup") {
    customParams.signButtonHide = true;
  }
  if (page_type == "forgot-verify" || page_type == "login") {
    customParams.loginButtonHide = true;
  }

  if (
    page_type == "forgot" ||
    page_type == "login" ||
    page_type == "signup" ||
    page_type == "verify-account"
  ) {
    customParams.redirectLogin = true;
  }
  if (page_type == "maintenance") {
    customParams.maintenance = true;
  }

  if (page_type == "messanger") {
    customParams.chatMessages = true;
  }
  data.custompageParams = customParams
  if (data.pagenotfound) responseData.pagenotfound = data.pagenotfound;
  if (data.user_login) responseData.user_login = data.user_login;
  if (data.permission_error)
    responseData.permission_error = data.permission_error;
  if (data.maintanance) responseData.maintanance = data.maintanance;

  // Pass data to the page via props
  return { props: responseData };
}

export default Page;
