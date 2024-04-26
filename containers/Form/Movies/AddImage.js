import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../../components/DynamicForm/Index'
import Validator from '../../../validators';
import axios from "../../../axios-orders"

const AddImage = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            season_id:props.season_id,
            image:props.image
        }
    );
    const onSubmit = model => {
        if (state.submitting) {
            return
        }

        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        //image        
        formData.append("season_id",state.season_id);
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/seasons/upload-image';
        
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, submitting: false });
                } else {
                    props.closeAddImageCreate({...response.data.item},response.data.message)
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });

    }


        let validator = [{
            key: "image",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Upload Image is required field."
                }
            ]
        }]
        
        let imageUrl = null
        if(state.image && state.image){
            if(state.image.indexOf("http://") == 0 || state.image.indexOf("https://") == 0){
                imageUrl = state.image
            }else{
                imageUrl = props.pageData.imageSuffix+state.image
            }
        }

        let formFields = [            
            { key: "image", label: "Upload Image", type: "file", value: state.image ? state.image : "" }
        ]


        
        
        let defaultValues = {}
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
        
        return (
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
        )

        
    }

export default AddImage