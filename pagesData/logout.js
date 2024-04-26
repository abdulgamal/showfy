import React from 'react'
import axios from "../axios-site"
class Logout extends React.Component {
    static async getInitialProps(context) {
        const isServer = !!context.req
        if(isServer){
            context.res.redirect('/');
        }else{ 
            let pageData = await axios.get("/logout?data=1");
           
            return {pageData:pageData.data.data,user_login:pageData.data.user_login,pagenotfound:pageData.data.pagenotfound,permission_error:pageData.data.permission_error,maintanance:pageData.data.maintanance}
            // Router.push('/')
        }
    }
render() {
    if(typeof window != 'undefined'){
        const { BroadcastChannel } = require('broadcast-channel');
        const userChannel = new BroadcastChannel('user');
        userChannel.postMessage({
            payload: {
                type: "LOGOUT"
            }
        });
    }
    return null
  }
}

export default Logout