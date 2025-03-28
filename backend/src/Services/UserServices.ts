import IUserService from "../Interfaces/User/UserServiceInterface";
import { ISlotFetch, IUpdateProfile, SignUp } from "../Interfaces/User/SignUpInterface";
import { ISignIn } from "../Interfaces/User/SignUpInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import { generateOtp, hashOtp, compareOtps } from "../Utils/GenerateOtp";
import { sentMail } from "../Utils/SendMail";
import { ObjectId } from "mongoose";
import { hashPassword, comparePasswords } from "../Utils/HashPassword";
import { generateTokens } from "../Utils/GenerateTokens";
import { verifyToken } from "../Utils/CheckToken";
import { oAuth2Client } from "../Utils/GoogleConfig";
import axios from "axios";
import { IUser } from "../Models/UserModels/UserModel";
import { IAddAddress } from "../Interfaces/User/SignUpInterface";
import { IResponse } from "./AdminServices";
import IOtpRepository from "../Interfaces/Otp/OtpRepositoryInterface";
import { IBookingRequestData, IReviewData } from "../Interfaces/User/SignUpInterface";
import { IAddressRepository } from "../Interfaces/Address/IAddressRepository";
import IScheduleRepository from "../Interfaces/Schedule/ScheduleRepositoryInterface";
import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import INotificationRepository from "../Interfaces/Notification/INotificationRepository";
import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import { createPaymentIntent } from "../Utils/stripeService";
import IChatRepository from "../Interfaces/Chat/IChatRepository";
import IReviewRepository from "../Interfaces/Review/IReviewRepository";
import { uploadImages } from "../Utils/Cloudinary";
import { IReportData } from "../Interfaces/Report/IReport";
import IReportRepository from "../Interfaces/Report/IReportRepository";
import { sendNotfication } from "../Utils/Socket";
import {
    AuthMessages,
    PasswordMessages,
    AddressMessages,
    SlotMessages,
    BookingMessages,
    PaymentMessages,
    ChatMessages,
    ReviewMessages,
    ReportMessages,
    NotificationMessages,
    GeneralMessages,
} from "../Constants/Messages";

// Interface definitions remain unchanged
export interface ISignUpResponse {
    success: boolean;
    message: string;
    email: string | null;
}

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

export interface IOtpResponse {
    success: boolean;
    message: string;
}

export interface IRefreshTokenResponse {
    accessToken: string | null;
    message: string;
}

