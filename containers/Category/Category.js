import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index"
import ShortNumber from "short-number"
import Link from "../../components/Link/index"
import CensorWord from "../CensoredWords/Index"
const Category = (props) => {
    return (
        <div className="gridColumn">
            <div className="categoryBox">
                <Link href={`/category`} customParam={`type=${props.type}&id=` + props.category.slug} as={`/${props.type}/category/` + props.category.slug}>
                    <a>
                        <div className="categoryBoxContent">
                            <Image className="categoryBoxImg" imageSuffix={props.pageData.imageSuffix} image={props.category.image} title={CensorWord("fn",props,props.t(props.category.title))} siteURL={props.pageData.siteURL} />
                            <div className="overlay">
                                <div className="categoryBoxText">
                                    {
                                        props.category.icon ?
                                    <Image imageSuffix={props.pageData.imageSuffix} image={props.category.icon} title={CensorWord("fn",props,props.t(props.category.title))} siteURL={props.pageData.siteURL} />
                                            : null
                                    }
                                    <p className="catname">{<CensorWord {...props} text={props.t(props.category.title)} />}</p>
                                    <p className="totlblg">{`${ShortNumber(props.category.item_count)}`}{" "}{props.t(props.type + "_count", { count: props.category.item_count })}</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </Link>
            </div>
        </div>
    )
}

export default Category