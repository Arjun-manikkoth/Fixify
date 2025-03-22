import axiosProvider from "../Axios/ProviderInstance";
import { SignIn } from "../Interfaces/ProviderInterfaces/SignInInterface";
import { SignUp } from "../Interfaces/ProviderInterfaces/SignUpInterface";
import providerRoutes from "../Endpoints/ProviderEndpoints";

interface IAddress {
    city: string;
    latitude: number;
    longitude: number;
    pincode: string;
    state: string;
}

interface ILocation extends IAddress {
    street: string | undefined;
}

const signInApi = async (formData: SignIn) => {
    try {
        const response = await axiosProvider.post(providerRoutes.sign_in, formData);
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

const signUpApi = async (formData: SignUp) => {
    try {
        const response = await axiosProvider.post(providerRoutes.sign_up, formData);

        return { success: true, message: "Sucessfully Created Account", data: response.data.data };
    } catch (error: any) {
        console.log(error.message);
        return {
            success: false,
            message: error.response.data.message || "something went wrong",
            data: null,
        };
    }
};

const otpVerifyApi = async (otp: string, email: string) => {
    try {
        const response = await axiosProvider.post(providerRoutes.otp_verify, {
            otp: otp,
            email: email,
        });
        return {
            success: true,
            message: "Please Sign to continue",
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
const otpResendApi = async (email: string) => {
    try {
        const response = await axiosProvider.post(providerRoutes.otp_resend, { email: email });

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

const logoutProvider = async () => {
    try {
        const response = await axiosProvider.get(providerRoutes.sign_out);

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

const refreshTokenApi = async () => {
    try {
        const response = await axiosProvider.post(providerRoutes.refresh_token);
    } catch (error: any) {
        console.log(error.message);
        return {
            success: false,
            message: error.response.data.message,
            data: null,
        };
    }
};

//get all services
const getServices = async () => {
    try {
        const response = await axiosProvider.get(providerRoutes.get_services);

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error: any) {
        console.log(error.message);
        return {
            success: false,
            message: "Cannot fetch services at this moment",
            data: null,
        };
    }
};

//api to sign in /sign up with google
const googleAuthApi = async (code: string) => {
    try {
        const response = await axiosProvider.patch(`${providerRoutes.o_auth}?code=${code}`);

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

const updateProfile = async (data: {
    id: string;
    image: File | null;
    userName: string;
    mobileNo: string;
}) => {
    try {
        const formData = new FormData();

        if (data.image) {
            formData.append("image", data.image);
        }
        formData.append("userName", data.userName);
        formData.append("mobileNo", data.mobileNo);

        const response = await axiosProvider.patch(
            `/${data.id}${providerRoutes.profile}`,
            formData
        );
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
        const response = await axiosProvider.get(`/${id}${providerRoutes.profile}`);

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

//api to register provider data for approval
const registerProvider = async (
    provider_id: string,
    aadharImage: File,
    workImages: File[],
    description: string,
    expertise_id: string
) => {
    try {
        const formData = new FormData();

        if (aadharImage) {
            formData.append("aadharImage", aadharImage);
        }

        // Append images as files
        workImages.forEach((image) => {
            formData.append("workImages", image);
        });

        formData.append("description", description);
        formData.append("expertise_id", expertise_id);

        const response = await axiosProvider.post(
            `/${provider_id}${providerRoutes.register}`,
            formData
        );

        return {
            success: true,
            message: "Provider registration requested",
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

//api to authenticated email and send otp
const forgotPasswordApi = async (email: string) => {
    try {
        const response = await axiosProvider.post(providerRoutes.forgot_password, { email });

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
//api to send otp to server for forgot password email verification
const forgotOtpVerifyApi = async (otp: string, email: string) => {
    try {
        const response = await axiosProvider.post(providerRoutes.forgot_otp_verify, {
            otp: otp,
            email: email,
        });

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

//api to authenticated email and send otp
const resetPasswordApi = async (email: string, password: string) => {
    try {
        const response = await axiosProvider.patch(providerRoutes.reset_password, {
            email,
            password,
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

//api to validate the current password
const confirmPasswordApi = async (id: string | null, password: string) => {
    try {
        const response = await axiosProvider.post(`/${id}${providerRoutes.confirm_password}`, {
            password,
        });

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

//api to create slots with location for a day
const createScheduleApi = async (id: string | null, date: string, address: ILocation) => {
    try {
        const response = await axiosProvider.post(`/${id}${providerRoutes.schedules}`, {
            date,
            address,
        });

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

//api to get schedules for a day
const getScheduleApi = async (id: string | null, date: string) => {
    try {
        const response = await axiosProvider.get(`${id}${providerRoutes.schedules}`, {
            params: { date },
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

//api to list all booking requests
const bookingRequestListApi = async (id: string | null) => {
    try {
        const response = await axiosProvider.get(`${id}${providerRoutes.booking_request}`);

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

//api to change booking requests status
const bookingRequestStatusApi = async (id: string | null, status: string) => {
    try {
        const response = await axiosProvider.patch(`${providerRoutes.booking_request}/${id}`, {
            status,
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

//api get bookings
const fetchBookingsApi = async (id: string, page: number) => {
    try {
        const response = await axiosProvider.get(`/${id}${providerRoutes.bookings}`, {
            params: { page },
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

//api get booking details
const fetchBookingDetailsApi = async (id: string) => {
    try {
        const response = await axiosProvider.get(`${providerRoutes.bookings}/${id}`, {});

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

//api to initiate payment request
const paymentRequestApi = async (id: string, amount: number, method: string) => {
    try {
        const response = await axiosProvider.post(
            `${providerRoutes.bookings}/${id}${providerRoutes.payments}`,
            {
                amount,
                method,
            }
        );

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

//get chatting history
const getChatsApi = async (id: string) => {
    try {
        const response = await axiosProvider.get(`/${id}${providerRoutes.chats}`);

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

//get provider  dashboard
const providerDashboardApi = async (id: string, revenueBy: string, hoursBy: string) => {
    try {
        const response = await axiosProvider.get(`/${id}${providerRoutes.dashboard}`, {
            params: { revenueBy, hoursBy },
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

//report account api
const reportUserApi = async (data: {
    reporter_id: string;
    reported_id: string;
    reported_role: string;
    reason: string;
    booking_id: string;
}) => {
    try {
        const response = await axiosProvider.post(
            `${providerRoutes.bookings}/${data.booking_id}${providerRoutes.report}`,
            data
        );

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

//count unread notifications api
const countNotificationsApiProvider = async (id: string) => {
    try {
        const response = await axiosProvider.get(
            `/${id}${providerRoutes.notifications}${providerRoutes.count}`
        );

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

//count unread notifications api
const fetchNotifications = async (id: string, page: number) => {
    try {
        const response = await axiosProvider.get(`${providerRoutes.notifications}/${id}`);

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

//mark notification api
const markNotificationAsRead = async (id: string) => {
    try {
        const response = await axiosProvider.patch(`${providerRoutes.notifications}/${id}`);

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
    signUpApi,
    otpVerifyApi,
    otpResendApi,
    logoutProvider,
    refreshTokenApi,
    getServices,
    googleAuthApi,
    updateProfile,
    getProviderData,
    registerProvider,
    forgotPasswordApi,
    forgotOtpVerifyApi,
    resetPasswordApi,
    confirmPasswordApi,
    createScheduleApi,
    getScheduleApi,
    bookingRequestListApi,
    bookingRequestStatusApi,
    fetchBookingsApi,
    fetchBookingDetailsApi,
    paymentRequestApi,
    getChatsApi,
    providerDashboardApi,
    reportUserApi,
    countNotificationsApiProvider,
    fetchNotifications,
    markNotificationAsRead,
};
