import dynamic from 'next/dynamic';
import Router, { withRouter } from 'next/router';
import React, { useEffect, useReducer, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import axios from "../../axios-orders";
import Form from '../../components/DynamicForm/Index';
import Link from "../../components/Link/index";
import Translate from "../../components/Translate/Index";
import { setMenuOpen } from "../../store/reducers/search";
import Validator from '../../validators';
import Currency from "../Upgrade/Currency";
const Countries = dynamic(() => import("./Movies/Countries"), {
    ssr: false
  });
const Seasons = dynamic(() => import("./Movies/Seasons"), {
    ssr: false
  });
const Generes = dynamic(() => import("./Movies/Generes"), {
    ssr: false
  });
const CastnCrew = dynamic(() => import("./Movies/CastnCrew"), {
    ssr: false
  });
const Videos = dynamic(() => import("./Movies/Videos"), {
    ssr: false
  });
const Images = dynamic(() => import("./Movies/Images"), {
    ssr: false
  });


const Movie = (props) => {
    const myRef = useRef(null)
    const dispatch = useDispatch()
    let menuOpen = useSelector((state) => {
        return state.search.menuOpen
    });
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            selectType:props.pageData.selectType ? props.pageData.selectType :  "movie",
            chooseType: props.pageData.tabType ? props.pageData.tabType : "facts",
            firstStep: props.pageData.editItem ? false : true,
            editItem: props.pageData.editItem,
            rent_movies:props.pageData.rent_movies ? true : false,
            error: null,
            movieCategories:props.pageData.movieCategories,
            movie_sell:props.pageData.movie_sell ? true : false,
            movie_rent:props.pageData.movie_rent ? true : false,
            spokenLanguage:props.pageData.spokenLanguage,
            seasons:props.pageData.seasons ? props.pageData.seasons : [],
            images:props.pageData.images ? props.pageData.images : [],
            videos:props.pageData.videos ? props.pageData.videos : [],
            castncrew:props.pageData.castncrew ? props.pageData.castncrew : [],
            generes:props.pageData.generes ? props.pageData.generes : [],
            countries:props.pageData.countries ? props.pageData.countries : [],
            movie_countries:props.pageData.movie_countries ? props.pageData.movie_countries : [],
            width:props.isMobile ? props.isMobile : 993,
            category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
            subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
            subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
            privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
        }
    );
    const stateRef = useRef();
    stateRef.current = state.videos
    useEffect(() => {
        if(props.pageData.appSettings["fixed_header"] == 1 && props.hideSmallMenu && !menuOpen){
            dispatch(setMenuOpen(true))
         }
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);

        
        props.socket.on('moviVideoCreated', data => {
            let id = data.id
            let status = data.status
            if(stateRef.current && stateRef.current.length > 0){
            const itemIndex = getItemIndex(id)
                if (itemIndex > -1) {
                    const items = [...stateRef.current]
                    const changedItem = items[itemIndex]
                    changedItem.completed = status
                    setState({ videos: items })
                }
            }
        });

        return () => window.removeEventListener('resize', updateWindowDimensions);
    },[])
    const updateWindowDimensions = () => {
        setState({ width: window.innerWidth });
    }
   
    const getItemIndex = (item_id) => {
        const videos = [...stateRef.current];
        const itemIndex = videos.findIndex(p => p["movie_video_id"] == item_id);
        return itemIndex;
    }
    useEffect(() => {
        if(props.pageData.editItem != state.editItem && !props.router.query.tab){
            setState({
                selectType:props.pageData.selectType ? props.pageData.selectType :  "movie",
                width:props.isMobile ? props.isMobile : 993,
                chooseType: props.pageData.tabType ? props.pageData.tabType : "facts",
                editItem: props.pageData.editItem,
                rent_movies:props.pageData.rent_movies ? true : false,
                error: null,
                movie_countries:props.pageData.movie_countries ? props.pageData.movie_countries : [],
                firstStep: props.pageData.editItem ? false : true,
                movieCategories:props.pageData.movieCategories,
                movie_sell:props.pageData.movie_sell ? true : false,
                movie_rent:props.pageData.movie_rent ? true : false,
                spokenLanguage:props.pageData.spokenLanguage,
                seasons:props.pageData.seasons ? props.pageData.seasons : [],
                images:props.pageData.images ? props.pageData.images : [],
                videos:props.pageData.videos ? props.pageData.videos : [],
                castncrew:props.pageData.castncrew ? props.pageData.castncrew : [],
                generes:props.pageData.generes ? props.pageData.generes : [],
                countries:props.pageData.countries ? props.pageData.countries : [],
                category_id: props.pageData.editItem ? props.pageData.editItem.category_id : null,
                subcategory_id: props.pageData.editItem ? props.pageData.editItem.subcategory_id : null,
                subsubcategory_id: props.pageData.editItem ? props.pageData.editItem.subsubcategory_id : null,
                privacy: props.pageData.editItem ? props.pageData.editItem.view_privacy : "everyone",
            })
        }
    },[props])
   
  
    const onSubmit = model => {
        if (state.submitting) {
            return
        }
        let selectedCurrency = props.pageData.selectedCurrency
        let changeRate = selectedCurrency.currency_value
        if(state.movie_sell && props.pageData.appSettings['movie_commission_type']  == 1 && props.pageData.appSettings['movie_commission_value'] > 0){
            if(model['price'] && parseFloat(model['price']) > 0){
                if(model['price'] <=  (parseFloat(props.pageData.appSettings['movie_commission_value'])*changeRate).toFixed(2)){
                    let perprice = {}
                    perprice['package'] = { price: props.pageData.appSettings['movie_commission_value'] }
                    setState({error:[{message:props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['price'] = 0
            }
        }

        if(state.movie_rent && props.pageData.appSettings['movie_commission_rent_type']  == 1 && props.pageData.appSettings['movie_commission_rent_value'] > 0){
            if(model['rent_price'] && parseFloat(model['rent_price']) > 0){
                if(model['rent_price'] <=  (parseFloat(props.pageData.appSettings['movie_commission_rent_value'])*changeRate).toFixed(2)){
                    let perprice = {}
                    perprice['package'] = { price: props.pageData.appSettings['movie_commission_rent_value'] }
                    setState({error:[{message:props.t("Rent Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")})}]})
                    return;
                }
            }else{
                model['rent_price'] = 0
            }
        }

        let formData = new FormData();
        for (var key in model) {
            if(key == "movie_release"){
                if(model[key]){
                    formData.append(key, new Date(model[key]).toJSON().slice(0,10));
                }
            }else if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        //image
        if (model['image']) {
            let image = typeof model['image'] == "string" ? model['image'] : false
            if (image) {
                formData.append('movieImage', image)
            }
        }
        formData.append("category",state.selectType);
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/create';
        if (state.editItem) {
            url = "/movies/create";
            formData.append("id", state.editItem.movie_id)
        }
        let category = props.pageData.selectType
        setState({ submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, myRef.current.offsetTop);
                    setState({ error: response.data.error, submitting: false });
                } else {
                    if(state.editItem){
                        setState({submitting:false})
                    }else{
                        setState({submitting:false,firstStep:false,editItem:response.data.editItem,chooseType:"seasons"})
                        // setTimeout(() => {
                            if(category == "movie")
                                Router.push(`/create-movie/${response.data.editItem.custom_url}?tab=seasons`,`/create-movie/${response.data.editItem.custom_url}?tab=seasons`,{ shallow: true })
                            else
                                Router.push( `/create-series/${response.data.editItem.custom_url}?tab=seasons`,`/create-series/${response.data.editItem.custom_url}?tab=seasons`,{ shallow: true })
                        // },200)
                    }
                }
            }).catch(err => {
                setState({ submitting: false, error: err });
            });
    };
    useEffect(()=>{
        if(props.router.query && props.router.query.tab != state.chooseType && props.router.query.tab){
          setState({  chooseType: props.router.query.tab });
        }else if(props.router.query && !props.router.query.tab){
          if ($(".nav-tabs").children().length > 0) {
            let type = $(".nav-tabs").children().first().find("a").attr("aria-controls")
              setState({  chooseType: type });
          }
        }
      }, [props.router.query]);
    const chooseType = (type, e) => {
        e.preventDefault()
        if(state.firstStep){
            return;
        }
        if(type == state.chooseType){
            return;
        }
        if (props.pageData && !props.pageData.loggedInUserDetails) {
            document.getElementById('loginFormPopup').click();
        } else {
            if (state.validating) {
                return
            }

            let fUrl = props.router.asPath.split("?")
            let url = fUrl[0];
            let otherQueryParams = null
            if (typeof URLSearchParams !== 'undefined') {
                otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
                otherQueryParams.delete('tab')
            }
            let fURL = url+"?"+(otherQueryParams.toString() ? otherQueryParams.toString()+"&" : "");
            Router.push(`${fURL}tab=${type}`, `${fURL}tab=${type}`,{ shallow: true })
        }
    }
    const onCategoryChange = (category_id) => {
        setState({ category_id: category_id, subsubcategory_id: 0, subcategory_id: 0 })
    }
    const onSubCategoryChange = (category_id) => {
        setState({ subcategory_id: category_id, subsubcategory_id: 0 })
    }
    const onSubSubCategoryChange = (category_id) => {
        setState({ subsubcategory_id: category_id })
    }
    const onChangePrivacy = (value) => {
        setState({ privacy: value })
    }
    
    const updateSteps = (state) => {
        let fields = {}
        fields[state.key] = state.value
        setState({...fields});
    }

    const changeFilter = (e) => {
        e.preventDefault()
        if(state.firstStep){
            return;
        }
        let type = e.target.value
        setState({chooseType:type})
    }

    let fUrl = props.router.asPath.split("?");
        let url = fUrl[0];
        let otherQueryParams = null;
        if (typeof URLSearchParams !== "undefined") {
            otherQueryParams = new URLSearchParams(fUrl[1] ?? {});
            otherQueryParams.delete("type");
        }
        let fURL =
            url +
            "?" +
            (otherQueryParams.toString() ? otherQueryParams.toString() + "&" : "");

        let validator = [
            {
                key: "title",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Title is required field"
                    }
                ]
            }
        ]

        let imageUrl = null
        if(state.editItem && state.editItem.image){
            if(state.editItem.image.indexOf("http://") == 0 || state.editItem.image.indexOf("https://") == 0){
                imageUrl = state.editItem.image
            }else{
                imageUrl = props.pageData.imageSuffix+state.editItem.image
            }
        }
        let formFields = [
            { key: "title", label: "Title", value: state.editItem ? state.editItem.title : null ,isRequired:true},
            { key: "description", label: "Description", type: "textarea", value: state.editItem ? state.editItem.description : null },
            { key: "image", label: "Upload Image", type: "file", value: imageUrl },
        ]



        let groupData0 = []
        if(state.movie_sell){
            validator.push({
                key: "price",
                validations: [
                    {
                        "validator": Validator.price,
                        "message": "Please provide valid price"
                    }
                ]
            })
            let postDescription = state.selectType == "movie" ? props.t("Put 0 for free movies") : props.t("Put 0 for free series")
            if(props.pageData.appSettings['movie_commission_type']  == 1 && props.pageData.appSettings['movie_commission_value'] > 0){
                let perprice = {}
                perprice['package'] = { price: props.pageData.appSettings['movie_commission_value'] }
                postDescription = '<br /><div class="form-post-description">' + props.t("Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")}) + '</div>'
            }
            groupData0.push({"postDescription":postDescription, key: "price", label:  props.t(`Price ({{price}})`,{price:props.pageData.appSettings.payment_default_currency}) , value: state.editItem ? state.editItem.price : null,isRequired:true })
        }

        if(state.movie_rent){
            validator.push({
                key: "rent_price",
                validations: [
                    {
                        "validator": Validator.price,
                        "message": "Please provide valid rent price"
                    }
                ]
            })
            let postDescriptionData = state.selectType == "movie" ? props.t("Put 0 to disable rent movies") : props.t("Put 0 to disable rent series")
            if(props.pageData.appSettings['movie_commission_rent_type']  == 1 && props.pageData.appSettings['movie_commission_rent_value'] > 0){
                let perprice = {}
                perprice['package'] = { price: props.pageData.appSettings['movie_commission_rent_value'] }
                postDescriptionData = '<br /><div class="form-post-description">' + props.t("Rent Price enter must be greater than {{price}}.",{price:Currency({...props,...perprice}).replace("<!-- -->","")}) + '</div>'
            }
            groupData0.push({"postDescription":postDescriptionData, key: "rent_price", label: props.t(`Rent Price ({{price}})`,{price:props.pageData.appSettings.payment_default_currency}), value: state.editItem ? state.editItem.rent_price : null,isRequired:true })
        }

        if(groupData0.length > 0){
            formFields.push({
                key:"group_data",
                keyValue:"group_0",
                values:groupData0
            })
        }

        if (props.pageData.movieCategories) {
            let categories = []
            categories.push({ key: 0, value: 0, label: "Please Select Category" })
            props.pageData.movieCategories.forEach(res => {
                categories.push({ key: res.category_id, label: res.title, value: res.category_id })
            })
            formFields.push({
                key: "category_id",
                label: "Category",
                type: "select",
                value: state.editItem ? state.editItem.category_id : "",
                onChangeFunction: onCategoryChange,
                options: categories
            })

            //get sub category
            if (state.category_id) {
                let subcategories = []

                props.pageData.movieCategories.forEach(res => {
                    if (res.category_id == state.category_id) {
                        if (res.subcategories) {
                            subcategories.push({ key: 0, value: 0, label: "Please Select Sub Category" })
                            res.subcategories.forEach(rescat => {
                                subcategories.push({ key: rescat.category_id, label: rescat.title, value: rescat.category_id })
                            })
                        }
                    }
                })


                if (subcategories.length > 0) {
                    formFields.push({
                        key: "subcategory_id",
                        label: "Sub Category",
                        value: state.editItem ? state.editItem.subcategory_id : "",
                        type: "select",
                        onChangeFunction: onSubCategoryChange,
                        options: subcategories
                    })

                    if (state.subcategory_id) {
                        let subsubcategories = []

                        props.pageData.movieCategories.forEach(res => {
                            if (res.category_id == state.category_id) {
                                if (res.subcategories) {
                                    res.subcategories.forEach(rescat => {
                                        if (rescat.category_id == state.subcategory_id) {
                                            if (rescat.subsubcategories) {
                                                subsubcategories.push({ key: 0, value: 0, label: "Please Select Sub Sub Category" })
                                                rescat.subsubcategories.forEach(ressubcat => {
                                                    subsubcategories.push({ key: ressubcat.category_id, label: ressubcat.title, value: ressubcat.category_id })
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })

                        if (subsubcategories.length > 0) {
                            formFields.push({
                                key: "subsubcategory_id",
                                label: "Sub Sub Category",
                                type: "select",
                                value: state.editItem ? state.editItem.subsubcategory_id : "",
                                onChangeFunction: onSubSubCategoryChange,
                                options: subsubcategories
                            });
                        }
                    }
                }
            }
        }

        let groupData1 = []
        let languages = []
        if(state.spokenLanguage){
            languages.push({ key: 0, value: 0, label: props.t("Please Select Language") })
            state.spokenLanguage.forEach(lan => {
                languages.push({ key: lan.code, label: lan.name, value: lan.code })
            })
            groupData1.push({
                key: "language",
                label: "Language",
                type: "select",
                value: state.editItem ? state.editItem.language : "",
                options: languages
            });
        }

        groupData1.push({
            key: "movie_release",
            label: "Release Date",
            type: "date",
            value: state.editItem ? (state.editItem.movie_release && state.editItem.movie_release != "" ? new Date(state.editItem.movie_release.toString()) : "") : new Date(),
        })

        formFields.push({
            key:"group_data",
            keyValue:"group_1",
            values:groupData1
        })


        let groupData2 = []
        validator.push({
            key: "budget",
            validations: [
                {
                    "validator": Validator.price,
                    "message": "Please provide valid budget price"
                }
            ]
        })
        let perpriceB = {}
        perpriceB['package'] = { price: "" }
        groupData2.push({
            key: "budget",
            label: props.t("Budget ({{price}})",{price:Currency({...props,...perpriceB}).replace("0.00",'')}),
            type: "number",
            value: state.editItem  ? state.editItem.budget.toString() : "",
        })

        validator.push({
            key: "revenue",
            validations: [
                {
                    "validator": Validator.price,
                    "message": "Please provide valid revenue price"
                }
            ]
        })
        groupData2.push({
            key: "revenue",
            label: props.t("Revenue ({{price}})",{price:Currency({...props,...perpriceB}).replace("0.00",'')}),
            type: "number",
            value: state.editItem  ? state.editItem.revenue.toString() : "",
        })

        formFields.push({
            key:"group_data",
            keyValue:"group_2",
            values:groupData2
        })

        formFields.push({
            key: "tags",
            label: "Tags",
            type: "tags",
            value:state.editItem && state.editItem.tags ? state.editItem.tags.split(",") : []
        })

        if (props.pageData.appSettings.movie_adult == "1") {
            formFields.push({
                key: "adult",
                label: "",
                subtype:"single",
                type: "checkbox",
                value: state.editItem ? [state.editItem.adult ? "1" : "0"] : ["0"],
                options: [
                    {
                        value: "1", label: "Mark as Adult", key: "adult_1"
                    }
                ]
            })
        }

        formFields.push({
            key: "search",
            label: "",
            type: "checkbox",
            subtype:"single",
            value: state.editItem ? [state.editItem.search ? "1" : "0"] : ["1"],
            options: [
                {
                    value: "1", label: state.selectType == "movie" ? "Show this movie in search results" : "Show this series in search results", key: "search_1"
                }
            ]
        })

        if(props.pageData.appSettings['enable_comment_approve'] == 1){
            let comments = []
            comments.push({ value: "1", key: "comment_1", label: "Display automatically" })
            comments.push({ value: "0", key: "comment_0", label: "Don't display until approved" })
            formFields.push({
                key: "comments",
                label: "Comments Setting",
                type: "select",
                value: state.editItem  ? state.editItem.autoapprove_comments.toString() : "1",
                options: comments
            })
        }
        let privacyOptions = [
            {
                value: "everyone", label: "Anyone", key: "everyone"
            },
            {
                value: "onlyme", label: "Only me", key: "onlyme"
            },
            {
                value: "password", label: "Only people with password", key: "password"
            },
            {
                value: "link", label: "Only to people who have link", key: "link"
            }
        ]

        if (props.pageData.appSettings.user_follow == "1") {
            privacyOptions.push({
                value: "follow", label: "Only people I follow", key: "follow"
            })
        }

        if(props.pageData.plans && props.pageData.plans.length > 0){
            props.pageData.plans.forEach(item => {
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
            value: state.editItem ? state.editItem.view_privacy : "everyone",
            onChangeFunction: onChangePrivacy,
            options: privacyOptions
        })

        if (state.privacy == "password") {
            formFields.push({
                key: "password", label: "Password", 'type': "password", value: state.editItem ? state.editItem.password : "",isRequired:true
            })
            validator.push({
                key: "password",
                validations: [
                    {
                        "validator": Validator.required,
                        "message": "Password is required field"
                    }
                ]
            })
        }

        let defaultValues = {}
        formFields.forEach((elem) => {
            if(elem.key == "group_data"){
                elem.values.forEach((ele) => {
                    if(ele.value)
                        defaultValues[ele.key] = ele.value
                    else
                        defaultValues[ele.key] = ""
                })
            }else if (elem.value){
                defaultValues[elem.key] = elem.value
            }else{
                defaultValues[elem.key] = ""
            }
        })
        if (state.category_id) {
            defaultValues['category_id'] = state.category_id
        }
        if (state.subcategory_id) {
            defaultValues['subcategory_id'] = state.subcategory_id
        }
        if (state.privacy) {
            defaultValues['privacy'] = state.privacy
        }
        if (state.subsubcategory_id) {
            defaultValues['subsubcategory_id'] = state.subsubcategory_id
        }
        
        const options = {}
        options["facts"] = Translate(props,"Primary Facts")
        options["seasons"] = Translate(props,"Seasons")
        options["images"] = Translate(props,"Images")
        options["videos"] = Translate(props,"Videos")
        options["castncrew"] = Translate(props,"Cast & Crew")
        options["genres"] = Translate(props,"Genres")
        options["countries"] = Translate(props,"Countries")


        return (
            <React.Fragment>
                {
                    <div className="container-fluid" ref={myRef}>
                        <div className="row">
                            <div className="col-lg-2">
                                <div className="sdBarSettBox">
                                    {
                                        state.width > 992 ? 
                                    <ul className="nav nav-tabs tabsLeft">
                                        <li>
                                            <a href={`${fURL}?tab=facts`} aria-controls="facts" onClick={(e) => chooseType("facts",e)} className={state.chooseType == "facts" ? "active" : ""}>
                                                {Translate(props,"Primary Facts")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`${fURL}?tab=seasons`} aria-controls="seasons" title={state.firstStep ? props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={(e) => chooseType("seasons",e)} className={state.chooseType == "seasons" ? "active" : ""}>
                                                {Translate(props,"Seasons")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`${fURL}?tab=images`} aria-controls="images" title={state.firstStep ? props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}   onClick={(e) => chooseType("images",e)} className={state.chooseType == "images" ? "active" : ""}>
                                                {Translate(props,"Images")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`${fURL}?tab=videos`} aria-controls="videos" title={state.firstStep ? props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={(e) => chooseType("videos",e)} className={state.chooseType == "videos" ? "active" : ""}>
                                                {Translate(props,"Videos")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`${fURL}?tab=castncrew`} aria-controls="castncrew" title={state.firstStep ? props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={(e) => chooseType("castncrew",e)} className={state.chooseType == "castncrew" ? "active" : ""}>
                                                {Translate(props,"Cast & Crew")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`${fURL}?tab=genres`} aria-controls="genres"  title={state.firstStep ? props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={(e) => chooseType("genres",e)} className={state.chooseType == "genres" ? "active" : ""}>
                                                {Translate(props,"Genres")}
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`${fURL}?tab=countries`} aria-controls="countries"  title={state.firstStep ? props.t('Save from "Primary Facts" panel in order to enable other menu items.') : ""}  onClick={(e) => chooseType("countries",e)} className={state.chooseType == "countries" ? "active" : ""}>
                                                {Translate(props,"Countries")}
                                            </a>
                                        </li>
                                    </ul>
                                    : 
                                    <div className="formFields">
                                        <div className="form-group">
                                            <select className="form-control form-select" value={state.chooseType} onChange={changeFilter}>
                                                {
                                                    Object.keys(options).map(function(key) {
                                                        return (
                                                            <option key={key} value={key}>{options[key]}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                }
                                {
                                    state.firstStep ?
                                        <p className="movie_series_tip">
                                        {props.t('Save from "Primary Facts" panel in order to enable other menu items.')}
                                        </p>
                                        : null
                                }
                                </div>
                            </div>
                            <div className="col-lg-10 bgSecondry">
                                <div className="tab-content dashboard">
                                {
                                    state.editItem && state.chooseType == "facts" ? 
                                    <Link href="/watch" customParam={`id=${state.editItem.custom_url}`} as={`/watch/${state.editItem.custom_url}`}>
                                    <a className="edit-watch-item">
                                        {props.t(props.pageData.selectType == "movie" ? "Watch Movie" : "Watch Series" )}
                                    </a>
                                    </Link>
                                    : null
                                }
                                {
                                state.chooseType == "facts" ?
                                    <Form
                                        editItem={state.editItem}
                                        className="form"
                                        defaultValues={defaultValues}
                                        {...props}
                                        generalError={state.error}
                                        validators={validator}
                                        submitText={!state.submitting ? "Submit" : "Submitting..."}
                                        model={formFields}
                                        onSubmit={model => {
                                            onSubmit(model);
                                        }}
                                    />
                                : 
                                state.chooseType == "seasons" && state.editItem ? 
                                    <Seasons {...props} updateSteps={updateSteps} seasons={state.seasons} movie={state.editItem} />
                                :state.chooseType == "images" && state.editItem ? 
                                    <Images {...props} updateSteps={updateSteps} images={state.images} movie={state.editItem} />
                                :state.chooseType == "videos" && state.editItem ? 
                                    <Videos {...props} updateSteps={updateSteps} seasons={state.seasons} videos={state.videos} movie={state.editItem} />
                                : state.chooseType == "castncrew" && state.editItem ? 
                                    <CastnCrew {...props} updateSteps={updateSteps} castncrew={state.castncrew} movie={state.editItem} />
                                : state.chooseType == "genres" && state.editItem ? 
                                    <Generes {...props} updateSteps={updateSteps} generes={state.generes} movie={state.editItem} />
                                : state.chooseType == "countries" && state.editItem ?
                                    <Countries {...props} updateSteps={updateSteps} movie_countries={state.movie_countries} countries={state.countries} movie={state.editItem} />
                                : null
                                }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </React.Fragment>
        )
    }

export default withRouter(Movie)