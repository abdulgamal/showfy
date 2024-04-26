import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentVideoTime: 0,
    relatedVideos:[],
    playlistVideos:[],
    currentVideo:null,
    deleteTitle:"",
    deleteMessage:"",
    liveStreamingURL:""
};


export const chatSlice = createSlice({
    name: 'miniplayer',
    initialState,
    reducers: {
      updatePlayerData: (state,action) => {
        state.relatedVideos = action.payload.relatedVideos
        state.playlistVideos = action.payload.playlistVideos
        state.currentVideo = action.payload.currentVideo
        state.deleteTitle = action.payload.deleteTitle
        state.deleteMessage = action.payload.deleteMessage
        state.liveStreamingURL = action.payload.liveStreamingURL
      },
      upatePlayerTime: (state,action) => {
        state.currentVideoTime = action.payload
      }
    },
})

// Action creators are generated for each case reducer function
export const { updatePlayerData,upatePlayerTime } = chatSlice.actions

export default chatSlice.reducer