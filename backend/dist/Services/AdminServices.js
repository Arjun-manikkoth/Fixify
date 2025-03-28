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
const HashPassword_1 = require("../Utils/HashPassword");
const GenerateTokens_1 = require("../Utils/GenerateTokens");
const CheckToken_1 = require("../Utils/CheckToken");
const SendMail_1 = require("../Utils/SendMail");
const Socket_1 = require("../Utils/Socket");
const Messages_1 = require("../Constants/Messages");
class AdminService {
    constructor(adminRepository, userRepository, providerRepository, approvalRepository, serviceRepository, bookingRepository, paymentRepository, reportRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.approvalRepository = approvalRepository;
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reportRepository = reportRepository;
    }
    authenticateAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.adminRepository.findAdminByEmail(data.email);
                if (exists) {
                    const passwordStatus = yield (0, HashPassword_1.comparePasswords)(data.password, exists.password);
                    if (passwordStatus) {
                        const tokens = (0, GenerateTokens_1.generateTokens)(exists._id.toString(), exists.email, "admin");
                        return {
                            success: true,
                            message: Messages_1.AuthMessages.SIGN_IN_SUCCESS,
                            email: exists.email,
                            _id: exists._id,
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                        };
                    }
                    else {
                        return {
                            success: false,
                            message: Messages_1.AuthMessages.INVALID_CREDENTIALS,
                            email: null,
                            _id: null,
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
    getUsersList(search, page, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.userRepository.getAllUsers(search, page, filter);
                if (data === null || data === void 0 ? void 0 : data.users) {
                    return data;
                }
                return null;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    getApprovalsList(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.approvalRepository.getAllApprovals(page);
                if (data === null || data === void 0 ? void 0 : data.approvals) {
                    return data;
                }
                return null;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    userBlock(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.userRepository.changeUserBlockStatus(id);
                return status ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    userUnBlock(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.userRepository.changeUserUnBlockStatus(id);
                return status ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    getProvidersList(search, page, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.providerRepository.getAllProviders(search, page, filter);
                if (data === null || data === void 0 ? void 0 : data.providers) {
                    return data;
                }
                return null;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    providerBlock(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.providerRepository.changeProviderBlockStatus(id);
                return status ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    providerUnBlock(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.providerRepository.changeProviderUnBlockStatus(id);
                return status ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    getApprovalDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const approvalData = yield this.approvalRepository.findApprovalDetail(id);
                return approvalData;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    approvalStatusChange(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedData = yield this.approvalRepository.updateApprovalStatus(id, status);
                if (updatedData === null || updatedData === void 0 ? void 0 : updatedData.provider_id) {
                    const providerData = yield this.providerRepository.getProviderDataWithId(updatedData.provider_id.toString());
                    if ((updatedData === null || updatedData === void 0 ? void 0 : updatedData.status) === "Approved") {
                        if (providerData) {
                            if (updatedData === null || updatedData === void 0 ? void 0 : updatedData.service_id) {
                                yield this.providerRepository.updateProviderServiceApproval(providerData._id, updatedData.service_id);
                            }
                            yield (0, SendMail_1.sentMail)(providerData.email, "Fixify - Approval Confirmation", `<!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Fixify - Approval Confirmation</title>
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
                                        <h2>Your Request Has Been Approved!</h2>
                                        <p>Dear Provider,</p>
                                        <p>We are excited to inform you that your request to join <strong>Fixify</strong> has been successfully approved! 🎉</p>
                                        <p>You can now start working with Fixify and providing your services to our valued customers. Log in to your account to get started and explore the opportunities waiting for you.</p>
                                        <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                                        <p>Welcome to the Fixify family! We look forward to working with you.</p>
                                        <p>Best regards,<br>The Fixify Team</p>
                                    </div>
                                    <div class="footer">
                                        <p>© 2025 Fixify. All rights reserved.</p>
                                        <p><a href=${process.env.FRONT_END_URL}>Visit our website</a></p>
                                    </div>
                                </div>
                            </body>
                            </html>`);
                            (0, Socket_1.sendNotfication)(providerData._id.toString(), Messages_1.ApprovalMessages.APPROVAL_CONFIRMED, "Approval");
                        }
                    }
                    else if (providerData) {
                        yield (0, SendMail_1.sentMail)(providerData.email, "Fixify - Request Rejection", `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Fixify - Request Rejection</title>
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
                                    <h2>Your Request Has Been Rejected</h2>
                                    <p>Dear Provider,</p>
                                    <p>We regret to inform you that your request to join <strong>Fixify</strong> has been rejected. After careful consideration, we found that your application did not meet our current requirements due to <strong>lack of experience</strong> or <strong>work perfection</strong>.</p>
                                    <p>We understand that this news may be disappointing, and we encourage you to continue improving your skills and gaining experience. You are welcome to reapply in the future when you feel more confident in meeting our standards.</p>
                                    <p>If you have any questions or would like further details about the decision, please feel free to contact our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                                    <p>Thank you for your interest in Fixify, and we wish you the best in your future endeavors.</p>
                                    <p>Best regards,<br>The Fixify Team</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Fixify. All rights reserved.</p>
                                    <p><a href=${process.env.FRONT_END_URL}>Visit our website</a></p>
                                </div>
                            </div>
                        </body>
                        </html>`);
                    }
                }
                return updatedData ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    getServices(search, page, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const services = yield this.serviceRepository.getServicesByFilter(search, page, filter);
                return services;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    changeServiceStatus(status, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statusChange = yield this.serviceRepository.updateServiceStatus(id, status);
                return statusChange ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    createService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield this.serviceRepository.getServiceByName(data.serviceName);
                if (!exists) {
                    const status = yield this.serviceRepository.createService(data);
                    return {
                        success: true,
                        message: Messages_1.ServiceMessages.CREATE_SERVICE_SUCCESS,
                        data: null,
                    };
                }
                else {
                    return {
                        success: false,
                        message: Messages_1.ServiceMessages.SERVICE_ALREADY_EXISTS,
                        data: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.ServiceMessages.CREATE_SERVICE_FAILED,
                    data: null,
                };
            }
        });
    }
    getServiceDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.serviceRepository.getServiceById(id);
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    updateService(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceStatus = yield this.serviceRepository.getServiceByFilter(id, data.serviceName);
                if (serviceStatus) {
                    return {
                        success: false,
                        message: Messages_1.ServiceMessages.SERVICE_ALREADY_EXISTS,
                        data: null,
                    };
                }
                else {
                    const updated = yield this.serviceRepository.updateServiceData(id, data);
                    return updated
                        ? { success: true, message: Messages_1.ServiceMessages.UPDATE_SERVICE_SUCCESS, data: null }
                        : {
                            success: false,
                            message: Messages_1.ServiceMessages.UPDATE_SERVICE_FAILED,
                            data: null,
                        };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.ServiceMessages.UPDATE_SERVICE_FAILED,
                    data: null,
                };
            }
        });
    }
    fetchBookings(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingStatus = yield this.bookingRepository.getAllBookings(page);
                return bookingStatus.success
                    ? {
                        success: true,
                        message: Messages_1.BookingMessages.GET_BOOKINGS_SUCCESS,
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
                    message: Messages_1.BookingMessages.FETCH_BOOKINGS_FAILED,
                    data: null,
                };
            }
        });
    }
    fetchSalesData(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fetchingStatus = yield this.bookingRepository.getSalesData(queries);
                return fetchingStatus.success
                    ? {
                        success: true,
                        message: Messages_1.DashboardMessages.FETCH_SALES_SUCCESS,
                        data: fetchingStatus.data,
                    }
                    : {
                        success: false,
                        message: fetchingStatus.message,
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.DashboardMessages.FETCH_SALES_FAILED,
                    data: null,
                };
            }
        });
    }
    fetchDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalUserData = yield this.userRepository.getActiveUsersCount();
                if (!totalUserData.success) {
                    return {
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_DASHBOARD_FAILED,
                        data: null,
                    };
                }
                const totalProviderData = yield this.providerRepository.getActiveProvidersCount();
                if (!totalProviderData.success) {
                    return {
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_DASHBOARD_FAILED,
                        data: null,
                    };
                }
                const totalBookingData = yield this.bookingRepository.getTotalBookingData();
                if (!totalBookingData.success) {
                    return {
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_DASHBOARD_FAILED,
                        data: null,
                    };
                }
                return {
                    success: true,
                    message: Messages_1.DashboardMessages.FETCH_DASHBOARD_SUCCESS,
                    data: Object.assign(Object.assign({}, totalBookingData.data), { totalProviders: totalProviderData.data, totalUsers: totalUserData.data }),
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.DashboardMessages.FETCH_DASHBOARD_FAILED,
                    data: null,
                };
            }
        });
    }
    fetchRevenueData(period) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const revenueData = yield this.paymentRepository.getRevenueData(period);
                if (!revenueData.success) {
                    return {
                        success: false,
                        message: Messages_1.DashboardMessages.FETCH_REVENUE_FAILED,
                        data: null,
                    };
                }
                return {
                    success: true,
                    message: Messages_1.DashboardMessages.FETCH_REVENUE_SUCCESS,
                    data: revenueData.data,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.DashboardMessages.FETCH_REVENUE_FAILED,
                    data: null,
                };
            }
        });
    }
    fetchReportsData(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reportsData = yield this.reportRepository.getAllReports(page);
                if (!reportsData.success) {
                    return {
                        success: false,
                        message: Messages_1.ReportMessages.FETCH_REPORTS_FAILED,
                        data: null,
                    };
                }
                return {
                    success: true,
                    message: Messages_1.ReportMessages.FETCH_REPORTS_SUCCESS,
                    data: reportsData.data,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: Messages_1.ReportMessages.FETCH_REPORTS_FAILED,
                    data: null,
                };
            }
        });
    }
}
exports.default = AdminService;
