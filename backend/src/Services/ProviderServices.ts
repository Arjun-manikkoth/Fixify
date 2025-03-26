import { ObjectId } from "mongoose";
import axios from "axios";
import { generateOtp, hashOtp, compareOtps } from "../Utils/GenerateOtp";
import { oAuth2Client } from "../Utils/GoogleConfig";
import { sentMail } from "../Utils/SendMail";
import { hashPassword, comparePasswords } from "../Utils/HashPassword";
import { generateTokens } from "../Utils/GenerateTokens";
import { verifyToken } from "../Utils/CheckToken";
import IProviderService from "../Interfaces/Provider/ProviderServiceInterface";
import {
    IProviderDashboardFilter,
    IProviderRegistrationParsed,
    IProviderWithService,
    SignUp,
} from "../Interfaces/Provider/SignIn";
import { ISignIn } from "../Interfaces/Provider/SignIn";
import { IUpdateProfile } from "../Interfaces/Provider/SignIn";
import { IServices } from "../Models/ProviderModels/ServiceModel";
import { IProvider } from "../Models/ProviderModels/ProviderModel";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import IServiceRepository from "../Interfaces/Service/IServiceRepository";
import IOtpRepository from "../Interfaces/Otp/OtpRepositoryInterface";
import IApprovalRepository from "../Interfaces/Approval/ApprovalRepositoryInterface";
import { IAddress } from "../Interfaces/Provider/SignIn";
import IScheduleRepository from "../Interfaces/Schedule/ScheduleRepositoryInterface";
import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import IChatRepository from "../Interfaces/Chat/IChatRepository";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import IReportRepository from "../Interfaces/Report/IReportRepository";
import INotificationRepository from "../Interfaces/Notification/INotificationRepository";
import { uploadImages } from "../Utils/Cloudinary";
import { IReportData } from "../Interfaces/Report/IReport";
import { sendNotfication } from "../Utils/Socket";
import {
    AuthMessages,
    ProfileMessages,
    PasswordMessages,
    ServiceMessages,
    ScheduleMessages,
    BookingMessages,
    PaymentMessages,
    ChatMessages,
    ReportMessages,
    NotificationMessages,
    GeneralMessages,
    tokenMessages,
    DashboardMessages,
} from "../Constants/Messages";

interface IResponse {
    success: boolean;
    message: string;
    data: string | null;
}
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

class ProviderService implements IProviderService {
    constructor(
        private providerRepository: IProviderRepository,
        private otpRepository: IOtpRepository,
        private serviceRepository: IServiceRepository,
        private approvalRepository: IApprovalRepository,
        private scheduleRepository: IScheduleRepository,
        private bookingRepository: IBookingRepository,
        private paymentRepository: IPaymentRepository,
        private chatRepository: IChatRepository,
        private userRepository: IUserRepository,
        private reportRepository: IReportRepository,
        private notificationRepository: INotificationRepository
    ) {}

