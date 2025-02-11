import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCommentDots, FaMapMarkerAlt } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import PaymentModal from "./Modals/PaymentModal";
import { paymentRequestApi } from "../../Api/ProviderApis";
import { toast } from "react-toastify";

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
        url: string;
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
    payment: {
        _id: string;
        amount: number;
        site_fee: number;
        payment_status: string;
        payment_mode: string;
        payment_date: string;
    };
}

interface IBookingDetailProps {
    role: "user" | "provider";
    bookingDetailsApi: (id: string) => Promise<any>;
}

const BookingDetails: React.FC<IBookingDetailProps> = ({ role, bookingDetailsApi }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<IBookingDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        bookingDetailsApi(id)
            .then((response) => {
                if (response.success) {
                    setBooking(response.data[0]);
                } else {
                    console.error("Failed to fetch booking details");
                }
            })
            .catch((error) => console.error("Error fetching booking details:", error))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePaymentSubmit = (paymentData: { amount: number; method: string }) => {
        if (booking)
            paymentRequestApi(booking._id, paymentData.amount, paymentData.method).then(
                (response) => {
                    console.log("response", paymentData);
                    if (response.success) {
                        toast.success(response.message);
                    }
                }
            );
    };

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
                    {role === "user" && (
                        <button className="mt-8 w-full bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition">
                            Cancel Booking
                        </button>
                    )}
                </div>

                {/* Professional/user Details */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-8">
                        {role === "user" ? "Professional Details" : "Customer Details"}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={role === "user" ? booking.provider.url : booking.user.url}
                                alt="Technician"
                                referrerPolicy="no-referrer"
                                className="w-20 h-20 rounded-full shadow-md border border-gray-300"
                            />
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900">
                                    {role === "user" ? booking.provider.name : booking.user.name}
                                </h4>
                                <p className="text-gray-600 text-base">
                                    📧{" "}
                                    {role === "user" ? booking.provider.email : booking.user.email}
                                </p>
                                <p className="text-gray-600 text-base">
                                    📞{" "}
                                    {role === "user"
                                        ? booking.provider.mobile_no
                                        : booking.user.mobile_no}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    `/chat/${
                                        role === "provider"
                                            ? booking.provider._id
                                            : booking.user._id
                                    }`
                                )
                            }
                            className="flex items-center gap-2 bg-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105"
                        >
                            <FaCommentDots className="text-md" /> Chat Now
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

                <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-11">
                    <h3 className="text-xl font-semibold text-gray-700 mb-8">Payment details</h3>

                    {booking.payment && (
                        <div className="grid grid-cols-2 gap-4 mt-3 text-base text-gray-700">
                            <p>
                                <strong>Payment Date : </strong>
                                <strong>Date :</strong>{" "}
                                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                    new Date(booking.payment.payment_date)
                                )}
                                ,
                                {new Intl.DateTimeFormat("en-US", {
                                    timeStyle: "short",
                                }).format(new Date(booking.payment.payment_date))}{" "}
                            </p>
                            <p>
                                <strong>Amount : </strong>
                                {booking.payment.amount}{" "}
                            </p>
                            <p>
                                <strong>Payment Status : </strong>
                                {booking.payment.payment_status} {""}
                            </p>
                            <p>
                                <strong>Payment Mode : </strong>
                                {booking.payment.payment_mode}
                                {""}
                            </p>
                        </div>
                    )}

                    {/*Request payment button Inside Booking Details */}
                    {role === "provider" && !booking.payment && (
                        <button
                            className="mt-8 w-full bg-brandBlue text-white px-4 py-2 rounded-lg shadow hover:bg-brandBlue transition"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Request Payment
                        </button>
                    )}
                </div>
                {/* Payment Modal */}
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onPaymentSubmit={handlePaymentSubmit}
                />
            </div>
        </div>
    );
};

export default BookingDetails;
