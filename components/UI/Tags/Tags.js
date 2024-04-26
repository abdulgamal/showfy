import React,{useReducer,useEffect,useRef} from 'react'

const Tags = (props) => {

    const [state, setState] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      {
        tags: props.tags ?? []
      }
    );
    const tagInput = useRef(null)
    useEffect(() => {
      if(props.tags != state.tags){
        setState({tags:props.tags})
      }
    },[props.tags])
    
    const removeTag = (i) => {
      const newTags = [ ...state.tags ];
      newTags.splice(i, 1);
      setState({ tags: newTags });
      props.changeTags(newTags);
    }
  
    const inputKeyDown = (e) => {
      
      const val = e.target.value;
      if (e.key === 'Enter' && val) {
        if (state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
          e.preventDefault();
          return;
        }
        setState({ tags: [...state.tags, val]});
        props.changeTags([...state.tags, val]);
        tagInput.current.value = null;
        e.preventDefault();
      } else if (e.key === 'Backspace' && !val) {
        removeTag(state.tags.length - 1);
      }else if(e.key === 'Enter'){
        e.preventDefault();
      }
    }
  
      const { tags } = state;
  
      return (
        <div className="input-tag">
          <ul className="input-tag__tags">
            { tags.map((tag, i) => (
              <li key={tag}>
                {tag}
                <button type="button" onClick={() => { removeTag(i); }}>+</button>
              </li>
            ))}
            <li className="input-tag__tags__input">
                <input placeholder={props.t("Tags")} type="text" onKeyDown={inputKeyDown} ref={tagInput} />
            </li>
          </ul>
        </div>
      );
    }

  export default Tags;