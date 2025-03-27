// src/components/ProviderComponents/ProviderSidebar.tsx
import React from "react";
import { FiUser, FiBook, FiGrid, FiLogOut, FiCalendar, FiBell, FiBellOff } from "react-icons/fi";
import { clearProvider } from "../../Redux/ProviderSlice";
import { logoutProvider } from "../../Api/ProviderApis";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../Contexts/SidebarContext";

const ProviderSidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    const handleLogout = async () => {
        const response = await logoutProvider();
        if (response.success) {
            dispatch(clearProvider());
            console.log("Provider logged out");
            navigate("/providers/login"); // Redirect to login after logout
            toggleSidebar(); // Close sidebar on logout
        }
    };

    const handleNavigation = (route: string) => {
        navigate(route);
        toggleSidebar(); // Close sidebar on navigation in mobile view
    };

    return (
        <aside
            className={`w-72 h-screen text-black fixed top-0 left-0 transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 bg-white shadow-md`}
        >
            {/* Navigation */}
            <nav className="mt-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
                <ul>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/dashboard")}
                    >
                        <FiGrid className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Dashboard</span>
                    </li>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/profile")}
                    >
                        <FiUser className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">My Profile</span>
                    </li>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/notifications")}
                    >
                        <FiBellOff className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Notifications</span>
                    </li>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/bookings")}
                    >
                        <FiBook className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Bookings</span>
                    </li>

                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/slots")}
                    >
                        <FiCalendar className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Slots</span>
                    </li>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/slots_requests")}
                    >
                        <FiBell className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Requests</span>
                    </li>
                    <li
                        onClick={handleLogout}
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                    >
                        <FiLogOut className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Logout</span>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default ProviderSidebar;
