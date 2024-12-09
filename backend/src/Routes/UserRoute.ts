import express, { Router, Request, Response } from "express";
import UserServices from "../Services/UserServices";
import UserController from "../Controllers/UserController";
import UserRepository from "../Repositories/UserRepository";

const userRepository = new UserRepository()
const userService = new UserServices(userRepository)
const userController = new UserController(userService)

const userRoute: Router = express.Router();

userRoute.post("/sign_up", userController.signUp.bind(userController));
userRoute.post("/otp_verify", userController.otpVerify.bind(userController));
userRoute.post("/otp_resend", userController.otpResend.bind(userController));
userRoute.post("/sign_in", userController.signIn.bind(userController));

export default userRoute;
