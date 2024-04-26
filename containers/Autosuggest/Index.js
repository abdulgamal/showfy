// server.autosuggest.js
import React,{useReducer,useRef} from 'react'
import Autosuggest from 'react-autosuggest';

const ServerAutoSuggest = (props) =>  {
    const department = useRef()
    department.current = []
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            id:props.id ? props.id : "",
            value: props.value ? props.value : "",
            suggestions: props.suggestionValue ? props.suggestionValue : []
        }
    );
    // Filter logic
    const getSuggestions = async (value) => {
        const inputValue = value.trim().toLowerCase();
        let response = await fetch(props.url+"?s="+inputValue);
        let data = await response.json()
        return data;
    };

    // Trigger suggestions
    const getSuggestionValue = suggestion => {
        setState({
            id: suggestion.title
        });
        props.setAutosuggestId(props.keyValue == "job" ? suggestion : suggestion.cast_crew_member_id,props.keyValue);
        return suggestion.title;
    }
    const getValuesDepartment = (value) => {
        let values = []
        department.current.forEach(job => {
            if((job.title.toLowerCase()).indexOf(value.toLowerCase()) > -1){
                values.push(job)
            }
        })
        return values;
    }
    const getDepartmentData = async (value) => {
        if(department.current.length > 0){
            return getValuesDepartment(value);
        }
        props.departmentJob.map(item => {
            item.jobs.forEach(job => {
                let itemObj = {}
                itemObj.department = item.department
                itemObj.title = job
                department.current.push(itemObj);
            });
        })

        return getValuesDepartment(value);
    }
    // Render Each Option
    const renderSuggestion = suggestion => (
        !props.departmentJob ?
        <span className="sugg-option">
            <span className="icon-wrap"><img src={(props.imageSuffix && suggestion.image.indexOf("https://") < 0 && suggestion.image.indexOf("http://") < 0 ? props.imageSuffix : "")+suggestion.image} /></span>
            <span className="name">
                {suggestion.title}
            </span>
        </span>
        :
        <span className="sugg-option-department">
            <span className="name">
            {props.t("Job: ")}{suggestion.title}
            </span>
            <span className="department">
                {props.t("Department: ")}{suggestion.department}
            </span>
        </span>
    );

    // OnChange event handler
    const onChange = (event, { newValue }) => {
        setState({
            value: newValue
        });
    };

    // Suggestion rerender when user types
    const onSuggestionsFetchRequested = ({ value }) => {
        !props.departmentJob ?
            getSuggestions(value)
                .then(data => {
                    if (data.error) {
                        setState({
                            suggestions: []
                        });
                    } else {
                        setState({
                            suggestions: data.result
                        });
                    }
                })
        :
        getDepartmentData(value)
            .then(data => {
                setState({
                    suggestions: data
                });
            })
    };

    // Triggered on clear
    const onSuggestionsClearRequested = () => {
        setState({
            suggestions: []
        });
    };

        const { value, suggestions } = state;

        // Option props
        const inputProps = {
            placeholder: props.t(props.placeholder),
            value,
            onChange: onChange
        };

        // Adding AutoSuggest component
        return (
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
            />
        );
    }

export default ServerAutoSuggest;