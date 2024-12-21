import React from "react";
import UserHeader from "../../Components/UserComponents/UserHeader";
import UserSidebar from "../../Components/UserComponents/UserSidebar";
import UserProfile from "../../Components/UserComponents/UserProfile";

const HomePage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <UserSidebar />

                    <div className="flex-1 ml-72">
                         <UserHeader />

                         <UserProfile />
                    </div>
               </div>
          </>
     );
};

export default HomePage;
