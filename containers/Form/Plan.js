import dynamic from 'next/dynamic';
import React, { useReducer, useRef } from 'react';
import axios from "../../axios-orders";
import Form from '../../components/DynamicForm/Index';
import Translate from "../../components/Translate/Index";
import Validator from '../../validators';
const imageCompression = dynamic(() => import("browser-image-compression"), {
    ssr: false
});

const Password = (props) => {
    const myRef = useRef(null)
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: props.plan ? "Edit Plan" : "Create Plan",
            success: false,
            error: null,
            loading: true,
            plan: props.plan,
            submitting: false,
        }
    );
    const onSubmit = async model => {
        if (state.submitting) {
            return
        }
        let formData = new FormData();
        

        if(state.plan)
            formData.append("plan_id", state.plan.member_plan_id)

        for (var key in model) {
            if(key == "image" && model[key] && typeof model[key] != "string"){
                var ext = model[key].name.substring(model[key].name.lastIndexOf('.') + 1).toLowerCase();
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true
                }
                let compressedFile = model[key]
                if(ext != 'gif' && ext != 'GIF'){
                    try {
                    compressedFile = await imageCompression(model[key], options);
                    } catch (error) { }
                }
                formData.append(key, compressedFile,model[key].name);
                }else if(model[key] != null && typeof model[key] != "undefined")
                    formData.append(key, model[key]);
        }
        //image
        if(model['image']){
            let image =   typeof model['image'] == "string" ? model['image'] : false
            if(image){
                formData.append('planImage',image)
            }
        }

        if(state.plan){
            delete model["price"]
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/members/create-plan';

        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    setTimeout(() => {
                        props.closePopup(response.data.item,response.data.type);
                    },2000);
                    props.openToast({message:Translate(props,response.data.message),type: "success"});
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };




        let validator = []

        validator.push({
            key: "title",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Title is required field"
                }
            ]
        },
            {
                key: "description",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Description is required field"
                    }
                ]
            },
            )

            if(!state.plan){
                validator.push(
                    {
                        key: "price",
                        validations: [
                            {
                                "validator": Validator.required,
                                "message": "Price is required field"
                            },
                            {
                                "validator": Validator.price,
                                "message": "Please provide valid price"
                            }
                        ]
                    }
                )
            }

        let formFields = []

        
        formFields.push(
            { key: "title", label: "Title", type:"title",isRequired:true,value:state.plan ? state.plan.title : "" },
            { key: "description", label: "Description",type:"textarea" ,isRequired:true,value:state.plan ? state.plan.description : "" },
            { key: "price", props: { readOnly: state.plan ? true : false }, label: props.t(`Price Monthly ({{price}})`,{price:props.pageData.appSettings.payment_default_currency}),type:"text" ,isRequired:true,value:state.plan ? state.plan.price.toString() : ""},
            {
                key: "res_type_1",
                type: "content",
                content: '<h6 class="custom-control minimum_amount_cnt">'+props.t("The subscription fee cannot be changed after it is created.")+'</h6>'
            },
            { key: "image", label: "Upload Image", type: "file", value: state.plan && state.plan.orgImage ? props.pageData.imageSuffix+state.plan.orgImage : "" },
        )
       
        if(props.pageData.categoriesVideo){
            let categories = props.pageData.categoriesVideo
            let selected = []

            if(state.plan && state.plan.video_categories){
                selected = state.plan.video_categories.split(",")
            }
            let value = []
            let options = []
            categories.forEach(cat => {
                options.push({
                    label: cat.title, value: cat.category_id
                })
                if(selected && selected.indexOf(String(cat.category_id)) > -1){
                    value.push({label:cat.title,value:cat.category_id})
                }
            })
            formFields.push(
                { key: "video_categories", label: "Allowed Video Categories",type:"multiSelect" ,isRequired:false,value:value,options:options,defaultValues:value }
            )
        }
        let initalValues = {}
        //get current values of fields
        formFields.forEach(item => {
            initalValues[item.key] = item.value
        })

        return (
            <React.Fragment>
                <div className="mainContentWrap plan-form" ref={myRef}>
                    <Form
                        editItem={state.plan}
                        className="form"
                        multiSelectKey="video_categories"
                        initalValues={initalValues}
                        validators={validator}
                        submitText={!state.submitting ? "Submit" : "Submitting..."}
                        model={formFields}
                        {...props}
                        generalError={state.error}
                        onSubmit={model => {
                            onSubmit(model);
                        }}
                    />
                </div>
            </React.Fragment>
        )
    }


export default Password