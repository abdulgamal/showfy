import React, { useReducer } from "react";
import axios from "../../axios-site";
import Translate from "../../components/Translate/Index";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      submitting: false,
      loaded:false,
      name:props.pageData.loggedInUserDetails.displayname,
      email:props.pageData.loggedInUserDetails.email,
      phone:(props.pageData.loggedInUserDetails.phone_number ?? "")
    }
  );
  const submit = (e) => {
    e.preventDefault();
    if (state.submitting) {
      return;
    }
    setState({ submitting: true });
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    formData.append("name", state.name);
    formData.append("phone", state.phone);
    formData.append("email", state.email);
   
    axios
      .post(props.url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({ errorMessage: response.data.error, submitting: false });
        } else {
            setState({ errorMessage: null, submitting: false });
            if(props.aamarpayBackend){
              if(response.data.successURL)
               window.location.href = response.data.successURL;
              else{
                setState({errorMessage: response.data.error})
              }
              }else if(props.flutterwaveBackend){
                let responseData = response.data
                props.closePopup();
                let modal = FlutterwaveCheckout({
                    public_key: responseData.key,
                    tx_ref: Date.now(),
                    amount: responseData.amount,
                    currency: responseData.currency,
                    payment_options: responseData.options,
                    customer: {
                        email: state.email,
                        phone_number: state.phone,
                        name: state.name,
                    },
                    customizations: {
                        title: responseData.title,
                    },
                    callback: function (data) {

                        let formData = new FormData();
                        const config = {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        };
                        formData.append("transaction_id", data.transaction_id);
                        formData.append("amount", data.amount);
                        formData.append("currency", data.currency);
                        formData.append("tx_ref", data.tx_ref);
                    
                        axios
                        .post(`/ads/successulPayment?type=flutterwave&gateway=8`, formData, config)
                        .then((response) => {
                            if (response.data.error) {

                            }else{
                                modal.close();
                                props.success();
                            }
                        });                        
                    }, 
                    onclose: () => {
                        modal.close();
                    } 
                });

            }else if(!props.razorpayBackend){
            let sessionID = response.data.payment_session_id
            let successURL = response.data.successURL

            const cashfree = Cashfree({ mode: response.data.mode });
            cashfree
                .checkout({
                    paymentSessionId: sessionID,
                    returnUrl: successURL,
                    redirectTarget: "_self"
                })
                .then(function () {
                    
                });
            }else{
                var options = {
                    "key": response.data.key,
                    "amount": response.data.amount,
                    "currency": response.data.currency,
                    "name": props.t("Wallet Recharge"),
                    "order_id": response.data.order_id,
                    "handler": function (response){
                        let formData = new FormData();
                        const config = {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        };
                        formData.append("razorpay_payment_id", response.razorpay_payment_id);
                        formData.append("razorpay_order_id", response.razorpay_order_id);
                        formData.append("razorpay_signature", response.razorpay_signature);
                    
                        axios
                        .post("/ads/successulPayment?gateway=7", formData, config)
                        .then((response) => {
                            let responseData = response.data
                            if(responseData.error){
                                setState({errorMessage: responseData.error})
                            }else{
                                props.success();
                            }
                        });


                    },
                    "prefill": {
                        "name": state.name,
                        "email": state.email,
                        "contact": state.phone
                    },
                    "theme": {
                        "color": "#3399cc"
                    }
                };
                var rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    setState({errorMessage:response.error.reason})
                });
                rzp1.open();
            }

        }
      })
      .catch((err) => {});
  }

  return (
    <div className="popup_wrapper_cnt">
      <div className="popup_cnt">
        <div className="comments">
          <div className="VideoDetails-commentWrap">
            <div className="popup_wrapper_cnt_header">
              <h2>{Translate(props, "Cashfree")}</h2>
              {!state.submitting ? (
                <a onClick={props.closePopup} className="_close">
                  <i></i>
                </a>
              ) : null}
            </div>
            {state.errorMessage ? (
              <p className="error" style={{ marginLeft: "20px" }}>
                {Translate(props, state.errorMessage)}
              </p>
            ) : null}
            <div className="user_wallet">
                <div className="row">
                    <form onSubmit={submit} className="col-10">
                        <div className="form-group">
                            <label htmlFor="name" className="control-label">{Translate(props, "Name:")}</label>
                            <input type="text" id="name" placeholder={Translate(props, "Name")} className="form-control" value={state.name} onChange={(e) => {
                                setState({ name:e.target.value})
                            }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="control-label">{Translate(props, "Email:")}</label>
                            <input type="email" id="email" placeholder={Translate(props, "Email ID")} className="form-control" value={state.email} onChange={(e) => {
                                setState({ email:e.target.value})
                            }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone" className="control-label">{Translate(props, "Phone Number:")}</label>
                            <input type="text" placeholder={Translate(props, "Phone Number")} id="phone" className="form-control" value={state.phone} onChange={(e) => {
                                setState({ phone:e.target.value})
                            }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name" className="control-label"></label>
                            <button type="submit" disabled={state.submitting}>{Translate(props, "Submit")}</button>
                        </div>
                    </form>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
