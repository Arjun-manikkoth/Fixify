import React from "react";
import Notifications from "../../Components/CommonComponents/Notifications";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";

const ProviderNotificationsPage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <Notifications />
        </>
    );
};

export default ProviderNotificationsPage;
