import React from "react";
import Router, { withRouter } from "next/router";
import axios from "../../axios-orders";

const index = (props) => {
  if (!props.pageData.currencies || props.pageData.currencies.length < 2) {
    return null;
  }

  const setCurrency = (currency) => {
    let formData = new FormData();
    formData.append("currency", currency);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = `/set-currency`;

    

    axios
      .post(url, formData, config)
      .then((response) => {
        if(response.data.status == 1)
            Router.push(props.router.asPath);
      })
      .catch(() => {
        
      });
  }

  return (
    <React.Fragment>
      {props.pageData.currencies.map((item) => {
        return (
          <li key={item.ID}>
              <a href="#" className={`dropdown-item iconmenu${item.ID == props.pageData.selectedCurrency.ID ? " active" : ""}`} onClick={(e) => {
                e.preventDefault();
                if(item.ID == props.pageData.selectedCurrency.ID){
                    return;
                }
                props.openToggle("createcurrency", e)
                // send ajax req
                setCurrency(item.ID)
              }}>
                <span className="ml5">{item.symbol}</span>
                {props.t(item.currency)}
              </a>
          </li>
        );
      })}
    </React.Fragment>
  );
};
export default withRouter(index);