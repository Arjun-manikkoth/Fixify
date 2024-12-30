import IOtpRepository from "../Interfaces/Otp/OtpRepositoryInterface";
import {ObjectId} from "mongoose";
import Otp from "../Models/CommonModels/OtpModel";

class OtpRepository implements IOtpRepository {
     // //store  otp to db
     async storeOtp(otp: string, id: ObjectId): Promise<Boolean> {
          try {
               const otpNew = new Otp({
                    account_id: id,
                    value: otp,
               });
               const otpSaved = await otpNew.save();

               return otpSaved ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
}
export default OtpRepository;
