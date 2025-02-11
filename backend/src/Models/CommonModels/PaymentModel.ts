import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
    amount: number;
    site_fee: number;
    payment_status: "pending" | "completed" | "failed";
    payment_mode: "by cash" | "online";
    payment_date: Date;
}

const paymentSchema: Schema = new Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        site_fee: { type: Number, min: 0 },
        payment_status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        payment_mode: {
            type: String,
            enum: ["by cash", "online"],
            default: "pending",
        },
        payment_date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const paymentModel = mongoose.model<IPayment>("payment", paymentSchema);

export default paymentModel;
