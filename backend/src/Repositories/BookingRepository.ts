import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import Booking, { IBooking } from "../Models/ProviderModels/BookingModel";
import { IFilteredSchedule } from "../Interfaces/Booking/IBooking";
import mongoose, { Mongoose } from "mongoose";
import { IResponse } from "../Services/AdminServices";

class BookingRepository implements IBookingRepository {
    async createBooking(data: IFilteredSchedule, request_id: string): Promise<IBooking | null> {
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

            return await booking.save();
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //find all bookings related to user
    async getBookingsWithUserId(id: string, page: number): Promise<IResponse> {
        try {
            const limit = 8;
            const skip = (page - 1) * limit;

            const bookings = await Booking.aggregate([
                { $match: { user_id: new mongoose.Types.ObjectId(id) } },

                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },

                {
                    $lookup: {
                        from: "providers",
                        localField: "provider_id",
                        foreignField: "_id",
                        as: "provider",
                    },
                },
                { $unwind: "$provider" },

                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },

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

                { $sort: { date: -1 } }, // Sort by latest bookings

                { $skip: skip }, // Skip previous documents
                { $limit: limit }, // Limit results per page
            ]);

            const totalBookings = await Booking.countDocuments({
                user_id: new mongoose.Types.ObjectId(id),
            });

            return {
                success: true,
                message: "Fetched booking details successfully",
                data: {
                    bookings,
                    pagination: {
                        totalBookings,
                        currentPage: page,
                        totalPages: Math.ceil(totalBookings / limit),
                    },
                },
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

    //find all bookings related to provider
    async getBookingsWithProviderId(id: string, page: number): Promise<IResponse> {
        try {
            const limit = 8;
            const skip = (page - 1) * limit;

            const bookings = await Booking.aggregate([
                { $match: { provider_id: new mongoose.Types.ObjectId(id) } },

                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },

                {
                    $lookup: {
                        from: "providers",
                        localField: "provider_id",
                        foreignField: "_id",
                        as: "provider",
                    },
                },
                { $unwind: "$provider" },

                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },

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

                { $sort: { date: -1 } }, // Sort by latest bookings

                { $skip: skip }, // Skip previous documents
                { $limit: limit }, // Limit results per page
            ]);

            const totalBookings = await Booking.countDocuments({
                provider_id: new mongoose.Types.ObjectId(id),
            });

            return {
                success: true,
                message: "Fetched booking details successfully",
                data: {
                    bookings,
                    pagination: {
                        totalBookings,
                        currentPage: page,
                        totalPages: Math.ceil(totalBookings / limit),
                    },
                },
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
                    $lookup: {
                        from: "payments",
                        localField: "payment_id",
                        foreignField: "_id",
                        as: "payment",
                    },
                },
                {
                    $unwind: {
                        path: "$payment",
                        preserveNullAndEmptyArrays: true, // Prevents removal of bookings without payments
                    },
                },
                {
                    $lookup: {
                        from: "reviews",
                        localField: "review_id",
                        foreignField: "_id",
                        as: "review",
                    },
                },
                {
                    $unwind: {
                        path: "$review",
                        preserveNullAndEmptyArrays: true, // Prevents removal of bookings without reviews
                    },
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
                        "payment._id": 1,
                        "payment.amount": 1,
                        "payment.payment_status": 1,
                        "payment.payment_mode": 1,
                        "payment.payment_date": 1,
                        review: 1,
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

    //update the booking document with payment id
    async updateBookingWithPaymentId(booking_id: string, payment_id: string): Promise<boolean> {
        try {
            const status = await Booking.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(booking_id),
                },
                { $set: { payment_id: payment_id } }
            );

            return status.modifiedCount > 0 ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
    //get booking document
    async getBookingById(booking_id: string): Promise<IResponse> {
        try {
            const booking = await Booking.findOne({ _id: new mongoose.Types.ObjectId(booking_id) });
            return booking
                ? {
                      success: true,
                      message: "Fetched booking details successfully",
                      data: booking,
                  }
                : {
                      success: false,
                      message: "Failed to fetch booking details",
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

    //change booking status to cancelled or complete
    async updateBookingStatus(booking_id: string, status: string): Promise<boolean> {
        try {
            const updatedStatus = await Booking.updateOne(
                { _id: new mongoose.Types.ObjectId(booking_id) },
                { $set: { status: status } }
            );
            return updatedStatus.modifiedCount > 0 ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //finds all bookings
    async getAllBookings(page: number, limit: number = 10): Promise<IResponse> {
        try {
            const skip = (page - 1) * limit;

            const bookings = await Booking.aggregate([
                // Lookup user details
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },

                // Lookup provider details
                {
                    $lookup: {
                        from: "providers",
                        localField: "provider_id",
                        foreignField: "_id",
                        as: "provider",
                    },
                },
                { $unwind: "$provider" },

                // Lookup service details
                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },

                // Lookup payment details (optional)
                {
                    $lookup: {
                        from: "payments",
                        localField: "payment_id",
                        foreignField: "_id",
                        as: "payment",
                    },
                },
                {
                    $unwind: {
                        path: "$payment",
                        preserveNullAndEmptyArrays: true, // Keeps bookings even if payment is missing
                    },
                },

                // Select only required fields
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        time: 1,
                        status: 1,
                        user_address: 1,
                        description: 1,
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
                        "payment._id": 1,
                        "payment.amount": 1,
                        "payment.payment_status": 1,
                        "payment.payment_mode": 1,
                        "payment.payment_date": 1,
                        "payment.site_fee": 1,
                    },
                },

                // Pagination
                { $skip: skip },
                { $limit: limit },
            ]);

            // Get total count for pagination info
            const totalBookings = await Booking.countDocuments();

            return {
                success: true,
                message: "Fetched booking details successfully",
                data: {
                    bookings,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalBookings / limit),
                        totalBookings,
                    },
                },
            };
        } catch (error: any) {
            console.error("Error fetching bookings:", error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
    //update review id to booking document
    async updateReviewDetails(review_id: string, booking_id: string): Promise<IResponse> {
        try {
            const updatedBookings = await Booking.updateOne(
                { _id: new mongoose.Types.ObjectId(booking_id) },
                { $set: { review_id: new mongoose.Types.ObjectId(review_id) } }
            );

            return updatedBookings.modifiedCount > 0
                ? { success: true, message: "Updated review details successfully", data: null }
                : { success: false, message: "Failed to update review id", data: null };
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
