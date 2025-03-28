"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServiceModel_1 = __importDefault(require("../Models/ProviderModels/ServiceModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class ServiceRepository {
    // // get all services
    getAllServices() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ServiceModel_1.default.find({ is_active: true });
            }
            catch (error) {
                console.log(error.message);
                throw new Error("Failed to fetch services"); // Propagate error
            }
        });
    }
    //get all the services with search pagination and filter
    getServicesByFilter(search, page, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let limit = 8; // Number of records per page
                let pageNo = Number(page); // Current page number
                // Initialize the filter query object
                let filterQuery = {};
                // Add conditions based on the `filter`
                if (filter === "Listed") {
                    filterQuery.is_active = true;
                }
                else if (filter === "Unlisted") {
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
                const serviceData = yield ServiceModel_1.default.find(filterQuery)
                    .skip((pageNo - 1) * limit)
                    .limit(limit);
                //total count
                const totalRecords = yield ServiceModel_1.default.countDocuments(filterQuery);
                return {
                    services: serviceData,
                    currentPage: pageNo,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
                };
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //updates service status to list and unlist
    updateServiceStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongoose_1.default.Types.ObjectId(id);
                let value = true;
                if (status === "UnList") {
                    value = false;
                }
                const updateStatus = yield ServiceModel_1.default.findByIdAndUpdate(_id, { $set: { is_active: value } }, { new: true });
                return updateStatus ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //create new service to database
    createService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const service = new ServiceModel_1.default({
                    name: data.serviceName.toLowerCase(),
                    description: data.description,
                });
                const status = yield service.save();
                return status;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //get service with name
    getServiceByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield ServiceModel_1.default.findOne({ name: name.toLowerCase() });
                return exists ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //get service with id
    getServiceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ServiceModel_1.default.findById({ _id: new mongoose_1.default.Types.ObjectId(id) });
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //check duplicate service exists with different id
    getServiceByFilter(id, serviceName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield ServiceModel_1.default.findOne({
                    name: serviceName,
                    _id: { $ne: new mongoose_1.default.Types.ObjectId(id) },
                });
                return exists ? true : false;
            }
            catch (error) {
                console.log(error.message);
                throw new Error("failed to get duplicate service");
            }
        });
    }
    //update service details
    updateServiceData(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedData = yield ServiceModel_1.default.findByIdAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(id) }, { $set: { name: data.serviceName, description: data.description } }, { new: true });
                return updatedData ? true : false;
            }
            catch (error) {
                console.log(error);
                throw new Error("Cannot update service at this moment");
            }
        });
    }
}
exports.default = ServiceRepository;
