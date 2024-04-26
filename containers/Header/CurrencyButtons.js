import React, { useReducer, useEffect, useRef } from "react";

import Items from "./CreateCurrencyItem";

const CreateButtons = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      style: props.style,
      type: props.type,
    }
  );
  useEffect(() => {
    if (props.style != state.style || props.type != state.type) {
      setState({ style: props.style, type: props.type });
    }
  }, [props]);

  if (!props.pageData.currencies || props.pageData.currencies.length < 2) {
    return null;
  }
  return (
    <React.Fragment>
      <li
        className={ `currency nav-item dropdown${state.style == "block" ? " active" : ""}`}
      >
        <a
          className={"nav-link notclosecreate parent bg-cnt"}
          href="#"
          onClick={(e) => props.openToggle("createcurrency", e)}
          title={props.pageData.selectedCurrency.currency}
        >
         <span className="notclosecreate parent">{
            props.pageData.selectedCurrency.symbol
         }</span>  
        </a>
        
          <ul
            className="custScrollBar createcurrency dropdown-menu dropdown-menu-right iconMenuList"
            ref={props.setCurrencyWrapperRef}
            style={{ display: state.style }}
          >
            <span className="dropdown-menu-arrow"></span>
            <Items {...props} />
          </ul>
          <style jsx>
            {
                `
                .createcurrency {
                  max-height: 400px;
                }
                .createcurrency :global(li a.active) {
                    color: var(--Bgcolor-primary);
                }
                `
            }
          </style>
      </li>
    </React.Fragment>
  );
};
export default CreateButtons;
