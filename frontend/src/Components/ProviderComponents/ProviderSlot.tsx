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
        futureDate.setDate(today.getDate() + i); // Increment day by `i`
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

    // State to store slots
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
                    long: res.data.location.geo.coordinates[1],
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
    }, [selectedDate, forceFetch]);

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
        <div className="p-9 me-12 rounded-2xl shadow-lg min-h-screen">
            {/* Date Selector */}
            <div className="flex">
                <div className="w-2/3">
                    <h2 className="text-xl font-bold mb-8">Select Date</h2>
                    <div className="flex gap-3 py-5 px-1 overflow-x-auto">
                        {availableDates.map((date) => {
                            const displayDateObj = new Date(date);
                            const displayWeekday = displayDateObj.toLocaleDateString("en-US", {
                                weekday: "short",
                            });
                            const displayDay = displayDateObj.toLocaleDateString("en-US", {
                                day: "numeric",
                            });

                            return (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`py-2 px-4 rounded-lg flex flex-col items-center ${
                                        selectedDate === date
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-black"
                                    }`}
                                >
                                    <span>{displayWeekday}</span>
                                    <span>{displayDay}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Location Selector */}
                <div className="w-1/3 px-5">
                    <h2 className="text-xl font-bold mb-10">Location</h2>
                    {location.city ? (
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <strong>Selected Location:</strong>
                            <p className="mt-2 text-gray-700">
                                {location.street}, {location.city}
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500">No location selected for this date.</p>
                            <button
                                className="bg-brandBlue mt-3 text-white px-4 py-2 rounded-lg font-semibold"
                                onClick={handleOpenMap}
                            >
                                Choose now
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Slot Selection */}
            {selectedDate && (
                <div className="px-11 mt-6">
                    <h3 className="text-lg font-semibold mb-9">
                        Available Slots for {new Date(selectedDate).toDateString()}
                    </h3>
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : slots && slots.length > 0 ? (
                            slots.map((slot) => (
                                <div
                                    key={slot.time}
                                    className="flex justify-between items-center p-3 bg-white shadow-md rounded-lg"
                                >
                                    <span className="text-md text-gray-700">
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

                                    <button className={`px-4 py-2 rounded-lg`}>
                                        {slot.status}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center">Choose a location to avail slots</div>
                        )}
                    </div>
                </div>
            )}

            {map && <MapModal onClose={() => setMap(false)} onLocationSelect={onLocationSelect} />}
        </div>
    );
};

export default Slots;
