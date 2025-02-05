import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ILocation {
    geo: { type: "Point"; coordinates: [number, number] }; // GeoJSON format
    address: ILocationDetails;
}
export interface ILocationDetails {
    city: string;
    state: string;
    pincode: string;
    street: string;
}
export interface ISlot {
    time: string;
    status: "available" | "booked" | "blocked";
}

export interface IRequests {
    description: string;
    status: string;
    user_id: ObjectId;
    address: IAddress;
    time: string;
}

export interface ISchedule extends Document {
    technician_id: ObjectId;
    location: ILocation;
    date: Date;
    slots: ISlot[];
    requests: IRequests;
    is_active: boolean;
}
interface IAddress {
    house_name: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
}
const scheduleSchema: Schema = new Schema(
    {
        technician_id: {
            type: Schema.Types.ObjectId,
            ref: "Technician",
            required: true,
        },
        location: {
            address: {
                city: { type: String, required: true },
                state: { type: String, required: true },
                pincode: { type: String, required: true },
                street: {
                    type: String,
                    required: true,
                },
            },

            geo: {
                type: { type: String, default: "Point" },
                coordinates: {
                    type: [Number],
                    required: true,
                    validate: {
                        validator: function (coords: number[]) {
                            return coords.length === 2;
                        },
                        message:
                            "Coordinates must be an array of exactly two numbers [longitude, latitude].",
                    },
                },
            },
        },
        date: { type: Date, required: true },
        slots: [
            {
                time: { type: String, required: true },
                status: {
                    type: String,
                    enum: ["available", "booked"],
                    default: "available",
                },
            },
        ],
        requests: [
            {
                description: { type: String, required: true },
                status: {
                    type: String,
                    enum: ["pending", "booked", "cancelled"],
                    default: "pending",
                },
                user_id: { type: Schema.Types.ObjectId, required: true },
                address: {
                    house_name: String,
                    landmark: String,
                    city: String,
                    state: String,
                    pincode: String,
                    latitude: Number,
                    longitude: Number,
                },
                time: { type: String },
            },
        ],
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

scheduleSchema.index({ "location.geo": "2dsphere" });

const ScheduleModel = mongoose.model<ISchedule>("schedule", scheduleSchema);

export default ScheduleModel;
