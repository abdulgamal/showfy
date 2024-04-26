import React from 'react'
import Document, { Head, Main, NextScript,Html } from 'next/document'
// import Script from 'next/script'
import i18nextConfig from '../next-i18next.config'
 
export default class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	  }	
	
	render() {
		let cdnURL = ""
		let isRTL = 0
		let languages = false
		let file_cache = "21983923"
		let player_type = ""
		if(i18nextConfig.i18n.locales.length > 1){
			languages = true
		}
		if(this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.isRTL){
			isRTL = this.props.__NEXT_DATA__.props.pageProps.pageData.isRTL
		}
		if(this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.CDN_URL_FOR_STATIC_RESOURCES){
			cdnURL = this.props.__NEXT_DATA__.props.pageProps.pageData.CDN_URL_FOR_STATIC_RESOURCES
		}
		let favicon = false
		if(this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.appSettings.favicon){
			favicon = this.props.__NEXT_DATA__.props.pageProps.pageData.imageSuffix + this.props.__NEXT_DATA__.props.pageProps.pageData.appSettings['favicon'] 
		}
		if(this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.appSettings.file_cache){
			file_cache =  this.props.__NEXT_DATA__.props.pageProps.pageData.appSettings['file_cache'] 
		}
		if(this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.appSettings.player_type){
			player_type = this.props.__NEXT_DATA__.props.pageProps.pageData.appSettings['player_type'] 
		}
		
		let subFolder = "/"

		if(this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData){
			subFolder = this.props.__NEXT_DATA__.props.pageProps.pageData.subFolder 
		}
		cdnURL = cdnURL + subFolder

		let theme = "white"
        if (this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.themeMode) {
            theme = this.props.__NEXT_DATA__.props.pageProps.pageData.themeMode
        }
		
		let googleFonts = ""
        if (this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData['cssValues']) {
            let url = 'https://fonts.googleapis.com/css?family=';
            const cssValues = this.props.__NEXT_DATA__.props.pageProps.pageData['cssValues']
            if(cssValues){
				if (theme == "dark" && cssValues["dark"]['font_style'] == "google") {
					const options = []
					options.push(cssValues['dark']['fontFamily_default'])
					options.push(cssValues['dark']['fontFamily_heading'])
					googleFonts = url + options.join("|")
				} else if (cssValues["white"]['font_style'] == "google") {
					const options = []
					options.push(cssValues['white']['fontFamily_default'])
					options.push(cssValues['white']['fontFamily_heading'])
					googleFonts = url + options.join("|")
				}
			}
        }
		const currentLocale =
		this.props.__NEXT_DATA__.locale ??
		i18nextConfig.i18n.defaultLocale
		return (

			<Html lang={currentLocale} subfolder={subFolder} dir={this.props.__NEXT_DATA__.props && this.props.__NEXT_DATA__.props.pageProps.pageData && this.props.__NEXT_DATA__.props.pageProps.pageData.isRTL ? "rtl" : "ltr"}>
				<Head>
					{
						favicon ? 
							<link rel="icon" href={favicon+`?v=${file_cache}`}/>
						: null
					}
					{
						googleFonts ?
							<link href={googleFonts} rel="stylesheet" />
						: null
					}
					<link href={`https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css`} rel="stylesheet" /> 
					<link href={`https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css`} rel="stylesheet" /> 
					<link id="bootstrap-link" href={`https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css`} rel="stylesheet" /> 
					{
						isRTL == 1 ?
							<link id="bootstrap-link-rtl" href={`https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.rtl.min.css`} rel="stylesheet" />
						: null
					}
					<link href={`${cdnURL ? cdnURL : ""}static/css/fontawesome/css/all.min.css?v=${file_cache}`} rel="stylesheet" />
					<link href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp" rel="stylesheet" />
					{
						languages ? 
							<link href="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.1.0/css/flag-icon.min.css" rel="stylesheet" />
					: null
					}
					<link href={`${cdnURL ? cdnURL : ""}static/css/style.css?v=${file_cache}`} rel="stylesheet" />
					<link href={`${cdnURL ? cdnURL : ""}static/css/stories.css?v=${file_cache}`} rel="stylesheet" />
					<link href={`${cdnURL ? cdnURL : ""}static/css/messanger.css?v=${file_cache}`} rel="stylesheet" />
					{/* <link href={`${cdnURL ? cdnURL : ""}static/css/swal.css?v=${file_cache}`} rel="stylesheet" /> */}
					
					<link id="custom-responsive-link" href={`${cdnURL ? cdnURL : ""}static/css/responsive.css?v=${file_cache}`} rel="stylesheet" />
					{
						isRTL == 1 ?
							<link id="custom-rtl-link" href={`${cdnURL ? cdnURL : ""}static/css/rtl.style.css?v=${file_cache}`} rel="stylesheet" />
						: null
					}
					{
						player_type == "element" ? 
							<link rel="stylesheet" href={`${cdnURL ? cdnURL : ""}static/scripts/mediaelement/mediaelement.min.css?v=${file_cache}`} />
						: null
					}
					{
						player_type != "element" ? 
							<link rel="stylesheet" href={`https://cdnjs.cloudflare.com/ajax/libs/videojs-resolution-switcher/0.4.2/videojs-resolution-switcher.min.css?v=${file_cache}`} />
						: 	null

					}
					{
						player_type == "element" ? 
						<link rel="stylesheet" href={`${cdnURL ? cdnURL : ""}static/scripts/mediaelement/speed/speed.min.css?v=${file_cache}`} />
						: null
					}
					{
						player_type == "element" ? 
						<link rel="stylesheet" href={`${cdnURL ? cdnURL : ""}static/scripts/mediaelement/jump-forward/jump-forward.min.css?v=${file_cache}`} />
						: null
					}
					{
						player_type == "element" ? 
						<link rel="stylesheet" href={`${cdnURL ? cdnURL : ""}static/scripts/mediaelement/ads/ads.min.css?v=${file_cache}`} />
							: null
					}
					{
						player_type == "element" ? 
						<link rel="stylesheet" href={`${cdnURL ? cdnURL : ""}static/scripts/mediaelement/quality/quality.min.css?v=${file_cache}`} />
						: null
					}
					<React.Fragment>
						<link rel="stylesheet" href={`https://googleads.github.io/videojs-ima/node_modules/video.js/dist/video-js.min.css?v=${file_cache}`} />
						<link rel="stylesheet" href="//googleads.github.io/videojs-ima/node_modules/videojs-contrib-ads/dist/videojs.ads.css" />
						<link rel="stylesheet" href="//googleads.github.io/videojs-ima/dist/videojs.ima.css" />
					</React.Fragment>
					
					<link href={`${cdnURL ? cdnURL : ""}static/css/magnific-popup.css?v=${file_cache}`} rel="stylesheet" />
					<link href={`${cdnURL ? cdnURL : ""}static/custom/header.css?v=${file_cache}`} rel="stylesheet" />
					<link rel="stylesheet" id="custom-color-white-css" href={`${cdnURL ? cdnURL : ""}static/css/variable_white.css?v=${file_cache}`} />
					{
						theme == "dark" ?
							<link id="custom-color-dark-css" href={`${cdnURL ? cdnURL : ""}static/css/variable_dark.css?v=${file_cache}`} rel="stylesheet" />
						: null
					}
					
				</Head>
				<body>
					<main>
						<Main />
						<NextScript />
					</main>
				</body>
			</Html>
		)
	}
}
