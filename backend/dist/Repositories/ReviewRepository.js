"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewModel_1 = __importDefault(require("../Models/UserModels/ReviewModel"));
class ReviewRepository {
    //saves review to the data base
    saveReview(reviewData, urlArray) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const review = new ReviewModel_1.default({
                    rating: reviewData.rating,
                    description: reviewData.description,
                    title: reviewData.review,
                    images: urlArray,
                    provider_id: reviewData.provider_id,
                    booking_id: reviewData.booking_id,
                });
                const saved = yield review.save();
                return {
                    success: true,
                    message: "Review saved successfully",
                    data: saved,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Internal server error",
                    data: null,
                };
            }
        });
    }
    //checks for duplicate review
    duplicateReviewExists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield ReviewModel_1.default.findOne({ booking_id: new mongoose_1.default.Types.ObjectId(id) });
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
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: true,
                    message: "Review saved successfully",
                    data: null,
                };
            }
        });
    }
}
exports.default = ReviewRepository;
