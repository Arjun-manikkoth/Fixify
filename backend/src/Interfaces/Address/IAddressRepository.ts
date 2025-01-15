import { IAddress } from "../../Models/UserModels/AddressModel";
import { IAddAddress } from "../User/SignUpInterface";

export interface IAddressRepository {
    createAddress(addressData: IAddAddress): Promise<boolean>;
    countAddresses(userId: string): Promise<number | null>;
    checkDuplicate(addressData: IAddAddress): Promise<boolean | null>;
    fetchAllAddress(userId: string): Promise<IAddress[] | null>;
    deleteAddress(id: string): Promise<boolean>;
    fetchAddress(addressId: string): Promise<IAddress | null>;
    updateAddress(address: IAddAddress, id: string): Promise<boolean>;
}
