import React,{useReducer,useEffect,useRef} from 'react'
import Category from "./Category"
import dynamic from 'next/dynamic'

const Blog = dynamic(() => import("../Blog/CarouselBlogs"), {
    ssr: false
});
const Video = dynamic(() => import("../HomePage/TopVideos"), {
    ssr: false
});
const Channel = dynamic(() => import("../Channel/CarouselChannel"), {
    ssr: false
});

import Translate from "../../components/Translate/Index"


const Browse = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            type: props.pageData.type,
            items: props.pageData.items,
            categories: props.pageData.category
        }
    );
    useEffect(()=>{
        if (props.pageData.type && props.pageData.type != state.type) {
            setState({ type: props.pageData.type,items:props.pageData.items,categories:props.pageData.category })
        }
    },[props.pageData])
    
    
    const getItemIndex = (item_id) => {
        const items = [...state.items];

        const itemIndex = items.findIndex(p => p[state.type + "_id"] == item_id);
        return itemIndex;
    }


        let contents = null
        if (state.items && state.items.length) {
            if (state.type == "video") { 
                contents = <React.Fragment>
                            <div className="container"><div className="gridColumn"><hr className="horline" /></div></div>
                            <Video  {...props} title={Translate(props,"Popular Videos")} videos={state.items} />
                          </React.Fragment>
            } else if (state.type == "channel") {
                contents = <React.Fragment>
                                <div className="container"><div className="gridColumn"><hr className="horline" /></div></div>
                                <Channel {...props} title={Translate(props,"Popular Channels")} channels={state.items} />
                            </React.Fragment>
            } else if (state.type == "blog") {
                contents = <React.Fragment>
                                <div className="container"><div className="gridColumn"><hr className="horline" /></div></div>
                                <Blog {...props}  title={Translate(props,"Popular Blogs")} blogs={state.items} />
                            </React.Fragment>
            }
        }
        return (
            <React.Fragment>
                    <div className="category-grid-wrap top30p">
                        <div className="container">
                            <div className="gridContainer gridCategory">
                                {
                                    state.categories.map(cat => {
                                        return (
                                                <Category  key={cat.category_id} {...props} type={state.type} category={cat} />
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <React.Fragment>
                            {contents}
                        </React.Fragment>
                    </div>
            </React.Fragment>
        )
    }


export default Browse