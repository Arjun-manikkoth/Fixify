import React from "react";
import {
     FiUser,
     FiBarChart2,
     FiUsers,
     FiTool,
     FiClipboard,
     FiLayers,
     FiCheckCircle,
     FiFileText,
     FiLogOut,
} from "react-icons/fi";
import {clearAdmin} from "../../Redux/AdminSlice";
import {logoutAdmin} from "../../Api/AdminApis";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const AdminSidebar: React.FC = () => {
     const dispatch = useDispatch();
     const navigate = useNavigate();

     const handleLogout = async () => {
          const response = await logoutAdmin();

          if (response.success) {
               dispatch(clearAdmin());
               console.log("Admin logged out");
          }
     };

     const handleNavigation = (route: string) => {
          navigate(route);
     };

     return (
          <aside className="w-72 h-[calc(100vh-64px)] text-black fixed top-16 left-0 overflow-y-auto scrollbar-hide bg-white shadow-lg">
               {/* Sidebar Content */}
               <nav className="mt-10">
                    <ul>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/dashboard")}
                         >
                              <FiUser className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Dashboard</span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/sales-report")}
                         >
                              <FiBarChart2 className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Sales Report</span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/users")}
                         >
                              <FiUsers className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Users</span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/providers")}
                         >
                              <FiTool className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">
                                   Professionals
                              </span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/bookings")}
                         >
                              <FiClipboard className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Bookings</span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/services")}
                         >
                              <FiLayers className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Services</span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/approvals")}
                         >
                              <FiCheckCircle className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Approvals</span>
                         </li>
                         <li
                              className="ps-12 py-5 hover:bg-customBlueHover cursor-pointer flex items-center space-x-4"
                              onClick={() => handleNavigation("/admins/reports")}
                         >
                              <FiFileText className="text-xl text-black" />
                              <span className="text-black text-lg font-semibold">Reports</span>
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

export default AdminSidebar;
