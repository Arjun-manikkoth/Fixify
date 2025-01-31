import express, { Router } from "express";
import verifyToken from "../Middlewares/JwtVerify";
import verifyRole from "../Middlewares/VerifyRole";
import checkBlockedStatus from "../Middlewares/BlockCheck";
import UserServices from "../Services/UserServices";
import UserController from "../Controllers/UserController";
import UserRepository from "../Repositories/UserRepository";
import OtpRepository from "../Repositories/OtpRepository";
import AddressRepository from "../Repositories/AddressRepository";

const userRepository = new UserRepository(); // Initialize repository instance
const otpRepository = new OtpRepository(); // Initialize repository instance
const addressRepository = new AddressRepository(); //creates an instance of address repository
const userService = new UserServices(userRepository, otpRepository, addressRepository); // Dependency injection of repository into service
const userController = new UserController(userService); // Dependency injection of service into controller

// Initialize user router instance
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
userRoute.patch(
    "/update_profile",
    verifyToken,
    verifyRole(["user"]),
    checkBlockedStatus,
    (req, res) => {
        userController.updateProfile(req, res);
    }
);

// Route for oauth
userRoute.patch("/o_auth", (req, res) => {
    userController.googleAuth(req, res);
});

// Route for fetching user data with id
userRoute.get("/", verifyToken, verifyRole(["user"]), checkBlockedStatus, (req, res) => {
    userController.getUser(req, res);
});

// Route for forgot password mail verify
userRoute.post("/forgot_password", (req, res) => {
    userController.forgotPassword(req, res);
});

// Route for forgot password otp verify
userRoute.post("/forgot_otp_verify", (req, res) => {
    userController.forgotPasswordOtpVerify(req, res);
});

// Route for updating the new password
userRoute.patch("/reset_password", (req, res) => {
    userController.resetPassword(req, res);
});

// Route for confirming old password
userRoute.post("/confirm_password/:id", (req, res) => {
    userController.confirmPassword(req, res);
});

// Route for confirming old password
userRoute.post("/add_address", (req, res) => {
    userController.createAddress(req, res);
});

// Route for getting all addresses
userRoute.get("/addresses/:id", (req, res) => {
    userController.getAddresses(req, res);
});

// Route for delete address
userRoute.patch("/addresses/:id", (req, res) => {
    userController.deleteAddresses(req, res);
});

// Route for fetching user address data
userRoute.get("/address/:id", (req, res) => {
    userController.getAddress(req, res);
});

// Route for fetching user address data
userRoute.patch("/edit_address/:id", (req, res) => {
    userController.updateAddress(req, res);
});

export default userRoute;
