import mongoose from "mongoose";
import IReviewRepository from "../Interfaces/Review/IReviewRepository";
import { IReviewData } from "../Interfaces/User/SignUpInterface";
import Review from "../Models/UserModels/ReviewModel";
import { IResponse } from "../Services/AdminServices";

class ReviewRepository implements IReviewRepository {
    //saves review to the data base
    async saveReview(reviewData: IReviewData, urlArray: string[]): Promise<IResponse> {
        try {
            const review = new Review({
                rating: reviewData.rating,
                description: reviewData.description,
                title: reviewData.review,
                images: urlArray,
                provider_id: reviewData.provider_id,
                booking_id: reviewData.booking_id,
            });

            const saved = await review.save();

            return {
                success: true,
                message: "Review saved successfully",
                data: saved,
            };
        } catch (error: any) {
            console.log(error.message);

            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }

    //checks for duplicate review
    async duplicateReviewExists(id: string): Promise<IResponse> {
        try {
            const exists = await Review.findOne({ booking_id: new mongoose.Types.ObjectId(id) });

            return exists
                ? {
                      success: true,
                      message: "Duplicated review exists",
                      data: null,
                  }
                : {
                      success: false,
                      message: "Duplicate review doesnot exists",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: true,
                message: "Review saved successfully",
                data: null,
            };
        }
    }
}
export default ReviewRepository;
