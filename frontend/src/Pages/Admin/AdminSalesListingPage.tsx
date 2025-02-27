import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminSalesListing from "../../Components/AdminComponents/AdminSales";

const AdminSalesListingPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <AdminSidebar />

                <div className="flex-1 ml-72">
                    <AdminHeader />
                    <AdminSalesListing />
                </div>
            </div>
        </>
    );
};

export default AdminSalesListingPage;
