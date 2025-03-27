// src/components/UserComponents/AddressPage.tsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AddAddressModal from "../CommonComponents/Modals/AddAddressModal";
import UpdateAddressModal from "../CommonComponents/Modals/UpdateAddressModal";
import { getAddressesApi, deleteAddressApi } from "../../Api/UserApis";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";

interface Address {
    _id: string;
    house_name: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
}

const AddressPage: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
    const [showEditAddress, setShowEditAddress] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<number>(0);
    const [selectedId, setSelectedId] = useState<string>("");

    const user = useSelector((state: RootState) => state.user) || "";

    const handleDeleteAddress = async (id: string) => {
        try {
            const response = await deleteAddressApi(id);
            if (response.success) {
                setAddresses((prev) => prev.filter((address) => address._id !== id));
                toast.success("Address deleted successfully!");
            } else {
                toast.error(response.message || "Failed to delete the address.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error deleting the address.");
        }
    };

    useEffect(() => {
        setLoading(true);
        getAddressesApi(user?.id)
            .then((response) => {
                if (response.success) {
                    setAddresses(response.data);
                    if (response.data.length === 0) {
                        toast.info("No addresses found. Please add one.");
                    }
                } else {
                    toast.error(response.message || "Failed to fetch addresses.");
                }
            })
            .catch((error: any) => {
                console.log("Error fetching addresses:", error);
                toast.error(error.response?.data?.message || "Error fetching the address.");
            })
            .finally(() => setLoading(false));
    }, [refresh, user?.id]);

    return (
        <div className="pt-14 md:pl-72 min-h-screen flex-1">
            <div className="container mx-auto px-2śś py-6 sm:px-4 lg:px-6">
                <div className="p-4 sm:p-6 lg:p-9 bg-white rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Existing Address List */}
                        {loading ? (
                            <p className="text-center text-gray-600 text-sm sm:text-base">
                                Loading addresses...
                            </p>
                        ) : addresses.length > 0 ? (
                            addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className="bg-white shadow-lg p-4 sm:p-6 rounded-xl flex flex-col gap-3 relative"
                                >
                                    <h3 className="text-base sm:text-lg font-semibold text-black mb-2">
                                        Address Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <input
                                            type="text"
                                            className="w-full py-1 border-b-2 border-brandBlue focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                            value={address.house_name}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                            value={address.landmark}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                            value={address.city}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                            value={address.state}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                            value={address.pincode}
                                            readOnly
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2 sm:gap-3">
                                        <button
                                            onClick={() => {
                                                setShowEditAddress(true);
                                                setSelectedId(address._id);
                                            }}
                                            className="p-1 sm:p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                                        >
                                            <FaEdit className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address._id)}
                                            className="p-1 sm:p-2 rounded-full bg-red-100 hover:bg-red-200"
                                        >
                                            <FaTrashAlt className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-center mt-6 sm:mt-11 text-sm sm:text-base">
                                No addresses available. Please add a new address.
                            </p>
                        )}

                        {/* Add New Address Box */}
                        <div className="bg-white shadow-sm p-4 sm:p-6 rounded-xl flex flex-col justify-center">
                            <h2 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-4">
                                Add New Address
                            </h2>
                            <p className="text-sm sm:text-md text-gray-800 mb-4 sm:mb-8 px-2">
                                You can add up to 3 addresses.
                            </p>
                            <button
                                onClick={() => setShowAddAddress(true)}
                                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-3xl text-sm sm:text-base ${
                                    addresses?.length >= 3
                                        ? "bg-brandBlue text-white hover:bg-blue-400 cursor-not-allowed"
                                        : "bg-brandBlue text-white hover:bg-blue-700"
                                }`}
                                disabled={addresses.length >= 3}
                            >
                                Add New
                            </button>
                        </div>
                    </div>
                </div>

                {showAddAddress && (
                    <AddAddressModal
                        closeModal={setShowAddAddress}
                        refreshAddress={setRefresh}
                        type="Permanent"
                    />
                )}
                {showEditAddress && (
                    <UpdateAddressModal
                        closeModal={setShowEditAddress}
                        id={selectedId}
                        refreshAddress={setRefresh}
                    />
                )}
            </div>
        </div>
    );
};

export default AddressPage;
