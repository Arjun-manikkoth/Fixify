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
const UserModel_1 = __importDefault(require("../Models/UserModels/UserModel"));
class UserRepository {
    //adds user to db
    insertUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = new UserModel_1.default({
                    name: userData.userName,
                    email: userData.email,
                    password: userData.password,
                    mobile_no: userData.mobileNo,
                    url: userData.url,
                    is_verified: true,
                    google_id: userData.google_id,
                });
                return yield user.save();
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //find user with email id
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield UserModel_1.default.findOne({ email: email });
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //find otp from otp collection and aggreagate with users collection
    findOtpWithId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield UserModel_1.default.aggregate([
                    { $match: { _id: userId } },
                    {
                        $lookup: {
                            from: "otps",
                            localField: "_id",
                            foreignField: "account_id",
                            as: "otp_details",
                        },
                    },
                ]);
                const userWithOtp = {
                    user: data[0],
                    otp: data[0].otp_details,
                };
                return userWithOtp;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //change user verification status
    verifyUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verified = yield UserModel_1.default.findByIdAndUpdate({ _id: id }, { $set: { is_verified: true } }, { new: true });
                return true;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //update user profile
    updateUserWithId(data) {
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
                const status = yield UserModel_1.default.findByIdAndUpdate(data.id, { $set: profileData }, { new: true });
                return status;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //get user data with id
    getUserDataWithId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id);
                const data = yield UserModel_1.default.findOne({ _id: _id });
                return data;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //get all users based on queries
    getAllUsers(search, page, filter) {
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
                const userData = yield UserModel_1.default.find(filterQuery)
                    .skip((pageNo - 1) * limit)
                    .limit(limit);
                //total count
                const totalRecords = yield UserModel_1.default.countDocuments(filterQuery);
                return {
                    users: userData,
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
    changeUserBlockStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockStatus = yield UserModel_1.default.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: true } }, { new: true });
                return blockStatus ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    // unblocks user by changing status in db
    changeUserUnBlockStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockStatus = yield UserModel_1.default.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: false } }, { new: true });
                return blockStatus ? true : false;
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
                const updatedStatus = yield UserModel_1.default.findOneAndUpdate({ email: email }, { $set: { password: password } });
                return updatedStatus ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    // get total verified users
    getActiveUsersCount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield UserModel_1.default.countDocuments({
                    is_verified: true,
                    is_blocked: false,
                    is_deleted: false,
                });
                return {
                    success: true,
                    message: "Fetched active users count",
                    data: count,
                };
            }
            catch (error) {
                console.log(error.message);
                return {
                    success: false,
                    message: "Failed to fetch active users count",
                    data: null,
                };
            }
        });
    }
}
exports.default = UserRepository;
