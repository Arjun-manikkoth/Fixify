import { ObjectId } from "mongoose";
import { IProvider } from "../../Models/ProviderModels/ProviderModel";
import { IOtp } from "../../Models/CommonModels/OtpModel";
import { IServices } from "../../Models/ProviderModels/ServiceModel";

export interface SignUp {
    userName: string;
    email: string;
    service_id: ObjectId | null;
    google_id: string | null;
    mobileNo: string;
    password: string;
    url: string;
    passwordConfirm: string;
}

export interface IProviderWithOtp {
    provider: IProvider;
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

export interface IProviderWithService {
    provider: Partial<IProvider>;
    service: Partial<IServices> | null;
}
export interface IProviderRegistration {
    _id: string;
    description: string;
    aadharImage: string;
    expertise: string;
    workImages: string[];
}
export interface IAddress {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    pincode: string;
    street?: string;
}
