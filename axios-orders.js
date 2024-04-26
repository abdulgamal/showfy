import axios from "axios";

let app_url = `${process.env.PUBLIC_URL}${process.env.subFolder}api/`;

if (typeof window != "undefined") {
  app_url = window.location.protocol + "//" + window.location.host + document.getElementsByTagName("html")[0].getAttribute("subfolder")+ "api/"
}

const instance = axios.create({
    baseURL: `${app_url}`
});


export default instance;