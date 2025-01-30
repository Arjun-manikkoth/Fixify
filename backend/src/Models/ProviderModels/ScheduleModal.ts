import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ILocation {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    pincode: string;
    street: string;
}

export interface ISlot {
    time: string;
    status: "available" | "booked" | "blocked";
}

export interface ISchedule extends Document {
    technician_id: ObjectId;
    location: ILocation;
    date: string;
    slots: ISlot[];
    is_active: boolean;
}

const scheduleSchema: Schema = new Schema(
    {
        technician_id: {
            type: Schema.Types.ObjectId,
            ref: "Technician",
            required: true,
        },
        location: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            street: {
                type: String,
                required: true,
            },
        },
        date: { type: String, required: true },
        slots: [
            {
                time: { type: String, required: true },
                status: {
                    type: String,
                    enum: ["available", "booked", "blocked"],
                    default: "available",
                },
            },
        ],
        requests: [
            {
                description: { type: String, required: true },
                status: { type: String, required: true },
                user_id: { type: Schema.Types.ObjectId, required: true },
            },
        ],
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const ScheduleModel = mongoose.model<ISchedule>("schedule", scheduleSchema);

export default ScheduleModel;
