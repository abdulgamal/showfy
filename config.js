
let app_url = "";
let app_server = "";
let basePath = "/"
let actualPath = ""
if(typeof window != "undefined"){
  let url = document.getElementsByTagName("html")[0].getAttribute("subfolder"); 
  app_url = window.location.protocol+"//"+window.location.host+url.slice(0, -1)+"/api/"
  app_server = window.location.protocol+"//"+window.location.host+url.slice(0, -1);
  actualPath = window.location.protocol+"//"+window.location.host
  basePath = url;
}else{
  app_url = `${process.env.PUBLIC_URL}${process.env.subFolder.slice(0, -1)}/api/`;
  app_server = `${process.env.PUBLIC_URL}${process.env.subFolder.slice(0, -1)}`;
  actualPath = `${process.env.PUBLIC_URL}`;
  basePath = process.env.subFolder
}

export default {app_url,app_server,basePath,actualPath} 