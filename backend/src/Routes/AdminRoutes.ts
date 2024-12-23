import express, {Router, Request, Response} from "express";
import AdminService from "../Services/AdminServices";
import AdminController from "../Controllers/AdminController";
import AdminRepository from "../Repositories/AdminRepository";
import verifyTokenAndRole from "../Middlewares/JwtVerify";

const adminRepository = new AdminRepository(); // Initialize repository instance
const adminService = new AdminService(adminRepository); // Dependency injection of repository into service
const adminController = new AdminController(adminService); // Dependency injection of service into controller

// // Initialize router instance
const adminRoute: Router = express.Router();

// // Route for provider login (sign-in)
adminRoute.post("/sign_in", (req, res) => {
     adminController.signIn(req, res);
});

// // Route for provider logout
adminRoute.post("/sign_out", (req, res) => {
     adminController.signOut(req, res);
});

// // Route for refresh token
adminRoute.post("/refresh_token", (req, res) => {
     adminController.refreshToken(req, res);
});

// // Route for fetching user datas
adminRoute.get("/users", verifyTokenAndRole(["admin"]), (req, res) => {
     adminController.getUsers(req, res);
});

// // Route for blocking user
adminRoute.get("/block_user", verifyTokenAndRole(["admin"]), (req, res) => {
     adminController.blockUser(req, res);
});
// // Route for unblocking user
adminRoute.get("/unblock_user", verifyTokenAndRole(["admin"]), (req, res) => {
     adminController.unBlockUser(req, res);
});

export default adminRoute;
