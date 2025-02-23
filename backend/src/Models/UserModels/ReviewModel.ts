import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IReview extends Document {
    _id: ObjectId;
    title: string;
    description: string;
    rating: number;
    provider_id: Schema.Types.ObjectId;
    booking_id: Schema.Types.ObjectId;
    images: string[];
    is_deleted: boolean;
}

const reviewSchema: Schema = new Schema(
    {
        title: String,
        description: String,
        rating: Number,
        provider_id: Schema.Types.ObjectId,
        booking_id: Schema.Types.ObjectId,
        images: [{ type: String }],
        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
const reviewModel = mongoose.model<IReview>("review", reviewSchema);

export default reviewModel;
export { IReview };
