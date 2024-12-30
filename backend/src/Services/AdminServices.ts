import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import {
     IApprovalDetails,
     IPaginatedApprovals,
     IPaginatedProviders,
     IPaginatedUsers,
     ISignIn,
} from "../Interfaces/Admin/SignInInterface";
import {ObjectId} from "mongoose";
import {comparePasswords} from "../Utils/HashPassword";
import {generateTokens} from "../Utils/GenerateTokens";
import {verifyToken} from "../Utils/CheckToken";
import {sentMail} from "../Utils/SendMail";
import IAdminRepository from "../Interfaces/Admin/AdminRepositoryInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import IApprovalRepository from "../Interfaces/Approval/ApprovalRepositoryInterface";

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
     constructor(
          private adminRepository: IAdminRepository,
          private userRepository: IUserRepository,
          private providerRepository: IProviderRepository,
          private approvalRepository: IApprovalRepository
     ) {}

     //authenticates admin by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
     async authenticateAdmin(data: ISignIn): Promise<ISignInResponse | null> {
          try {
               const exists = await this.adminRepository.findAdminByEmail(data.email); //gets admin data with given email

               if (exists) {
                    // if the admin exists

                    const passwordStatus = await comparePasswords(data.password, exists.password); // utility function compares passwords

                    if (passwordStatus) {
                         //executes if the passwords are matching

                         const tokens = generateTokens(
                              exists._id.toString(),
                              exists.email,
                              "admin"
                         ); //generates access and refresh tokens

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

     //gets user list
     async getUsersList(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedUsers | null> {
          try {
               const data = await this.userRepository.getAllUsers(search, page, filter);
               if (data?.users) {
                    return data;
               }
               return null;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //gets approvals list
     async getApprovalsList(page: string): Promise<IPaginatedApprovals | null> {
          try {
               const data = await this.approvalRepository.getAllApprovals(page);

               if (data?.approvals) {
                    return data;
               }
               return null;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //change user block status to block
     async userBlock(id: string): Promise<Boolean> {
          try {
               const status = await this.userRepository.changeUserBlockStatus(id);
               return status ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
     //change user block status to unblock
     async userUnBlock(id: string): Promise<Boolean> {
          try {
               const status = await this.userRepository.changeUserUnBlockStatus(id);
               return status ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }

     //gets providers list
     async getProvidersList(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedProviders | null> {
          try {
               const data = await this.providerRepository.getAllProviders(search, page, filter);
               if (data?.providers) {
                    return data;
               }
               return null;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //change provider block status to block
     async providerBlock(id: string): Promise<Boolean> {
          try {
               const status = await this.providerRepository.changeProviderBlockStatus(id);
               return status ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
     //change provider block status to unblock
     async providerUnBlock(id: string): Promise<Boolean> {
          try {
               const status = await this.providerRepository.changeProviderUnBlockStatus(id);
               return status ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }

     //gets approvals detail
     async getApprovalDetails(id: string): Promise<IApprovalDetails[] | null> {
          try {
               const approvalData = await this.approvalRepository.findApprovalDetail(id);
               return approvalData;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //updates approval detail status to approved or rejected
     async approvalStatusChange(id: string, status: string): Promise<Boolean> {
          try {
               const updatedData = await this.approvalRepository.updateApprovalStatus(id, status);

               if (updatedData?.status === "Approved" && updatedData?.provider_id) {
                    const providerData = await this.providerRepository.getProviderById(
                         updatedData.provider_id
                    );
                    if (providerData) {
                         if (updatedData?.service_id) {
                              await this.providerRepository.updateProviderServiceApproval(
                                   providerData._id,
                                   updatedData.service_id
                              );
                         }
                         const mail = await sentMail(
                              providerData.email,
                              "Approval Mail",
                              `<p>Your request has been successfully approved!. You can start working with Fixify.</p>`
                         ); //utility function sends the email to the provider
                    }
               }

               return updatedData ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
}

export default AdminService;
