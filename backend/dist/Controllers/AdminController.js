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
const { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, CONFLICT, INTERNAL_SERVER_ERROR } = StatusCodes_1.HttpStatus;
class AdminController {
    constructor(AdminService) {
        this.AdminService = AdminService;
    }
    signIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.email || !req.body.password) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.AuthMessages.SIGN_IN_PROVIDER_REQUIRED_FIELDS, // "Email and Password are required fields"
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.authenticateAdmin(req.body);
                if ((response === null || response === void 0 ? void 0 : response.success) && (response === null || response === void 0 ? void 0 : response.accessToken) && (response === null || response === void 0 ? void 0 : response.refreshToken)) {
                    res.status(OK)
                        .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: true,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                        .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: true,
                        maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                            ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                            : 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                        .json({
                        success: true,
                        message: response.message,
                        data: { email: response.email, id: response._id },
                    });
                }
                else {
                    switch (response === null || response === void 0 ? void 0 : response.message) {
                        case Messages_1.AuthMessages.ACCOUNT_DOES_NOT_EXIST:
                            res.status(BAD_REQUEST).json({
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
    signOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: true,
                });
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: false,
                });
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
                }
                else {
                    const response = yield this.AdminService.refreshTokenCheck(token);
                    if (response.accessToken) {
                        res.status(OK)
                            .cookie("accessToken", response.accessToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: true,
                            maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                                ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                                : 15 * 60 * 1000, // 15 minutes
                        })
                            .json({ success: true, message: Messages_1.tokenMessages.ACCESS_TOKEN_SUCCESS });
                    }
                    else {
                        res.status(UNAUTHORIZED).json({
                            success: true,
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
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page || !req.query.filter) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.UserMessages.FETCH_USERS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.getUsersList(req.query.search, req.query.page, req.query.filter);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.UserMessages.FETCH_USERS_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.UserMessages.FETCH_USERS_FAILED,
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
    blockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.userBlock(req.params.id);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.UserMessages.BLOCK_USER_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.UserMessages.BLOCK_USER_FAILED,
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
    unBlockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.userUnBlock(req.params.id);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.UserMessages.UNBLOCK_USER_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.UserMessages.UNBLOCK_USER_FAILED,
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
    getProviders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page || !req.query.filter) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ProviderMessages.FETCH_PROVIDERS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.getProvidersList(req.query.search, req.query.page, req.query.filter);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProviderMessages.FETCH_PROVIDERS_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.ProviderMessages.FETCH_PROVIDERS_FAILED,
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
    getApprovals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ApprovalMessages.FETCH_APPROVALS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.getApprovalsList(req.query.page);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ApprovalMessages.FETCH_APPROVALS_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ApprovalMessages.FETCH_APPROVALS_FAILED,
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
    blockProvider(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.providerBlock(req.params.id);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProviderMessages.BLOCK_PROVIDER_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.ProviderMessages.BLOCK_PROVIDER_FAILED,
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
    unBlockProvider(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.providerUnBlock(req.params.id);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ProviderMessages.UNBLOCK_PROVIDER_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.ProviderMessages.UNBLOCK_PROVIDER_FAILED,
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
    approvalDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.getApprovalDetails(req.params.id);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ApprovalMessages.FETCH_APPROVAL_DETAILS_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.ApprovalMessages.FETCH_APPROVAL_DETAILS_FAILED,
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
    approvalStatusUpdate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.body.status) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ApprovalMessages.UPDATE_APPROVAL_STATUS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const status = yield this.AdminService.approvalStatusChange(req.params.id, req.body.status);
                if (status) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ApprovalMessages.UPDATE_APPROVAL_STATUS_SUCCESS,
                        data: status,
                    });
                }
                else {
                    res.status(OK).json({
                        success: false,
                        message: Messages_1.ApprovalMessages.UPDATE_APPROVAL_STATUS_FAILED,
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
    getAllServices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page || !req.query.filter) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ServiceMessages.FETCH_SERVICES_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const services = yield this.AdminService.getServices(req.query.search, req.query.page, req.query.filter);
                res.status(OK).json({
                    success: true,
                    message: Messages_1.ServiceMessages.FETCH_SERVICES_SUCCESS,
                    data: services,
                });
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
    changeServiceStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id || !req.body.status) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ServiceMessages.UPDATE_SERVICE_STATUS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.changeServiceStatus(req.body.status, req.params.id);
                if (response) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ServiceMessages.UPDATE_SERVICE_STATUS_SUCCESS,
                        data: null,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ServiceMessages.UPDATE_SERVICE_STATUS_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    addService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.data.serviceName || !req.body.data.description) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ServiceMessages.CREATE_SERVICE_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.createService(req.body.data);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ServiceMessages.CREATE_SERVICE_SUCCESS,
                        data: null,
                    });
                }
                else if (response.message === Messages_1.ServiceMessages.SERVICE_ALREADY_EXISTS) {
                    res.status(CONFLICT).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ServiceMessages.CREATE_SERVICE_FAILED,
                        data: null,
                    });
                }
            }
            catch (error) {
                console.log(error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    getService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.GeneralMessages.INVALID_ID,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.getServiceDetails(req.params.id);
                if (response) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ServiceMessages.FETCH_SERVICE_DETAILS_SUCCESS,
                        data: response,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ServiceMessages.FETCH_SERVICE_DETAILS_FAILED,
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
    updateService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.data.serviceName || !req.body.data.description || !req.params.id) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ServiceMessages.UPDATE_SERVICE_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.updateService(req.params.id, req.body.data);
                if (response.success) {
                    res.status(OK).json({
                        success: true,
                        message: Messages_1.ServiceMessages.UPDATE_SERVICE_SUCCESS,
                        data: response,
                    });
                }
                else if (response.message === Messages_1.ServiceMessages.SERVICE_ALREADY_EXISTS) {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ServiceMessages.SERVICE_ALREADY_EXISTS,
                        data: null,
                    });
                }
                else {
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: Messages_1.ServiceMessages.UPDATE_SERVICE_FAILED,
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
    getBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.fetchBookings(Number(req.query.page));
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
                console.error("Error in fetching booking data:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getSales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page || !req.query.fromDate || !req.query.toDate) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_SALES_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.fetchSalesData({
                    page: req.query.page,
                    fromDate: req.query.fromDate,
                    toDate: req.query.toDate,
                });
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
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking data:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.AdminService.fetchDashboardData();
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
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking data:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    getRevenue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.period) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_REVENUE_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.fetchRevenueData(req.query.period);
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
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching booking data:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
    fetchReportsList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.page) {
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: Messages_1.ReportMessages.FETCH_REPORTS_REQUIRED,
                        data: null,
                    });
                    return;
                }
                const response = yield this.AdminService.fetchReportsData(Number(req.query.page));
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
                        data: null,
                    });
                }
            }
            catch (error) {
                console.error("Error in fetching reports data:", error.message);
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: Messages_1.GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        });
    }
}
exports.default = AdminController;
