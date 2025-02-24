import { useState, useEffect } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import Pagination from "../CommonComponents/Pagination";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { Link } from "react-router-dom";

interface IService {
    _id: string;
    name: string;
}

interface IPerson {
    _id: string;
    name: string;
    url: string;
    email?: string;
    mobile_no?: string;
}

interface IBooking {
    _id: string;
    time: string;
    date: string;
    status: string;
    service: IService;
    user: IPerson;
    provider: IPerson;
    location: string;
}

interface IProps {
    role: "user" | "provider";
    bookingsApi: (id: string, page: number) => Promise<any>;
}

const Bookings: React.FC<IProps> = ({ role, bookingsApi }) => {
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const userId = useSelector((state: RootState) => state.user.id);
    const providerId = useSelector((state: RootState) => state.provider.id);

    const id = role === "user" ? userId : providerId;

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        bookingsApi(id, page)
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
    }, [page, id]);

    const changePage = (type: "Increment" | "Decrement") => {
        setPage((prev) => (type === "Decrement" ? Math.max(1, prev - 1) : prev + 1));
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-12">Bookings</h2>
            {loading ? (
                <LoadingSpinner />
            ) : bookings.length > 0 ? (
                <>
                    {bookings.map((booking) => {
                        const person = role === "user" ? booking.provider : booking.user;

                        return (
                            <div
                                key={booking._id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between border px-6 py-4 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all duration-300 ease-in-out mb-4"
                            >
                                {/* Person Info (User or Provider) */}
                                <div className="flex items-center gap-4 w-full sm:w-1/3 mb-4 sm:mb-0">
                                    {person.url ? (
                                        <img
                                            src={person?.url || "/default-profile.jpg"}
                                            alt={person?.name}
                                            className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                                        />
                                    ) : (
                                        <img
                                            src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8" // Placeholder image URL
                                            alt="Default Profile"
                                            className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-blue-500"
                                        />
                                    )}
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {person?.name}
                                        </h3>
                                        {role === "provider" ? (
                                            <p className="text-sm text-gray-600">
                                                {person?.mobile_no}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                {booking.service.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex flex-col sm:flex-row w-full sm:w-1/3 gap-3 sm:gap-14 justify-between sm:justify-center">
                                    {/* Date and Time for Small Screens */}
                                    <div className="sm:hidden flex items-center text-gray-600 gap-2">
                                        <FaClock className="text-blue-500" />
                                        <span>
                                            {new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            }).format(new Date(booking.date))}
                                        </span>
                                    </div>

                                    {/* Date for Larger Screens */}
                                    <div className="hidden sm:flex items-center text-gray-600 gap-2">
                                        <FaClock className="text-blue-500" />
                                        <span>
                                            {new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "medium",
                                            }).format(new Date(booking.date))}
                                        </span>
                                    </div>

                                    {/* Time for Larger Screens */}
                                    <div className="hidden sm:flex items-center text-gray-600 gap-2">
                                        <FaClock className="text-blue-500" />
                                        <span>
                                            {new Intl.DateTimeFormat("en-US", {
                                                timeStyle: "short",
                                            }).format(new Date(booking.time))}
                                        </span>
                                    </div>
                                </div>

                                {/* Booking Status & Action */}
                                <div className="w-full sm:w-auto lg:w-1/4 text-center sm:text-left ms-4 mt-4 sm:mt-0">
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

                                {/* View Detail Button */}
                                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                                    <Link
                                        to={`/${role}s/bookings/${booking._id}`}
                                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out text-center block sm:inline-block"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                    <Pagination changePage={changePage} page={page} totalPages={totalPages} />
                </>
            ) : (
                <p className="text-center text-gray-600">No bookings found</p>
            )}
        </div>
    );
};

export default Bookings;
