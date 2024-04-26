import React,{useReducer,useEffect,useRef} from 'react'

import Spinner from "../../components/UI/Spinner"
import File from "./file"
import Translate from "../Translate/Index";

import AutoSuggest from "../../containers/Autosuggest/Index"
import dynamic from 'next/dynamic'
import DatePicker from 'react-datetime';
import "react-datetime/css/react-datetime.css";
 
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false
});
const OpenAI = dynamic(() => import("../../containers/OpenAI"), {
  ssr: false
});
import { MultiSelect } from "react-multi-select-component";
import moment from 'moment-timezone';
import Rating from "../../containers/Rating/Index"

const DynamicForm = (props) => {
  const tagInput = useRef(null)
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      errors: {},
      // tags: props.tags ? props.tags : (props.defaultValues.tags ? props.defaultValues.tags : [] ),
      model:props.model,
      editItem:props.editItem,
      videoKey:props.videoKey,
      fields: props.initalValues ? props.initalValues : (props.defaultValues ? props.defaultValues : {})
    }
  );
  const showPopupOpenAi = (type,key) => {
    let price = 0;
    if(type == "textarea" || type == "tinymce") {
      price = parseFloat(props.pageData.appSettings.openai_description_price) || 0
    }else if(type == "blog"){
      price = parseFloat(props.pageData.appSettings.openai_blog_price) || 0
    }else {
      price = parseFloat(props.pageData.appSettings.openai_image_price) || 0
    }
    setState({
      openAiPopup:{
        price:price,
        type:type,
        key:key,
      }
    })
  }
  const removeImage = (m,e) => {
    let fields = { ...state.fields }

    state.model.forEach(item => {
      let type = item.type
      if (type == "file" || type == "video" || type == "audio") {
        fields[item.key] = null
      }
    })
    

    
    if(m.onChangeFunction){
      m.onChangeFunction(false);
    }
    setState({
       
      fields,
      videoWidth: null
    });
  }

  useEffect(() => {
    if(props.videoKey != state.videoKey)
      setState({videoKey: state.videoKey})
  },[props.videoKey])

  useEffect(() => {
    if(props.model != state.model)
      setState({model:props.model})
  },[props.model])

  useEffect(() => {
    if(props.defaultValues != state.fields && state.editItem != props.editItem)
      setState({fields:{...state.fields,...props.defaultValues}})
  },[props.defaultValues,props.editItem])

  useEffect(() => {
    if(typeof props.updatedValues != 'undefined'){
      setState({fields:{...state.fields,...props.updatedValues}})
      if(props.parentComponentUpdate){
        props.parentComponentUpdate(false);
      }
    }
  },[props.updatedValues])

  
  // Validate form fields (This is configured in DynamicForm as props)
  const validate = () => {
    let errors = {};
    const validators = props.validators;
    validators.forEach((v) => {
      let fieldValue = state.fields[v.key];
      v.validations.forEach((vd) => {
        let r = vd.validator(fieldValue ? fieldValue : false,v.key);
        if (!r) {
          if (!errors[v.key]) {
            if (errors[v.key] == undefined) {
              errors[v.key] = [];
            }
            errors[v.key].push(Translate(props, vd.message));
          }
        }
      });
    })
    return errors
  }

  const onSubmit = e => {
    e.preventDefault();
    let errors = validate();
    if (errors != state.errors)
      setState({ errors: errors })
    
    

    if (Object.entries(errors).length !== 0) {
      return false;
    }
    if(state.errors["scheduled"]){
      return false;
    }
    if(state.fields["scheduled"]){
      let dateE = moment(state.fields["scheduled"]);
      if(!dateE.isValid()){
        let errors = { ...state.errors }
        errors["scheduled"] = "Please enter valid datetime."
        setState({
          errors:errors
        });
        return;
      }
    }
    if (props.onSubmit) {
      const stateObj = { ...state.fields }
      // if(stateObj['tags'])
      // stateObj['tags'] = []
      // if (state.fields.tags.length)
      // stateObj.tags = state.tags

      if(props.multiSelectKey){
        stateObj[props.multiSelectKey] = ""
        let valuesMulti = state.fields[props.multiSelectKey]
        if(valuesMulti){
          let finalValues = []
          valuesMulti.forEach(item => {
            finalValues.push(item.value)
          })
          stateObj[props.multiSelectKey] = finalValues.join(",")
        }
      }
      props.onSubmit(stateObj);
    }
  };

  const onChange = (e, key, type = "single", fieldType = "", m) => {
   
    let fields = { ...state.fields }
    let errors = { ...state.errors }
    if (type === "single") {
      if (fieldType == "file" || fieldType == "video" || fieldType == "audio") {
        var url = e.dataTransfer ? e.dataTransfer.files[0].name : e.target.value;
        var file = !e.dataTransfer ? e.target.files[0] : e.dataTransfer.files[0]
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (fieldType == "file" && file && (ext == "png" || ext == "jpeg" || ext == "jpg" || ext == 'PNG' || ext == 'JPEG' || ext == 'JPG')) {
          fields[key] = file
          errors[key] = null
          setState({
            fields: fields,
            errors:errors
          });
          if (m && m.onChangeFunction) {
            m.onChangeFunction(file)
          }
          return
        } else if (fieldType == "video" && file && (ext == "flv" || ext == "ogg" || ext == "mkv" || ext == "mk3d" || ext == "mks" || ext == "wmv" || ext == "flv" || ext == "mp4" || ext == "mov" || ext == "webm" || ext == 'mpeg' || ext == '3gp' || ext == 'avi')) {
          fields[key] = file
          errors[key] = null
          setState({
            fields: fields,
            errors:errors
          });
          if (m && m.onChangeFunction) {
            m.onChangeFunction(file)
          }
          return
        }else if (fieldType == "audio" && file && (ext == "mp3")) {
          fields[key] = file
          errors[key] = null
          setState({
            fields: fields,
            errors:errors
          });
          if (m && m.onChangeFunction) {
            m.onChangeFunction(file)
          } 
          return
        } else {
          fields[key] = null
          setState({
            fields: fields
          });
          return;
        }
      }
      if(key == "scheduled"){
        //check choosen time is greater than current time
        let dateE = moment(e)
        let dateSelected = dateE.tz(props.pageData.defaultTimezone);     
        let dateS = moment(m.minDate)
        let minDate = dateS.tz(props.pageData.defaultTimezone);
        errors[key] = null
        if(dateSelected.isBefore(minDate)){
          errors[key] = "Selected time should be greater than current time."
        }
        fields[key] = e
        setState({
          fields: fields,
          errors:errors
        });
        
      }else{
        if(key == "job"){
          errors[key] = null
          fields[key] = e.title
          fields["department"] = e.department
          setState({
            fields: fields,
            errors:errors
          });
        }else{
          errors[key] = null
          fields[key] = e && e.target ? e.target.value : e
          setState({
            fields: fields,
            errors:errors
          });
        }
      }
    } else {
      // Array of values (e.g. checkbox): TODO: Optimization needed.
      let found = state.fields[key] 
        ? state.fields[key].find(d => d === e.target.value)
        : false;
      let index = getSingleType(key)
      if(index > -1 && state.model[index].subtype == "single"){
        fields[key] = [state.fields[key] && state.fields[key].indexOf("1") > -1 ? "0" : e.target.value]
        errors[key] = null
        setState({
          fields: fields,
          errors:errors
        });
      }else if (found) {
        let data = state.fields[key].filter(d => {
          return d !== found;
        });
        fields[key] = data
        errors[key] = null
        setState({
          fields: fields,
          errors:errors
        });

      } else {
        let others = state.fields[key] ? [...state.fields[key]] : [];
        fields[key] = [e.target.value, ...others]
        errors[key] = null
        setState({
          fields: fields,
          errors:errors
        });

      }
    }
    if (m && m.onChangeFunction) {
      m.onChangeFunction(e && e.target ? e.target.value : e)
    }
  };
  const updateRating = (value) => {
    let key = "rating"
    let fields = { ...state.fields }
    let errors = { ...state.errors }
    fields[key] = value;
    errors[key] = null
    setState({
      fields: fields,
      errors:errors
    });
  }
  const removeTag = (i) => {
    const newTags = state.fields.tags instanceof Array ? [...state.fields.tags] : [];
    newTags.splice(i, 1);
    setState({ fields: {...state.fields, tags: newTags} });
  }

  const inputKeyDown = (e) => {
    const val = e.target.value;
    let tags = state.fields.tags instanceof Array ? state.fields.tags : [] 
    if (e.key === 'Enter' && val) {
      if (tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
        e.preventDefault();
        return;
      }
      setState({ fields:{...state.fields,tags: [...tags, val]} });
      tagInput.current.value = "";
      e.preventDefault();
    } else if (e.key === 'Backspace' && !val) {
      removeTag(tags.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  }
  const videoLoaded = (e) => {
    if (!state.videoWidth)
      setState({ videoWidth: jQuery('#video_cnt').width() })
  }
  const getSingleType = (key) => {
    const models = [...state.model];
    const modelIndex = models.findIndex(p => p.key == key);
    return modelIndex;
  }
  const createForm = (m) => {
    let key = m.key;

      let type = m.type || "text";
      let removeAIBtn = m.removeAIBtn

      let allowAICreate = false;
      if(type == "textarea" && parseInt(props.pageData.appSettings["openai_description_system"],10) == 1 && props.pageData.levelPermissions && parseInt(props.pageData.levelPermissions["openai.descriptioncreate"],10)  == 1 && parseInt(props.pageData.appSettings.allowOpenAi,10) == 1){
        allowAICreate = true;
      }else if((type == "file" && type != "video" && type != "audio") && parseInt(props.pageData.appSettings["openai_image_system"],10) == 1 && props.pageData.levelPermissions && parseInt(props.pageData.levelPermissions["openai.imagecreate"],10)  == 1 && parseInt(props.pageData.appSettings.allowOpenAi,10) == 1){
        allowAICreate = true;
      }
      let fieldProps = m.props || {};
      let name = m.name;
      let value = m.value;
      let target = key;
      value = state.fields[target];
      if (typeof value == "undefined")
        value = ""
      let errorDiv = null
      if (Object.entries(state.errors).length !== 0 && state.errors[key]) {
        errorDiv = (
          <span className="error">{state.errors[key]}</span>
        )
      }

      

      let input = (
        <React.Fragment>
          {
            m.copyText ? 
              <div className="copy_container">
                <input
                  {...fieldProps}
                  className="form-input form-control"
                  type={type}
                  key={key}
                  id={key}
                  placeholder={m.placeholder ? Translate(props, m.placeholder) : null}
                  name={name}
                  value={value ? value : ""}
                  onChange={e => {
                    onChange(e, target);
                  }}
                />
                <button type="button" onClick={(e) => m.onClickCopy(value)} className="copy_txt">{Translate(props, "Copy")}</button>
              </div>
            :
            <input
              {...fieldProps}
              className="form-input form-control"
              type={type}
              key={key}
              id={key}
              placeholder={m.placeholder ? Translate(props, m.placeholder) : null}
              name={name}
              value={value ? value : ""}
              onChange={e => {
                onChange(e, target,"single","",m);
              }}
            />
          }
          
        </React.Fragment>
      );
      
      if(type == "rating"){
        input = <Rating {...fieldProps} rating={value ? value : 0} hideStats={true} updateRating={updateRating} />
      }

      if (type == "textarea") {
        input = (
          <React.Fragment>
            {
          m.htmlEditor ?
            m.htmlEditor
            :
            <textarea
              {...fieldProps}
              className="form-input form-control"
              type={type}
              key={key}
              id={key}
              name={name}
              value={value ? value : ""}
              onChange={e => {
                onChange(e, target);
              }}
            ></textarea>
          }
          </React.Fragment>
        );
      }
      var createObjectURL = (URL || webkitURL || {}).createObjectURL || function () { };
      if (type == "file" || type == "video" || type == "audio") {
        input = (
          <React.Fragment>
            {!value || type == "video" ?
              <File {...fieldProps} {...props} typeUpload={type == "video" ? "video" : (type == "audio" ? "audio" : "image")} videoKey={state.videoKey} type={type} name={name} target={target} m={m} keyName={key} onChange={onChange}  defaultText={Translate(props, m.defaultText)} />
              : type == "audio" ?
              <File {...fieldProps} {...props}  typeUpload="audio" videoKey={"audio"} type={type} name={name} target={target} m={m} keyName={key} onChange={onChange} defaultText={Translate(props, m.defaultText)} />
              :
              type != "video" ?
                <div className="previewUploadImg" style={{ display: (value ? "block" : "none") }}>
                  <div>
                    <img src={value ? (typeof value == "string" ? value : createObjectURL(value)) : null} alt={Translate(props, "Image Preview")} />
                    <span className="close closePreviewImage" onClick={(e) => removeImage(m,e)}>x</span>
                  </div>
                </div>
                : null
              // <div className="previewUploadImg" style={{display:(value ? "block": "none")}}>
              //   <div style={{maxWidth:"100%",width:state.videoWidth ? state.videoWidth : "50%"}}>
              //     <video id="video_cnt" preload={'auto'} onLoadedData={videoLoaded} controls src={value ? createObjectURL(value) : null} alt="preview" />
              //     <span className="close closePreviewImage" onClick={removeImage}>x</span>
              //   </div>
              // </div>
            }
          </React.Fragment>
        );
      }
      if (type == "simplefile") {
        input = <input
          {...fieldProps}
          className="custom-control-file"
          type="file"
          key={key}
          id={key}
          accept={"video/*"}
          name={name}
          onChange={e => {
            onChange(e, target,'single','video');
          }}
        />
      }
      if (type == "content") {
        input = ""
      }
      if (type == "radio") {
        input = m.options.map(o => {
          let checked = o.value == value;
          return (
            <div className="form-check custom-radio">
              <input
                {...fieldProps}
                className="form-check-input"
                type={type}
                key={o.key}
                name={o.name}
                checked={checked}
                value={o.value}
                id={"ll" + o.key}
                onChange={e => {
                  onChange(e, o.name);
                }}
              />
              <label key={"ll" + o.key} className="form-check-label" htmlFor={"ll" + o.key}>{Translate(props, o.label)}</label>
            </div>
          );
        });
      }
      if (type == "select") {
        input = m.options.map(o => {
          let checked = o.value == value;
          return (
            <option
              {...fieldProps}
              key={o.key}
              value={o.value}
              defaultValue={checked}
            >
              {Translate(props, o.label)}
            </option>
          );
        });

        input = (
          <select
            value={value}
            className="form-control form-select"
            onChange={e => {
              onChange(e, m.key, 'single', type, m);
            }}
          >
            {input}
          </select>
        );
      }
      if (type == "multiSelect") {
        input = (
          <MultiSelect
            options={m.options}
            value={state.fields[m.key] ? state.fields[m.key] : m.defaultValues}
            onChange={e => {
              onChange(e, m.key, 'single', type, m);
            }}
            hasSelectAll={true}
            overrideStrings={
              {
                "allItemsAreSelected": props.t("All items are selected."),
                "clearSearch": props.t("Clear Search"),
                "noOptions": props.t("No options"),
                "search": props.t("Search"),
                "selectAll": props.t("Select All"),
                "selectSomeItems": props.t("Select...")
              }
            }
            labelledBy="Select"
          />
        );
      }
      if (type == "tags") {
        if (state.fields.tags && state.fields.tags instanceof Array && state.fields.tags.length > 0) {
          input = state.fields.tags.map((tag, i) => (
            <li key={tag}>
              {tag}
              <button type="button" onClick={() => { removeTag(i); }}>+</button>
            </li>
          ))
        } else {
          input = null
        }
        input =
          <div className="input-tag">
            <ul className="input-tag__tags">
              {input}
              <li className="input-tag__tags__input">
                <input placeholder={props.t("Tags")} type="text" onKeyDown={inputKeyDown} ref={tagInput} />
              </li>
            </ul>
          </div>

      } 

      if (type == "checkbox") {
        m.imageSelect ? 
          input = m.options.map(o => {
            let checked = false;
            if (value && value.length > 0) {
              checked = value.indexOf(o.value) > -1 ? true : false;
            }
            return (
              <React.Fragment key={"cfr" + o.key}>
                <div className="col-lg-2 col-sm-4 col-6">
                    <div className="form-check custom-control image-checkbox">
                              <input
                              {...fieldProps}
                              className="form-check-input"
                              type={type}
                              key={"LL" + o.key}
                              name={o.name}
                              id={"LL" + o.key}
                              checked={checked} 
                              value={o.value}
                              onChange={e => {
                                onChange(e, m.key, "multiple");
                              }}
                            />
                        <label key={"ll" + o.key} className="form-check-label" htmlFor={"LL" + o.key}>
                            <img src={o.image}
                                alt={Translate(props, o.label)} className="img-fluid" />
                            <p className="nameSelectImg">{Translate(props, o.label)}</p>
                        </label>
                    </div>
                </div>
              </React.Fragment>
            );
          })
        :
        input = m.options.map(o => {
          let checked = false;
          if (value && value.length > 0) {
            checked = value.indexOf(o.value) > -1 ? true : false;
          }
          return (
            <React.Fragment key={"cfr" + o.key}>
              <div className="form-check form-switch">
                <input
                  {...fieldProps}
                  className="form-check-input"
                  type={type}
                  key={"LL" + o.key}
                  name={o.name}
                  id={"LL" + o.key}
                  checked={checked} 
                  value={o.value}
                  onChange={e => {
                    onChange(e, m.key, "multiple");
                  }}
                />
                <label key={"ll" + o.key} className="form-check-label" htmlFor={"LL" + o.key}>
                  {
                    o.image ?
                      <div><img src={o.image} style={{ height: "100px" }} /><p>{Translate(props, o.label)}</p></div>
                      : Translate(props, o.label)
                  }

                </label>
              </div>
            </React.Fragment>
          );
        });
      }
      if (type == "checkbox") {
        if(m.imageSelect){
          input = <div className="imgSelectWrap">
              <div className="row gx-2">
                  {input}
              </div>
            </div>
        }
      }
      if (type == "date" && DatePicker) {
          input = <DatePicker
            timeFormat={false}
            closeOnSelect={true}
            onChange={e => {
              onChange(e, m.key, 'single', type, m);
            }}
            value={value}
          />
      }
      if (type == "datetime" && DatePicker) {
          input = <DatePicker
            showLeadingZeros={true}
            closeOnSelect={true}
            isValidDate={(currentDate) => {
              return currentDate.isAfter(moment(m.minDate));
            }}
            // format={"y-MM-dd"}
            onChange={e => {
              onChange(e, m.key, 'single', type, m);
            }}
            value={value}
          />
      }
      if (type == "phone_number") {
          input = <PhoneInput
              countryCallingCodeEditable={false}
              countrySelectProps={{ unicodeFlags: true }}
              placeholder={Translate(props,"Phone Number")}
              value={value}
              onChange={e => { onChange(e, m.key, 'single', type, m); }}
          />
      }
      if (type == "autosuggest"){
        input = <AutoSuggest {...fieldProps} {...props} {...m} setAutosuggestId={onChange} keyValue={m.key}  />
      } 
      if(type == "text_description"){
        input = null
      } 
      return (
        <React.Fragment>
          {
            m.label ? 
          <label className="form-label" key={"l" + key} htmlFor={key}>
            {Translate(props, m.label)} 
            {
              m.isRequired ? 
              <span className="field_mantatory">*</span>
              : null
            }
            {
              !removeAIBtn && allowAICreate ?
                <button className="mb-1 floatR ai-button" type="button" onClick={(e) => {
                  e.preventDefault();
                  showPopupOpenAi(m.htmlEditor ? "tinymce" : type,key);
                  // show popup
                }}>{props.t("Generate {{title}} Using AI",{title:m.label})}</button>
              : null
            }
          </label>
          : null
          }
          {
            type != "content" ?
              input
              :
              <div className="button" dangerouslySetInnerHTML={{ __html: m.content }}></div>
          }
          {
            m.postDescription ? 
              <div className="form-description-cnt mt-1 text-secondary" dangerouslySetInnerHTML={{ __html: m.postDescription }}></div>
            : null
          }
          {errorDiv}
        </React.Fragment>
      );
  }
  const renderForm = () => {
    let model = state.model;

    let formUI = model.map(m => {
        if(m.key != "group_data"){
          return <div key={"g" + m.key} className="form-group">{createForm(m)}</div>
        }else{
          let length = m.values.length
          return <div className="row" key={"g" + m.keyValue} >
            {
                m.values.map(m => {
                  return <div key={"g" + m.key} className={`parent-cnt col-sm-${12/length}`}><div className="form-group">{createForm(m)}</div></div>
              })
            }
          </div>
        }
    });
    return formUI;
  };

    let title = props.title || "";
    let generalError = null
    if (props.generalError) {
      if (typeof props.generalError == "string") {
          generalError =
            <div key="error_1" className="alert alert-danger alert-dismissible fade show" role="alert">
              {Translate(props, props.generalError)}
            </div>
      } else {
        let errors = []
        if(props.generalError.error){
          errors = props.generalError.error
        }else{
          errors = props.generalError
        }
        try{
          generalError =
            errors.map((error, index) => {
              return (
                <div key={index} className="alert alert-danger alert-dismissible fade show" role="alert">
                  {Translate(props, error.message ? error.message : error.msg)}
                  {/* <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button> */}
                </div>
              )
            })
          }catch(error){
          //silence
        }

      }
    }else if(props.errorMessage){
      if (typeof props.errorMessage == "string") {
        generalError =
          <div key="error_1" className="alert alert-danger alert-dismissible fade show" role="alert" dangerouslySetInnerHTML={{ __html: props.errorMessage }}></div>
      }
    }

    let aiPopup = null
        if (state.openAiPopup) {
            aiPopup = <div className="popup_wrapper_cnt"> 
                <div className="popup_cnt" style={{maxWidth:"700px"}}>
                    <div className="comments">
                        <div className="VideoDetails-commentWrap">
                            <div className="popup_wrapper_cnt_header">
                                <h2>{Translate(props, "Create Content Using AI")}</h2>
                                <a onClick={(e) => {
                                  e.preventDefault();
                                  setState({ openAiPopup: null });
                                }} className="_close"><i></i></a>
                            </div>
                          <OpenAI data={state.openAiPopup} {...props} setValue={(key,value) => {
                            let fields = { ...state.fields }
                            let errors = { ...state.errors }
                            if(key == "blog"){
                              for(let objectKey in value){
                                if(objectKey == "tags"){
                                  fields[objectKey] = value[objectKey].split(",")
                                }else
                                fields[objectKey] = value[objectKey]
                                errors[objectKey] = null
                              }
                              props.handleEditorChange(value.description)
                            }else{
                              fields[key] = value
                              errors[key] = null
                            }
                            setState({errors, fields,openAiPopup: null})
                          }} />
                        </div>
                    </div>
                </div>
            </div>
        }
    let blogAllowAICreate = parseInt(props.pageData.appSettings["openai_blog_system"],10) == 1 && props.pageData.levelPermissions && parseInt(props.pageData.levelPermissions["openai.blogcreate"],10)  == 1 && parseInt(props.pageData.appSettings.allowOpenAi,10) == 1;

    return (
      <React.Fragment>
        {
          aiPopup
        }
        {
          props.isBlog ?
          
            blogAllowAICreate &&
              <button className="mb-1 floatR ai-button" type="button" onClick={(e) => {
                  e.preventDefault();
                  showPopupOpenAi("blog","blog");
                  // show popup
                }}>{props.t("Generate Blog Using AI")}</button>
          :null
        }
      <div className="user-area clear">
        <div className={props.className}>
          {
            title ? 
              <div className="row">
                <div className="col-md-12">
                  <div className="titleform">
                    {Translate(props, title)}
                  </div>
                </div>
              </div>
            : null
          }
          {
            generalError ?
              <div className="row form-error">
                <div className="col-md-12">
                  <div className="generalErrors">
                    {generalError}
                  </div>
                </div>
              </div>
              : null
          }
          {
            state.model.length ? 
          <form
            className="formFields px-3 gx-2"
            noValidate
            onSubmit={e => {
              onSubmit(e);
            }}
          >
            {renderForm()}
            {
              !props.submitHide ?
                <div className="input-group">
                  <button type="submit" disabled={props.disableButtonSubmit}>{Translate(props, props.submitText ? props.submitText : "Submit Form")}</button>
                </div>
                : null
            }
           
            {
              props.percentCompleted > 0 || props.processing ? 
                <div className="sc-upload-progressbar">
                    {
                        props.percentCompleted < 100 && !props.processing ? 
                        <React.Fragment>
                          <div className="sc-imageprocess">
                            <div className="sc-progress-upload-txt">
                                {props.t("Uploading...")}
                            </div>
                            <div className="sc-cnt-percent">
                              <div className="sc-percentage-100" style={{width:(props.percentCompleted > 30 ? props.percentCompleted - 5 : props.percentCompleted)+"%"}}>
                              </div>
                              <div className="sc-progressbar-cnt" style={{marginLeft:(props.percentCompleted > 30 ? props.percentCompleted - 5 : props.percentCompleted)+"%"}}>
                                {props.percentCompleted}%
                              </div>
                            </div>
                           
                          </div>
                        </React.Fragment>
                    
                    : null
                    }
                    {
                        props.processing ? 
                        <div className="sc-imageprocess-txt">
                            <svg width="60px" viewBox="0 0 100 100" height="60px" dangerouslySetInnerHTML={{__html:'<circle cx="84" cy="50" r="2.56936" fill="#fff"><animate attributeName="r" repeatCount="indefinite" dur="0.5434782608695652s" calcMode="spline" keyTimes="0;1" values="8;0" keySplines="0 0.5 0.5 1" begin="0s"></animate><animate attributeName="fill" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="discrete" keyTimes="0;0.25;0.5;0.75;1" begin="0s"></animate></circle><circle cx="73.0786" cy="50" r="8" fill="#fff"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="0s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="0s"></animate></circle><circle cx="16" cy="50" r="0" fill="#fff"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.5434782608695652s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-0.5434782608695652s"></animate></circle><circle cx="16" cy="50" r="5.43026" fill="#fff"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.0869565217391304s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.0869565217391304s"></animate></circle><circle cx="39.0786" cy="50" r="8" fill="#fff"><animate attributeName="r" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="0;0;8;8;8" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.6304347826086956s"></animate><animate attributeName="cx" repeatCount="indefinite" dur="2.1739130434782608s" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" values="16;16;16;50;84" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" begin="-1.6304347826086956s"></animate></circle>'}}></svg>
                            {
                                props.t(props.textProgress)
                            }
                        </div>
                    : null
                    }
                </div>
              : props.loading ? <Spinner type="uploading" /> : null
            }
          </form>
          : null
         }
        </div>
      </div>
      </React.Fragment>
    );
  }
export default DynamicForm