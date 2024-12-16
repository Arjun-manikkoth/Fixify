import {configureStore} from "@reduxjs/toolkit";
import {persistStore, persistReducer} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./UserSlice";
import providerReducer from "./ProviderSlice";
import adminReducer from "./AdminSlice";
import {combineReducers} from "@reduxjs/toolkit";

const persistConfig = {
     key: "root",
     storage,
};

//combine user reducer
const rootReducer = combineReducers({
     user: userReducer,
     provider: providerReducer,
     admin: adminReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

//configure store
const store = configureStore({
     reducer: persistedReducer,
     middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
               serializableCheck: false,
          }),
});

//create persistor
export const persistor = persistStore(store);

//Type defnitions
export type RootState = ReturnType<typeof store.getState>; // This provides the shape of the entire Redux state

export {store};
