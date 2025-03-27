import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderSlot from "../../Components/ProviderComponents/ProviderSlot";

const SlotsPage: React.FC = () => {
    return (
        <>
            <ProviderSidebar />
            <ProviderHeader />
            <ProviderSlot />
        </>
    );
};

export default SlotsPage;
