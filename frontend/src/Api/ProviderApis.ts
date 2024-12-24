import axiosProvider from "../Axios/ProviderInstance";
import {SignIn} from "../Interfaces/ProviderInterfaces/SignInInterface";
import {SignUp} from "../Interfaces/ProviderInterfaces/SignUpInterface";
import providerRoutes from "../Endpoints/ProviderEndpoints";
import axios from "axios";
import {cloudinaryApi} from "./UserApis";

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
//api to fetch provider data with id
const getProviderData = async (id: string) => {
     try {
          const response = await axiosProvider.get(
               `${providerRoutes.get_profile_details}?id=${id}`
          );

          return {
               success: true,
               message: "Provider Details fetched successfully",
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
//api to store multiple images in cloudinary
const uploadImagesToCloudinary = async (files: File[]) => {
     try {
          const uploadedUrls = [];
          for (const file of files) {
               const response = await cloudinaryApi(file);
               if (response.success) {
                    uploadedUrls.push(response.url);
               } else {
                    console.error("Failed to upload:", file.name);
               }
          }
          return uploadedUrls; // Array of successfully uploaded URLs
     } catch (error) {
          console.log("Error uploading files:", error);
          return [];
     }
};
//api to register provider data for approval
const registerProvider = async (
     _id: string,
     aadharImage: string,
     workImages: string[] | null,
     description: string,
     expertise: string
) => {
     try {
          const data = {aadharImage, workImages, description, expertise, _id};
          const response = await axiosProvider.post(providerRoutes.register, data);

          return {
               success: true,
               message: "Provider registration request successfull",
               data: response.data.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: error.response.data.message,
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
     uploadImagesToCloudinary,
     getProviderData,
     registerProvider,
};
