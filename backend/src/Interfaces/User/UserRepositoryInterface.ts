import {ObjectId} from "mongoose";
import {IUser} from "../../Models/UserModels/UserModel";
import {IPaginatedUsers} from "../Admin/SignInInterface";
import {SignUp, IUserWithOtp, IUpdateProfile} from "./SignUpInterface";

interface IUserRepository {
     insertUser(userData: SignUp): Promise<IUser | null>;
     findUserByEmail(email: string): Promise<IUser | null>;
     findOtpWithId(userId: ObjectId): Promise<IUserWithOtp | null>;
     verifyUser(id: ObjectId): Promise<Boolean>;
     updateUserWithId(data: IUpdateProfile): Promise<Partial<IUser> | null>;
     getUserDataWithId(id: string): Promise<Partial<IUser> | null>;
     getAllUsers(search: string, page: string, filter: string): Promise<IPaginatedUsers | null>;
     changeUserBlockStatus(id: string): Promise<boolean>;
     changeUserUnBlockStatus(id: string): Promise<boolean>;
}

export default IUserRepository;
