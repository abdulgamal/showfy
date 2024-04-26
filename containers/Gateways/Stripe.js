import React,{useReducer,useEffect} from 'react'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./StripeCheckoutForm";

const Stripe = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      promise: null,
    }
  );
  useEffect(() => {
    setState({
      promise: loadStripe(props.stripekey),
    });
  }, []);

  if (!state.promise) {
    return null;
  }
  return (
    <Elements stripe={state.promise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default Stripe;
