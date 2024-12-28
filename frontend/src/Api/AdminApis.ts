import axiosAdmin from "../Axios/AdminInstance";
import {SignIn} from "../Interfaces/AdminInterfaces/SignInInterface";
import adminRoutes from "../Endpoints/AdminEndPoints";

//sign in api
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

//admin logout api
const logoutAdmin = async () => {
     try {
          const response = await axiosAdmin.get(adminRoutes.logout);

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

//refresh token api
const refreshTokenApi = async () => {
     try {
          const response = await axiosAdmin.post(adminRoutes.refresh_token);
     } catch (error: any) {
          console.log(error.message);
     }
};

//users listing api
const getUsers = async (page: number, filter: string, search: string | number) => {
     try {
          const response = await axiosAdmin.get(
               `${adminRoutes.users}?page=${page}&search=${search}&filter=${filter}`
          );

          return {success: true, message: "Fetched users data successfully", data: response.data};
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to fetch users data",
               data: null,
          };
     }
};

//providers listing api
const getProviders = async (page: number, filter: string, search: string | number) => {
     try {
          const response = await axiosAdmin.get(
               `${adminRoutes.providers}?page=${page}&search=${search}&filter=${filter}`
          );

          return {
               success: true,
               message: "Fetched provider data successfully",
               data: response.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to fetch provider data",
               data: null,
          };
     }
};
//user blocking api
const blockUser = async (id: string) => {
     try {
          const response = await axiosAdmin.patch(`${adminRoutes.userBlock}?id=${id}`);

          return {success: true, message: "User blocked successfully", data: response.data};
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to block user",
               data: null,
          };
     }
};
//user unblocking api
const unBlockUser = async (id: string) => {
     try {
          const response = await axiosAdmin.patch(`${adminRoutes.userUnBlock}?id=${id}`);

          return {success: true, message: "User Unblocked successfully", data: response.data};
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to Unblock user",
               data: null,
          };
     }
};

//provider blocking api
const blockProvider = async (id: string) => {
     try {
          const response = await axiosAdmin.patch(`${adminRoutes.providerBlock}?id=${id}`);

          return {success: true, message: "Provider blocked successfully", data: response.data};
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to block provider",
               data: null,
          };
     }
};
//provider unblocking api
const unBlockProvider = async (id: string) => {
     try {
          const response = await axiosAdmin.patch(`${adminRoutes.providerUnBlock}?id=${id}`);

          return {success: true, message: "Provider Unblocked successfully", data: response.data};
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to Unblock provider",
               data: null,
          };
     }
};

//approvals listing api
const getProvidersForApproval = async (page: number) => {
     try {
          const response = await axiosAdmin.get(`${adminRoutes.approvals}?page=${page}`);

          return {
               success: true,
               message: "Fetched approvals data successfully",
               data: response.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to fetch approval data",
               data: null,
          };
     }
};

//approvals api
const approvalsDetails = async (id: string) => {
     try {
          const response = await axiosAdmin.get(`${adminRoutes.approval_details}/${id}`);

          return {
               success: true,
               message: "Fetched approvals data successfully",
               data: response.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to fetch approval data",
               data: null,
          };
     }
};
//approvals status change api
const approvalStatusChange = async (id: string, status: string) => {
     try {
          const response = await axiosAdmin.patch(`${adminRoutes.approval_update}/${id}/${status}`);

          return {
               success: true,
               message: "Approval status changed successfully",
               data: response.data,
          };
     } catch (error: any) {
          console.log(error.message);
          return {
               success: false,
               message: "Failed to change approval status",
               data: null,
          };
     }
};
export {
     signInApi,
     logoutAdmin,
     refreshTokenApi,
     getUsers,
     blockUser,
     unBlockUser,
     getProviders,
     blockProvider,
     unBlockProvider,
     getProvidersForApproval,
     approvalsDetails,
     approvalStatusChange,
};
