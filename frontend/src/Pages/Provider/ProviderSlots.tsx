import React from "react";
import ProviderSidebar from "../../Components/ProviderComponents/ProviderSideBar";
import ProviderHeader from "../../Components/ProviderComponents/ProviderHeader";
import ProviderSlot from "../../Components/ProviderComponents/ProviderSlot";

const SlotsPage: React.FC = () => {
    return (
        <>
            <div className="flex">
                <ProviderSidebar />

                <div className="flex-1 ml-72">
                    <ProviderHeader />

                    <ProviderSlot />
                </div>
            </div>
        </>
    );
};

export default SlotsPage;
