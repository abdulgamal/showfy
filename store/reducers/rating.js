import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  status: false,
  data:null
};


export const chatSlice = createSlice({
    name: 'rating',
    initialState,
    reducers: {
      ratingStats: (state,action) => {
        state.status = action.payload.status
        state.data = action.payload.data
      }
    },
})

// Action creators are generated for each case reducer function
export const { ratingStats } = chatSlice.actions

export default chatSlice.reducer