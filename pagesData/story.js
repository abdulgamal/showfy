import React from "react";
import Router from "next/router";
import StoryView from "../containers/Stories/Carousel/Index";

const closePopup = (type) => {
  if (typeof type == "undefined") type = false;
  if (type == "close") type = false;

  if (!type) {
    Router.push("/", "/");
    $("body").removeClass("stories-open");
  }
};
const updateStories = () => {};
const Story = (props) => (
  <React.Fragment>
    { (
      <StoryView
        {...props}
        fromStoryViewPage={true}
        closePopupFirst={closePopup}
        updateStories={updateStories}
      />
    )}
  </React.Fragment>
);

export default Story;
