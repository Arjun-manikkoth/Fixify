import { ObjectId } from "mongoose";
import { ISignInResponse, IRefreshTokenResponse, IResponse } from "../../Services/AdminServices";
import { IApprovalDetails, IPaginatedUsers, ISalesQuery, ISignIn } from "./SignInInterface";
import { IPaginatedProviders } from "./SignInInterface";
import { IPaginatedApprovals } from "./SignInInterface";
import { IPaginatedServices } from "../Service/IServices";
import { IAddService } from "./SignInInterface";
import { IServices } from "../../Models/ProviderModels/ServiceModel";

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
    getServices(search: string, page: string, filter: string): Promise<IPaginatedServices | null>;
    changeServiceStatus(status: string, id: string): Promise<Boolean>;
    createService(data: IAddService): Promise<IResponse>;
    getServiceDetails(id: string): Promise<IServices | null>;
    updateService(id: string, data: IAddService): Promise<IResponse>;
    fetchBookings(page: number): Promise<IResponse>;
    fetchSalesData(queries: ISalesQuery): Promise<IResponse>;
}
export default IAdminService;
