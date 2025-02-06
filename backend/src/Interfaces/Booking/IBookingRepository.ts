import { IFilteredSchedule } from "./IBooking";

interface IBookingRepository {
    createBooking(data: IFilteredSchedule, request_id: string): Promise<boolean | null>;
}
export default IBookingRepository;
