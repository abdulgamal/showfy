const Index = (fn,props,title) => {
    if(fn != "fn"){
        props = fn
    }
    let titleText = props.title ? props.title : (props.text ? props.text : title);
    if(!titleText && fn == "fn"){
        return null
    }else if(!titleText){
        return <span></span>
    }

    let newBadWords = ""
    if(props.pageData && props.pageData.appSettings && props.pageData.appSettings['censored_words']){
        newBadWords = props.pageData.appSettings['censored_words']
    }else if(props.pageData && props.pageData.appSettings['censored_words']){
        newBadWords = props.pageData.appSettings['censored_words']
    }
    
    if(newBadWords){        
        let newBadWords1 = newBadWords.split(",")
        var re = new RegExp(newBadWords1.join("|"),"gi");
        var str = titleText
        str = str.replace(re, function(matched){
            return "*";
        });
        return str
    }
    return titleText
}

export default Index