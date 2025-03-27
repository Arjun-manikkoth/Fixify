// src/components/ProviderComponents/SlotRequests.tsx
import React, { useState, useEffect } from "react";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { bookingRequestListApi, bookingRequestStatusApi } from "../../Api/ProviderApis";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Interfaces for the request and location details
interface IBookingRequest {
    _id: string;
    customerName: string;
    description: string;
    date: string;
    time: string;
    location: ILocation;
    status: string;
}

export interface ILocation {
    city: string;
    state: string;
    pincode: string;
    houseName: string;
    landmark: string;
    latitude: string;
    longitude: string;
}

const SlotRequests: React.FC = () => {
    const [bookingRequests, setBookingRequests] = useState<IBookingRequest[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [forceRender, setForceRender] = useState<number>(0);
    const provider = useSelector((state: RootState) => state.provider);

    useEffect(() => {
        setLoading(true);
        bookingRequestListApi(provider.id).then((res) => {
            if (res.data) {
                setBookingRequests(res.data);
            } else {
                toast.error("Failed to fetch booking requests");
            }
            setLoading(false);
        });
    }, [provider.id, forceRender]);

    const handleUpdateStatus = (id: string, status: string) => {
        setLoading(true);
        bookingRequestStatusApi(id, status).then((res) => {
            if (res.success) {
                toast.success("Updated successfully");
                setTimeout(() => {
                    setLoading(false);
                    setForceRender((prev) => prev + 1);
                }, 2000);
            }
        });
    };

    return (
        <div className="pt-16 md:pl-72 bg-white min-h-screen flex-1">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 ">
                <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8">
                        Booking Requests
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : bookingRequests.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {bookingRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="p-4 sm:p-6">
                                        {/* Customer Name and Status */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                            <h3 className="text-lg sm:text-xl font-semibold text-blue-700">
                                                {request.customerName}
                                            </h3>
                                            <span
                                                className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-semibold ${
                                                    request.status === "booked"
                                                        ? "bg-green-100 text-green-700"
                                                        : request.status === "cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {request.status}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 mb-4">
                                            <span className="font-medium">Note:</span>{" "}
                                            {request.description}
                                        </p>

                                        {/* Date and Time */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Time:</span>{" "}
                                                <span className="font-semibold text-purple-600">
                                                    {new Intl.DateTimeFormat("en-US", {
                                                        timeStyle: "short",
                                                    }).format(new Date(request.time))}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-600 sm:text-right">
                                                <span className="font-medium">Date:</span>{" "}
                                                <span className="font-semibold">
                                                    {new Date(request.date).toLocaleDateString()}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <p className="text-sm text-gray-600 mb-4">
                                            <span className="font-medium">Address:</span>{" "}
                                            <span className="font-medium text-green-700">
                                                {request.location.houseName},{" "}
                                                {request.location.landmark}, {request.location.city}
                                                , {request.location.state} -{" "}
                                                {request.location.pincode}
                                            </span>
                                        </p>

                                        {/* View in Map Button */}
                                        <div className="mb-4 sm:mb-6">
                                            <a
                                                href={`https://www.google.com/maps?q=${request.location.latitude},${request.location.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition text-sm sm:text-base text-gray-700"
                                            >
                                                <FaMapMarkerAlt className="text-blue-600" />
                                                <span className="font-medium">View in Map</span>
                                            </a>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-4">
                                            <button
                                                onClick={() =>
                                                    handleUpdateStatus(request._id, "booked")
                                                }
                                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-semibold text-white transition-colors ${
                                                    request.status === "booked"
                                                        ? "bg-green-500 cursor-not-allowed"
                                                        : "bg-brandBlue hover:bg-blue-600"
                                                }`}
                                                disabled={request.status === "booked"}
                                            >
                                                <FaCheckCircle />
                                                {request.status === "booked" ? "Booked" : "Accept"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleUpdateStatus(request._id, "cancelled")
                                                }
                                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-semibold text-white transition-colors ${
                                                    request.status === "cancelled"
                                                        ? "bg-red-500 cursor-not-allowed"
                                                        : "bg-gray-500 hover:bg-gray-600"
                                                }`}
                                                disabled={request.status === "cancelled"}
                                            >
                                                <FaTimesCircle />
                                                {request.status === "cancelled"
                                                    ? "Cancelled"
                                                    : "Decline"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 py-12">
                            <p className="text-lg sm:text-xl">No booking requests available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SlotRequests;
