import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AdminState {
     id: string | null;
     email: string;
}

const initialState: AdminState = {
     id: null,
     email: "",
};

const adminSlice = createSlice({
     name: "admin",
     initialState,
     reducers: {
          setAdmin: (state, action: PayloadAction<AdminState>) => {
               state.id = action.payload.id;
               state.email = action.payload.email;
          },
          clearAdmin: (state) => {
               state.id = null;
               state.email = "";
          },
     },
});

export const {setAdmin, clearAdmin} = adminSlice.actions;

export default adminSlice.reducer;
