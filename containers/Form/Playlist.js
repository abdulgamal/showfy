import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import LoadMore from "../LoadMore/Index"
import Breadcrum from "../../components/Breadcrumb/Form"
import dynamic from 'next/dynamic'
import Router from 'next/router';
const imageCompression = dynamic(() => import("browser-image-compression"), {
    ssr: false
});
import Translate from "../../components/Translate/Index" 
import Currency from "../Upgrade/Currency"

const Playlist = (props) => {
    const myRef = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: props.pageData.editItem ? "Edit Playlist" : "",
            editItem: props.pageData.editItem,
            success: false,
            error: null,
            loading: props.pageData.editItem ? false : true,
            playlists: [],
            playlist_id: "",
            submitting: false,
            plans:props.pageData.plans ? props.pageData.plans : []
        }
    );
    useEffect(() => {
        if (state.editItem) {
            return
        }
        setState({ loading: true })
        const formData = new FormData()
        formData.append('video_id', props.video_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        axios.post("/playlist-video-check", formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ loading: false, error: response.data.error });
                } else {
                    setState({ loading: false, playlists: response.data.playlists,plans: response.data.plans ? response.data.plans : []})
                }
            }).catch(err => {
                setState({ loading: false, error: err });
            });
    },[])
    
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
                formData.append('playlistImage',image)
            }
        }
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/playlists/create';
        if (state.editItem) {
            formData.append("playlist_id", state.editItem.playlist_id)
        } else {
            formData.append("video_id", props.video_id)
        }
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    
                    if (state.editItem) {
                        Router.push(`/playlist/${response.data.custom_url}`)
                        props.openToast({message:Translate(props,response.data.message), type:"success"});
                    } else{
                        props.openPlaylist({videoId:0,status:false})
                        props.openToast({message:Translate(props,response.data.message), type:"success"});
                    }
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };

    const onPlaylistChange = (id) => {
        setState({ playlist_id: id })
    }

        if (state.loading) {
            return <LoadMore loading={true} />
        }
        let validator = []

        if (!state.playlist_id) {
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
                })
        }
        let formFields = []
        if (!state.editItem) {
            let playlists = [{ key: "0", label: "Create New Playlist", value: "" }]
            state.playlists.forEach(res => {
                playlists.push({ key: res.playlist_id, label: res.title, value: res.playlist_id })
            })
            formFields.push({
                key: "playlist_id",
                label: "Playlist",
                type: "select",
                onChangeFunction: onPlaylistChange,
                options: playlists
            })
        }
        if (!state.playlist_id) {
            formFields.push(
                { key: "title", label: "Title", value: props.pageData.editItem ? props.pageData.editItem.title : "",isRequired:true },
                { key: "description", label: "Description", type: "textarea", value: props.pageData.editItem ? props.pageData.editItem.description : "",isRequired:true },
                { key: "image", label: "Upload Image", type: "file", value: props.pageData.editItem && props.pageData.editItem.image ? props.pageData.imageSuffix+props.pageData.editItem.image : "" })

            if (props.pageData.appSettings.playlist_adult == "1") {
                formFields.push({
                    key: "adult",
                    subtype:"single",
                    label: "",
                    value: [props.pageData.editItem && props.pageData.editItem.adult == 1 ? "1" : "0"],
                    type: "checkbox",
                    options: [
                        {
                            value: "1", label: "Mark Playlist as Adult", key: "adult_1"
                        }
                    ]
                })
            }
            if(props.pageData.appSettings['enable_comment_approve'] == 1){
                let comments = []
                comments.push({ value: "1", key: "comment_1", label: "Display automatically" })
                comments.push({ value: "0", key: "comment_0", label: "Don't display until approved" })
                formFields.push({
                    key: "comments",
                    label: "Comments Setting",
                    type: "select",
                    value: props.pageData.editItem ? props.pageData.editItem.autoapprove_comments.toString() : "1",
                    options: comments
                })
            }
            formFields.push({
                key: "private",
                label: "",
                subtype:"single",
                value: [props.pageData.editItem && props.pageData.editItem.private == 1 ? "1" : "0"],
                type: "checkbox",
                options: [
                    {
                        value: "1", label: "Mark Playlist as Private", key: "private_1"
                    }
                ]
            })

            let privacyOptions = [{
                value:"",label:"",key:"default value"
            }]
            if(state.plans.length > 0){
                state.plans.forEach(item => {
                    let perprice = {}
                    perprice['package'] = { price: item.price }
                    privacyOptions.push({
                        value:"package_"+item.member_plan_id,label:props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...props,...perprice}).replace("<!-- -->","")}),key:"package_"+item.member_plan_id
                    })
                })
                formFields.push({
                    key: "privacy",
                    label: "Privacy",
                    type: "select",
                    value:state.editItem ? state.editItem.view_privacy : "everyone",
                    options: privacyOptions
                })
            }
        }
        let defaultValues = {}
        formFields.forEach((elem) => {
            if (elem.value)
                defaultValues[elem.key] = elem.value
        })
        if(!state.editItem)
            defaultValues["playlist_id"] = state.playlist_id
        return (
            <React.Fragment>
                {
                    state.editItem ?
                    <React.Fragment>
                        <Breadcrum {...props}  image={props.pageData['pageInfo']['banner'] ? props.pageData['pageInfo']['banner'] : props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={Translate(props,`${state.editItem ? "Edit" : ""} Playlist`)} />
                        <div className="mainContentWrap">
                            <div className="container">
                            <div className="row">
                                <div className="col-md-12 position-relative">
                                <div className="formBoxtop loginp content-form" ref={myRef}>
                                    <Form
                                        editItem={state.editItem}
                                        className="form"
                                        //title={state.title}
                                        defaultValues={defaultValues}
                                        validators={validator}
                                        {...props}
                                        submitText={!state.submitting ? "Submit" : "Submitting..."}
                                        model={formFields}
                                        onSubmit={model => {
                                            onSubmit(model);
                                        }}
                                    />
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </React.Fragment>                       
                    :
                    <div ref={myRef}>
                    <Form
                        className="form"
                        editItem={state.editItem}
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

export default Playlist