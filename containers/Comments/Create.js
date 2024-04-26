import React, { useReducer } from "react";
import dynamic from "next/dynamic";
import UserImage from "../User/Image";
import Translate from "../../components/Translate/Index";
const OpenAI = dynamic(() => import("../../containers/OpenAI"), {
    ssr: false,
  });

const Create = (props) => {
  const commentref = React.createRef();
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {

    }
  );
  var createObjectURL =
    (URL || webkitURL || {}).createObjectURL || function () {};
  let color = null;
  // if(props.edit){
  //     color = {
  //         color:"black"
  //     }
  // }
  let style = {};
  if (!props.pageData.loggedInUserDetails) {
    style = { style: { width: "100%" } };
  }

  let allowAICreate = false;
  let customtags = {}
  if (
    parseInt(props.pageData.appSettings["openai_image_system"], 10) == 1 &&
    props.pageData.levelPermissions &&
    parseInt(props.pageData.levelPermissions["openai.imagecreate"], 10) == 1 &&
    parseInt(props.pageData.appSettings.allowOpenAi, 10) == 1
  ) {
    allowAICreate = true;
    customtags = {
      "data-bs-toggle":"dropdown",
      "aria-expanded":"false"
    }
  }

  let generateAiDescription = false;
  if(parseInt(props.pageData.appSettings["openai_description_system"],10) == 1 && props.pageData.levelPermissions && parseInt(props.pageData.levelPermissions["openai.descriptioncreate"],10)  == 1 && parseInt(props.pageData.appSettings.allowOpenAi,10) == 1){
    generateAiDescription = true;
  }


  let price = parseFloat(props.pageData.appSettings.openai_image_price) || 0;

  let aiPopup = null;
  if (state.openAiPopup) {
    aiPopup = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt"  style={{maxWidth:"700px"}}>
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Create Content Using AI")}</h2>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setState({ openAiPopup: null });
                  }}
                  className="_close"
                > 
                  <i></i>
                </a>
              </div>
              <OpenAI
                {...props}
                data={state.openAiPopup}
                setValue={(key, value) => {
                    if(key === 'comment_data'){
                        props.textChange(props.autofocus ? true : false,{target:{value:value}})
                    }else
                        props.changeImage(props.comment_id, value)
                  setState({ openAiPopup: null });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create_new_comment">
        {aiPopup}
      {props.pageData && props.pageData.loggedInUserDetails ? (
        <div className="user_avatar">
          <UserImage
            {...props}
            noRedirect={true}
            imageSuffix={props.pageData.imageSuffix}
            data={props.pageData.loggedInUserDetails}
          />
        </div>
      ) : null}
      <div className="input_comment" {...style}>
        {
          generateAiDescription &&
          <button className="mb-1 floatR ai-button" type="button" onClick={(e) => {
              e.preventDefault();
              let price = 0;
              price = parseFloat(props.pageData.appSettings.openai_description_price) || 0
              
              setState({
              openAiPopup:{
                  price:price,
                  type:"textarea",
                  key:"comment_data",
              }
              })
              // show popup
          }}>{props.t("Generate Using AI")}</button>
        }
        {props.autofocus ? (
          <textarea
            style={color}
            autoFocus
            placeholder={props.t("Write your reply here...")}
            value={props.message}
            onChange={props.textChange.bind(this, true)}
          ></textarea>
        ) : (
          <textarea
            style={color}
            placeholder={props.t("Write your comment here...")}
            value={props.message}
            onChange={props.textChange.bind(this, false)}
          ></textarea>
        )}
        {props.image ? (
          <div className="newcomntImg-prev">
            <img
              className="comment-preview-image"
              src={
                props.image
                  ? typeof props.image == "string"
                    ? props.image
                    : createObjectURL(props.image)
                  : null
              }
              alt=""
            />
            <a
              className="comment-image-close"
              onClick={props.removeImage.bind(this, props.autofocus)}
            >
              X
            </a>
          </div>
        ) : null}
        <div className="comntAction">
          <div className="commentImgfile">
            <div className="TitleRightDropdown editCoverImg dropup">
            {!allowAICreate && (
                  <input
                    className="fileNone"
                    accept="image/*"
                    onChange={(e) => props.changeImage(props.comment_id, e)}
                    ref={commentref}
                    type="file"
                  />
                )}
              <a
                className="link"
                {...customtags}
                href="#"
                title={Translate(props, "Upload Image")}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!allowAICreate) commentref.current.click();
                }}
              >
                <span className="material-icons" data-icon="camera_alt"></span>
               
              </a>
              {allowAICreate && (
                <ul className="dropdown-menu edit-options">
                  <li>
                  <input
                      className="fileNone"
                      accept="image/*"
                      onChange={(e) => props.changeImage(props.comment_id, e)}
                      ref={commentref}
                      type="file"
                    />
                    <a
                      className="a-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        commentref.current.click();
                      }}
                      style={{ lineHeight: "20px" }}
                    >
                      {props.t("Upload New")}
                    </a>
                   
                  </li>
                  <li>
                    <a
                      className="a-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setState({
                          openAiPopup: {
                            price: price,
                            type: "file",
                            key: "comment",
                          },
                        });
                      }}
                      style={{ lineHeight: "20px" }}
                    >
                      {props.t("Generate Using AI")}
                    </a>
                  </li>
                </ul>
              )}
            </div>
            {/* <label onClick={e => {
                                commentref.current.click();
                            }}> 
                            <span className="material-icons" data-icon="camera_alt"></span>
                        </label> */}
            {/* <input className="fileNone" accept="image/*" onChange={props.changeImage.bind(this,props.comment_id)}  ref={commentref} type="file" /> */}
          </div>
          <button
            className="postcoment"
            onClick={props.create.bind(this, props.autofocus, props.comment_id)}
          >
            {props.edit
              ? props.posting
                ? props.t("Editing...")
                : props.t("Edit")
              : props.posting
              ? props.t("Posting...")
              : props.t("Post")}
          </button>
        </div>
      </div>
      <style jsx>
        {`
          .header-info-wrap .coverphotoUser .editCoverImg a.a-link {
            text-align: left;
          }
          .TitleRightDropdown .edit-options.show {
            min-width: 200px;
          }
          .TitleRightDropdown .edit-options.show li a {
            align-items: flex-start;
          }
          .edit-options li{
            padding:0px;
            margin:0px;
          }
        `}
      </style>
    </div>
  );
};

export default Create;
