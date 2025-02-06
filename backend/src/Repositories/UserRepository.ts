import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import { SignUp, IUserWithOtp } from "../Interfaces/User/SignUpInterface";
import { IUpdateProfile } from "../Interfaces/User/SignUpInterface";
import { IPaginatedUsers } from "../Interfaces/Admin/SignInInterface";
import User from "../Models/UserModels/UserModel";
import { IUser } from "../Models/UserModels/UserModel";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";

class UserRepository implements IUserRepository {
    //adds user to db
    async insertUser(userData: SignUp): Promise<IUser | null> {
        try {
            const user = new User({
                name: userData.userName,
                email: userData.email,
                password: userData.password,
                mobile_no: userData.mobileNo,
                url: userData.url,
                is_verified: true,
                google_id: userData.google_id,
            });

            return await user.save();
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //find user with email id
    async findUserByEmail(email: string): Promise<IUser | null> {
        try {
            console.log(email);
            console.log(await User.findOne({ email: email }));
            return await User.findOne({ email: email });
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //find otp from otp collection and aggreagate with users collection
    async findOtpWithId(userId: ObjectId): Promise<IUserWithOtp | null> {
        try {
            const data = await User.aggregate([
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

            const userWithOtp: IUserWithOtp = {
                user: data[0],
                otp: data[0].otp_details,
            };

            return userWithOtp;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //change user verification status
    async verifyUser(id: ObjectId): Promise<Boolean> {
        try {
            const verified = await User.findByIdAndUpdate(
                { _id: id },
                { $set: { is_verified: true } },
                { new: true }
            );
            return true;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //update user profile
    async updateUserWithId(data: IUpdateProfile): Promise<Partial<IUser | null>> {
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

            const status = await User.findByIdAndUpdate(
                data.id,
                { $set: profileData },
                { new: true }
            );

            return status;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //get user data with id
    async getUserDataWithId(id: string): Promise<Partial<IUser> | null> {
        try {
            const _id = new mongoose.Types.ObjectId(id);

            const data = await User.findOne({ _id: _id });

            return data;
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
                    { name: { $regex: ".*" + search + ".*", $options: "i" } },
                    { email: { $regex: ".*" + search + ".*", $options: "i" } },
                    { mobile_no: { $regex: ".*" + search + ".*", $options: "i" } },
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
                { _id: id },
                { $set: { is_blocked: true } },
                { new: true }
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
                { _id: id },
                { $set: { is_blocked: false } },
                { new: true }
            );
            return blockStatus ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
    // updates document with new password
    async updatePassword(email: string, password: string): Promise<boolean> {
        try {
            const updatedStatus = await User.findOneAndUpdate(
                { email: email },
                { $set: { password: password } }
            );
            return updatedStatus ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
}
export default UserRepository;
