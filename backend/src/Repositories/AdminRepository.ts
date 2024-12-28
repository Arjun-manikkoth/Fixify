import IAdminRepository from "../Interfaces/Admin/AdminRepositoryInterface";
import {IAdmin} from "../Models/AdminModels/AdminModel";
import Admin from "../Models/AdminModels/AdminModel";
import {IUser} from "../Models/UserModels/UserModel";
import User from "../Models/UserModels/UserModel";
import {
     IApprovalDetails,
     IPaginatedApprovals,
     IPaginatedUsers,
} from "../Interfaces/Admin/SignInInterface";
import {IPaginatedProviders} from "../Interfaces/Admin/SignInInterface";
import Provider, {IProvider} from "../Models/ProviderModels/ProviderModel";
import Approval, {IApprovals} from "../Models/ProviderModels/ApprovalModel";
import mongoose, {ObjectId} from "mongoose";

class AdminRepository implements IAdminRepository {
     //find admin by email
     async findAdminByEmail(email: string): Promise<IAdmin | null> {
          try {
               return await Admin.findOne({email: email});
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //get all users based on queries
     async getAllUsers(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedUsers | null> {
          try {
               let limit = 8; // Number of records per page
               let pageNo: number = Number(page); // Current page number

               // Initialize the filter query object
               let filterQuery: any = {};

               // Add conditions based on the `filter`
               if (filter === "Verified") {
                    filterQuery.is_verified = true;
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
               const userData = await User.find(filterQuery)
                    .skip((pageNo - 1) * limit)
                    .limit(limit);

               //total count
               const totalRecords = await User.countDocuments(filterQuery);

               return {
                    users: userData,
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
     async changeUserBlockStatus(id: string): Promise<boolean> {
          try {
               const blockStatus = await User.findByIdAndUpdate(
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
     async changeUserUnBlockStatus(id: string): Promise<boolean> {
          try {
               const blockStatus = await User.findByIdAndUpdate(
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
     //get all users based on queries
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

     //get all approvals list based on page no
     async getAllApprovals(page: string): Promise<IPaginatedApprovals | null> {
          try {
               const limit = 8;
               const pageNo: number = Number(page);

               // Aggregation with lookup
               const approvalData = await Approval.aggregate([
                    {
                         $match: {
                              status: "Pending",
                         },
                    },
                    {
                         $lookup: {
                              from: "providers", // Collection  providers
                              localField: "provider_id",
                              foreignField: "_id",
                              as: "providerDetails",
                         },
                    },
                    {
                         $lookup: {
                              from: "services", // Collection services
                              localField: "service_id",
                              foreignField: "_id",
                              as: "serviceDetails",
                         },
                    },
                    {
                         $unwind: {
                              path: "$providerDetails",
                              preserveNullAndEmptyArrays: true,
                         },
                    },
                    {
                         $unwind: {
                              path: "$serviceDetails",
                              preserveNullAndEmptyArrays: true,
                         },
                    },
                    {
                         $project: {
                              _id: 1,
                              provider_id: 1,
                              service_id: 1,
                              provider_experience: 1,
                              provider_work_images: 1,
                              aadhar_picture: 1,
                              status: 1,
                              "providerDetails.name": 1,
                              "providerDetails.email": 1,
                              "providerDetails.mobile_no": 1,
                              "serviceDetails.name": 1,
                              "serviceDetails.description": 1,
                         },
                    },
                    {
                         $skip: (pageNo - 1) * limit,
                    },
                    {
                         $limit: limit,
                    },
               ]);

               const totalRecords = await Approval.countDocuments({status: {$ne: "Rejected"}});

               return {
                    approvals: approvalData,
                    currentPage: pageNo,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
               };
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     // find approval document with id
     async findApprovalDetail(id: string): Promise<IApprovalDetails[] | null> {
          try {
               const _id = new mongoose.Types.ObjectId(id);

               const data = await Approval.aggregate([
                    {$match: {_id: _id}},
                    {
                         $lookup: {
                              from: "providers",
                              localField: "provider_id",
                              foreignField: "_id",
                              as: "providerDetails",
                         },
                    },
                    {
                         $lookup: {
                              from: "services", // Collection services
                              localField: "service_id",
                              foreignField: "_id",
                              as: "serviceDetails",
                         },
                    },
                    {
                         $unwind: {
                              path: "$providerDetails",
                              preserveNullAndEmptyArrays: true,
                         },
                    },
                    {
                         $unwind: {
                              path: "$serviceDetails",
                              preserveNullAndEmptyArrays: true,
                         },
                    },
                    {
                         $project: {
                              _id: 1,
                              provider_id: 1,
                              provider_experience: 1,
                              provider_work_images: 1,
                              service_id: 1,
                              aadhar_picture: 1,
                              "providerDetails.name": 1,
                              "providerDetails.email": 1,
                              "providerDetails.mobile_no": 1,
                              "providerDetails.url": 1,
                              "providerDetails.is_blocked": 1,
                              "serviceDetails.name": 1,
                              "serviceDetails.is_active": 1,
                         },
                    },
               ]);
               return data;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     //update approval status to approved or rejected
     async updateApprovalStatus(id: string, status: string): Promise<IApprovals | null> {
          try {
               const _id = new mongoose.Types.ObjectId(id);

               if (!["Approved", "Rejected"].includes(status)) {
                    return null;
               }

               const updateStatus = await Approval.findByIdAndUpdate(
                    _id,
                    {
                         $set: {status: status},
                    },
                    {new: true}
               );

               return updateStatus;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     async getProviderById(id: ObjectId): Promise<IProvider | null> {
          try {
               return await Provider.findById({_id: id});
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }

     //
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
               console.log("data at the repo update user provider service approval", data);
               return true;
          } catch (error: any) {
               console.log(error.message);
               return false;
          }
     }
}

export default AdminRepository;
