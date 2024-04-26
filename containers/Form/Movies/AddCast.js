import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../../components/DynamicForm/Index'
import Validator from '../../../validators';
import axios from "../../../axios-orders"
import config from "../../../config";

const AddCast = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            season_id:props.season_id,
            editItem:props.editItem,
            movie:props.movie
        }
    );
    useEffect(() => {
        if(props.season_id != props.season_id){
            setState({
                season_id:props.season_id,
                editItem:props.editItem,
                movie:props.movie    
            })
        }
    },[props.season_id])
 

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
        
        formData.append("movie_id",state.movie.movie_id);
        formData.append("season_id",state.season_id);
        if(props.fromCastnCrew){
            formData.append("fromCastnCrew",1);
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        formData.append("resource_type",props.resource_type);
        formData.append("resource_id",props.resource_id);
        let url = '/movies/episode/create-cast';
        if (state.editItem) {
            formData.append("cast_crew_member_id",state.editItem.cast_crew_member_id)
            formData.append("cast_id", state.editItem.cast_crew_id)
        }
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, submitting: false });
                } else {
                    props.closeCastCreate({...response.data.item},response.data.message)
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });

    }


        let validator = [
            
        ]
        

        let suggestionValue = []
      
        if(state.editItem){
            suggestionValue = [{title:state.editItem.name,image:state.editItem.image,id:state.editItem.cast_crew_id}]
        }
        let formFields = []
        if(!state.editItem){
            validator.push(
                {
                    key: "cast_crew_member_id",
                    validations: [
                        {
                            "validator": Validator.int,
                            "message": props.isCrew ? "Crew Member is required field" : "Cast Member is required field"
                        }
                    ]
                }
            )
            formFields.push(
                { key: "cast_crew_member_id",type:"autosuggest",id:state.editItem ? state.editItem.cast_crew_id : "",imageSuffix:props.pageData.imageSuffix,url:config.app_server+"/api/movies/cast/auto-suggest"+(props.fromCastnCrew ? "/movie" : ""),placeholder:"Search for a member...",suggestionValue:suggestionValue, label: "Cast Member", value: state.editItem ? state.editItem.name : null ,isRequired:true},
            )
        }else{
            formFields.push(
                { key: "cast_crew_member_id", type:"text", label: "Cast Member", value: state.editItem ? state.editItem.name : null ,isRequired:true, props: { disabled: "disabled" }}
            )
        }
        if(!props.isCrew){
            validator.push({
                key: "character",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Character is required field"
                    }
                ]
            });
            formFields.push(
                { key: "character", type:"text", label: "Character", value: state.editItem ? state.editItem.character : null ,isRequired:true}
            )
        }else{
            validator.push({
                key: "job",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Job is required field"
                    }
                ]
            },
            {
                key: "department",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Department is required field"
                    }
                ]
            });
            formFields.push(
                { key: "job", type:"autosuggest",departmentJob:props.pageData.departments, label: "Job", value: state.editItem ? state.editItem.job : null ,isRequired:true},
                { key: "department", type:"text", label: "Department", value: state.editItem ? state.editItem.department : null ,isRequired:true}
            )
        }
        
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



export default AddCast