import React, { useEffect, useReducer, useRef } from "react";
import Translate from "../../components/Translate/Index";
import axios from "../../axios-orders";
import LoadMore from "../LoadMore/Index"

const CoverImages = (props) => {
  const myRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      data: props.data,
    }
  );

  useEffect(() => {
    submitForm();
  }, []);

  if (!state.data) return null;

  let type = state.data.type;

  const submitForm = () => {
    if (state.submitting) {
      return;
    }

    // send ajax request to backend
    let formData = new FormData();
    formData.append("type", type);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/ai/choose-images";
    setState({
        loading:true,
      submitting: true,
      files: null,
    });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({ error: response.data.error, submitting: false,loading:false });
        } else {
          setState({ submitting: false,loading:false });
          setState({ files: response.data });
        }
      })
      .catch((err) => {
        setState({ submitting: false, error: err,loading:false });
      });
  };

  const openImage = (id) => {
    if (typeof lightboxJquery == "undefined") {
      return;
    }

    var items = [];
    state.files.forEach((photo) => {
      items.push({
        src: photo.url,
        type: "image",
      });
    });
    lightboxJquery.magnificPopup.open(
      {
        items: items,
        gallery: {
          enabled: true,
        },
        tCounter: "",
      },
      id
    );
  };

  return (
    <React.Fragment>
      <div className="ai-cnt" ref={myRef}>
        {
        state.loading &&
            <LoadMore loading={true} />
        }
        {state.error && (
          <div
            key="error_1"
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {Translate(props, state.error)}
          </div>
        )}
        {state.files && (
          <div className="images d-flex imageandtext-cnt row m-0">
            {state.files.map((file, index) => {
              return (
                <div className="image-cnt col-sm-6 col-md-3" key={index}>
                  <div className="imageandtext image_grid">
                    <label htmlFor={`image_${index}`}>
                      <img src={props.pageData.imageSuffix+ file.url} style={{ width: "200px" }} />
                    </label>
                    <input
                      type="checkbox"
                      id={`image_${index}`}
                      checked={state.imageChecked == index ? true : false}
                      onChange={(e) => {
                        if (state.imageChecked == index) {
                          setState({ imageChecked: null });
                        } else {
                          setState({ imageChecked: index });
                        }
                      }}
                    />
                    <div className="caption"></div>
                  </div>
                  {/* <a
                    href="#"
                    className="view-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      openImage(index);
                    }}
                  >
                    {props.t("view")}
                  </a> */}
                </div>
              );
            })}
          </div>
        )}
        {
          state.files && state.files.length > 0 &&
          <div className="d-flex input-group jsx-b4e5a53fe9043c51 justify-content-end px-3 mt-3">
            <button
              type="button"
              style={{ marginRight: "10px" }}
              onClick={(e) => {
                let url = state.files[state.imageChecked].url;
                props.setValue(state.data.key, url);
              }}
              disabled={
                typeof state.imageChecked != "undefined" &&
                state.imageChecked != null
                  ? false
                  : true
              }
            >
              {props.t("Select")}
            </button>
          </div>
        }
      </div>
      <style jsx>
        {`
          .view-btn {
            text-align: center;
            width: 100%;
            display: block;
          }
          img {
            border-radius: 50%;
            cursor: pointer;
          }

          .caption {
            position: absolute;
            top: 0;
            left: 5px;
            height: 100%;
            width: calc(100% - 5px);
            padding: 0 10px;
            box-sizing: border-box;
            pointer-events: none;
            border-radius: 500px;
          }

          .imageandtext {
            position: relative;
          }
          .imageandtext-cnt {
            overflow-y: auto;
            max-height: calc(80vh - 115px);
          }
          .image_grid {
            display: inline-block;
            padding-left: 5px;
          }
          .image_grid img {
            display: block;
          }

          .image_grid input {
            display: none;
          }
          .image_grid input:checked + .caption {
            background: rgba(0, 0, 0, 0.5);
          }
          .image_grid input:checked + .caption::after {
            content: "✔";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 20px;
            text-align: center;
            border-radius: 50%;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default CoverImages;
