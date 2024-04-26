import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../../components/DynamicForm/Index'
import Validator from '../../../validators';
import axios from "../../../axios-orders"

const AddEpisode = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            season_id:props.season_id,
            editItem:props.editItem,
            movie:props.movie
        }
    );
    useEffect(() => {
        if(props.editItem != state.editItem || props.movie != state.movie || props.season_id != state.season_id)
        setState({
            season_id:props.season_id,
            editItem:props.editItem,
            movie:props.movie             
        })
    },[props.season_id,props.editItem,props.movie])
    

    const onSubmit = model => {
        if (state.submitting) {
            return
        }

        let formData = new FormData();
        for (var key in model) {
            if(key == "release_date"){
                if(model[key]){
                    formData.append(key, new Date(model[key]).toJSON().slice(0,10));
                }
            }else if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        //image
        if (model['image']) {
            let image = typeof model['image'] == "string" ? model['image'] : false
            if (image) {
                formData.append('episodeImage', image)
            }
        }
        formData.append("movie_id",state.movie.movie_id);
        formData.append("season_id",state.season_id);
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/episode/create';
        if (state.editItem) {
            formData.append("episode_id", state.editItem.episode_id)
        }
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, submitting: false });
                } else {
                    props.closeEpisodeCreate({...response.data.item},response.data.message)
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });

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
            },
            {
                key: "episode_number",
                validations: [
                    {
                        "validator": Validator.int,
                        "message": "Episode Number is required field"
                    }
                ]
            },
            {
                key: "release_date",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Release Date is required field"
                    }
                ]
            }
        ]

        let imageUrl = null
        if(state.editItem && state.editItem.orgImage){
            if(state.editItem.image.indexOf("http://") == 0 || state.editItem.image.indexOf("https://") == 0){
                imageUrl = state.editItem.image
            }else{
                imageUrl = props.pageData.imageSuffix+state.editItem.image
            }
        }
        let formFields = [
            { key: "title", label: "Title", value: state.editItem ? state.editItem.title : null ,isRequired:true},
            { key: "episode_number", type:"number", label: "Episode Number", value: state.editItem ? state.editItem.episode_number : null ,isRequired:true},
            { key: "description", label: "Description", type: "textarea", value: state.editItem ? state.editItem.description : null },
            { key: "image", label: "Upload Image", type: "file", value: imageUrl },
            { key: "release_date", label: "Release Date", type: "date", value: state.editItem && state.editItem.release_date ? new Date(state.editItem.release_date)  : "",isRequired:true }
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



export default AddEpisode