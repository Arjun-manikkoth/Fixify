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
const BookingModel_1 = __importDefault(require("../Models/ProviderModels/BookingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class BookingRepository {
    createBooking(data, request_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = data.requests.filter((each) => {
                    return each._id.toString() === request_id;
                });
                const booking = new BookingModel_1.default({
                    user_id: request[0].user_id,
                    provider_id: data.technician._id,
                    service_id: data.technician.service_id,
                    user_address: request[0].address,
                    time: request[0].time,
                    date: data.date,
                    status: "confirmed",
                    description: request[0].description,
                });
                return yield booking.save();
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //find all bookings related to user
    getBookingsWithUserId(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = 8;
                const skip = (page - 1) * limit;
                const bookings = yield BookingModel_1.default.aggregate([
                    { $match: { user_id: new mongoose_1.default.Types.ObjectId(id) } },
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
                const totalBookings = yield BookingModel_1.default.countDocuments({
                    user_id: new mongoose_1.default.Types.ObjectId(id),
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
    //find all bookings related to provider
    getBookingsWithProviderId(id, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = 8;
                const skip = (page - 1) * limit;
                const bookings = yield BookingModel_1.default.aggregate([
                    { $match: { provider_id: new mongoose_1.default.Types.ObjectId(id) } },
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
                const totalBookings = yield BookingModel_1.default.countDocuments({
                    provider_id: new mongoose_1.default.Types.ObjectId(id),
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
    //find booking details with id
    getBookingDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield BookingModel_1.default.aggregate([
                    {
                        $match: {
                            _id: new mongoose_1.default.Types.ObjectId(id),
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
    //update the booking document with payment id
    updateBookingWithPaymentId(booking_id, payment_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield BookingModel_1.default.updateOne({
                    _id: new mongoose_1.default.Types.ObjectId(booking_id),
                }, { $set: { payment_id: payment_id } });
                return status.modifiedCount > 0 ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //get booking document
    getBookingById(booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield BookingModel_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(booking_id) });
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
    //change booking status to cancelled or complete
    updateBookingStatus(booking_id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedStatus = yield BookingModel_1.default.updateOne({ _id: new mongoose_1.default.Types.ObjectId(booking_id) }, { $set: { status: status } });
                return updatedStatus.modifiedCount > 0 ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //finds all bookings
    getAllBookings(page_1) {
        return __awaiter(this, arguments, void 0, function* (page, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const bookings = yield BookingModel_1.default.aggregate([
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
                const totalBookings = yield BookingModel_1.default.countDocuments();
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
            }
            catch (error) {
                console.error("Error fetching bookings:", error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //update review id to booking document
    updateReviewDetails(review_id, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedBookings = yield BookingModel_1.default.updateOne({ _id: new mongoose_1.default.Types.ObjectId(booking_id) }, { $set: { review_id: new mongoose_1.default.Types.ObjectId(review_id) } });
                return updatedBookings.modifiedCount > 0
                    ? { success: true, message: "Updated review details successfully", data: null }
                    : { success: false, message: "Failed to update review id", data: null };
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
    //get dashboard details with provider id
    getProviderDashboardDetails(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const startOfCurrentWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())); // Start of the current week (Sunday)
                const endOfCurrentWeek = new Date(currentDate.setDate(currentDate.getDate() + 6)); // End of the current week (Saturday)
                const result = yield BookingModel_1.default.aggregate([
                    // Step 1: Match bookings for the given provider and status "completed"
                    {
                        $match: {
                            provider_id: new mongoose_1.default.Types.ObjectId(providerId),
                            status: "completed",
                        },
                    },
                    // Step 2: Lookup payment details for each booking
                    {
                        $lookup: {
                            from: "payments",
                            localField: "payment_id",
                            foreignField: "_id",
                            as: "paymentDetails",
                        },
                    },
                    // Step 3: Unwind the paymentDetails array (since lookup returns an array)
                    {
                        $unwind: "$paymentDetails",
                    },
                    // Step 4: Lookup review details for each booking
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "review_id",
                            foreignField: "_id",
                            as: "reviewDetails",
                        },
                    },
                    // Step 5: Unwind the reviewDetails array (preserve bookings without reviews)
                    {
                        $unwind: {
                            path: "$reviewDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    // Step 6: Group by provider_id to calculate totals
                    {
                        $group: {
                            _id: "$provider_id",
                            totalEarnings: { $sum: "$paymentDetails.amount" },
                            totalCompletedBookings: { $sum: 1 },
                            totalRatings: { $sum: "$reviewDetails.rating" }, // Sum of all ratings
                            totalReviews: {
                                $sum: {
                                    $cond: [{ $ifNull: ["$reviewDetails", false] }, 1, 0], // Count only bookings with reviews
                                },
                            },
                        },
                    },
                    // Step 7: Calculate average rating
                    {
                        $addFields: {
                            averageRating: {
                                $cond: [
                                    { $gt: ["$totalReviews", 0] }, // Check if there are reviews
                                    { $divide: ["$totalRatings", "$totalReviews"] },
                                    0, // Default to 0 if no reviews
                                ],
                            },
                        },
                    },
                    // Step 8: Fetch revenue per month for the current year
                    {
                        $lookup: {
                            from: "bookings",
                            let: { providerId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        provider_id: new mongoose_1.default.Types.ObjectId(providerId),
                                        status: "completed",
                                        date: {
                                            $gte: new Date(`${currentYear}-01-01`), // Start of the current year
                                            $lt: new Date(`${currentYear + 1}-01-01`), // End of the current year
                                        },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: "payments",
                                        localField: "payment_id",
                                        foreignField: "_id",
                                        as: "paymentDetails",
                                    },
                                },
                                {
                                    $unwind: "$paymentDetails",
                                },
                                {
                                    $group: {
                                        _id: { $month: "$date" },
                                        monthlyRevenue: { $sum: "$paymentDetails.amount" },
                                    },
                                },
                                {
                                    $sort: {
                                        _id: 1,
                                    },
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        month: "$_id",
                                        monthlyRevenue: 1,
                                    },
                                },
                            ],
                            as: "monthlyRevenueData",
                        },
                    },
                    // Step 9: Fetch daily working hours for the current week
                    {
                        $lookup: {
                            from: "bookings",
                            let: { providerId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        provider_id: new mongoose_1.default.Types.ObjectId(providerId),
                                        status: "completed",
                                        date: {
                                            $gte: startOfCurrentWeek,
                                            $lte: endOfCurrentWeek,
                                        },
                                    },
                                },
                                {
                                    $group: {
                                        _id: { $dayOfWeek: "$date" }, // Group by day of the week (1 = Sunday, 7 = Saturday)
                                        dailyWorkingHours: { $sum: 1 },
                                    },
                                },
                                {
                                    $sort: {
                                        _id: 1,
                                    },
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        day: "$_id",
                                        dailyWorkingHours: 1,
                                    },
                                },
                            ],
                            as: "dailyWorkingHoursData",
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            providerId: "$_id",
                            totalEarnings: 1,
                            totalCompletedBookings: 1,
                            averageRating: 1,
                            monthlyRevenueData: 1,
                            dailyWorkingHoursData: 1,
                        },
                    },
                ]);
                return {
                    success: true,
                    message: "Dashboard details fetched successfully",
                    data: result[0],
                };
            }
            catch (error) {
                console.error("Error fetching dashboard details:", error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    getSalesData(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fromDate, toDate, page } = queries;
                const limit = 10;
                // Convert dates to MongoDB date format
                const startDate = fromDate ? new Date(fromDate) : null;
                const endDate = toDate ? new Date(toDate) : null;
                // Build the match stage for filtering
                const matchStage = {
                    status: "completed",
                    date: { $gte: startDate, $lte: endDate },
                };
                const aggregationPipeline = [
                    { $match: matchStage },
                    // Stage 2: Lookup customer details
                    {
                        $lookup: {
                            from: "users",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "customer",
                        },
                    },
                    // Stage 3: Lookup provider details
                    {
                        $lookup: {
                            from: "providers",
                            localField: "provider_id",
                            foreignField: "_id",
                            as: "provider",
                        },
                    },
                    // Stage 4: Lookup service details
                    {
                        $lookup: {
                            from: "services",
                            localField: "service_id",
                            foreignField: "_id",
                            as: "service",
                        },
                    },
                    // Stage 5: Lookup payment details
                    {
                        $lookup: {
                            from: "payments",
                            localField: "payment_id",
                            foreignField: "_id",
                            as: "payment",
                        },
                    },
                    // Stage 6: Unwind the joined arrays (since lookup returns an array)
                    { $unwind: "$customer" },
                    { $unwind: "$provider" },
                    { $unwind: "$service" },
                    { $unwind: "$payment" },
                    // Stage 7: Project the required fields
                    {
                        $project: {
                            _id: 0, // Exclude the default _id field
                            id: "$_id",
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Format date as YYYY-MM-DD
                            amount: "$payment.amount",
                            service: "$service.name",
                            profit: "$payment.site_fee",
                            customer: "$customer.name",
                            provider: "$provider.name",
                        },
                    },
                    // Stage 8: Pagination
                    { $skip: (Number(page) - 1) * limit },
                    { $limit: limit },
                ];
                // Execute the aggregation pipeline
                const salesData = yield BookingModel_1.default.aggregate(aggregationPipeline);
                // Calculate total number of pages
                const totalBookings = yield BookingModel_1.default.countDocuments(matchStage);
                const totalPages = Math.ceil(totalBookings / limit);
                return {
                    success: true,
                    message: "Sales data fetched successfully",
                    data: {
                        sales: salesData,
                        totalPages,
                    },
                };
            }
            catch (error) {
                console.error("Error fetching sales data:", error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //get total site revenue and booking count
    getTotalBookingData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const aggregationResult = yield BookingModel_1.default.aggregate([
                    {
                        $facet: {
                            earnings: [
                                { $match: { status: "completed" } },
                                {
                                    $lookup: {
                                        from: "payments",
                                        localField: "payment_id",
                                        foreignField: "_id",
                                        as: "payment",
                                    },
                                },
                                { $unwind: "$payment" }, // Unwind the joined payment array
                                {
                                    $group: {
                                        _id: null,
                                        totalSiteFee: { $sum: "$payment.site_fee" },
                                        totalCompletedBookings: { $sum: 1 },
                                    },
                                },
                            ],
                            // Count bookings per status
                            statusCounts: [
                                {
                                    $group: {
                                        _id: "$status",
                                        count: { $sum: 1 },
                                    },
                                },
                            ],
                            // Find most booked services based on completed bookings
                            mostBookedServices: [
                                { $match: { status: "completed" } },
                                {
                                    $group: {
                                        _id: "$service_id",
                                        count: { $sum: 1 },
                                    },
                                },
                                { $sort: { count: -1 } }, // Sort by highest booked count
                                { $limit: 5 }, // Get top 5 most booked services
                                {
                                    $lookup: {
                                        from: "services", // Assuming service details are stored in 'services' collection
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "serviceDetails",
                                    },
                                },
                                { $unwind: "$serviceDetails" }, // Extract service details
                                {
                                    $project: {
                                        _id: 0,
                                        serviceName: "$serviceDetails.name", // Service name
                                        count: 1, // Booking count
                                    },
                                },
                            ],
                        },
                    },
                ]);
                // Extract results
                const earningsResult = aggregationResult[0].earnings[0] || {
                    totalSiteFee: 0,
                    totalCompletedBookings: 0,
                };
                const statusCountsResult = aggregationResult[0].statusCounts;
                const mostBookedServicesResult = aggregationResult[0].mostBookedServices || [];
                // Convert status counts into a more usable format
                const bookingStatusCounts = {
                    completed: 0,
                    cancelled: 0,
                    confirmed: 0,
                };
                statusCountsResult.forEach((statusCount) => {
                    if (statusCount._id === "completed") {
                        bookingStatusCounts.completed = statusCount.count;
                    }
                    else if (statusCount._id === "cancelled") {
                        bookingStatusCounts.cancelled = statusCount.count;
                    }
                    else if (statusCount._id === "confirmed") {
                        bookingStatusCounts.confirmed = statusCount.count;
                    }
                });
                // Final response
                return {
                    success: true,
                    message: "Data fetched successfully",
                    data: {
                        totalSiteFee: earningsResult.totalSiteFee,
                        totalCompletedBookings: earningsResult.totalCompletedBookings,
                        bookingStatusCounts,
                        mostBookedServices: mostBookedServicesResult,
                    },
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
exports.default = BookingRepository;
