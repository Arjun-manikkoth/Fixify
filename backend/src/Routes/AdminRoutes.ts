import express, {Router, Request, Response} from "express";
import AdminService from "../Services/AdminServices";
import AdminController from "../Controllers/AdminController";
import AdminRepository from "../Repositories/AdminRepository";
import verifyToken from "../Middlewares/JwtVerify";

const adminRepository = new AdminRepository(); // Initialize repository instance
const adminService = new AdminService(adminRepository); // Dependency injection of repository into service
const adminController = new AdminController(adminService); // Dependency injection of service into controller

// // Initialize router instance
const adminRoute: Router = express.Router();

// // Route for provider login (sign-in)
adminRoute.post("/sign_in", adminController.signIn.bind(adminController));

// // Route for provider logout
adminRoute.post("/sign_out", adminController.signOut.bind(adminController));

// // Route for refresh token
adminRoute.post("/refresh_token", adminController.refreshToken.bind(adminController));

// // Route for testing token
adminRoute.post("/test", verifyToken, adminController.test.bind(adminController));

export default adminRoute;
