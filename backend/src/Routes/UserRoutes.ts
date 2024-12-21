import express, {Router, Request, Response} from "express";
import UserServices from "../Services/UserServices";
import UserController from "../Controllers/UserController";
import UserRepository from "../Repositories/UserRepository";
import userAuth from "../Middlewares/JwtVerify";
import verifyTokenAndRole from "../Middlewares/JwtVerify";

const userRepository = new UserRepository(); // Initialize repository instance
const userService = new UserServices(userRepository); // Dependency injection of repository into service
const userController = new UserController(userService); // Dependency injection of service into controller

// Initialize router instance
const userRoute: Router = express.Router();

// Route for user registration (sign-up)
userRoute.post("/sign_up", (req, res) => {
     userController.signUp(req, res);
});

// Route for OTP verification during sign-up
userRoute.post("/otp_verify", (req, res) => {
     userController.otpVerify(req, res);
});

// Route to resend OTP during sign-up/sign-in
userRoute.post("/otp_resend", (req, res) => {
     userController.otpResend(req, res);
});

// Route for user login (sign-in)
userRoute.post("/sign_in", (req, res) => {
     userController.signIn(req, res);
});

// Route for user logout
userRoute.post("/sign_out", (req, res) => {
     userController.signOut(req, res);
});

// Route for refresh token
userRoute.post("/refresh_token", (req, res) => {
     userController.refreshToken(req, res);
});

// Route for update profile
userRoute.post("/update_profile", (req, res) => {
     userController.updateProfile(req, res);
});

// Route for testing token
userRoute.get("/test", verifyTokenAndRole(["user"]), (req, res) => {
     userController.test(req, res);
});

// Route for oauth
userRoute.get("/o_auth", (req, res) => {
     userController.googleAuth(req, res);
});

export default userRoute;
