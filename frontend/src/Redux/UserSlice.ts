import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface UserState {
     id: string | null;
     name: string;
     email: string;
     phone: string;
     url: string;
}

const initialState: UserState = {
     id: null,
     name: "",
     email: "",
     phone: "",
     url: "",
};

const userSlice = createSlice({
     name: "user",
     initialState,
     reducers: {
          setUser: (state, action: PayloadAction<UserState>) => {
               state.id = action.payload.id;
               state.name = action.payload.name;
               state.email = action.payload.email;
               state.phone = action.payload.phone;
               state.url = action.payload.url;
          },
          clearUser: (state) => {
               state.id = null;
               state.name = "";
               state.email = "";
               state.phone = "";
               state.url = "";
          },
     },
});

export const {setUser, clearUser} = userSlice.actions;

export default userSlice.reducer;
