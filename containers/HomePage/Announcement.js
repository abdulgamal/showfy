import React, { useReducer, useEffect, useRef } from "react";

const Index = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      announcements: props.announcements,
      consent: false,
    }
  );
  useEffect(() => {
    if (props.announcements != state.announcements) {
      return {
        announcements: props.announcements,
      };
    }
  }, [props.announcements]);

  if (!state.announcements) {
    return null;
  }
  return (
    <div className="site-announcements">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div
              className="announcement-content"
              dangerouslySetInnerHTML={{
                __html: state.announcements.description,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
