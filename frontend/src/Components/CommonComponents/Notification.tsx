import React from "react";
import { useState, useEffect } from "react";
import socket from "../../Socket/Socket";

const Notification: React.FC<{ userId: string }> = ({ userId }) => {
    const [notifications, setNotifications] = useState<string[]>([]);

    useEffect(() => {
        // Join user's notification room
        socket.emit("joinNotifications", userId);

        // Listen for new notifications
        socket.on("receiveNotification", (data) => {
            setNotifications((prev) => [...prev, data.message]);
        });

        return () => {
            socket.off("receiveNotification");
        };
    }, [userId]);

    return (
        <div>
            <h2>Notifications</h2>
            <ul>
                {notifications.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

export default Notification;
