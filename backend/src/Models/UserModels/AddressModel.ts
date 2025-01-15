import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IAddress extends Document {
    _id: ObjectId;
    user_id: ObjectId;
    house_name: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    latittude: number;
    longittude: number;
    is_deleted: boolean;
}

const addressSchema: Schema = new Schema(
    {
        user_id: mongoose.Types.ObjectId,
        house_name: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String,
        latittude: Number,
        longittude: Number,
        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
const addressModel = mongoose.model<IAddress>("address", addressSchema);

export default addressModel;
export { IAddress };
