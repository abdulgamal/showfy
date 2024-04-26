import React,{useReducer,useEffect,useRef} from 'react'

import Highcharts from 'highcharts'
import HighchartsReact from "highcharts-react-official"
import axios from "../../axios-orders"
import Loader from "../LoadMore/Index"

const StatsAnalytics = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            id: props.id,
            stats: null,
            type:props.type,
            title: "Today Analytics",
            search : "today"
        }
    );
    
    useEffect(() => {
        getData()
    },[])

    const getData = (value) => {
        let formData = new FormData();
        formData.append('id', state.id)
        formData.append('type', state.type)

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        formData.append("criteria",value ?? state.search)
        axios.post("/dashboard/stats", formData, config)
            .then(response => {
                if (response.data) {
                    setState({ stats: response.data })
                } else {
                    setState({ loading: false })
                }
            }).catch(err => {
                setState({ loading: false })
            });
    }

    const change = (e) => {
        let title = "Today Analytics"
        if(e.target.value == "this_week"){
            title = "This Week Analytics"
        }else if(e.target.value == "this_month"){
            title = "This Month Analytics"
        }else if(e.target.value == "this_year"){
            title = "This Year Analytics"
        }
        setState({search:e.target.value,title:title,stats:null})
        setTimeout(() => {
            getData(e.target.value)
        },200)
    }
        if (!state.stats) {
            return <Loader loading={true} />
        }
        let series = []

        if(state.stats.likes){
            series.push({
                name: "Likes",
                data: state.stats.likes
            })
        }
        if(state.stats.dislike){
            series.push({
                name: "Dislikes",
                data: state.stats.dislike
            })
        }

        if(state.stats.favourite){
            series.push({
                name: "Favourites",
                data: state.stats.favourite
            })
        }
        if(state.stats.follow){
            series.push({
                name: "Followers",
                data: state.stats.follow
            })
        }


        const options = {
            title: {
                text: state.title
            },
            chart: {
                type: "column"
            },
            xAxis: {
                categories: state.stats.xaxis,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: state.stats.yaxis
                }
            }, 
            series: series
        }

        return (
            <React.Fragment>
                <div className="ads_analytics">
                    <div className="search_criteria">
                        <span>{props.t("Criteria:")}</span>
                        <select onChange={(e) => change(e)} value={state.search}>
                            <option value="today">{props.t("Today")}</option>
                            <option value="this_week">{props.t("This Week")}</option>
                            <option value="this_month">{props.t("This Month")}</option>
                            <option value="this_year">{props.t("This Year")}</option>
                        </select>
                    </div>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={options}
                    />
                </div>
            </React.Fragment>
        )
    }

export default StatsAnalytics