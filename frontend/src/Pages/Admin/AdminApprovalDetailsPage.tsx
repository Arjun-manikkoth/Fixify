import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminApprovalDetails from "../../Components/AdminComponents/AdminApprovalDetails";

const AdminApprovalDetailsPage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <AdminSidebar />

                    <div className="flex-1 ml-72">
                         <AdminHeader />
                         <AdminApprovalDetails />
                    </div>
               </div>
          </>
     );
};

export default AdminApprovalDetailsPage;
