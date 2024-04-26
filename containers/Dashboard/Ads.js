import React,{useReducer,useEffect,useRef} from 'react'
import Router from 'next/router';
import Translate from "../../components/Translate/Index"
import Gateways from "../Gateways/Index";

import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Currency from "../Upgrade/Currency"
import swal from "sweetalert"
import Analytics from "./AdsAnalytics"

const Ads = (props) => {
    

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            pagging: props.pageData.items.pagging,
            items: props.pageData.items.ads,
            canEdit: props.pageData.canEdit,
            canDelete: props.pageData.canDelete,
            searchData: props.pageData.searchData && Object.keys(props.pageData.searchData).length ? props.pageData.searchData : null,
            fields: props.pageData.searchData,
            page: 1,
            adsPaymentStatus: props.pageData.adsPaymentStatus,
            submitting: false,
            member: props.member,
            adsWallet:props.pageData.recharge ? true : false,
            user:props.pageData.user ? true : false,
            gateways:null
        }
    );


useEffect(() => {
    if (props.pageData.member != state.member) {
        setState({...state,gateways:null,member:props.pageData.member,submitting:false })
    }else if (props.pageData.searchData != state.searchData) {
        setState({gateways:null, submitting: false, searchData: props.pageData.searchData,fields:props.pageData.searchData, page: 2, pagging: props.pageData.items.pagging, items: props.pageData.items.ads })
    }else{
        setState({submitting:false})
    }
},[props.pageData.member,props.pageData.searchData])


    useEffect(() => {
        if (state.adsPaymentStatus) {
            if (state.adsPaymentStatus == "success") {
                swal("Success", Translate(props, "Wallet recharge successfully.", "success"));
            } else if (state.adsPaymentStatus == "fail") {
                swal("Error", Translate(props, "Something went wrong, please try again later", "error"));
            } else if (state.adsPaymentStatus == "cancel") {
                swal("Error", Translate(props, "You have cancelled the payment.", "error"));
            }
        }
    },[])
    const refreshContent = () => {
        setState({ page: 1, items: [] })
        loadMoreContent()
    }
    const loadMoreContent = (values) => {
        setState({ loading: true })
        let formData = new FormData();
        if(member){
            formData.append('owner_id',state.member.user_id)
        }
        formData.append('page', state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

        let url = `/dashboard/ads`;
        let queryString = ""
        if (props.pageData.searchData) {
            queryString = Object.keys(props.pageData.searchData).map(key => key + '=' + props.pageData.searchData[key]).join('&');
            url = `${url}?${queryString}`
        }
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.ads) {
                    let pagging = response.data.pagging
                    setState({ page: state.page + 1, pagging: pagging, ads: [...state.ads, ...response.data.ads], loading: false })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }
    const change = (e) => {
        const fields = { ...state.fields }
        fields[e.target.id] = e.target.value
        setState({ fields: fields })
    }
    const onCategoryChange = (e) => {
        const fields = { ...state.fields }
        fields['category_id'] = e.target.value
        fields['subcategory_id'] = e.target.value
        fields['subsubcategory_id'] = e.target.value
        setState({ fields: fields })
    }
    const onSubCategoryChange = (e) => {
        const fields = { ...state.fields }
        fields['subcategory_id'] = e.target.value
        fields['subsubcategory_id'] = 0
        setState({ fields: fields })
    }
    const onSubSubCategoryChange = (e) => {
        const fields = { ...state.fields }
        fields['subsubcategory_id'] = e.target.value
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
            `/dashboard/ads?${queryString}${queryString ? "&" : ""}${user}`,
        )
    }
    const changeStatus = (ad_id, e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('ad_id', ad_id)
        const url = "/ads/status"
        const itemIndex = getItemIndex(ad_id)
        if (itemIndex > -1) {
            const items = [...state.items]
            items[itemIndex]['status'] = 3
            setState({ items: items })
        }
        axios.post(url, formData)
            .then(response => {
                if (response.data.error) {
                    swal("Error", Translate(props, "Something went wrong, please try again later", "error"));
                } else {
                    const itemIndex = getItemIndex(ad_id)
                    if (itemIndex > -1) {
                        const items = [...state.items]
                        items[itemIndex]['status'] = response.data.status ? 1 : 0
                        setState({ items: items })
                    }
                }
            }).catch(err => {
                swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
            });
    }
    const deleteFn = (ad_id) => {
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
                    formData.append('ad_id', ad_id)
                    const url = "/ads/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props, "Something went wrong, please try again later", "error"));
                            } else {
                                const itemIndex = getItemIndex(ad_id)
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
        const itemIndex = items.findIndex(p => p["ad_id"] == item_id);
        return itemIndex;
    }
    const recharge = (e) => {
        setState({ adsWallet: true })
    }
    const edit = (ad_id) => {
        Router.push(
            `/create-ad/${ad_id}`,
        )
    }
    const analytics = (ad_id) => {
        setState({ analytics: true, ad_id: ad_id })
    }
    const closePopup = (e) => {
        setState({ analytics: false, ad_id: 0 })
    }
    const closeWalletPopup = (e) => {
        setState({ adsWallet: false, walletAmount: 0 })
    }
    const walletValue = (e) => {
        if (isNaN(e.target.value) || e.target.value < 1) {
            setState({ walletAmount: parseFloat(e.target.value) })
        } else {
            setState({ walletAmount: e.target.value })
        }
    }
    const walletFormSubmit = (e) => {
        e.preventDefault()
        if (!state.walletAmount) {
            return
        }
        setState({ adsWallet: false,gatewaysURL:"/ads/recharge?amount=" + encodeURI(state.walletAmount),gateways:true })

        // swal("Success", Translate(props, "Redirecting you to payment gateway...", "success"));
        // window.location.href = "/ads/recharge?amount=" + encodeURI(state.walletAmount)
    }
        let adsWallet = null
        if (state.adsWallet && !state.user) {
            adsWallet = <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Recharge Wallet")}</h2>
                                <a onClick={closeWalletPopup} className="_close"><i></i></a>
                            </div>
                            <div className="user_wallet">
                                <div className="row">
                                    <form onSubmit={walletFormSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label">{Translate(props, "Enter Amount :")}</label>
                                            <input type="text" className="form-control" value={state.walletAmount ? state.walletAmount : ""} onChange={walletValue} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label"></label>
                                            <button type="submit">{Translate(props, "Submit")}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } 

        let gatewaysHTML = ""

        if(state.gateways){
            gatewaysHTML = <Gateways {...props} success={() => {
                props.openToast({message:Translate(props, "Payment done successfully."),type: "success"});
                setTimeout(() => {
                    Router.push( `/dashboard/ads`)
                  },1000);
            }} successBank={() => {
                props.openToast({message:Translate(props, "Your bank request has been successfully sent, you will get notified once it's approved"), type:"success"});
                setState({gateways:null})
            }} bank_price={state.walletAmount} bank_type="recharge_wallet" bank_resource_type="user" bank_resource_id={props.pageData.loggedInUserDetails.username} tokenURL={`ads/successulPayment?amount=${encodeURI(state.walletAmount)}`} closePopup={() => setState({gateways:false})} gatewaysUrl={state.gatewaysURL} />
        }
        let analyticsData = null
        if (state.analytics) {
            let itemIndex = getItemIndex(state.ad_id)
            analyticsData = <div className="popup_wrapper_cnt">
                <div className="popup_cnt" style={{ maxWidth: "60%" }}>
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Analytics")}</h2>
                                <a onClick={closePopup} className="_close"><i></i></a>
                            </div>
                            <Analytics {...props} item={state.items[itemIndex]} ad_id={state.ad_id} />
                        </div>
                    </div>
                </div>
            </div>
        }

        let categories = []
        let subcategories = []
        let subsubcategories = []
        if (props.pageData.categories) {

            categories.push({ key: 0, value: Translate(props, "Please Select Category") })
            props.pageData.categories.forEach(res => {
                categories.push({ key: res.category_id, value: Translate(props, res.title) })
            })

            //get sub category
            if (state.fields.category_id) {
                props.pageData.categories.forEach(res => {
                    if (res.category_id == state.fields.category_id) {
                        if (res.subcategories) {
                            subcategories.push({ key: 0, value: Translate(props, "Please Select Sub Category") })
                            res.subcategories.forEach(rescat => {
                                subcategories.push({ key: rescat.category_id, value: Translate(props, rescat.title) })
                            })
                        }
                    }
                })


                if (subcategories.length > 0) {
                    if (state.fields.subcategory_id) {
                        props.pageData.categories.forEach(res => {
                            if (res.category_id == state.fields.category_id) {
                                if (res.subcategories) {
                                    res.subcategories.forEach(rescat => {
                                        if (rescat.category_id == state.fields.subcategory_id) {
                                            if (rescat.subsubcategories) {
                                                subsubcategories.push({ key: 0, value: Translate(props, "Please Select Sub Sub Category") })
                                                rescat.subsubcategories.forEach(ressubcat => {
                                                    subsubcategories.push({ key: ressubcat.category_id, value: Translate(props, ressubcat.title) })
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })


                    }
                }
            }
        }


        let results = state.items.map(item => {
            let spent = {}
            spent['package'] = { price: item.spent }
            return (
                <tr key={item.ad_id}>
                    <td>{item.name}</td>
                    <td>{item.title}</td>
                    <td>
                        {
                            item.completed == 1 ?
                                item.status == 3 ?
                                    <a href="#" onClick={(e) => { e.preventDefault() }}>
                                        <img style={{ width: "16px" }} src="/images/admin/loading.gif" />
                                    </a>
                                    :
                                    item.status == 1 ?
                                        <a href="#" title={Translate(props, "Disabled")} onClick={(e) => changeStatus(item.ad_id,e)}>
                                            <img src="/images/admin/check_image.png" />
                                        </a>
                                        : <a href="#" title={Translate(props, "Enabled")} onClick={(e) => changeStatus(item.ad_id,e)}>
                                            <img src="/images/admin/error_image.png" />
                                        </a>
                                :
                                Translate(props, "Processing")
                        }
                    </td>
                    <td>{item.approve ? Translate(props,'Approved') : Translate(props,'Pending')}</td>
                    <td>{item.results}{item.type == 1 ? " "+Translate(props,'Clicks') : " "+Translate(props,'Views')}</td>
                    <td>{Currency({...props,...spent}).replace("<!-- -->","")}</td>
                    <td>
                        <div className="actionBtn d-flex">
                            {
                                state.canDelete ?
                                    <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={ (e) => {e.preventDefault();deleteFn(item.ad_id);}}><span className="material-icons" data-icon="delete"></span></a>
                                    : null
                            }
                            {
                                state.canEdit ?
                                    <a href="#"  className="text-success" title={Translate(props, "Edit")} onClick={(e) => {e.preventDefault();edit(item.ad_id)}}><span className="material-icons" data-icon="edit"></span></a>
                                    : null
                            }
                            <a href="#" className="text-info" onClick={(e) => {e.preventDefault();analytics(item.ad_id)}} title={Translate(props, "Analytics")}>
                                <span className="material-icons" data-icon="show_chart"></span>
                            </a>
                        </div>
                    </td>
                </tr>
            )
        })
        let wallet = {}
        wallet['package'] = { price: state.member ? state.member.wallet : props.pageData.loggedInUserDetails.wallet }
        return (
            <React.Fragment>
                {adsWallet}
                {analyticsData}
                {gatewaysHTML}
                <div className="row">
                    <div className="col-12">
                        <div className="container">
                            <div className="row wallet">
                                <div className="col-md-2 wallet_amount">{Translate(props, "Wallet Total:")}{" "}<b>{Currency({...props,...wallet}).replace("<!-- -->","")}</b></div>
                                {
                                    !state.member && !state.user ? 
                                        <button onClick={recharge}>{Translate(props, "Recharge Wallet")}</button>
                                        : null
                                }
                            </div>
                        </div>
                        
                        <div className="grid-menu justify-content-between search-form">
                            <form onSubmit={submitForm} className="row gy-3">
                                <div className="form-group col-xs-3 col-md-3">
                                    <label htmlFor="name" className="control-label">{Translate(props, "Name")}</label>
                                    <input type="text" onChange={change} value={state.fields.name ? state.fields.name : ""} id="name" className="form-control" placeholder={Translate(props, "Name")} />
                                </div>
                                <div className="form-group col-xs-3 col-md-3">
                                    <label htmlFor="title" className="control-label">{Translate(props, "Title")}</label>
                                    <input type="text" onChange={change} value={state.fields.title ? state.fields.title : ""} id="title" className="form-control" placeholder={Translate(props, "Title")} />
                                </div>
                                {
                                    categories.length > 0 ?
                                        <React.Fragment>
                                            <div className="form-group col-xs-3 col-md-3">
                                                <label htmlFor="category_id" className="control-label">{Translate(props, "Categories")}</label>
                                                <select className="form-control form-select" id="category_id" value={state.fields.category_id ? state.fields.category_id : ""} onChange={onCategoryChange}>
                                                    {
                                                        categories.map(res => {
                                                            return (
                                                                <option key={res.key} value={res.key}>{Translate(props, res.value)}</option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </div>
                                            {
                                                subcategories.length > 0 ?
                                                    <div className="form-group col-xs-3 col-md-3">
                                                        <label htmlFor="subcategory_id" className="control-label">{Translate(props, "Sub Categories")}</label>
                                                        <select className="form-control form-select" id="subcategory_id" value={state.fields.subcategory_id ? state.fields.subcategory_id : ""} onChange={onSubCategoryChange}>
                                                            {
                                                                subcategories.map(res => {
                                                                    return (
                                                                        <option key={res.key} value={res.key}>{Translate(props, res.value)}</option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                subsubcategories.length > 0 ?
                                                    <div className="form-group col-xs-3 col-md-3">
                                                        <label htmlFor="subsubcategory_id" className="control-label">{Translate(props, "Sub Sub Categories")}</label>
                                                        <select className="form-control form-select" value={state.fields.subsubcategory_id ? state.fields.subsubcategory_id : ""} id="subsubcategory_id" className="form-control" onChange={onSubSubCategoryChange}>
                                                            {
                                                                subsubcategories.map(res => {
                                                                    return (
                                                                        <option key={res.key} value={res.key}>{Translate(props, res.value)}</option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                    : null
                                            }
                                            <div className="form-group col-xs-3 col-md-3">
                                                <label htmlFor="status" className="control-label">{Translate(props, "Status")}</label>
                                                <select className="form-control form-select" id="status" value={state.fields.status ? state.fields.status : ""} onChange={change}>
                                                    <option key={""} value="">{Translate(props, "")}</option>
                                                    <option key="1" value={"1"}>{Translate(props, "Enabled")}</option>
                                                    <option key="0" value={"0"}>{Translate(props, "Disabled")}</option>

                                                </select>
                                            </div>
                                            <div className="form-group col-xs-3 col-md-3">
                                                <label htmlFor="adult" className="control-label">{Translate(props, "Adult")}</label>
                                                <select className="form-control form-select" id="adult" value={state.fields.adult ? state.fields.adult : ""} onChange={change}>
                                                    <option key={""} value="">{Translate(props, "")}</option>
                                                    <option key="1" value={"1"}>{Translate(props, "Yes")}</option>
                                                    <option key="0" value={"0"}>{Translate(props, "No")}</option>

                                                </select>
                                            </div>
                                            <div className="form-group col-xs-3 col-md-3">
                                                <label htmlFor="approve" className="control-label">{Translate(props, "Approve")}</label>
                                                <select className="form-control form-select" id="approve" value={state.fields.approve ? state.fields.approve : ""} onChange={change}>
                                                    <option key={""} value="">{Translate(props, "")}</option>
                                                    <option key="1" value={"1"}>{Translate(props, "Yes")}</option>
                                                    <option key="0" value={"0"}>{Translate(props, "No")}</option>

                                                </select>
                                            </div>
                                        </React.Fragment>
                                        : null
                                }

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
                                    <EndContent {...props} text={state.searchData ? Translate(props,"No advertisement found with your matching criteria.") : Translate(props,'No advertisement created yet.')} itemCount={state.items.length} />
                                }
                                pullDownToRefresh={false}
                                pullDownToRefreshContent={<Release release={false} {...props} />}
                                releaseToRefreshContent={<Release release={true} {...props} />}
                                refreshFunction={refreshContent}
                            >
                                <div className="table-responsive">
                                <table className="table custTble1">
                                    <thead>
                                        <tr>
                                            <th scope="col">{props.t("Name")}</th>
                                            <th scope="col">{props.t("Title")}</th>
                                            <th scope="col">{props.t("Status")}</th>
                                            <th scope="col">{props.t("Approved")}</th>
                                            <th scope="col">{props.t("Results")}</th>
                                            <th scope="col">{props.t("Spent")}</th>
                                            <th scope="col">{props.t("Options")}</th>
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

export default Ads