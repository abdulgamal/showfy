import React, { useEffect, useState } from "react";
import axios from "../../axios-site";
import Loader from "../LoadMore/Index";

const QPay = (props) => {
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [orderId,setOrderId] = useState(null);
  const [orderStatus,setOrderStatus] = useState(null);
    //socket to update order payment
    useEffect(() => {
        if(orderStatus && orderStatus.order_id == orderId){
            if(orderStatus.status == "failed"){
                props.closePopup();
            }else{
                props.success();
            }
        }
    },[orderStatus])
  useEffect(() => {
    props.socket.on('qpayOrderComplete', data => {
        let order_id = data.order_id
        let status = data.status
        setOrderStatus({order_id: order_id, status: status})
    });
    return () => {
        props.socket.off("qpayOrderComplete");
      }
  },[])

  useEffect(() => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    // create order backend
    let formData = new FormData();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    let url = props.gatewaysUrl;
    axios
      .get(url + "&gateway=5", formData, config)
      .then((response) => {
        setSubmitting(false);
        console.log(response.data);
        if (response.data.error) {
          setErrorMessage(response.data.error);
        } else {
            setOrderId(response.data.order_id);
          setPaymentOrder(response.data);
        }
      })
      .catch((err) => {});
  }, []);

  return (
    <div className="popup_wrapper_cnt">
      <div className="popup_cnt">
        <div className="comments">
          <div className="VideoDetails-commentWrap">
            <div className="popup_wrapper_cnt_header">
              <h2>{props.t("QPay Payment")}</h2>
              <a onClick={props.closePopup} className="_close">
                <i></i>
              </a>
            </div>
            {submitting ? <Loader {...props} loading={true} /> : null}
            {
                errorMessage ?
                <p className="error" style={{marginLeft:"20px"}}>
                    {errorMessage}
                </p>
            : null
            }
            {paymentOrder ? (
              <div className="qpay_pmnt-cnt" style={{ textAlign: "center" }}>
                <img src={`data:image/jpeg;base64,${paymentOrder.qr_image}`} />
                {paymentOrder.urls && paymentOrder.urls.length > 0 ? (
                  <div
                    className=" gateway-options"
                    style={{ marginTop: "10px" }}
                  >
                    {paymentOrder.urls.map((item, index) => {
                      return (
                        <a key={index} href={item.link}>
                          <img src={item.logo} />
                          <div
                            style={{
                              alignItems: "baseline",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <p style={{margin:0}}>{props.t(item.name)}</p>
                            <p style={{fontWeight:"normal",marginTop:"5px"}}>{item.description}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default QPay;
