import { IResponse } from "../../Services/AdminServices";
import { IFilteredSchedule } from "./IBooking";

interface IBookingRepository {
    createBooking(data: IFilteredSchedule, request_id: string): Promise<boolean | null>;
    getBookingsWithUserId(id: string, page: number): Promise<IResponse>;
    getBookingsWithProviderId(id: string, page: number): Promise<IResponse>;
    getBookingDetails(id: string): Promise<IResponse>;
}
export default IBookingRepository;
