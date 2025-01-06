import IUserService from "../Interfaces/User/UserServiceInterface";
import {IUpdateProfile, SignUp} from "../Interfaces/User/SignUpInterface";
import {ISignIn} from "../Interfaces/User/SignUpInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import {messages} from "../Constants/Messages";
import {generateOtp, hashOtp, compareOtps} from "../Utils/GenerateOtp";
import {sentMail} from "../Utils/SendMail";
import {ObjectId} from "mongoose";
import {hashPassword, comparePasswords} from "../Utils/HashPassword";
import {generateTokens} from "../Utils/GenerateTokens";
import {verifyToken} from "../Utils/CheckToken";
import {oAuth2Client} from "../Utils/GoogleConfig";
import axios from "axios";
import {IUser} from "../Models/UserModels/UserModel";
import {IResponse} from "./AdminServices";
import IOtpRepository from "../Interfaces/Otp/OtpRepositoryInterface";

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
     name: string;
     url: string;
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

class UserService implements IUserService {
     //injecting respositories dependency to service
     constructor(private userRepository: IUserRepository, private otpRepository: IOtpRepository) {}

     /**
      * Creates a user account by validating the user's email and password,
      * hashing the password, storing the data, and sending an OTP for verification.
      *
      * @param {SignUp} userData - User registration data
      * @returns {Promise<ISignUpResponse|null>} - Response indicating success or failure
      */

