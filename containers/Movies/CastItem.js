import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../Image/Index"

import Link from "../../components/Link/index";

import SocialShare from "../SocialShare/Index"

import Like from "../Like/Index"
import Favourite from "../Favourite/Index"
import Dislike from "../Dislike/Index"
import Translate from "../../components/Translate/Index"
import CensorWord from "../CensoredWords/Index"

const CastItem = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            cast:props.cast
        }
    );
        return (
            <div className="single-user">
                <div className={`img${props.className ? " "+props.className : ""}`}>
                    <Link href={`/cast-and-crew/${state.cast.cast_crew_member_id}`} customParam={`id=${state.cast.cast_crew_member_id}`} as={`/cast-and-crew/${state.cast.cast_crew_member_id}`}>
                        <a>                        
                            <Image title={CensorWord("fn",props,Translate(props,state.cast.name))} image={state.cast.image} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                        </a>
                    </Link>
                </div>
                    <div className="content">
                        <Link href={`/cast-and-crew/${state.cast.cast_crew_member_id}`} customParam={`id=${state.cast.cast_crew_member_id}`} as={`/cast-and-crew/${state.cast.cast_crew_member_id}`}>
                            <a className="name">          
                                <React.Fragment>         
                                {<CensorWord {...props} text={Translate(props,state.cast.name)} />}
                                 {
                                    state.cast.verified ? 
                                        <span className="verifiedUser" title={Translate(props,"verified")}><span className="material-icons" data-icon="check"></span></span>
                                    : null
                                }
                                </React.Fragment>     
                            </a>
                        </Link>
                        {
                            !props.removeDes ? 
                        <p className="des">
                            {state.cast.character ? state.cast.character : `${state.cast.job} (${state.cast.department})`}
                        </p>
                        : null
                        }
                        <div className="LikeDislikeWrap">
                        <ul className="LikeDislikeList">
                        {
                        props.pageData.appSettings["cast_crew_member_like"] == "1" ?
                            <li>
                                <Like icon={true} {...props} like_count={state.cast.like_count} item={state.cast}  type="cast_crew_member" id={state.cast.cast_crew_member_id} />{"  "}
                            </li>
                        : null
                        }
                        {
                            props.pageData.appSettings["cast_crew_member_dislike"] == "1" ?
                            <li>
                                <Dislike icon={true} {...props} dislike_count={state.cast.dislike_count} item={state.cast}  type="cast_crew_member" id={state.cast.cast_crew_member_id} />{"  "}
                            </li>
                        : null
                        }
                            {
                                props.pageData.appSettings["cast_crew_member_favourite"] == "1" ?
                            <li>
                                <Favourite icon={true} {...props} favourite_count={state.cast.favourite_count} item={state.cast}  type="cast_crew_member" id={state.cast.cast_crew_member_id} />{"  "}
                            </li>
                            : null
                            }    
                        <SocialShare {...props} hideTitle={true} buttonHeightWidth="30" url={`/cast-and-crew/${state.cast.cast_crew_member_id}`} title={CensorWord("fn",props,Translate(props,state.cast.name))} imageSuffix={props.pageData.imageSuffix} media={state.cast.image} />
                        
                        </ul>
                        </div>
                        
                    </div>
            </div>
        )
    }

export default  CastItem ;