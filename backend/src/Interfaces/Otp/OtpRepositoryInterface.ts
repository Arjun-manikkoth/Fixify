import {ObjectId} from "mongoose";

//interface for otp repository
interface IOtpRepository {
     storeOtp(otp: string, id: ObjectId): Promise<Boolean>;
}

export default IOtpRepository;
