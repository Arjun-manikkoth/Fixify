import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { providerDashboardApi } from "../../Api/ProviderApis";
import { useSelector } from "react-redux";
import { FiStar } from "react-icons/fi";
import { RootState } from "../../Redux/Store";

const ProviderDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [totalRevenueEarned, setTotalRevenueEarned] = useState(0);
    const [totalBookingsCompleted, setTotalBookingsCompleted] = useState(0);
    const [technicianTotalRatings, setTechnicianTotalRatings] = useState(0);

    const provider = useSelector((state: RootState) => state.provider);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (provider.id) {
                    const response = await providerDashboardApi(provider.id);
                    if (response.data) {
                        setTotalRevenueEarned(response.data.totalEarnings);
                        setTotalBookingsCompleted(response.data.totalCompletedBookings);
                        setTechnicianTotalRatings(response.data.averageRating);
                    } else {
                        toast.error("Failed to fetch data");
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [provider.id]);

    return (
        <div className="bg-white p-9 me-12 rounded-2xl shadow-lg">
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tile for Total Revenue Earned */}
                    <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800">Total Revenue Earned</h2>
                        <p className="text-2xl font-semibold text-blue-600 mt-2">
                            Rs {totalRevenueEarned.toLocaleString()}
                        </p>
                    </div>

                    {/* Tile for Total Bookings Completed */}
                    <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800">Bookings Completed</h2>
                        <p className="text-2xl font-semibold text-green-600 mt-2">
                            {totalBookingsCompleted === 0
                                ? "No Completed bookings to display"
                                : `${totalBookingsCompleted.toFixed(1)} out of 5`}{" "}
                        </p>
                    </div>

                    {/* Tile for Technician Total Ratings */}
                    <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800">Ratings</h2>
                        <p className="text-2xl font-semibold text-yellow-600 mt-2 flex items-center">
                            {technicianTotalRatings === 0
                                ? "No Reviews"
                                : `${technicianTotalRatings.toFixed(1)} out of 5`}
                            <FiStar className="ml-1" />
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
