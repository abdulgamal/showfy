import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import axios from "../../axios-orders"
import Currency from "../Upgrade/Currency"
import Translate from "../../components/Translate/Index";

const Monetization = (props) => {
    const myRef = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: "Monetization Settings",
            success: false,
            error: null,
            loading: true,
            member: props.member,
            submitting: false,
            requestSend:props.member.monetizationRequestSend ? props.member.monetizationRequestSend : null
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

        if(parseInt(model['monetization']) == parseInt(state.member.monetization)){
            return
        }

        formData.append("user_id", state.member.user_id)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/members/monetization';

        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else if(response.data.request == 1){
                    setState({ submitting: false,requestSend:response.data.message });
                }else{
                    setState({ submitting: false });
                    props.openToast({message:Translate(props,response.data.message), type:"success"});
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };



        if(state.requestSend){
            return (
                <div className="alert alert-success" role="alert">
                {props.t(state.requestSend)}
                </div>
            )
        }
        let validator = []
        let formFields = []
        let perclick = {}
        perclick['package'] = { price: props.pageData.appSettings['ads_cost_publisher'] }        

        formFields.push({
            key: "monetization",
            label: "",
            type: "checkbox",
            subtype:"single",
            value: [state.member.monetization ? "1" : "0"],
            options: [
              {
                value: "1",
                label: "Enable Monetization",
                key: "monetization_1"
              }
            ]
          },
          {
            key: "res_type_1",
            type: "content",
            content: '<h6 className="custom-control">' + props.t("Earn {{data}} for each advertisement click you get from your videos!",{data:"("+Currency({...props,...perclick}).replace("<!-- -->","")+")"}) + '</h6>'
        });
        
        

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


export default Monetization