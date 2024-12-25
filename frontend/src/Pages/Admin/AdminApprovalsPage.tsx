import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminApprovals from "../../Components/AdminComponents/AdminApprovals";

const AdminApprovalsPage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <AdminSidebar />

                    <div className="flex-1 ml-72">
                         <AdminHeader />
                         <AdminApprovals />
                    </div>
               </div>
          </>
     );
};

export default AdminApprovalsPage;
