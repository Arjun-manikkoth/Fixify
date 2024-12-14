import express, { Router, Request, Response } from "express";
import UserServices from "../Services/UserServices";
import UserController from "../Controllers/UserController";
import UserRepository from "../Repositories/UserRepository";
import userAuth from "../Middlewares/JwtVerify";
import verifyToken from "../Middlewares/JwtVerify";


const userRepository = new UserRepository(); // Initialize repository instance
const userService = new UserServices(userRepository); // Dependency injection of repository into service
const userController = new UserController(userService); // Dependency injection of service into controller


// Initialize router instance
const userRoute: Router = express.Router();

// Route for user registration (sign-up)
userRoute.post("/sign_up",userController.signUp.bind(userController));

// Route for OTP verification during sign-up
userRoute.post("/otp_verify", userController.otpVerify.bind(userController));

// Route to resend OTP during sign-up/sign-in
userRoute.post("/otp_resend", userController.otpResend.bind(userController));

// Route for user login (sign-in)
userRoute.post("/sign_in", userController.signIn.bind(userController));

// Route for user logout 
userRoute.post("/sign_out", userController.signOut.bind(userController));

// Route for refresh token 
userRoute.post("/refresh_token", userController.refreshToken.bind(userController));

// Route for testing token
userRoute.post("/test",verifyToken , userController.test.bind(userController));

export default userRoute;
