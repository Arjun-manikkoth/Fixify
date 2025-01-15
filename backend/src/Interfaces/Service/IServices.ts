import { IServices } from "../../Models/ProviderModels/ServiceModel";

export interface IPaginatedServices {
    services: IServices[]; // Array of service data
    currentPage: number; // Current page number
    totalPages: number; // Total number of pages
    totalRecords: number; // Total number of records
}
