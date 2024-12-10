import { ObjectId } from "mongoose";
import { IUser } from "../../Models/UserModels/UserModel"
import {SignUp,IUserWithOtp} from "./SignUpInterface";

interface IUserRepository {
 insertUser(userData:SignUp):Promise<IUser|null>
 storeOtp(otp:string,id:ObjectId):Promise<Boolean>
 findUserByEmail(email:string):Promise<IUser|null>
 findOtpWithId(userId:ObjectId):Promise<IUserWithOtp|null>
 verifyUser(id:ObjectId):Promise<Boolean>
}

export default IUserRepository;