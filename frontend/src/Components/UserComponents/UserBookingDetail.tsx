import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCommentDots, FaMapMarkerAlt } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { fetchBookingDetailsApi } from "../../Api/UserApis";

interface IBookingDetail {
    _id: string;
    time: string;
    date: string;
    status: string;
    description: string;
    service: {
        _id: string;
        name: string;
        description: string;
    };
    provider: {
        _id: string;
        name: string;
        mobile_no: string;
        email: string;
        url: string;
    };
    user: {
        _id: string;
        name: string;
        mobile_no: string;
        email: string;
    };
    user_address: {
        city: string;
        house_name: string;
        landmark: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
    };
}

const BookingDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<IBookingDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchBookingDetailsApi(id)
            .then((response) => {
                if (response.success) {
                    setBooking(response.data[0]); // Assuming API returns an array
                } else {
                    console.error("Failed to fetch booking details");
                }
            })
            .catch((error) => console.error("Error fetching booking details:", error))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!booking) return <p className="text-center text-gray-600">Booking not found.</p>;

    const googleMapsUrl = `https://www.google.com/maps?q=${booking.user_address.latitude},${booking.user_address.longitude}`;

    return (
        <div className="p-6 flex justify-center">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 ">Booking Details</h2>

                {/* Booking Details */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-11">
                    <h3 className="text-xl font-semibold text-gray-700 mb-8">Service details</h3>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-base text-gray-700">
                        <p>
                            <strong>Date:</strong>{" "}
                            {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                new Date(booking.date)
                            )}
                        </p>
                        <p>
                            <strong>Work Time:</strong>{" "}
                            {new Intl.DateTimeFormat("en-US", {
                                timeStyle: "short",
                            }).format(new Date(booking.time))}
                        </p>
                        <p>
                            <strong>Status:</strong> {booking.status}
                        </p>
                        <p>
                            <strong>Service:</strong> {booking.service.name}
                        </p>
                    </div>
                    <div className="mt-8">
                        <strong>Description: </strong>
                        {booking.description}
                    </div>

                    {/* Cancel Button Inside Booking Details */}
                    <button className="mt-8 w-full bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition">
                        Cancel Booking
                    </button>
                </div>

                {/* Professional Details */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Professional Details
                    </h3>

                    {/* Professional Info Section */}
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
                        {/* Left: Profile Image & Details */}
                        <div className="flex items-center gap-4">
                            {/* Profile Image */}
                            <img
                                src={booking.provider?.url}
                                alt="Technician"
                                referrerPolicy="no-referrer"
                                className="w-20 h-20 rounded-full shadow-md border border-gray-300"
                            />
                            {/* Professional Details */}
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900">
                                    {booking.provider.name}
                                </h4>
                                <p className="text-gray-600 text-base">{booking.provider.email}</p>
                                <p className="text-gray-600 text-base">
                                    📞 {booking.provider.mobile_no}
                                </p>
                            </div>
                        </div>

                        {/* Right: Chat Button */}
                        <button
                            onClick={() => navigate(`/chat/${booking.provider._id}`)}
                            className="flex items-center gap-2 bg-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105"
                        >
                            <FaCommentDots className="text-md" />
                            Chat Now
                        </button>
                    </div>
                </div>

                {/* Location Details */}
                <div className="bg-gray-50 p-4 my-8 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700">Location Details</h3>
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-gray-600">
                            {booking.user_address.house_name}, {booking.user_address.landmark},{" "}
                            {booking.user_address.city}, {booking.user_address.state},{" "}
                            {booking.user_address.pincode}
                        </p>

                        {/* Google Maps Button */}
                        <a
                            href={`https://www.google.com/maps?q=${booking.user_address.latitude},${booking.user_address.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition"
                        >
                            <FaMapMarkerAlt className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">View in Map</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailPage;
