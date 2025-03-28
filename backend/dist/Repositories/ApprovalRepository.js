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
const ApprovalModel_1 = __importDefault(require("../Models/ProviderModels/ApprovalModel"));
class ApprovalRepository {
    //checks approval exists for the current provider
    approvalExists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id);
                const exists = yield ApprovalModel_1.default.findOne({
                    provider_id: _id,
                    status: { $ne: "Rejected" },
                });
                return exists ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    // register provider data for admin approval
    providerApprovalRegistration(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = new mongoose_1.default.Types.ObjectId(data.provider_id);
                const service_id = new mongoose_1.default.Types.ObjectId(data.expertise_id);
                const approval = new ApprovalModel_1.default({
                    provider_id: id,
                    provider_experience: data.description,
                    provider_work_images: data.workImageUrls,
                    service_id: service_id,
                    aadhar_picture: data.aadharUrl,
                    status: "Pending",
                });
                const result = yield approval.save();
                if (result) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //get all approvals list based on page no
    getAllApprovals(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = 8;
                const pageNo = Number(page);
                // Aggregation with lookup
                const approvalData = yield ApprovalModel_1.default.aggregate([
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
                const totalRecords = yield ApprovalModel_1.default.countDocuments({ status: { $ne: "Rejected" } });
                return {
                    approvals: approvalData,
                    currentPage: pageNo,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
                };
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    // find approval document with id
    findApprovalDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id);
                const data = yield ApprovalModel_1.default.aggregate([
                    { $match: { _id: _id } },
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
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //update approval status to approved or rejected
    updateApprovalStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id);
                if (!["Approved", "Rejected"].includes(status)) {
                    return null;
                }
                const updateStatus = yield ApprovalModel_1.default.findByIdAndUpdate(_id, {
                    $set: { status: status },
                }, { new: true });
                return updateStatus;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
}
exports.default = ApprovalRepository;
