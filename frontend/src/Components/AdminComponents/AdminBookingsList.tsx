import { useState, useEffect } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import Pagination from "../CommonComponents/Pagination";
import { Link } from "react-router-dom";
import { fetchBookingsApi } from "../../Api/AdminApis";

interface IService {
    _id: string;
    name: string;
}

interface IPerson {
    _id: string;
    email?: string;
}

interface IPayment {
    _id: string;
    amount: number;
    payment_status: string;
    site_fee: number;
}

interface IBooking {
    _id: string;
    time: string;
    date: string;
    status: string;
    service: IService;
    user: IPerson;
    provider: IPerson;
    payment?: IPayment; // Optional payment field
    booking_fee: number;
}

const AdminBookings: React.FC = () => {
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        setLoading(true);
        fetchBookingsApi(page)
            .then((response) => {
                if (response.success) {
                    setBookings(response.data.bookings);
                    setTotalPages(response.data.pagination.totalPages);
                } else {
                    console.error("Failed to fetch bookings");
                }
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page]);

    const changePage = (type: "Increment" | "Decrement") => {
        setPage((prev) => (type === "Decrement" ? Math.max(1, prev - 1) : prev + 1));
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-12">All Bookings</h2>
            {loading ? (
                <LoadingSpinner />
            ) : bookings.length > 0 ? (
                <>
                    {bookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between border px-6 py-4 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300 ease-in-out mb-4"
                        >
                            {/* Booking ID */}
                            <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                                <p className="text-md font-semibold text-gray-800">
                                    Booking ID: {booking._id}
                                </p>
                            </div>

                            {/* User & Provider Email */}
                            <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
                                <p className="text-sm text-gray-600">
                                    User: {booking.user?.email || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Provider: {booking.provider?.email || "N/A"}
                                </p>
                            </div>

                            {/* Booking Date */}
                            <div className="flex items-center text-gray-600 gap-2">
                                <FaClock className="text-blue-500" />
                                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                    new Date(booking.date)
                                )}
                            </div>

                            {/* Booking Status */}
                            <div className="w-full sm:w-auto lg:w-1/4 text-center sm:text-left mt-4 sm:mt-0">
                                {booking.status === "confirmed" ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <FaCheckCircle />
                                        Confirmed
                                    </div>
                                ) : booking.status === "completed" ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <FaCheckCircle />
                                        Completed
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <FaTimesCircle />
                                        Cancelled
                                    </div>
                                )}
                            </div>

                            {/* Payment Status & Fees */}
                            <div className="w-full sm:w-auto lg:w-1/4 text-center sm:text-left mt-4 sm:mt-0">
                                {booking.payment ? (
                                    <>
                                        <div className="text-gray-700">
                                            Payment: {booking.payment.payment_status}
                                        </div>
                                        <div className="text-gray-600">
                                            Amount: Rs.{booking.payment.amount}
                                        </div>
                                        <div className="text-gray-600">
                                            Site Fee: Rs.{booking?.payment?.site_fee}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-red-600">Not Paid</div>
                                )}
                            </div>

                            {/* View Detail Button */}
                            {/* <div className="w-full sm:w-auto mt-4 sm:mt-0">
                                <Link
                                    to={`/admin/bookings/${booking._id}`}
                                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out text-center block sm:inline-block"
                                >
                                    View
                                </Link>
                            </div> */}
                        </div>
                    ))}

                    <Pagination changePage={changePage} page={page} totalPages={totalPages} />
                </>
            ) : (
                <p className="text-center text-gray-600">No bookings found</p>
            )}
        </div>
    );
};

export default AdminBookings;
