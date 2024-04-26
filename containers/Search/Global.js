import React, { useReducer, useEffect, useRef } from "react";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      style: "",
    }
  );

  return (
    <li
      className={
        !props.mobileMenu
          ? `nav-item dropdown main notclosesearch${
              state.style == "block" ? " active" : ""
            }`
          : `main dropdown MobDropdownNav notclosesearch${
              state.style == "block" ? " active" : ""
            }`
      }
      onClick={(e) => props.openToggle("search", e)}
    >
      <a
        className={
          !props.mobileMenu
            ? "nav-link markReadAll parent notclosesearch"
            : "parent"
        }
      >
        <span className="material-icons parent" data-icon="search"></span>
      </a>
    </li>
  );
};
export default Index;
