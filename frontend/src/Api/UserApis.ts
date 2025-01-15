import axiosUser from "../Axios/UserInstance";
import { SignIn } from "../Interfaces/UserInterfaces/SignInInterface";
import { SignUp } from "../Interfaces/UserInterfaces/SignUpInterface";
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

        return { success: true, message: "Sucessfully Created Account", email: response.data.data };
    } catch (error: any) {
        console.log(error.message);
        return { success: false, message: error.response.data.message || "something went wrong" };
    }
};
//api to send otp to server for account verification
const otpVerifyApi = async (otp: string, email: string) => {
    try {
        const response = await axiosUser.post(userRoutes.otp_verify, { otp: otp, email: email });
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

//api to resend otp
const otpResendApi = async (email: string) => {
    try {
        const response = await axiosUser.post(userRoutes.otp_resend, { email: email });

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

//api to send otp to server for forgot password email verification
const forgotOtpVerifyApi = async (otp: string, email: string) => {
    try {
        const response = await axiosUser.post(userRoutes.forgot_otp_verify, {
            otp: otp,
            email: email,
        });
        console.log(response.data.message);
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

//api logouts user clears access and refresh tokens
const logoutUser = async () => {
    try {
        const response = await axiosUser.get(userRoutes.logout);

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

//api to authenticated email and send otp
const forgotPasswordApi = async (email: string) => {
    try {
        const response = await axiosUser.post(userRoutes.forgot_password, { email });

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

//api to  send email and new password
const resetPasswordApi = async (email: string, password: string) => {
    try {
        const response = await axiosUser.patch(userRoutes.reset_password, { email, password });

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
        const response = await axiosUser.post(`${userRoutes.confirm_password}/${id}`, { password });

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

//api to get location details with lattitude and longitude
const reverseGeocodingApi = async (latitude: number, longitude: number) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
        );
        if (response.data.status === "OK") {
            return {
                success: true,
                message: "Geocoding successful",
                data: response.data,
            };
        } else {
            return {
                success: false,
                message: response.data.error_message || "Failed to fetch geocoding details",
                data: null,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "An unknown error occurred",
            data: null,
        };
    }
};

//api to add a new address
const addAddressApi = async (
    address: {
        city: string;
        houseName: string;
        landmark: string;
        latitude: number;
        longitude: number;
        pincode: string;
        state: string;
        id?: string;
    },
    id: string
) => {
    address.id = id;
    try {
        const response = await axiosUser.post(`${userRoutes.add_address}`, { address });

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

//api to fetch all addresses
const getAddressesApi = async (id: string | null) => {
    try {
        const response = await axiosUser.get(`${userRoutes.get_addresses}/${id}`);

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

//api delete addresses
const deleteAddressApi = async (id: string | null) => {
    try {
        const response = await axiosUser.patch(`${userRoutes.delete_address}/${id}`);

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

//get addresss
const getAddressApi = async (id: string) => {
    try {
        const response = await axiosUser.get(`${userRoutes.get_address}/${id}`);

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

//update address
const updateAddressApi = async (
    id: string,
    address: {
        city: string;
        houseName: string;
        landmark: string;
        latitude: number;
        longitude: number;
        pincode: string;
        state: string;
    }
) => {
    try {
        const response = await axiosUser.patch(`${userRoutes.edit_address}/${id}`, { address });

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
    logoutUser,
    refreshTokenApi,
    googleAuthApi,
    cloudinaryApi,
    updateProfile,
    getUserData,
    forgotPasswordApi,
    forgotOtpVerifyApi,
    resetPasswordApi,
    confirmPasswordApi,
    reverseGeocodingApi,
    addAddressApi,
    getAddressesApi,
    deleteAddressApi,
    getAddressApi,
    updateAddressApi,
};
