import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminDashboard from "../../Components/AdminComponents/AdminDashboard";

const AdminDashboardPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 ml-72">
                    <AdminHeader />
                    <AdminDashboard />
                </div>
            </div>
        </>
    );
};

export default AdminDashboardPage;
