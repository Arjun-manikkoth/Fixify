"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ReportModel_1 = __importDefault(require("../Models/CommonModels/ReportModel"));
class ReportRepository {
    //creates new report
    addReport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const report = new ReportModel_1.default(data);
                return yield report.save();
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //checks duplicate report exists
    duplicateReport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield ReportModel_1.default.findOne({
                    booking_id: data.booking_id,
                    reporter_id: data.reporter_id,
                });
                return exists ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    getAllReports(page_1) {
        return __awaiter(this, arguments, void 0, function* (page, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const reports = yield ReportModel_1.default.aggregate([
                    // Stage 1: Lookup reporter details (User or Provider)
                    {
                        $lookup: {
                            from: "users",
                            localField: "reporter_id",
                            foreignField: "_id",
                            as: "reporterDetails",
                        },
                    },
                    {
                        $lookup: {
                            from: "providers",
                            localField: "reporter_id",
                            foreignField: "_id",
                            as: "reporterProviderDetails",
                        },
                    },
                    // Stage 2: Lookup reported user details (User or Provider)
                    {
                        $lookup: {
                            from: "users",
                            localField: "reported_id",
                            foreignField: "_id",
                            as: "reportedUserDetails",
                        },
                    },
                    {
                        $lookup: {
                            from: "providers",
                            localField: "reported_id",
                            foreignField: "_id",
                            as: "reportedProviderDetails",
                        },
                    },
                    // Stage 3: Add fields to determine reporter and reported user email and is_blocked
                    {
                        $addFields: {
                            reporter_email: {
                                $cond: {
                                    if: { $gt: [{ $size: "$reporterDetails" }, 0] },
                                    then: { $arrayElemAt: ["$reporterDetails.email", 0] },
                                    else: { $arrayElemAt: ["$reporterProviderDetails.email", 0] },
                                },
                            },
                            reported_email: {
                                $cond: {
                                    if: { $gt: [{ $size: "$reportedUserDetails" }, 0] },
                                    then: { $arrayElemAt: ["$reportedUserDetails.email", 0] },
                                    else: { $arrayElemAt: ["$reportedProviderDetails.email", 0] },
                                },
                            },
                            reporter_is_blocked: {
                                $cond: {
                                    if: { $gt: [{ $size: "$reporterDetails" }, 0] },
                                    then: { $arrayElemAt: ["$reporterDetails.is_blocked", 0] },
                                    else: { $arrayElemAt: ["$reporterProviderDetails.is_blocked", 0] },
                                },
                            },
                            reported_is_blocked: {
                                $cond: {
                                    if: { $gt: [{ $size: "$reportedUserDetails" }, 0] },
                                    then: { $arrayElemAt: ["$reportedUserDetails.is_blocked", 0] },
                                    else: { $arrayElemAt: ["$reportedProviderDetails.is_blocked", 0] },
                                },
                            },
                        },
                    },
                    // Sorts
                    {
                        $sort: { createdAt: -1 },
                    },
                    // Stage 4: Group by reported_id and reason
                    {
                        $group: {
                            _id: {
                                reported_id: "$reported_id",
                                reason: "$reason",
                            },
                            count: { $sum: 1 },
                            reports: { $push: "$$ROOT" },
                        },
                    },
                    // Stage 5: Group by reported_id to aggregate all reasons and counts
                    {
                        $group: {
                            _id: "$_id.reported_id",
                            totalReports: { $sum: "$count" },
                            reasons: {
                                $push: {
                                    reason: "$_id.reason",
                                    count: "$count",
                                },
                            },
                            reports: { $push: "$reports" },
                        },
                    },
                    // Stage 6: Unwind the reports array
                    {
                        $unwind: "$reports",
                    },
                    // Stage 7: Unwind the nested reports array
                    {
                        $unwind: "$reports",
                    },
                    // Stage 8: Project the required fields including is_blocked
                    {
                        $project: {
                            _id: 0,
                            reported_id: "$_id",
                            totalReports: 1,
                            reasons: 1,
                            booking_id: "$reports.booking_id",
                            reporter_id: "$reports.reporter_id",
                            reported_role: "$reports.reported_role",
                            reporter_email: "$reports.reporter_email",
                            reported_email: "$reports.reported_email",
                            reporter_is_blocked: "$reports.reporter_is_blocked", // Add reporter's is_blocked
                            reported_is_blocked: "$reports.reported_is_blocked", // Add reported user's is_blocked
                            reason: "$reports.reason",
                            createdAt: "$reports.createdAt",
                            updatedAt: "$reports.updatedAt",
                        },
                    },
                    // Stage 9: Pagination
                    { $skip: skip },
                    { $limit: limit },
                ]);
                const totalReports = yield ReportModel_1.default.countDocuments();
                return {
                    success: true,
                    message: "Fetched reports data",
                    data: {
                        reports,
                        totalPages: Math.ceil(totalReports / limit),
                        currentPage: page,
                    },
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
}
exports.default = ReportRepository;
