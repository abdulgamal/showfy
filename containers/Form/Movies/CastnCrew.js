import React,{useReducer,useEffect,useRef} from 'react'
import CastNCrew from "./Seasons"

const CastnCrew = (props) => {
    
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            castncrew:props.castncrew ? props.castncrew : [],
            movie:props.movie
        }
    );
    useEffect(() => {
        if(props.castncrew != state.castncrew){
            setState({
                castncrew:props.castncrew ? props.castncrew : [],                
            })
        }
    },[props.castncrew])
    

        let seasons = []
        let season = {}
        season.season_id = 0
        season.castncrew = state.castncrew
        seasons.push(season)
        let selectedTabs = []
        selectedTabs[0] = "cast"
        return <CastNCrew {...props} updateSteps={props.updateSteps} fromCastnCrew={true} seasonsCrew={seasons} selectedTabs={selectedTabs} movie={state.movie} />
}




export default CastnCrew