import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminBookings from "../../Components/AdminComponents/AdminBookingsList";

const AdminBookingsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 ml-72">
                    <AdminHeader />
                    <AdminBookings />
                </div>
            </div>
        </>
    );
};

export default AdminBookingsPage;
