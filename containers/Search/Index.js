import React, { useReducer, useEffect, useRef } from "react";
import Router from "next/router";
import Translate from "../../components/Translate/Index";
import AdsIndex from "../Ads/Index";

const Index = (props) => {
  const search = props.pageData.search;
  let propsType = props.typeData ? "serie" : props.type;
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      fields: {
        categories: search && search.category_id ? search.category_id : "",
        subCategory:
          search && search.subcategory_id ? search.subcategory_id : "",
        subSubCatgeory:
          search && search.subsubcategory_id ? search.subsubcategory_id : "",
        q: search && search.q ? search.q : "",
        sort: search && search.sort ? search.sort : "",
        tag: search && search.tag ? search.tag : "",
        genre: search && search.genre ? search.genre : "",
        type: search && search.type ? search.type : "",
        language: search && search.language ? search.language : "",
        country: search && search.country ? search.country : "",
      },
      sort: {
        latest: "Latest " + capitalizeFirstLetter(propsType + "s"),
        favourite: "Most Favourite " + capitalizeFirstLetter(propsType + "s"),
        view: "Most Viewed " + capitalizeFirstLetter(propsType + "s"),
        like: "Most Liked " + capitalizeFirstLetter(propsType + "s"),
        dislike: "Most Disliked " + capitalizeFirstLetter(propsType + "s"),
        commented: "Most Commented " + capitalizeFirstLetter(propsType + "s"),
        rated: "Most Rated " + capitalizeFirstLetter(propsType + "s"),
        played: "Most Played " + capitalizeFirstLetter(propsType + "s"),
      },
      type: {
        featured: "Featured " + capitalizeFirstLetter(propsType + "s"),
        sponsored: "Sponsored " + capitalizeFirstLetter(propsType + "s"),
        hot: "Hot " + capitalizeFirstLetter(propsType + "s"),
      },
      filterForm: 0,
    }
  );
  useEffect(() => {
    const search = props.pageData.search;
    setState({
      fields: {
        categories: search && search.category_id ? search.category_id : "",
        subCategory:
          search && search.subcategory_id ? search.subcategory_id : "",
        subSubCatgeory:
          search && search.subsubcategory_id ? search.subsubcategory_id : "",
        q: search && search.q ? search.q : "",
        sort: search && search.sort ? search.sort : "",
        tag: search && search.tag ? search.tag : "",
        genre: search && search.genre ? search.genre : "",
        type: search && search.type ? search.type : "",
        language: search && search.language ? search.language : "",
        country: search && search.country ? search.country : "",
      },
    })
  }, [props]);

  const onCategoryChange = (e) => {
    const fields = { ...state.fields };
    fields["categories"] = e.target.value;
    fields["subSubCatgeory"] = "";
    fields["subCategory"] = "";
    setState({  fields: fields });
  };
  const onSubCategoryChange = (e) => {
    const fields = { ...state.fields };
    fields["subSubCatgeory"] = "";
    fields["subCategory"] = e.target.value;
    setState({  fields: fields });
  };
  const onSubSubCategoryChange = (e) => {
    const fields = { ...state.fields };
    fields["subSubCatgeory"] = e.target.value;
    setState({  fields: fields });
  };
  const changeTitle = (e) => {
    const fields = { ...state.fields };
    fields["q"] = e.target.value;
    if (state.tag) {
      fields["tag"] = e.target.value;
    }
    if (state.genre) {
      fields["genre"] = e.target.value;
    }
    setState({  fields: fields });
  };
  const changeSort = (e) => {
    const fields = { ...state.fields };
    fields["sort"] = e.target.value;
    setState({  fields: fields });
  };
  const changeCountry = (e) => {
    const fields = { ...state.fields };
    fields["country"] = e.target.value;
    setState({  fields: fields });
  };
  const changeLanguage = (e) => {
    const fields = { ...state.fields };
    fields["language"] = e.target.value;
    setState({  fields: fields });
  };
  const changeType = (e) => {
    const fields = { ...state.fields };
    fields["type"] = e.target.value;
    setState({  fields: fields });
  };
  const submitForm = (e,reset) => {
    if (e) e.preventDefault();
    const values = {};
    for (var key in state.fields) {
      if (state.fields[key] && state.fields[key] != "") {
        let keyName = key;
        if (key == "categories") {
          keyName = "category_id";
        } else if (key == "subCategory") {
          keyName = "subcategory_id";
        } else if (key == "subSubCatgeory") {
          keyName = "subsubcategory_id";
        } else if (key == "tag") {
          continue;
        } else if (key == "genre") {
          continue;
        }
        values[keyName] = state.fields[key];
      }
    }
    if (state.fields.tag) {
      if (state.fields.q) values["tag"] = state.fields.q;
    } else if (state.fields.genre) {
      if (state.fields.q) values["genre"] = state.fields.q;
    } else {
      if (state.fields.q) values["q"] = state.fields.q;
    }
    let subtype = "";
    let asPath = "";
    if (props.subtype) {
      subtype = `?artistType=${props.subtype}`;
      asPath = `/${props.subtype}`;
    }
    var queryString = Object.keys(values)
      .map((key) => key + "=" + values[key])
      .join("&");

    let url = `${props.type}s`;
    if (props.typeData == "series") {
      url = `series`;
    }
    if (props.type == "audio") {
      url = `${props.type}`;
    }
    if (props.liveStreamingPage) {
      url = "live";
    }

    if(reset){
      queryString = ""
    }

    Router.push(`/${url}${asPath}${queryString ? "?" + queryString : ""}`);
  };
  
  const searchButton = (e) => {
    e.preventDefault();
    setState({  filterForm: !state.filterForm });
  };
  let sortArray = [];
  for (var key in state.sort) {
    if (key == "latest") {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (
      key == "favourite" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_favourite"
      ] == 1
    ) {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (key == "view") {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (
      key == "like" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_like"
      ] == "1"
    ) {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (
      key == "dislike" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_dislike"
      ] == "1"
    ) {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (
      key == "rated" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_rating"
      ] == "1"
    ) {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (
      key == "commented" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_comment"
      ] == "1"
    ) {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (
      key == "rated" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_rating"
      ] == "1"
    ) {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    } else if (key == "played" && props.type == "audio") {
      sortArray.push({ key: key, value: Translate(props, state.sort[key]) });
    }
  }

  const typeArray = [];
  for (var key in state.type) {
    if (
      key == "featured" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_featured"
      ] == 1
    ) {
      typeArray.push({ key: key, value: Translate(props, state.type[key]) });
    } else if (
      key == "sponsored" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_sponsored"
      ] == 1
    ) {
      typeArray.push({ key: key, value: Translate(props, state.type[key]) });
    } else if (
      key == "hot" &&
      props.pageData.appSettings[
        (props.subtype ? props.subtype + "_" : "") + props.type + "_hot"
      ] == 1
    ) {
      typeArray.push({ key: key, value: Translate(props, state.type[key]) });
    }
  }

  let categories = [];
  let subcategories = [];
  let subsubcategories = [];
  if (props.pageData.categories) {
    categories.push({
      key: "",
      value: Translate(props, "Please Select Category"),
    });
    props.pageData.categories.forEach((res) => {
      categories.push({
        key: res.category_id,
        value: Translate(props, res.title),
      });
    });

    //get sub category
    if (state.fields.categories) {
      props.pageData.categories.forEach((res) => {
        if (res.category_id == state.fields.categories) {
          if (res.subcategories) {
            subcategories.push({
              key: 0,
              value: Translate(props, "Please Select Sub Category"),
            });
            res.subcategories.forEach((rescat) => {
              subcategories.push({
                key: rescat.category_id,
                value: Translate(props, rescat.title),
              });
            });
          }
        }
      });

      if (subcategories.length > 0) {
        if (state.fields.subCategory) {
          props.pageData.categories.forEach((res) => {
            if (res.category_id == state.fields.categories) {
              if (res.subcategories) {
                res.subcategories.forEach((rescat) => {
                  if (rescat.category_id == state.fields.subCategory) {
                    if (rescat.subsubcategories) {
                      subsubcategories.push({
                        key: 0,
                        value: Translate(
                          props,
                          "Please Select Sub Sub Category"
                        ),
                      });
                      rescat.subsubcategories.forEach((ressubcat) => {
                        subsubcategories.push({
                          key: ressubcat.category_id,
                          value: Translate(props, ressubcat.title),
                        });
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    }
  }

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-sm-12">
          <a
            className={`filter-search ${state.filterForm ? "active" : ""}`}
            href="#"
            title={Translate(props, "Search Filters")}
            onClick={searchButton}
          >
            <span className="material-icons" data-icon="tune"></span>
            {Translate(props, "Filter")}
          </a>
        </div>
      </div>
      {state.filterForm ? (
        <React.Fragment>
          <div className="grid-menu justify-content-between search-form">
            <form className="row gy-3" onSubmit={submitForm}>
              {state.fields.genre ? (
                <div className="form-group col-sm-4">
                  <label htmlFor="q" className="control-label">
                    {Translate(props, "Genre")}
                  </label>
                  <input
                    type="text"
                    onChange={changeTitle}
                    value={state.fields.genre}
                    id="q"
                    className="form-control"
                    placeholder={Translate(props, "Genre")}
                  />
                </div>
              ) : (
                <div className="form-group col-sm-4">
                  <label htmlFor="q" className="control-label">
                    {Translate(props, state.fields.tag ? "Tags" : "Title")}
                  </label>
                  <input
                    type="text"
                    onChange={changeTitle}
                    value={Translate(
                      props,
                      state.fields.tag ? state.fields.tag : state.fields.q
                    )}
                    id="q"
                    className="form-control"
                    placeholder={Translate(props, "Title")}
                  />
                </div>
              )}
              {categories.length > 0 ? (
                <React.Fragment>
                  <div className="form-group col-sm-4">
                    <label htmlFor="name" className="control-label">
                      {Translate(props, "Categories")}
                    </label>
                    <select
                      className="form-control form-select"
                      value={state.fields.categories}
                      onChange={onCategoryChange}
                    >
                      {categories.map((res) => {
                        return (
                          <option key={res.key} value={res.key}>
                            {Translate(props, res.value)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {subcategories.length > 0 ? (
                    <div className="form-group col-sm-4">
                      <label htmlFor="name" className="control-label">
                        {Translate(props, "Sub Categories")}
                      </label>
                      <select
                        className="form-control form-select"
                        value={state.fields.subCategory}
                        onChange={onSubCategoryChange}
                      >
                        {subcategories.map((res) => {
                          return (
                            <option key={res.key} value={res.key}>
                              {Translate(props, res.value)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : null}
                  {subsubcategories.length > 0 ? (
                    <div className="form-group col-sm-4">
                      <label htmlFor="name" className="control-label">
                        {Translate(props, "Sub Sub Categories")}
                      </label>
                      <select
                        value={state.fields.subSubCatgeory}
                        className="form-control form-select"
                        onChange={onSubSubCategoryChange}
                      >
                        {subsubcategories.map((res) => {
                          return (
                            <option key={res.key} value={res.key}>
                              {Translate(props, res.value)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : null}
                </React.Fragment>
              ) : null}
              {props.type == "movie" ? (
                <React.Fragment>
                  {props.pageData.spokenLanguage &&
                  props.pageData.spokenLanguage.length > 0 ? (
                    <div className="form-group col-sm-4">
                      <label htmlFor="name" className="control-label">
                        {Translate(props, "Languages")}
                      </label>
                      <select
                        onChange={changeLanguage}
                        className="form-control form-select"
                        value={state.fields.language}
                      >
                        <option value="">
                          {Translate(props, "Select Language")}
                        </option>
                        {props.pageData.spokenLanguage.map((res) => {
                          return (
                            <option key={res.code} value={res.code}>
                              {Translate(props, res.name)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : null}
                  {props.pageData.countries &&
                  props.pageData.countries.length > 0 ? (
                    <div className="form-group col-sm-4">
                      <label htmlFor="name" className="control-label">
                        {Translate(props, "Countries")}
                      </label>
                      <select
                        onChange={changeCountry}
                        className="form-control form-select"
                        value={state.fields.country}
                      >
                        <option value="">
                          {Translate(props, "Select Countries")}
                        </option>
                        {props.pageData.countries.map((res) => {
                          return (
                            <option key={res.id} value={res.id}>
                              {Translate(props, res.nicename)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : null}
                </React.Fragment>
              ) : null}
              {sortArray.length > 0 && !props.liveStreamingPage ? (
                <div className="form-group col-sm-4">
                  <label htmlFor="name" className="control-label">
                    {Translate(props, "Sort")}
                  </label>
                  <select
                    onChange={changeSort}
                    className="form-control form-select"
                    value={state.fields.sort}
                  >
                    <option value="">{Translate(props, "Sort By")}</option>
                    {sortArray.map((res) => {
                      return (
                        <option key={res.key} value={res.key}>
                          {Translate(props, res.value)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : null}
              {typeArray.length > 0 && !props.liveStreamingPage ? (
                <div className="form-group col-sm-4">
                  <label htmlFor="name" className="control-label">
                    {Translate(props, "Type")}
                  </label>
                  <select
                    onChange={changeType}
                    className="form-control form-select"
                    value={state.fields.type}
                  >
                    <option value="">{Translate(props, "Type")}</option>
                    {typeArray.map((res) => {
                      return (
                        <option key={res.key} value={res.key}>
                          {Translate(props, res.value)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : null}
              <div className="form-group col-sm-4 searchBtn filterBtn">
                <button type="submit">{Translate(props, "Search")} </button>
                {" or "}
                <a
                  href="#"
                  style={{ fontSize: "16px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    let data = {};
                    for (var key in state.fields) {
                      data[key] = "";
                    }
                    setState({  fields: data });
                    submitForm(e,"reset");
                  }}
                >
                  {Translate(props, "reset")}
                </a>
              </div>
            </form>
          </div>
          {props.pageData.appSettings["below_searchform"] ? (
            <AdsIndex
              paddingTop="20px"
              className="below_searchform"
              ads={props.pageData.appSettings["below_searchform"]}
            />
          ) : null}
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default Index;
