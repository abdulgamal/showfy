import React,{useReducer,useEffect} from 'react'
const {i18n} = require('../../next-i18next.config')
import Head from 'next/head';
import Script from 'next/script'
import Translate from '../../components/Translate/Index';

const Layout = React.memo((props) => {
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            pageInfo: props.pageData.pageInfo
        }
    );

    useEffect(() => {
        if(props.pageData.loggedInUserDetails)
            props.socket.emit('chatJoin', {id:props.pageData.loggedInUserDetails.user_id})
    },[])
    
    useEffect(() => {
        if(props.pageData && JSON.stringify(props.pageData.pageInfo) != JSON.stringify(state.pageInfo)){
            setState({pageInfo:props.pageData.pageInfo})
        }
    },[props.pageData])

    let videoDuration = ""
    let videoURL = ""
    const imageSuffix = props.pageData.imageSuffix
    if (props.videoView && props.pageData.video && props.pageData.video.completed == 1) {
        if (props.pageData.video.duration) {
            videoDuration = "PT"
            let duration = props.pageData.video.duration.split(":");
            videoDuration = videoDuration + duration[0] + "H"
            videoDuration = videoDuration + duration[1] + "M"
            videoDuration = videoDuration + duration[2] + "S"
        }

        if (props.pageData.video.type == 3) {
            let splitName = props.pageData.video.video_location.split('/')
            let fullName = splitName[splitName.length - 1]
            let videoName = fullName.split('_')[0]
            let path = "/upload/videos/video/"
            videoURL = imageSuffix + path + videoName + "_240p.mp4"
        } else if (props.pageData.video.type == 10 && props.pageData.video.is_livestreaming == 0 && props.pageData.liveStreamingURL) {
            videoURL = props.pageData.liveStreamingURL + "/" + props.pageData.video.code
        } else if (props.pageData.video.type == 9) {
            videoURL = props.pageData.video.code
        }
    }

    const generalInfo = state.pageInfo ? state.pageInfo : {}


    let isURL = false
    if (generalInfo.image) {
        const splitVal = generalInfo.image.split('/')
        if (splitVal[0] == "http:" || splitVal[0] == "https:") {
            isURL = true
        }
    }
    let customTags = null
    if(generalInfo.custom_tags){
        try{
            customTags = generalInfo.custom_tags.map((item,key) => {
                let metaTagInfo = {}
                item.forEach(metaInfo => {
                    metaTagInfo[metaInfo[0]] = metaInfo[1];
                })
                return <meta {...metaTagInfo} key={key} />
            })
        }catch(err){
            //silence
        }
    }
    
    
    let CDN_URL_FOR_STATIC_RESOURCES = props.pageData.CDN_URL_FOR_STATIC_RESOURCES ? props.pageData.CDN_URL_FOR_STATIC_RESOURCES : ""
    
    CDN_URL_FOR_STATIC_RESOURCES = CDN_URL_FOR_STATIC_RESOURCES + props.pageData.subFolder
    let file_cache = "21983923"
    if(props.pageData.appSettings['file_cache']){
        file_cache = props.pageData.appSettings["file_cache"]
    }

    let player_type = ""
    if(props && props.pageData && props.pageData.appSettings.player_type){
        player_type = props.pageData.appSettings['player_type'] 
    }
    
    let razorpayEnabled = ""
    if(props && props.pageData && props.pageData.appSettings.razorpayEnabled){
        razorpayEnabled = 1
    }

    let flutterwaveEnabled = ""
    if(props && props.pageData && props.pageData.appSettings.flutterwaveEnabled){
        flutterwaveEnabled = 1
    }

    let cashfreeEnabled = ""
    if(props && props.pageData && props.pageData.appSettings.cashfreeEnabled){
        cashfreeEnabled = 1
    }

    return (
        <React.Fragment>
            {generalInfo ?
                <Head>
                    {generalInfo.title ?
                        <title>{Translate(props, generalInfo.title)}</title>
                        : null}
                    {generalInfo.description ?
                        <meta name="description" content={Translate(props, generalInfo.description)} />
                        : null}
                    {generalInfo.keywords ?
                        <meta name="keywords" content={generalInfo.keywords} />
                        : null}
                    {generalInfo.title ?
                        <meta property="og:title" content={Translate(props, generalInfo.title)} />
                        : null}
                    {generalInfo.description ?
                        <meta property="og:description" content={Translate(props, generalInfo.description)} />
                        : null}
                    {generalInfo.image ?
                        <meta property="og:image" content={(!isURL ? imageSuffix : "") + generalInfo.image} />
                        : null}
                    {generalInfo.image && generalInfo.imageWidth ?
                        <meta property="og:image:width" content={generalInfo.imageWidth} />
                        : null}
                    {generalInfo.image && generalInfo.imageHeight ?
                        <meta property="og:image:height" content={generalInfo.imageHeight} />
                        : null}
                    {generalInfo.title ?
                        <meta property="twitter:title" content={Translate(props, generalInfo.title)} />
                        : null}
                    {generalInfo.description ?
                        <meta property="twitter:description" content={Translate(props, generalInfo.description)} />
                        : null}
                    {generalInfo.image ?
                        <meta property="twitter:image" content={(!isURL ? imageSuffix : "") + generalInfo.image} />
                        : null}
                    {generalInfo.image ?
                        <meta name="twitter:card" content="summary" />
                        : null}

                    {
                        i18n.locales.length > 0 ? 
                            i18n.locales.map((lan,index) => {
                                return <link key={index} rel="alternate" hrefLang={lan} href={props.pageData.siteURL+"/"+lan+props.pageData.currentURL} />
                            })
                        : null
                    }
                    
                    {
                        props.pageData.appSettings["pwa_app_name"] ?
                            <React.Fragment>
                                <link rel='manifest' href={`${props.pageData.subFolder}manifest.json`} />
                                <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                                <meta name="apple-mobile-web-app-title" content={props.pageData.appSettings["pwa_app_name"]} />
                                <meta name="msapplication-TileColor" content={props.pageData.appSettings["pwa_app_bg_color"]} />
                                <meta name="theme-color" content={props.pageData.appSettings["pwa_app_theme_color"]} />
                                <meta name="msapplication-TileImage" content={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} />
                                <meta name="mobile-web-app-capable" content="yes" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} media="(device-width: 320px) and (device-height: 480px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_192"]} rel="icon" sizes="192x192" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="180x180" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_152"]} rel="apple-touch-icon" sizes="152x152" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_144"]} rel="apple-touch-icon" sizes="144x144" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon-precomposed" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_128"]} rel="apple-touch-icon-precomposed" sizes="128x128" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_128"]} rel="icon" sizes="128x128" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="120x120" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="114x114" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="76x76" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_72"]} rel="apple-touch-icon" sizes="72x72" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="apple-touch-icon" sizes="57x57" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="icon" sizes="32x32" />
                                <link href={imageSuffix + props.pageData.appSettings["pwa_icon_sizes_512"]} rel="icon" sizes="16x16" />
                            </React.Fragment>
                            : null
                    }
                    {
                        customTags ?
                            customTags
                        : null
                    }
                </Head>
                : null
            }

            {
                flutterwaveEnabled &&
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/flutterwave.js?v=${file_cache}`} strategy="afterInteractive" />
            }
            {
                cashfreeEnabled &&
                    <Script src={`https://sdk.cashfree.com/js/v3/cashfree.js?v=${file_cache}`} strategy="afterInteractive" />
            }
            {
                razorpayEnabled &&
                    <Script src={`https://checkout.razorpay.com/v1/checkout.js?v=${file_cache}`} strategy="afterInteractive" />
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/mediaelement.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                : 
                null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/speed/speed.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                : null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/speed/speed-i18n.js?v=${file_cache}`} strategy="beforeInteractive" />
                : null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/jump-forward/jump-forward.min.js?v=${file_cache}`} strategy="beforeInteractive" />						
                : null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/ads/ads.js?v=${file_cache}`} strategy="beforeInteractive" />
                : null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/ads/ads-i18n.js?v=${file_cache}`} strategy="beforeInteractive" />
                : null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/ads-vast-vpaid/ads-vast-vpaid.js?v=${file_cache}`} strategy="beforeInteractive" />
                : null
            }
            {
                player_type == "element" ? 
                <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/mediaelement/quality/quality.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                : null
            }
            <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery-3.4.1.min.js?v=${file_cache}`} strategy="beforeInteractive" />
            <Script src={`https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js`} strategy="beforeInteractive" />
            <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/custom/header.js?v=${file_cache}`} strategy="beforeInteractive" />	
            <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jQuery-1.9.1.js?v=${file_cache}`} strategy="beforeInteractive" />
            <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery.magnific-popup.js?v=${file_cache}`} strategy="beforeInteractive" />					
            <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery1.5.1.min.js?v=${file_cache}`} type="text/javascript" strategy="beforeInteractive"></Script>
            <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/jquery-ui.min.js?v=${file_cache}`} strategy="beforeInteractive"></Script>
            <Script src="https://googleads.github.io/videojs-ima/node_modules/video.js/dist/video.min.js" strategy="beforeInteractive"></Script>

            {
                player_type != "element" ? 
                <React.Fragment>
                    <Script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js" strategy="beforeInteractive" />
                    <Script src={`${CDN_URL_FOR_STATIC_RESOURCES ? CDN_URL_FOR_STATIC_RESOURCES : ""}static/scripts/videojs/videojs.ads.min.js?v=${file_cache}`} strategy="beforeInteractive" />
                    <Script src="https://googleads.github.io/videojs-ima/node_modules/videojs-contrib-ads/dist/videojs.ads.min.js" strategy="beforeInteractive" />
                    <Script src="https://googleads.github.io/videojs-ima/dist/videojs.ima.js" strategy="beforeInteractive" />
                </React.Fragment>
                : null
            }

            { 
                props && props.pageData && props.pageData.appSettings &&  props.pageData.appSettings['google_analytics_code'] ? 
                    <Script strategy="afterInteractive" dangerouslySetInnerHTML={{__html: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
                    ga('create', "${props.pageData.appSettings['google_analytics_code']}", 'auto');
                    ga('send', 'pageview');`}} />
                : null
            }
            
            {
                props.videoView && props.pageData.video && props.pageData.video.type == 3 ?
                    // <Head>
                        <React.Fragment>
                            <Script src="https://cdn.iframe.ly/embed.js"  strategy="afterInteractive" />
                        </React.Fragment>
                    // </Head>
                    : null
            } 

            {
                props.pageData.appSettings['advertisement_type'] == 2 ?
                    <React.Fragment>
                        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"  strategy="afterInteractive" />
                    </React.Fragment>
                    : null
            }

            {
                videoURL != "" ?
                        <Script type="application/ld+json" dangerouslySetInnerHTML={{
                            __html:
                                `{
                            "@context": "http://schema.org",
                            "@type": "VideoObject",
                            "name": "${props.pageData.video.title}",
                            "description": "${props.pageData.video.description}",
                            "thumbnailUrl":"${(!isURL ? imageSuffix : "") + generalInfo.image}",
                            "uploadDate": "${props.pageData.video.creation_date}",
                            "duration": "${videoDuration}",
                            "contentUrl": "${videoURL}"
                        }`
                        }} />
                    : null
            }
            {props.children}
        </React.Fragment>
    )
},(prevProps, nextProps) => {
    if (prevProps.pageData != nextProps.pageData) {
      return false;
    }
    return true;
  })

export default Layout