import {IApprovals} from "../../Models/ProviderModels/ApprovalModel";
import {IProvider} from "../../Models/ProviderModels/ProviderModel";
import {IUser} from "../../Models/UserModels/UserModel";
import {ObjectId} from "mongoose";

export interface ISignIn {
     email: string;
     password: string;
}
export interface IPaginatedUsers {
     users: IUser[]; // Array of user data
     currentPage: number; // Current page number
     totalPages: number; // Total number of pages
     totalRecords: number; // Total number of records
}

export interface IPaginatedProviders {
     providers: IProvider[]; // Array of provider data
     currentPage: number; // Current page number
     totalPages: number; // Total number of pages
     totalRecords: number; // Total number of records
}

export interface IPaginatedApprovals {
     approvals: IApprovals[]; // Array of approval data
     currentPage: number; // Current page number
     totalPages: number; // Total number of pages
     totalRecords: number; // Total number of records
}

export interface IApprovalDetails {
     _id: ObjectId;
     provider_id: ObjectId | null;
     service_id: ObjectId | null;
     provider_experience: string;
     provider_work_images: string[] | null;
     aadhar_picture: string;
     status: string;
     providerDetails: {
          name: string;
          email: string;
          mobile_no: string;
          url: string;
          is_blocked: boolean;
     } | null;
     serviceDetails: {
          name: string;
          is_active: boolean;
     } | null;
}
