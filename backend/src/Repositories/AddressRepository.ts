import { IResponse } from "../Services/AdminServices";
import { IAddressRepository } from "../Interfaces/Address/IAddressRepository";
import { IAddAddress } from "../Interfaces/User/SignUpInterface";
import { IAddress } from "../Models/UserModels/AddressModel";
import Address from "../Models/UserModels/AddressModel";
import mongoose from "mongoose";

class AddressRepository implements IAddressRepository {
    //
    async createAddress(addressData: IAddAddress): Promise<boolean> {
        try {
            const address = new Address({
                user_id: new mongoose.Types.ObjectId(addressData.id),
                house_name: addressData.houseName,
                landmark: addressData.landmark,
                city: addressData.city,
                state: addressData.state,
                pincode: addressData.pincode,
                latittude: addressData.latitude,
                longittude: addressData.longitude,
            });

            const status = await address.save();

            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //count the number of addresses user have
    async countAddresses(userId: string): Promise<number | null> {
        try {
            const count = await Address.countDocuments({
                user_id: new mongoose.Types.ObjectId(userId),
                is_deleted: false,
            });
            return count;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //checks for duplicate addresses
    async checkDuplicate(addressData: IAddAddress): Promise<boolean | null> {
        try {
            const exists = await Address.findOne({
                user_id: new mongoose.Types.ObjectId(addressData.id),
                latittude: addressData.latitude,
                longittude: addressData.longitude,
                house_name: addressData.houseName,
            });

            return exists ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    // Get all active addresses related to the user
    async fetchAllAddress(userId: string): Promise<IAddress[] | null> {
        try {
            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error("Invalid user ID format:", userId);
                return null;
            }

            // Fetch active addresses
            const addressData = await Address.find({
                user_id: new mongoose.Types.ObjectId(userId),
                is_deleted: false,
            });

            return addressData;
        } catch (error: any) {
            console.error("Error fetching addresses for user:", userId, error.message);
            return null;
        }
    }

    // updates the is_deleted field as false
    async deleteAddress(id: string): Promise<boolean> {
        try {
            const status = await Address.updateOne(
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { is_deleted: true } }
            );
            return status.modifiedCount ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    // Get all active addresses related to the user
    async fetchAddress(addressId: string): Promise<IAddress | null> {
        try {
            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(addressId)) {
                console.error("Invalid addressId format:", addressId);
                return null;
            }

            // Fetch active address
            const addressData = await Address.findOne({
                _id: new mongoose.Types.ObjectId(addressId),
                is_deleted: false,
            });

            return addressData;
        } catch (error: any) {
            console.error("Error fetching address for user:", addressId, error.message);
            return null;
        }
    }

    //updates address with new data
    async updateAddress(address: IAddAddress, id: string): Promise<boolean> {
        try {
            const status = await Address.updateOne(
                { _id: new mongoose.Types.ObjectId(id) },
                {
                    $set: {
                        house_name: address.houseName,
                        landmark: address.landmark,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        latittude: address.latitude,
                        longittude: address.longitude,
                    },
                }
            );
            console.log(status);
            return status.modifiedCount ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
}

export default AddressRepository;