class UserService implements IUserService {
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private addressRepository: IAddressRepository,
        private scheduleRepository: IScheduleRepository,
        private bookingRepository: IBookingRepository,
        private paymentRepository: IPaymentRepository,
        private chatRepository: IChatRepository,
        private reviewRepository: IReviewRepository,
        private reportRepository: IReportRepository,
        private notificationRepository: INotificationRepository
    ) {}

    async createUser(userData: SignUp): Promise<ISignUpResponse | null> {
        try {
            const exists = await this.userRepository.findUserByEmail(userData.email);

            if (!exists) {
                const hashedPassword = await hashPassword(userData.password);
                userData.password = hashedPassword;

                const status = await this.userRepository.insertUser({
                    ...userData,
                    google_id: null,
                    url: "",
                });

                if (status) {
                    const otpStatus = await this.otpSend(status.email, status._id);

                    if (otpStatus) {
                        return {
                            success: true,
                            message: AuthMessages.SIGN_UP_SUCCESS,
                            email: status.email,
                        };
                    } else {
                        return {
                            success: false,
                            message: AuthMessages.EMAIL_OTP_FAILURE,
                            email: status.email,
                        };
                    }
                } else {
                    return {
                        success: false,
                        message: AuthMessages.SIGN_UP_FAILURE,
                        email: null,
                    };
                }
            } else {
                return {
                    success: false,
                    message: AuthMessages.DUPLICATE_EMAIL,
                    email: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    async otpSend(email: string, id: ObjectId): Promise<boolean> {
        try {
            const otp = generateOtp();

            const mail = await sentMail(
                email,
                "Fixify - OTP Verification",
                `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fixify - OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    color: #333333;
                }
                .content h2 {
                    font-size: 20px;
                    margin-bottom: 10px;
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.6;
                }
                .otp-code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    text-align: center;
                    margin: 20px 0;
                }
                .footer {
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                    color: #666666;
                }
                .footer a {
                    color: #007bff;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Fixify</h1>
                </div>
                <div class="content">
                    <h2>Verify Your Account</h2>
                    <p>Dear User,</p>
                    <p>Thank you for choosing Fixify! To complete your account verification, please use the following One-Time Password (OTP):</p>
                    <div class="otp-code">${otp}</div>
                    <p>This code is valid for <b>2 minutes</b>. Please do not share this code with anyone for security reasons.</p>
                    <p>If you did not request this OTP, please ignore this email or contact our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                    <p>Best regards,<br>The Fixify Team</p>
                </div>
                <div class="footer">
                    <p>© 2025 Fixify. All rights reserved.</p>
                    <p><a href=${process.env.FRONT_END_URL}>Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>`
            );

            if (mail) {
                const hashedOtp = await hashOtp(otp);
                const otpStatus = await this.otpRepository.storeOtp(hashedOtp, id);
                return otpStatus ? true : false;
            }
            return mail;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    async otpResend(email: string): Promise<boolean> {
        try {
            const data = await this.userRepository.findUserByEmail(email);

            if (data) {
                const otp = generateOtp();

                const mail = await sentMail(
                    email,
                    "Fixify - OTP Verification",
                    `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Fixify - OTP Verification</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 0;
                  }
                  .email-container {
                      max-width: 600px;
                      margin: 20px auto;
                      background-color: #ffffff;
                      border-radius: 8px;
                      overflow: hidden;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                      background-color: #007bff;
                      color: #ffffff;
                      text-align: center;
                      padding: 20px;
                  }
                  .header h1 {
                      margin: 0;
                      font-size: 24px;
                  }
                  .content {
                      padding: 20px;
                      color: #333333;
                  }
                  .content p {
                      font-size: 16px;
                      line-height: 1.6;
                  }
                  .otp-code {
                      font-size: 24px;
                      font-weight: bold;
                      color: #007bff;
                      text-align: center;
                      margin: 20px 0;
                  }
                  .footer {
                      background-color: #f4f4f4;
                      text-align: center;
                      padding: 10px;
                      font-size: 14px;
                      color: #666666;
                  }
                  .footer a {
                      color: #007bff;
                      text-decoration: none;
                  }
              </style>
          </head>
          <body>
              <div class="email-container">
                  <div class="header">
                      <h1>Fixify</h1>
                  </div>
                  <div class="content">
                      <p>Dear User,</p>
                      <p>To verify your Fixify account, please enter the following One-Time Password (OTP):</p>
                      <div class="otp-code">${otp}</div>
                      <p>This code expires in <b>2 minutes</b>. Please do not share this code with anyone.</p>
                      <p>If you did not request this OTP, please ignore this email or contact our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                      <p>Best regards,<br>The Fixify Team</p>
                  </div>
                  <div class="footer">
                      <p>© 2025 Fixify. All rights reserved.</p>
                      <p><a href=${process.env.FRONT_END_URL}>Visit our website</a></p>
                  </div>
              </div>
          </body>
          </html>`
                );

                if (mail) {
                    const hashedOtp = await hashOtp(otp);
                    const otpStatus = await this.otpRepository.storeOtp(hashedOtp, data._id);
                    return otpStatus ? true : false;
                }
                return mail;
            }

            return false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    async otpCheck(otp: string, email: string): Promise<IOtpResponse> {
        try {
            const user = await this.userRepository.findUserByEmail(email);

            if (user) {
                const data = await this.userRepository.findOtpWithId(user._id);

                if (data?.otp[0]?.value) {
                    const otpStatus = await compareOtps(otp, data.otp[0].value);

                    if (otpStatus) {
                        const verified = await this.userRepository.verifyUser(user._id);
                        return { success: true, message: AuthMessages.OTP_VERIFIED_SUCCESS };
                    } else {
                        return { success: false, message: AuthMessages.OTP_INVALID };
                    }
                } else if (!data?.otp.length) {
                    return { success: false, message: AuthMessages.OTP_EXPIRED };
                }
            }
            return {
                success: false,
                message: GeneralMessages.USER_NOT_FOUND,
            };
        } catch (error: any) {
            console.log(error.message);
            return { success: false, message: AuthMessages.OTP_ERROR };
        }
    }

    async authenticateUser(userData: ISignIn): Promise<ISignInResponse | null> {
        try {
            const exists = await this.userRepository.findUserByEmail(userData.email);

            if (exists) {
                if (exists.is_blocked) {
                    return {
                        success: false,
                        message: AuthMessages.ACCOUNT_BLOCKED,
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
                if (exists.google_id) {
                    return {
                        success: false,
                        message: AuthMessages.SIGN_IN_WITH_GOOGLE,
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }

                const passwordStatus = await comparePasswords(userData.password, exists.password);

                if (passwordStatus) {
                    if (exists.is_verified) {
                        const tokens = generateTokens(exists._id.toString(), exists.email, "user");

                        return {
                            success: true,
                            message: AuthMessages.SIGN_IN_SUCCESS,
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
                            mobileNo: exists.mobile_no,
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                        };
                    } else {
                        const status = await this.otpResend(exists.email);
                        return {
                            success: false,
                            message: AuthMessages.OTP_NOT_VERIFIED,
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
                    return {
                        success: false,
                        message: AuthMessages.INVALID_CREDENTIALS,
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
                return {
                    success: false,
                    message: AuthMessages.ACCOUNT_DOES_NOT_EXIST,
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

    async refreshTokenCheck(token: string): Promise<IRefreshTokenResponse> {
        try {
            const tokenStatus = await verifyToken(token);

            if (tokenStatus.id && tokenStatus.email && tokenStatus.role) {
                const tokens = generateTokens(tokenStatus.id, tokenStatus.email, tokenStatus.role);
                return {
                    accessToken: tokens.accessToken,
                    message: tokenStatus.message,
                };
            }

            return {
                accessToken: null,
                message: tokenStatus.message,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                accessToken: null,
                message: AuthMessages.TOKEN_ERROR,
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

            const { email, name, picture, id } = userRes.data;

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
                        message: AuthMessages.SIGN_IN_SUCCESS,
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
                    message: AuthMessages.GOOGLE_SIGN_IN_FAILED,
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
                        message: AuthMessages.ACCOUNT_BLOCKED,
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
                    message: AuthMessages.SIGN_IN_SUCCESS,
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
                message: AuthMessages.GOOGLE_SIGN_IN_FAILED,
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

    async editProfile(
        data: IUpdateProfile,
        image: Express.Multer.File | null
    ): Promise<Partial<IUser | null>> {
        try {
            let image_url: string[] = [];

            if (image) {
                image_url = await uploadImages([image]);
                if (image_url.length === 0) {
                    return null;
                }
            }

            const status = await this.userRepository.updateUserWithId({
                ...data,
                url: image_url[0],
            });
            if (!status) {
                return null;
            } else {
                await sendNotfication(data.id, "Profile was updated", "Profile");
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
                    message: PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED,
                    data: null,
                };
            }
            if (userData?.google_id) {
                return {
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_GOOGLE,
                    data: null,
                };
            }
            const otp = generateOtp();

            const mail = await sentMail(
                email,
                "Fixify - Forgot Password Verification",
                `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fixify - Forgot Password Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    color: #333333;
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.6;
                }
                .otp-code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    text-align: center;
                    margin: 20px 0;
                }
                .footer {
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                    color: #666666;
                }
                .footer a {
                    color: #007bff;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Fixify</h1>
                </div>
                <div class="content">
                    <p>Dear User,</p>
                    <p>To reset your password, please enter the following One-Time Password (OTP):</p>
                    <div class="otp-code">${otp}</div>
                    <p>This code expires in <b>2 minutes</b>. Please do not share this code with anyone.</p>
                    <p>If you did not request this OTP, please ignore this email or contact our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                    <p>Best regards,<br>The Fixify Team</p>
                </div>
                <div class="footer">
                    <p>© 2024 Fixify. All rights reserved.</p>
                    <p><a href=${process.env.FRONT_END_URL}>Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>`
            );

            if (mail) {
                const hashedOtp = await hashOtp(otp);
                const otpStatus = await this.otpRepository.storeOtp(hashedOtp, userData._id);
                return {
                    success: true,
                    message: PasswordMessages.MAIL_SENT_SUCCESS,
                    data: userData.email,
                };
            }
            return {
                success: false,
                message: PasswordMessages.MAIL_VERIFY_FAILED,
                data: null,
            };
        } catch (error: any) {
            console.log(error.message);
            return { success: false, message: PasswordMessages.COULDNT_VERIFY_MAIL, data: null };
        }
    }

    async passworOtpCheck(otp: string, email: string): Promise<IOtpResponse> {
        try {
            const user = await this.userRepository.findUserByEmail(email);

            if (user) {
                const data = await this.userRepository.findOtpWithId(user._id);

                if (data?.otp[0]?.value) {
                    const otpStatus = await compareOtps(otp, data.otp[0].value);

                    if (otpStatus) {
                        return { success: true, message: AuthMessages.OTP_VERIFIED_SUCCESS };
                    } else {
                        return { success: false, message: AuthMessages.OTP_INVALID };
                    }
                } else if (!data?.otp.length) {
                    return { success: false, message: AuthMessages.OTP_EXPIRED };
                }
            }
            return {
                success: false,
                message: GeneralMessages.ACCOUNT_NOT_FOUND,
            };
        } catch (error: any) {
            console.log(error.message);
            return { success: false, message: AuthMessages.OTP_ERROR };
        }
    }

    async changePassword(email: string, password: string): Promise<IResponse> {
        try {
            const hashedPassword = await hashPassword(password);

            const updateStatus = await this.userRepository.updatePassword(email, hashedPassword);

            return updateStatus
                ? {
                      success: true,
                      message: PasswordMessages.RESET_PASSWORD_SUCCESS,
                      data: null,
                  }
                : {
                      success: false,
                      message: PasswordMessages.RESET_PASSWORD_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PasswordMessages.RESET_PASSWORD_FAILED,
                data: null,
            };
        }
    }

    async verifyPassword(id: string, password: string): Promise<IResponse> {
        try {
            const data = await this.userRepository.getUserDataWithId(id);

            if (data?.password) {
                const status = await comparePasswords(password, data.password);
                return status
                    ? {
                          success: true,
                          message: PasswordMessages.CONFIRM_PASSWORD_SUCCESS,
                          data: null,
                      }
                    : {
                          success: false,
                          message: PasswordMessages.INCORRECT_PASSWORD,
                          data: null,
                      };
            } else {
                return {
                    success: false,
                    message: PasswordMessages.INVALID_ID,
                    data: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PasswordMessages.CONFIRM_PASSWORD_FAILED,
                data: null,
            };
        }
    }

    async createAddress(address: IAddAddress): Promise<IResponse> {
        try {
            const addressCount = await this.addressRepository.countAddresses(address.id);

            if (addressCount === null) {
                return {
                    success: false,
                    message: AddressMessages.CREATE_ADDRESS_FAILED,
                    data: null,
                };
            } else {
                if (addressCount < 3) {
                    const exists = await this.addressRepository.checkDuplicate(address);

                    if (exists === null) {
                        return {
                            success: false,
                            message: AddressMessages.CREATE_ADDRESS_FAILED,
                            data: null,
                        };
                    } else if (exists) {
                        return {
                            success: false,
                            message: AddressMessages.ADDRESS_ALREADY_ADDED,
                            data: null,
                        };
                    } else {
                        const response = await this.addressRepository.createAddress(address);

                        return response
                            ? {
                                  success: true,
                                  message: AddressMessages.CREATE_ADDRESS_SUCCESS,
                                  data: null,
                              }
                            : {
                                  success: false,
                                  message: AddressMessages.CREATE_ADDRESS_FAILED,
                                  data: null,
                              };
                    }
                } else {
                    return {
                        success: false,
                        message: AddressMessages.ADDRESS_LIMIT_REACHED,
                        data: null,
                    };
                }
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: AddressMessages.CREATE_ADDRESS_FAILED,
                data: null,
            };
        }
    }

    async findAddresses(userId: string): Promise<IResponse> {
        try {
            const addresses = await this.addressRepository.fetchAllAddress(userId);
            if (addresses === null) {
                return {
                    success: false,
                    message: AddressMessages.GET_ADDRESSES_FAILED,
                    data: null,
                };
            } else {
                return {
                    success: true,
                    message: AddressMessages.GET_ADDRESSES_SUCCESS,
                    data: addresses,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: AddressMessages.GET_ADDRESSES_FAILED,
                data: null,
            };
        }
    }

    async changeAddressStatus(id: string): Promise<IResponse> {
        try {
            const status = await this.addressRepository.deleteAddress(id);

            return status
                ? {
                      success: true,
                      message: AddressMessages.DELETE_ADDRESS_SUCCESS,
                      data: null,
                  }
                : {
                      success: false,
                      message: AddressMessages.DELETE_ADDRESS_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: AddressMessages.DELETE_ADDRESS_FAILED,
                data: null,
            };
        }
    }

    async getAddress(addressId: string): Promise<IResponse> {
        try {
            const address = await this.addressRepository.fetchAddress(addressId);

            if (address === null) {
                return {
                    success: false,
                    message: AddressMessages.GET_ADDRESS_FAILED,
                    data: null,
                };
            } else {
                return {
                    success: true,
                    message: AddressMessages.GET_ADDRESS_SUCCESS,
                    data: address,
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: AddressMessages.GET_ADDRESS_FAILED,
                data: null,
            };
        }
    }

    async editAddress(address: IAddAddress, id: string): Promise<IResponse> {
        try {
            const updatedStatus = await this.addressRepository.updateAddress(address, id);

            return updatedStatus
                ? {
                      success: true,
                      message: AddressMessages.UPDATE_ADDRESS_SUCCESS,
                      data: null,
                  }
                : {
                      success: false,
                      message: AddressMessages.UPDATE_ADDRESS_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: AddressMessages.UPDATE_ADDRESS_FAILED,
                data: null,
            };
        }
    }

    async getSlots(data: ISlotFetch): Promise<IResponse> {
        try {
            const slots = await this.scheduleRepository.findSlots(data);

            return slots.success
                ? {
                      success: true,
                      message: SlotMessages.FETCH_SLOTS_SUCCESS,
                      data: slots.data,
                  }
                : {
                      success: false,
                      message: SlotMessages.FETCH_SLOTS_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: SlotMessages.FETCH_SLOTS_ERROR,
                data: null,
            };
        }
    }

    async requestBooking(bookingData: IBookingRequestData): Promise<IResponse> {
        try {
            const time = new Date();

            const exists = await this.scheduleRepository.findBookingRequest(
                bookingData.user_id,
                bookingData.slot_id,
                bookingData.time,
                bookingData.date
            );

            if (exists.success) {
                return { success: false, message: exists.message, data: null };
            }

            const slots = await this.scheduleRepository.bookingRequestAdd(bookingData);
            if (slots.success) {
                await sendNotfication(
                    bookingData.technician_id,
                    `New booking request at ${bookingData.time}`,
                    "Booking request"
                );
            }
            return slots.success
                ? {
                      success: true,
                      message: slots.message,
                      data: slots.data,
                  }
                : {
                      success: false,
                      message: slots.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: SlotMessages.REQUEST_SLOTS_ERROR,
                data: null,
            };
        }
    }

    async fetchBookings(id: string, page: number): Promise<IResponse> {
        try {
            const bookingStatus = await this.bookingRepository.getBookingsWithUserId(id, page);

            return bookingStatus.success
                ? {
                      success: true,
                      message: bookingStatus.message,
                      data: bookingStatus.data,
                  }
                : {
                      success: false,
                      message: bookingStatus.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: BookingMessages.GET_BOOKINGS_SUCCESS,
                data: null,
            };
        }
    }

    async fetchBookingDetail(id: string): Promise<IResponse> {
        try {
            const response = await this.bookingRepository.getBookingDetails(id);

            return response.success
                ? {
                      success: true,
                      message: response.message,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: response.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: BookingMessages.GET_BOOKING_DETAILS_SUCCESS,
                data: null,
            };
        }
    }

    async processOnlinePayment(payment_id: string, amount: number): Promise<IResponse> {
        try {
            const response = await createPaymentIntent(amount);

            if (!response.success || !response.clientSecret) {
                return {
                    success: false,
                    message: response.message || PaymentMessages.PAYMENT_INTENT_FAILED,
                    data: null,
                };
            }

            const site_fee = Math.floor((amount * 10) / 100);

            const status = await this.paymentRepository.updatePaymentStatus(payment_id, site_fee);

            if (!status) {
                return {
                    success: false,
                    message: PaymentMessages.CREATE_PAYMENT_FAILED,
                    data: null,
                };
            }

            return {
                success: true,
                message: PaymentMessages.CREATE_PAYMENT_SUCCESS,
                data: response,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PaymentMessages.CREATE_PAYMENT_FAILED,
                data: null,
            };
        }
    }

    async cancelBooking(booking_id: string): Promise<IResponse> {
        try {
            const booking = await this.bookingRepository.getBookingById(booking_id);
            if (!booking.success) {
                return { success: false, message: BookingMessages.BOOKING_NOT_FOUND, data: null };
            }

            const slotTime = new Date(booking.data.time);
            const currentTime = new Date();

            const threeHoursBeforeSlot = new Date(slotTime.getTime() - 3 * 60 * 60 * 1000);

            if (currentTime > threeHoursBeforeSlot) {
                return {
                    success: false,
                    message: BookingMessages.CANCEL_BOOKING_TIME_ERROR,
                    data: null,
                };
            }

            const updatedBooking = await this.bookingRepository.updateBookingStatus(
                booking_id,
                "cancelled"
            );

            await sendNotfication(
                booking.data.provider_id,
                `Booking at ${booking.data.time} has been cancelled`,
                "Booking"
            );

            return {
                success: true,
                message: BookingMessages.CANCEL_BOOKING_SUCCESS,
                data: updatedBooking,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    async fetchChat(room_id: string): Promise<IResponse> {
        try {
            const chatResponse = await this.chatRepository.fetchChats(room_id);

            return chatResponse.success
                ? {
                      success: true,
                      message: chatResponse.message,
                      data: chatResponse.data,
                  }
                : {
                      success: false,
                      message: chatResponse.message,
                      data: null,
                  };
        } catch (error: any) {
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    async processReviewCreation(
        reviewData: IReviewData,
        reviewImages: Express.Multer.File[]
    ): Promise<IResponse> {
        try {
            const image_urls = await uploadImages(reviewImages);

            if (image_urls.length === 0) {
                return {
                    success: false,
                    message: ReviewMessages.IMAGE_STORAGE_FAILED,
                    data: null,
                };
            }

            const duplicateExists = await this.reviewRepository.duplicateReviewExists(
                reviewData.booking_id
            );

            if (duplicateExists.success) {
                return {
                    success: false,
                    message: ReviewMessages.REVIEW_ALREADY_ADDED,
                    data: null,
                };
            }

            const response = await this.reviewRepository.saveReview(reviewData, image_urls);

            if (response.success) {
                const updateStatus = await this.bookingRepository.updateReviewDetails(
                    response.data._id,
                    reviewData.booking_id
                );

                if (!updateStatus.success) {
                    return {
                        success: updateStatus.success,
                        message: updateStatus.message,
                        data: null,
                    };
                }
            }

            return {
                success: response.success,
                message: response.message,
                data: null,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    async report(data: IReportData): Promise<IResponse> {
        try {
            const duplicateExists = await this.reportRepository.duplicateReport(data);

            if (duplicateExists) {
                return {
                    success: false,
                    message: ReportMessages.REPORT_ALREADY_EXISTS,
                    data: null,
                };
            }

            const reportResponse = await this.reportRepository.addReport(data);
            if (reportResponse) {
                await sendNotfication(data.reporter_id, "Report has been sent", "report");
            }
            return reportResponse
                ? {
                      success: true,
                      message: ReportMessages.REPORT_SUCCESS,
                      data: null,
                  }
                : {
                      success: false,
                      message: ReportMessages.REPORT_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    async fetchUnreadNotificationsCount(id: string): Promise<IResponse> {
        try {
            const response = await this.notificationRepository.unreadNotificationCount(id);

            return response.success
                ? {
                      success: true,
                      message: NotificationMessages.FETCH_COUNT_SUCCESS,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: NotificationMessages.FETCH_COUNT_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    async fetchNotifications(id: string, page: number): Promise<IResponse> {
        try {
            const response = await this.notificationRepository.getNotifications(id, page);

            return response.success
                ? {
                      success: true,
                      message: NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: NotificationMessages.FETCH_NOTIFICATIONS_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }

    async markNotification(id: string): Promise<IResponse> {
        try {
            const response = await this.notificationRepository.markNotification(id);

            return response.success
                ? {
                      success: true,
                      message: NotificationMessages.MARK_NOTIFICATION_SUCCESS,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: NotificationMessages.MARK_NOTIFICATION_FAILED,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            };
        }
    }
}

export default UserService;
