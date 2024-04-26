import React, { useReducer, useEffect, useRef } from "react";
import Translate from "../../components/Translate/Index";
import Link from "../../components/Link/index";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      consent: false,
    }
  );
  const closeConsentPopup = (e) => {
    e.preventDefault();
    localStorage.setItem("cookie-consent", true);
    setState({ consent: false });
  };
  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setState({ consent: true });
    }
  }, []);

  if (!state.consent) {
    return null;
  }
  return (
    <div className="cookie-consent">
      <span>
        {Translate(
          props,
          "This website uses cookies to ensure you get the best experience on our website."
        )}
        <Link href="/privacy">
          <a className="cookie-consent-link" target="_blank">
            {Translate(props, "Learn More")}
          </a>
        </Link>
      </span>
      <div className="cookie-consent-compliance">
        <a
          className="cookie-consent-btn cookie-consent-dismiss"
          href="#"
          onClick={closeConsentPopup}
        >
          {Translate(props, "Got It!")}
        </a>
      </div>
    </div>
  );
};

export default Index;
