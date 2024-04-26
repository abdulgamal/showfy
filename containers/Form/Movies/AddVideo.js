import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../../components/DynamicForm/Index'
import Validator from '../../../validators';
import axios from "../../../axios-orders"

const AddVideo = (props) => {
    const myRef = useRef(null)
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            editItem: props.editItem,
            title: props.editItem ? "Edit Video" : "Create Video",
            season_id: props.editItem ? props.editItem.season_id : "",
            movie_id: props.movie_id,
            episode_id: props.editItem ? props.editItem.episode_id : "",
            success: false,
            error: null,
            seasons:props.seasons ? props.seasons : [],
            type:props.editItem ? props.editItem.type : "upload",
        }
    );
    useEffect(() => {
        setState({ 
            seasons:props.seasons ? props.seasons : [],
            editItem: props.editItem,
            title: props.editItem ? "Edit Video" : "Create Video",
            season_id: props.editItem ? props.editItem.season_id : "",
            episode_id: props.editItem ? props.editItem.episode_id : "",
            success: false,
            error: null,
            movie_id: props.movie_id,
            type:props.editItem ? props.editItem.type : "upload",
        })
    },[props.editItem])
    
   
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    const uploadMedia = (e) => {
        let res_field = e.name
       var extension = res_field.substr(res_field.lastIndexOf('.') + 1).toLowerCase();
       var allowedExtensions = ['mp4','mov','webm','mpeg','3gp','avi','flv','ogg','mkv','mk3d','mks','wmv'];
        if (allowedExtensions.indexOf(extension) === -1) 
        {
            alert(props.t('Invalid file Format. Only {{data}} are allowed.',{data:allowedExtensions.join(', ')}));
            return false;
        }else if( parseInt(props.pageData.appSettings['movie_upload_limit'])  > 0 && e.size > parseInt(props.pageData.appSettings['movie_upload_limit'])*1000000){
            alert(props.t('Maximum upload limit is {{upload_limit}}',{upload_limit:formatBytes(parseInt(props.pageData.appSettings['movie_upload_limit'])*1000000)}));
            return false;
        }
        onSubmitUploadImport({ "upload": e })
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

        let url = '/movies/videos/' + key;
        
        setState({ validating: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({percentCompleted:0,processing:false, error: response.data.error, validating: false });
                } else {
                    setState({updateValues:true,percentCompleted:0,processing:false, videoWidth: response.data.videoWidth, validating: false, id: response.data.id, success: true, videoTitle: response.data.name, videoImage: response.data.images[0] });
                    
                }
            }).catch(err => {
                setState({ validating: false, error: err });
            });
    }
    const onSubmit = model => {
        
        if (state.submitting || state.validating) {
            return
        }
        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined" && key != "upload")
                formData.append(key, model[key]);
        }
        if (state.id) {
            formData.append("id", state.id)
            formData.append("videoResolution", state.videoWidth)
        }

         //image
         if (model['image']) {
            let image = typeof model['image'] == "string" ? model['image'] : false
            if (image) {
                formData.append('videoImage', image)
            }
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = '/movies/video/create';
        if (state.editItem) {
            formData.append("fromEdit", 1)
            formData.append("fromEditType", state.editItem.type)
            formData.append("id", state.editItem.movie_video_id)
        }
        formData.append("movie_id", state.movie_id)
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    props.closeCreate({...response.data.item},response.data.message)
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };
    const titleUpdate = (value) => {
        setState({ currentTitle:value })
    }
    const onTypeChange = (value) => {
        setState({ type:value })
    }
    const onEpisodChange = (value) => {
        setState({ episode_id:value })
    }
    const onSeasonChange = (value) => {
        setState({ season_id:value,episode_id:"" })
    }
    const imageUpload = (value) => {
        setState({imageExists:true,videoImage:null});
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
            
        ]

        let imageUrl = null
        if(state.editItem && state.editItem.image){
            if(state.editItem.image.indexOf("http://") == 0 || state.editItem.image.indexOf("https://") == 0){
                imageUrl = state.editItem.image
            }else{
                imageUrl = props.pageData.imageSuffix+state.editItem.image
            }
        }

        let formFields = []
        if(!state.editItem){
            validator.push(
                {
                    key: "type",
                    validations: [
                        {
                            "validator": Validator.required,
                            "message": "Type is required field"
                        }
                    ]
                }
            )
            let types = []
            types.push({ key: 0, value: "", label: "Please Select Video Type" })
            if(props.pageData.levelPermissions['movie.embedcode'] == 1)
                types.push({ key: 1, value: "embed", label: "Embed" })
            types.push({ key: 2, value: 'upload', label: "Upload Video" })
            types.push({ key: 3, value: 'direct', label: "Adaptive Stream (hls, mp4 url)" })
            types.push({ key: 4, value: 'external', label: "Outside URL" })
                formFields.push({
                    key: "type",
                    label: "Video Type",
                    type: "select",
                    value: state.type,
                    onChangeFunction: onTypeChange,
                    isRequired:true,
                    options: types
                }
            )
            if(state.type == "embed" && props.pageData.levelPermissions['movie.embedcode'] == 1){
                validator.push({
                    key: "code",
                    validations: [
                        {
                            "validator": Validator.required,
                            "message": "Embed Code is required field"
                        }
                    ]
                })
                formFields.push({
                    key: "code", label: "Embed Code",type:"textarea", value: state.editItem ? state.editItem.code : "",isRequired:true
                })
            }else if(state.type == "upload"){
                validator.push({
                    key: "upload",
                    validations: [
                        {
                            "validator": Validator.required,
                            "message": "Video File is required field"
                        }
                    ]
                })
                formFields.push({ key: "upload", label: "", type: "video", defaultText: "Drag & Drop Video File Here", onChangeFunction: uploadMedia,isRequired:true })
            }else if(state.type == "direct"){
                validator.push({
                    key: "code",
                    validations: [
                        {
                            "validator": Validator.required,
                            "message": "URL is required field"
                        }
                    ]
                })
                formFields.push({
                    key: "code", label: "URL", value: state.editItem ? state.editItem.code : "",isRequired:true
                })
            }else if(state.type == "external"){
                validator.push({
                    key: "code",
                    validations: [
                        {
                            "validator": Validator.required,
                            "message": "URL is required field"
                        }
                    ]
                })
                formFields.push({
                    key: "code", label: "URL", value: state.editItem ? state.editItem.code : "",isRequired:true
                })
            }
        }
        // validator.push(
        // {
        //     key: "image",
        //     validations: [
        //         {
        //             "validator": Validator.required,
        //             "message": "Image is required field"
        //         }
        //     ]
        // })
        formFields.push(
            { key: "title", label: "Title", value: state.editItem ? state.editItem.title : "", onChangeFunction:titleUpdate,isRequired:true },
        );
        formFields.push({ key: "image", label: "Upload Image", type: "file", value: imageUrl,onChangeFunction:imageUpload })
        
        
        let groupData1 = []
        let languages = []
        if(props.pageData.spokenLanguage){
            languages.push({ key: 0, value: 0, label: "Please Select Language" })
            props.pageData.spokenLanguage.forEach(lan => {
                languages.push({ key: lan.code, label: lan.name, value: lan.code })
            })
            groupData1.push({
                key: "language",
                label: "Language",
                type: "select",
                value: state.editItem ? state.editItem.language : "",
                options: languages
            });
        }

        groupData1.push({
            key: "quality",
            label: "Quality",
            value: state.editItem ? state.editItem.quality : "",
            type: "select",
            options: [
                {
                    key:"none",value:"",label:"None"
                },
                {
                    key:"regular",value:"regular",label:"Regular"
                },
                {
                    key:"SD",value:"SD",label:"SD"
                },
                {
                    key:"HD",value:"HD",label:"HD"
                },
                {
                    key:"720p",value:"720p",label:"720p"
                },
                {
                    key:"1080p",value:"1080p",label:"1080p"
                },
                {
                    key:"4k",value:"4k",label:"4k"
                }
            ]
        })

        formFields.push({
            key:"group_data",
            keyValue:"group_1",
            values:groupData1
        })

        //if(props.pageData.selectType == "movie"){
            formFields.push({
                key: "category",
                label: "Category",
                value: state.editItem && state.editItem.category ? state.editItem.category : "trailer",
                type: "select",
                options: [
                    
                    {
                        key:"trailer",value:"trailer",label:"Trailer"
                    },
                    {
                        key:"clip",value:"clip",label:"Clip"
                    },
                    {
                        key:"featurette",value:"featurette",label:"Featurette"
                    },
                    {
                        key:"teaser",value:"teaser",label:"Teaser"
                    },
                    {
                        key:"full",value:"full",label:"Full Movie or Episode"
                    }
                ]
            })
        //}

        if(state.seasons.length > 0){
            let groupData2 = []
            let seasons = []
            let episodes = []
            seasons.push({ key: 0, value: "", label: "Please Select Season" })
            episodes.push({ key: 0, value: "", label: "Please Select Episode" })

            state.seasons.forEach((item,index) => {
                seasons.push({key: item.season_id, value: item.season_id, label: `${index+1}`.length < 2 ? "S0"+(index+1) : "S"+(index+1)})
                if(item.season_id == state.season_id && item.episodes.length > 0){
                    item.episodes.forEach((item,index) => {
                        episodes.push({key: item.episode_id, value: item.episode_id, label: `${item.episode_number}`.length < 2 ? "E0"+(item.episode_number) : "E"+(item.episode_number)})
                    })
                }
            })
            
            groupData2.push({
                key: "season_id",
                label: "Season Number",
                type: "select",
                value: state.season_id,
                onChangeFunction: onSeasonChange,
                isRequired:true,
                options: seasons
            })

            // validator.push({
            //     key: "episode_id",
            //     validations: [
            //         {
            //             "validator": Validator.required,
            //             "message": "Episode Number is required field"
            //         }
            //     ]
            // },
            // {
            //     key: "season_id",
            //     validations: [
            //         {
            //             "validator": Validator.required,
            //             "message": "Season Number is required field"
            //         }
            //     ]
            // }
            // )
            
            
            groupData2.push({
                key: "episode_id",
                label: "Episode Number",
                type: "select",
                value: state.episode_id,
                onChangeFunction: onEpisodChange,
                isRequired:true,
                options: episodes
            })

            formFields.push({
                key:"group_data",
                keyValue:"group_2",
                values:groupData2
            })
        }
        let defaultValues = {}
        formFields.forEach((elem) => {
            if(elem.key == "group_data"){
                elem.values.forEach((ele) => {
                    if(ele.value)
                        defaultValues[ele.key] = ele.value
                    else
                        defaultValues[ele.key] = ""
                })
            }else if (elem.value)
                defaultValues[elem.key] = elem.value
            else
                defaultValues[elem.key] = ""
        })
        

        if(state.episode_id){
            defaultValues['episode_id'] = state.episode_id
        }else{
            defaultValues['episode_id'] = ""
        }
        if(state.season_id){
            defaultValues['season_id'] = state.season_id
        }else{
            defaultValues['season_id'] = ""
        }
        if(state.type){
            defaultValues['type'] = state.type
        }else{
            defaultValues['type'] = 2
        }
        if(state.updateValues){
            defaultValues = {}
            if(state.episode_id){
                defaultValues['episode_id'] = state.episode_id
            }else{
                defaultValues['episode_id'] = ""
            }
            if(state.season_id){
                defaultValues['season_id'] = state.season_id
            }else{
                defaultValues['season_id'] = ""
            }
            if(state.type){
                defaultValues['type'] = state.type
            }else{
                defaultValues['type'] = 2
            }
            if(state.videoImage && !state.imageExists){
                defaultValues['image'] = state.videoImage
            }
            if(state.videoTitle && !state.currentTitle){
                defaultValues['title'] = state.videoTitle
            }
        }
        
        return (
            <div ref={myRef}>
                
                <Form
                    editItem={state.editItem}
                    className="form"
                    {...props}
                    videoKey="upload"
                    //title={state.title}
                    defaultValues={defaultValues}
                    updatedValues={state.updateValues ? defaultValues : null}
                    parentComponentUpdate={() => {
                        setState({updateValues:false})
                    }}
                    validators={validator}
                    generalError={state.error}
                    submitText={!state.submitting ? "Submit" : "Submit..."}
                    model={formFields}
                    percentCompleted={state.percentCompleted}
                    processing={state.processing}
                    textProgress="Video is processing, this may take few minutes."
                    onSubmit={model => {
                        onSubmit(model);
                    }}
                />
                      
            </div>
        )
    }



export default AddVideo