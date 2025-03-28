"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the schema
const BookingSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    provider_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    service_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    user_address: {
        city: { type: String, required: true },
        house_name: { type: String, required: true },
        state: { type: String, required: true },
        landmark: { type: String, required: true },
        pincode: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    time: { type: Date, required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        required: true,
        enum: ["confirmed", "completed", "cancelled"],
        default: "confirmed",
    },
    description: { type: String, required: true },
    payment_id: { type: mongoose_1.Schema.Types.ObjectId },
    review_id: { type: mongoose_1.Schema.Types.ObjectId },
}, { timestamps: true });
const BookingModel = (0, mongoose_1.model)("Booking", BookingSchema);
exports.default = BookingModel;
