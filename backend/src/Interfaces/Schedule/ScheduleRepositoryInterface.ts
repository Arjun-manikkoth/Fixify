import { IResponse } from "../../Services/AdminServices";
import { IAddress } from "../Provider/SignIn";

interface IScheduleRepository {
    createSchedule(id: string, date: string, address: IAddress): Promise<boolean | null>;
    fetchSchedule(id: string, date: string): Promise<IResponse>;
}

export default IScheduleRepository;
