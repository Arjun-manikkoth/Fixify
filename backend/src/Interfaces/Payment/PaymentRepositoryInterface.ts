import { IResponse } from "../../Services/AdminServices";

interface IPaymentRepository {
    savePayment(amount: number, method: string): Promise<IResponse>;
    updatePaymentStatus(payment_id: string, site_fee: number): Promise<IResponse>;
}
export default IPaymentRepository;
