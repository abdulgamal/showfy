const Index = ({props,type,theme,currentUrl="",notifications=null}) => {
    // iOS app work
    if(!props.pageData.fromAPP){
        return null;
    }
    if(props.pageData.fromAppDevice == "ios"){
        try {
            let data = {
                user:props.pageData.loggedInUserDetails,
            }
            if(theme){
                data.theme = theme
            }
            if(props.purchaseData){
                data.purchaseData = props.purchaseData
            }
            if(currentUrl){
                data.currentUrl = currentUrl
            }
            if(notifications){
                data.notifications = notifications
            }
            window.webkit.messageHandlers[type].postMessage({...data});
        } catch(err) {
            console.log(err,' error');
        }
    }
};

export default Index;