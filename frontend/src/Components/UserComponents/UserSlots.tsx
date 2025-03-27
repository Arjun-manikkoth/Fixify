// src/components/UserComponents/ProviderFinder.tsx
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
    averageRating: number;
    slots: ISlots[];
}
interface ISlots {
    time: string;
    status: string;
    _id: string;
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
    date: string;
    technician_id: string;
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
        date: "",
        technician_id: "",
    });
    const [chosenAddress, setChosenAddress] = useState<IAddress | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [slotData, setSlotData] = useState<ISlotData[] | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        getServices()
            .then((response) => {
                if (response.success) setServices(response.data);
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
        setFormData((prev) => ({
            ...prev,
            houseName,
            landmark,
            city,
            state,
            pincode,
            latitude,
            longitude,
        }));
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
        if (formData.date && formData.time) {
            if (new Date(formData.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                toast.error("Choose a valid date");
                return;
            }

            const selectedTime = formData.time;
            const selectedDate = new Date(formData.date);
            const [time, period] = selectedTime.split(" ");
            const [hours, minutes] = time.split(":");
            let hours24 = parseInt(hours, 10);
            if (period === "PM" && hours24 !== 12) hours24 += 12;
            else if (period === "AM" && hours24 === 12) hours24 = 0;
            selectedDate.setHours(hours24, parseInt(minutes, 10), 0, 0);

            const currentDateTime = new Date();
            if (selectedDate < currentDateTime) {
                toast.error("Invalid date and time: The selected date and time is in the past.");
                return;
            }
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

    const handleBookingRequest = (
        id: string,
        time: string,
        date: string,
        technician_id: string
    ) => {
        setRequestModal(true);
        setSelectedSlot({ slot_id: id, time, date, technician_id });
    };

    return (
        <div className="pt-16 md:pl-72 min-h-screen flex-1">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="p-4 sm:p-6 lg:p-9  rounded-2xl shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-6 mb-4 sm:mb-6">
                            <select
                                id="service_id"
                                value={formData.service_id}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-md text-sm sm:text-base"
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
                                className="border p-2 rounded w-full text-sm sm:text-base"
                                onChange={handleChange}
                                value={formData.date}
                            />
                            <select
                                id="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="border p-2 rounded w-full text-sm sm:text-base"
                            >
                                <option value="" disabled>
                                    Select Time
                                </option>
                                {Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 9;
                                    if (hour === 13) return null;
                                    const period = hour >= 12 ? "PM" : "AM";
                                    const formattedHour = ((hour - 1) % 12) + 1;
                                    return (
                                        <option key={hour} value={`${formattedHour}:00 ${period}`}>
                                            {formattedHour}:00 {period}
                                        </option>
                                    );
                                })}
                            </select>
                            <button
                                type="button"
                                className="bg-gray-100 border text-gray-700 py-2 rounded-md text-sm sm:text-base truncate"
                                onClick={() => setChooseAddress(true)}
                            >
                                {chosenAddress
                                    ? `${
                                          chosenAddress.houseName ||
                                          chosenAddress.landmark ||
                                          "Address Selected"
                                      }`
                                    : "Choose an address"}
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm sm:text-base"
                            >
                                {loading ? "Fetching Slots..." : "Find Slots 🔍"}
                            </button>
                        </div>
                    </form>
                    <hr className="my-4 sm:my-6" />

                    {/* Slot Data Display */}
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        {!slotData ? (
                            <p className="text-center text-gray-600 text-sm sm:text-base">
                                Choose your service for viewing slots
                            </p>
                        ) : slotData?.length > 0 ? (
                            slotData.map((slot) => (
                                <div
                                    key={slot._id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border px-4 py-4 sm:px-6 sm:py-4 rounded-xl shadow-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-xl transition-all duration-300 ease-in-out"
                                >
                                    {/* Technician Info */}
                                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-1/3 mb-4 sm:mb-0">
                                        {slot.technician?.url ? (
                                            <img
                                                src={slot.technician?.url || "/default-profile.jpg"}
                                                alt="Technician"
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                                            />
                                        ) : (
                                            <img
                                                src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                                                alt="Technician"
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                                            />
                                        )}
                                        <div className="flex flex-col">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                                {slot.technician?.name}
                                            </h3>
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                {slot.service?.name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                                                <FaClock className="text-blue-500" />
                                                {new Intl.DateTimeFormat("en-US", {
                                                    timeStyle: "short",
                                                }).format(new Date(slot.slots[0].time))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating and Distance */}
                                    <div className="flex flex-col sm:flex-row w-full sm:w-1/3 gap-3 sm:gap-6 justify-between sm:justify-center mb-4 sm:mb-0">
                                        <div className="flex items-center text-blue-500 gap-1 sm:gap-2 text-xs sm:text-sm">
                                            {slot.averageRating} <FaStar /> <span>of 5</span>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 text-gray-500 text-xs sm:text-sm">
                                            <FaLocationArrow className="text-blue-500" />
                                            {slot.distance?.toFixed(2)} km away
                                        </div>
                                    </div>

                                    {/* Request Button */}
                                    <div className="w-full sm:w-auto lg:w-1/4 text-center sm:text-left mt-2 sm:mt-0">
                                        <button
                                            className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                                            onClick={() =>
                                                handleBookingRequest(
                                                    slot._id,
                                                    formData.time,
                                                    formData.date,
                                                    slot.technician._id
                                                )
                                            }
                                        >
                                            Request Booking
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : loading ? (
                            <div className="flex justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 text-sm sm:text-base">
                                No slots found matching this selection
                            </p>
                        )}
                    </div>
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
        </div>
    );
};

export default ProviderFinder;
