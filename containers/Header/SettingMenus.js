import React,{useReducer,useEffect,useRef} from 'react'

import Items from "./SettingsMenuItems"

const SettingMenus = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            style:"none",
            type:props.type
        }
    );
    useEffect(() => {
        if(props.style != state.style || props.type != state.type){
            setState({style:props.style,type:props.type})
        }
    },[props])
    
            let mainPhoto = props.pageData.loggedInUserDetails.avtar

            if (mainPhoto) {
                const splitVal = mainPhoto.split('/')
                if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                } else {
                    mainPhoto = props.pageData.imageSuffix + mainPhoto
                }
            }

            return (
                    <li className={!props.mobileMenu ? `nav-item dropdown user-setting-menu-head${state.style == "block" ? " active" : ""}` : `dropdown MobDropdownNav${state.style == "block" ? " active" : ""}`}  style={{cursor:"pointer"}}  >
                        <a className={!props.mobileMenu ? "parent nav-link notclose usepicHead" : "parent loggedUer notclose usepicHead"} onClick={(e) => props.openToggle("settings",e)}  style={{cursor:"pointer"}} title={props.pageData.loggedInUserDetails.displayname} href="#" 
                            role="button">
                            <img className="userPic notclose parent" src={mainPhoto} />
                            {
                            !props.mobileMenu ?
                            props.pageData.loggedInUserDetails ? 
                                <span className="user_title notclose parent">{props.pageData.loggedInUserDetails.first_name}</span>
                                : null
                            : null
                            }
                            {
                                props.mobileMenu ? 
                                    <span className="title usertitle parent">{props.t("Settings")}</span>
                                : null
                            }
                        </a>
                        {
                        !props.mobileMenu ? 
                        <ul className="dropdown-menu dropdown-menu-right iconMenuList" ref={props.setSettingsWrapperRef}  style={{display:state.style}} >
                            <span className="dropdown-menu-arrow"></span>
                            <Items {...props} />
                        </ul>
                        : null
                        }
                    </li>
            )
    }

export default SettingMenus;