import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderProfile from "../../Components/ProviderComponents/ProviderProfile";

const HomePage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <ProviderProfile />
        </>
    );
};

export default HomePage;
