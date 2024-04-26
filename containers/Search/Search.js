import React,{useReducer,useEffect} from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useSelector, useDispatch } from "react-redux";
import { setMenuOpen } from "../../store/reducers/search";
import Validator from '../../validators';
import Form from '../../components/DynamicForm/Index'

const Video = dynamic(() => import("../Video/Browse"), {
    ssr: false
});
const Channel = dynamic(() => import("../Channel/Channels"), {
    ssr: false
});
const Blog = dynamic(() => import("../Blog/Browse"), {
    ssr: false
});
const Playlist = dynamic(() => import("../Playlist/Browse"), {
    ssr: false
});
const Member = dynamic(() => import("../User/Browse"), {
    ssr: false
});
const Audio = dynamic(() => import("../Audio/Browse"), {
    ssr: false
});
const Movie = dynamic(() => import("../Movies/Browse"), {
    ssr: false
});
import Loader from "../LoadMore/Index"
import AdsIndex from "../Ads/Index"
import  Translate  from "../../components/Translate/Index";

const Index = (props) => {
    const dispatch = useDispatch()
    let reduxstateSearch = useSelector((state) => {
        return state.search
    });
    let menuOpen = useSelector((state) => {
        return state.search.menuOpen
    });
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            fromPopup:props.fromPopup,
            title: "Search",
            categories:props.pageData.categories ? props.pageData.categories : props.categories,
            showForm:props.pageData.showForm,
            items: props.pageData.items ? props.pageData.items.results : [],
            pagging: props.pageData.items ? props.pageData.items.pagging : false,
            submitting: false,
            countries:props.pageData.countries,
            languages:props.pageData.spokenLanguage,
            type: props.pageData && props.pageData.type ? props.pageData.type : props.type,
            fields: {
                h: props.pageData && props.pageData.h ? props.pageData.h : "",
                category: props.pageData && props.pageData.category ? props.pageData.category : "",
                sort: props.pageData && props.pageData.sort ? props.pageData.sort : "latest",
                filter: props.pageData && props.pageData.filter ? props.pageData.filter : "",
                country:props.pageData && props.pageData.country ? props.pageData.country : "",
                language:props.pageData && props.pageData.language ? props.pageData.language : "",
            },
            width:props.isMobile ? props.isMobile : 993,
            showFilter:false
        }
    );
    useEffect(() => {
        if(state.items.length == 0 && props.videos && state.type == "video"){
            setState({
                items:props.videos,
                submitting:false
            })
        }else if(reduxstateSearch.searchChanged){
            const fieldsValues = {}
            fieldsValues.h = reduxstateSearch.searchValue
            setState({
                submitting: false,
                items: [],
                pagging: false,
                fields: fieldsValues,
                categories:props.pageData.categories ? props.pageData.categories : props.categories
            })
        }else if(props.pageData.h && ( props.pageData.items.results != state.items || props.pageData.type != state.type)){
            const fieldsValues = {}
            fieldsValues['category'] = props.pageData && props.pageData.category ? props.pageData.category : ""
            fieldsValues['h'] = (props.pageData && props.pageData.h ? props.pageData.h : "")
            fieldsValues['sort'] = props.pageData && props.pageData.sort ? props.pageData.sort : "latest"
            fieldsValues['filter'] = props.pageData && props.pageData.filter ? props.pageData.filter : ""
            fieldsValues['language'] = props.pageData && props.pageData.language ? props.pageData.language : ""
            fieldsValues['country'] = props.pageData && props.pageData.country ? props.pageData.country : ""
            setState({
                countries:props.pageData.countries,
                languages:props.pageData.spokenLanguage,
                categories:props.pageData.categories ? props.pageData.categories : props.categories,
                submitting: false,
                showForm:false, 
                items: props.pageData.items ? props.pageData.items.results : "", 
                pagging: props.pageData.items ? props.pageData.items.pagging : "", 
                type: props.pageData.type, 
                fields: fieldsValues 
            })
        }
    },[props])
    useEffect(() => {
        if(props.pageData.appSettings["fixed_header"] == 1 && props.hideSmallMenu && !menuOpen){
            dispatch(setMenuOpen(true))
         }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);

        return () => window.removeEventListener('resize', updateWindowDimensions);
    },[])


    useEffect(() => {
        if(reduxstateSearch.searchChanged){
            props.setSearchChanged(false)
            submitForm()
        }
    },[reduxstateSearch.searchChanged])

    useEffect(() => {
        const fieldsValues = {}
        fieldsValues['category'] = props.pageData && props.pageData.category ? props.pageData.category : ""
        fieldsValues['h'] = (props.pageData && props.pageData.h ? props.pageData.h : "")
        fieldsValues['sort'] = props.pageData && props.pageData.sort ? props.pageData.sort : "latest"
        fieldsValues['filter'] = props.pageData && props.pageData.filter ? props.pageData.filter : ""
        fieldsValues['language'] = props.pageData && props.pageData.language ? props.pageData.language : ""
        fieldsValues['country'] = props.pageData && props.pageData.country ? props.pageData.country : ""
        if(state.fields.h != fieldsValues.h || 
            state.fields.category != fieldsValues.category || 
            state.fields.sort != fieldsValues.sort || 
            state.fields.filter != fieldsValues.filter || 
            state.fields.language != fieldsValues.language || 
            state.fields.country != fieldsValues.country
        ){
            submitForm()
        }
    },[state.fields])

    const updateWindowDimensions = () => {
        setState({ width: window.innerWidth });
    }
    
    const onSubmit = model => {
        let value = model['search']
        const fieldsValues = {}
        fieldsValues.h = value
        setState({fields: {h:value, sort: "", filter: "", category: "",language:"",country:"" },submitting:false,items:[],pagging:false})
        props.changeSearchText(value)
        
    }
    const searchSubmit = (e) => {
        e.preventDefault()
        if(state.fields.h){
            props.changeSearchText(state.fields.h)
            submitForm()
        }
    }
    const changeSearchText = (e) => {
        const fields = { ...state.fields }
        fields['h'] = e.target.value
        setState({ fields: fields })

    }
    
    const onCategoryChange = (e) => {
        const fields = { ...state.fields }
        fields['category'] = e.target.value
        setState({ fields: fields })
    }

    const changeTitle = (e) => {
        const fields = { ...state.fields }
        fields['h'] = e.target.value
        setState({ fields: fields, items: [] })
    }
    const changeSort = (e) => {
        const fields = { ...state.fields }
        fields['sort'] = e.target.value
        setState({ fields: fields, items: [] })
    }
    const changeType = (e) => {
        setState({ type: e.target.value, items: [],fields: {sort: "", filter: "", category: "",language:"",country:"",h:state.fields.h } })
        
    }
    const changeFilter = (e) => {
        const fields = { ...state.fields }
        fields['filter'] = e.target.value
        setState({ fields: fields, items: [] })
        
    }
    const submitForm = (e, isType) => {
        if (e)
            e.preventDefault() 
        if (state.submitting) {
            return;
        }
        setState({ submitting: true, items: [], pagging: false })
        const values = {}
        for (var key in state.fields) {
            if (state.fields[key] && state.fields[key] != "") {
                let keyName = key
                if (keyName == "sort" && state.fields[key] == "latest") { } else
                    values[keyName] = state.fields[key]
            }
        }
        
        var queryString = Object.keys(values).map(key => key + '=' + values[key]).join('&');
        
        if (isType) {
            queryString = "h=" + state.fields.h
        }

        
        Router.push(
            `/search/${state.type}?${queryString}`,
        )
    }
   
    const sortChange = (e) => {
        const fields = { ...state.fields }
        fields['sort'] = e.target.value
        setState({ fields: fields, items: [] })
    }
    const countryChange = (e) => {
        const fields = { ...state.fields }
        fields['country'] = e.target.value
        setState({ fields: fields, items: [] })
    }
    const languageChange = (e) => {
        const fields = { ...state.fields }
        fields['language'] = e.target.value
        setState({ fields: fields, items: [] })
    }
    const showFilterOption = (e) => {
        e.preventDefault()
        setState({showFilter:!state.showFilter})
    }

        if (state.showForm) {
            let validator = []

            validator.push({
                key: "search",
                validations: [ 
                    {
                        "validator": Validator.required,
                        "message": "Search is required field"
                    }
                ]
            })
            let formFields = []
            formFields.push(
                { key: "search", label: "", value: "",isRequired:true }
            )
            return (
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12">
                                <Form
                                    className="form"
                                    title={state.title}
                                    validators={validator}
                                    submitText={"Search"}
                                    {...props}
                                    model={formFields}
                                    onSubmit={model => {
                                        onSubmit(model);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
            )
        }
        let type = state.type == "series" ? "movie" : state.type
        let charater = state.type == "series" ? "serie" : state.type
        let sort = {
                latest: 'Latest ' + capitalizeFirstLetter(charater + "s"),
                favourite: "Most Favourite " + capitalizeFirstLetter(charater + "s"),
                view: "Most Viewed " + capitalizeFirstLetter(charater + "s"),
                like: "Most Liked " + capitalizeFirstLetter(charater + "s"),
                dislike: "Most Disliked " + capitalizeFirstLetter(charater + "s"),
                comment: "Most Commented " + capitalizeFirstLetter(charater + "s"),
                rated: "Most Rated " + capitalizeFirstLetter(charater + "s")
        }
        let  filter =  {
                verified: "Verified " + capitalizeFirstLetter(charater + "s"),
                featured: "Featured " + capitalizeFirstLetter(charater + "s"),
                sponsored: "Sponsored " + capitalizeFirstLetter(charater + "s"),
                hot: "Hot " + capitalizeFirstLetter(charater + "s")
        }

        let sortArray = []
        for (var key in sort) {
            if (key == "latest") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "favourite" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_favourite'] == 1) {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "view") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "like" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_like'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "dislike" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_dislike'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "rated" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_rating'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            } else if (key == "comment" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_comment'] == "1") {
                sortArray.push({ key: key, value: sort[key] })
            }
        }
        const typeArray = []
        for (var key in filter) {
            if (key == "featured" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_featured'] == 1) {
                typeArray.push({ key: key, value: filter[key] })
            } else if (key == "sponsored" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_sponsored'] == 1) {
                typeArray.push({ key: key, value: filter[key] })
            } else if (key == "hot" && props.pageData.appSettings[(state.subtype ? state.subtype + "_" : "") + type + '_hot'] == 1) {
                typeArray.push({ key: key, value: filter[key] })
            } else if (key == "verified" && (state.type == "channel" || state.type == "member")) {
                typeArray.push({ key: key, value: filter[key] })
            }
        }
        let categories = state.categories

        return (
            <div className={`${state.fromPopup ? "" : "global-search-cnt"}`}>
                <div className="user-area">
                    <div className="container">
                        <div className="row">
                            {
                                !state.fromPopup ? 
                            <div className="col-lg-2">
                                {
                                    !state.fromPopup ? 
                                <div className="sdBarSearchBox">
                                    <div className="title">{Translate(props,"Show results for")}</div>
                                    <div className="formFields">
                                        <div className="form-group twoColumns">
                                            <div className="form-check custom-radio">
                                                <input type="radio" onChange={changeType} checked={state.type == "video"} className="form-check-input" id="video" name="type" value="video" />
                                                <label className="form-check-label" htmlFor="video">{Translate(props,"Videos")}</label>
                                                <span className="error"></span>
                                            </div>
                                            <div className="form-check custom-radio">
                                                <input type="radio" className="form-check-input" checked={state.type == "member"} onChange={changeType} name="type" value="member" id="member" />
                                                <label className="form-check-label" htmlFor="member">{Translate(props,"Members")} </label>
                                                <span className="error"></span>
                                            </div>
                                            {
                                                props.pageData.appSettings["enable_audio"] == 1 ? 
                                                <div className="form-check custom-radio">
                                                    <input type="radio" className="form-check-input" checked={state.type == "audio"} onChange={changeType} id="audio" name="type" value="audio" />
                                                    <label className="form-check-label" htmlFor="audio">{Translate(props,"Audio")}</label>
                                                    <span className="error"></span>
                                                </div>
                                                : null
                                             }
                                             {
                                                props.pageData.appSettings["enable_movie"] == 1 ? 
                                                <React.Fragment>
                                                    <div className="form-check custom-radio">
                                                        <input type="radio" className="form-check-input" checked={state.type == "movie"} onChange={changeType} id="movie" name="type" value="movie" />
                                                        <label className="form-check-label" htmlFor="movie">{Translate(props,"Movies")}</label>
                                                        <span className="error"></span>
                                                    </div>
                                                    <div className="form-check custom-radio">
                                                        <input type="radio" className="form-check-input" checked={state.type == "series"} onChange={changeType} id="series" name="type" value="series" />
                                                        <label className="form-check-label" htmlFor="series">{Translate(props,"Series")}</label>
                                                        <span className="error"></span>
                                                    </div>
                                                </React.Fragment>
                                                
                                                : null
                                             }
                                            {
                                                props.pageData.appSettings["enable_channel"] == 1 ? 
                                                    <div className="form-check custom-radio">
                                                        <input type="radio" className="form-check-input" checked={state.type == "channel"} onChange={changeType} id="channel" name="type" value="channel" />
                                                        <label className="form-check-label" htmlFor="channel">{Translate(props,"Channels")}</label>
                                                        <span className="error"></span>
                                                    </div>
                                                : null
                                            }
                                            {
                                                props.pageData.appSettings["enable_blog"] == 1 ? 
                                            <div className="form-check custom-radio">
                                                <input type="radio" className="form-check-input" checked={state.type == "blog"} onChange={changeType} id="blog" name="type" value="blog" />
                                                <label className="form-check-label" htmlFor="blog">{Translate(props,"Blogs")}</label>
                                                <span className="error"></span>
                                            </div>
                                            : null
                                            }
                                             {
                                                props.pageData.appSettings["enable_playlist"] == 1 ? 
                                                <div className="form-check custom-radio">
                                                    <input type="radio" className="form-check-input" checked={state.type == "playlist"} onChange={changeType} id="playlist" name="type" value="playlist" />
                                                    <label className="form-check-label" htmlFor="playlist">{Translate(props,"Playlists")}</label>
                                                    <span className="error"></span>
                                                </div>
                                                : null
                                             }
                                             
                                        </div>
                                    </div>
                                </div>
                                : null
                                }
                                <div className="sdBarSearchBox">
                                    <div className="title">{Translate(props,"Sort By")}:</div>
                                    <div className="formFields">
                                        <div className="form-group search-search-filter">
                                                <select onChange={sortChange} value={state.fields.sort} className="form-control form-select" id="sortbys">
                                                    {
                                                        sortArray.map(sort => {
                                                            return <option key={sort.key} value={sort.key}>{Translate(props,sort.value)}</option>
                                                        })
                                                    }
                                                </select>
                                                {
                                                    state.width  > 992 && ((categories && categories.length) || typeArray.length > 0 || state.countries || state.languages) ?
                                                        null
                                                    :
                                                    ((categories && categories.length) || typeArray.length > 0 || state.countries || state.languages) ? 
                                                        <a className="filter-search global-search-filter" href="#" onClick={showFilterOption} title={Translate(props,"Search Filters")}>
                                                            <span className="material-icons" data-icon="tune">
                                                                
                                                            </span>{Translate(props,'Filter')}
                                                        </a>
                                                    : null
                                                }
                                        </div>
                                    </div>
                                </div>
                                {
                                    (categories && categories.length) || typeArray.length > 0 ?
                                    <React.Fragment>
                                        <div className="sdBarSearchBox" style={{display: state.width > 992 ? "" : !state.showFilter  ? "none" : "" }}>
                                            <div className="title">{Translate(props,"Refine by")}:</div>
                                            {
                                                categories && categories.length ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(props,"Category")}</span>
                                                        <div className="form-group twoColumns">
                                                            <div className="form-check custom-radio">
                                                                <input type="radio" checked={state.fields.category == ""} onChange={onCategoryChange} className="form-check-input" id="Any" name="catgeory" value="" />
                                                                <label className="form-check-label" htmlFor="Any">{Translate(props,"Any")}</label>
                                                            </div>
                                                            {
                                                                categories.map(cat => {
                                                                    return (
                                                                        <div key={cat.category_id} className="form-check custom-radio">
                                                                            <input type="radio" className="form-check-input" checked={state.fields.category == cat.category_id} onChange={onCategoryChange} id={"category_" + cat.category_id} name="catgeory" value={cat.category_id} />
                                                                            <label className="form-check-label" htmlFor={"category_" + cat.category_id}>{Translate(props,cat.title)}</label>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                state.languages && state.languages.length ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(props,"Language")}</span>
                                                        <div className="form-group twoColumns">
                                                            <select onChange={languageChange} value={state.fields.language} className="form-control form-select" id="language">
                                                                <React.Fragment>
                                                                <option key={0} value={""}></option>
                                                                {
                                                                    state.languages.map(language => {
                                                                        return <option key={language.code} value={language.code}>{Translate(props,language.name)}</option>
                                                                    })
                                                                }
                                                                </React.Fragment>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                state.countries && state.countries.length ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(props,"Country")}</span>
                                                        <div className="form-group twoColumns">
                                                            <select onChange={countryChange} value={state.fields.country} className="form-control form-select" id="country">
                                                                <React.Fragment>
                                                                <option key={0} value={""}></option>
                                                                {
                                                                    state.countries.map(country => {
                                                                        return <option key={country.id} value={country.id}>{Translate(props,country.nicename)}</option>
                                                                    })
                                                                }
                                                                </React.Fragment>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            {
                                                typeArray.length > 0 ?
                                                    <div className="formFields">
                                                        <span className="subtitle">{Translate(props,"Type")}</span>
                                                        <div className="form-group twoColumns">
                                                            <div className="form-check custom-radio">
                                                                <input type="radio" className="form-check-input" id="Anyd" checked={state.fields.filter == ""} onChange={changeFilter} name="filter" value="" />
                                                                <label className="form-check-label" htmlFor="Anyd">{Translate(props,"Any")}</label>
                                                                <span className="error"></span>
                                                            </div>
                                                            {
                                                                typeArray.map(types => {
                                                                    return (
                                                                        <div key={types.value} className="form-check custom-radio">
                                                                            <input type="radio" className="form-check-input" checked={state.fields.filter == types.key} onChange={changeFilter} id={"type_" + types.key} name="filter" value={types.key} />
                                                                            <label className="form-check-label" htmlFor={"type_" + types.key}>{Translate(props,types.value)}</label>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                        </React.Fragment>
                                        : null
                                }
                            </div>
                            : null
                            }
                            <div className={state.fromPopup ? "col-lg-12" : "col-lg-10"}>
                                <div className="grid-movies">
                                <React.Fragment>
                                    {
                                        !state.fromPopup && state.width  < 992 ? 
                                            <div className="search-input">
                                                <input type="text" className="form-control" value={state.fields.h} onChange={changeSearchText} />
                                                <button type="button" onClick={searchSubmit} >{Translate(props,'Search')}</button>
                                            </div>
                                        : null
                                    }
                                    {
                                        state.submitting ?
                                            <Loader loading={true} />
                                            :
                                            state.fromPopup && (!state.items || !state.items.length) ?
                                                null
                                            :
                                            state.type == "video" ?
                                            <Video {...props} search={state.fields} fromSearch={true} pageData={{...props.pageData, videos: state.items, pagging: state.pagging }} globalSearch={true} />
                                            :
                                            state.type == "channel" ?
                                            <Channel {...props} search={state.fields} channels={state.items} pagging={state.pagging} globalSearch={true} />
                                            :
                                            state.type == "blog" ?
                                            <Blog {...props} search={state.fields} pageData={{...props.pageData, blogs: state.items, pagging: state.pagging }} globalSearch={true} />
                                            :
                                            state.type == "playlist" ?
                                            <Playlist {...props} search={state.fields} pageData={{...props.pageData, playlists: state.items, pagging: state.pagging }} globalSearch={true} />
                                            :
                                            state.type == "audio" ?
                                            <Audio {...props} search={state.fields} audios={state.items} pagging={state.pagging} globalSearch={true} />
                                            :
                                            state.type == "movie" || state.type == "series" ?
                                            <Movie {...props} typeData={state.type} search={state.fields} pageData={{...props.pageData, movies: state.items, pagging: state.pagging }} globalSearch={true} />
                                            :
                                            state.items ?
                                            <Member {...props} search={state.fields} pageData={{...props.pageData, members: state.items, pagging: state.pagging }} globalSearch={true} />
                                            : null
                                    }
                                    </React.Fragment>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        props.pageData.appSettings['below_searchform'] ? 
                            <AdsIndex paddingTop="20px" className="below_searchform" ads={props.pageData.appSettings['below_searchform']} />
                        : null
                    }
                </div>
            </div>
        )
    }

export default Index