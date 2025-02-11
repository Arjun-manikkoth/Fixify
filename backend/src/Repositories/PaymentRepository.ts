import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import Payment from "../Models/CommonModels/PaymentModel";
import { IResponse } from "../Services/AdminServices";
import mongoose from "mongoose";

class PaymentRepository implements IPaymentRepository {
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
}

export default PaymentRepository;
