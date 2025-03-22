import { useState, useEffect } from "react";
import { FaClock, FaBell } from "react-icons/fa";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";
import Pagination from "../CommonComponents/Pagination";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { fetchNotifications as fetchUserNotifications } from "../../Api/UserApis";
import { fetchNotifications as fetchProviderNotifications } from "../../Api/ProviderApis";
import { markNotificationAsRead as markNotificationAsReadUser } from "../../Api/UserApis";
import { markNotificationAsRead as markNotificationAsReadProvider } from "../../Api/ProviderApis";

interface Notification {
    _id: string;
    receiver_id: string;
    type: string;
    message: string;
    timestamp: string; // Assuming timestamp is a string in ISO format
    is_read: boolean;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const userId = useSelector((state: RootState) => state.user.id);
    const providerId = useSelector((state: RootState) => state.provider.id);

    const id = userId ? userId : providerId || "";

    useEffect(() => {
        setLoading(true);

        // Determine which API to call based on the role (user or provider)
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
            .finally(() => {
                setLoading(false);
            });
    }, [page, userId, providerId]);

    // Function to mark a notification as read
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const markNotificationApi = userId
                ? markNotificationAsReadUser
                : markNotificationAsReadProvider;

            const response = await markNotificationApi(notificationId);
            if (response.success) {
                // Update the notification's `is_read` status in the state
                setNotifications((prevNotifications) =>
                    prevNotifications.map((notification) =>
                        notification._id === notificationId
                            ? { ...notification, is_read: true }
                            : notification
                    )
                );
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
        <div className="py-6 pe-3 w-full">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 flex items-center gap-2">
                <FaBell className="text-blue-500" /> Notifications
            </h2>
            {loading ? (
                <LoadingSpinner />
            ) : notifications?.length > 0 ? (
                <>
                    {/* Notifications List */}
                    <div className="space-y-4 w-full">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 w-full bg-white border border-gray-200 rounded-lg"
                            >
                                {/* Notification Icon and Type */}
                                <div className="flex items-center gap-8 w-full sm:w-1/2 mb-4 sm:mb-0">
                                    {/* Notification Icon with Ring */}
                                    <div className="relative">
                                        <FaBell className="w-6 h-6 text-gray-600" />
                                        {!notification.is_read && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold text-gray-800 capitalize">
                                            {notification.type}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Timestamp and Status */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-1/2">
                                    {/* Timestamp */}
                                    <div className="flex items-center text-gray-600 gap-2">
                                        <FaClock className="text-blue-500" />
                                        <span>
                                            {new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }).format(new Date(notification.timestamp))}
                                        </span>
                                    </div>

                                    {/* Mark as Read Button */}
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="text-sm text-blue-500 hover:text-blue-700 transition-all duration-200"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8">
                        <Pagination changePage={changePage} page={page} totalPages={totalPages} />
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-600">No notifications found</p>
            )}
        </div>
    );
};

export default Notifications;
