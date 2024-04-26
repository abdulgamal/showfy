import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  message: "",
  type:"success"
};


export const chatSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
      openToast: (state,action) => {
        state.message = action.payload.message
        state.type = action.payload.type
      }
    },
})

// Action creators are generated for each case reducer function
export const { openToast } = chatSlice.actions

export default chatSlice.reducer