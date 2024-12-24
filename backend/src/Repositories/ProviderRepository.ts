import {SignUp, IProviderWithOtp, IProviderWithService} from "../Interfaces/Provider/SignIn";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import {IProvider} from "../Models/ProviderModels/ProviderModel";
import Service from "../Models/ProviderModels/ServiceModel";
import Provider from "../Models/ProviderModels/ProviderModel";
import Otp from "../Models/CommonModels/OtpModel";
import {ObjectId} from "mongoose";
import {IServices} from "../Models/ProviderModels/ServiceModel";
import mongoose from "mongoose";
import {IUpdateProfile} from "../Interfaces/Provider/SignIn";
import {IProviderRegistration} from "../Interfaces/Provider/SignIn";
import Approval from "../Models/ProviderModels/ApprovalModel";

class ProviderRepository implements IProviderRepository {
     // get all services
     async getAllServices(): Promise<IServices[]> {
          try {
               return await Service.find({is_active: true});
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
     //change provider status to verified
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
               const _id = new mongoose.Types.ObjectId(id);
               const data = await Provider.findOne({_id: _id});

               return data;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     //update provider profile
     async updateProviderWithId(data: IUpdateProfile): Promise<Partial<IProvider | null>> {
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
     //fetch provider profile
     async fetchProviderProfileData(id: string): Promise<Partial<IProviderWithService | null>> {
          try {
               const _id = new mongoose.Types.ObjectId(id); // Ensure the ID is in the correct ObjectId format

               const data = await Provider.aggregate([
                    {$match: {_id}}, // Match the provider by ID
                    {
                         $lookup: {
                              from: "services", // Collection name in MongoDB
                              localField: "service_id", // Field in providerModel
                              foreignField: "_id", // Field in Services
                              as: "service_details", // Alias for the joined data
                         },
                    },
                    {$unwind: {path: "$service_details", preserveNullAndEmptyArrays: true}},
                    {
                         $project: {
                              name: 1,
                              email: 1,
                              mobile_no: 1,
                              url: 1,
                              google_id: 1,
                              is_blocked: 1,
                              is_approved: 1,
                              is_verified: 1,
                              "service_details.name": 1,
                              "service_details.description": 1,
                              "service_details.is_active": 1,
                         },
                    },
               ]);

               if (!data.length) {
                    return null; // Return null if no matching provider is found
               }

               return {
                    provider: {
                         _id: data[0]._id,
                         name: data[0].name,
                         email: data[0].email,
                         mobile_no: data[0].mobile_no,
                         url: data[0].url,
                         google_id: data[0].google_id,
                         is_blocked: data[0].is_blocked,
                         is_approved: data[0].is_approved,
                         is_verified: data[0].is_verified,
                    },
                    service: data[0].service_details || null,
               };
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     async providerRegistration(data: IProviderRegistration): Promise<boolean> {
          try {
               const _id = new mongoose.Types.ObjectId(data._id);
               const _idService = new mongoose.Types.ObjectId(data.expertise);

               const approval = new Approval({
                    provider_id: _id,
                    provider_experience: data.description,
                    provider_work_images: data.workImages,
                    service_id: _idService,
                    aadhar_picture: data.aadharImage,
                    status: "Pending",
               });
               const result = await approval.save();
               if (result) {
                    return true;
               } else {
                    return false;
               }
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
     async approvalExists(id: string): Promise<boolean> {
          try {
               const _id = new mongoose.Types.ObjectId(id);

               const exists = await Approval.findOne({provider_id: _id, status: {$ne: "Rejected"}});

               return exists ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
}
export default ProviderRepository;
