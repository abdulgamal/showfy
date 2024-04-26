import React,{useReducer,useEffect,useRef} from 'react';
import Breadcrum from "../../components/Breadcrumb/Form";
import Form from "../../components/DynamicForm/Index";
import Validator from "../../validators";
import axios from "../../axios-orders";
import dynamic from 'next/dynamic'
import Router from 'next/router';
import confiFlile from "../../config"
import { Editor } from '@tinymce/tinymce-react';
const imageCompression = dynamic(() => import("browser-image-compression"), {
    ssr: false
});
import Currency from "../Upgrade/Currency"

const Blog = (props) => {
  const myRef = useRef(null) 

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      editor: false,
      editItem: props.pageData.editItem,
      initialState: props.pageData.editItem ? props.pageData.editItem.description : "",
      editorState: props.pageData.editItem ? props.pageData.editItem.description : "",
      title: props.pageData.editItem ? "Edit Blog" : "Create Blog",
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
      plans:props.pageData.plans ? props.pageData.plans : [],
    }
);

  useEffect(() => {
    if(props.pageData.editItem != state.editItem){
      setState({
        editor: true,
        editItem: props.pageData.editItem,
        initialState: props.pageData.editItem ? props.pageData.editItem.description : "",
        title: props.pageData.editItem ? "Edit Blog" : "Create Blog",
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
        plans:props.pageData.plans ? props.pageData.plans : [],
      })
    }
  },[props])
 
  useEffect(() => {
    setState({ editor: true });
  },[])


  const onSubmit = async model => {
    if (
      props.pageData &&
      !props.pageData.loggedInUserDetails
    ) {
      document.getElementById("loginFormPopup").click();
      return false;
    }
    if (state.submitting) {
      return;
    }
    setState({ submitting: true, error: null });
    let formData = new FormData();
    for (var key in model) {
      if(key == "image" && model[key] && typeof model[key] != "string"){
        var ext = model[key].name.substring(model[key].name.lastIndexOf('.') + 1).toLowerCase();
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        }
        let compressedFile = model[key]
        if(ext != 'gif' && ext != 'GIF'){
            try {
            compressedFile = await imageCompression(model[key], options);
            } catch (error) { }
        }
        formData.append(key, compressedFile,model[key].name);
      }else{
        if(model[key] != null && typeof model[key] != "undefined")
          formData.append(key, model[key]);
      }
    }
    //image
    if (model["image"]) {
      let image = typeof model["image"] == "string" ? model["image"] : false;
      if (image) {
        formData.append("blogImage", image);
      }
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };
    let url = "/blogs/create";
    if (state.editItem) {
      formData.append("id", state.editItem.blog_id);
    }
    
    axios
      .post(url, formData, config)
      .then(response => {
        if (response.data.error) {
          window.scrollTo(0, myRef.current.offsetTop);
          setState({ error: response.data.error, submitting: false });
        } else {
          Router.push(
            `/blog/${response.data.custom_url}`
          );
        }
      })
      .catch(err => {
        setState({ submitting: false, error: err });
      });
  };

  const onCategoryChange = category_id => {
    setState({
      category_id: category_id,
      subsubcategory_id: 0,
      subcategory_id: 0
    });
  };
  const onSubCategoryChange = category_id => {
    setState({ subcategory_id: category_id, subsubcategory_id: 0 });
  };
  const onSubSubCategoryChange = category_id => {
    setState({ subsubcategory_id: category_id });
  };
  const onChangePrivacy = value => {
    setState({ privacy: value });
  };
  const uploadMedia = e => {
    onSubmitUploadImport({ upload: e });
  };
  const handleEditorChange = (e) => {
    setState({ editorState: e });
  }
  const uploadImageCallBack = (file) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/blogs/upload-image");
      const data = new FormData();
      data.append("image", file);
      xhr.send(data);
      xhr.addEventListener("load", () => {
        const response = JSON.parse(xhr.responseText);
        if (response.link) resolve({ data: { link: response.link } });
      });
      xhr.addEventListener("error", () => {
        const error = JSON.parse(xhr.responseText);
        reject(error);
      });
    });
  }

  let validator = [
      {
        key: "title",
        validations: [
          {
            validator: Validator.required,
            message: "Title is required field"
          }
        ]
      },
      {
        key: "description",
        validations: [
          {
            validator: Validator.required,
            message: "Description is required field"
          }
        ]
      }
    ];


    let theme = ""
		if(props.pageData && props.pageData.themeMode){
			theme = props.pageData.themeMode
    }
    
    let htmlEditor = null;
    {
      state.editor
        ? (htmlEditor = (
            <Editor
              initialValue={state.initialState}
              apiKey={props.pageData.tinymceKey}
              init={{
                height: 700,
                menubar: true,
                skin: 'oxide'+(theme != "white" ? "-"+theme : ""),
                images_upload_url: confiFlile.app_server+'/api/blogs/upload-image',
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help'
              }}
              value={state.editorState}
              onEditorChange={handleEditorChange}
            />
          ))
        : null;
    }

    let formFields = [
      {
        key: "title",
        label: "Title",
        value: state.editItem ? state.editItem.title : ""
        ,isRequired:true
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        htmlEditor: htmlEditor,
        removeAIBtn:state.editItem ? false : true,
        isRequired:true
      },
      {
        key: "image",
        label: "Upload Image",
        type: "file",
        removeAIBtn:state.editItem ? false : true,
        value: state.editItem && state.editItem.image ?  props.pageData.imageSuffix +state.editItem.image : ""
      }
    ];

    if (props.pageData.blogCategories) {
      let categories = [];
      categories.push({ key: 0, value: 0, label: "Please Select Category" });
      props.pageData.blogCategories.forEach(res => {
        categories.push({
          key: res.category_id,
          label: res.title,
          value: res.category_id
        });
      });
      formFields.push({
        key: "category_id",
        label: "Category",
        type: "select",
        value: state.editItem ? state.editItem.category_id : "",
        onChangeFunction: onCategoryChange,
        options: categories
      });

      //get sub category
      if (state.category_id) {
        let subcategories = [];

        props.pageData.blogCategories.forEach(res => {
          if (res.category_id == state.category_id) {
            if (res.subcategories) {
              subcategories.push({
                key: 0,
                value: 0,
                label: "Please Select Sub Category"
              });
              res.subcategories.forEach(rescat => {
                subcategories.push({
                  key: rescat.category_id,
                  label: rescat.title,
                  value: rescat.category_id
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
            value: state.editItem
              ? state.editItem.subcategory_id
              : "",
            onChangeFunction: onSubCategoryChange,
            options: subcategories
          });

          if (state.subcategory_id) {
            let subsubcategories = [];

            props.pageData.blogCategories.forEach(res => {
              if (res.category_id == state.category_id) {
                if (res.subcategories) {
                  res.subcategories.forEach(rescat => {
                    if (rescat.category_id == state.subcategory_id) {
                      if (rescat.subsubcategories) {
                        subsubcategories.push({
                          key: 0,
                          value: 0,
                          label: "Please Select Sub Sub Category"
                        });
                        rescat.subsubcategories.forEach(ressubcat => {
                          subsubcategories.push({
                            key: ressubcat.category_id,
                            label: ressubcat.title,
                            value: ressubcat.category_id
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
                options: subsubcategories
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
          : ""
    });

    if (props.pageData.appSettings.blog_adult == "1") {
      formFields.push({
        key: "adult",
        label: "",
        type: "checkbox",
        subtype:"single",
        value:[props.pageData.editItem && props.pageData.editItem.adult ? "1" : "0"],
        options: [
          {
            value: "1",
            label: "Mark Blog as Adult",
            key: "adult_1"
          }
        ]
      });
    }

    formFields.push({
      key: "search",
      label: "",
      value:[props.pageData.editItem ? (props.pageData.editItem.search ? "1" : "0")  : "1"],
      type: "checkbox",
      subtype:"single",
      options: [
        {
          value: "1",
          label: "Show this blog in search results",
          key: "search_1"
        }
      ]
    });
    if(props.pageData.appSettings['enable_comment_approve'] == 1){
      let comments = []
      comments.push({ value: "1", key: "comment_1", label: "Display automatically" })
      comments.push({ value: "0", key: "comment_0", label: "Don't display until approved" })
      formFields.push({
          key: "comments",
          label: "Comments Setting",
          type: "select",
          value: props.pageData.editItem ? props.pageData.editItem.autoapprove_comments.toString() : "1",
          options: comments
      })
    }
    let privacyOptions = [
      {
        value: "everyone",
        label: "Anyone",
        key: "everyone"
      },
      {
        value: "onlyme",
        label: "Only me",
        key: "onlyme"
      },
      {
        value: "link",
        label: "Only to people who have blog link",
        key: "link"
      }
    ];

    if(props.pageData.appSettings.user_follow == "1"){
        privacyOptions.push({
            value:"follow",label:"Only people I follow",key:"follow_1"
        })
    }
    if(state.plans.length > 0){
        state.plans.forEach(item => {
            let perprice = {}
            perprice['package'] = { price: item.price }
            privacyOptions.push({
                value:"package_"+item.member_plan_id,label:props.t("Limited to {{plan_title}} ({{plan_price}}) and above",{plan_title:item.title,plan_price:Currency({...props,...perprice}).replace("<!-- -->","")}),key:"package_"+item.member_plan_id
            })
        })
    }
    formFields.push({
      key: "privacy",
      label: "Privacy",
      type: "select",
      value: state.editItem
        ? state.editItem.view_privacy
        : "everyone",
      onChangeFunction: onChangePrivacy,
      options: privacyOptions
    });
    {
      !state.editItem || state.editItem.draft == "0"
        ? formFields.push({
            key: "draft",
            label: "Published/Draft",
            type: "select",
            value: state.editItem ? (!state.editItem.draft ? "0" : "1") : "1",
            options: [
              {
                value: 1,
                label: "Published",
                key: "publish"
              },
              {
                value: 0,
                label: "Draft",
                key: "draft"
              }
            ]
          })
        : null;
    }

    let defaultValues = {};
    formFields.forEach(elem => {
      if (elem.key == "description")
        defaultValues[elem.key] = state.editorState;
      else if (elem.value) defaultValues[elem.key] = elem.value;
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
    let updatedValues = {}
    if (state.editorState) {
      updatedValues["description"] = state.editorState;
    }
    return (
      <React.Fragment>
          <Breadcrum {...props}  image={props.pageData['pageInfo']['banner'] ? props.pageData['pageInfo']['banner'] : props.pageData['subFolder']+"static/images/breadcumb-bg.jpg"}title={`${state.editItem ? "Edit" : "Create"} Blog`} />          
          <div className="mainContentWrap">
            <div className="container">
              <div className="row">
                <div className="col-md-12 position-relative">
                  <div className="formBoxtop loginp content-form" ref={myRef}>
                    
                    <Form
                      editItem={state.editItem}
                      handleEditorChange={handleEditorChange}
                      className="form"
                      isBlog={!state.editItem ? true : false}
                      {...props}
                      updatedValues={updatedValues}
                      //title={state.title}
                      defaultValues={defaultValues}
                      validators={validator}
                      submitText={
                        !state.submitting ? "Submit" : "Submitting..."
                      }
                      generalError={state.error}
                      model={formFields}
                      onSubmit={model => {
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

export default Blog
