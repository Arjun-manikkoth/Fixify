import express, {Router, Request, Response} from "express";
import ProviderService from "../Services/ProviderServices";
import ProviderController from "../Controllers/ProviderController";
import ProviderRepository from "../Repositories/ProviderRepository";
import verifyToken from "../Middlewares/JwtVerify";

const providerRepository = new ProviderRepository(); // Initialize repository instance
const providerService = new ProviderService(providerRepository); // Dependency injection of repository into service
const providerController = new ProviderController(providerService); // Dependency injection of service into controller

// // Initialize router instance
const providerRoute: Router = express.Router();

// // Route for provider registration (sign-up)
providerRoute.post("/sign_up", providerController.signUp.bind(providerController));

// // Route for OTP verification during sign-up
providerRoute.post("/otp_verify", providerController.otpVerify.bind(providerController));

// // Route to resend OTP during sign-up/sign-in
providerRoute.post("/otp_resend", providerController.otpResend.bind(providerController));

// // Route for provider login (sign-in)
providerRoute.post("/sign_in", providerController.signIn.bind(providerController));

// // Route for provider logout
providerRoute.post("/sign_out", providerController.signOut.bind(providerController));

// // Route for refresh token
providerRoute.post("/refresh_token", providerController.refreshToken.bind(providerController));

// // Route for testing token
providerRoute.post("/test", verifyToken, providerController.test.bind(providerController));

//route to get all services
providerRoute.get("/services", providerController.getAllServices.bind(providerController));

export default providerRoute;
