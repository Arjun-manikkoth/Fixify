"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const JwtVerify_1 = __importDefault(require("../Middlewares/JwtVerify"));
const VerifyRole_1 = __importDefault(require("../Middlewares/VerifyRole"));
const BlockCheck_1 = __importDefault(require("../Middlewares/BlockCheck"));
const UserServices_1 = __importDefault(require("../Services/UserServices"));
const UserController_1 = __importDefault(require("../Controllers/UserController"));
const UserRepository_1 = __importDefault(require("../Repositories/UserRepository"));
const OtpRepository_1 = __importDefault(require("../Repositories/OtpRepository"));
const AddressRepository_1 = __importDefault(require("../Repositories/AddressRepository"));
const ScheduleRepository_1 = __importDefault(require("../Repositories/ScheduleRepository"));
const BookingRepository_1 = __importDefault(require("../Repositories/BookingRepository"));
const PaymentRepository_1 = __importDefault(require("../Repositories/PaymentRepository"));
const ChatRepository_1 = __importDefault(require("../Repositories/ChatRepository"));
const ReviewRepository_1 = __importDefault(require("../Repositories/ReviewRepository"));
const ReportRepository_1 = __importDefault(require("../Repositories/ReportRepository"));
const NotificationRepository_1 = __importDefault(require("../Repositories/NotificationRepository"));
const Multer_1 = require("../Utils/Multer");
const userRepository = new UserRepository_1.default(); // Initialize repository instance
const otpRepository = new OtpRepository_1.default(); // Initialize repository instance
const addressRepository = new AddressRepository_1.default(); //creates an instance of address repository
const scheduleRepository = new ScheduleRepository_1.default(); // creates an instance of schedule repository
const bookingRepository = new BookingRepository_1.default(); // creates an instance of booking repository
const paymentRepository = new PaymentRepository_1.default(); // creates and instance of payment repository
const chatRepository = new ChatRepository_1.default(); // creates and instance of chat repository
const reviewRepository = new ReviewRepository_1.default(); // creates and instance of review repository
const reportRepository = new ReportRepository_1.default(); // creates and instance of report repository
const notificationRepository = new NotificationRepository_1.default(); // creates and instance of notification repository
const userService = new UserServices_1.default(userRepository, otpRepository, addressRepository, scheduleRepository, bookingRepository, paymentRepository, chatRepository, reviewRepository, reportRepository, notificationRepository);
// Dependency injection of repository into service
const userController = new UserController_1.default(userService); // Dependency injection of service into controller
// Initialize user router instance
const userRoute = express_1.default.Router();
//--------------------------------------------Auth Routes-----------------------------------------------------
userRoute.route("/sign-in").post((req, res) => userController.signIn(req, res));
userRoute.route("/sign-up").post((req, res) => userController.signUp(req, res));
userRoute.route("/o-auth").patch((req, res) => userController.googleAuth(req, res));
userRoute.route("/sign-out").get((req, res) => userController.signOut(req, res));
//--------------------------------------------------------Token Routes--------------------------------------------------------
userRoute.route("/refresh-token").post((req, res) => userController.refreshToken(req, res));
//--------------------------------------------------------OTP Routes--------------------------------------------------------
userRoute.route("/verify-otp").post((req, res) => userController.otpVerify(req, res));
userRoute.route("/resend-otp").post((req, res) => userController.otpResend(req, res));
//----------------------------------------------Password Routes-----------------------------------------------
userRoute.route("/forgot-password").post((req, res) => userController.forgotPassword(req, res));
userRoute
    .route("/verify-forgot-password-otp")
    .post((req, res) => userController.forgotPasswordOtpVerify(req, res));
userRoute.route("/reset-password").patch((req, res) => userController.resetPassword(req, res));
userRoute
    .route("/:id/confirm-password")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.confirmPassword(req, res));
//----------------------------------------------Address Routes-----------------------------------------------
userRoute
    .route("/:id/addresses")
    .all(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default)
    .post((req, res) => userController.createAddress(req, res))
    .get((req, res) => userController.getAddresses(req, res))
    .delete((req, res) => userController.deleteAddresses(req, res));
userRoute
    .route("/addresses/:id")
    .all(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default)
    .get((req, res) => userController.getAddress(req, res))
    .patch((req, res) => userController.updateAddress(req, res));
//---------------------------------------------Slot Routes-----------------------------------------------
userRoute
    .route("/slots")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.fetchSlots(req, res));
userRoute
    .route("/:id/slots")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.requestSlots(req, res));
//----------------------------------------------Profile Routes-----------------------------------------------
userRoute
    .route("/:id/profile")
    .get((req, res) => userController.getUser(req, res))
    .patch(Multer_1.upload.single("image"), (req, res) => userController.updateProfile(req, res));
//---------------------------------------------Booking Routes-----------------------------------------------
userRoute
    .route("/:id/bookings")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.getBookings(req, res));
userRoute
    .route("/bookings/:id")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.getBookingDetails(req, res));
userRoute
    .route("/bookings/:id/cancel")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.cancelBooking(req, res));
//---------------------------------------------Payment Routes-----------------------------------------------
userRoute
    .route("/create-payment-intent")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.createStripePayment(req, res));
//---------------------------------------------Chat Routes-----------------------------------------------
userRoute
    .route("/:id/chats")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.fetchChat(req, res));
//---------------------------------------------Review Routes-----------------------------------------------
userRoute
    .route("/bookings/:id/reviews")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, Multer_1.upload.array("images", 3), (req, res) => userController.addReview(req, res));
//---------------------------------------------Report Routes-----------------------------------------------
userRoute
    .route("/bookings/:id/report")
    .post(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.report(req, res));
//---------------------------------------------Notification Routes-----------------------------------------------
userRoute
    .route("/:id/notifications/count")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.fetchNotificationsCount(req, res));
userRoute
    .route("/:id/notifications")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.fetchNotifications(req, res));
userRoute
    .route("/notifications/:id")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["user"]), BlockCheck_1.default, (req, res) => userController.markNotification(req, res));
exports.default = userRoute;
