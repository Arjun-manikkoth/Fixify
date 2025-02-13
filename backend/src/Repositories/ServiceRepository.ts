import { IServices } from "../Models/ProviderModels/ServiceModel";
import Service from "../Models/ProviderModels/ServiceModel";
import IServiceRepository from "../Interfaces/Service/IServiceRepository";
import { IPaginatedServices } from "../Interfaces/Service/IServices";
import { IAddService } from "../Interfaces/Admin/SignInInterface";
import mongoose from "mongoose";

class ServiceRepository implements IServiceRepository {
    // // get all services
    async getAllServices(): Promise<IServices[]> {
        try {
            return await Service.find({ is_active: true });
        } catch (error: any) {
            console.log(error.message);
            throw new Error("Failed to fetch services"); // Propagate error
        }
    }
    //get all the services with search pagination and filter
    async getServicesByFilter(
        search: string,
        page: string,
        filter: string
    ): Promise<IPaginatedServices | null> {
        try {
            let limit = 8; // Number of records per page
            let pageNo: number = Number(page); // Current page number

            // Initialize the filter query object
            let filterQuery: any = {};

            // Add conditions based on the `filter`
            if (filter === "Listed") {
                filterQuery.is_active = true;
            } else if (filter === "Unlisted") {
                filterQuery.is_active = false;
            }

            // Add search functionality
            if (search) {
                filterQuery.$or = [
                    { name: { $regex: ".*" + search + ".*", $options: "i" } },
                    { description: { $regex: ".*" + search + ".*", $options: "i" } },
                ];
            }

            // Fetch data with pagination
            const serviceData = await Service.find(filterQuery)
                .skip((pageNo - 1) * limit)
                .limit(limit);

            //total count
            const totalRecords = await Service.countDocuments(filterQuery);

            return {
                services: serviceData,
                currentPage: pageNo,
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
            };
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //updates service status to list and unlist
    async updateServiceStatus(id: string, status: string): Promise<boolean> {
        try {
            const _id = new mongoose.Types.ObjectId(id);
            let value: boolean = true;
            if (status === "UnList") {
                value = false;
            }
            const updateStatus = await Service.findByIdAndUpdate(
                _id,
                { $set: { is_active: value } },
                { new: true }
            );
            return updateStatus ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //create new service to database
    async createService(data: IAddService): Promise<IServices | null> {
        try {
            const service = new Service({
                name: data.serviceName.toLowerCase(),
                description: data.description,
            });
            const status = await service.save();
            return status;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //get service with name
    async getServiceByName(name: string): Promise<boolean | null> {
        try {
            const exists = await Service.findOne({ name: name.toLowerCase() });
            return exists ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //get service with id
    async getServiceById(id: string): Promise<IServices | null> {
        try {
            return await Service.findById({ _id: new mongoose.Types.ObjectId(id) });
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //check duplicate service exists with different id
    async getServiceByFilter(id: string, serviceName: string): Promise<boolean> {
        try {
            const exists = await Service.findOne({
                name: serviceName,
                _id: { $ne: new mongoose.Types.ObjectId(id) },
            });

            return exists ? true : false;
        } catch (error: any) {
            console.log(error.message);
            throw new Error("failed to get duplicate service");
        }
    }
    //update service details
    async updateServiceData(id: string, data: IAddService): Promise<boolean> {
        try {
            const updatedData = await Service.findByIdAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { name: data.serviceName, description: data.description } },
                { new: true }
            );

            return updatedData ? true : false;
        } catch (error: any) {
            console.log(error);
            throw new Error("Cannot update service at this moment");
        }
    }
}

export default ServiceRepository;
