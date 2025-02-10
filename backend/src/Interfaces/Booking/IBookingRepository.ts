import { IResponse } from "../../Services/AdminServices";
import { IFilteredSchedule } from "./IBooking";

interface IBookingRepository {
    createBooking(data: IFilteredSchedule, request_id: string): Promise<boolean | null>;
    getBookingsWithUserId(id: string): Promise<IResponse>;
    getBookingDetails(id: string): Promise<IResponse>;
}
export default IBookingRepository;
