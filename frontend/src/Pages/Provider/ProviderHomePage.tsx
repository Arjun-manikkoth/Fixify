import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderProfile from "../../Components/ProviderComponents/ProviderProfile";

const HomePage: React.FC = () => {
     return (
          <>
               <div className="flex">
                    <ProviderSidebar />

                    <div className="flex-1 ml-72">
                         <ProviderHeader />

                         <ProviderProfile />
                    </div>
               </div>
          </>
     );
};

export default HomePage;
