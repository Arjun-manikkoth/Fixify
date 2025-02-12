import React from "react";
import { FiUser, FiBook, FiMessageCircle, FiMapPin, FiLogOut, FiCalendar } from "react-icons/fi";
import { clearProvider } from "../../Redux/ProviderSlice";
import { logoutProvider } from "../../Api/ProviderApis";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
const ProviderSidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    return (
        <aside className="w-72 h-screen  text-black fixed top-0 left-0 ">
            <div className="p-6">
                <img src="/FixifyLogo.png" alt="Fixify Logo" className="h-12 mx-auto" />
            </div>
            <nav className="mt-10">
                <ul>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/providers/profile")}
                    >
                        <FiUser className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold"> My Profile</span>
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
