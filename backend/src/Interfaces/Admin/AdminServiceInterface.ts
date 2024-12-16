import {ObjectId} from "mongoose";
import {ISignInResponse, IRefreshTokenResponse} from "../../Services/AdminServices";
import {ISignIn} from "./SignInInterface";

interface IAdminService {
     authenticateAdmin(data: ISignIn): Promise<ISignInResponse | null>;
     refreshTokenCheck(token: string): Promise<IRefreshTokenResponse>;
}
export default IAdminService;
