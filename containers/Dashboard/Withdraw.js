import React,{useReducer,useEffect,useRef} from 'react'
import dynamic from 'next/dynamic'

import Router from 'next/router';
import Translate from "../../components/Translate/Index"


import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Currency from "../Upgrade/Currency"
import swal from "sweetalert"
import Date from "../Date"

const Withdraw = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            pagging: props.pageData.items.pagging,
            items: props.pageData.items.results,
            canEdit: props.pageData.canEdit,
            canDelete: props.pageData.canDelete,
            page: 1,
            fields: props.pageData.searchData,
            submitting: false,
            member: props.member
        }
    );

    useEffect(() => {
        if (props.pageData.searchData != state.searchData) {
            setState({ submitting: false, page: 2, pagging: props.pageData.items.pagging, items: props.pageData.items.results })
        }
    },[props.pageData.searchData])

    useEffect(() => {
        let userAs = props.pageData.user ? `?user=${props.pageData.user}` : "";
        $(document).on("click",'.open_balance',function() {
            Router.push(
                `/dashboard/balance${userAs}`,
            )
        })
    },[])

    const loadMoreContent = () => {
        setState({ loading: true })
        let formData = new FormData();
        if(state.member){
            formData.append('owner_id',state.member.user_id)
        }
        formData.append('page', state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = `/members/withdraws`;
        let queryString = ""
        if (props.pageData.searchData) {
            queryString = Object.keys(props.pageData.searchData).map(key => key + '=' + props.pageData.searchData[key]).join('&');
            url = `${url}?${queryString}`
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.items) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, items: [...state.items, ...response.data.items], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }

    
    const deleteFn = (withdraw_id, e) => {
        e.preventDefault()
        swal({
            title: Translate(props, "Are you sure?"),
            text: Translate(props, "Once deleted, you will not be able to recover this!"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('withdraw_id', withdraw_id)
                    formData.append('user_id', state.member.user_id)
                    const url = "/members/withdraw-delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props, "Something went wrong, please try again later", "error"));
                            } else {
                                const itemIndex = getItemIndex(withdraw_id)
                                if (itemIndex > -1) {
                                    const items = [...state.items]
                                    items.splice(itemIndex, 1);
                                    setState({ items: items })
                                }
                            }
                        }).catch(err => {
                            swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    const getItemIndex = (item_id) => {
        const items = [...state.items];
        const itemIndex = items.findIndex(p => p["withdraw_id"] == item_id);
        return itemIndex;
    }
    const change = (e) => {
        const fields = { ...state.fields }
        fields[e.target.id] = e.target.value
        setState({ fields: fields })
    }
    const submitForm = (e, isType) => {
        if (e)
            e.preventDefault()
        if (state.submitting) {
            return;
        }
        setState({ submitting: true, items: [], pagging: false })
        const values = {}
        for (var key in state.fields) {
            if (state.fields[key] && state.fields[key] != "") {
                let keyName = key
                values[keyName] = state.fields[key]
            }
        }
        var queryString = Object.keys(values).map(key => key + '=' + values[key]).join('&');

        let user = props.pageData.user ? `user=${props.pageData.user}` : "";

        Router.push(
            `/dashboard/withdraw?${queryString}${queryString ? "&" : ""}${user}`,
        )
    }
        let results = state.items.map(item => {
            let spent = {}
            spent['package'] = { price: item.amount }
            spent["currency_value"] = item.change_rate
            spent["currency_symbol"] = item.currency_symbol
            let title = ""
            if(item.type == "paypal"){
                title = Translate(props, "Paypal: ")+item.email
            }else{
                title = Translate(props, "Bank Transfer:\n")+item.bank_transfer
            }

            return (
                <tr key={item.withdraw_id}>
                    <td style={{whiteSpace: "pre-wrap"}}>{title}</td>
                    <td>{Currency({...props,...spent}).replace("<!-- -->","")}</td>
                    <td>
                        {
                                item.status == 1 ?
                                Translate(props, "Approved")
                                    :
                                    item.status == 2 ?
                                        Translate(props, "Rejected")
                                            : Translate(props, "Processing")
                        }
                    </td>
                    <td>
                        {
                            <span dangerouslySetInnerHTML={{__html:Date(props,item.creation_date,props.initialLanguage,'dddd, MMMM Do YYYY',props.pageData.defaultTimezone)}}></span>
                        }    
                    </td>
                    <td>
                        <div className="actionBtn">
                            <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={(e) => deleteFn(item.withdraw_id,e)}><span className="material-icons" data-icon="delete"></span></a>
                        </div>
                    </td>
                </tr>
            )
        })
        
        return (
            <React.Fragment>
                <button className="custom-control open_balance" href="#">{props.t("Back to balance")}</button>
                <div className="row">
                    <div className="col-12">
                        <div className="grid-menu justify-content-between search-form">
                            <form onSubmit={submitForm}>
                                <div className="form-group col-xs-3 col-md-3">
                                    <label htmlFor="status" className="control-label">{Translate(props, "Status")}</label>
                                    <select className="form-control form-select" id="status" value={state.fields.status ? state.fields.status : ""} onChange={(e) => change(e) }>
                                        <option key={""} value="">{Translate(props, "")}</option>
                                        <option key="0" value={"0"}>{Translate(props, "Processing")}</option>
                                        <option key="1" value={"1"}>{Translate(props, "Approved")}</option>
                                        <option key="2" value={"2"}>{Translate(props, "Rejected")}</option>

                                    </select>
                                </div>

                                <div className="form-group col-xs-3 col-md-3">
                                    <label htmlFor="name" className="control-label" style={{ marginTop: "21px" }}>{"  "}</label>
                                    <input type="submit" value={Translate(props, "Search")} style={{ display: "block" }} />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
               <div className="container">
                    <div className="row">
                        <div className="col-md-12">                                
                            <InfiniteScroll
                                className=""
                                dataLength={state.items.length}
                                next={loadMoreContent}
                                hasMore={state.pagging}
                                loader={<LoadMore {...props} page={state.page} loading={true} itemCount={state.items.length} />}
                                endMessage={
                                    <EndContent {...props} text={Translate(props,'No data found to display.')}  itemCount={state.items.length} />
                                }
                                pullDownToRefresh={false}
                                pullDownToRefreshContent={<Release release={false} {...props} />}
                                releaseToRefreshContent={<Release release={true} {...props} />}
                            >
                                <div className="table-responsive">
                                <table className="table custTble1">
                                    <thead>
                                        <tr>
                                            <th scope="col">{Translate(props,"Type")}</th>
                                            <th scope="col">{Translate(props,"Amount")}</th>
                                            <th scope="col">{Translate(props,"Status")}</th>
                                            <th scope="col">{Translate(props,"Creation Date")}</th>
                                            <th scope="col">{Translate(props,"Options")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results}
                                    </tbody>
                                </table>
                                </div>
                            </InfiniteScroll>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        )
    }

export default Withdraw