import React from "react";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { RootState } from "../../Redux/Store";
import { FiBell } from "react-icons/fi";
import { NotificationContext } from "../../Contexts/NotificationContext";

const ProviderHeader: React.FC = () => {
    const provider = useSelector((state: RootState) => state.provider);
    const notification = useContext(NotificationContext);

    return (
        <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow-md">
            {/* Logo or App Name (Optional) */}
            <h2 className="text-xl font-bold text-gray-800 hidden md:block">Fixify</h2>

            {/* Right Side - Notifications & Profile */}
            <div className="flex items-center space-x-4">
                {/* Notification Icon */}
                <div className="relative cursor-pointer">
                    <FiBell className="w-6 h-6 text-gray-700" />
                    {/* Notification Badge (Dynamic in future) */}
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {notification?.unreadCount}
                    </span>
                </div>

                {/* User Profile */}
                {provider.url ? (
                    <img
                        src={provider.url}
                        alt="Provider"
                        className="w-9 h-9 rounded-full border border-gray-300"
                    />
                ) : (
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                        alt="Provider"
                        className="w-9 h-9 rounded-full border border-gray-300"
                    />
                )}

                {/* User Name - Hide on Small Screens */}
                <h1 className="text-lg font-semibold text-black hidden sm:block">
                    Hello, {provider.name}
                </h1>
            </div>
        </header>
    );
};

export default ProviderHeader;
