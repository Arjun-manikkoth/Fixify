import {ObjectId} from "mongoose";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";
import {IOtp} from "../../Models/CommonModels/OtpModel";

export interface SignUp {
     userName: string;
     email: string;
     service_id: string;
     mobileNo: string;
     password: string;
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
