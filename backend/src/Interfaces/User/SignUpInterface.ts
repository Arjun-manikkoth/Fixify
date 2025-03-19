import { ObjectId } from "mongoose";
import { IUser } from "../../Models/UserModels/UserModel";
import { IOtp } from "../../Models/CommonModels/OtpModel";

export interface SignUp {
    userName: string;
    email: string;
    mobileNo: string;
    password: string;
    passwordConfirm: string;
    url: string;
    google_id: ObjectId | null;
}
export interface IUserWithOtp {
    user: IUser;
    otp: [IOtp] | [];
}

export interface ISignIn {
    email: string;
    password: string;
}
export interface IUpdateProfile {
    url?: string;
    userName: string;
    mobileNo: string;
    id: string;
}

export interface IAddAddress {
    id: string;
    latitude: string;
    longitude: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    houseName: string;
}

export interface ISlotFetch {
    service_id: string;
    lat: number;
    long: number;
    date: string;
    time: string;
}

export interface Address {
    houseName: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
}

export interface IBookingRequestData {
    user_id: string;
    technician_id: string;
    description: string;
    address: Address;
    slot_id: string;
    time: string;
    date: string;
}

export interface IReviewData {
    booking_id: string;
    provider_id: string;
    rating: number;
    review: string;
    description: string;
}
