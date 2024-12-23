import {IAdmin} from "../../Models/AdminModels/AdminModel";
import {IUser} from "../../Models/UserModels/UserModel";
import {IPaginatedUsers} from "./SignInInterface";
import {IPaginatedProviders} from "./SignInInterface";

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
}

export default IAdminRepository;
