import {ObjectId} from "mongoose";
import mongoose from "mongoose";
import {SignUp, IProviderWithOtp, IProviderWithService} from "../Interfaces/Provider/SignIn";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import {IUpdateProfile} from "../Interfaces/Provider/SignIn";
import {IPaginatedProviders} from "../Interfaces/Admin/SignInInterface";
import {IProvider} from "../Models/ProviderModels/ProviderModel";
import Provider from "../Models/ProviderModels/ProviderModel";

class ProviderRepository implements IProviderRepository {
     //insert provider to db
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
     //find provider with email id
     async findProviderByEmail(email: string): Promise<IProvider | null> {
          try {
               return await Provider.findOne({email: email});
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //find aggregated document with provider otp
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
     //update provider profile data
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
     //fetch and aggregates to get provider profile data
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
     //get all provider*s based on queries
     async getAllProviders(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedProviders | null> {
          try {
               let limit = 8; // Number of records per page
               let pageNo: number = Number(page); // Current page number

               // Initialize the filter query object
               let filterQuery: any = {};

               // Add conditions based on the `filter`
               if (filter === "Verified") {
                    filterQuery.is_verified = true;
               } else if (filter === "Approved") {
                    filterQuery.is_approved = true;
               } else if (filter === "Blocked") {
                    filterQuery.is_blocked = true;
               }

               // Add search functionality
               if (search) {
                    filterQuery.$or = [
                         {name: {$regex: ".*" + search + ".*", $options: "i"}},
                         {email: {$regex: ".*" + search + ".*", $options: "i"}},
                         {mobile_no: {$regex: ".*" + search + ".*", $options: "i"}},
                    ];
               }

               // Fetch data with pagination
               const providerData = await Provider.find(filterQuery)
                    .skip((pageNo - 1) * limit)
                    .limit(limit);

               //total count
               const totalRecords = await Provider.countDocuments(filterQuery);

               return {
                    providers: providerData,
                    currentPage: pageNo,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
               };
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     //blocks user by changing status in db
     async changeProviderBlockStatus(id: string): Promise<boolean> {
          try {
               const blockStatus = await Provider.findByIdAndUpdate(
                    {_id: id},
                    {$set: {is_blocked: true}},
                    {new: true}
               );
               return blockStatus ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
     // unblocks user by changing status in db
     async changeProviderUnBlockStatus(id: string): Promise<boolean> {
          try {
               const blockStatus = await Provider.findByIdAndUpdate(
                    {_id: id},
                    {$set: {is_blocked: false}},
                    {new: true}
               );
               return blockStatus ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
     //get provider by id
     async getProviderById(id: ObjectId): Promise<IProvider | null> {
          try {
               return await Provider.findById({_id: id});
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //update providers status to approved and adds if there is no service
     async updateProviderServiceApproval(
          providerId: ObjectId,
          serviceId: ObjectId
     ): Promise<boolean> {
          try {
               const data = await Provider.findByIdAndUpdate(
                    providerId,
                    {
                         $set: {service_id: serviceId, is_approved: true},
                    },
                    {new: true}
               );

               return true;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     } // updates document with new password
     async updatePassword(email: string, password: string): Promise<boolean> {
          try {
               const updatedStatus = await Provider.findOneAndUpdate(
                    {email: email},
                    {$set: {password: password}}
               );
               return updatedStatus ? true : false;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
}

export default ProviderRepository;
