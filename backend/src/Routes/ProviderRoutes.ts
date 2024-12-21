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

// // Route for testing token
providerRoute.get("/test", verifyTokenAndRole(["provider"]), (req, res) => {
     providerController.test(req, res);
});

//route to get all services
providerRoute.get("/services", (req, res) => {
     providerController.getAllServices(req, res);
});

// Route for oauth
providerRoute.get("/o_auth", (req, res) => {
     providerController.googleAuth(req, res);
});

export default providerRoute;
