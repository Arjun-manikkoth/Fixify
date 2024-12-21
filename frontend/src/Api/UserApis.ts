import axiosUser from "../Axios/UserInstance";
import {SignIn} from "../Interfaces/UserInterfaces/SignInInterface";
import {SignUp} from "../Interfaces/UserInterfaces/SignUpInterface";
import userRoutes from "../Endpoints/UserEndpoints";
import axios from "axios";

interface ISignUpResponse {
     success: boolean;
     message: string;
     email?: string | null;
     id?: string | null;
     name?: string;
     phone?: string;
}

const signInApi = async (formData: SignIn) => {
     try {
          const response = await axiosUser.post(userRoutes.signIn, formData);
          return {
               success: true,
               message: "Sucessfully signed Into Account",
               email: response.data.email,
               name: response.data.name,
               id: response.data.id,
               url: response.data.url,
               phone: response.data.phone,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: error.response.data.message,
          };
     }
};

const signUpApi = async (formData: SignUp): Promise<ISignUpResponse> => {
     try {
          const response = await axiosUser.post(userRoutes.signUp, formData);

          return {success: true, message: "Sucessfully Created Account", email: response.data.data};
     } catch (error: any) {
          console.log(error.message);
          return {success: false, message: error.response.data.message || "something went wrong"};
     }
};

const otpVerifyApi = async (otp: string, email: string) => {
     try {
          const response = await axiosUser.post(userRoutes.otpVerify, {otp: otp, email: email});
          return {
               success: true,
               message: "Please Sign to continue",
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: error.response.data.message,
          };
     }
};
const otpResendApi = async (email: string) => {
     try {
          const response = await axiosUser.post(userRoutes.otpResend, {email: email});

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

const logoutUser = async () => {
     try {
          const response = await axiosUser.post(userRoutes.logout);

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
          const response = await axiosUser.post(userRoutes.refresh_token);
     } catch (error: any) {
          console.log(error.message);
     }
};

const testApi = async () => {
     try {
          const response = await axiosUser.get("/test");
     } catch (error: any) {
          console.log(error.message);
     }
};

const googleAuthApi = async (code: string) => {
     try {
          const response = await axiosUser.get(`${userRoutes.o_auth}?code=${code}`);

          return {
               success: true,
               message: "Sucessfully signed Into Account",
               email: response.data.email,
               name: response.data.name,
               id: response.data.id,
               url: response.data.url,
               phone: response.data.phone,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: error.response.data.message,
          };
     }
};

const cloudinaryApi = async (file: File) => {
     try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "profile_cloudinary");
          formData.append("cloud_name", "dxdghkyag");
          const response = await axios.post(
               "https://api.cloudinary.com/v1_1/dxdghkyag/image/upload",
               formData
          );

          return {
               success: true,
               url: response.data.url,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               url: "",
          };
     }
};

const updateProfile = async (formData: {
     id: string;
     url: string;
     userName: string;
     mobileNo: string;
}) => {
     try {
          const response = await axiosUser.post(userRoutes.update_profile, formData);
          return {
               success: true,
               message: "Profile updated Sucessfully",
               data: response.data.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Profile updation failed",
               data: null,
          };
     }
};
export {
     signInApi,
     signUpApi,
     otpVerifyApi,
     otpResendApi,
     logoutUser,
     refreshTokenApi,
     googleAuthApi,
     testApi,
     cloudinaryApi,
     updateProfile,
};
