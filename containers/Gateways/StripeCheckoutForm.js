import React,{useReducer,useEffect,useRef} from 'react'
import { ElementsConsumer, CardElement } from "@stripe/react-stripe-js";

import CardSection from "./CardSection";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-site";

const CheckoutForm = (props) => {
   
    const [state, setState] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      {
        submitting:false
      }
  );
  const handleSubmit = async event => {
    event.preventDefault();

    if(props.subscriptionPayment){
      handleSubmitSubscription(event);
      return;
    }

    const { stripe, elements } = props;
    if (!stripe || !elements) {
      return;
    }
   
    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card);
    if (result.error) {
      setState({errorMessage:result.error.message,submitting:false});
    } else {
      setState({errorMessage:null,submitting:true})
      //result.token
        let formData = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = props.tokenURL;
        formData.append("gateway",'2');
        formData.append("stripeToken",result.token.id);
        if(props.bank_price)
          formData.append("price",props.bank_price);
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({errorMessage:response.data.error,submitting:false})
                } else {
                    props.success()
                }
            }).catch(err => {
                
            });
    }
  };
  const handleSubmitSubscription = async (e) => {
    e.preventDefault();
    const { stripe, elements } = props;
    if (!stripe || !elements) {
      return;
    }
    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        email: props.pageData.loggedInUserDetails.email,
      },
    });

    if (result.error) {
      setState({errorMessage:result.error.message,submitting:false})
    } else {
      setState({errorMessage:null,submitting:true})
      const res = await axios.post(props.tokenURL, {'payment_method': result.paymentMethod.id,gateway:"2"});
      // eslint-disable-next-line camelcase
      const {client_secret, status, error} = res.data;
      var _ = this;
      if(error){
        setState({errorMessage:error,submitting:false})
      }else if (status === 'requires_action') { 
        stripe.confirmCardPayment(client_secret).then(async function(result) {
          if (result.error) {
            setState({errorMessage:result.error.message,submitting:false})
          } else {
            const res = await axios.post(props.finishPayment);
            props.success();
          }
        });
      } else {
        props.success();
      }
    }
  };
    return (
        <div className="popup_wrapper_cnt">
            <div className="popup_cnt">
                <div className="comments">
                    <div className="VideoDetails-commentWrap">
                        <div className="popup_wrapper_cnt_header">
                            <h2>{Translate(props, "Card Details")}</h2>
                            {
                                !state.submitting ? 
                                <a onClick={props.closePopup} className="_close"><i></i></a>
                            : null
                            }
                        </div>
                        {
                            state.errorMessage ?
                            <p className="error ms-3">
                                {Translate(props,state.errorMessage)}
                            </p>
                        : null
                        }
                        <form className="stripe-form" onSubmit={handleSubmit}>
                            <CardSection {...props} />
                            <button disabled={state.submitting} className="btn-pay">
                                {Translate(props,'Pay Now')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
  }

export default function InjectedCheckoutForm(props) {
  return (
    <ElementsConsumer>
      {({ stripe, elements }) => (
        <CheckoutForm {...props} stripe={stripe} elements={elements} />
      )}
    </ElementsConsumer>
  );
}