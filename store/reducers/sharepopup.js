import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: false,
  data:{}
};

export const chatSlice = createSlice({
    name: 'share',
    initialState,
    reducers: {
      openSharePopup: (state,action) => {
        state.status = action.payload.status
        state.data = action.payload.data
      }
    },
})

// Action creators are generated for each case reducer function
export const { openSharePopup } = chatSlice.actions

export default chatSlice.reducer