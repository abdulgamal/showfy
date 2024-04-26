import React, { useReducer, useEffect, useRef } from "react";

const File = (props) => {
  const dropRef = useRef(null);
  const fileUpload = useRef(null);
  const dragCounter = useRef();
  dragCounter.current = 0
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      drag: false,
    }
  );
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setState({ drag: true });
    }
  };
  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setState({ drag: false });
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setState({ drag: false });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      props.onChange(
        e,
        props.keyName,
        "single",
        props.videoKey ? props.videoKey : "file",
        props.m
      );
      e.dataTransfer.clearData();
      dragCounter.current = 0;
    }
  };
  useEffect(() => {
    let div = dropRef.current;
    div.addEventListener("dragenter", handleDragIn);
    div.addEventListener("dragleave", handleDragOut);
    div.addEventListener("dragover", handleDrag);
    div.addEventListener("drop", handleDrop);
    return () => {
      div.removeEventListener("dragenter", handleDragIn);
      div.removeEventListener("dragleave", handleDragOut);
      div.removeEventListener("dragover", handleDrag);
      div.removeEventListener("drop", handleDrop);
    };
  }, []);

  const clickUploadImage = () => {
    fileUpload.current.click();
  };

  let customProps = {};
  if (props.typeUpload == "video") {
    customProps["accept"] = "video/*";
  } else if (props.typeUpload == "audio") {
    customProps["accept"] = "audio/*";
  } else {
    customProps["accept"] = "image/*";
  }

  let style = {}

  if(state.drag){
    style.style = {
      outline: "2px dashed white"
    }
  }

  return (
    <div className="filesinput" ref={dropRef}>
      <div
        className="file_input uploadicn"
        {...style}
        onClick={clickUploadImage}
      >
        <i className="fa fa-upload" aria-hidden="true"></i>
        {props.defaultText
          ? props.defaultText
          : props.t("Drag & Drop Image Here")}
      </div>
      <input
        {...props.data}
        {...customProps}
        style={{
          display: "none",
        }}
        className="form-control"
        ref={fileUpload}
        type="file"
        key={props.keyName}
        id={props.keyName}
        name={props.name}
        onChange={(e) =>
          props.onChange(e, props.target, "single", props.type, props.m)
        }
      />
    </div>
  );
};

export default File;
