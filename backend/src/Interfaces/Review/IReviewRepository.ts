import { IResponse } from "../../Services/AdminServices";
import { IReviewData } from "../User/SignUpInterface";

interface IReviewRepository {
    saveReview(reviewData: IReviewData, urlArray: string[]): Promise<IResponse>;
    duplicateReviewExists(id: string): Promise<IResponse>;
}

export default IReviewRepository;
