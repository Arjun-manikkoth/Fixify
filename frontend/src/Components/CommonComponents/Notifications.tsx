// src/components/UserComponents/Notifications.tsx
import React, { useState, useEffect } from "react";
import { FaClock, FaBell } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import Pagination from "../CommonComponents/Pagination";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { fetchNotifications as fetchUserNotifications } from "../../Api/UserApis";
import { fetchNotifications as fetchProviderNotifications } from "../../Api/ProviderApis";
import { markNotificationAsRead as markNotificationAsReadUser } from "../../Api/UserApis";
import { markNotificationAsRead as markNotificationAsReadProvider } from "../../Api/UserApis";
import { useContext } from "react";
import { NotificationContext } from "../../Contexts/NotificationContext";

interface Notification {
    _id: string;
    receiver_id: string;
    type: string;
    message: string;
    timestamp: string; // ISO format
    is_read: boolean;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const userId = useSelector((state: RootState) => state.user.id);
    const providerId = useSelector((state: RootState) => state.provider.id);
    const notification = useContext(NotificationContext);
    const id = userId || providerId || "";

    useEffect(() => {
        setLoading(true);
        const api = userId ? fetchUserNotifications : fetchProviderNotifications;

        api(id, page)
            .then((response) => {
                if (response.success) {
                    setNotifications(response.data.notifications);
                    setTotalPages(response.data.pagination.totalPages);
                } else {
                    console.error("Failed to fetch notifications");
                }
            })
            .catch((error) => {
                console.error("Error fetching notifications:", error);
            })
            .finally(() => setLoading(false));
    }, [page, userId, providerId, id]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const markNotificationApi = userId
                ? markNotificationAsReadUser
                : markNotificationAsReadProvider;

            const response = await markNotificationApi(notificationId);
            if (response.success) {
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notificationId ? { ...n, is_read: true } : n))
                );
                notification?.refreshCount();
            } else {
                console.error("Failed to mark notification as read");
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const changePage = (type: "Increment" | "Decrement") => {
        setPage((prev) => (type === "Decrement" ? Math.max(1, prev - 1) : prev + 1));
    };

    return (
        <div className="pt-16 md:pl-72 min-h-screen flex-1 bg-white">
            <div className="w-[90%] sm:w-full mx-auto px-2 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6 lg:mb-8 flex items-center gap-2">
                    <FaBell className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />{" "}
                    Notifications
                </h2>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="space-y-3 sm:space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className="flex flex-col p-3 sm:p-4 lg:p-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 w-full sm:w-1/2 mb-2 sm:mb-0">
                                        <div className="relative flex-shrink-0">
                                            <FaBell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                                            {!notification.is_read && (
                                                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-red-500 rounded-full border border-white"></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 capitalize">
                                                {notification.type}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start gap-2 w-full sm:w-1/2 sm:flex-row sm:items-center sm:justify-end">
                                        <div className="flex items-center text-gray-600 gap-1 sm:gap-2">
                                            <FaClock className="text-blue-500 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                            <span className="text-xs sm:text-sm break-words">
                                                {new Intl.DateTimeFormat("en-US", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                }).format(new Date(notification.timestamp))}
                                            </span>
                                        </div>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 transition-all duration-200"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 sm:mt-6 lg:mt-8 flex justify-center">
                            <Pagination
                                changePage={changePage}
                                page={page}
                                totalPages={totalPages}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-600 text-sm sm:text-base py-10">
                        No notifications found
                    </p>
                )}
            </div>
        </div>
    );
};

export default Notifications;
