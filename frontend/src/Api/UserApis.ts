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
//api sends sign in data to the server
const signInApi = async (formData: SignIn) => {
     try {
          const response = await axiosUser.post(userRoutes.sign_in, formData);
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
//api sends signup data to the server
const signUpApi = async (formData: SignUp): Promise<ISignUpResponse> => {
     try {
          const response = await axiosUser.post(userRoutes.sign_up, formData);

          return {success: true, message: "Sucessfully Created Account", email: response.data.data};
     } catch (error: any) {
          console.log(error.message);
          return {success: false, message: error.response.data.message || "something went wrong"};
     }
};
//api to send otp to server for verification
const otpVerifyApi = async (otp: string, email: string) => {
     try {
          const response = await axiosUser.post(userRoutes.otp_verify, {otp: otp, email: email});
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

//api to resend otp
const otpResendApi = async (email: string) => {
     try {
          const response = await axiosUser.post(userRoutes.otp_resend, {email: email});

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

//api logouts user clears access and refresh tokens
const logoutUser = async () => {
     try {
          const response = await axiosUser.get(userRoutes.logout);

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

//api for refreshing access token
const refreshTokenApi = async () => {
     try {
          const response = await axiosUser.post(userRoutes.refresh_token);
     } catch (error: any) {
          console.log(error.message);
     }
};

//api to google signin and signup
const googleAuthApi = async (code: string) => {
     try {
          const response = await axiosUser.patch(`${userRoutes.o_auth}?code=${code}`);

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

//api to store images in cloudinary
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

//api to update the profile data
const updateProfile = async (formData: {
     id: string;
     url: string;
     userName: string;
     mobileNo: string;
}) => {
     try {
          const response = await axiosUser.patch(userRoutes.update_profile, formData);
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
//api to get user data with id
const getUserData = async (id: string) => {
     try {
          const response = await axiosUser.get(`${userRoutes.get_details}?id=${id}`);

          return {
               success: true,
               message: "User Details fetched successfully",
               data: response.data.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to fetch user details",
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
     cloudinaryApi,
     updateProfile,
     getUserData,
};
