import { IResponse } from "../../Services/AdminServices";
import { IAddress } from "../Provider/SignIn";
import { IBookingRequestData, ISlotFetch } from "../User/SignUpInterface";

interface IScheduleRepository {
    createSchedule(id: string, date: string, address: IAddress): Promise<boolean | null>;
    fetchSchedule(id: string, date: string): Promise<IResponse>;
    findSlots(data: ISlotFetch): Promise<IResponse>;
    bookingRequestAdd(bookingData: IBookingRequestData): Promise<IResponse>;
    findBookingRequest(user_id: string): Promise<IResponse>;
}

export default IScheduleRepository;
