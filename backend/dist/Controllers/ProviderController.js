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
const { OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, GONE, CONFLICT, INTERNAL_SERVER_ERROR, } = StatusCodes_1.HttpStatus;
class ProviderController {
    constructor(providerService) {
        this.providerService = providerService;
    }
    // Get all services
    getAllServices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const services = yield this.providerService.getServices();
                res.status(OK).json({
                    success: true,
                    message: Messages_1.ServiceMessages.FETCH_SERVICES_SUCCESS, // "services fetched sucessfully" -> closest match
                    data: services,
                });
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Sign up and sends the corresponding success code
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email ||
                    !req.body.password ||
                    !req.body.userName ||
                    !req.body.mobileNo ||
                    !req.body.service_id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.SIGN_UP_PROVIDER_REQUIRED_FIELDS, // "Email,password,username,mobile no and service id are required feilds"
                        data: null,
                    });
                    return;
                }
                const provider = yield this.providerService.createProvider(req.body);
                if ((provider === null || provider === void 0 ? void 0 : provider.success) === true) {
                    res.status(CREATED).json({
                        success: true,
                        message: Messages_1.AuthMessages.SIGN_UP_SUCCESS, // "Signed up successfully"
                        data: provider.email,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: (provider === null || provider === void 0 ? void 0 : provider.message) || Messages_1.AuthMessages.SIGN_UP_FAILED, // "Sign up failed"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Login and sends the corresponding status code
    signIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.SIGN_IN_PROVIDER_REQUIRED_FIELDS, // "Email,password are required feilds"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.authenticateProvider(req.body);
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
                        message: Messages_1.AuthMessages.SIGN_IN_SUCCESS, // "Signed in successfully"
                        data: {
                            email: response.email,
                            id: response._id,
                            url: response.url,
                            service_id: response.service_id,
                            name: response.name,
                            phone: response.mobileNo,
                        },
                    });
                }
                else {
                    switch (response === null || response === void 0 ? void 0 : response.message) {
                        case "Account does not exist":
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: Messages_1.AuthMessages.ACCOUNT_DOES_NOT_EXIST, // "Account does not exist"
                                data: null,
                            });
                            break;
                        case "Invalid Credentials":
                            res.status(UNAUTHORIZED).json({
                                success: false,
                                message: Messages_1.AuthMessages.INVALID_CREDENTIALS, // "Invalid Credentials"
                                data: null,
                            });
                            break;
                        case "Didn't complete otp verification":
                            res.status(FORBIDDEN).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_NOT_VERIFIED, // "Didn't complete OTP verification"
                                data: null,
                            });
                            break;
                        case "Please Sign in With Google":
                            res.status(UNAUTHORIZED).json({
                                success: false,
                                message: Messages_1.AuthMessages.SIGN_IN_WITH_GOOGLE, // "Please Sign in With Google"
                                data: null,
                            });
                            break;
                        case "Account blocked by admin":
                            res.status(FORBIDDEN).json({
                                success: false,
                                message: Messages_1.AuthMessages.ACCOUNT_BLOCKED, // "Account blocked by admin"
                                data: null,
                            });
                            break;
                        default:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Verify OTP
    otpVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.otp) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.OTP_PROVIDER_REQUIRED_FIELDS, // "Email,otp are required feilds"
                        data: null,
                    });
                    return;
                }
                const otpStatus = yield this.providerService.otpCheck(req.body.otp, req.body.email);
                if (otpStatus.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.AuthMessages.OTP_VERIFIED_SUCCESS, // "OTP verified successfully"
                        data: null,
                    });
                }
                else {
                    switch (otpStatus.message) {
                        case "Invalid Otp":
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_INVALID, // "Invalid OTP"
                                data: null,
                            });
                            break;
                        case "Otp is expired":
                            res.status(GONE).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_EXPIRED, // "OTP is expired"
                                data: null,
                            });
                            break;
                        case "Otp error":
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_ERROR, // "OTP error"
                                data: null,
                            });
                            break;
                        default:
                            res.status(NOT_FOUND).json({
                                success: false,
                                message: Messages_1.GeneralMessages.PROVIDER_NOT_FOUND, // "Provider not found"
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Resend OTP for expired OTPs
    otpResend(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.OTP_RESEND_REQUIRED, // "Email is a required feild"
                        data: null,
                    });
                    return;
                }
                const status = yield this.providerService.otpResend(req.body.email);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.AuthMessages.OTP_RESEND_SUCCESS, // "Otp sent Successfully"
                        data: null,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: true,
                        message: Messages_1.AuthMessages.OTP_RESEND_FAILED, // "Otp Cannot be send at this moment"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Sign out function which clears the cookie
    signOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                });
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                });
                res.status(OK).json({
                    success: true,
                    message: Messages_1.AuthMessages.SIGN_OUT_SUCCESS, // "Signed Out Successfully"
                    data: null,
                });
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Validate refresh token and send access token if required
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.cookies.refreshToken;
                if (!token) {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: Messages_1.tokenMessages.REFRESH_TOKEN_MISSING, // "Refresh Token missing"
                        data: null,
                    });
                }
                else {
                    const response = yield this.providerService.refreshTokenCheck(token);
                    if (response.accessToken) {
                        res.status(OK)
                            .cookie("accessToken", response.accessToken, {
                            httpOnly: true,
                            sameSite: "none",
                            secure: true,
                            maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                                ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                                : 15 * 60 * 1000, // 15 minutes
                        })
                            .json({
                            success: true,
                            message: Messages_1.tokenMessages.ACCESS_TOKEN_SUCCESS, // "Access token sent successfully"
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
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Google sign-in and sign-up route
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.code) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.GOOGLE_SIGN_IN_CODE_REQUIRED, // "Google signin code is required feild"
                        data: null,
                    });
                    return;
                }
                const { code } = req.query;
                const response = yield this.providerService.googleAuth(code);
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
                        message: Messages_1.AuthMessages.SIGN_IN_SUCCESS, // "Signed in successfully"
                        data: {
                            email: response.email,
                            id: response._id,
                            url: response.url,
                            name: response.name,
                            phone: response.mobileNo,
                        },
                    });
                }
                else {
                    switch (response === null || response === void 0 ? void 0 : response.message) {
                        case "Google Sign In failed":
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: Messages_1.AuthMessages.GOOGLE_SIGN_IN_FAILED, // "Google Sign In failed"
                                data: null,
                            });
                            break;
                        case "Account blocked by admin":
                            res.status(UNAUTHORIZED).json({
                                success: false,
                                message: Messages_1.AuthMessages.ACCOUNT_BLOCKED, // "Account blocked by admin"
                                data: null,
                            });
                            break;
                        default:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Update provider profile data
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.userName || !req.body.mobileNo || !req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ProfileMessages.UPDATE_PROFILE_REQUIRED, // "Name,mobile no and id are required feilds"
                        data: null,
                    });
                    return;
                }
                let image = null;
                if (req.file) {
                    image = req.file;
                }
                const status = yield this.providerService.editProfile(Object.assign(Object.assign({}, req.body), { id: req.params.id }), image);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProfileMessages.UPDATE_PROFILE_SUCCESS, // "Profile updated successfully"
                        data: status,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ProfileMessages.UPDATE_PROFILE_FAILED, // "Profile updated failed"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Fetch provider profile data
    fetchProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ProfileMessages.GET_USER_REQUIRED, // "Id is a required feild"
                        data: null,
                    });
                    return;
                }
                const status = yield this.providerService.getProfileData(req.params.id);
                res.status(OK).json({
                    success: true,
                    message: Messages_1.ProfileMessages.FETCH_PROFILE_SUCCESS, // "Profile fetched successfully"
                    data: status,
                });
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Register provider data
    registerProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id ||
                    !req.body.description ||
                    !req.body.expertise_id ||
                    !req.body.aadharImage ||
                    !req.body.workImages) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ProfileMessages.REGISTER_PROFILE_REQUIRED, // "provider ID , description, expertise ID ,aadhar Image and workImages are a required feild"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.registerProvider(Object.assign(Object.assign(Object.assign({}, req.body), { provider_id: req.params.id }), req.files));
                if (response.success === true) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProfileMessages.REGISTER_PROFILE_SUCCESS, // "Provider registration successfully"
                        data: "",
                    });
                }
                else {
                    switch (response === null || response === void 0 ? void 0 : response.message) {
                        case "Already requested for approval":
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: Messages_1.ProfileMessages.ALREADY_REQUESTED_APPROVAL, // "Already requested for approval"
                                data: null,
                            });
                            break;
                        default:
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.ProfileMessages.REGISTER_PROFILE_FAILED, // "Cannot register at this moment"
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Forgot password logic
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_REQUIRED, // "Email is a required feild"
                        data: null,
                    });
                    return;
                }
                const status = yield this.providerService.forgotPasswordVerify(req.body.email);
                if (status.message === "Mail sent successfully") {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_SUCCESS, // "OTP email sent successfully"
                        data: status.data,
                    });
                }
                else if (status.message === "Mail not registered") {
                    res.status(NOT_FOUND).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED, // "Email is not registered"
                        data: null,
                    });
                }
                else if (status.message === "Please Sign in with your google account") {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_GOOGLE, // "Please Sign in with your google account"
                        data: null,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_FAILED, // "Failed to verify email"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Forgot Password Error:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Verify OTP for forgot password
    forgotPasswordOtpVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.otp) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.FORGOT_PASSWORD_OTP_REQUIRED, // "Email and otp are a required feilds"
                        data: null,
                    });
                    return;
                }
                const otpStatus = yield this.providerService.passworOtpCheck(req.body.otp, req.body.email);
                if (otpStatus.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.AuthMessages.OTP_VERIFIED_SUCCESS, // "OTP verified successfully" (reused from AuthMessages)
                        data: null,
                    });
                }
                else {
                    switch (otpStatus.message) {
                        case "Invalid Otp":
                            res.status(BAD_REQUEST).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_INVALID, // "Invalid OTP"
                                data: null,
                            });
                            break;
                        case "Otp is expired":
                            res.status(GONE).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_EXPIRED, // "OTP is expired"
                                data: null,
                            });
                            break;
                        case "Otp error":
                            res.status(INTERNAL_SERVER_ERROR).json({
                                success: false,
                                message: Messages_1.AuthMessages.OTP_ERROR, // "OTP error"
                                data: null,
                            });
                            break;
                        default:
                            res.status(NOT_FOUND).json({
                                success: false,
                                message: Messages_1.GeneralMessages.ACCOUNT_NOT_FOUND, // "Account not found"
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Reset password logic
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_REQUIRED, // "Email and password are a required feilds"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.changePassword(req.body.email, req.body.password);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_SUCCESS, // "Password updated successfully"
                        data: null,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.RESET_PASSWORD_FAILED, // "Failed to update password"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR_ALT, // "An internal server error occurred"
                    data: null,
                });
            }
        });
    }
    // Confirm old password logic
    confirmPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_REQUIRED, // "Id and password are a required feilds"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.verifyPassword(req.params.id, req.body.password);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_SUCCESS, // "Password verified successfully"
                        data: null,
                    });
                }
                else if (response.message === "Failed to verify password") {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.PasswordMessages.CONFIRM_PASSWORD_FAILED, // "Failed to verify password"
                        data: null,
                    });
                }
                else {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: Messages_1.PasswordMessages.INCORRECT_PASSWORD, // "Incorrect Password" (assuming this is the intent)
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR_ALT, // "An internal server error occurred"
                    data: null,
                });
            }
        });
    }
    // Create a schedule for the day with location
    createSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.body.address || !req.body.date) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ScheduleMessages.CREATE_SCHEDULE_REQUIRED, // "Id,address and date are required feilds"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.addSchedule(req.params.id, req.body.date, req.body.address);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ScheduleMessages.FETCH_SCHEDULE_SUCCESS, // "schedule fetched successfully" (closest match, assuming success intent)
                        data: null,
                    });
                }
                else if (response.message === "Failed to create schedule") {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ScheduleMessages.FETCH_SCHEDULE_FAILED, // "Failed to create schedule"
                        data: null,
                    });
                }
                else {
                    res.status(FORBIDDEN).json({
                        success: false,
                        message: response.message, // No direct match, keeping original
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR_ALT, // "An internal server error occurred"
                    data: null,
                });
            }
        });
    }
    // Get schedule for a day with date
    getSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.query.date) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ScheduleMessages.CREATE_SCHEDULE_REQUIRED, // "Id and date are required feilds" (closest match)
                        data: null,
                    });
                    return;
                }
                const schedule = yield this.providerService.getSchedule(req.params.id, req.query.date);
                if (schedule.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ScheduleMessages.FETCH_SCHEDULE_SUCCESS, // "schedule fetched sucessfully"
                        data: schedule.data,
                    });
                }
                else {
                    res.status(schedule.message === "Resource not found" ? NOT_FOUND : INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: schedule.message === "Resource not found"
                            ? Messages_1.GeneralMessages.RESOURCE_NOT_FOUND // "Resource not found"
                            : Messages_1.ScheduleMessages.FETCH_SCHEDULE_FAILED, // "Failed to create schedule" (closest match)
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR_ALT, // "An internal server error occurred"
                    data: null,
                });
            }
        });
    }
    // Get all booking requests
    getBookingRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_REQUIRED, // "Id is a required feild" (closest match)
                        data: null,
                    });
                    return;
                }
                const requestData = yield this.providerService.getAllRequests(req.params.id);
                if (requestData.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_SUCCESS, // "Bookings fetched successfully" (closest match)
                        data: requestData.data,
                    });
                }
                else {
                    res.status(requestData.message === "Failed to retrieve booking requests"
                        ? NOT_FOUND
                        : INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: requestData.message, // No direct match, keeping original
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR_ALT, // "An internal server error occurred"
                    data: null,
                });
            }
        });
    }
    // Change the booking request status
    updateBookingRequestStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status } = req.body;
                if (!req.params.id || !status) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.BOOKING_REQUEST_ID_STATUS_REQUIRED, // "Booking request ID and status are required"
                        data: null,
                    });
                    return;
                }
                const requestData = yield this.providerService.changeBookingRequestStatus(req.params.id, status);
                if (!requestData.success) {
                    const statusCode = requestData.message === "Booking request not found"
                        ? NOT_FOUND
                        : INTERNAL_SERVER_ERROR;
                    res.status(statusCode).json({
                        success: false,
                        message: requestData.message === "Booking request not found"
                            ? Messages_1.BookingMessages.BOOKING_REQUEST_NOT_FOUND // "Booking request not found"
                            : requestData.message, // No direct match for other cases
                        data: null,
                    });
                    return;
                }
                res.status(OK).json({
                    success: true,
                    message: requestData.message, // No direct match, keeping original
                    data: requestData.data,
                });
            }
            catch (error) {
                console.error("Error in updateBookingRequestStatus:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Fetch all bookings for provider with ID
    getBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.query.page) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_REQUIRED, // "Id and page are required fields"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.fetchBookings(req.params.id, Number(req.query.page));
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_SUCCESS, // "Bookings fetched successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message, // No direct match, keeping original
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Fetch booking details for user
    getBookingDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.GET_BOOKING_DETAILS_REQUIRED, // "Id is a required field"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.fetchBookingDetail(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.BookingMessages.GET_BOOKING_DETAILS_SUCCESS, // "Booking details fetched successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message, // No direct match, keeping original
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Create payment request for the work
    createPaymentRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.body.amount || !req.body.method) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.PaymentMessages.CREATE_PAYMENT_PROVIDER_REQUIRED, // "Id,amount and payment method are required fields"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.intiatePaymentRequest(req.params.id, req.body.amount, req.body.method);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.PaymentMessages.CREATE_PAYMENT_SUCCESS, // "Payment status updated successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.PaymentMessages.CREATE_PAYMENT_FAILED, // "Failed to update payment status"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in creating payment request:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Fetch chat data
    fetchChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ChatMessages.FETCH_CHAT_REQUIRED, // "Id is a required field"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.fetchChat(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ChatMessages.FETCH_CHAT_SUCCESS, // "Chat fetched successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: true,
                        message: Messages_1.ChatMessages.FETCH_CHAT_FAILED, // "Failed to fetch chat"
                        data: response.data,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching chat details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // Fetch dashboard details
    fetchDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.query.revenueBy || !req.query.hoursBy) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_DASHBOARD_REQUIRED, // "Id,revenue filter and working hours filters are required fields"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.fetchDashboard({
                    provider_id: req.params.id,
                    revenueBy: req.query.revenueBy,
                    hoursBy: req.query.hoursBy,
                });
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: response.message, // No direct match, keeping original
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: true,
                        message: response.message, // No direct match, keeping original
                        data: response.data,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching chat details:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error"
                    data: null,
                });
            }
        });
    }
    // report account
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
                        message: Messages_1.ReportMessages.REPORT_REQUIRED, // "Reason, reportedId, reporterId, and reporterdRole are required fields"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.report(Object.assign(Object.assign({}, req.body), { bookingId: req.params.id }));
                if (response.message === "Failed report account") {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_PROVIDER_FAILED, // "Failed report account"
                        data: null,
                    });
                }
                else if (response.message === "Already reported") {
                    res.status(CONFLICT).json({
                        success: true,
                        message: Messages_1.ReportMessages.REPORT_ALREADY_EXISTS, // "Already reported"
                        data: response.data,
                    });
                }
                else if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ReportMessages.REPORT_SUCCESS, // "Reported successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ReportMessages.REPORT_FAILED, // "Failed to report"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in reporting account:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error."
                    data: null,
                });
            }
        });
    }
    // fetch notifications count
    fetchNotificationsCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_REQUIRED, // "User id is a required feild"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.fetchUnreadNotificationsCount(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_SUCCESS, // "Fetched unread count successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_COUNT_FAILED, // "Failed to fetch unread count"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in reporting account:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error."
                    data: null,
                });
            }
        });
    }
    // fetch notifications
    fetchNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_REQUIRED, // "Notification id is a required feild" (closest match)
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.fetchNotifications(req.params.id, Number(req.query.page));
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS, // "Fetched notifications successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.NotificationMessages.FETCH_NOTIFICATIONS_FAILED, // "Failed to fetch notifications"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching notifications:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error."
                    data: null,
                });
            }
        });
    }
    // mark notifications
    markNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.NotificationMessages.MARK_NOTIFICATION_REQUIRED, // "Notification id is a required feild"
                        data: null,
                    });
                    return;
                }
                const response = yield this.providerService.markNotification(req.params.id);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.NotificationMessages.MARK_NOTIFICATION_SUCCESS, // "Updated notification successfully"
                        data: response.data,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.NotificationMessages.MARK_NOTIFICATION_FAILED, // "Failed to update notification"
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in updating notification:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR, // "Internal server error."
                    data: null,
                });
            }
        });
    }
}
exports.default = ProviderController;
