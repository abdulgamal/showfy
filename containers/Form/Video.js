import React,{useReducer,useEffect,useRef} from 'react'
import Breadcrum from "../../components/Breadcrumb/Form"
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import Router from 'next/router';
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency"
import moment from "moment-timezone"


const Video = (props) => {
    const myRef= useRef(null)

    
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            appViewWidth:props.appViewWidth,
            processing:false,
            percentCompleted:0,
            enableUploadVideo: props.pageData.appSettings.uploadVideo == "1" ? true : false,
            chooseType: props.pageData.appSettings.uploadVideo == "1" ? "upload" : "import",
            editItem: props.chooseVideos ? null : props.pageData.editItem,
            videoTitle: props.pageData.editItem ? props.pageData.editItem.title : null,
            videoDescription: props.pageData.editItem ? props.pageData.editItem.description : null,
            tips:props.pageData.editItem && props.pageData.editItem.tips ? [...props.pageData.editItem.tips] : [{amount:0}],
            previousTips:props.pageData.editItem && props.pageData.editItem.tips ? [...props.pageData.editItem.tips] : [{amount:0}],
            videoTags: props.pageData.editItem && props.pageData.editItem.tags ? props.pageData.editItem.tags.split(',') : null,
            videoImage: null,
            category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
            subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
            subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
            success: !props.chooseVideos && props.pageData.editItem ? true : false,
            error: null,
            sell_videos:props.pageData.sell_videos ? true : false,
            openAddTip:false,
            channel_id:props.channel_id ? props.channel_id : null,
            plans:props.pageData.plans ? props.pageData.plans : [],
            videoAmountType: !props.pageData.editItem ? "videotip" : (props.pageData.editItem.mediaserver_stream_id || props.pageData.editItem.channel_name ? "livestreaming" : "videotip")
        }
    );
    useEffect(() => {
        if(props.pageData.editItem != state.editItem){
            setState({
                processing:false,
                percentCompleted:0,
                channel_id:props.channel_id ? props.channel_id : null,
                openAddTip:false,
                chooseType: props.pageData.appSettings.uploadVideo == "1" ? "upload" : "import",
                previousTips:props.pageData.editItem && props.pageData.editItem.tips ? [...props.pageData.editItem.tips] : [{amount:0}],
                chooseType: props.pageData.appSettings.uploadVideo == "1" ?  "upload" : "import",
                editItem: props.chooseVideos ? null : props.pageData.editItem,
                videoTitle: props.pageData.editItem ? props.pageData.editItem.title : null,
                videoDescription: props.pageData.editItem ? props.pageData.editItem.description : null,
                videoTags: props.pageData.editItem && props.pageData.editItem.tags ? props.pageData.editItem.tags.split(',') : null,
                videoImage: null,
                category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
                subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
                subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
                privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
                success: !props.chooseVideos && props.pageData.editItem ? true : false,
                error: null,
                sell_videos:props.pageData.sell_videos ? true : false,
                plans:props.pageData.plans ? props.pageData.plans : [],
                videoAmountType: !props.pageData.editItem ? "videotip" : (props.pageData.editItem.mediaserver_stream_id || props.pageData.editItem.channel_name ? "livestreaming" : "videotip")
            })
        }
    },[props])

    useEffect(() => {
        $(document).on('click','.add_tips',function(){
            //
            if(props.pageData && !props.pageData.loggedInUserDetails){
                document.getElementById('loginFormPopup').click();
            }else{
                setState({openAddTip:true})
            }
        })
    },[])
   
    const onSubmit = model => {
        if (state.submitting) {
            return
        }
        if(model["duration"]){
            //check duration format it must be HH:MM:SS
            let valid =  /^\d{2}:\d{2}:\d{2}$/.test(model["duration"]);

            if(!valid){
                setState({error:[{message:props.t("Duration must be in format HH:MM:SS.")}]})
                return;
            }

        }
        let selectedCurrency = props.pageData.selectedCurrency
        let changeRate = selectedCurrency.currency_value
        if(state.sell_videos && props.pageData.appSettings['video_commission_type']  == 1 && props.pageData.appSettings['video_commission_value'] > 0){
            if(model['price'] && parseFloat(model['price']) > 0){
                if(model['price'] <= (parseFloat(props.pageData.appSettings["video_commission_value"])*changeRate).toFixed(2)){
                    let perprice = {}
                    perprice['package'] = { price: props.pageData.appSettings['video_commission_value'] }
                    setState({error:[{message:props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['price'] = 0
            }
        }

        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        if (state.id) {
            formData.append("id", state.id)
            formData.append("videoResolution", state.videoWidth)
        }

        if(state.tips){
            formData.append("tips",JSON.stringify(state.tips));
        }
        if(state.removeElements){
            formData.append("removeTips",JSON.stringify(state.removeElements));
        }

        if (state.chooseType == "import") {
            formData.append('duration', state.videoDuration)
            formData.append('type', state.videoType)
            formData.append('code', state.videoCode)
            if (state.videoType == 6) {
                formData.append('channel', state.videoChannel)
            }
        }else if(state.chooseType == "embed"){
            formData.append('type', "22")
            formData.append('code', state.videoCode)
        }

        //image
        if (model['image']) {
            let image = typeof model['image'] == "string" ? model['image'] : false
            if (image) {
                formData.append('videoImage', image)
            }
        }

        if(state.channel_id){
            formData.append("channel_id",state.channel_id);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/videos/create';
        if (state.editItem) {
            url = "/videos/create";
            formData.append("fromEdit", 1)
            formData.append("id", state.editItem.video_id)
        }
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    if(props.chooseVideos){
                        props.chooseVideos(null,response.data.editItem.video_id)
                    }else{
                        Router.push(`/watch/${response.data.custom_url}`)
                    }
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };
    const chooseType = (type, e) => {
        e.preventDefault()
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            if (state.validating) {
                return
            }
            setState({ chooseType: type })
        }
    }
    const onCategoryChange = (category_id) => {
        setState({ category_id: category_id, subsubcategory_id: 0, subcategory_id: 0 })
    }
    const onSubCategoryChange = (category_id) => {
        setState({ subcategory_id: category_id, subsubcategory_id: 0 })
    }
    const onSubSubCategoryChange = (category_id) => {
        setState({ subsubcategory_id: category_id })
    }
    const onChangePrivacy = (value) => {
        setState({ privacy: value })
    }
    const formatBytes = (bytes, decimals = 2)  => {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    const uploadMedia = (e) => {
        let res_field = e.name
       var extension = res_field.substr(res_field.lastIndexOf('.') + 1).toLowerCase();
       var allowedExtensions = ['mp4','mov','webm','mpeg','3gp','avi','flv','ogg','mkv','mk3d','mks','wmv'];
        if (allowedExtensions.indexOf(extension) === -1) 
        {
            alert(props.t('Invalid file Format. Only {{data}} are allowed.',{data:allowedExtensions.join(', ')}));
            return false;
        }else if( parseInt(props.pageData.appSettings['video_upload_limit']) > 0 && e.size > parseInt(props.pageData.appSettings['video_upload_limit'])*1000000){
            alert(props.t('Maximum upload limit is {{upload_limit}}',{upload_limit:formatBytes(parseInt(props.pageData.appSettings['video_upload_limit'])*1000000)}));
            return false;
        }
        onSubmitUploadImport({ "upload": e })
    }
    const onSubmitUploadImport = (model) => {
        if (state.validating) {
            return
        }
        const formData = new FormData();
        for (var key in model) {
            formData.append(key, model[key]);
        }
        if(key == "embed-code"){
            let previousState = {...state}
            previousState["validating"] = false
            previousState['success'] = true
            setState({ ...previousState,videoCode:model[key] })
            return;
        }

        var config = {};

        if(key == "upload"){
            config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    setState({percentCompleted:percentCompleted,processing:percentCompleted == 100 ? true : false})
                }
            };
        }else{
            config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
        }

        let url = '/videos/' + key;
        if (state.isEdit) {
            url = "/videos/create/" + state.isEdit;
        }
        setState({ validating: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, validating: false });
                } else {
                    if (key == "import-url") {

                        const data = response.data
                        const previousState = { ...state }
                        if (data.title) {
                            previousState["videoTitle"] = data.title
                        }
                        if (data.description) {
                            previousState["videoDescription"] = data.description
                        }
                        if (data.tags) {
                            previousState["videoTags"] = data.tags
                        }
                        if (data.image) {
                            previousState["videoImage"] = data.image
                        }
                        if (data.duration) {
                            previousState["videoDuration"] = data.duration
                        }
                        if (data.type) {
                            previousState['videoType'] = data.type
                        }
                        if (data.channel) {
                            previousState['videoChannel'] = data.channel
                        }
                        if (data.code) {
                            previousState['videoCode'] = data.code
                        }
                        previousState["validating"] = false
                        previousState['success'] = true
                        setState({ ...previousState })
                    } else {
                        setState({ videoWidth: response.data.videoWidth, validating: false, id: response.data.id, success: true, videoTitle: response.data.name, videoImage: response.data.images[0] });
                    }
                }
            }).catch(err => {
                setState({ validating: false, error: err });
            });
    }
    const closeTipPopup = () => {
        setState({openAddTip:false,tips:state.previousTips,removeElements:[]})
    }
    
    const setAmount = (id,e) => {
        let tips = [...state.tips]
        if(!tips[id]){
            let item = {}
            item.amount = e.target.value
            tips.push(item)
        }else{
            tips[id]['amount'] = e.target.value
        }
        setState({tips:tips});
    }
    const addMoreRow = (e) => {
        let row = {}
        row['amount'] = 0
        let tips = [...state.tips]
        tips.push(row)
        setState({tips:tips});
    }
    const removeTip = (id,e) => {
        e.preventDefault();
        let tips = [...state.tips]
        let removeElements = !state.removeElements ? [] : state.removeElements
        if(tips[id].tip_id){
            removeElements.push(tips[id].tip_id)
        }
        tips.splice(id, 1);
        setState({ tips: tips,removeElements:removeElements })

    }
    const saveTips = (e) => {
        let valid = true
        let tips = [...state.tips]
        let perprice = {}
        perprice['package'] = { price: props.pageData.appSettings[state.videoAmountType+'_commission_value'] }
        let selectedCurrency = props.pageData.selectedCurrency
        let changeRate = selectedCurrency.currency_value
        tips.forEach((item,index) => {
            if(parseFloat(item.amount) > 0){
                if(parseFloat(props.pageData.appSettings[state.videoAmountType+'_commission_value'])*changeRate > 0 && parseInt(props.pageData.appSettings[state.videoAmountType+'_commission_type']) == 1 && parseFloat(item.amount) <= parseFloat(props.pageData.appSettings[state.videoAmountType+'_commission_value']).toFixed(2)*changeRate){
                    valid = false
                    item.error = props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})
                }else{
                    item.error = null
                }
            }else{
                item.error = props.t("Enter amount must be greater than {{price}}.",{price : (parseFloat(props.pageData.appSettings[state.videoAmountType+'_commission_value'])*changeRate).toFixed(2) > 0 && parseInt(props.pageData.appSettings[state.videoAmountType+'_commission_type']) == 1 ? Currency({...props,...perprice}) : 0});
                valid = false;
            }
        })
        let update = {tips:tips}
        if(valid){
            update['openAddTip'] = false
            update['previousTips'] = [...tips]
        }
        setState(update)
    }

        let validator = [
            {
                key: "title",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Title is required field"
                    }
                ]
            }
        ]

        let imageUrl = null
        if(state.editItem && state.editItem.image){
            if(state.editItem.image.indexOf("http://") == 0 || state.editItem.image.indexOf("https://") == 0){
                imageUrl = state.editItem.image
            }else{
                if(props.pageData.livestreamingtype == 0 && state.editItem.mediaserver_stream_id &&  state.editItem.image && state.editItem.image.indexOf(`${props.pageData.streamingAppName}/previews`) > 0){
                    if(props.pageData.liveStreamingCDNURL){
                        imageUrl = props.pageData.liveStreamingCDNURL+state.editItem.image.replace(`/LiveApp`,'').replace(`/WebRTCAppEE`,'')
                    }else
                        imageUrl = props.pageData.liveStreamingServerURL+":5443"+state.editItem.image
                }else{
                    imageUrl = props.pageData.imageSuffix+state.editItem.image
                }
            }
        }
        let formFields = [
            { key: "title", label: "Video Title", value: state.editItem ? state.editItem.title : null ,isRequired:true},
            { key: "description", label: "Video Description", type: "textarea", value: state.editItem ? state.editItem.description : null }    
        ]

        //set tip options
        if(parseInt(props.pageData.appSettings['video_tip']) == 1){
            formFields.push({ key: "addTips", type:"content",content:"<button class='add_tips' type='button'>"+Translate(props,"Add Tips")+"</button>" });

        }

        formFields.push({ key: "image", label: "Upload Video Image", type: "file", value: imageUrl })
        if(state.chooseType == "embed" || (state.editItem && state.editItem.type == 22)){
            formFields.push({ key: "duration", label: "Video Duration (eg - HH:MM:SS)", value: state.editItem ? state.editItem.duration : null })
        }

        if(state.chooseType == "upload" && state.sell_videos && (!state.editItem || state.editItem.type == 3)){
             
            validator.push({
                key: "price",
                validations: [
                    {
                        "validator": Validator.price,
                        "message": "Please provide valid price"
                    }
                ]
            })
            formFields.push({ key: "price",postDescription:`${props.t("(Leave empty for free videos)")}`, label: `Price (${props.pageData.appSettings.payment_default_currency})`, value: state.editItem ? state.editItem.price : null,isRequired:true })
            
            if(props.pageData.appSettings['video_commission_type']  == 1 && props.pageData.appSettings['video_commission_value'] > 0){
                let perprice = {}
                perprice['package'] = { price: props.pageData.appSettings['video_commission_value'] }
                formFields.push({
                    key: "price_desc_1",
                    type: "content",
                    content: '<span>' + props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice})}) + '</span>'
                })
            }
        }

        if (props.pageData.videoCategories) {
            let categories = []
            categories.push({ key: 0, value: 0, label: "Please Select Video Category" })
            props.pageData.videoCategories.forEach(res => {
                categories.push({ key: res.category_id, label: res.title, value: res.category_id })
            })
            formFields.push({
                key: "category_id",
                label: "Category",
                type: "select",
                value: state.editItem ? state.editItem.category_id : null,
                onChangeFunction: onCategoryChange,
                options: categories
            })

            //get sub category
            if (state.category_id) {
                let subcategories = []

                props.pageData.videoCategories.forEach(res => {
                    if (res.category_id == state.category_id) {
                        if (res.subcategories) {
                            subcategories.push({ key: 0, value: 0, label: "Please Select Video Sub Category" })
                            res.subcategories.forEach(rescat => {
                                subcategories.push({ key: rescat.category_id, label: rescat.title, value: rescat.category_id })
                            })
                        }
                    }
                })


                if (subcategories.length > 0) {
                    formFields.push({
                        key: "subcategory_id",
                        label: "Sub Category",
                        value: state.editItem ? state.editItem.subcategory_id : null,
                        type: "select",
                        onChangeFunction: onSubCategoryChange,
                        options: subcategories
                    })

                    if (state.subcategory_id) {
                        let subsubcategories = []

                        props.pageData.videoCategories.forEach(res => {
                            if (res.category_id == state.category_id) {
                                if (res.subcategories) {
                                    res.subcategories.forEach(rescat => {
                                        if (rescat.category_id == state.subcategory_id) {
                                            if (rescat.subsubcategories) {
                                                subsubcategories.push({ key: 0, value: 0, label: "Please Select Video Sub Sub Category" })
                                                rescat.subsubcategories.forEach(ressubcat => {
                                                    subsubcategories.push({ key: ressubcat.category_id, label: ressubcat.title, value: ressubcat.category_id })
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })

                        if (subsubcategories.length > 0) {
                            formFields.push({
                                key: "subsubcategory_id",
                                label: "Sub Sub Category",
                                type: "select",
                                value: state.editItem ? state.editItem.subsubcategory_id : null,
                                onChangeFunction: onSubSubCategoryChange,
                                options: subsubcategories
                            });
                        }
                    }
                }
            }
        }
        formFields.push({
            key: "tags",
            label: "Tags",
            type: "tags"
        })
        if (props.pageData.videoArtists) {
            let artists = []

            props.pageData.videoArtists.forEach(res => {
                artists.push({ value: res.artist_id.toString(), key: res.title, label: res.title, image: props.pageData.imageSuffix + res.image })
            })

            formFields.push({
                key: "artists",
                label: "Video Artists",
                imageSelect:true,
                type: "checkbox",
                value: state.editItem && state.editItem.artists ? state.editItem.artists.split(",") : null,
                options: artists
            })
        }

        if (props.pageData.appSettings.video_adult == "1") {
            formFields.push({
                key: "adult",
                label: "",
                subtype:"single",
                type: "checkbox",
                value: state.editItem ? [state.editItem.adult ? "1" : "0"] : ["0"],
                options: [
                    {
                        value: "1", label: "Mark Video as Adult", key: "adult_1"
                    }
                ]
            })
        }

        formFields.push({
            key: "search",
            label: "",
            type: "checkbox",
            subtype:"single",
            value: state.editItem ? [state.editItem.search ? "1" : "0"] : ["1"],
            options: [
                {
                    value: "1", label: "Show this video in search results", key: "search_1"
                }
            ]
        })

        if(props.pageData.appSettings['enable_comment_approve'] == 1){
            let comments = []
            comments.push({ value: "1", key: "comment_1", label: "Display automatically" })
            comments.push({ value: "0", key: "comment_0", label: "Don't display until approved" })
            formFields.push({
                key: "comments",
                label: "Comments Setting",
                type: "select",
                value: state.editItem  ? state.editItem.autoapprove_comments.toString() : "1",
                options: comments
            })
        }
        let privacyOptions = [
            {
                value: "everyone", label: "Anyone", key: "everyone"
            },
            {
                value: "onlyme", label: "Only me", key: "onlyme"
            },
            {
                value: "password", label: "Only people with password", key: "password"
            },
            {
                value: "link", label: "Only to people who have video link", key: "link"
            }
        ]

        if(props.pageData.appSettings['whitelist_domain'] == 1){
            privacyOptions.push(
                {
                    value: "whitelist_domain", label: "Whitelist Domain", key: "whitelist_domain"
                }
            )
        }

        if (props.pageData.appSettings.user_follow == "1") {
            privacyOptions.push({
                value: "follow", label: "Only people I follow", key: "follow"
            })
        }
        if(state.plans.length > 0){
            state.plans.forEach(item => {
                let perprice = {}
                perprice['package'] = { price: item.price }
                privacyOptions.push({
                    value:"package_"+item.member_plan_id,label:props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...props,...perprice})}),key:"package_"+item.member_plan_id
                })
            })
        }
        if(props.pageData.levelPermissions["livestreaming.scheduled"] == 1 && props.pageData.livestreamingtype == 0 && state.editItem && state.editItem.scheduled){
            let value = state.editItem && state.editItem.scheduled && state.editItem.scheduled != "" ? new Date(state.editItem.scheduled.toString())  : new Date();
            let dateS = moment(value)
            let currentTime = dateS.tz(props.pageData.defaultTimezone).toDate();
            formFields.push({
                key: "scheduled",
                label: "Schedule Stream",
                type: "datetime",
                minDate: currentTime,
                value:  currentTime
            })
        }
        formFields.push({
            key: "privacy",
            label: "Privacy",
            type: "select",
            value: state.editItem ? state.editItem.view_privacy : "everyone",
            onChangeFunction: onChangePrivacy,
            options: privacyOptions
        })
        if (state.privacy == "password") {
            formFields.push({
                key: "password", label: "Password", 'type': "password", value: state.editItem ? state.editItem.password : "",isRequired:true
            })
            validator.push({
                key: "password",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Password is required field"
                    }
                ]
            })
        }
        let defaultValues = {}
        if (state.chooseType) {
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
        }
        if ((state.videoTitle || state.videoImage || state.videoDescription || state.videoTags)) {
            if (state.videoTitle) {
                defaultValues['title'] = state.videoTitle
            }
            if (state.videoImage) {
                defaultValues['image'] = state.videoImage
            }
            if (state.videoDescription) {
                defaultValues['description'] = state.videoDescription
            }
            if (state.videoTags) {
                defaultValues['tags'] = state.videoTags
            }
        }
        if (state.category_id) {
            defaultValues['category_id'] = state.category_id
        }
        if (state.subcategory_id) {
            defaultValues['subcategory_id'] = state.subcategory_id
        }
        if (state.privacy) {
            defaultValues['privacy'] = state.privacy
        }
        if (state.subsubcategory_id) {
            defaultValues['subsubcategory_id'] = state.subsubcategory_id
        }
        let validatorUploadImport = []
        let fieldUploadImport = []
        if (state.chooseType == "upload" && !state.editItem) {
            validatorUploadImport.push({
                key: "upload",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Upload video is required field."
                    }
                ]
            })
            fieldUploadImport.push({ key: "upload", label: "", type: "video", defaultText: "Drag & Drop Video File Here", onChangeFunction: uploadMedia })
        } else if(state.chooseType == "embed" && !state.editItem) {
            validatorUploadImport.push({
                key: "embed-code",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Embed Video code is required field"
                    }
                ]
            })
            fieldUploadImport.push({ key: "embed-code", label:"", placeholder:"Embed Video Code", type: "textarea" })
            
        } else {
            validatorUploadImport.push({
                key: "import-url",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Import video link is required field"
                    },
                    {
                        "validator": Validator.url,
                        "message": "Please provide valid link."
                    }
                ]
            })
            fieldUploadImport.push({ key: "import-url", label:"", placeholder:"Import Video Link", type: "text" })
        }
        
        let tips = null
        if(state.openAddTip){
            let perprice = {}
            perprice['package'] = { price: props.pageData.appSettings[state.videoAmountType+'_commission_value'] }
            tips = <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap tip_cnt">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Create Tips")}</h2>
                                <a onClick={closeTipPopup} className="_close"><i></i></a>
                            </div>
                            <div className="user_wallet">
                                <div className="row">
                                    <form>
                                        {
                                        parseFloat(props.pageData.appSettings[state.videoAmountType+'_commission_value']) > 0 && parseInt(props.pageData.appSettings[state.videoAmountType+'_commission_type']) == 1 ?
                                                <p className="tip_amount_min">{props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice})})}</p>
                                            : null
                                        }
                                        {
                                            state.tips.length > 0 ? 
                                                state.tips.map((item,i) => {
                                                    return (
                                                        <div className="form-group" key={i}>
                                                            <div className="tip_input">
                                                                <input type="number" className="form-control" value={item.amount} disabled={item.tip_id ? true : false} placeholder={Translate(props,'Enter Tip Amount')} onChange={(e) => setAmount(i,e)} />
                                                                {/* {
                                                                    state.tips.length > 1 ? */}
                                                                        <a href="#" onClick={(e) => removeTip(i,e)} className="remove">{props.t("remove")}</a>
                                                                    {/* : null */}
                                                                {/* } */}
                                                            </div>
                                                            {
                                                                item.error ?
                                                                    <p className="error">{item.error}</p>
                                                                : null
                                                            }
                                                        </div>
                                                    )     
                                                })
                                            : null
                                        }
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label"></label>
                                            <button type="button" onClick={saveTips}>{Translate(props, "Save")}</button>
                                            <button type="button" className="add_more_tip" onClick={addMoreRow}>{Translate(props, "Add More")}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        }
        let customStyle = {}
        if(props.fromChannel){
            customStyle.style = {marginTop:"0px",marginBottom:"0px"}
        }
        return (
            <React.Fragment>
                {
                    tips
                }
                {
                    state.success ?
                            !state.channel_id ?
                               <React.Fragment>
                                    {
                                    !props.fromChannel &&
                                        <Breadcrum {...props}  image={props.pageData['pageInfo']['banner'] ? props.pageData['pageInfo']['banner'] : props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${state.editItem ? "Edit" : "Create"} Video`} />
                                    }
                                    <div className="mainContentWrap">
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-md-12 position-relative">
                                                    <div {...customStyle} className="formBoxtop loginp content-form" ref={myRef}>
                                                        <Form
                                                            editItem={state.editItem}
                                                            className="form"
                                                            defaultValues={defaultValues}
                                                            {...props}
                                                            generalError={state.error}
                                                            validators={validator}
                                                            submitText={!state.submitting ? "Submit" : "Submitting..."}
                                                            model={formFields}
                                                            onSubmit={model => {
                                                                onSubmit(model);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                               </React.Fragment>
                                :
                                <div className="mt20">
                                <Form
                                    editItem={state.editItem}
                                    className="form"
                                    defaultValues={defaultValues}
                                    {...props}
                                    generalError={state.error}
                                    validators={validator}
                                    submitText={!state.submitting ? "Submit" : "Submitting..."}
                                    model={formFields}
                                    onSubmit={model => {
                                        onSubmit(model);
                                    }}
                                />
                                </div>
                        :
                        <div className="videoBgWrap container" ref={myRef}>
                            {
                                state.enableUploadVideo || props.pageData.levelPermissions['video.embedcode'] == 1 ?
                                    <div className="user-area">
                                        <div className="container">
                                             <div className="BtnUpld">
                                                {
                                                    state.enableUploadVideo ? 
                                                <a href="#" onClick={(e) => chooseType("upload",e)} className={state.chooseType == "upload" ? "active" : ""}>
                                                    {Translate(props,"Upload")}
                                                </a>
                                                : null
                                                }
                                                <a href="#"  onClick={(e) => chooseType("import",e)} className={state.chooseType == "import" ? "active" : ""}>
                                                    {Translate(props,"Import")}
                                                </a>
                                                {
                                                    props.pageData.levelPermissions['video.embedcode'] == 1 ? 
                                                    <a href="#"  onClick={(e) => chooseType("embed",e)} className={state.chooseType == "embed" ? "active" : ""}>
                                                        {Translate(props,"Embed Video")}
                                                    </a>
                                                : null
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    :  <div className="user-area">
                                            <div className="container">
                                                <div className="BtnUpld"></div>
                                            </div>
                                        </div>
                            }
                            {
                                state.chooseType ?
                                    //upload file
                                    <React.Fragment>
                                        <Form
                                            editItem={state.editItem}
                                            className="form"
                                            videoKey="video"
                                            generalError={state.error}
                                            title={state.chooseType == "upload" ? "Upload Video" : (state.chooseType == "embed" ? "Embed Video" : "Import Video Link")}
                                            validators={validatorUploadImport}
                                            model={fieldUploadImport}
                                            submitText={state.chooseType != "embed" ? "Fetch Video" : "Embed Video"}
                                            {...props}
                                            percentCompleted={state.percentCompleted}
                                            processing={state.processing}
                                            textProgress="Video is processing, this may take few minutes."
                                            submitHide={state.chooseType == "upload" ? true : false}
                                            loading={state.validating ? true : false}
                                            onSubmit={model => {
                                                onSubmitUploadImport(model);
                                            }}
                                        />
                                    </React.Fragment>
                                    : null
                            }
                        </div>
                }
            </React.Fragment>
        )
    }



export default Video