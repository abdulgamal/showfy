import React,{useReducer,useEffect,useRef} from 'react'
import Translate from "../../components/Translate/Index"
import Link from "../../components/Link/index";

import LoadMore from "../LoadMore/Index"
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import axios from "../../axios-orders"
import InfiniteScroll from "react-infinite-scroll-component";
import Currency from "../Upgrade/Currency"
import Timeago from "../Common/Timeago"
import StatsData from "./AdsAnalytics"
import CensorWord from "../CensoredWords/Index"

const Earning = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            pagging: props.pageData.items.pagging,
            items: props.pageData.items.results,
            page: 2,
            submitting: false,
            member: props.member,
            statsData:props.statsData
        }
    );
    
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

        let url = `/dashboard/earning`;
        
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

     
        let results = state.items.map(item => {
            let amount = {}
            amount['package'] = { price: item.amount }
            amount["currency_value"] = item.change_rate ?? 1
            amount["currency_symbol"] = item.currency_symbol ?? props.pageData.defaultCurrency.symbol

            let commission = {}
            commission['package'] = { price: item.admin_commission }
            commission["currency_value"] = item.change_rate ?? item.change_rate
            commission["currency_symbol"] = item.currency_symbol ?? props.pageData.defaultCurrency.symbol


            let netamount = {}
            netamount['package'] = { price: (parseFloat(item.admin_commission ? item.admin_commission : 0) + parseFloat(item.amount)) }
            netamount["currency_value"] = item.change_rate ?? item.change_rate
            netamount["currency_symbol"] = item.currency_symbol ?? props.pageData.defaultCurrency.symbol

            let type = ""

            if(item.transType != "ads"){
                if(item.transType == "video_tip"){
                    type = Translate(props,'Video Tip');
                }else if(item.transType == "video_pay_per_view"){
                    type = Translate(props,'Video Per View');
                }else if(item.transType == "channel_subscription"){
                    type = Translate(props,'Channel Support');
                }else if(item.transType == "user_subscribe"){
                    type = Translate(props,'Plan Subscription');
                }else if(item.transType == "gift"){
                    type = Translate(props,'Gift');
                }
                else if(item.transType == "purchase_series_purchase"){
                    type = Translate(props,'Purchase Series');
                }else if(item.transType == "rent_movie_purchase"){
                    type = Translate(props,'Rent Movie');
                }else if(item.transType == "rent_series_purchase"){
                    type = Translate(props,'Rent Series');
                }else if(item.transType == "purchase_movie_purchase"){
                    type = Translate(props,'Purchase Movie');
                }else if(item.transType == "audio_earning"){
                    type = Translate(props,'Audio Purchases');
                }else{
                    type = Translate(props,'Video Purchases')
                }
                
             }else{
                type =  Translate(props,'From Advertisement')
             }

            return (
                <tr key={item.id+item.type}>
                    <td>
                        {
                            type
                        } 
                    </td>
                    <td>
                        {
                            item.transType != "video_pay_per_view" ? 
                        <Link href="/member" customParam={`id=${item.username}`} as={`/${item.username}`}>
                            <a>
                                {item.displayname}
                            </a>
                        </Link>
                        : "N/A" 
                        }
                    </td>
                    <td>
                        {
                            item.type == "video" ? 
                            <Link href="/watch" customParam={`id=${item.custom_url}`} as={`/watch/${item.custom_url}`}>
                                <a>
                                    {<CensorWord {...props} text={item.title} />}
                                </a>
                            </Link> 
                            :
                            item.type == "audio" ? 
                            <Link href="/audio" customParam={`id=${item.custom_url}`} as={`/audio/${item.custom_url}`}>
                                <a>
                                    {<CensorWord {...props} text={item.title} />}
                                </a>
                            </Link> 
                            :
                            item.type == "gift" ? 
                            <Link href="/watch" customParam={`id=${item.custom_url}`} as={`/watch/${item.custom_url}`}>
                                <a>
                                    {<CensorWord {...props} text={item.title} />}
                                </a>
                            </Link> 
                            :
                            item.type == "channel" ? 
                            <Link href="/channel" customParam={`id=${item.custom_url}`} as={`/channel/${item.custom_url}`}>
                                    <a>
                                        {<CensorWord {...props} text={item.title} />}
                                    </a> 
                                </Link> 
                            : 
                            item.type == "user" ? 
                                <Link href="/member" customParam={`id=${item.custom_url}`} as={`/${item.custom_url}`}>
                                    <a>
                                        {item.title}
                                    </a>
                                </Link>
                            :
                            item.type == "purchase_series_purchase" || item.type == "rent_series_purchase" ? 
                            <Link href="/watch" customParam={`id=${item.custom_url}`} as={`/watch/${item.custom_url}`}>
                                    <a>
                                        {<CensorWord {...props} text={item.title} />}
                                    </a>
                                </Link> 
                            : 
                            item.type == "rent_movie_purchase" || item.type == "purchase_movie_purchase" ? 
                            <Link href="/watch" customParam={`id=${item.custom_url}`} as={`/watch/${item.custom_url}`}>
                                    <a>
                                        {<CensorWord {...props} text={item.title} />}
                                    </a>
                                </Link> 
                            : null
                        }
                    </td>
                    <td>{Currency({...props,...netamount})}</td>
                    <td>{item.admin_commission ? Currency({...props,...commission}).replace("<!-- -->","") : "-"}</td>
                    <td>{Currency({...props,...amount}).replace("<!-- -->","")}</td>
                    <td>{<Timeago {...props}>{item.creation_date}</Timeago>}</td>
                    
                </tr>
            )
        })
        
        return (
            <React.Fragment>
                {
                    state.statsData ? 
                        <div className="container">
                            <div className="row">
                                <div className="col-12">
                                    <StatsData {...props} statsData={state.statsData} member={state.member} />
                                </div>
                            </div>
                        </div>
                : null
                }



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
                                    <EndContent {...props} text={Translate(props,'No data found to display.')} itemCount={state.items.length} />
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
                                            <th scope="col">{Translate(props,"Payer Name")}</th>
                                            <th scope="col">{Translate(props,"Item")}</th>
                                            <th scope="col">{Translate(props,"Amount")}</th>
                                            <th scope="col">{Translate(props,"Site Commission")}</th>
                                            <th scope="col">{Translate(props,"Net Earning")}</th>
                                            <th scope="col">{Translate(props,"Creation Date")}</th>
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

export default Earning