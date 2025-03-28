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
const ProviderModel_1 = __importDefault(require("../Models/ProviderModels/ProviderModel"));
class ProviderRepository {
    //insert provider to db
    insertProvider(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = new ProviderModel_1.default({
                    name: data.userName,
                    email: data.email,
                    service_id: data.service_id,
                    password: data.password,
                    mobile_no: data.mobileNo,
                    is_verified: true,
                    url: data.url,
                    google_id: data.google_id,
                });
                return yield provider.save();
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //find provider with email id
    findProviderByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ProviderModel_1.default.findOne({ email: email });
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //find aggregated document with provider otp
    findOtpWithId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield ProviderModel_1.default.aggregate([
                    { $match: { _id: id } },
                    {
                        $lookup: {
                            from: "otps",
                            localField: "_id",
                            foreignField: "account_id",
                            as: "otp_details",
                        },
                    },
                ]);
                const providerWithOtp = {
                    provider: data[0],
                    otp: data[0].otp_details,
                };
                return providerWithOtp;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //change provider status to verified
    verifyProvider(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verified = yield ProviderModel_1.default.findByIdAndUpdate({ _id: id }, { $set: { is_verified: true } }, { new: true });
                return true;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //get provider data with id
    getProviderDataWithId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id);
                const data = yield ProviderModel_1.default.findOne({ _id: _id });
                return data;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //update provider profile data
    updateProviderWithId(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let profileData = {};
                if (data.userName) {
                    profileData.name = data.userName;
                }
                if (data.url) {
                    profileData.url = data.url;
                }
                if (data.mobileNo) {
                    profileData.mobile_no = data.mobileNo;
                }
                const status = yield ProviderModel_1.default.findByIdAndUpdate(data.id, { $set: profileData }, { new: true });
                return status;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //fetch and aggregates to get provider profile data
    fetchProviderProfileData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id); // Ensure the ID is in the correct ObjectId format
                const data = yield ProviderModel_1.default.aggregate([
                    { $match: { _id } }, // Match the provider by ID
                    {
                        $lookup: {
                            from: "services", // Collection name in MongoDB
                            localField: "service_id", // Field in providerModel
                            foreignField: "_id", // Field in Services
                            as: "service_details", // Alias for the joined data
                        },
                    },
                    { $unwind: { path: "$service_details", preserveNullAndEmptyArrays: true } },
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
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //get all provider*s based on queries
    getAllProviders(search, page, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let limit = 8; // Number of records per page
                let pageNo = Number(page); // Current page number
                // Initialize the filter query object
                let filterQuery = {};
                // Add conditions based on the `filter`
                if (filter === "Verified") {
                    filterQuery.is_verified = true;
                }
                else if (filter === "Approved") {
                    filterQuery.is_approved = true;
                }
                else if (filter === "Blocked") {
                    filterQuery.is_blocked = true;
                }
                // Add search functionality
                if (search) {
                    filterQuery.$or = [
                        { name: { $regex: ".*" + search + ".*", $options: "i" } },
                        { email: { $regex: ".*" + search + ".*", $options: "i" } },
                        { mobile_no: { $regex: ".*" + search + ".*", $options: "i" } },
                    ];
                }
                // Fetch data with pagination
                const providerData = yield ProviderModel_1.default.find(filterQuery)
                    .skip((pageNo - 1) * limit)
                    .limit(limit);
                //total count
                const totalRecords = yield ProviderModel_1.default.countDocuments(filterQuery);
                return {
                    providers: providerData,
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
    //blocks user by changing status in db
    changeProviderBlockStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockStatus = yield ProviderModel_1.default.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: true } }, { new: true });
                return blockStatus ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    // unblocks user by changing status in db
    changeProviderUnBlockStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockStatus = yield ProviderModel_1.default.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: false } }, { new: true });
                return blockStatus ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //update providers status to approved and adds if there is no service
    updateProviderServiceApproval(providerId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield ProviderModel_1.default.findByIdAndUpdate(providerId, {
                    $set: { service_id: serviceId, is_approved: true },
                }, { new: true });
                return true;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    // updates document with new password
    updatePassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedStatus = yield ProviderModel_1.default.findOneAndUpdate({ email: email }, { $set: { password: password } });
                return updatedStatus ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //get total providers count
    // get total verified users
    getActiveProvidersCount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield ProviderModel_1.default.countDocuments({
                    is_verified: true,
                    is_approved: true,
                    is_blocked: false,
                    is_deleted: false,
                });
                return {
                    success: true,
                    message: "Fetched active providers count",
                    data: count,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Failed to fetch active providers count",
                    data: null,
                };
            }
        });
    }
}
exports.default = ProviderRepository;
