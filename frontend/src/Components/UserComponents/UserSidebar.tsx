import React from "react";
import { FiUser, FiBook, FiMapPin, FiLogOut, FiSearch, FiBellOff } from "react-icons/fi";
import { clearUser } from "../../Redux/UserSlice";
import { logoutUser } from "../../Api/UserApis";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserSidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const response = await logoutUser();

        if (response.success) {
            dispatch(clearUser());
        }
    };
    const handleNavigation = (route: string) => {
        navigate(route);
    };
    return (
        <aside className="w-72 h-screen  text-black fixed top-0 left-0">
            <div className="p-6">
                <img src="/FixifyLogo.png" alt="Fixify Logo" className="h-12 mx-auto" />
            </div>
            <nav className="mt-10">
                <ul>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/users/profile")}
                    >
                        <FiUser className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold"> My Profile</span>
                    </li>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/users/bookings")}
                    >
                        <FiBook className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Bookings</span>
                    </li>
                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/users/slots")}
                    >
                        <FiSearch className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Find Service</span>
                    </li>

                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/users/addresses")}
                    >
                        <FiMapPin className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Addresses</span>
                    </li>

                    <li
                        className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                        onClick={() => handleNavigation("/users/notifications")}
                    >
                        <FiBellOff className="text-xl text-black" />
                        <span className="text-black text-lg font-semibold">Notifications</span>
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

export default UserSidebar;
