import express, {Router, Request, Response} from "express";
import ProviderService from "../Services/ProviderServices";
import ProviderController from "../Controllers/ProviderController";
import ProviderRepository from "../Repositories/ProviderRepository";
import verifyTokenAndRole from "../Middlewares/JwtVerify";

const providerRepository = new ProviderRepository(); // Initialize repository instance
const providerService = new ProviderService(providerRepository); // Dependency injection of repository into service
const providerController = new ProviderController(providerService); // Dependency injection of service into controller

// // Initialize router instance
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
providerRoute.post("/sign_out", (req, res) => {
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
providerRoute.post("/update_profile", verifyTokenAndRole(["provider"]), (req, res) => {
     providerController.updateProfile(req, res);
});

// Route for oauth
providerRoute.get("/o_auth", (req, res) => {
     providerController.googleAuth(req, res);
});

//get provider profile data
providerRoute.get("/profile", (req, res) => {
     providerController.fetchProfile(req, res);
});

//get provider profile data
providerRoute.post("/register", (req, res) => {
     providerController.registerProfile(req, res);
});

export default providerRoute;
