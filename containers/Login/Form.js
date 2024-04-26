import React,{useReducer,useEffect,useRef,useState} from 'react'
import Link from "../../components/Link/index";
import dynamic from 'next/dynamic'
import Router,{withRouter} from 'next/router';
import axios from "../../axios-orders"
import SocialLogin from "../SocialLogin/Index"
import Translate from "../../components/Translate/Index"
// import PhoneInput,{ isValidPhoneNumber } from 'react-phone-number-input'

const PhoneInput = dynamic(() => import("react-phone-number-input"), {
    ssr: false
});


import 'react-phone-number-input/style.css'
import OtpInput from 'react18-otp-input';

import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';


const Form = (props) => {
    const [isReadonly, setIsReadonly] = useState(true);

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            email:"",
            password:"",
            passwordError:null,
            emailError:null,
            isSubmit:false,
            previousUrl:typeof window != "undefined" ? (props.currentURL ? props.currentURL : Router.asPath) : "",
            verifyAgain:false,
            verifyEmail:"",
            otpEnable:props.pageData.appSettings['twillio_enable'] == 1,
            type:"email",
            phone_number:"",
            disableButtonSubmit:false,
            otpTimer:0,
            getCaptchaToken:true,
            firstToken:true,
            keyCaptcha:1
        }
    );
    const resendInterval = useRef()
    resendInterval.current = null

    const stateRef = useRef();
    stateRef.current = state
    useEffect(() => {
        $(document).on('click','.verificationLink',function(e){
            e.preventDefault();
            Router.push(`/verify-account`)
        })

        props.socket.on('otpCode',data => {
            let code = data.code
            let phone = data.phone
            let error = data.error
            if(phone == stateRef.current.phone_number && !error){
                setState({orgCode:code,otpTimer:0,disableButtonSubmit:false})
                setTimeout(() => {
                    if(resendInterval.current){
                        clearInterval(resendInterval.current)
                    }
                    resendInterval.current = setInterval(
                        () => updateResendTimer(),
                        1000
                    );
                })
                //set timer to resend code
            }else if(error){
                if(resendInterval.current){
                    clearInterval(resendInterval.current)
                }
                setState({
                    emailError: Translate(props, error),
                    otpValidate: false,
                    otpVerificationValidate:false,
                    otpValue:"",
                    otpError:false
                });
            }
        });

        return () => {
            if(stateRef.current.orgCode){
                //remove code
            const querystring = new FormData();
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
    
            querystring.append("phone",stateRef.current.phone_number);
            querystring.append("type",'login');
            querystring.append("code",stateRef.current.orgCode);
    
            axios.post("/auth/remove-otp", querystring, config)
                .then(response => {
                    
                }).catch(err => {
                    
                });
            }
        }
    },[])
   
    const onChange = (e,type) => {
         (type == "email" ? setState({"email":e.target.value}) : setState({"password":e.target.value}))
    }
    const forgot = () => {
        try{
            if($('#loginpop').css('display') == 'block')
                document.getElementById("closeloginRgtrBoxPopupForm").click();
            if($('#registerpop').css('display') == 'block')
                document.getElementById("closeregistertrBoxPopupForm").click();
        }catch(err){
            console.log(err)
        }
    }
   
    const updateResendTimer = () => {
        if(stateRef.current.otpTimer >= 60){
            setState({disableButtonSubmit:true,otpTimer:0})
            clearInterval(resendInterval.current)
        }else{
            setState({otpTimer:stateRef.current.otpTimer+1})
        }
    }
    const onSubmit = (e) => {
        e.preventDefault();
        if(state.isSubmit){
            return false;
        }
        let valid = true
        let emailError = null
        if(!state.otpEnable){
            if(!state.email){
                //email error
                emailError = Translate(props,"Please enter valid Email ID or Username/Password.")
                valid  = false
            }else if(state.email){
                // const pattern =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                // if(!pattern.test( state.email )){
                //     //invalid email
                //     emailError = Translate(props,"Please enter valid Email ID or Username/Password.")
                //     valid  = false
                // }
            }
            if(!state.password){
                //email error
                emailError = Translate(props,"Please enter valid Email ID or Username/Password.")
                valid  = false
            }
        }else{
            if(state.type == "email"){
                if(!state.email){
                    //email error
                    emailError = Translate(props,"Please enter valid Email ID or Username/Password.")
                    valid  = false
                }
                if(!state.password){
                    //email error
                    emailError = Translate(props,"Please enter valid Email ID or Username/Password.")
                    valid  = false
                }
            }else{
                if(!state.phone_number){
                    //email error
                    emailError = Translate(props,"Enter valid Phone Number.")
                    valid  = false
                }else{
                    let checkError = false;//PhoneInput.isValidPhoneNumber(state.phone_number) ? undefined : 'Invalid phone number';
                    if(checkError){
                        valid = false
                        emailError = Translate(props, "Enter valid Phone Number.")
                    }
                }
            }
        }
        
        
        setState({emailError:emailError,verifyEmail:state.email,verifyAgain:false})

        if(valid){
            
            if(props.pageData.appSettings["recaptcha_enable"] == 1 && props.pageData.appSettings["recaptcha_login_enable"] == 1){
                let isSubmit = true;
                if(state.type != "email"){
                    //validate phone number
                    validatePhoneNumber()
                    isSubmit = false;
                }else{
                    loginUser();
                }
                setState({isSubmit:isSubmit});
            }else if(state.type != "email"){
                //validate phone number
                validatePhoneNumber()
            }else{
                loginUser();
            }
        }

        return false
    }
    const loginUser = async () => {
        if(resendInterval.current){
            clearInterval(resendInterval.current)
        }
        setState({isSubmit:true,otpValidate: false,otpValue:"",otpError:false})

        //SEND FORM REQUEST
        const querystring = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        if(state.type == "email"){
            querystring.append("email",state.email);
            querystring.append("password",state.password);
        } else {
            querystring.append("phone_number",state.phone_number)
            querystring.append("code",state.orgCode)
        }

        
        if(props.pageData.appSettings["recaptcha_enable"] == 1 && props.pageData.appSettings["recaptcha_login_enable"] == 1){
            const { executeRecaptcha } = props.googleReCaptchaProps;
            const result = await executeRecaptcha("login");
            querystring.append("captchaToken",result);
        }
        

        axios.post("/login", querystring,config)
            .then(response => {
                setState({isSubmit:false})
                if(response.data.error){
                    //error
                    try{
                        setState({emailError:Translate(props,response.data.error[0].message),verifyAgain:response.data.verifyAgain})
                    }catch(err){
                        setState({emailError:Translate(props,"Please enter valid Email ID or Username/Password.")})
                    }
                }else{
                    const { BroadcastChannel } = require('broadcast-channel');
                    const currentPath = Router.asPath;
                    const userChannel = new BroadcastChannel('user');
                    userChannel.postMessage({
                        payload: {
                            type: "LOGIN"
                        }
                    });
                    //success  
                    $("body").removeClass("modal-open");
                    $("body").removeAttr("style");
                    $('.loginRgtrBoxPopupForm').find('button').eq(0).trigger('click')
                    // if(currentPath == "/" || currentPath == "/login")
                    //     Router.push('/')
                    // else{
                    //     Router.push( state.previousUrl ? state.previousUrl : Router.asPath)
                    // }
                }
            })
            .catch(err => {
                setState({emailError:Translate(props,"Please enter valid Email ID or Username/Password.")})
                //error
            });
    }
    const validatePhoneNumber = async () => {
        resendOTP() 
        setState({otpValidate:true});
    }
    
    const closePopup = (e) => {
        setState({ otpValidate: false,otpValue:"",otpError:false,otpTimer:0})
    }
    const resendOTP = () => {
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

        querystring.append("phone",state.phone_number);
        querystring.append("type",'login');

        axios.post("/users/otp", querystring, config)
            .then(response => {
                
            }).catch(err => {
                
            });
    }
    const codeValidate = () => {
        if(state.otpValue && state.orgCode && state.otpValue == state.orgCode){
            loginUser()
        }
    }
    const handleOTPChange = (value) => {
        setState({otpValue:value,otpError:false})
    }

    const verification = (e) => {
        e.preventDefault();
        if(state.type != "email"){
            verificationPhoneNumber();
        }else{
            sendVerification();
        }
    }
    const sendVerification = () => {
        if(state.verificationResend){
            return
        }
        setState({verificationResend:true})
        //SEND FORM REQUEST
        const querystring = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        if(state.type == "email")
            querystring.append("email",state.verifyEmail);
        else
         querystring.append("phone",state.phone_number);

        axios.post("/resendVerification", querystring,config)
            .then(response => {
                setState({verificationResend:false})
                if(response.data.success){
                    //error
                    try{
                        setState({verifyAgain:false,emailError:null})
                        if(response.data.code){
                            Router.push(`/verify-account/${response.data.code}`)
                        }
                    }catch(err){
                        
                    }
                }else{
                    
                }
            })
            .catch(err => {
                
                //error
            });
    }

    const verificationPhoneNumber = async () => {
        resendVerificationOTP()
        setState({otpVerificationValidate:true});
    }
    
    const closeVerificationPopup = (e) => {
        setState({ otpVerificationValidate: false,otpValue:"",otpError:false,otpTimer:0})
    }
    const resendVerificationOTP = () => {
        
        //SEND FORM REQUEST
        const querystring = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        querystring.append("phone",state.phone_number);
        querystring.append("type",'verification');

        axios.post("/users/otp", querystring, config)
            .then(response => {
                
            }).catch(err => {
                
            });
    }
    const codeVerificationValidate = () => {
        if(state.otpValue && state.orgCode && state.otpValue == state.orgCode){
            sendVerification()
        }
    }

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

        let otpHVerificationMTL = null

        if(state.otpVerificationValidate){
            otpHVerificationMTL = <div className="popup_wrapper_cnt">
                            <div className="popup_cnt otp-cnt">
                                <div className="comments">
                                    <div className="VideoDetails-commentWrap phone-otp">
                                        <div className="popup_wrapper_cnt_header">
                                            <h2>{Translate(props,"Enter Verification Code")}</h2>
                                            <a onClick={closeVerificationPopup} className="_close"><i></i></a>
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
                                            <button type="submit" onClick={codeVerificationValidate}>{Translate(props,"Validate Code")}</button>
                                            <button type="submit" onClick={resendVerificationOTP} disabled={!state.disableButtonSubmit} >{Translate(props,"Resend Code")}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>            
        }
        return (
            <React.Fragment>
                {
                    otpHVerificationMTL
                }
                {
                    otpHMTL
                }
                {
                        props.pageData.appSettings['member_registeration'] == 1 ? 
                <SocialLogin {...props} />
                : null
                }
                <div className="form loginBox">
                     {
                        state.successVerification ? 
                            <p className="form_error" style={{color: "green",margin: "0px",fontSize: "16px"}}>{state.successVerification}</p>
                        : null
                    }
                    {
                        state.emailError ? 
                        <p className="form_error" style={{color: "red",margin: "0px",fontSize: "16px"}}>{state.emailError}</p>
                    : null
                    }
                    {
                        state.verifyAgain ? 
                            <p className="form_error" style={{color: "green",margin: "0px",fontSize: "16px"}}>
                                {
                                    <a href="#" onClick={verification}>
                                        {
                                            props.t("Click here")
                                        }
                                    </a>
                                    
                                }
                                {
                                    props.t(" to resend verification email.")
                                }
                            </p>
                        : null
                    }
                    <form onSubmit={onSubmit}>
                        {
                            !state.otpEnable ? 
                                <React.Fragment>
                                    <div className="input-group">
                                        <input className="form-control" type="text" onChange={(e) => onChange(e,'email')} autoComplete="off" readOnly={isReadonly} onClick={e => setIsReadonly(false)} value={state.email} placeholder={Translate(props,"Email / Username")} name="email" />
                                    </div>
                                    <div className="input-group">
                                        <input className="form-control" autoComplete="off" type="password" onChange={(e) => onChange(e,'password')} value={state.password} placeholder={Translate(props,"Password")}
                                            name="password" />
                                            
                                    </div>
                                    
                                    <div className="input-group">
                                        <button className="btn btn-default btn-login" type="submit">
                                            {
                                                state.isSubmit ? 
                                                Translate(props,"Login ...")
                                                    : Translate(props,"Login")
                                            }
                                        </button>
                                    </div>
                                </React.Fragment>
                        : 
                        <React.Fragment>
                            {
                                !state.passwordEnable ? 
                                    state.type == "email" ?
                                        <div className="input-group">
                                            <input className="form-control" type="text" onChange={(e) => onChange(e,'email')} value={state.email} placeholder={Translate(props,"Email / Username")} readOnly={isReadonly} onClick={e => setIsReadonly(false)} name="email" />
                                        </div>
                                        :
                                        <div className="input-group">                                            
                                            <PhoneInput
                                                countryCallingCodeEditable={false}
                                                countrySelectProps={{ unicodeFlags: true }}
                                                placeholder={Translate(props,"Phone Number")}
                                                value={state.phone_number}
                                                onChange={ (value) => setState({"phone_number":value})}
                                            />
                                        </div>
                                : null
                            }
                            {
                                state.type == "email" ? 
                                    <div className="input-group">
                                        <input className="form-control" autoComplete="off" type="password" onChange={(e) => onChange(e,'password')} value={state.password} placeholder={Translate(props,"Password")}
                                            name="password" />
                                            
                                    </div>
                                : null
                            }
                            {
                                state.type == "email" ? 
                                <div className="input-group" onClick={() => setState({email:"",type:"phone",emailError:null,verifyAgain:false })}><p className="choose-option">{Translate(props,'Use Phone Number')}</p></div>
                                :
                                <div className="input-group" onClick={() => setState({phone_number:"",type:"email",emailError:null,verifyAgain:false})}><p className="choose-option">{Translate(props,'Use Email Address')}</p></div>
                            }
                            
                            <div className="input-group">
                                <button className="btn btn-default btn-login" type="submit">
                                    {
                                        state.type == "email" ?
                                        state.isSubmit ? 
                                        Translate(props,"Login ...")
                                            : Translate(props,"Login")
                                        : 
                                        Translate(props,"Continue")
                                    }
                                </button>
                            </div>
                        </React.Fragment>
                        }
                    </form>
                </div>
                <div className="forgot">
                    {
                        props.pageData.appSettings['member_registeration'] == 1 ? 
                        props.router.asPath == "/login" || props.router.asPath == "/signup" || props.user_login == 1 || props.pageData.page_type == "login" ? 
                            <Link href="/signup">
                                <a>{Translate(props,"create an account?")}</a>
                            </Link>
                        : 
                        <a href="/signup" data-bs-dismiss="modal" data-bs-target="#registerpop" data-bs-toggle="modal" id="signupbtn">{Translate(props,"create an account?")}</a>
                        : null
                    }
                    <Link href="/forgot">
                        <a className="forgot-btn" onClick={forgot}>{Translate(props,"forgot password?")}</a>
                    </Link>
                </div>
            </React.Fragment>
        )
    }

export default withRouter(withGoogleReCaptcha(Form))