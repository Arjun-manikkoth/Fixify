import axiosProvider from "../Axios/ProviderInstance";
import {SignIn} from "../Interfaces/ProviderInterfaces/SignInInterface";
import {SignUp} from "../Interfaces/ProviderInterfaces/SignUpInterface";
import providerRoutes from "../Endpoints/ProviderEndpoints";
import axios from "axios";

interface ISignUpResponse {
     success: boolean;
     message: string;
     email?: string | null;
     service_id?: string | null;
     id?: string | null;
     name?: string;
     phone?: string;
}

const signInApi = async (formData: SignIn) => {
     try {
          const response = await axiosProvider.post(providerRoutes.signIn, formData);
          return {
               success: true,
               message: "Sucessfully signed Into Account",
               email: response.data.email,
               name: response.data.name,
               service_id: response.data.service_id,
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
          const response = await axiosProvider.post(providerRoutes.signUp, formData);

          return {success: true, message: "Sucessfully Created Account", email: response.data.data};
     } catch (error: any) {
          console.log(error.message);
          return {success: false, message: error.response.data.message || "something went wrong"};
     }
};

const otpVerifyApi = async (otp: string, email: string) => {
     try {
          const response = await axiosProvider.post(providerRoutes.otpVerify, {
               otp: otp,
               email: email,
          });
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
          const response = await axiosProvider.post(providerRoutes.otpResend, {email: email});

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

const logoutProvider = async () => {
     try {
          const response = await axiosProvider.post(providerRoutes.logout);

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
          const response = await axiosProvider.post(providerRoutes.refresh_token);
     } catch (error: any) {
          console.log(error.message);
     }
};

//get all services
const getServices = async () => {
     try {
          const response = await axiosProvider.get(providerRoutes.get_services);

          return {
               success: true,
               message: response.data.message,
               services: response.data.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Cannot fetch services at this moment",
               services: [],
          };
     }
};

const googleAuthApi = async (code: string) => {
     try {
          const response = await axiosProvider.get(`${providerRoutes.o_auth}?code=${code}`);

          return {
               success: true,
               message: "Sucessfully signed Into Account",
               email: response.data.email,
               name: response.data.name,
               id: response.data.id,
               url: response.data.url,
               service_id: response.data.service_id,
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

const updateProfile = async (formData: {
     id: string;
     url: string;
     userName: string;
     mobileNo: string;
}) => {
     try {
          const response = await axiosProvider.post(providerRoutes.update_profile, formData);
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
//api to provider user data with id
const getProviderData = async (id: string) => {
     try {
          const response = await axiosProvider.get(`${providerRoutes.get_details}?id=${id}`);

          return {
               success: true,
               message: "User Details fetched successfully",
               data: response.data.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to fetch provider details",
               data: null,
          };
     }
};
export {
     signInApi,
     signUpApi,
     otpVerifyApi,
     otpResendApi,
     logoutProvider,
     refreshTokenApi,
     getServices,
     googleAuthApi,
     updateProfile,
     getProviderData,
};
