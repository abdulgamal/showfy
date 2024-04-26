import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playlistClicked: false,
  video_id:0
};


export const chatSlice = createSlice({
    name: 'playlist',
    initialState,
    reducers: {
      openPlaylist: (state,action) => {
        state.playlistClicked = action.payload.status
        state.video_id = action.payload.videoId
      }
    },
})

// Action creators are generated for each case reducer function
export const { openPlaylist } = chatSlice.actions

export default chatSlice.reducer