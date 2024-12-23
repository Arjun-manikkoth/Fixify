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
