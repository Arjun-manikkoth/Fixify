import React from "react";

const AdminHeader: React.FC = () => {
     return (
          <header className="flex items-center justify-between px-12 py-4 bg-white fixed top-0 left-0 right-0 h-16 z-10">
               {/* Logo Section */}
               <div>
                    <img
                         src="/FixifyLogo.png"
                         alt="Fixify Logo"
                         className="w-28 h-28 object-contain"
                    />
               </div>

               {/* Profile Section */}
               <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold text-black">Hello, Admin</h1>
                    <img
                         src="http://res.cloudinary.com/dxdghkyag/image/upload/v1734799996/ybg4zbhvgrf3fpcqddtz.png"
                         alt="admin-profile-image"
                         className="w-9 h-9 rounded-full border border-black object-cover"
                    />
               </div>
          </header>
     );
};

export default AdminHeader;
