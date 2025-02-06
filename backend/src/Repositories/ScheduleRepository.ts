import IScheduleRepository from "../Interfaces/Schedule/ScheduleRepositoryInterface";
import { IAddress } from "../Interfaces/Provider/SignIn";
import Schedule, { ISchedule } from "../Models/ProviderModels/ScheduleModal";
import { ISlotFetch } from "../Interfaces/User/SignUpInterface";
import mongoose from "mongoose";
import { IResponse } from "../Services/AdminServices";
import { IBookingRequestData } from "../Interfaces/User/SignUpInterface";
import { messages } from "../Constants/Messages";
import { request } from "http";

class ScheduleRepository implements IScheduleRepository {
    //find create a schedule
    async createSchedule(id: string, date: string, address: IAddress): Promise<boolean | null> {
        try {
            const schedule = new Schedule({
                technician_id: new mongoose.Types.ObjectId(id),
                "location.geo.type": "Point",
                "location.geo.coordinates": [address.longitude, address.latitude],
                "location.address.city": address.city,
                "location.address.state": address.state,
                "location.address.pincode": address.pincode,
                "location.address.street": address.street,
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
    //finds slots with selected date time location and service
    async findSlots(data: ISlotFetch): Promise<IResponse> {
        try {
            const { date, lat: latitude, long: longitude, service_id } = data;

            const radiusInMeters = 10 * 1000; // 10 km = 10,000 meters

            // Use the aggregation pipeline to filter available slots and get technician details
            const schedules = await Schedule.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        distanceField: "distance",
                        spherical: true,
                        maxDistance: radiusInMeters,
                    },
                },
                {
                    $match: {
                        date: new Date(date),
                        is_active: true,
                    },
                },
                {
                    $lookup: {
                        from: "providers",
                        localField: "technician_id",
                        foreignField: "_id",
                        as: "technician",
                    },
                },
                {
                    $unwind: "$technician",
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "technician.service_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                {
                    $unwind: "$service",
                },
                {
                    $match: {
                        "technician.service_id": new mongoose.Types.ObjectId(service_id),
                    },
                },
                {
                    $project: {
                        technician: 1,
                        date: 1,
                        distance: { $divide: ["$distance", 1000] }, // Convert distance to km
                        slots: {
                            $filter: {
                                input: "$slots",
                                as: "slot",
                                cond: { $eq: ["$$slot.status", "available"] },
                            },
                        },
                        location: 1,
                        service: 1, // Include service details in the output
                    },
                },
            ]);

            return {
                success: true,
                message: "Fetched schedules successfully",
                data: schedules,
            };
        } catch (error: any) {
            console.error(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
    //adds booking request
    async bookingRequestAdd(bookingData: IBookingRequestData): Promise<IResponse> {
        try {
            //checks for duplicate requests
            const exists = await this.findBookingRequest(bookingData.user_id, bookingData.slot_id);

            if (exists.success) {
                return { success: false, message: exists.message, data: null };
            }

            const scheduleData = await Schedule.updateOne(
                { _id: new mongoose.Types.ObjectId(bookingData.slot_id) },
                {
                    $addToSet: {
                        requests: {
                            description: bookingData.description,
                            user_id: new mongoose.Types.ObjectId(bookingData.user_id),
                            address: {
                                house_name: bookingData.address.houseName,
                                landmark: bookingData.address.landmark,
                                city: bookingData.address.city,
                                state: bookingData.address.state,
                                pincode: bookingData.address.pincode,
                                latitude: bookingData.address.latitude,
                                longitude: bookingData.address.longitude,
                            },
                            time: bookingData.time,
                        },
                    },
                }
            );

            return scheduleData
                ? {
                      success: true,
                      message: "Booking request added successfully",
                      data: scheduleData,
                  }
                : { success: false, message: "Failed to add booking request", data: null };
        } catch (error: any) {
            console.error("Error in bookingRequestAdd:", error.message);
            return { success: false, message: "Internal server error", data: null };
        }
    }

    // Checks for duplicate bookings
    async findBookingRequest(user_id: string, slot_id: string): Promise<IResponse> {
        try {
            const requestExists = await Schedule.exists({
                _id: new mongoose.Types.ObjectId(slot_id),
                "requests.user_id": new mongoose.Types.ObjectId(user_id),
            });

            return requestExists
                ? { success: true, message: "Booking request exists", data: null }
                : { success: false, message: "Booking request doesn't exist", data: null };
        } catch (error: any) {
            console.error("Error in findBookingRequest:", error.message);
            return { success: false, message: "Internal server error", data: null };
        }
    }

    //finds all the slot requests
    async findAllRequests(provider_id: string): Promise<IResponse> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const schedules = await Schedule.aggregate([
                {
                    $match: {
                        technician_id: new mongoose.Types.ObjectId(provider_id),
                        date: { $gte: today },
                        "requests.0": { $exists: true },
                        "requests.status": { $nin: ["cancelled", "booked"] },
                    },
                },
                {
                    $unwind: "$requests", // Deconstruct requests array to process each separately
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "requests.user_id",
                        foreignField: "_id",
                        as: "customerDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$customerDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: "$requests._id",
                        customerName: "$customerDetails.name", // Fetch user's name
                        customer_id: "$customerDetails._id",
                        description: "$requests.description",
                        date: "$date",
                        time: "$requests.time",
                        status: "$requests.status",
                        location: {
                            city: "$requests.address.city",
                            state: "$requests.address.state",
                            pincode: "$requests.address.pincode",
                            landmark: "$requests.address.landmark",
                            houseName: "$requests.address.house_name",
                        },
                    },
                },
            ]);
            return schedules
                ? {
                      success: true,
                      message: "Booking requests retrieved successfully",
                      data: schedules,
                  }
                : {
                      success: false,
                      message: "Failed to retrieve booking requests",
                      data: null,
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
    //update the booking request status
    async updateBookingRequestStatus(request_id: string, status: string): Promise<boolean> {
        try {
            const requestStatus = await Schedule.updateOne(
                {
                    "requests._id": new mongoose.Types.ObjectId(request_id),
                },
                { $set: { "requests.$.status": status } }
            );
            return requestStatus.modifiedCount > 0;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
    //get booking request lookuped with technician collection with request id
    async getBookingRequest(id: string): Promise<IResponse> {
        try {
            const request = await Schedule.aggregate([
                {
                    $match: { "requests._id": new mongoose.Types.ObjectId(id) }, // Find the schedule with the request
                },
                {
                    $lookup: {
                        from: "providers",
                        localField: "technician_id",
                        foreignField: "_id",
                        as: "technician",
                    },
                },
                {
                    $unwind: "$technician",
                },
            ]);

            return request
                ? {
                      success: true,
                      message: "Fetched request successfully",
                      data: request,
                  }
                : {
                      success: false,
                      message: "Failed to fetch request",
                      data: null,
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

export default ScheduleRepository;
