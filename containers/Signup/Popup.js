import React,{useReducer,useEffect,useRef} from 'react'

import Form from "./Form"


const Popup = (props) => {
    return (
        <div className="modal" id="registerpop">
            <div className="modal-dialog modal-md modal-dialog-centered modal-lg popupDesign">
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="loginRgtrBox loginRgtrBoxPopup registertrBoxPopupForm">
                            <button type="button" id="closeregistertrBoxPopupForm" className="close btn-close" data-bs-dismiss="modal">&times;</button>
                            <Form {...props} popup={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Popup