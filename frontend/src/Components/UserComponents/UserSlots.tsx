import { useState, useEffect } from "react";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import ChooseAddress, { IAddress } from "./Modals/UserChooseAddress";
import BookingRequest from "./Modals/UserBookingRequest";
import { toast } from "react-toastify";
import { getServices } from "../../Api/ProviderApis";
import { checkAvailabilityApi } from "../../Api/UserApis";
import { FaStar, FaLocationArrow, FaClock } from "react-icons/fa";

interface IServiceData {
    _id: string;
    name: string;
    description: string;
    is_active: boolean;
}

interface ISlotData {
    _id: string;
    time: string;
    status: string;
    technician: {
        _id: string;
        name: string;
        url: string;
    };
    service: {
        _id: string;
        name: string;
    };
    distance: number;
}

export interface IQueryData {
    service_id: string;
    date: string;
    time: string;
}
interface IFormData extends IQueryData, IAddress {}

export interface ISelectedSlot {
    slot_id: string;
    time: string;
}

const ProviderFinder: React.FC = () => {
    const [formData, setFormData] = useState<IFormData>({
        service_id: "",
        date: "",
        time: "",
        city: "",
        houseName: "",
        landmark: "",
        latitude: 0,
        longitude: 0,
        pincode: "",
        state: "",
    });

    const [services, setServices] = useState<IServiceData[]>([]);
    const [showRequestModal, setRequestModal] = useState<boolean>(false);
    const [chooseAddress, setChooseAddress] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<ISelectedSlot>({
        slot_id: "",
        time: "",
    });
    const [chosenAddress, setChosenAddress] = useState<IAddress | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [slotData, setSlotData] = useState<ISlotData[] | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        getServices()
            .then((data) => {
                if (data.success) setServices(data.services);
            })
            .catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectedAddress = (
        houseName: string,
        landmark: string,
        city: string,
        state: string,
        pincode: string,
        latitude: number,
        longitude: number
    ) => {
        setChosenAddress({ houseName, landmark, city, state, pincode, latitude, longitude });
        setFormData((prev) => {
            return { ...prev, houseName, landmark, city, state, pincode, latitude, longitude };
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errors: string[] = [];

        if (!formData.service_id) errors.push("Choose your service needed");
        if (!formData.latitude) errors.push("Please choose your location");
        if (!formData.date.trim()) errors.push("Select the required date");
        if (!formData.time.trim()) errors.push("Choose your available time");

        if (errors.length > 0) {
            errors.forEach((err, index) => setTimeout(() => toast.error(err), index * 100));
            return;
        }

        if (new Date(formData.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
            toast.error("Choose a valid date");
            return;
        }

        if (new Date().getTime() > new Date(formData.time).getTime()) {
            toast.error("Choose a valid time");
            return;
        }

        setLoading(true);
        try {
            const res = await checkAvailabilityApi({
                service_id: formData.service_id,
                latitude: formData.latitude,
                longitude: formData.longitude,
                date: formData.date,
                time: formData.time,
            });
            setSlotData(res.data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch slots");
        } finally {
            setLoading(false);
        }
    };

    const handleBookingRequest = (id: string, time: string) => {
        setRequestModal(true);
        setSelectedSlot({ slot_id: id, time: time });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-5xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <select
                        id="service_id"
                        value={formData.service_id}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-md"
                    >
                        <option value="" disabled>
                            Select Your Service
                        </option>
                        {services.map((service) => (
                            <option key={service._id} value={service._id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        id="date"
                        className="border p-2 rounded w-full"
                        onChange={handleChange}
                        value={formData.date}
                    />
                    <select
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    >
                        <option value="" disabled>
                            Select Time
                        </option>
                        {Array.from({ length: 12 }, (_, i) => {
                            const today = new Date();
                            const hour = i + 9;
                            const period = hour >= 12 ? "PM" : "AM";
                            const formattedHour = ((hour - 1) % 12) + 1;

                            const timeISO = new Date(today.setHours(hour, 0, 0, 0)).toISOString();
                            return (
                                <option key={hour} value={timeISO}>
                                    {formattedHour}:00 {period}
                                </option>
                            );
                        })}
                    </select>
                    <button
                        type="button"
                        className="bg-gray-100 border text-gray-700 py-2 rounded-md"
                        onClick={() => setChooseAddress(true)}
                    >
                        {chosenAddress
                            ? `${chosenAddress.houseName ? chosenAddress.landmark : ""}`
                            : "Choose an address"}
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700 transition duration-200">
                        {loading ? "Fetching Slots..." : "Find Slots 🔍"}
                    </button>
                </div>
            </form>
            <br />
            <hr />
            <br />

            {/* Slot Data Display */}
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                {!slotData ? (
                    <p className="text-center">Choose your service for viewing slots</p>
                ) : slotData?.length > 0 ? (
                    slotData.map((slot) => (
                        <div
                            key={slot._id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between border px-6 py-4 rounded-xl shadow-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-2xl transition-all duration-300 ease-in-out "
                        >
                            {/* Technician Info */}
                            <div className="flex items-center gap-6 w-full sm:w-1/3 mb-4 sm:mb-0 mx-2">
                                {slot.technician?.url ? (
                                    <img
                                        src={slot.technician?.url || "/default-profile.jpg"}
                                        alt="Technician"
                                        className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                                    />
                                ) : (
                                    <img
                                        src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8" // Placeholder image URL
                                        alt="Technician"
                                        className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                                    />
                                )}
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {slot.technician?.name}
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        {slot.service?.name}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ms-3 text-sm text-gray-600">
                                    <FaClock className="text-brandBlue" />

                                    {new Intl.DateTimeFormat("en-US", {
                                        timeStyle: "short",
                                    }).format(new Date(formData.time))}
                                </div>
                            </div>

                            {/* Rating and Distance */}
                            <div className="flex w-full sm:w-1/3 gap-16 justify-between sm:justify-center lg:justify-start mb-4 sm:mb-0">
                                {/* Ratings */}
                                <div className="flex items-center text-brandBlue gap-2">
                                    4.5 <FaStar className="text-brandBlue" />
                                    <span>of 5</span>
                                </div>

                                {/* Distance */}
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FaLocationArrow className="text-brandBlue" />
                                    {slot.distance?.toFixed(2)} km away
                                </div>
                            </div>

                            {/* Request Button */}
                            <div className="w-full sm:w-auto lg:w-1/4 text-center sm:text-left mt-4 ps-4 sm:mt-0">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 ease-in-out"
                                    onClick={() => handleBookingRequest(slot._id, formData.time)}
                                >
                                    Request Booking
                                </button>
                            </div>
                        </div>
                    ))
                ) : loading ? (
                    <LoadingSpinner />
                ) : (
                    <p className="text-center">No slots found matching this selection</p>
                )}
            </div>

            {showRequestModal && (
                <BookingRequest
                    closeModal={setRequestModal}
                    address={chosenAddress}
                    slotDetails={selectedSlot}
                />
            )}

            {chooseAddress && (
                <ChooseAddress
                    closeAddressModal={setChooseAddress}
                    setFinalAddress={handleSelectedAddress}
                />
            )}
        </div>
    );
};

export default ProviderFinder;
