import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    receiver_id: string;
    is_read: boolean;
    type: string;
    message: string;
    timestamp: Date;
}

const notificationSchema = new Schema(
    {
        receiver_id: { type: String, required: true },
        is_read: { type: Boolean, default: false },
        type: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const notification = mongoose.model<INotification>("notification", notificationSchema);
export default notification;
