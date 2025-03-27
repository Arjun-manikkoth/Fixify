// src/components/CommonComponents/Modals/AddAddressModal.tsx
import React, { useState } from "react";
import MapModal from "./MapComponent";
import { addAddressApi } from "../../../Api/UserApis";
import { IAddress } from "../../UserComponents/Modals/UserChooseAddress";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { toast } from "react-toastify";
import LoadingSpinner from "../LoadingSpinner";

interface IAddAddressProps {
    closeModal: React.Dispatch<React.SetStateAction<boolean>>;
    refreshAddress?: React.Dispatch<React.SetStateAction<number>>;
    updateAddresses?: React.Dispatch<React.SetStateAction<IAddress[]>>;
    type: string;
}

const AddAddress: React.FC<IAddAddressProps> = ({
    closeModal,
    refreshAddress,
    type,
    updateAddresses,
}) => {
    const [address, setAddress] = useState({
        houseName: "",
        landmark: "",
        latitude: 0,
        longitude: 0,
        city: "",
        state: "",
        pincode: "",
    });

    const [showMap, setShowMap] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const user = useSelector((state: RootState) => state.user);

    const handleLocationSelect = (
        lat: number,
        lng: number,
        city: string,
        state: string,
        pincode: string
    ) => {
        setAddress((prevAddress) => ({
            ...prevAddress,
            latitude: lat,
            longitude: lng,
            city,
            state,
            pincode,
        }));
        setShowMap(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.id) {
            if (type === "Permanent") {
                setLoading(true);
                addAddressApi(address, user?.id)
                    .then((response) => {
                        if (response.success) {
                            toast.success(response.message);
                            if (refreshAddress) refreshAddress((prev) => prev + 1);
                            if (updateAddresses)
                                updateAddresses((prev) => [...prev, { id: "", ...address }]);
                            setTimeout(() => {
                                closeModal(false);
                                setLoading(false);
                            }, 2000);
                        } else {
                            toast.error(response.message);
                        }
                    })
                    .catch((response) => {
                        toast.error(response?.error || "Error occurred");
                    });
            } else {
                setLoading(true);
                if (updateAddresses) updateAddresses((prev) => [...prev, { id: "", ...address }]);
                toast.success("Address added successfully");
                setTimeout(() => {
                    closeModal(false);
                    setLoading(false);
                }, 2000);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div
                    className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => closeModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                        aria-label="Close Modal"
                    >
                        ×
                    </button>

                    {/* Modal Header */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                        Add New Address
                    </h2>

                    {/* Step 1: Location Selection */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-4">
                            Please select your location on the map to autofill city, state, and
                            pincode.
                        </p>
                        <button
                            onClick={() => setShowMap(true)}
                            className="bg-brandBlue text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Select Location on Map
                        </button>
                    </div>
                    <hr className="my-4" />

                    {/* Step 2: Address Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {/* House Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    House Name
                                </label>
                                <input
                                    type="text"
                                    name="houseName"
                                    value={address.houseName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    placeholder="Enter house name"
                                    required
                                />
                            </div>
                            {/* Landmark */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Landmark
                                </label>
                                <input
                                    type="text"
                                    name="landmark"
                                    value={address.landmark}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    placeholder="Nearby landmark"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-sm sm:text-base"
                                />
                            </div>
                            {/* State */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={address.state}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-sm sm:text-base"
                                />
                            </div>
                            {/* Pincode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={address.pincode}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-brandBlue text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                            Save Address
                        </button>
                    </form>

                    {/* Map Modal */}
                    {showMap && (
                        <MapModal onClose={setShowMap} onLocationSelect={handleLocationSelect} />
                    )}
                </div>
            )}
        </div>
    );
};

export default AddAddress;
