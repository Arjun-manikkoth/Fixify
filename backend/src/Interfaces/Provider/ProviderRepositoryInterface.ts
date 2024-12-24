import {ObjectId} from "mongoose";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";
import {SignUp, IProviderWithOtp, IProviderRegistration} from "./SignIn";
import {IServices} from "../../Models/ProviderModels/ServiceModel";
import {IUpdateProfile} from "./SignIn";
import {IProviderWithService} from "./SignIn";

interface IProviderRepository {
     insertProvider(providerData: SignUp): Promise<IProvider | null>;
     storeOtp(otp: string, id: ObjectId): Promise<Boolean>;
     findProviderByEmail(email: string): Promise<IProvider | null>;
     findOtpWithId(id: ObjectId): Promise<IProviderWithOtp | null>;
     verifyProvider(id: ObjectId): Promise<Boolean>;
     getAllServices(): Promise<IServices[]>;
     getProviderDataWithId(id: string): Promise<Partial<IProvider> | null>;
     updateProviderWithId(data: IUpdateProfile): Promise<Partial<IProvider> | null>;
     fetchProviderProfileData(id: string): Promise<Partial<IProviderWithService> | null>;
     providerRegistration(data: IProviderRegistration): Promise<boolean>;
     approvalExists(id: string): Promise<boolean>;
}

export default IProviderRepository;
