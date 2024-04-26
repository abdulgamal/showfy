import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index" 
import dynamic from 'next/dynamic'
const imageCompression = dynamic(() => import("browser-image-compression"), {
    ssr: false
});
const Playlist = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: props.editItem ? "" : "",
            editItem: props.editItem,
            success: false,
            error: null,
            loading: props.editItem ? false : true,
            channel_id: "",
            submitting: false
        }
    );
    const onSubmit = async model => {
        if (state.submitting) {
            return
        }
        setState({ submitting: true, error: null });
        let formData = new FormData();
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
                formData.append('postImage',image)
            }
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/post/create';
        if (state.editItem) {
            url = "/post/create";
            formData.append("post_id", state.editItem.post_id)
        } else {
            formData.append("channel_id", props.channel_id)
        }
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, submitting: false });
                } else {
                    props.openToast({message:Translate(props,response.data.message), type:"success"});
                    props.closePOst(response.data.postData)                    
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };

  
        
        let validator = []

        if (!state.playlist_id) {
            validator.push({
                key: "title",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Message is required field"
                    }
                ]
            },
            {
                key: "image",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Upload Image is required field"
                    }
                ]
            })
        }
        let formFields = []
        
            formFields.push(
                { key: "title", label: "Message",type:"textarea", value: props.editItem ? props.editItem.title : "",isRequired:true },
                { key: "image", label: "Upload Image", type: "file", value: props.editItem && props.editItem.image ? props.imageSuffix+props.editItem.image : "",isRequired:true })

           
        let defaultValues = {}
        formFields.forEach((elem) => {
            if (elem.value)
                defaultValues[elem.key] = elem.value
        })
        
        return (
            <React.Fragment>
                {
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
                }
            </React.Fragment>
        )
    }


export default Playlist