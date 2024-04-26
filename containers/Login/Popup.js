import React,{useReducer,useEffect,useRef} from 'react'

import Form from "./Form"

const Popup = (props) => {
    return (
        <div className="modal" id="loginpop">
            <div className="modal-dialog modal-md modal-dialog-centered modal-lg popupDesign">
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="loginRgtrBox loginRgtrBoxPopup loginRgtrBoxPopupForm">
                            <button type="button" id="closeloginRgtrBoxPopupForm" className="close btn-close" data-bs-dismiss="modal">&times;</button>
                            <Form {...props} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Popup