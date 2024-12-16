import axios from "axios";
import {baseUrl} from "../Constants/Constants";
import {refreshTokenApi} from "../Api/ProviderApis";
import {logoutProvider} from "../Api/ProviderApis";
import {clearProvider} from "../Redux/ProviderSlice";
import {store} from "../Redux/Store";

const instance = axios.create({
     baseURL: `${baseUrl}providers`,
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

               await logoutProvider();
               store.dispatch(clearProvider()); //clears provider data from the store
          } else if (
               error.response.status === 401 &&
               (error.response.data.message === "Refresh Token invalid" ||
                    error.response.data.message === "Refresh Token missing" ||
                    error.response.data.message === "Unauthorized! Access Token is invalid")
          ) {
               //if access or refresh tokens are missing or invalid clear cookies and logouts

               await logoutProvider();
               store.dispatch(clearProvider()); //clears provider data from the store
          } else if (
               error.response.status === 401 &&
               (error.response.data.message === "Unauthorized! Access Token is expired" ||
                    error.response.data.message === "Access Token is missing")
          ) {
               //if access token is expired make an api call to get new access token

               await refreshTokenApi();
          }

          return Promise.reject(error);
     }
);

export default instance;