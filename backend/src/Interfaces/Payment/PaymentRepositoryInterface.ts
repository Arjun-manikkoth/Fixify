import { IResponse } from "../../Services/AdminServices";

interface IPaymentRepository {
    savePayment(amount: number, method: string): Promise<IResponse>;
}
export default IPaymentRepository;
