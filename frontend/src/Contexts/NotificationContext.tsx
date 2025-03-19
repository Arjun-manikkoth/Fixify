import { createContext, useState, useEffect } from "react";
import socket from "../Socket/Socket";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/Store";

interface INotificationContext {
    unreadCount: number;
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export const NotificationContext = createContext<null | INotificationContext>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useSelector((state: RootState) => state.user);

    const provider = useSelector((state: RootState) => state.provider);

    const id = user.id ? user.id : provider.id;

    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch initial unread count from backend
    useEffect(() => {
        console.log("notifications context mounted");
        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get(`/api/notifications/unread-count/${id}`);
                // setUnreadCount(response.data.unreadCount);
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        if (id) {
            //fetchUnreadCount();
            socket.emit("joinNotifications", id);

            // Listen for real-time notification updates
            socket.on("updateNotificationCount", (count) => {
                console.log("notification count updaed", count);
                setUnreadCount(count);
            });
        }

        return () => {
            socket.off("updateNotificationCount");
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
