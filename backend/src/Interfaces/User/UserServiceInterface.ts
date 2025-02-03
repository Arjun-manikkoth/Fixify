import { ISlotFetch, IUpdateProfile, SignUp } from "./SignUpInterface";
import { ISignIn } from "./SignUpInterface";
import { ISignUpResponse } from "../../Services/UserServices";
import { IOtpResponse } from "../../Services/UserServices";
import { ObjectId } from "mongoose";
import { ISignInResponse, IRefreshTokenResponse } from "../../Services/UserServices";
import { IUser } from "../../Models/UserModels/UserModel";
import { IResponse } from "../../Services/AdminServices";
import { IAddAddress } from "./SignUpInterface";

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
    forgotPasswordVerify(id: string): Promise<IResponse>;
    passworOtpCheck(otp: string, email: string): Promise<IOtpResponse>;
    changePassword(email: string, password: string): Promise<IResponse>;
    verifyPassword(id: string, password: string): Promise<IResponse>;
    createAddress(address: IAddAddress): Promise<IResponse>;
    findAddresses(userId: string): Promise<IResponse>;
    changeAddressStatus(id: string): Promise<IResponse>;
    getAddress(addressId: string): Promise<IResponse>;
    editAddress(address: IAddAddress, id: string): Promise<IResponse>;
    getSlots(data: ISlotFetch): Promise<IResponse>;
}
export default IUserService;
