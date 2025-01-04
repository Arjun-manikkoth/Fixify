import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminServicesList from "../../Components/AdminComponents/AdminServicesList";

const AdminServicesPage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <AdminSidebar />

                    <div className="flex-1 ml-72">
                         <AdminHeader />
                         <AdminServicesList />
                    </div>
               </div>
          </>
     );
};

export default AdminServicesPage;
