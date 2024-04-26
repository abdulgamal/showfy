import React, { useReducer, useEffect, useRef } from "react";
import Breadcrum from "../../components/Breadcrumb/Form";
import Form from "../../components/DynamicForm/Index";
const AddVideos = dynamic(() => import("../../containers/Video/Popup"), {
  ssr: false,
});
import Validator from "../../validators";
import axios from "../../axios-orders";
import dynamic from "next/dynamic";
import Router from "next/router";
import Translate from "../../components/Translate/Index";
const imageCompression = dynamic(() => import("browser-image-compression"), {
  ssr: false,
});
import Currency from "../Upgrade/Currency";

const Channel = (props) => {
  const myRef = useRef(null);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      title: `${props.pageData.editItem ? "Edit" : "Create"} Channel`,
      editItem: props.pageData.editItem,
      category_id: props.pageData.editItem
        ? props.pageData.editItem.category_id
        : null,
      subcategory_id: props.pageData.editItem
        ? props.pageData.editItem.subcategory_id
        : null,
      subsubcategory_id: props.pageData.editItem
        ? props.pageData.editItem.subsubcategory_id
        : null,
      privacy: props.pageData.editItem
        ? props.pageData.editItem.view_privacy
        : "everyone",
      success: false,
      error: null,
      channelImage: "",
      plans: props.pageData.plans ? props.pageData.plans : [],
    }
  );
  useEffect(() => {
    if (props.pageData.editItem != state.editItem) {
      setState({
        title: `${props.pageData.editItem ? "Edit" : "Create"} Channel`,
        editItem: props.pageData.editItem,
        category_id: props.pageData.editItem
          ? props.pageData.editItem.category_id
          : null,
        subcategory_id: props.pageData.editItem
          ? props.pageData.editItem.subcategory_id
          : null,
        subsubcategory_id: props.pageData.editItem
          ? props.pageData.editItem.subsubcategory_id
          : null,
        privacy: props.pageData.editItem
          ? props.pageData.editItem.view_privacy
          : "everyone",
        success: false,
        error: null,
        channelImage: "",
        plans: props.pageData.plans ? props.pageData.plans : [],
      });
    }
  }, [props]);

  const onSubmit = async (model) => {
    if (props.pageData && !props.pageData.loggedInUserDetails) {
      document.getElementById("loginFormPopup").click();
      return false;
    }
    if (state.submitting) {
      return;
    }
    let selectedCurrency = props.pageData.selectedCurrency
    let changeRate = selectedCurrency.currency_value
    if (
      props.pageData.appSettings["channel_support_commission_type"] == 1 &&
      props.pageData.appSettings["channel_support_commission_value"] > 0
    ) {
      if (
        model["channel_subscription_amount"] &&
        parseFloat(model["channel_subscription_amount"]) > 0
      ) {
        if (
          model["channel_subscription_amount"] <=
          (parseFloat(props.pageData.appSettings["channel_support_commission_value"])*changeRate).toFixed(2)
        ) {
          let perprice = {};
          perprice["package"] = {
            price:
              props.pageData.appSettings["channel_support_commission_value"],
          };
          setState({
            
            error: [
              {
                message: props.t(
                  "Price enter must be greater than {{price}}.",
                  {
                    price: Currency({ ...props, ...perprice }).replace(
                      "<!-- -->",
                      ""
                    ),
                  }
                ),
              },
            ],
          });
          return;
        }
      } else {
        model["channel_subscription_amount"] = 0;
      }
    }
    setState({  submitting: true, error: null });
    let formData = new FormData();
    for (var key in model) {
      if (key == "image" && model[key] && typeof model[key] != "string") {
        var ext = model[key].name
          .substring(model[key].name.lastIndexOf(".") + 1)
          .toLowerCase();
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        let compressedFile = model[key];
        if (ext != "gif" && ext != "GIF") {
          try {
            compressedFile = await imageCompression(model[key], options);
          } catch (error) {}
        }
        formData.append(key, compressedFile, model[key].name);
      } else {
        if (model[key] != null && typeof model[key] != "undefined")
          formData.append(key, model[key]);
      }
    }

    //image
    if (model["image"]) {
      let image = typeof model["image"] == "string" ? model["image"] : false;
      if (image) {
        formData.append("channelImage", image);
      }
    }
    if (state.selectedVideos) {
      formData.append("videos", state.selectedVideos);
    }
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/channels/create";
    if (state.editItem) {
      url = "/channels/create/"+state.editItem.channel_id;
      formData.append("id", state.editItem.channel_id);
      formData.append("fromEdit", true);
    }

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({
            
            error: response.data.error,
            submitting: false,
          });
          window.scrollTo(0, myRef.current.offsetTop);
        } else {
          Router.push(`/channel/${response.data.custom_url}`);
        }
      })
      .catch((err) => {
        setState({  submitting: false, error: err });
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
    setState({  subsubcategory_id: category_id });
  };
  const onChangePrivacy = (value) => {
    setState({  privacy: value });
  };
  useEffect(() => {
    $(document).on("click", ".add_video", function () {
      //
      if (props.pageData && !props.pageData.loggedInUserDetails) {
        document.getElementById("loginFormPopup").click();
      } else {
        setState({  openPopup: true });
      }
    });
  }, []);

  const closePopup = () => {
    setState({  openPopup: false });
  };
  const chooseVideos = (selectedVideos) => {
    setState({
      selectedVideos: selectedVideos,
      openPopup: false,
    });
  };

  let validator = [
    {
      key: "title",
      validations: [
        {
          validator: Validator.required,
          message: "Title is required field",
        },
      ],
    },
  ];

  let formFields = [
    {
      key: "title",
      label: "Title",
      value: state.editItem ? state.editItem.title : null,
      isRequired: true,
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      value: state.editItem ? state.editItem.description : null,
    },
  ];

  //support price
  if (props.pageData.appSettings["channel_support"] == 1) {
    validator.push(
      {
        key: "channel_subscription_amount",
        validations: [
          {
            validator: Validator.required,
            message: "Support Price is required field",
          },
        ],
      },
      {
        key: "channel_subscription_amount",
        validations: [
          {
            validator: Validator.price,
            message: "Please provide valid support price",
          },
        ],
      }
    );
    formFields.push({
      key: "channel_subscription_amount",
      label: "Support Price(per month)",
      type: "text",
      value:
        state.editItem && state.editItem.channel_subscription_amount
          ? state.editItem.channel_subscription_amount
          : "0",
      placeholder: "00.00",
      isRequired: true,
    });
    if (
      props.pageData.appSettings["channel_support_commission_type"] == 1 &&
      props.pageData.appSettings["channel_support_commission_value"] > 0
    ) {
      let perprice = {};
      perprice["package"] = {
        price: props.pageData.appSettings["channel_support_commission_value"],
      };
      formFields.push({
        key: "price_desc_1",
        type: "content",
        content:
          "<span>" +
          props.t("Price enter must be greater than {{price}}.", {
            price: Currency({ ...props, ...perprice }).replace("<!-- -->", ""),
          }) +
          "</span>",
      });
    }
  }

  formFields.push(
    {
      key: "addVideos",
      type: "content",
      content:
        "<button class='add_video' type='button'>" +
        Translate(props, "Add Videos") +
        "</button>",
    },
    {
      key: "image",
      label: "Upload Image",
      type: "file",
      value:
        state.editItem && state.editItem.image
          ? props.pageData.imageSuffix + state.editItem.image
          : null,
    }
  );

  if (props.pageData.channelCategories) {
    let categories = [];
    categories.push({ key: 0, value: 0, label: "Please Select Category" });
    props.pageData.channelCategories.forEach((res) => {
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
      value: state.editItem ? state.editItem.category_id : null,
      onChangeFunction: onCategoryChange,
      options: categories,
    });

    //get sub category
    if (state.category_id) {
      let subcategories = [];

      props.pageData.channelCategories.forEach((res) => {
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
          value: state.editItem ? state.editItem.subcategory_id : null,
          label: "Sub Category",
          type: "select",
          onChangeFunction: onSubCategoryChange,
          options: subcategories,
        });

        if (state.subcategory_id) {
          let subsubcategories = [];

          props.pageData.channelCategories.forEach((res) => {
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
              value: state.editItem ? state.editItem.subsubcategory_id : null,
              label: "Sub Sub Category",
              type: "select",
              onChangeFunction: onSubSubCategoryChange,
              options: subsubcategories,
            });
          }
        }
      }
    }
  }
  formFields.push({
    key: "tags",
    label: "Tags",
    type: "tags",
    value:
      state.editItem && state.editItem.tags
        ? state.editItem.tags.split(",")
        : null,
  });
  if (props.pageData.channelArtists) {
    let artists = [];

    props.pageData.channelArtists.forEach((res) => {
      artists.push({
        value: res.artist_id.toString(),
        key: res.title,
        label: res.title,
        image: props.pageData.imageSuffix + res.image,
      });
    });

    formFields.push({
      key: "artists",
      label: "Artists",
      imageSelect: true,
      value:
        state.editItem && state.editItem.artists
          ? state.editItem.artists.split(",")
          : null,
      type: "checkbox",
      value:
        state.editItem && state.editItem.artists
          ? state.editItem.artists.split(",")
          : null,
      options: artists,
    });
  }

  if (props.pageData.appSettings.channel_adult == "1") {
    formFields.push({
      key: "adult",
      label: "",
      subtype: "single",
      value: [state.editItem && state.editItem.adult ? "1" : "0"],
      type: "checkbox",
      options: [
        {
          value: "1",
          label: "Mark as Adult",
          key: "adult_1",
        },
      ],
    });
  }

  formFields.push({
    key: "search",
    label: "",
    subtype: "single",
    value: [state.editItem ? (state.editItem.search ? "1" : "0") : "1"],
    type: "checkbox",
    //value:["1"],
    options: [
      {
        value: "1",
        label: "Show this in search results",
        key: "search_1",
      },
    ],
  });
  if (props.pageData.appSettings["enable_comment_approve"] == 1) {
    let comments = [];
    comments.push({
      value: "1",
      key: "comment_1",
      label: "Display automatically",
    });
    comments.push({
      value: "0",
      key: "comment_0",
      label: "Don't display until approved",
    });
    formFields.push({
      key: "comments",
      label: "Comments Setting",
      type: "select",
      value: state.editItem
        ? state.editItem.autoapprove_comments.toString()
        : "1",
      options: comments,
    });
  }
  let privacyOptions = [
    {
      value: "everyone",
      label: "Anyone",
      key: "everyone",
    },
    {
      value: "onlyme",
      label: "Only me",
      key: "onlyme",
    },
    {
      value: "password",
      label: "Only people with password",
      key: "password",
    },
    {
      value: "link",
      label: "Only to people who have channel link",
      key: "link",
    },
  ];

  if (props.pageData.appSettings.user_follow == "1") {
    privacyOptions.push({
      value: "follow",
      label: "Only people I follow",
      key: "follow",
    });
  }
  if (state.plans.length > 0) {
    state.plans.forEach((item) => {
      let perprice = {};
      perprice["package"] = { price: item.price };
      privacyOptions.push({
        value: "package_" + item.member_plan_id,
        label: props.t("Limited to {{plan_title}} ({{plan_price}}) and above", {
          plan_title: item.title,
          plan_price: Currency({ ...props, ...perprice }).replace(
            "<!-- -->",
            ""
          ),
        }),
        key: "package_" + item.member_plan_id,
      });
    });
  }
  formFields.push({
    key: "privacy",
    label: "Privacy",
    type: "select",
    value: state.editItem ? state.editItem.view_privacy : "everyone",
    onChangeFunction: onChangePrivacy,
    options: privacyOptions,
  });
  if (state.privacy == "password") {
    formFields.push({
      key: "password",
      label: "Password",
      type: "password",
      value: state.editItem ? state.editItem.password : "",
      isRequired: true,
    });
    validator.push({
      key: "password",
      validations: [
        {
          validator: Validator.required,
          message: "Password is required field",
        },
      ],
    });
  }
  let defaultValues = {};
  formFields.forEach((elem) => {
    if (elem.value) defaultValues[elem.key] = elem.value;
    else {
      defaultValues[elem.key] = "";
    }
  });

  if (state.category_id) {
    defaultValues["category_id"] = state.category_id;
  }
  if (state.subcategory_id) {
    defaultValues["subcategory_id"] = state.subcategory_id;
  }
  if (state.privacy) {
    defaultValues["privacy"] = state.privacy;
  }
  if (state.subsubcategory_id) {
    defaultValues["subsubcategory_id"] = state.subsubcategory_id;
  }
  return (
    <React.Fragment>
      {state.openPopup ? (
        <AddVideos
          {...props}
          fromChannel={true}
          chooseVideos={chooseVideos}
          closePopup={closePopup}
          title={Translate(props, "Add video to channel")}
        />
      ) : null}
      <Breadcrum
        {...props}
        image={
          props.pageData["pageInfo"]["banner"]
            ? props.pageData["pageInfo"]["banner"]
            : props.pageData["subFolder"] + "static/images/breadcumb-bg.jpg"
        }
        title={`${state.editItem ? "Edit" : "Create"} Channel`}
      />
      <div className="mainContentWrap">
        <div className="container">
          <div className="row">
            <div className="col-md-12 position-relative">
              <div className="formBoxtop loginp content-form" ref={myRef}>
                <Form
                  className="form"
                  editItem={state.editItem}
                  defaultValues={defaultValues}
                  validators={validator}
                  generalError={state.error}
                  {...props}
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

export default Channel;
