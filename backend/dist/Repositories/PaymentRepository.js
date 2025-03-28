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
const PaymentModel_1 = __importDefault(require("../Models/CommonModels/PaymentModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class PaymentRepository {
    //creates payment request and handle cod payment
    savePayment(amount, method) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payment_status = method === "by cash" ? "completed" : "pending";
                const payment = new PaymentModel_1.default({
                    amount: amount,
                    payment_mode: method,
                    payment_status: payment_status,
                    site_fee: Math.ceil((amount * 10) / 100),
                });
                const status = yield payment.save();
                return status
                    ? { success: true, message: "Saved payment successfully", data: status }
                    : {
                        success: false,
                        message: "Failed to save payment",
                        data: null,
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
    //updates payment status to completed and adds site fee to the db
    updatePaymentStatus(payment_id, site_fee) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedStatus = yield PaymentModel_1.default.updateOne({
                    _id: new mongoose_1.default.Types.ObjectId(payment_id),
                }, { $set: { payment_status: "completed", site_fee: site_fee } });
                return updatedStatus.modifiedCount > 0
                    ? {
                        success: true,
                        message: "Payment details updated successfully",
                        data: updatedStatus,
                    }
                    : {
                        success: false,
                        message: "Failed to update payment details",
                        data: null,
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
    //get the revenue based on the filter
    getRevenueData(period) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let groupByQuery;
                let dateFormat;
                // Define the aggregation query based on the period
                switch (period) {
                    case "weekly":
                        groupByQuery = {
                            year: { $year: "$payment_date" },
                            week: { $week: "$payment_date" },
                        };
                        dateFormat = "%Y-%U"; // Year and week number
                        break;
                    case "monthly":
                        groupByQuery = {
                            year: { $year: "$payment_date" },
                            month: { $month: "$payment_date" },
                        };
                        dateFormat = "%Y-%m"; // Year and month
                        break;
                    case "yearly":
                        groupByQuery = {
                            year: { $year: "$payment_date" },
                        };
                        dateFormat = "%Y"; // Year only
                        break;
                    default:
                        throw new Error("Invalid period specified");
                }
                const revenueData = yield PaymentModel_1.default.aggregate([
                    {
                        $match: {
                            payment_status: "completed", // Only consider completed payments
                        },
                    },
                    {
                        $group: {
                            _id: groupByQuery,
                            totalRevenue: { $sum: "$amount" }, // Sum up the payment amounts
                            payment_date: { $first: "$payment_date" }, // Include payment_date in the group
                        },
                    },
                    {
                        $addFields: {
                            period: {
                                $dateToString: {
                                    format: dateFormat,
                                    date: "$payment_date", // Use the payment_date from the group
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the _id field
                            period: 1, // Include the period field
                            revenue: "$totalRevenue", // Include the revenue field
                        },
                    },
                    {
                        $sort: { period: 1 }, // Sort by period in ascending order
                    },
                ]);
                console.log(revenueData, "revenue data");
                return {
                    success: true,
                    message: "Revenue data fetched successfully",
                    data: revenueData,
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
exports.default = PaymentRepository;
