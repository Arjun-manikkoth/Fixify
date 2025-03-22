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

// Route for user login (sign-in)
userRoute.post("/sign-in", (req, res) => {
    userController.signIn(req, res);
});

// Route for user registration (sign-up)
userRoute.post("/sign-up", (req, res) => {
    userController.signUp(req, res);
});

// Route for oauth
userRoute.patch("/o-auth", (req, res) => {
    userController.googleAuth(req, res);
});

// Route for user logout
userRoute.get("/sign-out", (req, res) => {
    userController.signOut(req, res);
});

//--------------------------------------------------------Token routes--------------------------------------------------------

// Route for refresh token
userRoute.post("/refresh-token", (req, res) => {
    userController.refreshToken(req, res);
});

//--------------------------------------------------------Otp routes--------------------------------------------------------

// Route for OTP verification during sign-up
userRoute.post("/verify-otp", (req, res) => {
    userController.otpVerify(req, res);
});

// Route to resend OTP during sign-up/sign-in
userRoute.post("/resend-otp", (req, res) => {
    userController.otpResend(req, res);
});

//----------------------------------------------Password routes-----------------------------------------------

// Route for forgot password mail verify
userRoute.post("/forgot-password", (req, res) => {
    userController.forgotPassword(req, res);
});

// Route for forgot password otp verify
userRoute.post("/verify-forgot-password-otp", (req, res) => {
    userController.forgotPasswordOtpVerify(req, res);
});

// Route for updating the new password
userRoute.patch("/reset-password", (req, res) => {
    userController.resetPassword(req, res);
});

// Route for confirming old password
userRoute.post("/:id/confirm-password", (req, res) => {
    userController.confirmPassword(req, res);
});

//----------------------------------------------Address routes-----------------------------------------------

// Route for add new address
userRoute.post("/:id/addresses", (req, res) => {
    userController.createAddress(req, res);
});

// Route for getting all addresses
userRoute.get("/:id/addresses", (req, res) => {
    userController.getAddresses(req, res);
});

// Route for delete address
userRoute.delete("/:id/addresses", (req, res) => {
    userController.deleteAddresses(req, res);
});

// Route for fetching user single address
userRoute.get("/addresses/:id", (req, res) => {
    userController.getAddress(req, res);
});

// Route for updating single address
userRoute.patch("/addresses/:id", (req, res) => {
    userController.updateAddress(req, res);
});

//---------------------------------------------Slot routes-----------------------------------------------

// Route for finding provider slots
userRoute.get("/slots", (req, res) => {
    userController.fetchSlots(req, res);
});

// Route for sending booking request
userRoute.patch("/:id/slots", (req, res) => {
    userController.requestSlots(req, res);
});

//----------------------------------------------Profile routes-----------------------------------------------

// Route for fetching user data with id
userRoute.get("/:id/profile", verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) => {
    userController.getUser(req, res);
});

// Route for update profile
userRoute.patch(
    "/:id/profile",
    verifyToken,
    verifyRole(["user"]),
    checkBlockedStatus,
    upload.single("image"),
    (req, res) => {
        userController.updateProfile(req, res);
    }
);

//---------------------------------------------Booking routes-----------------------------------------------

// Route for listing bookings
userRoute.get("/:id/bookings", (req, res) => {
    console.log("booking listing api called");
    userController.getBookings(req, res);
});

// Route for booking detail
userRoute.get("/bookings/:id", (req, res) => {
    userController.getBookingDetails(req, res);
});

// Route for cancel booking
userRoute.patch("/bookings/:id/cancel", (req, res) => {
    userController.cancelBooking(req, res);
});

//---------------------------------------------payment routes-----------------------------------------------

// Route for online payment
userRoute.post("/create-payment-intent", (req, res) => {
    userController.createStripePayment(req, res);
});

//---------------------------------------------Chat routes-----------------------------------------------

// Route for fetching chats
userRoute.get("/:id/chats", (req, res) => {
    userController.fetchChat(req, res);
});

//---------------------------------------------Review routes-----------------------------------------------

// Route for adding review
userRoute.post("/bookings/:id/reviews", upload.array("images", 3), (req, res) => {
    userController.addReview(req, res);
});

//---------------------------------------------Report routes-----------------------------------------------

// Route for reporting provider
userRoute.post("/bookings/:id/report", (req, res) => {
    userController.report(req, res);
});

//---------------------------------------------Notification routes-----------------------------------------------

// Route for fetching notification count
userRoute.get("/:id/notifications/count", (req, res) => {
    userController.fetchNotificationsCount(req, res);
});

// Route for fetching notifications
userRoute.get("/:id/notifications", (req, res) => {
    userController.fetchNotifications(req, res);
});

// Route for marking notification
userRoute.patch("/notifications/:id", (req, res) => {
    userController.fetchNotifications(req, res);
});

export default userRoute;
