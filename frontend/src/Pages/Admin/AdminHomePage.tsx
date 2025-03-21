import React from "react";
import AdminSidebar from "../../Components/AdminComponents/AdminSideBar";
import AdminHeader from "../../Components/AdminComponents/AdminHeader";

const AdminHomePage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <AdminSidebar />

                    <div className="flex-1 ml-72">
                         <AdminHeader />
                    </div>
               </div>
          </>
     );
};

export default AdminHomePage;
