import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";
import Currency from "../Upgrade/Currency"

const Index = (props) => {
    const myRef = useRef(null)
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            tips: props.pageData.tips ? props.pageData.tips : [{amount:0}],
            previousTips: props.pageData.tips ? props.pageData.tips : [{amount:0}],
            openAddTip:false,
            editItem:props.pageData.editItem ? props.pageData.editItem : null,
            category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
            subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
            subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
            member: props.member,
            videoTags: props.pageData.editItem && props.pageData.editItem.tags ? props.pageData.editItem.tags.split(',') : null,
        }
    );

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
    
    const onSubmit = model => {
        if (state.submitting) {
            return
        }
        let selectedCurrency = props.pageData.selectedCurrency
        let changeRate = selectedCurrency.currency_value
        if(props.pageData.appSettings['livestreaming_commission_type']  == 1 && props.pageData.appSettings['livestreaming_commission_value'] > 0){
            if(model['price'] && parseFloat(model['price']) > 0){
                if(model['price'] <=  (parseFloat(props.pageData.appSettings['livestreaming_commission_value'])*changeRate).toFixed(2)){
                    let perprice = {}
                    perprice['package'] = { price: props.pageData.appSettings['livestreaming_commission_value'] }
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
        if(state.tips){
            formData.append("tips",JSON.stringify(state.tips));
        }
        if(state.removeElements){
            formData.append("removeTips",JSON.stringify(state.removeElements));
        }
        formData.append("owner_id", state.member.user_id)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/live-streaming/create-default';
        
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) { 
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    setState({ submitting: false });
                    props.openToast({message:Translate(props,response.data.message), type:"success"});
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };
    
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
        if(tips[id].defaulttip_id){
            removeElements.push(tips[id].defaulttip_id)
        }
        tips.splice(id, 1);
        setState({ tips: tips,removeElements:removeElements })

    }
    const saveTips = (e) => {
        let valid = true
        let tips = [...state.tips]
        let perprice = {}
        perprice['package'] = { price: props.pageData.appSettings['videotip_commission_value'] }
        let selectedCurrency = props.pageData.selectedCurrency
        let changeRate = selectedCurrency.currency_value
        tips.forEach((item,index) => {
            if(parseFloat(item.amount) > 0){
                if(parseFloat(props.pageData.appSettings['videotip_commission_value']) > 0 && parseInt(props.pageData.appSettings['videotip_commission_type']) == 1 && parseFloat(item.amount) <= parseFloat(props.pageData.appSettings['videotip_commission_value'])*changeRate){
                    valid = false
                    item.error = props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})
                }else{
                    item.error = null
                }
            }else{
                item.error = props.t("Enter amount must be greater than {{price}}.",{price : parseFloat(props.pageData.appSettings['videotip_commission_value']) > 0 && parseInt(props.pageData.appSettings['videotip_commission_type']) == 1 ? Currency({...props,...perprice}).replace("<!-- -->","") : 0});
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
        

        let tips = null
        if(state.openAddTip){
            let perprice = {}
            perprice['package'] = { price: props.pageData.appSettings['videotip_commission_value'] }
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
                                        parseFloat(props.pageData.appSettings['videotip_commission_value']) > 0 && parseInt(props.pageData.appSettings['videotip_commission_type']) == 1 ?
                                                <p className="tip_amount_min">{props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})}</p>
                                            : null
                                        }
                                        {
                                            state.tips.length > 0 ? 
                                                state.tips.map((item,i) => {
                                                    return (
                                                        <div className="form-group" key={i}>
                                                            <div className="tip_input">
                                                                <input type="number" className="form-control" value={item.amount} disabled={item.defaulttip_id ? true : false} placeholder={Translate(props,'Enter Tip Amount')} onChange={e => setAmount(i,e)} />
                                                                {
                                                                    state.tips.length > 1 ?
                                                                        <a href="#" onClick={e => removeTip(i,e)} className="remove">{props.t("remove")}</a>
                                                                    : null
                                                                }
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
                                            <button type="button" onClick={(e) => saveTips(e)}>{Translate(props, "Save")}</button>
                                            <button type="button" className="add_more_tip" onClick={(e) => addMoreRow(e)}>{Translate(props, "Add More")}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
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
        let formFields = []
        
        if(props.pageData.appSettings['antserver_media_singlekey'] == 1){
            formFields.push(
                { key: "streamURL", label: "RTMP URL", value: "rtmp://"+(props.pageData.liveStreamingServerURL ? props.pageData.liveStreamingServerURL.replace("https://","").replace("http://","") : "")+`/${props.pageData.streamingAppName}`,props:{readOnly: true}},
                { key: "streamKey", label: "Stream Key", value: state.member ? state.member.streamkey : "",props:{readOnly: true}}
            )
        }

        formFields.push(
            { key: "title", label: "Title", value: state.editItem ? state.editItem.title : "Live Streaming" ,isRequired:true},
            { key: "description", label: "Description", type: "textarea", value: state.editItem ? state.editItem.description : "" }    
        )

        //set tip options
        if(parseInt(props.pageData.appSettings['video_tip']) == 1){
            formFields.push({ key: "addTips", type:"content",content:"<button class='add_tips' type='button'>"+Translate(props,"Add Tips")+"</button>" });
        }

        

        if (props.pageData.categoriesVideos) {
            let categories = []
            categories.push({ key: 0, value: 0, label: "Please Select Category" })
            props.pageData.categoriesVideos.forEach(res => {
                categories.push({ key: res.category_id, label: res.title, value: res.category_id })
            })
            formFields.push({
                key: "category_id",
                label: "Category",
                type: "select",
                value:  state.editItem ? state.editItem.category_id : "" ,
                onChangeFunction: onCategoryChange,
                options: categories
            })

            //get sub category
            if (state.category_id) {
                let subcategories = []

                props.pageData.categoriesVideos.forEach(res => {
                    if (res.category_id == state.category_id) {
                        if (res.subcategories) {
                            subcategories.push({ key: 0, value: 0, label: "Please Select Sub Category" })
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
                        value: state.editItem ? state.editItem.subcategory_id : "" ,
                        type: "select",
                        onChangeFunction: onSubCategoryChange,
                        options: subcategories
                    })

                    if (state.subcategory_id) {
                        let subsubcategories = []

                        props.pageData.categoriesVideos.forEach(res => {
                            if (res.category_id == state.category_id) {
                                if (res.subcategories) {
                                    res.subcategories.forEach(rescat => {
                                        if (rescat.category_id == state.subcategory_id) {
                                            if (rescat.subsubcategories) {
                                                subsubcategories.push({ key: 0, value: 0, label: "Please Select Sub Sub Category" })
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
                                value: state.editItem ? state.editItem.subsubcategory_id : "" ,
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

        validator.push({
            key: "price",
            validations: [
                {
                    "validator": Validator.price,
                    "message": "Please provide valid price"
                }
            ]
        })
        formFields.push({ key: "price", label: "Price (Leave empty for free livestreaming)", value: state.editItem ? state.editItem.price : null,isRequired:true })
        if(props.pageData.appSettings['livestreaming_commission_type']  == 1 && props.pageData.appSettings['livestreaming_commission_value'] > 0){
            let perprice = {}
            perprice['package'] = { price: props.pageData.appSettings['livestreaming_commission_value'] }
            formFields.push({
                key: "price_desc_1",
                type: "content",
                content: '<span>' + props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")}) + '</span>'
            })
        }

        formFields.push({
            key: "enable_chat",
            label: "",
            type: "checkbox",
            subtype:"single",
            value: state.editItem ? [state.editItem.enable_chat ? "1" : "0"] : ["1"],
            options: [
                {
                    value: "1", label: "Allow chat", key: "allow_chat_1"
                }
            ]
        })

        if (props.pageData.appSettings.video_adult == "1") {
            formFields.push({
                key: "adult",
                label: "",
                subtype:"single",
                type: "checkbox",
                value: state.editItem ? [state.editItem.adult ? "1" : "0"] : ["0"],
                options: [
                    {
                        value: "1", label: "Mark as Adult", key: "adult_1"
                    }
                ]
            })
        }

        

       

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
                value: "link", label: "Only to people who have link", key: "link"
            }
        ]

        if (props.pageData.appSettings.user_follow == "1") {
            privacyOptions.push({
                value: "follow", label: "Only people I follow", key: "follow"
            })
        }
        if(props.pageData.appSettings['whitelist_domain'] == 1){
            privacyOptions.push(
                {
                    value: "whitelist_domain", label: "Whitelist Domain", key: "whitelist_domain"
                }
            )
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
                key: "password", label: "Password", 'type': "password", value:  state.editItem ? state.editItem.password : "",isRequired:true
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
        formFields.forEach((elem) => {
            if (elem.value)
                defaultValues[elem.key] = elem.value
        })
        if (state.videoTags) {
            defaultValues['tags'] = state.videoTags
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
       

        return (
            <React.Fragment>
                 {
                    tips
                }
                <div ref={myRef}>
                <Form
                    className="form"
                    title={"Default Stream Data"}
                    defaultValues={defaultValues}
                    {...props}
                    generalError={state.error}
                    validators={validator}
                    submitText={!state.submitting ? "Save Changes" : "Saving Changes..."}
                    model={formFields}
                    onSubmit={model => {
                        onSubmit(model);
                    }}
                />
                </div>
            </React.Fragment>
        )
    }

export default Index