import axios from "axios";
import {baseUrl} from "../Constants/Constants";
import {refreshTokenApi} from "../Api/AdminApis";
import {logoutAdmin} from "../Api/AdminApis";
import {clearAdmin} from "../Redux/AdminSlice";
import {store} from "../Redux/Store";

const instance = axios.create({
     baseURL: `${baseUrl}admins`,
     withCredentials: true, // Send cookies with every request
});

instance.interceptors.response.use(
     (response) => {
          return response;
     },
     async (error) => {
          const originalRequest = error.config;
          if (
               error.response.status === 401 &&
               (error.response.data.message === "Refresh Token invalid" ||
                    error.response.data.message === "Refresh Token missing" ||
                    error.response.data.message === "Unauthorized! Access Token is invalid" ||
                    error.response.data.message === "Refresh Token expired")
          ) {
               //if access or refresh tokens are missing or invalid clear cookies and logouts

               await logoutAdmin();
               store.dispatch(clearAdmin()); //clears provider data from the store
          } else if (
               error.response.status === 401 &&
               (error.response.data.message === "Unauthorized! Access Token is expired" ||
                    error.response.data.message === "Access Token is missing") &&
               !originalRequest._retry
          ) {
               //if access token is expired make an api call to get new access token

               originalRequest._retry = true;
               try {
                    await refreshTokenApi();

                    return instance(originalRequest);
               } catch (refreshError) {
                    await logoutAdmin();

                    return Promise.reject(refreshError);
               }
          }

          return Promise.reject(error);
     }
);

export default instance;
