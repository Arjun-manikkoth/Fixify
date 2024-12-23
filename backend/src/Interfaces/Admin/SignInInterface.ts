import {IProvider} from "../../Models/ProviderModels/ProviderModel";
import {IUser} from "../../Models/UserModels/UserModel";

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
     providers: IProvider[]; // Array of user data
     currentPage: number; // Current page number
     totalPages: number; // Total number of pages
     totalRecords: number; // Total number of records
}
