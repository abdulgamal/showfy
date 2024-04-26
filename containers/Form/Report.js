import React,{useReducer,useEffect,useRef} from 'react'
import { useSelector } from "react-redux";

import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import LoadMore from "../LoadMore/Index"
import Translate from "../../components/Translate/Index";



const Report = (props) => {
    const myRef = useRef(null)
    let report = useSelector((state) => {
        return state.report;
      });
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: "",
            success: false,
            error: null,
            loading: true,
            types: [],
            submitting: false,
            reportmessage_id:""
        }
    );
    useEffect(() => {
        const formData = new FormData()
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        formData.append('types', 1)
        axios.post("/report", formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ loading: false, error: response.data.error });
                } else {
                    setState({ loading: false, types: response.data.types })
                }
            }).catch(err => {
                setState({ loading: false, error: err });
            });
    },[])
    
    const onSubmit = model => {
        if (state.submitting) {
            return
        }
        let formData = new FormData();
        for (var key in model) {
            formData.append(key, model[key]);
        }

        formData.append("id", report.contentId)
        formData.append("type", report.contentType)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/report';

        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    props.openToast({message:Translate(props,response.data.message), type:"success"});
                    props.openReport({status:false})
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };

    const onTypeChange = (id) => {
        setState({ reportmessage_id: id })
    }

        if (state.loading) {
            return <LoadMore loading={true} />
        }
        let validator = []
        validator.push({
            key: "reportmessage_id",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Report content is required field"
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
        })
        let formFields = []
        let types = [{ key: "0", label: "Select Type", value: "0" }]
        state.types.forEach(res => {
            types.push({  key: res.reportmessage_id, label: res.description, value: res.reportmessage_id })
        })
        formFields.push({
            key: "reportmessage_id",
            label: "Report content",
            type: "select",
            options: types
            ,isRequired:true
        })
        formFields.push({removeAIBtn:true, key: "description", label: "Description", type: "textarea",isRequired:true })
         const defaultValues = {}
        defaultValues["reportmessage_id"] = ""
        defaultValues["description"] = ""
        return (
            <React.Fragment>
                <div ref={myRef}>
                <Form
                    editItem={state.editItem}
                    className="form"
                    title={state.title}
                    initalValues={defaultValues}
                    {...props}
                    validators={validator}
                    submitText={!state.submitting ? "Submit Report" : "Submitting Report..."}
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



export default Report