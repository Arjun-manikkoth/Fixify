import {SignUp} from "./SignIn";
import {ISignIn} from "./SignIn";
import {ISignUpResponse} from "../../Services/ProviderServices";
import {IOtpResponse} from "../../Services/ProviderServices";
import {ObjectId} from "mongoose";
import {ISignInResponse, IRefreshTokenResponse} from "../../Services/ProviderServices";
import {IServices} from "../../Models/ProviderModels/ServiceModel";
import {IUpdateProfile} from "./SignIn";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";

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
}
export default IProviderService;
