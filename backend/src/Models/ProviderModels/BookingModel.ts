import { Schema, model, Document } from "mongoose";

// Define the UserAddress interface
interface UserAddress {
    city: string;
    house_no: string;
    state: string;
    landmark: string;
    pincode: string;
    latitude: number;
    longitude: number;
}

// Define the Booking interface
export interface IBooking extends Document {
    user_id: Schema.Types.ObjectId;
    provider_id: Schema.Types.ObjectId;
    service_id: Schema.Types.ObjectId;
    user_address: UserAddress;
    time: string;
    date: Date;
    status: string;
    description: string;
    payment_id: Schema.Types.ObjectId;
}

// Define the schema
const BookingSchema = new Schema<IBooking>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        provider_id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        service_id: {
            type: Schema.Types.ObjectId,
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
        time: { type: String, required: true },
        date: { type: Date, required: true },
        status: {
            type: String,
            required: true,
            enum: ["confirmed", "completed", "cancelled"],
            default: "confirmed",
        },
        description: { type: String, required: true },
        payment_id: { type: Schema.Types.ObjectId },
    },
    { timestamps: true }
);

const BookingModel = model<IBooking>("Booking", BookingSchema);

export default BookingModel;
