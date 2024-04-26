import React, { useReducer, useEffect, useRef } from "react";

import Items from "./CreateButtonsItem";

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

  if (!props.pageData.levelPermissions) {
    return null;
  }
  return (
    <React.Fragment>
      <li
        className={
          !props.mobileMenu
            ? `nav-item dropdown${state.style == "block" ? " active" : ""}`
            : `dropdown MobDropdownNav${
                state.style == "block" ? " active" : ""
              }`
        }
      >
        <a
          className={
            !props.mobileMenu
              ? "nav-link notclosecreate parent bg-cnt"
              : "nav-link notclosecreate parent"
          }
          href="#"
          onClick={(e) => props.openToggle("createbuttons", e)}
        >
          {!props.mobileMenu ? (
            <span className="material-icons notclosecreate parent">add</span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="#ffffff"
              className="notclosecreate parent"
            >
              <path
                className="notclosecreate parent"
                d="M0 0h24v24H0V0z"
                fill="none"
              ></path>
              <path
                className="notclosecreate parent"
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
              ></path>
            </svg>
          )}
        </a>
        {!props.mobileMenu ? (
          <ul
            className="createButtons dropdown-menu dropdown-menu-right iconMenuList"
            ref={props.setCreateButtonsWrapperRef}
            style={{ display: state.style }}
          >
            <span className="dropdown-menu-arrow"></span>
            <Items {...props} />
          </ul>
        ) : null}
      </li>
    </React.Fragment>
  );
};
export default CreateButtons;
