import React from 'react';
import Breadcrum from "../components/Breadcrumb/Form"
import Router from 'next/router';
const Index = (props) => (
    // {props.pageData.type}
    <React.Fragment>
        <React.Fragment>
            <Breadcrum {...props}  image={props.pageData['pageInfo']['banner'] ? props.pageData['pageInfo']['banner'] : props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"} title={`${props.pageData.type == "success" || props.pageData.type == "completed" ? "Success" : "Error"} Payment`} />          
            <div className="mainContentWrap">
                <div className="container">
                <div className="row">
                    <div className="col-md-12 position-relative">
                        <div className="ContentBoxThankyou text-center">
                            <div className="centerDivBox-wrap"> 1
                                <div className="centerDivBoxTxt">
                                    {
                                        props.pageData.type == "approved" || props.pageData.type == "completed"  ? 
                                            <React.Fragment>
                                                <div className="IconSuccess">
                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                <h2>{props.t("Thank you!")}</h2>
                                                <p>{props.t("Thank you! Your payment has completed successfully.")}</p>
                                                    <button onClick={()=>{
                                                        Router.push("/")
                                                    }}>
                                                        {props.t("Continue")}
                                                </button>
                                            </React.Fragment>
                                        :
                                           ( props.pageData.type == "pending"  ? 
                                             <React.Fragment>
                                             <div className="IconSuccess">
                                                 <i className="fa fa-check" aria-hidden="true"></i>
                                             </div>
                                             <h2>{props.t("Payment Pending")}</h2>
                                             <p>{props.t("Thank you for submitting your payment. Your payment is currently pending - your account will be activated when we are notified that the payment has completed successfully. Please return to our login page when you receive an email notifying you that the payment has completed.")}</p>
                                             <button onClick={()=>{
                                                        Router.push("/")
                                                    }}>
                                                        {props.t("Continue")}
                                             </button>
                                         </React.Fragment>
                                            :
                                            <React.Fragment>
                                            <div className="IconFaild">
                                                    <i className="fa fa-times" aria-hidden="true"></i>
                                            </div>
                                            <h2>{props.t("Payment Failed")}</h2>
                                             <p>{props.t("Our payment processor has notified us that your payment could not be completed successfully. We suggest that you try again with another credit card or funding source.")}</p>
                                             <button onClick={()=>{
                                                Router.push("/")
                                                }}>
                                                {props.t("Continue")}
                                            </button>
                                            </React.Fragment>
                                           )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </React.Fragment>
    </React.Fragment>
)

export default Index