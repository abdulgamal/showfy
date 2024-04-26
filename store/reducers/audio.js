import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  song_id: 0,
  audios: [],
  pausesong_id:0
};

export const chatSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    updateAudioData: (state, action) => {
      state.song_id = action.payload.song_id;
      state.audios = action.payload.audios;
      state.pausesong_id = action.payload.pausesong_id;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateAudioData } = chatSlice.actions;

export default chatSlice.reducer;
