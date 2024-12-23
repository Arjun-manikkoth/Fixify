import {SignUp, IUserWithOtp} from "../Interfaces/User/SignUpInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import {IUser} from "../Models/UserModels/UserModel";
import User from "../Models/UserModels/UserModel";
import Otp from "../Models/CommonModels/OtpModel";
import {IUpdateProfile} from "../Interfaces/User/SignUpInterface";
import mongoose from "mongoose";
import {ObjectId} from "mongoose";

class UserRepository implements IUserRepository {
     //insert a new user to db
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

     //store user otp to db
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

     //find user with email id
     async findUserByEmail(email: string): Promise<IUser | null> {
          try {
               return await User.findOne({email: email});
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
     //find otp from otp collection and aggreagate with users collection
     async findOtpWithId(userId: ObjectId): Promise<IUserWithOtp | null> {
          try {
               const data = await User.aggregate([
                    {$match: {_id: userId}},
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

     //update user profile
     async updateUserWithId(data: IUpdateProfile): Promise<Partial<IUser | null>> {
          try {
               console.log("reached repo ");
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
                    {$set: profileData},
                    {new: true}
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

               const data = await User.findOne({_id: _id});

               return data;
          } catch (error: any) {
               console.log(error.message);
               return null;
          }
     }
}
export default UserRepository;
