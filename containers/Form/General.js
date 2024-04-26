import React,{useReducer,useEffect,useRef} from 'react'
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"
import Translate from "../../components/Translate/Index";
import timezones  from "../../utils/timezone";
import OtpInput from 'react18-otp-input';


const General = (props) => {
    const myRef = useRef(null)

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            title: "General Settings",
            success: false,
            error: null,
            loading: true,
            member: props.member,
            submitting: false,
            disableButtonSubmit:false,
            otpTimer:0
        }
    );
    useEffect(() => {
        const otpFn = data => {
            let email = data.email
            let code = data.code
            let phone = data.phone
            let error = data.error
            if(email == state.newEmail && phone == state.newPhone && !error){
                if(state.resendInterval){
                    clearInterval(state.resendInterval)
                }
                const resendInterval = setInterval(
                    () => updateResendTimer(),
                    1000
                );
                setState({orgCode:code,otpTimer:0,disableButtonSubmit:false,resendInterval:resendInterval})
                
                //set timer to resend code
            }else if(error){
                if(state.resendInterval){
                    clearInterval(state.resendInterval)
                }
                setState({
                    error: Translate(props, error),
                    otpValidate: false,
                    otpValue:"",
                    otpError:false
                });
            }
       }
        props.socket.on('otpCode',otpFn);
        return () => props.socket.off('otpCode',otpFn);
    },[state.newEmail,state.newPhone])
    
    const updateResendTimer = () => {
        if(state.otpTimer >= 60){
            setState({disableButtonSubmit:true,otpTimer:0})
            clearInterval(state.resendInterval)
        }else{
            setState({otpTimer:state.otpTimer+1})
        }
    }
    const updateUser = model => {
        if(state.resendInterval){
            clearInterval(state.resendInterval)
        }
        let formData = new FormData();
        for (var key in model) {
            if (model[key])
                formData.append(key, model[key]);
        }

        formData.append("user_id", state.member.user_id)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }; 
        let url = '/members/edit';

        setState({ submitting: true, error: null,otpValidate: false,
            otpValue:"",
            otpError:false });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    setState({ submitting: false });
                    props.openToast({message:Translate(props,response.data.message),type: "success"});
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    }
    const onSubmit = model => {
        if (state.submitting) {
            return
        }

        if(model["phone_number"] && model['phone_number'] != state.member.phone_number && props.pageData.appSettings['twillio_enable'] == 1){
            //validate phone number
            validatePhoneNumber(model)
        }else{
            updateUser(model);
        }
    };

    const validatePhoneNumber = async (model) => {
        resendOTP(model)
        setState({otpValidate:true,newEmail:model.email,newPhone:model.phone_number,model:model});
    }
    
    const closePopup = (e) => {
        setState({ otpValidate: false,otpValue:"",otpError:false,otpTimer:0})
    }
    const resendOTP = model => {
        if(state.otpTimer != 0){
            return;
        }
        //SEND FORM REQUEST
        const querystring = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        querystring.append("email",model.email);
        querystring.append("phone",model.phone_number);

        querystring.append("user_id",state.member.user_id)

        if(!state.member.phone_number){
            querystring.append("type",'add');
        }else if(model['phone_number'] != state.member.phone_number){
            querystring.append("type",'edit');
        }

        axios.post("/users/otp", querystring, config)
            .then(response => {
                
            }).catch(err => {
                
            });
    }
    const codeValidate = () => {
        if(state.otpValue && state.orgCode && state.otpValue == state.orgCode){
            updateUser(state.model)
        }
    }
    const handleOTPChange = (value) => {
        setState({otpValue:value,otpError:false})
    }

        let validator = []

        validator.push(
        {
            key: "email",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Email is required field"
                }
            ]
        })
        let formFields = []

        let ages = []
        ages.push({ key: 0, value: 0, label: "Select Age" })
        for (let j = 1; j < 100; j++) {
            ages.push({ key: j, label: j, value: j })
        }

        let timezone = []

        timezones.timezones.forEach(item => {
            timezone.push({ key: item.value, label: item.label, value: item.value })
        })

        if (props.pageData.levelPermissions['member.username'] == 1) {
            validator.push({
                key: "username",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Username is required field"
                    }
                ]
            })
            formFields.push({ key: "username", label: "Username", value: state.member.username,isRequired:true })
        }



        formFields.push(
            
            { key: "email", label: "Email", value: state.member.email,isRequired:true },
            {
                key: "gender", label: "Gender", type: "select", options: [
                    {
                        value: "male", label: "Male", key: "gender_1"
                    },
                    {
                        value: "female", label: "Female", key: "gender_2"
                    }
                ],
                value: state.member.gender
            },
            {
                key: "age", label: "Age", type: "select", options: ages,
                value: state.member.age ? state.member.age : 0
            }
        )
        if(props.pageData.appSettings['twillio_enable'] == 1){
            if(props.pageData.appSettings["signup_phone_number_required"] == 1){
                validator.push({
                    key: "phone_number",
                    validations: [
                        {
                            "validator": Validator.required,
                            "message": "Phone Number should not be empty."
                        }
                    ]
                })
            }
            formFields.push({ key: "phone_number",type: "phone_number", label: "Phone Number", value: state.member.phone_number,isRequired: props.pageData.appSettings["signup_phone_number_required"] == 1 ? true : false })
        }
        formFields.push(
            {
                key: "timezone", label: "Timezone", type: "select", options: timezone,
                value: state.member.timezone ? state.member.timezone : props.pageData.appSettings["member_default_timezone"]
            }
        )
        
        

        if(props.pageData.appSettings['video_donation'] == 1 && props.pageData.levelPermissions['video.donation'] == 1){
            formFields.push({ key: "paypal_email", label: "Donation PayPal Email", value: state.member.paypal_email })
        }
        if (props.pageData.levels && props.pageData.loggedInUserDetails.level_id == 1 && state.member.level_id != 1) {
            let levels = []

            props.pageData.levels.forEach(level => {
                levels.push({
                    value: level.level_id, label: level.title, key: "level_" + level.level_id
                })
            })

            formFields.push({
                key: "level_id", label: "Level", type: "select", options: levels,
                value: state.member.level_id
            })
        }
        if (props.pageData.loggedInUserDetails.level_id == 1 && state.member.verificationFunctionality) {
            formFields.push({
                key: "verified", label: "Verification", type: "select", options: [
                    {
                        value: "1", label: "Verified", key: "verify_1"
                    },
                    {
                        value: "0", label: "Not Verified", key: "verify_2"
                    }
                ],
                value: state.member.verified
            })
        }
        if (props.pageData.appSettings['whitelist_domain'] == 1) {
            formFields.push({ key: "whitelist_domain", type:"textarea", removeAIBtn:true, label: "Whitelist Domain for Privacy(enter comman seprated domain name only eg:www.xyz.com)", value: state.member.whitelist_domain })
        }
        formFields.push({
            key: "search",
            label: "",
            type: "checkbox",
            subtype:"single",
            options: [
                {
                    value: "1", label: "Do not display me in searches.", key: "search_1"
                }
            ],
            value: [state.member.search.toString() == "1" ? "0" : "1"]
        })
        if(props.pageData.appSettings['enable_comment_approve'] == 1){
            let comments = []
            comments.push({ value: "1", key: "comment_1", label: "Display automatically" })
            comments.push({ value: "0", key: "comment_0", label: "Don't display until approved" })
            formFields.push({
                key: "comments",
                label: "Comments Setting",
                type: "select",
                value:  state.member.autoapprove_comments.toString(),
                options: comments
            })
        }

        let initalValues = {}

        //get current values of fields

        formFields.forEach(item => {
            initalValues[item.key] = item.value
        })


        let otpHMTL = null

        if(state.otpValidate){
            otpHMTL = <div className="popup_wrapper_cnt">
                            <div className="popup_cnt otp-cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap phone-otp">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{Translate(props,"Enter Verification Code")}</h2>
                                            <a onClick={closePopup} className="_close"><i></i></a>
                                        </div>
                                        <p>{props.t("Verification code is valid for {{expiration_time}}.",{expiration_time:`${60 - state.otpTimer} seconds`})}</p>
                                        <OtpInput
                                            value={state.otpValue}
                                            onChange={handleOTPChange}
                                            numInputs={4}
                                            placeholder="0000"
                                            inputStyle="form-control"
                                            hasErrored={state.otpError ? true : false}
                                            isInputNum={true}
                                            separator={<span>-</span>}
                                        />
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label"></label>
                                            <button type="submit" onClick={codeValidate}>{Translate(props,"Validate Code")}</button>
                                            <button type="submit" onClick={resendOTP} disabled={!state.disableButtonSubmit} >{Translate(props,"Resend Code")}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>            
        }


        return (
            <React.Fragment>
                {
                    otpHMTL
                }
                <div ref={myRef}>
                <Form
                    editItem={state.editItem}
                    className="form"
                    title={state.title}
                    initalValues={initalValues}
                    validators={validator}
                    {...props}
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