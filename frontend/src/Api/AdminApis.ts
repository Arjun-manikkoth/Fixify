import axiosAdmin from "../Axios/AdminInstance";
import { SignIn } from "../Interfaces/AdminInterfaces/SignInInterface";
import adminRoutes from "../Endpoints/AdminEndPoints";

//sign in api
const signInApi = async (formData: SignIn) => {
    try {
        const response = await axiosAdmin.post(adminRoutes.sign_in, formData);
        return {
            success: true,
            message: "Sucessfully signed Into Account",
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

//admin logout api
const logoutAdmin = async () => {
    try {
        const response = await axiosAdmin.get(adminRoutes.sign_out);

        return {
            success: true,
            message: response.data.message,
            data: null,
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

//refresh token api
const refreshTokenApi = async () => {
    try {
        const response = await axiosAdmin.post(adminRoutes.refresh_token);
        return {
            success: true,
            message: response.data.message,
            data: null,
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

//users listing api
const getUsers = async (page: number, filter: string, search: string | number) => {
    try {
        const response = await axiosAdmin.get(
            `${adminRoutes.users}?page=${page}&search=${search}&filter=${filter}`
        );

        return { success: true, message: "Fetched users data successfully", data: response.data };
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
        const response = await axiosAdmin.patch(`${adminRoutes.users}/${id}${adminRoutes.block}`);

        return { success: true, message: "User blocked successfully", data: response.data };
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
        const response = await axiosAdmin.patch(`${adminRoutes.users}/${id}${adminRoutes.unblock}`);

        return { success: true, message: "User Unblocked successfully", data: response.data };
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
        const response = await axiosAdmin.patch(
            `${adminRoutes.providers}/${id}${adminRoutes.block}`
        );

        return { success: true, message: "Provider blocked successfully", data: response.data };
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
        const response = await axiosAdmin.patch(
            `${adminRoutes.providers}/${id}${adminRoutes.unblock}`
        );

        return { success: true, message: "Provider Unblocked successfully", data: response.data };
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
        const response = await axiosAdmin.get(`${adminRoutes.approvals}/${id}`);

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
        const response = await axiosAdmin.patch(`${adminRoutes.approvals}/${id}`, { status });

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

//get all services
const getServices = async (page: number, filter: string, search: string | number) => {
    try {
        const response = await axiosAdmin.get(
            `${adminRoutes.services}?page=${page}&filter=${filter}&search=${search}`
        );

        return {
            success: true,
            message: response.data.message,
            data: response.data,
        };
    } catch (error: any) {
        console.log(error.message);
        return {
            success: false,
            message: "Cannot fetch services at this moment",
            data: [],
        };
    }
};

//list unlist service
const listUnlistService = async (id: string, status: string) => {
    try {
        const response = await axiosAdmin.patch(`${adminRoutes.services}/${id}/status`, {
            status: status,
        });

        return {
            success: true,
            message: response.data.message,
            data: response.data,
        };
    } catch (error: any) {
        console.log(error.message);
        return {
            success: false,
            message: "Cannot update service at this moment",
            data: [],
        };
    }
};

//create  service
const addService = async (data: { serviceName: string; description: string }) => {
    try {
        const response = await axiosAdmin.post(adminRoutes.services, {
            data: data,
        });

        return {
            success: true,
            message: response.data.message,
            data: response.data,
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

//edit  service
const editService = async (id: string, data: { serviceName: string; description: string }) => {
    try {
        const response = await axiosAdmin.patch(`${adminRoutes.services}/${id}`, {
            data: data,
        });

        return {
            success: true,
            message: response.data.message,
            data: response.data,
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

//get service
const getService = async (id: string) => {
    try {
        const response = await axiosAdmin.get(`${adminRoutes.services}/${id}`);

        return {
            success: true,
            message: response.data.message,
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

//api get bookings
const fetchBookingsApi = async (page: number) => {
    try {
        const response = await axiosAdmin.get(`${adminRoutes.bookings}`, { params: { page } });

        return {
            success: true,
            message: response.data.message,
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

//get admin sales list
const adminSalesApi = async (fromDate: string, toDate: string, page: number) => {
    try {
        const response = await axiosAdmin.get(`${adminRoutes.sales}`, {
            params: { fromDate, toDate, page },
        });

        return {
            success: true,
            message: response.data.message,
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

//get admin dashboard tiles api
const adminDashboardTilesApi = async () => {
    try {
        const response = await axiosAdmin.get(`${adminRoutes.dashboard}`);

        return {
            success: true,
            message: response.data.message,
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

//get admin dashboard revenue api
const adminDashboardRevenueApi = async (period: string) => {
    try {
        const response = await axiosAdmin.get(`${adminRoutes.revenue}`, { params: { period } });

        return {
            success: true,
            message: response.data.message,
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
    getServices,
    listUnlistService,
    addService,
    editService,
    getService,
    fetchBookingsApi,
    adminSalesApi,
    adminDashboardTilesApi,
    adminDashboardRevenueApi,
};
