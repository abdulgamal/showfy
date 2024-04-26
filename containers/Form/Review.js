import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"

const Review = (props) => {
    const myRef = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: "",
            editItem: props.editItem,
            success: false,
            error: null,
            submitting: false,
            movie_id:props.movie_id
        }
    );
    const onSubmit = async model => {
        if (state.submitting) {
            return
        }
        setState({ submitting: true, error: null });
        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movie/review/create';
        if (state.editItem) {
            formData.append("review_id", state.editItem.review_id)
        } 
        formData.append("movie_id", state.movie_id)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                   props.closePopup();
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };

   
        
        let validator = []

        validator.push({
            key: "rating",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Rating is required field"
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
        
        formFields.push(
            { key: "rating", type:"rating" ,label: "Rating", value: state.editItem ? parseInt(state.editItem.rating) : 0,isRequired:true },
            { key: "description", label: "Description", type: "textarea", value: state.editItem ? state.editItem.description : "",isRequired:true },
        )            
        
        let defaultValues = {}
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
           
        return (
            <React.Fragment>
                {
                    <div ref={myRef}>
                        <Form
                            editItem={state.editItem}
                            className="form"
                            title={state.title}
                            defaultValues={defaultValues}
                            validators={validator}
                            {...props}
                            generalError={state.error}
                            submitText={!state.submitting ? "Submit" : "Submit..."}
                            model={formFields}
                            onSubmit={model => {
                                onSubmit(model);
                            }}
                        />
                    </div>
                }
            </React.Fragment>
        )
    }

export default Review