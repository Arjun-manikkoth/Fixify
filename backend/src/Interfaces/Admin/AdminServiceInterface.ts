import {ObjectId} from "mongoose";
import {ISignInResponse, IRefreshTokenResponse} from "../../Services/AdminServices";
import {IApprovalDetails, IPaginatedUsers, ISignIn} from "./SignInInterface";
import {IPaginatedProviders} from "./SignInInterface";
import {IPaginatedApprovals} from "./SignInInterface";

interface IAdminService {
     authenticateAdmin(data: ISignIn): Promise<ISignInResponse | null>;
     refreshTokenCheck(token: string): Promise<IRefreshTokenResponse>;
     getUsersList(search: string, page: string, filter: string): Promise<IPaginatedUsers | null>;
     userBlock(id: string): Promise<Boolean>;
     userUnBlock(id: string): Promise<Boolean>;
     getProvidersList(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedProviders | null>;
     providerBlock(id: string): Promise<Boolean>;
     providerUnBlock(id: string): Promise<Boolean>;
     getApprovalsList(page: string): Promise<IPaginatedApprovals | null>;
     getApprovalDetails(id: string): Promise<IApprovalDetails[] | null>;
     approvalStatusChange(id: string, status: string): Promise<Boolean>;
}
export default IAdminService;