    async getServices(): Promise<IServices[] | null> {
        try {
            const services = await this.serviceRepository.getAllServices();

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
            const exists = await this.providerRepository.findProviderByEmail(data.email);

            if (!exists) {
                const hashedPassword = await hashPassword(data.password);
                data.password = hashedPassword;

                const status = await this.providerRepository.insertProvider({
                    userName: data.userName,
                    email: data.email,
                    mobileNo: data.mobileNo,
                    password: data.password,
                    url: "",
                    passwordConfirm: data.passwordConfirm,
                    service_id: data.service_id,
                    google_id: null,
                });

                if (status) {
                    const otpStatus = await this.otpSend(status.email, status._id);

                    if (otpStatus) {
                        return {
                            success: true,
                            message: AuthMessages.SIGN_UP_SUCCESS, // "Signed up successfully"
                            email: status.email,
                        };
                    } else {
                        return {
                            success: false,
                            message: AuthMessages.EMAIL_OTP_FAILURE, // "Email OTP Failure"
                            email: status.email,
                        };
                    }
                } else {
                    return {
                        success: false,
                        message: AuthMessages.SIGN_UP_FAILED, // "Sign up failed"
                        email: null,
                    };
                }
            } else {
                return {
                    success: false,
                    message: AuthMessages.DUPLICATE_EMAIL, // "Duplicate email"
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
                            <p><a href="https://fixify.com">Visit our website</a></p>
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
            const data = await this.providerRepository.findProviderByEmail(email);

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
                                <p><a href="https://fixify.com">Visit our website</a></p>
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
            const provider = await this.providerRepository.findProviderByEmail(email);

            if (provider) {
                const data = await this.providerRepository.findOtpWithId(provider._id);

                if (data?.otp[0]?.value) {
                    const otpStatus = await compareOtps(otp, data.otp[0].value);

                    if (otpStatus) {
                        const verified = await this.providerRepository.verifyProvider(provider._id);
                        return { success: true, message: AuthMessages.OTP_VERIFIED_SUCCESS }; // "Otp verified successfully"
                    } else {
                        return { success: false, message: AuthMessages.OTP_INVALID }; // "Invalid Otp"
                    }
                } else if (!data?.otp.length) {
                    return { success: false, message: AuthMessages.OTP_EXPIRED }; // "Otp is expired"
                }
            }
            return {
                success: false,
                message: GeneralMessages.PROVIDER_NOT_FOUND, // "Provider not found"
            };
        } catch (error: any) {
            console.log(error.message);
            return { success: false, message: AuthMessages.OTP_ERROR }; // "Otp error"
        }
    }

    async authenticateProvider(data: ISignIn): Promise<ISignInResponse | null> {
        try {
            const exists = await this.providerRepository.findProviderByEmail(data.email);

            if (exists) {
                if (exists.is_blocked) {
                    return {
                        success: false,
                        message: AuthMessages.ACCOUNT_BLOCKED, // "Account blocked by admin"
                        service_id: null,
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
                        message: AuthMessages.SIGN_IN_WITH_GOOGLE, // "Please Sign in With Google"
                        email: "",
                        _id: null,
                        service_id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }

                const passwordStatus = await comparePasswords(data.password, exists.password);

                if (passwordStatus) {
                    if (exists.is_verified) {
                        const tokens = generateTokens(
                            exists._id.toString(),
                            exists.email,
                            "provider"
                        );
                        return {
                            success: true,
                            message: AuthMessages.SIGN_IN_SUCCESS, // "Signed in successfully"
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
                            service_id: exists.service_id,
                            mobileNo: exists.mobile_no,
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                        };
                    } else {
                        const status = await this.otpResend(exists.email);
                        return {
                            success: false,
                            message: AuthMessages.OTP_NOT_VERIFIED, // "Didn't complete otp verification"
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
                            service_id: exists.service_id,
                            mobileNo: exists.mobile_no,
                            accessToken: null,
                            refreshToken: null,
                        };
                    }
                } else {
                    return {
                        success: false,
                        message: AuthMessages.INVALID_CREDENTIALS, // "Invalid Credentials"
                        email: null,
                        _id: null,
                        name: "",
                        service_id: null,
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
            } else {
                return {
                    success: false,
                    message: AuthMessages.ACCOUNT_DOES_NOT_EXIST, // "Account does not exist"
                    email: null,
                    name: "",
                    mobileNo: "",
                    _id: null,
                    url: "",
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

    async refreshTokenCheck(token: string): Promise<IRefreshTokenResponse> {
        try {
            const tokenStatus = await verifyToken(token);

            if (tokenStatus.id && tokenStatus.email && tokenStatus.role) {
                const tokens = generateTokens(tokenStatus.id, tokenStatus.email, tokenStatus.role);
                return {
                    accessToken: tokens.accessToken,
                    message: tokenMessages.ACCESS_TOKEN_SUCCESS, // "Access token sent successfully"
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
                message: tokenMessages.TOKEN_ERROR, // "Token error"
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

            const provider = await this.providerRepository.findProviderByEmail(email);

            if (!provider) {
                const saveProvider = await this.providerRepository.insertProvider({
                    userName: name,
                    email: email,
                    password: "",
                    service_id: null,
                    passwordConfirm: "",
                    url: picture,
                    mobileNo: "",
                    google_id: id,
                });

                if (saveProvider) {
                    const tokens = generateTokens(saveProvider._id.toString(), email, "provider");
                    return {
                        success: true,
                        message: AuthMessages.SIGN_IN_SUCCESS, // "Signed in successfully"
                        email: saveProvider.email,
                        _id: saveProvider._id,
                        name: saveProvider.name,
                        url: saveProvider.url,
                        service_id: saveProvider.service_id,
                        mobileNo: "",
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    };
                }
                return {
                    success: false,
                    message: AuthMessages.GOOGLE_SIGN_IN_FAILED, // "Google Sign In failed"
                    email: null,
                    _id: null,
                    service_id: null,
                    name: "",
                    url: "",
                    mobileNo: "",
                    accessToken: null,
                    refreshToken: null,
                };
            } else {
                if (provider.is_blocked) {
                    return {
                        success: false,
                        message: AuthMessages.ACCOUNT_BLOCKED, // "Account blocked by admin"
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        service_id: null,
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }

                const tokens = generateTokens(provider._id.toString(), email, "provider");
                return {
                    success: true,
                    message: AuthMessages.SIGN_IN_SUCCESS, // "Signed in successfully"
                    email: provider.email,
                    _id: provider._id,
                    name: provider.name,
                    url: provider.url,
                    service_id: provider.service_id,
                    mobileNo: provider.mobile_no,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: AuthMessages.SIGN_IN_FAILED, // "Sign In Failed"
                email: null,
                _id: null,
                name: "",
                service_id: null,
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
    ): Promise<Partial<IProvider | null>> {
        try {
            let image_url: string[] = [];

            if (image) {
                image_url = await uploadImages([image]);

                if (image_url.length === 0) {
                    return null;
                }
            }

            const status = await this.providerRepository.updateProviderWithId({
                ...data,
                url: image_url[0],
            });
            if (!status) {
                return null;
            } else {
                await sendNotfication(data.id, ProfileMessages.UPDATE_PROFILE_SUCCESS, "Profile"); // "Profile was updated" -> closest match
                return status;
            }
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    async getProfileData(id: string): Promise<Partial<IProviderWithService> | null> {
        try {
            const status = await this.providerRepository.fetchProviderProfileData(id);
            return status;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    async registerProvider(data: IProviderRegistrationParsed): Promise<IOtpResponse> {
        try {
            const exists = await this.approvalRepository.approvalExists(data.provider_id);

            if (!exists) {
                let { expertise_id } = data;

                if (!expertise_id) {
                    const providerData = await this.providerRepository.getProviderDataWithId(
                        data.provider_id
                    );
                    if (providerData?.service_id) {
                        expertise_id = providerData.service_id.toString();
                    }
                }

                const urls = await uploadImages([...data.aadharImage, ...data.workImages]);

                if (urls.length === 0) {
                    return {
                        success: false,
                        message: ProfileMessages.UPDATE_PROFILE_FAILED, // "Failed to update images" -> closest match
                    };
                }

                const status = await this.approvalRepository.providerApprovalRegistration({
                    provider_id: data.provider_id,
                    description: data.description,
                    aadharUrl: urls[0],
                    workImageUrls: urls.slice(1),
                    expertise_id,
                });

                if (status) {
                    return {
                        success: true,
                        message: ProfileMessages.REGISTER_PROFILE_SUCCESS, // "Successfully registered request" -> closest match
                    };
                } else {
                    return {
                        success: false,
                        message: ProfileMessages.REGISTER_PROFILE_FAILED, // "Cannot register at this moment"
                    };
                }
            } else {
                return {
                    success: false,
                    message: ProfileMessages.ALREADY_REQUESTED_APPROVAL, // "Already requested for approval"
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: ProfileMessages.REGISTER_PROFILE_FAILED, // "Failed to register" -> closest match
            };
        }
    }

    async forgotPasswordVerify(email: string): Promise<IResponse> {
        try {
            const userData = await this.providerRepository.findProviderByEmail(email);

            if (!userData) {
                return {
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED, // "Mail not registered"
                    data: null,
                };
            }
            if (userData?.google_id) {
                return {
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_GOOGLE, // "Please Sign in with your google account"
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
                            <p><a href="https://fixify.com">Visit our website</a></p>
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
                    message: PasswordMessages.FORGOT_PASSWORD_SUCCESS, // "Mail sent successfully" -> closest match
                    data: userData.email,
                };
            }
            return {
                success: false,
                message: PasswordMessages.FORGOT_PASSWORD_FAILED, // "Failed to verify mail"
                data: null,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PasswordMessages.FORGOT_PASSWORD_FAILED, // "Couldn't verify mail" -> closest match
                data: null,
            };
        }
    }

    async passworOtpCheck(otp: string, email: string): Promise<IOtpResponse> {
        try {
            const provider = await this.providerRepository.findProviderByEmail(email);

            if (provider) {
                const data = await this.providerRepository.findOtpWithId(provider._id);

                if (data?.otp[0]?.value) {
                    const otpStatus = await compareOtps(otp, data.otp[0].value);

                    if (otpStatus) {
                        return { success: true, message: AuthMessages.OTP_VERIFIED_SUCCESS }; // "Otp verified successfully"
                    } else {
                        return { success: false, message: AuthMessages.OTP_INVALID }; // "Invalid Otp"
                    }
                } else if (!data?.otp.length) {
                    return { success: false, message: AuthMessages.OTP_EXPIRED }; // "Otp is expired"
                }
            }
            return {
                success: false,
                message: GeneralMessages.ACCOUNT_NOT_FOUND, // "Account not found"
            };
        } catch (error: any) {
            console.log(error.message);
            return { success: false, message: AuthMessages.OTP_ERROR }; // "Otp error"
        }
    }

    async changePassword(email: string, password: string): Promise<IResponse> {
        try {
            const hashedPassword = await hashPassword(password);

            const updateStatus = await this.providerRepository.updatePassword(
                email,
                hashedPassword
            );
            return updateStatus
                ? {
                      success: true,
                      message: PasswordMessages.RESET_PASSWORD_SUCCESS, // "Password updated successfully"
                      data: null,
                  }
                : {
                      success: false,
                      message: PasswordMessages.RESET_PASSWORD_FAILED, // "Failed to update password"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PasswordMessages.RESET_PASSWORD_FAILED, // "Failed to update password"
                data: null,
            };
        }
    }

    async verifyPassword(id: string, password: string): Promise<IResponse> {
        try {
            const data = await this.providerRepository.getProviderDataWithId(id);

            if (data?.password) {
                const status = await comparePasswords(password, data.password);
                return status
                    ? {
                          success: true,
                          message: PasswordMessages.CONFIRM_PASSWORD_SUCCESS, // "Password verified successfully"
                          data: null,
                      }
                    : {
                          success: false,
                          message: PasswordMessages.INCORRECT_PASSWORD, // "Incorrect Password"
                          data: null,
                      };
            } else {
                return {
                    success: false,
                    message: GeneralMessages.INVALID_ID, // "Invalid id"
                    data: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PasswordMessages.CONFIRM_PASSWORD_FAILED, // "Failed to verify password"
                data: null,
            };
        }
    }

    async addSchedule(id: string, date: string, address: IAddress): Promise<IResponse> {
        try {
            const providerData = await this.providerRepository.getProviderDataWithId(id);

            if (!providerData?.is_approved) {
                return {
                    success: false,
                    message: ScheduleMessages.COMPLETE_VERIFICATION, // "Complete verification to create schedules"
                    data: null,
                };
            }
            const status = await this.scheduleRepository.createSchedule(id, date, address);

            return status
                ? {
                      success: true,
                      message: ScheduleMessages.CREATE_SCHEDULE_SUCCESS, // "Schedule created successfully"
                      data: null,
                  }
                : {
                      success: false,
                      message: ScheduleMessages.CREATE_SCHEDULE_FAILED, // "Failed to create schedule"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: ScheduleMessages.CREATE_SCHEDULE_FAILED, // "Failed to create schedule"
                data: null,
            };
        }
    }

    async getSchedule(id: string, date: string): Promise<IResponse> {
        try {
            const scheduleResponse = await this.scheduleRepository.fetchSchedule(id, date);
            if (scheduleResponse.success) {
                return {
                    success: true,
                    message: ScheduleMessages.FETCH_SCHEDULE_SUCCESS, // "Fetched schedule successfully"
                    data: scheduleResponse.data,
                };
            } else {
                return {
                    success: false,
                    message: scheduleResponse.message,
                    data: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: ScheduleMessages.FETCH_SCHEDULE_FAILED, // "Failed to fetch services" -> closest match
                data: null,
            };
        }
    }

    async getAllRequests(provider_id: string): Promise<IResponse> {
        try {
            const requests = await this.scheduleRepository.findAllRequests(provider_id);

            return requests.success
                ? {
                      success: true,
                      message: requests.message,
                      data: requests.data,
                  }
                : {
                      success: false,
                      message: requests.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                data: null,
            };
        }
    }

    async changeBookingRequestStatus(request_id: string, status: string): Promise<IResponse> {
        try {
            let updateStatus: boolean | null = null;

            if (status === "booked") {
                const requestData = await this.scheduleRepository.getBookingRequest(request_id);

                if (!requestData.success || !requestData.data || requestData.data.length === 0) {
                    return {
                        success: false,
                        message: BookingMessages.BOOKING_REQUEST_NOT_FOUND, // "Booking request not found"
                        data: null,
                    };
                }

                const request = requestData.data[0].requests.filter((each: any) => {
                    return each._id.toString() === request_id;
                });

                const bookingStatus = await this.bookingRepository.createBooking(
                    requestData.data[0],
                    request_id
                );

                await this.scheduleRepository.changeTimeSlotStatus(request_id);

                if (!bookingStatus) {
                    return {
                        success: false,
                        message: BookingMessages.CREATE_BOOKING_FAILED, // "Failed to create booking"
                        data: null,
                    };
                }

                updateStatus = await this.scheduleRepository.updateBookingRequestStatus(
                    request_id,
                    "booked"
                );

                const userData = await this.userRepository.getUserDataWithId(request[0].user_id);

                if (!userData) {
                    return {
                        success: false,
                        message: GeneralMessages.USER_NOT_FOUND, // "Failed to find user data" -> closest match
                        data: null,
                    };
                }

                const formattedTime = new Intl.DateTimeFormat("en-US", {
                    timeStyle: "short",
                }).format(new Date(request[0].time));

                const bookingDetails = {
                    date: new Date(requestData.data[0].date).toDateString(),
                    time: formattedTime,
                    providerName: requestData.data[0].technician.name,
                    bookingUrl: `https://fixify.com/users/${userData._id}/bookings/${bookingStatus._id}.`,
                };
                if (userData._id)
                    await sendNotfication(
                        userData._id.toString(),
                        BookingMessages.BOOKING_CONFIRMED, // "Your booking for ${bookingDetails.time} has been confirmed."
                        "Booking"
                    );

                await sentMail(
                    userData?.email as string,
                    "Fixify - Booking Confirmation",
                    `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Fixify - Booking Confirmation</title>
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
                            .booking-details {
                                background-color: #f9f9f9;
                                padding: 15px;
                                border-radius: 8px;
                                margin: 20px 0;
                            }
                            .booking-details p {
                                margin: 5px 0;
                            }
                            .cta-button {
                                display: inline-block;
                                margin: 20px 0;
                                padding: 10px 20px;
                                background-color: #007bff;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 5px;
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
                                <h2>Booking Confirmation</h2>
                                <p>Dear ${userData?.name},</p>
                                <p>Your booking has been successfully confirmed! 🎉 Here are the details:</p>
                
                                <div class="booking-details">
                              
                                    <p><strong>Date:</strong> ${bookingDetails.date}</p>
                                    <p><strong>Time:</strong> ${bookingDetails.time}</p>
                                    <p><strong>Provider:</strong> ${bookingDetails.providerName}</p>
              
                                </div>
                
                                <p>You can view and manage your booking details by clicking the button below:</p>
                                <a href="${bookingDetails.bookingUrl}" class="cta-button">View Booking Details</a>
                
                                <p>If you have any questions or need to make changes, feel free to contact our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                                <p>Thank you for choosing Fixify. We look forward to serving you!</p>
                                <p>Best regards,<br>The Fixify Team</p>
                            </div>
                            <div class="footer">
                                <p>© 2023 Fixify. All rights reserved.</p>
                                <p><a href="https://fixify.com">Visit our website</a></p>
                            </div>
                        </div>
                    </body>
                    </html>`
                );
            } else {
                updateStatus = await this.scheduleRepository.updateBookingRequestStatus(
                    request_id,
                    status
                );
            }

            if (!updateStatus) {
                return {
                    success: false,
                    message: BookingMessages.UPDATE_BOOKING_STATUS_FAILED, // "Failed to update booking status"
                    data: null,
                };
            }

            return {
                success: true,
                message: BookingMessages.BOOKING_COMPLETED_SUCCESS, // "Booking completed successfully"
                data: null,
            };
        } catch (error: any) {
            console.error("Error in changeBookingRequestStatus:", error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                data: null,
            };
        }
    }

    async fetchBookings(id: string, page: number): Promise<IResponse> {
        try {
            const bookingStatus = await this.bookingRepository.getBookingsWithProviderId(id, page);

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
                message: BookingMessages.FETCH_BOOKINGS_FAILED, // "Failed to fetch bookings"
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
                message: BookingMessages.FETCH_BOOKING_DETAILS_FAILED, // "Failed to fetch booking details"
                data: null,
            };
        }
    }

    async intiatePaymentRequest(id: string, amount: number, method: string): Promise<IResponse> {
        try {
            const response = await this.paymentRepository.savePayment(amount, method);

            if (!response.data) {
                return {
                    success: false,
                    message: response.message,
                    data: null,
                };
            }

            const status = await this.bookingRepository.updateBookingWithPaymentId(
                id,
                response.data._id
            );

            const updatedBooking = await this.bookingRepository.updateBookingStatus(
                id,
                "completed"
            );
            if (!updatedBooking) {
                return {
                    success: false,
                    message: BookingMessages.UPDATE_BOOKING_STATUS_FAILED, // "Failed to update booking status"
                    data: null,
                };
            }

            return status
                ? {
                      success: true,
                      message: response.message,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: BookingMessages.UPDATE_BOOKING_PAYMENT_FAILED, // "Failed to update booking with payment ID"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: PaymentMessages.INITIATE_PAYMENT_FAILED, // "Failed to initiate payment request"
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                data: null,
            };
        }
    }

    async fetchDashboard(data: IProviderDashboardFilter): Promise<IResponse> {
        try {
            const response = await this.bookingRepository.getProviderDashboardDetails(
                data.provider_id
            );

            return response.success
                ? {
                      success: true,
                      message: response.message,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: DashboardMessages.FETCH_DASHBOARD_FAILED, // "Failed to fetch dashboard details"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
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
                    message: ReportMessages.REPORT_ALREADY_EXISTS, // "Already reported"
                    data: null,
                };
            }

            const reportResponse = await this.reportRepository.addReport(data);

            return reportResponse
                ? {
                      success: true,
                      message: ReportMessages.REPORT_SUCCESS, // "Reported successfully"
                      data: null,
                  }
                : {
                      success: false,
                      message: ReportMessages.REPORT_FAILED, // "Failed to report"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
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
                      message: NotificationMessages.FETCH_UNREAD_COUNT_SUCCESS, // "Fetched unread count successfully"
                      data: response.data,
                  }
                : {
                      success: false,
                      message: NotificationMessages.FETCH_UNREAD_COUNT_FAILED, // "Failed to fetch unread count"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
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
                      message: NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS, // "Fetched notifications successfully"
                      data: response.data,
                  }
                : {
                      success: false,
                      message: NotificationMessages.FETCH_NOTIFICATIONS_FAILED, // "Failed to fetch notifications"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
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
                      message: NotificationMessages.UPDATE_NOTIFICATION_SUCCESS, // "Updated notification successfully"
                      data: response.data,
                  }
                : {
                      success: false,
                      message: NotificationMessages.UPDATE_NOTIFICATION_FAILED, // "Failed to update notification"
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                data: null,
            };
        }
    }
}

export default ProviderService;
