import { IBooking } from "../../Models/ProviderModels/BookingModel";
import { IResponse } from "../../Services/AdminServices";
import { ISalesQuery } from "../Admin/SignInInterface";
import { IFilteredSchedule } from "./IBooking";

interface IBookingRepository {
    createBooking(data: IFilteredSchedule, request_id: string): Promise<IBooking | null>;
    getBookingsWithUserId(id: string, page: number): Promise<IResponse>;
    getBookingsWithProviderId(id: string, page: number): Promise<IResponse>;
    getBookingDetails(id: string): Promise<IResponse>;
    updateBookingWithPaymentId(booking_id: string, payment_id: string): Promise<boolean>;
    getBookingById(booking_id: string): Promise<IResponse>;
    updateBookingStatus(booking_id: string, status: string): Promise<boolean>;
    getAllBookings(page: number): Promise<IResponse>;
    updateReviewDetails(review_id: string, booking_id: string): Promise<IResponse>;
    getProviderDashboardDetails(provider_id: string): Promise<IResponse>;
    getSalesData(queries: ISalesQuery): Promise<IResponse>;
    getTotalBookingData(): Promise<IResponse>;
}
export default IBookingRepository;
