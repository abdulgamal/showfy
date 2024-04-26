import React,{useReducer,useEffect,useRef} from 'react'
import Link from "../../components/Link/index";
import InfiniteScroll from "react-infinite-scroll-component";
import EndContent from "../LoadMore/EndContent"
import Release from "../LoadMore/Release"
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders"

const Subscribers = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            members:props.pageData.items.results,
            page:2
        }
    );
    useEffect(() => {
        if (props.pageData.items.results != state.members) {
            setState({
                members:props.pageData.items.results,
                page:2
            })
        }
    },[props.pageData.items.results])
    
    
    
    const refreshContent = () => {
        setState({page:1,members:[]})
        loadMoreContent()
    }
    
    const loadMoreContent = () => {
        // setState({loading:true})
        // let formData = new FormData();         
        // formData.append('page',state.page)
        // const config = {
        //     headers: {
        //         'Content-Type': 'multipart/form-data',
        //     }
        // };
        // let url = ""
        // formData.append('owner_id',props.user_id)
        // url = `/members/subscribers`;
        
        // axios.post(url, formData ,config)
        // .then(response => {
        //     if(response.data.members){
        //         let pagging = response.data.pagging
        //         setState({page:state.page+1,pagging:pagging,members:[...state.members,...response.data.members],loading:false})
        //     }else{
        //         setState({loading:false})
        //     }
        // }).catch(err => {
        //     setState({loading:false})
        // });

    }
    const getItemIndex = (item_id) => {
        const members = [...state.members];
        const itemIndex = members.findIndex(p => p["user_id"] == item_id);
        return itemIndex;
    }
    const updateItem = (id) => {
        const itemIndex = getItemIndex(id);
        if(itemIndex > -1){
            let items = [...state.members]
            if(items[itemIndex].block)
                items[itemIndex].block = null
            else
                items[itemIndex].block = 1
            setState({members: items})

            let formData = new FormData();         
            formData.append('user_id',id)
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            let url = ""
            url = `/members/blocked`;
            
            axios.post(url, formData ,config)
            .then(response => {
                
            }).catch(err => {
                
            });

        }
    }

        

        return (
            <React.Fragment> 
                
                <div className="plan-subscribers">
                    <InfiniteScroll
                            dataLength={state.members.length}
                            next={loadMoreContent}
                            hasMore={false}
                            endMessage={
                                <EndContent {...props} text={ Translate(props,'No blocked users found.')} itemCount={state.members.length} />
                            }
                            pullDownToRefresh={false}
                            pullDownToRefreshContent={<Release release={false} {...props} />}
                            releaseToRefreshContent={<Release release={true} {...props} />}
                            refreshFunction={refreshContent}
                        >
                            
                            <div className="gridContainer gridUserSubscriber">
                        {
                            state.members.map(plan => {
                                let image = plan.avtar
                                const splitVal = plan.avtar.split('/')
                                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                                } else {
                                    image = props.pageData.imageSuffix + image
                                }
                                
                                return (
                                    <div className="gridColumn" key={plan.user_id}>
                                        <div className="card mx-auto plancard">
                                            <div className="card-body">
                                                <div className="pname-img">
                                                    <div className="img">
                                                        <Link href="/member" customParam={`id=${plan.username}`} as={`/${plan.username}`}>
                                                            <a>
                                                                <img className="pimg" src={image} />
                                                            </a>
                                                        </Link>
                                                    </div>
                                                    <p className="m-0 pname">
                                                        <Link href="/member" customParam={`id=${plan.username}`} as={`/${plan.username}`}>
                                                            {plan.displayname}
                                                        </Link>
                                                    </p>
                                                </div>
                                                <button onClick={(e) => {
                                                    e.preventDefault();
                                                    updateItem(plan.user_id);
                                                }}>{
                                                    props.t(!plan.block ? "unblock" : "block")
                                                }</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        </div>
                    </InfiniteScroll>
                </div>
            </React.Fragment>
        )
    }

export default Subscribers