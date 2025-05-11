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
Object.defineProperty(exports, "__esModule", { value: true });
const StatusCodes_1 = require("../Constants/StatusCodes");
const Messages_1 = require("../Constants/Messages");
const { OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, GONE, INTERNAL_SERVER_ERROR, } = StatusCodes_1.HttpStatus;
class UserController {
    constructor(UserService) {
        this.UserService = UserService;
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.password || !req.body.userName || !req.body.mobileNo) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.SIGN_UP_REQUIRED_FIELDS,
                        data: null,
                    });
                    return;
                }
                const user = yield this.UserService.createUser(req.body);
                if ((user === null || user === void 0 ? void 0 : user.success) === true) {
                    res.status(CREATED).json({
                        success: true,
                        message: user.message,
                        data: user.email,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: (user === null || user === void 0 ? void 0 : user.message) || Messages_1.AuthMessages.SIGN_UP_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    signIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.SIGN_IN_REQUIRED_FIELDS,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.authenticateUser(req.body);
                if ((response === null || response === void 0 ? void 0 : response.success) && (response === null || response === void 0 ? void 0 : response.accessToken) && (response === null || response === void 0 ? void 0 : response.refreshToken)) {
                    res.status(OK)
                        .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                        .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                            ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                            : 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                        .json({
                        success: true,
                        message: response.message,
                        data: {
                            email: response.email,
                            id: response._id,
                            name: response.name,
                            phone: response.mobileNo,
                            url: response.url,
                        },
                    });
                }
                else {
                    switch (response === null || response === void 0 ? void 0 : response.message) {
                        case Messages_1.AuthMessages.ACCOUNT_DOES_NOT_EXIST:
                            res.status(NOT_FOUND).json({
                                success: false,
                                message: response.message,
                                data: null,
                            });
                            break;
                        case Messages_1.AuthMessages.INVALID_CREDENTIALS:
                            res.status(UNAUTHORIZED).json({
                                success: false,
                                message: response.message,
                                data: null,
                            });
                            break;
                        case Messages_1.AuthMessages.OTP_NOT_VERIFIED:
                        case Messages_1.AuthMessages.SIGN_IN_WITH_GOOGLE:
                        case Messages_1.AuthMessages.ACCOUNT_BLOCKED:
                            res.status(FORBIDDEN).json({
                                success: false,
                                message: response.message,
                                data: null,
                            });
                            break;
                        default:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                                data: null,
                            });
                            break;
                    }
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    otpVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.otp) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.OTP_REQUIRED_FIELDS,
                        data: null,
                    });
                    return;
                }
                const otpStatus = yield this.UserService.otpCheck(req.body.otp, req.body.email);
                if (otpStatus.success) {
                    res.status(OK).json({ success: true, message: otpStatus.message, data: null });
                }
                else {
                    switch (otpStatus.message) {
                        case Messages_1.AuthMessages.OTP_INVALID:
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: otpStatus.message,
                                data: null,
                            });
                            break;
                        case Messages_1.AuthMessages.OTP_EXPIRED:
                            res.status(GONE).json({ success: false, message: otpStatus.message });
                            break;
                        case Messages_1.AuthMessages.OTP_ERROR:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: otpStatus.message,
                                data: null,
                            });
                            break;
                        default:
                            res.status(NOT_FOUND).json({
                                success: false,
                                message: Messages_1.GeneralMessages.USER_NOT_FOUND,
                                data: null,
                            });
                            break;
                    }
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    otpResend(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.OTP_RESEND_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.otpResend(req.body.email);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.AuthMessages.OTP_RESEND_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.AuthMessages.OTP_RESEND_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    signOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
                res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });
                res.status(OK).json({
                    success: true,
                    message: Messages_1.AuthMessages.SIGN_OUT_SUCCESS,
                    data: null,
                });
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.code) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: "Google sign-in code is required",
                        data: null,
                    });
                    return;
                }
                const { code } = req.query;
                const response = yield this.UserService.googleAuth(code);
                if ((response === null || response === void 0 ? void 0 : response.success) && (response === null || response === void 0 ? void 0 : response.accessToken) && (response === null || response === void 0 ? void 0 : response.refreshToken)) {
                    res.status(OK)
                        .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                        .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                            ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                            : 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                        .json({
                        success: true,
                        message: response.message,
                        data: {
                            email: response.email,
                            id: response._id,
                            name: response.name,
                            phone: response.mobileNo,
                            url: response.url,
                            cookie: response.accessToken,
                            cookie2: response.refreshToken,
                        },
                    });
                }
                else {
                    switch (response === null || response === void 0 ? void 0 : response.message) {
                        case Messages_1.AuthMessages.GOOGLE_SIGN_IN_FAILED:
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: response.message,
                                data: null,
                            });
                            break;
                        case Messages_1.AuthMessages.ACCOUNT_BLOCKED:
                            res.status(FORBIDDEN).json({
                                success: false,
                                message: response.message,
                                data: null,
                            });
                            break;
                        default:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                                data: null,
                            });
                            break;
                    }
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    // Refresh token logic
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.cookies.refreshToken;
                if (!token) {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: Messages_1.tokenMessages.REFRESH_TOKEN_MISSING,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.refreshTokenCheck(token);
                if (response.accessToken) {
                    res.status(OK)
                        .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                        .json({
                        success: true,
                        message: Messages_1.tokenMessages.ACCESS_TOKEN_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.userName || !req.body.mobileNo || !req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ProfileMessages.UPDATE_PROFILE_REQUIRED,
                        data: null,
                    });
                    return;
                }
                let image = null;
                if (req.file) {
                    image = req.file;
                }
                const status = yield this.UserService.editProfile(Object.assign({ id: req.params.id }, req.body), image);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProfileMessages.UPDATE_PROFILE_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ProfileMessages.UPDATE_PROFILE_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ProfileMessages.GET_USER_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.getUserData(req.params.id);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProfileMessages.GET_USER_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ProfileMessages.GET_USER_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.forgotPasswordVerify(req.body.email);
                if (status.message === "Mail sent successfully") {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_SUCCESS,
                        data: status.data,
                    });
                }
                else if (status.message === Messages_1.PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED) {
                    res.status(NOT_FOUND).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED,
                        data: null,
                    });
                }
                else if (status.message === Messages_1.PasswordMessages.FORGOT_PASSWORD_GOOGLE) {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_GOOGLE,
                        data: null,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Forgot Password Error:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    forgotPasswordOtpVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.otp) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.OTP_REQUIRED_FIELDS,
                        data: null,
                    });
                    return;
                }
                const otpStatus = yield this.UserService.passworOtpCheck(req.body.otp, req.body.email);
                if (otpStatus.success) {
                    res.status(OK).json({ success: true, message: otpStatus.message });
                }
                else {
                    switch (otpStatus.message) {
                        case Messages_1.AuthMessages.OTP_INVALID:
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: otpStatus.message,
                                data: null,
                            });
                            break;
                        case Messages_1.AuthMessages.OTP_EXPIRED:
                            res.status(GONE).json({
                                success: false,
                                message: otpStatus.message,
                                data: null,
                            });
                            break;
                        case Messages_1.AuthMessages.OTP_ERROR:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: otpStatus.message,
                                data: null,
                            });
                            break;
                        default:
                            res.status(NOT_FOUND).json({
                                success: false,
                                message: Messages_1.GeneralMessages.ACCOUNT_NOT_FOUND,
                                data: null,
                            });
                            break;
                    }
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.changePassword(req.body.email, req.body.password);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: null,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    confirmPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.verifyPassword(req.params.id, req.body.password);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: null,
                    });
                }
                else if (response.message === Messages_1.PasswordMessages.CONFIRM_PASSWORD_FAILED) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
                else {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    createAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address } = req.body;
                const { id } = req.params;
                if (!address) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AddressMessages.CREATE_ADDRESS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.createAddress(Object.assign({ id }, address));
                if (status === null || status === void 0 ? void 0 : status.success) {
                    res.status(CREATED).json({
                        success: true,
                        message: status.message,
                        data: null,
                    });
                }
                else if ((status === null || status === void 0 ? void 0 : status.message) === Messages_1.AddressMessages.ADDRESS_ALREADY_ADDED ||
                    (status === null || status === void 0 ? void 0 : status.message) === Messages_1.AddressMessages.ADDRESS_LIMIT_REACHED) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: status.message,
                        data: null,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: (status === null || status === void 0 ? void 0 : status.message) || Messages_1.AddressMessages.CREATE_ADDRESS_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in createAddress:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                if (!userId) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AddressMessages.GET_ADDRESSES_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.findAddresses(userId);
                if (status === null || status === void 0 ? void 0 : status.success) {
                    res.status(OK).json({
                        success: true,
                        message: status.message,
                        data: status.data,
                    });
                }
                else if ((status === null || status === void 0 ? void 0 : status.message) === Messages_1.AddressMessages.GET_ADDRESSES_FAILED) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: status.message,
                        data: [],
                    });
                }
            }
            catch (error) {
                console.error("Error in getAddresses:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    deleteAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AddressMessages.DELETE_ADDRESS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.changeAddressStatus(req.params.id);
                if (response) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.AddressMessages.DELETE_ADDRESS_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.AddressMessages.DELETE_ADDRESS_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addressId = req.params.id;
                if (!addressId) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AddressMessages.GET_ADDRESS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.getAddress(addressId);
                if (status === null || status === void 0 ? void 0 : status.success) {
                    res.status(OK).json({
                        success: true,
                        message: status.message,
                        data: status.data,
                    });
                }
                else if ((status === null || status === void 0 ? void 0 : status.message) === Messages_1.AddressMessages.GET_ADDRESS_FAILED) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: status.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in getAddress:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    updateAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address } = req.body;
                const id = req.params.id;
                if (!address || !id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AddressMessages.UPDATE_ADDRESS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.UserService.editAddress(address, id);
                if (status === null || status === void 0 ? void 0 : status.success) {
                    res.status(CREATED).json({
                        success: true,
                        message: status.message,
                        data: null,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: (status === null || status === void 0 ? void 0 : status.message) || Messages_1.AddressMessages.UPDATE_ADDRESS_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in updateAddress:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    fetchSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.service_id ||
                    !req.query.lat ||
                    !req.query.long ||
                    !req.query.date ||
                    !req.query.time) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.SlotMessages.FETCH_SLOTS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                console.log(req.query, "req.query");
                const response = yield this.UserService.getSlots({
                    service_id: req.query.service_id,
                    lat: parseFloat(req.query.lat),
                    long: parseFloat(req.query.long),
                    date: req.query.date,
                    time: req.query.time,
                });
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else if (response.message === Messages_1.SlotMessages.FETCH_SLOTS_FAILED) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
                else {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching slots:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    requestSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id ||
                    !req.body.data.technician_id ||
                    !req.body.data.slot_id ||
                    !req.body.data.time ||
                    !req.body.data.address ||
                    !req.body.data.description) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.SlotMessages.REQUEST_SLOTS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.requestBooking(Object.assign({ user_id: req.params.id }, req.body.data));
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                    return;
                }
                switch (response.message) {
                    case Messages_1.SlotMessages.REQUEST_SLOTS_EXISTS:
                        res.status(CONFLICT).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case Messages_1.SlotMessages.REQUEST_SLOTS_FAILED:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                }
            }
            catch (error) {
                console.error("Error in requestSlots:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.query.page) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.fetchBookings(req.params.id, Number(req.query.page));
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getBookingDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.GET_BOOKING_DETAILS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.fetchBookingDetail(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    createStripePayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.id || !req.body.amount) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PaymentMessages.CREATE_PAYMENT_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.processOnlinePayment(req.body.id, req.body.amount);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    cancelBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.CANCEL_BOOKING_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.cancelBooking(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    fetchChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ChatMessages.FETCH_CHAT_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.fetchChat(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: response.message,
                        data: response.data,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching chat details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    addReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.rating ||
                    !req.body.review ||
                    !req.body.description ||
                    !req.files ||
                    !req.params.id ||
                    !req.body.provider_id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ReviewMessages.ADD_REVIEW_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.processReviewCreation(Object.assign(Object.assign({}, req.body), { booking_id: req.params.id }), req.files);
                if (response.message === Messages_1.ReviewMessages.REVIEW_ALREADY_ADDED) {
                    res.status(CONFLICT).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
                else if (response.message === Messages_1.ReviewMessages.IMAGE_STORAGE_FAILED) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
                else if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ReviewMessages.ADD_REVIEW_SUCCESS,
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ReviewMessages.ADD_REVIEW_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    report(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.reason ||
                    !req.body.reported_id ||
                    !req.body.reported_role ||
                    !req.body.reporter_id ||
                    !req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.report(Object.assign(Object.assign({}, req.body), { bookingId: req.params.id }));
                if (response.message === Messages_1.ReportMessages.REPORT_FAILED) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
                else if (response.message === Messages_1.ReportMessages.REPORT_ALREADY_EXISTS) {
                    res.status(CONFLICT).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ReportMessages.REPORT_SUCCESS,
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: "Failed to report",
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in reporting account:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    fetchNotificationsCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.fetchUnreadNotificationsCount(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_SUCCESS,
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching count:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    fetchNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.query.page) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.fetchNotifications(req.params.id, Number(req.query.page));
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching notifications:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    markNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.NotificationMessages.MARK_NOTIFICATION_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.UserService.markNotification(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message,
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in updating notification:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
}
exports.default = UserController;
