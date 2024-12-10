
import { IUser } from "../../Models/UserModels/UserModel";
import {SignUp} from "./SignUpInterface";
import { ISignUpResponse } from "../../Services/UserServices";
import { IOtpResponse } from "../../Services/UserServices";
import { ObjectId } from "mongoose";

interface IUserService{
  createUser(userData:SignUp):Promise<ISignUpResponse|null>
  otpSend(email:string,id:ObjectId):Promise<boolean>
  otpCheck(otp:string,email:string):Promise<IOtpResponse>
  otpResend(email:string):Promise<boolean>
  authenticateUser(userData:SignUp):Promise<ISignUpResponse|null>
}
export default IUserService;