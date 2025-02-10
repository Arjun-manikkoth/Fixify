import { useState, useEffect } from "react";
import { FaClock, FaLocationArrow, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { fetchBookingsApi } from "../../Api/UserApis";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { Link } from "react-router-dom";

interface IUserBooking {
    _id: string;
    time: string;
    date: string;
    status: string;
    service: {
        _id: string;
        name: string;
    };
    provider: {
        _id: string;
        name: string;
        url: string;
    };
    location: string;
}

const UserBookingList: React.FC = () => {
    const [bookings, setBookings] = useState<IUserBooking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [canceling, setCanceling] = useState<string | null>(null);

    const user = useSelector((state: RootState) => state.user);
    const userId = user?.id || "";

    const fetchBookings = () => {
        if (!userId) return;
        setLoading(true);
        fetchBookingsApi(userId)
            .then((response) => {
                if (response.success) {
                    setBookings(response.data);
                } else {
                    console.error("Failed to fetch bookings");
                }
            })
            .catch((error: any) => {
                console.error("Error fetching bookings:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-12 ">My Bookings</h2>

            {loading ? (
                <LoadingSpinner />
            ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between border px-6 py-4 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300 ease-in-out mb-4"
                    >
                        {/* Technician Info */}
                        <div className="flex items-center gap-4 w-full sm:w-1/3 mb-4 sm:mb-0">
                            <img
                                src={booking.provider?.url || "/default-profile.jpg"}
                                alt="Technician"
                                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                            />
                            <div className="flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {booking.provider?.name}
                                </h3>
                                <p className="text-sm text-gray-600">{booking.service?.name}</p>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="flex flex-col sm:flex-row w-full sm:w-1/3 gap-3 sm:gap-14 justify-between sm:justify-center">
                            <div className="flex items-center text-gray-600 gap-2">
                                <FaClock className="text-blue-500" />
                                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                    new Date(booking.date)
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <FaLocationArrow className="text-blue-500" />
                                {new Intl.DateTimeFormat("en-US", {
                                    timeStyle: "short",
                                }).format(new Date(booking.time))}
                            </div>
                        </div>

                        {/* Booking Status & Action */}
                        <div className="w-full sm:w-auto lg:w-1/4 text-center sm:text-left ms-4 mt-4 sm:mt-0">
                            {booking.status === "confirmed" ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <FaCheckCircle />
                                    Confirmed
                                </div>
                            ) : booking.status === "pending" ? (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <FaClock />
                                    Pending
                                </div>
                            ) : booking.status === "completed" ? (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <FaClock />
                                    Pending
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                    <FaTimesCircle />
                                    Cancelled
                                </div>
                            )}
                        </div>

                        {/* View Detail Button */}
                        <div className="w-full sm:w-auto mt-4 sm:mt-0">
                            <Link
                                to={`/users/bookings/${booking._id}`}
                                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out text-center block sm:inline-block"
                            >
                                View
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-600">No bookings found</p>
            )}
        </div>
    );
};

export default UserBookingList;
