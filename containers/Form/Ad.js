import React, { useReducer, useEffect, useRef } from "react";
import Breadcrum from "../../components/Breadcrumb/Form";
import Form from "../../components/DynamicForm/Index";
import Validator from "../../validators";
import axios from "../../axios-orders";
import Router from "next/router";
import Currency from "../Upgrade/Currency";
import Translate from "../../components/Translate/Index";
const Ads = (props) => {
  const myRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      editor: false,
      editItem: props.pageData.editItem,
      title: props.pageData.editItem
        ? "Edit Advertisement"
        : "Create Advertisement",
      category_id: props.pageData.editItem
        ? props.pageData.editItem.category_id
        : null,
      subcategory_id: props.pageData.editItem
        ? props.pageData.editItem.subcategory_id
        : null,
      subsubcategory_id: props.pageData.editItem
        ? props.pageData.editItem.subsubcategory_id
        : null,
      success: false,
      error: null,
    }
  );
  useEffect(() => {
    if (props.pageData.editItem != state.editItem) {
      setState({
        editor: false,
        editItem: props.pageData.editItem,
        title: props.pageData.editItem
          ? "Edit Advertisement"
          : "Create Advertisement",
        category_id: props.pageData.editItem
          ? props.pageData.editItem.category_id
          : null,
        subcategory_id: props.pageData.editItem
          ? props.pageData.editItem.subcategory_id
          : null,
        subsubcategory_id: props.pageData.editItem
          ? props.pageData.editItem.subsubcategory_id
          : null,
        success: false,
        error: null,
      });
    }
  }, [props]);

  useEffect(() => {
    setState({   editor: true });
    $(document).on("click", ".recharge_wallet", function (e) {
      e.preventDefault();
      Router.push(`/dashboard/ads?recharge=1`);
    });
  }, []);

  const onSubmit = (model) => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
      return false;
    }
    if (state.submitting) {
      return;
    }
    let formData = new FormData();
    for (var key in model) {
      formData.append(key, model[key]);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    let url = "/ads/create";
    if (state.editItem) {
      formData.append("fromEdit", 1);
      formData.append("ad_id", state.editItem.ad_id);
    }
    setState({
      
      
      submitting: true,
      error: null,
    });
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({
            
            
            error: response.data.error,
            submitting: false,
          });
        } else {
          Router.push(`/dashboard/ads`);
        }
      })
      .catch((err) => {
        setState({
          
          
          submitting: false,
          error: err,
        });
      });
  };

  const onCategoryChange = (category_id) => {
    setState({
      
      
      category_id: category_id,
      subsubcategory_id: 0,
      subcategory_id: 0,
    });
  };
  const onSubCategoryChange = (category_id) => {
    setState({
      
      
      subcategory_id: category_id,
      subsubcategory_id: 0,
    });
  };
  const onSubSubCategoryChange = (category_id) => {
    setState({
      
      
      subsubcategory_id: category_id,
    });
  };

  if (
    !state.editItem &&
    !props.pageData.appSettings["video_ffmpeg_path"]
  ) {
    return (
      <React.Fragment>
        <Breadcrum
          {...props}
          image={
            props.pageData["pageInfo"]["banner"]
              ? props.pageData["pageInfo"]["banner"]
              : props.pageData["subFolder"] +
                "static/images/breadcumb-bg.jpg"
          }
          title={`${state.editItem ? "Edit" : "Create"} Advertisement`}
        />
        <div className="mainContentWrap">
          <div className="container">
            <div className="row">
              <div className="col-md-12 position-relative">
                <div className="formBoxtop loginp content-form">
                  <Form
                    className="form"
                    editItem={state.editItem}
                    {...props}
                    defaultValues={{}}
                    validators={{}}
                    errorMessage={props.t(
                      "FFMPEG not enabled from admin.{{click_here}} to enable it.",
                      {
                        click_here:
                          "<a class='ffmpeg_enabled' href='" +
                          props.pageData.admin_url +
                          "/videos/settings' target='_blank' >" +
                          Translate(props, "Click here") +
                          "</a>",
                      }
                    )}
                    submitText={!state.submitting ? "Submit" : "Submit..."}
                    model={[]}
                    onSubmit={(model) => {
                      onSubmit(model);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  if (
    !state.editItem &&
    props.pageData.loggedInUserDetails &&
    props.pageData.loggedInUserDetails["wallet"] < 1
  ) {
    return (
      <React.Fragment>
        <Breadcrum
          {...props}
          image={
            props.pageData["pageInfo"]["banner"]
              ? props.pageData["pageInfo"]["banner"]
              : props.pageData["subFolder"] +
                "static/images/breadcumb-bg.jpg"
          }
          title={`${state.editItem ? "Edit" : "Create"} Advertisement`}
        />
        <div className="mainContentWrap">
          <div className="container">
            <div className="row">
              <div className="col-md-12 position-relative">
                <div className="formBoxtop loginp content-form">
                  <Form
                    className="form"
                    editItem={state.editItem}
                    {...props}
                    defaultValues={{}}
                    validators={{}}
                    errorMessage={props.t(
                      "Please recharge your wallet in order to create advertisement.{{click_here}} to recharge your wallet.",
                      {
                        click_here:
                          "<a href='#' class='recharge_wallet'>" +
                          Translate(props, "Click here") +
                          "</a>",
                      }
                    )}
                    submitText={!state.submitting ? "Submit" : "Submit..."}
                    model={[]}
                    onSubmit={(model) => {
                      onSubmit(model);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  let validator = [
    {
      key: "name",
      validations: [
        {
          validator: Validator.required,
          message: "Name is required field",
        },
      ],
    },
  ];

  let formFields = [
    {
      key: "name",
      label: "Name",
      value: state.editItem ? state.editItem.name : "",
      isRequired: true,
    },
    {
      key: "title",
      label: "Title",
      value: state.editItem ? state.editItem.title : "",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      value: state.editItem ? state.editItem.description : "",
    },
    {
      key: "url",
      label: "URL",
      value: state.editItem ? state.editItem.url : "",
    },
  ];

  if (!state.editItem) {
    validator.push({
      key: "upload",
      validations: [
        {
          validator: Validator.required,
          message: "Video Media is required field",
        },
      ],
    });
    formFields.push({
      isRequired: true,
      label:"Upload Ad Video",
      key: "upload",
      type: "simplefile",
      defaultText: "Drag & Drop Video File Here",
    });
  }

  if (props.pageData.adCategories) {
    let categories = [];
    categories.push({ key: 0, value: 0, label: "Please Select Category" });
    props.pageData.adCategories.forEach((res) => {
      categories.push({
        key: res.category_id,
        label: res.title,
        value: res.category_id,
      });
    });
    formFields.push({
      key: "category_id",
      label: "Category",
      type: "select",
      value: state.editItem ? state.editItem.category_id : "",
      onChangeFunction: onCategoryChange,
      options: categories,
    });

    //get sub category
    if (state.category_id) {
      let subcategories = [];
      props.pageData.adCategories.forEach((res) => {
        if (res.category_id == state.category_id) {
          if (res.subcategories) {
            subcategories.push({
              key: 0,
              value: 0,
              label: "Please Select Sub Category",
            });
            res.subcategories.forEach((rescat) => {
              subcategories.push({
                key: rescat.category_id,
                label: rescat.title,
                value: rescat.category_id,
              });
            });
          }
        }
      });
      if (subcategories.length > 0) {
        formFields.push({
          key: "subcategory_id",
          label: "Sub Category",
          type: "select",
          value: state.editItem ? state.editItem.subcategory_id : "",
          onChangeFunction: onSubCategoryChange,
          options: subcategories,
        });
        if (state.subcategory_id) {
          let subsubcategories = [];
          props.pageData.adCategories.forEach((res) => {
            if (res.category_id == state.category_id) {
              if (res.subcategories) {
                res.subcategories.forEach((rescat) => {
                  if (rescat.category_id == state.subcategory_id) {
                    if (rescat.subsubcategories) {
                      subsubcategories.push({
                        key: 0,
                        value: 0,
                        label: "Please Select Sub Sub Category",
                      });
                      rescat.subsubcategories.forEach((ressubcat) => {
                        subsubcategories.push({
                          key: ressubcat.category_id,
                          label: ressubcat.title,
                          value: ressubcat.category_id,
                        });
                      });
                    }
                  }
                });
              }
            }
          });
          if (subsubcategories.length > 0) {
            formFields.push({
              key: "subsubcategory_id",
              label: "Sub Sub Category",
              value: state.editItem
                ? state.editItem.subsubcategory_id
                : "",
              type: "select",
              onChangeFunction: onSubSubCategoryChange,
              options: subsubcategories,
            });
          }
        }
      }
    }
  }
  if (!state.editItem) {
    let perclick = {};
    perclick["package"] = {
      price: props.pageData.appSettings["ads_cost_perclick"],
    };
    let perview = {};
    perview["package"] = {
      price: props.pageData.appSettings["ads_cost_perview"],
    };

    let typeOptions = [];
    typeOptions.push({
      key: "1",
      value: "1",
      label:
        "Pay Per Click (" +
        Currency({ ...props, ...perclick }).replace("<!-- -->", "") +
        ")",
    });
    typeOptions.push({
      key: "2",
      value: "2",
      label:
        "Pay Per Impression (" +
        Currency({ ...props, ...perview }).replace("<!-- -->", "") +
        ")",
    });

    formFields.push({
      key: "type",
      label: "Pricing",
      value: state.editItem ? state.editItem.type : "",
      type: "select",
      options: typeOptions,
    });
  }
  if (props.pageData.appSettings.video_adult == "1") {
    formFields.push({
      key: "adult",
      label: "Adult",
      type: "select",
      value: state.editItem ? state.editItem.adult : null,
      options: [
        {
          key: "",
          label: "Show this Ad in both Adult and Non-Adult Videos",
          value: "",
        },
        { key: "1", label: "Show this Ad in Adult Videos only", value: "1" },
        {
          key: "0",
          label: "Show this Ad in Non-Adult Videos only",
          value: "0",
        },
      ],
    });
  }

  let defaultValues = {};
  formFields.forEach((elem) => {
    if (elem.value) defaultValues[elem.key] = elem.value;
  });

  if (state.category_id) {
    defaultValues["category_id"] = state.category_id;
  }
  if (state.subcategory_id) {
    defaultValues["subcategory_id"] = state.subcategory_id;
  }

  if (state.subsubcategory_id) {
    defaultValues["subsubcategory_id"] = state.subsubcategory_id;
  }

  return (
    <React.Fragment>
      <Breadcrum
        {...props}
        image={
          props.pageData["pageInfo"]["banner"]
            ? props.pageData["pageInfo"]["banner"]
            : props.pageData["subFolder"] +
              "static/images/breadcumb-bg.jpg"
        }
        title={`${state.editItem ? "Edit" : "Create"} Advertisement`}
      />
      <div className="mainContentWrap">
        <div className="container">
          <div className="row">
            <div className="col-md-12 position-relative">
              <div className="formBoxtop loginp content-form" ref={myRef}>
                <Form
                  className="form"
                  editItem={state.editItem}
                  {...props}
                  //title={state.title}
                  defaultValues={defaultValues}
                  validators={validator}
                  generalError={state.error}
                  submitText={!state.submitting ? "Submit" : "Submit..."}
                  model={formFields}
                  onSubmit={(model) => {
                    onSubmit(model);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Ads;
