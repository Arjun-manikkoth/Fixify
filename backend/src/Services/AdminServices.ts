import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import {ISignIn} from "../Interfaces/Admin/SignInInterface";
import IAdminRepository from "../Interfaces/Admin/AdminRepositoryInterface";
import {ObjectId} from "mongoose";
import {comparePasswords} from "../Utils/HashPassword";
import {generateTokens} from "../Utils/GenerateTokens";
import {verifyToken} from "../Utils/CheckToken";

//interface for signin response
export interface ISignInResponse {
     success: boolean;
     message: string;
     _id: ObjectId | null;
     email: string | null;
     accessToken: string | null;
     refreshToken: string | null;
}

//interface for refresh token response
export interface IRefreshTokenResponse {
     accessToken: string | null;
     message: string;
}

class AdminService implements IAdminService {
     //injecting respositories dependency to service
     constructor(private adminRepository: IAdminRepository) {}

     //authenticates admin by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
     async authenticateAdmin(data: ISignIn): Promise<ISignInResponse | null> {
          try {
               const exists = await this.adminRepository.findAdminByEmail(data.email); //gets user data with given email

               if (exists) {
                    // if the admin exists

                    const passwordStatus = await comparePasswords(data.password, exists.password); // utility function compares passwords

                    if (passwordStatus) {
                         //executes if the passwords are matching

                         const tokens = generateTokens(exists._id.toString(), exists.email, "user"); //generates access and refresh tokens

                         return {
                              success: true,
                              message: "Signed in Sucessfully",
                              email: exists.email,
                              _id: exists._id,
                              accessToken: tokens.accessToken,
                              refreshToken: tokens.refreshToken,
                         };
                    } else {
                         //if the credentials are wrong returns this
                         return {
                              success: false,
                              message: "Invalid Credentials",
                              email: null,
                              _id: null,
                              accessToken: null,
                              refreshToken: null,
                         };
                    }
               } else {
                    //executes this if the admin account is not found
                    return {
                         success: false,
                         message: "Account doesnot exist",
                         email: null,
                         _id: null,
                         accessToken: null,
                         refreshToken: null,
                    };
               }
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     // checks the refresh token and generates access token
     async refreshTokenCheck(token: string): Promise<IRefreshTokenResponse> {
          try {
               //Verifiying and decoding the token details
               const tokenStatus = await verifyToken(token);

               //checking for verified token and generate new refresh token
               if (tokenStatus.id && tokenStatus.email && tokenStatus.role) {
                    const tokens = generateTokens(
                         tokenStatus.id,
                         tokenStatus.email,
                         tokenStatus.role
                    ); //generates refresh token

                    return {
                         accessToken: tokens.accessToken,
                         message: tokenStatus.message,
                    };
               }

               //returns for unverified token
               return {
                    accessToken: null,
                    message: tokenStatus.message,
               };
          } catch (error: any) {
               console.log(error.message);

               return {
                    accessToken: null,
                    message: "Token error",
               };
          }
     }
}

export default AdminService;
