import React, { useReducer, useEffect, useRef } from "react";

import Form from "../Form/Report";
import Translate from "../../components/Translate/Index";

const Report = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      status: props.status,
    }
  );

  const close = () => {
    props.openReport(false);
  };
  if (state.status == 0) {
    return null;
  }
  return (
    <div className="popup_wrapper_cnt">
      <div className="popup_cnt">
        <div className="comments">
          <div className="VideoDetails-commentWrap">
            <div className="popup_wrapper_cnt_header">
              <h2>{Translate(props, "Report Content")}</h2>
              <a onClick={close} className="_close">
                <i></i>
              </a>
            </div>
            <Form {...props} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
