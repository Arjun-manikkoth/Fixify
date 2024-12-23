import {SignUp, IProviderWithOtp} from "../Interfaces/Provider/SignIn";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import {IProvider} from "../Models/ProviderModels/ProviderModel";
import Service from "../Models/ProviderModels/ServiceModel";
import Provider from "../Models/ProviderModels/ProviderModel";
import Otp from "../Models/CommonModels/OtpModel";
import {ObjectId} from "mongoose";
import {IServices} from "../Models/ProviderModels/ServiceModel";
import mongoose from "mongoose";
import {IUpdateProfile} from "../Interfaces/Provider/SignIn";

class ProviderRepository implements IProviderRepository {
     // get all services
     async getAllServices(): Promise<IServices[]> {
          try {
               return await Service.find({});
          } catch (error: any) {
               console.log(error.message);
               throw new Error("Failed to fetch services"); // Propagate error
          }
     }
     async insertProvider(data: SignUp): Promise<IProvider | null> {
          try {
               const provider = new Provider({
                    name: data.userName,
                    email: data.email,
                    service_id: data.service_id,
                    password: data.password,
                    mobile_no: data.mobileNo,
                    is_verified: true,
                    url: data.url,
                    google_id: data.google_id,
               });

               return await provider.save();
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

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

     async findProviderByEmail(email: string): Promise<IProvider | null> {
          try {
               return await Provider.findOne({email: email});
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     async findOtpWithId(id: ObjectId): Promise<IProviderWithOtp | null> {
          try {
               const data = await Provider.aggregate([
                    {$match: {_id: id}},
                    {
                         $lookup: {
                              from: "otps",
                              localField: "_id",
                              foreignField: "account_id",
                              as: "otp_details",
                         },
                    },
               ]);

               const providerWithOtp: IProviderWithOtp = {
                    provider: data[0],
                    otp: data[0].otp_details,
               };

               return providerWithOtp;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     async verifyProvider(id: ObjectId): Promise<Boolean> {
          try {
               const verified = await Provider.findByIdAndUpdate(
                    {_id: id},
                    {$set: {is_verified: true}},
                    {new: true}
               );
               return true;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
     //get provider data with id
     async getProviderDataWithId(id: string): Promise<Partial<IProvider> | null> {
          try {
               console.log("reached at getproviderdatawithId", id);
               const _id = new mongoose.Types.ObjectId(id);
               const data = await Provider.findOne({_id: _id});

               return data;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     //update user profile
     async updateUserWithId(data: IUpdateProfile): Promise<Partial<IProvider | null>> {
          try {
               interface Profile {
                    name?: string;
                    email?: string;
                    url?: string;
                    mobile_no?: string;
               }

               let profileData: Profile = {};

               if (data.userName) {
                    profileData.name = data.userName;
               }

               if (data.url) {
                    profileData.url = data.url;
               }

               if (data.mobileNo) {
                    profileData.mobile_no = data.mobileNo;
               }

               const status = await Provider.findByIdAndUpdate(
                    data.id,
                    {$set: profileData},
                    {new: true}
               );

               return status;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
}
export default ProviderRepository;
