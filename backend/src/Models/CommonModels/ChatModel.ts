import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
    room_id: string;
    sender: string;
    receiver: string;
    message: string;
    timestamp: Date;
}

const chatSchema = new Schema(
    {
        room_id: { type: String, required: true },
        sender: { type: String, required: true },
        receiver: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const chat = mongoose.model<IChat>("chat", chatSchema);
export default chat;
