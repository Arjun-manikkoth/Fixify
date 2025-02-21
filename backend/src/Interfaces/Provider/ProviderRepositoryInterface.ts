import { ObjectId } from "mongoose";
import { IProvider } from "../../Models/ProviderModels/ProviderModel";
import { SignUp, IProviderWithOtp } from "./SignIn";
import { IUpdateProfile } from "./SignIn";
import { IProviderWithService } from "./SignIn";
import { IPaginatedProviders } from "../Admin/SignInInterface";

interface IProviderRepository {
    insertProvider(providerData: SignUp): Promise<IProvider | null>;
    findProviderByEmail(email: string): Promise<IProvider | null>;
    findOtpWithId(id: ObjectId): Promise<IProviderWithOtp | null>;
    verifyProvider(id: ObjectId): Promise<Boolean>;
    getProviderDataWithId(id: string): Promise<IProvider | null>;
    updateProviderWithId(data: IUpdateProfile): Promise<Partial<IProvider> | null>;
    fetchProviderProfileData(id: string): Promise<Partial<IProviderWithService> | null>;
    getAllProviders(
        search: string,
        page: string,
        filter: string
    ): Promise<IPaginatedProviders | null>;
    changeProviderBlockStatus(id: string): Promise<boolean>;
    changeProviderUnBlockStatus(id: string): Promise<boolean>;
    updateProviderServiceApproval(providerId: ObjectId, serviceId: ObjectId): Promise<boolean>;
    updatePassword(email: string, password: string): Promise<boolean>;
}

export default IProviderRepository;
