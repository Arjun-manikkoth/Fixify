import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import Payment from "../Models/CommonModels/PaymentModel";
import { IResponse } from "../Services/AdminServices";

class PaymentRepository implements IPaymentRepository {
    async savePayment(amount: number, method: string): Promise<IResponse> {
        try {
            const payment_status = method === "by cash" ? "completed" : "pending";
            const payment = new Payment({
                amount: amount,
                payment_mode: method,
                payment_status: payment_status,
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
}

export default PaymentRepository;
