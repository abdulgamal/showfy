import React,{useReducer,useEffect,useRef} from 'react'
import axios from "../../../axios-orders"
import Translate from "../../../components/Translate/Index";
import swal from "sweetalert"
import AddEpisode from "./AddEpisode"
import AddCast from "./AddCast"
import Image from "../../Image/Index"
import AddImage from "./AddImage"

const  Seasons = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            seasons:props.seasonsCrew ? props.seasonsCrew : props.seasons,
            movie:props.movie,
            selected:props.selected ? props.selected : 0,
            selectedTabs:props.selectedTabs ? props.selectedTabs : [],
            fromCastnCrew:props.fromCastnCrew ? props.fromCastnCrew : false
        }
    );

    useEffect(() => {
        if(props.movie != state.movie || props.fromCastnCrew != state.fromCastnCrew || (props.seasonsCrew != state.seasonsCrew || props.seasons != state.seasons)){
            setState({
                movie:props.movie ? props.movie : {},
                seasons:props.seasonsCrew ? props.seasonsCrew : props.seasons ? props.seasons : [],  
                fromCastnCrew:props.fromCastnCrew ? props.fromCastnCrew : false,
            })
        }
    },[props])
   
    const updateValues = (values) => {
        //update the values
        if(state.fromCastnCrew){
            props.updateSteps({key:"castncrew",value:[...values[0].castncrew]})
            return
        }
        props.updateSteps({key:"seasons",value:values})
    }
    const createSeason = () => {
        if(state.createSeason){
            return;
        }
        setState({createSeason:true})
        //send request to create season
        let formData = new FormData();
        
        formData.append('movie_id', state.movie.movie_id)
         

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/create-season';
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    setState({ error: response.data.error, createSeason: false });
                } else {
                    setState({createSeason:false,seasons:[...state.seasons , response.data ]})
                    updateValues([...state.seasons , response.data ])
                }
            }).catch(err => {
                setState({ createSeason: false, error: err });
            });
        

    }
    const selectedtab = (selected,id) => {
        let selectedTabs = !state.selectedTabs ? [] : state.selectedTabs
        selectedTabs[id] = selected
        setState({selectedTabs:selectedTabs});
    }
    const deleteEpisode = (id,e) => {
        e.preventDefault();
        swal({
            title: Translate(props,"Delete Episode"),
            text: Translate(props,"Are you sure you want to delete this episode?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', id)
                    formData.append('movie_id', state.movie.movie_id);
                    const url = "/movies/season/episode/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                let season_id = response.data.season_id
                                const items = [...state.seasons]
                                const itemIndex = items.findIndex(p => p["season_id"] == season_id)
                                if(itemIndex > -1){
                                    let casts = items[itemIndex]
                                    const episode = casts.episodes
                                    const itemIndexEpisode = episode.findIndex(p => p["episode_id"] == id)
                                    if(itemIndexEpisode > -1){
                                        episode.splice(itemIndexEpisode, 1)
                                        updateValues(items)
                                    }
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
    const editEpisode = (id,season_id,e) => {
        e.preventDefault();
        const items = [...state.seasons]
        const itemIndex = items.findIndex(p => p["season_id"] == season_id)
        if(itemIndex > -1){
            let season = items[itemIndex];
            let episodes = season.episodes
            const episodIndex = episodes.findIndex(p => p["episode_id"] == id);
            if(episodIndex > -1){
                setState({addEpisode:true,addPostSeason:season_id,editEpisodeItem:episodes[episodIndex]})
            }
        }
    }
    const addEpisode = (season_id,e) => {
        e.preventDefault();
        setState({addEpisode:true,addPostSeason:season_id})
    }
    const addCrew = (season_id,e) => {
        e.preventDefault();
        setState({addCast:true,addPostSeason:season_id,isCrew:true})
    }
    const addCast = (season_id,e) => {
        e.preventDefault();
        setState({addCast:true,addPostSeason:season_id})
    }
    const editCrew = (id,season_id,e) => {
        e.preventDefault();
        editCast(id,season_id,e,true);
    } 
    const deleteCast = (id,e) => {
        e.preventDefault();
        swal({
            title: Translate(props,"Delete Cast"),
            text: Translate(props,"Are you sure you want to delete this cast?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', id)
                    formData.append('movie_id', state.movie.movie_id);
                    const url = "/movies/season/cast/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                let season_id = !state.fromCastnCrew ? response.data.season_id : 0
                                const items = [...state.seasons]
                                const itemIndex = items.findIndex(p => p["season_id"] == season_id)
                                if(itemIndex > -1){
                                    let casts = items[itemIndex]
                                    const castncrew = casts.castncrew
                                    const itemIndexCast = castncrew.findIndex(p => p["cast_crew_id"] == id)
                                    if(itemIndexCast > -1){
                                        castncrew.splice(itemIndexCast, 1)
                                        updateValues(items)
                                    }
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
    const deleteCrew = (id,e) => {
        e.preventDefault();
        swal({
            title: Translate(props,"Delete Crew"),
            text: Translate(props,"Are you sure you want to delete this crew?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', id)
                    formData.append('movie_id', state.movie.movie_id);
                    const url = "/movies/season/crew/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                let season_id = !state.fromCastnCrew ? response.data.season_id : 0
                                const items = [...state.seasons]
                                const itemIndex = items.findIndex(p => p["season_id"] == season_id)
                                if(itemIndex > -1){
                                    let casts = items[itemIndex]
                                    const castncrew = casts.castncrew
                                    const itemIndexCast = castncrew.findIndex(p => p["cast_crew_id"] == id)
                                    if(itemIndexCast > -1){
                                        castncrew.splice(itemIndexCast, 1)
                                        updateValues(items)
                                    }
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
    const deleteSeason = (season_id,e) => {
        e.preventDefault();
        swal({
            title: Translate(props,"Delete Season?"),
            text: Translate(props,"This will also delete all episodes attached to this season."),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', season_id)
                    formData.append('movie_id', state.movie.movie_id);
                    const url = "/movies/season/delete"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                const items = [...state.seasons]
                                const itemIndex = items.findIndex(p => p["season_id"] == season_id)
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
    const closeEpisodeCreate = (data,message) => {
        if(message && data){
            props.openToast({message:Translate(props,message), type:"success"});
        }
        if(data && typeof data.episode_id != "undefined"){
            const items = [...state.seasons]
            const itemIndex = items.findIndex(p => p["season_id"] == state.addPostSeason)
            if(itemIndex > -1){
                let season = items[itemIndex];
                let episodes = season.episodes
                if(state.editEpisodeItem){
                    const episodIndex = episodes.findIndex(p => p["episode_id"] == state.editEpisodeItem.episode_id);
                    if(episodIndex > -1){
                        episodes[episodIndex] = data
                        setState({addEpisode:false,addPostSeason:0,editEpisodeItem:null})
                        updateValues(items)
                        
                    }
                }else{
                    episodes.push(data)
                    setState({addEpisode:false,addPostSeason:0,editEpisodeItem:null})
                    updateValues(items)
                }
            }
        }else{
            setState({addEpisode:false,addPostSeason:0,editEpisodeItem:null})
        }
        
    }
    const editCast = (id,season_id,e,isCrew = false) => {
        e.preventDefault();
        const items = [...state.seasons]
        const itemIndex = items.findIndex(p => p["season_id"] == season_id)
        if(itemIndex > -1){
            let season = items[itemIndex];
            let casts = season.castncrew
            const castIndex = casts.findIndex(p => p["cast_crew_id"] == id);
            if(castIndex > -1){
                setState({addCast:true,addPostSeason:season_id,editCastItem:casts[castIndex],isCrew:isCrew})
            }
        }
    }
    const closeAddImageCreate = (data,message) => {
        if(message && data){
            props.openToast({message:Translate(props,message), type:"success"});
        }
        if(data && typeof data.image != "undefined"){
            const items = [...state.seasons]
            const itemIndex = items.findIndex(p => p["season_id"] == state.season_id_image)
            if(itemIndex > -1){
                items[itemIndex]['image'] = data.image
                setState({addSeasonImage:false,season_id_image:0,isEditImage:false})
                updateValues(items)
            }
        }else{
            setState({addSeasonImage:false,season_id_image:0,isEditImage:false})
        }
    }
    const closeCastCreate = (data,message) => {
        if(message && data){
            props.openToast({message:Translate(props,message), type:"success"});
        }
        if(data && typeof data.cast_crew_id != "undefined"){
            const items = [...state.seasons]
            const itemIndex = items.findIndex(p => p["season_id"] == state.addPostSeason)
            if(itemIndex > -1){
                let season = items[itemIndex];
                let casts = season.castncrew
                if(state.editCastItem){
                    const castIndex = casts.findIndex(p => p["cast_crew_id"] == state.editCastItem.cast_crew_id);
                    if(castIndex > -1){
                        casts[castIndex] = data
                        setState({addCast:false,addPostSeason:0,editCastItem:null,isCrew:null})
                        updateValues(items)
                        
                    }
                }else{
                    casts.push(data)
                    setState({addCast:false,addPostSeason:0,editCastItem:null,isCrew:null})
                    updateValues(items)
                }
            }
        }else{
            setState({addCast:false,addPostSeason:0,editCastItem:null})
        }
    }
        let addEpisodeData = null

        if(state.addEpisode){

            addEpisodeData = (
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{state.editEpisodeItem ? Translate(props,"Edit Episode") : Translate(props,"Create Episode")}</h2>
                                    <a onClick={closeEpisodeCreate}  className="_close"><i></i></a>
                                </div>
                                <AddEpisode fromCastnCrew={state.fromCastnCrew} {...props} closeEpisodeCreate={closeEpisodeCreate} editItem={state.editEpisodeItem} movie={state.movie} season_id={state.addPostSeason} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        let addCastData = null
        if(state.addCast){

            addCastData = (
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{state.editCastItem ? Translate(props,state.isCrew ? "Edit Crew" : "Edit Cast") : Translate(props, state.isCrew ? "Create Crew" : "Create Cast" )}</h2>
                                    <a onClick={closeCastCreate}  className="_close"><i></i></a>
                                </div>
                                <AddCast {...props} fromCastnCrew={state.fromCastnCrew} resource_type={!state.fromCastnCrew ? "season" : "movie"} isCrew={state.isCrew} resource_id={state.fromCastnCrew ? state.movie.movie_id : state.addPostSeason} closeCastCreate={closeCastCreate} editItem={state.editCastItem} movie={state.movie} season_id={state.addPostSeason} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        let addImage = null
        if(state.addSeasonImage){
            addImage = (
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="VideoDetails-commentWrap">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{Translate(props,state.isEditImage ? "Edit Image" : "Add Image")}</h2>
                                    <a onClick={() => {
                                        setState({addSeasonImage:false})
                                    }}  className="_close"><i></i></a>
                                </div>
                                <AddImage {...props} closeAddImageCreate={closeAddImageCreate} image={state.seasons[state.season_id_selected].image} season_id={state.season_id_image} />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <React.Fragment>
                {
                    addImage
                }
                {
                    addEpisodeData
                }
                {
                    addCastData
                }
            
                <div className="accordion" id="seasonData">
                    {
                        !state.fromCastnCrew ? 
                    <button className="add_season" onClick={createSeason}>                        
                        {
                            props.t(!state.createSeason ? "Add Season" : "Creating Season...")
                        }
                    </button>
                    : null
                    }
                    {
                        state.seasons.map((season,index) => {
                            return (
                                <div className="card mb-3" key={season.season_id+"season"}>
                                    {
                                        !state.fromCastnCrew ? 
                                    <div className="card-header" id={`heading${season.season_id}`}>
                                        <h5 className="mb-0 d-flex align-items-center justify-content-between">
                                            <button className="btn btn-secondary btn-sm d-flex align-items-center" onClick={() => {selectedtab("episode")}} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${season.season_id}`} aria-expanded="true" aria-controls={`collapse${season.season_id}`}>
                                                {
                                                    props.t("season")+" "+(index+1) 
                                                }
                                                {
                                                    //index == 0 || (state.selectedTabs && state.selectedTabs[season.season_id]) ? 
                                                    //    <span class="material-icons-outlined">keyboard_arrow_up</span>   
                                                       <span className="material-icons-outlined">keyboard_arrow_down</span> 
                                                }
                                            </button>
                                            <button onClick={() => setState({season_id_selected:index,addSeasonImage:1,season_id_image:season.season_id,isEditImage:season.image ? true : false})}>
                                                {
                                                    props.t(!season.image ? "Add Image" : "Edit Image")
                                                }
                                            </button>
                                        </h5>
                                    </div>
                                    : null
                                    }
                                    <div id={`collapse${season.season_id}`} className={`collapse${index == 0 ? " show" : ""}`} aria-labelledby={`heading${season.season_id}`} data-parent="#seasonData">
                                        <div className="season_cnt">
                                            <ul className="season_selection nav justify-content-center">
                                                {
                                                    !state.fromCastnCrew ? 
                                                <li className={!state.selectedTabs[season.season_id] || state.selectedTabs[season.season_id] == "episode" ? "nav-link active" : "nav-link"} onClick={() => {selectedtab("episode",season.season_id)}}>
                                                    {
                                                        props.t("Episodes")
                                                    }
                                                </li>
                                                : null
                                                }
                                                <li className={state.selectedTabs && state.selectedTabs[season.season_id] == "cast" ? "nav-link active" : "nav-link"} onClick={(e) => {selectedtab("cast",season.season_id)}}>
                                                    {
                                                        props.t("Regular Cast")
                                                    }
                                                </li>
                                                <li className={state.selectedTabs && state.selectedTabs[season.season_id] == "crew" ? "nav-link active" : "nav-link"} onClick={(e) => {selectedtab("crew",season.season_id)}}>
                                                    {
                                                        props.t("Regular Crew")
                                                    }
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="card-body">
                                            {
                                                !state.selectedTabs[season.season_id] || state.selectedTabs[season.season_id] == "episode" ? 
                                                
                                                        <div className="container">
                                                            <div className="row">
                                                                <div className="col-md-12">    
                                                                <button className="add_episode" onClick={(e) => addEpisode(season.season_id,e)}>
                                                                    {
                                                                        props.t("Add Episode")
                                                                    }
                                                                </button>        
                                                                {
                                                                    season.episodes && season.episodes.length > 0 ?

                                                                    <div className="table-responsive">
                                                                        <table className="table custTble1">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th scope="col">{props.t("Name")}</th>
                                                                                    <th scope="col">{props.t("Number")}</th>
                                                                                    <th scope="col">{props.t("Release Date")}</th>
                                                                                    <th scope="col">{props.t("Options")}</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {
                                                                                    season.episodes.map((episode,index) => {
                                                                                        return (
                                                                                                <tr key={episode.episode_id}>
                                                                                                    <td className="center-img-txt">
                                                                                                        <React.Fragment>
                                                                                                            <Image height="35" width="35" className="cast_crew_listing_img" image={episode.image} title={""} imageSuffix={props.pageData.imageSuffix}  siteURL={props.pageData.siteURL}/>
                                                                                                            {episode.title}
                                                                                                        </React.Fragment>
                                                                                                    </td>
                                                                                                    <td>{episode.episode_number}</td>
                                                                                                    <td>{episode.release_date}</td>
                                                                                                    <td>
                                                                                                        <div className="actionBtn d-flex">
                                                                                                            <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={(e) => deleteEpisode( episode.episode_id,e)}><span className="material-icons" data-icon="delete"></span></a>                                                                                           
                                                                                                            <a href="#"  className="text-success" title={Translate(props, "Edit")} onClick={(e) => editEpisode( episode.episode_id,season.season_id,e)}><span className="material-icons" data-icon="edit"></span></a>
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
                                                        
                                                : 
                                                state.selectedTabs && state.selectedTabs[season.season_id] == "cast" ? 
                                                    <div className="container">
                                                        <div className="row">
                                                            <div className="col-md-12">        
                                                                <button className="add_cast" onClick={(e) => addCast(season.season_id,e)}>
                                                                    {
                                                                        props.t("Add Cast")
                                                                    }
                                                                </button>      
                                                                {
                                                                    season.castncrew && season.castncrew.length > 0 ?                   
                                                                <div className="table-responsive">
                                                                    <table className="table custTble1">
                                                                        <thead>
                                                                            <tr>
                                                                                <th scope="col">{props.t("Name")}</th>
                                                                                <th scope="col">{props.t("Character")}</th>
                                                                                <th scope="col">{props.t("Options")}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                season.castncrew.map((castncrew,index) => {
                                                                                    return (
                                                                                        castncrew.character ? 
                                                                                            <tr key={castncrew.cast_crew_id}>
                                                                                                <td className="center-img-txt">
                                                                                                    <React.Fragment>
                                                                                                        <Image height="35" width="35" className="cast_crew_listing_img" image={castncrew.image} title={""} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                                                                                        {castncrew.name}
                                                                                                    </React.Fragment>
                                                                                                </td>
                                                                                                <td>{castncrew.character}</td>
                                                                                                <td>
                                                                                                    <div className="actionBtn d-flex">
                                                                                                        <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={(e) => deleteCast( castncrew.cast_crew_id,e)}><span className="material-icons" data-icon="delete"></span></a>                                                                                           
                                                                                                        <a href="#"  className="text-success" title={Translate(props, "Edit")} onClick={(e) => editCast( castncrew.cast_crew_id,season.season_id,e)}><span className="material-icons" data-icon="edit"></span></a>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        : null
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
                                                :
                                                <div className="container">
                                                    <div className="row">
                                                        <div className="col-md-12">       
                                                            <button className="add_crew" onClick={(e) => addCrew(season.season_id,e)}>
                                                                    {
                                                                        props.t("Add Crew")
                                                                    }
                                                            </button>       
                                                            {
                                                                season.castncrew && season.castncrew.length > 0 ?    
                                                                <div className="table-responsive">
                                                                    <table className="table custTble1">
                                                                        <thead>
                                                                            <tr>
                                                                                <th scope="col">{props.t("Name")}</th>
                                                                                <th scope="col">{props.t("Department")}</th>
                                                                                <th scope="col">{props.t("Job")}</th>
                                                                                <th scope="col">{props.t("Options")}</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                season.castncrew.map((castncrew,index) => {
                                                                                    return (
                                                                                        !castncrew.character ? 
                                                                                            <tr key={castncrew.cast_crew_id}>
                                                                                                <td className="center-img-txt">
                                                                                                    <React.Fragment>
                                                                                                        <Image height="35" width="35" className="cast_crew_listing_img" image={castncrew.image} title={""} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                                                                                        {castncrew.name}
                                                                                                    </React.Fragment>
                                                                                                </td>
                                                                                                <td>{castncrew.department}</td>
                                                                                                <td>{castncrew.job}</td>
                                                                                                <td>
                                                                                                    <div className="actionBtn d-flex">
                                                                                                        <a className="text-danger" href="#" title={Translate(props, "Delete")} onClick={(e) => deleteCrew( castncrew.cast_crew_id,e)}><span className="material-icons" data-icon="delete"></span></a>                                                                                           
                                                                                                        <a href="#"  className="text-success" title={Translate(props, "Edit")} onClick={(e) => editCrew( castncrew.cast_crew_id,season.season_id,e)}><span className="material-icons" data-icon="edit"></span></a>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        : null
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
                                            }
                                            {
                                                !state.fromCastnCrew ? 
                                            <a href="#" className="btn btn-danger btn-sm my-3" onClick={ (e) => deleteSeason(season.season_id,e)}>
                                                {props.t("Delete")}
                                            </a>
                                            : null
                                            }
                                        </div>
                                    </div>
                                
                                </div>
                            )
                        })
                    }
                    
                    

                </div>
            </React.Fragment>
        )
    
        
    }


export default Seasons