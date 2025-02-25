import { IProviderRegistrationUrls } from "../Provider/SignIn";
import { IPaginatedApprovals } from "../Admin/SignInInterface";
import { IApprovalDetails } from "../Admin/SignInInterface";
import { IApprovals } from "../../Models/ProviderModels/ApprovalModel";

interface IApprovalRepository {
    approvalExists(id: string): Promise<boolean>;
    providerApprovalRegistration(data: IProviderRegistrationUrls): Promise<boolean>;
    getAllApprovals(page: string): Promise<IPaginatedApprovals | null>;
    findApprovalDetail(id: string): Promise<IApprovalDetails[] | null>;
    updateApprovalStatus(id: string, status: string): Promise<IApprovals | null>;
}
export default IApprovalRepository;
