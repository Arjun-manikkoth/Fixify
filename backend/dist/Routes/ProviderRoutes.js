"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BlockCheck_1 = __importDefault(require("../Middlewares/BlockCheck"));
const JwtVerify_1 = __importDefault(require("../Middlewares/JwtVerify"));
const VerifyRole_1 = __importDefault(require("../Middlewares/VerifyRole"));
const ProviderServices_1 = __importDefault(require("../Services/ProviderServices"));
const ProviderController_1 = __importDefault(require("../Controllers/ProviderController"));
const ProviderRepository_1 = __importDefault(require("../Repositories/ProviderRepository"));
const OtpRepository_1 = __importDefault(require("../Repositories/OtpRepository"));
const ServiceRepository_1 = __importDefault(require("../Repositories/ServiceRepository"));
const ApprovalRepository_1 = __importDefault(require("../Repositories/ApprovalRepository"));
const ScheduleRepository_1 = __importDefault(require("../Repositories/ScheduleRepository"));
const BookingRepository_1 = __importDefault(require("../Repositories/BookingRepository"));
const PaymentRepository_1 = __importDefault(require("../Repositories/PaymentRepository"));
const ChatRepository_1 = __importDefault(require("../Repositories/ChatRepository"));
const UserRepository_1 = __importDefault(require("../Repositories/UserRepository"));
const ReportRepository_1 = __importDefault(require("../Repositories/ReportRepository"));
const NotificationRepository_1 = __importDefault(require("../Repositories/NotificationRepository"));
const Multer_1 = require("../Utils/Multer");
const providerRepository = new ProviderRepository_1.default(); // Initialise repository instance
const otpRepository = new OtpRepository_1.default(); // Initialise otp repository instance
const serviceRepository = new ServiceRepository_1.default(); //initialise service repository
const approvalRepository = new ApprovalRepository_1.default(); //initialise approval repository
const scheduleRepository = new ScheduleRepository_1.default(); //initialise schedule repository
const bookingRepository = new BookingRepository_1.default(); //initialise booking repository
const paymentRepository = new PaymentRepository_1.default(); //initialise payment repository
const chatRepository = new ChatRepository_1.default(); //initialise chat repository
const userRepository = new UserRepository_1.default(); //initialise user repository
const reportRepository = new ReportRepository_1.default(); // creates and instance of report repository
const notificationRepository = new NotificationRepository_1.default(); // creates and instance of notification repository
const providerService = new ProviderServices_1.default(providerRepository, otpRepository, serviceRepository, approvalRepository, scheduleRepository, bookingRepository, paymentRepository, chatRepository, userRepository, reportRepository, notificationRepository);
// Dependency injection of repository into service
const providerController = new ProviderController_1.default(providerService); // Dependency injection of service into controller
// // Initialize provider router instance
const providerRoute = express_1.default.Router();
//--------------------------------------------Auth Routes-----------------------------------------------------
// // Route for provider registration (sign-up)
providerRoute.route("/sign-up").post((req, res) => {
    providerController.signUp(req, res);
});
// // Route for provider login (sign-in)
providerRoute.route("/sign-in").post((req, res) => {
    providerController.signIn(req, res);
});
// Route for oauth
providerRoute.route("/o-auth").patch((req, res) => {
    providerController.googleAuth(req, res);
});
// // Route for provider logout
providerRoute.route("/sign-out").get((req, res) => {
    providerController.signOut(req, res);
});
// // Route for refresh token
providerRoute.route("/refresh-token").post((req, res) => {
    providerController.refreshToken(req, res);
});
//--------------------------------------------------------Otp routes--------------------------------------------------------
// // Route for OTP verification during sign-up
providerRoute.route("/verify-otp").post((req, res) => {
    providerController.otpVerify(req, res);
});
// // Route to resend OTP during sign-up/sign-in
providerRoute.route("/resend-otp").post((req, res) => {
    providerController.otpResend(req, res);
});
//--------------------------------------------------------Service routes--------------------------------------------------------
//route to get all services
providerRoute.route("/services").get((req, res) => {
    providerController.getAllServices(req, res);
});
//---------------------------------------------------------Profile routes-----------------------------------------------
providerRoute
    .route("/:id/profile")
    .all(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default)
    .patch(Multer_1.upload.single("image"), (req, res) => {
    providerController.updateProfile(req, res);
})
    .get((req, res) => {
    providerController.fetchProfile(req, res);
});
//----------------------------------------------Register routes-------------------------------------------------
//provider register for approval
providerRoute.route("/:id/register").post(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, Multer_1.upload.fields([
    { name: "aadharImage", maxCount: 1 },
    { name: "workImages", maxCount: 2 },
]), (req, res) => {
    providerController.registerProfile(req, res);
});
//----------------------------------------------Password routes-----------------------------------------------
// Route for forgot password mail verify
providerRoute.route("/forgot-password").post((req, res) => {
    providerController.forgotPassword(req, res);
});
// Route for forgot password otp verify
providerRoute.route("/verify-forgot-password-otp").post((req, res) => {
    providerController.forgotPasswordOtpVerify(req, res);
});
// Route for updating the new password
providerRoute.route("/reset-password").patch((req, res) => {
    providerController.resetPassword(req, res);
});
// Route for confirming old password
providerRoute
    .route("/:id/confirm-password")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), (req, res) => {
    providerController.confirmPassword(req, res);
});
//----------------------------------------------------Schedule routes------------------------------------------------------------
// Route for creating the schedule
providerRoute
    .route("/:id/schedules")
    .all(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default)
    .post((req, res) => {
    providerController.createSchedule(req, res);
})
    .get((req, res) => {
    providerController.getSchedule(req, res);
});
//-----------------------------------------------------Booking routes-------------------------------------------------------------
// Route for fetching the booking requests
providerRoute
    .route("/:id/booking-requests")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.getBookingRequests(req, res);
});
// Route for updating the booking requests
providerRoute
    .route("/booking-requests/:id")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.updateBookingRequestStatus(req, res);
});
// Route for listing bookings
providerRoute
    .route("/:id/bookings")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.getBookings(req, res);
});
// Route for booking detail
providerRoute
    .route("/bookings/:id")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.getBookingDetails(req, res);
});
//-------------------------------------------------Payment routes-------------------------------------------------------
// Route for booking payments (Cash payment and Online payment request)
providerRoute
    .route("/bookings/:id/payments")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.createPaymentRequest(req, res);
});
//---------------------------------------------Chat routes-----------------------------------------------
// Route for fetching chats
providerRoute
    .route("/:id/chats")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.fetchChat(req, res);
});
//---------------------------------------------Dashboard routes-----------------------------------------------
// Route for fetching dashboard details
providerRoute
    .route("/:id/dashboard")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.fetchDashboard(req, res);
});
//---------------------------------------------Report routes-----------------------------------------------
// Route for reporting user
providerRoute
    .route("/bookings/:id/report")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.report(req, res);
});
//---------------------------------------------Notification routes-----------------------------------------------
// Route for fetching notification count
providerRoute
    .route("/:id/notifications/count")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.fetchNotificationsCount(req, res);
});
//route for fetching notifications
providerRoute
    .route("/:id/notifications")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => providerController.fetchNotifications(req, res));
// Route for marking notification
providerRoute
    .route("/notifications/:id")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["provider"]), BlockCheck_1.default, (req, res) => {
    providerController.markNotification(req, res);
});
exports.default = providerRoute;
