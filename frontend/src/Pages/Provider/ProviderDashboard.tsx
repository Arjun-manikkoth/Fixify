import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderDashboard from "../../Components/ProviderComponents/ProviderDashboard";

const DashboardPage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <ProviderDashboard />
        </>
    );
};

export default DashboardPage;
