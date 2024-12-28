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
          const originalRequest = error.config;

          if (
               error.response.status === 401 &&
               (error.response.data.message === "Refresh Token invalid" ||
                    error.response.data.message === "Refresh Token missing" ||
                    error.response.data.message === "Unauthorized! Access Token is invalid" ||
                    error.response.data.message === "Refresh Token expired")
          ) {
               //if access tokens are invalid or refresh tokens are missing or invalid clear cookies and logouts

               await logoutUser();
               store.dispatch(clearUser()); //clears user data from the store
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
                    await logoutUser();

                    return Promise.reject(refreshError);
               }
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
