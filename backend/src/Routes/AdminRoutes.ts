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
import checkBlockedStatus from "../Middlewares/BlockCheck";

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
adminRoute.route("/sign-in").post((req, res) => adminController.signIn(req, res));

adminRoute.route("/sign-out").get((req, res) => adminController.signOut(req, res));

adminRoute.route("/refresh-token").post((req, res) => adminController.refreshToken(req, res));

//---------------------------------------------User Management-----------------------------------------------------
adminRoute
    .route("/users")
    .get(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.getUsers(req, res)
    );

adminRoute
    .route("/users/:id/block")
    .patch(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.blockUser(req, res)
    );

adminRoute
    .route("/users/:id/unblock")
    .patch(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.unBlockUser(req, res)
    );

//--------------------------------------------Approval Management-----------------------------------------------------
adminRoute
    .route("/approvals")
    .get(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.getApprovals(req, res)
    );

adminRoute
    .route("/approvals/:id")
    .get(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.approvalDetails(req, res)
    )
    .patch(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.approvalStatusUpdate(req, res)
    );

//--------------------------------------------Provider Management-----------------------------------------------------

adminRoute
    .route("/providers")
    .get(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.getProviders(req, res)
    );

adminRoute
    .route("/providers/:id/block")
    .patch(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.blockProvider(req, res)
    );

adminRoute
    .route("/providers/:id/unblock")
    .patch(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.unBlockProvider(req, res)
    );

//--------------------------------------------Service Routes-----------------------------------------------------
adminRoute
    .route("/services")
    .all(verifyToken, verifyRole(["admin"]), checkBlockedStatus)
    .get((req, res) => adminController.getAllServices(req, res))
    .post((req, res) => adminController.addService(req, res));

adminRoute
    .route("/services/:id/status")
    .patch(verifyToken, verifyRole(["admin"]), checkBlockedStatus, (req, res) =>
        adminController.changeServiceStatus(req, res)
    );

adminRoute
    .route("/services/:id")
    .all(verifyToken, verifyRole(["admin"]), checkBlockedStatus)
    .get((req, res) => adminController.getService(req, res))
    .patch((req, res) => adminController.updateService(req, res));

//--------------------------------------------Booking Routes-----------------------------------------------------
adminRoute
    .route("/bookings")
    .get(verifyToken, verifyRole(["admin"]), (req, res) => adminController.getBookings(req, res));

//---------------------------------------------Dashboard Routes-----------------------------------------------------
adminRoute
    .route("/dashboard")
    .get(verifyToken, verifyRole(["admin"]), (req, res) => adminController.getDashboard(req, res));

adminRoute
    .route("/revenue")
    .get(verifyToken, verifyRole(["admin"]), (req, res) => adminController.getRevenue(req, res));

//---------------------------------------------Sales Routes-----------------------------------------------------
adminRoute
    .route("/sales")
    .get(verifyToken, verifyRole(["admin"]), (req, res) => adminController.getSales(req, res));

//---------------------------------------------Report Routes-----------------------------------------------------
adminRoute
    .route("/reports")
    .get(verifyToken, verifyRole(["admin"]), (req, res) =>
        adminController.fetchReportsList(req, res)
    );

export default adminRoute;
