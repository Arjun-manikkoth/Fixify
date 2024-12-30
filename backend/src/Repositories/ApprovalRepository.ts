import IApprovalRepository from "../Interfaces/Approval/ApprovalRepositoryInterface";
import mongoose from "mongoose";
import {IProviderRegistration} from "../Interfaces/Provider/SignIn";
import {IPaginatedApprovals} from "../Interfaces/Admin/SignInInterface";
import {IApprovalDetails} from "../Interfaces/Admin/SignInInterface";
import Approval from "../Models/ProviderModels/ApprovalModel";
import {IApprovals} from "../Models/ProviderModels/ApprovalModel";

class ApprovalRepository implements IApprovalRepository {
     //checks approval exists for the current provider
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
     // register provider data for admin approval
     async providerApprovalRegistration(data: IProviderRegistration): Promise<boolean> {
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
}
export default ApprovalRepository;
