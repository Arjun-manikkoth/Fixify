import axiosProvider from "../Axios/ProviderInstance";
import {SignIn} from "../Interfaces/ProviderInterfaces/SignInInterface";
import {SignUp} from "../Interfaces/ProviderInterfaces/SignUpInterface";
import providerRoutes from "../Endpoints/ProviderEndpoints";

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

const testApi = async () => {
     try {
          const response = await axiosProvider.post("/test");
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

export {
     signInApi,
     signUpApi,
     otpVerifyApi,
     otpResendApi,
     logoutProvider,
     refreshTokenApi,
     getServices,
     testApi,
};
