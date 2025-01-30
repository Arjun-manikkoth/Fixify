import IScheduleRepository from "../Interfaces/Schedule/ScheduleRepositoryInterface";
import { IAddress } from "../Interfaces/Provider/SignIn";
import Schedule, { ISchedule } from "../Models/ProviderModels/ScheduleModal";
import { Schema } from "mongoose";
import mongoose from "mongoose";
import { IResponse } from "../Services/AdminServices";

class ScheduleRepository implements IScheduleRepository {
    //find create a schedule
    async createSchedule(id: string, date: string, address: IAddress): Promise<boolean | null> {
        try {
            const schedule = new Schedule({
                technician_id: new mongoose.Types.ObjectId(id),
                "location.latitude": address.latitude,
                "location.longitude": address.longitude,
                "location.city": address.city,
                "location.state": address.state,
                "location.pincode": address.pincode,
                "location.street": address.street,
                date: date,
                slots: [
                    {
                        time: "9:00 am - 10:00 am",
                    },
                    {
                        time: "10:00 am - 11:00 am",
                    },
                    {
                        time: "11:00 am - 12:00 am",
                    },
                    {
                        time: "12:00 am -1:00 am",
                    },
                    {
                        time: "2:00 pm - 3:00 pm",
                    },
                    {
                        time: "3:00 am - 4:00 pm",
                    },
                    {
                        time: "4:00 pm - 5:00 pm",
                    },
                    {
                        time: "5:00 pm - 6:00 pm",
                    },
                    {
                        time: "6:00 pm - 7:00 pm",
                    },
                    {
                        time: "7:00 pm - 8:00 pm",
                    },
                    {
                        time: "8:00 pm - 9:00 pm",
                    },
                ],
                requests: [],
            });

            const status = await schedule.save();

            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //get schedule details for selected date
    async fetchSchedule(id: string, date: string): Promise<IResponse> {
        try {
            const scheduleData = await Schedule.findOne({
                technician_id: new mongoose.Types.ObjectId(id),
                date: date,
            });

            if (scheduleData) {
                return {
                    success: true,
                    message: "Schedule fetched successfully",
                    data: scheduleData,
                };
            } else {
                return {
                    success: false,
                    message: "Resource not found",
                    data: null,
                };
            }
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

export default ScheduleRepository;
