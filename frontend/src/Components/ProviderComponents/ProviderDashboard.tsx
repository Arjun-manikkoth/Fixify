// src/components/ProviderComponents/ProviderDashboard.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { providerDashboardApi } from "../../Api/ProviderApis";
import { useSelector } from "react-redux";
import { FiStar } from "react-icons/fi";
import { RootState } from "../../Redux/Store";
import {
    LineChart,
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ProviderDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalEarnings: 0,
        totalCompletedBookings: 0,
        averageRating: 0,
        monthlyRevenueData: [] as { month: number; monthlyRevenue: number }[],
        dailyWorkingHoursData: [] as { day: number; dailyWorkingHours: number }[],
    });

    const [revenuePeriod, setRevenuePeriod] = useState("monthly");
    const [workingPeriod, setWorkingPeriod] = useState("daily");

    const provider = useSelector((state: RootState) => state.provider);

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (provider.id) {
                    const response = await providerDashboardApi(
                        provider.id,
                        revenuePeriod,
                        workingPeriod
                    );
                    if (response.data) {
                        setDashboardData(response.data);
                    } else {
                        toast.error("Failed to fetch dashboard data");
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [provider.id, revenuePeriod, workingPeriod]); // Added dependencies for period changes

    return (
        <div className="pt-16 md:pl-72 bg-white min-h-screen flex-1">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 ">
                <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            {/* Tiles for Total Revenue, Bookings, and Ratings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {/* Tile for Total Revenue */}
                                <div className="bg-blue-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        Total Revenue
                                    </h2>
                                    <p className="text-xl sm:text-2xl font-semibold text-blue-600 mt-2">
                                        Rs {dashboardData.totalEarnings.toLocaleString()}
                                    </p>
                                </div>

                                {/* Tile for Total Bookings */}
                                <div className="bg-green-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        Total Bookings
                                    </h2>
                                    <p className="text-xl sm:text-2xl font-semibold text-green-600 mt-2">
                                        {dashboardData.totalCompletedBookings}
                                    </p>
                                </div>

                                {/* Tile for Total Ratings */}
                                <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        Ratings
                                    </h2>
                                    <p className="text-xl sm:text-2xl font-semibold text-yellow-600 mt-2 flex items-center">
                                        {dashboardData.averageRating.toFixed(1)} of 5{" "}
                                        <FiStar className="ml-1" />
                                    </p>
                                </div>
                            </div>

                            {/* Revenue Graph */}
                            <div className="mt-6 sm:mt-8">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                    Monthly Revenue (This Year)
                                </h2>
                                <ResponsiveContainer width="100%" height={300} className="sm:h-400">
                                    <BarChart
                                        data={dashboardData.monthlyRevenueData.map((item) => ({
                                            period: monthNames[item.month - 1],
                                            revenue: item.monthlyRevenue,
                                        }))}
                                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#1E60AA" // Fixify Brand Blue
                                            barSize={30}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Working Hours Graph */}
                            <div className="mt-6 sm:mt-8">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                                    Daily Working Hours (This Week)
                                </h2>
                                <ResponsiveContainer width="100%" height={300} className="sm:h-400">
                                    <LineChart
                                        data={dashboardData.dailyWorkingHoursData.map((item) => ({
                                            period: dayNames[item.day - 1],
                                            hours: item.dailyWorkingHours,
                                        }))}
                                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="period" stroke="#4A5568" />
                                        <YAxis stroke="#4A5568" />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="natural"
                                            dataKey="hours"
                                            stroke="#1E60AA" // Fixify Brand Blue
                                            strokeWidth={3}
                                            dot={{
                                                stroke: "#144279",
                                                strokeWidth: 2,
                                                fill: "#1E60AA",
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
