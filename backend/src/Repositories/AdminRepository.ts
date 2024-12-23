import IAdminRepository from "../Interfaces/Admin/AdminRepositoryInterface";
import {IAdmin} from "../Models/AdminModels/AdminModel";
import Admin from "../Models/AdminModels/AdminModel";
import {IUser} from "../Models/UserModels/UserModel";
import User from "../Models/UserModels/UserModel";
import {IPaginatedUsers} from "../Interfaces/Admin/SignInInterface";

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
}
export default AdminRepository;
