import { ObjectId } from "mongoose";
import { IUser } from "../../Models/UserModels/UserModel";
import {IOtp} from "../../Models/CommonModels/OtpModel"

export interface SignUp {
    userName: string;
    email: string;
    mobileNo: string;
    password: string;
    passwordConfirm: string;
  }
  export interface IUserWithOtp {
    user: IUser; 
    otp: [IOtp] | []; 
  }
  


