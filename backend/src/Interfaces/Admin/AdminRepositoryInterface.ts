import {IAdmin} from "../../Models/AdminModels/AdminModel";
import {IApprovalDetails, IPaginatedUsers} from "./SignInInterface";
import {IPaginatedProviders} from "./SignInInterface";
import {IPaginatedApprovals} from "./SignInInterface";
import {IApprovals} from "../../Models/ProviderModels/ApprovalModel";
import {ObjectId} from "mongoose";
import {IUser} from "../../Models/UserModels/UserModel";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";

interface IAdminRepository {
     findAdminByEmail(email: string): Promise<IAdmin | null>;
     getAllUsers(search: string, page: string, filter: string): Promise<IPaginatedUsers | null>;
     changeUserBlockStatus(id: string): Promise<boolean>;
     changeUserUnBlockStatus(id: string): Promise<boolean>;
     getAllProviders(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedProviders | null>;
     changeProviderBlockStatus(id: string): Promise<boolean>;
     changeProviderUnBlockStatus(id: string): Promise<boolean>;
     getAllApprovals(page: string): Promise<IPaginatedApprovals | null>;
     findApprovalDetail(id: string): Promise<IApprovalDetails[] | null>;
     updateApprovalStatus(id: string, status: string): Promise<IApprovals | null>;
     getProviderById(id: ObjectId): Promise<IProvider | null>;
     updateProviderServiceApproval(providerId: ObjectId, serviceId: ObjectId): Promise<boolean>;
}

export default IAdminRepository;
