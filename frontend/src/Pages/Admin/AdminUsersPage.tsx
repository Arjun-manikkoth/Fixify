import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminUserList from "../../Components/AdminComponents/AdminUserList";

const AdminUsersPage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <AdminSidebar />

                    <div className="flex-1 ml-72">
                         <AdminHeader />
                         <AdminUserList />
                    </div>
               </div>
          </>
     );
};

export default AdminUsersPage;
