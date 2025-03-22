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
providerRoute.post("/sign-up", (req, res) => {
    providerController.signUp(req, res);
});

// // Route for provider login (sign-in)
providerRoute.post("/sign-in", (req, res) => {
    providerController.signIn(req, res);
});

// Route for oauth
providerRoute.patch("/o-auth", (req, res) => {
    providerController.googleAuth(req, res);
});

// // Route for provider logout
providerRoute.get("/sign-out", (req, res) => {
    providerController.signOut(req, res);
});

// // Route for refresh token
providerRoute.post("/refresh-token", (req, res) => {
    providerController.refreshToken(req, res);
});

//--------------------------------------------------------Otp routes--------------------------------------------------------

// // Route for OTP verification during sign-up
providerRoute.post("/verify-otp", (req, res) => {
    providerController.otpVerify(req, res);
});

// // Route to resend OTP during sign-up/sign-in
providerRoute.post("/resend-otp", (req, res) => {
    providerController.otpResend(req, res);
});

//--------------------------------------------------------Service routes--------------------------------------------------------

//route to get all services
providerRoute.get("/services", (req, res) => {
    providerController.getAllServices(req, res);
});

//---------------------------------------------------------Profile routes-----------------------------------------------

// Route for update profile
providerRoute.patch(
    "/:id/profile",
    verifyToken,
    verifyRole(["provider"]),
    checkBlockedStatus,
    upload.single("image"),
    (req, res) => {
        providerController.updateProfile(req, res);
    }
);

//get provider profile data
providerRoute.get(
    "/:id/profile",
    verifyToken,
    verifyRole(["provider"]),
    checkBlockedStatus,
    (req, res) => {
        providerController.fetchProfile(req, res);
    }
);

//----------------------------------------------Register routes-------------------------------------------------

//provider register for approval
providerRoute.post(
    "/:id/register",
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
providerRoute.post("/forgot-password", (req, res) => {
    providerController.forgotPassword(req, res);
});

// Route for forgot password otp verify
providerRoute.post("/verify-forgot-password-otp", (req, res) => {
    providerController.forgotPasswordOtpVerify(req, res);
});

// Route for updating the new password
providerRoute.patch("/reset-password", (req, res) => {
    providerController.resetPassword(req, res);
});

// Route for confirming old password
providerRoute.post("/:id/confirm-password", (req, res) => {
    providerController.confirmPassword(req, res);
});

//----------------------------------------------------Schedule routes------------------------------------------------------------

// Route for creating the schedule
providerRoute.post("/:id/schedules", (req, res) => {
    providerController.createSchedule(req, res);
});

// Route for fetching the schedule
providerRoute.get("/:id/schedules", (req, res) => {
    providerController.getSchedule(req, res);
});

//-----------------------------------------------------Booking routes-------------------------------------------------------------

// Route for fetching the booking requests
providerRoute.get("/:id/booking-requests", (req, res) => {
    providerController.getBookingRequests(req, res);
});

// Route for updating the booking requests
providerRoute.patch("/booking-requests/:id", (req, res) => {
    providerController.updateBookingRequestStatus(req, res);
});

// Route for listing bookings
providerRoute.get("/:id/bookings", (req, res) => {
    providerController.getBookings(req, res);
});

// Route for booking detail
providerRoute.get("/bookings/:id", (req, res) => {
    providerController.getBookingDetails(req, res);
});

//-------------------------------------------------Payment routes-------------------------------------------------------

// Route for booking payments (Cash payment and Online payment request)
providerRoute.post("/bookings/:id/payments", (req, res) => {
    providerController.createPaymentRequest(req, res);
});

// Route for fetching chats
providerRoute.get("/:id/chats", (req, res) => {
    providerController.fetchChat(req, res);
});

// Route for fetching dashboard details
providerRoute.get("/:id/dashboard", (req, res) => {
    providerController.fetchDashboard(req, res);
});

// Route for reporting user
providerRoute.post("/bookings/:id/report", (req, res) => {
    providerController.report(req, res);
});

//---------------------------------------------Notification routes-----------------------------------------------

// Route for fetching notification count
providerRoute.get("/:id/notifications/count", (req, res) => {
    providerController.fetchNotificationsCount(req, res);
});

// Route for marking notification
providerRoute.patch("/notifications/:id", (req, res) => {
    providerController.markNotification(req, res);
});

export default providerRoute;
