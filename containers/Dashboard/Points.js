import React,{useReducer,useEffect,useRef} from 'react'
import Translate from "../../components/Translate/Index";
import swal from "sweetalert"
import axios from "../../axios-orders"
import Router from 'next/router';
import Currency from "../Upgrade/Currency"

const Points = (props) => {
    

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            items:props.pageData.items ? props.pageData.items.results : [],
            points:props.member.points,
            error:null
        }
    );
    useEffect(() => {
        if (props.pageData.items != state.items) {
            setState({error:null,success:null,items:props.pageData.items ? props.pageData.items.results : [],redeem:false,points:props.pageData.member.points,pointsSubmitting:false })
        }
    },[props.pageData.items])
    
    const redeemPoints = () => {
        setState({redeem:true})
    }
    const closePopup = () => {
        setState({redeem:false})
    }
    const reddemFormSubmit = (e) => {
        e.preventDefault()

        if(state.points > props.member.points || parseFloat(state.points) == 0){
            return false;
        }

        setState({'pointsSubmitting':true});

        const formData = new FormData()
        formData.append('points', state.points)
        const url = "/member/redeem-points"
        axios.post(url, formData)
            .then(response => {
                if (response.data.error) {
                    setState({'pointsSubmitting':false,error:response.data.error});
                } else {
                    setState({'pointsSubmitting':false,success:response.data.success});
                    let user = props.pageData.user ? `user=${props.pageData.user}` : "";
                    Router.push(
                        `/dashboard/points?${user}`,
                    )
                }
            }).catch(err => {
                setState({'pointsSubmitting':false,error:null});
                swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
            });

    }
    const pointsValue = (e) => {
        if (isNaN(e.target.value) || e.target.value < 1) {
            setState({ points: parseFloat(e.target.value) })
        } else {
            setState({ points: e.target.value })
        }
    }
    const copyText = () => {
        var copyURL = document.getElementById("referralpoints");
        copyURL.select();
        document.execCommand("copy");
    }
        let type = "";

        let reedem = null

        let payPrice = {};
        payPrice["package"] = { price: parseFloat(1) };

        if (state.redeem) {
            reedem = <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Redeem Points")}</h2>
                                <a onClick={closePopup} className="_close"><i></i></a>
                            </div>
                            <div className="user_wallet">
                                <div className="row">
                                    <form onSubmit={reddemFormSubmit}>
                                        {
                                            state.error ? 
                                                <p className="error">{state.error}</p>
                                            : null
                                        }
                                        {
                                            state.success ? 
                                                <p className="success">{state.success}</p>
                                            : null
                                        }
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label">{Translate(props, "Redeem Points")}</label>
                                            <input type="number" min="1" max={props.member.points} className="form-control" value={state.points ? state.points : ""} onChange={pointsValue} />
                                            <p className="points-tip">
                                                {props.pageData.appSettings["points_value"]+` Points = ${Currency({...props,...payPrice}).replace("<!-- -->","")}`}
                                            </p>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label"></label>
                                            <button type="submit">{Translate(props, "Redeem now")}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } 

        return (
            <React.Fragment>
                {reedem}
                <div className="rewardPoint-wrap">
                    <div className="totalreward">
                        <div className="totalrwrd">
                            <div className="bg-info py-2 px-3 text-bold">
                                {props.t("Total points: {{points}}",{points:props.member.points})} 
                            </div>
                        </div>
                        {
                            props.member.user_id == props.pageData.loggedInUserDetails.user_id && parseFloat(props.pageData.appSettings["points_value"]) > 0 ?
                                <div className="rewrdRedeem">
                                    <button className="bg-danger py-2 px-3 text-bold" onClick={redeemPoints}>{props.t("Redeem Points")}</button>
                                </div>
                        : null
                        }
                    </div>
                    {
                        props.pageData.appSettings['signup_referrals'] ? 
                    <div className="referral-points">
                        <p>
                            {props.t("Referral Link")}
                        </p>
                        <div className="referral-input">
                            <input type="type" value={`${props.pageData.siteURL}/signup?affiliate=${props.pageData.loggedInUserDetails.user_id}`} readOnly id="referralpoints" />
                            <button onClick={copyText}>{props.t("Copy")}</button>
                        </div>
                        {
                            parseInt(props.pageData.appSettings['referrals_points_value']) > 0 ? 
                        <p>
                            {props.t("You will get {{points}} point(s) for every successfull referral signup.",{points:props.pageData.appSettings['referrals_points_value']})}
                        </p>
                        : null
                        }
                    </div>
                    : null
                    }
                    <table className="table">
                        <thead>
                            <tr className="points_main_heading">
                                <th>{props.t("Point Type")}</th>
                                <th>{props.t("First Time")}</th>
                                <th>{props.t("Next Time")}</th>
                                <th>{props.t("Max Points per Day")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.items.map(item => {
                                    let data = null
                                    if(type != item.resource_type){
                                        type = item.resource_type
                                        data =   <tr className="points_heading" key={item.type+item.first_time+item.next_time+"10"}>
                                                <td colSpan="4">{Translate(props,item.resource_type.charAt(0).toUpperCase() + item.resource_type.slice(1))}</td>
                                            </tr>                                    
                                    }
                                    return (
                                        <React.Fragment key={item.type+item.first_time+item.next_time+"11"}>
                                            {data}
                                            <tr className="points_tr" key={item.type+item.first_time+item.next_time+"22"}>
                                                <td className="label">{props.t(`${item.type}_points`)}</td>
                                                <td>{item.first_time}</td>
                                                <td>{item.next_time}</td>
                                                <td>{item.max}</td>
                                            </tr>
                                        </React.Fragment>                                    
                                    )
                                }) 
                            }
                        </tbody>
                    </table>
                </div>
            </React.Fragment>
        )

    }


export default Points