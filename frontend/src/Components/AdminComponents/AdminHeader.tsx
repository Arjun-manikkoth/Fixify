import React from "react";

const AdminHeader: React.FC = () => {
    return (
        <header className="flex items-center justify-between px-12 py-4 bg-white fixed top-0 left-0 right-0 h-16 z-10">
            {/* Logo Section */}
            <div>
                <img src="/FixifyLogo.png" alt="Fixify Logo" className="w-28 h-28 object-contain" />
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-black">Hello, Admin</h1>
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                    alt="admin-profile-image"
                    className="w-9 h-9 rounded-full border border-black object-cover"
                />
            </div>
        </header>
    );
};

export default AdminHeader;
