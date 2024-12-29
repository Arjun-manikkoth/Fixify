import express, {Router, Request, Response} from "express";
import AdminService from "../Services/AdminServices";
import AdminController from "../Controllers/AdminController";
import AdminRepository from "../Repositories/AdminRepository";
import verifyToken from "../Middlewares/JwtVerify";
import verifyRole from "../Middlewares/verifyRole";

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
adminRoute.get("/sign_out", (req, res) => {
     adminController.signOut(req, res);
});

// // Route for refresh token
adminRoute.post("/refresh_token", (req, res) => {
     adminController.refreshToken(req, res);
});

// // Route for fetching user datas
adminRoute.get("/users", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.getUsers(req, res);
});

// // Route for blocking user
adminRoute.patch("/block_user", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.blockUser(req, res);
});
// // Route for unblocking user
adminRoute.patch("/unblock_user", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.unBlockUser(req, res);
});

// // Route for fetching provider datas
adminRoute.get("/providers", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.getProviders(req, res);
});

// // Route for fetching approval datas
adminRoute.get("/approvals", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.getApprovals(req, res);
});

// // Route for fetching approval detail datas
adminRoute.get("/approval_details/:id", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.approvalDetails(req, res);
});

// // Route for blocking provider
adminRoute.patch("/block_provider", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.blockProvider(req, res);
});
// // Route for unblocking provider
adminRoute.patch("/unblock_provider", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.unBlockProvider(req, res);
});

// // Route for approval status change
adminRoute.patch("/approval_update/:id/:status", verifyToken, verifyRole(["admin"]), (req, res) => {
     adminController.approvalStatusUpdate(req, res);
});

export default adminRoute;
