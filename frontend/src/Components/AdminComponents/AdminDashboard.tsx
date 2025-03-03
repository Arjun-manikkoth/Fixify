import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { adminDashboardTilesApi, adminDashboardRevenueApi } from "../../Api/AdminApis";
import { toast } from "react-toastify";

const AdminDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState({
        totalSiteFee: 0,
        totalCompletedBookings: 0,
        totalUsers: 0,
        totalProviders: 0,
        bookingStatusCounts: {
            completed: 0,
            cancelled: 0,
            confirmed: 0,
        },
        mostBookedServices: [],
    });

    const [revenueData, setRevenueData] = useState([{ period: "", revenue: 0 }]);
    const [loading, setLoading] = useState(true);
    const [revenueFilter, setRevenueFilter] = useState<string>("monthly");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await adminDashboardTilesApi();
                if (response.success) {
                    setDashboardData(response.data);
                } else {
                    toast.error("Failed to fetch dashboard tiles");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await adminDashboardRevenueApi(revenueFilter);
                if (response.success) {
                    setRevenueData(response.data);
                } else {
                    toast.error("Failed to fetch revenue data");
                }
            } catch (error) {
                console.error("Error fetching revenue data:", error);
            }
        };

        fetchRevenueData();
    }, [revenueFilter]);

    if (loading) {
        return <div className="p-6 pt-24 px-12">Loading...</div>;
    }

    const pieChartData = [
        { name: "Completed", value: dashboardData.bookingStatusCounts.completed },
        { name: "Cancelled", value: dashboardData.bookingStatusCounts.cancelled },
        { name: "Confirmed", value: dashboardData.bookingStatusCounts.confirmed },
    ];

    const mostBookedServicesData = dashboardData.mostBookedServices.slice(0, 5);
    const COLORS = ["#1E60AA", "#FF5252", "#FFA500"];

    return (
        <div className="p-6 pt-24 px-12">
            {/* Metrics Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold">Total Earnings</h3>
                    <p className="text-2xl font-bold">Rs.{dashboardData.totalSiteFee}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold">Total Bookings</h3>
                    <p className="text-2xl font-bold">{dashboardData.totalCompletedBookings}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-2xl font-bold">{dashboardData.totalUsers}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold">Total Professionals</h3>
                    <p className="text-2xl font-bold">{dashboardData.totalProviders}</p>
                </div>
            </div>

            {/* Bar Chart for Revenue */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h3 className="text-lg font-semibold text-center mb-8">
                    Revenue ({revenueFilter})
                </h3>
                {/* Filter Buttons */}
                <div className="flex justify-center space-x-4 mb-11">
                    <button
                        className={`px-4 py-2 rounded ${
                            revenueFilter === "monthly"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setRevenueFilter("monthly")}
                    >
                        Monthly
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${
                            revenueFilter === "weekly"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setRevenueFilter("weekly")}
                    >
                        Weekly
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${
                            revenueFilter === "yearly"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setRevenueFilter("yearly")}
                    >
                        Yearly
                    </button>
                </div>
                {revenueData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#1E60AA" barSize={30} />{" "}
                            {/* Fixed bar size */}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center">No revenue data available</p>
                )}
            </div>

            {/* Pie Chart for Booking Status */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col lg:flex-row items-center">
                <h3 className="text-lg font-semibold mb-4 w-full text-center">
                    Booking Status Chart
                </h3>

                <div className="w-full lg:w-2/3 h-80 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={90}
                                outerRadius={140}
                                fill="#8884d8"
                                dataKey="value"
                                labelLine={false}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend on the Right Side */}
                <div className="w-full lg:w-1/3 flex flex-col space-y-4 mt-4 lg:mt-0 lg:ml-6">
                    {pieChartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">
                                {entry.name}: {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bar Chart for Most Booked Services */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h3 className="text-lg font-semibold text-center mb-4">
                    Top 5 Most Booked Services
                </h3>
                {mostBookedServicesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mostBookedServicesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="serviceName" type="category" />{" "}
                            {/* Service names on X-axis */}
                            <YAxis type="number" /> {/* Count values on Y-axis */}
                            <Tooltip />
                            <Bar dataKey="count" fill="#1E60AA" barSize={30} />{" "}
                            {/* Fixed bar size */}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center">No data available</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
