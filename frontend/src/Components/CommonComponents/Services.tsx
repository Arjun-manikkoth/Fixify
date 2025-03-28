import React, { useEffect, useState } from "react";
import { getServices } from "../../Api/ProviderApis";

// Define the shape of a service from your API
interface Service {
    _id: string;
    name: string;
    is_active: boolean;
    description: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await getServices();
                // Assuming response.data is the array of services
                setServices(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load services. Please try again later.");
                setLoading(false);
                console.error("Error fetching services:", err);
            }
        };

        fetchServices();
    }, []);

    if (loading) {
        return (
            <div className="py-32 px-4 sm:px-12 mb-16 text-center">
                <h2 className="text-2xl sm:text-4xl font-bold mb-10 sm:mb-20">Our Services</h2>
                <p className="text-base sm:text-lg">Loading services...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-32 px-4 sm:px-12 mb-16 text-center">
                <h2 className="text-2xl sm:text-4xl font-bold mb-10 sm:mb-20">Our Services</h2>
                <p className="text-base sm:text-lg text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="py-16 sm:py-32 px-4 sm:px-12 mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-center mb-10 sm:mb-20">
                Our Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {services
                    .filter((service) => service.is_active) // Only show active services
                    .map((service) => (
                        <div key={service._id} className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                            <h3 className="text-base sm:text-xl font-semibold text-center">
                                {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
                                {service.description || "No description available."}
                            </p>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Services;
