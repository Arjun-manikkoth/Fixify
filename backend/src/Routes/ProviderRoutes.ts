import express, { Router } from "express";
import checkBlockedStatus from "../Middlewares/BlockCheck";
import verifyToken from "../Middlewares/JwtVerify";
import verifyRole from "../Middlewares/VerifyRole";
import ProviderService from "../Services/ProviderServices";
import ProviderController from "../Controllers/ProviderController";
import ProviderRepository from "../Repositories/ProviderRepository";
import OtpRepository from "../Repositories/OtpRepository";
import ServiceRepository from "../Repositories/ServiceRepository";
import ApprovalRepository from "../Repositories/ApprovalRepository";
import ScheduleRepository from "../Repositories/ScheduleRepository";
import BookingRepository from "../Repositories/BookingRepository";
import PaymentRepository from "../Repositories/PaymentRepository";
import ChatRepository from "../Repositories/ChatRepository";
import UserRepository from "../Repositories/UserRepository";
import ReportRepository from "../Repositories/ReportRepository";
import NotificationRepository from "../Repositories/NotificationRepository";
import { upload } from "../Utils/Multer";

const providerRepository = new ProviderRepository(); // Initialise repository instance
const otpRepository = new OtpRepository(); // Initialise otp repository instance
const serviceRepository = new ServiceRepository(); //initialise service repository
const approvalRepository = new ApprovalRepository(); //initialise approval repository
const scheduleRepository = new ScheduleRepository(); //initialise schedule repository
const bookingRepository = new BookingRepository(); //initialise booking repository
const paymentRepository = new PaymentRepository(); //initialise payment repository
const chatRepository = new ChatRepository(); //initialise chat repository
const userRepository = new UserRepository(); //initialise user repository
const reportRepository = new ReportRepository(); // creates and instance of report repository
const notificationRepository = new NotificationRepository(); // creates and instance of notification repository

const providerService = new ProviderService(
    providerRepository,
    otpRepository,
    serviceRepository,
    approvalRepository,
    scheduleRepository,
    bookingRepository,
    paymentRepository,
    chatRepository,
    userRepository,
    reportRepository,
    notificationRepository
);

// Dependency injection of repository into service
const providerController = new ProviderController(providerService); // Dependency injection of service into controller

// // Initialize provider router instance
const providerRoute: Router = express.Router();

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
    .all(verifyToken, verifyRole(["provider"]), checkBlockedStatus)
    .patch(upload.single("image"), (req, res) => {
        providerController.updateProfile(req, res);
    })
    .get((req, res) => {
        providerController.fetchProfile(req, res);
    });

//----------------------------------------------Register routes-------------------------------------------------

//provider register for approval
providerRoute.route("/:id/register").post(
    verifyToken,
    verifyRole(["provider"]),
    checkBlockedStatus,
    upload.fields([
        { name: "aadharImage", maxCount: 1 },
        { name: "workImages", maxCount: 2 },
    ]),
    (req, res) => {
        providerController.registerProfile(req, res);
    }
);

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
    .post(verifyToken, verifyRole(["provider"]), (req, res) => {
        providerController.confirmPassword(req, res);
    });

//----------------------------------------------------Schedule routes------------------------------------------------------------

// Route for creating the schedule
providerRoute
    .route("/:id/schedules")
    .all(verifyToken, verifyRole(["provider"]), checkBlockedStatus)
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
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.getBookingRequests(req, res);
    });

// Route for updating the booking requests
providerRoute
    .route("/booking-requests/:id")
    .patch(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.updateBookingRequestStatus(req, res);
    });

// Route for listing bookings
providerRoute
    .route("/:id/bookings")
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.getBookings(req, res);
    });

// Route for booking detail
providerRoute
    .route("/bookings/:id")
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.getBookingDetails(req, res);
    });

//-------------------------------------------------Payment routes-------------------------------------------------------

// Route for booking payments (Cash payment and Online payment request)
providerRoute
    .route("/bookings/:id/payments")
    .post(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.createPaymentRequest(req, res);
    });

//---------------------------------------------Chat routes-----------------------------------------------

// Route for fetching chats
providerRoute
    .route("/:id/chats")
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.fetchChat(req, res);
    });

//---------------------------------------------Dashboard routes-----------------------------------------------

// Route for fetching dashboard details
providerRoute
    .route("/:id/dashboard")
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.fetchDashboard(req, res);
    });

//---------------------------------------------Report routes-----------------------------------------------

// Route for reporting user
providerRoute
    .route("/bookings/:id/report")
    .post(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.report(req, res);
    });

//---------------------------------------------Notification routes-----------------------------------------------

// Route for fetching notification count
providerRoute
    .route("/:id/notifications/count")
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.fetchNotificationsCount(req, res);
    });

//route for fetching notifications
providerRoute
    .route("/:id/notifications")
    .get(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) =>
        providerController.fetchNotifications(req, res)
    );

// Route for marking notification
providerRoute
    .route("/notifications/:id")
    .patch(verifyToken, verifyRole(["provider"]), checkBlockedStatus, (req, res) => {
        providerController.markNotification(req, res);
    });

export default providerRoute;
