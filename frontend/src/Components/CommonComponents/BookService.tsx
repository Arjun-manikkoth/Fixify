import React, { useState } from "react";
import { useEffect } from "react";
import { getServices } from "../../Api/ProviderApis";
import MapModal from "./Modals/MapComponent";
import { toast } from "react-toastify";

interface IServiceData {
    _id: string;
    name: string;
    description: string;
    is_active: boolean;
}

interface ILocation {
    latittude: number;
    longittude: number;
    city: string;
    state: string;
    street: string | undefined;
    pincode: string;
}

interface IFormData {
    service_id: string;
    location: ILocation | null;
    date: string;
    time: string;
}

const BookService: React.FC = () => {
    // State to store form data
    const [formData, setFormData] = useState<IFormData>({
        service_id: "",
        location: null,
        date: "",
        time: "",
    });

    //state to store all services
    const [services, setServices] = useState<IServiceData[]>([]);

    //show map
    const [showMap, setShowMap] = useState<boolean>(false);

    useEffect(() => {
        getServices()
            .then((data) => {
                if (data.success) setServices(data.services);
            })
            .catch(() => {});
    }, []);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    console.log(formData);

    // Handle form submission
    const handleSubmit = () => {
        const { service_id, location, date, time } = formData;

        if (!service_id || !location || !date || !time) {
            toast.error("Please fill in all fields before proceeding!");
            return;
        }

        toast.success("Fetching available slots...");
        // Here, you can add logic to fetch slot availability
    };

    // Handle location selection from MapModal
    const handleLocationSelect = (
        lat: number,
        lng: number,
        city: string,
        state: string,
        pincode: string,
        street?: string | undefined
    ) => {
        console.log(lat, lng, city, state, pincode, street);

        setFormData({
            ...formData,
            location: {
                latittude: lat,
                longittude: lng,
                city: city,
                state: state,
                street: street,
                pincode: pincode,
            },
        });

        setShowMap(false);
    };
    return (
        <div className="relative">
            {/* Background Image */}
            <img
                src="/Booking.jpg"
                alt="Booking Background"
                className="w-full h-[40rem] object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center w-full px-4">
                {/* Heading Section */}
                <div className="text-center text-white mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold mb-2">
                        Emergency Repair Service
                    </h2>
                    <h3 className="text-lg md:text-lg font-medium mb-6 pt-3">
                        24 hrs for 7 days service
                    </h3>
                </div>

                {/* Form Section */}
                <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8 w-[90%] md:w-[50%]">
                    <form className="space-y-6">
                        {/* Service and Location Selection */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="service"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Select Service
                                </label>
                                <select
                                    id="service_id"
                                    value={formData.service_id}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brandBlue"
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
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="location"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Select Location
                                </label>
                                <button
                                    type="button"
                                    className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 rounded-md flex items-center justify-center hover:bg-gray-200 transition duration-200"
                                    onClick={() => setShowMap(true)}
                                >
                                    {formData.location
                                        ? `${
                                              formData.location.street
                                                  ? formData.location.street + ", "
                                                  : ""
                                          }${formData.location.city}, ${formData.location.state}`
                                        : "Choose Location on Map"}
                                </button>
                            </div>
                        </div>

                        {/* Date and Time Inputs */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brandBlue"
                                />
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="time"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Select Time
                                </label>
                                <select
                                    id="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brandBlue"
                                >
                                    <option value="" disabled>
                                        Select Time
                                    </option>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const hour = i + 9; // 9 AM to 8 PM
                                        const period = hour >= 12 ? "PM" : "AM";
                                        const formattedHour = ((hour - 1) % 12) + 1; // Convert to 12-hour format
                                        return (
                                            <option
                                                key={hour}
                                                value={`${formattedHour}:00 ${period}`}
                                            >
                                                {formattedHour}:00 {period}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full bg-brandBlue text-white py-2 rounded-md font-medium hover:bg-blue-600 transition duration-200"
                        >
                            Show Availability
                        </button>
                    </form>
                </div>
            </div>
            {/* Map Modal */}
            {showMap && <MapModal onClose={setShowMap} onLocationSelect={handleLocationSelect} />}
        </div>
    );
};

export default BookService;
