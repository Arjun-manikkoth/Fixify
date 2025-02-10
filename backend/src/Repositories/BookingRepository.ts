import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import Booking from "../Models/ProviderModels/BookingModel";
import { IFilteredSchedule } from "../Interfaces/Booking/IBooking";
import mongoose from "mongoose";
import { IResponse } from "../Services/AdminServices";

class BookingRepository implements IBookingRepository {
    async createBooking(data: IFilteredSchedule, request_id: string): Promise<boolean | null> {
        try {
            const request = data.requests.filter((each) => {
                return each._id.toString() === request_id;
            });

            const booking = new Booking({
                user_id: request[0].user_id,
                provider_id: data.technician._id,
                service_id: data.technician.service_id,
                user_address: request[0].address,
                time: request[0].time,
                date: data.date,
                status: "confirmed",
                description: request[0].description,
            });

            const status = await booking.save();
            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //find all bookings related to user
    async getBookingsWithUserId(id: string): Promise<IResponse> {
        try {
            const bookings = await Booking.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },

                {
                    $unwind: "$user",
                },

                {
                    $lookup: {
                        from: "providers",
                        localField: "provider_id",
                        foreignField: "_id",
                        as: "provider",
                    },
                },
                {
                    $unwind: "$provider",
                },

                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                {
                    $unwind: "$service",
                },
                {
                    $project: {
                        "user._id": 1,
                        "user.url": 1,
                        "user.name": 1,
                        "user.email": 1,
                        "user.mobile_no": 1,
                        "user.is_blocked": 1,
                        "provider._id": 1,
                        "provider.name": 1,
                        "provider.email": 1,
                        "provider.url": 1,
                        "provider.mobile_no": 1,
                        "provider.is_blocked": 1,
                        "service._id": 1,
                        "service.name": 1,
                        "service.description": 1,
                        _id: 1,
                        date: 1,
                        time: 1,
                        status: 1,
                    },
                },
                {
                    $sort: {
                        date: -1,
                    },
                },
            ]);

            return {
                success: true,
                message: "Fetched booking details successfully",
                data: bookings,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
    //find booking details with id
    async getBookingDetails(id: string): Promise<IResponse> {
        try {
            const bookings = await Booking.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },

                {
                    $unwind: "$user",
                },

                {
                    $lookup: {
                        from: "providers",
                        localField: "provider_id",
                        foreignField: "_id",
                        as: "provider",
                    },
                },
                {
                    $unwind: "$provider",
                },

                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                {
                    $unwind: "$service",
                },
                {
                    $project: {
                        "user._id": 1,
                        "user.url": 1,
                        "user.name": 1,
                        "user.email": 1,
                        "user.mobile_no": 1,
                        "user.is_blocked": 1,
                        "provider._id": 1,
                        "provider.name": 1,
                        "provider.email": 1,
                        "provider.url": 1,
                        "provider.mobile_no": 1,
                        "provider.is_blocked": 1,
                        "service._id": 1,
                        "service.name": 1,
                        "service.description": 1,
                        description: 1,
                        user_address: 1,
                        _id: 1,
                        date: 1,
                        time: 1,
                        status: 1,
                    },
                },
            ]);

            return {
                success: true,
                message: "Fetched booking details successfully",
                data: bookings,
            };
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
export default BookingRepository;
