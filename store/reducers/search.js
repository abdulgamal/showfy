import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchValue: "",
  searchChanged: false,
  searchClicked: false,
  themeType: null,
  menuOpen: true,
};

export const chatSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setMenuOpen: (state, action) => {
      state.menuOpen = action.payload;
    },
    setSearchClicked: (state, action) => {
      state.searchClicked = action.payload;
    },
    changeSearchText: (state, action) => {
      state.searchValue = action.payload;
    },
    setSearchChanged: (state, action) => {
      state.searchChanged = action.payload;
    },
    setTheme: (state, action) => {
      state.themeType = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setMenuOpen,
  setSearchClicked,
  changeSearchText,
  setSearchChanged,
  setTheme
} = chatSlice.actions;

export default chatSlice.reducer;
