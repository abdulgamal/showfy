import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";


const Password = (props) => {
    const myRef = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: "Change Password",
            success: false,
            error: null,
            loading: true,
            member: props.member,
            submitting: false
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

        if(model['new_password'] != model['new_confirm_password']){
            setState({error:"New Password and New Confirm Password should match."})
            return
        }

        formData.append("user_id", state.member.user_id)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/members/password';

        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    setState({ submitting: false });
                    props.openToast({message:Translate(props,response.data.message),type: "success"});
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };




        let validator = []

        validator.push({
            key: "old_password",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Old Password is required field"
                }
            ]
        },
            {
                key: "new_password",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "New Password is required field"
                    }
                ]
            },
            {
                key: "new_confirm_password",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "New Confirm Password is required field"
                    }
                ]
            })
        let formFields = []

        
        formFields.push(
            { key: "old_password", label: "Old Password", type:"password",isRequired:true },
            { key: "new_password", label: "New Password",type:"password" ,isRequired:true },
            { key: "new_confirm_password", label: "New Confirm Password",type:"password" ,isRequired:true},
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
                    editItem={state.editItem}
                    className="form"
                    title={state.title}
                    initalValues={initalValues}
                    validators={validator}
                    submitText={!state.submitting ? "Save Changes" : "Saving Changes..."}
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