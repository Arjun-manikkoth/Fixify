"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduleModal_1 = __importDefault(require("../Models/ProviderModels/ScheduleModal"));
const mongoose_1 = __importDefault(require("mongoose"));
class ScheduleRepository {
    //find create a schedule
    createSchedule(id, date, address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeSlots = [
                    {
                        time: "9:00 am",
                    },
                    {
                        time: "10:00 am",
                    },
                    {
                        time: "11:00 am",
                    },
                    {
                        time: "12:00 pm",
                    },
                    {
                        time: "2:00 pm",
                    },
                    {
                        time: "3:00 am",
                    },
                    {
                        time: "4:00 pm",
                    },
                    {
                        time: "5:00 pm",
                    },
                    {
                        time: "6:00 pm",
                    },
                    {
                        time: "7:00 pm",
                    },
                    {
                        time: "8:00 pm",
                    },
                ];
                // Convert time slots to full Date objects
                const slots = timeSlots.map((each) => {
                    return {
                        time: new Date(`${date} ${each.time}`), // Converts to proper Date object
                    };
                });
                const schedule = new ScheduleModal_1.default({
                    technician_id: new mongoose_1.default.Types.ObjectId(id),
                    "location.geo.type": "Point",
                    "location.geo.coordinates": [address.longitude, address.latitude],
                    "location.address.city": address.city,
                    "location.address.state": address.state,
                    "location.address.pincode": address.pincode,
                    "location.address.street": address.street,
                    date: date,
                    slots: slots,
                    requests: [],
                });
                const status = yield schedule.save();
                return status ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //get schedule details for selected date
    fetchSchedule(id, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scheduleData = yield ScheduleModal_1.default.findOne({
                    technician_id: new mongoose_1.default.Types.ObjectId(id),
                    date: date,
                });
                if (scheduleData) {
                    return {
                        success: true,
                        message: "Schedule fetched successfully",
                        data: scheduleData,
                    };
                }
                else {
                    return {
                        success: false,
                        message: "Resource not found",
                        data: null,
                    };
                }
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //finds slots with selected date time location and service
    findSlots(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date, lat: latitude, long: longitude, service_id, time } = data;
                const formattedTime = new Date(`${date} ${time}`);
                const radiusInMeters = 10 * 1000;
                const schedules = yield ScheduleModal_1.default.aggregate([
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
                            slots: {
                                $elemMatch: {
                                    time: formattedTime,
                                    status: "available",
                                },
                            },
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
                        $match: {
                            "technician.service_id": new mongoose_1.default.Types.ObjectId(service_id),
                        },
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
                        $lookup: {
                            from: "reviews",
                            localField: "technician._id",
                            foreignField: "provider_id",
                            as: "reviews",
                        },
                    },
                    {
                        $addFields: {
                            totalRating: { $sum: "$reviews.rating" }, // Sum up all ratings
                            reviewCount: { $size: "$reviews" }, // Count the number of reviews
                        },
                    },
                    {
                        $addFields: {
                            averageRating: {
                                $cond: {
                                    if: { $gt: ["$reviewCount", 0] }, // Check if there are reviews
                                    then: { $divide: ["$totalRating", "$reviewCount"] }, // Calculate average
                                    else: 0, // Default to 0 if no reviews
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            technician: 1,
                            date: 1,
                            distance: { $divide: ["$distance", 1000] },
                            slots: {
                                $filter: {
                                    input: "$slots",
                                    as: "slot",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$slot.time", formattedTime] },
                                            { $eq: ["$$slot.status", "available"] },
                                        ],
                                    },
                                },
                            },
                            location: 1,
                            service: 1,
                            totalRating: 1,
                            reviewCount: 1,
                            averageRating: 1, // Include the average rating in the output
                        },
                    },
                ]);
                return {
                    success: true,
                    message: "Fetched schedules successfully",
                    data: schedules,
                };
            }
            catch (error) {
                console.error(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //adds booking request
    bookingRequestAdd(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedTime = new Date(`${bookingData.date} ${bookingData.time}`);
                const scheduleData = yield ScheduleModal_1.default.updateOne({ _id: new mongoose_1.default.Types.ObjectId(bookingData.slot_id) }, {
                    $addToSet: {
                        requests: {
                            description: bookingData.description,
                            user_id: new mongoose_1.default.Types.ObjectId(bookingData.user_id),
                            address: {
                                house_name: bookingData.address.houseName,
                                landmark: bookingData.address.landmark,
                                city: bookingData.address.city,
                                state: bookingData.address.state,
                                pincode: bookingData.address.pincode,
                                latitude: bookingData.address.latitude,
                                longitude: bookingData.address.longitude,
                            },
                            time: formattedTime,
                        },
                    },
                });
                return scheduleData
                    ? {
                        success: true,
                        message: "Booking request added successfully",
                        data: scheduleData,
                    }
                    : { success: false, message: "Failed to add booking request", data: null };
            }
            catch (error) {
                console.error("Error in bookingRequestAdd:", error.message);
                return { success: false, message: "Internal server error", data: null };
            }
        });
    }
    // Checks for duplicate bookings
    findBookingRequest(user_id, slot_id, time, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedTime = new Date(`${date} ${time}`);
                const requestExists = yield ScheduleModal_1.default.exists({
                    _id: new mongoose_1.default.Types.ObjectId(slot_id),
                    "requests.user_id": new mongoose_1.default.Types.ObjectId(user_id),
                    "requests.time": formattedTime,
                });
                return requestExists
                    ? { success: true, message: "Booking request exists", data: null }
                    : { success: false, message: "Booking request doesn't exist", data: null };
            }
            catch (error) {
                console.error("Error in findBookingRequest:", error.message);
                return { success: false, message: "Internal server error", data: null };
            }
        });
    }
    //finds all the slot requests
    findAllRequests(provider_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const schedules = yield ScheduleModal_1.default.aggregate([
                    {
                        $match: {
                            technician_id: new mongoose_1.default.Types.ObjectId(provider_id),
                            date: { $gte: today },
                            "requests.0": { $exists: true },
                        },
                    },
                    { $unwind: "$requests" },
                    {
                        $group: {
                            _id: "$requests.time",
                            requests: { $push: "$requests" },
                            hasBooked: {
                                $sum: { $cond: [{ $eq: ["$requests.status", "booked"] }, 1, 0] },
                            },
                        },
                    },
                    {
                        $match: { hasBooked: 0 },
                    },
                    { $unwind: "$requests" },
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
                            customerName: "$customerDetails.name",
                            customer_id: "$customerDetails._id",
                            description: "$requests.description",
                            date: "$requests.time",
                            time: "$requests.time",
                            status: "$requests.status",
                            location: {
                                city: "$requests.address.city",
                                state: "$requests.address.state",
                                pincode: "$requests.address.pincode",
                                landmark: "$requests.address.landmark",
                                houseName: "$requests.address.house_name",
                                latitude: "$requests.address.latitude",
                                longitude: "$requests.address.longitude",
                            },
                        },
                    },
                ]);
                return {
                    success: true,
                    message: "Booking requests retrieved successfully",
                    data: schedules,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //update the booking request status
    updateBookingRequestStatus(request_id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestStatus = yield ScheduleModal_1.default.updateOne({
                    "requests._id": new mongoose_1.default.Types.ObjectId(request_id),
                }, { $set: { "requests.$.status": status } });
                return requestStatus.modifiedCount > 0;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //get booking request lookuped with technician collection with request id
    getBookingRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield ScheduleModal_1.default.aggregate([
                    {
                        $match: { "requests._id": new mongoose_1.default.Types.ObjectId(id) },
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //change the time slot status
    changeTimeSlotStatus(request_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schedule = yield ScheduleModal_1.default.findOne({ "requests._id": request_id }, { "requests.$": 1, _id: 1 });
                const updatedStatus = yield ScheduleModal_1.default.updateOne({ _id: schedule === null || schedule === void 0 ? void 0 : schedule._id, "slots.time": new Date((schedule === null || schedule === void 0 ? void 0 : schedule.requests[0].time) || "") }, { $set: { "slots.$.status": "booked" } });
                return updatedStatus.modifiedCount > 0
                    ? {
                        success: true,
                        message: "updated slot status successfully",
                        data: null,
                    }
                    : {
                        success: false,
                        message: "Failed to slot status",
                        data: null,
                    };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
}
exports.default = ScheduleRepository;
