// src/components/UserComponents/BookingDetails.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCommentDots, FaMapMarkerAlt, FaStar, FaFlag } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import PaymentModal from "./Modals/PaymentModal";
import { getChatsApi as getProviderChats, paymentRequestApi } from "../../Api/ProviderApis";
import { getChatsApi as getUserChats } from "../../Api/UserApis";
import { toast } from "react-toastify";
import PaymentFormModal from "./Modals/PaymentFormModal";
import ChatModal from "./Modals/ChatModal";
import { stripePaymentApi, cancelBookingApi } from "../../Api/UserApis";
import Ratings from "./Modals/Ratings";
import ReportModal from "./Modals/ReportModal";
import { reportProviderApi } from "../../Api/UserApis";
import { reportUserApi } from "../../Api/ProviderApis";

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
    review: {
        _id: string;
        rating: number;
        title: string;
        description: string;
        images: string[];
    };
}

interface IBookingDetailProps {
    role: "user" | "provider";
    bookingDetailsApi: (id: string) => Promise<any>;
}

const BookingDetails: React.FC<IBookingDetailProps> = ({ role, bookingDetailsApi }) => {
    const { id } = useParams();
    const [booking, setBooking] = useState<IBookingDetail | null>(null);
    const [showStripeForm, setStripeForm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);
    const [forceRender, setForceRender] = useState<number>(0);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
    const [reportModal, setReportModal] = useState(false);

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
    }, [id, forceRender, bookingDetailsApi]);

    const handlePaymentSubmit = (paymentData: { amount: number; method: string }) => {
        if (booking) {
            paymentRequestApi(booking._id, paymentData.amount, paymentData.method).then(
                (response) => {
                    if (response.success) {
                        toast.success(response.message);
                        handleReRender();
                    }
                }
            );
        }
    };

    if (loading)
        return (
            <div className="flex justify-center pt-16">
                <LoadingSpinner />
            </div>
        );
    if (!booking) return <p className="text-center text-gray-600 pt-16">Booking not found.</p>;

    const googleMapsUrl = `https://www.google.com/maps?q=${booking.user_address.latitude},${booking.user_address.longitude}`;

    const closeStripeModal = () => setStripeForm(false);
    const closeChatModal = () => setShowChat(false);
    const handlePaymentModal = () => setStripeForm(true);
    const handleReRender = () => setForceRender((prev) => prev + 1);

    const isMoreThanTwoHoursAway = (slotTime: string | Date) => {
        const currentTime = new Date();
        const bookingTime = new Date(slotTime);
        const timeDifference = (bookingTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        return timeDifference > 3;
    };

    const handleCancelBooking = (id: string) => {
        cancelBookingApi(id).then((response) => {
            if (response.success) {
                toast.success(response.message);
                handleReRender();
            } else toast.error(response.message);
        });
    };

    return (
        <div className="pt-16 md:pl-72 min-h-screen flex-1 bg-white">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="w-full max-w-5xl bg-white rounded-lg  p-4 sm:p-6 lg:p-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                        Booking Details
                    </h2>

                    {/* Booking Details */}
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
                            Service Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-700 text-sm sm:text-base">
                            <p>
                                <strong>Date:</strong>{" "}
                                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                    new Date(booking.date)
                                )}
                            </p>
                            <p>
                                <strong>Work Time:</strong>{" "}
                                {new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(
                                    new Date(booking.time)
                                )}
                            </p>
                            <p>
                                <strong>Status:</strong> {booking.status}
                            </p>
                            <p>
                                <strong>Service:</strong> {booking.service.name}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-6">
                            <strong className="text-sm sm:text-base">Description:</strong>{" "}
                            <p className="text-gray-600 text-sm sm:text-base">
                                {booking.description}
                            </p>
                        </div>
                        {role === "user" &&
                            booking.status !== "cancelled" &&
                            booking.payment?.payment_status !== "completed" &&
                            isMoreThanTwoHoursAway(booking.time) && (
                                <button
                                    className="mt-4 sm:mt-6 w-full bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition text-sm sm:text-base"
                                    onClick={() => handleCancelBooking(booking._id)}
                                >
                                    Cancel Booking
                                </button>
                            )}
                    </div>

                    {/* Professional/User Details */}
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6 border border-gray-200">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
                            {role === "user" ? "Professional Details" : "Customer Details"}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <img
                                    src={
                                        role === "provider"
                                            ? booking.provider.url ||
                                              "https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                                            : booking.user.url ||
                                              "https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                                    }
                                    alt={role === "user" ? "Professional" : "Customer"}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-md border border-gray-300"
                                />
                                <div>
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                                        {role === "user"
                                            ? booking.provider.name
                                            : booking.user.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        📧{" "}
                                        {role === "user"
                                            ? booking.provider.email
                                            : booking.user.email}
                                    </p>
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        📞{" "}
                                        {role === "user"
                                            ? booking.provider.mobile_no
                                            : booking.user.mobile_no}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2 sm:gap-3 mt-3 sm:mt-0 relative">
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="right-2 bottom-2 flex items-center justify-center gap-1 bg-blue-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow hover:bg-blue-600 transition text-xs sm:text-sm whitespace-nowrap"
                                >
                                    <FaCommentDots /> Chat Now
                                </button>
                                <button
                                    onClick={() => setReportModal(true)}
                                    className="flex items-center justify-center gap-1 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow hover:bg-red-600 transition text-xs sm:text-sm whitespace-nowrap"
                                >
                                    <FaFlag /> Report
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
                            Location Details
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <p className="text-gray-600 text-sm sm:text-base">
                                {booking.user_address.house_name}, {booking.user_address.landmark},{" "}
                                {booking.user_address.city}, {booking.user_address.state},{" "}
                                {booking.user_address.pincode}
                            </p>
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-white border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow hover:shadow-md transition w-full sm:w-auto text-sm sm:text-base text-gray-700"
                            >
                                <FaMapMarkerAlt className="text-blue-600" />
                                View in Map
                            </a>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
                            Payment Details
                        </h3>
                        {role === "user" && !booking.payment && (
                            <p className="text-gray-600 text-sm sm:text-base">
                                Waiting for technician payment request
                            </p>
                        )}
                        {booking.payment && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-700 text-sm sm:text-base">
                                    <p>
                                        <strong>Payment Date:</strong>{" "}
                                        {new Intl.DateTimeFormat("en-US", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        }).format(new Date(booking.payment.payment_date))}
                                    </p>
                                    <p>
                                        <strong>Amount:</strong> {booking.payment.amount}
                                    </p>
                                    <p>
                                        <strong>Payment Status:</strong>{" "}
                                        {booking.payment.payment_status}
                                    </p>
                                    <p>
                                        <strong>Payment Mode:</strong>{" "}
                                        {booking.payment.payment_mode}
                                    </p>
                                </div>
                                {booking.payment.payment_mode === "online" &&
                                    role === "user" &&
                                    booking.payment.payment_status !== "completed" && (
                                        <button
                                            className="mt-4 sm:mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition text-sm sm:text-base"
                                            onClick={handlePaymentModal}
                                        >
                                            Pay Now
                                        </button>
                                    )}
                            </>
                        )}
                        {role === "provider" && !booking.payment && (
                            <button
                                className="mt-4 sm:mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition text-sm sm:text-base"
                                onClick={() => setRequestModalOpen(true)}
                            >
                                Request Payment
                            </button>
                        )}
                        {role === "user" &&
                            booking.payment?.payment_status === "completed" &&
                            !booking.review && (
                                <button
                                    className="mt-4 sm:mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition text-sm sm:text-base"
                                    onClick={() => setShowReviewForm(true)}
                                >
                                    Add Review
                                </button>
                            )}
                    </div>

                    {/* Review Details */}
                    {booking.review && (
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">
                                Customer Review
                            </h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <span className="text-base sm:text-lg font-medium text-gray-800">
                                    {booking.review.title}
                                </span>
                                <span className="text-lg sm:text-xl font-semibold text-yellow-500 flex items-center gap-1">
                                    {booking.review.rating}
                                    {Array.from({ length: booking.review.rating }).map((_, i) => (
                                        <FaStar key={i} className="text-yellow-500" />
                                    ))}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base">
                                {booking.review.description}
                            </p>
                            {booking.review.images.length > 0 && (
                                <div className="mt-3 sm:mt-4">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                                        Images:
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        {booking.review.images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Review ${index}`}
                                                className="w-full h-20 sm:h-28 object-cover rounded-lg border border-gray-300 shadow-sm"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modals */}
                    {booking?.payment && (
                        <PaymentFormModal
                            isOpen={showStripeForm}
                            onClose={closeStripeModal}
                            amount={booking.payment.amount}
                            payment_id={booking.payment._id}
                            paymentApi={stripePaymentApi}
                            handleRefresh={handleReRender}
                        />
                    )}
                    <PaymentModal
                        isOpen={requestModalOpen}
                        onClose={() => setRequestModalOpen(false)}
                        onPaymentSubmit={handlePaymentSubmit}
                        handleRefresh={handleReRender}
                    />
                    {showChat && (
                        <ChatModal
                            profile_url={role === "user" ? booking.user.url : booking.provider.url}
                            senderId={role === "user" ? booking.user._id : booking.provider._id}
                            receiverId={role === "user" ? booking.provider._id : booking.user._id}
                            name={role === "user" ? booking.provider.name : booking.user.name}
                            getChatsApi={role === "user" ? getUserChats : getProviderChats}
                            isOpen={showChat}
                            onClose={closeChatModal}
                        />
                    )}
                    {reportModal && (
                        <ReportModal
                            isOpen={reportModal}
                            onClose={() => setReportModal(false)}
                            reported_id={
                                role === "provider" ? booking.user._id : booking.provider._id
                            }
                            reporter_id={
                                role === "provider" ? booking.provider._id : booking.user._id
                            }
                            reported_role={role === "provider" ? "user" : "provider"}
                            booking_id={booking._id}
                            reportApi={role === "user" ? reportProviderApi : reportUserApi}
                        />
                    )}
                    {showReviewForm && (
                        <Ratings
                            booking_id={booking._id}
                            provider_id={booking.provider._id}
                            closeModal={setShowReviewForm}
                            handleRefresh={handleReRender}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
