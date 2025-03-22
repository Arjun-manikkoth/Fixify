import express, { Router } from "express";
import AdminService from "../Services/AdminServices";
import AdminController from "../Controllers/AdminController";
import AdminRepository from "../Repositories/AdminRepository";
import verifyToken from "../Middlewares/JwtVerify";
import verifyRole from "../Middlewares/VerifyRole";
import UserRepository from "../Repositories/UserRepository";
import ProviderRepository from "../Repositories/ProviderRepository";
import ApprovalRepository from "../Repositories/ApprovalRepository";
import ServiceRepository from "../Repositories/ServiceRepository";
import BookingRepository from "../Repositories/BookingRepository";
import PaymentRepository from "../Repositories/PaymentRepository";
import ReportRepository from "../Repositories/ReportRepository";

const adminRepository = new AdminRepository(); // Initialize admin repository instance
const userRepository = new UserRepository(); // Initialize user repository instance
const providerRepository = new ProviderRepository(); // Initialize provider repository instance
const approvalRepository = new ApprovalRepository(); // Initialize approval repository instance
const serviceRepository = new ServiceRepository(); // Initialize service repository instance
const bookingRepository = new BookingRepository(); // Initialize booking repository instance
const paymentRepository = new PaymentRepository(); // Initialize payment repository instance
const reportRepository = new ReportRepository(); // Initialize report repository instance

const adminService = new AdminService(
    adminRepository,
    userRepository,
    providerRepository,
    approvalRepository,
    serviceRepository,
    bookingRepository,
    paymentRepository,
    reportRepository
); // Dependency injection of repository into service
const adminController = new AdminController(adminService); // Dependency injection of service into controller

// // Initialize admin router instance
const adminRoute: Router = express.Router();

//--------------------------------------------Auth Routes-----------------------------------------------------

// // Route for provider login (sign-in)
adminRoute.post("/sign-in", (req, res) => {
    adminController.signIn(req, res);
});

// // Route for provider logout
adminRoute.get("/sign-out", (req, res) => {
    adminController.signOut(req, res);
});

// // Route for refresh token
adminRoute.post("/refresh-token", (req, res) => {
    adminController.refreshToken(req, res);
});

//---------------------------------------------User management-----------------------------------------------------

// // Route for fetching user datas
adminRoute.get("/users", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getUsers(req, res);
});

// // Route for blocking user
adminRoute.patch("/users/:id/block", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.blockUser(req, res);
});

// // Route for unblocking user
adminRoute.patch("/users/:id/unblock", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.unBlockUser(req, res);
});

//--------------------------------------------Approval management-----------------------------------------------------

// // Route for fetching approval detail datas
adminRoute.get("/approvals/:id", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.approvalDetails(req, res);
});

// // Route for fetching approval datas
adminRoute.get("/approvals", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getApprovals(req, res);
});

// // Route for approval status change
adminRoute.patch("/approvals/:id", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.approvalStatusUpdate(req, res);
});

//--------------------------------------------Provider management-----------------------------------------------------

// // Route for fetching provider datas
adminRoute.get("/providers", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getProviders(req, res);
});

// // Route for blocking provider
adminRoute.patch("/providers/:id/block", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.blockProvider(req, res);
});

// // Route for unblocking provider
adminRoute.patch("/providers/:id/unblock", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.unBlockProvider(req, res);
});

//--------------------------------------------Service routes-----------------------------------------------------

// // Route for fetching services
adminRoute.get("/services", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getAllServices(req, res);
});

// // Route for changing service status
adminRoute.patch("/services/:id/status", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.changeServiceStatus(req, res);
});

// // Route for fetching service detail
adminRoute.get("/services/:id", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getService(req, res);
});

// // Route for adding services
adminRoute.post("/services", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.addService(req, res);
});

// // Route for updating service data
adminRoute.patch("/services/:id", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.updateService(req, res);
});

//--------------------------------------------Booking routes-----------------------------------------------------

// // Route for bookings listing
adminRoute.get("/bookings", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getBookings(req, res);
});

//---------------------------------------------Dashboard routes-----------------------------------------------------

// // Route for dashboard tiles listing
adminRoute.get("/dashboard", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getDashboard(req, res);
});

// // Route for dashboard tiles listing
adminRoute.get("/revenue", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getRevenue(req, res);
});

//---------------------------------------------Sales routes-----------------------------------------------------

// // Route for sales data listing
adminRoute.get("/sales", verifyToken, verifyRole(["admin"]), (req, res) => {
    adminController.getSales(req, res);
});

//---------------------------------------------Report routes-----------------------------------------------------

// // Route for sales data listing
adminRoute.get("/reports", verifyToken, verifyRole(["admin"]), (req, res) => {
    console.log("reports");
    adminController.fetchReportsList(req, res);
});

export default adminRoute;
