import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";
import AdminProviderList from "../../Components/AdminComponents/AdminProvidersLIst";

const AdminProvidersPage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <AdminSidebar />

                    <div className="flex-1 ml-72">
                         <AdminHeader />
                         <AdminProviderList />
                    </div>
               </div>
          </>
     );
};

export default AdminProvidersPage;
