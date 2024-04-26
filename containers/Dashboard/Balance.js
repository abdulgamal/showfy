import React,{useReducer,useEffect} from 'react'
import BalanceForm from "../Form/Balance"
import Withdraw from "./Withdraw"
const Balance = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type:props.type
        }
    );

    useEffect(() => {
        if (props.type != state.type) {
            setState({ type:props.type })
        }
    },[props.type])

   
        return state.type == "balance" ? <BalanceForm {...props} /> : <Withdraw {...props} />
}

export default Balance