import React, { useReducer, useEffect } from "react";
import Translate from "../../../components/Translate/Index";
import swal from "sweetalert";
import axios from "../../../axios-orders";

const Generes = (props) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      generes: props.generes ? props.generes : [],
      movie: props.movie ? props.movie : {},
      values: "",
      tags: [],
    }
  );

  useEffect(() => {
    if (state.generes != props.generes) {
      setState({
        generes: props.generes ? props.generes : [],
        movie: props.movie ? props.movie : {},
        values: "",
        tags: [],
      });
    }
  }, [props.generes]);

  const updateValues = (values) => {
    //update the values
    props.updateSteps({ key: "generes", value: values });
  };
  const addGenres = (e) => {
    e.preventDefault();
    setState({ addGenre: true });
  };
  const deleteGenere = (genre_id, e) => {
    e.preventDefault();
    swal({
      title: Translate(props, "Delete Genre?"),
      text: Translate(props, "Are you sure you want to delete this genre?"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const formData = new FormData();
        formData.append("id", genre_id);
        formData.append("movie_id", state.movie.movie_id);
        const url = "/movies/genres/delete";
        axios
          .post(url, formData)
          .then((response) => {
            if (response.data.error) {
              swal(
                "Error",
                Translate(
                  props,
                  "Something went wrong, please try again later",
                  "error"
                )
              );
            } else {
              let message = response.data.message;
              
              const items = [...state.generes];
              const itemIndex = items.findIndex(
                (p) => p["movie_genre_id"] == genre_id
              );
              if (itemIndex > -1) {
                items.splice(itemIndex, 1);
                updateValues(items);
              }
              props.openToast({message:Translate(props,message), type:"success"});
            }
          })
          .catch((err) => {
            swal(
              "Error",
              Translate(props, "Something went wrong, please try again later"),
              "error"
            );
          });
        //delete
      } else {
      }
    });
  };
  const closeGeneres = () => {
    setState({ addGenre: false });
  };
  const processValue = (value) => {
    return value
      .replace(/[^a-z0-9_]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  };
  const submit = (e) => {
    e.preventDefault();
    if (state.submitting || !state.tags.length) {
      return false;
    }
    setState({ submitting: true, localUpdate: true });
    let formData = new FormData();
    formData.append("movie_id", state.movie.movie_id);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    let url = "/movies/genres/create";

    formData.append("tags", JSON.stringify(state.tags));

    axios
      .post(url, formData, config)
      .then((response) => {
        if (response.data.error) {
          setState({
            
            error: response.data.error,
            submitting: false,
          });
        } else {
          setState(
            {
              addGenre: false,
              tags: [],
              submitting: false,
              
              generes: [...response.data.generes, ...state.generes],
            }
          );
          updateValues([...response.data.generes, ...state.generes]);
        }
      })
      .catch((err) => {
        setState({  submitting: false, error: err });
      });
  };
  const addTags = (e) => {
    if (state.submitting) {
      return false;
    }
    e.preventDefault();
    let tags = [];
    state.values.split(",").forEach((item) => {
      let value = processValue(item);
      if (value) {
        if (
          state.tags.find((tag) => tag["key"] == value) ||
          tags.find((tag) => tag["key"] == value) ||
          state.generes.find((tag) => tag["slug"] == value)
        ) {
          return;
        }
        tags.push({ key: value, value: item });
      }
    });
    setState({ values: "",  tags: [...state.tags, ...tags] });
  };
  const inputKeyDown = (e) => {
    if (state.submitting) {
      return false;
    }
    const val = e.target.value;
    if (e.key === "Enter" && val) {
      addTags(e);
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  const removeTag = (i, e) => {
    if (state.submitting) {
      return false;
    }
    const newTags = [...state.tags];
    newTags.splice(i, 1);
    setState({  tags: newTags });
  };

  let addGenresData = null;

  if (state.addGenre) {
    addGenresData = (
      <div className="popup_wrapper_cnt">
        <div className="popup_cnt">
          <div className="comments">
            <div className="VideoDetails-commentWrap">
              <div className="popup_wrapper_cnt_header">
                <h2>{Translate(props, "Add Genres")}</h2>
                <a onClick={closeGeneres} className="_close">
                  <i></i>
                </a>
              </div>

              <div className="user-area clear">
                <div className="container">
                  <form className="formFields" onSubmit={submit}>
                    <div className="form-group genres_input">
                      <input
                        className="form-input form-control"
                        type="text"
                        onKeyDown={inputKeyDown}
                        value={state.values}
                        onChange={(e) =>
                          setState({
                            values: e.target.value,
                            
                          })
                        }
                      />
                      <button type="button" className="mt-3" onClick={addTags}>
                        {props.t("Add")}
                      </button>
                    </div>
                    <p>
                      {props.t(
                        "Separate genres with comma (eg: fun,horror,fiction etc)."
                      )}
                    </p>
                    {state.tags.length ? (
                      <React.Fragment>
                        <div className="form-group genres_tags">
                          <div className="input-tag">
                            <ul className="input-tag__tags">
                              {state.tags.map((item, i) => {
                                return (
                                  <li key={i}>
                                    {item.value}
                                    <button
                                      type="button"
                                      onClick={(e) => removeTag(i, e)}
                                    >
                                      +
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                        <div className="input-group">
                          <button type="submit">
                            {state.submitting
                              ? props.t("Submitting...")
                              : props.t("Submit")}
                          </button>
                        </div>
                      </React.Fragment>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {addGenresData}
      <div className="movie_generes">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <button className="add_generes" onClick={(e) => addGenres(e)}>
                {props.t("Add Genres")}
              </button>
              {state.generes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table custTble1">
                    <thead>
                      <tr>
                        <th scope="col">{props.t("Name")}</th>
                        <th scope="col">{props.t("Slug")}</th>
                        <th scope="col">{props.t("Options")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.generes.map((generes, index) => {
                        return (
                          <tr key={generes.genre_id}>
                            <td>{generes.title}</td>
                            <td>{generes.slug}</td>
                            <td>
                              <div className="actionBtn">
                                <a
                                  className="text-danger"
                                  href="#"
                                  title={Translate(props, "Delete")}
                                  onClick={(e) =>
                                    deleteGenere(generes.movie_genre_id, e)
                                  }
                                >
                                  <span
                                    className="material-icons"
                                    data-icon="delete"
                                  ></span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};


export default Generes;
