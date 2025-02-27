import React from "react";
import { FiUser, FiBook, FiGrid, FiLogOut, FiCalendar, FiBell } from "react-icons/fi";
import { clearProvider } from "../../Redux/ProviderSlice";
import { logoutProvider } from "../../Api/ProviderApis";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const ProviderSidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route location

    const handleLogout = async () => {
        const response = await logoutProvider();

        if (response.success) {
            dispatch(clearProvider());
            console.log("Provider logged out");
        }
    };

    const handleNavigation = (route: string) => {
        navigate(route);
    };

    // Function to check if a menu item is selected
    const isSelected = (route: string) => {
        return location.pathname === route;
    };

    return (
        <aside className="w-72 h-screen fixed top-0 left-0 bg-white shadow-md flex flex-col">
            {/* Logo */}
            <div className="p-6 flex-shrink-0">
                <img src="/FixifyLogo.png" alt="Fixify Logo" className="h-12 mx-auto" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
                <ul>
                    <li
                        className={`ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4 ${
                            isSelected("/providers/dashboard") ? "bg-customBlueHover" : ""
                        }`}
                        onClick={() => handleNavigation("/providers/dashboard")}
                    >
                        <FiGrid className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Dashboard</span>
                    </li>

                    <li
                        className={`ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4 ${
                            isSelected("/providers/profile") ? "bg-customBlueHover" : ""
                        }`}
                        onClick={() => handleNavigation("/providers/profile")}
                    >
                        <FiUser className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">My Profile</span>
                    </li>
                    <li
                        className={`ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4 ${
                            isSelected("/providers/bookings") ? "bg-customBlueHover" : ""
                        }`}
                        onClick={() => handleNavigation("/providers/bookings")}
                    >
                        <FiBook className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Bookings</span>
                    </li>
                    <li
                        className={`ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4 ${
                            isSelected("/providers/slots") ? "bg-customBlueHover" : ""
                        }`}
                        onClick={() => handleNavigation("/providers/slots")}
                    >
                        <FiCalendar className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Slots</span>
                    </li>
                    <li
                        className={`ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4 ${
                            isSelected("/providers/slots_requests") ? "bg-customBlueHover" : ""
                        }`}
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
