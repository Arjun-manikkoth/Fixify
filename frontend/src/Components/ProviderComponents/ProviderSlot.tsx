// src/components/ProviderComponents/Slots.tsx
import React, { useState, useEffect } from "react";
import MapModal from "../CommonComponents/Modals/MapComponent";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { createScheduleApi, getScheduleApi } from "../../Api/ProviderApis";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { toast } from "react-toastify";

// Function to generate the next 7 days (handles month transitions)
const generateDatesForNext7Days = (): string[] => {
    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + i);
        dates.push(futureDate.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }

    return dates;
};

interface ILocation {
    lat: number;
    lng: number;
    city: string;
    state: string;
    pincode: string;
    street: string | undefined;
}

interface ISlots {
    time: string;
    status: string;
}

const Slots: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [forceFetch, setForceFetch] = useState<number>(0);
    const [map, setMap] = useState<boolean>(false);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const provider = useSelector((state: RootState) => state.provider);

    const [slots, setSlots] = useState<ISlots[] | null>(null);
    const [location, setLocation] = useState<ILocation>({
        lat: 0,
        lng: 0,
        city: "",
        state: "",
        pincode: "",
        street: "",
    });

    useEffect(() => {
        const dates = generateDatesForNext7Days();
        setAvailableDates(dates);
        setSelectedDate(dates[0]); // Preselect the first date
    }, []);

    useEffect(() => {
        if (!selectedDate) return;

        setLoading(true);
        getScheduleApi(provider.id, selectedDate).then((res) => {
            if (res.data) {
                setSlots(res.data.slots);
                setLocation({
                    lat: res.data.location.geo.coordinates[0],
                    lng: res.data.location.geo.coordinates[1], // Fixed typo from 'long' to 'lng'
                    ...res.data.location.address,
                });
            } else {
                setSlots(null);
                setLocation({
                    lat: 0,
                    lng: 0,
                    city: "",
                    state: "",
                    pincode: "",
                    street: "",
                });
            }
            setLoading(false);
        });
    }, [selectedDate, forceFetch, provider.id]);

    const onLocationSelect = (
        lat: number,
        lng: number,
        city: string,
        state: string,
        pincode: string,
        street: string | undefined
    ) => {
        setMap(false);
        setLocation({ lat, lng, city, state, pincode, street });
        setLoading(true);
        createScheduleApi(provider.id, selectedDate, {
            latitude: lat,
            longitude: lng,
            city,
            state,
            pincode,
            street,
        }).then((response) => {
            if (response.success) {
                setForceFetch((prev) => prev + 1);
            } else {
                toast.error(response.message);
            }
            setLoading(false);
        });
    };

    const handleOpenMap = () => {
        setMap(true);
    };

    return (
        <div className="pt-16 md:pl-72 bg-white min-h-screen flex-1">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                    {/* Date and Location Selector */}
                    <div className="flex flex-col sm:flex-row sm:space-x-6 mb-6 sm:mb-8">
                        {/* Date Selector */}
                        <div className="w-full sm:w-2/3">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                Select Date
                            </h2>
                            <div className="flex gap-3 py-2 overflow-x-auto">
                                {availableDates.map((date) => {
                                    const displayDateObj = new Date(date);
                                    const displayWeekday = displayDateObj.toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "short",
                                        }
                                    );
                                    const displayDay = displayDateObj.toLocaleDateString("en-US", {
                                        day: "numeric",
                                    });

                                    return (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`py-2 px-3 sm:px-4 rounded-lg flex flex-col items-center min-w-[60px] ${
                                                selectedDate === date
                                                    ? "bg-brandBlue text-white"
                                                    : "bg-gray-200 text-black hover:bg-gray-300"
                                            } transition`}
                                        >
                                            <span className="text-sm sm:text-base">
                                                {displayWeekday}
                                            </span>
                                            <span className="text-sm sm:text-base">
                                                {displayDay}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location Selector */}
                        <div className="w-full sm:w-1/3 mt-6 sm:mt-0">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                Location
                            </h2>
                            {location.city ? (
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <strong className="text-sm sm:text-base text-gray-700">
                                        Selected Location:
                                    </strong>
                                    <p className="mt-2 text-gray-700 text-sm sm:text-base">
                                        {location.street ? `${location.street}, ` : ""}
                                        {location.city}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-500 text-sm sm:text-base">
                                        No location selected for this date.
                                    </p>
                                    <button
                                        className="mt-3 px-4 py-2 bg-brandBlue text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-600 transition"
                                        onClick={handleOpenMap}
                                    >
                                        Choose Now
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Slot Selection */}
                    {selectedDate && (
                        <div className="mt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                Available Slots for {new Date(selectedDate).toDateString()}
                            </h3>
                            <div className="flex flex-col gap-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <LoadingSpinner />
                                    </div>
                                ) : slots && slots.length > 0 ? (
                                    slots.map((slot) => (
                                        <div
                                            key={slot.time}
                                            className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white shadow-md rounded-lg"
                                        >
                                            <span className="text-sm sm:text-md text-gray-700 mb-2 sm:mb-0">
                                                Time:{" "}
                                                {`${new Date(slot.time).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })} - ${new Date(
                                                    new Date(slot.time).getTime() + 60 * 60 * 1000
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}`}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                                    slot.status === "available"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {slot.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-600 text-sm sm:text-base">
                                        Choose a location to avail slots
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {map && <MapModal onClose={() => setMap(false)} onLocationSelect={onLocationSelect} />}
        </div>
    );
};

export default Slots;
