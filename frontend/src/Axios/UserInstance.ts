import axios from "axios";
import {baseUrl} from "../Constants/Constants";
import {refreshTokenApi} from "../Api/UserApis";
import {logoutUser} from "../Api/UserApis";
import {clearUser} from "../Redux/UserSlice";
import {store} from "../Redux/Store";

const instance = axios.create({
     baseURL: `${baseUrl}users`,
     withCredentials: true, // Send cookies with every request
});

instance.interceptors.response.use(
     (response) => {
          return response;
     },
     async (error) => {
          if (
               error.response &&
               error.response.status === 401 &&
               error.response.data.message === "Refresh Token expired"
          ) {
               //if refresh token is expired makes api call and clear cookies then logouts

               await logoutUser();
               store.dispatch(clearUser()); //clears user data from the store
          } else if (
               error.response.status === 401 &&
               (error.response.data.message === "Refresh Token invalid" ||
                    error.response.data.message === "Refresh Token missing" ||
                    error.response.data.message === "Unauthorized! Access Token is invalid")
          ) {
               //if access or refresh tokens are missing or invalid clear cookies and logouts

               await logoutUser();
               store.dispatch(clearUser()); //clears user data from the store
          } else if (
               error.response.status === 401 &&
               (error.response.data.message === "Unauthorized! Access Token is expired" ||
                    error.response.data.message === "Access Token is missing")
          ) {
               //if access token is expired make an api call to get new access token
               console.log("this error code is being triggered at refresh token api");
               await refreshTokenApi();
          } else if (
               error.response.status === 401 &&
               error.response.data.message === "Blocked by admin"
          ) {
               await logoutUser();
               store.dispatch(clearUser());
          }
          return Promise.reject(error);
     }
);

export default instance;
