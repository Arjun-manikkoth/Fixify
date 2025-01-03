import {IUpdateProfile, SignUp} from "./SignUpInterface";
import {ISignIn} from "./SignUpInterface";
import {ISignUpResponse} from "../../Services/UserServices";
import {IOtpResponse} from "../../Services/UserServices";
import {ObjectId} from "mongoose";
import {ISignInResponse, IRefreshTokenResponse} from "../../Services/UserServices";
import {IUser} from "../../Models/UserModels/UserModel";

interface IUserService {
     createUser(userData: SignUp): Promise<ISignUpResponse | null>;
     otpSend(email: string, id: ObjectId): Promise<boolean>;
     otpCheck(otp: string, email: string): Promise<IOtpResponse>;
     otpResend(email: string): Promise<boolean>;
     authenticateUser(userData: ISignIn): Promise<ISignInResponse | null>;
     refreshTokenCheck(token: string): Promise<IRefreshTokenResponse>;
     googleAuth(code: string): Promise<ISignInResponse>;
     editProfile(data: IUpdateProfile): Promise<Partial<IUser> | null>;
     getUserData(id: string): Promise<Partial<IUser> | null>;
}
export default IUserService;
