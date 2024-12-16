import IProviderService from "../Interfaces/Provider/ProviderServiceInterface";
import {SignUp} from "../Interfaces/Provider/SignUpInterface";
import {ISignIn} from "../Interfaces/Provider/SignUpInterface";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import {messages} from "../Constants/Messages";
import {generateOtp, hashOtp, compareOtps} from "../Utils/GenerateOtp";
import {sentOtpVerificationMail} from "../Utils/SendOtpMail";
import {ObjectId} from "mongoose";
import {hashPassword, comparePasswords} from "../Utils/HashPassword";
import {generateTokens} from "../Utils/GenerateTokens";
import {verifyToken} from "../Utils/CheckToken";
import {IServices} from "../Models/ProviderModels/ServiceModel";

//interface for signup response
export interface ISignUpResponse {
     success: boolean;
     message: string;
     email: string | null;
}

//interface for signin response
export interface ISignInResponse {
     success: boolean;
     message: string;
     email: string | null;
     _id: ObjectId | null;
     service_id: ObjectId | null;
     name: string;
     mobileNo: string;
     accessToken: string | null;
     refreshToken: string | null;
}

//interface for otp response
export interface IOtpResponse {
     success: boolean;
     message: string;
}

//interface for refresh token response
export interface IRefreshTokenResponse {
     accessToken: string | null;
     message: string;
}

class ProviderService implements IProviderService {
     //injecting respositories dependency to service
     constructor(private providerRepository: IProviderRepository) {}

