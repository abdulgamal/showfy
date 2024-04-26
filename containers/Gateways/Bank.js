import React,{useReducer,useEffect,useRef} from 'react'
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";

const Bank = (props) => {

    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            submitting:false
        }
    );
    const selectFile = (e) => {
        var url =  e.target.value;
        var file = e.target.files[0]
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (file && (ext == "png" || ext == "jpeg" || ext == "jpg" || ext == 'PNG' || ext == 'JPEG' || ext == 'JPG')) {
            setState({file:file,submitting:false})
        }else{
            setState({errorMessage:"Please select png and jpeg file only.",submitting:true})
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if(state.submitting){
            return
        }
        setState({submitting:true})       
        let formData = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/member/bankdetails";
        formData.append("resource_id",props.bank_resource_id);
        formData.append("resource_type",props.bank_resource_type);
        formData.append("type",props.bank_type);
        formData.append("price",props.bank_price);
        if(props.bankpackage_id){
            formData.append("package_id",props.bankpackage_id);
        }
        formData.append("file",state.file);
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({errorMessage:response.data.error,submitting:false})
                } else {
                    props.successBank()
                }
            }).catch(err => {
                
            });
    }
        
        return (
            <div className="popup_wrapper_cnt">
                <div className="popup_cnt">
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Account Details")}</h2>
                                {
                                    !state.submitting ? 
                                    <a onClick={props.closePopup} className="_close"><i></i></a>
                                : null
                                }
                            </div>
                            {
                                state.errorMessage ?
                                <p className="error">
                                    {Translate(props,state.errorMessage)}
                                </p>
                            : null
                            }
                            <form className="bank-form" onSubmit={handleSubmit}>
                                <p>
                                    {
                                         props.pageData.appSettings['payment_bank_method_description']
                                    }
                                </p>
                                <p className="note">
                                    {
                                        props.pageData.appSettings['payment_bank_method_note']
                                    }
                                </p>
                                <input type="file" accept="image/*" name="file" onChange={selectFile} />
                                <button disabled={state.submitting} className="btn-pay">
                                    {Translate(props,'Upload')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

export default Bank;