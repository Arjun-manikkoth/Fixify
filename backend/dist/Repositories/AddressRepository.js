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
const AddressModel_1 = __importDefault(require("../Models/UserModels/AddressModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class AddressRepository {
    //
    createAddress(addressData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const address = new AddressModel_1.default({
                    user_id: new mongoose_1.default.Types.ObjectId(addressData.id),
                    house_name: addressData.houseName,
                    landmark: addressData.landmark,
                    city: addressData.city,
                    state: addressData.state,
                    pincode: addressData.pincode,
                    latittude: addressData.latitude,
                    longittude: addressData.longitude,
                });
                const status = yield address.save();
                return status ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    //count the number of addresses user have
    countAddresses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield AddressModel_1.default.countDocuments({
                    user_id: new mongoose_1.default.Types.ObjectId(userId),
                    is_deleted: false,
                });
                return count;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    //checks for duplicate addresses
    checkDuplicate(addressData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield AddressModel_1.default.findOne({
                    user_id: new mongoose_1.default.Types.ObjectId(addressData.id),
                    latittude: addressData.latitude,
                    longittude: addressData.longitude,
                    house_name: addressData.houseName,
                });
                return exists ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return null;
            }
        });
    }
    // Get all active addresses related to the user
    fetchAllAddress(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate userId format
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    console.error("Invalid user ID format:", userId);
                    return null;
                }
                // Fetch active addresses
                const addressData = yield AddressModel_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(userId),
                    is_deleted: false,
                });
                return addressData;
            }
            catch (error) {
                console.error("Error fetching addresses for user:", userId, error.message);
                return null;
            }
        });
    }
    // updates the is_deleted field as false
    deleteAddress(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield AddressModel_1.default.updateOne({ _id: new mongoose_1.default.Types.ObjectId(id) }, { $set: { is_deleted: true } });
                return status.modifiedCount ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
    // Get all active addresses related to the user
    fetchAddress(addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate userId format
                if (!mongoose_1.default.Types.ObjectId.isValid(addressId)) {
                    console.error("Invalid addressId format:", addressId);
                    return null;
                }
                // Fetch active address
                const addressData = yield AddressModel_1.default.findOne({
                    _id: new mongoose_1.default.Types.ObjectId(addressId),
                    is_deleted: false,
                });
                return addressData;
            }
            catch (error) {
                console.error("Error fetching address for user:", addressId, error.message);
                return null;
            }
        });
    }
    //updates address with new data
    updateAddress(address, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield AddressModel_1.default.updateOne({ _id: new mongoose_1.default.Types.ObjectId(id) }, {
                    $set: {
                        house_name: address.houseName,
                        landmark: address.landmark,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        latittude: address.latitude,
                        longittude: address.longitude,
                    },
                });
                console.log(status);
                return status.modifiedCount ? true : false;
            }
            catch (error) {
                console.log(error.message);
                return false;
            }
        });
    }
}
exports.default = AddressRepository;
