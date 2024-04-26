import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    contentId: '',
    contentType:"",
    status:false
}


export const chatSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
      openReport: (state,action) => {
        state.contentId = action.payload.id
        state.contentType = action.payload.type
        state.status = action.payload.status
      }
    },
})

// Action creators are generated for each case reducer function
export const { openReport } = chatSlice.actions

export default chatSlice.reducer