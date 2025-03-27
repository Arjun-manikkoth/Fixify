// src/components/UserComponents/UserHeader.tsx
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";
import { FiBell, FiMenu } from "react-icons/fi";
import { useContext } from "react";
import { NotificationContext } from "../../Contexts/NotificationContext";
import { useSidebar } from "../../Contexts/SidebarContext";

const UserHeader: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const notification = useContext(NotificationContext);
    const { toggleSidebar } = useSidebar();

    return (
        <header className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 md:px-12 py-4 bg-white z-50">
            <div className="flex items-center space-x-4">
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={toggleSidebar}
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Fixify</h2>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative cursor-pointer">
                    <FiBell className="w-6 h-6 text-gray-700" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {notification?.unreadCount || 0}
                    </span>
                </div>

                {user.url ? (
                    <img
                        src={user.url}
                        alt="User"
                        className="w-9 h-9 rounded-full border border-gray-300"
                    />
                ) : (
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                        alt="User"
                        className="w-9 h-9 rounded-full border border-gray-300"
                    />
                )}

                <h1 className="text-lg font-semibold text-black hidden sm:block">
                    Hello, {user.name || "User"}
                </h1>
            </div>
        </header>
    );
};

export default UserHeader;
