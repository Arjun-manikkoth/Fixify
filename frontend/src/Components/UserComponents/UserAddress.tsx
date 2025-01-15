import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import AddAddressModal from "../CommonComponents/Modals/AddAddressModal";
import UpdateAddressModal from "../CommonComponents/Modals/UpdateAddressModal";
import { getAddressesApi } from "../../Api/UserApis";
import { deleteAddressApi } from "../../Api/UserApis";
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

    const user = useSelector((state: RootState) => state.user) || "";

    //state to store the edit address id
    const [selectedId, setSelectedId] = useState<string>("");

    // Delete an address
    const handleDeleteAddress = async (id: string) => {
        try {
            deleteAddressApi(id).then((response) => {
                if (response.success) {
                    setAddresses((prev) => prev.filter((address) => address._id !== id));

                    toast.success("Address deleted successfully!");
                } else {
                    toast.error(response.message || "Failed to delete the address.");
                }
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error deleting the address.");
        }
    };

    useEffect(() => {
        getAddressesApi(user?.id)
            .then((response) => {
                if (response.success) {
                    setAddresses(response.data);
                    setLoading(false);

                    if (response.data.length === 0) {
                        toast.info("No addresses found. Please add one.");
                    }
                } else {
                    toast.error(response.message || "Failed to fetch addresses.");
                }
            })
            .catch((error: any) => {
                console.log("there is some error");
                toast.error(error.response?.data?.message || "Error fetching the address.");
            });
    }, []);

    return (
        <>
            <div className="p-6 lg:p-9 bg-customBlue me-12 rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {/* Existing Address List */}
                    {loading ? (
                        <p>Loading addresses...</p>
                    ) : addresses.length > 0 ? (
                        addresses.map((address) => (
                            <div
                                key={address._id}
                                className="bg-white shadow p-6 rounded-xl flex flex-col gap-3 relative"
                            >
                                <h3 className="text-lg font-semibold text-black mb-2">
                                    Address Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                        defaultValue={address.house_name}
                                        readOnly
                                    />
                                    <input
                                        type="text"
                                        className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                        defaultValue={address.landmark}
                                        readOnly
                                    />
                                    <input
                                        type="text"
                                        className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                        defaultValue={address.city}
                                        readOnly
                                    />
                                    <input
                                        type="text"
                                        className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                        defaultValue={address.state}
                                        readOnly
                                    />
                                    <input
                                        type="text"
                                        className="w-full py-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                                        defaultValue={address.pincode}
                                        readOnly
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setShowEditAddress(true);
                                            setSelectedId(address._id);
                                        }}
                                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                                    >
                                        <FaEdit className="h-5 w-5 text-blue-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(address._id)}
                                        className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                                    >
                                        <FaTrashAlt className="h-5 w-5 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 text-center mt-11">
                            No addresses available. Please add a new address.
                        </p>
                    )}

                    {/* Add New Address Box */}
                    <div className="bg-white shadow p-6 rounded-xl flex flex-col justify-center">
                        <h2 className="text-lg font-semibold text-black mb-4">Add New Address</h2>
                        <p className="text-md text-gray-800 mb-8 px-2">
                            You can add up to 3 addresses. Further additions will replace the oldest
                            addresses.
                        </p>
                        <button
                            onClick={() => setShowAddAddress(true)}
                            className="px-5 py-2.5 bg-brandBlue text-white rounded-3xl hover:bg-blue-700"
                        >
                            Add New
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" />

            {showAddAddress && <AddAddressModal closeModal={setShowAddAddress} />}
            {showEditAddress && (
                <UpdateAddressModal closeModal={setShowEditAddress} id={selectedId} />
            )}
        </>
    );
};

export default AddressPage;
