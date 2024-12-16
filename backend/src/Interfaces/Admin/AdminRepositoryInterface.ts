import {IAdmin} from "../../Models/AdminModels/AdminModel";

interface IAdminRepository {
     findAdminByEmail(email: string): Promise<IAdmin | null>;
}

export default IAdminRepository;
