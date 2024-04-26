import React,{useReducer} from 'react'
import axios from "../../axios-orders"
import Router from 'next/router';
import Link from "../../components/Link/index";

import Translate from "../../components/Translate/Index"

const Form = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            password: "",
            error: null,
            confirmPassword: "",
            isSubmit: false,
        }
    );
    const onChange = (type, e) => {
        if (type == "password")
            setState({ "password": e.target.value })
        else
            setState({ "confirmPassword": e.target.value })
    }
    const onSubmit = (e) => {
        e.preventDefault()
        if (state.isSubmit) {
            return
        }
        let formData = new FormData();
        if (!state.password) {
            return
        }

        if (state.password != state.confirmPassword) {
            setState({ error: Translate(props, "New Password and New Confirm Password should match.") })
            return
        }

        formData.append("password", state.confirmPassword)
        formData.append("code", props.pageData.code)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/reset';

        setState({ isSubmit: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, isSubmit: false });
                } else {
                    props.openToast({message:Translate(props, "Password Changed successfully."), type:"success"})
                    setTimeout(() => {
                        Router.push("/")
                    },2000)
                }
            }).catch(err => {
                setState({ isSubmit: false, error: "error" });
            });
    };

        return (
            <React.Fragment>
                    <div className="titleBarTop">
                        <div className="titleBarTopBg">
                            <img src={props.pageData['pageInfo']['banner'] ? props.pageData.imageSuffix+props.pageData['pageInfo']['banner'] : props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} alt={props.t("Reset Password")} />
                        </div>
                        <div className="overlay">
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-10 offset-md-1">
                                        <div className="titleHeadng">
                                            <h1>{props.t("Reset Password")} <i className="fas fa-sign-in-alt"></i></h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mainContentWrap">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-10 offset-md-1 position-relative">
                                    <div className="formBoxtop loginp">
                                        {
                                            <React.Fragment>
                                                <div className="form loginBox">
                                                    {
                                                        state.error ?
                                                            <p className="form_error" style={{ color: "red", margin: "0px", fontSize: "16px" }}>{state.error}</p>
                                                            : null
                                                    }
                                                    <form onSubmit={onSubmit}>
                                                        <div className="input-group">
                                                            <input className="form-control" type="password" autoComplete="off" onChange={(e) => onChange( 'password',e)} value={state.password} placeholder={Translate(props, "New Password")} name="password" />
                                                        </div>
                                                        <div className="input-group">
                                                            <input className="form-control" type="password" autoComplete="off" onChange={(e) => onChange('confirmPassword',e)} value={state.confirmPassword} placeholder={Translate(props, "Confirm Password")} name="confirmPassword" />
                                                        </div>
                                                       
                                                        <div className="input-group forgotBtnBlock">
                                                                <button className="btn btn-default btn-login" type="submit">
                                                                {
                                                                    state.isSubmit ?
                                                                        Translate(props, "Changing Password ...")
                                                                        : Translate(props, "Change Password")
                                                                }
                                                                </button> {props.t("or")} <Link href="/" ><a href="/">{Translate(props, "cancel")}</a></Link>
                                                            </div>
                                                    </form>
                                                </div>
                                            </React.Fragment>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </React.Fragment>
        )
    }

export default Form