import { configureStore } from '@reduxjs/toolkit'
import playlistReducer from "../store/reducers/playlist"
import toastReducer from "../store/reducers/toast"
import ratingReducer from "../store/reducers/rating"
import searchReducer from "../store/reducers/search"
import sharepopupReducer from "../store/reducers/sharepopup"
import reportReducer from "../store/reducers/report"
import miniplayerReducer from "../store/reducers/miniplayer"
import audioReducer from "../store/reducers/audio"

const store = configureStore({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
   }),
    reducer: {
		rating:ratingReducer,
		playlist:playlistReducer,
		toast:toastReducer,
		search:searchReducer,
		share:sharepopupReducer,
		report:reportReducer,
		miniplayer:miniplayerReducer,
		audio:audioReducer
    }
})
export {store}