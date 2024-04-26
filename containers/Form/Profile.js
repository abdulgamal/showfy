import React,{useReducer,useRef} from 'react'

import Form from '../../components/DynamicForm/Index'


import Validator from '../../validators';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";

const Profile = (props) => {
    const myRef = useRef(null)
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: "Profile Settings",
            success: false,
            error: null,
            loading: true,
            member: props.member,
            submitting: false,
            firstLoaded: true
        }
    );
    const onSubmit = model => {
        if (state.submitting) {
            return
        }
        let formData = new FormData();
        for (var key in model) {
            if (model[key])
                formData.append(key, model[key]);
        }

        formData.append("user_id", state.member.user_id)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        formData.append("profile",1);
        let url = '/members/edit';

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




        let validator = []

        validator.push({
            key: "first_name",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "First Name is required field"
                }
            ]
        })
        let formFields = []

        
        formFields.push(
            { key: "first_name", label: "First Name", value: state.member.first_name ? state.member.first_name : "",isRequired:true },
            { key: "last_name", label: "Last Name", value: state.member.last_name ? state.member.last_name : "" },
            { key: "about", label: "About", value: state.member.about ? state.member.about : "",type:"textarea" },
            { key: "facebook", label: "Facebook", value: state.member.facebook ? state.member.facebook : "" },

            { key: "instagram", label: "Instagram", value: state.member.instagram ? state.member.instagram : "" },
            { key: "pinterest", label: "Pinterest", value: state.member.pinterest ? state.member.pinterest : "" },
            { key: "twitter", label: "Twitter", value: state.member.twitter ? state.member.twitter : "" },
            
        )
       
        let initalValues = {}

        //get current values of fields

        formFields.forEach(item => {
            initalValues[item.key] = item.value
        })

        return (
            <React.Fragment>
                <div ref={myRef}>
                <Form
                    editItem={state.member}
                    className="form"
                    title={state.title}
                    initalValues={initalValues}
                    validators={validator}
                    {...props}
                    submitText={!state.submitting ? "Save Changes" : "Saving Changes..."}
                    model={formFields}
                    generalError={state.error}
                    onSubmit={model => {
                        onSubmit(model);
                    }}
                />
                </div>
            </React.Fragment>
        )
    }

;

export default Profile