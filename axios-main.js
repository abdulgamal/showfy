import axios from "axios";

let app_url = `${process.env.PUBLIC_URL}${process.env.subFolder}mainsite/`;

if (typeof window != "undefined") {
  app_url = window.location.protocol + "//" + window.location.host + document.getElementsByTagName("html")[0].getAttribute("subfolder")+ "mainsite/"
}

const instance = axios.create({
    baseURL: `${app_url}`
});


export default instance;