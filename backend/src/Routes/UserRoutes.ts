import express, { Router } from "express";
import verifyToken from "../Middlewares/JwtVerify";
import verifyRole from "../Middlewares/VerifyRole";
import checkBlockedStatus from "../Middlewares/BlockCheck";
import UserServices from "../Services/UserServices";
import UserController from "../Controllers/UserController";
import UserRepository from "../Repositories/UserRepository";
import OtpRepository from "../Repositories/OtpRepository";
import AddressRepository from "../Repositories/AddressRepository";
import ScheduleRepository from "../Repositories/ScheduleRepository";
import BookingRepository from "../Repositories/BookingRepository";
import PaymentRepository from "../Repositories/PaymentRepository";
import ChatRepository from "../Repositories/ChatRepository";
import ReviewRepository from "../Repositories/ReviewRepository";
import ReportRepository from "../Repositories/ReportRepository";
import NotificationRepository from "../Repositories/NotificationRepository";
import { upload } from "../Utils/Multer";

const userRepository = new UserRepository(); // Initialize repository instance
const otpRepository = new OtpRepository(); // Initialize repository instance
const addressRepository = new AddressRepository(); //creates an instance of address repository
const scheduleRepository = new ScheduleRepository(); // creates an instance of schedule repository
const bookingRepository = new BookingRepository(); // creates an instance of booking repository
const paymentRepository = new PaymentRepository(); // creates and instance of payment repository
const chatRepository = new ChatRepository(); // creates and instance of chat repository
const reviewRepository = new ReviewRepository(); // creates and instance of review repository
const reportRepository = new ReportRepository(); // creates and instance of report repository
const notificationRepository = new NotificationRepository(); // creates and instance of notification repository

const userService = new UserServices(
    userRepository,
    otpRepository,
    addressRepository,
    scheduleRepository,
    bookingRepository,
    paymentRepository,
    chatRepository,
    reviewRepository,
    reportRepository,
    notificationRepository
);

// Dependency injection of repository into service
const userController = new UserController(userService); // Dependency injection of service into controller

// Initialize user router instance
const userRoute: Router = express.Router();

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
    .post(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.confirmPassword(req, res)
    );

//----------------------------------------------Address Routes-----------------------------------------------
userRoute
    .route("/:id/addresses")
    .all(verifyToken, verifyRole(["user"]), checkBlockedStatus)
    .post((req, res) => userController.createAddress(req, res))
    .get((req, res) => userController.getAddresses(req, res))
    .delete((req, res) => userController.deleteAddresses(req, res));

userRoute
    .route("/addresses/:id")
    .all(verifyToken, verifyRole(["user"]), checkBlockedStatus)
    .get((req, res) => userController.getAddress(req, res))
    .patch((req, res) => userController.updateAddress(req, res));

//---------------------------------------------Slot Routes-----------------------------------------------

userRoute
    .route("/slots")
    .get(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.fetchSlots(req, res)
    );

userRoute
    .route("/:id/slots")
    .patch(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.requestSlots(req, res)
    );

//----------------------------------------------Profile Routes-----------------------------------------------
userRoute
    .route("/:id/profile")
    .get((req, res) => userController.getUser(req, res))
    .patch(upload.single("image"), (req, res) => userController.updateProfile(req, res));

//---------------------------------------------Booking Routes-----------------------------------------------
userRoute
    .route("/:id/bookings")
    .get(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.getBookings(req, res)
    );

userRoute
    .route("/bookings/:id")
    .get(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.getBookingDetails(req, res)
    );

userRoute
    .route("/bookings/:id/cancel")
    .patch(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.cancelBooking(req, res)
    );

//---------------------------------------------Payment Routes-----------------------------------------------
userRoute
    .route("/create-payment-intent")
    .post(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.createStripePayment(req, res)
    );

//---------------------------------------------Chat Routes-----------------------------------------------
userRoute
    .route("/:id/chats")
    .get(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.fetchChat(req, res)
    );

//---------------------------------------------Review Routes-----------------------------------------------
userRoute
    .route("/bookings/:id/reviews")
    .post(
        verifyToken,
        verifyRole(["user"]),
        checkBlockedStatus,
        upload.array("images", 3),
        (req, res) => userController.addReview(req, res)
    );

//---------------------------------------------Report Routes-----------------------------------------------
userRoute
    .route("/bookings/:id/report")
    .post(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.report(req, res)
    );

//---------------------------------------------Notification Routes-----------------------------------------------
userRoute
    .route("/:id/notifications/count")
    .get(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.fetchNotificationsCount(req, res)
    );

userRoute
    .route("/:id/notifications")
    .get(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.fetchNotifications(req, res)
    );

userRoute
    .route("/notifications/:id")
    .patch(verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) =>
        userController.markNotification(req, res)
    );

export default userRoute;
