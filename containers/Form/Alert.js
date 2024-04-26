import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";

const General = (props) => {
    const myRef = useRef(null)
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: props.type.charAt(0).toUpperCase() + props.type.slice(1) + " Alert",
            success: false,
            error: null,
            loading: true,
            notificationTypes: props.notificationTypes,
            submitting: false,
            member: props.member,
            type:["videos"]
        }
    );
    const getIndex = (type) => {
        const types = [...state.type];
        const index = types.findIndex(p => p == type);
        return index;
    }
    useEffect(() => {
        $(document).on('click','.change_type',function(e){
            e.preventDefault()
            let type = $(this).attr('rel')
            const types = [...state.type]
            let index = getIndex(type)
            if(index > -1){
                types.splice(index, 1);
            }else{
                types.push(type)
            }
            setState({type:types})
        });
    },[])
   
    const onSubmit = model => {
        if (state.submitting) {
            return
        }
        let formData = new FormData();
        let values = []
        for (var key in model) {
            if (model[key])
                values.push(model[key])
        }
        const selectedValues = values.join(',')
        const disableValues = []
        state.notificationTypes.forEach(value => {
            if(selectedValues.indexOf(value.type) < 0){
                disableValues.push(value.type)
            }
        })
        formData.append("user_id", state.member.user_id)
        formData.append('types',disableValues.join(','))


        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/dashboard/' + props.type;

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



        let formFields = []
        let fields = []
        let type = ""
        let index = 0
        let initalValues = {}
        let lastIndexType = ""
        state.notificationTypes.forEach(res => {
            if (type != res.content_type) {
                if (index != 0 && state.type.indexOf(type) > -1) {
                    formFields.push({
                        key: "settings_" + lastIndexType,
                        label: "",
                        type: "checkbox",
                        options: fields,
                    })
                }
                formFields.push({
                    key: "res_type_" + res.content_type,
                    type: "content",
                    content: '<a href="#" class="change_type" rel="'+res.content_type+'"><h4 class="custom-control">' + Translate(props,res.content_type.charAt(0).toUpperCase() + res.content_type.slice(1)) + (state.type.indexOf(res.content_type) < 0 ? '<span class="material-icons alert_icon" data-icon="arrow_right"></span>' : '<span class="material-icons alert_icon" data-icon="arrow_drop_down"></span>') + '</h4></a>'
                })
                type = res.content_type
                fields = []
            }
            if (!initalValues["settings_" + res.content_type])
                initalValues["settings_" + res.content_type] = []
            if(res.enable)
            initalValues["settings_" + res.content_type].push(res.type.toString())
            fields.push({ value: res.type.toString(), key: res.type, label: Translate(props,res.type) })
            lastIndexType = res.content_type
            index = index + 1
        })
        if(state.type.indexOf(lastIndexType) > -1){
            formFields.push({
                key: "settings_" + lastIndexType,
                label: "",
                type: "checkbox",
                options: fields
            })
        }
        return (
            <React.Fragment>
                <div ref={myRef}>
                    <Form
                         editItem={state.editItem}
                        className="form"
                        {...props}
                        title={state.title}
                        initalValues={initalValues}
                        validators={[]}
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


export default General