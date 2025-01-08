import {IProviderRegistration, IProviderWithService, SignUp} from "./SignIn";
import {ISignIn} from "./SignIn";
import {ISignUpResponse} from "../../Services/ProviderServices";
import {IOtpResponse} from "../../Services/ProviderServices";
import {ObjectId} from "mongoose";
import {ISignInResponse, IRefreshTokenResponse} from "../../Services/ProviderServices";
import {IServices} from "../../Models/ProviderModels/ServiceModel";
import {IUpdateProfile} from "./SignIn";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";
import {IResponse} from "../../Services/AdminServices";

interface IProviderService {
     createProvider(providerData: SignUp): Promise<ISignUpResponse | null>;
     otpSend(email: string, id: ObjectId): Promise<boolean>;
     otpCheck(otp: string, email: string): Promise<IOtpResponse>;
     otpResend(email: string): Promise<boolean>;
     authenticateProvider(providerData: ISignIn): Promise<ISignInResponse | null>;
     refreshTokenCheck(token: string): Promise<IRefreshTokenResponse>;
     getServices(): Promise<IServices[] | null>;
     googleAuth(code: string): Promise<ISignInResponse>;
     editProfile(data: IUpdateProfile): Promise<Partial<IProvider | null>>;
     getProfileData(id: string): Promise<Partial<IProviderWithService> | null>;
     forgotPasswordVerify(id: string): Promise<IResponse>;
     registerProvider(data: IProviderRegistration): Promise<IOtpResponse>;
     changePassword(email: string, password: string): Promise<IResponse>;
     passworOtpCheck(otp: string, email: string): Promise<IOtpResponse>;
     verifyPassword(id: string, password: string): Promise<IResponse>;
}
export default IProviderService;
