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

const providerRepository = new ProviderRepository(); // Initialise repository instance
const otpRepository = new OtpRepository(); // Initialise otp repository instance
const serviceRepository = new ServiceRepository(); //initialise service repository
const approvalRepository = new ApprovalRepository(); //initialise approval repository
const scheduleRepository = new ScheduleRepository();

const providerService = new ProviderService(
    providerRepository,
    otpRepository,
    serviceRepository,
    approvalRepository,
    scheduleRepository
);

// Dependency injection of repository into service
const providerController = new ProviderController(providerService); // Dependency injection of service into controller

// // Initialize provider router instance
const providerRoute: Router = express.Router();

// // Route for provider registration (sign-up)
providerRoute.post("/sign_up", (req, res) => {
    providerController.signUp(req, res);
});

// // Route for OTP verification during sign-up
providerRoute.post("/otp_verify", (req, res) => {
    providerController.otpVerify(req, res);
});

// // Route to resend OTP during sign-up/sign-in
providerRoute.post("/otp_resend", (req, res) => {
    providerController.otpResend(req, res);
});

// // Route for provider login (sign-in)
providerRoute.post("/sign_in", (req, res) => {
    providerController.signIn(req, res);
});

// // Route for provider logout
providerRoute.get("/sign_out", (req, res) => {
    providerController.signOut(req, res);
});

// // Route for refresh token
providerRoute.post("/refresh_token", (req, res) => {
    providerController.refreshToken(req, res);
});

//route to get all services
providerRoute.get("/services", (req, res) => {
    providerController.getAllServices(req, res);
});

// Route for update profile
providerRoute.patch(
    "/update_profile",
    verifyToken,
    verifyRole(["provider"]),
    checkBlockedStatus,
    (req, res) => {
        providerController.updateProfile(req, res);
    }
);

// Route for oauth
providerRoute.patch("/o_auth", (req, res) => {
    providerController.googleAuth(req, res);
});

//get provider profile data
providerRoute.get(
    "/profile",
    verifyToken,
    verifyRole(["provider"]),
    checkBlockedStatus,
    (req, res) => {
        providerController.fetchProfile(req, res);
    }
);

//provider register for approval
providerRoute.post("/register", (req, res) => {
    providerController.registerProfile(req, res);
});

// Route for forgot password mail verify
providerRoute.post("/forgot_password", (req, res) => {
    providerController.forgotPassword(req, res);
});

// Route for forgot password otp verify
providerRoute.post("/forgot_otp_verify", (req, res) => {
    providerController.forgotPasswordOtpVerify(req, res);
});

// Route for updating the new password
providerRoute.patch("/reset_password", (req, res) => {
    providerController.resetPassword(req, res);
});

// Route for confirming old password
providerRoute.post("/confirm_password/:id", (req, res) => {
    providerController.confirmPassword(req, res);
});

// Route for creating the schedule
providerRoute.post("/schedule", (req, res) => {
    providerController.createSchedule(req, res);
});

// Route for fetching the schedule
providerRoute.get("/schedule", (req, res) => {
    providerController.getSchedule(req, res);
});

export default providerRoute;
