import React, { useEffect, useState } from "react";
import { getAddressesApi } from "../../../Api/UserApis";
import { useSelector } from "react-redux";
import AddNewAddress from "../../CommonComponents/Modals/AddAddressModal";
import { RootState } from "../../../Redux/Store";
import { toast } from "react-toastify";
import { FaWindowClose } from "react-icons/fa";

export interface IAddress {
    city: string;
    houseName: string;
    landmark: string;
    latitude: number;
    longitude: number;
    pincode: string;
    state: string;
    id?: string;
}

interface IChooseAddressProps {
    closeAddressModal: React.Dispatch<React.SetStateAction<boolean>>;
    setFinalAddress: (
        houseName: string,
        landmark: string,
        city: string,
        state: string,
        pincode: string,
        lat: number,
        long: number
    ) => void;
}

const ChooseAddress: React.FC<IChooseAddressProps> = ({ closeAddressModal, setFinalAddress }) => {
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
    const [addressType, setType] = useState<string>("");
    const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);

    const user = useSelector((state: RootState) => state.user);

    // Fetch addresses for the user
    useEffect(() => {
        getAddressesApi(user.id).then((res) => {
            if (res.success) {
                const formattedAddresses = res.data.map((address: any) => ({
                    id: address._id,
                    city: address.city,
                    houseName: address.house_name,
                    landmark: address.landmark,
                    latitude: address.latittude,
                    longitude: address.longittude,
                    pincode: address.pincode,
                    state: address.state,
                }));

                setAddresses(formattedAddresses);
            } else {
                toast.error(res.message);
            }
        });
    }, []);

    // Handle address selection
    const handleSelectAddress = (address: IAddress) => {
        setSelectedAddress(address);
    };

    // Handle adding new address
    const handleAddNewAddress = () => {
        setShowAddAddress(true);
        setType(addresses.length >= 3 ? "Temporary" : "Permanent");
    };

    // Handle confirm selection
    const handleConfirmSelection = () => {
        if (!selectedAddress) {
            toast.error("Please select an address");
            return;
        }
        console.log("selected address", selectedAddress);
        // Save the selected address in the parent component
        setFinalAddress(
            selectedAddress.houseName,
            selectedAddress.landmark,
            selectedAddress.city,
            selectedAddress.state,
            selectedAddress.pincode,
            selectedAddress.latitude,
            selectedAddress.longitude
        );
        closeAddressModal(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 overflow-y-auto">
            <div className="bg-white pt-6 pb-8 px-6 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={() => closeAddressModal(false)}
                    className="absolute top-4 right-4 text-gray-50 hover:text-gray-200"
                >
                    <FaWindowClose className="text-xl" />
                </button>

                <h3 className="text-xl font-semibold text-gray-800 mb-9">Choose Address</h3>

                {/* Address List */}
                <div className="space-y-4 mb-6">
                    {addresses.length > 0 ? (
                        addresses.map((address) => (
                            <label
                                key={address.id}
                                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
                            >
                                <input
                                    type="radio"
                                    name="address"
                                    value={address.id}
                                    checked={selectedAddress?.id === address.id}
                                    onChange={() => handleSelectAddress(address)}
                                    className="mr-3"
                                />
                                <div>
                                    {`${address.houseName}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}`}
                                </div>
                            </label>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No saved addresses found.</p>
                    )}
                </div>

                {/* Add New Address Button */}
                <button
                    onClick={handleAddNewAddress}
                    className="w-full text-blue-600 font-medium py-2 hover:underline"
                >
                    + Add New Address
                </button>

                {/* Confirm & Cancel Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={() => closeAddressModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmSelection}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>

            {/* Add New Address Modal */}
            {showAddAddress && (
                <AddNewAddress
                    closeModal={setShowAddAddress}
                    type={addressType}
                    updateAddresses={setAddresses}
                />
            )}
        </div>
    );
};

export default ChooseAddress;
