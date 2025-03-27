// src/components/CommonComponents/Modals/UpdateAddressModal.tsx
import React, { useEffect, useState } from "react";
import MapModal from "./MapComponent";
import { getAddressApi, updateAddressApi } from "../../../Api/UserApis";
import { toast } from "react-toastify";
import LoadingSpinner from "../LoadingSpinner";

interface IUpdateAddressProps {
    closeModal: React.Dispatch<React.SetStateAction<boolean>>;
    refreshAddress: React.Dispatch<React.SetStateAction<number>>;
    id: string;
}

const UpdateAddress: React.FC<IUpdateAddressProps> = ({ closeModal, id, refreshAddress }) => {
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
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        getAddressApi(id)
            .then((response) => {
                if (response.success) {
                    setAddress({
                        houseName: response.data.house_name,
                        landmark: response.data.landmark,
                        latitude: response.data.latitude, // Fixed typo
                        longitude: response.data.longitude, // Fixed typo
                        city: response.data.city,
                        state: response.data.state,
                        pincode: response.data.pincode,
                    });
                } else {
                    toast.error(response.message || "Failed to fetch address.");
                }
            })
            .catch((error) => {
                toast.error(error?.message || "Error fetching address.");
            })
            .finally(() => setLoading(false));
    }, [id]);

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
        setLoading(true);
        try {
            const response = await updateAddressApi(id, address);
            if (response.success) {
                toast.success(response.message);
                refreshAddress((prev) => prev + 1);
                setTimeout(() => closeModal(false), 2000);
            } else {
                toast.error(response.message || "Failed to update address.");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Error occurred");
        } finally {
            setLoading(false);
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
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl sm:text-2xl"
                        aria-label="Close Modal"
                    >
                        ×
                    </button>

                    {/* Modal Header */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                        Edit Address
                    </h2>

                    {/* Step 1: Location Selection */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-4">
                            Verify or update your location on the map to adjust city, state, and
                            pincode.
                        </p>
                        <button
                            onClick={() => setShowMap(true)}
                            className="bg-brandBlue text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                                    name="pincode" // Fixed typo
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
                            Save Changes
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

export default UpdateAddress;
