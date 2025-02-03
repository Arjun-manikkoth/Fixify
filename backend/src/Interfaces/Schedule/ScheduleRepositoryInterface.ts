import { IResponse } from "../../Services/AdminServices";
import { IAddress } from "../Provider/SignIn";
import { ISlotFetch } from "../User/SignUpInterface";

interface IScheduleRepository {
    createSchedule(id: string, date: string, address: IAddress): Promise<boolean | null>;
    fetchSchedule(id: string, date: string): Promise<IResponse>;
    findSlots(data: ISlotFetch): Promise<IResponse>;
}

export default IScheduleRepository;
