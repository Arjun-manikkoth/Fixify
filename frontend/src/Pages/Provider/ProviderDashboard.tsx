import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderDashboard from "../../Components/ProviderComponents/ProviderDashboard";

const DashboardPage: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <ProviderSidebar />

            {/* Main Content */}
            <div className="flex-1 ml-72">
                {/* Header */}
                <ProviderHeader />

                {/* Dashboard Content */}
                <div className="p-6">
                    <ProviderDashboard />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
