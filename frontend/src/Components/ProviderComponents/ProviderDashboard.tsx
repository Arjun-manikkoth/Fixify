import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { providerDashboardApi } from "../../Api/ProviderApis";
import { useSelector } from "react-redux";
import { FiStar } from "react-icons/fi"; // Import the star icon
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
    }, [provider.id]);

    return (
        <div className="bg-white p-9 me-12 rounded-2xl shadow-lg">
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {/* Tiles for Total Revenue, Bookings, and Ratings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tile for Total Revenue */}
                        <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800">Total Revenue</h2>
                            <p className="text-2xl font-semibold text-blue-600 mt-2">
                                Rs {dashboardData.totalEarnings.toLocaleString()}
                            </p>
                        </div>

                        {/* Tile for Total Bookings */}
                        <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800">Total Bookings</h2>
                            <p className="text-2xl font-semibold text-green-600 mt-2">
                                {dashboardData.totalCompletedBookings}
                            </p>
                        </div>

                        {/* Tile for Total Ratings */}
                        <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800">Ratings</h2>
                            <p className="text-2xl font-semibold text-yellow-600 mt-2 flex items-center">
                                {dashboardData.averageRating.toFixed(1)} of 5{" "}
                                <FiStar className="ml-1" />
                            </p>
                        </div>
                    </div>

                    {/* Revenue Graph */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Monthly Revenue (This Year)
                        </h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={dashboardData.monthlyRevenueData.map((item) => ({
                                    period: monthNames[item.month - 1],
                                    revenue: item.monthlyRevenue,
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="revenue"
                                    fill="#1E60AA" // Fixify Brand Blue
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Working Hours Graph */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Daily Working Hours (This Week)
                        </h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={dashboardData.dailyWorkingHoursData.map((item) => ({
                                    period: dayNames[item.day - 1], // Convert day number to day name
                                    hours: item.dailyWorkingHours,
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="period" stroke="#4A5568" />
                                <YAxis stroke="#4A5568" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="step"
                                    dataKey="hours"
                                    stroke="#1E60AA" // Fixify Brand Blue for consistency
                                    strokeWidth={3}
                                    dot={{ stroke: "#144279", strokeWidth: 2, fill: "#1E60AA" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProviderDashboard;
