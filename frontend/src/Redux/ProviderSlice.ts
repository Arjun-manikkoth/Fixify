import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface ProviderState {
     id: string | null;
     service_id: string | null;
     name: string;
     email: string;
     phone: string;
     url: string;
}

const initialState: ProviderState = {
     id: null,
     service_id: null,
     name: "",
     email: "",
     phone: "",
     url: "",
};

const providerSlice = createSlice({
     name: "provider",
     initialState,
     reducers: {
          setProvider: (state, action: PayloadAction<ProviderState>) => {
               state.id = action.payload.id;
               state.service_id = action.payload.service_id;
               state.name = action.payload.name;
               state.email = action.payload.email;
               state.phone = action.payload.phone;
               state.url = action.payload.url;
          },
          clearProvider: (state) => {
               state.id = null;
               state.service_id = null;
               state.name = "";
               state.email = "";
               state.phone = "";
               state.url = "";
          },
     },
});

export const {setProvider, clearProvider} = providerSlice.actions;

export default providerSlice.reducer;
