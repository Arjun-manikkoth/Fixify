import {ObjectId} from "mongoose";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";
import {SignUp, IProviderWithOtp} from "./SignIn";
import {IServices} from "../../Models/ProviderModels/ServiceModel";
import {IUpdateProfile} from "./SignIn";

interface IProviderRepository {
     insertProvider(providerData: SignUp): Promise<IProvider | null>;
     storeOtp(otp: string, id: ObjectId): Promise<Boolean>;
     findProviderByEmail(email: string): Promise<IProvider | null>;
     findOtpWithId(id: ObjectId): Promise<IProviderWithOtp | null>;
     verifyProvider(id: ObjectId): Promise<Boolean>;
     getAllServices(): Promise<IServices[]>;
     getProviderDataWithId(id: string): Promise<Partial<IProvider> | null>;
     updateUserWithId(data: IUpdateProfile): Promise<Partial<IProvider> | null>;
}

export default IProviderRepository;
