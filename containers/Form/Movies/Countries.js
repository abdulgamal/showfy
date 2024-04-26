import React,{useReducer,useEffect} from 'react'
import Translate from "../../../components/Translate/Index";
import swal from "sweetalert"
import axios from "../../../axios-orders"

const Countries = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            countries:props.countries ? props.countries : [],
            movie:props.movie ? props.movie : {},
            movie_countries:props.movie_countries ? props.movie_countries : [],
            values:"",
            tags:[]
        }
    );

    useEffect(() => {
        if(props.movie_countries != state.movie_countries || props.countries != state.countries){
            setState({
                countries:props.countries ? props.countries : [],
                movie:props.movie ? props.movie : {},
                movie_countries:props.movie_countries ? props.movie_countries : [],
                values:"",
                tags:[]       
            })
        }
    },[])
    
    const updateValues = (values) => {
        //update the values
        props.updateSteps({key:"movie_countries",value:values})
    }
    const addCountry = (e) => {
        e.preventDefault();
        setState({addCountry:true});
    }
    const deleteCountry = (country_id,e) => {
        e.preventDefault();
        swal({
            title: Translate(props,"Delete Country?"),
            text: Translate(props,"Are you sure you want to delete this country?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', country_id)
                    formData.append('movie_id', state.movie.movie_id);
                    const url = "/movies/country/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                const items = [...state.movie_countries]
                                const itemIndex = items.findIndex(p => p["movie_country_id"] == country_id)
                                if(itemIndex > -1){
                                    items.splice(itemIndex, 1)
                                    updateValues(items)
                                }
                            }
                        }).catch(err => {
                            swal("Error", Translate(props,"Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    const closeCountry = () => {
        setState({addCountry:false})
    }
    const processValue = (value) => {
        return value.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
    }
    const submit = (e) => {
        e.preventDefault();
        if(state.submitting || !state.tags.length){
            return false;
        }
        setState({submitting:true})
        let formData = new FormData();
        formData.append('movie_id', state.movie.movie_id)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/country/create';

        formData.append("countries",JSON.stringify(state.tags));

        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, submitting: false });
                } else {
                    setState({addCountry:false,tags:[],submitting:false,movie_countries:[ ...response.data.movie_countries,...state.movie_countries  ]})
                    setTimeout(() => {
                        updateValues(state.movie_countries)
                    },200)
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    }

    const getCountryName = (id) => {
        const itemIndex = state.countries.findIndex(p => p["id"] == id)
        if(itemIndex > -1){
            return state.countries[itemIndex]['nicename']
        }
    }

    const addTags = (e) => {
        if(state.submitting){
            return false;
        }
        e.preventDefault();
        let tags = []
        state.values.split(",").forEach(item => {
            let value = item
            if(value){
                if (state.tags.find(tag => tag["key"] == value) || tags.find(tag => tag["key"] == value) || state.movie_countries.find(tag => tag["id"] == value)  ) {
                    return;
                }
                tags.push({key:value,value:getCountryName(value)})
            }
        })
        setState({values:"", tags: [...state.tags, ...tags] });
    }
    
    const  removeTag = (i,e) => {
        if(state.submitting){
            return false;
        }
        const newTags = [...state.tags];
        newTags.splice(i, 1);
        setState({ tags: newTags });
      } 
      const   addCountryValue = (e) => {
         setState({values:e.target.value})
      }

        let addCountryData = null

        if(state.addCountry){
            addCountryData = (
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{Translate(props,"Add Country")}</h2>
                                    <a onClick={closeCountry}  className="_close"><i></i></a>
                                </div>
                                <div className="user-area clear">
                                    <div className="container">
                                        <form className="formFields" onSubmit={submit}>
                                            <div className="form-group genres_input">
                                                <select className="form-input form-control form-select" value={state.values} onChange={addCountryValue}>
                                                    {
                                                        state.countries.map((item,i) => {
                                                            return(
                                                                <React.Fragment key={item.id+"11w112"}>
                                                                    {
                                                                        i == 0 ?
                                                                            <option key={item.id+"11112"}>{props.t("Select Country")}</option>
                                                                        : null
                                                                    }
                                                                     <option value={item.id} key={item.id}>{item.nicename}</option>
                                                                </React.Fragment>
                                                               
                                                            )
                                                        })
                                                    }    
                                                </select>  
                                                <button type="button" className="mt-3" onClick={addTags}>{props.t("Add")}</button>  
                                            </div>
                                            {/* <p>{props.t("Separate countries with comma.")}</p> */}
                                            {
                                                state.tags.length ?
                                                    <React.Fragment>
                                                        <div className="form-group genres_tags">
                                                            <div className="input-tag">
                                                                <ul className="input-tag__tags">
                                                                {
                                                                    state.tags.map((item,i) => {
                                                                    return (
                                                                        <li key={i}>{item.value}<button type="button" onClick={(e) => removeTag(i,e)}>+</button></li>
                                                                        )
                                                                    })
                                                                }
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div className="input-group">
                                                            <button type="submit">{state.submitting ? props.t("Submitting...") : props.t("Submit")}</button>
                                                        </div>
                                                    </React.Fragment>
                                                : null
                                            }
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }


        return (
            <React.Fragment>
                {
                    addCountryData
                }
                <div className="movie_countries">
                    <div className="container">
                        <div className="row"> 
                            <div className="col-md-12">        
                                <button className="add_countries" onClick={(e) => addCountry(e)}>
                                    {
                                        props.t("Add Country")
                                    }
                                </button>     
                                {
                                    state.movie_countries.length > 0 ? 
                                        <div className="table-responsive">
                                            <table className="table custTble1">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">{props.t("Code")}</th>
                                                        <th scope="col">{props.t("Name")}</th>
                                                        <th scope="col">{props.t("Options")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        state.movie_countries.map((countries,index) => {
                                                            return (
                                                                <tr key={countries.movie_country_id}>
                                                                    <td>
                                                                            {countries.iso}
                                                                    </td>
                                                                    <td>{countries.nicename}</td>
                                                                    <td>
                                                                        <div className="actionBtn">
                                                                            <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={(e) => deleteCountry(countries.movie_country_id,e)}><span className="material-icons" data-icon="delete"></span></a>                                                                                           
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

export default Countries