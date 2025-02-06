import React, { useState, useEffect } from "react";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import { bookingRequestListApi, bookingRequestStatusApi } from "../../Api/ProviderApis";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { toast } from "react-toastify";

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

// Address Details
export interface ILocation {
    city: string;
    state: string;
    pincode: string;
    houseName: string;
    landmark: string;
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
        bookingRequestStatusApi(id, status).then((res) => {
            if (res.success) {
                toast.success("Updated successfully");
                setTimeout(() => {
                    setForceRender((prev) => prev + 1);
                }, 2000);
            }
        });
    };

    return (
        <div className="p-6 lg:p-9 bg-gray-50 rounded-xl">
            <h2 className="text-2xl font-semibold mb-8 text-center">Booking Requests</h2>

            {isLoading ? (
                <div className="flex justify-center items-center">
                    <LoadingSpinner />
                </div>
            ) : bookingRequests.length > 0 ? (
                <div className="flex flex-col gap-6">
                    {bookingRequests.map((request) => (
                        <div
                            key={request._id}
                            className="flex justify-between items-center bg-white shadow-md rounded-lg p-6 w-full hover:shadow-lg transition-all"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                    {request.customerName}
                                </h3>{" "}
                                {/* Highlighted customer name */}
                                <p className="text-sm text-gray-500">
                                    Note : {request.description}
                                </p>
                                <div>
                                    <p className="text-sm text-gray-500 ">
                                        Time:{" "}
                                        <span className="font-semibold text-purple-600">
                                            {request.time}
                                        </span>
                                    </p>{" "}
                                    {/* Highlighted time */}
                                    <p className="text-sm text-gray-500 ">
                                        Date:{" "}
                                        <span className="font-bold">
                                            {new Date(request.date).toLocaleDateString()}
                                        </span>
                                    </p>{" "}
                                    {/* Bold date */}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Address:{" "}
                                    <span className="font-medium text-green-600">
                                        {request.location.houseName},{request.location.landmark}{" "}
                                        {request.location.city}, {request.location.state} -{" "}
                                        {request.location.pincode}
                                    </span>
                                </p>{" "}
                                {/* Highlighted location */}
                            </div>
                            <div className="flex gap-3 ml-4">
                                <button
                                    onClick={() => handleUpdateStatus(request._id, "booked")}
                                    className={`px-4 py-2 rounded-lg ${
                                        request.status === "booked" ? "bg-green-500" : "bg-blue-500"
                                    } text-white text-sm font-semibold`}
                                >
                                    {request.status === "booked" ? "Booked" : "Accept"}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(request._id, "cancelled")}
                                    className={`px-4 py-2 rounded-lg ${
                                        request.status === "Declined" ? "bg-red-500" : "bg-gray-500"
                                    } text-white text-sm font-semibold`}
                                >
                                    {request.status === "cancelled" ? "cancelled" : "Decline"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">No booking requests available.</div>
            )}
        </div>
    );
};

export default SlotRequests;