     async createUser(userData: SignUp): Promise<ISignUpResponse | null> {
          try {
               const exists = await this.userRepository.findUserByEmail(userData.email); //checking the registration status of the user

               if (!exists) {
                    const hashedPassword = await hashPassword(userData.password);
                    userData.password = hashedPassword;

                    const status = await this.userRepository.insertUser({
                         ...userData,
                         google_id: null,
                         url: "",
                    }); //inserts userdata to the database

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

               const mail = await sentMail(
                    email,
                    "Verification Mail",
                    `<p>Enter this code <b>${otp}</b> to verify your Fixify account.</p><p>This code expires in <b>2 Minutes</b></p>`
               ); //this utility function sends otp through mail

               if (mail) {
                    // works if mail is sucessfully sent

                    const hashedOtp = await hashOtp(otp); // this utility function hash otp

                    const otpStatus = await this.otpRepository.storeOtp(hashedOtp, id); //stores otp in the database

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
      * @param email email id of the user
      * @returns true/false based on the otp resend status
      */

     async otpResend(email: string): Promise<boolean> {
          try {
               const data = await this.userRepository.findUserByEmail(email); //checks the user exists and fetch the user data

               if (data) {
                    //works if the user account exists

                    const otp = generateOtp(); //generate otp

                    const mail = await sentMail(
                         email,
                         "Verification Mail",
                         `<p>Enter this code <b>${otp}</b> to verify your Fixify account.</p><p>This code expires in <b>2 Minutes</b></p>`
                    ); //utility function sends the otp via email to the user

                    if (mail) {
                         //executes if mail mail sending successfull

                         const hashedOtp = await hashOtp(otp); //this utility function hashes otp

                         const otpStatus = await this.otpRepository.storeOtp(hashedOtp, data._id); //stores otp to the database

                         return otpStatus ? true : false; //returns the otp storing status
                    }
                    return mail; //returns the mail sending status
               }

               return false; //returns this if the user account is not found
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }

     //verifiying otp
     async otpCheck(otp: string, email: string): Promise<IOtpResponse> {
          {
               try {
                    const user = await this.userRepository.findUserByEmail(email); //gets user account details

                    if (user) {
                         //executes if the user exists

                         const data = await this.userRepository.findOtpWithId(user._id); //does look up between user and otp collection and return the data

                         //checking whether otp exists in the aggregated result
                         if (data?.otp[0]?.value) {
                              const otpStatus = await compareOtps(otp, data.otp[0].value); //utility function compares the otps

                              if (otpStatus) {
                                   // works if otp is verified

                                   const verified = await this.userRepository.verifyUser(user._id); //change the verification status of user to true

                                   return {success: true, message: "Otp verified successfully"};
                              } else {
                                   //return if the otp is invalid

                                   return {success: false, message: "Invalid Otp"};
                              }
                         } else if (!data?.otp.length) {
                              //evaluates true if the otp is not found

                              return {success: false, message: "Otp is expired"};
                         }
                    } //if user account doesnot exists returns
                    return {
                         success: false,
                         message: "User not found",
                    };
               } catch (error: any) {
                    console.log(error.message);
                    return {success: false, message: "Otp error"};
               }
          }
     }

     //authenticates uesr by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
     async authenticateUser(userData: ISignIn): Promise<ISignInResponse | null> {
          try {
               const exists = await this.userRepository.findUserByEmail(userData.email); //gets user data with given email

               if (exists) {
                    //checks whether the user is blocked by admin
                    if (exists.is_blocked) {
                         return {
                              success: false,
                              message: "Account blocked by admin",
                              email: "",
                              _id: null,
                              name: "",
                              url: "",
                              mobileNo: "",
                              accessToken: null,
                              refreshToken: null,
                         };
                    }
                    // if the user signed in via google
                    if (exists.google_id) {
                         return {
                              success: false,
                              message: "Please Sign in With Google",
                              email: "",
                              _id: null,
                              name: "",
                              url: "",
                              mobileNo: "",
                              accessToken: null,
                              refreshToken: null,
                         };
                    }

                    const passwordStatus = await comparePasswords(
                         userData.password,
                         exists.password
                    ); // utility function compares passwords

                    if (passwordStatus) {
                         //executes if the passwords are matching

                         //checks the user is verified or not
                         if (exists.is_verified) {
                              //token creation logic here

                              const tokens = generateTokens(
                                   exists._id.toString(),
                                   exists.email,
                                   "user"
                              ); //generates access and refresh tokens

                              return {
                                   success: true,
                                   message: "Signed in Sucessfully",
                                   email: exists.email,
                                   _id: exists._id,
                                   name: exists.name,
                                   url: exists.url,
                                   mobileNo: exists.mobile_no,
                                   accessToken: tokens.accessToken,
                                   refreshToken: tokens.refreshToken,
                              };
                         } else {
                              // sends otp and waits for otp verification

                              const status = await this.otpResend(exists.email); //resends otp for verifiying the user

                              //sends this reponse to indicate that the user still needs to verify
                              return {
                                   success: false,
                                   message: "Didn't complete otp verification",
                                   email: exists.email,
                                   _id: exists._id,
                                   name: exists.name,
                                   url: exists.url,
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
                              email: exists.email,
                              _id: null,
                              name: "",
                              url: "",
                              mobileNo: "",
                              accessToken: null,
                              refreshToken: null,
                         };
                    }
               } else {
                    //executes this if the user account is not found
                    return {
                         success: false,
                         message: "Account doesnot exist",
                         email: null,
                         name: "",
                         mobileNo: "",
                         url: "",
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
     async googleAuth(code: string): Promise<ISignInResponse> {
          try {
               const googleRes = await oAuth2Client.getToken(code);

               oAuth2Client.setCredentials(googleRes.tokens);

               const userRes = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
               );

               const {email, name, picture, id} = userRes.data;

               const user = await this.userRepository.findUserByEmail(email);

               if (!user) {
                    const saveUser = await this.userRepository.insertUser({
                         userName: name,
                         email: email,
                         password: "",
                         passwordConfirm: "",
                         mobileNo: "",
                         url: picture,
                         google_id: id,
                    });
                    if (saveUser) {
                         const tokens = generateTokens(saveUser._id.toString(), email, "user");
                         return {
                              success: true,
                              message: "Signed in sucessfully",
                              email: saveUser.email,
                              _id: saveUser._id,
                              name: saveUser.name,
                              mobileNo: "",
                              url: saveUser.url,
                              accessToken: tokens.accessToken,
                              refreshToken: tokens.refreshToken,
                         };
                    }
                    return {
                         success: false,
                         message: "Google Sign In failed",
                         email: null,
                         _id: null,
                         name: "",
                         mobileNo: "",
                         url: "",
                         accessToken: null,
                         refreshToken: null,
                    };
               } else {
                    if (user.is_blocked) {
                         return {
                              success: false,
                              message: "Account blocked by admin",
                              email: null,
                              _id: null,
                              name: "",
                              mobileNo: "",
                              url: "",
                              accessToken: null,
                              refreshToken: null,
                         };
                    }
                    const tokens = generateTokens(user._id.toString(), email, "user");
                    return {
                         success: true,
                         message: "Signed in sucessfully",
                         email: user.email,
                         _id: user._id,
                         name: user.name,
                         url: user.url,
                         mobileNo: user.mobile_no,
                         accessToken: tokens.accessToken,
                         refreshToken: tokens.refreshToken,
                    };
               }
          } catch (error: any) {
               console.log(error.message);
               return {
                    success: false,
                    message: "Sign In Failed",
                    email: null,
                    _id: null,
                    name: "",
                    url: "",
                    mobileNo: "",
                    accessToken: null,
                    refreshToken: null,
               };
          }
     }
     //user edit profile to db
     async editProfile(data: IUpdateProfile): Promise<Partial<IUser | null>> {
          try {
               const status = await this.userRepository.updateUserWithId(data);
               if (!status) {
                    return null;
               } else {
                    return status;
               }
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     async getUserData(id: string): Promise<Partial<IUser | null>> {
          try {
               const status = await this.userRepository.getUserDataWithId(id);
               if (!status) {
                    return null;
               } else {
                    return status;
               }
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     async forgotPasswordVerify(email: string): Promise<IResponse> {
          try {
               const userData = await this.userRepository.findUserByEmail(email);
               if (!userData) {
                    return {
                         success: false,
                         message: "Mail not registered as user",
                         data: null,
                    };
               }
               if (userData?.google_id) {
                    return {
                         success: false,
                         message: "Please Sign in with your google account",
                         data: null,
                    };
               }
               const otp = generateOtp(); //utility function generates otp

               const mail = await sentMail(
                    email,
                    "Forgot Password Verification",
                    `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`
               ); //this utility function sends otp through mail

               if (mail) {
                    // works if mail is sucessfully sent

                    const hashedOtp = await hashOtp(otp); // this utility function hash otp

                    const otpStatus = await this.otpRepository.storeOtp(hashedOtp, userData._id); //stores otp in the database

                    return {
                         success: true,
                         message: "Mail sent successfully",
                         data: userData.email,
                    };
               }
               return {
                    success: false,
                    message: "Failed to verify mail",
                    data: null,
               };
          } catch (error: any) {
               console.log(error.message);
               return {success: false, message: "Couldnt verify mail", data: null};
          }
     }
}

export default UserService;
