import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminReports from "../../Components/AdminComponents/AdminReports";

const AdminReportsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 ml-72">
                    <AdminHeader />
                    <AdminReports />
                </div>
            </div>
        </>
    );
};

export default AdminReportsPage;
