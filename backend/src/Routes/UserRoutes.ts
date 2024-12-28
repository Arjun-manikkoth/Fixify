import express, {Router, Request, Response} from "express";
import UserServices from "../Services/UserServices";
import UserController from "../Controllers/UserController";
import UserRepository from "../Repositories/UserRepository";
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
userRoute.get("/sign_out", (req, res) => {
     userController.signOut(req, res);
});

// Route for refresh token
userRoute.post("/refresh_token", (req, res) => {
     userController.refreshToken(req, res);
});

// Route for update profile
userRoute.patch("/update_profile", verifyTokenAndRole(["user"]), (req, res) => {
     userController.updateProfile(req, res);
});

// Route for oauth
userRoute.patch("/o_auth", (req, res) => {
     userController.googleAuth(req, res);
});

// Route for fetching user data with id
userRoute.get("/", verifyTokenAndRole(["user"]), (req, res) => {
     userController.getUser(req, res);
});

export default userRoute;
