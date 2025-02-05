import React, { useState } from "react";
import MapModal from "./MapComponent";
import { addAddressApi } from "../../../Api/UserApis";
import { IAddress } from "../../UserComponents/Modals/UserChooseAddress";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/Store";
import { toast } from "react-toastify";

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

    //show map
    const [showMap, setShowMap] = useState<boolean>(false);

    const user = useSelector((state: RootState) => state.user);

    // Handle location selection from MapModal
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

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.id) {
            if (type === "Permanent") {
                addAddressApi(address, user?.id)
                    .then((response) => {
                        if (response.success) {
                            toast.success(response.message);
                            //refreshs address with the newly added address
                            if (refreshAddress) refreshAddress((prev) => prev + 1);
                            //updates the addresslist with newly added address
                            if (updateAddresses)
                                updateAddresses((prev) => [
                                    ...prev,
                                    {
                                        id: "",
                                        ...address,
                                    },
                                ]);
                            //delay to close the modal
                            setTimeout(() => {
                                closeModal(false);
                            }, 3000);
                        } else {
                            toast.error(response.message);
                        }
                    })
                    .catch((response) => {
                        toast.error(response?.error || "Error occured");
                    });
            } else {
                if (updateAddresses) updateAddresses((prev) => [...prev, { id: "", ...address }]);
                toast.success("Address added successfully");
                setTimeout(() => {
                    closeModal(false);
                }, 3000);
            }
        }
    };

    return (
        <>
            <div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Add New Address
                </button>
                (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => closeModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                            aria-label="Close Modal"
                        >
                            &times;
                        </button>

                        {/* Modal Header */}
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                            Add New Address
                        </h2>

                        {/* Step 1: Location Selection */}
                        <div className="mb-2">
                            <p className="text-sm text-gray-500 mt-2">
                                Please select your location on the map to autofill city, state, and
                                country.
                            </p>
                            <div className="mt-6">
                                {" "}
                                <button
                                    onClick={() => setShowMap(true)}
                                    className="bg-brandBlue text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Select Location on Map
                                </button>
                            </div>
                        </div>
                        <br />
                        <hr />
                        <br />

                        {/* Step 2: Address Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-6">
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
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter house name"
                                        required
                                    />
                                </div>
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
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nearby landmark"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        className="w-full px-4 py-2 bg-gray-100 border rounded-lg"
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
                                        className="w-full px-4 py-2 bg-gray-100 border rounded-lg"
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={address.pincode}
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-100 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-brandBlue text-white px-4 py-2 rounded-lg  focus:outline-none focus:ring-2 "
                            >
                                Save Address
                            </button>
                        </form>

                        {/* Map Modal */}
                        {showMap && (
                            <MapModal
                                onClose={setShowMap}
                                onLocationSelect={handleLocationSelect}
                            />
                        )}
                    </div>
                </div>
                )
            </div>{" "}
        </>
    );
};

export default AddAddress;
