"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminServices_1 = __importDefault(require("../Services/AdminServices"));
const AdminController_1 = __importDefault(require("../Controllers/AdminController"));
const AdminRepository_1 = __importDefault(require("../Repositories/AdminRepository"));
const JwtVerify_1 = __importDefault(require("../Middlewares/JwtVerify"));
const VerifyRole_1 = __importDefault(require("../Middlewares/VerifyRole"));
const UserRepository_1 = __importDefault(require("../Repositories/UserRepository"));
const ProviderRepository_1 = __importDefault(require("../Repositories/ProviderRepository"));
const ApprovalRepository_1 = __importDefault(require("../Repositories/ApprovalRepository"));
const ServiceRepository_1 = __importDefault(require("../Repositories/ServiceRepository"));
const BookingRepository_1 = __importDefault(require("../Repositories/BookingRepository"));
const PaymentRepository_1 = __importDefault(require("../Repositories/PaymentRepository"));
const ReportRepository_1 = __importDefault(require("../Repositories/ReportRepository"));
const adminRepository = new AdminRepository_1.default(); // Initialize admin repository instance
const userRepository = new UserRepository_1.default(); // Initialize user repository instance
const providerRepository = new ProviderRepository_1.default(); // Initialize provider repository instance
const approvalRepository = new ApprovalRepository_1.default(); // Initialize approval repository instance
const serviceRepository = new ServiceRepository_1.default(); // Initialize service repository instance
const bookingRepository = new BookingRepository_1.default(); // Initialize booking repository instance
const paymentRepository = new PaymentRepository_1.default(); // Initialize payment repository instance
const reportRepository = new ReportRepository_1.default(); // Initialize report repository instance
const adminService = new AdminServices_1.default(adminRepository, userRepository, providerRepository, approvalRepository, serviceRepository, bookingRepository, paymentRepository, reportRepository);
// Dependency injection of repository into service
const adminController = new AdminController_1.default(adminService); // Dependency injection of service into controller
// // Initialize admin router instance
const adminRoute = express_1.default.Router();
//--------------------------------------------Auth Routes-----------------------------------------------------
adminRoute.route("/sign-in").post((req, res) => adminController.signIn(req, res));
adminRoute.route("/sign-out").get((req, res) => adminController.signOut(req, res));
adminRoute.route("/refresh-token").post((req, res) => adminController.refreshToken(req, res));
//---------------------------------------------User Management-----------------------------------------------------
adminRoute
    .route("/users")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getUsers(req, res));
adminRoute
    .route("/users/:id/block")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.blockUser(req, res));
adminRoute
    .route("/users/:id/unblock")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.unBlockUser(req, res));
//--------------------------------------------Approval Management-----------------------------------------------------
adminRoute
    .route("/approvals")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getApprovals(req, res));
adminRoute
    .route("/approvals/:id")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.approvalDetails(req, res))
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.approvalStatusUpdate(req, res));
//--------------------------------------------Provider Management-----------------------------------------------------
adminRoute
    .route("/providers")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getProviders(req, res));
adminRoute
    .route("/providers/:id/block")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.blockProvider(req, res));
adminRoute
    .route("/providers/:id/unblock")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.unBlockProvider(req, res));
//--------------------------------------------Service Routes-----------------------------------------------------
adminRoute
    .route("/services")
    .all(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]))
    .get((req, res) => adminController.getAllServices(req, res))
    .post((req, res) => adminController.addService(req, res));
adminRoute
    .route("/services/:id/status")
    .patch(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.changeServiceStatus(req, res));
adminRoute
    .route("/services/:id")
    .all(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]))
    .get((req, res) => adminController.getService(req, res))
    .patch((req, res) => adminController.updateService(req, res));
//--------------------------------------------Booking Routes-----------------------------------------------------
adminRoute
    .route("/bookings")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getBookings(req, res));
//---------------------------------------------Dashboard Routes-----------------------------------------------------
adminRoute
    .route("/dashboard")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getDashboard(req, res));
adminRoute
    .route("/revenue")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getRevenue(req, res));
//---------------------------------------------Sales Routes-----------------------------------------------------
adminRoute
    .route("/sales")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.getSales(req, res));
//---------------------------------------------Report Routes-----------------------------------------------------
adminRoute
    .route("/reports")
    .get(JwtVerify_1.default, (0, VerifyRole_1.default)(["admin"]), (req, res) => adminController.fetchReportsList(req, res));
exports.default = adminRoute;
