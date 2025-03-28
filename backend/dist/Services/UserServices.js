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
const GenerateOtp_1 = require("../Utils/GenerateOtp");
const SendMail_1 = require("../Utils/SendMail");
const HashPassword_1 = require("../Utils/HashPassword");
const GenerateTokens_1 = require("../Utils/GenerateTokens");
const CheckToken_1 = require("../Utils/CheckToken");
const GoogleConfig_1 = require("../Utils/GoogleConfig");
const axios_1 = __importDefault(require("axios"));
const stripeService_1 = require("../Utils/stripeService");
const Cloudinary_1 = require("../Utils/Cloudinary");
const Socket_1 = require("../Utils/Socket");
const Messages_1 = require("../Constants/Messages");
class UserService {
    constructor(userRepository, otpRepository, addressRepository, scheduleRepository, bookingRepository, paymentRepository, chatRepository, reviewRepository, reportRepository, notificationRepository) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.addressRepository = addressRepository;
        this.scheduleRepository = scheduleRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.chatRepository = chatRepository;
        this.reviewRepository = reviewRepository;
        this.reportRepository = reportRepository;
        this.notificationRepository = notificationRepository;
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.userRepository.findUserByEmail(userData.email);
                if (!exists) {
                    const hashedPassword = yield (0, HashPassword_1.hashPassword)(userData.password);
                    userData.password = hashedPassword;
                    const status = yield this.userRepository.insertUser(Object.assign(Object.assign({}, userData), { google_id: null, url: "" }));
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
                            message: Messages_1.AuthMessages.SIGN_UP_FAILURE,
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
                const data = yield this.userRepository.findUserByEmail(email);
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
                const user = yield this.userRepository.findUserByEmail(email);
                if (user) {
                    const data = yield this.userRepository.findOtpWithId(user._id);
                    if ((_a = data === null || data === void 0 ? void 0 : data.otp[0]) === null || _a === void 0 ? void 0 : _a.value) {
                        const otpStatus = yield (0, GenerateOtp_1.compareOtps)(otp, data.otp[0].value);
                        if (otpStatus) {
                            const verified = yield this.userRepository.verifyUser(user._id);
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
                    message: Messages_1.GeneralMessages.USER_NOT_FOUND,
                };
            }
            catch (error) {
                console.log(error.message);
                return { success: false, message: Messages_1.AuthMessages.OTP_ERROR };
            }
        });
    }
    authenticateUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.userRepository.findUserByEmail(userData.email);
                if (exists) {
                    if (exists.is_blocked) {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.ACCOUNT_BLOCKED,
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
                            name: "",
                            url: "",
                            mobileNo: "",
                            accessToken: null,
                            refreshToken: null,
                        };
                    }
                    const passwordStatus = yield (0, HashPassword_1.comparePasswords)(userData.password, exists.password);
                    if (passwordStatus) {
                        if (exists.is_verified) {
                            const tokens = (0, GenerateTokens_1.generateTokens)(exists._id.toString(), exists.email, "user");
                            return {
                                success: true,
                                message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
                                email: exists.email,
                                _id: exists._id,
                                name: exists.name,
                                url: exists.url,
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
                            email: exists.email,
                            _id: null,
                            name: "",
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
                        url: "",
                        _id: null,
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
                        message: tokenStatus.message,
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
                    message: Messages_1.AuthMessages.TOKEN_ERROR,
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
                const user = yield this.userRepository.findUserByEmail(email);
                if (!user) {
                    const saveUser = yield this.userRepository.insertUser({
                        userName: name,
                        email: email,
                        password: "",
                        passwordConfirm: "",
                        mobileNo: "",
                        url: picture,
                        google_id: id,
                    });
                    if (saveUser) {
                        const tokens = (0, GenerateTokens_1.generateTokens)(saveUser._id.toString(), email, "user");
                        return {
                            success: true,
                            message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
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
                        message: Messages_1.AuthMessages.GOOGLE_SIGN_IN_FAILED,
                        email: null,
                        _id: null,
                        name: "",
                        mobileNo: "",
                        url: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
                else {
                    if (user.is_blocked) {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.ACCOUNT_BLOCKED,
                            email: null,
                            _id: null,
                            name: "",
                            mobileNo: "",
                            url: "",
                            accessToken: null,
                            refreshToken: null,
                        };
                    }
                    const tokens = (0, GenerateTokens_1.generateTokens)(user._id.toString(), email, "user");
                    return {
                        success: true,
                        message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
                        email: user.email,
                        _id: user._id,
                        name: user.name,
                        url: user.url,
                        mobileNo: user.mobile_no,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.AuthMessages.GOOGLE_SIGN_IN_FAILED,
                    email: null,
                    _id: null,
                    name: "",
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
                const status = yield this.userRepository.updateUserWithId(Object.assign(Object.assign({}, data), { url: image_url[0] }));
                if (!status) {
                    return null;
                }
                else {
                    yield (0, Socket_1.sendNotfication)(data.id, "Profile was updated", "Profile");
                    return status;
                }
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    getUserData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.userRepository.getUserDataWithId(id);
                if (!status) {
                    return null;
                }
                else {
                    return status;
                }
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    forgotPasswordVerify(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield this.userRepository.findUserByEmail(email);
                if (!userData) {
                    return {
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED,
                        data: null,
                    };
                }
                if (userData === null || userData === void 0 ? void 0 : userData.google_id) {
                    return {
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_GOOGLE,
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
                        message: Messages_1.PasswordMessages.MAIL_SENT_SUCCESS,
                        data: userData.email,
                    };
                }
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.MAIL_VERIFY_FAILED,
                    data: null,
                };
            }
            catch (error) {
                console.log(error.message);
                return { success: false, message: Messages_1.PasswordMessages.COULDNT_VERIFY_MAIL, data: null };
            }
        });
    }
    passworOtpCheck(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield this.userRepository.findUserByEmail(email);
                if (user) {
                    const data = yield this.userRepository.findOtpWithId(user._id);
                    if ((_a = data === null || data === void 0 ? void 0 : data.otp[0]) === null || _a === void 0 ? void 0 : _a.value) {
                        const otpStatus = yield (0, GenerateOtp_1.compareOtps)(otp, data.otp[0].value);
                        if (otpStatus) {
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
                    message: Messages_1.GeneralMessages.ACCOUNT_NOT_FOUND,
                };
            }
            catch (error) {
                console.log(error.message);
                return { success: false, message: Messages_1.AuthMessages.OTP_ERROR };
            }
        });
    }
    changePassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield (0, HashPassword_1.hashPassword)(password);
                const updateStatus = yield this.userRepository.updatePassword(email, hashedPassword);
                return updateStatus
                    ? {
                        success: true,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_SUCCESS,
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_FAILED,
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.RESET_PASSWORD_FAILED,
                    data: null,
                };
            }
        });
    }
    verifyPassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.userRepository.getUserDataWithId(id);
                if (data === null || data === void 0 ? void 0 : data.password) {
                    const status = yield (0, HashPassword_1.comparePasswords)(password, data.password);
                    return status
                        ? {
                            success: true,
                            message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_SUCCESS,
                            data: null,
                        }
                        : {
                            success: false,
                            message: Messages_1.PasswordMessages.INCORRECT_PASSWORD,
                            data: null,
                        };
                }
                else {
                    return {
                        success: false,
                        message: Messages_1.PasswordMessages.INVALID_ID,
                        data: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_FAILED,
                    data: null,
                };
            }
        });
    }
    createAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addressCount = yield this.addressRepository.countAddresses(address.id);
                if (addressCount === null) {
                    return {
                        success: false,
                        message: Messages_1.AddressMessages.CREATE_ADDRESS_FAILED,
                        data: null,
                    };
                }
                else {
                    if (addressCount < 3) {
                        const exists = yield this.addressRepository.checkDuplicate(address);
                        if (exists === null) {
                            return {
                                success: false,
                                message: Messages_1.AddressMessages.CREATE_ADDRESS_FAILED,
                                data: null,
                            };
                        }
                        else if (exists) {
                            return {
                                success: false,
                                message: Messages_1.AddressMessages.ADDRESS_ALREADY_ADDED,
                                data: null,
                            };
                        }
                        else {
                            const response = yield this.addressRepository.createAddress(address);
                            return response
                                ? {
                                    success: true,
                                    message: Messages_1.AddressMessages.CREATE_ADDRESS_SUCCESS,
                                    data: null,
                                }
                                : {
                                    success: false,
                                    message: Messages_1.AddressMessages.CREATE_ADDRESS_FAILED,
                                    data: null,
                                };
                        }
                    }
                    else {
                        return {
                            success: false,
                            message: Messages_1.AddressMessages.ADDRESS_LIMIT_REACHED,
                            data: null,
                        };
                    }
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.AddressMessages.CREATE_ADDRESS_FAILED,
                    data: null,
                };
            }
        });
    }
    findAddresses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addresses = yield this.addressRepository.fetchAllAddress(userId);
                if (addresses === null) {
                    return {
                        success: false,
                        message: Messages_1.AddressMessages.GET_ADDRESSES_FAILED,
                        data: null,
                    };
                }
                else {
                    return {
                        success: true,
                        message: Messages_1.AddressMessages.GET_ADDRESSES_SUCCESS,
                        data: addresses,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.AddressMessages.GET_ADDRESSES_FAILED,
                    data: null,
                };
            }
        });
    }
    changeAddressStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.addressRepository.deleteAddress(id);
                return status
                    ? {
                        success: true,
                        message: Messages_1.AddressMessages.DELETE_ADDRESS_SUCCESS,
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.AddressMessages.DELETE_ADDRESS_FAILED,
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.AddressMessages.DELETE_ADDRESS_FAILED,
                    data: null,
                };
            }
        });
    }
    getAddress(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const address = yield this.addressRepository.fetchAddress(addressId);
                if (address === null) {
                    return {
                        success: false,
                        message: Messages_1.AddressMessages.GET_ADDRESS_FAILED,
                        data: null,
                    };
                }
                else {
                    return {
                        success: true,
                        message: Messages_1.AddressMessages.GET_ADDRESS_SUCCESS,
                        data: address,
                    };
                }
            }
            catch (error) {
                return {
                    success: false,
                    message: Messages_1.AddressMessages.GET_ADDRESS_FAILED,
                    data: null,
                };
            }
        });
    }
    editAddress(address, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedStatus = yield this.addressRepository.updateAddress(address, id);
                return updatedStatus
                    ? {
                        success: true,
                        message: Messages_1.AddressMessages.UPDATE_ADDRESS_SUCCESS,
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.AddressMessages.UPDATE_ADDRESS_FAILED,
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.AddressMessages.UPDATE_ADDRESS_FAILED,
                    data: null,
                };
            }
        });
    }
    getSlots(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slots = yield this.scheduleRepository.findSlots(data);
                return slots.success
                    ? {
                        success: true,
                        message: Messages_1.SlotMessages.FETCH_SLOTS_SUCCESS,
                        data: slots.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.SlotMessages.FETCH_SLOTS_FAILED,
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.SlotMessages.FETCH_SLOTS_ERROR,
                    data: null,
                };
            }
        });
    }
    requestBooking(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const time = new Date();
                const exists = yield this.scheduleRepository.findBookingRequest(bookingData.user_id, bookingData.slot_id, bookingData.time, bookingData.date);
                if (exists.success) {
                    return { success: false, message: exists.message, data: null };
                }
                const slots = yield this.scheduleRepository.bookingRequestAdd(bookingData);
                if (slots.success) {
                    yield (0, Socket_1.sendNotfication)(bookingData.technician_id, `New booking request at ${bookingData.time}`, "Booking request");
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.SlotMessages.REQUEST_SLOTS_ERROR,
                    data: null,
                };
            }
        });
    }
    fetchBookings(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingStatus = yield this.bookingRepository.getBookingsWithUserId(id, page);
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
                    message: Messages_1.BookingMessages.GET_BOOKINGS_SUCCESS,
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
                    message: Messages_1.BookingMessages.GET_BOOKING_DETAILS_SUCCESS,
                    data: null,
                };
            }
        });
    }
    processOnlinePayment(payment_id, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, stripeService_1.createPaymentIntent)(amount);
                if (!response.success || !response.clientSecret) {
                    return {
                        success: false,
                        message: response.message || Messages_1.PaymentMessages.PAYMENT_INTENT_FAILED,
                        data: null,
                    };
                }
                const site_fee = Math.floor((amount * 10) / 100);
                const status = yield this.paymentRepository.updatePaymentStatus(payment_id, site_fee);
                if (!status) {
                    return {
                        success: false,
                        message: Messages_1.PaymentMessages.CREATE_PAYMENT_FAILED,
                        data: null,
                    };
                }
                return {
                    success: true,
                    message: Messages_1.PaymentMessages.CREATE_PAYMENT_SUCCESS,
                    data: response,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.PaymentMessages.CREATE_PAYMENT_FAILED,
                    data: null,
                };
            }
        });
    }
    cancelBooking(booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield this.bookingRepository.getBookingById(booking_id);
                if (!booking.success) {
                    return { success: false, message: Messages_1.BookingMessages.BOOKING_NOT_FOUND, data: null };
                }
                const slotTime = new Date(booking.data.time);
                const currentTime = new Date();
                const threeHoursBeforeSlot = new Date(slotTime.getTime() - 3 * 60 * 60 * 1000);
                if (currentTime > threeHoursBeforeSlot) {
                    return {
                        success: false,
                        message: Messages_1.BookingMessages.CANCEL_BOOKING_TIME_ERROR,
                        data: null,
                    };
                }
                const updatedBooking = yield this.bookingRepository.updateBookingStatus(booking_id, "cancelled");
                yield (0, Socket_1.sendNotfication)(booking.data.provider_id, `Booking at ${booking.data.time} has been cancelled`, "Booking");
                return {
                    success: true,
                    message: Messages_1.BookingMessages.CANCEL_BOOKING_SUCCESS,
                    data: updatedBooking,
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                };
            }
        });
    }
    processReviewCreation(reviewData, reviewImages) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const image_urls = yield (0, Cloudinary_1.uploadImages)(reviewImages);
                if (image_urls.length === 0) {
                    return {
                        success: false,
                        message: Messages_1.ReviewMessages.IMAGE_STORAGE_FAILED,
                        data: null,
                    };
                }
                const duplicateExists = yield this.reviewRepository.duplicateReviewExists(reviewData.booking_id);
                if (duplicateExists.success) {
                    return {
                        success: false,
                        message: Messages_1.ReviewMessages.REVIEW_ALREADY_ADDED,
                        data: null,
                    };
                }
                const response = yield this.reviewRepository.saveReview(reviewData, image_urls);
                if (response.success) {
                    const updateStatus = yield this.bookingRepository.updateReviewDetails(response.data._id, reviewData.booking_id);
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
    report(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const duplicateExists = yield this.reportRepository.duplicateReport(data);
                if (duplicateExists) {
                    return {
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_ALREADY_EXISTS,
                        data: null,
                    };
                }
                const reportResponse = yield this.reportRepository.addReport(data);
                if (reportResponse) {
                    yield (0, Socket_1.sendNotfication)(data.reporter_id, "Report has been sent", "report");
                }
                return reportResponse
                    ? {
                        success: true,
                        message: Messages_1.ReportMessages.REPORT_SUCCESS,
                        data: null,
                    }
                    : {
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_FAILED,
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
    fetchUnreadNotificationsCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.notificationRepository.unreadNotificationCount(id);
                return response.success
                    ? {
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_SUCCESS,
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_FAILED,
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
    fetchNotifications(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.notificationRepository.getNotifications(id, page);
                return response.success
                    ? {
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_FAILED,
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
                        message: Messages_1.NotificationMessages.MARK_NOTIFICATION_SUCCESS,
                        data: response.data,
                    }
                    : {
                        success: false,
                        message: Messages_1.NotificationMessages.MARK_NOTIFICATION_FAILED,
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
}
exports.default = UserService;
