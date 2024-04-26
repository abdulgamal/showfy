import Router from 'next/router';
import React, { useEffect, useReducer, useRef } from 'react';
import { AudioContext, decodeAudioData } from 'standardized-audio-context';
import axios from "../../axios-orders";
import Breadcrum from "../../components/Breadcrumb/Form";
import Form from '../../components/DynamicForm/Index';
import Validator from '../../validators';
import Currency from "../Upgrade/Currency";

const Audio = (props) => {
    const myRef = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            editItem: props.pageData.editItem,
            title: props.pageData.editItem ? "Edit Audio" : "Create Audio",
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
            chooseType:props.pageData.editItem ? "audio" : null,
            success: false,
            error: null,
            plans:props.pageData.plans ? props.pageData.plans : [],
            sell_audios:props.pageData.sell_audios ? true : false,
        }
    );
    useEffect(() => {
        if(props.pageData.editItem != state.editItem){
            setState({ 
                editItem: props.pageData.editItem,
                title: props.pageData.editItem ? "Edit Audio" : "Create Audio",
                privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
                success: false,
                error: null,
                plans:props.pageData.plans ? props.pageData.plans : [],
                sell_audios:props.pageData.sell_audios ? true : false,
            })
        }
    },[props])
    
    const uploadMedia = (e) => {
        let res_field = e.name
       var extension = res_field.substr(res_field.lastIndexOf('.') + 1).toLowerCase();
       var allowedExtensions = ['mp3'];
        if (allowedExtensions.indexOf(extension) === -1) 
        {
            alert(props.t('Invalid file Format. Only {{data}} are allowed.',{data:allowedExtensions.join(', ')}));
            return false;
        }
        onSubmitUploadImport({ "upload": e })
    }
    const onChangePrivacy = (value) => {
        setState({ privacy: value })
    }
    const onSubmitUploadImport = (model) => {
        if (state.validating) {
            return
        }
        const formData = new FormData();
        for (var key in model) {
            
                formData.append(key, model[key]);
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

        let url = '/audio/upload';
        
        setState({ validating: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, validating: false });
                } else {
                    
                    setState({ validating: false, id: response.data.id, success: true, audioTitle: response.data.name,chooseType:"audio",audio_url:response.data.audio_url })
                    createPeakForm(response.data.audio_url)
                    
                    
                }
            }).catch(err => {
                setState({ validating: false, error: err });
            });
    }
    
    const  createPeakForm = async (audio_url) => {
        let request = new XMLHttpRequest();
        request.open('GET', audio_url, true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load',async  () => {
            let nativeAudioContext = new AudioContext();
            const audioBuffer = await decodeAudioData(nativeAudioContext, request.response);
            let channelData = audioBuffer.getChannelData(0);
            let peaks = extractPeaks(channelData);
            setState({peaks: peaks })
        });
        request.send();
    }
    const extractPeaks = (channelData) => {
        let peaks = [];
        const step = Math.ceil(channelData.length / 700);
        for (let i = 0; i < 700; i += 2) {
          let min = 1.0;
          let max = -1.0;
    
          for (let j = 0; j < step; j += 500) {
            let peak = channelData[(i * j) + j];
            if (peak < min) {
              min = peak;
            } else if (peak > max) {
              max = peak;
            }
    
            peaks.push([i, (1 + min) * 50, 1, Math.max(1, (max - min) * 50)]);
          }
        }    
        return JSON.stringify(peaks);
      }
      const onSubmit = model => {
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
            return false;
        }
        if (state.submitting) {
            return
        }
        let formData = new FormData();
        for (var key in model) {
            if(key == "release_date"){
                if(model[key]){
                    formData.append(key, new Date(model[key]).toJSON().slice(0,10));
                }
            }else
                formData.append(key, model[key]);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = '/audio/create'; 
        if (state.editItem) {
            formData.append("fromEdit", 1)
            formData.append("audio_id", state.editItem.audio_id)
        }
        if(state.id){
            formData.append("audio_id",state.id)
        }

        let selectedCurrency = props.pageData.selectedCurrency
        let changeRate = selectedCurrency.currency_value
        if(state.sell_audios && props.pageData.appSettings['audio_commission_type']  == 1 && props.pageData.appSettings['audio_commission_value'] > 0){
            if(model['price'] && parseFloat(model['price']) > 0){
                if(model['price'] <= (parseFloat(props.pageData.appSettings["audio_commission_value"])*changeRate).toFixed(2)){
                    let perprice = {}
                    perprice['package'] = { price: props.pageData.appSettings['audio_commission_value'] }
                    setState({error:[{message:props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['price'] = 0
            }
        }

        if(state.peaks){
            //formData.append("peaks",state.peaks);
        }
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    if(!state.editItem && state.peaks){
                        let formData = new FormData();
                        const config = {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            }
                        };
                        formData.append("audio_id",state.id)
                        formData.append("peaks",state.peaks);
                        axios.post("/audio/peak-data", formData, config)
                        .then(response1 => {
                            Router.push( `/audio/${response.data.custom_url}`)
                        })
                    }else{
                        Router.push( `/audio/${response.data.custom_url}`)
                    }
                    
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };
    
        
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

        let formFields = [
            { key: "title", label: "Title", value: state.editItem ? state.editItem.title : "" },
            { key: "description", label: "Description", type: "textarea", value: state.editItem ? state.editItem.description : "" },
            { key: "release_date",type:"date", label: "Relase Date", value: state.editItem && state.editItem.release_date && state.editItem.release_date != "" ? new Date(state.editItem.release_date.toString()) : "" },
        ]

        if(state.sell_audios){
            validator.push({
                key: "price",
                validations: [
                    {
                        "validator": Validator.price,
                        "message": "Please provide valid price"
                    }
                ]
            })
            formFields.push({ key: "price",postDescription:`${props.t("Leave empty for free audio")}`, label: props.t(`Price ({{price}})`,{price:props.pageData.appSettings.payment_default_currency}), value: state.editItem ? state.editItem.price : null,isRequired:true })
            
            if(props.pageData.appSettings['audio_commission_type']  == 1 && props.pageData.appSettings['audio_commission_value'] > 0){
                let perprice = {}
                perprice['package'] = { price: props.pageData.appSettings['audio_commission_value'] }
                formFields.push({
                    key: "price_desc_1",
                    type: "content",
                    content: '<span>' + props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice})}) + '</span>'
                })
            }
        }
        let imageUrl = null
        if(state.editItem && state.editItem.image){
            if(state.editItem.image.indexOf("http://") == 0 || state.editItem.image.indexOf("https://") == 0){
                imageUrl = state.editItem.image
            }else{
                imageUrl = props.pageData.imageSuffix+state.editItem.image
            }
        }
        validator.push(
            {
                key: "image",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Image is required field"
                    }
                ]
            }
        )
        formFields.push({ key: "image", label: "Upload Audio Image", type: "file", value: imageUrl })
        
        let validatorUploadImport = []
        let fieldUploadImport = []
        if(!state.editItem) {
            
            validatorUploadImport.push({
                key: "audio",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Upload audio is required field."
                    }
                ]
            })
            fieldUploadImport.push({ key: "audio", label: "", type: "audio", defaultText: "Drag & Drop Audio File Here", onChangeFunction: uploadMedia })
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
                value: "link", label: "Only to people who have audio link", key: "link"
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
                    value:"package_"+item.member_plan_id,label:props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...props,...perprice}).replace("<!-- -->","")}),key:"package_"+item.member_plan_id
                })
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
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
                else
                    defaultValues[elem.key] = ""
            })

            if(state.audioTitle) {
                if (state.videoTitle) {
                    defaultValues['title'] = state.audioTitle
                }               
            }
            

        return (
            <React.Fragment>
                {
                    state.chooseType ? 
                        <React.Fragment>
                            <Breadcrum {...props}  image={props.pageData['pageInfo']['banner'] ? props.pageData['pageInfo']['banner'] : props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${state.editItem ? "Edit" : "Create"} Audio`} />          
                            <div className="mainContentWrap">
                                <div className="container">
                                <div className="row">
                                    <div className="col-md-12 position-relative">
                                    <div className="formBoxtop loginp content-form" ref={myRef}>
                                        <Form
                                            editItem={state.editItem}
                                            className="form"
                                            {...props}
                                            defaultValues={defaultValues}
                                            validators={validator}
                                            generalError={state.error}
                                            submitText={!state.submitting ? "Submit" : "Submit..."}
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
                : <div className="videoBgWrap container" ref={myRef}>
                    <React.Fragment>
                        <Form
                            editItem={state.editItem}
                            className="form"
                            videoKey="audio"
                            generalError={state.error}
                            title="Upload Audio"
                            validators={validatorUploadImport}
                            model={fieldUploadImport}
                            submitText={!state.submitting ? "Submit" : "Submit..."}
                            {...props}
                            percentCompleted={state.percentCompleted}
                            processing={state.processing}
                            textProgress="Audio is processing, this may take few minutes."
                            submitHide={true}
                            loading={state.validating ? true : false}
                        />
                    </React.Fragment>

                </div>
                }
            </React.Fragment>
        )
    }


export default Audio