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
    url: string;
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
