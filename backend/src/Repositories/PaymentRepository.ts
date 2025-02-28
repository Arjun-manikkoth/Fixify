import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import Payment from "../Models/CommonModels/PaymentModel";
import { IResponse } from "../Services/AdminServices";
import mongoose from "mongoose";

class PaymentRepository implements IPaymentRepository {
    //creates payment request and handle cod payment
    async savePayment(amount: number, method: string): Promise<IResponse> {
        try {
            const payment_status = method === "by cash" ? "completed" : "pending";
            const payment = new Payment({
                amount: amount,
                payment_mode: method,
                payment_status: payment_status,
                site_fee: Math.ceil((amount * 10) / 100),
            });
            const status = await payment.save();

            return status
                ? { success: true, message: "Saved payment successfully", data: status }
                : {
                      success: false,
                      message: "Failed to save payment",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
    //updates payment status to completed and adds site fee to the db
    async updatePaymentStatus(payment_id: string, site_fee: number): Promise<IResponse> {
        try {
            const updatedStatus = await Payment.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(payment_id),
                },
                { $set: { payment_status: "completed", site_fee: site_fee } }
            );
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
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }

    //get the revenue based on the filter
    async getRevenueData(period: string): Promise<IResponse> {
        try {
            let groupByQuery: any;
            let dateFormat: string;

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

            const revenueData = await Payment.aggregate([
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
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
}

export default PaymentRepository;