     async getServices(): Promise<IServices[] | null> {
          try {
               const services = await this.providerRepository.getAllServices();

               if (services.length > 0) {
                    return services;
               } else {
                    return null;
               }
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     async createProvider(data: SignUp): Promise<ISignUpResponse | null> {
          try {
               console.log("reached at the create provider at services");
               const exists = await this.providerRepository.findProviderByEmail(data.email); //checking the registration status of the provider

               if (!exists) {
                    const hashedPassword = await hashPassword(data.password);
                    data.password = hashedPassword;

                    const status = await this.providerRepository.insertProvider(data); //inserts provider data to the database

                    if (status) {
                         const otpStatus = await this.otpSend(status.email, status._id); //generate and sends otp via email

                         if (otpStatus) {
                              //returns this response if otp sent sucessfully

                              return {
                                   success: true,
                                   message: messages.authentication.signUpSucess,
                                   email: status.email,
                              };
                         } else {
                              //returns this response if otp send failure

                              return {
                                   success: false,
                                   message: messages.authentication.emailOtpFailure,
                                   email: status.email,
                              };
                         }
                    } else {
                         //returns this reponse if the sign up to database failure

                         return {
                              success: false,
                              message: messages.authentication.signUpFailure,
                              email: null,
                         };
                    }
               } else {
                    //returns this if the email already exists

                    return {
                         success: false,
                         message: messages.authentication.dupicateEmail,
                         email: null,
                    };
               }
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //generate and send otp via mail
     async otpSend(email: string, id: ObjectId): Promise<boolean> {
          try {
               const otp = generateOtp(); //utility function generates otp

               const mail = await sentOtpVerificationMail(email, otp); //this utility function sends otp through mail

               if (mail) {
                    // works if mail is sucessfully sent

                    const hashedOtp = await hashOtp(otp); // this utility function hash otp

                    const otpStatus = await this.providerRepository.storeOtp(hashedOtp, id); //stores otp in the database

                    return otpStatus ? true : false; //returns status if otp storing to db is success or failure
               }
               return mail;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }

     /**
      *
      * @param email email id of the provider
      * @returns true/false based on the otp resend status
      */

     async otpResend(email: string): Promise<boolean> {
          try {
               const data = await this.providerRepository.findProviderByEmail(email); //checks the provider exists and fetch the provider data

               if (data) {
                    //works if the provider account exists

                    const otp = generateOtp(); //generate otp

                    const mail = await sentOtpVerificationMail(email, otp); //utility function sends the otp via email to the provider

                    if (mail) {
                         //executes if mail mail sending successfull

                         const hashedOtp = await hashOtp(otp); //this utility function hashes otp

                         const otpStatus = await this.providerRepository.storeOtp(
                              hashedOtp,
                              data._id
                         ); //stores otp to the database

                         return otpStatus ? true : false; //returns the otp storing status
                    }
                    return mail; //returns the mail sending status
               }

               return false; //returns this if the provider account is not found
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }

     //verifiying otp
     async otpCheck(otp: string, email: string): Promise<IOtpResponse> {
          {
               try {
                    const provider = await this.providerRepository.findProviderByEmail(email); //gets provider account details

                    if (provider) {
                         //executs if the provider exists

                         const data = await this.providerRepository.findOtpWithId(provider._id); //does look up between provider and otp collection and return the data

                         //checking whether otp exists in the aggregated result
                         if (data?.otp[0]?.value) {
                              const otpStatus = await compareOtps(otp, data.otp[0].value); //utility function compares the otps

                              if (otpStatus) {
                                   // works if otp is verified

                                   const verified = await this.providerRepository.verifyProvider(
                                        provider._id
                                   ); //change the verification status of provider to true

                                   return {success: true, message: "Otp verified successfully"};
                              } else {
                                   //return if the otp is invalid

                                   return {success: false, message: "Invalid Otp"};
                              }
                         } else if (!data?.otp.length) {
                              //evaluates true if the otp is not found

                              return {success: false, message: "Otp is expired"};
                         }
                    } //if provider account doesnot exists returns
                    return {
                         success: false,
                         message: "Provider not found",
                    };
               } catch (error: any) {
                    console.log(error.message);
                    return {success: false, message: "Otp error"};
               }
          }
     }

     //authenticates uesr by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
     async authenticateProvider(data: ISignIn): Promise<ISignInResponse | null> {
          try {
               const exists = await this.providerRepository.findProviderByEmail(data.email); //gets provider data with given email

               if (exists) {
                    // if the provider exists

                    const passwordStatus = await comparePasswords(data.password, exists.password); // utility function compares passwords

                    if (passwordStatus) {
                         //executes if the passwords are matching

                         //checks the provider is verified or not
                         if (exists.is_verified) {
                              //token creation logic here

                              const tokens = generateTokens(
                                   exists._id.toString(),
                                   exists.email,
                                   "provider"
                              ); //generates access and refresh tokens

                              return {
                                   success: true,
                                   message: "Signed in Sucessfully",
                                   email: exists.email,
                                   _id: exists._id,
                                   name: exists.name,
                                   service_id: exists.service_id,
                                   mobileNo: exists.mobile_no,
                                   accessToken: tokens.accessToken,
                                   refreshToken: tokens.refreshToken,
                              };
                         } else {
                              // sends otp and waits for otp verification

                              const status = await this.otpResend(exists.email); //resends otp for verifiying the provider

                              //sends this reponse to indicate that the provider still needs to verify
                              return {
                                   success: false,
                                   message: "Didn't complete otp verification",
                                   email: exists.email,
                                   _id: exists._id,
                                   name: exists.name,
                                   service_id: exists.service_id,
                                   mobileNo: exists.mobile_no,
                                   accessToken: null,
                                   refreshToken: null,
                              };
                         }
                    } else {
                         //if the credentials are wrong returns this
                         return {
                              success: false,
                              message: "Invalid Credentials",
                              email: null,
                              _id: null,
                              name: "",
                              service_id: null,
                              mobileNo: "",
                              accessToken: null,
                              refreshToken: null,
                         };
                    }
               } else {
                    //executes this if the provider account is not found
                    return {
                         success: false,
                         message: "Account doesnot exist",
                         email: null,
                         name: "",
                         mobileNo: "",
                         _id: null,
                         service_id: null,
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

export default ProviderService;
