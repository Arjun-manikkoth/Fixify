"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const GenerateOtp_1 = require("../Utils/GenerateOtp");
const GoogleConfig_1 = require("../Utils/GoogleConfig");
const SendMail_1 = require("../Utils/SendMail");
const HashPassword_1 = require("../Utils/HashPassword");
const GenerateTokens_1 = require("../Utils/GenerateTokens");
const CheckToken_1 = require("../Utils/CheckToken");
const Cloudinary_1 = require("../Utils/Cloudinary");
const Socket_1 = require("../Utils/Socket");
const Messages_1 = require("../Constants/Messages");
class ProviderService {
    constructor(providerRepository, otpRepository, serviceRepository, approvalRepository, scheduleRepository, bookingRepository, paymentRepository, chatRepository, userRepository, reportRepository, notificationRepository) {
        this.providerRepository = providerRepository;
        this.otpRepository = otpRepository;
        this.serviceRepository = serviceRepository;
        this.approvalRepository = approvalRepository;
        this.scheduleRepository = scheduleRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.notificationRepository = notificationRepository;
    }
    getServices() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const services = yield this.serviceRepository.getAllServices();
                if (services.length > 0) {
                    return services;
                }
                else {
                    return null;
                }
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    createProvider(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.providerRepository.findProviderByEmail(data.email);
                if (!exists) {
                    const hashedPassword = yield (0, HashPassword_1.hashPassword)(data.password);
                    data.password = hashedPassword;
                    const status = yield this.providerRepository.insertProvider({
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
                        const otpStatus = yield this.otpSend(status.email, status._id);
                        if (otpStatus) {
                            return {
                                success: true,
                                message: Messages_1.AuthMessages.SIGN_UP_SUCCESS,
                                email: status.email,
                            };
                        }
                        else {
                            return {
                                success: false,
                                message: Messages_1.AuthMessages.EMAIL_OTP_FAILURE,
                                email: status.email,
                            };
                        }
                    }
                    else {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.SIGN_UP_FAILED,
                            email: null,
                        };
                    }
                }
                else {
                    return {
                        success: false,
                        message: Messages_1.AuthMessages.DUPLICATE_EMAIL,
                        email: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    otpSend(email, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = (0, GenerateOtp_1.generateOtp)();
                const mail = yield (0, SendMail_1.sentMail)(email, "Fixify - OTP Verification", `<!DOCTYPE html>
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
                </html>`);
                if (mail) {
                    const hashedOtp = yield (0, GenerateOtp_1.hashOtp)(otp);
                    const otpStatus = yield this.otpRepository.storeOtp(hashedOtp, id);
                    return otpStatus ? true : false;
                }
                return mail;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    otpResend(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.providerRepository.findProviderByEmail(email);
                if (data) {
                    const otp = (0, GenerateOtp_1.generateOtp)();
                    const mail = yield (0, SendMail_1.sentMail)(email, "Fixify - OTP Verification", `<!DOCTYPE html>
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
                    </html>`);
                    if (mail) {
                        const hashedOtp = yield (0, GenerateOtp_1.hashOtp)(otp);
                        const otpStatus = yield this.otpRepository.storeOtp(hashedOtp, data._id);
                        return otpStatus ? true : false;
                    }
                    return mail;
                }
                return false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    otpCheck(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const provider = yield this.providerRepository.findProviderByEmail(email);
                if (provider) {
                    const data = yield this.providerRepository.findOtpWithId(provider._id);
                    if ((_a = data === null || data === void 0 ? void 0 : data.otp[0]) === null || _a === void 0 ? void 0 : _a.value) {
                        const otpStatus = yield (0, GenerateOtp_1.compareOtps)(otp, data.otp[0].value);
                        if (otpStatus) {
                            const verified = yield this.providerRepository.verifyProvider(provider._id);
                            return { success: true, message: Messages_1.AuthMessages.OTP_VERIFIED_SUCCESS };
                        }
                        else {
                            return { success: false, message: Messages_1.AuthMessages.OTP_INVALID };
                        }
                    }
                    else if (!(data === null || data === void 0 ? void 0 : data.otp.length)) {
                        return { success: false, message: Messages_1.AuthMessages.OTP_EXPIRED };
                    }
                }
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.PROVIDER_NOT_FOUND,
                };
            }
            catch (error) {
                console.log(error.message);
                return { success: false, message: Messages_1.AuthMessages.OTP_ERROR };
            }
        });
    }
    authenticateProvider(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.providerRepository.findProviderByEmail(data.email);
                if (exists) {
                    if (exists.is_blocked) {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.ACCOUNT_BLOCKED,
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
                            message: Messages_1.AuthMessages.SIGN_IN_WITH_GOOGLE,
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
                    const passwordStatus = yield (0, HashPassword_1.comparePasswords)(data.password, exists.password);
                    if (passwordStatus) {
                        if (exists.is_verified) {
                            const tokens = (0, GenerateTokens_1.generateTokens)(exists._id.toString(), exists.email, "provider");
                            return {
                                success: true,
                                message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
                                email: exists.email,
                                _id: exists._id,
                                name: exists.name,
                                url: exists.url,
                                service_id: exists.service_id,
                                mobileNo: exists.mobile_no,
                                accessToken: tokens.accessToken,
                                refreshToken: tokens.refreshToken,
                            };
                        }
                        else {
                            const status = yield this.otpResend(exists.email);
                            return {
                                success: false,
                                message: Messages_1.AuthMessages.OTP_NOT_VERIFIED,
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
                    }
                    else {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.INVALID_CREDENTIALS,
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
                else {
                    return {
                        success: false,
                        message: Messages_1.AuthMessages.ACCOUNT_DOES_NOT_EXIST,
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
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    refreshTokenCheck(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenStatus = yield (0, CheckToken_1.verifyToken)(token);
                if (tokenStatus.id && tokenStatus.email && tokenStatus.role) {
                    const tokens = (0, GenerateTokens_1.generateTokens)(tokenStatus.id, tokenStatus.email, tokenStatus.role);
                    return {
                        accessToken: tokens.accessToken,
                        message: Messages_1.tokenMessages.ACCESS_TOKEN_SUCCESS,
                    };
                }
                return {
                    accessToken: null,
                    message: tokenStatus.message,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    accessToken: null,
                    message: Messages_1.tokenMessages.TOKEN_ERROR,
                };
            }
        });
    }
    googleAuth(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const googleRes = yield GoogleConfig_1.oAuth2Client.getToken(code);
                GoogleConfig_1.oAuth2Client.setCredentials(googleRes.tokens);
                const userRes = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
                const { email, name, picture, id } = userRes.data;
                const provider = yield this.providerRepository.findProviderByEmail(email);
                if (!provider) {
                    const saveProvider = yield this.providerRepository.insertProvider({
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
                        const tokens = (0, GenerateTokens_1.generateTokens)(saveProvider._id.toString(), email, "provider");
                        return {
                            success: true,
                            message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
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
                        message: Messages_1.AuthMessages.GOOGLE_SIGN_IN_FAILED,
                        email: null,
                        _id: null,
                        service_id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
                else {
                    if (provider.is_blocked) {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.ACCOUNT_BLOCKED,
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
                    const tokens = (0, GenerateTokens_1.generateTokens)(provider._id.toString(), email, "provider");
                    return {
                        success: true,
                        message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.AuthMessages.SIGN_IN_FAILED,
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
        });
    }
    editProfile(data, image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let image_url = [];
                if (image) {
                    image_url = yield (0, Cloudinary_1.uploadImages)([image]);
                    if (image_url.length === 0) {
                        return null;
                    }
                }
                const status = yield this.providerRepository.updateProviderWithId(Object.assign(Object.assign({}, data), { url: image_url[0] }));
                if (!status) {
                    return null;
                }
                else {
                    yield (0, Socket_1.sendNotfication)(data.id, Messages_1.ProfileMessages.UPDATE_PROFILE_SUCCESS, "Profile"); // "Profile was updated" -> closest match
                    return status;
                }
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    getProfileData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.providerRepository.fetchProviderProfileData(id);
                return status;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    registerProvider(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.approvalRepository.approvalExists(data.provider_id);
                if (!exists) {
                    let { expertise_id } = data;
                    if (!expertise_id) {
                        const providerData = yield this.providerRepository.getProviderDataWithId(data.provider_id);
                        if (providerData === null || providerData === void 0 ? void 0 : providerData.service_id) {
                            expertise_id = providerData.service_id.toString();
                        }
                    }
                    const urls = yield (0, Cloudinary_1.uploadImages)([...data.aadharImage, ...data.workImages]);
                    if (urls.length === 0) {
                        return {
                            success: false,
                            message: Messages_1.ProfileMessages.UPDATE_PROFILE_FAILED, // "Failed to update images" -> closest match
                        };
                    }
                    const status = yield this.approvalRepository.providerApprovalRegistration({
                        provider_id: data.provider_id,
                        description: data.description,
                        aadharUrl: urls[0],
                        workImageUrls: urls.slice(1),
                        expertise_id,
                    });
                    if (status) {
                        return {
                            success: true,
                            message: Messages_1.ProfileMessages.REGISTER_PROFILE_SUCCESS, // "Successfully registered request" -> closest match
                        };
                    }
                    else {
                        return {
                            success: false,
                            message: Messages_1.ProfileMessages.REGISTER_PROFILE_FAILED, // "Cannot register at this moment"
                        };
                    }
                }
                else {
                    return {
                        success: false,
                        message: Messages_1.ProfileMessages.ALREADY_REQUESTED_APPROVAL, // "Already requested for approval"
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.ProfileMessages.REGISTER_PROFILE_FAILED, // "Failed to register" -> closest match
                };
            }
        });
    }
    forgotPasswordVerify(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield this.providerRepository.findProviderByEmail(email);
                if (!userData) {
                    return {
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED, // "Mail not registered"
                        data: null,
                    };
                }
                if (userData === null || userData === void 0 ? void 0 : userData.google_id) {
                    return {
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_GOOGLE, // "Please Sign in with your google account"
                        data: null,
                    };
                }
                const otp = (0, GenerateOtp_1.generateOtp)();
                const mail = yield (0, SendMail_1.sentMail)(email, "Fixify - Forgot Password Verification", `<!DOCTYPE html>
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
                </html>`);
                if (mail) {
                    const hashedOtp = yield (0, GenerateOtp_1.hashOtp)(otp);
                    const otpStatus = yield this.otpRepository.storeOtp(hashedOtp, userData._id);
                    return {
                        success: true,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_SUCCESS, // "Mail sent successfully" -> closest match
                        data: userData.email,
                    };
                }
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.FORGOT_PASSWORD_FAILED, // "Failed to verify mail"
                    data: null,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.FORGOT_PASSWORD_FAILED, // "Couldn't verify mail" -> closest match
                    data: null,
                };
            }
        });
    }
    passworOtpCheck(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const provider = yield this.providerRepository.findProviderByEmail(email);
                if (provider) {
                    const data = yield this.providerRepository.findOtpWithId(provider._id);
                    if ((_a = data === null || data === void 0 ? void 0 : data.otp[0]) === null || _a === void 0 ? void 0 : _a.value) {
                        const otpStatus = yield (0, GenerateOtp_1.compareOtps)(otp, data.otp[0].value);
                        if (otpStatus) {
                            return { success: true, message: Messages_1.AuthMessages.OTP_VERIFIED_SUCCESS }; // "Otp verified successfully"
                        }
                        else {
                            return { success: false, message: Messages_1.AuthMessages.OTP_INVALID }; // "Invalid Otp"
                        }
                    }
                    else if (!(data === null || data === void 0 ? void 0 : data.otp.length)) {
                        return { success: false, message: Messages_1.AuthMessages.OTP_EXPIRED }; // "Otp is expired"
                    }
                }
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.ACCOUNT_NOT_FOUND, // "Account not found"
                };
            }
            catch (error) {
                console.log(error.message);
                return { success: false, message: Messages_1.AuthMessages.OTP_ERROR }; // "Otp error"
            }
        });
    }
    changePassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield (0, HashPassword_1.hashPassword)(password);
                const updateStatus = yield this.providerRepository.updatePassword(email, hashedPassword);
                return updateStatus
                    ? {
                        success: true,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_SUCCESS, // "Password updated successfully"
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_FAILED, // "Failed to update password"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.RESET_PASSWORD_FAILED, // "Failed to update password"
                    data: null,
                };
            }
        });
    }
    verifyPassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.providerRepository.getProviderDataWithId(id);
                if (data === null || data === void 0 ? void 0 : data.password) {
                    const status = yield (0, HashPassword_1.comparePasswords)(password, data.password);
                    return status
                        ? {
                            success: true,
                            message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_SUCCESS, // "Password verified successfully"
                            data: null,
                        }
                        : {
                            success: false,
                            message: Messages_1.PasswordMessages.INCORRECT_PASSWORD, // "Incorrect Password"
                            data: null,
                        };
                }
                else {
                    return {
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID, // "Invalid id"
                        data: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_FAILED, // "Failed to verify password"
                    data: null,
                };
            }
        });
    }
    addSchedule(id, date, address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providerData = yield this.providerRepository.getProviderDataWithId(id);
                if (!(providerData === null || providerData === void 0 ? void 0 : providerData.is_approved)) {
                    return {
                        success: false,
                        message: Messages_1.ScheduleMessages.COMPLETE_VERIFICATION, // "Complete verification to create schedules"
                        data: null,
                    };
                }
                const status = yield this.scheduleRepository.createSchedule(id, date, address);
                return status
                    ? {
                        success: true,
                        message: Messages_1.ScheduleMessages.CREATE_SCHEDULE_SUCCESS, // "Schedule created successfully"
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.ScheduleMessages.CREATE_SCHEDULE_FAILED, // "Failed to create schedule"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.ScheduleMessages.CREATE_SCHEDULE_FAILED, // "Failed to create schedule"
                    data: null,
                };
            }
        });
    }
    getSchedule(id, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scheduleResponse = yield this.scheduleRepository.fetchSchedule(id, date);
                if (scheduleResponse.success) {
                    return {
                        success: true,
                        message: Messages_1.ScheduleMessages.FETCH_SCHEDULE_SUCCESS, // "Fetched schedule successfully"
                        data: scheduleResponse.data,
                    };
                }
                else {
                    return {
                        success: false,
                        message: scheduleResponse.message,
                        data: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.ScheduleMessages.FETCH_SCHEDULE_FAILED, // "Failed to fetch services" -> closest match
                    data: null,
                };
            }
        });
    }
    getAllRequests(provider_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requests = yield this.scheduleRepository.findAllRequests(provider_id);
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
    changeBookingRequestStatus(request_id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let updateStatus = null;
                if (status === "booked") {
                    const requestData = yield this.scheduleRepository.getBookingRequest(request_id);
                    if (!requestData.success || !requestData.data || requestData.data.length === 0) {
                        return {
                            success: false,
                            message: Messages_1.BookingMessages.BOOKING_REQUEST_NOT_FOUND, // "Booking request not found"
                            data: null,
                        };
                    }
                    const request = requestData.data[0].requests.filter((each) => {
                        return each._id.toString() === request_id;
                    });
                    const bookingStatus = yield this.bookingRepository.createBooking(requestData.data[0], request_id);
                    yield this.scheduleRepository.changeTimeSlotStatus(request_id);
                    if (!bookingStatus) {
                        return {
                            success: false,
                            message: Messages_1.BookingMessages.CREATE_BOOKING_FAILED, // "Failed to create booking"
                            data: null,
                        };
                    }
                    updateStatus = yield this.scheduleRepository.updateBookingRequestStatus(request_id, "booked");
                    const userData = yield this.userRepository.getUserDataWithId(request[0].user_id);
                    if (!userData) {
                        return {
                            success: false,
                            message: Messages_1.GeneralMessages.USER_NOT_FOUND, // "Failed to find user data" -> closest match
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
                        bookingUrl: `${process.env.FRONT_END_URL}/users/bookings/${bookingStatus._id}.`,
                    };
                    if (userData._id)
                        yield (0, Socket_1.sendNotfication)(userData._id.toString(), Messages_1.BookingMessages.BOOKING_CONFIRMED, // "Your booking for ${bookingDetails.time} has been confirmed."
                        "Booking");
                    yield (0, SendMail_1.sentMail)(userData === null || userData === void 0 ? void 0 : userData.email, "Fixify - Booking Confirmation", `<!DOCTYPE html>
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
                                <p>Dear ${userData === null || userData === void 0 ? void 0 : userData.name},</p>
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
                                <p><a href=${process.env.FRONT_END_URL}>Visit our website</a></p>
                            </div>
                        </div>
                    </body>
                    </html>`);
                }
                else {
                    updateStatus = yield this.scheduleRepository.updateBookingRequestStatus(request_id, status);
                }
                if (!updateStatus) {
                    return {
                        success: false,
                        message: Messages_1.BookingMessages.UPDATE_BOOKING_STATUS_FAILED, // "Failed to update booking status"
                        data: null,
                    };
                }
                return {
                    success: true,
                    message: Messages_1.BookingMessages.BOOKING_COMPLETED_SUCCESS, // "Booking completed successfully"
                    data: null,
                };
            }
            catch (error) {
                console.error("Error in changeBookingRequestStatus:", error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
    fetchBookings(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingStatus = yield this.bookingRepository.getBookingsWithProviderId(id, page);
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.BookingMessages.FETCH_BOOKINGS_FAILED, // "Failed to fetch bookings"
                    data: null,
                };
            }
        });
    }
    fetchBookingDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.bookingRepository.getBookingDetails(id);
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.BookingMessages.FETCH_BOOKING_DETAILS_FAILED, // "Failed to fetch booking details"
                    data: null,
                };
            }
        });
    }
    intiatePaymentRequest(id, amount, method) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.paymentRepository.savePayment(amount, method);
                if (!response.data) {
                    return {
                        success: false,
                        message: response.message,
                        data: null,
                    };
                }
                const status = yield this.bookingRepository.updateBookingWithPaymentId(id, response.data._id);
                const updatedBooking = yield this.bookingRepository.updateBookingStatus(id, "completed");
                if (!updatedBooking) {
                    return {
                        success: false,
                        message: Messages_1.BookingMessages.UPDATE_BOOKING_STATUS_FAILED, // "Failed to update booking status"
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
                        message: Messages_1.BookingMessages.UPDATE_BOOKING_PAYMENT_FAILED, // "Failed to update booking with payment ID"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PaymentMessages.INITIATE_PAYMENT_FAILED, // "Failed to initiate payment request"
                    data: null,
                };
            }
        });
    }
    fetchChat(room_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatResponse = yield this.chatRepository.fetchChats(room_id);
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
            }
            catch (error) {
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
    fetchDashboard(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.bookingRepository.getProviderDashboardDetails(data.provider_id);
                return response.success
                    ? {
                        success: true,
                        message: response.message,
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_DASHBOARD_FAILED, // "Failed to fetch dashboard details"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
    report(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const duplicateExists = yield this.reportRepository.duplicateReport(data);
                if (duplicateExists) {
                    return {
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_ALREADY_EXISTS, // "Already reported"
                        data: null,
                    };
                }
                const reportResponse = yield this.reportRepository.addReport(data);
                return reportResponse
                    ? {
                        success: true,
                        message: Messages_1.ReportMessages.REPORT_SUCCESS, // "Reported successfully"
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_FAILED, // "Failed to report"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
    fetchUnreadNotificationsCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.notificationRepository.unreadNotificationCount(id);
                return response.success
                    ? {
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_UNREAD_COUNT_SUCCESS, // "Fetched unread count successfully"
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_UNREAD_COUNT_FAILED, // "Failed to fetch unread count"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
    fetchNotifications(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.notificationRepository.getNotifications(id, page);
                return response.success
                    ? {
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS, // "Fetched notifications successfully"
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_FAILED, // "Failed to fetch notifications"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                };
            }
        });
    }
    markNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.notificationRepository.markNotification(id);
                return response.success
                    ? {
                        success: true,
                        message: Messages_1.NotificationMessages.UPDATE_NOTIFICATION_SUCCESS, // "Updated notification successfully"
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.NotificationMessages.UPDATE_NOTIFICATION_FAILED, // "Failed to update notification"
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                };
            }
        });
    }
}
exports.default = ProviderService;
