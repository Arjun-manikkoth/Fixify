import IAdminRepository from "../Interfaces/Admin/AdminRepositoryInterface";
import {IAdmin} from "../Models/AdminModels/AdminModel";
import Admin from "../Models/AdminModels/AdminModel";

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
}

export default AdminRepository;
