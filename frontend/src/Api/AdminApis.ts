import axiosAdmin from "../Axios/AdminInstance";
import {SignIn} from "../Interfaces/AdminInterfaces/SignInInterface";
import adminRoutes from "../Endpoints/AdminEndPoints";

const signInApi = async (formData: SignIn) => {
     try {
          const response = await axiosAdmin.post(adminRoutes.signIn, formData);
          return {
               success: true,
               message: "Sucessfully signed Into Account",
               email: response.data.email,
               id: response.data.id,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: error.response.data.message,
          };
     }
};

const logoutAdmin = async () => {
     try {
          const response = await axiosAdmin.post(adminRoutes.logout);

          return {
               success: true,
               message: response.data.message,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: error.response.data.message,
          };
     }
};

const refreshTokenApi = async () => {
     try {
          const response = await axiosAdmin.post(adminRoutes.refresh_token);
     } catch (error: any) {
          console.log(error.message);
     }
};

const testApi = async () => {
     try {
          const response = await axiosAdmin.get("/test");
     } catch (error: any) {
          console.log(error.message);
     }
};
export {signInApi, logoutAdmin, refreshTokenApi, testApi};
